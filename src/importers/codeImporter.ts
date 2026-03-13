import { Tile } from '../types/tile'
import { TileMap, MapLayer } from '../types/map'

/**
 * Heuristic to detect if a file content looks like GBDK C source or Header
 */
export const isCFile = (filename: string): boolean => {
    return filename.endsWith('.c') || filename.endsWith('.h')
}

export interface CodeImportResult {
    tiles: Tile[]
    maps: TileMap[]
}

/**
 * Parse hex/dec byte values from an array body string, stripping comments.
 */
const parseBytes = (dataStr: string): number[] => {
    const clean = dataStr.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '')
    return clean
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(s => (s.startsWith('0x') || s.startsWith('0X')) ? parseInt(s, 16) : parseInt(s, 10))
        .filter(n => !isNaN(n))
}

/**
 * Extract per-tile names from TileMaster-style comments inside a tile array body.
 * Formats:
 *  - /* Tile #NN: TileName * /
 *  - /* Tile 0xNN: TileName * / (legacy)
 */
const extractTileNames = (dataStr: string): Map<number, string> => {
    const names = new Map<number, string>()
    const decimalRe = /\/\*\s*Tile\s+#(\d+):\s*(.+?)\s*\*\//g
    const hexRe = /\/\*\s*Tile\s+0x([0-9A-Fa-f]+):\s*(.+?)\s*\*\//g
    let m

    while ((m = decimalRe.exec(dataStr)) !== null) {
        const idx = parseInt(m[1], 10)
        const name = m[2].trim()
        if (name) names.set(idx, name)
    }

    while ((m = hexRe.exec(dataStr)) !== null) {
        const idx = parseInt(m[1], 16)
        const name = m[2].trim()
        if (name) names.set(idx, name)
    }
    return names
}

/**
 * Try to extract map WIDTH / HEIGHT defines from a header or C file.
 * Looks for patterns like: #define prefix_map_WIDTH 20
 */
const extractMapDimensions = (content: string): { width: number; height: number } | null => {
    const wMatch = content.match(/#define\s+\w+_map_WIDTH\s+(\d+)/)
    const hMatch = content.match(/#define\s+\w+_map_HEIGHT\s+(\d+)/)
    if (wMatch && hMatch) {
        return { width: parseInt(wMatch[1], 10), height: parseInt(hMatch[1], 10) }
    }
    return null
}

/**
 * Extract layer name and type from a TileMaster comment preceding a map array.
 * Format: /* Layer: LayerName (type) * /
 */
const extractLayerMeta = (content: string, arrayStart: number): { layerName: string; layerType: string } | null => {
    // Search backwards from the array definition start for the nearest Layer comment
    const preceding = content.substring(Math.max(0, arrayStart - 200), arrayStart)
    const m = preceding.match(/\/\*\s*Layer:\s*(.+?)\s*\((\w+)\)\s*\*\//)
    if (m) return { layerName: m[1].trim(), layerType: m[2].trim() }
    return null
}

/**
 * Parses a C/H file to find tile and map arrays.
 * Supports GBDK 2bpp planar (GB/GBC/Mega Duck/NES) and 4bpp planar (SMS/GG) data.
 *
 * Round-trip compatible with TileMaster exports.
 * Robust against external / manually-written C files.
 */
export const importCode = (content: string, width: number, height: number, encoding: '2bpp' | '4bpp' = '2bpp'): CodeImportResult => {
    const tiles: Tile[] = []
    const maps: TileMap[] = []

    const bitsPerPixel = encoding === '4bpp' ? 4 : 2
    const bytesPerTile = (width * height * bitsPerPixel) / 8

    // Regex to find arrays: const unsigned char [BANK(n)] NAME[] = { DATA };
    const arrayRegex = /const\s+unsigned\s+char\s+(?:BANK\(\d+\)\s+)?([a-zA-Z0-9_]+)\[\]\s*=\s*\{([^}]+)\}/g

    // Collect raw arrays grouped by tile vs map
    const tileArrays: { name: string; dataStr: string }[] = []
    const mapArrays: { name: string; dataStr: string; offset: number }[] = []

    let match
    while ((match = arrayRegex.exec(content)) !== null) {
        const arrayName = match[1]
        const dataStr = match[2]

        if (arrayName.includes('_map_')) {
            mapArrays.push({ name: arrayName, dataStr, offset: match.index })
        } else {
            tileArrays.push({ name: arrayName, dataStr })
        }
    }

    // --- Process tile arrays ---
    for (const arr of tileArrays) {
        const bytes = parseBytes(arr.dataStr)
        if (bytes.length === 0) continue

        const tileNames = extractTileNames(arr.dataStr)
        const tileCountInArray = Math.floor(bytes.length / bytesPerTile)

        for (let i = 0; i < tileCountInArray; i++) {
            const tileBytes = bytes.slice(i * bytesPerTile, (i + 1) * bytesPerTile)
            if (tileBytes.length < bytesPerTile) break

            const tileData = encoding === '4bpp'
                ? decodeGbdk4bpp(tileBytes)
                : decodeGbdk2bpp(tileBytes)

            const tile: Tile = {
                id: `tile-code-${arr.name}-${tiles.length}`,
                data: tileData,
                width,
                height,
            }

            const commentName = tileNames.get(i)
            if (commentName) tile.name = commentName

            tiles.push(tile)
        }
    }

    // --- Process map arrays ---
    // Try to get dimensions from #define macros first
    const definedDims = extractMapDimensions(content)

    for (const arr of mapArrays) {
        const bytes = parseBytes(arr.dataStr)
        if (bytes.length === 0) continue

        // Determine map dimensions
        let mapW: number
        let mapH: number

        if (definedDims) {
            mapW = definedDims.width
            mapH = definedDims.height
        } else {
            // Heuristic: use the number of values per row from the source formatting
            const firstDataLine = arr.dataStr
                .replace(/\/\*[\s\S]*?\*\//g, '')
                .replace(/\/\/.*/g, '')
                .split('\n')
                .map(l => l.trim())
                .find(l => l.includes('0x') || /^\d/.test(l))
            if (firstDataLine) {
                const valsOnLine = firstDataLine.split(',').filter(s => s.trim().length > 0).length
                if (valsOnLine > 0 && bytes.length % valsOnLine === 0) {
                    mapW = valsOnLine
                    mapH = bytes.length / valsOnLine
                } else {
                    // Fallback: square-ish
                    mapW = Math.ceil(Math.sqrt(bytes.length))
                    mapH = Math.ceil(bytes.length / mapW)
                }
            } else {
                mapW = Math.ceil(Math.sqrt(bytes.length))
                mapH = Math.ceil(bytes.length / mapW)
            }
        }

        // Extract layer metadata from TileMaster comments
        const layerMeta = extractLayerMeta(content, arr.offset)
        const layerName = layerMeta?.layerName || 'Background'
        const layerType = (layerMeta?.layerType === 'collision' || layerMeta?.layerType === 'object')
            ? layerMeta.layerType
            : 'tile'

        // Derive a human-readable map name from the array name
        // e.g. "project_map_background" → strip the prefix before "_map_" and the layer suffix
        const mapNameParts = arr.name.split('_map_')
        const baseName = mapNameParts[0] ?? 'Imported'

        // Check if we already have a map for this base name (multiple layers)
        const existingMap = maps.find(m => (m as any)._baseName === baseName)

        const layer: MapLayer = {
            id: crypto.randomUUID(),
            name: layerName,
            type: layerType as any,
            data: bytes.slice(0, mapW * mapH),
            visible: true,
            locked: false,
        }

        if (existingMap) {
            // Add as an additional layer to the same map
            existingMap.layers.push(layer)
        } else {
            const newMap: TileMap = {
                id: crypto.randomUUID(),
                name: `${baseName.replace(/_/g, ' ')}`,
                width: mapW,
                height: mapH,
                layers: [layer],
            }
                // Tag for grouping layers — stripped before returning
                ; (newMap as any)._baseName = baseName
            maps.push(newMap)
        }
    }

    // Clean up internal tags
    for (const m of maps) {
        delete (m as any)._baseName
    }

    return { tiles, maps }
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

/**
 * Decodes GBDK 4bpp planar format back to color indices (0-15)
 * 32 bytes -> 64 pixels (8x8)
 * Byte layout: rows of 4 bytes (bitplane0-low, bitplane1-low, bitplane2-low, bitplane3-low)
 * SMS/GG format: each row = 4 bytes interleaved
 */
const decodeGbdk4bpp = (bytes: number[]): number[] => {
    const pixels = new Array(64).fill(0)

    for (let row = 0; row < 8; row++) {
        const b0 = bytes[row * 4]
        const b1 = bytes[row * 4 + 1]
        const b2 = bytes[row * 4 + 2]
        const b3 = bytes[row * 4 + 3]

        for (let col = 0; col < 8; col++) {
            const bit = 7 - col
            const v = ((b0 >> bit) & 1)
                | (((b1 >> bit) & 1) << 1)
                | (((b2 >> bit) & 1) << 2)
                | (((b3 >> bit) & 1) << 3)
            pixels[row * 8 + col] = v
        }
    }

    return pixels
}
