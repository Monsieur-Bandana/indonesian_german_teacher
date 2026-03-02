<template>
  <div class="flex gap-1">
    <button
      v-if="!isRecording"
      @click="startRecording"
      class="bg-blue-200 p-2"
      :disabled="isRecording"
    >
      Aufnahme starten
    </button>

    <button
      v-else
      @click="stopRecording"
      :disabled="!isRecording"
      class="bg-blue-200 p-2"
    >
      Aufnahme stoppen
    </button>
  </div>

  <div v-if="isRecording" class="dot"></div>

  <div v-if="audioUrl">
    <p>Vorschau:</p>
    <audio :src="audioUrl" controls></audio>
  </div>

  <button
    v-if="audioUrl"
    class="bg-blue-200 p-2"
    @click="emit('audiorecorded', audioUrl!)"
  >
    Annehmen
  </button>
</template>

<script setup lang="ts">
import { ref } from "vue";

const isRecording = ref(false);
const audioUrl = ref<string | null>(null);

const mediaRecorder = ref<MediaRecorder | null>(null);
const audioChunks = ref<Blob[]>([]);

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
    const audioBlob = new Blob(audioChunks.value, { type: "audio/webm" });
    audioUrl.value = URL.createObjectURL(audioBlob);
  };

  mediaRecorder.value.start();
  isRecording.value = true;
}

function stopRecording() {
  mediaRecorder.value!.stop();
  isRecording.value = false;
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
