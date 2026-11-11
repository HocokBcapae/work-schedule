<template>
  <div
    class="flex-1 flex flex-col justify-between w-full relative overflow-hidden"
  >
    <!-- 1. ФОНОВАЯ АНИМАЦИЯ MARATHON 2026 (На весь экран, темно-фиолетовый неон + белый дизеринг) -->
    <canvas
      ref="bgCanvas"
      class="pointer-events-none fixed inset-0 w-full h-full z-0"
    ></canvas>

    <!-- 2. ОБРАТНАЯ ВИНЬЕТКА (Затемняет центр под текстом для идеальной читаемости, открывая анимацию по краям) -->
    <div class="pointer-events-none fixed inset-0 z-0 inverse-vignette"></div>

    <!-- 3. ОСНОВНОЙ КОНТЕНТ ГЛАВНОЙ СТРАНИЦЫ (Поверх фона и обратной виньетки) -->
    <div
      class="relative z-10 flex-1 flex flex-col justify-between max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-12 md:py-16"
    >
      <!-- Верхняя тех-строка -->
      <div
        class="font-mono-tech text-[10px] sm:text-xs text-[var(--text-muted)] flex justify-between items-center"
      >
        <span>+ SECT_00 // INIT</span>
        <span class="hidden xs:inline">[ SELECT ARCHITECTURE ]</span>
        <span>+</span>
      </div>

      <!-- Центральный блок: Название проекта (стоит ровно в защищенной зоне обратной виньетки) -->
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
            class="group relative bg-[var(--bg-surface)]/90 backdrop-blur-xs border border-[var(--border-color)] p-5 sm:p-6 transition-all duration-75 hover:bg-[var(--accent-lime)] hover:border-[var(--accent-lime)] active:bg-[var(--accent-lime)] active:scale-[0.99] clip-corner flex flex-col justify-between min-h-[150px] sm:min-h-[190px]"
          >
            <!-- Полоска-индикатор для мобилок -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { catalogData } from "../data/catalog";

const bgCanvas = ref<HTMLCanvasElement | null>(null);
let animFrameId = 0;
let lastFrameTime = 0;

onMounted(() => {
  const canvas = bgCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = 0;
  let height = 0;

  const handleResize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  };

  handleResize();
  window.addEventListener("resize", handleResize);

  let time = 0;

  // Бесконечная анимация в стиле Marathon 2026 (Dither / Cellular Wave: глубокий неон-фиолет + чистый белый)
  const render = (timestamp: number) => {
    animFrameId = requestAnimationFrame(render);

    // Ограничиваем до ~20 кадров/сек для фирменного эффекта "шаговой" анимации Мьельго / Marathon
    if (timestamp - lastFrameTime < 50) return;
    lastFrameTime = timestamp;

    time += 0.06;
    ctx.clearRect(0, 0, width, height);

    const cellSize = 22; // Шаг сетки матрицы
    const cols = Math.ceil(width / cellSize);
    const rows = Math.ceil(height / cellSize);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cellSize + cellSize / 2;
        const y = r * cellSize + cellSize / 2;

        // Генерация органической волны (как клеточный автомат / топография в загрузке Marathon 2026)
        const nx = c * 0.11;
        const ny = r * 0.11;
        const wave1 =
          Math.sin(nx * 1.4 + time) * Math.cos(ny * 1.2 - time * 0.8);
        const wave2 = Math.sin((nx + ny) * 0.9 - time * 1.1);
        const val = (wave1 + wave2) * 0.5; // значение от -1 до 1

        // 1. Фоновые глубокие темно-фиолетовые точки
        if (val > -0.2 && val <= 0.35) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = "rgba(76, 29, 149, 0.35)"; // глубокий темный фиолет (#4c1d95)
          ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
        }
        // 2. Темно-фиолетовый неон со свечением (основная масса волны)
        else if (val > 0.35 && val <= 0.72) {
          ctx.shadowBlur = 12;
          ctx.shadowColor = "rgba(139, 92, 246, 0.75)"; // неоновый ореол
          ctx.fillStyle = "#6d28d9"; // насыщенный темно-фиолетовый (#6d28d9)
          const size = val > 0.55 ? 6 : 4;
          ctx.fillRect(x - size / 2, y - size / 2, size, size);
        }
        // 3. Пики волны — чисто белые (#FFFFFF) контрастные элементы и микро-крестики со свечением
        else if (val > 0.72) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = "#a855f7";
          ctx.fillStyle = "#ffffff";

          if (val > 0.84) {
            // Белый технический крестик +
            ctx.fillRect(x - 4, y - 1, 8, 2);
            ctx.fillRect(x - 1, y - 4, 2, 8);
          } else {
            // Белый неоновый квадратик
            ctx.fillRect(x - 2.5, y - 2.5, 5, 5);
          }
        }
      }
    }
  };

  animFrameId = requestAnimationFrame(render);

  onUnmounted(() => {
    cancelAnimationFrame(animFrameId);
    window.removeEventListener("resize", handleResize);
  });
});
</script>

<style scoped>
/* 
  ОБРАТНАЯ ВИНЬЕТКА:
  В центре экрана (где стоит заголовок и текст) — плотный темный щит в цвет фона (--bg-base),
  а к краям экрана он становится прозрачным, открывая фиолетово-белую неоновую анимацию.
*/
.inverse-vignette {
  background: radial-gradient(
    ellipse 65% 60% at 42% 48%,
    var(--bg-base) 18%,
    color-mix(in srgb, var(--bg-base) 82%, transparent) 58%,
    color-mix(in srgb, var(--bg-base) 25%, transparent) 100%
  );
}
</style>
