export enum TreeType {
  OAK = 'Oak',
  PINE = 'Pine',
  SAKURA = 'Sakura',
  BAMBOO = 'Bamboo',
  APPLE = 'Apple'
}

export enum TreeStage {
  SEED = 'Seed',
  SPROUT = 'Sprout',
  SAPLING = 'Sapling',
  TREE = 'Tree',
  MATURE = 'Mature',
  BLOOMING = 'Blooming',
  WITHERED = 'Withered'
}

export type TreeStyle = 'flat' | 'pixel' | 'realism' | 'sketch' | 'origami';
export type ViewMode = 'grid' | 'forest' | 'seats';
export type Language = 'zh' | 'en';
export type Holiday = 'none' | 'christmas' | 'new_year' | 'sakura';

export interface LogEntry {
  id: string;
  timestamp: number;
  scoreDelta: number;
  reason: string;
  category: 'behavior' | 'homework' | 'participation' | 'other';
}

export interface Student {
  id: string;
  name: string;
  group?: string;
  score: number;
  treeType: TreeType;
  history: LogEntry[];
  seatIndex?: number; // For seating chart position
}

export interface AppConfig {
  thresholds: {
    [key in TreeStage]?: number;
  };
  treeStyle: TreeStyle;
  language: Language;
}

export const DEFAULT_THRESHOLDS = {
  [TreeStage.WITHERED]: -999,
  [TreeStage.SEED]: 0,
  [TreeStage.SPROUT]: 10,
  [TreeStage.SAPLING]: 30,
  [TreeStage.TREE]: 60,
  [TreeStage.MATURE]: 100,
  [TreeStage.BLOOMING]: 150,
};