export function getBanner(pkg) {
  const now = new Date()
  const banner = `/*
 * ${pkg.name} v${pkg.version}
 * Copyright ${now.getFullYear()} ${pkg.author}
 * Released under the ${pkg.license} license
 *
 * Date: ${now.toISOString()}
 */`

  return banner
}
