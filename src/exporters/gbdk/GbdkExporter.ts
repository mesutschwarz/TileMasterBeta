import { PlatformSpec } from '../../types/platform'
import { Tileset, Tile } from '../../types/tile'
import { TileMap } from '../../types/map'

export interface GbdkExportOptions {
    projectName: string
    includeComments: boolean
    exportAllLayers: boolean
    useBank?: number
}

const getSafeName = (name: string) => name.replace(/[^a-z0-9]/gi, '_').toLowerCase()

/**
 * Converts tile pixel data to GBDK 2-bit planar format
 */
export const tileToBinary = (tile: Tile): Uint8Array => {
    const buffer = new Uint8Array(16) // 8x8 tile = 16 bytes (2 bits per pixel)
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

export const generateGbdkC = (
    platform: PlatformSpec,
    tileset: Tileset,
    map: TileMap | undefined,
    options: GbdkExportOptions
): string => {
    const safeName = getSafeName(options.projectName)
    const bankStr = options.useBank !== undefined ? `BANK(${options.useBank}) ` : ''

    let output = `/*
 * GBDK Source Export from TileMaster
 * Project: ${options.projectName}
 * Platform: ${platform.name}
 */\n\n`

    output += `#include "${safeName}.h"\n\n`

    if (options.includeComments) {
        output += `/* Tileset Data */\n`
    }
    output += `const unsigned char ${bankStr}${safeName}_tiles[] = {\n`

    tileset.tiles.forEach((tile, tileIdx) => {
        if (options.includeComments) {
            const tileName = tile.name?.trim()
            const hexIndex = tileIdx.toString(16).toUpperCase()
            if (tileName) {
                output += `    /* Tile 0x${hexIndex}: ${tileName} */\n`
            } else {
                output += `    /* Tile 0x${hexIndex} */\n`
            }
        }
        const bin = tileToBinary(tile)
        for (let i = 0; i < 16; i += 2) {
            output += `    0x${bin[i].toString(16).padStart(2, '0')}, 0x${bin[i + 1].toString(16).padStart(2, '0')}${i === 14 && tileIdx === tileset.tiles.length - 1 ? '' : ','}\n`
        }
    })

    output += `};\n\n`

    if (map) {
        const layersToExport = options.exportAllLayers ? map.layers : [map.layers[0]]

        layersToExport.forEach((layer) => {
            const layerSafeName = getSafeName(layer.name)
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
    tileset: Tileset,
    map: TileMap | undefined,
    options: GbdkExportOptions
): string => {
    const safeName = getSafeName(options.projectName)
    const guardName = safeName.toUpperCase() + '_H'

    let output = `/* GBDK Header Export from TileMaster */\n\n`
    output += `#ifndef ${guardName}\n`
    output += `#define ${guardName}\n\n`

    output += `extern const unsigned char ${safeName}_tiles[];\n`
    output += `#define ${safeName}_tiles_TILE_COUNT ${tileset.tiles.length}\n\n`

    if (map) {
        const layersToExport = options.exportAllLayers ? map.layers : [map.layers[0]]
        output += `#define ${safeName}_map_WIDTH ${map.width}\n`
        output += `#define ${safeName}_map_HEIGHT ${map.height}\n\n`

        layersToExport.forEach((layer) => {
            const layerSafeName = getSafeName(layer.name)
            output += `extern const unsigned char ${safeName}_map_${layerSafeName}[];\n`
        })
    }

    output += `\n#endif\n`
    return output
}

export const generateGbdkBin = (tileset: Tileset): Uint8Array => {
    const totalSize = tileset.tiles.length * 16
    const output = new Uint8Array(totalSize)

    tileset.tiles.forEach((tile, idx) => {
        const bin = tileToBinary(tile)
        output.set(bin, idx * 16)
    })

    return output
}
