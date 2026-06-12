import { ChevronLeft } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex items-center bg-white border-b border-gray-100 px-8 py-4 w-full h-20 sticky top-0 z-50">
      <div className="flex items-center justify-center gap-4 w-full max-w-6xl mx-auto">
        <button className="text-gray-500 hover:text-gray-900 transition-colors bg-gray-50 p-2 rounded-full hidden">
          <ChevronLeft size={20} />
        </button>
        <img 
          src="https://preview.saega.com.br/version_2_final/assets/logotipo-so-CgB1U75J.png" 
          alt="Saega" 
          className="h-8" 
          referrerPolicy="no-referrer" 
        />
        <div className="h-6 w-px bg-gray-200 ml-2"></div>
        <h1 className="text-xl font-bold text-gray-800">Formulador de Dietas</h1>
      </div>
    </header>
  );
}
