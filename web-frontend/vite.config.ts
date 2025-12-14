import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 3000,
      host: true,
      strictPort: true, // Listen on all network interfaces
      allowedHosts: [
        ".ngrok-free.app", // Allow all ngrok domains
        ".ngrok.io",
        ".trycloudflare.com",
      ],
    },
    plugins: [react()],
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    optimizeDeps: {
      exclude: ["src/types.ts"],
      esbuildOptions: {
        charset: "utf8",
      },
    },
  };
});
