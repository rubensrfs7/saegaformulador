import { ChevronLeft, Database, Sparkles, FlaskConical } from 'lucide-react';
import CowIcon from './icons/CowIcon';

interface HeaderProps {
  activeView?: 'formulator' | 'database';
  onSelectView?: (view: 'formulator' | 'database') => void;
}

export default function Header({ activeView = 'formulator', onSelectView }: HeaderProps) {
  return (
    <header className="flex items-center bg-white border-b border-gray-100 px-4 sm:px-8 py-3.5 w-full h-20 sticky top-0 z-50 shadow-2xs">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <img 
            src="https://app.saega.com.br/assets/logotipo-so-CgB1U75J.png" 
            alt="Saega" 
            className="h-7 sm:h-8" 
          />
          <div className="h-5 w-px bg-gray-200"></div>
          <span className="text-base sm:text-lg font-black text-gray-800 tracking-tight">
            Nutrição de Precisão
          </span>
        </div>

        {/* Navigation Switch between Formulator and Database */}
        {onSelectView && (
          <div className="flex items-center bg-gray-100/80 p-1 rounded-xl border border-gray-200/70 text-xs font-bold">
            <button
              type="button"
              onClick={() => onSelectView('formulator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeView === 'formulator'
                  ? 'bg-white text-blue-700 shadow-xs font-black'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FlaskConical size={14} />
              <span>Formulador de Dietas</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectView('database')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeView === 'database'
                  ? 'bg-white text-blue-700 shadow-xs font-black'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Database size={14} />
              <span>Banco de Dados</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeView === 'database' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'
              }`}>
                18
              </span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
