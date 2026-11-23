<script setup>
import { ref, computed, onMounted } from "vue";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import {
  WORKERS,
  shifts,
  loadInitialData,
  hasDayOffWish,
  cycleShift,
  updateWorkersOrder,
  moveOrSwapShift,
  updateShiftDetails,
  deleteShiftById,
} from "../state/schedule";
import { calculateWorkerPayroll } from "../utils/payroll";
import { supabase } from "../lib/supabase";
import WorkerEditModal from "./WorkerEditModal.vue";
import ShiftEditModal from "./ShiftEditModal.vue";
import PayrollTable from "./PayrollTable.vue";

dayjs.locale("ru");

const currentMonth = ref(dayjs().startOf("month"));

const activeWorkers = computed(() => {
  return WORKERS.value.filter((w) => w.role !== "financier");
});

const shiftTemplates = [
  { label: "9:00–18:00 (9ч)", time: "9:00–18:00", hours: 9 },
  { label: "11:00–20:00 (9ч)", time: "11:00–20:00", hours: 9 },
];
const selectedTemplate = ref({ ...shiftTemplates[0] });

const customStart = ref("10:00");
const customEnd = ref("16:00");
const isCustomMode = ref(false);

function selectPresetTemplate(tpl) {
  isCustomMode.value = false;
  selectedTemplate.value = { ...tpl };
}

function applyCustomTemplate() {
  isCustomMode.value = true;
  const [sh, sm] = customStart.value.split(":").map(Number);
  const [eh, em] = customEnd.value.split(":").map(Number);
  let startMins = sh * 60 + sm;
  let endMins = eh * 60 + em;
  if (endMins <= startMins) endMins += 24 * 60;
  const hours = Math.round(((endMins - startMins) / 60) * 100) / 100;

  selectedTemplate.value = {
    label: `${customStart.value}–${customEnd.value}`,
    time: `${customStart.value}–${customEnd.value}`,
    hours,
  };
}

onMounted(() => {
  loadInitialData();
});

const daysInMonth = computed(() => {
  const count = currentMonth.value.daysInMonth();
  const days = [];
  for (let i = 1; i <= count; i++) {
    const d = currentMonth.value.date(i);
    const dayOfWeek = d.day();
    days.push({
      dateStr: d.format("YYYY-MM-DD"),
      dayNumber: i,
      weekdayShort: d.format("dd"),
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });
  }
  return days;
});

function prevMonth() {
  currentMonth.value = currentMonth.value.subtract(1, "month");
}
function nextMonth() {
  currentMonth.value = currentMonth.value.add(1, "month");
}

function findShift(workerId, dateStr) {
  return shifts.value.find((s) => s.userId === workerId && s.date === dateStr);
}

function handleCellClick(workerId, dateStr) {
  cycleShift(
    workerId,
    dateStr,
    selectedTemplate.value.hours,
    selectedTemplate.value.time,
  );
}

const editingShift = ref(null);
function openShiftEditor(shift, workerName) {
  editingShift.value = { ...shift, workerName };
}
async function saveShiftDetails(payload) {
  await updateShiftDetails(payload.id, payload);
  editingShift.value = null;
}
async function removeShift(shiftId) {
  await deleteShiftById(shiftId);
  editingShift.value = null;
}

const draggedShift = ref(null);
function onShiftDragStart(workerId, dateStr) {
  draggedShift.value = { workerId, dateStr };
}
async function onShiftDrop(targetWorkerId, targetDateStr) {
  if (!draggedShift.value) return;
  const { workerId: fromUserId, dateStr: fromDate } = draggedShift.value;
  draggedShift.value = null;
  await moveOrSwapShift(fromUserId, fromDate, targetWorkerId, targetDateStr);
}

const draggedWorkerId = ref(null);
function onWorkerDragStart(workerId) {
  draggedWorkerId.value = workerId;
}
async function onWorkerDrop(targetWorkerId) {
  if (!draggedWorkerId.value || draggedWorkerId.value === targetWorkerId) {
    draggedWorkerId.value = null;
    return;
  }
  const list = [...WORKERS.value];
  const fromIdx = list.findIndex((w) => w.id === draggedWorkerId.value);
  const toIdx = list.findIndex((w) => w.id === targetWorkerId);
  if (fromIdx !== -1 && toIdx !== -1) {
    const [moved] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, moved);
    await updateWorkersOrder(list);
  }
  draggedWorkerId.value = null;
}

function getWorkerStats(userId) {
  const monthPrefix = currentMonth.value.format("YYYY-MM");
  const userShifts = shifts.value.filter(
    (s) => s.userId === userId && s.date.startsWith(monthPrefix),
  );
  const totalHours = userShifts.reduce(
    (acc, s) => acc + (Number(s.hours) || 0),
    0,
  );
  return { count: userShifts.length, hours: totalHours };
}

const payrollSummary = computed(() => {
  const monthPrefix = currentMonth.value.format("YYYY-MM");
  return activeWorkers.value.map((worker) => {
    const workerShifts = shifts.value.filter(
      (s) => s.userId === worker.id && s.date.startsWith(monthPrefix),
    );
    return calculateWorkerPayroll(
      worker,
      workerShifts,
      currentMonth.value,
      "all",
    );
  });
});

const editingWorker = ref(null);
async function saveWorkerChanges(updatedWorker) {
  const { error } = await supabase
    .from("users")
    .update({
      name: updatedWorker.name,
      passcode: updatedWorker.passcode,
      salary_type: updatedWorker.salaryType,
      base_salary: updatedWorker.baseSalary,
      standard_hours: updatedWorker.standardHours,
      hourly_rate: updatedWorker.hourlyRate,
      is_five_two: updatedWorker.isFiveTwo,
    })
    .eq("id", updatedWorker.id);

  if (error) {
    alert("Ошибка сохранения: " + error.message);
  } else {
    editingWorker.value = null;
    await loadInitialData();
  }
}
</script>

<template>
  <div class="space-y-4">
    <div
      class="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4"
    >
      <div class="flex items-center gap-3">
        <button
          @click="prevMonth"
          class="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm cursor-pointer transition"
        >
          ←
        </button>
        <h2
          class="text-base font-semibold capitalize min-w-[140px] text-center text-zinc-100"
        >
          {{ currentMonth.format("MMMM YYYY") }}
        </h2>
        <button
          @click="nextMonth"
          class="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm cursor-pointer transition"
        >
          →
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-2 text-xs">
        <span class="text-zinc-400">Клик ставит:</span>
        <button
          v-for="tpl in shiftTemplates"
          :key="tpl.label"
          @click="selectPresetTemplate(tpl)"
          class="px-2.5 py-1.5 rounded-lg border transition cursor-pointer"
          :class="
            !isCustomMode && selectedTemplate.time === tpl.time
              ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-semibold'
              : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
          "
        >
          {{ tpl.label }}
        </button>

        <div
          class="flex items-center gap-1 bg-zinc-950 border rounded-lg px-2 py-1 transition"
          :class="
            isCustomMode
              ? 'border-emerald-500 ring-1 ring-emerald-500/40'
              : 'border-zinc-800'
          "
        >
          <span class="text-zinc-400 mr-0.5">Свое:</span>
          <input
            v-model="customStart"
            @change="applyCustomTemplate"
            type="time"
            class="bg-transparent text-zinc-100 font-semibold focus:outline-none cursor-pointer"
          />
          <span class="text-zinc-500">–</span>
          <input
            v-model="customEnd"
            @change="applyCustomTemplate"
            type="time"
            class="bg-transparent text-zinc-100 font-semibold focus:outline-none cursor-pointer"
          />
          <button
            @click="applyCustomTemplate"
            class="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold transition cursor-pointer"
            :class="
              isCustomMode
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            "
          >
            Выбрать ({{ isCustomMode ? selectedTemplate.hours + "ч" : "Ок" }})
          </button>
        </div>
      </div>

      <div class="flex items-center gap-3 text-xs text-zinc-400">
        <div class="flex items-center gap-1.5">
          <span
            class="w-3 h-3 rounded bg-red-950/80 border border-red-500/50 inline-block"
          ></span>
          <span>Выходной</span>
        </div>
        <span class="text-zinc-300">💡 <b>ПКМ</b> — точное время</span>
      </div>
    </div>

    <div
      class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-x-auto shadow-sm"
    >
      <table class="w-full border-collapse text-xs select-none">
        <thead>
          <tr class="border-b border-zinc-800 bg-zinc-950/60">
            <th
              class="sticky left-0 z-20 bg-zinc-950 px-3 py-3 text-left font-medium text-zinc-300 min-w-[185px] border-r border-zinc-800"
            >
              Сотрудник
            </th>
            <th
              v-for="day in daysInMonth"
              :key="day.dateStr"
              class="px-1 py-2 text-center font-normal min-w-[82px] border-r border-zinc-800/60"
              :class="
                day.isWeekend
                  ? 'bg-zinc-900/90 text-amber-400/90'
                  : 'text-zinc-400'
              "
            >
              <div class="font-semibold text-sm">{{ day.dayNumber }}</div>
              <div class="text-[10px] uppercase opacity-75">
                {{ day.weekdayShort }}
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="worker in activeWorkers"
            :key="worker.id"
            class="border-b border-zinc-800/70 hover:bg-zinc-800/20 transition"
            @dragover.prevent
            @drop="draggedWorkerId ? onWorkerDrop(worker.id) : null"
          >
            <td
              class="sticky left-0 z-10 bg-zinc-900 px-3 py-2.5 border-r border-zinc-800"
            >
              <div class="flex items-center justify-between gap-1">
                <div class="flex items-center gap-1.5 min-w-0">
                  <button
                    @click.stop="editingWorker = worker"
                    class="text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 p-1 rounded-md transition cursor-pointer shrink-0"
                    title="Редактировать"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-3.5 h-3.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                      />
                    </svg>
                  </button>
                  <span
                    class="w-2 h-2 rounded-full shrink-0"
                    :class="worker.color"
                  ></span>
                  <span
                    class="font-medium text-zinc-100 text-sm truncate"
                    :title="worker.name"
                    >{{ worker.name }}</span
                  >
                </div>
                <span
                  draggable="true"
                  @dragstart.stop="onWorkerDragStart(worker.id)"
                  class="text-zinc-600 hover:text-zinc-200 cursor-grab active:cursor-grabbing text-sm px-1 py-0.5 select-none rounded hover:bg-zinc-800 transition shrink-0"
                  title="Перетащить"
                  >⠿</span
                >
              </div>
              <div class="text-[11px] text-zinc-400 mt-0.5 pl-6">
                Смен:
                <b class="text-zinc-200">{{
                  getWorkerStats(worker.id).count
                }}</b>
                · Часов:
                <b class="text-zinc-200"
                  >{{ getWorkerStats(worker.id).hours }}ч</b
                >
              </div>
            </td>

            <td
              v-for="day in daysInMonth"
              :key="day.dateStr"
              class="p-1 text-center border-r border-zinc-800/60 cursor-pointer select-none transition relative"
              @click="handleCellClick(worker.id, day.dateStr)"
              @dragover.prevent
              @drop.stop="onShiftDrop(worker.id, day.dateStr)"
              :class="[
                hasDayOffWish(worker.id, day.dateStr) &&
                !findShift(worker.id, day.dateStr)
                  ? 'bg-red-950/40 text-red-300'
                  : hasDayOffWish(worker.id, day.dateStr) &&
                      findShift(worker.id, day.dateStr)
                    ? 'bg-red-950/60 ring-1 ring-red-500/80'
                    : day.isWeekend
                      ? 'bg-zinc-900/30'
                      : '',
              ]"
            >
              <div
                v-if="findShift(worker.id, day.dateStr)"
                draggable="true"
                @dragstart.stop="onShiftDragStart(worker.id, day.dateStr)"
                @contextmenu.prevent.stop="
                  openShiftEditor(
                    findShift(worker.id, day.dateStr),
                    worker.name,
                  )
                "
                class="group py-1 px-1.5 rounded text-center select-none cursor-grab active:cursor-grabbing border transition relative"
                :class="[
                  hasDayOffWish(worker.id, day.dateStr)
                    ? 'bg-red-900/80 border-2 border-red-500 text-red-100 ring-2 ring-red-500/50 shadow-md animate-pulse'
                    : findShift(worker.id, day.dateStr).shiftType === 'koper'
                      ? 'bg-orange-600/30 text-orange-200 border-orange-500/50 hover:bg-orange-600/50'
                      : 'bg-blue-600/30 text-blue-200 border-blue-500/50 hover:bg-blue-600/50',
                ]"
                :title="
                  hasDayOffWish(worker.id, day.dateStr)
                    ? '⚠️ ВНИМАНИЕ: Сотрудник просил выходной!'
                    : 'ПКМ — время смены'
                "
              >
                <div
                  class="text-[10px] font-bold leading-tight whitespace-nowrap tracking-tight"
                >
                  <span v-if="hasDayOffWish(worker.id, day.dateStr)">⚠️</span>
                  {{ findShift(worker.id, day.dateStr).time || "10:00–20:00" }}
                </div>
                <div class="text-[10px] opacity-80 font-medium mt-0.5">
                  {{ findShift(worker.id, day.dateStr).hours }}ч
                </div>
                <button
                  type="button"
                  @click.stop="
                    openShiftEditor(
                      findShift(worker.id, day.dateStr),
                      worker.name,
                    )
                  "
                  class="opacity-0 group-hover:opacity-100 absolute -top-1 -right-1 bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] shadow-md transition"
                >
                  ✎
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <PayrollTable
      :items="payrollSummary"
      :month-title="currentMonth.format('MMMM YYYY')"
    />
    <WorkerEditModal
      :worker="editingWorker"
      @close="editingWorker = null"
      @save="saveWorkerChanges"
    />
    <ShiftEditModal
      :shift="editingShift"
      @close="editingShift = null"
      @save="saveShiftDetails"
      @delete="removeShift"
    />
  </div>
</template>
