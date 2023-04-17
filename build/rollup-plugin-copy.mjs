import { copyFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'

export function copy(config) {
  const patterns = [].concat(config)

  return {
    name: 'copy',
    async buildEnd() {
      await Promise.all(
        patterns.map(({ src, dest }) =>
          copyFile(src, resolve(dest, basename(src))).then(() =>
            console.log(`copy ${src} -> ${dest}`)
          )
        )
      )
    },
  }
}
