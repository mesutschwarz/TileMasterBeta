export interface Tile {
    id: string
    name?: string
    data: number[] // Flat array of color indices
    width: number
    height: number
}

export interface Tileset {
    id: string
    name: string
    tiles: Tile[]
}
