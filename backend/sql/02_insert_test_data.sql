-- ================================================================
-- INSERTAR DATOS DE PRUEBA COMPLETOS
-- Este script llena TODOS los skills para "Usuario de Prueba" 
-- para generar gráficos de araña completos (polígonos).
-- ================================================================

-- 1. LIMPIEZA PREVIA DEL USUARIO DE PRUEBA
DELETE FROM attempts WHERE user_id = 'test_user_01';
DELETE FROM users WHERE id = 'test_user_01';

-- 2. INSERTAR USUARIO
INSERT INTO users (id, name, email, last_seen)
VALUES ('test_user_01', 'Usuario de Prueba Global', 'test@digimentore.com', NOW());

-- 3. INSERTAR INTENTOS (VARIADOS PARA GENERAR FORMAS)

-- ================================================================
-- CURSO: ECC (Comunicación en Contingencia) - team-ecc
-- Skills: ecc_dir_liderazgo, ecc_intel_emocional, ecc_resol_problemas, ecc_logro_resultados, ecc_normativa_sgcn
-- ================================================================
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, calculated_score, unit_time_seconds, total_time_seconds, timestamp) VALUES
('test_user_01', 'team-ecc', 'ecc_dir_liderazgo', 1, 100, 120, 600, NOW() - INTERVAL '5 days'),
('test_user_01', 'team-ecc', 'ecc_intel_emocional', 1, 80, 100, 600, NOW() - INTERVAL '4 days'),
('test_user_01', 'team-ecc', 'ecc_resol_problemas', 1, 60, 150, 600, NOW() - INTERVAL '3 days'),
('test_user_01', 'team-ecc', 'ecc_logro_resultados', 1, 100, 90, 600, NOW() - INTERVAL '2 days'),
('test_user_01', 'team-ecc', 'ecc_normativa_sgcn', 1, 80, 200, 600, NOW() - INTERVAL '1 day');

-- ================================================================
-- CURSO: EAC (Administración de la Contingencia) - team-eac
-- Skills: eac_3, eac_4, eac_5 (Nombres según tu primer prompt)
-- ================================================================
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, calculated_score, unit_time_seconds, total_time_seconds, timestamp) VALUES
('test_user_01', 'team-eac', 'eac_3', 1, 80, 120, 500, NOW()), -- Inteligencia Emocional
('test_user_01', 'team-eac', 'eac_4', 1, 60, 130, 500, NOW()), -- Resolución Problemas
('test_user_01', 'team-eac', 'eac_5', 1, 100, 110, 500, NOW()); -- Orientación al Logro

-- ================================================================
-- CURSO: ECN (Continuidad del Negocio) - team-ecn
-- Skills: ecn_1, ecn_2, ecn_3, ecn_4, ecn_5
-- ================================================================
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, calculated_score, unit_time_seconds, total_time_seconds, timestamp) VALUES
('test_user_01', 'team-ecn', 'ecn_1', 1, 100, 100, 700, NOW()),
('test_user_01', 'team-ecn', 'ecn_2', 1, 100, 100, 700, NOW()),
('test_user_01', 'team-ecn', 'ecn_3', 1, 40, 300, 700, NOW()), -- Nota baja para variar la forma
('test_user_01', 'team-ecn', 'ecn_4', 1, 80, 120, 700, NOW()),
('test_user_01', 'team-ecn', 'ecn_5', 1, 60, 150, 700, NOW());

-- ================================================================
-- CURSO: ERE (Respuesta a Emergencias) - team-ere
-- Skills: ere_dir_personas, ere_liderazgo, ere_intel_emocional, ere_resol_problemas, ere_logro_resultados, ere_normativa_sgcn
-- ================================================================
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, calculated_score, unit_time_seconds, total_time_seconds, timestamp) VALUES
('test_user_01', 'team-ere', 'ere_dir_personas', 1, 80, 100, 800, NOW()),
('test_user_01', 'team-ere', 'ere_liderazgo', 1, 80, 100, 800, NOW()),
('test_user_01', 'team-ere', 'ere_intel_emocional', 1, 80, 100, 800, NOW()),
('test_user_01', 'team-ere', 'ere_resol_problemas', 1, 80, 100, 800, NOW()),
('test_user_01', 'team-ere', 'ere_logro_resultados', 1, 80, 100, 800, NOW()),
('test_user_01', 'team-ere', 'ere_normativa_sgcn', 1, 80, 100, 800, NOW()); 
-- Este ERE quedará como un hexágono perfecto (todos 80)

-- ================================================================
-- CURSO: TI y SI (team-tisi) - team-tisi
-- Skills: tisi_resol_problemas, tisi_dir_personas, tisi_liderazgo, tisi_intel_emocional, tisi_logro_resultados, tisi_normativa_sgcn
-- ================================================================
INSERT INTO attempts (user_id, course_id, skill_id, raw_attempt, calculated_score, unit_time_seconds, total_time_seconds, timestamp) VALUES
('test_user_01', 'team-tisi', 'tisi_resol_problemas', 1, 20, 50, 400, NOW()), -- Muy bajo
('test_user_01', 'team-tisi', 'tisi_dir_personas', 1, 40, 60, 400, NOW()),
('test_user_01', 'team-tisi', 'tisi_liderazgo', 1, 60, 70, 400, NOW()),
('test_user_01', 'team-tisi', 'tisi_intel_emocional', 1, 80, 80, 400, NOW()),
('test_user_01', 'team-tisi', 'tisi_logro_resultados', 1, 100, 90, 400, NOW()),
('test_user_01', 'team-tisi', 'tisi_normativa_sgcn', 1, 100, 100, 400, NOW());
-- Este TISI formará una espiral ascendente

-- VERIFICACIÓN
SELECT course_id, COUNT(*) as skills_completed 
FROM attempts 
WHERE user_id = 'test_user_01' 
GROUP BY course_id;
