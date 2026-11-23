import { ref } from "vue";
import { supabase } from "../lib/supabase";

export const WORKERS = ref([]);
export const shifts = ref([]);
export const wishes = ref([]);
export const swapRequests = ref([]);
export const isLoading = ref(false);
import dayjs from 'dayjs'

// Загрузка всех данных из Supabase
export async function loadInitialData() {
  isLoading.value = true;
  try {
    const [
      { data: usersData, error: usersErr },
      { data: shiftsData, error: shiftsErr },
      { data: wishesData, error: wishesErr },
      { data: swapsData, error: swapsErr },
    ] = await Promise.all([
      supabase
        .from("users")
        .select("*")
        .order("sort_order", { ascending: true }),
      supabase.from("shifts").select("*"),
      supabase.from("wishes").select("*"),
      supabase.from("swap_requests").select("*"),
    ]);

    if (usersErr) console.error("Ошибка пользователей:", usersErr);
    if (shiftsErr) console.error("Ошибка смен:", shiftsErr);

    if (usersData) {
      WORKERS.value = usersData.map((u) => ({
        id: u.id,
        name: u.name,
        role: u.role,
        color: u.color || "bg-zinc-700",
        passcode: u.passcode,
        sortOrder: u.sort_order ?? 0,
        salaryType: u.salary_type || "fixed",
        isFiveTwo: Boolean(u.is_five_two),
        baseSalary: Number(u.base_salary) || 0,
        standardHours: Number(u.standard_hours) || 195,
        hourlyRate: Number(u.hourly_rate) || 300,
      }));
    }

    if (shiftsData) {
      shifts.value = shiftsData.map((s) => ({
        id: s.id,
        userId: s.user_id,
        date: s.date,
        time: s.time || "10:00–20:00",
        hours: s.hours !== null && s.hours !== undefined ? Number(s.hours) : 10,
        shiftType: s.shift_type || "main",
      }));
    }

    if (wishesData) {
      wishes.value = wishesData.map((w) => ({
        id: w.id,
        userId: w.user_id,
        date: w.date,
        type: w.type,
      }));
    }

    if (swapsData) {
      swapRequests.value = swapsData.map((sw) => ({
        id: sw.id,
        fromUserId: sw.from_user_id,
        fromShiftId: sw.from_shift_id,
        targetUserId: sw.target_user_id,
        status: sw.status,
        date: sw.date,
        time: sw.time,
      }));
    }
  } catch (err) {
    console.error("Критическая ошибка loadInitialData:", err);
  } finally {
    isLoading.value = false;
  }
}

// Realtime веб-сокет
export function initRealtime() {
  supabase.removeAllChannels();
  supabase
    .channel("public:schedule")
    .on("postgres_changes", { event: "*", schema: "public" }, async () => {
      await loadInitialData();
    })
    .subscribe();
}

// Хелперы
export function getShift(userId, dateStr) {
  return shifts.value.find((s) => s.userId === userId && s.date === dateStr);
}

export function hasDayOffWish(userId, dateStr) {
  return wishes.value.some(
    (w) => w.userId === userId && w.date === dateStr && w.type === "day_off",
  );
}

// 3-позиционный клик по смене: Пусто -> main -> koper -> Удалить
export async function cycleShift(
  userId,
  dateStr,
  hours = 10,
  time = "10:00–20:00",
) {
  const existing = getShift(userId, dateStr);

  if (!existing) {
    const newId =
      "s_" + Date.now() + Math.random().toString(36).substring(2, 7);
    const newShift = {
      id: newId,
      userId,
      date: dateStr,
      time,
      hours,
      shiftType: "main",
    };
    shifts.value.push(newShift);

    const { error } = await supabase.from("shifts").insert([
      {
        id: newId,
        user_id: userId,
        date: dateStr,
        time,
        hours,
        shift_type: "main",
      },
    ]);

    if (error) {
      console.error("Ошибка базы:", error);
      shifts.value = shifts.value.filter((s) => s.id !== newId);
      alert("Ошибка при сохранении смены: " + error.message);
    }
  } else if (existing.shiftType === "main") {
    existing.shiftType = "koper";
    const { error } = await supabase
      .from("shifts")
      .update({ shift_type: "koper" })
      .eq("id", existing.id);

    if (error) {
      console.error("Ошибка обновления:", error);
      existing.shiftType = "main";
      alert("Ошибка при смене типа: " + error.message);
    }
  } else {
    const prevShift = { ...existing };
    shifts.value = shifts.value.filter((s) => s.id !== existing.id);
    const { error } = await supabase
      .from("shifts")
      .delete()
      .eq("id", prevShift.id);

    if (error) {
      console.error("Ошибка удаления:", error);
      shifts.value.push(prevShift);
      alert("Ошибка удаления: " + error.message);
    }
  }
}

// Точное обновление смены (время, часы, тип)
export async function updateShiftDetails(shiftId, { time, hours, shiftType }) {
  const shift = shifts.value.find((s) => s.id === shiftId);
  if (!shift) return;

  const prevTime = shift.time;
  const prevHours = shift.hours;
  const prevType = shift.shiftType;

  if (time !== undefined) shift.time = time;
  if (hours !== undefined) shift.hours = Number(hours);
  if (shiftType !== undefined) shift.shiftType = shiftType;

  const { error } = await supabase
    .from("shifts")
    .update({
      time: shift.time,
      hours: shift.hours,
      shift_type: shift.shiftType,
    })
    .eq("id", shiftId);

  if (error) {
    console.error("Ошибка обновления смены:", error);
    shift.time = prevTime;
    shift.hours = prevHours;
    shift.shiftType = prevType;
    alert("Не удалось сохранить изменения: " + error.message);
  }
}

// Прямое удаление смены
export async function deleteShiftById(shiftId) {
  const prevShift = shifts.value.find((s) => s.id === shiftId);
  shifts.value = shifts.value.filter((s) => s.id !== shiftId);

  const { error } = await supabase.from("shifts").delete().eq("id", shiftId);
  if (error) {
    console.error("Ошибка удаления:", error);
    if (prevShift) shifts.value.push(prevShift);
    alert("Ошибка удаления: " + error.message);
  }
}

// Перенос / обмен смен (Drag & Drop)
export async function moveOrSwapShift(fromUserId, fromDate, toUserId, toDate) {
  if (fromUserId === toUserId && fromDate === toDate) return;

  const shiftA = getShift(fromUserId, fromDate);
  if (!shiftA) return;
  const shiftB = getShift(toUserId, toDate);

  if (shiftB) {
    shiftB.userId = fromUserId;
    shiftB.date = fromDate;
  }
  shiftA.userId = toUserId;
  shiftA.date = toDate;

  try {
    if (shiftB) {
      await supabase
        .from("shifts")
        .update({ user_id: fromUserId, date: fromDate })
        .eq("id", shiftB.id);
    }
    await supabase
      .from("shifts")
      .update({ user_id: toUserId, date: toDate })
      .eq("id", shiftA.id);
  } catch (err) {
    console.error("Ошибка переноса смен:", err);
    await loadInitialData();
  }
}

// Сохранение порядка строк сотрудников
export async function updateWorkersOrder(newOrderedWorkers) {
  WORKERS.value = newOrderedWorkers;
  const updates = newOrderedWorkers.map((w, index) =>
    supabase.from("users").update({ sort_order: index }).eq("id", w.id),
  );
  await Promise.all(updates);
}

// Пожелания выходных
export async function toggleWish(userId, dateStr) {
  const existing = wishes.value.find(
    (w) => w.userId === userId && w.date === dateStr,
  );
  if (existing) {
    wishes.value = wishes.value.filter((w) => w.id !== existing.id);
    await supabase.from("wishes").delete().eq("id", existing.id);
  } else {
    const wishId =
      "w_" + Date.now() + Math.random().toString(36).substring(2, 7);
    wishes.value.push({ id: wishId, userId, date: dateStr, type: "day_off" });

    const { error } = await supabase.from("wishes").insert([
      {
        id: wishId,
        user_id: userId,
        date: dateStr,
        type: "day_off",
      },
    ]);

    if (error) {
      console.error("Ошибка пожелания:", error);
      wishes.value = wishes.value.filter((w) => w.id !== wishId);
      alert("Ошибка сохранения выходного: " + error.message);
    }
  }
}


// Массовое назначение отпуска периодом (например, неделя: 5 опл. + 2 Отп 0ч)
export async function assignVacationPeriod(userId, startDateStr, endDateStr, paidHours = 10, autoZeroWeekends = true) {
  let day = dayjs(startDateStr)
  const end = dayjs(endDateStr)
  if (!day.isValid() || !end.isValid() || day.isAfter(end)) return

  const toInsert = []
  const toUpdate = []
  let idx = 0

  while (day.isBefore(end) || day.isSame(end, 'day')) {
    const dateStr = day.format('YYYY-MM-DD')
    const isWeekend = day.day() === 0 || day.day() === 6
    const dayHours = (autoZeroWeekends && isWeekend) ? 0 : Number(paidHours)
    const timeLabel = dayHours === 0 ? 'Отп 0ч' : 'Отпуск'

    const existing = getShift(userId, dateStr)
    if (existing) {
      existing.shiftType = 'vacation'
      existing.hours = dayHours
      existing.time = timeLabel
      toUpdate.push({ id: existing.id, time: timeLabel, hours: dayHours, shift_type: 'vacation' })
    } else {
      const newId = `s_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`
      const newShift = { id: newId, userId, date: dateStr, time: timeLabel, hours: dayHours, shiftType: 'vacation' }
      shifts.value.push(newShift)
      toInsert.push({ id: newId, user_id: userId, date: dateStr, time: timeLabel, hours: dayHours, shift_type: 'vacation' })
    }

    idx++
    day = day.add(1, 'day')
  }

  try {
    if (toInsert.length > 0) {
      const { error } = await supabase.from('shifts').insert(toInsert)
      if (error) throw error
    }
    if (toUpdate.length > 0) {
      await Promise.all(
        toUpdate.map(item =>
          supabase.from('shifts').update({ time: item.time, hours: item.hours, shift_type: item.shift_type }).eq('id', item.id)
        )
      )
    }
  } catch (err) {
    console.error('Ошибка назначения отпуска:', err)
    alert('Ошибка сохранения отпуска: ' + err.message)
    await loadInitialData()
  }
}
