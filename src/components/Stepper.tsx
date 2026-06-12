import { Check, FlaskConical, FileText } from 'lucide-react';
import { Step } from '../types';

export default function Stepper({ currentStep }: { currentStep: Step }) {
  const steps = [
    { label: 'PERFIL DO ANIMAL', step: 1, Icon: FlaskConical },
    { label: 'CONCENTRADO', step: 2, Icon: FlaskConical },
    { label: 'VOLUMOSO', step: 3, Icon: FlaskConical },
    { label: 'DIETA FINAL', step: 4, Icon: FlaskConical },
    { label: 'RELATÓRIO', step: 5, Icon: FileText },
  ];

  return (
    <div className="w-full flex items-center justify-between relative px-2 sm:px-12 mb-8">
      {/* Background Line */}
      <div className="absolute left-[10%] right-[10%] top-6 h-[2px] bg-gray-200 -z-10"></div>
      
      {/* Progress Line */}
      <div 
        className="absolute left-[10%] top-6 h-[2px] bg-blue-700 -z-10 transition-all duration-300"
        style={{ width: `${((currentStep - 1) / 4) * 80}%` }}
      ></div>

      {steps.map((s) => {
        const isActive = currentStep === s.step;
        const isCompleted = currentStep > s.step;

        return (
          <div key={s.step} className="flex flex-col items-center gap-3 bg-gray-50 px-2 relative z-0">
            <div 
              className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors
                ${isCompleted ? 'bg-blue-700 border-blue-700 text-white' : 
                  isActive ? 'bg-blue-700 border-blue-700 text-white' : 
                  'bg-white border-gray-200 text-gray-400'}
              `}
            >
              {isCompleted ? <Check size={24} /> : <s.Icon size={24} />}
            </div>
            <span className={`text-xs font-bold tracking-wider ${isActive || isCompleted ? 'text-blue-700' : 'text-gray-500'}`}>
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
