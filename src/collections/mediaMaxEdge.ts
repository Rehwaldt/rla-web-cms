import type { CollectionBeforeOperationHook } from 'payload'

// Uploaded images are stored at most this many pixels on their longest edge: the largest file the
// website serves is the original itself. Smaller images are stored untouched, byte for byte;
// Payload's own `upload.resizeOptions` would re-encode every image.
export const MAX_EDGE = 2800

/** The size to shrink an image to, or null when it already fits. */
export function cappedSize(width: number, height: number): { width: number; height: number } | null {
  const longest = Math.max(width, height)
  if (longest <= MAX_EDGE) return null
  const scale = MAX_EDGE / longest
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

// Formats sharp writes back as themselves. SVGs and PDFs aren't raster images; animated images
// are left alone.
const RESIZABLE = /^image\/(jpeg|png|webp|avif|tiff)$/

export const capImageSize: CollectionBeforeOperationHook = async ({ args, operation, req }) => {
  const file = req.file
  const sharp = req.payload.config.sharp
  if ((operation !== 'create' && operation !== 'update') || !file || !sharp || !RESIZABLE.test(file.mimetype)) {
    return args
  }
  const input = file.tempFilePath ?? file.data
  const { width = 0, height = 0, pages = 1 } = await sharp(input).metadata()
  if (pages > 1 || !cappedSize(width, height)) return args

  // rotate() applies the EXIF orientation first, as Payload does; resize() keeps the format.
  const { data } = await sharp(input)
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside' })
    .toBuffer({ resolveWithObject: true })
  req.file = { ...file, data, size: data.length, tempFilePath: undefined }
  return args
}
