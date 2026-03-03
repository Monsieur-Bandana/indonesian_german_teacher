<script setup lang="ts">
import { onMounted, ref } from "vue";
import VocabAudio from "../components/VocabAudio.vue";
import { useRecordStore } from "../stores/recordStore";
import { useUserStore } from "../stores/userStore";
import { VocabForRecord } from "../models/Vocab";
import { HeartIcon } from "@heroicons/vue/24/outline";

const isRecorded = ref(false);
const recordStore = useRecordStore();
const userStore = useUserStore();
const vocabs = ref<VocabForRecord[]>([]);
const index = ref(0);
const loading = ref(true);

onMounted(async () => {
  await recordStore.fetchVocabsForRecord(userStore.learningLanguage);
  vocabs.value = recordStore.recordVocabs;
  loading.value = false;
});

function next() {
  index.value++;
  isRecorded.value = false;
}
</script>
<template>
  <h1>Audio View</h1>
  <p v-if="!isRecorded">
    Please read the following words or sentences and record.
  </p>
  <p>
    {{ isRecorded ? index + 1 : index }} of {{ vocabs.length }} vocabs recorded
    today!
  </p>
  <p v-if="!isRecorded">
    <span v-if="!loading" class="font-bold">{{ vocabs[index]?.frontside }}</span>
    <p v-else >loading ...</p>
  </p>
  <div class="flex gap-2" v-if="isRecorded">
    Therima Kasi for helping me!<HeartIcon class="w-5 h-5" />
  </div>
  <button v-if="isRecorded" @click="next" class="bg-blue-100 p-2">
    Next Record
  </button>
  <VocabAudio
    v-else
    v-if="!loading"
    @audiorecorded="isRecorded = true"
    :voc-id="vocabs[index].id"
    :author-id="userStore.userId as any as number"
  />
</template>
