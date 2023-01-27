import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from "@rollup/plugin-json";
import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import eslint from '@rollup/plugin-eslint';
import typescript from '@rollup/plugin-typescript';
import nodePolyfills from 'rollup-plugin-polyfill-node';

const isPro = process.env.NODE_ENV === 'production'

export default {
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/lib/index.js',
            format: 'cjs',
        },
        {
            file: 'dist/es/index.js',
            format: 'esm',
        },
        {
            file: 'dist/umd/index.js',
            format: 'umd',
            // script标签的形式引入时，全局变量的模块名
            name: 'utils',
        },
    ],
    onwarn(warning, warn) {
        if (warning.code === 'THIS_IS_UNDEFINED') return;
        warn(warning);
    },
    plugins: [
        nodeResolve(),  // 这样 Rollup 能找到 `ms`
        commonjs(), // 这样 Rollup 能转换 `ms` 为一个ES模块
        eslint({
            throwOnError: true,
            throwOnWarning: true,
            include: ['src/**'],
            exclude: 'node_modules/**',
        }),
        typescript({sourceMap: !isPro, inlineSources: !isPro}),
        babel({
            babelHelpers: 'runtime',       // 使plugin-transform-runtime生效
            exclude: 'node_modules/**', // 防止打包node_modules下的文件
        }),
        isPro && terser(),
        json({compact: true,}),
        nodePolyfills( /* options */ ),
    ]
};
