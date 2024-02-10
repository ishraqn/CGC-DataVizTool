import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: Number(process.env.FRONTEND_PORT),
        proxy: {
            "/api": {
                target: `http://localhost:${process.env.PORT}`,
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
