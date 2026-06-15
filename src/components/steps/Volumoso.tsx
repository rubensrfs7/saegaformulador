import { Plus, Trash2 } from 'lucide-react';
import { FormulationState, IngredientEntry } from '../../types';
import { MOCK_INGREDIENTS, CONSUMPTION_TARGETS } from '../../data';

interface Props {
  data: FormulationState;
  updateData: (data: Partial<FormulationState>) => void;
}

export default function Volumoso({ data, updateData }: Props) {
  const addIngredient = (type: string) => {
    const defaultIngredient = MOCK_INGREDIENTS.find(i => i.type === type) || MOCK_INGREDIENTS.find(i => i.type === 'Volumoso');
    if (!defaultIngredient) return;

    // Default MS to fill remaining metaVolumoso
    const currentMS = data.volumosos.reduce((sum, entry) => {
      const mn = Number(entry.mn) || 0;
      const info = MOCK_INGREDIENTS.find(i => i.id === entry.ingredientId);
      return sum + (mn && info?.msPercent ? mn * (info.msPercent / 100) : 0);
    }, 0);
    
    const remainingMS = Math.max(0, metaVolumoso - currentMS);
    const defaultMN = defaultIngredient.msPercent ? remainingMS / (defaultIngredient.msPercent / 100) : 0;

    const newEntry: IngredientEntry = {
      id: Math.random().toString(36).substring(7),
      ingredientId: defaultIngredient.id,
      type,
      mn: defaultMN || '',
      ms: remainingMS || ''
    };
    updateData({ volumosos: [...data.volumosos, newEntry] });
  };

  const removeIngredient = (id: string) => {
    updateData({ volumosos: data.volumosos.filter(c => c.id !== id) });
  };

  const updateEntry = (id: string, field: keyof IngredientEntry, value: any) => {
    updateData({
      volumosos: data.volumosos.map(c => {
        if (c.id !== id) return c;
        
        const itemInfo = MOCK_INGREDIENTS.find(i => i.id === (field === 'ingredientId' ? value : c.ingredientId));
        if (!itemInfo) return { ...c, [field]: value };

        let updated = { ...c, [field]: value };

        if (field === 'mn') {
          const mn = value === '' ? 0 : Number(value);
          updated.ms = mn * (itemInfo.msPercent / 100);
        } else if (field === 'ms') {
          const ms = value === '' ? 0 : Number(value);
          updated.mn = itemInfo.msPercent ? ms / (itemInfo.msPercent / 100) : 0;
        } else if (field === 'ingredientId') {
          // If ingredient changes, keep MS fixed (cravado) and update MN
          const ms = Number(c.ms) || 0;
          updated.mn = itemInfo.msPercent ? ms / (itemInfo.msPercent / 100) : 0;
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

  const resolvedEntries = data.volumosos.map(entry => {
    const itemInfo = MOCK_INGREDIENTS.find(i => i.id === entry.ingredientId);
    if (!itemInfo) return null;
    
    // In Volumoso, we use the stored mn/ms if they exist, otherwise calculate
    const msValue = Number(entry.ms || (Number(entry.mn) * (itemInfo.msPercent/100))) || 0;
    const mnValue = Number(entry.mn || (itemInfo.msPercent ? msValue / (itemInfo.msPercent/100) : 0)) || 0;
    
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

  const displayMetaVolumoso = totalMS > 0 ? metaVolumoso * (totalMN / totalMS) : metaVolumoso;
  const unitVolumoso = totalMS > 0 ? 'kg MN' : 'kg MS';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
      <div className="p-8 flex-1">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Volumoso</h2>
            <p className="text-gray-500">Adicione os ingredientes volumosos</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => addIngredient('Volumoso')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm"
            >
              <Plus size={16} /> Adicionar Volumoso
            </button>
          </div>
        </div>

        {/* Goals Display */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="p-6 rounded-2xl bg-[#ecfdf3] shadow-sm border border-green-100 flex-1 sm:flex-none sm:min-w-[300px]">
             <div className="text-xs font-bold text-green-700 mb-2">VOLUMOSO ({currentTarget?.volumosoPercent || 65}%)</div>
             <div className="text-3xl font-black text-green-700 mb-2">
               {displayMetaVolumoso.toFixed(2).replace(/\.00$/, '')} <span className="text-sm font-semibold">{unitVolumoso}</span>
             </div>
             {totalMS === 0 && (
               <div className="text-xs text-green-600/80 font-medium mt-1">Adicione itens para ver a meta em MN</div>
             )}
          </div>
          {totalMS > 0 && (
            <div className="flex flex-wrap gap-4">
              <div className="p-4 rounded-xl bg-[#ecfdf3]/50 border border-green-100 flex flex-col justify-center sm:min-w-[150px]">
                <div className="text-[10px] items-center font-bold text-green-600/80 mb-1 uppercase">Total em MS</div>
                <div className="text-xl font-bold text-green-700">
                  {totalMS.toFixed(2)} <span className="text-xs font-semibold">kg</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#ecfdf3]/50 border border-green-100 flex flex-col justify-center sm:min-w-[150px]">
                <div className="text-[10px] items-center font-bold text-green-600/80 mb-1 uppercase">Meta em MS</div>
                <div className="text-xl font-bold text-green-700">
                  {metaVolumoso.toFixed(2)} <span className="text-xs font-semibold">kg</span>
                </div>
              </div>

              <div className={`p-4 rounded-xl border flex flex-col justify-center sm:min-w-[150px] ${
                Math.abs(metaVolumoso - totalMS) < 0.1 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'
              }`}>
                <div className="text-[10px] items-center font-bold text-gray-500 mb-1 uppercase">
                  {totalMS > metaVolumoso ? 'Excesso MN' : 'Falta MN'}
                </div>
                <div className={`text-xl font-bold ${totalMS > metaVolumoso ? 'text-red-500' : 'text-orange-600'}`}>
                  {Math.abs(displayMetaVolumoso - totalMN).toFixed(2)} <span className="text-xs font-semibold">kg</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-sm font-semibold text-gray-500 px-4">
          <div className="col-span-2">Tipo</div>
          <div className="col-span-4">Insumo</div>
          <div className="col-span-2">MN (kg)</div>
          <div className="col-span-2">MS (kg) *</div>
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
                      entry.type === 'Volumoso' ? 'bg-green-50 text-green-600 border-green-200' : 
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
                  <div className="col-span-2">
                    <input 
                      type="number" 
                      className="w-[80%] border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                      value={entry.ms}
                      onChange={(e) => updateEntry(entry.id, 'ms', e.target.value ? Number(e.target.value) : '')}
                    />
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
