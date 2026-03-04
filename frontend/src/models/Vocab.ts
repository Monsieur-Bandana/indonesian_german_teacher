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

export interface VocabForRecord {
  id: number;
  frontside: string;
}

export interface VocabProgress {
  vocabId: number;
  interval: string;
  timestamp: string;
  greenStreak: number;
}

export interface DashboardData {
  totalVocabs: number;
  vocabsDueToday: number;
  newVocabs: number;
  redVocabs: number;
  orangeVocabs: number;
  greenVocabs: number;
}

export interface Recording {
  audioFile: Blob;
  id: number;
}
