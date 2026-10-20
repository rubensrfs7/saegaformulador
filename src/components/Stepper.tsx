import { Check, FlaskConical, FileText } from 'lucide-react';
import CowIcon from './icons/CowIcon';
import { Step } from '../types';

interface StepperProps {
  currentStep: Step;
  onStepClick?: (step: Step) => void;
}

export default function Stepper({ currentStep, onStepClick }: StepperProps) {
  const steps: { label: string; shortLabel: string; step: Step; Icon: any }[] = [
    { label: 'PERFIL DO ANIMAL', shortLabel: 'PERFIL', step: 1, Icon: CowIcon },
    { label: 'CONC. E VOL. ATUAL', shortLabel: 'ATUAL', step: 2, Icon: FlaskConical },
    { label: 'DIETA ATUAL', shortLabel: 'RESUMO ATUAL', step: 3, Icon: FlaskConical },
    { label: 'CONC. E VOL. AJUSTADO', shortLabel: 'AJUSTE', step: 4, Icon: FlaskConical },
    { label: 'DIETA AJUSTADA', shortLabel: 'RESUMO FINAL', step: 5, Icon: FlaskConical },
    { label: 'RELATÓRIO', shortLabel: 'RELATÓRIO', step: 6, Icon: FileText },
  ];

  return (
    <div className="w-full relative px-2 sm:px-6 mb-8">
      {/* Background track line */}
      <div className="hidden sm:block absolute left-[6%] right-[6%] top-6 h-[2px] bg-gray-200 -z-10"></div>
      
      {/* Progress Line */}
      <div 
        className="hidden sm:block absolute left-[6%] top-6 h-[2px] bg-blue-700 -z-10 transition-all duration-300"
        style={{ width: `${((currentStep - 1) / 5) * 88}%` }}
      ></div>

      <div className="grid grid-cols-6 gap-1 sm:gap-2">
        {steps.map((s) => {
          const isActive = currentStep === s.step;
          const isCompleted = currentStep > s.step;
          const isClickable = onStepClick && (isCompleted || s.step <= currentStep);

          return (
            <button
              key={s.step}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick && onStepClick(s.step)}
              className={`flex flex-col items-center gap-2 group transition-all focus:outline-none ${
                isClickable ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <div 
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border-2 transition-all shadow-sm relative
                  ${isCompleted ? 'bg-blue-700 border-blue-700 text-white' : 
                    isActive ? 'bg-blue-700 border-blue-700 text-white ring-4 ring-blue-100' : 
                    'bg-white border-gray-200 text-gray-400 group-hover:border-gray-300'}
                `}
              >
                <s.Icon size={18} />
                {isCompleted && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-xs">
                    <Check size={10} className="text-white stroke-[3]" />
                  </div>
                )}
              </div>
              <span className={`text-[10px] sm:text-[11px] font-bold tracking-tight text-center leading-tight transition-colors ${
                isActive ? 'text-blue-800' : isCompleted ? 'text-blue-700' : 'text-gray-400'
              }`}>
                <span className="hidden md:inline">{s.label}</span>
                <span className="md:hidden">{s.shortLabel}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
