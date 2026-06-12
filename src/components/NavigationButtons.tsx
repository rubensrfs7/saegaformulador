import { ChevronLeft } from 'lucide-react';

interface Props {
  onNext?: () => void;
  onPrev?: () => void;
  nextLabel?: string;
  isLast?: boolean;
}

export default function NavigationButtons({ onNext, onPrev, nextLabel = 'Avançar', isLast }: Props) {
  return (
    <div className="flex justify-between items-center mt-6 pt-6 mb-8 w-full">
      {onPrev ? (
        <button 
          onClick={onPrev}
          className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 bg-white rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ChevronLeft size={18} />
          Voltar
        </button>
      ) : <div />}
      
      {onNext && !isLast && (
        <button 
          onClick={onNext}
          className="flex items-center gap-2 bg-blue-700 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-blue-800 transition-colors shadow-sm"
        >
          {nextLabel}
        </button>
      )}
      {onNext && isLast && (
        <button 
          onClick={onNext}
          className="flex items-center gap-2 bg-green-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
        >
          Finalizar
        </button>
      )}
    </div>
  );
}
