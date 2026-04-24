import { resolve } from "path";
import { defineConfig } from "vite";
import { copyFileSync, mkdirSync, existsSync } from "fs";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        profile: resolve(__dirname, "profile.html"),
        tutorials: resolve(__dirname, "tutorials.html"),
        tutorialViewer: resolve(__dirname, "tutorial-viewer.html"),
        resourcesIndex: resolve(__dirname, "resources/index.html"),
        resourcesMap: resolve(__dirname, "resources/map.html"),
        resourcesTrajectories: resolve(
          __dirname,
          "resources/trajectories_v2.html",
        ),
        resourcesIncidents: resolve(__dirname, "resources/incidents.html"),
        resourcesCommunity: resolve(__dirname, "resources/community.html"),
      },
    },
  },
  plugins: [
    {
      name: "copy-static-resources",
      closeBundle() {
        const distRes = resolve(__dirname, "dist/resources");
        if (!existsSync(distRes)) mkdirSync(distRes, { recursive: true });
        // Copy non-module scripts and CSS that Vite can't bundle
        const files = ["_shared.js", "_shared.css", "_inc_data.js"];
        files.forEach((f) => {
          const src = resolve(__dirname, "resources", f);
          if (existsSync(src)) copyFileSync(src, resolve(distRes, f));
        });
        // Also copy images referenced in HTML
        const rootFiles = ["2026-04-08_164957.png"];
        rootFiles.forEach((f) => {
          const src = resolve(__dirname, f);
          if (existsSync(src)) copyFileSync(src, resolve(__dirname, "dist", f));
        });
      },
    },
  ],
});
