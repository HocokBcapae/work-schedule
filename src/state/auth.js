import { ref } from "vue";
import { supabase } from "../lib/supabase";

const STORAGE_KEY = "work_schedule_user";

function loadSavedUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const currentUser = ref(loadSavedUser());

export async function loginByPasscode(passcode) {
  const code = String(passcode || "").trim();
  if (!code) {
    return { success: false, error: "Введите пин-код или пароль" };
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("passcode", code)
      .maybeSingle();

    if (error) {
      return {
        success: false,
        error: "Ошибка соединения с базой: " + error.message,
      };
    }

    if (!data) {
      return { success: false, error: "Неверный пароль или пин-код" };
    }

    const userObj = {
      id: data.id,
      name: data.name,
      role: data.role,
      color: data.color || "bg-zinc-700",
      passcode: data.passcode,
      salaryType: data.salary_type || "fixed",
      isFiveTwo: Boolean(data.is_five_two),
      baseSalary: Number(data.base_salary) || 0,
      standardHours: Number(data.standard_hours) || 195,
      hourlyRate: Number(data.hourly_rate) || 300,
    };

    currentUser.value = userObj;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userObj));
    return { success: true, user: userObj };
  } catch (err) {
    return { success: false, error: "Ошибка сети: " + err.message };
  }
}

export function logout() {
  currentUser.value = null;
  localStorage.removeItem(STORAGE_KEY);
}
