import { PlatformSpec } from '../types/platform'
import { Tile } from '../types/tile'

export interface ImportOptions {
    dither: boolean
    cleanup?: boolean
}

export interface ImportResult {
    tiles: Tile[]
    mapWidth: number
    mapHeight: number
    mapData: number[]
}

export const importPng = async (file: File, platform: PlatformSpec, options: ImportOptions = { dither: false, cleanup: true }): Promise<ImportResult> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                if (!ctx) return reject('Could not create canvas context')

                canvas.width = img.width
                canvas.height = img.height
                ctx.drawImage(img, 0, 0)

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                const data = imageData.data

                if (options.dither) {
                    applyDithering(data, canvas.width, canvas.height, platform.defaultPalette)
                }

                // Initialize with a blank tile at index 0
                const tiles: Tile[] = [{
                    id: `tile-imported-blank-${Date.now()}`,
                    data: Array(platform.tileWidth * platform.tileHeight).fill(0),
                    width: platform.tileWidth,
                    height: platform.tileHeight
                }]

                const validTileHashes = new Map<string, number>()
                // Hash for blank tile (all 0s) -> maps to index 0
                const blankHash = Array(platform.tileWidth * platform.tileHeight).fill(0).join(',')
                validTileHashes.set(blankHash, 0)

                const mapData: number[] = []
                const mapWidth = Math.ceil(img.width / platform.tileWidth)
                const mapHeight = Math.ceil(img.height / platform.tileHeight)

                for (let ty = 0; ty < img.height; ty += platform.tileHeight) {
                    for (let tx = 0; tx < img.width; tx += platform.tileWidth) {
                        const tileData: number[] = []
                        let isEmpty = true

                        for (let py = 0; py < platform.tileHeight; py++) {
                            for (let px = 0; px < platform.tileWidth; px++) {
                                const lx = tx + px
                                const ly = ty + py

                                if (lx < img.width && ly < img.height) {
                                    const offset = (ly * img.width + lx) * 4
                                    // Check if pixel is fully transparent
                                    if (data[offset + 3] === 0) {
                                        tileData.push(0)
                                        continue
                                    }

                                    const r = data[offset]
                                    const g = data[offset + 1]
                                    const b = data[offset + 2]

                                    const colorIndex = findClosestPaletteIndex(r, g, b, platform.defaultPalette)
                                    tileData.push(colorIndex)

                                    if (colorIndex !== 0) isEmpty = false
                                } else {
                                    tileData.push(0)
                                }
                            }
                        }

                        // If empty or matches blank tile, use index 0
                        if (isEmpty) {
                            mapData.push(0)
                            continue
                        }

                        // Check duplicates
                        const tileHash = tileData.join(',')
                        let tileIndex: number

                        if (validTileHashes.has(tileHash)) {
                            tileIndex = validTileHashes.get(tileHash)!
                        } else {
                            tileIndex = tiles.length
                            validTileHashes.set(tileHash, tileIndex)
                            tiles.push({
                                id: `tile-imported-${Date.now()}-${tiles.length}`,
                                data: tileData,
                                width: platform.tileWidth,
                                height: platform.tileHeight
                            })
                        }

                        mapData.push(tileIndex)
                    }
                }

                resolve({
                    tiles,
                    mapWidth,
                    mapHeight,
                    mapData
                })
            }
            img.src = e.target?.result as string
        }
        reader.readAsDataURL(file)
    })
}

const findClosestPaletteIndex = (r: number, g: number, b: number, palette: string[]): number => {
    let minDistance = Infinity
    let closestIndex = 0

    palette.forEach((hex, index) => {
        const rgb = hexToRgb(hex)
        const distance = Math.pow(r - rgb.r, 2) + Math.pow(g - rgb.g, 2) + Math.pow(b - rgb.b, 2)

        if (distance < minDistance) {
            minDistance = distance
            closestIndex = index
        }
    })

    return closestIndex
}

const hexToRgb = (hex: string) => {
    const r = parseInt(hex.substring(1, 3), 16)
    const g = parseInt(hex.substring(3, 5), 16)
    const b = parseInt(hex.substring(5, 7), 16)
    return { r, g, b }
}

/**
 * Floyd-Steinberg Dithering
 */
const applyDithering = (pixels: Uint8ClampedArray, width: number, height: number, palette: string[]) => {
    const paletteRgb = palette.map(hexToRgb)

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4
            const oldR = pixels[idx]
            const oldG = pixels[idx + 1]
            const oldB = pixels[idx + 2]

            // Find closest palette color
            let minDistance = Infinity
            let closest = paletteRgb[0]
            for (const color of paletteRgb) {
                const dist = Math.pow(oldR - color.r, 2) + Math.pow(oldG - color.g, 2) + Math.pow(oldB - color.b, 2)
                if (dist < minDistance) {
                    minDistance = dist
                    closest = color
                }
            }

            pixels[idx] = closest.r
            pixels[idx + 1] = closest.g
            pixels[idx + 2] = closest.b

            const errR = oldR - closest.r
            const errG = oldG - closest.g
            const errB = oldB - closest.b

            // Distribute error
            distributeError(pixels, x + 1, y, width, height, errR, errG, errB, 7 / 16)
            distributeError(pixels, x - 1, y + 1, width, height, errR, errG, errB, 3 / 16)
            distributeError(pixels, x, y + 1, width, height, errR, errG, errB, 5 / 16)
            distributeError(pixels, x + 1, y + 1, width, height, errR, errG, errB, 1 / 16)
        }
    }
}

const distributeError = (pixels: Uint8ClampedArray, x: number, y: number, width: number, height: number, errR: number, errG: number, errB: number, factor: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return
    const idx = (y * width + x) * 4
    pixels[idx] = Math.max(0, Math.min(255, pixels[idx] + errR * factor))
    pixels[idx + 1] = Math.max(0, Math.min(255, pixels[idx + 1] + errG * factor))
    pixels[idx + 2] = Math.max(0, Math.min(255, pixels[idx + 2] + errB * factor))
}
