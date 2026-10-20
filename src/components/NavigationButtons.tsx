import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import React from 'react';

interface Props {
  onNext?: () => void;
  onPrev?: () => void;
  nextLabel?: string;
  prevLabel?: string;
  isLast?: boolean;
  extraAction?: React.ReactNode;
  onSkipToReport?: () => void;
  skipReportLabel?: string;
}

export default function NavigationButtons({ 
  onNext, 
  onPrev, 
  nextLabel = 'Avançar', 
  prevLabel = 'Voltar',
  isLast,
  extraAction,
  onSkipToReport,
  skipReportLabel = 'Pular para o Relatório'
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 mb-8 w-full">
      <div>
        {onPrev ? (
          <button 
            type="button"
            onClick={onPrev}
            className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 bg-white rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
          >
            <ChevronLeft size={18} />
            {prevLabel}
          </button>
        ) : <div />}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {extraAction}

        {onSkipToReport && (
          <button
            type="button"
            onClick={onSkipToReport}
            className="flex items-center gap-2 px-5 py-2.5 border border-blue-200 bg-blue-50/70 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition-colors shadow-sm cursor-pointer"
          >
            <FileText size={18} />
            {skipReportLabel}
          </button>
        )}
        
        {onNext && !isLast && (
          <button 
            type="button"
            onClick={onNext}
            className="flex items-center gap-2 bg-blue-700 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-blue-800 transition-colors shadow-sm cursor-pointer"
          >
            {nextLabel}
            <ChevronRight size={18} />
          </button>
        )}

        {onNext && isLast && (
          <button 
            type="button"
            onClick={onNext}
            className="flex items-center gap-2 bg-green-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm cursor-pointer"
          >
            Finalizar
          </button>
        )}
      </div>
    </div>
  );
}
