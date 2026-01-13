-- =================================================================
-- REPORTE COMPLETO DE USUARIOS, TIEMPOS E INTENTOS
-- =================================================================

SELECT 
    u.name AS "Nombre Usuario",
    u.email AS "Email",
    u.last_seen AS "Última Conexión",
    
    -- Métricas de Intentos
    COUNT(a.id) AS "Total Intentos (Preguntas)",
    COUNT(DISTINCT a.course_id) AS "Cursos Iniciados",
    
    -- Métricas de Tiempo (En minutos para facilitar lectura)
    ROUND(SUM(a.unit_time_seconds) / 60.0, 2) AS "Tiempo Total (Minutos)",
    ROUND(AVG(a.unit_time_seconds), 1) AS "Promedio Seg/Pregunta",
    
    -- Métricas de Desempeño
    ROUND(AVG(a.calculated_score), 2) AS "Puntaje Promedio"

FROM users u
LEFT JOIN attempts a ON u.id = a.user_id
GROUP BY u.id, u.name, u.email, u.last_seen
ORDER BY u.last_seen DESC;
