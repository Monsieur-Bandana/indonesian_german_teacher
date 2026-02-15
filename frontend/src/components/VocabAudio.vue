<template>
  <div class="vocab-audio">
    <!-- Audio exists: playback + rate quality -->
    <div v-if="hasAudio" class="audio-playback">
      <button class="btn-play" @click="playAudio" :disabled="isPlaying">
        <span v-if="isPlaying" class="icon-playing">&#9654;</span>
        <span v-else class="icon-play">&#9654;</span>
      </button>
      <button class="btn-rate-audio" @click="showReRecord = !showReRecord" :title="ui.rateAudio">
        <span>&#9733;</span>
      </button>
    </div>

    <!-- Re-record option (when user thinks quality is bad) -->
    <div v-if="hasAudio && showReRecord" class="re-record-prompt">
      <p class="re-record-text">{{ ui.badQuality }}</p>
      <button class="btn-record-small" @click="startRecording" :disabled="isRecording">
        {{ ui.recordBetter }}
      </button>
    </div>

    <!-- No audio: call to action -->
    <div v-if="!hasAudio && !isRecording && !justUploaded" class="no-audio">
      <p class="cta-text">{{ ui.helpImprove }}</p>
      <button class="btn-record" @click="startRecording">
        <span class="mic-icon">&#127908;</span>
        {{ ui.recordNow }}
      </button>
    </div>

    <!-- Recording in progress -->
    <div v-if="isRecording" class="recording-active">
      <div class="recording-indicator">
        <span class="rec-dot"></span>
        <canvas ref="waveCanvas" class="wave-canvas" width="200" height="40"></canvas>
      </div>
      <p class="recording-text">{{ ui.recording }}</p>
      <button class="btn-stop" @click="stopRecording">
        <span>&#9632;</span> {{ ui.stop }}
      </button>
    </div>

    <!-- Upload success -->
    <div v-if="justUploaded" class="upload-success">
      <span class="check-icon">&#10003;</span> {{ ui.thanks }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import api from '../services/apiService'
import { useUserStore } from '../stores/userStore'

const props = defineProps({
  vocabId: { type: [String, Number], required: true },
  lang: { type: String, required: true } // "d" or "i"
})

const userStore = useUserStore()
const isGermanLearner = computed(() => userStore.isLearningGerman())

const hasAudio = ref(false)
const isPlaying = ref(false)
const isRecording = ref(false)
const showReRecord = ref(false)
const justUploaded = ref(false)

const waveCanvas = ref(null)
let mediaRecorder = null
let audioChunks = []
let animationId = null
let waveOffset = 0
let audioElement = null

const ui = computed(() => {
  if (isGermanLearner.value) {
    return {
      helpImprove: 'Bantu kami meningkatkan aplikasi!',
      recordNow: 'Rekam',
      recording: 'Merekam...',
      stop: 'Berhenti',
      thanks: 'Terima kasih!',
      rateAudio: 'Nilai kualitas audio',
      badQuality: 'Kualitas buruk? Rekam versi yang lebih baik:',
      recordBetter: 'Rekam ulang'
    }
  }
  return {
    helpImprove: 'Hilf uns, die App zu verbessern!',
    recordNow: 'Aufnehmen',
    recording: 'Aufnahme läuft...',
    stop: 'Stopp',
    thanks: 'Vielen Dank!',
    rateAudio: 'Audioqualität bewerten',
    badQuality: 'Schlechte Qualität? Bessere Version einsprechen:',
    recordBetter: 'Neu aufnehmen'
  }
})

async function checkAudio() {
  try {
    const res = await api.get(`/api/audio/check/${props.vocabId}/${props.lang}`)
    hasAudio.value = res.data.exists
  } catch {
    hasAudio.value = false
  }
  justUploaded.value = false
  showReRecord.value = false
}

async function playAudio() {
  if (isPlaying.value) return
  isPlaying.value = true
  try {
    const url = `${api.defaults.baseURL}/api/audio/${props.vocabId}/${props.lang}`
    audioElement = new Audio(url)
    audioElement.onended = () => { isPlaying.value = false }
    audioElement.onerror = () => { isPlaying.value = false }
    await audioElement.play()
  } catch {
    isPlaying.value = false
  }
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
    audioChunks = []

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data)
    }

    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop())
      stopWaveAnimation()

      const blob = new Blob(audioChunks, { type: 'audio/webm' })
      await uploadAudio(blob)
    }

    mediaRecorder.start()
    isRecording.value = true
    showReRecord.value = false

    // Start wave animation after DOM updates
    requestAnimationFrame(() => {
      startWaveAnimation()
    })
  } catch {
    isRecording.value = false
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop()
  }
  isRecording.value = false
}

async function uploadAudio(blob) {
  const formData = new FormData()
  formData.append('audio', blob, `${props.vocabId}${props.lang}.webm`)

  try {
    await api.post(`/api/audio/${props.vocabId}/${props.lang}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    hasAudio.value = true
    justUploaded.value = true
    setTimeout(() => { justUploaded.value = false }, 3000)
  } catch (e) {
    console.error('Upload failed:', e)
  }
}

function startWaveAnimation() {
  const canvas = waveCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  function draw() {
    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)

    ctx.strokeStyle = '#e74c3c'
    ctx.lineWidth = 2
    ctx.beginPath()

    for (let x = 0; x < w; x++) {
      const y = h / 2 + Math.sin((x + waveOffset) * 0.06) * (h / 3) *
        (0.6 + 0.4 * Math.sin((x + waveOffset) * 0.02))
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }

    ctx.stroke()
    waveOffset += 2
    animationId = requestAnimationFrame(draw)
  }

  draw()
}

function stopWaveAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
}

// Re-check audio when vocabId or lang changes
watch(() => [props.vocabId, props.lang], () => {
  checkAudio()
  stopRecording()
  stopWaveAnimation()
  if (audioElement) {
    audioElement.pause()
    audioElement = null
  }
  isPlaying.value = false
}, { immediate: true })

onBeforeUnmount(() => {
  stopRecording()
  stopWaveAnimation()
  if (audioElement) {
    audioElement.pause()
  }
})
</script>

<style scoped>
.vocab-audio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.audio-playback {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-play {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid #4a90d9;
  background: #eef4fb;
  color: #4a90d9;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-play:hover:not(:disabled) {
  background: #4a90d9;
  color: #fff;
}

.btn-play:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon-playing {
  animation: pulse 0.8s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.btn-rate-audio {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #ddd;
  background: transparent;
  color: #f39c12;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-rate-audio:hover {
  border-color: #f39c12;
  background: #fef9e7;
}

.re-record-prompt {
  text-align: center;
}

.re-record-text {
  font-size: 0.8rem;
  color: #888;
  margin: 4px 0;
}

.btn-record-small {
  padding: 6px 14px;
  border: 2px solid #e74c3c;
  border-radius: 8px;
  background: transparent;
  color: #e74c3c;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-record-small:hover {
  background: #e74c3c;
  color: #fff;
}

.no-audio {
  text-align: center;
}

.cta-text {
  font-size: 0.85rem;
  color: #888;
  margin: 0 0 8px 0;
}

.btn-record {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border: 2px solid #4a90d9;
  border-radius: 10px;
  background: #eef4fb;
  color: #4a90d9;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-record:hover {
  background: #4a90d9;
  color: #fff;
}

.mic-icon {
  font-size: 1.1rem;
}

.recording-active {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.recording-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rec-dot {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #e74c3c;
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}

.wave-canvas {
  display: block;
}

.recording-text {
  font-size: 0.85rem;
  color: #e74c3c;
  font-weight: 600;
  margin: 0;
}

.btn-stop {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border: 2px solid #e74c3c;
  border-radius: 10px;
  background: #e74c3c;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-stop:hover {
  background: #c0392b;
  border-color: #c0392b;
}

.upload-success {
  color: #27ae60;
  font-weight: 600;
  font-size: 0.9rem;
}

.check-icon {
  font-size: 1.1rem;
}
</style>
