import api from "./apiService";
import { Flashcard } from "../models/Vocab";

export const vocabService = {
  async get(lang: string): Promise<Flashcard[]> {
    try {
      const res = await api.get<Flashcard[]>(`/api/Vocab/${lang}`);
      return res.data;
    } catch (err) {
      console.error("Error fetching vocab:", err);
      return [];
    }
  },
};
