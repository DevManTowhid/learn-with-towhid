// app/sorting/animate/[slug]/types.tsx

export type VizItem = { 
  id: string; 
  value: number; 
  pos?: number; 
  level?: number 
};

export type VizState = {
  array: VizItem[];
  active: number[];
  sorted: number[];
  message: string;
};