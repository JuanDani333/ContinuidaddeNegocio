-- Insert Skills for Course 3 (Competencias Técnicas)
INSERT INTO skills (id, course_id, name, full_name, display_order) VALUES
('skill_3_1', 'curso_3', 'Programación', 'Fundamentos de Programación', 1),
('skill_3_2', 'curso_3', 'Base de Datos', 'Diseño y Gestión de BD', 2),
('skill_3_3', 'curso_3', 'Seguridad', 'Ciberseguridad Básica', 3),
('skill_3_4', 'curso_3', 'Cloud', 'Infraestructura en la Nube', 4),
('skill_3_5', 'curso_3', 'DevOps', 'Prácticas de DevOps', 5);

-- Insert Skills for Course 4 (Pensamiento Estratégico)
INSERT INTO skills (id, course_id, name, full_name, display_order) VALUES
('skill_4_1', 'curso_4', 'Análisis', 'Análisis de Mercado', 1),
('skill_4_2', 'curso_4', 'Visión', 'Visión a Largo Plazo', 2),
('skill_4_3', 'curso_4', 'Innovación', 'Gestión de la Innovación', 3),
('skill_4_4', 'curso_4', 'Riesgos', 'Gestión de Riesgos', 4),
('skill_4_5', 'curso_4', 'Recursos', 'Optimización de Recursos', 5);

-- Insert Skills for Course 5 (Desarrollo Personal)
INSERT INTO skills (id, course_id, name, full_name, display_order) VALUES
('skill_5_1', 'curso_5', 'Resiliencia', 'Manejo del Estrés y Resiliencia', 1),
('skill_5_2', 'curso_5', 'Tiempo', 'Gestión del Tiempo', 2),
('skill_5_3', 'curso_5', 'Aprendizaje', 'Aprendizaje Continuo', 3),
('skill_5_4', 'curso_5', 'Empatía', 'Empatía y Relaciones', 4),
('skill_5_5', 'curso_5', 'Autonomía', 'Trabajo Autónomo', 5);

-- Optional: Add some attempts for Course 2 so it's not flat
INSERT INTO attempts (user_id, skill_id, course_id, raw_attempt, session_id) VALUES
('user_001', 'skill_2_1', 'curso_2', 1, 'session_003'),
('user_001', 'skill_2_2', 'curso_2', 1, 'session_003'),
('user_001', 'skill_2_3', 'curso_2', 2, 'session_003'),
('user_002', 'skill_2_1', 'curso_2', 3, 'session_004');
