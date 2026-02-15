import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import FlashCardView from '../views/FlashCardView.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', name: 'Register', component: RegisterView },
  {
    path: '/learn',
    name: 'Learn',
    component: FlashCardView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userId = localStorage.getItem('userId')
  if (to.meta.requiresAuth && !userId) {
    next('/login')
  } else {
    next()
  }
})

export default router
