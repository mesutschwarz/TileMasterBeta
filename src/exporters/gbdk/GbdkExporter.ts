import { PlatformSpec } from '../../types/platform'
import { Tileset, Tile } from '../../types/tile'
import { TileMap } from '../../types/map'
import { APP_NAME } from '../../app.config'
import { formatTileLabel, formatTileNumber } from '../../utils/tileLabels'
import { toSnakeCaseIdentifier } from '../../utils/projectName'

export interface GbdkExportOptions {
    projectName: string
    includeComments: boolean
    exportAllLayers: boolean
    useBank?: number
}

/**
 * Converts tile pixel data to GBDK 2bpp planar format (GB/GBC/Mega Duck)
 * 8x8 tile = 16 bytes (2 bits per pixel, planar)
 */
export const tileTo2bpp = (tile: Tile): Uint8Array => {
    const buffer = new Uint8Array(16)
    for (let row = 0; row < 8; row++) {
        let lowByte = 0
        let highByte = 0
        for (let col = 0; col < 8; col++) {
            const colorIndex = tile.data[row * 8 + col] & 0x03
            lowByte |= ((colorIndex & 0x01) << (7 - col))
            highByte |= (((colorIndex & 0x02) >> 1) << (7 - col))
        }
        buffer[row * 2] = lowByte
        buffer[row * 2 + 1] = highByte
    }
    return buffer
}

/**
 * Converts tile pixel data to GBDK 4bpp planar format (SMS/Game Gear)
 * 8x8 tile = 32 bytes (4 bits per pixel, 4 bitplanes)
 */
export const tileTo4bpp = (tile: Tile): Uint8Array => {
    const buffer = new Uint8Array(32)
    for (let row = 0; row < 8; row++) {
        let bp0 = 0, bp1 = 0, bp2 = 0, bp3 = 0
        for (let col = 0; col < 8; col++) {
            const colorIndex = tile.data[row * 8 + col] & 0x0f
            bp0 |= ((colorIndex & 0x01) << (7 - col))
            bp1 |= (((colorIndex >> 1) & 0x01) << (7 - col))
            bp2 |= (((colorIndex >> 2) & 0x01) << (7 - col))
            bp3 |= (((colorIndex >> 3) & 0x01) << (7 - col))
        }
        buffer[row * 4] = bp0
        buffer[row * 4 + 1] = bp1
        buffer[row * 4 + 2] = bp2
        buffer[row * 4 + 3] = bp3
    }
    return buffer
}

/**
 * Encode a tile using the platform's native format
 */
export const tileToBinary = (tile: Tile, platform: PlatformSpec): Uint8Array => {
    return platform.encoding === '4bpp' ? tileTo4bpp(tile) : tileTo2bpp(tile)
}

export const generateGbdkC = (
    platform: PlatformSpec,
    tileset: Tileset,
    map: TileMap | undefined,
    options: GbdkExportOptions
): string => {
    const safeName = toSnakeCaseIdentifier(options.projectName)
    const bankStr = options.useBank !== undefined ? `BANK(${options.useBank}) ` : ''
    const bytesPerTile = platform.bytesPerTile

    let output = `/*
 * GBDK Source Export from ${APP_NAME}
 * Project: ${options.projectName}
 * Platform: ${platform.name}
 * Target:   ${platform.gbdkTarget}
 * Encoding: ${platform.encoding} (${bytesPerTile} bytes/tile)
 */\n\n`

    output += `#include "${safeName}.h"\n\n`

    if (options.includeComments) {
        output += `/* Tileset Data (${platform.encoding}) */\n`
    }
    output += `const unsigned char ${bankStr}${safeName}_tiles[] = {\n`

    tileset.tiles.forEach((tile, tileIdx) => {
        if (options.includeComments) {
            const tileName = tile.name?.trim()
            const tileLabel = tileName ? formatTileLabel(tileIdx, tileName) : formatTileNumber(tileIdx)
            output += `    /* ${tileLabel} */\n`
        }
        const bin = tileToBinary(tile, platform)
        for (let i = 0; i < bytesPerTile; i += 2) {
            output += `    0x${bin[i].toString(16).padStart(2, '0')}, 0x${bin[i + 1].toString(16).padStart(2, '0')}${i === bytesPerTile - 2 && tileIdx === tileset.tiles.length - 1 ? '' : ','}\n`
        }
    })

    output += `};\n\n`

    if (map) {
        const layersToExport = options.exportAllLayers ? map.layers : [map.layers[0]]

        layersToExport.forEach((layer) => {
            const layerSafeName = toSnakeCaseIdentifier(layer.name)
            if (options.includeComments) {
                output += `/* Layer: ${layer.name} (${layer.type}) */\n`
            }
            output += `const unsigned char ${bankStr}${safeName}_map_${layerSafeName}[] = {\n`

            for (let y = 0; y < map.height; y++) {
                output += `    `
                for (let x = 0; x < map.width; x++) {
                    const val = layer.data[y * map.width + x]
                    const hexVal = (val === -1 ? 0 : val).toString(16).padStart(2, '0')
                    const isLast = x === map.width - 1 && y === map.height - 1
                    output += `0x${hexVal}${isLast ? '' : ', '}`
                }
                output += `\n`
            }
            output += `};\n\n`
        })
    }

    return output
}

export const generateGbdkH = (
    platform: PlatformSpec,
    tileset: Tileset,
    map: TileMap | undefined,
    options: GbdkExportOptions
): string => {
    const safeName = toSnakeCaseIdentifier(options.projectName)
    const guardName = safeName.toUpperCase() + '_H'

    let output = `/* GBDK Header Export from ${APP_NAME} */\n`
    output += `/* Platform: ${platform.name} | Target: ${platform.gbdkTarget} */\n\n`
    output += `#ifndef ${guardName}\n`
    output += `#define ${guardName}\n\n`

    output += `#define ${safeName}_PLATFORM_TARGET "${platform.gbdkTarget}"\n`
    output += `#define ${safeName}_TILE_W ${platform.tileWidth}\n`
    output += `#define ${safeName}_TILE_H ${platform.tileHeight}\n`
    output += `#define ${safeName}_BYTES_PER_TILE ${platform.bytesPerTile}\n\n`

    output += `extern const unsigned char ${safeName}_tiles[];\n`
    output += `#define ${safeName}_tiles_TILE_COUNT ${tileset.tiles.length}\n`
    output += `#define ${safeName}_tiles_SIZE ${tileset.tiles.length * platform.bytesPerTile}\n\n`

    if (map) {
        const layersToExport = options.exportAllLayers ? map.layers : [map.layers[0]]
        output += `#define ${safeName}_map_WIDTH ${map.width}\n`
        output += `#define ${safeName}_map_HEIGHT ${map.height}\n\n`

        layersToExport.forEach((layer) => {
            const layerSafeName = toSnakeCaseIdentifier(layer.name)
            output += `extern const unsigned char ${safeName}_map_${layerSafeName}[];\n`
        })
    }

    output += `\n#endif\n`
    return output
}

export const generateGbdkBin = (platform: PlatformSpec, tileset: Tileset): Uint8Array => {
    const bytesPerTile = platform.bytesPerTile
    const totalSize = tileset.tiles.length * bytesPerTile
    const output = new Uint8Array(totalSize)

    tileset.tiles.forEach((tile, idx) => {
        const bin = tileToBinary(tile, platform)
        output.set(bin, idx * bytesPerTile)
    })

    return output
}
