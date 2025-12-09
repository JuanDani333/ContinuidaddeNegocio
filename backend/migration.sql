-- =================================================================
-- MIGRATION SCRIPT: Add Many-to-Many support & Update Views
-- =================================================================

-- 1. DROP EXISTING VIEWS (They depend on the old One-to-Many structure)
DROP VIEW IF EXISTS user_spider_data;
DROP VIEW IF EXISTS course_users;
DROP VIEW IF EXISTS course_spider_data;

-- 2. CREATE JUNCTION TABLE (If not exists)
CREATE TABLE IF NOT EXISTS course_skills (
    course_id VARCHAR(50) REFERENCES courses(id) ON DELETE CASCADE,
    skill_id VARCHAR(50) REFERENCES skills(id) ON DELETE CASCADE,
    display_order INTEGER,
    PRIMARY KEY (course_id, skill_id)
);

-- 3. CLEAR OLD DATA (To avoid conflicts and ensure clean state)
-- We delete in specific order to avoid Foreign Key constraint errors
DELETE FROM attempts;      -- Delete attempts first (references users, courses, skills)
DELETE FROM course_skills; -- Delete junction records
DELETE FROM skills;        -- Delete skills (references courses)
DELETE FROM courses;       -- Delete courses

-- 4. INSERT NEW COURSES (Teams)
INSERT INTO courses (id, name, description, display_order) VALUES
('team-ecc', 'Equipo de Comunicación en Contingencia (ECC)', 'Gestión de la comunicación interna, externa y manejo de medios durante incidentes.', 1),
('team-eac', 'Equipo de Administración de la Contingencia (EAC)', 'Coordinación estratégica, toma de decisiones y asignación de recursos en crisis.', 2),
('team-tisi', 'Equipo de Respuesta a Emergencias de TI y SI', 'Recuperación de servicios tecnológicos y protección de la seguridad de la información.', 3),
('team-ere', 'Equipo de Respuesta a Emergencias (ERE)', 'Ejecución de acciones operativas y liderazgo de equipos en terreno.', 4),
('team-ecn', 'Equipo de Continuidad del Negocio (ECN)', 'Aseguramiento y recuperación de los procesos críticos de negocio post-incidente.', 5);

-- 5. INSERT NEW SKILLS (Scenes)
-- Note: We do NOT set course_id here anymore, as we use course_skills table.
INSERT INTO skills (id, name, full_name) VALUES
('shared_dir_personas', 'Dir. Equipos', 'Dirección de personas y gestión de equipos'),
('shared_liderazgo', 'Liderazgo', 'Liderazgo y toma de decisiones en emergencia'),
('eac_1_combined', 'Liderazgo y Gestión', 'Dirección de personas y gestión de equipos; y Liderazgo y toma de decisiones en emergencia'),
('eac_3', 'Intel. Emocional', 'Inteligencia emocional bajo presión'),
('eac_5', 'Resol. Problemas', 'Resolución de problemas complejos'),
('eac_4', 'Resultados', 'Orientación al logro y Enfoque en resultados'),
('eac_6', 'Normativa SGCN', 'Conocimiento de la norma ISO 22301; y Conocimiento del Sistema de Gestión de Continuidad del Negocio (SGCN)'),
('ecc_1', 'Vocería', 'Habilidades de vocería y manejo de entrevistas'),
('ecc_2', 'Redacción Crisis', 'Redacción estratégica de comunicados de prensa'),
('ecc_3', 'Monitoreo', 'Monitoreo de medios y análisis de opinión pública'),
('ecc_4', 'Com. Interna', 'Gestión de la comunicación interna y clima organizacional'),
('ecc_5', 'Stakeholders', 'Relacionamiento con partes interesadas críticas'),
('ecn_1', 'Análisis BIA', 'Interpretación del Análisis de Impacto al Negocio (BIA)'),
('ecn_2', 'Proc. Críticos', 'Priorización y recuperación de procesos críticos'),
('ecn_3', 'Cadena Sum.', 'Gestión de proveedores alternos y cadena de suministro'),
('ecn_4', 'Estrategias', 'Definición de estrategias de recuperación operativa'),
('ecn_5', 'Retorno', 'Planificación del retorno a la normalidad (Vuelta a casa)');

-- 6. LINK COURSES AND SKILLS (Populate course_skills)

-- ECC Scenes
INSERT INTO course_skills (course_id, skill_id, display_order) VALUES
('team-ecc', 'ecc_1', 1),
('team-ecc', 'ecc_2', 2),
('team-ecc', 'ecc_3', 3),
('team-ecc', 'ecc_4', 4),
('team-ecc', 'ecc_5', 5);

-- EAC Scenes
INSERT INTO course_skills (course_id, skill_id, display_order) VALUES
('team-eac', 'eac_1_combined', 1),
('team-eac', 'eac_3', 2),
('team-eac', 'eac_5', 3),
('team-eac', 'eac_4', 4),
('team-eac', 'eac_6', 5);

-- TISI Scenes
INSERT INTO course_skills (course_id, skill_id, display_order) VALUES
('team-tisi', 'shared_dir_personas', 1),
('team-tisi', 'shared_liderazgo', 2),
('team-tisi', 'eac_3', 3),
('team-tisi', 'eac_5', 4),
('team-tisi', 'eac_4', 5),
('team-tisi', 'eac_6', 6);

-- ERE Scenes
INSERT INTO course_skills (course_id, skill_id, display_order) VALUES
('team-ere', 'eac_5', 1),
('team-ere', 'shared_dir_personas', 2),
('team-ere', 'shared_liderazgo', 3),
('team-ere', 'eac_3', 4),
('team-ere', 'eac_4', 5),
('team-ere', 'eac_6', 6);

-- ECN Scenes
INSERT INTO course_skills (course_id, skill_id, display_order) VALUES
('team-ecn', 'eac_1_combined', 1),
('team-ecn', 'eac_3', 2),
('team-ecn', 'eac_5', 3),
('team-ecn', 'eac_4', 4),
('team-ecn', 'eac_6', 5);


-- 7. RECREATE VIEWS (Updated for Many-to-Many)

-- Vista 1: Datos para gráfico del curso
-- Updated to join via course_skills
CREATE VIEW course_spider_data AS
SELECT 
    c.id as course_id,
    c.name as course_name,
    s.id as skill_id,
    s.name as skill_name,
    s.full_name as skill_full_name,
    cs.display_order,
    COUNT(DISTINCT a.user_id) as total_users,
    COUNT(a.id) as total_attempts,
    COALESCE(ROUND(AVG(a.calculated_score), 2), 0) as avg_score
FROM courses c
JOIN course_skills cs ON c.id = cs.course_id
JOIN skills s ON cs.skill_id = s.id
LEFT JOIN attempts a ON s.id = a.skill_id AND c.id = a.course_id -- Match attempt to specific course context
GROUP BY c.id, c.name, s.id, s.name, s.full_name, cs.display_order
ORDER BY c.id, cs.display_order;

-- Vista 2: Lista de usuarios por curso
-- This remains largely the same as it relies on attempts.course_id
CREATE VIEW course_users AS
SELECT 
    c.id as course_id,
    u.id as user_id,
    u.name as user_name,
    COUNT(a.id) as total_attempts,
    ROUND(AVG(a.calculated_score), 2) as avg_score
FROM courses c
JOIN attempts a ON c.id = a.course_id
JOIN users u ON a.user_id = u.id
GROUP BY c.id, u.id, u.name
ORDER BY u.name;

-- Vista 3: Datos para gráfico de usuario
-- Updated to join via course_skills
CREATE VIEW user_spider_data AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    c.id as course_id,
    s.id as skill_id,
    s.name as skill_name,
    COUNT(a.id) as attempts_count,
    MIN(a.raw_attempt) as best_attempt,
    MAX(a.raw_attempt) as last_attempt,
    ROUND(AVG(a.calculated_score), 2) as avg_score
FROM users u
CROSS JOIN courses c
JOIN course_skills cs ON c.id = cs.course_id
JOIN skills s ON cs.skill_id = s.id
LEFT JOIN attempts a ON u.id = a.user_id AND s.id = a.skill_id AND c.id = a.course_id
GROUP BY u.id, u.name, c.id, s.id, s.name
ORDER BY u.name, c.id;

-- =================================================================
-- 8. TIME METRICS UPDATE
-- =================================================================

-- Agregar campos de tiempo a la tabla attempts
ALTER TABLE attempts 
ADD COLUMN IF NOT EXISTS unit_time_seconds INT, -- Tiempo por pregunta (segundos)
ADD COLUMN IF NOT EXISTS total_time_seconds INT, -- Tiempo total del curso (segundos)
ADD COLUMN IF NOT EXISTS question_id VARCHAR(100); -- Identificador de pregunta (opcional)

-- Vista para análisis de tiempos por usuario y curso
CREATE OR REPLACE VIEW time_analysis AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    c.id as course_id,
    c.name as course_name,
    COUNT(a.id) as total_questions,
    SUM(a.unit_time_seconds) as total_unit_time,
    AVG(a.unit_time_seconds) as avg_time_per_question,
    MAX(a.total_time_seconds) as course_total_time, -- Último tiempo total
    ROUND(AVG(a.calculated_score), 2) as avg_score
FROM users u
JOIN attempts a ON u.id = a.user_id
JOIN courses c ON a.course_id = c.id
WHERE a.unit_time_seconds IS NOT NULL
GROUP BY u.id, u.name, c.id, c.name;

-- Vista para tiempos por skill
CREATE OR REPLACE VIEW skill_time_analysis AS
SELECT 
    s.id as skill_id,
    s.full_name as skill_name,
    c.id as course_id,
    COUNT(a.id) as total_attempts,
    AVG(a.unit_time_seconds) as avg_time_seconds,
    ROUND(AVG(a.calculated_score), 2) as avg_score,
    CORR(a.unit_time_seconds::numeric, a.calculated_score) as time_score_correlation
FROM skills s
JOIN course_skills cs ON s.id = cs.skill_id
JOIN courses c ON cs.course_id = c.id
LEFT JOIN attempts a ON s.id = a.skill_id AND c.id = a.course_id
WHERE a.unit_time_seconds IS NOT NULL
GROUP BY s.id, s.full_name, c.id;
