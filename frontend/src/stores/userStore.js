import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/apiService'

export const useUserStore = defineStore('user', () => {
  const userId = ref(localStorage.getItem('userId') || null)
  const username = ref(localStorage.getItem('username') || '')
  const learningLanguage = ref(localStorage.getItem('learningLanguage') || '')

  async function login(name, password) {
    const response = await api.post('/api/user/login', {
      username: name,
      password: password
    })
    const user = response.data
    userId.value = user.id
    username.value = user.username
    learningLanguage.value = user.learningLanguage
    localStorage.setItem('userId', user.id)
    localStorage.setItem('username', user.username)
    localStorage.setItem('learningLanguage', user.learningLanguage)
    return user
  }

  async function register(name, password, language) {
    const response = await api.post('/api/user/register', {
      username: name,
      password: password,
      learningLanguage: language
    })
    const user = response.data
    userId.value = user.id
    username.value = user.username
    learningLanguage.value = user.learningLanguage
    localStorage.setItem('userId', user.id)
    localStorage.setItem('username', user.username)
    localStorage.setItem('learningLanguage', user.learningLanguage)
    return user
  }

  function logout() {
    userId.value = null
    username.value = ''
    learningLanguage.value = ''
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    localStorage.removeItem('learningLanguage')
  }

  function isLearningGerman() {
    return learningLanguage.value === 'german'
  }

  function isLearningIndonesian() {
    return learningLanguage.value === 'indonesian'
  }

  return {
    userId,
    username,
    learningLanguage,
    login,
    register,
    logout,
    isLearningGerman,
    isLearningIndonesian
  }
})
