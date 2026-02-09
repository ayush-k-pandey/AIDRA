
export enum ZoneType {
  RED = 'RED',
  YELLOW = 'YELLOW',
  GREEN = 'GREEN'
}

export interface DisasterZone {
  id: string;
  name: string;
  type: ZoneType;
  coordinates: [number, number];
  radius: number;
  description: string;
  instructions: string[];
}

export interface EmergencyService {
  id: string;
  name: string;
  type: 'Hospital' | 'Shelter' | 'Police';
  distance: string;
  contact: string;
  address: string;
  lat: number;
  lng: number;
}

export interface NewsUpdate {
  id: string;
  title: string;
  timestamp: string;
  category: 'URGENT' | 'UPDATE' | 'ADVISORY';
  content: string;
}

export interface Language {
  code: string;
  name: string;
}

export interface HistoricalDisaster {
  type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  durationDays: number;
  year: number;
  area: string;
  populationImpacted: number;
  // Specific Categories
  foodBudget: number;
  waterBudget: number;
  shelterBudget: number;
  rescueBudget: number;
  medicalBudget: number;
  logisticsBudget: number;
  commBudget: number;
  rehabBudget: number;
  totalBudget: number;
}

export interface BudgetPrediction {
  predictedTotal: number;
  breakdown: {
    food: number;
    water: number;
    shelter: number;
    rescue: number;
    medical: number;
    logistics: number;
    comm: number;
    rehab: number;
  };
  reasoning: string;
  confidenceScore: number;
  keyFactors: string[];
  executiveBriefing: string;
}
