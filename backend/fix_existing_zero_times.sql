-- =================================================================
-- SCRIPT DE CORRECCIÓN RETROACTIVA DE TIEMPOS (AUTO-HEALING SQL)
-- =================================================================
-- Este script arregla los datos que YA se guardaron mal (unit_time = 0).
-- Usa la misma lógica inteligente: Calcula la diferencia con el total anterior.

WITH CalculatedTimes AS (
    SELECT 
        id,
        user_id,
        course_id,
        timestamp,
        unit_time_seconds,
        total_time_seconds,
        -- Obtenemos el total del intento ANTERIOR (Partition por usuario y curso)
        -- Si es el primero, devuelve 0 (que es correcto).
        LAG(total_time_seconds, 1, 0) OVER (
            PARTITION BY user_id, course_id 
            ORDER BY timestamp ASC
        ) as prev_total_time
    FROM attempts
)
UPDATE attempts
SET unit_time_seconds = ct.total_time_seconds - ct.prev_total_time
FROM CalculatedTimes ct
WHERE attempts.id = ct.id
  AND attempts.unit_time_seconds = 0  -- Solo corregir los que están en 0
  AND ct.total_time_seconds > ct.prev_total_time -- Solo si hubo avance real de tiempo
  AND (ct.total_time_seconds - ct.prev_total_time) < 1800; -- Sanity Check (Max 30 min por pregunta)

-- =================================================================
-- ¿QUÉ HACE ESTO?
-- 1. Ordena los intentos de cada usuario por fecha.
-- 2. Mira el "Tiempo Total" actual y le resta el "Tiempo Total" del intento anterior.
-- 3. Si es el 1er intento: Resta 0 (Total - 0 = Total), así que el Unitario será igual al Total.
-- 4. Si es el 2do intento: (Total Actual - Total Anterior) = Tiempo que tomó esa pregunta.
-- 5. Solo aplica el cambio si el tiempo guardado era 0.
