import { useVocabStore } from '../stores/vocabStore'

let initialized = false

export function initSessionManager() {
  if (initialized) return
  initialized = true

  // Save on page visibility change (e.g., switching tabs or apps on mobile)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      const vocabStore = useVocabStore()
      vocabStore.saveProgress()
    }
  })

  // Save before page unload
  window.addEventListener('beforeunload', () => {
    const vocabStore = useVocabStore()
    vocabStore.saveProgress()
  })

  // Save on pagehide (iOS Safari)
  window.addEventListener('pagehide', () => {
    const vocabStore = useVocabStore()
    vocabStore.saveProgress()
  })
}
