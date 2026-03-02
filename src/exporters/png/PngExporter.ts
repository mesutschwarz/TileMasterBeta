import { Tileset } from '../../types/tile'
import { TileMap } from '../../types/map'
import { PlatformSpec } from '../../types/platform'

export const exportTilesetToPng = (tileset: Tileset, platform: PlatformSpec): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        if (tileset.tiles.length === 0) {
            reject(new Error('Tileset is empty'))
            return
        }

        const columns = 16
        const rows = Math.ceil(tileset.tiles.length / columns)
        const canvas = document.createElement('canvas')
        canvas.width = columns * platform.tileWidth
        canvas.height = rows * platform.tileHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
        }

        tileset.tiles.forEach((tile, index) => {
            const tx = (index % columns) * platform.tileWidth
            const ty = Math.floor(index / columns) * platform.tileHeight

            tile.data.forEach((colorIdx, pi) => {
                const px = tx + (pi % platform.tileWidth)
                const py = ty + Math.floor(pi / platform.tileWidth)
                ctx.fillStyle = platform.defaultPalette[colorIdx]
                ctx.fillRect(px, py, 1, 1)
            })
        })

        canvas.toBlob((blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Blob generation failed'))
        }, 'image/png')
    })
}

export const exportMapToPng = (map: TileMap, tileset: Tileset, platform: PlatformSpec): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas')
        canvas.width = map.width * platform.tileWidth
        canvas.height = map.height * platform.tileHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
        }

        // Render standard tile layers only for PNG export (usually what users want)
        map.layers.forEach(layer => {
            if (layer.type !== 'tile' || !layer.visible) return

            layer.data.forEach((tileIdx, i) => {
                if (tileIdx === -1) return
                const tile = tileset.tiles[tileIdx]
                if (!tile) return

                const tx = (i % map.width) * platform.tileWidth
                const ty = Math.floor(i / map.width) * platform.tileHeight

                tile.data.forEach((colorIdx, pi) => {
                    const px = tx + (pi % platform.tileWidth)
                    const py = ty + Math.floor(pi / platform.tileWidth)
                    ctx.fillStyle = platform.defaultPalette[colorIdx]
                    ctx.fillRect(px, py, 1, 1)
                })
            })
        })

        canvas.toBlob((blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Blob generation failed'))
        }, 'image/png')
    })
}
