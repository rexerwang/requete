import path from 'node:path'

import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'

import { copy, generatePackageJson, getBanner } from './build/index.mjs'
import pkg from './package.json' assert { type: 'json' }

const banner = getBanner(pkg)
const commonPlugins = [
  typescript({ exclude: 'src/**/*.{test,spec}.ts' }),
  resolve(),
]

const dist = (file = '') => path.join('dist', file)
const min = (file) => {
  const ext = path.extname(file)
  return file.slice(0, -ext.length) + '.min' + ext
}

const useBabel = () =>
  babel({
    babelHelpers: 'bundled',
    presets: ['@babel/preset-env'],
  })

const setupModuleConfig = (file, external = /^requete/, exports = null) => {
  const module = pkg.exports[file === 'index' ? '.' : `./${file}`]
  const input = `src/${file}.ts`

  return [
    {
      input,
      external,
      output: {
        file: dist(module.import),
        format: 'es',
        generatedCode: { constBindings: true },
        banner,
      },
      plugins: commonPlugins,
    },
    {
      input,
      external,
      output: {
        file: dist(module.require),
        format: 'cjs',
        esModule: false,
        exports: 'named',
        outro: exports
          ? [
              `module.exports = ${exports.default};`,
              ...Object.entries(exports)
                .filter(([key]) => key !== 'default')
                .map(([key, value]) => `module.exports.${key} = ${value};`),
              'exports.default = module.exports;',
            ].join('\n')
          : '',
        generatedCode: { constBindings: true },
        banner,
      },
      plugins: commonPlugins.concat(useBabel()),
    },
    // define declaration
    ...(file === 'index'
      ? [
          {
            input,
            external,
            output: {
              dir: path.dirname(dist(pkg.types)),
              format: 'es',
              banner,
            },
            plugins: [
              typescript({
                rootDir: 'src',
                exclude: ['**/*.{test,spec}.ts'],
                declaration: true,
                emitDeclarationOnly: true,
                outDir: path.dirname(dist(pkg.types)),
              }),
              generatePackageJson({ src: pkg, dest: dist() }),
              copy([
                { src: 'LICENSE', dest: dist() },
                { src: 'README.md', dest: dist() },
                { src: '.npmignore', dest: dist() },
              ]),
            ],
          },
        ]
      : []),
  ]
}

const setupUMDConfig = (config) => {
  config.output.format = 'umd'
  config.output.banner = banner
  config.plugins = commonPlugins.concat(config.plugins ?? [], [useBabel()])

  return [
    config,
    {
      ...config,
      plugins: [...config.plugins, terser()],
      output: { ...config.output, file: min(config.output.file) },
    },
  ]
}

export default [].concat(
  setupModuleConfig('index', /^requete/, {
    default: 'index',
    RequestError: 'RequestError',
    Requete: 'Requete',
    TimeoutAbortController: 'TimeoutAbortController',
    create: 'create',
  }),
  setupModuleConfig('middleware'),
  setupModuleConfig('adapter'),
  setupModuleConfig('shared'),
  setupUMDConfig({
    input: 'src/global.mjs',
    output: {
      name: pkg.name,
      file: dist(pkg.browser),
    },
  }),
  setupUMDConfig({
    input: 'src/polyfill.mjs',
    output: {
      file: dist(pkg.exports['./polyfill']),
    },
  })
)
