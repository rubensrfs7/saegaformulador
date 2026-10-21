import { Printer, ArrowUp, ArrowDown, CheckCircle2, ArrowRight, Sliders, User, BarChart2, Layers, Sprout, PieChart, Activity, Users, DollarSign, X, Check, RotateCcw } from 'lucide-react';
import { FormulationState } from '../../types';
import { MOCK_INGREDIENTS, CONSUMPTION_TARGETS } from '../../data';
import { useState } from 'react';

interface Props {
  data: FormulationState;
  onNavigateToAdjusted?: () => void;
}

export default function Report({ data, onNavigateToAdjusted }: Props) {
  const [isCustomizingModalOpen, setIsCustomizingModalOpen] = useState(false);
  const [pageOrientation, setPageOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [sections, setSections] = useState([
    {
      id: 1,
      defaultTitle: '1. Perfil do Animal',
      title: '1. Perfil do Animal',
      enabled: true,
      iconName: 'User'
    },
    {
      id: 2,
      defaultTitle: '2. Resumo Comparativo: Dieta Atual vs Dieta Ajustada (por Cabeça/Dia)',
      title: '2. Resumo Comparativo: Dieta Atual vs Dieta Ajustada (por Cabeça/Dia)',
      enabled: true,
      iconName: 'BarChart2'
    },
    {
      id: 3,
      defaultTitle: '3. Fórmula do Concentrado: Comparativo Dieta Atual vs Dieta Ajustada',
      title: '3. Fórmula do Concentrado: Comparativo Dieta Atual vs Dieta Ajustada',
      enabled: true,
      iconName: 'Layers'
    },
    {
      id: 4,
      defaultTitle: '4. Volumoso: Comparativo Dieta Atual vs Dieta Ajustada',
      title: '4. Volumoso: Comparativo Dieta Atual vs Dieta Ajustada',
      enabled: true,
      iconName: 'Sprout'
    },
    {
      id: 5,
      defaultTitle: '5. Dieta Diária por Animal: Dieta Atual vs Dieta Ajustada (1 Cabeça/Dia)',
      title: '5. Dieta Diária por Animal: Dieta Atual vs Dieta Ajustada (1 Cabeça/Dia)',
      enabled: true,
      iconName: 'PieChart'
    },
    {
      id: 6,
      defaultTitle: '6. Diagnóstico Nutricional Consolidado: Dieta Atual vs Dieta Ajustada vs Exigência',
      title: '6. Diagnóstico Nutricional Consolidado: Dieta Atual vs Dieta Ajustada vs Exigência',
      enabled: true,
      iconName: 'Activity'
    },
    {
      id: 7,
      defaultTitle: '7. Mistura do Lote: Dieta Atual vs Dieta Ajustada',
      title: '7. Mistura do Lote: Dieta Atual vs Dieta Ajustada',
      enabled: true,
      iconName: 'Users'
    },
    {
      id: 8,
      defaultTitle: '8. Detalhamento de Custos por Insumo e Orçamento de Compras do Lote',
      title: '8. Detalhamento de Custos por Insumo e Orçamento de Compras do Lote',
      enabled: true,
      iconName: 'DollarSign'
    }
  ]);

  // Cópia das seções ao abrir o modal, para que "Cancelar" descarte as alterações
  const [sectionsBackup, setSectionsBackup] = useState<typeof sections | null>(null);

  const openCustomizingModal = () => {
    setSectionsBackup(sections.map(s => ({ ...s })));
    setIsCustomizingModalOpen(true);
  };

  const cancelCustomizingModal = () => {
    if (sectionsBackup) setSections(sectionsBackup);
    setSectionsBackup(null);
    setIsCustomizingModalOpen(false);
  };

  const applyCustomizingModal = () => {
    setSectionsBackup(null);
    setIsCustomizingModalOpen(false);
  };

  const updateSection = (idx: number, patch: Partial<(typeof sections)[number]>) => {
    setSections(prev => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const getSectionConfig = (id: number) => {
    return sections.find(s => s.id === id) || { title: '', enabled: true, iconName: 'User' };
  };

  const getSectionIcon = (iconName: string) => {
    switch (iconName) {
      case 'User': return <User size={18} className="text-blue-600" />;
      case 'BarChart2': return <BarChart2 size={18} className="text-blue-600" />;
      case 'Layers': return <Layers size={18} className="text-orange-600" />;
      case 'Sprout': return <Sprout size={18} className="text-green-600" />;
      case 'PieChart': return <PieChart size={18} className="text-blue-600" />;
      case 'Activity': return <Activity size={18} className="text-purple-600" />;
      case 'Users': return <Users size={18} className="text-blue-600" />;
      case 'DollarSign': return <DollarSign size={18} className="text-emerald-600" />;
      default: return <User size={18} className="text-blue-600" />;
    }
  };

  const weight = Number(data.weight) || 0;
  const animais = Number(data.quantity) || 1;
  const days = Number(data.days) || 1;

  const currentTarget = CONSUMPTION_TARGETS.find(
    t => t.category === data.category && t.subcategory === data.subcategory
  );

  // Animal profile theoretical MS targets
  const metaCMS = currentTarget ? weight * (currentTarget.percentPvMs / 100) : weight * 0.03;
  const metaConcentradoMS = currentTarget ? metaCMS * (currentTarget.concentradoPercent / 100) : metaCMS * 0.35;
  const metaVolumosoMS = currentTarget ? metaCMS * (currentTarget.volumosoPercent / 100) : metaCMS * 0.65;

  // Detect mode
  const hasAdjustedDiet = (data.adjustedConcentrates.length > 0 || data.adjustedVolumosos.length > 0) && data.reportSourceStep !== 3;

  // Helper to resolve ingredient entries
  const resolveDietItems = (entries: typeof data.currentConcentrates, defaultFeedType: string) => {
    let sumMS = 0;
    let sumMN = 0;
    let sumCost = 0;
    const items = entries.map(entry => {
      const itemInfo = MOCK_INGREDIENTS.find(i => i.id === entry.ingredientId);
      if (!itemInfo) return null;
      const mnVal = Number(entry.mn) || 0;
      const msVal = entry.mn === '' ? 0 : mnVal * (itemInfo.msPercent / 100);
      const priceKg = entry.pricePerKg !== undefined && entry.pricePerKg !== '' ? Number(entry.pricePerKg) : 0;
      const batchCost = mnVal * priceKg;
      sumMS += msVal;
      sumMN += mnVal;
      sumCost += batchCost;
      return { ...entry, itemInfo, mnVal, msVal, priceKg, batchCost, feedType: entry.type || defaultFeedType };
    }).filter(Boolean) as {
      id: string;
      ingredientId: string;
      type: string;
      mn: number | '';
      ms: number | '';
      pricePerKg?: number | '';
      priceKg: number;
      batchCost: number;
      itemInfo: typeof MOCK_INGREDIENTS[0];
      mnVal: number;
      msVal: number;
      feedType: string;
    }[];
    return { items, sumMS, sumMN, sumCost };
  };

  // 1. Raw Batches
  // Se o usuário clicou em "Não tenho dieta atual", a dieta atual é ignorada no relatório
  const currConcRaw = resolveDietItems(data.hasCurrentDiet ? data.currentConcentrates : [], 'Concentrado');
  const currVolRaw = resolveDietItems(data.hasCurrentDiet ? data.currentVolumosos : [], 'Volumoso');

  const adjConcRaw = resolveDietItems(data.adjustedConcentrates, 'Concentrado');
  const adjVolRaw = resolveDietItems(data.adjustedVolumosos, 'Volumoso');

  // ================= DIETA ATUAL (REAL DA FAZENDA) =================
  // Quantidade fornecida por animal definida na Etapa 2
  const currAnimalConcDailyMN = !data.hasCurrentDiet ? 0 : data.currentConcentradoKg !== undefined && data.currentConcentradoKg !== '' 
    ? Number(data.currentConcentradoKg) 
    : (currConcRaw.sumMN > 0 && currConcRaw.sumMN <= 25 ? currConcRaw.sumMN : 0);

  const isCurrVolAnimalMode = data.currentVolumosoMode === 'animal';
  const currAnimalVolDailyMN = !data.hasCurrentDiet 
    ? 0 
    : (isCurrVolAnimalMode 
        ? currVolRaw.sumMN 
        : (data.currentVolumosoKg !== undefined && data.currentVolumosoKg !== '' 
            ? Number(data.currentVolumosoKg) 
            : (currVolRaw.sumMN > 0 && currVolRaw.sumMN <= 50 ? currVolRaw.sumMN : 0)));

  const currAnimalConcItems = currConcRaw.items.map(item => {
    const pct = currConcRaw.sumMN > 0 ? item.mnVal / currConcRaw.sumMN : 0;
    const mnVal = pct * currAnimalConcDailyMN;
    const msVal = mnVal * (item.itemInfo.msPercent / 100);
    const dailyCost = mnVal * item.priceKg;
    const lotDailyCost = dailyCost * animais;
    const lotTotalPeriodCost = lotDailyCost * days;
    const lotTotalPeriodKg = mnVal * animais * days;
    return { ...item, mnVal, msVal, pct: pct * 100, batchMN: item.mnVal, dailyCost, lotDailyCost, lotTotalPeriodCost, lotTotalPeriodKg };
  });

  const currAnimalVolItems = currVolRaw.items.map(item => {
    const pct = currVolRaw.sumMN > 0 ? item.mnVal / currVolRaw.sumMN : 0;
    const mnVal = pct * currAnimalVolDailyMN;
    const msVal = mnVal * (item.itemInfo.msPercent / 100);
    const dailyCost = mnVal * item.priceKg;
    const lotDailyCost = dailyCost * animais;
    const lotTotalPeriodCost = lotDailyCost * days;
    const lotTotalPeriodKg = mnVal * animais * days;
    return { ...item, mnVal, msVal, pct: pct * 100, batchMN: item.mnVal, dailyCost, lotDailyCost, lotTotalPeriodCost, lotTotalPeriodKg };
  });

  const currAnimalItems = [...currAnimalConcItems, ...currAnimalVolItems];
  const currTotalConcMS = currAnimalConcItems.reduce((acc, i) => acc + i.msVal, 0);
  const currTotalVolMS = currAnimalVolItems.reduce((acc, i) => acc + i.msVal, 0);
  const currTotalMS = currTotalConcMS + currTotalVolMS;
  const currTotalMN = currAnimalConcDailyMN + currAnimalVolDailyMN;
  const currTotalCostDailyPerAnimal = currAnimalItems.reduce((acc, i) => acc + i.dailyCost, 0);

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

  const isAdjVolAnimalMode = data.adjustedVolumosoMode === 'animal';
  const avgAdjVolMS = adjVolRaw.sumMN > 0 ? adjVolRaw.sumMS / adjVolRaw.sumMN : 0;
  const adjAnimalVolDailyMN = isAdjVolAnimalMode 
    ? adjVolRaw.sumMN 
    : (avgAdjVolMS > 0 ? metaVolumosoMS / avgAdjVolMS : 0);

  const adjAnimalConcItems = adjConcRaw.items.map(item => {
    const pct = adjConcRaw.sumMN > 0 ? item.mnVal / adjConcRaw.sumMN : 0;
    const mnVal = pct * adjAnimalConcDailyMN;
    const msVal = mnVal * (item.itemInfo.msPercent / 100);
    const dailyCost = mnVal * item.priceKg;
    const lotDailyCost = dailyCost * animais;
    const lotTotalPeriodCost = lotDailyCost * days;
    const lotTotalPeriodKg = mnVal * animais * days;
    return { ...item, mnVal, msVal, pct: pct * 100, batchMN: item.mnVal, dailyCost, lotDailyCost, lotTotalPeriodCost, lotTotalPeriodKg };
  });

  const adjAnimalVolItems = adjVolRaw.items.map(item => {
    const pct = adjVolRaw.sumMN > 0 ? item.mnVal / adjVolRaw.sumMN : 0;
    const mnVal = pct * adjAnimalVolDailyMN;
    const msVal = mnVal * (item.itemInfo.msPercent / 100);
    const dailyCost = mnVal * item.priceKg;
    const lotDailyCost = dailyCost * animais;
    const lotTotalPeriodCost = lotDailyCost * days;
    const lotTotalPeriodKg = mnVal * animais * days;
    return { ...item, mnVal, msVal, pct: pct * 100, batchMN: item.mnVal, dailyCost, lotDailyCost, lotTotalPeriodCost, lotTotalPeriodKg };
  });

  const adjAnimalItems = [...adjAnimalConcItems, ...adjAnimalVolItems];
  const adjTotalConcMS = adjAnimalConcItems.reduce((acc, i) => acc + i.msVal, 0);
  const adjTotalVolMS = adjAnimalVolItems.reduce((acc, i) => acc + i.msVal, 0);
  const adjTotalMS = adjTotalConcMS + adjTotalVolMS;
  const adjTotalMN = adjAnimalConcDailyMN + adjAnimalVolDailyMN;

  // Totais Econômicos da Dieta Ajustada
  const adjTotalConcCostDaily = adjAnimalConcItems.reduce((acc, i) => acc + i.dailyCost, 0);
  const adjTotalVolCostDaily = adjAnimalVolItems.reduce((acc, i) => acc + i.dailyCost, 0);
  const adjTotalCostDailyPerAnimal = adjTotalConcCostDaily + adjTotalVolCostDaily;
  const adjCostPerAnimalPeriod = adjTotalCostDailyPerAnimal * days;
  const adjLoteDailyCost = adjTotalCostDailyPerAnimal * animais;
  const adjLotePeriodCost = adjLoteDailyCost * days;
  const adjCostPerKgMS = adjTotalMS > 0 ? adjTotalCostDailyPerAnimal / adjTotalMS : 0;

  // Planejamento financeiro (Pág. 3): usa a dieta ajustada; se não houver, usa a dieta atual (com os preços da Etapa 2)
  const currTotalConcCostDaily = currAnimalConcItems.reduce((acc, i) => acc + i.dailyCost, 0);
  const currTotalVolCostDaily = currAnimalVolItems.reduce((acc, i) => acc + i.dailyCost, 0);
  const finAnimalConcItems = hasAdjustedDiet ? adjAnimalConcItems : currAnimalConcItems;
  const finAnimalVolItems = hasAdjustedDiet ? adjAnimalVolItems : currAnimalVolItems;
  const finAnimalConcDailyMN = hasAdjustedDiet ? adjAnimalConcDailyMN : currAnimalConcDailyMN;
  const finAnimalVolDailyMN = hasAdjustedDiet ? adjAnimalVolDailyMN : currAnimalVolDailyMN;
  const finConcRaw = hasAdjustedDiet ? adjConcRaw : currConcRaw;
  const finVolRaw = hasAdjustedDiet ? adjVolRaw : currVolRaw;
  const finTotalMN = hasAdjustedDiet ? adjTotalMN : currTotalMN;
  const finTotalMS = hasAdjustedDiet ? adjTotalMS : currTotalMS;
  const finTotalConcCostDaily = hasAdjustedDiet ? adjTotalConcCostDaily : currTotalConcCostDaily;
  const finTotalVolCostDaily = hasAdjustedDiet ? adjTotalVolCostDaily : currTotalVolCostDaily;
  const finTotalCostDailyPerAnimal = finTotalConcCostDaily + finTotalVolCostDaily;
  const finCostPerAnimalPeriod = finTotalCostDailyPerAnimal * days;
  const finLoteDailyCost = finTotalCostDailyPerAnimal * animais;
  const finLotePeriodCost = finLoteDailyCost * days;
  const finCostPerKgMS = finTotalMS > 0 ? finTotalCostDailyPerAnimal / finTotalMS : 0;

  let adjPB = 0, adjNDT = 0, adjFDN = 0, adjAmido = 0, adjCa = 0, adjP = 0;
  adjAnimalItems.forEach(c => {
    adjPB += c.msVal * c.itemInfo.pb;
    adjNDT += c.msVal * c.itemInfo.ndt;
    adjFDN += c.msVal * c.itemInfo.fdn;
    adjAmido += c.msVal * c.itemInfo.amido;
    adjCa += c.msVal * c.itemInfo.calcio;
    adjP += c.msVal * c.itemInfo.fosforo;
  });

  // Nas tabelas comparativas, a dieta ajustada só entra quando o relatório a inclui
  const cmpAdjConcItems = hasAdjustedDiet ? adjConcRaw.items : [];
  const cmpAdjVolItems = hasAdjustedDiet ? adjVolRaw.items : [];
  const cmpAdjAnimalItems = hasAdjustedDiet ? adjAnimalItems : [];

  // Soma as linhas do mesmo insumo (o usuário pode lançar o mesmo insumo mais de uma vez)
  const findAggregated = <T extends { ingredientId: string; mnVal: number; msVal: number }>(
    items: T[],
    ingId: string
  ): T | undefined => {
    const matches = items.filter(i => i.ingredientId === ingId);
    if (matches.length === 0) return undefined;
    return {
      ...matches[0],
      mnVal: matches.reduce((acc, i) => acc + i.mnVal, 0),
      msVal: matches.reduce((acc, i) => acc + i.msVal, 0)
    };
  };

  // Unique list of concentrate ingredients for side-by-side comparison
  const allConcIngredientIds = Array.from(new Set([
    ...currConcRaw.items.map(i => i.ingredientId),
    ...cmpAdjConcItems.map(i => i.ingredientId)
  ]));

  // Unique list of volumoso ingredients for side-by-side comparison
  const allVolIngredientIds = Array.from(new Set([
    ...currVolRaw.items.map(i => i.ingredientId),
    ...cmpAdjVolItems.map(i => i.ingredientId)
  ]));

  // Unique list of all daily diet ingredients for side-by-side comparison
  const allDailyIngredientIds = Array.from(new Set([
    ...currAnimalItems.map(i => i.ingredientId),
    ...cmpAdjAnimalItems.map(i => i.ingredientId)
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
    <div className="max-w-6xl mx-auto pb-12">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 print:hidden">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
            {hasAdjustedDiet ? 'Fase 6: Relatório Comparativo Completo' : 'Fase 6: Relatório Diagnóstico da Dieta Atual'}
          </span>
          <h2 className="text-xl font-black text-gray-800 mt-1">
            {hasAdjustedDiet ? 'Relatório Comparativo: Dieta Atual vs Dieta Ajustada' : 'Relatório Diagnóstico da Propriedade'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Perfil da Página: Retrato (Padrão) vs Paisagem */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setPageOrientation('portrait')}
              className={`px-2 py-1 rounded transition-all flex items-center gap-1 cursor-pointer ${
                pageOrientation === 'portrait'
                  ? 'bg-white text-blue-800 shadow-xs ring-1 ring-black/5 font-black'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              title="Retrato (A4)"
            >
              <span>Retrato</span>
            </button>
            <button
              type="button"
              onClick={() => setPageOrientation('landscape')}
              className={`px-2 py-1 rounded transition-all flex items-center gap-1 cursor-pointer ${
                pageOrientation === 'landscape'
                  ? 'bg-white text-blue-800 shadow-xs ring-1 ring-black/5 font-black'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              title="Paisagem"
            >
              <span>Paisagem</span>
            </button>
          </div>

          <button 
            type="button"
            onClick={openCustomizingModal}
            className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700 transition shadow-sm cursor-pointer text-[10px]"
          >
            <Sliders size={14} /> Personalizar
          </button>

          <button 
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-blue-800 transition shadow-sm cursor-pointer text-[10px]"
          >
            <Printer size={14} /> Imprimir
          </button>
        </div>
      </div>

      {/* Modal de Personalização do Relatório */}
      {isCustomizingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Sliders size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">Personalizar Relatório</h3>
                  <p className="text-xs text-gray-500">Selecione as seções exibidas, altere títulos e organize o relatório.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={cancelCustomizingModal}
                className="text-gray-400 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {sections.map((section, idx) => (
                <div 
                  key={section.id}
                  className={`border rounded-xl p-4 transition flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
                    section.enabled ? 'border-blue-200 bg-blue-50/20 shadow-xs' : 'border-gray-200 bg-gray-50 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <input 
                      type="checkbox"
                      checked={section.enabled}
                      onChange={e => updateSection(idx, { enabled: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                      title="Exibir/Ocultar seção"
                    />
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs shrink-0">
                      {section.id}
                    </div>
                    <div className="shrink-0">
                      {getSectionIcon(section.iconName)}
                    </div>
                  </div>

                  <div className="flex-1 w-full">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Título da Seção {section.id}</label>
                    <input 
                      type="text"
                      value={section.title}
                      onChange={e => updateSection(idx, { title: e.target.value })}
                      className="w-full text-xs font-bold text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Título personalizado..."
                    />
                  </div>

                  <button 
                    type="button"
                    onClick={() => updateSection(idx, { title: section.defaultTitle })}
                    className="text-[10px] font-bold text-gray-500 hover:text-blue-700 whitespace-nowrap p-1.5 hover:bg-white rounded-md transition cursor-pointer self-end sm:self-center"
                    title="Restaurar título padrão"
                  >
                    <RotateCcw size={14} className="inline mr-1" /> Restaurar
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button 
                type="button"
                onClick={() => {
                  setSections(sections.map(s => ({ ...s, title: s.defaultTitle, enabled: true })));
                }}
                className="text-xs font-bold text-gray-600 hover:text-gray-900 transition cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw size={14} /> Restaurar Todas Padrões
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={cancelCustomizingModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={applyCustomizingModal}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 transition shadow-sm cursor-pointer flex items-center gap-2"
                >
                  <Check size={16} /> Salvar e Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Report Document - Continuous Sheet */}
      <div className={`w-full mx-auto transition-all duration-200 ${pageOrientation === 'portrait' ? 'max-w-[210mm]' : 'max-w-[297mm]'}`}>
        <style dangerouslySetInnerHTML={{ __html: `
          @page {
            size: A4 ${pageOrientation};
            margin: ${pageOrientation === 'portrait' ? '8mm 10mm' : '8mm 8mm'};
          }
          @media print {
            header, nav, .print\\:hidden, .no-print {
              display: none !important;
            }
            main {
              padding: 0 !important;
              margin: 0 !important;
              max-width: 100% !important;
              width: 100% !important;
            }
            body { 
              background: white !important; 
              color: #111827 !important;
              margin: 0 !important; 
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .max-w-4xl, .max-w-6xl { 
              max-width: 100% !important; 
              padding: 0 !important; 
              margin: 0 !important; 
              width: 100% !important;
            }
            .print\\:shadow-none { box-shadow: none !important; }
            .print\\:border-none { border: none !important; }
            .print-sheet { 
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 !important; 
              margin: 0 !important; 
              box-shadow: none !important; 
              border: none !important;
              background: white !important;
            }
            .break-inside-avoid {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            table {
              width: 100% !important;
              table-layout: auto !important;
              border-collapse: collapse !important;
            }
            th, td {
              word-break: normal !important;
              overflow-wrap: normal !important;
            }
          }
        ` }} />

        {/* Single Unified Document Sheet */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 sm:p-10 print:shadow-none print:border-none print:p-0 print:m-0 w-full max-w-7xl print-sheet overflow-hidden text-[12px] flex flex-col gap-6">
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
          {getSectionConfig(1).enabled && (
            <section className="mb-6 break-inside-avoid">
              <h3 className="text-xs font-bold text-blue-800 tracking-wider uppercase mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-700"></span>
                {getSectionConfig(1).title}
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
          )}

          {/* 2. QUADRO RESUMO COMPARATIVO: DIETA ATUAL VS DIETA AJUSTADA VS META */}
          {getSectionConfig(2).enabled && (
            <section className="mb-6 break-inside-avoid">
              <h3 className="text-xs font-bold text-blue-800 tracking-wider uppercase mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-700"></span>
                  {getSectionConfig(2).title}
                </span>
                <span className="text-[11px] text-gray-400 lowercase font-normal">
                  (Consumo por animal/dia)
                </span>
              </h3>

            <div className="border border-gray-200 rounded-xl overflow-x-auto print:overflow-visible bg-white">
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

                  {/* Custo Estimado por Cabeça/Dia */}
                  <tr className="bg-emerald-50/40 font-black">
                    <td className="py-2.5 px-3 text-emerald-950 uppercase text-[11px]">Custo Estimado por Animal/Dia</td>
                    <td className="py-2.5 px-3 text-right text-orange-950 bg-orange-100/40 border-l border-orange-200 text-sm">
                      {currTotalCostDailyPerAnimal > 0 ? `R$ ${currTotalCostDailyPerAnimal.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-900 bg-emerald-100/50 border-l border-emerald-200 text-sm">
                      {hasAdjustedDiet && adjTotalCostDailyPerAnimal > 0 ? `R$ ${adjTotalCostDailyPerAnimal.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-400 border-l border-gray-200 text-xs">-</td>
                    <td className="py-2.5 px-3 text-right font-bold border-l border-gray-200 text-emerald-800">
                      {hasAdjustedDiet && adjTotalCostDailyPerAnimal > 0 && currTotalCostDailyPerAnimal > 0 
                        ? `${(adjTotalCostDailyPerAnimal - currTotalCostDailyPerAnimal >= 0 ? '+' : '')}R$ ${(adjTotalCostDailyPerAnimal - currTotalCostDailyPerAnimal).toFixed(2)}/dia` 
                        : (hasAdjustedDiet && adjTotalCostDailyPerAnimal > 0 ? `R$ ${adjTotalCostDailyPerAnimal.toFixed(2)}/dia` : '-')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          )}

          {/* 3. FÓRMULA DO CONCENTRADO: COMPARATIVO LADO A LADO */}
          {getSectionConfig(3).enabled && (
            <section className="mb-6 break-inside-avoid">
              <h3 className="text-xs font-bold text-blue-800 tracking-wider uppercase mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  {getSectionConfig(3).title}
                </span>
                <span className="text-[11px] text-gray-400 lowercase font-normal">
                  (Mistura no Misturador - MN)
                </span>
              </h3>

            <div className="border border-gray-200 rounded-xl overflow-x-auto print:overflow-visible bg-white">
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
                    const currItem = findAggregated(currConcRaw.items, ingId);
                    const adjItem = findAggregated(cmpAdjConcItems, ingId);
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
          )}

          {/* 4. VOLUMOSO: COMPARATIVO LADO A LADO */}
          {getSectionConfig(4).enabled && (
            <section className="mb-4 break-inside-avoid">
              <h3 className="text-xs font-bold text-blue-800 tracking-wider uppercase mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-600"></span>
                  {getSectionConfig(4).title}
                </span>
                <span className="text-[11px] text-gray-400 lowercase font-normal">
                  (Mistura / Fornecimento MN)
                </span>
              </h3>

            <div className="border border-gray-200 rounded-xl overflow-x-auto print:overflow-visible bg-white">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 font-bold uppercase text-[10px] text-gray-500">
                    <th className="py-2 px-3 text-left">Insumo</th>
                    <th className="py-2 px-3 text-right bg-orange-50/60 text-orange-900 border-l border-orange-100">
                      Dieta Atual {isCurrVolAnimalMode ? '(kg/cab/dia)' : '(kg MN)'}
                    </th>
                    <th className="py-2 px-3 text-right bg-orange-50/60 text-orange-900">
                      % Atual
                    </th>
                    <th className="py-2 px-3 text-right bg-blue-50/70 text-blue-900 border-l border-blue-100">
                      Dieta Ajustada {isAdjVolAnimalMode ? '(kg/cab/dia)' : '(kg MN)'}
                    </th>
                    <th className="py-2 px-3 text-right bg-blue-50/70 text-blue-900">
                      % Ajustada
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allVolIngredientIds.map(ingId => {
                    const currItem = findAggregated(currVolRaw.items, ingId);
                    const adjItem = findAggregated(cmpAdjVolItems, ingId);
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
                      {currVolRaw.sumMN.toFixed(2)} kg {isCurrVolAnimalMode ? '/cab/dia' : 'MN'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-green-800 bg-orange-50/60">
                      100%
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-blue-900 bg-blue-50/70 border-l border-blue-200">
                      {hasAdjustedDiet ? `${adjVolRaw.sumMN.toFixed(2)} kg ${isAdjVolAnimalMode ? '/cab/dia' : 'MN'}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-800 bg-blue-50/70">
                      {hasAdjustedDiet ? '100%' : '-'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
          )}

          {/* 5. DIETA DIÁRIA POR ANIMAL: COMPARATIVO LADO A LADO */}
          {getSectionConfig(5).enabled && (
            <section className="mb-6 break-inside-avoid">
              <h3 className="text-xs font-bold text-blue-800 tracking-wider uppercase mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-700"></span>
                  {getSectionConfig(5).title}
                </span>
                <span className="text-[11px] text-gray-400 lowercase font-normal">
                  (Consumo individual consolidado)
                </span>
              </h3>

            <div className="border border-gray-200 rounded-xl overflow-x-auto print:overflow-visible bg-white">
              <table className="w-full text-[10.5px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 font-bold uppercase text-[10px] text-gray-500">
                    <th className="py-1.5 px-2 text-left">Insumo</th>
                    <th className="py-2 px-2 text-center">Tipo</th>
                    <th className="py-1.5 px-2 text-right bg-orange-50/60 text-orange-900 border-l border-orange-100">
                      Atual MN (kg)
                    </th>
                    <th className="py-1.5 px-2 text-right bg-orange-50/60 text-orange-900">
                      Atual MS (kg)
                    </th>
                    <th className="py-1.5 px-2 text-right bg-orange-50/60 text-orange-900">
                      % MS
                    </th>
                    <th className="py-1.5 px-2 text-right bg-blue-50/70 text-blue-900 border-l border-blue-100">
                      Ajust. MN (kg)
                    </th>
                    <th className="py-1.5 px-2 text-right bg-blue-50/70 text-blue-900">
                      Ajust. MS (kg)
                    </th>
                    <th className="py-1.5 px-2 text-right bg-blue-50/70 text-blue-900">
                      % MS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 tabular-nums">
                  {allDailyIngredientIds.map(ingId => {
                    const currItem = findAggregated(currAnimalItems, ingId);
                    const adjItem = findAggregated(cmpAdjAnimalItems, ingId);
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
                        <td className="py-1.5 px-2 font-bold text-gray-800">{name}</td>
                        <td className="py-2 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                            type === 'Concentrado' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                            type === 'Mineral' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                            'bg-green-50 text-green-700 border-green-200'
                          }`}>
                            {type}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-right font-medium text-gray-800 bg-orange-50/20 border-l border-orange-100">
                          {currItem ? `${currMn.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-1.5 px-2 text-right font-bold text-orange-950 bg-orange-50/20">
                          {currItem ? `${currMs.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-1.5 px-2 text-right text-gray-500 bg-orange-50/20 font-semibold">
                          {currPct !== '-' ? `${currPct}%` : '-'}
                        </td>
                        <td className="py-1.5 px-2 text-right font-medium text-gray-800 bg-blue-50/20 border-l border-blue-100">
                          {adjItem ? `${adjMn.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-1.5 px-2 text-right font-bold text-blue-950 bg-blue-50/20">
                          {adjItem ? `${adjMs.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-1.5 px-2 text-right text-blue-600 bg-blue-50/20 font-semibold">
                          {adjPct !== '-' ? `${adjPct}%` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t-2 border-gray-200 font-bold">
                  {/* Subtotal Concentrado */}
                  <tr className="bg-[#fffcf8]">
                    <td colSpan={2} className="py-1.5 px-2 text-orange-800 uppercase text-[10px]">
                      Subtotal Concentrado (MN / MS)
                    </td>
                    <td className="py-1.5 px-2 text-right font-bold text-orange-900 border-l border-orange-100">
                      {currAnimalConcDailyMN.toFixed(2)} kg
                    </td>
                    <td className="py-1.5 px-2 text-right font-black text-orange-950">
                      {currTotalConcMS.toFixed(2)} kg
                    </td>
                    <td className="py-1.5 px-2 text-right text-orange-700">
                      {currTotalMS > 0 ? ((currTotalConcMS / currTotalMS) * 100).toFixed(0) : 0}%
                    </td>
                    <td className="py-1.5 px-2 text-right font-bold text-blue-900 border-l border-blue-100">
                      {hasAdjustedDiet ? `${adjAnimalConcDailyMN.toFixed(2)} kg` : '-'}
                    </td>
                    <td className="py-1.5 px-2 text-right font-black text-blue-950">
                      {hasAdjustedDiet ? `${adjTotalConcMS.toFixed(2)} kg` : '-'}
                    </td>
                    <td className="py-1.5 px-2 text-right text-blue-700">
                      {hasAdjustedDiet && adjTotalMS > 0 ? `${((adjTotalConcMS / adjTotalMS) * 100).toFixed(0)}%` : '-'}
                    </td>
                  </tr>

                  {/* Subtotal Volumoso */}
                  <tr className="bg-[#f7fdf9]">
                    <td colSpan={2} className="py-1.5 px-2 text-green-800 uppercase text-[10px]">
                      Subtotal Volumoso (MN / MS)
                    </td>
                    <td className="py-1.5 px-2 text-right font-bold text-green-900 border-l border-orange-100">
                      {currAnimalVolDailyMN.toFixed(2)} kg
                    </td>
                    <td className="py-1.5 px-2 text-right font-black text-green-950">
                      {currTotalVolMS.toFixed(2)} kg
                    </td>
                    <td className="py-1.5 px-2 text-right text-green-700">
                      {currTotalMS > 0 ? ((currTotalVolMS / currTotalMS) * 100).toFixed(0) : 0}%
                    </td>
                    <td className="py-1.5 px-2 text-right font-bold text-blue-900 border-l border-blue-100">
                      {hasAdjustedDiet ? `${adjAnimalVolDailyMN.toFixed(2)} kg` : '-'}
                    </td>
                    <td className="py-1.5 px-2 text-right font-black text-blue-950">
                      {hasAdjustedDiet ? `${adjTotalVolMS.toFixed(2)} kg` : '-'}
                    </td>
                    <td className="py-1.5 px-2 text-right text-blue-700">
                      {hasAdjustedDiet && adjTotalMS > 0 ? `${((adjTotalVolMS / adjTotalMS) * 100).toFixed(0)}%` : '-'}
                    </td>
                  </tr>

                  {/* TOTAL GERAL DA DIETA */}
                  <tr className="bg-blue-900 text-white font-black text-xs">
                    <td colSpan={2} className="py-2 px-2 uppercase tracking-wider">
                      TOTAL DIÁRIO POR CABEÇA
                    </td>
                    <td className="py-2 px-2 text-right border-l border-blue-800 text-amber-300">
                      {currTotalMN.toFixed(2)} kg MN
                    </td>
                    <td className="py-2 px-2 text-right text-white">
                      {currTotalMS.toFixed(2)} kg MS
                    </td>
                    <td className="py-2 px-2 text-right text-blue-200">
                      100%
                    </td>
                    <td className="py-2 px-2 text-right border-l border-blue-800 text-amber-300">
                      {hasAdjustedDiet ? `${adjTotalMN.toFixed(2)} kg MN` : '-'}
                    </td>
                    <td className="py-2 px-2 text-right text-white">
                      {hasAdjustedDiet ? `${adjTotalMS.toFixed(2)} kg MS` : '-'}
                    </td>
                    <td className="py-2 px-2 text-right text-blue-200">
                      {hasAdjustedDiet ? '100%' : '-'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            </section>
          )}

          {/* 6. DIAGNÓSTICO NUTRICIONAL CONSOLIDADO: DIETA ATUAL VS AJUSTADA VS EXIGÊNCIA */}
          {getSectionConfig(6).enabled && (
            <section className="mb-6 break-inside-avoid">
              <h3 className="text-xs font-bold text-blue-800 tracking-wider uppercase mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-700"></span>
                  {getSectionConfig(6).title}
                </span>
                <span className="text-[11px] text-gray-400 lowercase font-normal">
                  (Valores na Matéria Seca da Dieta)
                </span>
              </h3>
              <div className="border border-gray-200 rounded-xl overflow-x-auto print:overflow-visible bg-white">
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
                      {
                        label: 'Concentrado (%)',
                        currVal: currTotalMS > 0 ? (currTotalConcMS / currTotalMS) * 100 : 0,
                        adjVal: adjTotalMS > 0 ? (adjTotalConcMS / adjTotalMS) * 100 : 0,
                        target: currentTarget?.concentradoPercent || 0,
                        isPct: true,
                      },
                      {
                        label: 'Volumoso (%)',
                        currVal: currTotalMS > 0 ? (currTotalVolMS / currTotalMS) * 100 : 0,
                        adjVal: adjTotalMS > 0 ? (adjTotalVolMS / adjTotalMS) * 100 : 0,
                        target: currentTarget?.volumosoPercent || 0,
                        isPct: true,
                      },
                    ].map((nut, idx) => {
                      const currPct = (nut.isPct ? nut.currVal : nut.currVal / 10).toFixed(1);
                      const adjPct = (nut.isPct ? nut.adjVal : nut.adjVal / 10).toFixed(1);
                      const targetPct = nut.target > 0 ? (nut.isPct ? nut.target.toFixed(0) : (nut.target / 10).toFixed(0)) : '-';
                      return (
                        <tr key={idx} className="hover:bg-gray-50/30">
                          <td className="py-2.5 px-3 font-bold text-gray-800">{nut.label}</td>
                          <td className="py-2.5 px-3 text-right bg-orange-50/20 border-l border-orange-100">
                            <span className={`font-black ${nut.isPct ? 'text-gray-800' : getNutrientColor(nut.currVal, nut.target)}`}>
                              {currPct}%
                            </span>
                            {!nut.isPct && <span className="text-[10px] text-gray-400 ml-1.5">({nut.currVal.toFixed(1)} g/kg)</span>}
                          </td>
                          <td className="py-2.5 px-3 text-right bg-blue-50/20 border-l border-blue-100">
                            {hasAdjustedDiet ? (
                              <>
                                <span className={`font-black ${nut.isPct ? 'text-gray-800' : getNutrientColor(nut.adjVal, nut.target)}`}>
                                  {adjPct}%
                                </span>
                                {!nut.isPct && <span className="text-[10px] text-blue-400 ml-1.5">({nut.adjVal.toFixed(1)} g/kg)</span>}
                              </>
                            ) : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-gray-700 border-l border-gray-200">
                            {targetPct !== '-' ? (nut.isPct ? `${targetPct}%` : `${targetPct}% (${nut.target} g/kg)`) : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold border-l border-gray-200">
                            {(() => {
                              if (nut.isPct) return '-';
                              const val = hasAdjustedDiet ? nut.adjVal : nut.currVal;
                              if (!nut.target) return <span className="text-gray-400">-</span>;
                              if (val < nut.target * 0.90) return <span className="inline-flex items-center gap-1 text-red-500"><ArrowUp size={12} /> Abaixo</span>;
                              if (val < nut.target * 0.98) return <span className="inline-flex items-center gap-1 text-amber-600"><ArrowUp size={12} /> Próximo</span>;
                              if (val > nut.target * 1.10) return <span className="inline-flex items-center gap-1 text-blue-600"><ArrowDown size={12} /> Acima</span>;
                              return <span className="inline-flex items-center gap-1 text-green-700"><CheckCircle2 size={12} /> Adequado</span>;
                            })()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* 7. MISTURA DO LOTE (Animais x Dias): COMPARATIVO LADO A LADO */}
          {animais > 1 && getSectionConfig(7).enabled && (
            <section className="mb-4 break-inside-avoid">
              <h3 className="text-xs font-bold text-blue-800 tracking-wider uppercase mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-700"></span>
                  {getSectionConfig(7).title} ({animais} Animais, {days} Dias)
                </span>
                <span className="text-[11px] text-gray-400 lowercase font-normal">
                  (Total do lote no período em MN)
                </span>
              </h3>

              <div className="border border-gray-200 rounded-xl overflow-x-auto print:overflow-visible bg-white">
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
                      const currItem = findAggregated(currAnimalItems, ingId);
                      const adjItem = findAggregated(cmpAdjAnimalItems, ingId);
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

          {/* ================= 8. PLANEJAMENTO ECONÔMICO E FINANCEIRO ================= */}
          {getSectionConfig(8).enabled && (
            <div className="flex flex-col gap-6 break-inside-avoid">
              {/* Title of Section 8 */}
          <div className="text-center mb-6">
            <div className="text-xs font-bold text-emerald-700 tracking-widest uppercase mb-1">
              Planejamento Econômico e Orçamento de Insumos {hasAdjustedDiet ? '(Dieta Ajustada)' : '(Dieta Atual)'}
            </div>
            <h2 className="text-xl font-black text-gray-800 uppercase">
              Custos por Animal e Investimento Total do Lote ({animais} {animais === 1 ? 'Animal' : 'Animais'}, {days} {days === 1 ? 'Dia' : 'Dias'})
            </h2>
          </div>

          {/* Destaques Financeiros em 4 Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-center">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">Gasto por Cabeça / Dia</span>
              <div className="text-xl font-black text-emerald-900">
                {finTotalCostDailyPerAnimal > 0 ? `R$ ${finTotalCostDailyPerAnimal.toFixed(2)}` : 'R$ 0,00'}
              </div>
              <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
                Conc: R$ {finTotalConcCostDaily.toFixed(2)} | Vol: R$ {finTotalVolCostDaily.toFixed(2)}
              </span>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-center">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">Gasto por Cabeça ({days} d)</span>
              <div className="text-xl font-black text-emerald-900">
                {finCostPerAnimalPeriod > 0 ? `R$ ${finCostPerAnimalPeriod.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00'}
              </div>
              <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
                Investimento por animal no período
              </span>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-center">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">Desembolso Diário do Lote</span>
              <div className="text-xl font-black text-emerald-950">
                {finLoteDailyCost > 0 ? `R$ ${finLoteDailyCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00'}
              </div>
              <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
                Para o lote de {animais} cabeças / dia
              </span>
            </div>

            <div className="bg-emerald-700 text-white border border-emerald-800 rounded-xl p-3.5 text-center shadow-xs">
              <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wide block mb-1">
                Investimento Total Lote
              </span>
              <div className="text-xl font-black text-amber-300">
                {finLotePeriodCost > 0 ? `R$ ${finLotePeriodCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00'}
              </div>
              <span className="text-[10px] text-emerald-100 font-medium block mt-0.5">
                {animais} cab. × {days} dias
              </span>
            </div>
          </div>

          {/* Formula calculation notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 mb-6 text-xs text-gray-700 flex flex-wrap justify-between items-center gap-2">
            <div>
              <span className="font-bold text-emerald-800">Fórmula de Multiplicação: </span>
              <span>Gasto Diário por Animal (<strong>R$ {finTotalCostDailyPerAnimal.toFixed(2)}</strong>) × <strong>{animais} {animais === 1 ? 'animal' : 'animais'}</strong> × <strong>{days} {days === 1 ? 'dia' : 'dias'}</strong></span>
            </div>
            <div className="font-bold text-emerald-900 bg-emerald-100/70 px-2.5 py-0.5 rounded-md">
              Total = R$ {finLotePeriodCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Tabela Completa de Compras e Orçamento dos Insumos */}
          <section className="mb-6 break-inside-avoid">
              <h3 className="text-xs font-bold text-blue-800 tracking-wider uppercase mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  {getSectionConfig(8).title}
                </span>
                <span className="text-[11px] text-gray-400 lowercase font-normal">
                  (Multiplicado por {animais} cabeças e {days} dias)
                </span>
              </h3>

            <div className="border border-gray-200 rounded-xl overflow-x-auto print:overflow-visible bg-white">
              <table className="w-full text-[10.5px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 font-bold uppercase text-[10px] text-gray-600">
                    <th className="py-2 px-2 text-left">Insumo</th>
                    <th className="py-2.5 px-2 text-center">Tipo</th>
                    <th className="py-2 px-2 text-right">Consumo/Cab/Dia</th>
                    <th className="py-2 px-2 text-right bg-emerald-50/50 text-emerald-950 border-l border-emerald-100">
                      Preço (R$/kg)
                    </th>
                    <th className="py-2 px-2 text-right bg-emerald-50/50 text-emerald-950">
                      Custo/Cab/Dia
                    </th>
                    <th className="py-2 px-2 text-right border-l border-gray-200">
                      Demanda Lote ({days} d)
                    </th>
                    <th className="py-2 px-2 text-right bg-emerald-100/40 text-emerald-950 font-black border-l border-emerald-200">
                      Gasto Total Lote (R$)
                    </th>
                    <th className="py-2 px-2 text-right text-gray-500">
                      % Custo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 tabular-nums">
                  {/* Concentrados */}
                  {finAnimalConcItems.map(item => {
                    const pctOfTotalCost = finLotePeriodCost > 0 ? (item.lotTotalPeriodCost / finLotePeriodCost) * 100 : 0;
                    return (
                      <tr key={item.id} className="hover:bg-orange-50/20">
                        <td className="py-1.5 px-2 font-semibold text-gray-800">{item.itemInfo.name}</td>
                        <td className="py-2 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                            item.type === 'Concentrado' ? 'bg-orange-50 text-orange-600 border-orange-200' : 
                            'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-right text-gray-700">
                          {item.mnVal.toFixed(2)} kg
                        </td>
                        <td className="py-1.5 px-2 text-right font-medium text-emerald-800 bg-emerald-50/20 border-l border-emerald-100">
                          {item.priceKg > 0 ? `R$ ${item.priceKg.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-1.5 px-2 text-right font-bold text-emerald-900 bg-emerald-50/20">
                          {item.dailyCost > 0 ? `R$ ${item.dailyCost.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-1.5 px-2 text-right text-gray-700 border-l border-gray-200">
                          {item.lotTotalPeriodKg.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg
                          {item.lotTotalPeriodKg >= 1000 && (
                            <span className="text-[10px] text-gray-400 block font-normal">
                              ({(item.lotTotalPeriodKg / 1000).toFixed(2)} ton)
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-2 text-right font-black text-emerald-900 bg-emerald-100/30 border-l border-emerald-200">
                          {item.lotTotalPeriodCost > 0 ? `R$ ${item.lotTotalPeriodCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                        </td>
                        <td className="py-1.5 px-2 text-right text-gray-500 font-medium">
                          {pctOfTotalCost > 0 ? `${pctOfTotalCost.toFixed(1)}%` : '-'}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Subtotal Concentrado */}
                  {finAnimalConcItems.length > 0 && (
                    <tr className="bg-[#fffcf8] font-bold border-t border-b border-orange-200 text-orange-950">
                      <td colSpan={2} className="py-1.5 px-2 uppercase text-[10px] text-orange-900">
                        Subtotal Concentrado
                      </td>
                      <td className="py-1.5 px-2 text-right font-bold text-orange-900">
                        {finAnimalConcDailyMN.toFixed(2)} kg
                      </td>
                      <td className="py-1.5 px-2 text-right border-l border-emerald-100 text-emerald-800 text-[10px]">
                        Méd: R$ {finConcRaw.sumMN > 0 ? (finConcRaw.sumCost / finConcRaw.sumMN).toFixed(2) : '0.00'}
                      </td>
                      <td className="py-1.5 px-2 text-right font-black text-emerald-900 bg-emerald-50/20">
                        R$ {finTotalConcCostDaily.toFixed(2)}
                      </td>
                      <td className="py-1.5 px-2 text-right text-orange-900 border-l border-gray-200">
                        {(finAnimalConcDailyMN * animais * days).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg
                      </td>
                      <td className="py-1.5 px-2 text-right font-black text-emerald-950 bg-emerald-100/30 border-l border-emerald-200">
                        R$ {(finTotalConcCostDaily * animais * days).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-1.5 px-2 text-right text-orange-800 font-bold">
                        {finLotePeriodCost > 0 ? `${(((finTotalConcCostDaily * animais * days) / finLotePeriodCost) * 100).toFixed(1)}%` : '-'}
                      </td>
                    </tr>
                  )}

                  {/* Volumosos */}
                  {finAnimalVolItems.map(item => {
                    const pctOfTotalCost = finLotePeriodCost > 0 ? (item.lotTotalPeriodCost / finLotePeriodCost) * 100 : 0;
                    return (
                      <tr key={item.id} className="hover:bg-green-50/20">
                        <td className="py-1.5 px-2 font-semibold text-gray-800">{item.itemInfo.name}</td>
                        <td className="py-2 px-2 text-center">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase border bg-green-50 text-green-700 border-green-200">
                            Volumoso
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-right text-gray-700">
                          {item.mnVal.toFixed(2)} kg
                        </td>
                        <td className="py-1.5 px-2 text-right font-medium text-emerald-800 bg-emerald-50/20 border-l border-emerald-100">
                          {item.priceKg > 0 ? `R$ ${item.priceKg.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-1.5 px-2 text-right font-bold text-emerald-900 bg-emerald-50/20">
                          {item.dailyCost > 0 ? `R$ ${item.dailyCost.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-1.5 px-2 text-right text-gray-700 border-l border-gray-200">
                          {item.lotTotalPeriodKg.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg
                          {item.lotTotalPeriodKg >= 1000 && (
                            <span className="text-[10px] text-gray-400 block font-normal">
                              ({(item.lotTotalPeriodKg / 1000).toFixed(2)} ton)
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-2 text-right font-black text-emerald-900 bg-emerald-100/30 border-l border-emerald-200">
                          {item.lotTotalPeriodCost > 0 ? `R$ ${item.lotTotalPeriodCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                        </td>
                        <td className="py-1.5 px-2 text-right text-gray-500 font-medium">
                          {pctOfTotalCost > 0 ? `${pctOfTotalCost.toFixed(1)}%` : '-'}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Subtotal Volumoso */}
                  {finAnimalVolItems.length > 0 && (
                    <tr className="bg-[#f7fdf9] font-bold border-t border-b border-green-200 text-green-950">
                      <td colSpan={2} className="py-1.5 px-2 uppercase text-[10px] text-green-900">
                        Subtotal Volumoso
                      </td>
                      <td className="py-1.5 px-2 text-right font-bold text-green-900">
                        {finAnimalVolDailyMN.toFixed(2)} kg
                      </td>
                      <td className="py-1.5 px-2 text-right border-l border-emerald-100 text-emerald-800 text-[10px]">
                        Méd: R$ {finVolRaw.sumMN > 0 ? (finVolRaw.sumCost / finVolRaw.sumMN).toFixed(2) : '0.00'}
                      </td>
                      <td className="py-1.5 px-2 text-right font-black text-emerald-900 bg-emerald-50/20">
                        R$ {finTotalVolCostDaily.toFixed(2)}
                      </td>
                      <td className="py-1.5 px-2 text-right text-green-900 border-l border-gray-200">
                        {(finAnimalVolDailyMN * animais * days).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg
                      </td>
                      <td className="py-1.5 px-2 text-right font-black text-emerald-950 bg-emerald-100/30 border-l border-emerald-200">
                        R$ {(finTotalVolCostDaily * animais * days).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-1.5 px-2 text-right text-green-800 font-bold">
                        {finLotePeriodCost > 0 ? `${(((finTotalVolCostDaily * animais * days) / finLotePeriodCost) * 100).toFixed(1)}%` : '-'}
                      </td>
                    </tr>
                  )}
                </tbody>

                {/* TFOOT TOTAL GERAL */}
                <tfoot className="border-t-2 border-emerald-300 font-black bg-emerald-900 text-white text-xs">
                  <tr>
                    <td colSpan={2} className="py-2.5 px-2 uppercase tracking-wider text-emerald-100">
                      TOTAL DO LOTE ({animais} Cab, {days} Dias)
                    </td>
                    <td className="py-2.5 px-2 text-right text-emerald-100">
                      {finTotalMN.toFixed(2)} kg/dia
                    </td>
                    <td className="py-2.5 px-2 text-right border-l border-emerald-800 text-emerald-200 text-[10px]">
                      Méd: R$ {finTotalMN > 0 ? (finTotalCostDailyPerAnimal / finTotalMN).toFixed(2) : '0.00'}
                    </td>
                    <td className="py-2.5 px-2 text-right text-amber-300 text-sm">
                      R$ {finTotalCostDailyPerAnimal.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-2 text-right text-emerald-100 border-l border-emerald-800">
                      {(finTotalMN * animais * days).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kg MN
                    </td>
                    <td className="py-2.5 px-2 text-right text-amber-300 border-l border-emerald-800 text-sm">
                      R$ {finLotePeriodCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-2 text-right text-emerald-200">
                      100%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* Indicadores complementares de custo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">Custo por kg de Matéria Seca (CMS)</span>
              <div className="text-base font-bold text-gray-800">
                {finCostPerKgMS > 0 ? `R$ ${finCostPerKgMS.toFixed(2)} / kg MS` : '-'}
              </div>
              <span className="text-[10px] text-gray-400">Relação direta com eficiência biológica</span>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">Participação Financeira</span>
              <div className="text-base font-bold text-gray-800">
                {finTotalCostDailyPerAnimal > 0 
                  ? `${((finTotalConcCostDaily / finTotalCostDailyPerAnimal) * 100).toFixed(0)}% Conc. : ${((finTotalVolCostDaily / finTotalCostDailyPerAnimal) * 100).toFixed(0)}% Vol.` 
                  : '-'}
              </div>
              <span className="text-[10px] text-gray-400">Distribuição do orçamento diário</span>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">Volume Total em Toneladas</span>
              <div className="text-base font-bold text-gray-800">
                {((finTotalMN * animais * days) / 1000).toFixed(2)} toneladas MN
              </div>
              <span className="text-[10px] text-gray-400">Demanda física de estocagem</span>
            </div>
          </div>
            </div>
          )}

          {/* Empty state if all sections are disabled */}
          {sections.every(s => !s.enabled) && (
            <div className="py-12 text-center text-gray-400">
              <p className="font-bold text-sm text-gray-600">Nenhuma seção selecionada para exibição</p>
              <p className="text-xs mt-1 text-gray-400">Clique em "Personalizar Relatório" para selecionar os itens que deseja visualizar.</p>
            </div>
          )}

          {/* Unified Footer note */}
          <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
            <span>SAEGA - Sistema de Avaliação e Formulação Nutricional</span>
            <span>Relatório Técnico e Econômico - Uso Profissional</span>
          </div>
        </div>
      </div>
    </div>
  );
}
