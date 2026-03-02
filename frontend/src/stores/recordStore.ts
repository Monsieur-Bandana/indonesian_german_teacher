// stores/vocabStore.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import { vocabService } from "../services/vocabService";
import type { Flashcard, VocabForRecord, VocabProgress } from "../models/Vocab";

export const useRecordStore = defineStore("vocab", () => {
  const recordVocabs = ref<VocabForRecord[]>([]);
  const recordedIds = ref<number[]>([]);

  async function fetchVocabsForRecord(language: string) {
    const data = await vocabService.getVocabsForRecord(language);
    recordVocabs.value = data;
  }

  async function safeRecorded(language: string, id: number) {
    recordedIds.value.push(id);
  }

  return {
    recordVocabs,
    fetchVocabsForRecord,
    recordedIds,
  };
});
