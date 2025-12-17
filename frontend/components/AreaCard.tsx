import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExperienceRadar } from './ExperienceRadar';
import { Users, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';
import { AreaData, UserAssessment, SceneDefinition, ChartDataPoint } from '../types';

interface AreaCardProps {
  area: AreaData;
  viewMode: 'score' | 'attempts';
}

export const AreaCard: React.FC<AreaCardProps> = ({ area, viewMode }) => {
  const navigate = useNavigate();
  const totalUsers = area.assessments.length;

  // Function to process raw user assessments into averaged chart data
  const processAverageData = (assessments: UserAssessment[], sceneConfig: SceneDefinition[]): ChartDataPoint[] => {
    if (assessments.length === 0) return [];

    // Initialize totals map
    const pxTotals: Record<string, number> = {};
    const attemptTotals: Record<string, number> = {};
    const timeTotals: Record<string, number> = {}; // NEW: Time totals

    // Sort sceneConfig if needed based on area.id
    let sortedConfig = [...sceneConfig]; // Clone to avoid mutation

    if (area.id === 'team-eac') {
        const eacOrder = ['eac_1_combined', 'eac_3', 'eac_5', 'eac_4', 'eac_6'];
        sortedConfig.sort((a, b) => {
             const indexA = eacOrder.indexOf(a.id);
             const indexB = eacOrder.indexOf(b.id);
             return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        });
    } else if (area.id === 'team-ecc') {
         const eccOrderKeywords = [
             "Dirección de personas", 
             "Inteligencia emocional",
             "Resolución de problemas",
             "Orientación al logro",
             "Conocimiento de la norma"
           ];
         sortedConfig.sort((a, b) => {
             const nameA = a.full || "";
             const nameB = b.full || "";
             const indexA = eccOrderKeywords.findIndex(k => nameA.includes(k));
             const indexB = eccOrderKeywords.findIndex(k => nameB.includes(k));
             return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
         });
    } else if (area.id === 'team-ere') {
         const ereOrderKeywords = [
             "Dirección de personas", 
             "Liderazgo",
             "Inteligencia emocional",
             "Resolución de problemas",
             "Orientación al logro",
             "Conocimiento de la norma"
           ];
         sortedConfig.sort((a, b) => {
             const nameA = a.full || "";
             const nameB = b.full || "";
             const indexA = ereOrderKeywords.findIndex(k => nameA.includes(k));
             const indexB = ereOrderKeywords.findIndex(k => nameB.includes(k));
             return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
         });
    }

    const sceneOrder = sortedConfig.map(s => s.short);

    // 1. ITERATE through all users to sum up their specific results
    assessments.forEach(user => {
      user.scores.forEach(score => {
        // Accumulate PX Value (for chart radius)
        pxTotals[score.scene] = (pxTotals[score.scene] || 0) + score.value;
        // Accumulate Actual Attempts (for tooltip precision)
        attemptTotals[score.scene] = (attemptTotals[score.scene] || 0) + score.attempt;
        // Accumulate Time (for tooltip)
        if (score.time) {
           timeTotals[score.scene] = (timeTotals[score.scene] || 0) + score.time;
        }
      });
    });

    // 2. CALCULATE ARITHMETIC MEANS
    return sceneOrder.map(sceneShortLabel => {
      const config = sceneConfig.find(c => c.short === sceneShortLabel);
      
      // Average PX (0-100 scale)
      const averagePxValue = (pxTotals[sceneShortLabel] || 0) / assessments.length;
      
      // Average Attempts (e.g., 1.8, 2.4)
      const averageAttempts = (attemptTotals[sceneShortLabel] || 0) / assessments.length;

      // Average Time
      const averageTime = (timeTotals[sceneShortLabel] || 0) / assessments.length;

      return {
        scene: sceneShortLabel,
        value: Math.round(averagePxValue), // Chart needs integer for radius
        fullMark: 100,
        fullLabel: config?.full || sceneShortLabel,
        attempt: Number(averageAttempts.toFixed(1)), // Float precision for tooltip
        time: Math.round(averageTime) // Round to nearest second
      };
    });
  };

  const averagedData = useMemo(() => processAverageData(area.assessments, area.scenes), [area.assessments, area.scenes]);

  // Calculate Global Metrics for the Card Summary
  const overallAveragePX = averagedData.reduce((acc, curr) => acc + curr.value, 0) / (averagedData.length || 1);
  const overallAverageAttempts = averagedData.reduce((acc, curr) => acc + (curr.attempt || 0), 0) / (averagedData.length || 1);
  
  const overallCompetence = (overallAveragePX / 10).toFixed(1);

  return (
    <div 
      className="group bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-magenta-500/50 transition-colors duration-300 relative overflow-hidden flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex-1 mr-2">
          <h3 className="text-lg font-semibold text-magenta-100 group-hover:text-magenta-400 transition-colors">
            {area.title}
          </h3>
        </div>
        <div className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded text-xs text-slate-400 border border-slate-700 h-fit">
          <Users className="w-3 h-3" />
          <span>{totalUsers}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative z-10 flex-1 min-h-[250px] mb-4">
        <ExperienceRadar 
          data={averagedData} 
          viewMode={viewMode}
        />
      </div>

      {/* Summary Stat */}
      <div className="mt-auto pt-4 border-t border-slate-800 relative z-10 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Promedio Global</span>
                <span className="text-xs text-slate-400">
                  {viewMode === 'score' ? 'Nivel Competencia' : 'Media de Intentos'}
                </span>
            </div>
            <div className="text-right">
              {viewMode === 'score' ? (
                <>
                  <span className={`text-2xl font-bold font-mono ${overallAveragePX >= 80 ? 'text-green-400' : overallAveragePX >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {overallCompetence}
                  </span>
                  <span className="text-sm text-slate-500 font-mono">/10</span>
                </>
              ) : (
                <span className={`text-lg font-bold ${overallAverageAttempts <= 1.5 ? 'text-emerald-400' : overallAverageAttempts <= 2.5 ? 'text-lime-400' : 'text-yellow-400'}`}>
                    ~{overallAverageAttempts.toFixed(1)} Intentos
                </span>
              )}
            </div>
          </div>

          <Button 
            className="w-full text-sm" 
            variant="secondary"
            onClick={() => navigate(`/area/${area.id}`)}
          >
            Ver Detalles del Equipo
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
      </div>

        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-magenta-600/10 rounded-full blur-3xl group-hover:bg-magenta-600/20 transition-all duration-500 pointer-events-none" />
    </div>
  );
};
