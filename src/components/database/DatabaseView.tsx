import { useState, useMemo } from 'react';
import { 
  Database, 
  Search, 
  Info, 
  ArrowRight, 
  X, 
  Wheat
} from 'lucide-react';
import { CONSUMPTION_TARGETS, MOCK_INGREDIENTS } from '../../data';
import { ConsumptionTarget } from '../../types';

interface DatabaseViewProps {
  onSelectTargetForFormulation?: (target: ConsumptionTarget) => void;
  onBackToFormulator?: () => void;
  initialTab?: 'cms' | 'insumos' | 'minerais';
}

export default function DatabaseView({
  onSelectTargetForFormulation,
  onBackToFormulator,
  initialTab = 'cms'
}: DatabaseViewProps) {
  const [activeTab, setActiveTab] = useState<'cms' | 'insumos' | 'minerais'>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('TODAS');
  const [inspectingTarget, setInspectingTarget] = useState<ConsumptionTarget | null>(null);
  const [inspectingIngredient, setInspectingIngredient] = useState<any | null>(null);

  // Grouped counts
  const cmsCount = CONSUMPTION_TARGETS.length; // 18
  const mineraisCount = MOCK_INGREDIENTS.filter(i => i.type === 'Mineral').length;
  const insumosCount = MOCK_INGREDIENTS.filter(i => i.type !== 'Mineral').length;

  // Unique categories for filtering
  const categories = useMemo(() => {
    return Array.from(new Set(CONSUMPTION_TARGETS.map(t => t.category)));
  }, []);

  // Filtered targets
  const filteredTargets = useMemo(() => {
    return CONSUMPTION_TARGETS.filter(t => {
      const matchCategory = selectedCategoryFilter === 'TODAS' || t.category === selectedCategoryFilter;
      const term = searchTerm.toLowerCase().trim();
      const matchSearch = !term || 
        t.category.toLowerCase().includes(term) || 
        t.subcategory.toLowerCase().includes(term);
      return matchCategory && matchSearch;
    });
  }, [searchTerm, selectedCategoryFilter]);

  // Filtered ingredients
  const filteredIngredients = useMemo(() => {
    const list = activeTab === 'minerais' 
      ? MOCK_INGREDIENTS.filter(i => i.type === 'Mineral')
      : MOCK_INGREDIENTS.filter(i => i.type !== 'Mineral');

    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase().trim();
    return list.filter(i => 
      i.name.toLowerCase().includes(term) || 
      i.type.toLowerCase().includes(term)
    );
  }, [activeTab, searchTerm]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2">
            <Database size={14} /> Banco de Dados Nutricional
          </div>
          <h2 className="text-2xl font-black text-gray-800">Tabelas de Referência Nutricional</h2>
        </div>

        {onBackToFormulator && (
          <button
            type="button"
            onClick={onBackToFormulator}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold transition shadow-xs cursor-pointer text-xs sm:text-sm shrink-0"
          >
            Voltar ao Formulador
            <ArrowRight size={16} />
          </button>
        )}
      </div>

      {/* Main Database Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="flex border-b border-gray-200 px-6 pt-4 gap-8 bg-gray-50/50 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('cms')}
            className={`pb-4 px-1 text-sm font-bold flex items-center gap-2 relative transition cursor-pointer whitespace-nowrap ${
              activeTab === 'cms' ? 'text-blue-700 font-black' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>Consumo de Matéria Seca</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === 'cms' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'}`}>{cmsCount}</span>
            {activeTab === 'cms' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-700 rounded-full" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('insumos')}
            className={`pb-4 px-1 text-sm font-bold flex items-center gap-2 relative transition cursor-pointer whitespace-nowrap ${
              activeTab === 'insumos' ? 'text-blue-700 font-black' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>Insumos</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === 'insumos' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'}`}>{insumosCount}</span>
            {activeTab === 'insumos' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-700 rounded-full" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('minerais')}
            className={`pb-4 px-1 text-sm font-bold flex items-center gap-2 relative transition cursor-pointer whitespace-nowrap ${
              activeTab === 'minerais' ? 'text-blue-700 font-black' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>Minerais e Núcleos</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === 'minerais' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'}`}>{mineraisCount}</span>
            {activeTab === 'minerais' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-700 rounded-full" />}
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-5 border-b border-gray-100 bg-white flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar..."
              className="w-full pl-9 pr-8 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-gray-50/50 transition"
            />
          </div>
          {activeTab === 'cms' && (
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-xl px-3 py-2 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-700 cursor-pointer"
            >
              <option value="TODAS">Todas as Categorias</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>

        {/* CMS TAB */}
        {activeTab === 'cms' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">CATEGORIA</th>
                  <th className="py-3 px-4">SUBCATEGORIA</th>
                  <th className="py-3 px-3 text-right">PV REF (KG)</th>
                  <th className="py-3 px-3 text-right">% PV EM MS</th>
                  <th className="py-3 px-3 text-right">CONS. MS (KG/D)</th>
                  <th className="py-3 px-3 text-right">VOL. (%)</th>
                  <th className="py-3 px-3 text-right">CONC. (%)</th>
                  <th className="py-3 px-3 text-right">PB TMR (G)</th>
                  <th className="py-3 px-3 text-right">NDT TMR (G)</th>
                  <th className="py-3 px-3 text-right">FDN TMR (G)</th>
                  <th className="py-3 px-3 text-right">AMIDO (%)</th>
                  <th className="py-3 px-3 text-center">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredTargets.map((item, idx) => (
                  <tr 
                    key={`${item.category}-${item.subcategory}-${idx}`}
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    onClick={() => setInspectingTarget(item)}
                  >
                    <td className="py-3 px-4 font-semibold text-gray-900">{item.category}</td>
                    <td className="py-3 px-4 text-gray-700 font-medium">{item.subcategory}</td>
                    <td className="py-3 px-3 text-right">{item.pvReferencia}</td>
                    <td className="py-3 px-3 text-right">{item.percentPvMs.toFixed(2)}%</td>
                    <td className="py-3 px-3 text-right font-bold text-blue-900">{item.consumoMs}</td>
                    <td className="py-3 px-3 text-right">{item.volumosoPercent}%</td>
                    <td className="py-3 px-3 text-right">{item.concentradoPercent}%</td>
                    <td className="py-3 px-3 text-right">{item.pbTmr}</td>
                    <td className="py-3 px-3 text-right">{item.ndtTmr}</td>
                    <td className="py-3 px-3 text-right">{item.fdnTmr}</td>
                    <td className="py-3 px-3 text-right">{item.amidoPercent}%</td>
                    <td className="py-3 px-3 text-center">
                      <button type="button" onClick={(e) => { e.stopPropagation(); setInspectingTarget(item); }} className="text-gray-400 hover:text-blue-700"><Info size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* INSUMOS TAB */}
        {activeTab === 'insumos' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-bold text-gray-500 uppercase">
                  <th className="py-3 px-4">INSUMO</th>
                  <th className="py-3 px-4">TIPO</th>
                  <th className="py-3 px-3 text-right">PB (G)</th>
                  <th className="py-3 px-3 text-right">NDT (G)</th>
                  <th className="py-3 px-3 text-right">FDN (G)</th>
                  <th className="py-3 px-3 text-right">MS (G)</th>
                  <th className="py-3 px-3 text-right">MS (%)</th>
                  <th className="py-3 px-3 text-right">MN/KG MS (G)</th>
                  <th className="py-3 px-3 text-right">AMIDO (G)</th>
                  <th className="py-3 px-3 text-right">CA (G)</th>
                  <th className="py-3 px-3 text-right">P (G)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredIngredients.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/60">
                    <td className="py-3 px-4">{item.name}</td>
                    <td className="py-3 px-4">{item.type}</td>
                    <td className="py-3 px-3 text-right">{item.pb}</td>
                    <td className="py-3 px-3 text-right">{item.ndt}</td>
                    <td className="py-3 px-3 text-right">{item.fdn}</td>
                    <td className="py-3 px-3 text-right">{item.msPercent * 10}</td>
                    <td className="py-3 px-3 text-right">{item.msPercent}%</td>
                    <td className="py-3 px-3 text-right">{(1000 / (item.msPercent / 100)).toFixed(0)}</td>
                    <td className="py-3 px-3 text-right">{item.amido}</td>
                    <td className="py-3 px-3 text-right">{item.calcio}</td>
                    <td className="py-3 px-3 text-right">{item.fosforo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MINERAIS TAB */}
        {activeTab === 'minerais' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-bold text-gray-500 uppercase">
                  <th className="py-3 px-4">MINERAL</th>
                  <th className="py-3 px-3 text-right">MAT. MIN (G)</th>
                  <th className="py-3 px-3 text-right">CA (G)</th>
                  <th className="py-3 px-3 text-right">P (G)</th>
                  <th className="py-3 px-3 text-right">MG (G)</th>
                  <th className="py-3 px-3 text-right">S (G)</th>
                  <th className="py-3 px-3 text-right">K (G)</th>
                  <th className="py-3 px-3 text-right">NA (G)</th>
                  <th className="py-3 px-3 text-right">CL (G)</th>
                  <th className="py-3 px-3 text-right">CU (MG)</th>
                  <th className="py-3 px-3 text-center">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredIngredients.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-gray-900">{item.name}</td>
                    <td className="py-3 px-3 text-right">{item.matMineral || '-'}</td>
                    <td className="py-3 px-3 text-right">{item.calcio || '-'}</td>
                    <td className="py-3 px-3 text-right">{item.fosforo || '-'}</td>
                    <td className="py-3 px-3 text-right">{item.mg || '-'}</td>
                    <td className="py-3 px-3 text-right">{item.s || '-'}</td>
                    <td className="py-3 px-3 text-right">{item.k || '-'}</td>
                    <td className="py-3 px-3 text-right">{item.na || '-'}</td>
                    <td className="py-3 px-3 text-right">{item.cl || '-'}</td>
                    <td className="py-3 px-3 text-right">{item.cu || '-'}</td>
                    <td className="py-3 px-3 text-center">
                      <button onClick={() => setInspectingIngredient(item)} className="text-gray-400 hover:text-blue-700"><Info size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ingredient Details Modal */}
      {inspectingIngredient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="font-black text-lg mb-4">{inspectingIngredient.name}</h3>
            <div className="text-xs grid grid-cols-2 gap-y-2 gap-x-4">
              <span className="font-bold text-gray-500">Mat. Min:</span> <span>{inspectingIngredient.matMineral || '-'} g</span>
              <span className="font-bold text-gray-500">Cálcio:</span> <span>{inspectingIngredient.calcio || '-'} g</span>
              <span className="font-bold text-gray-500">Fósforo:</span> <span>{inspectingIngredient.fosforo || '-'} g</span>
              <span className="font-bold text-gray-500">Magnésio:</span> <span>{inspectingIngredient.mg || '-'} g</span>
              <span className="font-bold text-gray-500">Enxofre:</span> <span>{inspectingIngredient.s || '-'} g</span>
              <span className="font-bold text-gray-500">Potássio:</span> <span>{inspectingIngredient.k || '-'} g</span>
              <span className="font-bold text-gray-500">Sódio:</span> <span>{inspectingIngredient.na || '-'} g</span>
              <span className="font-bold text-gray-500">Cloro:</span> <span>{inspectingIngredient.cl || '-'} g</span>
              <span className="font-bold text-gray-500">Cobre:</span> <span>{inspectingIngredient.cu || '-'} mg</span>
            </div>
            <button onClick={() => setInspectingIngredient(null)} className="w-full mt-6 py-2 rounded-xl text-xs font-bold bg-gray-200">Fechar</button>
          </div>
        </div>
      )}

      {/* Target Details Modal */}
      {inspectingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="font-black text-lg mb-4">{inspectingTarget.subcategory}</h3>
            <p className="text-xs text-gray-600">Categoria: {inspectingTarget.category}</p>
            <div className="mt-4 text-xs">
              <p>PV Ref: {inspectingTarget.pvReferencia} kg</p>
              <p>Consumo MS: {inspectingTarget.consumoMs} kg/dia</p>
            </div>
            <button onClick={() => setInspectingTarget(null)} className="w-full mt-6 py-2 rounded-xl text-xs font-bold bg-gray-200">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
