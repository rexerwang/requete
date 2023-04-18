import path from 'node:path'

import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'

import { copy, generatePackageJson, getBanner } from './build/index.mjs'
import pkg from './package.json' assert { type: 'json' }

const banner = getBanner(pkg)

const dist = (file = '') => path.join('dist', file)

const useBabel = () =>
  babel({ babelHelpers: 'bundled', presets: ['@babel/preset-env'] })

const withMinify = (config) => {
  const min = (file) => {
    const ext = path.extname(file)
    return file.slice(0, -ext.length) + '.min' + ext
  }

  const { plugins, output } = config

  plugins.push(resolve(), useBabel())

  return [
    config,
    {
      ...config,
      plugins: [...plugins, terser()],
      output: { ...output, file: min(output.file) },
    },
  ]
}

export default [
  ...withMinify({
    input: 'src/global.ts',
    output: {
      name: pkg.name,
      file: dist(pkg.browser),
      format: 'umd',
      banner,
    },
    plugins: [typescript()],
  }),
  {
    input: 'src/global.ts',
    external: ['query-string'],
    output: {
      file: dist(pkg.main),
      format: 'cjs',
      generatedCode: { constBindings: true, objectShorthand: true },
      banner,
    },
    plugins: [typescript()],
  },
  {
    input: 'src/index.ts',
    external: ['query-string'],
    output: {
      file: dist(pkg.module),
      format: 'es',
      generatedCode: { constBindings: true, objectShorthand: true },
      banner,
    },
    plugins: [typescript()],
  },
  {
    input: './temp/src/index.d.ts',
    output: { file: dist(pkg.types), format: 'es', banner },
    plugins: [
      dts(),
      generatePackageJson({ src: pkg, dest: dist() }),
      copy([
        { src: 'LICENSE', dest: dist() },
        { src: 'README.md', dest: dist() },
      ]),
    ],
  },
  ...withMinify({
    input: 'src/polyfill.mjs',
    output: {
      file: dist(pkg.exports['./polyfill']),
      format: 'umd',
      banner,
    },
    plugins: [],
  }),
]
