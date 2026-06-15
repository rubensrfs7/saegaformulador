import { FormulationState } from '../../types';
import { MOCK_INGREDIENTS, CONSUMPTION_TARGETS } from '../../data';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface Props {
  data: FormulationState;
}

export default function FinalDiet({ data }: Props) {
  const currentTarget = CONSUMPTION_TARGETS.find(t => t.category === data.category && t.subcategory === data.subcategory);
  const weight = Number(data.weight) || 0;
  
  const metaCMS = currentTarget ? weight * (currentTarget.percentPvMs / 100) : weight * 0.03;
  const metaConcentrado = currentTarget ? metaCMS * (currentTarget.concentradoPercent / 100) : metaCMS * 0.35;
  const metaVolumoso = currentTarget ? metaCMS * (currentTarget.volumosoPercent / 100) : metaCMS * 0.65;

  const currentConcentrateMS = data.concentrates.reduce((sum, entry) => {
    const mn = Number(entry.mn) || 0;
    const info = MOCK_INGREDIENTS.find(i => i.id === entry.ingredientId);
    return sum + (mn && info?.msPercent ? mn * (info.msPercent / 100) : 0);
  }, 0);
  const currentVolumosoMS = data.volumosos.reduce((sum, entry) => {
    const mn = Number(entry.mn) || 0;
    const info = MOCK_INGREDIENTS.find(i => i.id === entry.ingredientId);
    return sum + (mn && info?.msPercent ? mn * (info.msPercent / 100) : 0);
  }, 0);

  let totalMS = 0;
  let totalMN = 0;
  let totalPB = 0;
  let totalNDT = 0;
  let totalFDN = 0;
  let totalAmido = 0;
  let totalCalcio = 0;
  let totalFosforo = 0;
  
  let totalScaledConcentrateMN = 0;

  const resolvedDiet = [
    ...data.concentrates.map(entry => {
      const itemInfo = MOCK_INGREDIENTS.find(i => i.id === entry.ingredientId);
      if (!itemInfo) return null;
      
      const originalMS = entry.ms !== '' && entry.ms !== undefined ? Number(entry.ms) : (Number(entry.mn) || 0) * (itemInfo.msPercent / 100);
      const proportion = currentConcentrateMS > 0 ? originalMS / currentConcentrateMS : 0;
      
      const scaledMS = proportion * metaConcentrado;
      const scaledMN = itemInfo.msPercent ? scaledMS / (itemInfo.msPercent / 100) : 0;
      
      totalScaledConcentrateMN += scaledMN;
      return { ...entry, itemInfo, msValue: scaledMS, mnValue: scaledMN };
    }),
    ...data.volumosos.map(entry => {
      const itemInfo = MOCK_INGREDIENTS.find(i => i.id === entry.ingredientId);
      if (!itemInfo) return null;
      const mnValue = Number(entry.mn) || 0;
      const msValue = entry.ms !== '' && entry.ms !== undefined ? Number(entry.ms) : mnValue * (itemInfo.msPercent / 100);
      return { ...entry, itemInfo, msValue, mnValue };
    })
  ].filter(Boolean) as { ingredientId: string, mn: string, itemInfo: typeof MOCK_INGREDIENTS[0], msValue: number, mnValue: number }[];

  resolvedDiet.forEach(c => {
    totalMS += c.msValue;
    totalMN += c.mnValue;
    totalPB += c.msValue * (c.itemInfo?.pb || 0);
    totalNDT += c.msValue * (c.itemInfo?.ndt || 0);
    totalFDN += c.msValue * (c.itemInfo?.fdn || 0);
    totalAmido += c.msValue * (c.itemInfo?.amido || 0);
    totalCalcio += c.msValue * (c.itemInfo?.calcio || 0);
    totalFosforo += c.msValue * (c.itemInfo?.fosforo || 0);
  });

  const getNutrientColor = (value: number, target: number) => {
    if (!target) return 'text-gray-800';
    
    // Vermelho: abaixo da meta significativamente (< 90%)
    if (value < target * 0.90) return 'text-red-500';
    
    // Amarelo: chegando na meta (90% - 98%)
    if (value < target * 0.98) return 'text-yellow-600';
    
    // Verde: dentro do aceitável / muito próximo para cima (>= 98%)
    return 'text-green-600';
  };


  const nutrientCards = [
    { label: 'PB', value: totalMS > 0 ? totalPB / totalMS : 0, target: currentTarget?.pbTmr || 0 },
    { label: 'NDT', value: totalMS > 0 ? totalNDT / totalMS : 0, target: currentTarget?.ndtTmr || 0 },
    { label: 'FDN', value: totalMS > 0 ? totalFDN / totalMS : 0, target: currentTarget?.fdnTmr || 0 },
    { label: 'AMIDO', value: totalMS > 0 ? totalAmido / totalMS : 0, target: (currentTarget?.amidoPercent || 0) * 10 },
    { label: 'CÁLCIO', value: totalMS > 0 ? totalCalcio / totalMS : 0, target: 0 },
    { label: 'FÓSFORO', value: totalMS > 0 ? totalFosforo / totalMS : 0, target: 0 },
  ];

  const renderIndicator = (value: number, target: number, label: string) => {
    if (!target) return null;
    
    // For FDN, typically we want to be close but often it's seen as a minimum or maximum depending on the diet
    // But common use case is "hitting the target".
    // I'll show ArrowUp if value < target (needs more) and ArrowDown if value > target (too much?)
    // But usually nutrient targets are "minimum requirements".
    // Let's stick to simple: value < target -> ArrowUp (Increase needed), value > target + buffer -> ArrowDown (Optional/Too much)
    
    const diff = value - target;
    const threshold = target * 0.02; // 2% tolerance

    if (Math.abs(diff) < threshold) {
      return null; // On target
    }

    if (diff < 0) {
      return <ArrowUp size={14} className="text-red-500 animate-pulse" />;
    } else {
      return <ArrowDown size={14} className="text-blue-500" />;
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col mb-6">
        <div className="p-8 flex-1">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Dieta Final por Animal</h2>
              <p className="text-gray-500">Resumo da dieta combinando concentrado e volumoso</p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-sm font-semibold text-gray-500 px-4">
            <div className="col-span-2 hidden md:block">Tipo</div>
            <div className="col-span-6 md:col-span-5">Insumo</div>
            <div className="col-span-3 md:col-span-2">MN (kg)</div>
            <div className="col-span-2 hidden md:block">MS (kg)</div>
            <div className="col-span-3 md:col-span-1 text-right">%</div>
          </div>

          <div className="py-4 space-y-3 min-h-[120px]">
            {resolvedDiet.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                Nenhum item adicionado
              </div>
            ) : (
              resolvedDiet.map((entry, idx) => {
                if (!entry) return null;
                const percentage = totalMS > 0 ? ((entry.msValue / totalMS) * 100).toFixed(1) : '0.0';
                
                return (
                  <div key={idx} className="grid grid-cols-12 gap-4 items-center text-sm px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="col-span-2 hidden md:block">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        entry.itemInfo?.type === 'Concentrado' ? 'bg-orange-50 text-orange-600 border-orange-200' : 
                        entry.itemInfo?.type === 'Mineral' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                        entry.itemInfo?.type === 'Volumoso' ? 'bg-green-50 text-green-600 border-green-200' :
                        'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {entry.itemInfo?.type}
                      </span>
                    </div>
                    <div className="col-span-6 md:col-span-5 font-semibold text-gray-700">
                      {entry.itemInfo?.name}
                    </div>
                    <div className="col-span-3 md:col-span-2 text-gray-600 font-medium">
                      {entry.mnValue > 0 ? entry.mnValue.toFixed(2) : '-'}
                    </div>
                    <div className="col-span-2 hidden md:block text-gray-600">
                      {entry.msValue.toFixed(2)}
                    </div>
                    <div className="col-span-3 md:col-span-1 text-right text-gray-600 font-medium">
                      {percentage}%
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-8">
            {nutrientCards.map((card, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4 shadow-sm bg-[#fafafa] relative overflow-hidden">
                <div className="text-[10px] font-bold text-gray-500 mb-1 flex justify-between items-center">
                  {card.label}
                  {renderIndicator(card.value, card.target, card.label)}
                </div>
                <div className="flex items-baseline gap-1">
                  <div className={`text-xl font-bold ${getNutrientColor(card.value, card.target)}`}>
                    {card.value.toFixed(2).replace(/\.00$/, '')}
                  </div>
                  <div className="text-xs font-medium text-gray-500">g/kg</div>
                </div>
                <div className={`flex justify-between items-center mt-1`}>
                  <div className={`text-xs font-semibold ${getNutrientColor(card.value, card.target)}`}>
                    {(card.value / 10).toFixed(2).replace(/\.00$/, '')}%
                  </div>
                  {card.target > 0 && (
                    <div className="text-[9px] text-gray-400 font-bold">
                      Meta: {(card.target / 10).toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#eef2f6] p-6 flex flex-col md:flex-row justify-between items-start md:items-center rounded-b-2xl border-t border-gray-100 gap-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center w-full">
            <div>
              <div className="text-xs font-bold text-blue-800 mb-1 tracking-wider uppercase">Total MN da Dieta</div>
              <div className="text-4xl font-black text-blue-900">{totalMN.toFixed(2)} <span className="text-base font-semibold">Kg</span></div>
            </div>
            
            <div className="hidden md:block h-10 w-px bg-blue-200"></div>

            <div className="flex gap-6">
               <div>
                  <div className="text-[10px] font-bold text-orange-600 tracking-wider uppercase mb-1">Concentrado</div>
                  <div className="text-2xl font-black text-orange-600">
                    {totalScaledConcentrateMN.toFixed(2).replace(/\.00$/, '')} <span className="text-sm font-bold">Kg MN</span>
                  </div>
               </div>
               <div>
                  <div className="text-[10px] font-bold text-green-700 tracking-wider uppercase mb-1">Volumoso</div>
                  <div className="text-2xl font-black text-green-700">
                    {data.volumosos.reduce((sum, v) => sum + (Number(v.mn) || 0), 0).toFixed(2).replace(/\.00$/, '')} <span className="text-sm font-bold">Kg MN</span>
                  </div>
               </div>
            </div>
          </div>
          
          <div className="text-right shrink-0 border-t border-blue-200 pt-4 md:border-t-0 md:pt-0 w-full md:w-auto">
            <div className="text-[10px] font-bold text-blue-600 mb-1 uppercase tracking-wider">Total MS da Dieta</div>
            <div className="text-2xl font-bold text-blue-800">{totalMS.toFixed(2)} <span className="text-sm font-medium">Kg</span></div>
          </div>
        </div>
      </div>
    </>
  );
}
