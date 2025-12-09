-- =================================================================
-- TEST DATA GENERATION SCRIPT V2 (CORRECTED SCHEMA)
-- Purpose: Verify Excel Reports with CORRECT Course/Skill IDs
-- Users: 3 distinct users (Juan, Maria, Carlos)
-- Logic: Scores are calculated by DB trigger based on 'raw_attempt'
--        Attempt 1 = 100/100
--        Attempt 2 = 80/100
--        Attempt 3 = 60/100
--        Attempt 4+ = 40/100
-- =================================================================

-- 0. Ensure Courses, Skills and Relations Exist
INSERT INTO courses (id, name, description, display_order) VALUES
('team-ecc', 'Equipo de Comunicación en Contingencia (ECC)', 'Gestión de la comunicación.', 1),
('team-eac', 'Equipo de Administración de la Contingencia (EAC)', 'Coordinación estratégica.', 2),
('team-tisi', 'Equipo de Respuesta a Emergencias de TI y SI', 'Recuperación de servicios TI.', 3),
('team-ere', 'Equipo de Respuesta a Emergencias (ERE)', 'Ejecución de acciones operativas.', 4),
('team-ecn', 'Equipo de Continuidad del Negocio (ECN)', 'Recuperación de procesos críticos.', 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO skills (id, name, full_name) VALUES
('ecc_1', 'Vocería', 'Habilidades de vocería y manejo de entrevistas'),
('ecc_2', 'Redacción Crisis', 'Redacción estratégica de comunicados de prensa'),
('ecc_3', 'Monitoreo', 'Monitoreo de medios y análisis de opinión pública'),
('ecc_4', 'Com. Interna', 'Gestión de la comunicación interna y clima organizacional'),
('ecc_5', 'Stakeholders', 'Relacionamiento con partes interesadas críticas'),
('eac_1_combined', 'Liderazgo y Gestión', 'Dirección de personas y gestión de equipos; y Liderazgo y toma de decisiones en emergencia'),
('eac_3', 'Intel. Emocional', 'Inteligencia emocional bajo presión'),
('eac_5', 'Resol. Problemas', 'Resolución de problemas complejos'),
('eac_4', 'Resultados', 'Orientación al logro y Enfoque en resultados'),
('eac_6', 'Normativa SGCN', 'Conocimiento de la norma ISO 22301; y Conocimiento del Sistema de Gestión de Continuidad del Negocio (SGCN)'),
('shared_dir_personas', 'Dir. Equipos', 'Dirección de personas y gestión de equipos'),
('shared_liderazgo', 'Liderazgo', 'Liderazgo y toma de decisiones en emergencia')
ON CONFLICT (id) DO NOTHING;

INSERT INTO course_skills (course_id, skill_id, display_order) VALUES
('team-ecc', 'ecc_1', 1), ('team-ecc', 'ecc_2', 2), ('team-ecc', 'ecc_3', 3), ('team-ecc', 'ecc_4', 4), ('team-ecc', 'ecc_5', 5),
('team-eac', 'eac_1_combined', 1), ('team-eac', 'eac_3', 2), ('team-eac', 'eac_5', 3), ('team-eac', 'eac_4', 4), ('team-eac', 'eac_6', 5),
('team-tisi', 'shared_dir_personas', 1), ('team-tisi', 'shared_liderazgo', 2), ('team-tisi', 'eac_3', 3), ('team-tisi', 'eac_5', 4), ('team-tisi', 'eac_4', 5), ('team-tisi', 'eac_6', 6),
('team-ere', 'eac_5', 1), ('team-ere', 'shared_dir_personas', 2), ('team-ere', 'shared_liderazgo', 3), ('team-ere', 'eac_3', 4), ('team-ere', 'eac_4', 5), ('team-ere', 'eac_6', 6),
('team-ecn', 'eac_1_combined', 1), ('team-ecn', 'eac_3', 2), ('team-ecn', 'eac_5', 3), ('team-ecn', 'eac_4', 4), ('team-ecn', 'eac_6', 5)
ON CONFLICT (course_id, skill_id) DO NOTHING;

-- 1. Insert Users
INSERT INTO users (id, name, email, last_seen) VALUES
('juan.perez@test.com', 'Juan Pérez', 'juan.perez@test.com', NOW()),
('maria.gomez@test.com', 'María Gómez', 'maria.gomez@test.com', NOW()),
('carlos.lopez@test.com', 'Carlos López', 'carlos.lopez@test.com', NOW())
ON CONFLICT (id) DO NOTHING;

-- =================================================================
-- 2. TEAM ECC (Equipo de Comunicación en Contingencia)
-- Skills: ecc_1, ecc_2, ecc_3, ecc_4, ecc_5
-- =================================================================

-- Juan (Attempt 1 -> Score 100)
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, unit_time_seconds, total_time_seconds, session_id, timestamp, question_id) VALUES
('juan.perez@test.com', 'team-ecc', 'ecc_1', 1, 10, 50, 's_jp_ecc', NOW(), 'q1'),
('juan.perez@test.com', 'team-ecc', 'ecc_2', 1, 10, 50, 's_jp_ecc', NOW(), 'q2'),
('juan.perez@test.com', 'team-ecc', 'ecc_3', 1, 10, 50, 's_jp_ecc', NOW(), 'q3'),
('juan.perez@test.com', 'team-ecc', 'ecc_4', 1, 10, 50, 's_jp_ecc', NOW(), 'q4'),
('juan.perez@test.com', 'team-ecc', 'ecc_5', 1, 10, 50, 's_jp_ecc', NOW(), 'q5');

-- Maria (Attempt 2 -> Score 80)
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, unit_time_seconds, total_time_seconds, session_id, timestamp, question_id) VALUES
('maria.gomez@test.com', 'team-ecc', 'ecc_1', 2, 20, 100, 's_mg_ecc', NOW(), 'q1'),
('maria.gomez@test.com', 'team-ecc', 'ecc_2', 2, 20, 100, 's_mg_ecc', NOW(), 'q2'),
('maria.gomez@test.com', 'team-ecc', 'ecc_3', 2, 20, 100, 's_mg_ecc', NOW(), 'q3'),
('maria.gomez@test.com', 'team-ecc', 'ecc_4', 2, 20, 100, 's_mg_ecc', NOW(), 'q4'),
('maria.gomez@test.com', 'team-ecc', 'ecc_5', 2, 20, 100, 's_mg_ecc', NOW(), 'q5');

-- Carlos (Attempt 4 -> Score 40)
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, unit_time_seconds, total_time_seconds, session_id, timestamp, question_id) VALUES
('carlos.lopez@test.com', 'team-ecc', 'ecc_1', 4, 30, 150, 's_cl_ecc', NOW(), 'q1'),
('carlos.lopez@test.com', 'team-ecc', 'ecc_2', 4, 30, 150, 's_cl_ecc', NOW(), 'q2'),
('carlos.lopez@test.com', 'team-ecc', 'ecc_3', 4, 30, 150, 's_cl_ecc', NOW(), 'q3'),
('carlos.lopez@test.com', 'team-ecc', 'ecc_4', 4, 30, 150, 's_cl_ecc', NOW(), 'q4'),
('carlos.lopez@test.com', 'team-ecc', 'ecc_5', 4, 30, 150, 's_cl_ecc', NOW(), 'q5');


-- =================================================================
-- 3. TEAM EAC (Equipo de Administración de la Contingencia)
-- Skills: eac_1_combined, eac_3, eac_5, eac_4, eac_6
-- =================================================================

-- Juan (Attempt 1)
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, unit_time_seconds, total_time_seconds, session_id, timestamp, question_id) VALUES
('juan.perez@test.com', 'team-eac', 'eac_1_combined', 1, 15, 75, 's_jp_eac', NOW(), 'q1'),
('juan.perez@test.com', 'team-eac', 'eac_3', 1, 15, 75, 's_jp_eac', NOW(), 'q2'),
('juan.perez@test.com', 'team-eac', 'eac_5', 1, 15, 75, 's_jp_eac', NOW(), 'q3'),
('juan.perez@test.com', 'team-eac', 'eac_4', 1, 15, 75, 's_jp_eac', NOW(), 'q4'),
('juan.perez@test.com', 'team-eac', 'eac_6', 1, 15, 75, 's_jp_eac', NOW(), 'q5');

-- Maria (Attempt 3 -> Score 60)
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, unit_time_seconds, total_time_seconds, session_id, timestamp, question_id) VALUES
('maria.gomez@test.com', 'team-eac', 'eac_1_combined', 3, 25, 125, 's_mg_eac', NOW(), 'q1'),
('maria.gomez@test.com', 'team-eac', 'eac_3', 3, 25, 125, 's_mg_eac', NOW(), 'q2'),
('maria.gomez@test.com', 'team-eac', 'eac_5', 3, 25, 125, 's_mg_eac', NOW(), 'q3'),
('maria.gomez@test.com', 'team-eac', 'eac_4', 3, 25, 125, 's_mg_eac', NOW(), 'q4'),
('maria.gomez@test.com', 'team-eac', 'eac_6', 3, 25, 125, 's_mg_eac', NOW(), 'q5');

-- Carlos (Attempt 1)
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, unit_time_seconds, total_time_seconds, session_id, timestamp, question_id) VALUES
('carlos.lopez@test.com', 'team-eac', 'eac_1_combined', 1, 40, 200, 's_cl_eac', NOW(), 'q1'),
('carlos.lopez@test.com', 'team-eac', 'eac_3', 1, 40, 200, 's_cl_eac', NOW(), 'q2'),
('carlos.lopez@test.com', 'team-eac', 'eac_5', 1, 40, 200, 's_cl_eac', NOW(), 'q3'),
('carlos.lopez@test.com', 'team-eac', 'eac_4', 1, 40, 200, 's_cl_eac', NOW(), 'q4'),
('carlos.lopez@test.com', 'team-eac', 'eac_6', 1, 40, 200, 's_cl_eac', NOW(), 'q5');


-- =================================================================
-- 4. TEAM TISI (Equipo de Respuesta a Emergencias de TI y SI)
-- Skills: shared_dir_personas, shared_liderazgo, eac_3, eac_5, eac_4, eac_6
-- =================================================================

-- Juan (Attempt 2)
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, unit_time_seconds, total_time_seconds, session_id, timestamp, question_id) VALUES
('juan.perez@test.com', 'team-tisi', 'shared_dir_personas', 2, 12, 72, 's_jp_tisi', NOW(), 'q1'),
('juan.perez@test.com', 'team-tisi', 'shared_liderazgo', 2, 12, 72, 's_jp_tisi', NOW(), 'q2'),
('juan.perez@test.com', 'team-tisi', 'eac_3', 2, 12, 72, 's_jp_tisi', NOW(), 'q3'),
('juan.perez@test.com', 'team-tisi', 'eac_5', 2, 12, 72, 's_jp_tisi', NOW(), 'q4'),
('juan.perez@test.com', 'team-tisi', 'eac_4', 2, 12, 72, 's_jp_tisi', NOW(), 'q5'),
('juan.perez@test.com', 'team-tisi', 'eac_6', 2, 12, 72, 's_jp_tisi', NOW(), 'q6');

-- Maria (Attempt 1)
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, unit_time_seconds, total_time_seconds, session_id, timestamp, question_id) VALUES
('maria.gomez@test.com', 'team-tisi', 'shared_dir_personas', 1, 18, 108, 's_mg_tisi', NOW(), 'q1'),
('maria.gomez@test.com', 'team-tisi', 'shared_liderazgo', 1, 18, 108, 's_mg_tisi', NOW(), 'q2'),
('maria.gomez@test.com', 'team-tisi', 'eac_3', 1, 18, 108, 's_mg_tisi', NOW(), 'q3'),
('maria.gomez@test.com', 'team-tisi', 'eac_5', 1, 18, 108, 's_mg_tisi', NOW(), 'q4'),
('maria.gomez@test.com', 'team-tisi', 'eac_4', 1, 18, 108, 's_mg_tisi', NOW(), 'q5'),
('maria.gomez@test.com', 'team-tisi', 'eac_6', 1, 18, 108, 's_mg_tisi', NOW(), 'q6');


-- =================================================================
-- 5. TEAM ERE (Equipo de Respuesta a Emergencias)
-- Skills: eac_5, shared_dir_personas, shared_liderazgo, eac_3, eac_4, eac_6
-- =================================================================

-- Juan (Attempt 1)
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, unit_time_seconds, total_time_seconds, session_id, timestamp, question_id) VALUES
('juan.perez@test.com', 'team-ere', 'eac_5', 1, 10, 60, 's_jp_ere', NOW(), 'q1'),
('juan.perez@test.com', 'team-ere', 'shared_dir_personas', 1, 10, 60, 's_jp_ere', NOW(), 'q2'),
('juan.perez@test.com', 'team-ere', 'shared_liderazgo', 1, 10, 60, 's_jp_ere', NOW(), 'q3'),
('juan.perez@test.com', 'team-ere', 'eac_3', 1, 10, 60, 's_jp_ere', NOW(), 'q4'),
('juan.perez@test.com', 'team-ere', 'eac_4', 1, 10, 60, 's_jp_ere', NOW(), 'q5'),
('juan.perez@test.com', 'team-ere', 'eac_6', 1, 10, 60, 's_jp_ere', NOW(), 'q6');


-- =================================================================
-- 6. TEAM ECN (Equipo de Continuidad del Negocio)
-- Skills: eac_1_combined, eac_3, eac_5, eac_4, eac_6
-- =================================================================

-- Maria (Attempt 1)
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, unit_time_seconds, total_time_seconds, session_id, timestamp, question_id) VALUES
('maria.gomez@test.com', 'team-ecn', 'eac_1_combined', 1, 22, 110, 's_mg_ecn', NOW(), 'q1'),
('maria.gomez@test.com', 'team-ecn', 'eac_3', 1, 22, 110, 's_mg_ecn', NOW(), 'q2'),
('maria.gomez@test.com', 'team-ecn', 'eac_5', 1, 22, 110, 's_mg_ecn', NOW(), 'q3'),
('maria.gomez@test.com', 'team-ecn', 'eac_4', 1, 22, 110, 's_mg_ecn', NOW(), 'q4'),
('maria.gomez@test.com', 'team-ecn', 'eac_6', 1, 22, 110, 's_mg_ecn', NOW(), 'q5');
