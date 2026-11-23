<script setup>
import { reactive, computed, watch } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
  show: { type: Boolean, default: false },
  workers: { type: Array, required: true }
})

const emit = defineEmits(['close', 'save'])

const form = reactive({
  workerId: '',
  startDate: dayjs().format('YYYY-MM-DD'),
  endDate: dayjs().add(6, 'day').format('YYYY-MM-DD'),
  paidHours: 10,
  autoZeroWeekends: true
})

const hourOptions = [
  { label: '9 часов', value: 9 },
  { label: '10 часов', value: 10 },
  { label: '11 часов', value: 11 },
  { label: '0 ч (без оплаты)', value: 0 }
]

watch(() => props.show, (isOpen) => {
  if (isOpen && props.workers.length > 0 && !form.workerId) {
    form.workerId = props.workers[0].id
  }
})

// Живой предпросмотр, сколько дней и часов проставится
const preview = computed(() => {
  let day = dayjs(form.startDate)
  const end = dayjs(form.endDate)
  if (!day.isValid() || !end.isValid() || day.isAfter(end)) {
    return { valid: false, totalDays: 0, paidDays: 0, zeroDays: 0, totalHours: 0 }
  }

  let totalDays = 0
  let paidDays = 0
  let zeroDays = 0
  let totalHours = 0

  while (day.isBefore(end) || day.isSame(end, 'day')) {
    totalDays++
    const isWeekend = day.day() === 0 || day.day() === 6
    const h = (form.autoZeroWeekends && isWeekend) ? 0 : Number(form.paidHours)
    if (h > 0) {
      paidDays++
      totalHours += h
    } else {
      zeroDays++
    }
    day = day.add(1, 'day')
  }

  return { valid: true, totalDays, paidDays, zeroDays, totalHours }
})

function onSubmit() {
  if (!form.workerId || !preview.value.valid) return
  emit('save', { ...form })
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5 sm:p-6 w-full max-w-md shadow-2xl">
      <div class="flex items-center justify-between mb-1">
        <h3 class="text-base font-bold text-zinc-100 flex items-center gap-2">
          <span>🏖</span> Назначить отпуск
        </h3>
      </div>
      <p class="text-[11px] text-zinc-400 mb-4">
        Отпуск проставится в табель на весь выбранный период
      </p>

      <div class="space-y-4 text-xs">
        <!-- Выбор сотрудника -->
        <div>
          <label class="block text-zinc-400 mb-1 font-medium">Сотрудник</label>
          <select
            v-model="form.workerId"
            class="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-zinc-100 font-medium focus:outline-none focus:border-purple-500"
          >
            <option v-for="w in workers" :key="w.id" :value="w.id">{{ w.name }}</option>
          </select>
        </div>

        <!-- Даты С и По -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-zinc-400 mb-1 font-medium">Дата начала (с)</label>
            <input
              v-model="form.startDate"
              type="date"
              class="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-100 font-semibold focus:outline-none focus:border-purple-500"
            >
          </div>
          <div>
            <label class="block text-zinc-400 mb-1 font-medium">Дата конца (по)</label>
            <input
              v-model="form.endDate"
              type="date"
              class="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-zinc-100 font-semibold focus:outline-none focus:border-purple-500"
            >
          </div>
        </div>

        <!-- Длительность дня отпуска (9ч / 10ч / 11ч) -->
        <div>
          <label class="block text-zinc-400 mb-1.5 font-medium">Сколько часов засчитывать за 1 оплач. день:</label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              v-for="opt in hourOptions"
              :key="opt.value"
              type="button"
              @click="form.paidHours = opt.value"
              class="py-2 px-2 rounded-lg border font-bold text-center transition cursor-pointer"
              :class="form.paidHours === opt.value
                ? 'bg-purple-600/40 text-purple-100 border-purple-400'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-600'"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <!-- Галочка авто 5+2 -->
        <div class="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
          <label class="flex items-start gap-2.5 cursor-pointer text-zinc-200 font-medium">
            <input v-model="form.autoZeroWeekends" type="checkbox" class="rounded accent-purple-500 w-4 h-4 mt-0.5">
            <div>
              <div>Ставить «Отп 0ч» на Сб и Вс (5 опл. + 2 вых.)</div>
              <p class="text-[10px] text-zinc-500 font-normal mt-0.5">
                В выходные дни внутри отпуска поставится 0 часов (не оплачиваются, но видно, что человек в отпуске). Любой день потом можно поправить ПКМ.
              </p>
            </div>
          </label>
        </div>

        <!-- Живой предпросмотр -->
        <div v-if="preview.valid" class="bg-purple-950/30 border border-purple-500/40 rounded-lg p-3 text-purple-200">
          <div class="font-bold text-xs">Итого проставится: {{ preview.totalDays }} дн.</div>
          <div class="text-[11px] opacity-90 mt-1">
            • Оплачиваемых: <b>{{ preview.paidDays }} дн.</b> ({{ preview.totalHours }} ч в табель)<br>
            • Отпуск 0ч (выходные): <b>{{ preview.zeroDays }} дн.</b> (0 ч)
          </div>
        </div>
        <div v-else class="text-red-400 text-xs">
          ⚠️ Дата окончания должна быть позже даты начала
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-6 pt-4 border-t border-zinc-800">
        <button type="button" @click="emit('close')" class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs transition cursor-pointer">
          Отмена
        </button>
        <button
          type="button"
          :disabled="!preview.valid"
          @click="onSubmit"
          class="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition cursor-pointer"
        >
          Проставить отпуск
        </button>
      </div>
    </div>
  </div>
</template>