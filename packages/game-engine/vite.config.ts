import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

/**
 * Builds the Phaser renderer into ONE self-contained index.html (JS/CSS
 * inlined, no external file references). That single string is what gets
 * embedded into the RN WebView via `source={{ html }}` - avoiding any
 * relative-path/asset-bundling issues that a multi-file build would hit
 * inside a packaged mobile app.
 */
export default defineConfig({
  base: "./",
  plugins: [viteSingleFile()],
  build: {
    target: "es2018",
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
  },
});
