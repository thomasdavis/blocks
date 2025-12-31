import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/button/index.ts",
    "src/dialog/index.ts",
    "src/tabs/index.ts",
    "src/tooltip/index.ts",
    "src/menu/index.ts",
    "src/select/index.ts",
    "src/accordion/index.ts",
    "src/checkbox/index.ts",
    "src/radio/index.ts",
    "src/switch/index.ts",
    "src/input/index.ts",
    "src/popover/index.ts",
    "src/progress/index.ts",
    "src/slider/index.ts",
    "src/card/index.ts",
    "src/badge/index.ts",
    "src/banner/index.ts",
    "src/code-block/index.ts",
    "src/loading-dots/index.ts",
    "src/timeline/index.ts",
    "src/copy-button/index.ts",
  ],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: true,
  treeshake: true,
  external: ["react", "react-dom"],
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
});
