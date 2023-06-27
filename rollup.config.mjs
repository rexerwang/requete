import path from 'node:path'

import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'

import {
  copy,
  generatePackageJson,
  getBanner,
  prevent,
  readJson,
} from './build/index.mjs'

const pkg = readJson('./package.json')
const banner = getBanner(pkg)
const commonPlugins = [
  typescript({ exclude: 'src/**/*.{test,spec}.ts' }),
  resolve(),
]

const dist = (file = '') => path.join('dist', file)

const dotWith = (text) => (file) => {
  const ext = path.extname(file)
  return file.slice(0, -ext.length) + '.' + text + ext
}

const useBabel = () =>
  babel({
    babelHelpers: 'bundled',
    presets: ['@babel/preset-env'],
  })

const withMinify = (config) => {
  const min = dotWith('min')
  return [
    config,
    {
      ...config,
      plugins: [...config.plugins, terser()],
      output: { ...config.output, file: min(config.output.file) },
    },
  ]
}

const setupModuleConfig = (file, option) => {
  const { target, external, exports } = Object.assign(
    {
      target: 'module',
      external: /^requete/,
      exports: null,
    },
    option
  )

  const module = pkg.exports[file === 'index' ? '.' : `./${file}`]
  const input = `src/${file}.ts`

  // define esm
  const mjs = {
    input,
    external,
    output: {
      file: dist(module.import),
      format: 'es',
      generatedCode: { constBindings: true },
      banner,
    },
    plugins: commonPlugins,
  }

  switch (target) {
    case 'module':
      return [
        mjs,
        // define commonjs
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
      ]

    case 'declaration':
      return {
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
          ]),
          prevent(['index.js']),
        ],
      }

    case 'browser':
      mjs.output.file = dotWith('browser')(mjs.output.file)
      return mjs

    default:
      throw new Error('invalid target')
  }
}

const setupUMDConfig = (config) => {
  config.output.format = 'umd'
  config.output.banner = banner
  config.plugins = commonPlugins.concat(config.plugins ?? [], [useBabel()])

  return withMinify(config)
}

const configs = {
  index: setupModuleConfig('index', {
    exports: {
      default: 'index',
      create: 'create',
      Requete: 'Requete',
      TimeoutAbortController: 'TimeoutAbortController',
      FetchAdapter: 'adapter.FetchAdapter',
      XhrAdapter: 'adapter.XhrAdapter',
      RequestError: 'shared.RequestError',
    },
  }),
  declaration: setupModuleConfig('index', { target: 'declaration' }),
  'index:browser': setupModuleConfig('index', {
    target: 'browser',
    external: null,
  }),
  middleware: setupModuleConfig('middleware'),
  adapter: setupModuleConfig('adapter'),
  shared: setupModuleConfig('shared'),
  global: setupUMDConfig({
    input: 'src/global.mjs',
    output: {
      name: pkg.name,
      file: dist(pkg.browser),
    },
  }),
  polyfill: setupUMDConfig({
    input: 'src/polyfill.mjs',
    output: {
      file: dist(pkg.exports['./polyfill']),
    },
  }),
}

export default () => configs[process.env.build]
