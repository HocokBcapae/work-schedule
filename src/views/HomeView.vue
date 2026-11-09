<template>
  <div
    class="flex-1 flex flex-col justify-between max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-12 md:py-16 relative"
  >
    <!-- Верхняя тех-строка -->
    <div
      class="font-mono-tech text-[10px] sm:text-xs text-[var(--text-muted)] flex justify-between items-center"
    >
      <span>+ SECT_00 // INIT</span>
      <span class="hidden xs:inline">[ SELECT ARCHITECTURE ]</span>
      <span>+</span>
    </div>

    <!-- Центральный блок: Название проекта (адаптировано под узкие мобилки и широкие ПК) -->
    <div class="my-auto py-8 sm:py-12">
      <div
        class="font-mono-tech text-[11px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[var(--accent-orange)] mb-3 flex items-center gap-2"
      >
        <span
          class="inline-block w-2 h-2 bg-[var(--accent-orange)] animate-pulse"
        ></span>
        АНАТОМИЯ МОБИЛЬНОГО ЖЕЛЕЗА
      </div>

      <h1
        class="text-4xl sm:text-7xl lg:text-9xl font-black tracking-tighter uppercase leading-[0.9] mielgo-glitch select-none break-words"
      >
        HARDWARE<br />
        <span
          class="text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-main)] to-[var(--text-muted)]"
        >
          DECONSTRUCT
        </span>
      </h1>

      <p
        class="mt-4 sm:mt-6 max-w-xl text-xs sm:text-base text-[var(--text-muted)] leading-relaxed"
      >
        Интерактивный справочник по внутреннему устройству смартфонов. Химия
        аккумуляторов, микросхемы дисплеев, контроллеры питания и архитектура
        кабелей без воды.
      </p>
    </div>

    <!-- Нижний блок: Три кнопки категорий -->
    <div>
      <div
        class="font-mono-tech text-[10px] sm:text-xs text-[var(--text-muted)] mb-3 flex justify-between"
      >
        <span>// ДИРЕКТОРИИ (03)</span>
        <span>TAP TO EXECUTE -></span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
        <RouterLink
          v-for="brand in catalogData"
          :key="brand.id"
          :to="`/${brand.id}`"
          class="group relative bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 sm:p-6 transition-all duration-75 hover:bg-[var(--accent-lime)] hover:border-[var(--accent-lime)] active:bg-[var(--accent-lime)] active:scale-[0.99] clip-corner flex flex-col justify-between min-h-[150px] sm:min-h-[190px]"
        >
          <!-- На мобилках показываем тонкую кислотную полоску слева, чтобы было видно интерактивность без ховера -->
          <div
            class="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-lime)] md:opacity-0 group-hover:opacity-100"
          ></div>

          <!-- Верхняя строчка карточки -->
          <div
            class="font-mono-tech text-[11px] sm:text-xs text-[var(--text-muted)] group-hover:text-[var(--accent-text)] flex justify-between items-center"
          >
            <span>[ {{ brand.index }} // {{ brand.code }} ]</span>
            <span
              class="md:opacity-0 group-hover:opacity-100 font-bold tracking-wider text-[var(--accent-lime)] group-hover:text-[var(--accent-text)]"
            >
              OPEN ->
            </span>
          </div>

          <!-- Название бренда -->
          <div class="my-3 sm:my-4">
            <h2
              class="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter uppercase text-[var(--text-main)] group-hover:text-[var(--accent-text)]"
            >
              {{ brand.title }}
            </h2>
            <p
              class="mt-1.5 sm:mt-2 text-xs text-[var(--text-muted)] group-hover:text-[var(--accent-text)]/80 line-clamp-2"
            >
              {{ brand.subtitle }}
            </p>
          </div>

          <!-- Нижний декор карточки -->
          <div
            class="font-mono-tech text-[10px] text-[var(--text-muted)] group-hover:text-[var(--accent-text)] flex justify-between items-center border-t border-[var(--border-color)] group-hover:border-[var(--accent-text)]/20 pt-2"
          >
            <span>МОДУЛЕЙ: 0{{ brand.categories.length }}</span>
            <span>+</span>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { catalogData } from "../data/catalog";
</script>
