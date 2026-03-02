import { PlatformRegistry } from '../../types/platform'

export const PLATFORMS: PlatformRegistry = {
    gb: {
        id: 'gb',
        name: 'Game Boy',
        tileWidth: 8,
        tileHeight: 8,
        bitDepth: 2,
        maxTiles: 256,
        mapWidth: 32,
        mapHeight: 32,
        defaultPalette: ['#ffffff', '#aaaaaa', '#555555', '#000000'],
        palettes: {
            bg: 1,
            sprite: 2
        }
    },
    gbc: {
        id: 'gbc',
        name: 'Game Boy Color',
        tileWidth: 8,
        tileHeight: 8,
        bitDepth: 2,
        maxTiles: 512,
        mapWidth: 32,
        mapHeight: 32,
        defaultPalette: ['#ffffff', '#aaaaaa', '#555555', '#000000'],
        palettes: {
            bg: 8,
            sprite: 8
        }
    },
    nes: {
        id: 'nes',
        name: 'NES',
        tileWidth: 8,
        tileHeight: 8,
        bitDepth: 2,
        maxTiles: 256,
        mapWidth: 32,
        mapHeight: 30,
        defaultPalette: ['#ffffff', '#aaaaaa', '#555555', '#000000'],
        palettes: {
            bg: 4,
            sprite: 4
        }
    },
    sms: {
        id: 'sms',
        name: 'Sega Master System',
        tileWidth: 8,
        tileHeight: 8,
        bitDepth: 4,
        maxTiles: 448,
        mapWidth: 32,
        mapHeight: 28,
        defaultPalette: [
            '#000000', '#0000aa', '#00aa00', '#00aaaa', '#aa0000', '#aa00aa', '#aa5500', '#aaaaaa',
            '#555555', '#5555ff', '#55ff55', '#55ffff', '#ff5555', '#ff55ff', '#ffff55', '#ffffff'
        ],
        palettes: {
            bg: 1,
            sprite: 1
        }
    },
    gg: {
        id: 'gg',
        name: 'Game Gear',
        tileWidth: 8,
        tileHeight: 8,
        bitDepth: 4,
        maxTiles: 448,
        mapWidth: 32,
        mapHeight: 28,
        defaultPalette: [
            '#000000', '#0000aa', '#00aa00', '#00aaaa', '#aa0000', '#aa00aa', '#aa5500', '#aaaaaa',
            '#555555', '#5555ff', '#55ff55', '#55ffff', '#ff5555', '#ff55ff', '#ffff55', '#ffffff'
        ],
        palettes: {
            bg: 1,
            sprite: 1
        }
    }
}
