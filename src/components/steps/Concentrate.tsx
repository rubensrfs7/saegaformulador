import { Plus, Trash2 } from 'lucide-react';
import { FormulationState, IngredientEntry } from '../../types';
import { MOCK_INGREDIENTS, CONSUMPTION_TARGETS } from '../../data';

interface Props {
  data: FormulationState;
  updateData: (data: Partial<FormulationState>) => void;
}

export default function Concentrate({ data, updateData }: Props) {
  const addIngredient = (type: string) => {
    const defaultIngredient = MOCK_INGREDIENTS.find(i => i.type === type) || MOCK_INGREDIENTS[0];
    const newEntry: IngredientEntry = {
      id: Math.random().toString(36).substring(7),
      ingredientId: defaultIngredient.id,
      type,
      mn: '',
      ms: ''
    };
    updateData({ concentrates: [...data.concentrates, newEntry] });
  };

  const removeIngredient = (id: string) => {
    updateData({ concentrates: data.concentrates.filter(c => c.id !== id) });
  };

  const updateEntry = (id: string, field: keyof IngredientEntry, value: any) => {
    updateData({
      concentrates: data.concentrates.map(c => {
        if (c.id !== id) return c;
        const itemInfo = MOCK_INGREDIENTS.find(i => i.id === (field === 'ingredientId' ? value : c.ingredientId));
        if (!itemInfo) return { ...c, [field]: value };
        
        let updated = { ...c, [field]: value };
        if (field === 'mn') {
          const mn = value === '' ? 0 : Number(value);
          updated.ms = mn * (itemInfo.msPercent / 100);
        } else if (field === 'ingredientId') {
          const mn = Number(c.mn) || 0;
          updated.ms = mn * (itemInfo.msPercent / 100);
        }
        return updated;
      })
    });
  };

  // Calculations
  const currentTarget = CONSUMPTION_TARGETS.find(t => t.category === data.category && t.subcategory === data.subcategory);
  const weight = Number(data.weight) || 0;
  
  const metaCMS = currentTarget ? weight * (currentTarget.percentPvMs / 100) : weight * 0.03;
  const metaConcentrado = currentTarget ? metaCMS * (currentTarget.concentradoPercent / 100) : metaCMS * 0.35;
  const metaVolumoso = currentTarget ? metaCMS * (currentTarget.volumosoPercent / 100) : metaCMS * 0.65;

  let totalMS = 0;
  let totalMN = 0;
  let totalPB = 0;
  let totalNDT = 0;
  let totalFDN = 0;
  let totalAmido = 0;
  let totalCalcio = 0;
  let totalFosforo = 0;

  const resolvedEntries = data.concentrates.map(entry => {
    const itemInfo = MOCK_INGREDIENTS.find(i => i.id === entry.ingredientId);
    if (!itemInfo) return null;
    
    // Use stored ms if available, else calculate from mn
    const msValue = entry.ms !== '' && entry.ms !== undefined ? Number(entry.ms) : (Number(entry.mn) || 0) * (itemInfo.msPercent / 100);
    const mnValue = Number(entry.mn) || 0;
    
    totalMS += msValue;
    totalMN += mnValue;

    const pb = msValue * itemInfo.pb;
    const ndt = msValue * itemInfo.ndt;
    const fdn = msValue * itemInfo.fdn;
    const amido = msValue * itemInfo.amido;
    const calcio = msValue * itemInfo.calcio;
    const fosforo = msValue * itemInfo.fosforo;

    totalPB += pb;
    totalNDT += ndt;
    totalFDN += fdn;
    totalAmido += amido;
    totalCalcio += calcio;
    totalFosforo += fosforo;

    return { ...entry, itemInfo, msValue, mnValue };
  }).filter(Boolean);

  const nutrientCards = [
    { label: 'PB', value: totalMS > 0 ? totalPB / totalMS : 0 },
    { label: 'NDT', value: totalMS > 0 ? totalNDT / totalMS : 0 },
    { label: 'FDN', value: totalMS > 0 ? totalFDN / totalMS : 0 },
    { label: 'AMIDO', value: totalMS > 0 ? totalAmido / totalMS : 0 },
    { label: 'CÁLCIO', value: totalMS > 0 ? totalCalcio / totalMS : 0 },
    { label: 'FÓSFORO', value: totalMS > 0 ? totalFosforo / totalMS : 0 },
  ];

  const displayMetaConcentrado = totalMS > 0 ? metaConcentrado * (totalMN / totalMS) : metaConcentrado;
  const unitConcentrado = totalMS > 0 ? 'kg MN' : 'kg MS';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
      <div className="p-8 flex-1">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Concentrado</h2>
            <p className="text-gray-500">Adicione os ingredientes concentrados e minerais</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => addIngredient('Concentrado')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm"
            >
              <Plus size={16} /> Adicionar Concentrado
            </button>
            <button 
              onClick={() => addIngredient('Mineral')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm"
            >
              <Plus size={16} /> Adicionar Mineral
            </button>
          </div>
        </div>

        {/* Goals Display */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="p-6 rounded-2xl bg-[#fff8eb] shadow-sm border border-orange-100 flex-1 sm:flex-none sm:min-w-[300px]">
             <div className="text-xs font-bold text-orange-600 mb-2">META CONCENTRADO ({currentTarget?.concentradoPercent || 35}%)</div>
             <div className="text-3xl font-black text-orange-600 mb-2">
               {displayMetaConcentrado.toFixed(2).replace(/\.00$/, '')} <span className="text-sm font-semibold">{unitConcentrado}</span>
             </div>
             {totalMS === 0 && (
               <div className="text-xs text-orange-500/80 font-medium mt-1">Adicione itens para ver a meta em MN</div>
             )}
          </div>
          {totalMS > 0 && (
            <div className="p-4 rounded-xl bg-[#fff8eb]/50 border border-orange-100 flex flex-col justify-center sm:min-w-[150px]">
              <div className="text-[10px] items-center font-bold text-orange-500/80 mb-1 uppercase">Meta em MS</div>
              <div className="text-xl font-bold text-orange-600">
                {metaConcentrado.toFixed(2).replace(/\.00$/, '')} <span className="text-xs font-semibold">kg</span>
              </div>
            </div>
          )}
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-sm font-semibold text-gray-500 px-4">
          <div className="col-span-2">Tipo</div>
          <div className="col-span-4">Insumo</div>
          <div className="col-span-2">MN (kg)</div>
          <div className="col-span-2">MS (kg)</div>
          <div className="col-span-1">% da Mistura</div>
          <div className="col-span-1 text-center">Ações</div>
        </div>

        {/* Table Body */}
        <div className="py-4 space-y-3 min-h-[120px]">
          {resolvedEntries.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              Nenhum item adicionado
            </div>
          ) : (
            resolvedEntries.map((entry) => {
              if (!entry) return null;
              const percentage = totalMS > 0 ? ((entry.msValue / totalMS) * 100).toFixed(1) : '0.0';
              
              return (
                <div key={entry.id} className="grid grid-cols-12 gap-4 items-center text-sm px-4">
                  <div className="col-span-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      entry.type === 'Concentrado' ? 'bg-orange-50 text-orange-600 border-orange-200' : 
                      entry.type === 'Mineral' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                      'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                      {entry.type}
                    </span>
                  </div>
                  <div className="col-span-4">
                    <select 
                      className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={entry.ingredientId}
                      onChange={(e) => updateEntry(entry.id, 'ingredientId', e.target.value)}
                    >
                      {MOCK_INGREDIENTS.filter(i => i.type === entry.type).map(i => (
                        <option key={i.id} value={i.id}>{i.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input 
                      type="number" 
                      className="w-[80%] border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={entry.mn}
                      onChange={(e) => updateEntry(entry.id, 'mn', e.target.value ? Number(e.target.value) : '')}
                    />
                  </div>
                  <div className="col-span-2 text-gray-600 py-2">
                    {entry.msValue > 0 ? entry.msValue.toFixed(2) : '-'}
                  </div>
                  <div className="col-span-1 text-gray-600 py-2">
                    {percentage}%
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button 
                      onClick={() => removeIngredient(entry.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Nutrient Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-8">
          {nutrientCards.map((card, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 shadow-sm bg-[#fafafa]">
              <div className="text-[10px] font-bold text-gray-500 mb-1">{card.label}</div>
              <div className="flex items-baseline gap-1">
                <div className="text-xl font-bold text-gray-800">
                  {card.value.toFixed(2).replace(/\.00$/, '')}
                </div>
                <div className="text-xs font-medium text-gray-500">g/kg</div>
              </div>
              <div className="text-xs font-semibold text-blue-600 mt-1">
                {(card.value / 10).toFixed(2).replace(/\.00$/, '')}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Totals */}
      <div className="bg-[#eef2f6] px-8 py-5 flex justify-between items-center rounded-b-2xl border-t border-gray-100">
        <div>
          <div className="text-xs font-bold text-blue-800 mb-1">TOTAL MN</div>
          <div className="text-4xl font-black text-blue-900">{totalMN.toFixed(2)} <span className="text-base font-semibold">Kg</span></div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold text-blue-600 mb-1">TOTAL MS</div>
          <div className="text-2xl font-bold text-blue-800">{totalMS.toFixed(2)} <span className="text-sm font-medium">Kg</span></div>
        </div>
      </div>
    </div>
  );
}
