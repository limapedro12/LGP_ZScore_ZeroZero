// filepath: /home/tomas/Uni/4ano/LGP/LGP-17/fe/vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import eslint from 'vite-plugin-eslint';
import vitePluginChecker from 'vite-plugin-checker';
import viteTsconfigPaths from 'vite-tsconfig-paths';
// import basicSsl from '@vitejs/plugin-basic-ssl'; // Remove this line

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // loads this Node process' entire env config, including env vars passed in through docker
    const env = loadEnv(mode, process.cwd(), '');

    return {
        // Remove basicSsl from the plugins array
        plugins: [react(), eslint(), viteTsconfigPaths(), vitePluginChecker({ typescript: true })],
        server: {
            https: false, // Keep this or remove if default is false
            watch: {
                usePolling: true,
            },
            host: true, // needed for the Docker Container port mapping to work
            strictPort: true,
            port: parseInt(env.PORT, 10), // you can replace this port with any port
        },
        css: {
            preprocessorOptions: {
                scss: {
                    silenceDeprecations: ['mixed-decls', 'color-functions', 'global-builtin', 'import'],
                },
            },
        },
    };
});
