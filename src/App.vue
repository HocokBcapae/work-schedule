<script setup>
import { ref, onMounted } from "vue";
import { currentUser, loginByPasscode, logout } from "./state/auth";
import { loadInitialData, initRealtime } from "./state/schedule";
import AdminSchedule from "./components/AdminSchedule.vue";
import WorkerSchedule from "./components/WorkerSchedule.vue";
import FinancierView from "./components/FinancierView.vue";

onMounted(() => {
  loadInitialData();
  initRealtime();
});

const passcode = ref("");
const errorMsg = ref("");

const showPassword = ref(false);
const isCapsLock = ref(false);
const detectedLang = ref(navigator.language?.startsWith("ru") ? "RU" : "EN");

function handleKeydown(event) {
  if (event.getModifierState)
    isCapsLock.value = event.getModifierState("CapsLock");
  if (/[а-яёА-ЯЁ]/.test(event.key)) detectedLang.value = "RU";
  else if (/[a-zA-Z]/.test(event.key)) detectedLang.value = "EN";
}

function handleKeyup(event) {
  if (event.getModifierState)
    isCapsLock.value = event.getModifierState("CapsLock");
}

function handleInput() {
  if (/[а-яёА-ЯЁ]/.test(passcode.value)) detectedLang.value = "RU";
  else if (/[a-zA-Z]/.test(passcode.value)) detectedLang.value = "EN";
}

async function handleLogin() {
  errorMsg.value = "";
  const res = await loginByPasscode(passcode.value);
  if (!res.success) {
    errorMsg.value = res.error;
  } else {
    passcode.value = "";
    showPassword.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
    <!-- ЭКРАН ВХОДА -->
    <div
      v-if="!currentUser"
      class="flex items-center justify-center min-h-screen p-4"
    >
      <form
        @submit.prevent="handleLogin"
        class="w-full max-w-xs bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl"
      >
        <div class="text-center">
          <div
            class="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center mx-auto mb-2 text-lg"
          >
            🔐
          </div>
          <h1 class="text-base font-bold tracking-tight text-zinc-100">
            Вход в систему
          </h1>
          <p class="text-xs text-zinc-500 mt-0.5">
            Введите ваш пин-код или пароль
          </p>
        </div>

        <div>
          <div class="relative">
            <input
              v-model="passcode"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Введите пароль..."
              @keydown="handleKeydown"
              @keyup="handleKeyup"
              @input="handleInput"
              class="w-full pl-3 pr-10 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-center text-base font-medium focus:outline-none focus:border-zinc-500 transition"
              :class="showPassword ? 'tracking-normal' : 'tracking-widest'"
              autofocus
            />

            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 p-1 rounded-md transition cursor-pointer"
              :title="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
            >
              <svg
                v-if="!showPassword"
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                />
              </svg>
            </button>
          </div>

          <div class="flex items-center justify-between text-[11px] px-1 mt-2">
            <div class="flex items-center gap-1.5 text-zinc-400">
              <span>Язык:</span>
              <span
                class="px-1.5 py-0.5 rounded text-[10px] font-bold border transition"
                :class="
                  detectedLang === 'RU'
                    ? 'bg-blue-950/80 text-blue-300 border-blue-800/60'
                    : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                "
              >
                {{ detectedLang }}
              </span>
            </div>

            <div
              v-if="isCapsLock"
              class="flex items-center gap-1 text-amber-400 font-medium animate-pulse"
            >
              <span>⇪</span>
              <span>Включен Caps Lock</span>
            </div>
          </div>

          <p
            v-if="errorMsg"
            class="text-red-400 text-xs text-center mt-2.5 font-medium"
          >
            {{ errorMsg }}
          </p>
        </div>

        <button
          type="submit"
          class="w-full py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-xl transition cursor-pointer text-sm shadow-md"
        >
          Войти
        </button>

        <div
          class="text-[11px] text-zinc-500 text-center pt-2 border-t border-zinc-800/80"
        >
          Админ | Финансист | Сотрудники
        </div>
      </form>
    </div>

    <!-- РАБОЧАЯ ОБЛАСТЬ -->
    <div v-else class="min-h-screen flex flex-col">
      <header
        class="border-b border-zinc-800 bg-zinc-900/50 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <span
            class="w-2.5 h-2.5 rounded-full shrink-0"
            :class="currentUser.color || 'bg-zinc-700'"
          ></span>
          <span class="font-bold text-sm truncate">{{ currentUser.name }}</span>
          <span
            class="text-[10px] sm:text-xs px-2 py-0.5 rounded font-medium shrink-0"
            :class="
              currentUser.role === 'admin'
                ? 'bg-purple-950/80 text-purple-300 border border-purple-800/60'
                : currentUser.role === 'financier'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                  : 'bg-zinc-800 text-zinc-400'
            "
          >
            {{
              currentUser.role === "admin"
                ? "Администратор"
                : currentUser.role === "financier"
                  ? "Финансист"
                  : "Сотрудник"
            }}
          </span>
        </div>

        <button
          @click="logout"
          class="text-xs text-zinc-400 hover:text-zinc-200 transition cursor-pointer px-2.5 py-1 rounded-lg hover:bg-zinc-800"
        >
          Выйти
        </button>
      </header>

      <main class="p-3 sm:p-6 flex-1">
        <AdminSchedule v-if="currentUser.role === 'admin'" />
        <FinancierView
          v-else-if="currentUser.role === 'financier'"
          :user="currentUser"
        />
        <WorkerSchedule v-else :user="currentUser" />
      </main>
    </div>
  </div>
</template>
