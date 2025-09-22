import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    https: {
      key: fs.readFileSync(
        path.resolve(__dirname, "../server/cert/key.pem")
      ),
      cert: fs.readFileSync(
        path.resolve(__dirname, "../server/cert/cert.pem")
      ),
    },
    port: 5173,
    host: "0.0.0.0",
  },
});

// vite.config.ts
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import fs from 'fs';
// import path from 'path';

// export default defineConfig({
//   plugins: [react()],

// });
