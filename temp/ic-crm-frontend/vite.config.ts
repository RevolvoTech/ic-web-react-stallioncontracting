import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs/promises';
import svgr from '@svgr/rollup';

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            src: resolve(__dirname, 'src'),
        },
    },
    esbuild: {
        loader: 'tsx',
        include: /src\/.*\.tsx?$/,
        exclude: [],
    },
    optimizeDeps: {
        esbuildOptions: {
            plugins: [
                {
                    name: 'load-js-files-as-tsx',
                    setup(build) {
                        build.onLoad(
                            { filter: /src\\.*\.js$/ },
                            async (args) => ({
                                loader: 'tsx',
                                contents: await fs.readFile(args.path, 'utf8'),
                            })
                        );
                    },
                },
            ],
        },
    },


    
    // plugins: [react(),svgr({
    //   exportAsDefault: true
    // })],

    plugins: [svgr(), react()],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) {
                        return undefined;
                    }

                    if (
                        id.includes('/react/') ||
                        id.includes('/react-dom/') ||
                        id.includes('/react-router/')
                    ) {
                        return 'react-vendor';
                    }

                    if (
                        id.includes('/@mui/') ||
                        id.includes('/@emotion/') ||
                        id.includes('/stylis-plugin-rtl/')
                    ) {
                        return 'mui-vendor';
                    }

                    if (
                        id.includes('/apexcharts/') ||
                        id.includes('/react-apexcharts/') ||
                        id.includes('/@mui/x-charts/')
                    ) {
                        return 'charts-vendor';
                    }

                    if (
                        id.includes('/react-big-calendar/') ||
                        id.includes('/date-fns/') ||
                        id.includes('/dayjs/') ||
                        id.includes('/moment/')
                    ) {
                        return 'calendar-vendor';
                    }

                    if (id.includes('/@tiptap/') || id.includes('/mui-tiptap/')) {
                        return 'editor-vendor';
                    }

                    if (id.includes('/@dnd-kit/') || id.includes('/@hello-pangea/dnd/')) {
                        return 'dnd-vendor';
                    }

                    if (id.includes('/i18next/') || id.includes('/react-i18next/')) {
                        return 'i18n-vendor';
                    }

                    if (
                        id.includes('/swr/') ||
                        id.includes('/formik/') ||
                        id.includes('/formik-mui/') ||
                        id.includes('/yup/') ||
                        id.includes('/lodash/')
                    ) {
                        return 'data-vendor';
                    }

                    return 'vendor';
                },
            },
        },
    },
});
