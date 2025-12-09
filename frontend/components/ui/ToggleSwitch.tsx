import React from 'react';
import { cn } from '../../utils/cn';

interface ToggleSwitchProps {
  labelLeft: string;
  labelRight: string;
  checked: boolean; // false = left, true = right
  onChange: (checked: boolean) => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ 
  labelLeft, 
  labelRight, 
  checked, 
  onChange 
}) => {
  return (
    <div className="flex items-center gap-3 bg-slate-900/80 p-1.5 rounded-lg border border-slate-700 w-fit">
      <button
        onClick={() => onChange(false)}
        className={cn(
          "px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
          !checked 
            ? "bg-slate-700 text-white shadow-sm" 
            : "text-slate-400 hover:text-slate-200"
        )}
      >
        {labelLeft}
      </button>
      
      <div 
        className={cn(
          "w-8 h-4 rounded-full relative cursor-pointer transition-colors duration-300",
          checked ? "bg-magenta-600" : "bg-slate-600"
        )}
        onClick={() => onChange(!checked)}
      >
        <div 
          className={cn(
            "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 shadow-sm",
            checked ? "left-[18px]" : "left-0.5"
          )} 
        />
      </div>

      <button
        onClick={() => onChange(true)}
        className={cn(
          "px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
          checked 
            ? "bg-magenta-600 text-white shadow-sm shadow-magenta-900/20" 
            : "text-slate-400 hover:text-slate-200"
        )}
      >
        {labelRight}
      </button>
    </div>
  );
};