-- ================================================================
-- VINCULAR SKILLS A CURSOS (CORRECCIÓN FINAL)
-- 1. LIMPIEZA: Elimina asignaciones previas para evitar duplicados/errores
-- 2. ASIGNACIÓN: Usa los IDs correctos (team-eac, team-ecc, etc.)
-- ================================================================

-- 1. LIMPIEZA (Borrar relaciones existentes para estos cursos)
DELETE FROM course_skills 
WHERE course_id IN ('team-eac', 'team-ecc', 'team-ecn', 'team-ere', 'team-tisi');

-- 2. INSERTAR NUEVAS RELACIONES

-- CURSO EAC (team-eac) -> Skills que empiezan por 'eac'
INSERT INTO course_skills (course_id, skill_id, display_order)
SELECT 'team-eac', id, ROW_NUMBER() OVER (ORDER BY id)
FROM skills 
WHERE id LIKE 'eac%';

-- CURSO ECC (team-ecc) -> Skills que empiezan por 'ecc'
INSERT INTO course_skills (course_id, skill_id, display_order)
SELECT 'team-ecc', id, ROW_NUMBER() OVER (ORDER BY id)
FROM skills 
WHERE id LIKE 'ecc%';

-- CURSO ECN (team-ecn) -> Skills que empiezan por 'ecn'
INSERT INTO course_skills (course_id, skill_id, display_order)
SELECT 'team-ecn', id, ROW_NUMBER() OVER (ORDER BY id)
FROM skills 
WHERE id LIKE 'ecn%';

-- CURSO ERE (team-ere) -> Skills que empiezan por 'ere'
INSERT INTO course_skills (course_id, skill_id, display_order)
SELECT 'team-ere', id, ROW_NUMBER() OVER (ORDER BY id)
FROM skills 
WHERE id LIKE 'ere%';

-- CURSO TI y SI (team-tisi) -> Skills que empiezan por 'tisi' o 'ti_si'
INSERT INTO course_skills (course_id, skill_id, display_order)
SELECT 'team-tisi', id, ROW_NUMBER() OVER (ORDER BY id)
FROM skills 
WHERE id LIKE 'tisi%' OR id LIKE 'ti_si%';

-- VERIFICACIÓN FINAL
SELECT cs.course_id, s.name as skill_name 
FROM course_skills cs
JOIN skills s ON cs.skill_id = s.id
ORDER BY cs.course_id;
