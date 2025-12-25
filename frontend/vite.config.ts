import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const BACKEND_URL = process.env.VITE_BACKEND_URL || "http://localhost:3145";

// https://vite.dev/config/
export default defineConfig({
  // 设置子路径
  base: "/peano/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    host: "0.0.0.0", // 允许外部访问
    port: 5174,
    proxy: {
      "/api": {
        target: BACKEND_URL, // 你的后端地址（在电脑上运行）
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: BACKEND_URL, // 代理上传的静态文件
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
