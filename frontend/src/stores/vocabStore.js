import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './userStore'
import api from '../services/apiService'
import vocabularies from '../../../data/vocabularies.json'

// Interval progression: 2min, 5min, 10min, 1day, 2days, 4days, 8days
const INTERVALS = {
  red: 2 * 60 * 1000,          // 2 minutes
  orange: 5 * 60 * 1000,       // 5 minutes
  green: 10 * 60 * 1000,       // 10 minutes
  day1: 24 * 60 * 60 * 1000,   // 1 day
  day2: 2 * 24 * 60 * 60 * 1000, // 2 days
  day4: 4 * 24 * 60 * 60 * 1000, // 4 days
  day8: 8 * 24 * 60 * 60 * 1000  // 8 days
}

// Progression order for green button escalation
const GREEN_PROGRESSION = ['green', 'day1', 'day2', 'day4', 'day8']

export const useVocabStore = defineStore('vocab', () => {
  // Dictionary: { vocabId: { interval: string, timestamp: number, greenStreak: number } }
  const progress = ref({})
  const currentCard = ref(null)
  const isFlipped = ref(false)
  const allVocabIds = Object.keys(vocabularies)
  const sessionLoaded = ref(false)

  const currentVocab = computed(() => {
    if (!currentCard.value) return null
    return vocabularies[currentCard.value]
  })

  async function loadProgress() {
    const userStore = useUserStore()
    if (!userStore.userId) return

    try {
      const response = await api.get(`/api/vocabprogress/${userStore.userId}`)
      const entries = response.data
      progress.value = {}
      for (const entry of entries) {
        progress.value[entry.vocabId] = {
          interval: entry.interval,
          timestamp: entry.timestamp,
          greenStreak: entry.greenStreak || 0
        }
      }
    } catch (e) {
      // No progress yet, start fresh
      progress.value = {}
    }
    sessionLoaded.value = true
    pickNextCard()
  }

  function pickNextCard() {
    const now = Date.now()

    // First: check if any learned vocab is due for review
    const dueVocabs = []
    for (const [vocabId, data] of Object.entries(progress.value)) {
      const intervalMs = INTERVALS[data.interval]
      if (intervalMs && (now - data.timestamp) >= intervalMs) {
        dueVocabs.push({ vocabId, overdue: now - data.timestamp - intervalMs })
      }
    }

    if (dueVocabs.length > 0) {
      // Pick the most overdue vocab
      dueVocabs.sort((a, b) => b.overdue - a.overdue)
      currentCard.value = dueVocabs[0].vocabId
    } else {
      // Pick a new vocab that hasn't been learned yet
      const newVocab = allVocabIds.find(id => !(id in progress.value))
      if (newVocab) {
        currentCard.value = newVocab
      } else {
        // All vocabs learned, pick least recently reviewed
        const sorted = Object.entries(progress.value)
          .sort((a, b) => a[1].timestamp - b[1].timestamp)
        currentCard.value = sorted.length > 0 ? sorted[0][0] : null
      }
    }
    isFlipped.value = false
  }

  function rateCard(rating) {
    const vocabId = currentCard.value
    if (!vocabId) return

    const now = Date.now()
    const existing = progress.value[vocabId]

    if (rating === 'green') {
      if (existing && existing.interval === 'green' && existing.greenStreak >= 1) {
        // Already answered green once at 10min interval -> escalate
        const currentIdx = GREEN_PROGRESSION.indexOf(existing.interval)
        const streak = existing.greenStreak + 1
        // Map streak to progression: streak 2 = day1, streak 3 = day2, etc.
        const nextIdx = Math.min(streak, GREEN_PROGRESSION.length - 1)
        progress.value[vocabId] = {
          interval: GREEN_PROGRESSION[nextIdx],
          timestamp: now,
          greenStreak: streak
        }
      } else if (existing && GREEN_PROGRESSION.indexOf(existing.interval) > 0) {
        // Already at day1 or higher, escalate further
        const currentIdx = GREEN_PROGRESSION.indexOf(existing.interval)
        const nextIdx = Math.min(currentIdx + 1, GREEN_PROGRESSION.length - 1)
        progress.value[vocabId] = {
          interval: GREEN_PROGRESSION[nextIdx],
          timestamp: now,
          greenStreak: (existing.greenStreak || 0) + 1
        }
      } else {
        // First time or first green
        progress.value[vocabId] = {
          interval: 'green',
          timestamp: now,
          greenStreak: 1
        }
      }
    } else if (rating === 'orange') {
      progress.value[vocabId] = {
        interval: 'orange',
        timestamp: now,
        greenStreak: 0
      }
    } else if (rating === 'red') {
      progress.value[vocabId] = {
        interval: 'red',
        timestamp: now,
        greenStreak: 0
      }
    }

    pickNextCard()
  }

  function flipCard() {
    isFlipped.value = true
  }

  async function saveProgress() {
    const userStore = useUserStore()
    if (!userStore.userId || Object.keys(progress.value).length === 0) return

    const entries = Object.entries(progress.value).map(([vocabId, data]) => ({
      vocabId: parseInt(vocabId),
      interval: data.interval,
      timestamp: data.timestamp,
      greenStreak: data.greenStreak || 0
    }))

    try {
      await api.post(`/api/vocabprogress/${userStore.userId}`, entries)
    } catch (e) {
      console.error('Failed to save progress:', e)
    }
  }

  function getStats() {
    const total = allVocabIds.length
    const learned = Object.keys(progress.value).length
    const mastered = Object.values(progress.value)
      .filter(p => GREEN_PROGRESSION.indexOf(p.interval) >= 3).length
    return { total, learned, mastered }
  }

  return {
    progress,
    currentCard,
    currentVocab,
    isFlipped,
    sessionLoaded,
    loadProgress,
    pickNextCard,
    rateCard,
    flipCard,
    saveProgress,
    getStats
  }
})
