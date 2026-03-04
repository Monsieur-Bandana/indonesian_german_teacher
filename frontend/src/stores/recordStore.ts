// stores/vocabStore.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import { vocabService } from "../services/vocabService";
import type { Flashcard, VocabForRecord, Recording } from "../models/Vocab";
import { recordService } from "../services/recordService";

export const useRecordStore = defineStore("vocab", () => {
  const recordVocabs = ref<VocabForRecord[]>([]);
  const recordedIds = ref<number[]>([]);

  async function fetchVocabsForRecord(language: string) {
    const data = await vocabService.getVocabsForRecord(language);
    recordVocabs.value = data;
  }

  return {
    recordVocabs,
    fetchVocabsForRecord,
    recordedIds,
  };
});

export const useRecordLibrary = defineStore("records", () => {
  const records = ref<Recording[]>([]);

  async function fetchVocabsForRecord(vocabs: Flashcard[]) {
    const recordings = await Promise.all(
      vocabs.map(async (v) => {
        const blob = await recordService.get(v.id);

        if (!blob) return null;

        const recording: Recording = {
          audioFile: blob,
          id: v.id,
        };

        return recording;
      }),
    );

    // null rausfiltern
    records.value = recordings.filter((r): r is Recording => r !== null);
  }

  return { records, fetchVocabsForRecord };
});
