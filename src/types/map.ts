export type LayerType = 'tile' | 'collision' | 'object'

export interface MapLayer {
    id: string
    name: string
    type: LayerType
    data: number[] // Indices for tiles, or IDs for collision/objects
    visible: boolean
    locked: boolean
}

export interface TileMap {
    id: string
    name: string
    width: number
    height: number
    layers: MapLayer[]
}
