import { Tile } from '../types/tile'

/**
 * Heuristic to detect if a file content looks like GBDK C source or Header
 */
export const isCFile = (filename: string): boolean => {
    return filename.endsWith('.c') || filename.endsWith('.h')
}

/**
 * Parses a C/H file to find tile arrays.
 * It looks for arrays defined as `const unsigned char ... [] = { ... }`
 * It attempts to parse the hex values and convert them to Tile objects.
 *
 * Supports both raw index data and GBDK 2bpp planar data.
 */
export const importCode = (content: string, width: number, height: number): Tile[] => {
    const tiles: Tile[] = []

    // Regex to find arrays: const unsigned char NAME[] = { DATA };
    // Matches "const unsigned char", optional "BANK(n)", name, "[]", "=", "{", data, "}"
    const arrayRegex = /const\s+unsigned\s+char\s+(?:BANK\(\d+\)\s+)?([a-zA-Z0-9_]+)\[\]\s*=\s*{([^}]+)}/g

    let match
    while ((match = arrayRegex.exec(content)) !== null) {
        const name = match[1]
        const dataStr = match[2]

        // Clean comments and whitespace
        const cleanData = dataStr.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '')

        // Parse hex values
        const bytes = cleanData
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .map(s => {
                if (s.startsWith('0x') || s.startsWith('0X')) return parseInt(s, 16)
                return parseInt(s, 10)
            })
            .filter(n => !isNaN(n))

        if (bytes.length === 0) continue

        // Heuristic: Is this a tile array or map array?
        // Tiles are usually chunks of 16 bytes (8x8 * 2bpp)
        // If the array name ends in '_map_...' it's likely a map, skip for now (feature request was for "tiles")
        // The user said "Import previously generated code files", which export tiles arrays separate from map arrays.
        if (name.includes('_map_')) continue

        // Process as tiles
        // GBDK 2bpp format: 16 bytes per 8x8 tile
        const bytesPerTile = (width * height * 2) / 8 // Usually 16 bytes for 8x8 2bpp

        for (let i = 0; i < bytes.length; i += bytesPerTile) {
            const tileBytes = bytes.slice(i, i + bytesPerTile)
            if (tileBytes.length < bytesPerTile) break // Incomplete tile

            const titleId = `tile-code-${name}-${tiles.length}`
            const tileData = decodeGbdk2bpp(tileBytes)

            tiles.push({
                id: titleId,
                data: tileData,
                width: width,
                height: height
            })
        }
    }

    return tiles
}

/**
 * Decodes GBDK 2bpp planar format back to color indices (0-3)
 * 16 bytes -> 64 pixels (8x8)
 */
const decodeGbdk2bpp = (bytes: number[]): number[] => {
    const pixels = new Array(64).fill(0)

    for (let row = 0; row < 8; row++) {
        const lowByte = bytes[row * 2]
        const highByte = bytes[row * 2 + 1]

        for (let col = 0; col < 8; col++) {
            // Bit 7 is leftmost pixel
            const bit = 7 - col
            const lowBit = (lowByte >> bit) & 1
            const highBit = (highByte >> bit) & 1
            const color = (highBit << 1) | lowBit

            pixels[row * 8 + col] = color
        }
    }

    return pixels
}
