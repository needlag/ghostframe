import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const ghostframeSource = new URL("../../packages/ghostframe/src/index.ts", import.meta.url).pathname;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      ghostframe: ghostframeSource
    }
  }
});
