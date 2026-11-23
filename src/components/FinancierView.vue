<script setup>
import { ref, computed } from "vue";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { WORKERS, shifts } from "../state/schedule";
import { calculateWorkerPayroll, exportPayrollToExcel } from "../utils/payroll";

dayjs.locale("ru");

const currentMonth = ref(dayjs().startOf("month"));
const activeView = ref("payroll");
const selectedPeriod = ref("1-15");

function prevMonth() {
  currentMonth.value = currentMonth.value.subtract(1, "month");
}
function nextMonth() {
  currentMonth.value = currentMonth.value.add(1, "month");
}

const workersOnly = computed(() =>
  WORKERS.value.filter((w) => w.role !== "financier"),
);

const payrollList = computed(() => {
  const monthPrefix = currentMonth.value.format("YYYY-MM");
  return workersOnly.value.map((worker) => {
    const workerShifts = shifts.value.filter(
      (s) => s.userId === worker.id && s.date.startsWith(monthPrefix),
    );
    return calculateWorkerPayroll(
      worker,
      workerShifts,
      currentMonth.value,
      selectedPeriod.value,
    );
  });
});

const totalPayrollSum = computed(() =>
  payrollList.value.reduce((acc, i) => acc + i.totalEarned, 0),
);
const totalWorkedHours = computed(() =>
  payrollList.value.reduce((acc, i) => acc + i.totalHours, 0),
);
const totalShiftsCount = computed(() =>
  payrollList.value.reduce((acc, i) => acc + i.shiftsCount, 0),
);

function handleExportExcel() {
  const periodTitles = {
    "1-15": "1-15_Аванс",
    "16-end": "16-конец_Расчет",
    all: "Весь_месяц",
  };
  exportPayrollToExcel(
    payrollList.value,
    currentMonth.value.format("MMMM_YYYY"),
    periodTitles[selectedPeriod.value],
  );
}

const daysInMonth = computed(() => {
  const count = currentMonth.value.daysInMonth();
  const days = [];
  for (let i = 1; i <= count; i++) {
    const d = currentMonth.value.date(i);
    days.push({
      dateStr: d.format("YYYY-MM-DD"),
      dayNumber: i,
      weekdayShort: d.format("dd"),
      isWeekend: d.day() === 0 || d.day() === 6,
    });
  }
  return days;
});

function findShift(workerId, dateStr) {
  return shifts.value.find((s) => s.userId === workerId && s.date === dateStr);
}
</script>

<template>
  <div class="space-y-4 max-w-6xl mx-auto">
    <div
      class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-3 sm:p-4"
    >
      <div class="flex items-center justify-between sm:justify-start gap-2">
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
          @click="nextMonth"
          class="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm transition cursor-pointer"
        >
          →
        </button>
      </div>

      <div
        class="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs overflow-x-auto"
      >
        <button
          @click="selectedPeriod = '1-15'"
          class="flex-1 sm:flex-initial px-3 py-1.5 rounded-md font-semibold transition cursor-pointer whitespace-nowrap"
          :class="
            selectedPeriod === '1-15'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          "
        >
          1–15 число (Аванс)
        </button>
        <button
          @click="selectedPeriod = '16-end'"
          class="flex-1 sm:flex-initial px-3 py-1.5 rounded-md font-semibold transition cursor-pointer whitespace-nowrap"
          :class="
            selectedPeriod === '16-end'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          "
        >
          16–конец (Расчет)
        </button>
        <button
          @click="selectedPeriod = 'all'"
          class="flex-1 sm:flex-initial px-3 py-1.5 rounded-md font-semibold transition cursor-pointer whitespace-nowrap"
          :class="
            selectedPeriod === 'all'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          "
        >
          Весь месяц
        </button>
      </div>

      <div>
        <button
          @click="handleExportExcel"
          class="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <span>📥 Выгрузить в Excel</span>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <span class="text-xs text-zinc-400 font-medium"
          >Фонд оплаты периода</span
        >
        <div class="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
          {{ totalPayrollSum.toLocaleString("ru-RU") }} ₽
        </div>
      </div>
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <span class="text-xs text-zinc-400 font-medium"
          >Отработано часов за период</span
        >
        <div class="text-2xl sm:text-3xl font-black text-blue-400 mt-1">
          {{ totalWorkedHours }} ч
        </div>
      </div>
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <span class="text-xs text-zinc-400 font-medium">Смен в периоде</span>
        <div class="text-2xl sm:text-3xl font-black text-zinc-100 mt-1">
          {{ totalShiftsCount }}
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2 border-b border-zinc-800 pb-2">
      <button
        @click="activeView = 'payroll'"
        class="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
        :class="
          activeView === 'payroll'
            ? 'bg-zinc-800 text-zinc-100'
            : 'text-zinc-500 hover:text-zinc-300'
        "
      >
        💰 Расчетная ведомость
      </button>
      <button
        @click="activeView = 'schedule'"
        class="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
        :class="
          activeView === 'schedule'
            ? 'bg-zinc-800 text-zinc-100'
            : 'text-zinc-500 hover:text-zinc-300'
        "
      >
        📅 Табель смен (просмотр)
      </button>
    </div>

    <div v-if="activeView === 'payroll'" class="space-y-3">
      <div
        v-for="item in payrollList"
        :key="item.id"
        class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 transition"
      >
        <div
          class="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3"
        >
          <div class="flex items-center gap-2">
            <span
              class="w-3 h-3 rounded-full shrink-0"
              :class="item.color"
            ></span>
            <span class="text-base font-bold text-zinc-100">{{
              item.name
            }}</span>
            <span
              class="text-[11px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded"
              >{{
                item.salaryType === "fixed"
                  ? item.isFiveTwo
                    ? "Оклад (5/2)"
                    : "Оклад (195ч)"
                  : "Почасовая"
              }}</span
            >
          </div>
          <div class="text-right">
            <span class="text-[11px] text-zinc-400 block"
              >{{ item.periodLabel }}:</span
            >
            <span class="text-xl font-black text-emerald-400"
              >{{ item.totalEarned.toLocaleString("ru-RU") }} ₽</span
            >
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3 text-xs">
          <div class="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/60">
            <span class="text-zinc-500 block">Часы периода:</span>
            <span class="font-bold text-zinc-200 text-sm"
              >{{ item.totalHours }} из {{ item.periodNormHours }} ч</span
            >
          </div>
          <div class="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/60">
            <span class="text-zinc-500 block">Баланс нормы:</span>
            <span
              class="font-bold text-sm"
              :class="
                item.hoursBalance >= 0 ? 'text-emerald-400' : 'text-amber-400'
              "
              >{{
                item.hoursBalance >= 0
                  ? `+${item.hoursBalance}`
                  : item.hoursBalance
              }}
              ч</span
            >
          </div>
          <div class="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/60">
            <span class="text-zinc-500 block">Смены периода:</span>
            <span class="font-bold text-zinc-200 text-sm"
              >{{ item.shiftsCount }} ({{ item.mainShiftsCount }} осн /
              {{ item.koperShiftsCount }} коп)</span
            >
          </div>
          <div class="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/60">
            <span class="text-zinc-500 block">Условия:</span>
            <span class="font-bold text-zinc-300 text-xs">{{
              item.salaryType === "fixed"
                ? `${item.baseSalary.toLocaleString()} ₽ оклад`
                : `${item.hourlyRate} ₽/ч`
            }}</span>
          </div>
        </div>

        <div class="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
          <div class="text-[11px] text-zinc-400 font-medium mb-1">
            Арифметический расчет начисления ({{ item.periodLabel }}):
          </div>
          <div
            class="font-mono text-xs sm:text-sm text-emerald-300 font-bold break-all"
          >
            {{ item.formulaStr }}
          </div>
          <div class="text-[11px] text-zinc-500 mt-1">
            {{ item.formulaExplanation }}
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="activeView === 'schedule'"
      class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-x-auto p-4 shadow-sm"
    >
      <div class="flex items-center gap-4 text-xs text-zinc-400 mb-3">
        <span class="text-zinc-200 font-semibold">Смены:</span>
        <span
          class="px-2 py-0.5 rounded bg-blue-600/30 text-blue-200 border border-blue-500/50"
          >Основной</span
        >
        <span
          class="px-2 py-0.5 rounded bg-orange-600/30 text-orange-200 border border-orange-500/50"
          >Копер</span
        >
        <span class="text-zinc-500">🔒 Режим просмотра</span>
      </div>

      <table class="w-full border-collapse text-xs select-none">
        <thead>
          <tr class="border-b border-zinc-800 bg-zinc-950/60">
            <th
              class="sticky left-0 z-20 bg-zinc-950 px-3 py-2 text-left font-medium text-zinc-300 min-w-[150px] border-r border-zinc-800"
            >
              Сотрудник
            </th>
            <th
              v-for="day in daysInMonth"
              :key="day.dateStr"
              class="px-1 py-1.5 text-center font-normal min-w-[74px] border-r border-zinc-800/60"
              :class="
                day.isWeekend
                  ? 'bg-zinc-900/90 text-amber-400'
                  : 'text-zinc-400'
              "
            >
              <div class="font-semibold text-xs">{{ day.dayNumber }}</div>
              <div class="text-[9px] uppercase opacity-75">
                {{ day.weekdayShort }}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="worker in workersOnly"
            :key="worker.id"
            class="border-b border-zinc-800/70"
          >
            <td
              class="sticky left-0 z-10 bg-zinc-900 px-3 py-2 border-r border-zinc-800 font-medium text-zinc-200 text-xs"
            >
              <div class="flex items-center gap-1.5">
                <span
                  class="w-2 h-2 rounded-full shrink-0"
                  :class="worker.color"
                ></span>
                <span class="truncate">{{ worker.name }}</span>
              </div>
            </td>
            <td
              v-for="day in daysInMonth"
              :key="day.dateStr"
              class="p-0.5 text-center border-r border-zinc-800/60"
              :class="day.isWeekend ? 'bg-zinc-900/30' : ''"
            >
              <div
                v-if="findShift(worker.id, day.dateStr)"
                class="py-1 px-1 rounded text-[10px] font-bold border leading-tight"
                :class="
                  (findShift(worker.id, day.dateStr).shiftType ||
                    findShift(worker.id, day.dateStr).shift_type) === 'koper'
                    ? 'bg-orange-600/30 text-orange-200 border-orange-500/50'
                    : 'bg-blue-600/30 text-blue-200 border-blue-500/50'
                "
              >
                <div>
                  {{ findShift(worker.id, day.dateStr).time || "10:00–20:00" }}
                </div>
                <div class="opacity-80">
                  {{ findShift(worker.id, day.dateStr).hours || 10 }}ч
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
