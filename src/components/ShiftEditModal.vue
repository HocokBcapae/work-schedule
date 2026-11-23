<script setup>
import { reactive, watch } from "vue";

const props = defineProps({
  shift: { type: Object, default: null },
});
const emit = defineEmits(["close", "save", "delete"]);

const form = reactive({
  id: null,
  startTime: "10:00",
  endTime: "20:00",
  hours: 10,
  shiftType: "main",
});

const quickPresets = [
  { label: "10:00–20:00", start: "10:00", end: "20:00", hours: 10 },
  { label: "10:00–15:00", start: "10:00", end: "15:00", hours: 5 },
  { label: "15:00–20:00", start: "15:00", end: "20:00", hours: 5 },
  { label: "09:00–18:00", start: "09:00", end: "18:00", hours: 9 },
  { label: "12:00–20:00", start: "12:00", end: "20:00", hours: 8 },
  { label: "10:00–14:00", start: "10:00", end: "14:00", hours: 4 },
];

function parseTimeRange(timeStr) {
  if (!timeStr) return { start: "10:00", end: "20:00" };
  const parts = timeStr.split(/[–—-]/).map((p) => p.trim());
  if (
    parts.length === 2 &&
    /^\d{1,2}:\d{2}$/.test(parts[0]) &&
    /^\d{1,2}:\d{2}$/.test(parts[1])
  ) {
    return { start: parts[0].padStart(5, "0"), end: parts[1].padStart(5, "0") };
  }
  return { start: "10:00", end: "20:00" };
}

function calcHours(start, end) {
  if (!start || !end) return 10;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let startMins = sh * 60 + sm;
  let endMins = eh * 60 + em;
  if (endMins <= startMins) endMins += 24 * 60;
  return Math.round(((endMins - startMins) / 60) * 100) / 100;
}

watch(
  () => props.shift,
  (val) => {
    if (val) {
      form.id = val.id;
      const parsed = parseTimeRange(val.time);
      form.startTime = parsed.start;
      form.endTime = parsed.end;
      form.hours = Number(val.hours) || calcHours(parsed.start, parsed.end);
      form.shiftType = val.shiftType || "main";
    }
  },
  { immediate: true },
);

function onTimeChange() {
  form.hours = calcHours(form.startTime, form.endTime);
}

function applyPreset(preset) {
  form.startTime = preset.start;
  form.endTime = preset.end;
  form.hours = preset.hours;
}

function onSave() {
  emit("save", {
    id: form.id,
    time: `${form.startTime}–${form.endTime}`,
    hours: Number(form.hours),
    shiftType: form.shiftType,
  });
}
</script>

<template>
  <div
    v-if="shift"
    class="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4"
  >
    <div
      class="bg-zinc-900 border border-zinc-800 rounded-xl p-5 sm:p-6 w-full max-w-md shadow-2xl"
    >
      <div class="flex items-center justify-between mb-1">
        <h3 class="text-sm font-bold text-zinc-100">
          Смена: <span class="text-emerald-400">{{ shift.workerName }}</span>
        </h3>
        <span class="text-xs text-zinc-400">{{ shift.date }}</span>
      </div>
      <p class="text-[11px] text-zinc-500 mb-4">
        Укажите интервал работы (со скольки до скольки)
      </p>

      <div class="space-y-4 text-xs">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-zinc-400 mb-1 font-medium"
              >Со скольки</label
            >
            <input
              v-model="form.startTime"
              @change="onTimeChange"
              type="time"
              class="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-zinc-100 text-base font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label class="block text-zinc-400 mb-1 font-medium"
              >До скольки</label
            >
            <input
              v-model="form.endTime"
              @change="onTimeChange"
              type="time"
              class="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-zinc-100 text-base font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label class="block text-zinc-400 mb-1.5 font-medium"
            >Быстрый выбор интервала:</label
          >
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="p in quickPresets"
              :key="p.label"
              type="button"
              @click="applyPreset(p)"
              class="px-2.5 py-1 rounded-md border text-[11px] font-semibold transition cursor-pointer"
              :class="
                form.startTime === p.start && form.endTime === p.end
                  ? 'bg-zinc-100 text-zinc-950 border-zinc-100'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-zinc-500'
              "
            >
              {{ p.label }} ({{ p.hours }}ч)
            </button>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="text-zinc-400 font-medium"
              >Зачтется часов в табель и ЗП</label
            >
            <span class="text-[10px] text-zinc-500"
              >Авторасчет (можно поправить)</span
            >
          </div>
          <input
            v-model.number="form.hours"
            type="number"
            step="0.5"
            min="0.5"
            max="24"
            class="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-emerald-400 text-sm font-bold focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div>
          <label class="block text-zinc-400 mb-1.5 font-medium"
            >Рабочее место</label
          >
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              @click="form.shiftType = 'main'"
              class="py-2 px-3 rounded-lg border font-medium transition cursor-pointer text-center"
              :class="
                form.shiftType === 'main'
                  ? 'bg-blue-600/30 text-blue-200 border-blue-500/70 font-semibold'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              "
            >
              Основной (синий)
            </button>
            <button
              type="button"
              @click="form.shiftType = 'koper'"
              class="py-2 px-3 rounded-lg border font-medium transition cursor-pointer text-center"
              :class="
                form.shiftType === 'koper'
                  ? 'bg-orange-600/30 text-orange-200 border-orange-500/70 font-semibold'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              "
            >
              Копер (оранжевый)
            </button>
          </div>
        </div>
      </div>

      <div
        class="flex items-center justify-between gap-2 mt-6 pt-4 border-t border-zinc-800"
      >
        <button
          type="button"
          @click="emit('delete', form.id)"
          class="px-3 py-2 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/60 rounded-lg text-xs transition cursor-pointer"
        >
          Удалить смену
        </button>
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="emit('close')"
            class="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs transition cursor-pointer"
          >
            Отмена
          </button>
          <button
            type="button"
            @click="onSave"
            class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
