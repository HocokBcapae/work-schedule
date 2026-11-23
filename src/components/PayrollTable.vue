<script setup>
defineProps({
  items: { type: Array, required: true },
  monthTitle: { type: String, required: true },
});
</script>

<template>
  <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mt-6">
    <h3 class="text-sm font-semibold text-zinc-300 mb-4">
      💰 Расчет зарплаты за {{ monthTitle }}
    </h3>
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead>
          <tr class="border-b border-zinc-800 text-zinc-400">
            <th class="pb-3 font-medium">Сотрудник</th>
            <th class="pb-3 font-medium text-center">Смен</th>
            <th class="pb-3 font-medium text-center">Отработано часов</th>
            <th class="pb-3 font-medium text-center">Норма часов</th>
            <th class="pb-3 font-medium text-right">Условия</th>
            <th class="pb-3 font-medium text-right">Итого к выплате</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-800/60">
          <tr
            v-for="item in items"
            :key="item.id"
            class="hover:bg-zinc-800/40 transition"
          >
            <td class="py-3 font-medium text-zinc-200">{{ item.name }}</td>
            <td class="py-3 text-center text-zinc-300">
              {{ item.shiftsCount }}
            </td>
            <td class="py-3 text-center text-zinc-300 font-semibold">
              {{ item.totalHours }} ч
            </td>
            <td class="py-3 text-center text-zinc-400">
              {{ item.salaryType === "fixed" ? `${item.normHours} ч` : "—" }}
            </td>
            <td class="py-3 text-right text-zinc-400 text-[11px]">
              <span v-if="item.salaryType === 'fixed'">
                Оклад {{ item.baseSalary.toLocaleString("ru-RU") }} ₽
                {{ item.isFiveTwo ? "(5/2)" : "" }}
              </span>
              <span v-else>{{ item.hourlyRate }} ₽/ч</span>
            </td>
            <td class="py-3 text-right font-bold text-emerald-400 text-sm">
              {{ item.totalEarned.toLocaleString("ru-RU") }} ₽
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
