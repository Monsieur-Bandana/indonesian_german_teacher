<template>
  <div class="flex gap-1">
    <button
      v-if="!isRecording"
      @click="startRecording"
      class="bg-blue-200 p-2"
      :disabled="isRecording"
    >
      <MicrophoneIcon class="h-5 w-5" />
    </button>

    <button
      v-else
      @click="stopRecording"
      :disabled="!isRecording"
      class="bg-blue-200 p-2"
    >
      <StopIcon class="h-5 w-5" />
    </button>
  </div>

  <div v-if="isRecording" class="flex gap-2">
    <div class="dot"></div>
    Aufnahme läuft ...
  </div>

  <div v-if="audioUrl">
    <p>Vorschau:</p>
    <audio :src="audioUrl" controls></audio>
  </div>

  <button v-if="audioUrl" class="bg-blue-200 p-2" @click="onAccept()">
    Annehmen
  </button>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { MicrophoneIcon, StopIcon } from "@heroicons/vue/24/outline";
import { recordService } from "../services/recordService";

const props = defineProps({
  vocId: Number,
  authorId: Number,
});

const isRecording = ref(false);
const audioUrl = ref<string | null>(null);

const mediaRecorder = ref<MediaRecorder | null>(null);
const audioChunks = ref<Blob[]>([]);

const audioBlob = ref<Blob>(new Blob());

const emit = defineEmits<{
  (e: "audiorecorded", audioUrl: string): void;
}>();

async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  mediaRecorder.value = new MediaRecorder(stream);
  audioChunks.value = [];

  mediaRecorder.value.ondataavailable = (event) => {
    audioChunks.value.push(event.data);
  };

  mediaRecorder.value.onstop = () => {
    audioBlob.value = new Blob(audioChunks.value, { type: "audio/webm" });
    audioUrl.value = URL.createObjectURL(audioBlob.value);
  };

  mediaRecorder.value.start();
  isRecording.value = true;
}

function stopRecording() {
  mediaRecorder.value!.stop();
  isRecording.value = false;
}

async function onAccept() {
  await recordService.post(props.vocId!, props.authorId!, audioBlob.value);
  emit("audiorecorded", audioUrl.value!);
}
</script>

<style scoped>
.dot {
  width: 12px;
  height: 12px;
  background-color: red;
  border-radius: 50%;
  animation: blink 1s infinite;
}

@keyframes blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  }
  100% {
    opacity: 1;
  }
}
</style>
