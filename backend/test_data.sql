-- =================================================================
-- TEST DATA GENERATION SCRIPT
-- Purpose: Verify Excel Reports and Dashboard Visuals
-- Users: 3 distinct users
-- Courses: ECC, EAC (Sample)
-- Scenarios: Varied attempts, scores, and times
-- =================================================================

-- 0. Ensure Courses and Skills Exist (Dependencies)
INSERT INTO courses (id, name, description, display_order) VALUES
('team-ecc', 'Equipo de Comunicación en Contingencia (ECC)', 'Gestión de la comunicación.', 1),
('team-eac', 'Equipo de Administración de la Contingencia (EAC)', 'Coordinación estratégica.', 2)
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
('eac_6', 'Normativa SGCN', 'Conocimiento de la norma ISO 22301; y Conocimiento del Sistema de Gestión de Continuidad del Negocio (SGCN)')
ON CONFLICT (id) DO NOTHING;

-- 1. Insert Users
INSERT INTO users (id, name, email, last_seen) VALUES
('juan.perez@test.com', 'Juan Pérez', 'juan.perez@test.com', NOW()),
('maria.gomez@test.com', 'María Gómez', 'maria.gomez@test.com', NOW()),
('carlos.lopez@test.com', 'Carlos López', 'carlos.lopez@test.com', NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Attempts for Team ECC (Communication)
-- Skills: ecc_1, ecc_2, ecc_3, ecc_4, ecc_5

-- User 1: Juan Pérez (Excellent, 1 Attempt, Fast)
-- Session 1
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, unit_time_seconds, total_time_seconds, calculated_score, session_id, timestamp, question_id) VALUES
('juan.perez@test.com', 'team-ecc', 'ecc_1', 1, 10, 55, 100, 'session_jp_ecc_1', NOW() - INTERVAL '1 day', 'q1'),
('juan.perez@test.com', 'team-ecc', 'ecc_2', 1, 12, 55, 100, 'session_jp_ecc_1', NOW() - INTERVAL '1 day', 'q2'),
('juan.perez@test.com', 'team-ecc', 'ecc_3', 1, 8,  55, 100, 'session_jp_ecc_1', NOW() - INTERVAL '1 day', 'q3'),
('juan.perez@test.com', 'team-ecc', 'ecc_4', 1, 15, 55, 100, 'session_jp_ecc_1', NOW() - INTERVAL '1 day', 'q4'),
('juan.perez@test.com', 'team-ecc', 'ecc_5', 1, 10, 55, 100, 'session_jp_ecc_1', NOW() - INTERVAL '1 day', 'q5');

-- User 2: María Gómez (Improver, 2 Attempts)
-- Attempt 1 (Low score, slow)
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, unit_time_seconds, total_time_seconds, calculated_score, session_id, timestamp, question_id) VALUES
('maria.gomez@test.com', 'team-ecc', 'ecc_1', 1, 20, 120, 60, 'session_mg_ecc_1', NOW() - INTERVAL '2 days', 'q1'),
('maria.gomez@test.com', 'team-ecc', 'ecc_2', 1, 25, 120, 50, 'session_mg_ecc_1', NOW() - INTERVAL '2 days', 'q2'),
('maria.gomez@test.com', 'team-ecc', 'ecc_3', 1, 30, 120, 70, 'session_mg_ecc_1', NOW() - INTERVAL '2 days', 'q3'),
('maria.gomez@test.com', 'team-ecc', 'ecc_4', 1, 25, 120, 60, 'session_mg_ecc_1', NOW() - INTERVAL '2 days', 'q4'),
('maria.gomez@test.com', 'team-ecc', 'ecc_5', 1, 20, 120, 60, 'session_mg_ecc_1', NOW() - INTERVAL '2 days', 'q5');

-- Attempt 2 (High score, faster) - THIS SHOULD SHOW IN REPORT
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, unit_time_seconds, total_time_seconds, calculated_score, session_id, timestamp, question_id) VALUES
('maria.gomez@test.com', 'team-ecc', 'ecc_1', 2, 15, 80, 90, 'session_mg_ecc_2', NOW() - INTERVAL '1 hour', 'q1'),
('maria.gomez@test.com', 'team-ecc', 'ecc_2', 2, 18, 80, 90, 'session_mg_ecc_2', NOW() - INTERVAL '1 hour', 'q2'),
('maria.gomez@test.com', 'team-ecc', 'ecc_3', 2, 12, 80, 100, 'session_mg_ecc_2', NOW() - INTERVAL '1 hour', 'q3'),
('maria.gomez@test.com', 'team-ecc', 'ecc_4', 2, 20, 80, 80, 'session_mg_ecc_2', NOW() - INTERVAL '1 hour', 'q4'),
('maria.gomez@test.com', 'team-ecc', 'ecc_5', 2, 15, 80, 90, 'session_mg_ecc_2', NOW() - INTERVAL '1 hour', 'q5');

-- User 3: Carlos López (Struggling, 1 Attempt, Very Slow)
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, unit_time_seconds, total_time_seconds, calculated_score, session_id, timestamp, question_id) VALUES
('carlos.lopez@test.com', 'team-ecc', 'ecc_1', 1, 45, 250, 40, 'session_cl_ecc_1', NOW() - INTERVAL '5 hours', 'q1'),
('carlos.lopez@test.com', 'team-ecc', 'ecc_2', 1, 50, 250, 30, 'session_cl_ecc_1', NOW() - INTERVAL '5 hours', 'q2'),
('carlos.lopez@test.com', 'team-ecc', 'ecc_3', 1, 60, 250, 50, 'session_cl_ecc_1', NOW() - INTERVAL '5 hours', 'q3'),
('carlos.lopez@test.com', 'team-ecc', 'ecc_4', 1, 40, 250, 40, 'session_cl_ecc_1', NOW() - INTERVAL '5 hours', 'q4'),
('carlos.lopez@test.com', 'team-ecc', 'ecc_5', 1, 55, 250, 30, 'session_cl_ecc_1', NOW() - INTERVAL '5 hours', 'q5');


-- 3. Insert Attempts for Team EAC (Administration)
-- Skills: eac_1_combined, eac_3, eac_5, eac_4, eac_6

-- Juan Pérez (Consistent)
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, unit_time_seconds, total_time_seconds, calculated_score, session_id, timestamp, question_id) VALUES
('juan.perez@test.com', 'team-eac', 'eac_1_combined', 1, 20, 100, 100, 'session_jp_eac_1', NOW(), 'q1'),
('juan.perez@test.com', 'team-eac', 'eac_3', 1, 20, 100, 100, 'session_jp_eac_1', NOW(), 'q2'),
('juan.perez@test.com', 'team-eac', 'eac_5', 1, 20, 100, 100, 'session_jp_eac_1', NOW(), 'q3'),
('juan.perez@test.com', 'team-eac', 'eac_4', 1, 20, 100, 100, 'session_jp_eac_1', NOW(), 'q4'),
('juan.perez@test.com', 'team-eac', 'eac_6', 1, 20, 100, 100, 'session_jp_eac_1', NOW(), 'q5');

-- María Gómez (Average)
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, unit_time_seconds, total_time_seconds, calculated_score, session_id, timestamp, question_id) VALUES
('maria.gomez@test.com', 'team-eac', 'eac_1_combined', 1, 30, 150, 80, 'session_mg_eac_1', NOW(), 'q1'),
('maria.gomez@test.com', 'team-eac', 'eac_3', 1, 30, 150, 80, 'session_mg_eac_1', NOW(), 'q2'),
('maria.gomez@test.com', 'team-eac', 'eac_5', 1, 30, 150, 80, 'session_mg_eac_1', NOW(), 'q3'),
('maria.gomez@test.com', 'team-eac', 'eac_4', 1, 30, 150, 80, 'session_mg_eac_1', NOW(), 'q4'),
('maria.gomez@test.com', 'team-eac', 'eac_6', 1, 30, 150, 80, 'session_mg_eac_1', NOW(), 'q5');

-- Carlos López (Incomplete/Low)
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, unit_time_seconds, total_time_seconds, calculated_score, session_id, timestamp, question_id) VALUES
('carlos.lopez@test.com', 'team-eac', 'eac_1_combined', 1, 10, 50, 20, 'session_cl_eac_1', NOW(), 'q1'),
('carlos.lopez@test.com', 'team-eac', 'eac_3', 1, 10, 50, 20, 'session_cl_eac_1', NOW(), 'q2'),
('carlos.lopez@test.com', 'team-eac', 'eac_5', 1, 10, 50, 20, 'session_cl_eac_1', NOW(), 'q3'),
('carlos.lopez@test.com', 'team-eac', 'eac_4', 1, 10, 50, 20, 'session_cl_eac_1', NOW(), 'q4'),
('carlos.lopez@test.com', 'team-eac', 'eac_6', 1, 10, 50, 20, 'session_cl_eac_1', NOW(), 'q5');

-- 4. Insert Attempts for Team TISI (IT Emergency)
-- Skills: shared_dir_personas, shared_liderazgo, eac_3, eac_5, eac_4, eac_6
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, unit_time_seconds, total_time_seconds, calculated_score, session_id, timestamp, question_id) VALUES
('juan.perez@test.com', 'team-tisi', 'shared_dir_personas', 1, 15, 90, 100, 'session_jp_tisi_1', NOW(), 'q1'),
('juan.perez@test.com', 'team-tisi', 'shared_liderazgo', 1, 15, 90, 100, 'session_jp_tisi_1', NOW(), 'q2'),
('maria.gomez@test.com', 'team-tisi', 'shared_dir_personas', 1, 20, 110, 80, 'session_mg_tisi_1', NOW(), 'q1');

-- 5. Insert Attempts for Team ERE (Emergency Response)
-- Skills: eac_5, shared_dir_personas, shared_liderazgo, eac_3, eac_4, eac_6
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, unit_time_seconds, total_time_seconds, calculated_score, session_id, timestamp, question_id) VALUES
('carlos.lopez@test.com', 'team-ere', 'eac_5', 1, 30, 180, 50, 'session_cl_ere_1', NOW(), 'q1'),
('juan.perez@test.com', 'team-ere', 'eac_5', 1, 10, 60, 100, 'session_jp_ere_1', NOW(), 'q1');

-- 6. Insert Attempts for Team ECN (Business Continuity)
-- Skills: eac_1_combined, eac_3, eac_5, eac_4, eac_6
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, unit_time_seconds, total_time_seconds, calculated_score, session_id, timestamp, question_id) VALUES
('maria.gomez@test.com', 'team-ecn', 'eac_1_combined', 1, 25, 125, 90, 'session_mg_ecn_1', NOW(), 'q1'),
('carlos.lopez@test.com', 'team-ecn', 'eac_1_combined', 1, 40, 200, 40, 'session_cl_ecn_1', NOW(), 'q1');
