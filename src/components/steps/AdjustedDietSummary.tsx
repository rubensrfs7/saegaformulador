import { ArrowUp, ArrowDown, FileText, CheckCircle2 } from 'lucide-react';
import { FormulationState } from '../../types';
import { MOCK_INGREDIENTS, CONSUMPTION_TARGETS } from '../../data';

interface Props {
  data: FormulationState;
  onGoToReport: () => void;
}

export default function AdjustedDietSummary({ data, onGoToReport }: Props) {
  const currentTarget = CONSUMPTION_TARGETS.find(
    t => t.category === data.category && t.subcategory === data.subcategory
  );
  const weight = Number(data.weight) || 0;
  const metaCMS = currentTarget ? weight * (currentTarget.percentPvMs / 100) : weight * 0.03;
  const targetConcPercent = currentTarget?.concentradoPercent || 35;
  const targetVolPercent = currentTarget?.volumosoPercent || 65;

  const metaConcentradoMS = metaCMS * (targetConcPercent / 100);
  const metaVolumosoMS = metaCMS * (targetVolPercent / 100);

  // Totais brutos das batidas cadastradas
  let batchConcMN = 0;
  let batchConcMS = 0;
  data.adjustedConcentrates.forEach(c => {
    const item = MOCK_INGREDIENTS.find(i => i.id === c.ingredientId);
    if (!item) return;
    const mn = Number(c.mn) || 0;
    batchConcMN += mn;
    batchConcMS += mn * (item.msPercent / 100);
  });

  let batchVolMN = 0;
  let batchVolMS = 0;
  data.adjustedVolumosos.forEach(v => {
    const item = MOCK_INGREDIENTS.find(i => i.id === v.ingredientId);
    if (!item) return;
    const mn = Number(v.mn) || 0;
    batchVolMN += mn;
    batchVolMS += mn * (item.msPercent / 100);
  });

  // Consumo diário por animal derivado da porcentagem da mistura aplicada às metas
  const avgConcMSPercent = batchConcMN > 0 ? (batchConcMS / batchConcMN) : 0;
  const animalConcDailyMN = avgConcMSPercent > 0 ? metaConcentradoMS / avgConcMSPercent : 0;

  const avgVolMSPercent = batchVolMN > 0 ? (batchVolMS / batchVolMN) : 0;
  const animalVolDailyMN = avgVolMSPercent > 0 ? metaVolumosoMS / avgVolMSPercent : 0;

  let totalMS = 0;
  let totalMN = 0;
  let totalConcMN = 0;
  let totalConcMS = 0;
  let totalVolMN = 0;
  let totalVolMS = 0;
  let totalPB = 0;
  let totalNDT = 0;
  let totalFDN = 0;
  let totalAmido = 0;
  let totalCalcio = 0;
  let totalFosforo = 0;

  const combinedAdjustedDiet = [
    ...data.adjustedConcentrates.map(entry => {
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
    ...data.adjustedVolumosos.map(entry => {
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

  combinedAdjustedDiet.forEach(c => {
    totalMS += c.msVal;
    totalMN += c.mnVal;
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

  const concRatio = totalMS > 0 ? ((totalConcMS / totalMS) * 100).toFixed(0) : '0';
  const volRatio = totalMS > 0 ? ((totalVolMS / totalMS) * 100).toFixed(0) : '0';
  const cmsCoveragePct = metaCMS > 0 ? (totalMS / metaCMS) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2">
            <CheckCircle2 size={14} /> Fase 5: Dieta Final Formulada
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-800">Dieta Ajustada por Animal</h2>
          <p className="text-gray-500 text-xs mt-1 max-w-2xl leading-relaxed">
            Resumo consolidado combinando Concentrado e Volumoso ajustados na Etapa 4, proporcional à meta diária de CMS do animal ({metaCMS.toFixed(2)} kg MS/dia).
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToReport}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold transition shadow-xs hover:shadow cursor-pointer whitespace-nowrap text-xs sm:text-sm shrink-0"
        >
          <FileText size={16} />
          Visualizar Relatório Final (Pág. 6)
        </button>
      </div>

      {/* Main Consolidated Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Composição da Dieta Ajustada (Consumo Diário por Animal)</h3>
              <p className="text-xs text-gray-500">Insumos dimensionados para a meta individual de consumo</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-gray-400 uppercase">CMS Alcançado</span>
              <div className="text-base font-bold text-gray-800">
                {totalMS.toFixed(2)} kg MS <span className="text-xs font-normal text-gray-500">({cmsCoveragePct.toFixed(0)}% da meta de {metaCMS.toFixed(2)} kg)</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl overflow-hidden mb-8">
            <div className="grid grid-cols-12 gap-4 pb-3 pt-3 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 px-4 uppercase">
              <div className="col-span-2 hidden md:block">Tipo</div>
              <div className="col-span-5 md:col-span-4">Insumo</div>
              <div className="col-span-2 text-right">Consumo MN (kg)</div>
              <div className="col-span-2 text-right hidden md:block">Consumo MS (kg)</div>
              <div className="col-span-3 md:col-span-2 text-right">% da Dieta (MS)</div>
              <div className="col-span-2 md:col-span-2 text-right hidden md:block">% na Batida</div>
            </div>

            <div className="divide-y divide-gray-100 min-h-[120px]">
              {combinedAdjustedDiet.length === 0 ? (
                <div className="text-center text-gray-400 py-12 text-sm">
                  Nenhum ingrediente adicionado na formulação ajustada.
                </div>
              ) : (
                combinedAdjustedDiet.map((entry, idx) => {
                  const percentage = totalMS > 0 ? ((entry.msVal / totalMS) * 100).toFixed(1) : '0.0';
                  return (
                    <div key={idx} className="grid grid-cols-12 gap-4 items-center text-sm px-4 py-3 hover:bg-gray-50/80 transition-colors">
                      <div className="col-span-2 hidden md:block">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          entry.itemInfo?.type === 'Concentrado' ? 'bg-orange-50 text-orange-600 border-orange-200' : 
                          entry.itemInfo?.type === 'Mineral' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                          'bg-green-50 text-green-700 border-green-200'
                        }`}>
                          {entry.itemInfo?.type}
                        </span>
                      </div>
                      <div className="col-span-5 md:col-span-4 font-semibold text-gray-800">
                        {entry.itemInfo?.name}
                      </div>
                      <div className="col-span-2 text-right text-gray-700 font-medium">
                        {entry.mnVal > 0 ? entry.mnVal.toFixed(2) : '-'}
                      </div>
                      <div className="col-span-2 text-right hidden md:block text-gray-600 font-semibold">
                        {entry.msVal.toFixed(2)}
                      </div>
                      <div className="col-span-3 md:col-span-2 text-right text-gray-700 font-bold">
                        {percentage}%
                      </div>
                      <div className="col-span-2 text-right hidden md:block text-gray-500 text-xs">
                        {entry.pct.toFixed(1)}%
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Consolidated Nutrients Cards */}
          <div className="mb-2">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Nutrientes Consolidados da Dieta Ajustada (Concentrado + Volumoso)
              </h4>
              <span className="text-xs text-gray-400">
                Comparativo com a exigência nutricional do perfil
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {nutrientCards.map((card, i) => (
                <div key={i} className="border border-gray-100 rounded-2xl p-4 bg-[#fafafa] shadow-xs relative overflow-hidden">
                  <div className="text-[10px] font-bold text-gray-500 mb-1 flex justify-between items-center">
                    <span>{card.label}</span>
                    {renderIndicator(card.value, card.target)}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <div className={`text-xl font-bold ${getNutrientColor(card.value, card.target)}`}>
                      {card.value.toFixed(1).replace(/\.0$/, '')}
                    </div>
                    <div className="text-[10px] font-medium text-gray-400">g/kg</div>
                  </div>
                  <div className="flex justify-between items-center mt-1 pt-1 border-t border-gray-100">
                    <div className={`text-xs font-semibold ${getNutrientColor(card.value, card.target)}`}>
                      {(card.value / 10).toFixed(1)}%
                    </div>
                    {card.target > 0 && (
                      <div className="text-[9px] text-gray-400 font-semibold">
                        Meta: {(card.target / 10).toFixed(0)}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Totals */}
        <div className="bg-[#eef2f6] p-6 flex flex-col md:flex-row justify-between items-start md:items-center rounded-b-2xl border-t border-gray-100 gap-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center w-full">
            <div>
              <div className="text-xs font-bold text-blue-800 mb-1 tracking-wider uppercase">Total MN Diário / Animal</div>
              <div className="text-3xl font-black text-blue-900">
                {totalMN.toFixed(2)} <span className="text-base font-semibold">kg/dia</span>
              </div>
            </div>
            
            <div className="hidden md:block h-10 w-px bg-blue-200"></div>

            <div className="flex gap-6">
              <div>
                <div className="text-[10px] font-bold text-orange-600 tracking-wider uppercase mb-1">Concentrado Diário</div>
                <div className="text-xl font-black text-orange-600">
                  {totalConcMN.toFixed(2)} <span className="text-xs font-bold">kg MN</span>
                </div>
                <div className="text-[10px] text-orange-600/80 font-medium">
                  {totalConcMS.toFixed(2)} kg MS ({concRatio}%)
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-green-700 tracking-wider uppercase mb-1">Volumoso Diário</div>
                <div className="text-xl font-black text-green-700">
                  {totalVolMN.toFixed(2)} <span className="text-xs font-bold">kg MN</span>
                </div>
                <div className="text-[10px] text-green-700/80 font-medium">
                  {totalVolMS.toFixed(2)} kg MS ({volRatio}%)
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-left md:text-right shrink-0 border-t border-blue-200 pt-4 md:border-t-0 md:pt-0 w-full md:w-auto">
            <div className="text-[10px] font-bold text-blue-600 mb-1 uppercase tracking-wider">Total MS Diário / Animal</div>
            <div className="text-2xl font-bold text-blue-800">
              {totalMS.toFixed(2)} <span className="text-sm font-medium">kg MS</span>
            </div>
            <div className="text-xs text-blue-600">
              Meta do perfil: {metaCMS.toFixed(2)} kg MS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
