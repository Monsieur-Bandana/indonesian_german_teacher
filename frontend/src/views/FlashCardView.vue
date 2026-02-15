<template>
  <div class="learn-container">
    <header class="learn-header">
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-label">{{ ui.today }}</span>
          <span class="stat-value today-value">{{ stats.learnedToday }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ ui.batchNew }}</span>
          <span class="stat-value batch-value">{{ stats.batchNew }}/{{ stats.batchTotal }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ ui.total }}</span>
          <span class="stat-value">{{ stats.totalLearned }}/{{ stats.totalVocabs }}</span>
        </div>
      </div>
      <button class="btn-logout" @click="handleLogout">
        {{ ui.logout }}
      </button>
    </header>

    <!-- Loading: session or audio preloading -->
    <div v-if="!vocabStore.sessionLoaded || !vocabStore.audioPreloaded" class="loading">
      <div class="loading-spinner"></div>
      <p>{{ !vocabStore.sessionLoaded ? ui.loading : ui.loadingAudio }}</p>
    </div>

    <!-- Batch complete -->
    <div v-else-if="!vocabStore.currentVocab" class="done-message">
      <h2>{{ ui.batchDone }}</h2>
      <p>{{ ui.batchDoneDesc }}</p>
      <button class="btn-next-batch" @click="loadNextBatch">
        {{ ui.nextBatch }}
      </button>
    </div>

    <div v-else class="card-area">
      <!-- New vocab badge -->
      <div v-if="isCurrentNew" class="new-badge">{{ ui.newVocab }}</div>

      <!-- Question side -->
      <div class="flashcard" :class="{ flipped: vocabStore.isFlipped }" @click="handleFlip">
        <div class="card-front">
          <p class="card-text">{{ questionText }}</p>
          <div class="card-audio" @click.stop>
            <VocabAudio
              :vocabId="vocabStore.currentCard"
              :lang="questionLang"
            />
          </div>
          <p class="tap-hint">{{ ui.tapToFlip }}</p>
        </div>
        <div class="card-back">
          <p class="card-text">{{ answerText }}</p>
          <div class="card-audio" @click.stop>
            <VocabAudio
              :vocabId="vocabStore.currentCard"
              :lang="answerLang"
            />
          </div>
          <p v-if="intermediateText" class="card-intermediate">{{ intermediateText }}</p>
        </div>
      </div>

      <!-- Rating buttons (shown after flip) -->
      <div v-if="vocabStore.isFlipped" class="rating-buttons">
        <button class="rate-btn rate-red" @click="rate('red')">
          <span class="rate-icon">&#10007;</span>
          <span class="rate-label">{{ ui.red }}</span>
          <span class="rate-time">2 min</span>
        </button>
        <button class="rate-btn rate-orange" @click="rate('orange')">
          <span class="rate-icon">&#126;</span>
          <span class="rate-label">{{ ui.orange }}</span>
          <span class="rate-time">5 min</span>
        </button>
        <button class="rate-btn rate-green" @click="rate('green')">
          <span class="rate-icon">&#10003;</span>
          <span class="rate-label">{{ ui.green }}</span>
          <span class="rate-time">10 min</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { useVocabStore } from '../stores/vocabStore'
import { initSessionManager } from '../services/sessionManager'
import VocabAudio from '../components/VocabAudio.vue'

const router = useRouter()
const userStore = useUserStore()
const vocabStore = useVocabStore()

const isGermanLearner = computed(() => userStore.isLearningGerman())

const ui = computed(() => {
  if (isGermanLearner.value) {
    return {
      logout: 'Keluar',
      loading: 'Memuat...',
      loadingAudio: 'Memuat audio...',
      batchDone: 'Blok selesai!',
      batchDoneDesc: 'Semua kartu di blok ini sudah dipelajari. Muat blok berikutnya atau kembali nanti.',
      nextBatch: 'Blok berikutnya',
      tapToFlip: 'Ketuk untuk membalik',
      red: 'Tidak tahu',
      orange: 'Setengah tahu',
      green: 'Tahu!',
      today: 'Hari ini',
      batchNew: 'Baru di blok',
      total: 'Total',
      newVocab: 'Baru'
    }
  }
  return {
    logout: 'Abmelden',
    loading: 'Laden...',
    loadingAudio: 'Audio wird geladen...',
    batchDone: 'Lernblock geschafft!',
    batchDoneDesc: 'Alle Karten in diesem Block sind bearbeitet. Lade den nächsten Block oder komm später zurück.',
    nextBatch: 'Nächster Block',
    tapToFlip: 'Tippen zum Umdrehen',
    red: 'Nicht gewusst',
    orange: 'Halb gewusst',
    green: 'Gewusst!',
    today: 'Heute gelernt',
    batchNew: 'Neue im Block',
    total: 'Gesamt',
    newVocab: 'Neue Vokabel'
  }
})

const questionText = computed(() => {
  const vocab = vocabStore.currentVocab
  if (!vocab) return ''
  return isGermanLearner.value ? vocab.I : vocab.D
})

const answerText = computed(() => {
  const vocab = vocabStore.currentVocab
  if (!vocab) return ''
  return isGermanLearner.value ? vocab.D : vocab.I
})

const intermediateText = computed(() => {
  const vocab = vocabStore.currentVocab
  if (!vocab) return ''
  return vocab.DZ
})

// Language codes for audio files: "d" = German, "i" = Indonesian
const questionLang = computed(() => isGermanLearner.value ? 'i' : 'd')
const answerLang = computed(() => isGermanLearner.value ? 'd' : 'i')

const stats = computed(() => vocabStore.getStats())

const isCurrentNew = computed(() => {
  if (!vocabStore.currentCard) return false
  const p = vocabStore.progress[vocabStore.currentCard]
  return p && p.isNew
})

function handleFlip() {
  if (!vocabStore.isFlipped) {
    vocabStore.flipCard()
  }
}

function rate(rating) {
  vocabStore.rateCard(rating)
}

function loadNextBatch() {
  vocabStore.loadNextBatch()
}

function handleLogout() {
  vocabStore.saveProgress()
  userStore.logout()
  router.push('/login')
}

onMounted(() => {
  initSessionManager()
  vocabStore.loadProgress()
})

onUnmounted(() => {
  vocabStore.saveProgress()
})
</script>

<style scoped>
.learn-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

.learn-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.stats-row {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 0.7rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.stat-value {
  font-size: 1.05rem;
  font-weight: 700;
  color: #555;
}

.today-value {
  color: #4a90d9;
}

.batch-value {
  color: #f39c12;
}

.btn-logout {
  padding: 8px 16px;
  background: transparent;
  border: 2px solid #ddd;
  border-radius: 8px;
  color: #666;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  margin-top: 4px;
}

.btn-logout:hover {
  border-color: #e74c3c;
  color: #e74c3c;
}

.loading {
  text-align: center;
  padding: 60px 0;
  color: #888;
  font-size: 1.1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #eee;
  border-top: 4px solid #4a90d9;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.done-message {
  text-align: center;
  padding: 60px 20px;
}

.done-message h2 {
  color: #27ae60;
  margin-bottom: 10px;
}

.done-message p {
  color: #666;
  margin-bottom: 24px;
}

.btn-next-batch {
  padding: 12px 30px;
  background: #4a90d9;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-next-batch:hover {
  background: #357abd;
}

.card-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.new-badge {
  align-self: flex-start;
  background: #4a90d9;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.flashcard {
  width: 100%;
  min-height: 250px;
  perspective: 1000px;
  cursor: pointer;
  position: relative;
}

.card-front,
.card-back {
  width: 100%;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  border-radius: 16px;
  box-sizing: border-box;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.4s ease;
}

.card-front {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.card-back {
  background: #fff;
  color: #333;
  border: 2px solid #eee;
  display: none;
}

.flashcard.flipped .card-front {
  display: none;
}

.flashcard.flipped .card-back {
  display: flex;
}

.card-text {
  font-size: 1.6rem;
  font-weight: 700;
  text-align: center;
  line-height: 1.4;
  margin: 0;
}

.card-audio {
  margin-top: 12px;
}

.card-intermediate {
  font-style: italic;
  font-size: 1rem;
  color: #888;
  margin-top: 16px;
  text-align: center;
  line-height: 1.5;
}

.tap-hint {
  margin-top: 20px;
  font-size: 0.85rem;
  opacity: 0.7;
}

.rating-buttons {
  display: flex;
  gap: 12px;
  width: 100%;
}

.rate-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  color: #fff;
  font-weight: 600;
  transition: transform 0.15s, box-shadow 0.15s;
}

.rate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.rate-btn:active {
  transform: translateY(0);
}

.rate-red {
  background: #e74c3c;
}

.rate-orange {
  background: #f39c12;
}

.rate-green {
  background: #27ae60;
}

.rate-icon {
  font-size: 1.5rem;
  margin-bottom: 4px;
}

.rate-label {
  font-size: 0.85rem;
}

.rate-time {
  font-size: 0.75rem;
  opacity: 0.8;
  margin-top: 2px;
}
</style>
