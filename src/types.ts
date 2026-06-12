export type Step = 1 | 2 | 3 | 4 | 5;

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
  concentrates: IngredientEntry[];
  volumosos: IngredientEntry[];
}

export interface IngredientEntry {
  id: string; // unique for the row
  ingredientId: string;
  type: string;
  mn: number | ''; // input value
}

export interface IngredientDef {
  id: string;
  name: string;
  type: string;
  pb: number;    // g/kg
  ndt: number;   // g/kg
  fdn: number;   // g/kg
  amido: number; // g/kg
  calcio: number;// g/kg
  fosforo: number;// g/kg
  msPercent: number; // percent 0-100
}
