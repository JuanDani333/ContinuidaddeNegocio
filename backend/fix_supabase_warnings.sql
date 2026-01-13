-- =================================================================
-- SCRIPT DE CORRECCIÓN ROBUSTO (VERSIÓN 2)
-- =================================================================
-- Soluciona el error "function does not exist" usando SQL Dinámico.
--
-- Explicación del cambio:
-- PostgreSQL intenta validar todo el script antes de ejecutarlo. 
-- Si escribimos "ALTER FUNCTION nombre()..." y la función no existe (o tiene argumentos),
-- falla inmediatamente.
--
-- Esta nueva versión busca las funciones en el catálogo del sistema (pg_proc)
-- y construye el comando ALTER correctamente solo si existen.

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Buscamos cualquier función que coincida con estos nombres (sin importar sus argumentos)
    FOR r IN
        SELECT oid::regprocedure as func_signature
        FROM pg_proc
        WHERE proname IN (
            'calculate_attempt_score', 
            'auto_calculate_score', 
            'calculate_score_automatically',
            -- Nombres en español detectados
            'calcular_puntuación_de_intento',
            'cálculo automático de puntuación' 
        )
    LOOP
        -- Ejecutamos el cambio dinámicamente para cada coincidencia encontrada
        RAISE NOTICE 'Corrigiendo función: %', r.func_signature;
        EXECUTE 'ALTER FUNCTION ' || r.func_signature || ' SET search_path = public';
    END LOOP;
END $$;
