import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { login } from '../services/auth';
import { UserSession } from '../types';

interface LoginPageProps {
  onLogin: (session: UserSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Basic Input Sanitization
  const sanitizeInput = (input: string) => {
    return input.replace(/[<>&'"]/g, "").trim(); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanUser = sanitizeInput(username);
    const cleanPass = sanitizeInput(password);

    if (!cleanUser || !cleanPass) {
      setError('Por favor complete todos los campos.');
      setLoading(false);
      return;
    }

    if (cleanPass.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        setLoading(false);
        return;
    }

    try {
      const session = await login(cleanUser, cleanPass);
      onLogin(session);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-magenta-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-magenta-600 to-purple-600 shadow-lg shadow-magenta-900/50 mb-4">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Acceso Seguro</h1>
            <p className="text-slate-400 text-sm">Ingrese sus credenciales para ver sus métricas.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-10 w-5 h-5 text-slate-500" />
                <Input 
                  label="Usuario / ID Estudiante" 
                  placeholder="ej. estudiante01"
                  className="pl-10"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <Lock className="absolute left-3 top-10 w-5 h-5 text-slate-500" />
                <Input 
                  label="Contraseña" 
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={loading}>
              Ingresar al Sistema
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-600">
            <p>Protegido por MagentaSecurity™ v2.0</p>
            <p>Conexión encriptada de extremo a extremo.</p>
          </div>
        </div>
      </div>
    </div>
  );
};