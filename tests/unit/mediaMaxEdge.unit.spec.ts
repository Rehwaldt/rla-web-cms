import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { cappedSize, capImageSize, MAX_EDGE } from '@/collections/mediaMaxEdge'

describe('cappedSize', () => {
  it('leaves images within the longest edge alone', () => {
    expect(cappedSize(2800, 2800)).toBeNull()
    expect(cappedSize(2800, 1698)).toBeNull()
    expect(cappedSize(680, 340)).toBeNull()
  })

  it('shrinks the longest edge to the maximum, keeping the aspect ratio', () => {
    expect(cappedSize(19431, 5000)).toEqual({ width: MAX_EDGE, height: 720 })
    expect(cappedSize(2800, 3723)).toEqual({ width: 2106, height: MAX_EDGE })
    expect(cappedSize(1000, 11440)).toEqual({ width: 245, height: MAX_EDGE })
  })
})

describe('capImageSize', () => {
  const image = (width: number, height: number, format: 'jpeg' | 'png') =>
    sharp({ create: { width, height, channels: 3, background: '#4a7' } })
      .toFormat(format)
      .toBuffer()

  const run = async (data: Buffer, mimetype: string, operation = 'create') => {
    const file = { data, mimetype, name: 'test', size: data.length }
    const req = { file, payload: { config: { sharp } } }
    await capImageSize({ args: {}, operation, req } as never)
    return { file: req.file, untouched: req.file === file }
  }

  it('shrinks an oversized image and keeps its format', async () => {
    const { file } = await run(await image(4000, 1000, 'png'), 'image/png')
    expect(await sharp(file.data).metadata()).toMatchObject({ width: MAX_EDGE, height: 700, format: 'png' })
    expect(file.size).toBe(file.data.length)
  })

  it('caps tall images by their height', async () => {
    const { file } = await run(await image(1000, 3600, 'jpeg'), 'image/jpeg', 'update')
    expect(await sharp(file.data).metadata()).toMatchObject({ width: 778, height: MAX_EDGE, format: 'jpeg' })
  })

  it('stores images that fit byte for byte', async () => {
    expect((await run(await image(MAX_EDGE, 1698, 'jpeg'), 'image/jpeg')).untouched).toBe(true)
  })

  it('skips files that are not raster images', async () => {
    expect((await run(Buffer.from('%PDF-1.4'), 'application/pdf')).untouched).toBe(true)
    expect((await run(Buffer.from('<svg/>'), 'image/svg+xml')).untouched).toBe(true)
  })
})
