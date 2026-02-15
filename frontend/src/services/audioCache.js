import api from './apiService'

// Cache: key = "{vocabId}{lang}" (e.g. "1d", "1i"), value = { exists: bool, blobUrl: string|null }
const cache = {}

/**
 * Preload audio for an entire batch of vocab IDs.
 * For each vocab, checks both "d" and "i" audio files.
 * If they exist, fetches them as blobs and creates object URLs for instant playback.
 */
export async function preloadBatchAudio(vocabIds) {
  const checks = []

  for (const vocabId of vocabIds) {
    for (const lang of ['d', 'i']) {
      const key = `${vocabId}${lang}`
      if (cache[key]) continue // already cached

      checks.push(
        checkAndFetch(vocabId, lang, key)
      )
    }
  }

  // Run all checks in parallel
  await Promise.allSettled(checks)
}

async function checkAndFetch(vocabId, lang, key) {
  try {
    const res = await api.get(`/api/audio/check/${vocabId}/${lang}`)
    if (res.data.exists) {
      // Fetch the actual audio file as blob
      const audioRes = await api.get(`/api/audio/${vocabId}/${lang}`, {
        responseType: 'blob'
      })
      const blobUrl = URL.createObjectURL(audioRes.data)
      cache[key] = { exists: true, blobUrl }
    } else {
      cache[key] = { exists: false, blobUrl: null }
    }
  } catch {
    cache[key] = { exists: false, blobUrl: null }
  }
}

/**
 * Get cached audio info for a vocab/language combination.
 * Returns { exists: boolean, blobUrl: string|null }
 */
export function getCachedAudio(vocabId, lang) {
  const key = `${vocabId}${lang}`
  return cache[key] || null
}

/**
 * Update cache after a new recording was uploaded.
 * Fetches the new audio and stores it.
 */
export async function refreshCachedAudio(vocabId, lang) {
  const key = `${vocabId}${lang}`
  // Revoke old blob URL if it exists
  if (cache[key]?.blobUrl) {
    URL.revokeObjectURL(cache[key].blobUrl)
  }
  try {
    const audioRes = await api.get(`/api/audio/${vocabId}/${lang}`, {
      responseType: 'blob'
    })
    const blobUrl = URL.createObjectURL(audioRes.data)
    cache[key] = { exists: true, blobUrl }
  } catch {
    cache[key] = { exists: false, blobUrl: null }
  }
}

/**
 * Clear entire cache, revoking all blob URLs.
 */
export function clearAudioCache() {
  for (const key of Object.keys(cache)) {
    if (cache[key]?.blobUrl) {
      URL.revokeObjectURL(cache[key].blobUrl)
    }
    delete cache[key]
  }
}
