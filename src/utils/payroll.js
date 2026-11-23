import * as XLSX from "xlsx";

// Подсчет нормы будних дней для 5/2 (будни × 10ч)
export function getDynamicStandardHours(startDayjs, endDayjs) {
  let businessDays = 0;
  let day = startDayjs.clone();
  while (day.isBefore(endDayjs) || day.isSame(endDayjs, "day")) {
    const d = day.day();
    if (d !== 0 && d !== 6) businessDays++;
    day = day.add(1, "day");
  }
  return businessDays * 10;
}

// Единый расчет зарплаты с поддержкой периодов (1-15 / 16-конец / весь месяц)
export function calculateWorkerPayroll(
  worker,
  allWorkerShifts,
  monthDayjs,
  period = "all",
) {
  const monthStart = monthDayjs.clone().startOf("month");
  const monthEnd = monthDayjs.clone().endOf("month");

  let periodShifts = allWorkerShifts;
  let periodLabel = "Весь месяц";

  if (period === "1-15") {
    periodLabel = "1–15 число (Аванс)";
    periodShifts = allWorkerShifts.filter((s) => {
      const d = parseInt(s.date.split("-")[2], 10);
      return d >= 1 && d <= 15;
    });
  } else if (period === "16-end") {
    periodLabel = "16–конец месяца (Расчет)";
    periodShifts = allWorkerShifts.filter((s) => {
      const d = parseInt(s.date.split("-")[2], 10);
      return d >= 16;
    });
  }

  const totalHours = periodShifts.reduce(
    (sum, s) => sum + (Number(s.hours) || 0),
    0,
  );
  const shiftsCount = periodShifts.length;
  const mainShiftsCount = periodShifts.filter(
    (s) => (s.shiftType || s.shift_type) === "main",
  ).length;
  const koperShiftsCount = periodShifts.filter(
    (s) => (s.shiftType || s.shift_type) === "koper",
  ).length;

  const fullMonthDynamicNorm = getDynamicStandardHours(monthStart, monthEnd);
  const isFiveTwo = Boolean(
    worker.isFiveTwo ||
    worker.is_five_two ||
    worker.name === "Клименкин" ||
    worker.name === "Хотеева",
  );

  const salaryType = worker.salaryType || worker.salary_type || "fixed";
  const baseSalary = Number(worker.baseSalary || worker.base_salary) || 0;
  const hourlyRate = Number(worker.hourlyRate || worker.hourly_rate) || 300;

  const monthNormHours =
    salaryType === "fixed"
      ? isFiveTwo
        ? fullMonthDynamicNorm
        : Number(worker.standardHours || worker.standard_hours) || 195
      : Number(worker.standardHours || worker.standard_hours) || 195;

  let periodNormHours = monthNormHours;
  if (period === "1-15") {
    const pStart = monthDayjs.clone().date(1);
    const pEnd = monthDayjs.clone().date(15);
    periodNormHours = isFiveTwo
      ? getDynamicStandardHours(pStart, pEnd)
      : Math.round(monthNormHours / 2);
  } else if (period === "16-end") {
    const pStart = monthDayjs.clone().date(16);
    periodNormHours = isFiveTwo
      ? getDynamicStandardHours(pStart, monthEnd)
      : Math.round(monthNormHours / 2);
  }

  const hoursBalance = totalHours - periodNormHours;
  const percentOfNorm =
    periodNormHours > 0 ? Math.round((totalHours / periodNormHours) * 100) : 0;

  let totalEarned = 0;
  let formulaStr = "";
  let formulaExplanation = "";

  if (salaryType === "fixed") {
    if (monthNormHours > 0) {
      const hourlyEquivalent = baseSalary / monthNormHours;
      totalEarned = Math.round(hourlyEquivalent * totalHours);
      formulaStr = `(${baseSalary.toLocaleString("ru-RU")} ₽ ÷ ${monthNormHours} ч) × ${totalHours} ч = ${totalEarned.toLocaleString("ru-RU")} ₽`;
      formulaExplanation = `Стоимость 1 часа по норме месяца (${monthNormHours}ч): ${hourlyEquivalent.toFixed(2)} ₽`;
    } else {
      totalEarned = baseSalary;
      formulaStr = `${baseSalary.toLocaleString("ru-RU")} ₽`;
      formulaExplanation = "Фиксированный оклад";
    }
  } else {
    totalEarned = Math.round(totalHours * hourlyRate);
    formulaStr = `${totalHours} ч × ${hourlyRate.toLocaleString("ru-RU")} ₽/ч = ${totalEarned.toLocaleString("ru-RU")} ₽`;
    formulaExplanation = `Почасовая ставка: ${hourlyRate} ₽/ч`;
  }

  return {
    id: worker.id,
    name: worker.name,
    color: worker.color || "bg-zinc-700",
    salaryType,
    isFiveTwo,
    baseSalary,
    hourlyRate,
    period,
    periodLabel,
    shiftsCount,
    mainShiftsCount,
    koperShiftsCount,
    totalHours,
    periodNormHours,
    monthNormHours,
    normHours: monthNormHours,
    hoursBalance,
    percentOfNorm,
    totalEarned,
    formulaStr,
    formulaExplanation,
  };
}

// Экспорт в Excel (.xlsx)
export function exportPayrollToExcel(payrollItems, monthTitle, periodLabel) {
  const rows = payrollItems.map((item, index) => ({
    "№": index + 1,
    Сотрудник: item.name,
    "Тип графика":
      item.salaryType === "fixed"
        ? item.isFiveTwo
          ? "Оклад (5/2)"
          : "Оклад (195ч)"
        : "Почасовая",
    "Оклад / Ставка (₽)":
      item.salaryType === "fixed" ? item.baseSalary : item.hourlyRate,
    "Отработано (ч)": item.totalHours,
    "План периода (ч)": item.periodNormHours,
    "Баланс часов":
      item.hoursBalance >= 0 ? `+${item.hoursBalance}` : item.hoursBalance,
    "Всего смен": item.shiftsCount,
    Основной: item.mainShiftsCount,
    Копер: item.koperShiftsCount,
    "Формула начисления": item.formulaStr,
    "К выплате (₽)": item.totalEarned,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Ведомость ЗП");

  worksheet["!cols"] = [
    { wch: 4 },
    { wch: 22 },
    { wch: 16 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 38 },
    { wch: 16 },
  ];

  const cleanMonth = monthTitle.replace(/\s+/g, "_");
  const cleanPeriod = periodLabel.replace(/[^a-zA-Z0-9а-яА-ЯёЁ_-]/g, "_");
  XLSX.writeFile(workbook, `Ведомость_${cleanMonth}_${cleanPeriod}.xlsx`);
}
