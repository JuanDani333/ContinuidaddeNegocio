import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardData } from '../services/dashboard';
import { Loader2, FileSpreadsheet } from 'lucide-react';
import { AreaData } from '../types';
import { ToggleSwitch } from '../components/ui/ToggleSwitch';
import { AreaCard } from '../components/AreaCard';
import { Layout } from '../components/Layout';
import { API_BASE_URL } from '../config';
import { Button } from '../components/ui/Button';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'score' | 'attempts'>('attempts');
  const [areas, setAreas] = useState<AreaData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchDashboardData();
        setAreas(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDownloadReport = () => {
    window.location.href = `${API_BASE_URL}/api/reports/export`;
  };
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <header className="mb-8 border-b border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Panel de Métricas Grupales</h1>
          <p className="text-slate-400 max-w-2xl">
            Visualización de promedios de rendimiento del grupo basada en intentos.
          </p>
        </div>
        
        <div className="flex flex-col-reverse md:flex-row items-stretch md:items-end gap-4 md:gap-6 w-full md:w-auto transition-all">
          {/* Download Button */}
          <Button 
            variant="ghost" 
            className="w-full md:w-auto justify-center text-slate-400 hover:text-green-400 transition-colors border border-slate-700 hover:border-green-500/50"
            onClick={handleDownloadReport}
          >
            <FileSpreadsheet className="w-5 h-5 mr-2" />
            Descargar Reportes Globales
          </Button>

          {/* Toggle Switch */}
          <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto">
             <span className="text-xs text-slate-500 uppercase font-semibold">Modo de Vista</span>
             <ToggleSwitch 
                labelLeft="Intentos"
                labelRight="Puntuación"
                checked={viewMode === 'score'}
                onChange={(checked) => setViewMode(checked ? 'score' : 'attempts')}
             />
          </div>
        </div>
      </header>

      {/* Grid Layout for Charts */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-magenta-500" />
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {areas.map((area) => (
          <AreaCard key={area.id} area={area} viewMode={viewMode} />
        ))}
      </div>
      )}
    </div>
  );
};