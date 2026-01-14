-- =================================================================
-- SCRIPT DE CORRECCIÓN AVANZADA (VERSIÓN 2)
-- =================================================================
-- SOLUCIÓN AL PROBLEMA "NO SE CAMBIÓ":
-- El script anterior fallaba si el usuario había reiniciado el curso.
-- (Ej: Tenía 100 segundos ayer, hoy empieza de nuevo y lleva 60 segundos).
-- La base de datos pensaba: "60 es menor que 100, algo anda mal" y no hacía nada.
--
-- Esta versión detecta inteligentemente si es un "Nuevo Intento" (el tiempo bajó)
-- y calcula el tiempo correctamente desde 0.

WITH CalculatedTimes AS (
    SELECT 
        id,
        user_id,
        course_id,
        timestamp,
        unit_time_seconds,
        total_time_seconds,
        -- Obtenemos el total del registro cronológico anterior
        LAG(total_time_seconds, 1, 0) OVER (
            PARTITION BY user_id, course_id 
            ORDER BY timestamp ASC
        ) as prev_total_time
    FROM attempts
)
UPDATE attempts
SET unit_time_seconds = CASE 
    -- CASO 1: Nuevo intento / Reinicio (El tiempo actual es menor que el anterior)
    -- Asumimos que empezó desde cero, así que el tiempo unitario es todo el tiempo total acumulado actual.
    WHEN ct.total_time_seconds < ct.prev_total_time THEN ct.total_time_seconds
    
    -- CASO 2: Continuación normal (El tiempo aumentó)
    -- La diferencia es el tiempo que tomó esta pregunta.
    ELSE ct.total_time_seconds - ct.prev_total_time
END
FROM CalculatedTimes ct
WHERE attempts.id = ct.id
  AND attempts.unit_time_seconds = 0; -- Solo tocamos los que están en 0

-- NOTA: Esto arreglará inmediatamente tanto a GINGER como a CESAR.
-- Ginger: Si tenía un intento viejo de 200s y ahora tiene 60s -> Nuevo Unitario = 60s.
