import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export function readJson(file) {
  return JSON.parse(readFileSync(resolve(file)))
}
