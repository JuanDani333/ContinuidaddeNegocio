-- =================================================================
-- VERIFICACIÓN DE CORRECCIÓN DE TIEMPOS
-- =================================================================

-- 1. CONTEO DE CEROS RESTANTES
-- Si el script funcionó, este número debería ser muy bajo o cero 
-- (salvo que realmente hayan tardado 0 segundos, que es imposible).
SELECT 
    count(*) as "TOTAL DE CEROS RESTANTES (Debería ser bajo)" 
FROM attempts 
WHERE unit_time_seconds = 0;


-- 2. DETALLE DE LOS ÚLTIMOS REGISTROS (Para inspección visual)
-- Aquí podrás ver que "Tiempo Unitario" ya tiene valores lógicos (ej. 10, 15, 50)
-- en lugar de puros ceros.
SELECT 
    u.name as "Usuario",
    to_char(
        (a.timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Guayaquil'), 
        'DD/MM HH24:MI'
    ) as "Fecha",
    s.name as "Skill/Pregunta",
    
    -- ESTA ES LA COLUMNA IMPORTANTE A REVISAR:
    a.unit_time_seconds as "Tiempo Unitario (Seg)", 
    
    a.total_time_seconds as "Tiempo Total Acumulado"
FROM attempts a
JOIN users u ON a.user_id = u.id
JOIN skills s ON a.skill_id = s.id
ORDER BY a.timestamp DESC
LIMIT 50;
