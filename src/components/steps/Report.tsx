import { Printer, ArrowUp, ArrowDown, CheckCircle2, ArrowRight } from 'lucide-react';
import { FormulationState } from '../../types';
import { MOCK_INGREDIENTS, CONSUMPTION_TARGETS } from '../../data';

interface Props {
  data: FormulationState;
  onNavigateToAdjusted?: () => void;
}

export default function Report({ data, onNavigateToAdjusted }: Props) {
  const currentTarget = CONSUMPTION_TARGETS.find(
    t => t.category === data.category && t.subcategory === data.subcategory
  );
  const weight = Number(data.weight) || 0;
  const animais = Number(data.quantity) || 1;
  const days = Number(data.days) || 1;

  // Animal profile theoretical MS targets
  const metaCMS = currentTarget ? weight * (currentTarget.percentPvMs / 100) : weight * 0.03;
  const metaConcentradoMS = currentTarget ? metaCMS * (currentTarget.concentradoPercent / 100) : metaCMS * 0.35;
  const metaVolumosoMS = currentTarget ? metaCMS * (currentTarget.volumosoPercent / 100) : metaCMS * 0.65;

  // Detect mode
  const hasAdjustedDiet = (data.adjustedConcentrates.length > 0 || data.adjustedVolumosos.length > 0) && data.reportSourceStep !== 3;
  const hasCurrentDiet = data.hasCurrentDiet && (data.currentConcentrates.length > 0 || data.currentVolumosos.length > 0);

  // Helper to resolve ingredient entries
  const resolveDietItems = (entries: typeof data.currentConcentrates, defaultFeedType: string) => {
    let sumMS = 0;
    let sumMN = 0;
    const items = entries.map(entry => {
      const itemInfo = MOCK_INGREDIENTS.find(i => i.id === entry.ingredientId);
      if (!itemInfo) return null;
      const mnVal = Number(entry.mn) || 0;
      const msVal = entry.mn === '' ? 0 : mnVal * (itemInfo.msPercent / 100);
      sumMS += msVal;
      sumMN += mnVal;
      return { ...entry, itemInfo, mnVal, msVal, feedType: entry.type || defaultFeedType };
    }).filter(Boolean) as {
      id: string;
      ingredientId: string;
      type: string;
      mn: number | '';
      ms: number | '';
      itemInfo: typeof MOCK_INGREDIENTS[0];
      mnVal: number;
      msVal: number;
      feedType: string;
    }[];
    return { items, sumMS, sumMN };
  };

  // 1. Raw Batches
  const currConcRaw = resolveDietItems(data.currentConcentrates, 'Concentrado');
  const currVolRaw = resolveDietItems(data.currentVolumosos, 'Volumoso');

  const adjConcRaw = resolveDietItems(data.adjustedConcentrates, 'Concentrado');
  const adjVolRaw = resolveDietItems(data.adjustedVolumosos, 'Volumoso');

  // ================= DIETA ATUAL (REAL DA FAZENDA) =================
  // Quantidade fornecida por animal definida na Etapa 2
  const defaultCurrConcKg = data.currentConcentradoKg !== undefined && data.currentConcentradoKg !== '' 
    ? Number(data.currentConcentradoKg) 
    : (currConcRaw.sumMN > 0 && currConcRaw.sumMN <= 25 ? currConcRaw.sumMN : 4.0);

  const defaultCurrVolKg = data.currentVolumosoKg !== undefined && data.currentVolumosoKg !== '' 
    ? Number(data.currentVolumosoKg) 
    : (currVolRaw.sumMN > 0 && currVolRaw.sumMN <= 50 ? currVolRaw.sumMN : 16.0);

  const currAnimalConcDailyMN = Number(data.currentConcentradoKg !== undefined ? data.currentConcentradoKg : defaultCurrConcKg) || 0;
  const currAnimalVolDailyMN = Number(data.currentVolumosoKg !== undefined ? data.currentVolumosoKg : defaultCurrVolKg) || 0;

  const currAnimalConcItems = currConcRaw.items.map(item => {
    const pct = currConcRaw.sumMN > 0 ? item.mnVal / currConcRaw.sumMN : 0;
    const mnVal = pct * currAnimalConcDailyMN;
    const msVal = mnVal * (item.itemInfo.msPercent / 100);
    return { ...item, mnVal, msVal, pct: pct * 100, batchMN: item.mnVal };
  });

  const currAnimalVolItems = currVolRaw.items.map(item => {
    const pct = currVolRaw.sumMN > 0 ? item.mnVal / currVolRaw.sumMN : 0;
    const mnVal = pct * currAnimalVolDailyMN;
    const msVal = mnVal * (item.itemInfo.msPercent / 100);
    return { ...item, mnVal, msVal, pct: pct * 100, batchMN: item.mnVal };
  });

  const currAnimalItems = [...currAnimalConcItems, ...currAnimalVolItems];
  const currTotalConcMS = currAnimalConcItems.reduce((acc, i) => acc + i.msVal, 0);
  const currTotalVolMS = currAnimalVolItems.reduce((acc, i) => acc + i.msVal, 0);
  const currTotalMS = currTotalConcMS + currTotalVolMS;
  const currTotalMN = currAnimalConcDailyMN + currAnimalVolDailyMN;

  let currPB = 0, currNDT = 0, currFDN = 0, currAmido = 0, currCa = 0, currP = 0;
  currAnimalItems.forEach(c => {
    currPB += c.msVal * c.itemInfo.pb;
    currNDT += c.msVal * c.itemInfo.ndt;
    currFDN += c.msVal * c.itemInfo.fdn;
    currAmido += c.msVal * c.itemInfo.amido;
    currCa += c.msVal * c.itemInfo.calcio;
    currP += c.msVal * c.itemInfo.fosforo;
  });

  // ================= DIETA AJUSTADA (RECOMENDADA) =================
  const avgAdjConcMS = adjConcRaw.sumMN > 0 ? adjConcRaw.sumMS / adjConcRaw.sumMN : 0;
  const adjAnimalConcDailyMN = avgAdjConcMS > 0 ? metaConcentradoMS / avgAdjConcMS : 0;

  const avgAdjVolMS = adjVolRaw.sumMN > 0 ? adjVolRaw.sumMS / adjVolRaw.sumMN : 0;
  const adjAnimalVolDailyMN = avgAdjVolMS > 0 ? metaVolumosoMS / avgAdjVolMS : 0;

  const adjAnimalConcItems = adjConcRaw.items.map(item => {
    const pct = adjConcRaw.sumMN > 0 ? item.mnVal / adjConcRaw.sumMN : 0;
    const mnVal = pct * adjAnimalConcDailyMN;
    const msVal = mnVal * (item.itemInfo.msPercent / 100);
    return { ...item, mnVal, msVal, pct: pct * 100, batchMN: item.mnVal };
  });

  const adjAnimalVolItems = adjVolRaw.items.map(item => {
    const pct = adjVolRaw.sumMN > 0 ? item.mnVal / adjVolRaw.sumMN : 0;
    const mnVal = pct * adjAnimalVolDailyMN;
    const msVal = mnVal * (item.itemInfo.msPercent / 100);
    return { ...item, mnVal, msVal, pct: pct * 100, batchMN: item.mnVal };
  });

  const adjAnimalItems = [...adjAnimalConcItems, ...adjAnimalVolItems];
  const adjTotalConcMS = adjAnimalConcItems.reduce((acc, i) => acc + i.msVal, 0);
  const adjTotalVolMS = adjAnimalVolItems.reduce((acc, i) => acc + i.msVal, 0);
  const adjTotalMS = adjTotalConcMS + adjTotalVolMS;
  const adjTotalMN = adjAnimalConcDailyMN + adjAnimalVolDailyMN;

  let adjPB = 0, adjNDT = 0, adjFDN = 0, adjAmido = 0, adjCa = 0, adjP = 0;
  adjAnimalItems.forEach(c => {
    adjPB += c.msVal * c.itemInfo.pb;
    adjNDT += c.msVal * c.itemInfo.ndt;
    adjFDN += c.msVal * c.itemInfo.fdn;
    adjAmido += c.msVal * c.itemInfo.amido;
    adjCa += c.msVal * c.itemInfo.calcio;
    adjP += c.msVal * c.itemInfo.fosforo;
  });

  // Unique list of concentrate ingredients for side-by-side comparison
  const allConcIngredientIds = Array.from(new Set([
    ...currConcRaw.items.map(i => i.ingredientId),
    ...adjConcRaw.items.map(i => i.ingredientId)
  ]));

  // Unique list of volumoso ingredients for side-by-side comparison
  const allVolIngredientIds = Array.from(new Set([
    ...currVolRaw.items.map(i => i.ingredientId),
    ...adjVolRaw.items.map(i => i.ingredientId)
  ]));

  // Unique list of all daily diet ingredients for side-by-side comparison
  const allDailyIngredientIds = Array.from(new Set([
    ...currAnimalItems.map(i => i.ingredientId),
    ...adjAnimalItems.map(i => i.ingredientId)
  ]));

  const getNutrientColor = (value: number, target: number) => {
    if (!target) return 'text-gray-800';
    if (value < target * 0.90) return 'text-red-500';
    if (value < target * 0.98) return 'text-amber-600';
    return 'text-green-600';
  };

  const renderIndicator = (value: number, target: number) => {
    if (!target) return null;
    const diff = value - target;
    const threshold = target * 0.02;
    if (Math.abs(diff) < threshold) return null;
    if (diff < 0) return <ArrowUp size={12} className="text-red-500" />;
    return <ArrowDown size={12} className="text-blue-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
            {hasAdjustedDiet ? 'Fase 6: Relatório Comparativo Completo' : 'Fase 6: Relatório Diagnóstico da Dieta Atual'}
          </span>
          <h2 className="text-xl font-black text-gray-800 mt-1">
            {hasAdjustedDiet ? 'Relatório Comparativo: Dieta Atual vs Dieta Ajustada' : 'Relatório Diagnóstico da Propriedade'}
          </h2>
        </div>

        <div className="flex gap-3">
          {!hasAdjustedDiet && onNavigateToAdjusted && (
            <button 
              type="button"
              onClick={onNavigateToAdjusted}
              className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-purple-700 transition shadow-sm cursor-pointer text-sm"
            >
              Formular Dieta Ajustada <ArrowRight size={16} />
            </button>
          )}

          <button 
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-800 transition shadow-sm cursor-pointer text-sm"
          >
            <Printer size={18} /> Imprimir Relatório
          </button>
        </div>
      </div>

      {/* Printable Report Document */}
      <div className="flex flex-col gap-8 print:gap-0 w-full max-w-[210mm] mx-auto">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body { background: white !important; }
            .max-w-4xl { max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
            .print\\:shadow-none { box-shadow: none !important; }
            .print\\:border-none { border: none !important; }
            .print-page { 
              padding: 0 !important; 
              margin: 0 !important; 
              box-shadow: none !important; 
              border: none !important;
              page-break-after: always;
              min-height: 297mm;
            }
            .print-page:last-child {
              page-break-after: auto;
            }
            @page {
              size: A4;
              margin: 15mm;
            }
          }
        ` }} />

        {/* ================= PAGE 1 ================= */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 sm:p-12 print:shadow-none print:border-none print:p-0 print:m-0 w-full print-page overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-end border-b-4 border-blue-700 pb-4 mb-6">
            <img 
              src="https://app.saega.com.br/assets/logotipo-so-CgB1U75J.png" 
              alt="Saega" 
              className="h-10" 
            />
            <div className="text-right">
              <div className="text-xs font-bold text-gray-400">DATA DE EMISSÃO</div>
              <div className="text-sm font-bold text-gray-700">{new Date().toLocaleDateString('pt-BR')}</div>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-1">
              {hasAdjustedDiet ? 'Relatório de Formulação e Comparativo Técnico' : 'Relatório Diagnóstico Nutricional da Propriedade'}
            </div>
            <h1 className="text-2xl font-black text-blue-800 uppercase">
              {data.name || 'Formulação sem Nome'}
            </h1>
          </div>

          {/* 1. PERFIL DO ANIMAL */}
          <section className="mb-6 break-inside-avoid">
            <h3 className="text-xs font-bold text-blue-800 tracking-wider uppercase mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-700"></span>
              1. Perfil do Animal
            </h3>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-wrap gap-8 text-xs">
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Categoria</div>
                <div className="font-bold text-gray-800">{data.category || '-'}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Subcategoria</div>
                <div className="font-bold text-gray-800">{data.subcategory || '-'}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Peso Vivo (PV)</div>
                <div className="font-bold text-gray-800">{data.weight || '-'} kg</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Quant. Animais</div>
                <div className="font-bold text-gray-800">{data.quantity || '1'} cabeças</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Período</div>
                <div className="font-bold text-gray-800">{data.days || '1'} dias</div>
              </div>
            </div>
          </section>

          {/* 2. QUADRO RESUMO COMPARATIVO: DIETA ATUAL VS DIETA AJUSTADA VS META */}
          <section className="mb-6 break-inside-avoid">
            <h3 className="text-xs font-bold text-blue-800 tracking-wider uppercase mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-700"></span>
                2. Resumo Comparativo: Dieta Atual vs Dieta Ajustada (por Cabeça/Dia)
              </span>
              <span className="text-[11px] text-gray-400 lowercase font-normal">
                (Consumo por animal/dia)
              </span>
            </h3>

            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-blue-50/80 border-b border-gray-200 text-blue-950 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3 text-left">Parâmetro de Consumo</th>
                    <th className="py-2.5 px-3 text-right bg-orange-50/50 text-orange-900 border-l border-orange-100">
                      Dieta Atual (Fazenda)
                    </th>
                    <th className="py-2.5 px-3 text-right bg-blue-50/70 text-blue-900 border-l border-blue-100">
                      Dieta Ajustada (Proposta)
                    </th>
                    <th className="py-2.5 px-3 text-right border-l border-gray-200 text-gray-600">
                      Meta Exigência (Perfil)
                    </th>
                    <th className="py-2.5 px-3 text-right border-l border-gray-200 text-gray-600">
                      Variação
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* Total Concentrado MN */}
                  <tr>
                    <td className="py-2 px-3 font-bold text-gray-700">Total Concentrado (MN)</td>
                    <td className="py-2 px-3 text-right font-black text-orange-900 bg-orange-50/20 border-l border-orange-100">
                      {currAnimalConcDailyMN.toFixed(2)} kg/dia
                    </td>
                    <td className="py-2 px-3 text-right font-black text-blue-900 bg-blue-50/20 border-l border-blue-100">
                      {hasAdjustedDiet ? `${adjAnimalConcDailyMN.toFixed(2)} kg/dia` : '-'}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-500 border-l border-gray-200">-</td>
                    <td className="py-2 px-3 text-right font-bold border-l border-gray-200 text-gray-700">
                      {hasAdjustedDiet ? `${(adjAnimalConcDailyMN - currAnimalConcDailyMN >= 0 ? '+' : '')}${(adjAnimalConcDailyMN - currAnimalConcDailyMN).toFixed(2)} kg` : '-'}
                    </td>
                  </tr>

                  {/* Total Concentrado MS */}
                  <tr>
                    <td className="py-2 px-3 font-semibold text-gray-600 pl-6">↳ Concentrado em MS</td>
                    <td className="py-2 px-3 text-right font-bold text-orange-800 bg-orange-50/20 border-l border-orange-100">
                      {currTotalConcMS.toFixed(2)} kg MS
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-blue-800 bg-blue-50/20 border-l border-blue-100">
                      {hasAdjustedDiet ? `${adjTotalConcMS.toFixed(2)} kg MS` : '-'}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-gray-600 border-l border-gray-200">
                      {metaConcentradoMS.toFixed(2)} kg MS ({currentTarget?.concentradoPercent || 35}%)
                    </td>
                    <td className="py-2 px-3 text-right font-bold border-l border-gray-200 text-gray-700">
                      {hasAdjustedDiet ? `${(adjTotalConcMS - currTotalConcMS >= 0 ? '+' : '')}${(adjTotalConcMS - currTotalConcMS).toFixed(2)} kg` : '-'}
                    </td>
                  </tr>

                  {/* Total Volumoso MN */}
                  <tr>
                    <td className="py-2 px-3 font-bold text-gray-700">Total Volumoso (MN)</td>
                    <td className="py-2 px-3 text-right font-black text-green-900 bg-orange-50/20 border-l border-orange-100">
                      {currAnimalVolDailyMN.toFixed(2)} kg/dia
                    </td>
                    <td className="py-2 px-3 text-right font-black text-blue-900 bg-blue-50/20 border-l border-blue-100">
                      {hasAdjustedDiet ? `${adjAnimalVolDailyMN.toFixed(2)} kg/dia` : '-'}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-500 border-l border-gray-200">-</td>
                    <td className="py-2 px-3 text-right font-bold border-l border-gray-200 text-gray-700">
                      {hasAdjustedDiet ? `${(adjAnimalVolDailyMN - currAnimalVolDailyMN >= 0 ? '+' : '')}${(adjAnimalVolDailyMN - currAnimalVolDailyMN).toFixed(2)} kg` : '-'}
                    </td>
                  </tr>

                  {/* Total Volumoso MS */}
                  <tr>
                    <td className="py-2 px-3 font-semibold text-gray-600 pl-6">↳ Volumoso em MS</td>
                    <td className="py-2 px-3 text-right font-bold text-green-800 bg-orange-50/20 border-l border-orange-100">
                      {currTotalVolMS.toFixed(2)} kg MS
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-blue-800 bg-blue-50/20 border-l border-blue-100">
                      {hasAdjustedDiet ? `${adjTotalVolMS.toFixed(2)} kg MS` : '-'}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-gray-600 border-l border-gray-200">
                      {metaVolumosoMS.toFixed(2)} kg MS ({currentTarget?.volumosoPercent || 65}%)
                    </td>
                    <td className="py-2 px-3 text-right font-bold border-l border-gray-200 text-gray-700">
                      {hasAdjustedDiet ? `${(adjTotalVolMS - currTotalVolMS >= 0 ? '+' : '')}${(adjTotalVolMS - currTotalVolMS).toFixed(2)} kg` : '-'}
                    </td>
                  </tr>

                  {/* Proporção da Dieta */}
                  <tr className="bg-gray-50/50">
                    <td className="py-2 px-3 font-bold text-gray-800">Proporção Concentrado : Volumoso (MN)</td>
                    <td className="py-2 px-3 text-right font-bold text-orange-900 bg-orange-50/20 border-l border-orange-100">
                      {currTotalMN > 0 ? `${((currAnimalConcDailyMN / currTotalMN) * 100).toFixed(0)}% C : ${((currAnimalVolDailyMN / currTotalMN) * 100).toFixed(0)}% V` : '-'}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-blue-900 bg-blue-50/20 border-l border-blue-100">
                      {hasAdjustedDiet && adjTotalMN > 0 ? `${((adjAnimalConcDailyMN / adjTotalMN) * 100).toFixed(0)}% C : ${((adjAnimalVolDailyMN / adjTotalMN) * 100).toFixed(0)}% V` : '-'}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-500 border-l border-gray-200">-</td>
                    <td className="py-2 px-3 text-right font-bold border-l border-gray-200 text-gray-700">Ajustado</td>
                  </tr>

                  {/* Consumo Matéria Seca (CMS) Total */}
                  <tr className="bg-blue-50/40 font-black">
                    <td className="py-2.5 px-3 text-blue-950 uppercase text-[11px]">Consumo Total Matéria Seca (CMS)</td>
                    <td className="py-2.5 px-3 text-right text-orange-950 bg-orange-100/40 border-l border-orange-200 text-sm">
                      {currTotalMS.toFixed(2)} kg MS
                    </td>
                    <td className="py-2.5 px-3 text-right text-blue-950 bg-blue-100/50 border-l border-blue-200 text-sm">
                      {hasAdjustedDiet ? `${adjTotalMS.toFixed(2)} kg MS` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-blue-900 border-l border-blue-200 text-sm">
                      {metaCMS.toFixed(2)} kg MS
                    </td>
                    <td className="py-2.5 px-3 text-right text-green-700 border-l border-blue-200">
                      {hasAdjustedDiet ? `${(adjTotalMS - currTotalMS >= 0 ? '+' : '')}${(adjTotalMS - currTotalMS).toFixed(2)} kg` : '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 3. FÓRMULA DO CONCENTRADO: COMPARATIVO LADO A LADO */}
          <section className="mb-6 break-inside-avoid">
            <h3 className="text-xs font-bold text-blue-800 tracking-wider uppercase mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                3. Fórmula do Concentrado: Comparativo Dieta Atual vs Dieta Ajustada
              </span>
              <span className="text-[11px] text-gray-400 lowercase font-normal">
                (Mistura no Misturador - MN)
              </span>
            </h3>

            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 font-bold uppercase text-[10px] text-gray-500">
                    <th className="py-2 px-3 text-left">Insumo</th>
                    <th className="py-2 px-3 text-center">Tipo</th>
                    <th className="py-2 px-3 text-right bg-orange-50/60 text-orange-900 border-l border-orange-100">
                      Dieta Atual (kg MN)
                    </th>
                    <th className="py-2 px-3 text-right bg-orange-50/60 text-orange-900">
                      % Atual
                    </th>
                    <th className="py-2 px-3 text-right bg-blue-50/70 text-blue-900 border-l border-blue-100">
                      Dieta Ajustada (kg MN)
                    </th>
                    <th className="py-2 px-3 text-right bg-blue-50/70 text-blue-900">
                      % Ajustada
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allConcIngredientIds.map(ingId => {
                    const currItem = currConcRaw.items.find(i => i.ingredientId === ingId);
                    const adjItem = adjConcRaw.items.find(i => i.ingredientId === ingId);
                    const itemDef = MOCK_INGREDIENTS.find(i => i.id === ingId);
                    const name = itemDef?.name || currItem?.itemInfo.name || adjItem?.itemInfo.name || ingId;
                    const type = itemDef?.type || currItem?.itemInfo.type || adjItem?.itemInfo.type || 'Concentrado';

                    const currMn = currItem ? currItem.mnVal : 0;
                    const currPct = currConcRaw.sumMN > 0 && currItem ? ((currItem.mnVal / currConcRaw.sumMN) * 100).toFixed(1) : '-';

                    const adjMn = adjItem ? adjItem.mnVal : 0;
                    const adjPct = adjConcRaw.sumMN > 0 && adjItem ? ((adjItem.mnVal / adjConcRaw.sumMN) * 100).toFixed(1) : '-';

                    return (
                      <tr key={ingId} className="hover:bg-gray-50/30">
                        <td className="py-2 px-3 font-semibold text-gray-800">{name}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                            type === 'Concentrado' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            {type}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-orange-900 bg-orange-50/20 border-l border-orange-100">
                          {currItem ? `${currMn.toFixed(2)} kg` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right text-orange-700 bg-orange-50/20 font-medium">
                          {currPct !== '-' ? `${currPct}%` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-blue-900 bg-blue-50/20 border-l border-blue-100">
                          {adjItem ? `${adjMn.toFixed(2)} kg` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right text-blue-700 bg-blue-50/20 font-medium">
                          {adjPct !== '-' ? `${adjPct}%` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                  {allConcIngredientIds.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-gray-400 text-xs">
                        Nenhum concentrado declarado
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="border-t-2 border-gray-200 font-bold">
                  <tr className="bg-gray-50">
                    <td colSpan={2} className="py-2.5 px-3 uppercase text-gray-700 text-[10px]">
                      Total da Mistura de Concentrado (MN)
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-orange-900 bg-orange-50/60 border-l border-orange-200">
                      {currConcRaw.sumMN.toFixed(2)} kg MN
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-orange-800 bg-orange-50/60">
                      100%
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-blue-900 bg-blue-50/70 border-l border-blue-200">
                      {hasAdjustedDiet ? `${adjConcRaw.sumMN.toFixed(2)} kg MN` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-800 bg-blue-50/70">
                      {hasAdjustedDiet ? '100%' : '-'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* 4. VOLUMOSO: COMPARATIVO LADO A LADO */}
          <section className="mb-4 break-inside-avoid">
            <h3 className="text-xs font-bold text-blue-800 tracking-wider uppercase mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-600"></span>
                4. Volumoso: Comparativo Dieta Atual vs Dieta Ajustada
              </span>
              <span className="text-[11px] text-gray-400 lowercase font-normal">
                (Mistura / Fornecimento MN)
              </span>
            </h3>

            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 font-bold uppercase text-[10px] text-gray-500">
                    <th className="py-2 px-3 text-left">Insumo</th>
                    <th className="py-2 px-3 text-right bg-orange-50/60 text-orange-900 border-l border-orange-100">
                      Dieta Atual (kg MN)
                    </th>
                    <th className="py-2 px-3 text-right bg-orange-50/60 text-orange-900">
                      % Atual
                    </th>
                    <th className="py-2 px-3 text-right bg-blue-50/70 text-blue-900 border-l border-blue-100">
                      Dieta Ajustada (kg MN)
                    </th>
                    <th className="py-2 px-3 text-right bg-blue-50/70 text-blue-900">
                      % Ajustada
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allVolIngredientIds.map(ingId => {
                    const currItem = currVolRaw.items.find(i => i.ingredientId === ingId);
                    const adjItem = adjVolRaw.items.find(i => i.ingredientId === ingId);
                    const itemDef = MOCK_INGREDIENTS.find(i => i.id === ingId);
                    const name = itemDef?.name || currItem?.itemInfo.name || adjItem?.itemInfo.name || ingId;

                    const currMn = currItem ? currItem.mnVal : 0;
                    const currPct = currVolRaw.sumMN > 0 && currItem ? ((currItem.mnVal / currVolRaw.sumMN) * 100).toFixed(1) : '-';

                    const adjMn = adjItem ? adjItem.mnVal : 0;
                    const adjPct = adjVolRaw.sumMN > 0 && adjItem ? ((adjItem.mnVal / adjVolRaw.sumMN) * 100).toFixed(1) : '-';

                    return (
                      <tr key={ingId} className="hover:bg-gray-50/30">
                        <td className="py-2 px-3 font-semibold text-gray-800">{name}</td>
                        <td className="py-2 px-3 text-right font-bold text-green-900 bg-orange-50/20 border-l border-orange-100">
                          {currItem ? `${currMn.toFixed(2)} kg` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right text-green-700 bg-orange-50/20 font-medium">
                          {currPct !== '-' ? `${currPct}%` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-blue-900 bg-blue-50/20 border-l border-blue-100">
                          {adjItem ? `${adjMn.toFixed(2)} kg` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right text-blue-700 bg-blue-50/20 font-medium">
                          {adjPct !== '-' ? `${adjPct}%` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                  {allVolIngredientIds.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-400 text-xs">
                        Nenhum volumoso declarado
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="border-t-2 border-gray-200 font-bold">
                  <tr className="bg-gray-50">
                    <td className="py-2.5 px-3 uppercase text-gray-700 text-[10px]">
                      Total do Volumoso (MN)
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-green-900 bg-orange-50/60 border-l border-orange-200">
                      {currVolRaw.sumMN.toFixed(2)} kg MN
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-green-800 bg-orange-50/60">
                      100%
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-blue-900 bg-blue-50/70 border-l border-blue-200">
                      {hasAdjustedDiet ? `${adjVolRaw.sumMN.toFixed(2)} kg MN` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-800 bg-blue-50/70">
                      {hasAdjustedDiet ? '100%' : '-'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </div>

        {/* ================= PAGE 2 ================= */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 sm:p-12 print:shadow-none print:border-none print:p-0 print:m-0 w-full print-page overflow-hidden">
          {/* Header on page 2 */}
          <div className="flex justify-between items-end border-b-2 border-gray-200 pb-3 mb-6">
            <span className="text-xs font-bold text-blue-700 uppercase">SAEGA NUTRIÇÃO - {data.name || 'FÓRMULA'}</span>
            <span className="text-xs text-gray-400 font-bold">PÁGINA 2 / 2</span>
          </div>

          {/* 5. DIETA DIÁRIA POR ANIMAL: COMPARATIVO LADO A LADO */}
          <section className="mb-6 break-inside-avoid">
            <h3 className="text-xs font-bold text-blue-800 tracking-wider uppercase mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-700"></span>
                5. Dieta Diária por Animal: Dieta Atual vs Dieta Ajustada (1 Cabeça/Dia)
              </span>
              <span className="text-[11px] text-gray-400 lowercase font-normal">
                (Consumo individual consolidado)
              </span>
            </h3>

            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 font-bold uppercase text-[10px] text-gray-500">
                    <th className="py-2 px-3 text-left">Insumo</th>
                    <th className="py-2 px-2 text-center">Tipo</th>
                    <th className="py-2 px-3 text-right bg-orange-50/60 text-orange-900 border-l border-orange-100">
                      Atual MN (kg)
                    </th>
                    <th className="py-2 px-3 text-right bg-orange-50/60 text-orange-900">
                      Atual MS (kg)
                    </th>
                    <th className="py-2 px-3 text-right bg-orange-50/60 text-orange-900">
                      % MS
                    </th>
                    <th className="py-2 px-3 text-right bg-blue-50/70 text-blue-900 border-l border-blue-100">
                      Ajust. MN (kg)
                    </th>
                    <th className="py-2 px-3 text-right bg-blue-50/70 text-blue-900">
                      Ajust. MS (kg)
                    </th>
                    <th className="py-2 px-3 text-right bg-blue-50/70 text-blue-900">
                      % MS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allDailyIngredientIds.map(ingId => {
                    const currItem = currAnimalItems.find(i => i.ingredientId === ingId);
                    const adjItem = adjAnimalItems.find(i => i.ingredientId === ingId);
                    const itemDef = MOCK_INGREDIENTS.find(i => i.id === ingId);
                    const name = itemDef?.name || currItem?.itemInfo.name || adjItem?.itemInfo.name || ingId;
                    const type = itemDef?.type || currItem?.itemInfo.type || adjItem?.itemInfo.type || 'Concentrado';

                    const currMn = currItem ? currItem.mnVal : 0;
                    const currMs = currItem ? currItem.msVal : 0;
                    const currPct = currTotalMS > 0 && currItem ? ((currItem.msVal / currTotalMS) * 100).toFixed(1) : '-';

                    const adjMn = adjItem ? adjItem.mnVal : 0;
                    const adjMs = adjItem ? adjItem.msVal : 0;
                    const adjPct = adjTotalMS > 0 && adjItem ? ((adjItem.msVal / adjTotalMS) * 100).toFixed(1) : '-';

                    return (
                      <tr key={ingId} className="hover:bg-gray-50/30">
                        <td className="py-2 px-3 font-bold text-gray-800">{name}</td>
                        <td className="py-2 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                            type === 'Concentrado' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                            type === 'Mineral' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                            'bg-green-50 text-green-700 border-green-200'
                          }`}>
                            {type}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-medium text-gray-800 bg-orange-50/20 border-l border-orange-100">
                          {currItem ? `${currMn.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-orange-950 bg-orange-50/20">
                          {currItem ? `${currMs.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right text-gray-500 bg-orange-50/20 font-semibold">
                          {currPct !== '-' ? `${currPct}%` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-medium text-gray-800 bg-blue-50/20 border-l border-blue-100">
                          {adjItem ? `${adjMn.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-blue-950 bg-blue-50/20">
                          {adjItem ? `${adjMs.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right text-blue-600 bg-blue-50/20 font-semibold">
                          {adjPct !== '-' ? `${adjPct}%` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t-2 border-gray-200 font-bold">
                  {/* Subtotal Concentrado */}
                  <tr className="bg-[#fffcf8]">
                    <td colSpan={2} className="py-2 px-3 text-orange-800 uppercase text-[10px]">
                      Subtotal Concentrado (MN / MS)
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-orange-900 border-l border-orange-100">
                      {currAnimalConcDailyMN.toFixed(2)} kg
                    </td>
                    <td className="py-2 px-3 text-right font-black text-orange-950">
                      {currTotalConcMS.toFixed(2)} kg
                    </td>
                    <td className="py-2 px-3 text-right text-orange-700">
                      {currTotalMS > 0 ? ((currTotalConcMS / currTotalMS) * 100).toFixed(0) : 0}%
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-blue-900 border-l border-blue-100">
                      {hasAdjustedDiet ? `${adjAnimalConcDailyMN.toFixed(2)} kg` : '-'}
                    </td>
                    <td className="py-2 px-3 text-right font-black text-blue-950">
                      {hasAdjustedDiet ? `${adjTotalConcMS.toFixed(2)} kg` : '-'}
                    </td>
                    <td className="py-2 px-3 text-right text-blue-700">
                      {hasAdjustedDiet && adjTotalMS > 0 ? `${((adjTotalConcMS / adjTotalMS) * 100).toFixed(0)}%` : '-'}
                    </td>
                  </tr>

                  {/* Subtotal Volumoso */}
                  <tr className="bg-[#f7fdf9]">
                    <td colSpan={2} className="py-2 px-3 text-green-800 uppercase text-[10px]">
                      Subtotal Volumoso (MN / MS)
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-green-900 border-l border-orange-100">
                      {currAnimalVolDailyMN.toFixed(2)} kg
                    </td>
                    <td className="py-2 px-3 text-right font-black text-green-950">
                      {currTotalVolMS.toFixed(2)} kg
                    </td>
                    <td className="py-2 px-3 text-right text-green-700">
                      {currTotalMS > 0 ? ((currTotalVolMS / currTotalMS) * 100).toFixed(0) : 0}%
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-blue-900 border-l border-blue-100">
                      {hasAdjustedDiet ? `${adjAnimalVolDailyMN.toFixed(2)} kg` : '-'}
                    </td>
                    <td className="py-2 px-3 text-right font-black text-blue-950">
                      {hasAdjustedDiet ? `${adjTotalVolMS.toFixed(2)} kg` : '-'}
                    </td>
                    <td className="py-2 px-3 text-right text-blue-700">
                      {hasAdjustedDiet && adjTotalMS > 0 ? `${((adjTotalVolMS / adjTotalMS) * 100).toFixed(0)}%` : '-'}
                    </td>
                  </tr>

                  {/* TOTAL GERAL DA DIETA */}
                  <tr className="bg-blue-900 text-white font-black text-xs">
                    <td colSpan={2} className="py-2.5 px-3 uppercase tracking-wider">
                      TOTAL DIÁRIO POR CABEÇA
                    </td>
                    <td className="py-2.5 px-3 text-right border-l border-blue-800 text-amber-300">
                      {currTotalMN.toFixed(2)} kg MN
                    </td>
                    <td className="py-2.5 px-3 text-right text-white">
                      {currTotalMS.toFixed(2)} kg MS
                    </td>
                    <td className="py-2.5 px-3 text-right text-blue-200">
                      100%
                    </td>
                    <td className="py-2.5 px-3 text-right border-l border-blue-800 text-amber-300">
                      {hasAdjustedDiet ? `${adjTotalMN.toFixed(2)} kg MN` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-white">
                      {hasAdjustedDiet ? `${adjTotalMS.toFixed(2)} kg MS` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-blue-200">
                      {hasAdjustedDiet ? '100%' : '-'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* 6. DIAGNÓSTICO NUTRICIONAL CONSOLIDADO: DIETA ATUAL VS AJUSTADA VS EXIGÊNCIA */}
          <section className="mb-6 break-inside-avoid">
            <h3 className="text-xs font-bold text-blue-800 tracking-wider uppercase mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-700"></span>
                6. Diagnóstico Nutricional Consolidado: Dieta Atual vs Dieta Ajustada vs Exigência
              </span>
              <span className="text-[11px] text-gray-400 lowercase font-normal">
                (Valores na Matéria Seca da Dieta)
              </span>
            </h3>

            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-blue-50/80 border-b border-gray-200 text-blue-950 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3 text-left">Nutriente</th>
                    <th className="py-2.5 px-3 text-right bg-orange-50/60 text-orange-950 border-l border-orange-100">
                      Dieta Atual (% e g/kg)
                    </th>
                    <th className="py-2.5 px-3 text-right bg-blue-50/70 text-blue-950 border-l border-blue-100">
                      Dieta Ajustada (% e g/kg)
                    </th>
                    <th className="py-2.5 px-3 text-right border-l border-gray-200 text-gray-700">
                      Exigência (Perfil)
                    </th>
                    <th className="py-2.5 px-3 text-right border-l border-gray-200 text-gray-700">
                      Status / Evolução
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    {
                      label: 'Proteína Bruta (PB)',
                      currVal: currTotalMS > 0 ? currPB / currTotalMS : 0,
                      adjVal: adjTotalMS > 0 ? adjPB / adjTotalMS : 0,
                      target: currentTarget?.pbTmr || 0,
                    },
                    {
                      label: 'Nutrientes Digestíveis Totais (NDT)',
                      currVal: currTotalMS > 0 ? currNDT / currTotalMS : 0,
                      adjVal: adjTotalMS > 0 ? adjNDT / adjTotalMS : 0,
                      target: currentTarget?.ndtTmr || 0,
                    },
                    {
                      label: 'Fibra em Detergente Neutro (FDN)',
                      currVal: currTotalMS > 0 ? currFDN / currTotalMS : 0,
                      adjVal: adjTotalMS > 0 ? adjFDN / adjTotalMS : 0,
                      target: currentTarget?.fdnTmr || 0,
                    },
                    {
                      label: 'Amido',
                      currVal: currTotalMS > 0 ? currAmido / currTotalMS : 0,
                      adjVal: adjTotalMS > 0 ? adjAmido / adjTotalMS : 0,
                      target: (currentTarget?.amidoPercent || 0) * 10,
                    },
                    {
                      label: 'Cálcio (Ca)',
                      currVal: currTotalMS > 0 ? currCa / currTotalMS : 0,
                      adjVal: adjTotalMS > 0 ? adjCa / adjTotalMS : 0,
                      target: 0,
                    },
                    {
                      label: 'Fósforo (P)',
                      currVal: currTotalMS > 0 ? currP / currTotalMS : 0,
                      adjVal: adjTotalMS > 0 ? adjP / adjTotalMS : 0,
                      target: 0,
                    },
                  ].map((nut, idx) => {
                    const currPct = (nut.currVal / 10).toFixed(1);
                    const adjPct = (nut.adjVal / 10).toFixed(1);
                    const targetPct = nut.target > 0 ? (nut.target / 10).toFixed(0) : '-';

                    return (
                      <tr key={idx} className="hover:bg-gray-50/30">
                        <td className="py-2.5 px-3 font-bold text-gray-800">{nut.label}</td>
                        <td className="py-2.5 px-3 text-right bg-orange-50/20 border-l border-orange-100">
                          <span className={`font-black ${getNutrientColor(nut.currVal, nut.target)}`}>
                            {currPct}%
                          </span>
                          <span className="text-[10px] text-gray-400 ml-1.5">
                            ({nut.currVal.toFixed(1)} g/kg)
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right bg-blue-50/20 border-l border-blue-100">
                          {hasAdjustedDiet ? (
                            <>
                              <span className={`font-black ${getNutrientColor(nut.adjVal, nut.target)}`}>
                                {adjPct}%
                              </span>
                              <span className="text-[10px] text-blue-400 ml-1.5">
                                ({nut.adjVal.toFixed(1)} g/kg)
                              </span>
                            </>
                          ) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-gray-700 border-l border-gray-200">
                          {targetPct !== '-' ? `${targetPct}% (${nut.target} g/kg)` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold border-l border-gray-200">
                          {hasAdjustedDiet ? (
                            <span className="inline-flex items-center gap-1 text-green-700">
                              <CheckCircle2 size={12} /> Equilibrado
                            </span>
                          ) : (
                            <span className="text-gray-500">Diagnóstico</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* 7. MISTURA DO LOTE (Animais x Dias): COMPARATIVO LADO A LADO */}
          {animais > 1 && (
            <section className="mb-4 break-inside-avoid">
              <h3 className="text-xs font-bold text-blue-800 tracking-wider uppercase mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-700"></span>
                  7. Mistura do Lote: Dieta Atual vs Dieta Ajustada ({animais} Animais, {days} Dias)
                </span>
                <span className="text-[11px] text-gray-400 lowercase font-normal">
                  (Total do lote no período em MN)
                </span>
              </h3>

              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 font-bold uppercase text-[10px] text-gray-500">
                      <th className="py-2 px-3 text-left">Insumo</th>
                      <th className="py-2 px-3 text-right bg-orange-50/60 text-orange-900 border-l border-orange-100">
                        Atual Diária (MN)
                      </th>
                      <th className="py-2 px-3 text-right bg-orange-50/60 text-orange-900">
                        Atual Total ({days} d)
                      </th>
                      <th className="py-2 px-3 text-right bg-blue-50/70 text-blue-900 border-l border-blue-100">
                        Ajust. Diária (MN)
                      </th>
                      <th className="py-2 px-3 text-right bg-blue-50/70 text-blue-900">
                        Ajust. Total ({days} d)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allDailyIngredientIds.map(ingId => {
                      const currItem = currAnimalItems.find(i => i.ingredientId === ingId);
                      const adjItem = adjAnimalItems.find(i => i.ingredientId === ingId);
                      const itemDef = MOCK_INGREDIENTS.find(i => i.id === ingId);
                      const name = itemDef?.name || currItem?.itemInfo.name || adjItem?.itemInfo.name || ingId;

                      const currDailyLot = currItem ? currItem.mnVal * animais : 0;
                      const currTotalLot = currDailyLot * days;

                      const adjDailyLot = adjItem ? adjItem.mnVal * animais : 0;
                      const adjTotalLot = adjDailyLot * days;

                      return (
                        <tr key={ingId} className="hover:bg-gray-50/30">
                          <td className="py-2 px-3 font-semibold text-gray-800">{name}</td>
                          <td className="py-2 px-3 text-right font-medium text-orange-900 bg-orange-50/20 border-l border-orange-100">
                            {currItem ? `${currDailyLot.toFixed(1)} kg` : '-'}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-orange-950 bg-orange-50/20">
                            {currItem ? `${currTotalLot.toFixed(0)} kg` : '-'}
                          </td>
                          <td className="py-2 px-3 text-right font-medium text-blue-900 bg-blue-50/20 border-l border-blue-100">
                            {adjItem ? `${adjDailyLot.toFixed(1)} kg` : '-'}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-blue-950 bg-blue-50/20">
                            {adjItem ? `${adjTotalLot.toFixed(0)} kg` : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t-2 border-gray-200 font-bold bg-gray-50">
                    <tr>
                      <td className="py-2.5 px-3 uppercase text-gray-700 text-[10px]">
                        Total Geral do Lote ({animais} Cab, {days} Dias)
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-orange-900 bg-orange-50/60 border-l border-orange-200">
                        {(currTotalMN * animais).toFixed(1)} kg/dia
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-orange-950 bg-orange-50/60">
                        {(currTotalMN * animais * days).toFixed(0)} kg MN
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-blue-900 bg-blue-50/70 border-l border-blue-200">
                        {hasAdjustedDiet ? `${(adjTotalMN * animais).toFixed(1)} kg/dia` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-blue-950 bg-blue-50/70">
                        {hasAdjustedDiet ? `${(adjTotalMN * animais * days).toFixed(0)} kg MN` : '-'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          )}

          {/* Footer note */}
          <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
            <span>SAEGA - Sistema de Avaliação e Formulação Nutricional</span>
            <span>Relatório gerado em 2 páginas A4 - Uso Profissional</span>
          </div>
        </div>
      </div>
    </div>
  );
}
