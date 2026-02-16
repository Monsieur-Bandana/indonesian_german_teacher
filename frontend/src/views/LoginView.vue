<template>
  <div class="auth-container">
    <h1>🇮🇩 🇩🇪</h1>
    <h2>{{ title }}</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">{{ labels.username }}</label>
        <input
          id="username"
          v-model="username"
          type="text"
          required
          :placeholder="labels.usernamePlaceholder"
        />
      </div>
      <!--
        <div class="form-group">
          <label for="password">{{ labels.password }}</label>
          <input
          id="password"
          v-model="password"
          type="password"
          required
          :placeholder="labels.passwordPlaceholder"
          />
        </div>
        -->
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" class="btn-primary">{{ labels.login }}</button>
    </form>
    <p class="switch-link">
      {{ labels.noAccount }}
      <router-link to="/register">{{ labels.register }}</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore";

const router = useRouter();
const userStore = useUserStore();

const username = ref("");
const password = ref("");
const error = ref("");

const title = "Vokabeltrainer";
const labels = {
  username: "Benutzername / Nama pengguna",
  usernamePlaceholder: "Benutzername eingeben",
  password: "Passwort / Kata sandi",
  passwordPlaceholder: "Passwort eingeben",
  login: "Anmelden / Masuk",
  noAccount: "Noch kein Konto? / Belum punya akun?",
  register: "Registrieren / Daftar",
};

async function handleLogin() {
  error.value = "";
  try {
    await userStore.login(username.value /*password.value*/);
    router.push("/learn");
  } catch (e) {
    error.value =
      e.response?.data?.message || "Login fehlgeschlagen / Login gagal";
  }
}
</script>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 60px auto;
  padding: 30px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 5px;
}

h2 {
  color: #333;
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 18px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

input:focus {
  border-color: #4a90d9;
  outline: none;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: #4a90d9;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #357abd;
}

.error {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.switch-link {
  margin-top: 20px;
  color: #666;
  font-size: 0.9rem;
}

.switch-link a {
  color: #4a90d9;
  text-decoration: none;
  font-weight: 600;
}
</style>
