import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: Number(process.env.FRONTEND_PORT) || 3120,
        proxy: {
            "/api": {
                target: `http://localhost:${process.env.PORT}`,
                changeOrigin: true,
                secure: false,
            },
        },
    },
    build:{
        sourceMap: false,
        minify: "terser",
        rollupOptions: {
            output: {
                manualChunks(id: { includes: (arg0: string) => any; toString: () => string; }) {
                    if (id.includes('node_modules')) {
                        return id.toString().split('node_modules/')[1].split('/')[0];
                    }
                }
            }
        }
        
    }
});
