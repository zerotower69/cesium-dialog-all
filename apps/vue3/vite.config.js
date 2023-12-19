import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';
import { loadEnv } from 'vite';
import Unocss from 'unocss/vite';
import vueJsx from '@vitejs/plugin-vue-jsx';
import legacy from '@vitejs/plugin-legacy';
import pkg from './package.json';
import dayjs from 'dayjs';
import { createHtmlPlugin } from 'vite-plugin-html';
import { viteExternalsPlugin } from 'vite-plugin-externals';

const CWD = process.cwd();

const __APP_INFO__ = {
  pkg,
  lastBuildTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
};

// https://vitejs.dev/config/

/**
 * 打包配置
 * @param {import('vite').ConfigEnv} config
 * @return {import('vite').UserConfig}
 */
export default (config) => {
  const { command, mode } = config;
  // 环境变量
  const { VITE_BASE_URL, VITE_DROP_CONSOLE } = loadEnv(mode, CWD);

  const isBuild = command === 'build';

  return {
    base: VITE_BASE_URL,
    define: {
      __APP_INFO__: JSON.stringify(__APP_INFO__),
    },
    resolve: {
      alias: [
        {
          find: '@',
          replacement: resolve(__dirname, './src'),
        },
      ],
    },
    server: {
      host: 'localhost',
      port: 8888,
      hmr: true, //启用热更新
    },
    plugins: [
      vue(),
      Unocss(),
      vueJsx({
        // options are passed on to @vue/babel-plugin-jsx
      }),
      createHtmlPlugin({
        minify: true,
        inject: {
          data: {
            title: 'vue3 demo快速模版',
          },
        },
      }),
      viteExternalsPlugin({
        cesium: 'Cesium',
      }),
      legacy({
        targets: ['defaults', 'not IE 11', 'chrome 79', 'maintained node versions'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
        // 根据你自己需要导入相应的polyfill:  https://github.com/vitejs/vite/tree/main/packages/plugin-legacy#polyfill-specifiers
        modernPolyfills: ['es.promise.finally', 'es/array', 'es/map', 'es/set'],
      }),
    ],
    //优化
    optimizeDeps: {
      include: [],
    },
    esbuild: {
      pure: VITE_DROP_CONSOLE ? ['console.log', 'debugger'] : [],
      supported: {
        // https://github.com/vitejs/vite/pull/8665
        'top-level-await': true,
      },
    },
    //构建目标
    build: {
      target: 'es2017',
      minify: 'esbuild',
      cssTarget: 'chrome79',
      chunkSizeWarningLimit: 2000,
      outDir: 'build',
    },
  };
};
