import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import FlashCardView from "../views/FlashCardView.vue";
import DashBoardView from "../views/DashBoardView.vue";
import ContributeView from "../views/ContributeView.vue";
import ChangePasswordView from "../views/ChangePasswordView.vue";

const routes = [
  { path: "/", redirect: "/login" },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: DashBoardView,
    meta: { requiresAuth: true },
  },
  { path: "/login", name: "Login", component: LoginView },
  { path: "/register", name: "Register", component: RegisterView },
  {
    path: "/changePassword",
    name: "ChangePassword",
    component: ChangePasswordView,
  },
  {
    path: "/contribute",
    name: "Contribute",
    component: ContributeView,
    meta: { requiresAuth: true },
  },
  {
    path: "/learn",
    name: "Learn",
    component: FlashCardView,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const userId = localStorage.getItem("userId");
  if (to.meta.requiresAuth && !userId) {
    next("/login");
  } else {
    next();
  }
});

export default router;
