import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from "@rollup/plugin-json"
export default {
    input: './src/index.ts',
    output: [
        {
            file: 'dist/bundle.cjs.js',
            format: 'cjs',
            sourcemap: true,
        },
        {
            file: 'dist/bundle.esm.js',
            format: 'esm',
            sourcemap: true,
        },
        {
            file: 'dist/bundle.umd.js',
            format: 'umd',
            name: 'YeYingWeb3',
            sourcemap: true,
        },
    ],
    onwarn(warning, warn) {
        if (warning.code === 'THIS_IS_UNDEFINED') return;
        warn(warning);
    },
    plugins: [
        typescript(),
        resolve({browser: true}),
        commonjs(),
        json()
    ],
    external: [], // 在这里添加你的外部依赖
};
