const TILE_NUMBER_DIGITS = 2

const normalizeTileIndex = (tileIndex: number): number => {
    if (!Number.isFinite(tileIndex)) return 0
    return Math.max(0, Math.floor(tileIndex))
}

export const formatTileNumber = (tileIndex: number): string => {
    const normalized = normalizeTileIndex(tileIndex)
    return `Tile #${String(normalized).padStart(TILE_NUMBER_DIGITS, '0')}`
}

export const formatTileLabel = (tileIndex: number, tileName?: string | null): string => {
    const label = formatTileNumber(tileIndex)
    const trimmedName = tileName?.trim()
    return trimmedName ? `${label}: ${trimmedName}` : label
}
