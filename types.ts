export interface GeneratedContent {
  code: string;
  isComplete: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum ViewMode {
  SPLIT = 'SPLIT',
  PREVIEW = 'PREVIEW',
  CODE = 'CODE'
}