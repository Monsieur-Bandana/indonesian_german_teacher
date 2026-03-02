<script setup lang="ts">
import { onMounted, ref } from "vue";
import VocabAudio from "../components/VocabAudio.vue";
import { useRecordStore } from "../stores/recordStore";
import { useUserStore } from "../stores/userStore";
import { VocabForRecord } from "../models/Vocab";

const isRecorded = ref(false);
const recordStore = useRecordStore();
const userStore = useUserStore();
const vocabs = ref<VocabForRecord[]>([]);
const index = ref(0);

onMounted(async () => {
  await recordStore.fetchVocabsForRecord(userStore.learningLanguage);
  vocabs.value = recordStore.recordVocabs;
});

function next() {
  index.value++;
  isRecorded.value = false;
}
</script>
<template>
  <h1>Audio View</h1>
  <p>Please read the following words or sentences and record.</p>
  <p>
    <span class="font-bold">{{ vocabs[index.valueOf()]?.frontside }}</span>
  </p>
  <button v-if="isRecorded" @click="next">Next Record</button>
  <VocabAudio v-else @audiorecorded="isRecorded = true" />
</template>
