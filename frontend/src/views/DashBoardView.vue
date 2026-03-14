<script setup lang="ts">
import { onMounted, ref } from "vue";
import { DashboardData, Flashcard } from "../models/Vocab";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore";
import { vocabProgressService } from "../services/vocabProgressService";

const dashboardData = ref<DashboardData>({
  totalVocabs: 0,
  vocabsDueToday: 0,
  newVocabs: 0,
  redVocabs: 0,
  orangeVocabs: 0,
  greenVocabs: 0,
});
const router = useRouter();
const userStore = useUserStore();
const isLoading = ref(true);

onMounted(async () => {
  const data = await vocabProgressService.getDashboardData(
    userStore.userId as any as number,
    userStore.learningLanguage,
  );
  dashboardData.value = data;
  isLoading.value = false;
});
</script>

<template>
  <h1 class="text-2xl font-bold mb-2">Halo cantik {{ userStore.username }}!</h1>

  <router-link to="/changePassword" class="bg-blue-200 p-2 mt-4"
    >Edit Account</router-link
  >

  <h1 class="text-2xl font-bold mb-2">Progress</h1>
  <div v-if="isLoading">Loading...</div>
  <div v-else class="flex justify-center">
    <div class="bg-blue-200 p-3">
      <h1>Noch nicht gelernt</h1>
      <p>{{ dashboardData.newVocabs }} Karten</p>
    </div>
    <div class="bg-red-200 p-3">
      <h1>Rot</h1>
      <p>{{ dashboardData.redVocabs }} Karten</p>
    </div>
    <div class="bg-orange-200 p-3">
      <h1>Orange</h1>
      <p>{{ dashboardData.orangeVocabs }} Karten</p>
    </div>
    <div class="bg-green-200 p-3">
      <h1>Grün</h1>
      <p>{{ dashboardData.greenVocabs }} Karten</p>
      <p>Davon fällig: {{ dashboardData.vocabsDueToday }}</p>
    </div>
  </div>
  <div class="flex gap-3">
    <button @click="router.push('/contribute')" class="bg-blue-200 p-2 mt-4">
      Help Improving the App
    </button>
    <button @click="router.push('/learn')" class="bg-blue-200 p-2 mt-4">
      Start Learning Now!
    </button>
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
