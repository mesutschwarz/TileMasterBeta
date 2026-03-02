import { PlatformSpec } from '../../types/platform'
import { Tileset } from '../../types/tile'
import { TileMap } from '../../types/map'

export interface ValidationIssue {
    id: string
    type: 'tile' | 'map' | 'project'
    severity: 'error' | 'warning'
    message: string
    targetId?: string // ID of the tile or map
}

export const validateProject = (
    platform: PlatformSpec,
    tileset: Tileset,
    maps: TileMap[]
): ValidationIssue[] => {
    const issues: ValidationIssue[] = []

    // 1. Tileset Size
    if (tileset.tiles.length > platform.maxTiles) {
        issues.push({
            id: 'tileset-size',
            type: 'project',
            severity: 'error',
            message: `Tileset exceeds ${platform.name} limit (${tileset.tiles.length}/${platform.maxTiles} tiles).`
        })
    } else if (tileset.tiles.length > platform.maxTiles * 0.9) {
        issues.push({
            id: 'tileset-size-warning',
            type: 'project',
            severity: 'warning',
            message: `Tileset is almost full (${tileset.tiles.length}/${platform.maxTiles} tiles).`
        })
    }

    // 2. Individual Tile Validation
    tileset.tiles.forEach(tile => {
        if (tile.width !== platform.tileWidth || tile.height !== platform.tileHeight) {
            issues.push({
                id: `tile-dim-${tile.id}`,
                type: 'tile',
                severity: 'error',
                message: `Tile ${tile.id} has incorrect dimensions (${tile.width}x${tile.height}, expected ${platform.tileWidth}x${platform.tileHeight}).`,
                targetId: tile.id
            })
        }

        const uniqueColors = new Set(tile.data).size
        if (uniqueColors > Math.pow(2, platform.bitDepth)) {
            issues.push({
                id: `tile-colors-${tile.id}`,
                type: 'tile',
                severity: 'error',
                message: `Tile has too many colors (${uniqueColors}, max ${Math.pow(2, platform.bitDepth)}).`,
                targetId: tile.id
            })
        }
    })

    // 3. Map Validation
    maps.forEach(map => {
        if (map.width > platform.mapWidth || map.height > platform.mapHeight) {
            issues.push({
                id: `map-dim-${map.id}`,
                type: 'map',
                severity: 'warning',
                message: `Map "${map.name}" exceeds standard ${platform.name} screen dimensions.`,
                targetId: map.id
            })
        }
    })

    return issues
}
