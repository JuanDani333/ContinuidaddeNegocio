-- =================================================================
-- SCRIPT DE POBLACIÓN DE DATOS DE PRUEBA (MOCK DATA)
-- Ejecuta este script en el Editor SQL de Supabase.
-- =================================================================

-- 1. ASEGURAR QUE EXISTAN LAS SKILLS (Si ya las creaste, esto dará error de duplicado, ignóralo)
-- Curso 3
INSERT INTO skills (id, course_id, name, full_name, display_order) VALUES
('skill_3_1', 'curso_3', 'Programación', 'Fundamentos de Programación', 1),
('skill_3_2', 'curso_3', 'Base de Datos', 'Diseño y Gestión de BD', 2),
('skill_3_3', 'curso_3', 'Seguridad', 'Ciberseguridad Básica', 3),
('skill_3_4', 'curso_3', 'Cloud', 'Infraestructura en la Nube', 4),
('skill_3_5', 'curso_3', 'DevOps', 'Prácticas de DevOps', 5)
ON CONFLICT (id) DO NOTHING;

-- Curso 4
INSERT INTO skills (id, course_id, name, full_name, display_order) VALUES
('skill_4_1', 'curso_4', 'Análisis', 'Análisis de Mercado', 1),
('skill_4_2', 'curso_4', 'Visión', 'Visión a Largo Plazo', 2),
('skill_4_3', 'curso_4', 'Innovación', 'Gestión de la Innovación', 3),
('skill_4_4', 'curso_4', 'Riesgos', 'Gestión de Riesgos', 4),
('skill_4_5', 'curso_4', 'Recursos', 'Optimización de Recursos', 5)
ON CONFLICT (id) DO NOTHING;

-- Curso 5
INSERT INTO skills (id, course_id, name, full_name, display_order) VALUES
('skill_5_1', 'curso_5', 'Resiliencia', 'Manejo del Estrés y Resiliencia', 1),
('skill_5_2', 'curso_5', 'Tiempo', 'Gestión del Tiempo', 2),
('skill_5_3', 'curso_5', 'Aprendizaje', 'Aprendizaje Continuo', 3),
('skill_5_4', 'curso_5', 'Empatía', 'Empatía y Relaciones', 4),
('skill_5_5', 'curso_5', 'Autonomía', 'Trabajo Autónomo', 5)
ON CONFLICT (id) DO NOTHING;


-- 2. CREAR MÁS USUARIOS (Total 15 usuarios para tener variedad)
INSERT INTO users (id, name) VALUES
('user_003', 'Carlos López'),
('user_004', 'Ana Martínez'),
('user_005', 'Luis Rodríguez'),
('user_006', 'Elena Fernández'),
('user_007', 'Miguel Torres'),
('user_008', 'Lucía Ramirez'),
('user_009', 'David Sanchez'),
('user_010', 'Carmen Diaz'),
('user_011', 'Javier Ruiz'),
('user_012', 'Paula Morales'),
('user_013', 'Roberto Herrera'),
('user_014', 'Isabel Castro'),
('user_015', 'Fernando Gil')
ON CONFLICT (id) DO NOTHING;


-- 3. GENERAR INTENTOS (ATTEMPTS)
-- Vamos a simular que 3 usuarios diferentes han tomado cada curso.
-- Usaremos una lógica variada: algunos aprueban a la primera (1 intento = 100%), otros les cuesta más.

-- === CURSO 1: Liderazgo (Usuarios: 001, 002, 003) ===
-- User 1: Experto (Todo en 1 intento)
INSERT INTO attempts (user_id, skill_id, course_id, raw_attempt) VALUES
('user_001', 'skill_1_3', 'curso_1', 1),
('user_001', 'skill_1_4', 'curso_1', 1),
('user_001', 'skill_1_5', 'curso_1', 1); -- (Ya tenía 1_1 y 1_2)

-- User 2: Promedio (1 a 3 intentos)
INSERT INTO attempts (user_id, skill_id, course_id, raw_attempt) VALUES
('user_002', 'skill_1_2', 'curso_1', 2),
('user_002', 'skill_1_3', 'curso_1', 1),
('user_002', 'skill_1_4', 'curso_1', 3),
('user_002', 'skill_1_5', 'curso_1', 2); -- (Ya tenía 1_1)

-- User 3: Principiante (Muchos intentos)
INSERT INTO attempts (user_id, skill_id, course_id, raw_attempt) VALUES
('user_003', 'skill_1_1', 'curso_1', 4),
('user_003', 'skill_1_2', 'curso_1', 3),
('user_003', 'skill_1_3', 'curso_1', 5),
('user_003', 'skill_1_4', 'curso_1', 2),
('user_003', 'skill_1_5', 'curso_1', 4);


-- === CURSO 2: Comunicación (Usuarios: 004, 005, 006) ===
INSERT INTO attempts (user_id, skill_id, course_id, raw_attempt) VALUES
-- User 4 (Muy bueno)
('user_004', 'skill_2_1', 'curso_2', 1), ('user_004', 'skill_2_2', 'curso_2', 1), ('user_004', 'skill_2_3', 'curso_2', 1), ('user_004', 'skill_2_4', 'curso_2', 1), ('user_004', 'skill_2_5', 'curso_2', 1),
-- User 5 (Regular)
('user_005', 'skill_2_1', 'curso_2', 2), ('user_005', 'skill_2_2', 'curso_2', 3), ('user_005', 'skill_2_3', 'curso_2', 2), ('user_005', 'skill_2_4', 'curso_2', 1), ('user_005', 'skill_2_5', 'curso_2', 4),
-- User 6 (Le costó Negociación)
('user_006', 'skill_2_1', 'curso_2', 1), ('user_006', 'skill_2_2', 'curso_2', 1), ('user_006', 'skill_2_3', 'curso_2', 2), ('user_006', 'skill_2_4', 'curso_2', 1), ('user_006', 'skill_2_5', 'curso_2', 5);


-- === CURSO 3: Competencias Técnicas (Usuarios: 007, 008, 009) ===
INSERT INTO attempts (user_id, skill_id, course_id, raw_attempt) VALUES
-- User 7
('user_007', 'skill_3_1', 'curso_3', 1), ('user_007', 'skill_3_2', 'curso_3', 2), ('user_007', 'skill_3_3', 'curso_3', 1), ('user_007', 'skill_3_4', 'curso_3', 3), ('user_007', 'skill_3_5', 'curso_3', 1),
-- User 8
('user_008', 'skill_3_1', 'curso_3', 3), ('user_008', 'skill_3_2', 'curso_3', 3), ('user_008', 'skill_3_3', 'curso_3', 2), ('user_008', 'skill_3_4', 'curso_3', 2), ('user_008', 'skill_3_5', 'curso_3', 4),
-- User 9
('user_009', 'skill_3_1', 'curso_3', 1), ('user_009', 'skill_3_2', 'curso_3', 1), ('user_009', 'skill_3_3', 'curso_3', 1), ('user_009', 'skill_3_4', 'curso_3', 1), ('user_009', 'skill_3_5', 'curso_3', 1);


-- === CURSO 4: Pensamiento Estratégico (Usuarios: 010, 011, 012) ===
INSERT INTO attempts (user_id, skill_id, course_id, raw_attempt) VALUES
-- User 10
('user_010', 'skill_4_1', 'curso_4', 2), ('user_010', 'skill_4_2', 'curso_4', 2), ('user_010', 'skill_4_3', 'curso_4', 2), ('user_010', 'skill_4_4', 'curso_4', 2), ('user_010', 'skill_4_5', 'curso_4', 2),
-- User 11
('user_011', 'skill_4_1', 'curso_4', 1), ('user_011', 'skill_4_2', 'curso_4', 4), ('user_011', 'skill_4_3', 'curso_4', 1), ('user_011', 'skill_4_4', 'curso_4', 3), ('user_011', 'skill_4_5', 'curso_4', 1),
-- User 12
('user_012', 'skill_4_1', 'curso_4', 3), ('user_012', 'skill_4_2', 'curso_4', 3), ('user_012', 'skill_4_3', 'curso_4', 3), ('user_012', 'skill_4_4', 'curso_4', 3), ('user_012', 'skill_4_5', 'curso_4', 3);


-- === CURSO 5: Desarrollo Personal (Usuarios: 013, 014, 015) ===
INSERT INTO attempts (user_id, skill_id, course_id, raw_attempt) VALUES
-- User 13
('user_013', 'skill_5_1', 'curso_5', 1), ('user_013', 'skill_5_2', 'curso_5', 5), ('user_013', 'skill_5_3', 'curso_5', 1), ('user_013', 'skill_5_4', 'curso_5', 1), ('user_013', 'skill_5_5', 'curso_5', 2),
-- User 14
('user_014', 'skill_5_1', 'curso_5', 2), ('user_014', 'skill_5_2', 'curso_5', 2), ('user_014', 'skill_5_3', 'curso_5', 2), ('user_014', 'skill_5_4', 'curso_5', 2), ('user_014', 'skill_5_5', 'curso_5', 2),
-- User 15
('user_015', 'skill_5_1', 'curso_5', 1), ('user_015', 'skill_5_2', 'curso_5', 1), ('user_015', 'skill_5_3', 'curso_5', 1), ('user_015', 'skill_5_4', 'curso_5', 1), ('user_015', 'skill_5_5', 'curso_5', 1);
