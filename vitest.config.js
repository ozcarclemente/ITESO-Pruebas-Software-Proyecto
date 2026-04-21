import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [react()],
        test: {
          name: 'frontend',
          root: './frontend',
          globals: true,
          environment: "jsdom",
          setupFiles: "src/setupTests.js",
          css: true,
        },
      },
      {
        test: {
          name: 'backend',
          root: './backend',
          globals: true,
          environment: "node",
          setupFiles: "tests/setupTests.js",
        },
      },
    ],
  },
});