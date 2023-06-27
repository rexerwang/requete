/**
 * prevent to generate files
 * @param {string[]} files
 * @returns {import('rollup').Plugin}
 */
export function prevent(files) {
  return {
    name: 'prevent',
    generateBundle(_options, bundle) {
      files.forEach((file) => {
        if (bundle[file]) delete bundle[file]
      })
    },
  }
}
