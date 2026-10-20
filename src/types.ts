export type Step = 1 | 2 | 3 | 4 | 5 | 6;

export interface ConsumptionTarget {
  category: string;
  subcategory: string;
  pvReferencia: number;
  percentPvMs: number;
  consumoMs: number;
  volumosoPercent: number;
  concentradoPercent: number;
  pbTmr: number;
  ndtTmr: number;
  fdnTmr: number;
  amidoPercent: number;
}

export interface FormulationState {
  name: string;
  category: string;
  subcategory: string;
  weight: number | '';
  quantity: number | '';
  days: number | '';
  hasCurrentDiet: boolean; // false if skipped via "Não tenho dieta atual"
  currentConcentrates: IngredientEntry[];
  currentVolumosos: IngredientEntry[];
  currentConcentradoKg?: number | ''; // Fornecimento de concentrado por animal/dia (kg MN)
  currentVolumosoKg?: number | '';    // Fornecimento de volumoso por animal/dia (kg MN)
  currentConcentradoPercent?: number | ''; // Proporção % Concentrado (MN)
  currentVolumosoPercent?: number | '';    // Proporção % Volumoso (MN)
  adjustedConcentrates: IngredientEntry[];
  adjustedVolumosos: IngredientEntry[];
  reportSourceStep?: 3 | 5; // Tracks if report was generated from Step 3 or Step 5
}

export interface IngredientEntry {
  id: string; // unique for the row
  ingredientId: string;
  type: string;
  mn: number | ''; // input value (kg Natural Matter)
  ms: number | ''; // dry matter calculated or input value (kg Dry Matter)
  pricePerKg?: number | ''; // Preço por kg em R$ (R$/kg MN)
}

export interface IngredientDef {
  id: string;
  name: string;
  type: string;
  pb: number;    // g/kg
  ndt: number;   // g/kg
  fdn: number;   // g/kg
  amido: number; // g/kg
  calcio: number;// g/kg (CA)
  fosforo: number;// g/kg (P)
  msPercent: number; // percent 0-100
  matMineral?: number; // g/kg (Matéria Mineral)
  mg?: number; // g/kg (Magnésio)
  s?: number; // g/kg (Enxofre)
  k?: number; // g/kg (Potássio)
  na?: number; // g/kg (Sódio)
  cl?: number | string; // g/kg (Cloro)
  cu?: number; // mg/kg (Cobre)
}
