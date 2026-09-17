export type ArticleType = 'a' | 'an';

export interface VocabItem {
  id: string;
  word: string;
  type: ArticleType;
}

export interface FishObject {
  id: string;
  vocab: VocabItem;
  x: number; // screen pixel X
  y: number; // screen pixel Y
  targetY: number; // base Y altitude
  vx: number; // velocity X
  direction: 1 | -1; // 1: moving right, -1: moving left
  speed: number;
  width: number;
  height: number;
  swimPhase: number; // phase for tail / bobbing animation
  isHovered: boolean;
  isGrabbed: boolean;
}

export interface BoatFishItem {
  id: string;
  word: string;
  type: ArticleType;
  relX: number;
  relY: number;
  rotation: number;
  scale: number;
  phase: number;
  addedAt: number;
}

export interface BoatObject {
  type: ArticleType;
  label: string;
  centerXPercent: number; // 0.25 or 0.75
  collectedWords: string[];
  collectedFish: BoatFishItem[];
  lastDropEffectTimer: number; // for bobbing / flash when item dropped
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  isBubble?: boolean;
}

export interface Coral {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'staghorn' | 'fan' | 'brain';
  color: string;
  glowColor: string;
}

export interface Seaweed {
  x: number;
  baseY: number;
  height: number;
  segmentCount: number;
  width: number;
  phaseOffset: number;
  speed: number;
  color: string;
}

export interface Bubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  phase: number;
  alpha: number;
}

export type CursorState = 'normal' | 'hover' | 'grabbed' | 'missed';

export interface HandPoint {
  x: number;
  y: number;
}

export interface HandData {
  detected: boolean;
  landmarks: HandPoint[];
  cursorX: number;
  cursorY: number;
  thumbX: number;
  thumbY: number;
  isPinching: boolean;
  state: CursorState;
}

declare global {
  interface Window {
    Hands: any;
    Camera: any;
  }
}
