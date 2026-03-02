export type PlatformId = 'gb' | 'gbc' | 'nes' | 'sms' | 'gg'

export interface PaletteSpec {
    id: string
    name: string
    colors: string[] // HEX colors
    maxColors: number
}

export interface PlatformSpec {
    id: PlatformId
    name: string
    tileWidth: number
    tileHeight: number
    bitDepth: number
    maxTiles: number
    mapWidth: number
    mapHeight: number
    defaultPalette: string[]
    palettes: {
        bg: number
        sprite: number
    }
}

export type PlatformRegistry = Record<PlatformId, PlatformSpec>
