-- =================================================================
-- RESET AND SEED SCRIPT
-- Purpose: COMPLETELY WIPE LMS DATA and re-insert correct test data
-- WARNING: This deletes all data in courses, skills, users, attempts!
-- =================================================================

-- 1. Truncate Tables (Cascade to remove dependencies)
TRUNCATE TABLE attempts, course_skills, skills, courses, users CASCADE;

-- 2. Insert Courses (The 5 Official Teams)
INSERT INTO courses (id, name, description, display_order) VALUES
('team-ecc', 'Equipo de Comunicación en Contingencia (ECC)', 'Gestión de la comunicación interna, externa y manejo de medios durante incidentes.', 1),
('team-eac', 'Equipo de Administración de la Contingencia (EAC)', 'Coordinación estratégica, toma de decisiones y asignación de recursos en crisis.', 2),
('team-tisi', 'Equipo de Respuesta a Emergencias de TI y SI', 'Recuperación de servicios tecnológicos y protección de la seguridad de la información.', 3),
('team-ere', 'Equipo de Respuesta a Emergencias (ERE)', 'Ejecución de acciones operativas y liderazgo de equipos en terreno.', 4),
('team-ecn', 'Equipo de Continuidad del Negocio (ECN)', 'Aseguramiento y recuperación de los procesos críticos de negocio post-incidente.', 5);

-- 3. Insert Skills (The Official List)
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
('shared_liderazgo', 'Liderazgo', 'Liderazgo y toma de decisiones en emergencia'),
('ecn_1', 'Análisis BIA', 'Interpretación del Análisis de Impacto al Negocio (BIA)'),
('ecn_2', 'Proc. Críticos', 'Priorización y recuperación de procesos críticos'),
('ecn_3', 'Cadena Sum.', 'Gestión de proveedores alternos y cadena de suministro'),
('ecn_4', 'Estrategias', 'Definición de estrategias de recuperación operativa'),
('ecn_5', 'Retorno', 'Planificación del retorno a la normalidad (Vuelta a casa)');

-- 4. Link Courses and Skills (The Official Mapping)
INSERT INTO course_skills (course_id, skill_id, display_order) VALUES
-- ECC (UPDATED: Uses Soft Skills now)
('team-ecc', 'eac_1_combined', 1), ('team-ecc', 'eac_3', 2), ('team-ecc', 'eac_5', 3), ('team-ecc', 'eac_4', 4), ('team-ecc', 'eac_6', 5),
-- EAC (5 skills)
('team-eac', 'eac_1_combined', 1), ('team-eac', 'eac_3', 2), ('team-eac', 'eac_5', 3), ('team-eac', 'eac_4', 4), ('team-eac', 'eac_6', 5),
-- TISI (6 skills)
('team-tisi', 'shared_dir_personas', 1), ('team-tisi', 'shared_liderazgo', 2), ('team-tisi', 'eac_3', 3), ('team-tisi', 'eac_5', 4), ('team-tisi', 'eac_4', 5), ('team-tisi', 'eac_6', 6),
-- ERE (6 skills)
('team-ere', 'eac_5', 1), ('team-ere', 'shared_dir_personas', 2), ('team-ere', 'shared_liderazgo', 3), ('team-ere', 'eac_3', 4), ('team-ere', 'eac_4', 5), ('team-ere', 'eac_6', 6),
-- ECN (5 skills)
('team-ecn', 'eac_1_combined', 1), ('team-ecn', 'eac_3', 2), ('team-ecn', 'eac_5', 3), ('team-ecn', 'eac_4', 4), ('team-ecn', 'eac_6', 5);

-- 5. Insert Users
INSERT INTO users (id, name, email, last_seen) VALUES
('juan.perez@test.com', 'Juan Pérez', 'juan.perez@test.com', NOW()),
('maria.gomez@test.com', 'María Gómez', 'maria.gomez@test.com', NOW()),
('carlos.lopez@test.com', 'Carlos López', 'carlos.lopez@test.com', NOW());

-- 5.1 Insert Admin (app_admins table)
INSERT INTO app_admins (username, password_hash, display_name) VALUES
('admin', '$2a$10$olZ0UB34lWvpEunmRk597OD5LaGDfFeokGBn09x7jzO/OlrXn6Nv6', 'Administrador')
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- 6. Insert Attempts (Test Data)
-- ECC: Juan (100), Maria (80), Carlos (40) - UPDATED SKILLS
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, unit_time_seconds, total_time_seconds, session_id, timestamp, question_id) VALUES
('juan.perez@test.com', 'team-ecc', 'eac_1_combined', 1, 10, 50, 's_jp_ecc', NOW(), 'q1'),
('juan.perez@test.com', 'team-ecc', 'eac_3', 1, 10, 50, 's_jp_ecc', NOW(), 'q2'),
('juan.perez@test.com', 'team-ecc', 'eac_5', 1, 10, 50, 's_jp_ecc', NOW(), 'q3'),
('juan.perez@test.com', 'team-ecc', 'eac_4', 1, 10, 50, 's_jp_ecc', NOW(), 'q4'),
('juan.perez@test.com', 'team-ecc', 'eac_6', 1, 10, 50, 's_jp_ecc', NOW(), 'q5'),

('maria.gomez@test.com', 'team-ecc', 'eac_1_combined', 2, 20, 100, 's_mg_ecc', NOW(), 'q1'),
('maria.gomez@test.com', 'team-ecc', 'eac_3', 2, 20, 100, 's_mg_ecc', NOW(), 'q2'),
('maria.gomez@test.com', 'team-ecc', 'eac_5', 2, 20, 100, 's_mg_ecc', NOW(), 'q3'),
('maria.gomez@test.com', 'team-ecc', 'eac_4', 2, 20, 100, 's_mg_ecc', NOW(), 'q4'),
('maria.gomez@test.com', 'team-ecc', 'eac_6', 2, 20, 100, 's_mg_ecc', NOW(), 'q5'),

('carlos.lopez@test.com', 'team-ecc', 'eac_1_combined', 4, 30, 150, 's_cl_ecc', NOW(), 'q1'),
('carlos.lopez@test.com', 'team-ecc', 'eac_3', 4, 30, 150, 's_cl_ecc', NOW(), 'q2'),
('carlos.lopez@test.com', 'team-ecc', 'eac_5', 4, 30, 150, 's_cl_ecc', NOW(), 'q3'),
('carlos.lopez@test.com', 'team-ecc', 'eac_4', 4, 30, 150, 's_cl_ecc', NOW(), 'q4'),
('carlos.lopez@test.com', 'team-ecc', 'eac_6', 4, 30, 150, 's_cl_ecc', NOW(), 'q5');

-- EAC: Juan (100), Maria (60), Carlos (40)
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, unit_time_seconds, total_time_seconds, session_id, timestamp, question_id) VALUES
('juan.perez@test.com', 'team-eac', 'eac_1_combined', 1, 15, 75, 's_jp_eac', NOW(), 'q1'),
('juan.perez@test.com', 'team-eac', 'eac_3', 1, 15, 75, 's_jp_eac', NOW(), 'q2'),
('juan.perez@test.com', 'team-eac', 'eac_5', 1, 15, 75, 's_jp_eac', NOW(), 'q3'),
('juan.perez@test.com', 'team-eac', 'eac_4', 1, 15, 75, 's_jp_eac', NOW(), 'q4'),
('juan.perez@test.com', 'team-eac', 'eac_6', 1, 15, 75, 's_jp_eac', NOW(), 'q5'),

('maria.gomez@test.com', 'team-eac', 'eac_1_combined', 3, 25, 125, 's_mg_eac', NOW(), 'q1'),
('maria.gomez@test.com', 'team-eac', 'eac_3', 3, 25, 125, 's_mg_eac', NOW(), 'q2'),
('maria.gomez@test.com', 'team-eac', 'eac_5', 3, 25, 125, 's_mg_eac', NOW(), 'q3'),
('maria.gomez@test.com', 'team-eac', 'eac_4', 3, 25, 125, 's_mg_eac', NOW(), 'q4'),
('maria.gomez@test.com', 'team-eac', 'eac_6', 3, 25, 125, 's_mg_eac', NOW(), 'q5'),

('carlos.lopez@test.com', 'team-eac', 'eac_1_combined', 1, 40, 200, 's_cl_eac', NOW(), 'q1'),
('carlos.lopez@test.com', 'team-eac', 'eac_3', 1, 40, 200, 's_cl_eac', NOW(), 'q2'),
('carlos.lopez@test.com', 'team-eac', 'eac_5', 1, 40, 200, 's_cl_eac', NOW(), 'q3'),
('carlos.lopez@test.com', 'team-eac', 'eac_4', 1, 40, 200, 's_cl_eac', NOW(), 'q4'),
('carlos.lopez@test.com', 'team-eac', 'eac_6', 1, 40, 200, 's_cl_eac', NOW(), 'q5');

-- TISI: Juan (80), Maria (100)
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, unit_time_seconds, total_time_seconds, session_id, timestamp, question_id) VALUES
('juan.perez@test.com', 'team-tisi', 'shared_dir_personas', 2, 12, 72, 's_jp_tisi', NOW(), 'q1'),
('juan.perez@test.com', 'team-tisi', 'shared_liderazgo', 2, 12, 72, 's_jp_tisi', NOW(), 'q2'),
('juan.perez@test.com', 'team-tisi', 'eac_3', 2, 12, 72, 's_jp_tisi', NOW(), 'q3'),
('juan.perez@test.com', 'team-tisi', 'eac_5', 2, 12, 72, 's_jp_tisi', NOW(), 'q4'),
('juan.perez@test.com', 'team-tisi', 'eac_4', 2, 12, 72, 's_jp_tisi', NOW(), 'q5'),
('juan.perez@test.com', 'team-tisi', 'eac_6', 2, 12, 72, 's_jp_tisi', NOW(), 'q6'),

('maria.gomez@test.com', 'team-tisi', 'shared_dir_personas', 1, 18, 108, 's_mg_tisi', NOW(), 'q1'),
('maria.gomez@test.com', 'team-tisi', 'shared_liderazgo', 1, 18, 108, 's_mg_tisi', NOW(), 'q2'),
('maria.gomez@test.com', 'team-tisi', 'eac_3', 1, 18, 108, 's_mg_tisi', NOW(), 'q3'),
('maria.gomez@test.com', 'team-tisi', 'eac_5', 1, 18, 108, 's_mg_tisi', NOW(), 'q4'),
('maria.gomez@test.com', 'team-tisi', 'eac_4', 1, 18, 108, 's_mg_tisi', NOW(), 'q5'),
('maria.gomez@test.com', 'team-tisi', 'eac_6', 1, 18, 108, 's_mg_tisi', NOW(), 'q6');

-- ERE: Juan (100)
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, unit_time_seconds, total_time_seconds, session_id, timestamp, question_id) VALUES
('juan.perez@test.com', 'team-ere', 'eac_5', 1, 10, 60, 's_jp_ere', NOW(), 'q1'),
('juan.perez@test.com', 'team-ere', 'shared_dir_personas', 1, 10, 60, 's_jp_ere', NOW(), 'q2'),
('juan.perez@test.com', 'team-ere', 'shared_liderazgo', 1, 10, 60, 's_jp_ere', NOW(), 'q3'),
('juan.perez@test.com', 'team-ere', 'eac_3', 1, 10, 60, 's_jp_ere', NOW(), 'q4'),
('juan.perez@test.com', 'team-ere', 'eac_4', 1, 10, 60, 's_jp_ere', NOW(), 'q5'),
('juan.perez@test.com', 'team-ere', 'eac_6', 1, 10, 60, 's_jp_ere', NOW(), 'q6');

-- ECN: Maria (100)
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, unit_time_seconds, total_time_seconds, session_id, timestamp, question_id) VALUES
('maria.gomez@test.com', 'team-ecn', 'eac_1_combined', 1, 22, 110, 's_mg_ecn', NOW(), 'q1'),
('maria.gomez@test.com', 'team-ecn', 'eac_3', 1, 22, 110, 's_mg_ecn', NOW(), 'q2'),
('maria.gomez@test.com', 'team-ecn', 'eac_5', 1, 22, 110, 's_mg_ecn', NOW(), 'q3'),
('maria.gomez@test.com', 'team-ecn', 'eac_4', 1, 22, 110, 's_mg_ecn', NOW(), 'q4'),
('maria.gomez@test.com', 'team-ecn', 'eac_6', 1, 22, 110, 's_mg_ecn', NOW(), 'q5');
