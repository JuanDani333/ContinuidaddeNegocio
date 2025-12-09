// Detecta si estamos en producción (Vercel) o desarrollo (Local)
const isProduction = import.meta.env.PROD;

// En producción, usamos rutas relativas (ej. /api/auth) porque el frontend y backend están en el mismo dominio.
// En desarrollo, usamos localhost:5176 explícitamente.
export const API_BASE_URL = import.meta.env.VITE_API_URL || (isProduction ? '' : 'http://localhost:5176');
