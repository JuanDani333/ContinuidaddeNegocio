
import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { ChartDataPoint } from '../types';
import { cn } from '../utils/cn';

interface ExperienceRadarProps {
  data: ChartDataPoint[];
  color?: string;
  viewMode: 'score' | 'attempts'; // New prop to control visualization logic
}

// Logic to map PX (0-100) to Attempts/Competence
const getMetrics = (pxValue: number, exactAttempt?: number) => {
  // 1. EXACT INTEGER MATCH (Individual User View)
  if (exactAttempt !== undefined && Number.isInteger(exactAttempt)) {
      if (exactAttempt === 1) return { label: "1er Intento", score: "10", color: "text-emerald-400" };
      if (exactAttempt === 2) return { label: "2do Intento", score: "8", color: "text-lime-400" };
      if (exactAttempt === 3) return { label: "3er Intento", score: "6", color: "text-yellow-400" };
      if (exactAttempt === 4) return { label: "4to Intento", score: "4", color: "text-orange-400" };
      if (exactAttempt === 5) return { label: "5to Intento", score: "2", color: "text-red-400" };
      return { label: `${exactAttempt}º Intento`, score: "0", color: "text-red-600" };
  }

  // 2. DECIMAL MATCH (Group Average View)
  // If exactAttempt is a float (e.g. 1.8), we format it differently
  if (exactAttempt !== undefined) {
      const val = exactAttempt;
      let color = "text-red-400";
      if (val <= 1.3) color = "text-emerald-400";       // Close to perfect
      else if (val <= 2.5) color = "text-lime-400";     // Good (1 to 2 attempts)
      else if (val <= 3.5) color = "text-yellow-400";   // Average (3 attempts)
      else if (val <= 4.5) color = "text-orange-400";   // Struggling
      
      return { 
          label: `Promedio: ${val.toFixed(1)}`, 
          score: (pxValue / 10).toFixed(1), 
          color 
      };
  }

  // Fallback if no attempt data
  return { label: "N/A", score: "0", color: "text-slate-400" };
};

const CustomTooltip = ({ active, payload, label, viewMode }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload as ChartDataPoint;
    const pxValue = payload[0].value;
    
    // Pass the exact attempt count (int or float) to metrics logic
    const metrics = getMetrics(pxValue, dataPoint.attempt);
    
    // Format time
    const formatTime = (seconds?: number) => {
      if (!seconds) return "0s";
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    return (
      <div className="bg-slate-950/95 border border-slate-700 p-3 rounded-lg shadow-2xl backdrop-blur-md z-50 min-w-[150px]">
        {/* Title */}
        <p className="text-slate-300 font-medium text-xs mb-1 text-center border-b border-slate-800 pb-1 max-w-[200px] whitespace-normal">
          {dataPoint.fullLabel || dataPoint.scene}
        </p>

        <div className="flex flex-col items-center justify-center pt-1">
          {viewMode === 'score' ? (
            <>
              <span className={cn("text-xl font-bold font-mono", metrics.color)}>
                {metrics.score}/10
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wide">Puntuación</span>
            </>
          ) : (
            <>
              <span className={cn("text-sm font-bold", metrics.color)}>
                {metrics.label}
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                 {Number.isInteger(dataPoint.attempt) ? "Intentos para Aprobar" : "Promedio del Grupo"}
              </span>
            </>
          )}
          
          {/* Time Display */}
          {dataPoint.time !== undefined && (
             <div className="mt-2 pt-2 border-t border-slate-800 w-full flex justify-between items-center text-xs">
                <span className="text-slate-500">Tiempo:</span>
                <span className="text-slate-300 font-mono">{formatTime(dataPoint.time)}</span>
             </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tick Component for wrapping text
const CustomTick = ({ payload, x, y, cx, cy, ...props }: any) => {
  const MAX_CHARS_PER_LINE = 15;
  const lineHeight = 12; // px

  let words = payload.value.split(" ");
  
  // Truncate to 4 words if longer
  if (words.length > 4) {
     words = words.slice(0, 4);
     words[3] += "...";
  }

  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    if (currentLine.length + 1 + words[i].length <= MAX_CHARS_PER_LINE) {
      currentLine += " " + words[i];
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }
  lines.push(currentLine);

  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, index) => (
        <text
          key={index}
          x={0}
          y={index * lineHeight}
          dy={0} // Initial offset
          textAnchor="middle"
          fill="#94a3b8"
          fontSize={10}
          fontWeight={500}
        >
          {line}
        </text>
      ))}
    </g>
  );
};

export const ExperienceRadar: React.FC<ExperienceRadarProps> = ({ 
  data, 
  color = '#D01971',
  viewMode
}) => {
  return (
    <div className="w-full h-full min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#334155" strokeOpacity={0.5} />
          
          <PolarAngleAxis 
            dataKey="fullLabel" 
            tick={(props) => <CustomTick {...props} />}
          />
          
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={false} 
            axisLine={false} 
          />
          
          <Radar
            name={viewMode === 'score' ? "Puntuación" : "Intentos"}
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            fill={color}
            fillOpacity={0.25}
            activeDot={{ r: 4, fill: '#fff', stroke: color }}
          />
          
          <Tooltip 
            content={(props) => <CustomTooltip {...props} viewMode={viewMode} />} 
            cursor={{ stroke: '#ffffff20', strokeWidth: 1 }} 
            wrapperStyle={{ zIndex: 100 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
