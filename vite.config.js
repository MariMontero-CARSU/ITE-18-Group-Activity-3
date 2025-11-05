import { defineConfig } from "vite"

const isCodeSandbox = 'SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env
const isElectron = process.env.BUILD_TARGET === 'electron';

export default defineConfig({
    root: 'src/',
    publicDir: '../static/',
    base: isElectron ? './' : '/ITE-18-Group-Activity-3/',
    server:
    {
        host: true,
        open: !isCodeSandbox // Open if it's not a CodeSandbox
    },
    build:
    {
        outDir: '../dist',
        emptyOutDir: true,
        sourcemap: true
    }
})