export interface Flashcard {
  id: number;
  frontside: string;
  frontsideBeforeNote: string;
  frontsideAfterNote: string;
  backside: string;
  betweenLayer: string;
  backsideBeforeNote: string;
  backsideAfterNote: string | null;
  languagekey: string;
  hasCopyright: number;
}

export interface VocabProgress {
  vocabId: number;
  interval: string;
  timestamp: number;
  greenStreak: number;
}
