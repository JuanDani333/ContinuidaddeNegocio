-- =================================================================
-- VERIFICACIÓN DE HORA LOCAL (CORRECCIÓN DE ZONA HORARIA)
-- =================================================================
-- El formato que ves (+00) es UTC (Tiempo Universal).
-- Para verlo en tu hora local (parece ser UTC-5 por tu ubicación),
-- usa esta consulta:

SELECT 
    timestamp as "Hora Original (UTC)",
    timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota' as "Hora Local (Ecuador/Col/Per)",
    -- O simplemente restando 5 horas manualmente:
    timestamp - INTERVAL '5 hours' as "Hora Restada Manualmente"
FROM attempts
WHERE user_id = 'db500521d4bd6837a2c0d0c6a763e322'
ORDER BY timestamp DESC
LIMIT 5;
