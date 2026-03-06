import tsconfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const isUserOrOrgPagesRepo = repositoryName?.endsWith('.github.io')
const defaultBase =
    process.env.GITHUB_ACTIONS === 'true' && repositoryName && !isUserOrOrgPagesRepo
        ? `/${repositoryName}/`
        : '/'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    publicDir: 'public',
    base: process.env.VITE_BASE_PATH || defaultBase,
    build: {
        target: 'esNext',
        outDir: 'dist'
    },
    resolve: {
        alias: {
            '@entitites': fileURLToPath(new URL('./src/entitites', import.meta.url)),
            '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
            '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
            '@widgets': fileURLToPath(new URL('./src/widgets', import.meta.url)),
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@public': fileURLToPath(new URL('./public', import.meta.url)),
            '@shared': fileURLToPath(new URL('./src/shared', import.meta.url))
        }
    }
})
