import { FormulationState } from '../../types';
import { Weight, Users, Calendar, Database, ExternalLink } from 'lucide-react';
import CowIcon from '../icons/CowIcon';
import { CONSUMPTION_TARGETS } from '../../data';

interface Props {
  data: FormulationState;
  updateData: (data: Partial<FormulationState>) => void;
  onOpenDatabase?: () => void;
}

export default function AnimalProfile({ data, updateData, onOpenDatabase }: Props) {
  const categories = Array.from(new Set(CONSUMPTION_TARGETS.map(t => t.category)));
  const subcategories = CONSUMPTION_TARGETS.filter(t => t.category === data.category).map(t => t.subcategory);

  const currentTarget = CONSUMPTION_TARGETS.find(t => t.category === data.category && t.subcategory === data.subcategory);

  const handleCategoryChange = (val: string) => {
    updateData({ category: val, subcategory: '' });
  };

  const handleSubcategoryChange = (val: string) => {
    const target = CONSUMPTION_TARGETS.find(t => t.category === data.category && t.subcategory === val);
    updateData({ 
      subcategory: val, 
      weight: target ? target.pvReferencia : data.weight 
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2">
              <CowIcon size={14} /> Fase 1: Perfil do Animal
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Perfil do Animal</h2>
            <p className="text-gray-500 text-xs mt-0.5">Configure as informações básicas do animal</p>
          </div>

          {onOpenDatabase && (
            <button
              type="button"
              onClick={onOpenDatabase}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 transition cursor-pointer border border-blue-200/80 shadow-2xs shrink-0"
              title="Abrir tabela completa de Consumo de Matéria Seca"
            >
              <Database size={14} />
              <span>Consultar Banco de Dados (18 perfis)</span>
            </button>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nome da Formulação</label>
            <input 
              type="text" 
              placeholder="Ex: Dieta Lactação Verão" 
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              value={data.name}
              onChange={(e) => updateData({ name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria</label>
              <select 
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 appearance-none bg-white"
                value={data.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="" disabled>Selecione a categoria</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Subcategoria</label>
              <select 
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 appearance-none bg-white"
                value={data.subcategory}
                onChange={(e) => handleSubcategoryChange(e.target.value)}
                disabled={!data.category}
              >
                <option value="" disabled>Selecione a subcategoria</option>
                {subcategories.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Peso Vivo (kg)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Weight size={18} />
                </div>
                <input 
                  type="number" 
                  placeholder="Ex: 450" 
                  className="w-full border border-gray-200 rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  value={data.weight}
                  onChange={(e) => updateData({ weight: e.target.value ? Number(e.target.value) : '' })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Quant. Animais</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Users size={18} />
                </div>
                <input 
                  type="number" 
                  className="w-full border border-gray-200 rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  value={data.quantity}
                  onChange={(e) => updateData({ quantity: e.target.value ? Number(e.target.value) : '' })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Quant. Dias</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Calendar size={18} />
                </div>
                <input 
                  type="number" 
                  className="w-full border border-gray-200 rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  value={data.days}
                  onChange={(e) => updateData({ days: e.target.value ? Number(e.target.value) : '' })}
                />
              </div>
            </div>
          </div>
          
          {currentTarget && (
            <div className="mt-8 pt-8 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Metas de Consumo</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-white shadow-sm border border-blue-100">
                  <div className="text-xs font-bold text-blue-700 mb-2">META CMS</div>
                  <div className="text-3xl font-black text-blue-700 mb-4">
                    {(((Number(data.weight) || 0) * (currentTarget.percentPvMs / 100))).toFixed(2).replace(/\.00$/, '')} <span className="text-sm font-semibold">kg/dia</span>
                  </div>
                </div>
                
                <div className="p-6 rounded-2xl bg-[#fff8eb] shadow-sm border border-orange-100">
                  <div className="text-xs font-bold text-orange-600 mb-2">META CONCENTRADO ({currentTarget.concentradoPercent}%)</div>
                  <div className="text-3xl font-black text-orange-600 mb-6">
                    {(((Number(data.weight) || 0) * (currentTarget.percentPvMs / 100) * (currentTarget.concentradoPercent / 100))).toFixed(2).replace(/\.00$/, '')} <span className="text-sm font-semibold">kg MS</span>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-[#ecfdf3] shadow-sm border border-green-100">
                  <div className="text-xs font-bold text-green-700 mb-2">META VOLUMOSO ({currentTarget.volumosoPercent}%)</div>
                  <div className="text-3xl font-black text-green-700 mb-6">
                    {(((Number(data.weight) || 0) * (currentTarget.percentPvMs / 100) * (currentTarget.volumosoPercent / 100))).toFixed(2).replace(/\.00$/, '')} <span className="text-sm font-semibold">kg MS</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
