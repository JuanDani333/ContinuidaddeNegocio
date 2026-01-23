import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import authRoutes from "./routes/authRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import { exportReport } from "./controllers/reportController";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5176;

// Configuración CORS para Storyline local
app.use(
  cors({
    origin: "*", // Para pruebas, luego restringe
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-debug"],
  }),
);

app.use(express.json());

// Manejar preflight OPTIONS
app.options("*", cors());

// Conexión a Supabase
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.get("/api/reports/export", exportReport);

// ======================
// ENDPOINT PARA STORYLINE
// ======================
app.post("/api/track", async (req, res) => {
  try {
    const data = req.body;
    console.log("📥 Datos recibidos:", data);

    // 1. Guardar/Actualizar Usuario
    if (data.userId) {
      await supabase.from("users").upsert(
        {
          id: data.userId,
          name: data.userName || "Unknown",
          email: data.userEmail,
          last_seen: new Date().toISOString(),
        },
        { onConflict: "id" },
      );
    }

    // 2. Guardar Intentos y "Curar" Tiempos (Smart Time Healing)
    if (data.attempts && Array.isArray(data.attempts)) {
      const sessionId = `session_${Date.now()}`;

      // PASO A: Obtener el último tiempo total registrado para calcular la diferencia
      // Esto nos permite "recuperar" el tiempo unitario si Storyline envía 0
      let lastTotalTime = 0;

      // Consultamos el máximo total_time_seconds actual para este usuario y curso
      const { data: lastAttemptData } = await supabase
        .from("attempts")
        .select("total_time_seconds")
        .eq("user_id", data.userId)
        .eq("course_id", data.courseId)
        .order("total_time_seconds", { ascending: false })
        .limit(1)
        .single();

      if (lastAttemptData) {
        lastTotalTime = lastAttemptData.total_time_seconds || 0;
      }

      const attemptsToInsert = data.attempts.map((attempt: any) => {
        // Parsear tiempos asegurando enteros
        let unitTime = attempt.unitTime
          ? parseInt(String(attempt.unitTime).replace("s", ""))
          : 0;

        const totalTime = data.totalTime
          ? parseInt(String(data.totalTime).replace("s", ""))
          : 0;

        // LÓGICA DE CURACIÓN:
        // Si unitTime es 0 pero el total ha avanzado, deducimos el unitTime
        if (unitTime === 0 && totalTime > lastTotalTime) {
          const calculatedDiff = totalTime - lastTotalTime;
          // Sanity check: Si la diferencia es razonable (ej. menos de 10 min) asumimos es correcta
          if (calculatedDiff > 0 && calculatedDiff < 600) {
            console.log(
              `🩹 Curando tiempo para ${attempt.skillId}: 0s -> ${calculatedDiff}s`,
            );
            unitTime = calculatedDiff;
          }
        }

        // FALLBACK DE EMERGENCIA: Si AMBOS son 0, asignar tiempo estimado
        // Esto previene pérdida total de datos cuando Storyline no envía tiempos
        if (unitTime === 0 && totalTime === 0) {
          const DEFAULT_TIME = 30; // 30 segundos por pregunta (estimado conservador)
          console.log(
            `⚠️ FALLBACK: Asignando ${DEFAULT_TIME}s por defecto para ${attempt.skillId} (ambos tiempos en 0)`,
          );
          unitTime = DEFAULT_TIME;
          // Nota: Dejamos totalTime en 0 porque no podemos inventar un acumulado
        }

        // Actualizamos lastTotalTime para el siguiente item del loop (si es un batch)
        if (totalTime > lastTotalTime) {
          lastTotalTime = totalTime;
        }

        return {
          user_id: data.userId,
          skill_id: attempt.skillId,
          course_id: data.courseId,
          raw_attempt: Number(attempt.attempt),
          unit_time_seconds: unitTime,
          total_time_seconds: totalTime,
          question_id: attempt.questionId || null,
          session_id: sessionId,
          calculated_score: attempt.score || 0,
          timestamp: new Date().toISOString(),
        };
      });

      const { error } = await supabase
        .from("attempts")
        .insert(attemptsToInsert);

      if (error) throw error;
    }

    res.json({ success: true, message: "Datos guardados correctamente" });
  } catch (error) {
    const err = error as Error;
    console.error("❌ Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Exportar app para Vercel
export default app;

// Solo escuchar si no estamos en Vercel (localmente)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`✅ Servidor en http://localhost:${PORT}`);
    console.log(
      `📡 Endpoint para Storyline: POST http://localhost:${PORT}/api/track`,
    );
  });
}
