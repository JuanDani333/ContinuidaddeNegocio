
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDashboardData } from '../services/dashboard';
import { ExperienceRadar } from '../components/ExperienceRadar';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/ui/Pagination';
import { ToggleSwitch } from '../components/ui/ToggleSwitch';
import { Search, ArrowLeft, Hash, User, Loader2, FileSpreadsheet } from 'lucide-react';
import { ChartDataPoint, SceneDefinition, UserAssessment, AreaData } from '../types';

const USERS_PER_PAGE = 9;

export const AreaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [viewMode, setViewMode] = useState<'score' | 'attempts'>('attempts');
  const [areaData, setAreaData] = useState<AreaData | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchDashboardData();
        const area = data.find(a => a.id === id);
        setAreaData(area);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // 2. Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!areaData) return [];
    if (!searchTerm) return areaData.assessments;

    const lowerTerm = searchTerm.toLowerCase();
    return areaData.assessments.filter(user => 
      user.name.toLowerCase().includes(lowerTerm) || 
      user.id.toLowerCase().includes(lowerTerm)
    );
  }, [areaData, searchTerm]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 3. Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const handlePageChange = (page: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage(page);
      setIsTransitioning(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  };

  const getUserChartData = (user: UserAssessment, sceneConfig: SceneDefinition[]): ChartDataPoint[] => {
    return sceneConfig.map(config => {
      // Logic: Find score by Scene ID to be robust
      const scoreItem = user.scores.find(s => s.sceneId === config.id);
      return {
        scene: config.short,
        value: scoreItem ? scoreItem.value : 0,
        fullMark: 100,
        fullLabel: config.full,
        attempt: scoreItem ? scoreItem.attempt : 0 // Pass exact attempt count
      };
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-magenta-500" />
      </div>
    );
  }

  if (!areaData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl text-slate-400">Equipo no encontrado</h2>
        <Button variant="ghost" onClick={() => navigate('/')} className="mt-4">
          Volver al Inicio
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-end border-b border-slate-800 pb-6">
        <div className="flex-1">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')} 
            className="mb-2 pl-0 hover:pl-2 transition-all text-magenta-400 hover:text-magenta-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-white mb-2">{areaData.title}</h1>
        </div>
        
        {/* Controls: Toggle & Search */}
        <div className="flex flex-col md:flex-row gap-4 items-end md:items-center w-full xl:w-auto">
          <div className="flex flex-col items-end gap-1">
             <span className="text-[10px] text-slate-500 uppercase font-semibold">Visualización</span>
             <ToggleSwitch 
                labelLeft="Intentos"
                labelRight="Puntuación"
                checked={viewMode === 'score'}
                onChange={(checked) => setViewMode(checked ? 'score' : 'attempts')}
             />
          </div>

          <div className="w-full md:w-80 relative">
            <Search className="absolute left-3 top-10 w-5 h-5 text-slate-500 z-10" />
            <Input 
              label="Buscar usuario"
              placeholder="Nombre o ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
        <div className="bg-slate-900 px-3 py-1 rounded border border-slate-800">
          Total Usuarios: <span className="text-slate-200 font-mono">{areaData.assessments.length}</span>
        </div>
        <div className="bg-slate-900 px-3 py-1 rounded border border-slate-800">
          Resultados: <span className="text-magenta-400 font-mono">{filteredUsers.length}</span>
        </div>

        <div className="h-6 w-px bg-slate-800 mx-2 hidden md:block"></div>

        <Button 
          variant="ghost" 
          className="text-slate-400 hover:text-green-400 transition-colors border border-slate-800 hover:border-green-500/50 h-[30px] text-xs"
          onClick={() => window.location.href = `http://localhost:5176/api/reports/export?courseId=${id}`}
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Descargar Reporte del Curso
        </Button>
      </div>

      {/* Users Grid */}
      {isTransitioning ? (
         <div className="h-[400px] flex flex-col items-center justify-center text-slate-500">
             <Loader2 className="w-10 h-10 animate-spin mb-4 text-magenta-500" />
             <p>Cargando datos...</p>
         </div>
      ) : filteredUsers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedUsers.map((user) => {
              const userChartData = getUserChartData(user, areaData.scenes);
              const averagePX = Math.round(userChartData.reduce((acc, c) => acc + c.value, 0) / userChartData.length);
              const totalAttempts = userChartData.reduce((acc, c) => acc + c.attempt, 0);
              const averageAttempts = totalAttempts / (userChartData.length || 1);
              const roundedAttempts = Math.round(averageAttempts);
              const competenceScore = (averagePX / 10).toFixed(1);

              return (
                <div 
                  key={user.id} 
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-magenta-500/30 transition-all duration-300 flex flex-col"
                >
                  {/* User Header */}
                  <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-start justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-slate-300 font-bold border border-slate-600 flex-shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-slate-100 font-medium truncate flex items-center gap-2">
                          {user.name}
                        </h3>
                        <p className="text-xs text-slate-500 truncate flex items-center gap-1" title={user.id}>
                          <Hash className="w-3 h-3" />
                          {user.id}
                        </p>
                      </div>
                    </div>
                    {/* Dynamic Score Display based on viewMode */}
                    <div className="flex flex-col items-end">
                       {viewMode === 'score' ? (
                         <>
                           <div className={`text-lg font-bold font-mono ${averagePX >= 80 ? 'text-green-400' : averagePX >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {competenceScore}
                           </div>
                           <span className="text-[10px] text-slate-500">/ 10</span>
                         </>
                       ) : (
                         <div className={`text-sm font-bold mt-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 ${
                           totalAttempts === 0 ? 'text-slate-400' :
                           roundedAttempts === 1 ? 'text-emerald-400' : 
                           roundedAttempts === 2 ? 'text-lime-400' : 
                           roundedAttempts === 3 ? 'text-yellow-400' : 'text-red-400'
                         }`}>
                            {totalAttempts === 0 ? 'Sin Intentos' :
                             `${roundedAttempts}º Intento`}
                         </div>
                       )}
                    </div>
                  </div>

                  {/* Individual Chart */}
                  <div className="p-4 h-[280px] w-full bg-slate-950/30">
                    <ExperienceRadar 
                      data={userChartData} 
                      color="#D01971" 
                      viewMode={viewMode}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
          <User className="w-12 h-12 mb-4 opacity-50" />
          <p>No se encontraron usuarios que coincidan con su búsqueda.</p>
        </div>
      )}
    </div>
  );
};