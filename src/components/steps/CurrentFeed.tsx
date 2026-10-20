import { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowRight, Info, Scale, SlidersHorizontal, Sparkles } from 'lucide-react';
import { FormulationState, IngredientEntry, IngredientDef } from '../../types';
import { MOCK_INGREDIENTS, CONSUMPTION_TARGETS } from '../../data';

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
  const metaCMS = currentTarget ? weight * (currentTarget.percentPvMs / 100) : weight * 0.03;

  // Add Concentrado or Mineral
  const addConcentrate = (type: string) => {
    const defaultIngredient = MOCK_INGREDIENTS.find(i => i.type === type) || MOCK_INGREDIENTS[0];
    const newEntry: IngredientEntry = {
      id: Math.random().toString(36).substring(7),
      ingredientId: defaultIngredient.id,
      type,
      mn: '',
      ms: ''
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
      ms: ''
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
        }
        return updated;
      })
    });
  };

  // Resolve Concentrates
  let concMS = 0;
  let concMN = 0;
  const resolvedConc = data.currentConcentrates.map(entry => {
    const itemInfo = MOCK_INGREDIENTS.find(i => i.id === entry.ingredientId);
    if (!itemInfo) return null;
    const mnVal = Number(entry.mn) || 0;
    const msVal = entry.mn === '' ? 0 : mnVal * (itemInfo.msPercent / 100);
    concMS += msVal;
    concMN += mnVal;
    return { ...entry, itemInfo, mnVal, msVal };
  }).filter(Boolean) as {
    id: string;
    ingredientId: string;
    type: string;
    mn: number | '';
    ms: number | '';
    itemInfo: IngredientDef;
    mnVal: number;
    msVal: number;
  }[];

  // Resolve Volumosos
  let volMS = 0;
  let volMN = 0;
  const resolvedVol = data.currentVolumosos.map(entry => {
    const itemInfo = MOCK_INGREDIENTS.find(i => i.id === entry.ingredientId);
    if (!itemInfo) return null;
    const mnVal = Number(entry.mn) || 0;
    const msVal = entry.mn === '' ? 0 : mnVal * (itemInfo.msPercent / 100);
    volMS += msVal;
    volMN += mnVal;
    return { ...entry, itemInfo, mnVal, msVal };
  }).filter(Boolean) as {
    id: string;
    ingredientId: string;
    type: string;
    mn: number | '';
    ms: number | '';
    itemInfo: IngredientDef;
    mnVal: number;
    msVal: number;
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
  // If not explicitly defined, default to values or table sums if small
  const defaultConcKg = data.currentConcentradoKg !== undefined && data.currentConcentradoKg !== '' 
    ? Number(data.currentConcentradoKg) 
    : (concMN > 0 && concMN <= 25 ? concMN : 4.0);

  const defaultVolKg = data.currentVolumosoKg !== undefined && data.currentVolumosoKg !== '' 
    ? Number(data.currentVolumosoKg) 
    : (volMN > 0 && volMN <= 50 ? volMN : 16.0);

  const currentConcKg = data.currentConcentradoKg !== undefined ? data.currentConcentradoKg : defaultConcKg;
  const currentVolKg = data.currentVolumosoKg !== undefined ? data.currentVolumosoKg : defaultVolKg;

  const numConcKg = Number(currentConcKg) || 0;
  const numVolKg = Number(currentVolKg) || 0;
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

  const calculatedConcPctMS = totalAnimalMS > 0 ? (animalConcMS / totalAnimalMS) * 100 : 0;
  const calculatedVolPctMS = totalAnimalMS > 0 ? (animalVolMS / totalAnimalMS) * 100 : 0;

  // Handlers for updating daily feeding and proportion
  const handleConcKgChange = (val: string) => {
    const num = val === '' ? '' : Number(val);
    const updatedConcKg = num;
    const currentVol = Number(currentVolKg) || 0;
    const newTotal = (Number(updatedConcKg) || 0) + currentVol;
    const newConcPct = newTotal > 0 ? ((Number(updatedConcKg) || 0) / newTotal) * 100 : 0;
    const newVolPct = newTotal > 0 ? (currentVol / newTotal) * 100 : 0;

    updateData({
      currentConcentradoKg: updatedConcKg,
      currentConcentradoPercent: Math.round(newConcPct),
      currentVolumosoPercent: Math.round(newVolPct)
    });
  };

  const handleVolKgChange = (val: string) => {
    const num = val === '' ? '' : Number(val);
    const updatedVolKg = num;
    const currentConc = Number(currentConcKg) || 0;
    const newTotal = currentConc + (Number(updatedVolKg) || 0);
    const newConcPct = newTotal > 0 ? (currentConc / newTotal) * 100 : 0;
    const newVolPct = newTotal > 0 ? ((Number(updatedVolKg) || 0) / newTotal) * 100 : 0;

    updateData({
      currentVolumosoKg: updatedVolKg,
      currentConcentradoPercent: Math.round(newConcPct),
      currentVolumosoPercent: Math.round(newVolPct)
    });
  };

  const handleProportionChange = (concPctVal: number) => {
    const concPct = Math.max(0, Math.min(100, concPctVal));
    const volPct = 100 - concPct;
    const total = totalFeedMN > 0 ? totalFeedMN : 20; // preserve total or default to 20kg
    const newConcKg = Number(((concPct / 100) * total).toFixed(2));
    const newVolKg = Number(((volPct / 100) * total).toFixed(2));

    updateData({
      currentConcentradoPercent: concPct,
      currentVolumosoPercent: volPct,
      currentConcentradoKg: newConcKg,
      currentVolumosoKg: newVolKg
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
            <Info size={14} /> Fase 2: Diagnóstico da Propriedade
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
          <div className="border border-gray-100 rounded-xl overflow-hidden mb-4">
            <div className="grid grid-cols-12 gap-3 pb-3 pt-3 bg-gray-50/80 border-b border-gray-200 text-xs font-bold text-gray-500 px-4 uppercase">
              <div className="col-span-2">Tipo</div>
              <div className="col-span-4">Insumo</div>
              <div className="col-span-2">MN (kg)</div>
              <div className="col-span-2">MS (kg)</div>
              <div className="col-span-1">% Mistura</div>
              <div className="col-span-1 text-center">Ações</div>
            </div>

            <div className="divide-y divide-gray-100 min-h-[90px]">
              {resolvedConc.length === 0 ? (
                <div className="text-center text-gray-400 py-8 text-sm">
                  Nenhum concentrado ou mineral adicionado.
                </div>
              ) : (
                resolvedConc.map(entry => {
                  const pct = concMN > 0 ? ((entry.mnVal / concMN) * 100).toFixed(1) : '0.0';
                  return (
                    <div key={entry.id} className="grid grid-cols-12 gap-3 items-center text-sm px-4 py-3 hover:bg-orange-50/20 transition-colors">
                      <div className="col-span-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                          entry.type === 'Concentrado' ? 'bg-orange-50 text-orange-600 border-orange-200' : 
                          'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {entry.type}
                        </span>
                      </div>
                      <div className="col-span-4">
                        <select 
                          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                          value={entry.ingredientId}
                          onChange={(e) => updateConcentrate(entry.id, 'ingredientId', e.target.value)}
                        >
                          {MOCK_INGREDIENTS.filter(i => i.type === entry.type).map(i => (
                            <option key={i.id} value={i.id}>{i.name} ({i.msPercent}% MS)</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input 
                          type="number" 
                          step="0.01"
                          placeholder="0.00"
                          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold text-gray-800"
                          value={entry.mn}
                          onChange={(e) => updateConcentrate(entry.id, 'mn', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2 text-gray-600 font-semibold px-1">
                        {entry.msVal > 0 ? `${entry.msVal.toFixed(2)} kg` : '-'}
                      </div>
                      <div className="col-span-1 text-gray-700 font-bold px-1">
                        {pct}%
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button 
                          type="button"
                          onClick={() => removeConcentrate(entry.id)}
                          className="text-gray-400 hover:text-red-600 transition p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Subtotal Concentrado */}
          <div className="flex justify-between items-center bg-[#fff8eb] border border-orange-100 rounded-xl px-5 py-3 mb-6">
            <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">
              Subtotal da Batelada de Concentrado
            </span>
            <div className="flex gap-6 text-right">
              <div>
                <span className="text-[10px] font-bold text-orange-600 uppercase block">Total MN Batida</span>
                <span className="text-base font-black text-orange-800">{concMN.toFixed(2)} kg</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-orange-600 uppercase block">Total MS Batida</span>
                <span className="text-base font-black text-orange-800">{concMS.toFixed(2)} kg</span>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full bg-green-500 shrink-0"></span>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">2. Fórmula do Volumoso Atual</h3>
              </div>
              <p className="text-xs text-gray-500">
                Digite os volumosos fornecidos na fazenda (direto em kg de Matéria Natural, sem regras de compensação).
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
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
          <div className="border border-gray-100 rounded-xl overflow-hidden mb-4">
            <div className="grid grid-cols-12 gap-3 pb-3 pt-3 bg-gray-50/80 border-b border-gray-200 text-xs font-bold text-gray-500 px-4 uppercase">
              <div className="col-span-2">Tipo</div>
              <div className="col-span-4">Insumo</div>
              <div className="col-span-2">MN (kg)</div>
              <div className="col-span-2">MS (kg)</div>
              <div className="col-span-1">% Mistura</div>
              <div className="col-span-1 text-center">Ações</div>
            </div>

            <div className="divide-y divide-gray-100 min-h-[90px]">
              {resolvedVol.length === 0 ? (
                <div className="text-center text-gray-400 py-8 text-sm">
                  Nenhum volumoso adicionado.
                </div>
              ) : (
                resolvedVol.map(entry => {
                  const pct = volMN > 0 ? ((entry.mnVal / volMN) * 100).toFixed(1) : '0.0';
                  return (
                    <div key={entry.id} className="grid grid-cols-12 gap-3 items-center text-sm px-4 py-3 hover:bg-green-50/20 transition-colors">
                      <div className="col-span-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border bg-green-50 text-green-700 border-green-200">
                          Volumoso
                        </span>
                      </div>
                      <div className="col-span-4">
                        <select 
                          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                          value={entry.ingredientId}
                          onChange={(e) => updateVolumoso(entry.id, 'ingredientId', e.target.value)}
                        >
                          {MOCK_INGREDIENTS.filter(i => i.type === 'Volumoso').map(i => (
                            <option key={i.id} value={i.id}>{i.name} ({i.msPercent}% MS)</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input 
                          type="number" 
                          step="0.01"
                          placeholder="0.00"
                          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-semibold text-gray-800"
                          value={entry.mn}
                          onChange={(e) => updateVolumoso(entry.id, 'mn', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2 text-gray-600 font-semibold px-1">
                        {entry.msVal > 0 ? `${entry.msVal.toFixed(2)} kg` : '-'}
                      </div>
                      <div className="col-span-1 text-gray-700 font-bold px-1">
                        {pct}%
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button 
                          type="button"
                          onClick={() => removeVolumoso(entry.id)}
                          className="text-gray-400 hover:text-red-600 transition p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Subtotal Volumoso */}
          <div className="flex justify-between items-center bg-[#ecfdf3] border border-green-100 rounded-xl px-5 py-3 mb-6">
            <span className="text-xs font-bold text-green-700 uppercase tracking-wide">
              Subtotal da Batelada de Volumoso
            </span>
            <div className="flex gap-6 text-right">
              <div>
                <span className="text-[10px] font-bold text-green-600 uppercase block">Total MN Batida</span>
                <span className="text-base font-black text-green-800">{volMN.toFixed(2)} kg</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-green-600 uppercase block">Total MS Batida</span>
                <span className="text-base font-black text-green-800">{volMS.toFixed(2)} kg</span>
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
                <span className="text-xs font-extrabold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md">
                  {calculatedConcPctMN.toFixed(0)}% MN
                </span>
              </div>

              <div className="mt-3">
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                  Quantidade Fornecida (kg MN/animal/dia)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="ex: 4.0"
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
                <span className="font-bold text-orange-800">{animalConcMS.toFixed(2)} kg MS/dia</span>
              </div>
            </div>

            {/* 2. Volumoso Fornecido */}
            <div className="bg-[#f7fdf9] border-2 border-green-200 rounded-2xl p-5 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-green-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  Volumoso Atual
                </span>
                <span className="text-xs font-extrabold text-green-700 bg-green-100 px-2 py-0.5 rounded-md">
                  {calculatedVolPctMN.toFixed(0)}% MN
                </span>
              </div>

              <div className="mt-3">
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                  Quantidade Fornecida (kg MN/animal/dia)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="ex: 16.0"
                    value={currentVolKg}
                    onChange={(e) => handleVolKgChange(e.target.value)}
                    className="w-full text-2xl font-black text-gray-900 border-2 border-green-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-2xs"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                    kg MN
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-green-100 flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Equivalente em MS:</span>
                <span className="font-bold text-green-800">{animalVolMS.toFixed(2)} kg MS/dia</span>
              </div>
            </div>

            {/* 3. Diagnóstico do Consumo Total Atual */}
            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-2xl p-5 flex flex-col justify-between shadow-sm">
              <div>
                <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">
                  Consumo Total Real Fornecido
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{totalFeedMN.toFixed(2)}</span>
                  <span className="text-sm font-semibold text-blue-200">kg MN/animal/dia</span>
                </div>
              </div>

              <div className="space-y-2 mt-4 pt-3 border-t border-blue-700/60 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Consumo Matéria Seca (CMS):</span>
                  <span className="font-black text-amber-300 text-sm">{totalAnimalMS.toFixed(2)} kg MS/dia</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-blue-300">Proporção na Matéria Seca:</span>
                  <span className="font-bold text-white">
                    {calculatedConcPctMS.toFixed(0)}% Conc : {calculatedVolPctMS.toFixed(0)}% Vol
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-blue-300">Meta CMS teórica (Perfil):</span>
                  <span className="font-semibold text-blue-200">{metaCMS.toFixed(2)} kg MS/dia</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Proportion Presets / Slider */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-gray-700 font-bold">
              <span>Proporções Rápidas (MN):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { conc: 20, vol: 80, label: '20% C / 80% V' },
                { conc: 30, vol: 70, label: '30% C / 70% V' },
                { conc: 40, vol: 60, label: '40% C / 60% V' },
                { conc: 50, vol: 50, label: '50% C / 50% V' },
                { conc: 60, vol: 40, label: '60% C / 40% V' },
              ].map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleProportionChange(preset.conc)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition text-xs cursor-pointer border ${
                    Math.round(calculatedConcPctMN) === preset.conc 
                      ? 'bg-blue-700 text-white border-blue-800 shadow-2xs' 
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Next step notice */}
          <div className="text-xs text-blue-900 bg-blue-50/70 p-4 rounded-xl border border-blue-200/60 flex items-center gap-2">
            <Sparkles size={16} className="text-blue-600 shrink-0" />
            <span>
              <strong>Próximo passo:</strong> Na Etapa 3 (Dieta Atual), o sistema apresentará o diagnóstico nutricional calculado estritamente com base nesses <strong>{totalFeedMN.toFixed(2)} kg MN</strong> e na proporção <strong>{calculatedConcPctMN.toFixed(0)}% C : {calculatedVolPctMN.toFixed(0)}% V</strong>, sem forçar a exigência teórica do perfil.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
