import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import { exportReport } from './controllers/reportController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5176;

// Configuración CORS para Storyline local
app.use(cors({
  origin: '*', // Para pruebas, luego restringe
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-debug']
}));

app.use(express.json());

// Manejar preflight OPTIONS
app.options('*', cors());

// Conexión a Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.get('/api/reports/export', exportReport);

// ======================
// ENDPOINT PARA STORYLINE
// ======================
app.post('/api/track', async (req, res) => {
  try {
    const data = req.body;
    console.log('📥 Datos recibidos:', data);
    
    // 1. Guardar/Actualizar Usuario
    if (data.userId) {
      await supabase
        .from('users')
        .upsert({
          id: data.userId,
          name: data.userName || 'Unknown',
          email: data.userEmail,
          last_seen: new Date().toISOString()
        }, { onConflict: 'id' });
    }

    // 2. Guardar Intentos (Mapeando a nuestra estructura de tablas)
    if (data.attempts && Array.isArray(data.attempts)) {
      const attemptsToInsert = data.attempts.map((attempt: any) => ({
        user_id: data.userId,
        skill_id: attempt.skillId,
        course_id: data.courseId,
        raw_attempt: Number(attempt.attempt),
        unit_time_seconds: attempt.unitTime ? parseInt(String(attempt.unitTime).replace('s', '')) : 0,
        total_time_seconds: data.totalTime ? parseInt(String(data.totalTime).replace('s', '')) : 0,
        question_id: attempt.questionId || null,
        session_id: `session_${Date.now()}`,
        timestamp: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('attempts')
        .insert(attemptsToInsert);
        
      if (error) throw error;
    }
    
    res.json({ success: true, message: 'Datos guardados correctamente' });

  } catch (error) {
    const err = error as Error;
    console.error('❌ Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Exportar app para Vercel
export default app;

// Solo escuchar si no estamos en Vercel (localmente)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Servidor en http://localhost:${PORT}`);
    console.log(`📡 Endpoint para Storyline: POST http://localhost:${PORT}/api/track`);
  });
}