import { Plus, Trash2, Copy, Sparkles, Scale, SlidersHorizontal, Info, RefreshCw, FlaskConical } from 'lucide-react';
import { FormulationState, IngredientEntry } from '../../types';
import { MOCK_INGREDIENTS, CONSUMPTION_TARGETS } from '../../data';
import SearchableIngredientSelect from '../common/SearchableIngredientSelect';

interface Props {
  data: FormulationState;
  updateData: (data: Partial<FormulationState>) => void;
}

export default function AdjustedFeed({ data, updateData }: Props) {
  const currentTarget = CONSUMPTION_TARGETS.find(
    t => t.category === data.category && t.subcategory === data.subcategory
  );
  const weight = Number(data.weight) || 0;
  const animais = Number(data.quantity) || 1;
  const days = Number(data.days) || 1;
  const volMode = data.adjustedVolumosoMode || 'total';
  const isAdjVolAnimalMode = volMode === 'animal';
  
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
      ms: '',
      pricePerKg: ''
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
        } else if (field === 'pricePerKg') {
          updated.pricePerKg = value === '' ? '' : Number(value);
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
      ms: '',
      pricePerKg: ''
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
        } else if (field === 'pricePerKg') {
          updated.pricePerKg = value === '' ? '' : Number(value);
        }
        return updated;
      })
    });
  };

  // Copiar itens da Dieta Atual (Etapa 2)
  const copyFromCurrentDiet = () => {
    const copiedConc = data.currentConcentrates.map(c => ({
      ...c,
      id: Math.random().toString(36).substring(7),
      pricePerKg: c.pricePerKg !== undefined ? c.pricePerKg : ''
    }));
    const copiedVol = data.currentVolumosos.map(v => ({
      ...v,
      id: Math.random().toString(36).substring(7),
      pricePerKg: v.pricePerKg !== undefined ? v.pricePerKg : ''
    }));
    updateData({
      adjustedConcentrates: copiedConc,
      adjustedVolumosos: copiedVol,
      adjustedVolumosoMode: data.currentVolumosoMode || 'total'
    });
  };

  // Resolução dos dados do Concentrado
  let concMN = 0;
  let concMS = 0;
  let concCostTotal = 0;
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
    const priceKg = entry.pricePerKg !== undefined && entry.pricePerKg !== '' ? Number(entry.pricePerKg) : 0;
    const itemCostTotal = mnVal * priceKg;
    concMN += mnVal;
    concMS += msVal;
    concCostTotal += itemCostTotal;
    concPB += msVal * itemInfo.pb;
    concNDT += msVal * itemInfo.ndt;
    concFDN += msVal * itemInfo.fdn;
    concAmido += msVal * itemInfo.amido;
    concCalcio += msVal * itemInfo.calcio;
    concFosforo += msVal * itemInfo.fosforo;
    return { ...entry, itemInfo, mnVal, msVal, priceKg, itemCostTotal };
  }).filter(Boolean);

  // Concentrado: % MS média da mistura e cálculo do consumo diário do animal
  const avgConcMSPercent = concMN > 0 ? (concMS / concMN) : 0;
  const animalConcDailyMN = avgConcMSPercent > 0 ? metaConcentradoMS / avgConcMSPercent : 0;

  // Resolução dos dados do Volumoso
  let volMN = 0;
  let volMS = 0;
  let volCostTotal = 0;
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
    const priceKg = entry.pricePerKg !== undefined && entry.pricePerKg !== '' ? Number(entry.pricePerKg) : 0;
    const itemCostTotal = mnVal * priceKg;
    volMN += mnVal;
    volMS += msVal;
    volCostTotal += itemCostTotal;
    volPB += msVal * itemInfo.pb;
    volNDT += msVal * itemInfo.ndt;
    volFDN += msVal * itemInfo.fdn;
    volAmido += msVal * itemInfo.amido;
    volCalcio += msVal * itemInfo.calcio;
    volFosforo += msVal * itemInfo.fosforo;
    return { ...entry, itemInfo, mnVal, msVal, priceKg, itemCostTotal };
  }).filter(Boolean);

  // Volumoso: % MS média da mistura e cálculo do consumo diário do animal
  const avgVolMSPercent = volMN > 0 ? (volMS / volMN) : 0;
  // Se estiver no modo "Ofertado por Animal", o consumo diário é a soma do que foi ofertado.
  // Se estiver no modo "Total", calcula o consumo diário dividindo a batida total pela quantidade de animais informada no Perfil.
  const volDailyFromBatch = animais > 0 ? (volMN / animais) : 0;
  const animalVolDailyMN = isAdjVolAnimalMode 
    ? volMN 
    : (animais > 0 ? volDailyFromBatch : (avgVolMSPercent > 0 ? metaVolumosoMS / avgVolMSPercent : 0));

  // Custos por Animal/Dia (R$/animal/dia)
  const animalConcDailyCost = resolvedConc.reduce((acc, entry) => {
    if (!entry) return acc;
    const pct = concMN > 0 ? (entry.mnVal / concMN) : 0;
    const animalDailyMN = pct * animalConcDailyMN;
    return acc + (animalDailyMN * entry.priceKg);
  }, 0);

  const animalVolDailyCost = isAdjVolAnimalMode
    ? resolvedVol.reduce((acc, entry) => {
        if (!entry) return acc;
        return acc + (entry.mnVal * entry.priceKg);
      }, 0)
    : resolvedVol.reduce((acc, entry) => {
        if (!entry) return acc;
        const pct = volMN > 0 ? (entry.mnVal / volMN) : 0;
        const animalDailyMN = pct * animalVolDailyMN;
        return acc + (animalDailyMN * entry.priceKg);
      }, 0);

  const totalAnimalDailyCost = animalConcDailyCost + animalVolDailyCost;
  const totalLoteDailyCost = totalAnimalDailyCost * animais;
  const totalLotePeriodCost = totalLoteDailyCost * days;
  const formatBRL = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Resolução dos preços/custos da Dieta Atual (Passo 2) para comparação
  let currConcMNVal = 0;
  let currConcCostTotalVal = 0;
  data.currentConcentrates.forEach(entry => {
    const itemInfo = MOCK_INGREDIENTS.find(i => i.id === entry.ingredientId);
    if (!itemInfo) return;
    const mnVal = Number(entry.mn) || 0;
    const priceKg = entry.pricePerKg !== undefined && entry.pricePerKg !== '' ? Number(entry.pricePerKg) : 0;
    currConcMNVal += mnVal;
    currConcCostTotalVal += mnVal * priceKg;
  });
  const currConcAvgPrice = currConcMNVal > 0 && currConcCostTotalVal > 0 ? currConcCostTotalVal / currConcMNVal : 0;

  let currVolMNVal = 0;
  let currVolCostTotalVal = 0;
  data.currentVolumosos.forEach(entry => {
    const itemInfo = MOCK_INGREDIENTS.find(i => i.id === entry.ingredientId);
    if (!itemInfo) return;
    const mnVal = Number(entry.mn) || 0;
    const priceKg = entry.pricePerKg !== undefined && entry.pricePerKg !== '' ? Number(entry.pricePerKg) : 0;
    currVolMNVal += mnVal;
    currVolCostTotalVal += mnVal * priceKg;
  });
  const currVolAvgPrice = currVolMNVal > 0 && currVolCostTotalVal > 0 ? currVolCostTotalVal / currVolMNVal : 0;

  const currAnimalConcKgVal = data.currentConcentradoKg !== undefined && data.currentConcentradoKg !== '' ? Number(data.currentConcentradoKg) : 0;
  const currAnimalConcDailyCost = currConcAvgPrice > 0 && currAnimalConcKgVal > 0 ? currConcAvgPrice * currAnimalConcKgVal : 0;

  const isCurrVolAnimalMode = data.currentVolumosoMode === 'animal';
  const currAnimalVolDailyCost = isCurrVolAnimalMode
    ? currVolCostTotalVal
    : (animais > 0 ? currVolCostTotalVal / animais : 0);

  // Resolução dos nutrientes da Dieta Atual (Passo 2) para comparação
  let currConcMS = 0;
  let currConcPB = 0;
  let currConcNDT = 0;
  let currConcFDN = 0;
  let currConcAmido = 0;
  let currConcCalcio = 0;
  let currConcFosforo = 0;

  if (data.hasCurrentDiet) {
    data.currentConcentrates.forEach(entry => {
      const itemInfo = MOCK_INGREDIENTS.find(i => i.id === entry.ingredientId);
      if (!itemInfo) return;
      const mnVal = Number(entry.mn) || 0;
      const msVal = entry.mn === '' ? 0 : mnVal * (itemInfo.msPercent / 100);
      currConcMS += msVal;
      currConcPB += msVal * itemInfo.pb;
      currConcNDT += msVal * itemInfo.ndt;
      currConcFDN += msVal * itemInfo.fdn;
      currConcAmido += msVal * itemInfo.amido;
      currConcCalcio += msVal * itemInfo.calcio;
      currConcFosforo += msVal * itemInfo.fosforo;
    });
  }

  let currVolMS = 0;
  let currVolPB = 0;
  let currVolNDT = 0;
  let currVolFDN = 0;
  let currVolAmido = 0;
  let currVolCalcio = 0;
  let currVolFosforo = 0;

  if (data.hasCurrentDiet) {
    data.currentVolumosos.forEach(entry => {
      const itemInfo = MOCK_INGREDIENTS.find(i => i.id === entry.ingredientId);
      if (!itemInfo) return;
      const mnVal = Number(entry.mn) || 0;
      const msVal = entry.mn === '' ? 0 : mnVal * (itemInfo.msPercent / 100);
      currVolMS += msVal;
      currVolPB += msVal * itemInfo.pb;
      currVolNDT += msVal * itemInfo.ndt;
      currVolFDN += msVal * itemInfo.fdn;
      currVolAmido += msVal * itemInfo.amido;
      currVolCalcio += msVal * itemInfo.calcio;
      currVolFosforo += msVal * itemInfo.fosforo;
    });
  }

  const concCurrentPB = currConcMS > 0 ? currConcPB / currConcMS : null;
  const concCurrentNDT = currConcMS > 0 ? currConcNDT / currConcMS : null;
  const concCurrentFDN = currConcMS > 0 ? currConcFDN / currConcMS : null;
  const concCurrentAmido = currConcMS > 0 ? currConcAmido / currConcMS : null;
  const concCurrentCalcio = currConcMS > 0 ? currConcCalcio / currConcMS : null;
  const concCurrentFosforo = currConcMS > 0 ? currConcFosforo / currConcMS : null;

  const volCurrentPB = currVolMS > 0 ? currVolPB / currVolMS : null;
  const volCurrentNDT = currVolMS > 0 ? currVolNDT / currVolMS : null;
  const volCurrentFDN = currVolMS > 0 ? currVolFDN / currVolMS : null;
  const volCurrentAmido = currVolMS > 0 ? currVolAmido / currVolMS : null;
  const volCurrentCalcio = currVolMS > 0 ? currVolCalcio / currVolMS : null;
  const volCurrentFosforo = currVolMS > 0 ? currVolFosforo / currVolMS : null;

  const getNutrientComparison = (label: string, adjustedVal: number, currentVal: number | null, isVolumoso = false) => {
    if (currentVal === null || currentVal === undefined || currentVal <= 0) {
      return {
        diff: 0,
        status: 'neutral' as const,
        statusLabel: 'Sem base atual',
        hasCurrent: false
      };
    }

    const diff = adjustedVal - currentVal;
    const absDiff = Math.abs(diff);

    if (absDiff < 0.1) {
      return {
        diff: 0,
        status: 'equal' as const,
        statusLabel: 'Igual ao Atual',
        hasCurrent: true
      };
    }

    if (label === 'PB') {
      const isBetter = diff > 0;
      return {
        diff,
        status: isBetter ? ('better' as const) : ('worse' as const),
        statusLabel: isBetter ? 'Melhor (+Proteína)' : 'Menor (-Proteína)',
        hasCurrent: true
      };
    }

    if (label === 'NDT') {
      const isBetter = diff > 0;
      return {
        diff,
        status: isBetter ? ('better' as const) : ('worse' as const),
        statusLabel: isBetter ? 'Melhor (+Energia)' : 'Menor (-Energia)',
        hasCurrent: true
      };
    }

    if (label === 'FDN') {
      if (isVolumoso) {
        return {
          diff,
          status: 'neutral' as const,
          statusLabel: diff > 0 ? '+Fibra efetiva' : '-Fibra efetiva',
          hasCurrent: true
        };
      } else {
        const isBetter = diff < 0;
        return {
          diff,
          status: isBetter ? ('better' as const) : ('worse' as const),
          statusLabel: isBetter ? 'Melhor (Mais denso)' : 'Mais fibroso',
          hasCurrent: true
        };
      }
    }

    if (label === 'AMIDO') {
      const isBetter = diff > 0;
      return {
        diff,
        status: isBetter ? ('better' as const) : ('neutral' as const),
        statusLabel: isBetter ? 'Maior (+Amido)' : 'Menor (-Amido)',
        hasCurrent: true
      };
    }

    if (label === 'CÁLCIO' || label === 'FÓSFORO') {
      const isBetter = diff > 0;
      return {
        diff,
        status: isBetter ? ('better' as const) : ('worse' as const),
        statusLabel: isBetter ? 'Melhor (+Mineral)' : 'Menor (-Mineral)',
        hasCurrent: true
      };
    }

    return {
      diff,
      status: diff > 0 ? ('better' as const) : ('worse' as const),
      statusLabel: diff > 0 ? 'Maior' : 'Menor',
      hasCurrent: true
    };
  };

  // Nutrientes exclusivos do Concentrado (calculados sobre a MS do concentrado) com comparação
  const concNutrientCards = [
    { label: 'PB', value: concMS > 0 ? concPB / concMS : 0, currValue: concCurrentPB, ...getNutrientComparison('PB', concMS > 0 ? concPB / concMS : 0, concCurrentPB, false) },
    { label: 'NDT', value: concMS > 0 ? concNDT / concMS : 0, currValue: concCurrentNDT, ...getNutrientComparison('NDT', concMS > 0 ? concNDT / concMS : 0, concCurrentNDT, false) },
    { label: 'FDN', value: concMS > 0 ? concFDN / concMS : 0, currValue: concCurrentFDN, ...getNutrientComparison('FDN', concMS > 0 ? concFDN / concMS : 0, concCurrentFDN, false) },
    { label: 'AMIDO', value: concMS > 0 ? concAmido / concMS : 0, currValue: concCurrentAmido, ...getNutrientComparison('AMIDO', concMS > 0 ? concAmido / concMS : 0, concCurrentAmido, false) },
    { label: 'CÁLCIO', value: concMS > 0 ? concCalcio / concMS : 0, currValue: concCurrentCalcio, ...getNutrientComparison('CÁLCIO', concMS > 0 ? concCalcio / concMS : 0, concCurrentCalcio, false) },
    { label: 'FÓSFORO', value: concMS > 0 ? concFosforo / concMS : 0, currValue: concCurrentFosforo, ...getNutrientComparison('FÓSFORO', concMS > 0 ? concFosforo / concMS : 0, concCurrentFosforo, false) },
  ];

  // Nutrientes exclusivos do Volumoso (calculados sobre a MS do volumoso) com comparação
  const volNutrientCards = [
    { label: 'PB', value: volMS > 0 ? volPB / volMS : 0, currValue: volCurrentPB, ...getNutrientComparison('PB', volMS > 0 ? volPB / volMS : 0, volCurrentPB, true) },
    { label: 'NDT', value: volMS > 0 ? volNDT / volMS : 0, currValue: volCurrentNDT, ...getNutrientComparison('NDT', volMS > 0 ? volNDT / volMS : 0, volCurrentNDT, true) },
    { label: 'FDN', value: volMS > 0 ? volFDN / volMS : 0, currValue: volCurrentFDN, ...getNutrientComparison('FDN', volMS > 0 ? volFDN / volMS : 0, volCurrentFDN, true) },
    { label: 'AMIDO', value: volMS > 0 ? volAmido / volMS : 0, currValue: volCurrentAmido, ...getNutrientComparison('AMIDO', volMS > 0 ? volAmido / volMS : 0, volCurrentAmido, true) },
    { label: 'CÁLCIO', value: volMS > 0 ? volCalcio / volMS : 0, currValue: volCurrentCalcio, ...getNutrientComparison('CÁLCIO', volMS > 0 ? volCalcio / volMS : 0, volCurrentCalcio, true) },
    { label: 'FÓSFORO', value: volMS > 0 ? volFosforo / volMS : 0, currValue: volCurrentFosforo, ...getNutrientComparison('FÓSFORO', volMS > 0 ? volFosforo / volMS : 0, volCurrentFosforo, true) },
  ];

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

    // No modo "Por Animal" o volumoso é kg/cabeça/dia, não uma batida: não redimensionar para 1.000 kg
    if (volMN > 0 && !isAdjVolAnimalMode) {
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
              <FlaskConical size={14} /> Fase 4: Formulação & Ajuste Nutricional
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
          <div className="border border-gray-100 rounded-xl overflow-hidden mb-6 overflow-x-auto shadow-2xs">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-3 w-28">Tipo</th>
                  <th className="py-3 px-3">Insumo</th>
                  <th className="py-3 px-3 w-32">MN Batida (kg)</th>
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
                      Nenhum concentrado ou mineral adicionado. Clique nos botões acima para incluir insumos.
                    </td>
                  </tr>
                ) : (
                  resolvedConc.map(entry => {
                    if (!entry) return null;
                    const pct = concMN > 0 ? (entry.mnVal / concMN) * 100 : 0;
                    const animalDailyMN = (pct / 100) * animalConcDailyMN;
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
                        <td className="py-2.5 px-3 text-orange-700 font-bold text-xs" title="Consumo calculado para a meta do animal">
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
                            {entry.itemCostTotal > 0 ? `R$ ${entry.itemCostTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
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
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-[#fff8eb] border border-orange-100 rounded-xl px-5 py-3.5 mb-6 gap-3">
            <div className="min-w-0">
              <span className="text-xs font-bold text-orange-900 uppercase tracking-wide block">
                Subtotal da Mistura de Concentrado
              </span>
              <span className="text-xs text-orange-700 font-medium">
                Meta atendida: <strong>{metaConcentradoMS.toFixed(2)} kg MS/dia</strong> ({animalConcDailyMN.toFixed(2)} kg MN/dia)
              </span>
            </div>
            <div className="flex items-center flex-nowrap shrink-0 gap-3 sm:gap-5 text-left sm:text-right overflow-x-auto max-w-full py-0.5">
              <div className="whitespace-nowrap shrink-0">
                <span className="text-[10px] font-bold text-orange-600 uppercase block">Total Batida</span>
                <span className="text-sm sm:text-base font-black text-orange-800">{concMN.toFixed(2)} kg MN</span>
              </div>
              <div className="whitespace-nowrap shrink-0 border-l border-orange-200/80 pl-3 sm:pl-5">
                <span className="text-[10px] font-bold text-orange-600 uppercase block">MS da Batida</span>
                <span className="text-sm sm:text-base font-black text-orange-800">{concMS.toFixed(2)} kg MS</span>
              </div>
              <div className="whitespace-nowrap shrink-0 border-l border-orange-200/80 pl-3 sm:pl-5">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Valor Médio Batida</span>
                <span className="text-sm sm:text-base font-black text-emerald-800">
                  {concMN > 0 && concCostTotal > 0 ? `R$ ${(concCostTotal / concMN).toFixed(2)}/kg` : '-'}
                </span>
                {concCostTotal > 0 && (
                  <span className="text-[10px] text-emerald-700 font-medium block">
                    Total: R$ {formatBRL(concCostTotal)}
                  </span>
                )}
                {data.hasCurrentDiet && currConcAvgPrice > 0 && concMN > 0 && concCostTotal > 0 && (
                  <span className="text-[9px] font-bold block mt-0.5">
                    {concCostTotal / concMN < currConcAvgPrice ? (
                      <span className="text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded border border-emerald-200" title={`Preço na Pág. 2: R$ ${currConcAvgPrice.toFixed(2)}/kg`}>
                        ▼ -R$ {(currConcAvgPrice - (concCostTotal / concMN)).toFixed(2)}
                      </span>
                    ) : concCostTotal / concMN > currConcAvgPrice ? (
                      <span className="text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-200" title={`Preço na Pág. 2: R$ ${currConcAvgPrice.toFixed(2)}/kg`}>
                        ▲ +R$ {((concCostTotal / concMN) - currConcAvgPrice).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-500 font-normal">
                        = R$ 0.00
                      </span>
                    )}
                  </span>
                )}
              </div>
              <div className="whitespace-nowrap shrink-0 border-l border-orange-200/80 pl-3 sm:pl-5">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Custo p/ Animal</span>
                <span className="text-sm sm:text-base font-black text-emerald-800">
                  {animalConcDailyCost > 0 ? `R$ ${animalConcDailyCost.toFixed(2)}/dia` : '-'}
                </span>
                {data.hasCurrentDiet && currAnimalConcDailyCost > 0 && animalConcDailyCost > 0 && (
                  <span className="text-[9px] font-bold block mt-0.5">
                    {animalConcDailyCost < currAnimalConcDailyCost ? (
                      <span className="text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded border border-emerald-200" title={`Custo na Pág. 2: R$ ${currAnimalConcDailyCost.toFixed(2)}/dia`}>
                        ▼ -R$ {(currAnimalConcDailyCost - animalConcDailyCost).toFixed(2)}
                      </span>
                    ) : animalConcDailyCost > currAnimalConcDailyCost ? (
                      <span className="text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-200" title={`Custo na Pág. 2: R$ ${currAnimalConcDailyCost.toFixed(2)}/dia`}>
                        ▲ +R$ {(animalConcDailyCost - currAnimalConcDailyCost).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-500 font-normal">
                        = R$ 0.00
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Nutrientes do Concentrado Ajustado vs Atual */}
          <div>
            <div className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span>🌾 Nutrientes do Concentrado Ajustado</span>
                <span className="text-[10px] text-gray-400 font-normal lowercase">(calculado sobre a matéria seca da mistura)</span>
              </div>
              {currConcMS > 0 ? (
                <span className="text-[10px] font-bold text-orange-800 bg-orange-100/80 border border-orange-200 px-2 py-0.5 rounded-md">
                  Comparando com Concentrado Atual (Passo 2)
                </span>
              ) : (
                <span className="text-[10px] text-gray-400 italic">
                  (Sem concentrado cadastrado na Dieta Atual)
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {concNutrientCards.map((n, i) => {
                const diff = n.diff;
                const diffPercent = diff / 10;
                return (
                  <div key={i} className="bg-orange-50/50 border border-orange-200/80 rounded-xl p-3 flex flex-col justify-between shadow-2xs hover:shadow-xs transition">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black text-orange-800 uppercase tracking-wider">{n.label}</span>
                      {n.hasCurrent && (
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                          n.status === 'better'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : n.status === 'worse'
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {diff > 0.05 ? `▲ +${diffPercent.toFixed(1)}%` : diff < -0.05 ? `▼ ${diffPercent.toFixed(1)}%` : '='}
                        </span>
                      )}
                    </div>

                    <div className="my-1">
                      <div className="text-lg font-black text-gray-950 leading-tight">
                        {(n.value / 10).toFixed(1)}%
                      </div>
                      <div className="text-[10px] text-orange-700/80 font-medium">
                        {n.value.toFixed(1)} g/kg
                      </div>
                    </div>

                    <div className="pt-2 border-t border-orange-200/60 mt-1 text-[10px] space-y-0.5">
                      {n.hasCurrent && n.currValue !== null ? (
                        <>
                          <div className="flex justify-between items-center text-gray-500">
                            <span>Atual:</span>
                            <span className="font-bold text-gray-700">{(n.currValue / 10).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-500">Status:</span>
                            <span className={`font-black ${
                              n.status === 'better' ? 'text-emerald-700' : n.status === 'worse' ? 'text-amber-800' : 'text-gray-600'
                            }`}>
                              {n.statusLabel}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-[9px] text-gray-400 text-center py-0.5">
                          Sem dieta atual
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: VOLUMOSO AJUSTADO */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="w-3 h-3 rounded-full bg-green-500 shrink-0"></span>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">2. Volumoso Ajustado</h3>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isAdjVolAnimalMode 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                    : 'bg-green-50 text-green-800 border-green-200'
                }`}>
                  {isAdjVolAnimalMode ? '🐂 Modo: Por Animal' : '🏢 Modo: Total'}
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {isAdjVolAnimalMode
                  ? 'Digite a quantidade de volumoso ofertada diretamente por animal (kg MN/cabeça/dia).'
                  : `Digite a batida completa do volumoso (ex: 500kg ou 1000kg). O cálculo considerará a porcentagem da mistura sobre a meta de ${metaVolumosoMS.toFixed(2)} kg MS de volumoso.`}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {/* Toggle Total vs Por Animal */}
              <div className="inline-flex items-center bg-gray-100/90 p-1 rounded-xl border border-gray-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    const resetVol = data.adjustedVolumosos.map(v => ({ ...v, mn: '' as number | '', ms: '' as number | '' }));
                    updateData({ adjustedVolumosoMode: 'total', adjustedVolumosos: resetVol });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    !isAdjVolAnimalMode
                      ? 'bg-white text-green-800 shadow-xs border border-green-200'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Informar a quantidade total da batida ou mistura no misturador"
                >
                  <span>🏢 Total</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const resetVol = data.adjustedVolumosos.map(v => ({ ...v, mn: '' as number | '', ms: '' as number | '' }));
                    updateData({ adjustedVolumosoMode: 'animal', adjustedVolumosos: resetVol });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    isAdjVolAnimalMode
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

          {/* Table */}
          <div className="border border-gray-100 rounded-xl overflow-hidden mb-6 overflow-x-auto shadow-2xs">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-3 w-28">Tipo</th>
                  <th className="py-3 px-3">Insumo</th>
                  <th className="py-3 px-3 w-36">
                    {isAdjVolAnimalMode ? 'MN Ofertado (kg/dia)' : 'MN Batida (kg)'}
                  </th>
                  <th className="py-3 px-3 w-24">
                    {isAdjVolAnimalMode ? 'MS (kg/dia)' : 'MS (kg)'}
                  </th>
                  <th className="py-3 px-3 w-20">% Mistura</th>
                  <th className="py-3 px-3 w-28">
                    {isAdjVolAnimalMode ? 'Ofertado/Cab' : 'Consumo/Dia'}
                  </th>
                  <th className="py-3 px-3 w-32 bg-emerald-50/60 text-emerald-900 border-l border-emerald-100">
                    Preço (R$/kg)
                  </th>
                  <th className="py-3 px-3 w-36 bg-emerald-50/60 text-emerald-900">
                    {isAdjVolAnimalMode ? 'Total (R$/cab/dia)' : 'Total (R$)'}
                  </th>
                  <th className="py-3 px-2 w-12 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {resolvedVol.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-gray-400 py-8 text-sm">
                      Nenhum volumoso adicionado. Clique no botão acima para incluir volumosos.
                    </td>
                  </tr>
                ) : (
                  resolvedVol.map(entry => {
                    if (!entry) return null;
                    const pct = volMN > 0 ? (entry.mnVal / volMN) * 100 : 0;
                    const animalDailyMN = isAdjVolAnimalMode ? entry.mnVal : (pct / 100) * animalVolDailyMN;
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
                        <td 
                          className="py-2.5 px-3 text-green-700 font-bold text-xs" 
                          title={
                            isAdjVolAnimalMode
                              ? "Consumo/Fornecimento diário por cabeça (kg MN/animal/dia)"
                              : animais > 0
                                ? `Consumo diário: ${entry.mnVal} kg ÷ ${animais} animais = ${(entry.mnVal / animais).toFixed(2)} kg/dia`
                                : "Informe a quantidade de animais no Perfil (Etapa 1) para calcular o consumo diário"
                          }
                        >
                          {animalDailyMN > 0 ? (
                            `${animalDailyMN.toFixed(2)} kg`
                          ) : (entry.mnVal > 0 && animais <= 0 ? (
                            <span className="text-[10px] text-amber-600 font-semibold" title="Informe a quantidade de animais no Perfil">def. animais</span>
                          ) : (
                            '-'
                          ))}
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
                          {isAdjVolAnimalMode ? (
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
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-[#ecfdf3] border border-green-100 rounded-xl px-5 py-3.5 mb-6 gap-3">
            <div className="min-w-0">
              <span className="text-xs font-bold text-green-700 uppercase tracking-wide block">
                {isAdjVolAnimalMode ? 'Subtotal do Volumoso Ofertado (por Cabeça/Dia)' : 'Subtotal da Mistura de Volumoso'}
              </span>
              <span className="text-xs text-green-700 font-medium">
                {isAdjVolAnimalMode ? (
                  <>
                    Fornecido: <strong>{volMN.toFixed(2)} kg MN/dia</strong> ({volMS.toFixed(2)} kg MS) • Meta recomendada: {metaVolumosoMS.toFixed(2)} kg MS
                  </>
                ) : (
                  <>
                    Quantidade Fornecida Total: <strong>{animalVolDailyMN.toFixed(2)} kg MN/dia</strong> ({(animalVolDailyMN * avgVolMSPercent).toFixed(2)} kg MS)
                    {animais > 0 && volMN > 0 && (
                      <span className="ml-1 text-green-800 font-semibold">
                        (Soma dos consumos: {volMN.toFixed(2)} kg ÷ {animais} anim.)
                      </span>
                    )}
                    • Meta recomendada: {metaVolumosoMS.toFixed(2)} kg MS
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center flex-nowrap shrink-0 gap-3 sm:gap-5 text-left sm:text-right overflow-x-auto max-w-full py-0.5">
              <div className="whitespace-nowrap shrink-0">
                <span className="text-[10px] font-bold text-green-600 uppercase block">
                  {isAdjVolAnimalMode ? 'Ofertado MN / Cab' : 'Total Batida'}
                </span>
                <span className="text-sm sm:text-base font-black text-green-800">
                  {volMN.toFixed(2)} kg {isAdjVolAnimalMode ? '/dia' : 'MN'}
                </span>
              </div>
              <div className="whitespace-nowrap shrink-0 border-l border-green-200/80 pl-3 sm:pl-5">
                <span className="text-[10px] font-bold text-green-600 uppercase block">
                  {isAdjVolAnimalMode ? 'Ofertado MS / Cab' : 'MS da Batida'}
                </span>
                <span className="text-sm sm:text-base font-black text-green-800">
                  {volMS.toFixed(2)} kg {isAdjVolAnimalMode ? '/dia' : 'MS'}
                </span>
              </div>
              <div className="whitespace-nowrap shrink-0 border-l border-green-200/80 pl-3 sm:pl-5">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">
                  {isAdjVolAnimalMode ? 'Custo / Animal' : 'Valor Médio Batida'}
                </span>
                <span className="text-sm sm:text-base font-black text-emerald-800">
                  {isAdjVolAnimalMode
                    ? (animalVolDailyCost > 0 ? `R$ ${formatBRL(animalVolDailyCost)}/dia` : '-')
                    : (volMN > 0 && volCostTotal > 0 ? `R$ ${(volCostTotal / volMN).toFixed(2)}/kg` : '-')}
                </span>
                {!isAdjVolAnimalMode && volCostTotal > 0 && (
                  <span className="text-[10px] text-emerald-700 font-medium block">
                    Total: R$ {formatBRL(volCostTotal)}
                  </span>
                )}
                {data.hasCurrentDiet && currVolAvgPrice > 0 && volMN > 0 && volCostTotal > 0 && !isAdjVolAnimalMode && (
                  <span className="text-[9px] font-bold block mt-0.5">
                    {volCostTotal / volMN < currVolAvgPrice ? (
                      <span className="text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded border border-emerald-200" title={`Preço na Pág. 2: R$ ${currVolAvgPrice.toFixed(2)}/kg`}>
                        ▼ -R$ {(currVolAvgPrice - (volCostTotal / volMN)).toFixed(2)}
                      </span>
                    ) : volCostTotal / volMN > currVolAvgPrice ? (
                      <span className="text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-200" title={`Preço na Pág. 2: R$ ${currVolAvgPrice.toFixed(2)}/kg`}>
                        ▲ +R$ {((volCostTotal / volMN) - currVolAvgPrice).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-500 font-normal">
                        = R$ 0.00
                      </span>
                    )}
                  </span>
                )}
              </div>
              <div className="whitespace-nowrap shrink-0 border-l border-green-200/80 pl-3 sm:pl-5">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">
                  {isAdjVolAnimalMode ? 'Custo Lote / Dia' : 'Custo p/ Animal'}
                </span>
                <span className="text-sm sm:text-base font-black text-emerald-800">
                  {isAdjVolAnimalMode
                    ? (animalVolDailyCost * animais > 0 ? `R$ ${formatBRL(animalVolDailyCost * animais)}/dia` : '-')
                    : (animalVolDailyCost > 0 ? `R$ ${animalVolDailyCost.toFixed(2)}/dia` : '-')}
                </span>
                {data.hasCurrentDiet && currAnimalVolDailyCost > 0 && animalVolDailyCost > 0 && (
                  <span className="text-[9px] font-bold block mt-0.5">
                    {animalVolDailyCost < currAnimalVolDailyCost ? (
                      <span className="text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded border border-emerald-200" title={`Custo na Pág. 2: R$ ${currAnimalVolDailyCost.toFixed(2)}/dia`}>
                        ▼ -R$ {(currAnimalVolDailyCost - animalVolDailyCost).toFixed(2)}
                      </span>
                    ) : animalVolDailyCost > currAnimalVolDailyCost ? (
                      <span className="text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-200" title={`Custo na Pág. 2: R$ ${currAnimalVolDailyCost.toFixed(2)}/dia`}>
                        ▲ +R$ {(animalVolDailyCost - currAnimalVolDailyCost).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-500 font-normal">
                        = R$ 0.00
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Nutrientes do Volumoso Ajustado vs Atual */}
          <div>
            <div className="text-xs font-bold text-green-800 uppercase tracking-wider mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span>🌿 Nutrientes do Volumoso Ajustado</span>
                <span className="text-[10px] text-gray-400 font-normal lowercase">(calculado sobre a matéria seca da mistura)</span>
              </div>
              {currVolMS > 0 ? (
                <span className="text-[10px] font-bold text-green-800 bg-green-100/80 border border-green-200 px-2 py-0.5 rounded-md">
                  Comparando com Volumoso Atual (Passo 2)
                </span>
              ) : (
                <span className="text-[10px] text-gray-400 italic">
                  (Sem volumoso cadastrado na Dieta Atual)
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {volNutrientCards.map((n, i) => {
                const diff = n.diff;
                const diffPercent = diff / 10;
                return (
                  <div key={i} className="bg-green-50/50 border border-green-200/80 rounded-xl p-3 flex flex-col justify-between shadow-2xs hover:shadow-xs transition">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black text-green-800 uppercase tracking-wider">{n.label}</span>
                      {n.hasCurrent && (
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                          n.status === 'better'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : n.status === 'worse'
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {diff > 0.05 ? `▲ +${diffPercent.toFixed(1)}%` : diff < -0.05 ? `▼ ${diffPercent.toFixed(1)}%` : '='}
                        </span>
                      )}
                    </div>

                    <div className="my-1">
                      <div className="text-lg font-black text-gray-950 leading-tight">
                        {(n.value / 10).toFixed(1)}%
                      </div>
                      <div className="text-[10px] text-green-700/80 font-medium">
                        {n.value.toFixed(1)} g/kg
                      </div>
                    </div>

                    <div className="pt-2 border-t border-green-200/60 mt-1 text-[10px] space-y-0.5">
                      {n.hasCurrent && n.currValue !== null ? (
                        <>
                          <div className="flex justify-between items-center text-gray-500">
                            <span>Atual:</span>
                            <span className="font-bold text-gray-700">{(n.currValue / 10).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-500">Status:</span>
                            <span className={`font-black ${
                              n.status === 'better' ? 'text-emerald-700' : n.status === 'worse' ? 'text-amber-800' : 'text-gray-600'
                            }`}>
                              {n.statusLabel}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-[9px] text-gray-400 text-center py-0.5">
                          Sem volumoso atual
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Resumo da Batida e Consumo Individual */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
            Resumo da Mistura Formulada e Consumo por Animal
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              {animalConcDailyCost > 0 && (
                <div className="mt-2 pt-2 border-t border-orange-200/60 text-xs font-bold text-orange-900">
                  Custo Concentrado: <strong>R$ {animalConcDailyCost.toFixed(2)} / animal / dia</strong>
                </div>
              )}
            </div>

            <div className="p-5 rounded-xl bg-green-50/60 border border-green-100">
              <div className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-1">
                {isAdjVolAnimalMode ? 'Volumoso Ajustado (Ofertado por Animal)' : 'Mistura de Volumoso Cadastrada'}
              </div>
              <div className="text-2xl font-black text-green-900">
                {volMN.toFixed(2)} <span className="text-sm font-semibold">{isAdjVolAnimalMode ? 'kg MN / animal / dia' : 'kg MN na batida'}</span>
              </div>
              <div className="text-xs text-green-700 mt-2 font-medium">
                {isAdjVolAnimalMode ? (
                  <>
                    Fornecimento real: <strong>{volMS.toFixed(2)} kg MS/dia</strong> (Meta calculada: {metaVolumosoMS.toFixed(2)} kg MS)
                  </>
                ) : (
                  <>
                    Quantidade Fornecida (Consumo Individual): <strong>{animalVolDailyMN.toFixed(2)} kg MN/dia</strong> ({(animalVolDailyMN * avgVolMSPercent).toFixed(2)} kg MS)
                    {animais > 0 && volMN > 0 && (
                      <span className="block text-[11px] text-green-600 mt-0.5">
                        Calculado automaticamente: {volMN.toFixed(2)} kg total ÷ {animais} animais
                      </span>
                    )}
                  </>
                )}
              </div>
              {animalVolDailyCost > 0 && (
                <div className="mt-2 pt-2 border-t border-green-200/60 text-xs font-bold text-green-900">
                  Custo Volumoso: <strong>R$ {animalVolDailyCost.toFixed(2)} / animal / dia</strong>
                </div>
              )}
              {isAdjVolAnimalMode && animais > 1 && (
                <div className="text-[11px] text-green-700 mt-1 font-semibold">
                  Lote ({animais} cab): {(volMN * animais).toFixed(2)} kg MN/dia • R$ {formatBRL(animalVolDailyCost * animais)}/dia
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Destaque: Avaliação Financeira Geral */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/40 to-emerald-50/20 border-2 border-emerald-200 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-3 border-b border-emerald-200">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                Indicadores Financeiros da Dieta Ajustada
              </span>
              <h4 className="text-lg font-black text-emerald-950 mt-1">
                Custo de Alimentação por Cabeça e Projeção do Lote
              </h4>
            </div>
            <div className="text-xs text-emerald-800 font-semibold bg-white/80 px-3 py-1 rounded-lg border border-emerald-200">
              Lote: <strong>{animais} {animais === 1 ? 'animal' : 'animais'}</strong> • Período: <strong>{days} {days === 1 ? 'dia' : 'dias'}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/95 p-4 rounded-xl border border-emerald-100 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Custo / Cabeça / Dia</span>
              <div className="text-2xl font-black text-emerald-700">
                {totalAnimalDailyCost > 0 ? `R$ ${totalAnimalDailyCost.toFixed(2)}` : 'R$ 0,00'}
                <span className="text-xs font-medium text-gray-500 ml-1">/dia</span>
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                Conc: R$ {animalConcDailyCost.toFixed(2)} + Vol: R$ {animalVolDailyCost.toFixed(2)}
              </div>
            </div>

            <div className="bg-white/95 p-4 rounded-xl border border-emerald-100 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Gasto por Cabeça ({days} dias)</span>
              <div className="text-2xl font-black text-emerald-800">
                {totalAnimalDailyCost > 0 ? `R$ ${(totalAnimalDailyCost * days).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00'}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                Custo total por animal no período
              </div>
            </div>

            <div className="bg-white/95 p-4 rounded-xl border border-emerald-100 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Custo Diário do Lote</span>
              <div className="text-2xl font-black text-emerald-900">
                {totalLoteDailyCost > 0 ? `R$ ${totalLoteDailyCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00'}
                <span className="text-xs font-medium text-gray-500 ml-1">/dia</span>
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                Para alimentar {animais} {animais === 1 ? 'cabeça' : 'cabeças'}
              </div>
            </div>

            <div className="bg-emerald-700 text-white p-4 rounded-xl shadow-xs border border-emerald-800">
              <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wide block mb-1">
                Investimento Total do Lote
              </span>
              <div className="text-2xl font-black text-amber-300">
                {totalLotePeriodCost > 0 ? `R$ ${totalLotePeriodCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00'}
              </div>
              <div className="text-[11px] text-emerald-100 mt-1">
                {animais} cab. × {days} dias × R$ {totalAnimalDailyCost.toFixed(2)}/dia
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-200/60 flex items-center gap-2">
          <Info size={16} className="text-purple-600 shrink-0" />
          <span>
            <strong>Lógica de Mistura e Custos:</strong> Os preços por kg (R$/kg) digitados na batida são automaticamente multiplicados pela quantidade de insumo, projetados no consumo individual (R$/animal/dia) e multiplicados pelo número de animais (<strong>{animais} cab.</strong>) e período (<strong>{days} dias</strong>) para o relatório executivo.
          </span>
        </div>
      </div>
    </div>
  );
}
