import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    // Phone opens `http://<LAN-IP>:5173` — do not reject the Host header.
    allowedHosts: true,
  },
});
