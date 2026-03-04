<script setup lang="ts">
import { onMounted, computed, ref, onUnmounted } from "vue";
import { useVocabStore } from "../stores/vocabStore";
import { Flashcard } from "../models/Vocab";
import { useUserStore } from "../stores/userStore";
import { vocabProgressService } from "../services/vocabProgressService";
import { useRecordLibrary } from "../stores/recordStore";

const vocabStore = useVocabStore();
const recordStore = useRecordLibrary();
const isFrontside = ref(true);
const vocabIndex = ref(0);
const learningCards = ref<Flashcard[]>([]);
const learingLanguage = ref<string>("");
const userStore = useUserStore();
const loading = ref(true);
const demovocab = computed(() => learningCards.value[vocabIndex.value]);
const audioUrl = computed(() => {
  const record = recordStore.records.find(
    (element) => element.id === demovocab.value.id,
  );

  return record ? URL.createObjectURL(record.audioFile) : "";
});

onMounted(async () => {
  learingLanguage.value = userStore.learningLanguage;
  await vocabStore.fetchVocabs(
    userStore.userId as any as number,
    learingLanguage.value,
  );
  await vocabStore.fetchProgress(userStore.userId as any as number);
  learningCards.value = vocabStore.vocabs;
  await recordStore.fetchVocabsForRecord(learningCards.value); // .slice(0, 5)

  loading.value = false;
});

onUnmounted(async () => {
  await saveProgressToDb();
});

async function saveProgressToDb() {
  loading.value = true;
  await vocabProgressService.saveProgress(
    userStore.userId as any as number,
    vocabStore.learningSession,
  );
  loading.value = false;
}

const next = async (interval: string) => {
  isFrontside.value = true;
  const today = new Date();
  const dateOnly = today.toISOString().split("T")[0];

  vocabStore.safeProgress({
    vocabId: demovocab.value.id,
    interval: interval,
    timestamp: dateOnly,
    greenStreak: 0,
  });

  if (vocabIndex.value % 5 === 0) {
    await saveProgressToDb();
  }

  vocabIndex.value++;
  if (vocabIndex.value >= learningCards.value.length) {
    vocabIndex.value = 0;
    learningCards.value = vocabStore.vocabslvlred;
    if (learningCards.value.length === 0) {
      vocabIndex.value = 0;
      learningCards.value = vocabStore.vocabslvorange;
      if (learningCards.value.length === 0) {
        vocabIndex.value = 0;
        learningCards.value = vocabStore.vocabslvgreen;
        if (learningCards.value.length === 0) {
          alert("Alle Vokabeln gelernt! Gut gemacht!");
          return;
        }
      }
    }
  }

  console.log(
    "vocabs",
    learningCards.value,
    "lvlred",
    vocabStore.vocabslvlred,
    "lvlorange",
    vocabStore.vocabslvorange,
    "lvlgreen",
    vocabStore.vocabslvgreen,
    "progress",
    vocabStore.learningSession,
  );
};
</script>

<template>
  <div v-if="loading">Loading...</div>

  <div v-else-if="demovocab" class="h-screen">
    <div class="flex flex-col justify-end items-center h-[30%]">
      <p>{{ demovocab.frontsideBeforeNote }}</p>
      <p class="font-bold">{{ demovocab.frontside }}</p>
      <p>{{ demovocab.frontsideAfterNote }}</p>
    </div>
    <hr />
    <div class="h-[30%]">
      <div v-if="!isFrontside" class="flex flex-col items-center h-full">
        <p>{{ demovocab.backsideBeforeNote }}</p>
        <p v-if="demovocab.betweenLayer">({{ demovocab.betweenLayer }})</p>
        <p>
          <span class="font-bold">{{ demovocab.backside }}</span>
        </p>
        <p>{{ demovocab.backsideAfterNote }}</p>
        <audio v-if="audioUrl" :src="audioUrl" controls></audio>
      </div>
    </div>

    <div class="flex justify-center gap-4 mt-4" v-if="isFrontside">
      <button class="bg-blue-200 p-2" @click="isFrontside = false">
        Show Backside
      </button>
    </div>
    <div v-else class="flex justify-center gap-4 mt-4">
      <button class="bg-red-400 p-2" @click="next('red')">Nicht gekonnt</button>
      <button class="bg-orange-300 p-2" @click="next('orange')">
        Lieber nochmal wiederholen
      </button>
      <button class="bg-green-400 p-2" @click="next('green')">Sehr gut</button>
    </div>
  </div>
</template>

<style scoped>
p {
  font-size: 1.2rem;
}
/*
button {
  position: absolute;
  left: 50%;
  bottom: 20px;
}*/
</style>
