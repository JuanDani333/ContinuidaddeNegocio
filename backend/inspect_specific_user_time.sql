-- =================================================================
-- INSPECCIÓN DETALLADA DE TIEMPOS POR USUARIO
-- =================================================================
-- ID del usuario a investigar: db500521d4bd6837a2c0d0c6a763e322
-- Objetivo: Ver si la base de datos realmente tiene "0" o si hay datos.

SELECT 
    s.full_name as "Habilidad (Skill)",
    c.name as "Curso",
    a.question_id as "ID Pregunta",
    
    -- DATOS CRÍTICOS
    a.unit_time_seconds as "Tiempo Unitario (seg)",   -- ¿Está llegando en 0?
    a.total_time_seconds as "Tiempo Total (seg)",     -- ¿Se acumula?
    
    a.raw_attempt as "Nro Intento",
    a.calculated_score as "Puntaje",
    a.timestamp as "Fecha/Hora Registro"

FROM attempts a
JOIN skills s ON a.skill_id = s.id
JOIN courses c ON a.course_id = c.id
WHERE a.user_id = 'db500521d4bd6837a2c0d0c6a763e322'
ORDER BY a.timestamp DESC;

-- NOTA PARA EL ANÁLISIS:
-- 1. Si "Tiempo Unitario" es 0 pero "Tiempo Total" tiene valor: 
--    Significa que Storyline envía el acumulado pero no el parcial por pregunta.
-- 2. Si AMBOS son 0:
--    Storyline no está capturando el tiempo o se pierde en el envío.
