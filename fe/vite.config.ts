import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import eslint from 'vite-plugin-eslint';
import vitePluginChecker from 'vite-plugin-checker';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // loads this Node process' entire env config, including env vars passed in through docker
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [react(), eslint(), viteTsconfigPaths(), vitePluginChecker({ typescript: true }), basicSsl()],
        server: {
            https: false,
            watch: {
                usePolling: true,
            },
            host: true, // needed for the Docker Container port mapping to work
            strictPort: true,
            port: parseInt(env.PORT, 10), // you can replace this port with any port
        },
    };
});
