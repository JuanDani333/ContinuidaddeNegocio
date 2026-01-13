-- =================================================================
-- SCRIPT DE ELIMINACIÓN DE DATOS DE PRUEBA (SOLUCIÓN FK)
-- =================================================================
-- El error anterior ocurrió porque la tabla de intentos no tenía "Borrado en Cascada".
-- Solución: Borramos manualmente primero los hijos (intentos) y luego los padres (usuarios).

-- 1. Borrar primero los INTENTOS de los usuarios antiguos
DELETE FROM attempts
WHERE user_id IN (
    SELECT id 
    FROM users 
    WHERE last_seen < '2026-01-01 00:00:00'
);

-- 2. Ahora sí, borrar los USUARIOS antiguos
DELETE FROM users 
WHERE last_seen < '2026-01-01 00:00:00';

-- =================================================================
-- ¡LISTO!
