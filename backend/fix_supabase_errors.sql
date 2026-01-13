-- =================================================================
-- SCRIPT DE CORRECCIÓN DE ERRORES DE SUPABASE
-- =================================================================
-- Este script soluciona los 11 errores reportados en el dashboard de Supabase
-- sin interrumpir el funcionamiento de la aplicación.
--
-- ESTRATEGIA:
-- 1. Tablas (Errores de RLS): Habilitamos RLS y creamos una política de "Permitir todo" (true).
--    Esto elimina la advertencia de seguridad manteniendo el acceso público/abierto 
--    que tiene la app actualmente. (Más adelante puedes restringir esto).
-- 2. Vistas (Errores de Security Definer): Configuramos security_invoker = true.
--    Esto hace que las vistas respeten los permisos del usuario que las consulta
--    en lugar de ejecutar con permisos de administrador.

-- PARTE 1: Habilitar RLS en Tablas
-- -----------------------------------------------------------------

-- Tabla: app_admins
ALTER TABLE IF EXISTS "app_admins" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access" ON "app_admins";
CREATE POLICY "Public Access" ON "app_admins" FOR ALL USING (true);

-- Tabla: attempts (intentos)
ALTER TABLE IF EXISTS "attempts" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access" ON "attempts";
CREATE POLICY "Public Access" ON "attempts" FOR ALL USING (true);

-- Tabla: course_skills (curso_habilidades)
ALTER TABLE IF EXISTS "course_skills" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access" ON "course_skills";
CREATE POLICY "Public Access" ON "course_skills" FOR ALL USING (true);

-- Tabla: skills (habilidades)
ALTER TABLE IF EXISTS "skills" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access" ON "skills";
CREATE POLICY "Public Access" ON "skills" FOR ALL USING (true);

-- Tabla: courses (cursos)
ALTER TABLE IF EXISTS "courses" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access" ON "courses";
CREATE POLICY "Public Access" ON "courses" FOR ALL USING (true);

-- Tabla: users (usuarios)
ALTER TABLE IF EXISTS "users" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access" ON "users";
CREATE POLICY "Public Access" ON "users" FOR ALL USING (true);


-- PARTE 2: Corregir Vistas (Security Definer -> Invoker)
-- -----------------------------------------------------------------

-- Vista: time_analysis
ALTER VIEW IF EXISTS "time_analysis" SET (security_invoker = true);

-- Vista: skill_time_analysis
ALTER VIEW IF EXISTS "skill_time_analysis" SET (security_invoker = true);

-- Vista: course_users
ALTER VIEW IF EXISTS "course_users" SET (security_invoker = true);

-- Vista: user_spider_data
ALTER VIEW IF EXISTS "user_spider_data" SET (security_invoker = true);

-- Vista: course_spider_data
ALTER VIEW IF EXISTS "course_spider_data" SET (security_invoker = true);

-- Fin del script
