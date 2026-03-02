import api from "./apiService";
import { Flashcard, VocabForRecord } from "../models/Vocab";

export const vocabService = {
  async get(id: number, lang: string): Promise<Flashcard[]> {
    try {
      const res = await api.get<Flashcard[]>(`/api/Vocab/${id}/${lang}`);
      return res.data;
    } catch (err) {
      console.error("Error fetching vocab:", err);
      return [];
    }
  },

  async getVocabsForRecord(lang: string): Promise<VocabForRecord[]> {
    try {
      const res = await api.get<VocabForRecord[]>(
        `/api/Vocab/recordVocabs/${lang}`,
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching vocab:", err);
      return [];
    }
  },
};
