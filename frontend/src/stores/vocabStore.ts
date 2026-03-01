// stores/vocabStore.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import { vocabService } from "../services/vocabService";
import type { Flashcard, VocabProgress } from "../models/Vocab";

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]; // Kopie erstellen (Original bleibt unverändert)

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

export const useVocabStore = defineStore("vocab", () => {
  const vocabs = ref<Flashcard[]>([]);
  const learningSession = ref<VocabProgress[]>([]);
  const vocabslvlred = ref<Flashcard[]>([]);
  const vocabslvorange = ref<Flashcard[]>([]);
  const vocabslvgreen = ref<Flashcard[]>([]);
  const loading = ref(false);

  async function fetchVocabs(lang: string) {
    loading.value = true;
    vocabs.value = shuffleArray(await vocabService.get(lang));
    loading.value = false;
  }

  function safeProgress(progress: VocabProgress) {
    let indexExists = false;
    for (let i = 0; i < learningSession.value.length; i++) {
      if (learningSession.value[i].vocabId === progress.vocabId) {
        // Update existing entry
        indexExists = true;
        learningSession.value[i].interval = progress.interval;
        learningSession.value[i].timestamp = progress.timestamp;
        if (learningSession.value[i].interval === "green") {
          learningSession.value[i].greenStreak++;
          progress.greenStreak = learningSession.value[i].greenStreak;
        }
      }
    }
    if (!indexExists) {
      learningSession.value.push(progress);
    }
    sortCards(progress);
  }

  const sortCards = (progress: VocabProgress) => {
    switch (progress.interval) {
      case "red":
        vocabslvlred.value.push(
          vocabs.value.find((v) => v.id === progress.vocabId)!,
        );
        vocabslvorange.value = vocabslvorange.value.filter(
          (v) => v.id !== progress.vocabId,
        );
        vocabslvgreen.value = vocabslvgreen.value.filter(
          (v) => v.id !== progress.vocabId,
        );
        break;
      case "orange":
        vocabslvorange.value.push(
          vocabs.value.find((v) => v.id === progress.vocabId)!,
        );
        vocabslvlred.value = vocabslvlred.value.filter(
          (v) => v.id !== progress.vocabId,
        );
        vocabslvgreen.value = vocabslvgreen.value.filter(
          (v) => v.id !== progress.vocabId,
        );
        break;
      case "green":
        vocabslvlred.value = vocabslvlred.value.filter(
          (v) => v.id !== progress.vocabId,
        );
        vocabslvorange.value = vocabslvorange.value.filter(
          (v) => v.id !== progress.vocabId,
        );
        if (progress.greenStreak === 0) {
          vocabslvgreen.value.push(
            vocabs.value.find((v) => v.id === progress.vocabId)!,
          );
        } else {
          vocabslvgreen.value = vocabslvgreen.value.filter(
            (v) => v.id !== progress.vocabId,
          );
        }
        break;
      default:
        break;
    }
  };

  return {
    vocabs,
    loading,
    fetchVocabs,
    safeProgress,
    vocabslvlred,
    vocabslvorange,
    vocabslvgreen,
    learningSession,
  };
});
