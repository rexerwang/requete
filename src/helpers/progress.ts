import type { IProgressEvent } from '../adapter/XhrAdapter'

/**
 * Calculate data maxRate
 *
 * Forked: https://github.com/axios/axios/blob/6f360a2531d8d70363fd9becef6a45a323f170e2/lib/helpers/speedometer.js
 */
function speedometer(samplesCount = 10, min = 1000) {
  const bytes = new Array(samplesCount)
  const timestamps = new Array(samplesCount)
  let head = 0
  let tail = 0
  let firstSampleTS: number

  return function push(chunkLength: number) {
    const now = Date.now()

    const startedAt = timestamps[tail]

    if (!firstSampleTS) {
      firstSampleTS = now
    }

    bytes[head] = chunkLength
    timestamps[head] = now

    let i = tail
    let bytesCount = 0

    while (i !== head) {
      bytesCount += bytes[i++]
      i = i % samplesCount
    }

    head = (head + 1) % samplesCount

    if (head === tail) {
      tail = (tail + 1) % samplesCount
    }

    if (now - firstSampleTS < min) {
      return
    }

    const passed = startedAt && now - startedAt

    return passed ? Math.round((bytesCount * 1000) / passed) : undefined
  }
}

/**
 * Forked: https://github.com/axios/axios/blob/6f360a2531d8d70363fd9becef6a45a323f170e2/lib/adapters/xhr.js#L17
 */
export function progressEventReducer(
  listener: (e: IProgressEvent) => void,
  isDownload?: boolean
) {
  let bytesNotified = 0
  const _speedometer = speedometer(50, 250)

  return (e: any) => {
    const loaded = e.loaded
    const total = e.lengthComputable ? e.total : undefined
    const progressBytes = loaded - bytesNotified
    const rate = _speedometer(progressBytes)
    const inRange = loaded <= total

    bytesNotified = loaded

    listener({
      download: !!isDownload,
      upload: !isDownload,
      loaded,
      total,
      progress: total ? loaded / total : undefined,
      bytes: progressBytes,
      rate: rate ? rate : undefined,
      estimated: rate && total && inRange ? (total - loaded) / rate : undefined,
      event: e,
    })
  }
}
