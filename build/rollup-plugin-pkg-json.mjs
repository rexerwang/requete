import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const includeFields = [
  'name',
  'version',
  'description',
  'type',
  'exports',
  'types',
  'main',
  'module',
  'browser',
  'keywords',
  'author',
  'files',
  'repository',
  'bugs',
  'homepage',
  'sideEffects',
  'peerDependencies',
  'dependencies',
  'engines',
  'publishConfig',
]

function prunePackageJson(pkg) {
  const prunedPkg = includeFields.reduce((pruned, field) => {
    if (pkg[field]) pruned[field] = pkg[field]
    return pruned
  }, {})

  return JSON.stringify(prunedPkg, null, 2)
}

export function generatePackageJson({ src, dest }) {
  const file = join(dest, 'package.json')
  const source = prunePackageJson(src)

  return {
    name: 'generate-package-json',
    async buildEnd() {
      await writeFile(file, source, 'utf-8')
      console.log(`created ${file}`)
    },
  }
}
