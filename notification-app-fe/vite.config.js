import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api/notifications": {
        target: "http://4.224.186.213",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(
            /^\/api\/notifications/,
            "/evaluation-service/notifications",
          ),
      },
      "/api/logs": {
        target: "http://4.224.186.213",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/logs/, "/evaluation-service/logs"),
      },
    },
  },
});
