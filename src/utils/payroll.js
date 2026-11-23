import * as XLSX from 'xlsx'

export function getDynamicStandardHours(startDayjs, endDayjs) {
  let businessDays = 0
  let day = startDayjs.clone()
  while (day.isBefore(endDayjs) || day.isSame(endDayjs, 'day')) {
    const d = day.day()
    if (d !== 0 && d !== 6) businessDays++
    day = day.add(1, 'day')
  }
  return businessDays * 10
}

export function calculateWorkerPayroll(worker, allWorkerShifts, monthDayjs, period = 'all') {
  const monthStart = monthDayjs.clone().startOf('month')
  const monthEnd = monthDayjs.clone().endOf('month')

  let periodShifts = allWorkerShifts
  let periodLabel = 'Весь месяц'

  if (period === '1-15') {
    periodLabel = '1–15 число (Аванс)'
    periodShifts = allWorkerShifts.filter(s => {
      const d = parseInt(s.date.split('-')[2], 10)
      return d >= 1 && d <= 15
    })
  } else if (period === '16-end') {
    periodLabel = '16–конец месяца (Расчет)'
    periodShifts = allWorkerShifts.filter(s => {
      const d = parseInt(s.date.split('-')[2], 10)
      return d >= 16
    })
  }

  // Разделяем обычные смены и отпуск
  const mainShifts = periodShifts.filter(s => (s.shiftType || s.shift_type) === 'main')
  const koperShifts = periodShifts.filter(s => (s.shiftType || s.shift_type) === 'koper')
  const vacationShifts = periodShifts.filter(s => (s.shiftType || s.shift_type) === 'vacation')

  const mainShiftsCount = mainShifts.length
  const koperShiftsCount = koperShifts.length
  const shiftsCount = mainShiftsCount + koperShiftsCount // только реальные рабочие смены

  const vacationPaidDays = vacationShifts.filter(s => Number(s.hours) > 0).length
  const vacationZeroDays = vacationShifts.filter(s => Number(s.hours) === 0).length
  const vacationDaysCount = vacationShifts.length

  const workedHours = [...mainShifts, ...koperShifts].reduce((sum, s) => sum + (Number(s.hours) || 0), 0)
  const vacationHours = vacationShifts.reduce((sum, s) => sum + (Number(s.hours) || 0), 0)

  // Отпускные часы (9/10/11) идут в общий зачет ровно как рабочие; Отп 0ч дает +0
  const totalHours = workedHours + vacationHours

  const fullMonthDynamicNorm = getDynamicStandardHours(monthStart, monthEnd)
  const isFiveTwo = Boolean(worker.isFiveTwo || worker.is_five_two || worker.name === 'Клименкин' || worker.name === 'Хотеева')

  const salaryType = worker.salaryType || worker.salary_type || 'fixed'
  const baseSalary = Number(worker.baseSalary || worker.base_salary) || 0
  const hourlyRate = Number(worker.hourlyRate || worker.hourly_rate) || 300

  const monthNormHours = salaryType === 'fixed'
    ? (isFiveTwo ? fullMonthDynamicNorm : (Number(worker.standardHours || worker.standard_hours) || 195))
    : (Number(worker.standardHours || worker.standard_hours) || 195)

  let periodNormHours = monthNormHours
  if (period === '1-15') {
    const pStart = monthDayjs.clone().date(1)
    const pEnd = monthDayjs.clone().date(15)
    periodNormHours = isFiveTwo ? getDynamicStandardHours(pStart, pEnd) : Math.round(monthNormHours / 2)
  } else if (period === '16-end') {
    const pStart = monthDayjs.clone().date(16)
    periodNormHours = isFiveTwo ? getDynamicStandardHours(pStart, monthEnd) : Math.round(monthNormHours / 2)
  }

  const hoursBalance = totalHours - periodNormHours
  const percentOfNorm = periodNormHours > 0 ? Math.round((totalHours / periodNormHours) * 100) : 0

  let totalEarned = 0
  let formulaStr = ''
  let formulaExplanation = ''

  const vacNote = vacationHours > 0
    ? ` (из них работа: ${workedHours}ч + отпуск: ${vacationHours}ч за ${vacationPaidDays} опл. дн.)`
    : ''

  if (salaryType === 'fixed') {
    if (monthNormHours > 0) {
      const hourlyEquivalent = baseSalary / monthNormHours
      totalEarned = Math.round(hourlyEquivalent * totalHours)
      formulaStr = `(${baseSalary.toLocaleString('ru-RU')} ₽ ÷ ${monthNormHours} ч) × ${totalHours} ч = ${totalEarned.toLocaleString('ru-RU')} ₽`
      formulaExplanation = `Стоимость 1 часа: ${hourlyEquivalent.toFixed(2)} ₽${vacNote}`
    } else {
      totalEarned = baseSalary
      formulaStr = `${baseSalary.toLocaleString('ru-RU')} ₽`
      formulaExplanation = 'Фиксированный оклад' + vacNote
    }
  } else {
    totalEarned = Math.round(totalHours * hourlyRate)
    formulaStr = `${totalHours} ч × ${hourlyRate.toLocaleString('ru-RU')} ₽/ч = ${totalEarned.toLocaleString('ru-RU')} ₽`
    formulaExplanation = `Почасовая ставка: ${hourlyRate} ₽/ч${vacNote}`
  }

  return {
    id: worker.id,
    name: worker.name,
    color: worker.color || 'bg-zinc-700',
    salaryType,
    isFiveTwo,
    baseSalary,
    hourlyRate,
    period,
    periodLabel,
    shiftsCount,
    mainShiftsCount,
    koperShiftsCount,
    vacationDaysCount,
    vacationPaidDays,
    vacationZeroDays,
    workedHours,
    vacationHours,
    totalHours,
    periodNormHours,
    monthNormHours,
    normHours: monthNormHours,
    hoursBalance,
    percentOfNorm,
    totalEarned,
    formulaStr,
    formulaExplanation
  }
}

export function exportPayrollToExcel(payrollItems, monthTitle, periodLabel) {
  const rows = payrollItems.map((item, index) => ({
    '№': index + 1,
    'Сотрудник': item.name,
    'Тип графика': item.salaryType === 'fixed' ? (item.isFiveTwo ? 'Оклад (5/2)' : 'Оклад (195ч)') : 'Почасовая',
    'Оклад / Ставка (₽)': item.salaryType === 'fixed' ? item.baseSalary : item.hourlyRate,
    'Отработано (ч)': item.workedHours,
    'Отпуск опл. (ч)': item.vacationHours,
    'Всего в зачет (ч)': item.totalHours,
    'План периода (ч)': item.periodNormHours,
    'Баланс часов': item.hoursBalance >= 0 ? `+${item.hoursBalance}` : item.hoursBalance,
    'Рабочих смен': item.shiftsCount,
    'Дней отпуска (опл/0ч)': item.vacationDaysCount > 0 ? `${item.vacationPaidDays} / ${item.vacationZeroDays}` : '—',
    'Формула начисления': item.formulaStr,
    'К выплате (₽)': item.totalEarned
  }))

  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ведомость ЗП')

  worksheet['!cols'] = [
    { wch: 4 }, { wch: 22 }, { wch: 16 }, { wch: 16 },
    { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 14 },
    { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 38 }, { wch: 16 }
  ]

  const cleanMonth = monthTitle.replace(/\s+/g, '_')
  const cleanPeriod = periodLabel.replace(/[^a-zA-Z0-9а-яА-ЯёЁ_-]/g, '_')
  XLSX.writeFile(workbook, `Ведомость_${cleanMonth}_${cleanPeriod}.xlsx`)
}