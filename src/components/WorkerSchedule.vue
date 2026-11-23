<script setup>
import { ref, computed } from "vue";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { WORKERS, shifts, toggleWish, hasDayOffWish } from "../state/schedule";
import { calculateWorkerPayroll } from "../utils/payroll";

dayjs.locale("ru");

const props = defineProps({
  user: { type: Object, required: true },
});

const activeTab = ref("my");
const currentMonth = ref(dayjs().startOf("month"));
const wishMonth = ref(dayjs().startOf("month"));

function prevMonth() {
  currentMonth.value = currentMonth.value.subtract(1, "month");
}
function nextMonthBtn() {
  currentMonth.value = currentMonth.value.add(1, "month");
}
function prevWishMonth() {
  wishMonth.value = wishMonth.value.subtract(1, "month");
}
function nextWishMonth() {
  wishMonth.value = wishMonth.value.add(1, "month");
}

const fullWorkerProfile = computed(() => {
  const found = WORKERS.value.find((w) => w.id === props.user?.id);
  return found ? { ...props.user, ...found } : props.user;
});

const myCurrentMonthShifts = computed(() => {
  const monthPrefix = currentMonth.value.format("YYYY-MM");
  return shifts.value.filter(
    (s) => s.userId === props.user.id && s.date.startsWith(monthPrefix),
  );
});

const payoutFirstHalf = computed(() =>
  calculateWorkerPayroll(
    fullWorkerProfile.value,
    myCurrentMonthShifts.value,
    currentMonth.value,
    "1-15",
  ),
);
const payoutSecondHalf = computed(() =>
  calculateWorkerPayroll(
    fullWorkerProfile.value,
    myCurrentMonthShifts.value,
    currentMonth.value,
    "16-end",
  ),
);
const payoutTotal = computed(() =>
  calculateWorkerPayroll(
    fullWorkerProfile.value,
    myCurrentMonthShifts.value,
    currentMonth.value,
    "all",
  ),
);

const weekdaysHeader = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function formatCompactTime(timeStr) {
  if (!timeStr) return "10–20";
  return timeStr.replace(/:00/g, "");
}

const calendarGridDays = computed(() => {
  const startOfMonth = currentMonth.value.clone().startOf("month");
  const daysCount = currentMonth.value.daysInMonth();
  let firstDayIndex = startOfMonth.day() - 1;
  if (firstDayIndex === -1) firstDayIndex = 6;

  const days = [];
  for (let i = 0; i < firstDayIndex; i++)
    days.push({ isPadding: true, key: `pad-${i}` });

  for (let i = 1; i <= daysCount; i++) {
    const d = currentMonth.value.date(i);
    const dateStr = d.format("YYYY-MM-DD");
    const shift = shifts.value.find(
      (s) => s.userId === props.user.id && s.date === dateStr,
    );
    const isWish = hasDayOffWish(props.user.id, dateStr);

    days.push({
      isPadding: false,
      key: dateStr,
      dateStr,
      dayNumber: i,
      isWeekend: d.day() === 0 || d.day() === 6,
      isToday: d.isSame(dayjs(), "day"),
      isWish,
      shift: shift
        ? {
            id: shift.id,
            time: shift.time || "10:00–20:00",
            hours: Number(shift.hours) || 10,
            shiftType: shift.shiftType || shift.shift_type || "main",
          }
        : null,
    });
  }
  return days;
});

const totalDaysOff = computed(() =>
  Math.max(
    0,
    currentMonth.value.daysInMonth() - myCurrentMonthShifts.value.length,
  ),
);

const daysInCurrentMonth = computed(() => {
  const count = currentMonth.value.daysInMonth();
  const days = [];
  for (let i = 1; i <= count; i++) {
    const d = currentMonth.value.date(i);
    days.push({
      dateStr: d.format("YYYY-MM-DD"),
      dayNumber: i,
      weekdayShort: d.format("dd"),
      weekdayLong: d.format("dddd"),
      isWeekend: d.day() === 0 || d.day() === 6,
    });
  }
  return days;
});

const daysInWishMonth = computed(() => {
  const count = wishMonth.value.daysInMonth();
  const days = [];
  for (let i = 1; i <= count; i++) {
    const d = wishMonth.value.date(i);
    const dateStr = d.format("YYYY-MM-DD");
    const shift = shifts.value.find(
      (s) => s.userId === props.user.id && s.date === dateStr,
    );
    const isWish = hasDayOffWish(props.user.id, dateStr);

    days.push({
      dateStr,
      dayNumber: i,
      weekdayShort: d.format("dd"),
      isWeekend: d.day() === 0 || d.day() === 6,
      isWish,
      shift: shift
        ? { hours: shift.hours || 10, time: shift.time || "10:00–20:00" }
        : null,
    });
  }
  return days;
});

function isUserWorkingOnDate(dateStr) {
  return shifts.value.some(
    (s) => s.userId === props.user.id && s.date === dateStr,
  );
}

function getWorkersForDate(dateStr) {
  const dayShifts = shifts.value.filter((s) => s.date === dateStr);
  return dayShifts.map((s) => {
    const w = WORKERS.value.find((worker) => worker.id === s.userId);
    return {
      ...s,
      workerName: w ? w.name : "Сотрудник",
      color: w ? w.color || "bg-zinc-700" : "bg-zinc-700",
    };
  });
}
</script>

<template>
  <div class="space-y-4 max-w-5xl mx-auto">
    <div
      class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-3 sm:p-4"
    >
      <div class="flex items-center justify-between sm:justify-start gap-2.5">
        <button
          @click="prevMonth"
          class="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm transition cursor-pointer"
        >
          ←
        </button>
        <h2
          class="text-base font-bold capitalize text-zinc-100 min-w-[140px] text-center"
        >
          {{ currentMonth.format("MMMM YYYY") }}
        </h2>
        <button
          @click="nextMonthBtn"
          class="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm transition cursor-pointer"
        >
          →
        </button>
      </div>

      <div
        class="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs overflow-x-auto w-full sm:w-auto"
      >
        <button
          @click="activeTab = 'my'"
          class="flex-1 sm:flex-initial px-3 py-1.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap"
          :class="
            activeTab === 'my'
              ? 'bg-zinc-800 text-white shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          "
        >
          📅 Мой график
        </button>
        <button
          @click="activeTab = 'payroll'"
          class="flex-1 sm:flex-initial px-3 py-1.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap"
          :class="
            activeTab === 'payroll'
              ? 'bg-emerald-600 text-white shadow-xs font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          "
        >
          💰 Расчет ЗП
        </button>
        <button
          @click="activeTab = 'all'"
          class="flex-1 sm:flex-initial px-3 py-1.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap"
          :class="
            activeTab === 'all'
              ? 'bg-zinc-800 text-white shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          "
        >
          👥 Общее
        </button>
        <button
          @click="activeTab = 'wishes'"
          class="flex-1 sm:flex-initial px-3 py-1.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap"
          :class="
            activeTab === 'wishes'
              ? 'bg-zinc-800 text-white shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          "
        >
          🏖 Выходные
        </button>
      </div>
    </div>

    <!-- ВКЛАДКА 1: МОЙ ГРАФИК -->
    <div
      v-if="activeTab === 'my'"
      class="bg-zinc-900 border border-zinc-800 rounded-xl p-3 sm:p-5 space-y-4"
    >
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-zinc-800/80 pb-3"
      >
        <div>
          <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <span>🗓</span> Календарь моих смен на
            {{ currentMonth.format("MMMM") }}
          </h3>
          <div class="text-xs text-zinc-400 mt-0.5">
            Рабочих смен:
            <b class="text-zinc-200">{{ myCurrentMonthShifts.length }}</b> ·
            Выходных: <b class="text-emerald-400">{{ totalDaysOff }} дн</b>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2 text-[11px]">
          <span
            class="px-2 py-0.5 rounded bg-blue-600/25 border border-blue-500/40 text-blue-200 font-medium"
            >Основной</span
          >
          <span
            class="px-2 py-0.5 rounded bg-orange-600/25 border border-orange-500/40 text-orange-200 font-medium"
            >Копер</span
          >
          <span
            class="px-2 py-0.5 rounded bg-red-950/60 border border-red-500/60 text-red-200 font-medium"
            >⚠️ Просил вых</span
          >
          <span
            class="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400"
            >Выходной</span
          >
        </div>
      </div>

      <div>
        <div class="grid grid-cols-7 gap-1 sm:gap-2 mb-1.5 text-center">
          <div
            v-for="(dayName, idx) in weekdaysHeader"
            :key="dayName"
            class="text-[11px] font-bold uppercase py-1"
            :class="idx >= 5 ? 'text-amber-400/90' : 'text-zinc-400'"
          >
            {{ dayName }}
          </div>
        </div>

        <div class="grid grid-cols-7 gap-1 sm:gap-2">
          <div
            v-for="item in calendarGridDays"
            :key="item.key"
            class="min-h-[58px] sm:min-h-[84px] rounded-lg sm:rounded-xl p-1 sm:p-2 flex flex-col justify-between transition border relative"
            :class="[
              item.isPadding
                ? 'opacity-0 pointer-events-none border-transparent'
                : item.shift && item.isWish
                  ? 'bg-red-950/40 border-2 border-red-500/80 shadow-xs'
                  : item.shift
                    ? item.shift.shiftType === 'koper'
                      ? 'bg-orange-950/25 border-orange-500/50'
                      : 'bg-blue-950/25 border-blue-500/50'
                    : item.isWish
                      ? 'bg-red-950/30 border-red-500/50 text-red-300'
                      : 'bg-zinc-950/60 border-zinc-800/70',
              item.isToday ? 'ring-1 ring-emerald-400/90 shadow-xs' : '',
            ]"
          >
            <div
              v-if="!item.isPadding"
              class="flex items-center justify-between"
            >
              <span
                class="text-xs sm:text-sm font-bold"
                :class="
                  item.isWeekend && !item.shift
                    ? 'text-amber-400/90'
                    : 'text-zinc-200'
                "
                >{{ item.dayNumber }}</span
              >
              <span
                v-if="item.isToday"
                class="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"
                title="Сегодня"
              ></span>
            </div>

            <div v-if="!item.isPadding" class="mt-1">
              <div
                v-if="item.shift && item.isWish"
                class="rounded sm:rounded-md px-0.5 sm:px-1 py-0.5 text-center font-bold bg-red-900/80 text-red-100 border border-red-500 leading-tight"
              >
                <div class="sm:hidden text-[9px]">
                  ⚠️ {{ formatCompactTime(item.shift.time) }}
                </div>
                <div class="hidden sm:block text-[10px]">
                  ⚠️ {{ item.shift.time }} ({{ item.shift.hours }}ч)
                </div>
                <div class="text-[8px] opacity-90">Просил вых</div>
              </div>

              <div
                v-else-if="item.shift"
                class="rounded sm:rounded-md px-0.5 sm:px-1 py-0.5 sm:py-1 text-center font-bold leading-tight"
                :class="
                  item.shift.shiftType === 'koper'
                    ? 'bg-orange-600/30 text-orange-200 border border-orange-500/40'
                    : 'bg-blue-600/30 text-blue-200 border border-blue-500/40'
                "
              >
                <div class="sm:hidden text-[9px] tracking-tighter">
                  <div>{{ formatCompactTime(item.shift.time) }}</div>
                  <div class="opacity-80">{{ item.shift.hours }}ч</div>
                </div>
                <div class="hidden sm:block text-[10px]">
                  <div>{{ item.shift.time }}</div>
                  <div class="opacity-80 font-medium">
                    {{ item.shift.shiftType === "koper" ? "Копер" : "Осн" }} ·
                    {{ item.shift.hours }}ч
                  </div>
                </div>
              </div>

              <div
                v-else-if="item.isWish"
                class="text-center text-[9px] sm:text-[11px] font-bold py-0.5 text-red-400"
              >
                Желаемый
              </div>
              <div
                v-else
                class="text-center text-[9px] sm:text-[11px] font-medium py-0.5 text-zinc-600"
              >
                <span class="sm:hidden">Вых</span
                ><span class="hidden sm:inline">Выходной</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ВКЛАДКА 2: РАСЧЕТ ЗАРПЛАТЫ -->
    <div v-if="activeTab === 'payroll'" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between">
              <span
                class="text-xs font-medium text-zinc-400 uppercase tracking-wider"
                >Всего за месяц</span
              >
              <span
                class="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded font-bold"
                >Итого</span
              >
            </div>
            <div class="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">
              {{ payoutTotal.totalEarned.toLocaleString("ru-RU") }} ₽
            </div>
          </div>
          <div
            class="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs"
          >
            <span class="text-zinc-400">Выполнение плана:</span>
            <span
              class="font-bold"
              :class="
                payoutTotal.percentOfNorm >= 100
                  ? 'text-emerald-400'
                  : 'text-amber-400'
              "
              >{{ payoutTotal.percentOfNorm }}% от нормы</span
            >
          </div>
        </div>

        <div
          class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between"
        >
          <div>
            <span
              class="text-xs font-medium text-zinc-400 uppercase tracking-wider"
              >Часы за месяц</span
            >
            <div
              class="text-xl sm:text-2xl font-bold text-zinc-100 mt-1 flex items-baseline gap-1"
            >
              <span>{{ payoutTotal.totalHours }}</span>
              <span class="text-sm font-normal text-zinc-400"
                >из {{ payoutTotal.monthNormHours }} ч</span
              >
              <span
                v-if="payoutTotal.isFiveTwo"
                class="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded ml-1"
                >5/2</span
              >
            </div>
            <div
              class="w-full bg-zinc-950 h-2 rounded-full overflow-hidden mt-3 border border-zinc-800"
            >
              <div
                class="h-full transition-all duration-500 rounded-full"
                :class="
                  payoutTotal.percentOfNorm >= 100
                    ? 'bg-emerald-500'
                    : 'bg-blue-500'
                "
                :style="{
                  width: Math.min(payoutTotal.percentOfNorm, 100) + '%',
                }"
              ></div>
            </div>
          </div>
          <div
            class="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs"
          >
            <span class="text-zinc-400">Баланс нормы:</span>
            <span
              v-if="payoutTotal.hoursBalance > 0"
              class="text-emerald-400 font-semibold"
              >+{{ payoutTotal.hoursBalance }} ч (переработка)</span
            >
            <span
              v-else-if="payoutTotal.hoursBalance < 0"
              class="text-amber-400 font-semibold"
              >{{ payoutTotal.hoursBalance }} ч (недоработка)</span
            >
            <span v-else class="text-zinc-300 font-semibold"
              >Ровно в норме</span
            >
          </div>
        </div>

        <div
          class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between sm:col-span-2 lg:col-span-1"
        >
          <div>
            <span
              class="text-xs font-medium text-zinc-400 uppercase tracking-wider"
              >Всего смен</span
            >
            <div class="text-2xl font-bold text-zinc-100 mt-1">
              {{ payoutTotal.shiftsCount }}
            </div>
          </div>
          <div
            class="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center gap-2"
          >
            <div
              class="flex-1 bg-blue-950/40 border border-blue-500/30 rounded-lg p-2 text-center"
            >
              <div class="text-[10px] text-blue-300 font-medium">Основной</div>
              <div class="text-sm font-bold text-blue-100 mt-0.5">
                {{ payoutTotal.mainShiftsCount }}
              </div>
            </div>
            <div
              class="flex-1 bg-orange-950/40 border border-orange-500/30 rounded-lg p-2 text-center"
            >
              <div class="text-[10px] text-orange-300 font-medium">Копер</div>
              <div class="text-sm font-bold text-orange-100 mt-0.5">
                {{ payoutTotal.koperShiftsCount }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div class="flex items-center justify-between mb-3">
          <h3
            class="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5"
          >
            <span>📅</span> График выплат в этом месяце
          </h3>
          <span class="text-[11px] text-zinc-500">2 раза в месяц</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            class="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between"
          >
            <div class="flex items-center justify-between">
              <span
                class="text-xs font-bold text-zinc-200 flex items-center gap-2"
                ><span class="w-2.5 h-2.5 rounded-full bg-blue-400"></span
                >Получу 15 числа (Аванс)</span
              >
              <span
                class="text-[10px] text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/50"
                >1–15 число</span
              >
            </div>
            <div class="text-2xl sm:text-3xl font-black text-emerald-400 mt-3">
              {{ payoutFirstHalf.totalEarned.toLocaleString("ru-RU") }} ₽
            </div>
            <div
              class="mt-3 pt-2.5 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-400"
            >
              <span
                >Отработано:
                <b class="text-zinc-200"
                  >{{ payoutFirstHalf.totalHours }} ч</b
                ></span
              >
              <span
                >Смен:
                <b class="text-zinc-200">{{
                  payoutFirstHalf.shiftsCount
                }}</b></span
              >
            </div>
          </div>
          <div
            class="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between"
          >
            <div class="flex items-center justify-between">
              <span
                class="text-xs font-bold text-zinc-200 flex items-center gap-2"
                ><span class="w-2.5 h-2.5 rounded-full bg-purple-400"></span
                >Получу в конце месяца</span
              >
              <span
                class="text-[10px] text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/50"
                >16–конец месяца</span
              >
            </div>
            <div class="text-2xl sm:text-3xl font-black text-emerald-400 mt-3">
              {{ payoutSecondHalf.totalEarned.toLocaleString("ru-RU") }} ₽
            </div>
            <div
              class="mt-3 pt-2.5 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-400"
            >
              <span
                >Отработано:
                <b class="text-zinc-200"
                  >{{ payoutSecondHalf.totalHours }} ч</b
                ></span
              >
              <span
                >Смен:
                <b class="text-zinc-200">{{
                  payoutSecondHalf.shiftsCount
                }}</b></span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div class="flex items-center justify-between mb-2">
          <h4
            class="text-xs font-semibold text-zinc-300 flex items-center gap-1.5"
          >
            <span>🔍</span> Формула начисления за месяц
          </h4>
          <span class="text-[11px] text-zinc-500 hidden sm:inline">{{
            payoutTotal.formulaExplanation
          }}</span>
        </div>
        <div
          class="bg-zinc-950 border border-zinc-800/80 rounded-lg p-3 font-mono text-xs sm:text-sm text-emerald-300 break-all font-bold"
        >
          {{ payoutTotal.formulaStr }}
        </div>
      </div>
    </div>

    <!-- ВКЛАДКА 3: ОБЩЕЕ РАСПИСАНИЕ -->
    <div
      v-if="activeTab === 'all'"
      class="bg-zinc-900 border border-zinc-800 rounded-xl p-3 sm:p-4"
    >
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-bold text-zinc-200">Смены по дням месяца</h3>
        <span class="text-xs text-zinc-500">Ваши смены выделены зеленым</span>
      </div>

      <div class="space-y-2">
        <div
          v-for="day in daysInCurrentMonth"
          :key="day.dateStr"
          class="border rounded-xl p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition"
          :class="[
            isUserWorkingOnDate(day.dateStr)
              ? 'bg-zinc-900/90 border-emerald-500/50 border-l-4 border-l-emerald-500 shadow-xs'
              : day.isWeekend
                ? 'bg-zinc-950/60 border-zinc-800/80'
                : 'bg-zinc-900/50 border-zinc-800/60',
          ]"
        >
          <div class="flex items-center gap-2.5 min-w-[140px]">
            <span
              class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
              :class="
                isUserWorkingOnDate(day.dateStr)
                  ? 'bg-emerald-500/20 text-emerald-300 font-black'
                  : day.isWeekend
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-zinc-800 text-zinc-300'
              "
              >{{ day.dayNumber }}</span
            >
            <div>
              <div
                class="text-xs font-semibold capitalize"
                :class="
                  isUserWorkingOnDate(day.dateStr)
                    ? 'text-emerald-200'
                    : 'text-zinc-200'
                "
              >
                {{ day.weekdayLong }}
              </div>
              <div class="text-[10px] text-zinc-500">{{ day.dateStr }}</div>
            </div>
          </div>

          <div
            class="flex flex-wrap items-center gap-1.5 flex-1 sm:justify-end"
          >
            <div
              v-if="getWorkersForDate(day.dateStr).length === 0"
              class="text-zinc-600 text-xs italic py-1"
            >
              Нет смен
            </div>
            <div
              v-for="sh in getWorkersForDate(day.dateStr)"
              :key="sh.id"
              class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition"
              :class="
                sh.userId === props.user.id
                  ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-100 font-bold shadow-xs ring-1 ring-emerald-500/40'
                  : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300 font-normal'
              "
            >
              <span
                v-if="sh.userId === props.user.id"
                class="w-2 h-2 rounded-full bg-emerald-400 shrink-0"
              ></span>
              <span
                >{{ sh.workerName
                }}<span
                  v-if="sh.userId === props.user.id"
                  class="text-emerald-400 font-black ml-0.5"
                  >(Вы)</span
                ></span
              >
              <span
                class="text-[10px] px-1.5 py-0.5 rounded font-medium ml-0.5"
                :class="
                  sh.userId === props.user.id
                    ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-700/50'
                    : (sh.shiftType || sh.shift_type) === 'koper'
                      ? 'bg-zinc-900 text-orange-300/90 border border-zinc-700'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-700'
                "
              >
                {{
                  (sh.shiftType || sh.shift_type) === "koper"
                    ? "Копер"
                    : "Основной"
                }}
                · {{ sh.time || "10:00–20:00" }} ({{ sh.hours || 10 }}ч)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ВКЛАДКА 4: ВЫХОДНЫЕ (ЛЮБОЙ МЕСЯЦ) -->
    <div
      v-if="activeTab === 'wishes'"
      class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4"
    >
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3"
      >
        <div>
          <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
            <span>🏖</span> Пожелания по выходным
          </h3>
          <p class="text-xs text-zinc-400 mt-0.5">
            Кликните на день, чтобы запросить выходной (красный цвет).
          </p>
        </div>

        <div class="flex items-center gap-2 self-start sm:self-auto">
          <button
            @click="prevWishMonth"
            class="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs transition cursor-pointer"
          >
            ←
          </button>
          <span
            class="text-xs font-bold text-emerald-400 capitalize min-w-[120px] text-center"
            >{{ wishMonth.format("MMMM YYYY") }}</span
          >
          <button
            @click="nextWishMonth"
            class="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs transition cursor-pointer"
          >
            →
          </button>
        </div>
      </div>

      <div class="grid grid-cols-4 sm:grid-cols-7 gap-2">
        <button
          v-for="d in daysInWishMonth"
          :key="d.dateStr"
          @click="toggleWish(props.user.id, d.dateStr)"
          class="p-2 sm:p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-between min-h-[64px] relative"
          :class="[
            d.isWish && d.shift
              ? 'bg-red-950/80 border-2 border-red-500 text-red-100 shadow-md ring-1 ring-red-500/50'
              : d.isWish
                ? 'bg-red-950/70 text-red-200 border-red-500/70 font-bold'
                : d.shift
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-200'
                  : d.isWeekend
                    ? 'bg-zinc-950 text-amber-400 border-zinc-800/80 hover:border-zinc-700'
                    : 'bg-zinc-950 text-zinc-300 border-zinc-800/80 hover:border-zinc-700',
          ]"
        >
          <div class="flex items-center justify-between w-full">
            <span class="text-xs font-bold">{{ d.dayNumber }}</span>
            <span class="text-[9px] uppercase opacity-75">{{
              d.weekdayShort
            }}</span>
          </div>

          <div class="w-full mt-1">
            <div
              v-if="d.isWish && d.shift"
              class="text-[9px] text-red-200 font-bold bg-red-900/60 rounded px-1 py-0.5 border border-red-500/40"
            >
              ⚠️ Смена {{ d.shift.hours }}ч
            </div>
            <div
              v-else-if="d.isWish"
              class="text-[10px] text-red-300 font-bold"
            >
              Хочу вых 🏖
            </div>
            <div
              v-else-if="d.shift"
              class="text-[9px] text-zinc-400 font-medium"
            >
              Смена {{ d.shift.hours }}ч
            </div>
            <div v-else class="text-[9px] text-zinc-600">Свободно</div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
