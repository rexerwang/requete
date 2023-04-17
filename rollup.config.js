import { babel } from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'

import pkg from './package.json' assert { type: 'json' }

export default [
  {
    input: 'src/index.ts',
    output: {
      name: 'HttpRequest',
      file: pkg.browser,
      format: 'umd',
    },
    plugins: [
      typescript(),
      resolve(),
      commonjs(),
      babel({ babelHelpers: 'bundled', presets: ['@babel/preset-env'] }),
      terser(),
    ],
  },
  {
    input: 'src/index.ts',
    external: ['query-string'],
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' },
    ],
    plugins: [typescript(), terser()],
  },
  {
    input: './temp/src/index.d.ts',
    output: [{ file: pkg.types, format: 'es' }],
    plugins: [dts()],
  },
  {
    input: 'src/polyfill.js',
    output: {
      file: 'dist/polyfill.js',
      format: 'umd',
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({ babelHelpers: 'bundled', presets: ['@babel/preset-env'] }),
      terser(),
    ],
  },
]
