import api from "./apiService";
import { Flashcard, VocabProgress } from "../models/Vocab";

export const vocabProgressService = {
  async saveProgress(userId: number, progress: VocabProgress[]) {
    try {
      await api.post(`/api/vocabprogress/${userId}`, progress);
    } catch (err) {
      console.error("Error saving vocab progress:", err);
    }
  },
};
