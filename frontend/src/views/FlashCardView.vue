<script setup lang="ts">
import { onMounted, computed, ref, onUnmounted } from "vue";
import { useVocabStore } from "../stores/vocabStore";
import { Flashcard } from "../models/Vocab";
import { useUserStore } from "../stores/userStore";
import { vocabProgressService } from "../services/vocabProgressService";

const vocabStore = useVocabStore();
const isFrontside = ref(true);
const vocabIndex = ref(0);
const learningCards = ref<Flashcard[]>([]);
const learingLanguage = ref<string>("");
const userStore = useUserStore();

onMounted(async () => {
  learingLanguage.value = userStore.learningLanguage;
  await vocabStore.fetchVocabs(learingLanguage.value);
  learningCards.value = vocabStore.vocabs;
});

onUnmounted(async () => {
  await vocabProgressService.saveProgress(
    userStore.userId as any as number,
    vocabStore.learningSession,
  );
});

const demovocab = computed(() => learningCards.value[vocabIndex.value]);

const next = (interval: string) => {
  isFrontside.value = true;
  const now = new Date();
  const learnedDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();

  vocabStore.safeProgress({
    vocabId: demovocab.value.id,
    interval: interval,
    timestamp: learnedDate,
    greenStreak: 0,
  });

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
  );
};
</script>

<template>
  <div v-if="vocabStore.loading">Loading...</div>

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
