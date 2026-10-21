import { ArrowUp, ArrowDown, FileText, Sparkles, Scale, Info, ArrowRight, CheckCircle2, FlaskConical } from 'lucide-react';
import { FormulationState } from '../../types';
import { MOCK_INGREDIENTS, CONSUMPTION_TARGETS } from '../../data';

interface Props {
  data: FormulationState;
  onJumpToReport: () => void;
  onProceedToAdjusted: () => void;
}

export default function CurrentDietSummary({ data, onJumpToReport, onProceedToAdjusted }: Props) {
  const currentTarget = CONSUMPTION_TARGETS.find(
    t => t.category === data.category && t.subcategory === data.subcategory
  );
  const weight = Number(data.weight) || 0;
  const metaCMS = currentTarget ? weight * (currentTarget.percentPvMs / 100) : weight * 0.03;
  const metaConcentradoMS = currentTarget ? metaCMS * (currentTarget.concentradoPercent / 100) : metaCMS * 0.35;
  const metaVolumosoMS = currentTarget ? metaCMS * (currentTarget.volumosoPercent / 100) : metaCMS * 0.65;

  // Bateladas cadastradas no misturador
  let batchConcMN = 0;
  let batchConcMS = 0;
  data.currentConcentrates.forEach(c => {
    const item = MOCK_INGREDIENTS.find(i => i.id === c.ingredientId);
    if (!item) return;
    const mn = Number(c.mn) || 0;
    batchConcMN += mn;
    batchConcMS += mn * (item.msPercent / 100);
  });

  let batchVolMN = 0;
  let batchVolMS = 0;
  data.currentVolumosos.forEach(v => {
    const item = MOCK_INGREDIENTS.find(i => i.id === v.ingredientId);
    if (!item) return;
    const mn = Number(v.mn) || 0;
    batchVolMN += mn;
    batchVolMS += mn * (item.msPercent / 100);
  });

  // Quantidade real fornecida por animal da Etapa 2
  const isVolAnimalMode = data.currentVolumosoMode === 'animal';
  const animalConcDailyMN = data.currentConcentradoKg !== undefined && data.currentConcentradoKg !== '' 
    ? Number(data.currentConcentradoKg) 
    : (batchConcMN > 0 && batchConcMN <= 25 ? batchConcMN : 0);

  const animalVolDailyMN = isVolAnimalMode
    ? batchVolMN
    : (data.currentVolumosoKg !== undefined && data.currentVolumosoKg !== '' 
        ? Number(data.currentVolumosoKg) 
        : (batchVolMN > 0 && batchVolMN <= 50 ? batchVolMN : 0));

  // Insumos distribuídos pela proporção da batelada e quantidade real por animal
  let totalConcMN = 0;
  let totalConcMS = 0;
  let totalVolMN = 0;
  let totalVolMS = 0;

  const combinedCurrentDiet = [
    ...data.currentConcentrates.map(entry => {
      const itemInfo = MOCK_INGREDIENTS.find(i => i.id === entry.ingredientId);
      if (!itemInfo) return null;
      const rawMN = Number(entry.mn) || 0;
      const pct = batchConcMN > 0 ? (rawMN / batchConcMN) : 0;
      const mnVal = pct * animalConcDailyMN;
      const msVal = mnVal * (itemInfo.msPercent / 100);
      totalConcMN += mnVal;
      totalConcMS += msVal;
      return { ...entry, itemInfo, mnVal, msVal, pct: pct * 100, feedGroup: 'Concentrado' };
    }),
    ...data.currentVolumosos.map(entry => {
      const itemInfo = MOCK_INGREDIENTS.find(i => i.id === entry.ingredientId);
      if (!itemInfo) return null;
      const rawMN = Number(entry.mn) || 0;
      const pct = batchVolMN > 0 ? (rawMN / batchVolMN) : 0;
      const mnVal = pct * animalVolDailyMN;
      const msVal = mnVal * (itemInfo.msPercent / 100);
      totalVolMN += mnVal;
      totalVolMS += msVal;
      return { ...entry, itemInfo, mnVal, msVal, pct: pct * 100, feedGroup: 'Volumoso' };
    })
  ].filter(Boolean) as {
    id: string;
    ingredientId: string;
    type: string;
    mn: number | '';
    ms: number | '';
    itemInfo: typeof MOCK_INGREDIENTS[0];
    mnVal: number;
    msVal: number;
    pct: number;
    feedGroup: string;
  }[];

  let totalMS = 0;
  let totalMN = totalConcMN + totalVolMN;
  let totalPB = 0;
  let totalNDT = 0;
  let totalFDN = 0;
  let totalAmido = 0;
  let totalCalcio = 0;
  let totalFosforo = 0;

  combinedCurrentDiet.forEach(c => {
    totalMS += c.msVal;
    totalPB += c.msVal * c.itemInfo.pb;
    totalNDT += c.msVal * c.itemInfo.ndt;
    totalFDN += c.msVal * c.itemInfo.fdn;
    totalAmido += c.msVal * c.itemInfo.amido;
    totalCalcio += c.msVal * c.itemInfo.calcio;
    totalFosforo += c.msVal * c.itemInfo.fosforo;
  });

  const getNutrientColor = (value: number, target: number) => {
    if (!target) return 'text-gray-800';
    if (value < target * 0.90) return 'text-red-500';
    if (value < target * 0.98) return 'text-amber-500';
    return 'text-green-600';
  };

  const nutrientCards = [
    { label: 'PB', value: totalMS > 0 ? totalPB / totalMS : 0, target: currentTarget?.pbTmr || 0, unit: 'g/kg' },
    { label: 'NDT', value: totalMS > 0 ? totalNDT / totalMS : 0, target: currentTarget?.ndtTmr || 0, unit: 'g/kg' },
    { label: 'FDN', value: totalMS > 0 ? totalFDN / totalMS : 0, target: currentTarget?.fdnTmr || 0, unit: 'g/kg' },
    { label: 'AMIDO', value: totalMS > 0 ? totalAmido / totalMS : 0, target: (currentTarget?.amidoPercent || 0) * 10, unit: 'g/kg' },
    { label: 'CÁLCIO', value: totalMS > 0 ? totalCalcio / totalMS : 0, target: 0, unit: 'g/kg' },
    { label: 'FÓSFORO', value: totalMS > 0 ? totalFosforo / totalMS : 0, target: 0, unit: 'g/kg' },
  ];

  const renderIndicator = (value: number, target: number) => {
    if (!target) return null;
    const diff = value - target;
    const threshold = target * 0.02;
    if (Math.abs(diff) < threshold) return null;
    if (diff < 0) return <ArrowUp size={14} className="text-red-500 stroke-[2.5]" title="Abaixo da exigência" />;
    return <ArrowDown size={14} className="text-blue-500 stroke-[2.5]" title="Acima da exigência" />;
  };

  const cmsCoveragePct = metaCMS > 0 ? (totalMS / metaCMS) * 100 : 0;
  const concRatioMN = totalMN > 0 ? ((totalConcMN / totalMN) * 100).toFixed(0) : '0';
  const volRatioMN = totalMN > 0 ? ((totalVolMN / totalMN) * 100).toFixed(0) : '0';

  const concRatioMS = totalMS > 0 ? ((totalConcMS / totalMS) * 100).toFixed(0) : '0';
  const volRatioMS = totalMS > 0 ? ((totalVolMS / totalMS) * 100).toFixed(0) : '0';

  return (
    <div className="space-y-6">
      {/* Top Banner with Direct Skip to Report */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2">
            <FlaskConical size={14} /> Fase 3: Dieta Atual Consolidada
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-800">Diagnóstico da Dieta Atual</h2>
          <p className="text-gray-500 text-xs mt-1 max-w-2xl leading-relaxed">
            Calculado <strong>estritamente com base nos dados reais</strong> informados na Etapa 2 ({totalMN.toFixed(2)} kg MN/animal/dia), sem aplicar ainda a meta de exigência teórica do perfil.
          </p>
        </div>

        <div className="flex flex-row items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onJumpToReport}
            className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-xl transition shadow-xs hover:shadow cursor-pointer text-xs sm:text-sm whitespace-nowrap"
          >
            <FileText size={15} />
            <span>Ver Relatório Atual (Pág. 6)</span>
          </button>
          <button
            type="button"
            onClick={onProceedToAdjusted}
            className="inline-flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white font-bold px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-xl transition shadow-xs hover:shadow cursor-pointer text-xs sm:text-sm whitespace-nowrap"
          >
            <span>Avançar para Dieta Ajustada (Pág. 4)</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* COMPARATIVE CARDS: REAL DA FAZENDA VS META TEÓRICA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Consumo Real MS */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Consumo Real Matéria Seca (CMS)
          </span>
          <div className="text-2xl font-black text-blue-900">
            {totalMS.toFixed(2)} <span className="text-xs font-semibold text-gray-500">kg MS/cab/dia</span>
          </div>
          <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
            <span>Meta do Perfil:</span>
            <strong className="text-gray-700">{metaCMS.toFixed(2)} kg MS</strong>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className={`h-full ${cmsCoveragePct >= 95 && cmsCoveragePct <= 105 ? 'bg-green-500' : 'bg-amber-500'}`} 
              style={{ width: `${Math.min(100, cmsCoveragePct)}%` }}
            />
          </div>
        </div>

        {/* Consumo Real MN */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Fornecimento Matéria Natural (MN)
          </span>
          <div className="text-2xl font-black text-gray-900">
            {totalMN.toFixed(2)} <span className="text-xs font-semibold text-gray-500">kg MN/cab/dia</span>
          </div>
          <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
            <span>MS Média da Dieta:</span>
            <strong className="text-gray-700">{totalMN > 0 ? ((totalMS / totalMN) * 100).toFixed(1) : 0}% MS</strong>
          </div>
        </div>

        {/* Concentrado Atual */}
        <div className="bg-[#fffcf8] rounded-2xl p-5 border border-orange-100 shadow-sm">
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block mb-1">
            Concentrado Fornecido
          </span>
          <div className="text-2xl font-black text-orange-900">
            {totalConcMN.toFixed(2)} <span className="text-xs font-semibold text-orange-600">kg MN</span>
          </div>
          <div className="text-xs text-orange-700 mt-2 flex items-center justify-between">
            <span>{totalConcMS.toFixed(2)} kg MS</span>
            <span className="font-bold bg-orange-100 px-2 py-0.5 rounded text-[11px]">{concRatioMN}% MN | {concRatioMS}% MS</span>
          </div>
        </div>

        {/* Volumoso Atual */}
        <div className="bg-[#f0fdf4] rounded-2xl p-5 border border-green-100 shadow-sm">
          <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider block mb-1">
            Volumoso Fornecido
          </span>
          <div className="text-2xl font-black text-green-900">
            {totalVolMN.toFixed(2)} <span className="text-xs font-semibold text-green-700">kg MN</span>
          </div>
          <div className="text-xs text-green-700 mt-2 flex items-center justify-between">
            <span>{totalVolMS.toFixed(2)} kg MS</span>
            <span className="font-bold bg-green-100 px-2 py-0.5 rounded text-[11px]">{volRatioMN}% MN | {volRatioMS}% MS</span>
          </div>
        </div>
      </div>

      {/* DETAILED INGREDIENT INTAKE TABLE PER ANIMAL */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Consumo Individual de Insumos (1 Cabeça/Dia)</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Detalhamento de cada ingrediente consumido diariamente por animal segundo o diagnóstico da propriedade
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase">
                <th className="py-3 px-5 text-left">Grupo</th>
                <th className="py-3 px-5 text-left">Insumo</th>
                <th className="py-3 px-5 text-right">Consumo MN (kg/dia)</th>
                <th className="py-3 px-5 text-right">Consumo MS (kg/dia)</th>
                <th className="py-3 px-5 text-right">% na MS Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {combinedCurrentDiet.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400 text-sm">
                    Nenhum ingrediente adicionado na Etapa 2.
                  </td>
                </tr>
              ) : (
                combinedCurrentDiet.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition">
                    <td className="py-3 px-5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                        item.feedGroup === 'Concentrado' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {item.itemInfo.type}
                      </span>
                    </td>
                    <td className="py-3 px-5 font-bold text-gray-800">{item.itemInfo.name}</td>
                    <td className="py-3 px-5 text-right font-semibold text-gray-700">{item.mnVal.toFixed(2)} kg</td>
                    <td className="py-3 px-5 text-right font-black text-gray-900">{item.msVal.toFixed(2)} kg</td>
                    <td className="py-3 px-5 text-right text-gray-500 font-bold">
                      {totalMS > 0 ? ((item.msVal / totalMS) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-gray-50/90 font-bold text-gray-800 border-t border-gray-200">
              <tr>
                <td colSpan={2} className="py-3.5 px-5 uppercase text-xs">
                  Total da Dieta Diária Consumida
                </td>
                <td className="py-3.5 px-5 text-right text-blue-900 font-black text-base">
                  {totalMN.toFixed(2)} kg MN
                </td>
                <td className="py-3.5 px-5 text-right text-blue-900 font-black text-base">
                  {totalMS.toFixed(2)} kg MS
                </td>
                <td className="py-3.5 px-5 text-right text-gray-500">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* NUTRITIONAL 6 CARDS: PB, NDT, FDN, AMIDO, CÁLCIO, FÓSFORO */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-700"></span>
                Diagnóstico Nutricional Consolidado da Dieta Atual
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Valores reais entregues pela combinação atual de concentrado e volumoso vs Exigência Teórica do animal
              </p>
            </div>
            <div className="text-xs text-gray-400 font-medium">
              Base: {totalMS.toFixed(2)} kg MS de consumo diário
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {nutrientCards.map((card, i) => (
              <div key={i} className="border border-gray-100 bg-gray-50/70 rounded-xl p-3.5 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-bold text-gray-500 uppercase">{card.label}</span>
                  {renderIndicator(card.value, card.target)}
                </div>
                <div>
                  <div className={`text-xl font-black ${getNutrientColor(card.value, card.target)}`}>
                    {card.value.toFixed(1).replace(/\.0$/, '')}
                    <span className="text-[10px] font-normal text-gray-400 ml-1">g/kg</span>
                  </div>
                  <div className="text-xs font-bold text-gray-700 mt-0.5">
                    {(card.value / 10).toFixed(1)}%
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-200/50 flex justify-between items-center text-[10px]">
                  <span className="text-gray-400">Meta:</span>
                  <span className="font-bold text-gray-600">
                    {card.target > 0 ? `${(card.target / 10).toFixed(1)}%` : '-'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
