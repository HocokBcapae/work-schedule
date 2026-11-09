import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "./", // <-- ГАРАНТИЯ РАБОТЫ НА GITHUB PAGES БЕЗ БЕЛОГО ЭКРАНА
  plugins: [vue(), tailwindcss()],
});
