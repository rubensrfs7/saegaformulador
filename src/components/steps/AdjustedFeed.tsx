import { useState } from 'react';
import { Plus, Trash2, Copy, Sparkles, Scale, SlidersHorizontal, Info, RefreshCw } from 'lucide-react';
import { FormulationState, IngredientEntry } from '../../types';
import { MOCK_INGREDIENTS, CONSUMPTION_TARGETS } from '../../data';

interface Props {
  data: FormulationState;
  updateData: (data: Partial<FormulationState>) => void;
}

export default function AdjustedFeed({ data, updateData }: Props) {
  const [lastBatchTarget, setLastBatchTarget] = useState<number>(1000);

  const currentTarget = CONSUMPTION_TARGETS.find(
    t => t.category === data.category && t.subcategory === data.subcategory
  );
  const weight = Number(data.weight) || 0;
  
  // Metas do Perfil do Animal (Etapa 1)
  const metaCMS = currentTarget ? weight * (currentTarget.percentPvMs / 100) : weight * 0.03;
  const targetConcPercent = currentTarget?.concentradoPercent || 35;
  const targetVolPercent = currentTarget?.volumosoPercent || 65;

  const metaConcentradoMS = metaCMS * (targetConcPercent / 100);
  const metaVolumosoMS = metaCMS * (targetVolPercent / 100);

  // Manipulação de Concentrado / Mineral
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
      adjustedConcentrates: [...data.adjustedConcentrates, newEntry]
    });
  };

  const removeConcentrate = (id: string) => {
    updateData({
      adjustedConcentrates: data.adjustedConcentrates.filter(c => c.id !== id)
    });
  };

  const updateConcentrate = (id: string, field: keyof IngredientEntry, value: any) => {
    updateData({
      adjustedConcentrates: data.adjustedConcentrates.map(c => {
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

  // Manipulação de Volumoso
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
      adjustedVolumosos: [...data.adjustedVolumosos, newEntry]
    });
  };

  const removeVolumoso = (id: string) => {
    updateData({
      adjustedVolumosos: data.adjustedVolumosos.filter(v => v.id !== id)
    });
  };

  const updateVolumoso = (id: string, field: keyof IngredientEntry, value: any) => {
    updateData({
      adjustedVolumosos: data.adjustedVolumosos.map(v => {
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

  // Copiar itens da Dieta Atual (Etapa 2)
  const copyFromCurrentDiet = () => {
    const copiedConc = data.currentConcentrates.map(c => ({
      ...c,
      id: Math.random().toString(36).substring(7)
    }));
    const copiedVol = data.currentVolumosos.map(v => ({
      ...v,
      id: Math.random().toString(36).substring(7)
    }));
    updateData({
      adjustedConcentrates: copiedConc,
      adjustedVolumosos: copiedVol
    });
  };

  // Resolução dos dados do Concentrado
  let concMN = 0;
  let concMS = 0;
  let concPB = 0;
  let concNDT = 0;
  let concFDN = 0;
  let concAmido = 0;
  let concCalcio = 0;
  let concFosforo = 0;

  const resolvedConc = data.adjustedConcentrates.map(entry => {
    const itemInfo = MOCK_INGREDIENTS.find(i => i.id === entry.ingredientId);
    if (!itemInfo) return null;
    const mnVal = Number(entry.mn) || 0;
    const msVal = entry.mn === '' ? 0 : mnVal * (itemInfo.msPercent / 100);
    concMN += mnVal;
    concMS += msVal;
    concPB += msVal * itemInfo.pb;
    concNDT += msVal * itemInfo.ndt;
    concFDN += msVal * itemInfo.fdn;
    concAmido += msVal * itemInfo.amido;
    concCalcio += msVal * itemInfo.calcio;
    concFosforo += msVal * itemInfo.fosforo;
    return { ...entry, itemInfo, mnVal, msVal };
  }).filter(Boolean);

  // Concentrado: % MS média da mistura e cálculo do consumo diário do animal
  const avgConcMSPercent = concMN > 0 ? (concMS / concMN) : 0;
  const animalConcDailyMN = avgConcMSPercent > 0 ? metaConcentradoMS / avgConcMSPercent : 0;

  // Resolução dos dados do Volumoso
  let volMN = 0;
  let volMS = 0;
  let volPB = 0;
  let volNDT = 0;
  let volFDN = 0;
  let volAmido = 0;
  let volCalcio = 0;
  let volFosforo = 0;

  const resolvedVol = data.adjustedVolumosos.map(entry => {
    const itemInfo = MOCK_INGREDIENTS.find(i => i.id === entry.ingredientId);
    if (!itemInfo) return null;
    const mnVal = Number(entry.mn) || 0;
    const msVal = entry.mn === '' ? 0 : mnVal * (itemInfo.msPercent / 100);
    volMN += mnVal;
    volMS += msVal;
    volPB += msVal * itemInfo.pb;
    volNDT += msVal * itemInfo.ndt;
    volFDN += msVal * itemInfo.fdn;
    volAmido += msVal * itemInfo.amido;
    volCalcio += msVal * itemInfo.calcio;
    volFosforo += msVal * itemInfo.fosforo;
    return { ...entry, itemInfo, mnVal, msVal };
  }).filter(Boolean);

  // Volumoso: % MS média da mistura e cálculo do consumo diário do animal
  const avgVolMSPercent = volMN > 0 ? (volMS / volMN) : 0;
  const animalVolDailyMN = avgVolMSPercent > 0 ? metaVolumosoMS / avgVolMSPercent : 0;

  // Nutrientes exclusivos do Concentrado (calculados sobre a MS do concentrado)
  const concNutrientCards = [
    { label: 'PB', value: concMS > 0 ? concPB / concMS : 0, target: currentTarget?.pbTmr || 0, isTmrTarget: true },
    { label: 'NDT', value: concMS > 0 ? concNDT / concMS : 0, target: currentTarget?.ndtTmr || 0, isTmrTarget: true },
    { label: 'FDN', value: concMS > 0 ? concFDN / concMS : 0, target: currentTarget?.fdnTmr || 0, isTmrTarget: true },
    { label: 'AMIDO', value: concMS > 0 ? concAmido / concMS : 0, target: (currentTarget?.amidoPercent || 0) * 10, isTmrTarget: true },
    { label: 'CÁLCIO', value: concMS > 0 ? concCalcio / concMS : 0, target: 0, isTmrTarget: false },
    { label: 'FÓSFORO', value: concMS > 0 ? concFosforo / concMS : 0, target: 0, isTmrTarget: false },
  ];

  // Nutrientes exclusivos do Volumoso (calculados sobre a MS do volumoso)
  const volNutrientCards = [
    { label: 'PB', value: volMS > 0 ? volPB / volMS : 0, target: currentTarget?.pbTmr || 0, isTmrTarget: true },
    { label: 'NDT', value: volMS > 0 ? volNDT / volMS : 0, target: currentTarget?.ndtTmr || 0, isTmrTarget: true },
    { label: 'FDN', value: volMS > 0 ? volFDN / volMS : 0, target: currentTarget?.fdnTmr || 0, isTmrTarget: true },
    { label: 'AMIDO', value: volMS > 0 ? volAmido / volMS : 0, target: (currentTarget?.amidoPercent || 0) * 10, isTmrTarget: true },
    { label: 'CÁLCIO', value: volMS > 0 ? volCalcio / volMS : 0, target: 0, isTmrTarget: false },
    { label: 'FÓSFORO', value: volMS > 0 ? volFosforo / volMS : 0, target: 0, isTmrTarget: false },
  ];

  // Função auxiliar de cores conforme pedido do usuário:
  // Vermelho: abaixo da meta
  // Amarelo: aproximando da meta
  // Verde: dentro do aceitável / muito próximo para cima da meta
  const getNutrientColor = (value: number, target: number) => {
    if (!target) return 'text-gray-800';
    if (value < target * 0.90) return 'text-red-500';
    if (value < target * 0.98) return 'text-amber-500';
    return 'text-green-600';
  };

  // Botão de Ajustar:
  // "o botão de ajustar que vai aparecer depois e apenas para deixar mais alinhado com os dados que eu ofereci"
  // Permite ajustar as quantidades para bater perfeitamente a meta individual ou redimensionar para o misturador (ex: 1000kg)
  const adjustMixToAnimalDailyTarget = () => {
    if (concMN > 0 && animalConcDailyMN > 0) {
      const scaleConc = animalConcDailyMN / concMN;
      const updatedConc = data.adjustedConcentrates.map(c => {
        const itemInfo = MOCK_INGREDIENTS.find(i => i.id === c.ingredientId);
        if (!itemInfo) return c;
        const currentMn = Number(c.mn) || 0;
        const newMn = Number((currentMn * scaleConc).toFixed(2));
        return {
          ...c,
          mn: newMn,
          ms: Number((newMn * (itemInfo.msPercent / 100)).toFixed(2))
        };
      });
      updateData({ adjustedConcentrates: updatedConc });
    }

    if (volMN > 0 && animalVolDailyMN > 0) {
      const scaleVol = animalVolDailyMN / volMN;
      const updatedVol = data.adjustedVolumosos.map(v => {
        const itemInfo = MOCK_INGREDIENTS.find(i => i.id === v.ingredientId);
        if (!itemInfo) return v;
        const currentMn = Number(v.mn) || 0;
        const newMn = Number((currentMn * scaleVol).toFixed(2));
        return {
          ...v,
          mn: newMn,
          ms: Number((newMn * (itemInfo.msPercent / 100)).toFixed(2))
        };
      });
      updateData({ adjustedVolumosos: updatedVol });
    }
  };

  const scaleMixToBatch1000 = () => {
    if (concMN > 0) {
      const scaleConc = 1000 / concMN;
      const updatedConc = data.adjustedConcentrates.map(c => {
        const itemInfo = MOCK_INGREDIENTS.find(i => i.id === c.ingredientId);
        if (!itemInfo) return c;
        const currentMn = Number(c.mn) || 0;
        const newMn = Number((currentMn * scaleConc).toFixed(2));
        return {
          ...c,
          mn: newMn,
          ms: Number((newMn * (itemInfo.msPercent / 100)).toFixed(2))
        };
      });
      updateData({ adjustedConcentrates: updatedConc });
    }

    if (volMN > 0) {
      const scaleVol = 1000 / volMN;
      const updatedVol = data.adjustedVolumosos.map(v => {
        const itemInfo = MOCK_INGREDIENTS.find(i => i.id === v.ingredientId);
        if (!itemInfo) return v;
        const currentMn = Number(v.mn) || 0;
        const newMn = Number((currentMn * scaleVol).toFixed(2));
        return {
          ...v,
          mn: newMn,
          ms: Number((newMn * (itemInfo.msPercent / 100)).toFixed(2))
        };
      });
      updateData({ adjustedVolumosos: updatedVol });
    }
  };

  const hasCurrentDietItems = data.currentConcentrates.length > 0 || data.currentVolumosos.length > 0;

  return (
    <div className="space-y-6">
      {/* Top Header & Animal Profile Targets */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2">
              <SlidersHorizontal size={14} /> Fase 4: Formulação & Ajuste Nutricional
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-800">Concentrado e Volumoso Ajustado</h2>
            <p className="text-gray-500 text-xs mt-1 max-w-2xl leading-relaxed">
              Digite a batida completa do misturador (ex: 500kg ou 1.000kg). O formulador calculará a porcentagem de cada insumo e aplicará automaticamente à meta diária de CMS do animal.
            </p>
          </div>

          <div className="flex flex-row items-center gap-2 shrink-0 flex-wrap">
            {hasCurrentDietItems && (
              <button
                type="button"
                onClick={copyFromCurrentDiet}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-200 bg-blue-50/70 text-blue-700 font-semibold hover:bg-blue-100 transition shadow-xs cursor-pointer text-xs whitespace-nowrap"
                title="Copiar alimentos e quantidades da etapa 2 para facilitar o ajuste"
              >
                <Copy size={14} /> Copiar da Dieta Atual
              </button>
            )}

            {(concMN > 0 || volMN > 0) && (
              <button
                type="button"
                onClick={adjustMixToAnimalDailyTarget}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition shadow-xs cursor-pointer text-xs whitespace-nowrap"
                title="Ajusta e converte as quantidades digitadas diretamente para o consumo diário por animal (Meta CMS)"
              >
                <Sparkles size={14} /> Ajustar para Meta Diária
              </button>
            )}

            {(concMN > 0 || volMN > 0) && (
              <button
                type="button"
                onClick={scaleMixToBatch1000}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold transition shadow-xs cursor-pointer text-xs whitespace-nowrap"
                title="Redimensiona a mistura digitada para um misturador padrão de 1.000 kg"
              >
                <RefreshCw size={14} /> Ajustar para 1.000 kg
              </button>
            )}
          </div>
        </div>

        {/* Metas em Destaque */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          {/* CMS Total */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/40 border border-blue-100">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wide block mb-1">
              Meta CMS Total ({currentTarget?.percentPvMs || 3.0}% PV)
            </span>
            <div className="text-2xl font-black text-blue-900">
              {metaCMS.toFixed(2)} <span className="text-sm font-semibold">kg MS/animal/dia</span>
            </div>
            <div className="text-xs text-blue-700 mt-1">
              Animal com peso de <strong>{weight} kg</strong>
            </div>
          </div>

          {/* Concentrado Target */}
          <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-100">
            <span className="text-xs font-bold text-orange-700 uppercase tracking-wide block mb-1">
              Meta Concentrado ({targetConcPercent}% CMS)
            </span>
            <div className="text-2xl font-black text-orange-800">
              {metaConcentradoMS.toFixed(2)} <span className="text-sm font-semibold">kg MS</span>
            </div>
            <div className="text-xs text-orange-700 mt-1">
              Consumo diário: <strong>{animalConcDailyMN > 0 ? animalConcDailyMN.toFixed(2) : '0.00'} kg MN/dia</strong>
            </div>
          </div>

          {/* Volumoso Target */}
          <div className="p-4 rounded-xl bg-green-50/60 border border-green-100">
            <span className="text-xs font-bold text-green-700 uppercase tracking-wide block mb-1">
              Meta Volumoso ({targetVolPercent}% CMS)
            </span>
            <div className="text-2xl font-black text-green-800">
              {metaVolumosoMS.toFixed(2)} <span className="text-sm font-semibold">kg MS</span>
            </div>
            <div className="text-xs text-green-700 mt-1">
              Consumo diário: <strong>{animalVolDailyMN > 0 ? animalVolDailyMN.toFixed(2) : '0.00'} kg MN/dia</strong>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: CONCENTRADO AJUSTADO */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full bg-orange-500 shrink-0"></span>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">1. Concentrado Ajustado</h3>
              </div>
              <p className="text-xs text-gray-500">
                Digite a batida completa do misturador (ex: 500kg ou 1000kg). O cálculo considerará a porcentagem da mistura sobre a meta de {metaConcentradoMS.toFixed(2)} kg MS de concentrado.
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

          {/* Table */}
          <div className="border border-gray-100 rounded-xl overflow-hidden mb-6">
            <div className="grid grid-cols-12 gap-3 pb-3 pt-3 bg-gray-50/80 border-b border-gray-200 text-xs font-bold text-gray-500 px-4 uppercase">
              <div className="col-span-2">Tipo</div>
              <div className="col-span-3">Insumo</div>
              <div className="col-span-2">MN Digitado (kg)</div>
              <div className="col-span-2">MS Mistura (kg)</div>
              <div className="col-span-1">% Mistura</div>
              <div className="col-span-1">Consumo/Dia</div>
              <div className="col-span-1 text-center">Ações</div>
            </div>

            <div className="divide-y divide-gray-100 min-h-[90px]">
              {resolvedConc.length === 0 ? (
                <div className="text-center text-gray-400 py-8 text-sm">
                  Nenhum concentrado ou mineral adicionado. Clique nos botões acima para incluir insumos.
                </div>
              ) : (
                resolvedConc.map(entry => {
                  if (!entry) return null;
                  const pct = concMN > 0 ? (entry.mnVal / concMN) * 100 : 0;
                  const animalDailyMN = (pct / 100) * animalConcDailyMN;
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
                      <div className="col-span-3">
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
                        {pct.toFixed(1)}%
                      </div>
                      <div className="col-span-1 text-orange-700 font-bold text-xs px-1" title="Consumo calculado para a meta do animal">
                        {animalDailyMN > 0 ? `${animalDailyMN.toFixed(2)} kg` : '-'}
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#fff8eb] border border-orange-100 rounded-xl px-5 py-3 mb-6 gap-3">
            <div>
              <span className="text-xs font-bold text-orange-900 uppercase tracking-wide block">
                Subtotal da Mistura de Concentrado
              </span>
              <span className="text-xs text-orange-700 font-medium">
                Meta do animal atendida: <strong>{metaConcentradoMS.toFixed(2)} kg MS/dia</strong> ({animalConcDailyMN.toFixed(2)} kg MN/dia)
              </span>
            </div>
            <div className="flex gap-6 text-right">
              <div>
                <span className="text-[10px] font-bold text-orange-600 uppercase block">Total Digitado na Batida</span>
                <span className="text-base font-black text-orange-800">{concMN.toFixed(2)} kg MN</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-orange-600 uppercase block">MS da Batida</span>
                <span className="text-base font-black text-orange-800">{concMS.toFixed(2)} kg MS</span>
              </div>
            </div>
          </div>

          {/* Nutrientes Exclusivos do Concentrado */}
          <div>
            <div className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>🌾 Nutrientes do Concentrado Ajustado</span>
              <span className="text-[10px] text-gray-400 font-normal lowercase">(calculado sobre a matéria seca da mistura de concentrado)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {concNutrientCards.map((n, i) => (
                <div key={i} className="bg-orange-50/40 border border-orange-100 rounded-xl p-3 text-center">
                  <div className="text-[10px] font-bold text-orange-700 uppercase">{n.label}</div>
                  <div className={`text-lg font-black mt-0.5 ${getNutrientColor(n.value, n.target)}`}>
                    {(n.value / 10).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-orange-700/80 font-medium">
                    {n.value.toFixed(1)} g/kg
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: VOLUMOSO AJUSTADO */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full bg-green-500 shrink-0"></span>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">2. Volumoso Ajustado</h3>
              </div>
              <p className="text-xs text-gray-500">
                Digite a batida completa do volumoso (ex: 500kg ou 1000kg). O cálculo considerará a porcentagem da mistura sobre a meta de {metaVolumosoMS.toFixed(2)} kg MS de volumoso.
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

          {/* Table */}
          <div className="border border-gray-100 rounded-xl overflow-hidden mb-6">
            <div className="grid grid-cols-12 gap-3 pb-3 pt-3 bg-gray-50/80 border-b border-gray-200 text-xs font-bold text-gray-500 px-4 uppercase">
              <div className="col-span-2">Tipo</div>
              <div className="col-span-3">Insumo</div>
              <div className="col-span-2">MN Digitado (kg)</div>
              <div className="col-span-2">MS Mistura (kg)</div>
              <div className="col-span-1">% Mistura</div>
              <div className="col-span-1">Consumo/Dia</div>
              <div className="col-span-1 text-center">Ações</div>
            </div>

            <div className="divide-y divide-gray-100 min-h-[90px]">
              {resolvedVol.length === 0 ? (
                <div className="text-center text-gray-400 py-8 text-sm">
                  Nenhum volumoso adicionado. Clique no botão acima para incluir volumosos.
                </div>
              ) : (
                resolvedVol.map(entry => {
                  if (!entry) return null;
                  const pct = volMN > 0 ? (entry.mnVal / volMN) * 100 : 0;
                  const animalDailyMN = (pct / 100) * animalVolDailyMN;
                  return (
                    <div key={entry.id} className="grid grid-cols-12 gap-3 items-center text-sm px-4 py-3 hover:bg-green-50/20 transition-colors">
                      <div className="col-span-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border bg-green-50 text-green-700 border-green-200">
                          Volumoso
                        </span>
                      </div>
                      <div className="col-span-3">
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
                        {pct.toFixed(1)}%
                      </div>
                      <div className="col-span-1 text-green-700 font-bold text-xs px-1" title="Consumo calculado para a meta do animal">
                        {animalDailyMN > 0 ? `${animalDailyMN.toFixed(2)} kg` : '-'}
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#ecfdf3] border border-green-100 rounded-xl px-5 py-3 mb-6 gap-3">
            <div>
              <span className="text-xs font-bold text-green-700 uppercase tracking-wide block">
                Subtotal da Mistura de Volumoso
              </span>
              <span className="text-xs text-green-700 font-medium">
                Meta do animal atendida: <strong>{metaVolumosoMS.toFixed(2)} kg MS/dia</strong> ({animalVolDailyMN.toFixed(2)} kg MN/dia)
              </span>
            </div>
            <div className="flex gap-6 text-right">
              <div>
                <span className="text-[10px] font-bold text-green-600 uppercase block">Total Digitado na Batida</span>
                <span className="text-base font-black text-green-800">{volMN.toFixed(2)} kg MN</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-green-600 uppercase block">MS da Batida</span>
                <span className="text-base font-black text-green-800">{volMS.toFixed(2)} kg MS</span>
              </div>
            </div>
          </div>

          {/* Nutrientes Exclusivos do Volumoso */}
          <div>
            <div className="text-xs font-bold text-green-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>🌿 Nutrientes do Volumoso Ajustado</span>
              <span className="text-[10px] text-gray-400 font-normal lowercase">(calculado sobre a matéria seca da mistura de volumoso)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {volNutrientCards.map((n, i) => (
                <div key={i} className="bg-green-50/40 border border-green-100 rounded-xl p-3 text-center">
                  <div className="text-[10px] font-bold text-green-700 uppercase">{n.label}</div>
                  <div className={`text-lg font-black mt-0.5 ${getNutrientColor(n.value, n.target)}`}>
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

      {/* Resumo da Batida e Consumo Individual */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
          Resumo da Mistura Formulada e Consumo por Animal
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="p-5 rounded-xl bg-orange-50/60 border border-orange-100">
            <div className="text-[10px] font-bold text-orange-700 uppercase tracking-wider mb-1">
              Mistura de Concentrado Cadastrada
            </div>
            <div className="text-2xl font-black text-orange-900">
              {concMN.toFixed(2)} <span className="text-sm font-semibold">kg MN na batida</span>
            </div>
            <div className="text-xs text-orange-700 mt-2 font-medium">
              Consumo individual: <strong>{animalConcDailyMN.toFixed(2)} kg MN/dia</strong> ({metaConcentradoMS.toFixed(2)} kg MS)
            </div>
          </div>

          <div className="p-5 rounded-xl bg-green-50/60 border border-green-100">
            <div className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-1">
              Mistura de Volumoso Cadastrada
            </div>
            <div className="text-2xl font-black text-green-900">
              {volMN.toFixed(2)} <span className="text-sm font-semibold">kg MN na batida</span>
            </div>
            <div className="text-xs text-green-700 mt-2 font-medium">
              Consumo individual: <strong>{animalVolDailyMN.toFixed(2)} kg MN/dia</strong> ({metaVolumosoMS.toFixed(2)} kg MS)
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-200/60 flex items-center gap-2">
          <Info size={16} className="text-purple-600 shrink-0" />
          <span>
            <strong>Lógica de Mistura:</strong> Você pode formular qualquer tamanho de batida no misturador (ex: 500 kg ou 1.000 kg). A porcentagem de cada insumo será automaticamente projetada para alimentar o lote atendendo exatamente a meta de <strong>{metaCMS.toFixed(2)} kg MS</strong> do animal.
          </span>
        </div>
      </div>
    </div>
  );
}
