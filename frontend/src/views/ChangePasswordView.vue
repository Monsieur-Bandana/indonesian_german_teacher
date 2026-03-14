<template>
  <div class="auth-container">
    <h1>🇮🇩 🇩🇪</h1>
    <h2>{{ title }}</h2>
    <form @submit.prevent="handleChange">
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
      <div class="form-group">
        <label for="password">{{ labels.password }}</label>
        <input
          id="password"
          v-model="password2"
          type="password"
          required
          :placeholder="labels.passwordPlaceholder + ' repeat'"
        />
      </div>

      <div class="form-group">
        <label>{{ labels.languageQuestion }}</label>
        <div class="language-options">
          <button
            type="button"
            class="lang-btn"
            :class="{ active: language === 'in' }"
            @click="language = 'in'"
          >
            🇩🇪 Saya ingin belajar bahasa Jerman
            <span class="lang-sub">Ich möchte Deutsch lernen</span>
          </button>
          <button
            type="button"
            class="lang-btn"
            :class="{ active: language === 'd' }"
            @click="language = 'd'"
          >
            🇮🇩 Ich möchte Indonesisch lernen
            <span class="lang-sub">Saya ingin belajar bahasa Indonesia</span>
          </button>
        </div>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" class="btn-primary prim" :disabled="!language">
        Save
      </button>
    </form>

    <button
      class="btn-primary mt-1 bg-red-400"
      @click="router.push('/dashboard')"
    >
      Cancel
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore";
import { OperationCanceledException } from "typescript";

const router = useRouter();
const userStore = useUserStore();
const password = ref("");
const password2 = ref("");
const username = ref("");
const language = ref("");
const error = ref("");

const title = "Registrieren / Daftar";
const labels = {
  username: "Benutzername / Nama pengguna",
  usernamePlaceholder: "Benutzername wählen",
  password: "Passwort / Kata sandi",
  passwordPlaceholder: "Passwort wählen",
  languageQuestion: "Was möchtest du lernen? / Apa yang ingin kamu pelajari?",
  register: "Registrieren / Daftar",
  hasAccount: "Schon ein Konto? / Sudah punya akun?",
  login: "Anmelden / Masuk",
};

onMounted(() => {
  username.value = userStore.username;
  language.value = userStore.learningLanguage;
});

async function handleChange() {
  error.value = "";
  if (!language.value) {
    error.value = "Bitte wähle eine Sprache / Silakan pilih bahasa";
    return;
  }
  if (password.value != password2.value) {
    error.value = "Password tidak sama sama";
    return;
  }
  try {
    await userStore.update(
      userStore.userId as any as number,
      username.value != userStore.username
        ? username.value
        : userStore.username,
      language.value != userStore.learningLanguage
        ? language.value
        : userStore.learningLanguage,
      password.value,
    );
    router.push("/dashboard");
  } catch (e: any) {
    error.value =
      e.response?.data?.message || "Update fehlgeschlagen / Update gagal";
  }
}
</script>

<style scoped>
.auth-container {
  max-width: 440px;
  margin: 40px auto;
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

.language-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}

.lang-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px;
  border: 2px solid #ddd;
  border-radius: 10px;
  background: #f8f9fa;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.lang-btn:hover {
  border-color: #4a90d9;
  background: #eef4fb;
}

.lang-btn.active {
  border-color: #4a90d9;
  background: #dbe9f7;
}

.lang-sub {
  font-size: 0.8rem;
  color: #888;
  margin-top: 4px;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.prim {
  background: #4a90d9;
}

.btn-primary:hover {
  background: #357abd;
}

.btn-primary:disabled {
  background: #b0c4de;
  cursor: not-allowed;
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
