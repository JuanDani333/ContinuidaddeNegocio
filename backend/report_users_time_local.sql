-- =================================================================
-- REPORTE DE USUARIOS CON HORA LOCAL (UTC-5)
-- =================================================================
-- Muestra el listado completo de usuarios, sus estadísticas y 
-- la fecha de última conexión ajustada a tu zona horaria.

SELECT 
    u.name AS "Nombre Usuario",
    u.email AS "Email",
    
    -- Conversión de Zona Horaria (UTC -> Hora Local)
    -- Ajustado para Ecuador/Colombia/Perú (UTC-5)
    to_char(
        (u.last_seen AT TIME ZONE 'UTC' AT TIME ZONE 'America/Guayaquil'), 
        'YYYY-MM-DD HH24:MI:SS'
    ) AS "Última Conexión (Local)",
    
    -- Métricas de Actividad
    COUNT(a.id) AS "Total Intentos",
    COUNT(DISTINCT a.course_id) AS "Cursos Iniciados",
    
    -- Métricas de Tiempo
    -- Suma de segundos convertida a formato 'MM min SS seg' para mayor claridad
    TO_CHAR(
        (SUM(COALESCE(a.unit_time_seconds, 0)) || ' second')::interval, 
        'MI"m "SS"s"'
    ) AS "Tiempo Total",
    
    -- Métricas de Desempeño
    ROUND(AVG(COALESCE(a.calculated_score, 0)), 2) AS "Nota Promedio"

FROM users u
LEFT JOIN attempts a ON u.id = a.user_id
GROUP BY u.id, u.name, u.email, u.last_seen
ORDER BY u.last_seen DESC;
