import { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowRight, Info, Scale, SlidersHorizontal, Sparkles, FlaskConical } from 'lucide-react';
import { FormulationState, IngredientEntry, IngredientDef } from '../../types';
import { MOCK_INGREDIENTS, CONSUMPTION_TARGETS } from '../../data';
import SearchableIngredientSelect from '../common/SearchableIngredientSelect';

interface Props {
  data: FormulationState;
  updateData: (data: Partial<FormulationState>) => void;
  onSkipToAdjusted: () => void;
}

export default function CurrentFeed({ data, updateData, onSkipToAdjusted }: Props) {
  const currentTarget = CONSUMPTION_TARGETS.find(
    t => t.category === data.category && t.subcategory === data.subcategory
  );
  const weight = Number(data.weight) || 0;
  const animais = Number(data.quantity) || 1;
  const days = Number(data.days) || 1;
  const volMode = data.currentVolumosoMode || 'total';
  const isVolAnimalMode = volMode === 'animal';
  const metaCMS = currentTarget ? weight * (currentTarget.percentPvMs / 100) : weight * 0.03;

  // Add Concentrado or Mineral
  const addConcentrate = (type: string) => {
    const defaultIngredient = MOCK_INGREDIENTS.find(i => i.type === type) || MOCK_INGREDIENTS[0];
    const newEntry: IngredientEntry = {
      id: Math.random().toString(36).substring(7),
      ingredientId: defaultIngredient.id,
      type,
      mn: '',
      ms: '',
      pricePerKg: ''
    };
    updateData({
      hasCurrentDiet: true,
      currentConcentrates: [...data.currentConcentrates, newEntry]
    });
  };

  const removeConcentrate = (id: string) => {
    updateData({
      currentConcentrates: data.currentConcentrates.filter(c => c.id !== id)
    });
  };

  const updateConcentrate = (id: string, field: keyof IngredientEntry, value: any) => {
    updateData({
      hasCurrentDiet: true,
      currentConcentrates: data.currentConcentrates.map(c => {
        if (c.id !== id) return c;
        const itemInfo = MOCK_INGREDIENTS.find(i => i.id === (field === 'ingredientId' ? value : c.ingredientId));
        if (!itemInfo) return { ...c, [field]: value };

        let updated = { ...c, [field]: value };
        if (field === 'mn') {
          const mn = value === '' ? '' : Number(value);
          updated.mn = mn;
          updated.ms = mn === '' ? '' : mn * (itemInfo.msPercent / 100);
        } else if (field === 'ingredientId') {
          const mn = Number(c.mn) || 0;
          updated.ms = c.mn === '' ? '' : mn * (itemInfo.msPercent / 100);
        } else if (field === 'pricePerKg') {
          updated.pricePerKg = value === '' ? '' : Number(value);
        }
        return updated;
      })
    });
  };

  // Add Volumoso
  const addVolumoso = () => {
    const defaultVol = MOCK_INGREDIENTS.find(i => i.type === 'Volumoso') || MOCK_INGREDIENTS[0];
    const newEntry: IngredientEntry = {
      id: Math.random().toString(36).substring(7),
      ingredientId: defaultVol.id,
      type: 'Volumoso',
      mn: '',
      ms: '',
      pricePerKg: ''
    };
    updateData({
      hasCurrentDiet: true,
      currentVolumosos: [...data.currentVolumosos, newEntry]
    });
  };

  const removeVolumoso = (id: string) => {
    updateData({
      currentVolumosos: data.currentVolumosos.filter(v => v.id !== id)
    });
  };

  const updateVolumoso = (id: string, field: keyof IngredientEntry, value: any) => {
    updateData({
      hasCurrentDiet: true,
      currentVolumosos: data.currentVolumosos.map(v => {
        if (v.id !== id) return v;
        const itemInfo = MOCK_INGREDIENTS.find(i => i.id === (field === 'ingredientId' ? value : v.ingredientId));
        if (!itemInfo) return { ...v, [field]: value };

        let updated = { ...v, [field]: value };
        if (field === 'mn') {
          const mn = value === '' ? '' : Number(value);
          updated.mn = mn;
          updated.ms = mn === '' ? '' : mn * (itemInfo.msPercent / 100);
        } else if (field === 'ingredientId') {
          const mn = Number(v.mn) || 0;
          updated.ms = v.mn === '' ? '' : mn * (itemInfo.msPercent / 100);
        } else if (field === 'pricePerKg') {
          updated.pricePerKg = value === '' ? '' : Number(value);
        }
        return updated;
      })
    });
  };

  // Resolve Concentrates
  let concMS = 0;
  let concMN = 0;
  let concCostTotal = 0;
  const resolvedConc = data.currentConcentrates.map(entry => {
    const itemInfo = MOCK_INGREDIENTS.find(i => i.id === entry.ingredientId);
    if (!itemInfo) return null;
    const mnVal = Number(entry.mn) || 0;
    const msVal = entry.mn === '' ? 0 : mnVal * (itemInfo.msPercent / 100);
    const priceKg = entry.pricePerKg !== undefined && entry.pricePerKg !== '' ? Number(entry.pricePerKg) || 0 : 0;
    const itemCostTotal = mnVal * priceKg;
    concMS += msVal;
    concMN += mnVal;
    concCostTotal += itemCostTotal;
    return { ...entry, itemInfo, mnVal, msVal, priceKg, itemCostTotal };
  }).filter(Boolean) as {
    id: string;
    ingredientId: string;
    type: string;
    mn: number | '';
    ms: number | '';
    pricePerKg?: number | '';
    itemInfo: IngredientDef;
    mnVal: number;
    msVal: number;
    priceKg: number;
    itemCostTotal: number;
  }[];

  // Resolve Volumosos
  let volMS = 0;
  let volMN = 0;
  let volCostTotal = 0;
  const resolvedVol = data.currentVolumosos.map(entry => {
    const itemInfo = MOCK_INGREDIENTS.find(i => i.id === entry.ingredientId);
    if (!itemInfo) return null;
    const mnVal = Number(entry.mn) || 0;
    const msVal = entry.mn === '' ? 0 : mnVal * (itemInfo.msPercent / 100);
    const priceKg = entry.pricePerKg !== undefined && entry.pricePerKg !== '' ? Number(entry.pricePerKg) || 0 : 0;
    const itemCostTotal = mnVal * priceKg;
    volMS += msVal;
    volMN += mnVal;
    volCostTotal += itemCostTotal;
    return { ...entry, itemInfo, mnVal, msVal, priceKg, itemCostTotal };
  }).filter(Boolean) as {
    id: string;
    ingredientId: string;
    type: string;
    mn: number | '';
    ms: number | '';
    pricePerKg?: number | '';
    itemInfo: IngredientDef;
    mnVal: number;
    msVal: number;
    priceKg: number;
    itemCostTotal: number;
  }[];

  // Nutrient calculation helper
  const calcNutrients = (items: { msVal: number; itemInfo: IngredientDef }[], totalMS: number) => {
    if (totalMS <= 0) {
      return [
        { label: 'PB', value: 0 },
        { label: 'NDT', value: 0 },
        { label: 'FDN', value: 0 },
        { label: 'AMIDO', value: 0 },
        { label: 'CÁLCIO', value: 0 },
        { label: 'FÓSFORO', value: 0 },
      ];
    }
    let pb = 0, ndt = 0, fdn = 0, amido = 0, calcio = 0, fosforo = 0;
    items.forEach(item => {
      pb += item.msVal * item.itemInfo.pb;
      ndt += item.msVal * item.itemInfo.ndt;
      fdn += item.msVal * item.itemInfo.fdn;
      amido += item.msVal * item.itemInfo.amido;
      calcio += item.msVal * item.itemInfo.calcio;
      fosforo += item.msVal * item.itemInfo.fosforo;
    });
    return [
      { label: 'PB', value: pb / totalMS },
      { label: 'NDT', value: ndt / totalMS },
      { label: 'FDN', value: fdn / totalMS },
      { label: 'AMIDO', value: amido / totalMS },
      { label: 'CÁLCIO', value: calcio / totalMS },
      { label: 'FÓSFORO', value: fosforo / totalMS },
    ];
  };

  const concNutrientCards = calcNutrients(resolvedConc, concMS);
  const volNutrientCards = calcNutrients(resolvedVol, volMS);

  // Feeding amounts per animal (kg MN)
  const currentConcKg = data.currentConcentradoKg !== undefined ? data.currentConcentradoKg : '';
  const currentVolKg = data.currentVolumosoKg !== undefined ? data.currentVolumosoKg : '';

  const numConcKg = currentConcKg === '' ? 0 : Number(currentConcKg) || 0;
  // Quando em modo "Ofertado por Animal", a quantidade diária de volumoso é a soma dos volumosos ofertados
  const numVolKg = isVolAnimalMode ? volMN : (currentVolKg === '' ? 0 : Number(currentVolKg) || 0);
  const totalFeedMN = numConcKg + numVolKg;

  // Proportions in MN
  const calculatedConcPctMN = totalFeedMN > 0 ? (numConcKg / totalFeedMN) * 100 : 0;
  const calculatedVolPctMN = totalFeedMN > 0 ? (numVolKg / totalFeedMN) * 100 : 0;

  // Proportions in MS
  const avgConcMSPct = concMN > 0 ? concMS / concMN : 0.88;
  const avgVolMSPct = volMN > 0 ? volMS / volMN : 0.32;
  const animalConcMS = numConcKg * avgConcMSPct;
  const animalVolMS = numVolKg * avgVolMSPct;
  const totalAnimalMS = animalConcMS + animalVolMS;

  // Custos por Animal/Dia (R$/animal/dia)
  const animalConcDailyCost = resolvedConc.reduce((acc, entry) => {
    const pct = concMN > 0 ? entry.mnVal / concMN : 0;
    return acc + pct * numConcKg * entry.priceKg;
  }, 0);
  const animalVolDailyCost = isVolAnimalMode
    ? resolvedVol.reduce((acc, entry) => acc + (entry.mnVal * entry.priceKg), 0)
    : resolvedVol.reduce((acc, entry) => {
        const pct = volMN > 0 ? entry.mnVal / volMN : 0;
        return acc + pct * numVolKg * entry.priceKg;
      }, 0);
  const totalAnimalDailyCost = animalConcDailyCost + animalVolDailyCost;
  const formatBRL = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const calculatedConcPctMS = totalAnimalMS > 0 ? (animalConcMS / totalAnimalMS) * 100 : 0;
  const calculatedVolPctMS = totalAnimalMS > 0 ? (animalVolMS / totalAnimalMS) * 100 : 0;

  // Handlers for updating daily feeding and proportion
  const handleConcKgChange = (val: string) => {
    const updatedConcKg = val === '' ? '' : Number(val);
    const numConc = updatedConcKg === '' ? 0 : Number(updatedConcKg) || 0;
    const numVol = isVolAnimalMode ? volMN : (currentVolKg === '' ? 0 : Number(currentVolKg) || 0);
    const newTotal = numConc + numVol;
    const newConcPct = newTotal > 0 ? (numConc / newTotal) * 100 : 0;
    const newVolPct = newTotal > 0 ? (numVol / newTotal) * 100 : 0;

    updateData({
      currentConcentradoKg: updatedConcKg,
      currentConcentradoPercent: newTotal > 0 ? Math.round(newConcPct) : undefined,
      currentVolumosoPercent: newTotal > 0 ? Math.round(newVolPct) : undefined
    });
  };

  const handleVolKgChange = (val: string) => {
    const updatedVolKg = val === '' ? '' : Number(val);
    const numVol = updatedVolKg === '' ? 0 : Number(updatedVolKg) || 0;
    const numConc = currentConcKg === '' ? 0 : Number(currentConcKg) || 0;
    const newTotal = numConc + numVol;
    const newConcPct = newTotal > 0 ? (numConc / newTotal) * 100 : 0;
    const newVolPct = newTotal > 0 ? (numVol / newTotal) * 100 : 0;

    updateData({
      currentVolumosoKg: updatedVolKg,
      currentConcentradoPercent: newTotal > 0 ? Math.round(newConcPct) : undefined,
      currentVolumosoPercent: newTotal > 0 ? Math.round(newVolPct) : undefined
    });
  };

  const handleSyncWithTables = () => {
    if (concMN > 0 || volMN > 0) {
      const newConcKg = Number(concMN.toFixed(2));
      const newVolKg = Number(volMN.toFixed(2));
      const newTotal = newConcKg + newVolKg;
      updateData({
        currentConcentradoKg: newConcKg,
        currentVolumosoKg: newVolKg,
        currentConcentradoPercent: newTotal > 0 ? Math.round((newConcKg / newTotal) * 100) : 0,
        currentVolumosoPercent: newTotal > 0 ? Math.round((newVolKg / newTotal) * 100) : 0
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with "Não tenho dieta atual" button */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-700/60 text-blue-200 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2">
            <FlaskConical size={14} /> Fase 2: Diagnóstico da Propriedade
          </div>
          <h2 className="text-xl sm:text-2xl font-black">Concentrado e Volumoso Atual</h2>
          <p className="text-blue-100 text-xs mt-1 max-w-2xl leading-relaxed">
            Informe a <strong>proporção</strong> e <strong>quantidade diária em quilos</strong> de volumoso e concentrado fornecidos por animal, além das fórmulas das misturas da fazenda.
          </p>
        </div>
        
        <button
          type="button"
          onClick={onSkipToAdjusted}
          className="shrink-0 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-xs sm:text-sm whitespace-nowrap"
        >
          <span>Não tenho dieta atual</span>
          <ArrowRight size={16} className="stroke-[2.5]" />
        </button>
      </div>

      {/* SECTION 1: CONCENTRADO ATUAL */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full bg-orange-500 shrink-0"></span>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">1. Fórmula do Concentrado Atual</h3>
              </div>
              <p className="text-xs text-gray-500">
                Digite os ingredientes da mistura de concentrado (pode ser a batelada do misturador, ex: 500kg a 1.000kg).
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button 
                type="button"
                onClick={() => addConcentrate('Concentrado')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 border border-orange-200 bg-orange-50/70 rounded-lg text-xs sm:text-sm font-semibold text-orange-700 hover:bg-orange-100 transition shadow-xs whitespace-nowrap cursor-pointer"
              >
                <Plus size={15} /> Adicionar Concentrado
              </button>
              <button 
                type="button"
                onClick={() => addConcentrate('Mineral')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 border border-slate-300 bg-slate-50 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition shadow-xs whitespace-nowrap cursor-pointer"
              >
                <Plus size={15} /> Adicionar Mineral
              </button>
            </div>
          </div>

          {/* Concentrates Table */}
          <div className="border border-gray-100 rounded-xl overflow-hidden mb-4 overflow-x-auto shadow-2xs">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-3 w-28">Tipo</th>
                  <th className="py-3 px-3">Insumo</th>
                  <th className="py-3 px-3 w-32">MN (kg)</th>
                  <th className="py-3 px-3 w-24">MS (kg)</th>
                  <th className="py-3 px-3 w-20">% Mistura</th>
                  <th className="py-3 px-3 w-24">Consumo/Dia</th>
                  <th className="py-3 px-3 w-32 bg-emerald-50/60 text-emerald-900 border-l border-emerald-100">
                    Preço (R$/kg)
                  </th>
                  <th className="py-3 px-3 w-32 bg-emerald-50/60 text-emerald-900">
                    Total (R$)
                  </th>
                  <th className="py-3 px-2 w-12 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {resolvedConc.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-gray-400 py-8 text-sm">
                      Nenhum concentrado ou mineral adicionado.
                    </td>
                  </tr>
                ) : (
                  resolvedConc.map(entry => {
                    const pct = concMN > 0 ? (entry.mnVal / concMN) * 100 : 0;
                    const animalDailyMN = (pct / 100) * numConcKg;
                    const animalDailyCost = animalDailyMN * entry.priceKg;
                    return (
                      <tr key={entry.id} className="hover:bg-orange-50/20 transition-colors">
                        <td className="py-2.5 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                            entry.type === 'Concentrado' ? 'bg-orange-50 text-orange-600 border-orange-200' : 
                            'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            {entry.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 min-w-[220px]">
                          <SearchableIngredientSelect
                            value={entry.ingredientId}
                            onChange={(newId) => updateConcentrate(entry.id, 'ingredientId', newId)}
                            ingredients={MOCK_INGREDIENTS.filter(i => i.type === entry.type)}
                            theme="orange"
                            placeholder="Buscar insumo..."
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00"
                            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold text-gray-800"
                            value={entry.mn}
                            onChange={(e) => updateConcentrate(entry.id, 'mn', e.target.value)}
                          />
                        </td>
                        <td className="py-2.5 px-3 text-gray-600 font-semibold text-xs sm:text-sm">
                          {entry.msVal > 0 ? `${entry.msVal.toFixed(2)} kg` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-gray-700 font-bold text-xs sm:text-sm">
                          {pct.toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 text-orange-700 font-bold text-xs" title="Consumo por animal calculado a partir da quantidade fornecida (kg MN/animal/dia)">
                          {animalDailyMN > 0 ? `${animalDailyMN.toFixed(2)} kg` : '-'}
                        </td>
                        <td className="py-2.5 px-3 bg-emerald-50/20 border-l border-emerald-100">
                          <div className="relative rounded-lg">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-xs font-bold text-emerald-700">
                              R$
                            </span>
                            <input 
                              type="number" 
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="w-full border border-emerald-200 rounded-lg pl-7 pr-2 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-900 bg-white"
                              value={entry.pricePerKg ?? ''}
                              onChange={(e) => updateConcentrate(entry.id, 'pricePerKg', e.target.value)}
                            />
                          </div>
                        </td>
                        <td className="py-2.5 px-3 bg-emerald-50/20">
                          <div className="font-black text-emerald-800 text-xs sm:text-sm">
                            {entry.itemCostTotal > 0 ? `R$ ${formatBRL(entry.itemCostTotal)}` : '-'}
                          </div>
                          {animalDailyCost > 0 && (
                            <div className="text-[10px] text-emerald-700 font-semibold" title="Custo diário por animal">
                              R$ {animalDailyCost.toFixed(2)}/cab/dia
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button 
                            type="button"
                            onClick={() => removeConcentrate(entry.id)}
                            className="text-gray-400 hover:text-red-600 transition p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                            title="Remover insumo"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Subtotal Concentrado */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-[#fff8eb] border border-orange-100 rounded-xl px-5 py-3 mb-6 gap-3">
            <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">
              Subtotal da Batelada de Concentrado
            </span>
            <div className="flex flex-wrap gap-4 sm:gap-6 text-left sm:text-right">
              <div>
                <span className="text-[10px] font-bold text-orange-600 uppercase block">Total MN Batida</span>
                <span className="text-base font-black text-orange-800">{concMN.toFixed(2)} kg</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-orange-600 uppercase block">Total MS Batida</span>
                <span className="text-base font-black text-orange-800">{concMS.toFixed(2)} kg</span>
              </div>
              <div className="border-l border-orange-200 pl-4 sm:pl-6">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Valor Médio Batida</span>
                <span className="text-base font-black text-emerald-800">
                  {concMN > 0 && concCostTotal > 0 ? `R$ ${(concCostTotal / concMN).toFixed(2)}/kg` : '-'}
                </span>
                {concCostTotal > 0 && (
                  <span className="text-[10px] text-emerald-700 font-medium block">
                    Total: R$ {formatBRL(concCostTotal)}
                  </span>
                )}
              </div>
              <div className="border-l border-orange-200 pl-4 sm:pl-6">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Custo p/ Animal</span>
                <span className="text-base font-black text-emerald-800">
                  {animalConcDailyCost > 0 ? `R$ ${animalConcDailyCost.toFixed(2)}/dia` : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Nutrientes Exclusivos do Concentrado */}
          <div>
            <div className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>🌾 Nutrientes do Concentrado Atual</span>
              <span className="text-[10px] text-gray-400 font-normal lowercase">(calculado sobre a matéria seca do concentrado)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {concNutrientCards.map((n, i) => (
                <div key={i} className="bg-orange-50/40 border border-orange-100 rounded-xl p-3 text-center">
                  <div className="text-[10px] font-bold text-orange-700 uppercase">{n.label}</div>
                  <div className="text-lg font-black text-orange-950 mt-0.5">
                    {(n.value / 10).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-orange-600/80 font-medium">
                    {n.value.toFixed(1)} g/kg
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: VOLUMOSO ATUAL */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="w-3 h-3 rounded-full bg-green-500 shrink-0"></span>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">2. Fórmula do Volumoso Atual</h3>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isVolAnimalMode 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                    : 'bg-green-50 text-green-800 border-green-200'
                }`}>
                  {isVolAnimalMode ? '🐂 Modo: Por Animal' : '🏢 Modo: Total'}
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {isVolAnimalMode 
                  ? 'Digite a quantidade de volumoso ofertada diretamente por animal (kg MN/cabeça/dia).' 
                  : 'Digite os volumosos fornecidos na fazenda (quantidade total da batida/mistura no misturador ou lote).'}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {/* Toggle Total vs Por Animal */}
              <div className="inline-flex items-center bg-gray-100/90 p-1 rounded-xl border border-gray-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => updateData({ currentVolumosoMode: 'total' })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    !isVolAnimalMode
                      ? 'bg-white text-green-800 shadow-xs border border-green-200'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Informar a quantidade total da batida ou mistura no misturador"
                >
                  <span>🏢 Total</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateData({ currentVolumosoMode: 'animal' })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    isVolAnimalMode
                      ? 'bg-white text-green-800 shadow-xs border border-green-200'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Informar a quantidade ofertada por cabeça ao dia (kg MN/cab/dia)"
                >
                  <span>🐂 Por Animal</span>
                </button>
              </div>

              <button 
                type="button"
                onClick={addVolumoso}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 border border-green-200 bg-green-50/70 rounded-lg text-xs sm:text-sm font-semibold text-green-700 hover:bg-green-100 transition shadow-xs whitespace-nowrap cursor-pointer"
              >
                <Plus size={15} /> Adicionar Volumoso
              </button>
            </div>
          </div>

          {/* Volumoso Table */}
          <div className="border border-gray-100 rounded-xl overflow-hidden mb-4 overflow-x-auto shadow-2xs">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-3 w-28">Tipo</th>
                  <th className="py-3 px-3">Insumo</th>
                  <th className="py-3 px-3 w-36">
                    {isVolAnimalMode ? 'MN Ofertado (kg/dia)' : 'MN (kg)'}
                  </th>
                  <th className="py-3 px-3 w-24">
                    {isVolAnimalMode ? 'MS (kg/dia)' : 'MS (kg)'}
                  </th>
                  <th className="py-3 px-3 w-20">% Mistura</th>
                  <th className="py-3 px-3 w-28">
                    {isVolAnimalMode ? 'Ofertado/Cab' : 'Consumo/Dia'}
                  </th>
                  <th className="py-3 px-3 w-32 bg-emerald-50/60 text-emerald-900 border-l border-emerald-100">
                    Preço (R$/kg)
                  </th>
                  <th className="py-3 px-3 w-36 bg-emerald-50/60 text-emerald-900">
                    {isVolAnimalMode ? 'Total (R$/cab/dia)' : 'Total (R$)'}
                  </th>
                  <th className="py-3 px-2 w-12 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {resolvedVol.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-gray-400 py-8 text-sm">
                      Nenhum volumoso adicionado. Clique no botão acima para adicionar.
                    </td>
                  </tr>
                ) : (
                  resolvedVol.map(entry => {
                    const pct = volMN > 0 ? (entry.mnVal / volMN) * 100 : 0;
                    const animalDailyMN = isVolAnimalMode ? entry.mnVal : (pct / 100) * numVolKg;
                    const animalDailyCost = animalDailyMN * entry.priceKg;
                    const itemLotDailyCost = animalDailyCost * animais;

                    return (
                      <tr key={entry.id} className="hover:bg-green-50/20 transition-colors">
                        <td className="py-2.5 px-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border bg-green-50 text-green-700 border-green-200">
                            Volumoso
                          </span>
                        </td>
                        <td className="py-2.5 px-3 min-w-[220px]">
                          <SearchableIngredientSelect
                            value={entry.ingredientId}
                            onChange={(newId) => updateVolumoso(entry.id, 'ingredientId', newId)}
                            ingredients={MOCK_INGREDIENTS.filter(i => i.type === 'Volumoso')}
                            theme="green"
                            placeholder="Buscar volumoso..."
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00"
                            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-semibold text-gray-800"
                            value={entry.mn}
                            onChange={(e) => updateVolumoso(entry.id, 'mn', e.target.value)}
                          />
                        </td>
                        <td className="py-2.5 px-3 text-gray-600 font-semibold text-xs sm:text-sm">
                          {entry.msVal > 0 ? `${entry.msVal.toFixed(2)} kg` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-gray-700 font-bold text-xs sm:text-sm">
                          {pct.toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 text-green-700 font-bold text-xs" title="Consumo/Fornecimento diário por cabeça (kg MN/animal/dia)">
                          {animalDailyMN > 0 ? `${animalDailyMN.toFixed(2)} kg` : '-'}
                        </td>
                        <td className="py-2.5 px-3 bg-emerald-50/20 border-l border-emerald-100">
                          <div className="relative rounded-lg">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-xs font-bold text-emerald-700">
                              R$
                            </span>
                            <input 
                              type="number" 
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="w-full border border-emerald-200 rounded-lg pl-7 pr-2 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-900 bg-white"
                              value={entry.pricePerKg ?? ''}
                              onChange={(e) => updateVolumoso(entry.id, 'pricePerKg', e.target.value)}
                            />
                          </div>
                        </td>
                        <td className="py-2.5 px-3 bg-emerald-50/20">
                          {isVolAnimalMode ? (
                            <div>
                              <div className="font-black text-emerald-800 text-xs sm:text-sm">
                                {animalDailyCost > 0 ? `R$ ${formatBRL(animalDailyCost)}/dia` : '-'}
                              </div>
                              {itemLotDailyCost > 0 && animais > 1 && (
                                <div className="text-[10px] text-emerald-700 font-semibold" title={`Custo diário para o lote de ${animais} cabeças`}>
                                  Lote: R$ {formatBRL(itemLotDailyCost)}/dia
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <div className="font-black text-emerald-800 text-xs sm:text-sm">
                                {entry.itemCostTotal > 0 ? `R$ ${formatBRL(entry.itemCostTotal)}` : '-'}
                              </div>
                              {animalDailyCost > 0 && (
                                <div className="text-[10px] text-emerald-700 font-semibold" title="Custo diário por animal">
                                  R$ {animalDailyCost.toFixed(2)}/cab/dia
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button 
                            type="button"
                            onClick={() => removeVolumoso(entry.id)}
                            className="text-gray-400 hover:text-red-600 transition p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                            title="Remover insumo"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Subtotal Volumoso */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-[#ecfdf3] border border-green-100 rounded-xl px-5 py-3 mb-6 gap-3">
            <div>
              <span className="text-xs font-bold text-green-700 uppercase tracking-wide block">
                {isVolAnimalMode ? 'Subtotal do Volumoso Ofertado (por Cabeça/Dia)' : 'Subtotal da Batelada de Volumoso'}
              </span>
              {isVolAnimalMode && (
                <span className="text-xs text-green-700 font-medium">
                  Rebanho ({animais} {animais === 1 ? 'animal' : 'animais'}): <strong>{(volMN * animais).toFixed(2)} kg MN/dia</strong>
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 sm:gap-6 text-left sm:text-right">
              <div>
                <span className="text-[10px] font-bold text-green-600 uppercase block">
                  {isVolAnimalMode ? 'Ofertado MN / Cab' : 'Total MN Batida'}
                </span>
                <span className="text-base font-black text-green-800">{volMN.toFixed(2)} kg{isVolAnimalMode ? '/dia' : ''}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-green-600 uppercase block">
                  {isVolAnimalMode ? 'Ofertado MS / Cab' : 'Total MS Batida'}
                </span>
                <span className="text-base font-black text-green-800">{volMS.toFixed(2)} kg{isVolAnimalMode ? '/dia' : ''}</span>
              </div>
              <div className="border-l border-green-200 pl-4 sm:pl-6">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">
                  {isVolAnimalMode ? 'Custo / Animal' : 'Valor Médio Batida'}
                </span>
                <span className="text-base font-black text-emerald-800">
                  {isVolAnimalMode
                    ? (animalVolDailyCost > 0 ? `R$ ${formatBRL(animalVolDailyCost)}/dia` : '-')
                    : (volMN > 0 && volCostTotal > 0 ? `R$ ${(volCostTotal / volMN).toFixed(2)}/kg` : '-')}
                </span>
                {!isVolAnimalMode && volCostTotal > 0 && (
                  <span className="text-[10px] text-emerald-700 font-medium block">
                    Total: R$ {formatBRL(volCostTotal)}
                  </span>
                )}
              </div>
              <div className="border-l border-green-200 pl-4 sm:pl-6">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">
                  {isVolAnimalMode ? 'Custo Lote / Dia' : 'Custo p/ Animal'}
                </span>
                <span className="text-base font-black text-emerald-800">
                  {isVolAnimalMode
                    ? (animalVolDailyCost * animais > 0 ? `R$ ${formatBRL(animalVolDailyCost * animais)}/dia` : '-')
                    : (animalVolDailyCost > 0 ? `R$ ${animalVolDailyCost.toFixed(2)}/dia` : '-')}
                </span>
              </div>
            </div>
          </div>

          {/* Nutrientes Exclusivos do Volumoso */}
          <div>
            <div className="text-xs font-bold text-green-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>🌿 Nutrientes do Volumoso Atual</span>
              <span className="text-[10px] text-gray-400 font-normal lowercase">(calculado sobre a matéria seca do volumoso)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {volNutrientCards.map((n, i) => (
                <div key={i} className="bg-green-50/40 border border-green-100 rounded-xl p-3 text-center">
                  <div className="text-[10px] font-bold text-green-700 uppercase">{n.label}</div>
                  <div className="text-lg font-black text-green-950 mt-0.5">
                    {(n.value / 10).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-green-700/80 font-medium">
                    {n.value.toFixed(1)} g/kg
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FORNECIMENTO E PROPORÇÃO DA DIETA ATUAL (ABAIXO DE CONCENTRADO E VOLUMOSO) */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-blue-600/30 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/50 p-6 sm:p-7 border-b border-blue-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 bg-blue-600 text-white rounded-lg">
                  <Scale size={18} />
                </span>
                <h3 className="text-lg font-black text-blue-950">
                  Fornecimento e Proporção da Dieta Atual (por Cabeça/Dia)
                </h3>
              </div>
              <p className="text-xs text-blue-800/80">
                Defina a proporção e a quantidade em kg de Matéria Natural (MN) que cada animal recebe atualmente na fazenda.
              </p>
            </div>

            {(concMN > 0 || volMN > 0) && (
              <button
                type="button"
                onClick={handleSyncWithTables}
                className="text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title="Preencher com os valores totais cadastrados nas tabelas acima"
              >
                <SlidersHorizontal size={14} /> Usar totais das tabelas
              </button>
            )}
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Inputs for Quilos and Proporção */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Concentrado Fornecido */}
            <div className="bg-[#fffcf7] border-2 border-orange-200 rounded-2xl p-5 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-orange-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                  Concentrado Atual
                </span>
                {totalFeedMN > 0 ? (
                  <span className="text-xs font-extrabold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md">
                    {calculatedConcPctMN.toFixed(0)}% MN
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                    -
                  </span>
                )}
              </div>

              <div className="mt-3">
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                  Quantidade Fornecida (kg MN/animal/dia)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={currentConcKg}
                    onChange={(e) => handleConcKgChange(e.target.value)}
                    className="w-full text-2xl font-black text-gray-900 border-2 border-orange-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-2xs"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                    kg MN
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-orange-100 flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Equivalente em MS:</span>
                <span className="font-bold text-orange-800">
                  {animalConcMS > 0 ? `${animalConcMS.toFixed(2)} kg MS/dia` : '-'}
                </span>
              </div>
            </div>

            {/* 2. Volumoso Fornecido */}
            <div className="bg-[#f7fdf9] border-2 border-green-200 rounded-2xl p-5 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-green-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  Volumoso Atual
                </span>
                {totalFeedMN > 0 ? (
                  <span className="text-xs font-extrabold text-green-700 bg-green-100 px-2 py-0.5 rounded-md">
                    {calculatedVolPctMN.toFixed(0)}% MN
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                    -
                  </span>
                )}
              </div>

              {isVolAnimalMode ? (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">
                      Quantidade Fornecida (kg MN/animal/dia)
                    </label>
                    <span className="text-[10px] font-bold text-green-700 bg-green-100/80 px-2 py-0.5 rounded-md">
                      ✓ Vinculado ao Volumoso Ofertado
                    </span>
                  </div>
                  <div className="bg-white border-2 border-green-300 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-2xs">
                    <span className="text-2xl font-black text-green-900">
                      {numVolKg > 0 ? numVolKg.toFixed(2) : '0.00'}
                    </span>
                    <span className="text-xs font-bold text-green-700">
                      kg MN / cab / dia
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1.5">
                    Definido automaticamente pela soma dos volumosos ofertados na tabela acima.
                  </p>
                </div>
              ) : (
                <div className="mt-3">
                  <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                    Quantidade Fornecida (kg MN/animal/dia)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={currentVolKg}
                      onChange={(e) => handleVolKgChange(e.target.value)}
                      className="w-full text-2xl font-black text-gray-900 border-2 border-green-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-2xs"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                      kg MN
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-green-100 flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Equivalente em MS:</span>
                <span className="font-bold text-green-800">
                  {animalVolMS > 0 ? `${animalVolMS.toFixed(2)} kg MS/dia` : '-'}
                </span>
              </div>
            </div>

            {/* 3. Diagnóstico do Consumo Total Atual */}
            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-2xl p-5 flex flex-col justify-between shadow-sm">
              <div>
                <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">
                  Consumo Total Real Fornecido
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">
                    {totalFeedMN > 0 ? totalFeedMN.toFixed(2) : '0.00'}
                  </span>
                  <span className="text-sm font-semibold text-blue-200">kg MN/animal/dia</span>
                </div>
              </div>

              <div className="space-y-2 mt-4 pt-3 border-t border-blue-700/60 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Consumo Matéria Seca (CMS):</span>
                  <span className="font-black text-amber-300 text-sm">
                    {totalAnimalMS > 0 ? `${totalAnimalMS.toFixed(2)} kg MS/dia` : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-blue-300">Proporção na Matéria Seca:</span>
                  <span className="font-bold text-white">
                    {totalAnimalMS > 0
                      ? `${calculatedConcPctMS.toFixed(0)}% Conc : ${calculatedVolPctMS.toFixed(0)}% Vol`
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-blue-300">Meta CMS teórica (Perfil):</span>
                  <span className="font-semibold text-blue-200">{metaCMS.toFixed(2)} kg MS/dia</span>
                </div>
                <div className="flex justify-between items-center text-[11px] pt-2 border-t border-blue-700/60">
                  <span className="text-blue-300">Custo Alimentar Atual:</span>
                  <span className="font-black text-emerald-300 text-sm">
                    {totalAnimalDailyCost > 0 ? `R$ ${totalAnimalDailyCost.toFixed(2)}/cab/dia` : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Next step notice */}
          <div className="text-xs text-blue-900 bg-blue-50/70 p-4 rounded-xl border border-blue-200/60 flex items-center gap-2">
            <Sparkles size={16} className="text-blue-600 shrink-0" />
            <span>
              <strong>Próximo passo:</strong> Na Etapa 3 (Dieta Atual), o sistema apresentará o diagnóstico nutricional calculado estritamente com base {totalFeedMN > 0 ? (
                <>nesses <strong>{totalFeedMN.toFixed(2)} kg MN</strong> e na proporção <strong>{calculatedConcPctMN.toFixed(0)}% C : {calculatedVolPctMN.toFixed(0)}% V</strong></>
              ) : (
                'nas quantidades de MN fornecidas'
              )}, sem forçar a exigência teórica do perfil.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
