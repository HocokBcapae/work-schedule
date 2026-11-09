<template>
  <div
    class="min-h-screen flex flex-col relative selection:bg-[var(--accent-lime)] selection:text-[var(--accent-text)]"
  >
    <!-- SVG-фильтр зернистости в стиле Альберто Мьельго (поверх экрана, не мешает кликам) -->
    <div class="pointer-events-none fixed inset-0 z-50 opacity-[0.035]">
      <svg class="w-full h-full">
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>

    <!-- Верхний минималистичный HUD-бар -->
    <header
      class="border-b border-[var(--border-color)] bg-[var(--bg-base)]/90 backdrop-blur-xs sticky top-0 z-40"
    >
      <div
        class="max-w-7xl mx-auto px-6 h-12 flex items-center justify-between font-mono-tech text-xs"
      >
        <!-- Левая часть: логотип/возврат на главную и путь -->
        <div class="flex items-center gap-4">
          <RouterLink
            to="/"
            class="font-bold tracking-widest px-2 py-0.5 bg-[var(--text-main)] text-[var(--bg-base)] hover:bg-[var(--accent-lime)] hover:text-[var(--accent-text)] transition-colors duration-75"
          >
            HW // ARCHIVE
          </RouterLink>
          <span class="text-[var(--text-muted)] hidden sm:inline">
            SYS.PATH:
            {{
              route.fullPath === "/"
                ? "/ROOT_INDEX"
                : route.fullPath.toUpperCase()
            }}
          </span>
        </div>

        <!-- Правая часть: координаты и переключатель темы (Тёмная / Лаборатория) -->
        <div class="flex items-center gap-6">
          <span class="text-[var(--text-muted)] hidden md:inline"
            >VER 2.6 // NON-COMMERCIAL</span
          >
          <button
            @click="toggleTheme"
            class="cursor-pointer border border-[var(--border-color)] px-2.5 py-1 hover:border-[var(--accent-lime)] hover:text-[var(--accent-lime)] transition-colors duration-75 uppercase"
          >
            [ MODE: {{ isLabTheme ? "LAB_WHITE" : "DARK_VOID" }} ]
          </button>
        </div>
      </div>
    </header>

    <!-- Основной контент страниц -->
    <main class="flex-1 flex flex-col relative">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const isLabTheme = ref(false);

const toggleTheme = () => {
  isLabTheme.value = !isLabTheme.value;
  if (isLabTheme.value) {
    document.documentElement.setAttribute("data-theme", "lab");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
};
</script>
