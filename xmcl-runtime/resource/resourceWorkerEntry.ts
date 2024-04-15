import { checksum } from '@xmcl/core'
import fs from 'fs'
import { gracefulify } from 'graceful-fs'
import { copyPassively } from '~/util/fs'
import { hashAndFiletypeResource, hashResource } from './core/hashResource'
import { ResourceParser } from './parsers'
import { setHandler } from '../worker/helper'
import type { ResourceWorker } from './worker'
import * as mmhash from '@xmcl/murmurhash2/wasm'
import { Duplex } from 'stream'
import { readFile } from 'fs-extra'

const mmhashmod = WebAssembly.compile(mmhash).then(m => {
  return WebAssembly.instantiate(m)
}).then(i => {
  return i.exports
})

gracefulify(fs)

const parser = new ResourceParser()

function isWhitespaceCharacter(b: number): boolean {
  return b === 9 || b === 10 || b === 13 || b === 32
}
function normalizeBuffer(buf: Buffer): Buffer {
  const newArray = []
  for (const b of buf) {
    if (!isWhitespaceCharacter(b)) {
      newArray.push(b)
    }
  }
  return Buffer.from(newArray)
}

const m = BigInt(0x5bd1e995)
const r = BigInt(24)
function murmurHash2(buf: Buffer, seed: number = 1): bigint {
  let length = buf.length

  if (length === 0) {
    return BigInt(0)
  }

  let h = BigInt(seed ^ length)
  let currentIndex = 0
  while (length >= 4) {
    let k = BigInt(buf[currentIndex++] | (buf[currentIndex++] << 8) | (buf[currentIndex++] << 16) | (buf[currentIndex++] << 24))
    k = k * m
    k ^= k >> r
    k *= m

    h *= m
    h ^= k
    length -= 4
  }
  switch (length) {
    case 3:
      h ^= BigInt(buf[currentIndex++] | buf[currentIndex++] << 8)
      h ^= BigInt(buf[currentIndex]) << 16n
      h *= m
      break
    case 2:
      h ^= BigInt(buf[currentIndex++] | buf[currentIndex++] << 8)
      h *= m
      break
    case 1:
      h ^= BigInt(buf[currentIndex])
      h *= m
      break
    default:
      break
  }
  h ^= h >> 13n
  h *= m
  h ^= h >> 15n
  return h
}

async function fingerprint(filePath: string) {
  const buf = await readFile(filePath)
  const normalized = normalizeBuffer(buf)
  const hash = murmurHash2(normalized)
  return hash.toString()
}

async function fingerprint2(filePath: string) {
  const buf = await readFile(filePath)
  const normalized = normalizeBuffer(buf)
  const mod = await mmhashmod
  const hash = murmurHash2(normalized)
  return hash.toString()
}

const handlers: ResourceWorker = {
  checksum: (path, algorithm) => checksum(path, algorithm),
  fingerprint,
  fingerprint2,
  hash: (file, size) => hashResource(file, size),
  parse: (args) => parser.parse(args),
  async copyPassively(files): Promise<void> {
    await Promise.all(files.map(({ src, dest }) => copyPassively(src, dest)))
  },
  hashAndFileType: (file, size) => hashAndFiletypeResource(file, size),
}
setHandler(handlers)
