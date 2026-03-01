import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useUserStore } from "./userStore";
import api from "../services/apiService";
import { preloadBatchAudio, clearAudioCache } from "../services/audioCache";
import { vocabService } from "../services/vocabService";

const BATCH_SIZE = 30;

// Interval progression: 2min, 5min, 10min, 1day, 2days, 4days, 8days
const INTERVALS = {
  red: 2 * 60 * 1000,
  orange: 5 * 60 * 1000,
  green: 10 * 60 * 1000,
  day1: 24 * 60 * 60 * 1000,
  day2: 2 * 24 * 60 * 60 * 1000,
  day4: 4 * 24 * 60 * 60 * 1000,
  day8: 8 * 24 * 60 * 60 * 1000,
};

const GREEN_PROGRESSION = ["green", "day1", "day2", "day4", "day8"];

function getStartOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

export const useVocabStore = defineStore("vocab", () => {
  // Dictionary: { vocabId: { interval, timestamp, greenStreak, isNew } }
  const progress = ref({});
  const currentCard = ref(null);
  const isFlipped = ref(false);
  const sessionLoaded = ref(false);
  const audioPreloaded = ref(false);

  // Current batch of 30 vocab IDs
  const currentBatch = ref([]);

  // Daily counter: how many vocabs got their first-ever rating today
  const learnedToday = ref(0);

  const vocabularies = computed(async () => {
    const vocabs = await vocabService.get("d");
    return vocabs;
  });

  const allVocabIds = Object.keys(vocabularies);

  const currentVocab = computed(() => {
    if (!currentCard.value) return null;
    return vocabularies[currentCard.value];
  });

  // How many vocabs in the current batch are still flagged as new (unseen)
  const batchNewRemaining = computed(() => {
    return currentBatch.value.filter((id) => {
      const p = progress.value[id];
      return !p || p.isNew;
    }).length;
  });

  // Total vocabs in the current batch
  const batchTotal = computed(() => currentBatch.value.length);

  async function loadProgress() {
    const userStore = useUserStore();
    if (!userStore.userId) return;

    try {
      const response = await api.get(`/api/vocabprogress/${userStore.userId}`);
      const entries = response.data;
      progress.value = {};
      for (const entry of entries) {
        progress.value[entry.vocabId] = {
          interval: entry.interval,
          timestamp: entry.timestamp,
          greenStreak: entry.greenStreak || 0,
          isNew: false,
        };
      }
    } catch {
      progress.value = {};
    }

    // Count how many were learned today from DB data
    const todayStart = getStartOfToday();
    learnedToday.value = Object.values(progress.value).filter(
      (p) => p.timestamp >= todayStart,
    ).length;

    sessionLoaded.value = true;
    await loadBatch();
  }

  async function loadBatch() {
    audioPreloaded.value = false;
    const now = Date.now();
    const batch = [];

    // 1) Add due-for-review vocabs (already learned, interval expired)
    for (const [vocabId, data] of Object.entries(progress.value)) {
      if (data.isNew) continue; // skip new ones, they'll be added below
      const intervalMs = INTERVALS[data.interval];
      if (intervalMs && now - data.timestamp >= intervalMs) {
        batch.push(vocabId);
      }
      if (batch.length >= BATCH_SIZE) break;
    }

    // 2) Fill remaining slots with new vocabs from JSON
    if (batch.length < BATCH_SIZE) {
      for (const id of allVocabIds) {
        if (batch.length >= BATCH_SIZE) break;
        if (batch.includes(id)) continue;
        if (progress.value[id] && !progress.value[id].isNew) continue; // already learned

        // Mark as new in progress
        if (!progress.value[id]) {
          progress.value[id] = {
            interval: "new",
            timestamp: 0,
            greenStreak: 0,
            isNew: true,
          };
        }
        batch.push(id);
      }
    }

    currentBatch.value = batch;

    // Preload audio for entire batch
    await preloadBatchAudio(batch);
    audioPreloaded.value = true;

    pickNextCard();
  }

  function pickNextCard() {
    const now = Date.now();

    // Only consider vocabs in the current batch
    // 1) Due-for-review within batch
    const dueVocabs = [];
    for (const vocabId of currentBatch.value) {
      const data = progress.value[vocabId];
      if (!data || data.isNew) continue;
      const intervalMs = INTERVALS[data.interval];
      if (intervalMs && now - data.timestamp >= intervalMs) {
        dueVocabs.push({ vocabId, overdue: now - data.timestamp - intervalMs });
      }
    }

    if (dueVocabs.length > 0) {
      dueVocabs.sort((a, b) => b.overdue - a.overdue);
      currentCard.value = dueVocabs[0].vocabId;
      isFlipped.value = false;
      return;
    }

    // 2) Pick next new vocab from batch
    const nextNew = currentBatch.value.find((id) => {
      const p = progress.value[id];
      return p && p.isNew;
    });

    if (nextNew) {
      currentCard.value = nextNew;
      isFlipped.value = false;
      return;
    }

    // 3) All batch vocabs handled and none due -> batch complete
    currentCard.value = null;
    isFlipped.value = false;
  }

  function rateCard(rating) {
    const vocabId = currentCard.value;
    if (!vocabId) return;

    const now = Date.now();
    const existing = progress.value[vocabId];
    const wasNew = existing && existing.isNew;

    if (rating === "green") {
      if (
        !wasNew &&
        existing &&
        existing.interval === "green" &&
        existing.greenStreak >= 1
      ) {
        const streak = existing.greenStreak + 1;
        const nextIdx = Math.min(streak, GREEN_PROGRESSION.length - 1);
        progress.value[vocabId] = {
          interval: GREEN_PROGRESSION[nextIdx],
          timestamp: now,
          greenStreak: streak,
          isNew: false,
        };
      } else if (
        !wasNew &&
        existing &&
        GREEN_PROGRESSION.indexOf(existing.interval) > 0
      ) {
        const currentIdx = GREEN_PROGRESSION.indexOf(existing.interval);
        const nextIdx = Math.min(currentIdx + 1, GREEN_PROGRESSION.length - 1);
        progress.value[vocabId] = {
          interval: GREEN_PROGRESSION[nextIdx],
          timestamp: now,
          greenStreak: (existing.greenStreak || 0) + 1,
          isNew: false,
        };
      } else {
        progress.value[vocabId] = {
          interval: "green",
          timestamp: now,
          greenStreak: 1,
          isNew: false,
        };
      }
    } else if (rating === "orange") {
      progress.value[vocabId] = {
        interval: "orange",
        timestamp: now,
        greenStreak: 0,
        isNew: false,
      };
    } else if (rating === "red") {
      progress.value[vocabId] = {
        interval: "red",
        timestamp: now,
        greenStreak: 0,
        isNew: false,
      };
    }

    if (wasNew) {
      learnedToday.value++;
    }

    pickNextCard();
  }

  function flipCard() {
    isFlipped.value = true;
  }

  async function saveProgress() {
    const userStore = useUserStore();
    if (!userStore.userId) return;

    // Only save vocabs that have actually been rated (not isNew)
    const entries = Object.entries(progress.value)
      .filter(([, data]) => !data.isNew && data.interval !== "new")
      .map(([vocabId, data]) => ({
        vocabId: parseInt(vocabId),
        interval: data.interval,
        timestamp: data.timestamp,
        greenStreak: data.greenStreak || 0,
      }));

    if (entries.length === 0) return;

    try {
      await api.post(`/api/vocabprogress/${userStore.userId}`, entries);
    } catch (e) {
      console.error("Failed to save progress:", e);
    }
  }

  function getStats() {
    const totalVocabs = allVocabIds.length;
    const totalLearned = Object.values(progress.value).filter(
      (p) => !p.isNew,
    ).length;
    const mastered = Object.values(progress.value).filter(
      (p) => !p.isNew && GREEN_PROGRESSION.indexOf(p.interval) >= 3,
    ).length;
    return {
      totalVocabs,
      totalLearned,
      mastered,
      learnedToday: learnedToday.value,
      batchNew: batchNewRemaining.value,
      batchTotal: batchTotal.value,
    };
  }

  async function loadNextBatch() {
    clearAudioCache();
    await loadBatch();
  }

  return {
    progress,
    currentCard,
    currentVocab,
    isFlipped,
    sessionLoaded,
    audioPreloaded,
    currentBatch,
    learnedToday,
    batchNewRemaining,
    batchTotal,
    loadProgress,
    loadBatch,
    loadNextBatch,
    pickNextCard,
    rateCard,
    flipCard,
    saveProgress,
    getStats,
  };
});
