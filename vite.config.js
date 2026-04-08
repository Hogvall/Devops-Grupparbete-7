import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        meeting: 'meeting.html',
        createMeeting: 'create-meeting.html'
      }
    }
  }
});