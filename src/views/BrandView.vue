<template>
  <div
    v-if="currentBrand"
    class="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-12 flex-1 flex flex-col"
  >
    <!-- Навигация назад + Тех-индекс -->
    <div
      class="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[var(--border-color)]"
    >
      <RouterLink
        to="/"
        class="font-mono-tech text-xs inline-flex items-center gap-2 px-3 py-1.5 border border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[var(--accent-lime)] hover:text-[var(--accent-lime)] active:bg-[var(--accent-lime)] active:text-[var(--accent-text)] transition-colors duration-75"
      >
        <span>&lt;-</span> НАЗАД В КОРЕНЬ
      </RouterLink>

      <div class="font-mono-tech text-xs text-[var(--text-muted)]">
        DIR_INDEX // {{ currentBrand.index }} // {{ currentBrand.code }}
      </div>
    </div>

    <!-- Заголовок выбранного бренда + Поиск по модулям -->
    <div
      class="py-8 sm:py-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
    >
      <div>
        <div
          class="font-mono-tech text-xs text-[var(--accent-orange)] uppercase tracking-widest mb-2"
        >
          // КАТАЛОГ КОМПЛЕКТУЮЩИХ
        </div>
        <h1
          class="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-none mielgo-glitch"
        >
          {{ currentBrand.title }}
        </h1>
        <p class="mt-3 text-xs sm:text-sm text-[var(--text-muted)] max-w-xl">
          {{ currentBrand.subtitle }}
        </p>
      </div>

      <!-- Поле быстрого фильтра разделов -->
      <div class="w-full md:w-72">
        <label
          class="block font-mono-tech text-[10px] text-[var(--text-muted)] mb-1 uppercase"
        >
          ФИЛЬТР МОДУЛЕЙ:
        </label>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Например: АКБ, OLED..."
          class="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] px-3.5 py-2.5 text-xs font-mono-tech text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-lime)] transition-colors"
        />
      </div>
    </div>

    <!-- Сетка категорий (АКБ, Дисплеи, Кабели и т.д.) -->
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-2"
    >
      <RouterLink
        v-for="(cat, idx) in filteredCategories"
        :key="cat.id"
        :to="`/${currentBrand.id}/${cat.id}`"
        class="group relative bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 hover:border-[var(--accent-lime)] transition-all duration-75 clip-corner flex flex-col justify-between min-h-[210px]"
      >
        <!-- Акцентный уголок сверху -->
        <div class="flex justify-between items-start font-mono-tech text-xs">
          <span
            class="px-2 py-0.5 bg-[var(--bg-base)] border border-[var(--border-color)] text-[var(--text-muted)] group-hover:border-[var(--accent-lime)] group-hover:text-[var(--accent-lime)]"
          >
            {{ cat.code }}
          </span>
          <span
            class="text-[var(--text-muted)] group-hover:text-[var(--accent-lime)]"
          >
            [0{{ idx + 1 }}]
          </span>
        </div>

        <!-- Название и описание категории -->
        <div class="my-6">
          <h2
            class="text-2xl sm:text-3xl font-black tracking-tight uppercase group-hover:text-[var(--accent-lime)] transition-colors duration-75"
          >
            {{ cat.title }}
          </h2>
          <p
            class="mt-2.5 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed"
          >
            {{ cat.shortDesc }}
          </p>
        </div>

        <!-- Нижняя панель карточки -->
        <div
          class="pt-3 border-t border-[var(--border-color)] flex justify-between items-center font-mono-tech text-xs"
        >
          <span class="text-[var(--text-muted)]">
            ТЕМ ВНУТРИ: {{ cat.sectionsCount }}
          </span>
          <span
            class="font-bold text-[var(--text-main)] group-hover:text-[var(--accent-lime)] flex items-center gap-1"
          >
            ЧИТАТЬ РАЗБОР <span>-&gt;</span>
          </span>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { catalogData } from "../data/catalog";

const route = useRoute();
const searchQuery = ref("");

const currentBrand = computed(() => {
  return catalogData.find((b) => b.id === route.params.brandId);
});

const filteredCategories = computed(() => {
  if (!currentBrand.value) return [];
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return currentBrand.value.categories;
  return currentBrand.value.categories.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      c.shortDesc.toLowerCase().includes(q),
  );
});
</script>
