-- =================================================================
-- SCRIPT DE INSPECCIÓN DE USUARIOS
-- =================================================================
-- Ejecuta este script primero para ver qué usuarios tienes y sus fechas.
-- Esto te ayudará a decidir cuál es la fecha de corte para eliminar.

SELECT 
    u.id as user_id,
    u.name as user_name,
    u.email AS "ID / Email",
    -- Intentamos mostrar created_at si existe, si no, last_seen
    -- Supabase suele añadir created_at por defecto.
    u.last_seen,
    count(a.id) as total_attempts
FROM users u
LEFT JOIN attempts a ON u.id = a.user_id
GROUP BY u.id, u.name, u.email, u.last_seen
ORDER BY u.last_seen ASC; 
-- Los registros más antiguos (probablemente pruebas) saldrán primero.
