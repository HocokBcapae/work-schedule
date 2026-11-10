<template>
  <div
    class="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 flex flex-col"
  >
    <!-- Верхняя навигационная панель -->
    <div
      class="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[var(--border-color)] font-mono-tech text-xs"
    >
      <div class="flex items-center gap-3">
        <RouterLink
          :to="`/${route.params.brandId}`"
          class="inline-flex items-center gap-2 px-3 py-1.5 border border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[var(--accent-lime)] hover:text-[var(--accent-lime)] transition-colors duration-75"
        >
          <span>&lt;-</span> В КАТАЛОГ
          {{ String(route.params.brandId).toUpperCase() }}
        </RouterLink>
        <span class="text-[var(--text-muted)] hidden sm:inline">
          // {{ article.code }}
        </span>
      </div>

      <div class="flex items-center gap-4 text-[var(--text-muted)]">
        <span>{{ article.updatedAt }}</span>
        <span
          class="px-2 py-0.5 bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-main)]"
        >
          ЧТЕНИЕ: {{ article.readingTime }}
        </span>
      </div>
    </div>

    <!-- Шапка статьи -->
    <div class="py-8 sm:py-12 border-b border-[var(--border-color)]">
      <div
        class="font-mono-tech text-xs text-[var(--accent-orange)] uppercase tracking-widest mb-3 flex items-center gap-2"
      >
        <span class="inline-block w-2 h-2 bg-[var(--accent-orange)]"></span>
        ТЕХНИЧЕСКАЯ ДОКУМЕНТАЦИЯ // РАЗБОР МОДУЛЯ
      </div>
      <h1
        class="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter uppercase leading-[0.95] mielgo-glitch max-w-4xl"
      >
        {{ article.title }}
      </h1>
      <p
        class="mt-4 sm:mt-6 text-sm sm:text-lg text-[var(--text-muted)] max-w-3xl leading-relaxed"
      >
        {{ article.lead }}
      </p>
    </div>

    <!-- Основная сетка: Статья слева + Динамический радар-меню справа -->
    <div
      class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-8 pb-24 lg:pb-16 relative"
    >
      <!-- ЛЕВАЯ КОЛОНКА: Контент статьи -->
      <article class="lg:col-span-8 space-y-6">
        <template v-for="(block, idx) in parsedBlocks" :key="idx">
          <!-- Заголовок H2 (#) -->
          <div
            v-if="block.type === 'h2'"
            :id="block.id"
            class="pt-8 first:pt-0 scroll-mt-20 border-t border-[var(--border-color)] first:border-t-0"
          >
            <div
              class="font-mono-tech text-[10px] text-[var(--accent-lime)] uppercase tracking-widest mb-1"
            >
              // SECT_NODE
            </div>
            <h2
              class="text-2xl sm:text-3xl font-black tracking-tight uppercase"
            >
              {{ block.text }}
            </h2>
          </div>

          <!-- Подзаголовок H3 (##) -->
          <h3
            v-else-if="block.type === 'h3'"
            :id="block.id"
            class="pt-4 scroll-mt-20 text-lg sm:text-xl font-bold uppercase tracking-tight flex items-center gap-2"
          >
            <span class="font-mono-tech text-xs text-[var(--accent-orange)]"
              >[+]</span
            >
            <span>{{ block.text }}</span>
          </h3>

          <!-- Обычный абзац -->
          <p
            v-else-if="block.type === 'p'"
            class="text-sm sm:text-base leading-relaxed text-[var(--text-main)]/90"
            v-html="formatInline(block.text)"
          ></p>

          <!-- Крупная цитата (!QUOTE:) -->
          <blockquote
            v-else-if="block.type === 'quote'"
            class="my-6 p-5 sm:p-6 bg-[var(--bg-surface)] border-l-4 border-[var(--accent-lime)] text-base sm:text-xl font-bold tracking-tight leading-snug"
            v-html="formatInline(block.text)"
          ></blockquote>

          <!-- Инженерная заметка (!INFO:) -->
          <div
            v-else-if="block.type === 'info'"
            class="my-6 p-4 sm:p-5 bg-[var(--bg-surface)] border border-[var(--border-color)] clip-corner relative"
          >
            <div
              class="font-mono-tech text-[10px] text-[var(--accent-lime)] uppercase tracking-widest mb-1.5 flex justify-between"
            >
              <span>[ SYS_NOTE // ИНЖЕНЕРНАЯ РЕМАРКА ]</span>
              <span>+</span>
            </div>
            <div
              class="text-xs sm:text-sm leading-relaxed"
              v-html="formatInline(block.text)"
            ></div>
          </div>

          <!-- Критическое предупреждение (!WARN:) -->
          <div
            v-else-if="block.type === 'warn'"
            class="my-6 p-4 sm:p-5 bg-[var(--accent-orange)]/10 border border-[var(--accent-orange)] clip-corner relative"
          >
            <div
              class="font-mono-tech text-[10px] text-[var(--accent-orange)] font-bold uppercase tracking-widest mb-1.5 flex justify-between"
            >
              <span>[ !! CRITICAL // ОСОБЕННОСТЬ УЗЛА ]</span>
              <span>WARN</span>
            </div>
            <div
              class="text-xs sm:text-sm leading-relaxed"
              v-html="formatInline(block.text)"
            ></div>
          </div>

          <!-- Таблица характеристик (!SPEC:) -->
          <div
            v-else-if="block.type === 'spec'"
            class="my-6 border border-[var(--border-color)] bg-[var(--bg-surface)]"
          >
            <div
              class="px-4 py-2 border-b border-[var(--border-color)] font-mono-tech text-[10px] text-[var(--text-muted)] flex justify-between"
            >
              <span>TECH_SPECS // ПАРАМЕТРЫ МОДУЛЯ</span>
              <span>[ MATRIX ]</span>
            </div>
            <div
              class="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-color)]"
            >
              <div
                v-for="(pair, pIdx) in block.specs"
                :key="pIdx"
                class="p-3.5 flex flex-col justify-between border-b border-[var(--border-color)] last:border-b-0"
              >
                <span
                  class="font-mono-tech text-[10px] text-[var(--text-muted)] uppercase"
                  >{{ pair.key }}</span
                >
                <span
                  class="font-mono-tech text-xs sm:text-sm font-bold text-[var(--accent-lime)] mt-1"
                  >{{ pair.val }}</span
                >
              </div>
            </div>
          </div>

          <!-- Маркированный список (-) -->
          <ul v-else-if="block.type === 'list'" class="space-y-2.5 my-4 pl-1">
            <li
              v-for="(item, lIdx) in block.items"
              :key="lIdx"
              class="flex items-start gap-3 text-sm sm:text-base leading-relaxed"
            >
              <span
                class="font-mono-tech text-xs text-[var(--accent-lime)] mt-1 select-none"
                >-&gt;</span
              >
              <span v-html="formatInline(item)"></span>
            </li>
          </ul>

          <!-- Сворачиваемый спойлер (+++) -->
          <div
            v-else-if="block.type === 'spoiler'"
            class="my-6 border border-[var(--border-color)] bg-[var(--bg-surface)]"
          >
            <button
              @click="toggleSpoiler(idx)"
              class="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-left font-mono-tech text-xs sm:text-sm font-bold hover:bg-[var(--accent-lime)] hover:text-[var(--accent-text)] transition-colors duration-75 cursor-pointer"
            >
              <span>{{ block.title }}</span>
              <span class="px-2 py-0.5 border border-current text-[10px]">
                {{ openSpoilers[idx] ? "[- СКРЫТЬ]" : "[+ РАЗВЕРНУТЬ]" }}
              </span>
            </button>
            <div
              v-if="openSpoilers[idx]"
              class="p-4 sm:p-5 border-t border-[var(--border-color)] space-y-3 text-xs sm:text-sm leading-relaxed bg-[var(--bg-base)]/50"
            >
              <div
                v-for="(line, sIdx) in block.lines"
                :key="sIdx"
                v-html="formatInline(line)"
              ></div>
            </div>
          </div>

          <!-- Одиночное фото (!IMG:) -->
          <figure
            v-else-if="block.type === 'img'"
            class="my-8 border border-[var(--border-color)] bg-[var(--bg-surface)] p-2 sm:p-3 clip-corner group"
          >
            <div
              class="flex justify-between items-center font-mono-tech text-[10px] text-[var(--text-muted)] mb-2 px-1"
            >
              <span>+ {{ block.code || "FIG // VISUAL_DATA" }}</span>
              <span class="text-[var(--accent-lime)]">[ ЗУМ ]</span>
            </div>
            <div
              @click="
                openLightbox(
                  [
                    {
                      src: block.src || '',
                      caption: block.caption || '',
                      code: block.code || 'FIG_01',
                    },
                  ],
                  0,
                )
              "
              class="relative overflow-hidden cursor-zoom-in bg-black aspect-video"
            >
              <img
                :src="block.src"
                :alt="block.caption"
                loading="lazy"
                class="w-full h-full object-cover contrast-110 group-hover:scale-[1.02] transition-transform duration-150"
              />
            </div>
            <figcaption
              class="mt-2.5 px-1 font-mono-tech text-xs text-[var(--text-muted)] flex justify-between items-center"
            >
              <span>// {{ block.caption }}</span>
              <span>+</span>
            </figcaption>
          </figure>

          <!-- МУЛЬТИ-ФОТО ТЕРМИНАЛ (!GALLERY:) -->
          <div
            v-else-if="
              block.type === 'gallery' && block.images && block.images.length
            "
            class="my-8 border border-[var(--border-color)] bg-[var(--bg-surface)] p-3 sm:p-5 clip-corner"
          >
            <div
              class="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-[var(--border-color)] font-mono-tech text-xs"
            >
              <div class="flex items-center gap-2">
                <span
                  class="px-1.5 py-0.5 bg-[var(--accent-lime)] text-[var(--accent-text)] font-bold text-[10px]"
                >
                  КАДРОВ: {{ block.images.length }}
                </span>
                <span class="font-bold uppercase text-[var(--text-main)]">{{
                  block.title
                }}</span>
              </div>

              <button
                @click="toggleGalleryMode(idx)"
                class="cursor-pointer px-2.5 py-1 border border-[var(--border-color)] hover:border-[var(--accent-lime)] text-[10px] text-[var(--accent-lime)] uppercase"
              >
                [ ВИД:
                {{
                  galleryMode[idx] === "grid"
                    ? "СЕТКА (ВСЕ)"
                    : "ТЕРМИНАЛ (ПО ОДНОЙ)"
                }}
                ]
              </button>
            </div>

            <div
              class="grid grid-cols-1 gap-6 items-start"
              :class="
                block.lines && block.lines.length && galleryMode[idx] !== 'grid'
                  ? 'xl:grid-cols-12'
                  : ''
              "
            >
              <div
                :class="
                  block.lines &&
                  block.lines.length &&
                  galleryMode[idx] !== 'grid'
                    ? 'xl:col-span-7 xl:order-2'
                    : 'w-full'
                "
              >
                <div v-if="galleryMode[idx] !== 'grid'">
                  <div
                    class="relative bg-black border border-[var(--border-color)] aspect-video overflow-hidden group"
                  >
                    <img
                      :src="block.images[getGalleryIdx(idx)].src"
                      :alt="block.images[getGalleryIdx(idx)].caption"
                      loading="lazy"
                      @click="openLightbox(block.images, getGalleryIdx(idx))"
                      class="w-full h-full object-cover cursor-zoom-in"
                    />

                    <div
                      class="absolute top-2 left-2 px-2 py-0.5 bg-black/80 border border-[var(--border-color)] font-mono-tech text-[10px] text-[var(--accent-lime)]"
                    >
                      {{ block.images[getGalleryIdx(idx)].code }} // [
                      {{ getGalleryIdx(idx) + 1 }} ИЗ
                      {{ block.images.length }} ]
                    </div>

                    <div
                      class="absolute inset-x-2 bottom-2 flex justify-between items-center pointer-events-none"
                    >
                      <button
                        @click.stop="stepGallery(idx, -1, block.images.length)"
                        class="pointer-events-auto cursor-pointer px-2.5 py-1 bg-black/85 border border-[var(--border-color)] hover:bg-[var(--accent-lime)] hover:text-black font-mono-tech text-xs"
                      >
                        &lt;- ПРЕД
                      </button>
                      <button
                        @click.stop="
                          openLightbox(block.images, getGalleryIdx(idx))
                        "
                        class="pointer-events-auto cursor-pointer px-2 py-1 bg-black/85 border border-[var(--border-color)] hover:border-[var(--accent-lime)] font-mono-tech text-[10px] text-[var(--text-muted)] hover:text-[var(--accent-lime)]"
                      >
                        [ + НА ВЕСЬ ЭКРАН ]
                      </button>
                      <button
                        @click.stop="stepGallery(idx, 1, block.images.length)"
                        class="pointer-events-auto cursor-pointer px-2.5 py-1 bg-black/85 border border-[var(--border-color)] hover:bg-[var(--accent-lime)] hover:text-black font-mono-tech text-xs"
                      >
                        СЛЕД -&gt;
                      </button>
                    </div>
                  </div>

                  <div
                    class="mt-2 font-mono-tech text-xs text-[var(--text-main)] bg-[var(--bg-base)] px-3 py-2 border border-[var(--border-color)]"
                  >
                    <span class="text-[var(--accent-lime)] mr-1.5"
                      >{{ block.images[getGalleryIdx(idx)].code }}:</span
                    >
                    <span>{{ block.images[getGalleryIdx(idx)].caption }}</span>
                  </div>

                  <div class="grid grid-cols-5 sm:grid-cols-8 gap-1.5 mt-2.5">
                    <button
                      v-for="(img, imgIdx) in block.images"
                      :key="imgIdx"
                      @click="setGalleryIdx(idx, imgIdx)"
                      class="cursor-pointer relative aspect-square border overflow-hidden transition-all"
                      :class="
                        getGalleryIdx(idx) === imgIdx
                          ? 'border-[var(--accent-lime)] ring-1 ring-[var(--accent-lime)] opacity-100'
                          : 'border-[var(--border-color)] opacity-50 hover:opacity-90'
                      "
                    >
                      <img
                        :src="img.src"
                        loading="lazy"
                        class="w-full h-full object-cover"
                      />
                      <span
                        class="absolute bottom-0 right-0 px-1 bg-black/80 font-mono-tech text-[9px] text-white"
                      >
                        0{{ imgIdx + 1 }}
                      </span>
                    </button>
                  </div>
                </div>

                <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div
                    v-for="(img, imgIdx) in block.images"
                    :key="imgIdx"
                    @click="openLightbox(block.images, imgIdx)"
                    class="group cursor-zoom-in border border-[var(--border-color)] bg-[var(--bg-base)] p-1.5 hover:border-[var(--accent-lime)]"
                  >
                    <div class="aspect-video bg-black overflow-hidden relative">
                      <img
                        :src="img.src"
                        loading="lazy"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span
                        class="absolute top-1 left-1 px-1.5 py-0.5 bg-black/80 font-mono-tech text-[9px] text-[var(--accent-lime)]"
                      >
                        {{ img.code }}
                      </span>
                    </div>
                    <div
                      class="mt-1.5 font-mono-tech text-[11px] text-[var(--text-muted)] line-clamp-2"
                    >
                      {{ img.caption }}
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="block.lines && block.lines.length"
                :class="
                  galleryMode[idx] !== 'grid'
                    ? 'xl:col-span-5 xl:order-1 space-y-3'
                    : 'w-full space-y-3 pt-4 border-t border-[var(--border-color)]'
                "
              >
                <div
                  class="font-mono-tech text-[10px] text-[var(--accent-orange)] uppercase tracking-widest"
                >
                  // ОПИСАНИЕ К КАДРАМ:
                </div>
                <div
                  v-for="(line, lIdx) in block.lines"
                  :key="lIdx"
                  class="text-xs sm:text-sm leading-relaxed"
                  v-html="formatInline(line)"
                ></div>
              </div>
            </div>
          </div>
        </template>
      </article>

      <!-- ПРАВАЯ КОЛОНКА (ПК): Прокручиваемое оглавление с авто-центровкой активной темы -->
      <aside class="hidden lg:block lg:col-span-4">
        <div
          @mouseenter="isHoveringToc = true"
          @mouseleave="isHoveringToc = false"
          class="sticky top-20 max-h-[calc(100vh-6.5rem)] flex flex-col border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 clip-corner"
        >
          <!-- Верхняя фиксированная часть радара -->
          <div class="shrink-0">
            <div
              class="flex justify-between items-center font-mono-tech text-xs pb-3 border-b border-[var(--border-color)]"
            >
              <span class="font-bold text-[var(--text-main)]"
                >НАВИГАЦИЯ // РАДАР</span
              >
              <span class="text-[var(--accent-lime)] font-bold"
                >{{ scrollProgress }}%</span
              >
            </div>

            <!-- Полоска прогресса чтения -->
            <div class="w-full h-1 bg-[var(--bg-base)] my-3 overflow-hidden">
              <div
                class="h-full bg-[var(--accent-lime)] transition-all duration-75"
                :style="{ width: `${scrollProgress}%` }"
              ></div>
            </div>
          </div>

          <!-- ПРОКРУЧИВАЕМЫЙ СПИСОК РАЗДЕЛОВ (Не улетает за экран, держит активный пункт в центре) -->
          <nav
            ref="tocNavRef"
            class="relative flex-1 overflow-y-auto pr-2 my-1 space-y-1.5 font-mono-tech text-xs toc-scrollbar"
          >
            <a
              v-for="(heading, hIdx) in tocHeadings"
              :key="heading.id"
              :data-toc-id="heading.id"
              :href="`#${heading.id}`"
              @click.prevent="scrollToSection(heading.id)"
              class="block py-2 px-2.5 transition-all duration-75 border-l-2 leading-snug"
              :class="[
                heading.level === 3 ? 'ml-3 text-[11px]' : '',
                activeHeadingId === heading.id
                  ? 'border-[var(--accent-lime)] bg-[var(--accent-lime)]/15 text-[var(--accent-lime)] font-bold'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--border-color)]',
              ]"
            >
              <div class="flex items-start justify-between gap-2">
                <span>
                  <span v-if="activeHeadingId === heading.id" class="mr-1"
                    >-&gt;</span
                  >
                  {{ heading.text }}
                </span>
                <span
                  v-if="activeHeadingId === heading.id"
                  class="shrink-0 text-[9px] px-1 bg-[var(--accent-lime)] text-[var(--accent-text)] font-bold"
                >
                  ACTIVE
                </span>
                <span v-else class="shrink-0 text-[10px] opacity-40">
                  {{ String(hIdx + 1).padStart(2, "0") }}
                </span>
              </div>
            </a>
          </nav>

          <!-- Нижняя фиксированная плашка радара -->
          <div
            class="shrink-0 mt-3 pt-3 border-t border-[var(--border-color)] font-mono-tech text-[10px] text-[var(--text-muted)] flex justify-between items-center"
          >
            <span>LOCK: AUTO-CENTER</span>
            <span
              >УЗЛОВ: {{ String(tocHeadings.length).padStart(2, "0") }}</span
            >
          </div>
        </div>
      </aside>
    </div>

    <!-- МОБИЛЬНЫЙ НИЖНИЙ HUD-РАДАР ОГЛАВЛЕНИЯ -->
    <div
      class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-surface)]/95 backdrop-blur-md border-t border-[var(--border-color)]"
    >
      <div class="w-full h-0.5 bg-[var(--bg-base)]">
        <div
          class="h-full bg-[var(--accent-lime)]"
          :style="{ width: `${scrollProgress}%` }"
        ></div>
      </div>

      <div
        class="px-4 py-2.5 flex items-center justify-between gap-3 font-mono-tech text-xs"
      >
        <div class="truncate">
          <span class="text-[10px] text-[var(--text-muted)] block"
            >ТЕКУЩИЙ РАЗДЕЛ ({{ scrollProgress }}%):</span
          >
          <span class="font-bold text-[var(--accent-lime)] truncate block">
            {{ activeHeadingText }}
          </span>
        </div>

        <button
          @click="mobileTocOpen = !mobileTocOpen"
          class="shrink-0 px-3 py-2 bg-[var(--text-main)] text-[var(--bg-base)] font-bold uppercase text-[11px]"
        >
          {{
            mobileTocOpen
              ? "[ ЗАКРЫТЬ ]"
              : `[ ТЕМЫ: ${String(tocHeadings.length).padStart(2, "0")} ]`
          }}
        </button>
      </div>

      <div
        v-if="mobileTocOpen"
        ref="mobileTocNavRef"
        class="relative border-t border-[var(--border-color)] bg-[var(--bg-base)] px-4 py-4 max-h-[55vh] overflow-y-auto space-y-2 font-mono-tech text-xs toc-scrollbar"
      >
        <a
          v-for="heading in tocHeadings"
          :key="heading.id"
          :data-mobile-toc-id="heading.id"
          :href="`#${heading.id}`"
          @click.prevent="
            scrollToSection(heading.id);
            mobileTocOpen = false;
          "
          class="block py-2 px-3 border-l-2"
          :class="[
            heading.level === 3 ? 'ml-4 text-[11px]' : '',
            activeHeadingId === heading.id
              ? 'border-[var(--accent-lime)] bg-[var(--bg-surface)] text-[var(--accent-lime)] font-bold'
              : 'border-[var(--border-color)] text-[var(--text-muted)]',
          ]"
        >
          {{ heading.text }}
        </a>
      </div>
    </div>

    <!-- ПОЛНОЭКРАННЫЙ ОСМОТР ФОТО И ГАЛЕРЕЙ (LIGHTBOX) -->
    <div
      v-if="lightboxList.length > 0"
      @click="closeLightbox"
      class="fixed inset-0 z-50 bg-black/95 backdrop-blur-xs flex flex-col items-center justify-center p-3 sm:p-6"
    >
      <div
        @click.stop
        class="max-w-5xl w-full border border-[var(--accent-lime)] bg-[var(--bg-base)] p-3 sm:p-4"
      >
        <div
          class="flex justify-between items-center font-mono-tech text-xs text-[var(--accent-lime)] mb-3"
        >
          <span>
            {{ lightboxList[lightboxIndex]?.code }} // КАДР
            {{ lightboxIndex + 1 }} ИЗ {{ lightboxList.length }}
          </span>
          <button
            @click="closeLightbox"
            class="cursor-pointer px-2.5 py-1 bg-[var(--accent-lime)] text-black font-bold"
          >
            [ X ЗАКРЫТЬ ]
          </button>
        </div>

        <div class="relative bg-black flex items-center justify-center">
          <img
            :src="lightboxList[lightboxIndex]?.src"
            class="w-full max-h-[70vh] object-contain"
          />
        </div>

        <div
          class="mt-3 flex flex-wrap items-center justify-between gap-3 font-mono-tech text-xs"
        >
          <span class="text-[var(--text-main)]"
            >// {{ lightboxList[lightboxIndex]?.caption }}</span
          >

          <div v-if="lightboxList.length > 1" class="flex items-center gap-2">
            <button
              @click="stepLightbox(-1)"
              class="cursor-pointer px-3 py-1.5 border border-[var(--border-color)] hover:border-[var(--accent-lime)] hover:text-[var(--accent-lime)]"
            >
              &lt;- ПРЕД
            </button>
            <button
              @click="stepLightbox(1)"
              class="cursor-pointer px-3 py-1.5 border border-[var(--border-color)] hover:border-[var(--accent-lime)] hover:text-[var(--accent-lime)]"
            >
              СЛЕД -&gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import { articlesDatabase, type ArticleData } from "../data/articles";
import { catalogData } from "../data/catalog";

const route = useRoute();
const openSpoilers = ref<Record<number, boolean>>({});
const activeHeadingId = ref<string>("");
const scrollProgress = ref<number>(0);
const mobileTocOpen = ref<boolean>(false);

// Ссылки на прокручиваемые контейнеры меню (ПК и Мобилка)
const tocNavRef = ref<HTMLElement | null>(null);
const mobileTocNavRef = ref<HTMLElement | null>(null);
const isHoveringToc = ref<boolean>(false);

// Состояния для мульти-фото галерей (!GALLERY)
const galleryActiveIdx = ref<Record<number, number>>({});
const galleryMode = ref<Record<number, "slider" | "grid">>({});

const getGalleryIdx = (blockIdx: number) =>
  galleryActiveIdx.value[blockIdx] || 0;
const setGalleryIdx = (blockIdx: number, imgIdx: number) => {
  galleryActiveIdx.value[blockIdx] = imgIdx;
};
const stepGallery = (blockIdx: number, dir: number, total: number) => {
  const current = getGalleryIdx(blockIdx);
  galleryActiveIdx.value[blockIdx] = (current + dir + total) % total;
};
const toggleGalleryMode = (blockIdx: number) => {
  galleryMode.value[blockIdx] =
    galleryMode.value[blockIdx] === "grid" ? "slider" : "grid";
};

// Состояние полноэкранного Lightbox
interface PhotoItem {
  src: string;
  caption: string;
  code: string;
}
const lightboxList = ref<PhotoItem[]>([]);
const lightboxIndex = ref<number>(0);

const openLightbox = (images: PhotoItem[], startIndex: number) => {
  lightboxList.value = images;
  lightboxIndex.value = startIndex;
};
const closeLightbox = () => {
  lightboxList.value = [];
};
const stepLightbox = (dir: number) => {
  const total = lightboxList.value.length;
  if (total > 0) {
    lightboxIndex.value = (lightboxIndex.value + dir + total) % total;
  }
};

const resolvePhotoUrl = (rawPath: string): string => {
  const clean = rawPath.trim();
  if (!clean) return "";
  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }
  const normalized = clean.replace(/^\/+/, "");
  return `${import.meta.env.BASE_URL}${normalized}`;
};

const toggleSpoiler = (idx: number) => {
  openSpoilers.value[idx] = !openSpoilers.value[idx];
};

const article = computed<ArticleData>(() => {
  const key = `${route.params.brandId}/${route.params.categoryId}`;
  if (articlesDatabase[key]) {
    return articlesDatabase[key];
  }

  const brand = catalogData.find((b) => b.id === route.params.brandId);
  const cat = brand?.categories.find((c) => c.id === route.params.categoryId);

  return {
    id: key,
    code: cat?.code || "DOC // DRAFT",
    updatedAt: "REV 1.0",
    readingTime: "03 МИН",
    title: `${cat?.title || "МОДУЛЬ"} — ${brand?.title || ""}`,
    lead: cat?.shortDesc || "Технический разбор узла и компонентной базы.",
    content: `
# 01. КОНСТРУКЦИЯ И КОМПОНЕНТЫ
^[Р]аздел находится в процессе наполнения. Чтобы добавить сюда свой текст, фото и схемы, открой файл {{src/data/articles.ts}} и добавь ключ ==${key}==.
`,
  };
});

interface ParsedBlock {
  type:
    | "h2"
    | "h3"
    | "p"
    | "quote"
    | "info"
    | "warn"
    | "spec"
    | "list"
    | "spoiler"
    | "img"
    | "gallery";
  id?: string;
  text?: string;
  items?: string[];
  specs?: { key: string; val: string }[];
  title?: string;
  lines?: string[];
  src?: string;
  caption?: string;
  code?: string;
  images?: PhotoItem[];
}

const parsedBlocks = computed<ParsedBlock[]>(() => {
  const rawLines = article.value.content.trim().split("\n");
  const blocks: ParsedBlock[] = [];
  let i = 0;
  let sectionCounter = 1;

  while (i < rawLines.length) {
    const line = rawLines[i].trim();

    if (!line) {
      i++;
      continue;
    }

    if (line.startsWith("# ")) {
      const text = line.slice(2).trim();
      blocks.push({ type: "h2", id: `sect-${sectionCounter++}`, text });
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      const text = line.slice(3).trim();
      blocks.push({ type: "h3", id: `sect-${sectionCounter++}`, text });
      i++;
      continue;
    }

    if (line.startsWith("!QUOTE:")) {
      blocks.push({ type: "quote", text: line.slice(7).trim() });
      i++;
      continue;
    }

    if (line.startsWith("!INFO:")) {
      blocks.push({ type: "info", text: line.slice(6).trim() });
      i++;
      continue;
    }

    if (line.startsWith("!WARN:")) {
      blocks.push({ type: "warn", text: line.slice(6).trim() });
      i++;
      continue;
    }

    if (line.startsWith("!SPEC:")) {
      const rawSpecs = line.slice(6).split("|");
      const specs = rawSpecs.map((s) => {
        const [k, v] = s.split("=");
        return { key: (k || "").trim(), val: (v || "").trim() };
      });
      blocks.push({ type: "spec", specs });
      i++;
      continue;
    }

    if (line.startsWith("!IMG:")) {
      const parts = line
        .slice(5)
        .split("|")
        .map((p) => p.trim());
      blocks.push({
        type: "img",
        src: resolvePhotoUrl(parts[0] || ""),
        caption: parts[1] || "",
        code: parts[2] || "FIG_01",
      });
      i++;
      continue;
    }

    if (line.startsWith("!GALLERY:")) {
      const title = line.slice(9).trim() || "ФОТО-АРХИВ УЗЛА";
      const images: PhotoItem[] = [];
      const contextLines: string[] = [];
      let readingContext = false;
      i++;

      while (i < rawLines.length && !rawLines[i].trim().startsWith("!END")) {
        const gLine = rawLines[i].trim();
        if (!gLine) {
          i++;
          continue;
        }
        if (gLine === "---") {
          readingContext = true;
          i++;
          continue;
        }
        if (!readingContext) {
          const parts = gLine.split("|").map((p) => p.trim());
          const num = images.length + 1;
          images.push({
            src: resolvePhotoUrl(parts[0] || ""),
            caption: parts[1] || `Кадр 0${num}`,
            code: parts[2] || `FIG_0${num}`,
          });
        } else {
          contextLines.push(gLine.replace(/^- /, "-> "));
        }
        i++;
      }

      blocks.push({ type: "gallery", title, images, lines: contextLines });
      i++;
      continue;
    }

    if (line.startsWith("+++")) {
      const title = line.slice(3).trim() || "ДОПОЛНИТЕЛЬНЫЕ ДАННЫЕ";
      const lines: string[] = [];
      i++;
      while (i < rawLines.length && !rawLines[i].trim().startsWith("+++")) {
        if (rawLines[i].trim()) {
          lines.push(rawLines[i].trim());
        }
        i++;
      }
      blocks.push({ type: "spoiler", title, lines });
      i++;
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < rawLines.length && rawLines[i].trim().startsWith("- ")) {
        items.push(rawLines[i].trim().slice(2));
        i++;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    blocks.push({ type: "p", text: line });
    i++;
  }

  return blocks;
});

const formatInline = (text = ""): string => {
  let html = text;

  html = html.replace(
    /^\^\[([А-Яа-яA-Za-z0-9])\]/,
    '<span class="float-left mr-3 mb-1 px-2.5 py-1 bg-[var(--accent-lime)] text-[var(--accent-text)] font-black text-3xl sm:text-4xl leading-none font-mono-tech select-none">$1</span>',
  );
  html = html.replace(
    /==(.+?)==/g,
    '<mark class="px-1.5 py-0.5 bg-[var(--accent-lime)] text-[var(--accent-text)] font-bold">$1</mark>',
  );
  html = html.replace(
    /!!(.+?)!!/g,
    '<span class="text-[var(--accent-orange)] font-bold uppercase tracking-wide">$1</span>',
  );
  html = html.replace(
    /\{\{(.+?)\}\}/g,
    '<code class="px-1.5 py-0.5 bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--accent-lime)] font-mono-tech text-xs">[$1]</code>',
  );
  html = html.replace(
    /~~(.+?)~~/g,
    '<span class="font-black uppercase tracking-tight" style="text-shadow: -1.5px 0 #ff3300, 1.5px 0 #00e5ff;">$1</span>',
  );
  html = html.replace(
    /__(.+?)__/g,
    '<span class="font-black uppercase underline decoration-[var(--accent-lime)] decoration-2 underline-offset-4">$1</span>',
  );
  html = html.replace(
    /\*\*(.+?)\*\*/g,
    '<strong class="font-bold text-[var(--text-main)]">$1</strong>',
  );
  html = html.replace(
    /\(\((.+?)\)\)/g,
    '<code class="font-mono-tech text-xs px-1.5 py-0.5 bg-[var(--bg-surface)] text-[var(--accent-orange)] font-bold">$1</code>',
  );
  html = html.replace(
    /\/\/(.+?)\/\//g,
    '<span class="font-mono-tech text-xs text-[var(--text-muted)] italic">// $1</span>',
  );

  return html;
};

const tocHeadings = computed(() => {
  return parsedBlocks.value
    .filter((b) => b.type === "h2" || b.type === "h3")
    .map((b) => ({
      id: b.id!,
      text: b.text!,
      level: b.type === "h2" ? 2 : 3,
    }));
});

const activeHeadingText = computed(() => {
  const found = tocHeadings.value.find((h) => h.id === activeHeadingId.value);
  return found ? found.text : tocHeadings.value[0]?.text || "НАЧАЛО ДОКУМЕНТА";
});

// ФУНКЦИЯ АВТО-ЦЕНТРОВКИ АКТИВНОГО РАЗДЕЛА ВНУТРИ СПИСКА МЕНЮ
const centerActiveTocItem = (force = false) => {
  // На ПК центрируем, если мышка сейчас не крутит само меню вручную
  if (tocNavRef.value && (!isHoveringToc.value || force)) {
    const navEl = tocNavRef.value;
    const activeEl = navEl.querySelector<HTMLElement>(
      `[data-toc-id="${activeHeadingId.value}"]`,
    );
    if (activeEl) {
      const targetScrollTop =
        activeEl.offsetTop - navEl.clientHeight / 2 + activeEl.clientHeight / 2;
      navEl.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: "smooth",
      });
    }
  }

  // На мобилке центрируем список при открытии меню
  if (mobileTocNavRef.value) {
    const mNavEl = mobileTocNavRef.value;
    const mActiveEl = mNavEl.querySelector<HTMLElement>(
      `[data-mobile-toc-id="${activeHeadingId.value}"]`,
    );
    if (mActiveEl) {
      const targetScrollTop =
        mActiveEl.offsetTop -
        mNavEl.clientHeight / 2 +
        mActiveEl.clientHeight / 2;
      mNavEl.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: "smooth",
      });
    }
  }
};

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    activeHeadingId.value = id;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    centerActiveTocItem(true);
  }
};

// Следим за положением чтения на странице
const handleScroll = () => {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight > 0) {
    scrollProgress.value = Math.min(
      100,
      Math.max(0, Math.round((window.scrollY / docHeight) * 100)),
    );
  }

  // Если докрутили почти до самого низа страницы — подсвечиваем последний раздел
  if (
    docHeight > 0 &&
    window.scrollY >= docHeight - 30 &&
    tocHeadings.value.length > 0
  ) {
    activeHeadingId.value = tocHeadings.value[tocHeadings.value.length - 1].id;
    return;
  }

  const triggerLine = window.innerHeight * 0.28;
  for (const h of tocHeadings.value) {
    const el = document.getElementById(h.id);
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top <= triggerLine) {
        activeHeadingId.value = h.id;
      }
    }
  }
};

// Как только сменилась активная глава при скролле статьи — центрируем её в меню справа!
watch(activeHeadingId, () => {
  centerActiveTocItem();
});

// При открытии мобильного меню тоже сразу центрируем активный пункт
watch(mobileTocOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick();
    centerActiveTocItem(true);
  }
});

onMounted(() => {
  if (tocHeadings.value.length > 0) {
    activeHeadingId.value = tocHeadings.value[0].id;
  }
  window.addEventListener("scroll", handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

watch(
  () => route.fullPath,
  () => {
    openSpoilers.value = {};
    mobileTocOpen.value = false;
    galleryActiveIdx.value = {};
  },
);
</script>

<style scoped>
/* Тонкий фирменный скроллбар для меню навигации в стиле Marathon */
.toc-scrollbar::-webkit-scrollbar {
  width: 3px;
}
.toc-scrollbar::-webkit-scrollbar-track {
  background: var(--bg-base);
}
.toc-scrollbar::-webkit-scrollbar-thumb {
  background: var(--border-color);
}
.toc-scrollbar:hover::-webkit-scrollbar-thumb {
  background: var(--accent-lime);
}
</style>
