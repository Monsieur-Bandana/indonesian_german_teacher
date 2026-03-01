import api from "./apiService";
import { DashboardData, Flashcard, VocabProgress } from "../models/Vocab";

const controllerName = "VocabProgress";

export const vocabProgressService = {
  async saveProgress(userId: number, progress: VocabProgress[]) {
    try {
      await api.post(`/api/${controllerName}/${userId}`, progress);
    } catch (err) {
      console.error("Error saving vocab progress:", err);
    }
  },

  async getProgress(userId: number): Promise<VocabProgress[]> {
    try {
      const res = await api.get<VocabProgress[]>(
        `/api/${controllerName}/${userId}`,
      );
      return res.data;
    } catch (err) {
      console.error("Error getting vocab progress:", err);
      throw err;
    }
  },

  async getDashboardData(userId: number, lang: string): Promise<DashboardData> {
    console.log(
      `Fetching dashboard data for User "${userId}" and Language ${lang}`,
    );
    try {
      const res = await api.get<DashboardData>(
        `/api/${controllerName}/dashboard/${userId}/${lang}`,
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      throw err;
    }
  },
};
