<script setup>
import { reactive, watch } from "vue";

const props = defineProps({
  worker: { type: Object, default: null },
});
const emit = defineEmits(["close", "save"]);

const form = reactive({
  id: null,
  name: "",
  passcode: "",
  salaryType: "fixed",
  isFiveTwo: false,
  baseSalary: 0,
  standardHours: 195,
  hourlyRate: 300,
});

watch(
  () => props.worker,
  (val) => {
    if (val) {
      form.id = val.id;
      form.name = val.name || "";
      form.passcode = val.passcode || "";
      form.salaryType = val.salaryType || "fixed";
      form.isFiveTwo =
        val.isFiveTwo || val.name === "Клименкин" || val.name === "Хотеева";
      form.baseSalary = Number(val.baseSalary) || 0;
      form.standardHours = Number(val.standardHours) || 195;
      form.hourlyRate = Number(val.hourlyRate) || 300;
    }
  },
  { immediate: true },
);

function onSave() {
  emit("save", { ...form });
}
</script>

<template>
  <div
    v-if="worker"
    class="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4"
  >
    <div
      class="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl"
    >
      <h3 class="text-base font-bold text-zinc-100 mb-4">
        Редактирование: <span class="text-emerald-400">{{ form.name }}</span>
      </h3>

      <div class="space-y-4 text-xs">
        <div>
          <label class="block text-zinc-400 mb-1">Фамилия / Имя</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-zinc-200 focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div>
          <label class="block text-zinc-400 mb-1">Пин-код для входа</label>
          <input
            v-model="form.passcode"
            type="text"
            class="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-zinc-200 focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div>
          <label class="block text-zinc-400 mb-1">Тип расчета зарплаты</label>
          <select
            v-model="form.salaryType"
            class="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-zinc-200 focus:outline-none focus:border-zinc-500"
          >
            <option value="fixed">Фиксированный оклад</option>
            <option value="hourly">Почасовая ставка</option>
          </select>
        </div>

        <template v-if="form.salaryType === 'fixed'">
          <div>
            <label class="block text-zinc-400 mb-1">Сумма оклада (₽)</label>
            <input
              v-model.number="form.baseSalary"
              type="number"
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-zinc-200"
            />
          </div>

          <div class="bg-zinc-800/60 p-3 rounded-lg border border-zinc-800">
            <label
              class="flex items-center gap-2 cursor-pointer text-zinc-300 font-medium"
            >
              <input
                v-model="form.isFiveTwo"
                type="checkbox"
                class="rounded accent-emerald-500 w-4 h-4"
              />
              <span>График 5/2 (динамическая норма часов месяца)</span>
            </label>
            <p class="text-[11px] text-zinc-500 mt-1 pl-6">
              Норма рассчитывается автоматически по будням месяца (×10ч).
            </p>
          </div>

          <div v-if="!form.isFiveTwo">
            <label class="block text-zinc-400 mb-1"
              >Фиксированная норма часов в месяц</label
            >
            <input
              v-model.number="form.standardHours"
              type="number"
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-zinc-200"
            />
          </div>
        </template>

        <div v-if="form.salaryType === 'hourly'">
          <label class="block text-zinc-400 mb-1">Ставка за час (₽)</label>
          <input
            v-model.number="form.hourlyRate"
            type="number"
            class="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-zinc-200"
          />
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-6">
        <button
          @click="emit('close')"
          class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs transition cursor-pointer"
        >
          Отмена
        </button>
        <button
          @click="onSave"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
        >
          Сохранить в базу
        </button>
      </div>
    </div>
  </div>
</template>
