import { defineConfig } from "vitest/config";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        meeting: resolve(__dirname, "meeting.html"),
        createMeeting: resolve(__dirname, "create-meeting.html"),
        profile: resolve(__dirname, "profile.html"),
        login: 'login.html',      
        calendar: 'calendar.html' 
      },
    },
  },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.js"],
    exclude: ["tests/e2e/**"],
  },
});
