import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Cargar .env desde la raíz del backend
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Faltan credenciales en .env (SUPABASE_URL o SUPABASE_KEY)");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanData() {
  console.log("⚠️  INICIANDO LIMPIEZA DE DATOS...");
  console.log("    (Esto borrará usuarios e historial de intentos)");

  // 1. Borrar Intentos (attempts)
  // Usamos neq('id', 0) asumiendo que el ID es numérico o algo distinto a 0.
  // Si es UUID, neq('id', '00000000-0000-0000-0000-000000000000') suele funcionar,
  // o simplemente un valor imposible.

  // Nota: Supabase requiere un WHERE para delete.
  const { error: errAttempts } = await supabase
    .from("attempts")
    .delete()
    .neq("course_id", "impossible_placeholder"); // Borrar todo lo que NO sea este valor (o sea, todo)

  if (errAttempts) {
    console.error("❌ Error borrando attempts:", errAttempts.message);
  } else {
    console.log(`✅ Tabla 'attempts' limpiada.`);
  }

  // 2. Borrar Usuarios (users)
  const { error: errUsers } = await supabase
    .from("users")
    .delete()
    .neq("id", "impossible_placeholder"); // Borrar todo

  if (errUsers) {
    console.error("❌ Error borrando users:", errUsers.message);
  } else {
    console.log(`✅ Tabla 'users' limpiada.`);
  }

  console.log("🏁 Proceso finalizado. El sistema está limpio para el cliente.");
}

cleanData();
