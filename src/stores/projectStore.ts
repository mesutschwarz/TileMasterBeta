import { create } from 'zustand'
import { PlatformId, PlatformSpec } from '../types/platform'
import { Tile, Tileset } from '../types/tile'
import { TileMap, MapLayer, LayerType } from '../types/map'
import { PLATFORMS } from '../core/platforms'
import { DEFAULT_PROJECT_NAME, STORAGE_KEYS } from '../app.config'
import { normalizeProjectName, toProjectFileStem } from '../utils/projectName'

const PLATFORM_KEY = STORAGE_KEYS.platform

function loadPlatformId(): PlatformId {
    try {
        const id = localStorage.getItem(PLATFORM_KEY) as PlatformId | null
        if (id && id in PLATFORMS) return id
    } catch { /* unavailable */ }
    return 'gb'
}

function createInitialState(platform: PlatformSpec) {
    const defaultTile: Tile = {
        id: 'tile-default-0',
        data: Array(platform.tileWidth * platform.tileHeight).fill(0),
        width: platform.tileWidth,
        height: platform.tileHeight,
    }

    const mapWidth = platform.screenTilesX
    const mapHeight = platform.screenTilesY

    const defaultMap: TileMap = {
        id: 'map-default-0',
        name: 'Map 1',
        width: mapWidth,
        height: mapHeight,
        layers: [{
            id: 'layer-default-bg',
            name: 'Background',
            type: 'tile' as LayerType,
            data: Array(mapWidth * mapHeight).fill(0),
            visible: true,
            locked: false,
        }],
    }

    return { defaultTile, defaultMap }
}

interface ProjectState {
    platform: PlatformSpec
    projectName: string
    tileset: Tileset
    maps: TileMap[]
    selectedTileId: string | null
    selectedMapId: string | null
    history: { snapshot: string; label?: string; ts: number }[]
    historyIndex: number
    lastHistoryLabel: string | null
    lastHistoryTime: number | null
    recordHistoryDebounced: (label: string, delay?: number) => void
    recordHistoryIfChanged: (label?: string) => void
    _historyTimer: ReturnType<typeof setTimeout> | null
    clipboard: number[] | null

    // Actions
    recordHistory: (label?: string) => void
    undo: () => void
    redo: () => void
    setPlatform: (id: PlatformId, label?: string) => void
    setProjectName: (name: string, label?: string) => void
    updatePaletteColor: (index: number, color: string, label?: string) => void
    addTile: (tile: Tile, label?: string) => void
    addTiles: (tiles: Tile[], label?: string) => void
    updateTile: (id: string, data: number[]) => void
    setTileName: (id: string, name: string) => void
    flipTile: (id: string, axis: 'horizontal' | 'vertical', label?: string) => void
    rotateTile: (id: string, direction: 'cw' | 'ccw', label?: string) => void
    copyTile: (id: string) => void
    cutTile: (id: string, label?: string) => void
    pasteTile: (id: string, label?: string) => void
    clearTile: (id: string, label?: string) => void
    moveTile: (fromIndex: number, toIndex: number, label?: string) => void
    reorderTile: (id: string, direction: 'up' | 'down') => void
    addMap: (map: TileMap, label?: string) => void
    updateMap: (id: string, map: Partial<TileMap>) => void
    resizeMap: (id: string, width: number, height: number, label?: string) => void
    addLayer: (mapId: string, type: LayerType, label?: string) => void
    removeLayer: (mapId: string, layerId: string, label?: string) => void
    updateLayer: (mapId: string, layerId: string, updates: Partial<MapLayer>) => void
    deleteTile: (id: string, label?: string) => void
    duplicateTile: (id: string, label?: string) => void
    deleteMap: (id: string, label?: string) => void
    renameMap: (id: string, name: string, label?: string) => void
    clearMapLayer: (mapId: string, layerId: string, label?: string) => void
    reorderLayers: (mapId: string, oldIndex: number, newIndex: number, label?: string) => void
    selectTile: (id: string | null) => void
    selectMap: (id: string | null) => void
    cleanupTiles: (label?: string) => void
    saveProject: () => void
    loadProject: () => void
}

export const useProjectStore = create<ProjectState>((set, get) => {
    const initialPlatform = PLATFORMS[loadPlatformId()]
    const { defaultTile, defaultMap } = createInitialState(initialPlatform)

    return {
        platform: initialPlatform,
        projectName: DEFAULT_PROJECT_NAME,
        tileset: { id: 'default', name: 'Main Tileset', tiles: [defaultTile] },
        maps: [defaultMap],
        selectedTileId: defaultTile.id,
        selectedMapId: defaultMap.id,
        history: [],
        historyIndex: -1,
        lastHistoryLabel: null,
        lastHistoryTime: null,
        _historyTimer: null,
        clipboard: null,

        recordHistory: (label?: string) => {
            const { platform, projectName, tileset, maps, history, historyIndex } = get()
            const snapshot = JSON.stringify({ platform, projectName, tileset, maps })
            const ts = Date.now()

            // Don't record if same as last
            if (historyIndex >= 0 && history[historyIndex].snapshot === snapshot) return

            const newHistory = history.slice(0, historyIndex + 1)

            // Coalesce rapid successive actions with the same label
            const lastEntry = newHistory[newHistory.length - 1]
            if (lastEntry && label && lastEntry.label === label && (ts - lastEntry.ts) < 400) {
                newHistory[newHistory.length - 1] = { snapshot, label, ts }
                set({
                    history: newHistory,
                    historyIndex: newHistory.length - 1,
                    lastHistoryLabel: label,
                    lastHistoryTime: ts
                })
                return
            }

            newHistory.push({ snapshot, label, ts })

            // Limit history to 150 states
            if (newHistory.length > 150) newHistory.shift()

            set({
                history: newHistory,
                historyIndex: newHistory.length - 1,
                lastHistoryLabel: label ?? null,
                lastHistoryTime: ts
            })
        },

        recordHistoryDebounced: (label, delay = 250) => {
            const { _historyTimer } = get()
            if (_historyTimer) clearTimeout(_historyTimer)
            const timer = setTimeout(() => {
                get().recordHistory(label)
                set({ _historyTimer: null })
            }, delay)
            set({ _historyTimer: timer })
        },

        recordHistoryIfChanged: (label) => {
            const { platform, projectName, tileset, maps, history, historyIndex } = get()
            const snapshot = JSON.stringify({ platform, projectName, tileset, maps })
            if (historyIndex >= 0 && history[historyIndex].snapshot === snapshot) return
            get().recordHistory(label)
        },

        undo: () => {
            const { history, historyIndex } = get()
            if (historyIndex <= 0) return

            const prevIndex = historyIndex - 1
            const prevState = JSON.parse(history[prevIndex].snapshot)
            set({
                ...prevState,
                historyIndex: prevIndex,
                lastHistoryLabel: history[prevIndex].label ?? null,
                lastHistoryTime: history[prevIndex].ts ?? null
            })
        },

        redo: () => {
            const { history, historyIndex } = get()
            if (historyIndex >= history.length - 1) return

            const nextIndex = historyIndex + 1
            const nextState = JSON.parse(history[nextIndex].snapshot)
            set({
                ...nextState,
                historyIndex: nextIndex,
                lastHistoryLabel: history[nextIndex].label ?? null,
                lastHistoryTime: history[nextIndex].ts ?? null
            })
        },

        setPlatform: (id, label) => {
            try { localStorage.setItem(PLATFORM_KEY, id) } catch { /* unavailable */ }
            set({ platform: PLATFORMS[id] })
            get().recordHistory(label ?? 'Platform: Change')
        },

        setProjectName: (name, label) => {
            const normalized = normalizeProjectName(name)
            const previous = get().projectName
            if (normalized === previous) return
            set({ projectName: normalized })
            get().recordHistory(label ?? 'Project: Rename')
        },

        updatePaletteColor: (index, color, label) => {
            set((state) => {
                const newPalette = [...state.platform.defaultPalette]
                newPalette[index] = color
                return {
                    platform: {
                        ...state.platform,
                        defaultPalette: newPalette
                    }
                }
            })
            get().recordHistory(label ?? 'Palette: Update')
        },

        addTile: (tile, label) => {
            set((state) => ({
                tileset: {
                    ...state.tileset,
                    tiles: [...state.tileset.tiles, tile]
                }
            }))
            get().recordHistory(label ?? 'Tile: Add')
        },

        addTiles: (tiles, label) => {
            if (tiles.length === 0) return
            set((state) => ({
                tileset: {
                    ...state.tileset,
                    tiles: [...state.tileset.tiles, ...tiles]
                }
            }))
            get().recordHistory(label ?? `Tile: Add ${tiles.length}`)
        },

        updateTile: (id, data) => {
            set((state) => ({
                tileset: {
                    ...state.tileset,
                    tiles: state.tileset.tiles.map(t => t.id === id ? { ...t, data } : t)
                }
            }))
        },

        setTileName: (id, name) => {
            let didUpdate = false
            set((state) => ({
                tileset: {
                    ...state.tileset,
                    tiles: state.tileset.tiles.map(t => {
                        if (t.id !== id) return t
                        didUpdate = true
                        return { ...t, name }
                    })
                }
            }))
            if (didUpdate) get().recordHistory('Tile: Rename')
        },

        deleteTile: (id, label) => {
            let didDelete = false
            set((state) => {
                const index = state.tileset.tiles.findIndex(t => t.id === id)
                if (index === -1) return state
                didDelete = true

                const newTiles = state.tileset.tiles.filter(t => t.id !== id)
                const newMaps = state.maps.map(map => ({
                    ...map,
                    layers: map.layers.map(layer => {
                        if (layer.type !== 'tile') return layer
                        return {
                            ...layer,
                            data: layer.data.map(tileIdx => {
                                if (tileIdx === index) return -1
                                if (tileIdx > index) return tileIdx - 1
                                return tileIdx
                            })
                        }
                    })
                }))

                return {
                    tileset: { ...state.tileset, tiles: newTiles },
                    maps: newMaps,
                    selectedTileId: state.selectedTileId === id ? null : state.selectedTileId
                }
            })
            if (didDelete) get().recordHistory(label ?? 'Tile: Delete')
        },

        duplicateTile: (id, label) => {
            let didDuplicate = false
            set((state) => {
                const tile = state.tileset.tiles.find(t => t.id === id)
                if (!tile) return state
                const newTile = {
                    ...tile,
                    id: `tile-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
                }
                didDuplicate = true
                return {
                    tileset: {
                        ...state.tileset,
                        tiles: [...state.tileset.tiles, newTile]
                    }
                }
            })
            if (didDuplicate) get().recordHistory(label ?? 'Tile: Duplicate')
        },

        flipTile: (id, axis, label) => {
            let didFlip = false
            set((state) => {
                const tile = state.tileset.tiles.find(t => t.id === id)
                if (!tile) return state
                didFlip = true

                const newData = [...tile.data]
                const { width, height } = tile

                if (axis === 'horizontal') {
                    for (let y = 0; y < height; y++) {
                        for (let x = 0; x < width / 2; x++) {
                            const i1 = y * width + x
                            const i2 = y * width + (width - 1 - x)
                            const temp = newData[i1]
                            newData[i1] = newData[i2]
                            newData[i2] = temp
                        }
                    }
                } else {
                    for (let x = 0; x < width; x++) {
                        for (let y = 0; y < height / 2; y++) {
                            const i1 = y * width + x
                            const i2 = (height - 1 - y) * width + x
                            const temp = newData[i1]
                            newData[i1] = newData[i2]
                            newData[i2] = temp
                        }
                    }
                }

                return {
                    tileset: {
                        ...state.tileset,
                        tiles: state.tileset.tiles.map(t => t.id === id ? { ...t, data: newData } : t)
                    }
                }
            })
            if (didFlip) get().recordHistory(label ?? 'Tile: Flip')
        },

        rotateTile: (id, direction, label) => {
            let didRotate = false
            set((state) => {
                const tile = state.tileset.tiles.find(t => t.id === id)
                if (!tile) return state
                didRotate = true

                const newData = new Array(tile.data.length)
                const { width, height } = tile

                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const oldIdx = y * width + x
                        let newIdx
                        if (direction === 'cw') {
                            newIdx = x * height + (height - 1 - y)
                        } else {
                            newIdx = (width - 1 - x) * height + y
                        }
                        newData[newIdx] = tile.data[oldIdx]
                    }
                }

                return {
                    tileset: {
                        ...state.tileset,
                        tiles: state.tileset.tiles.map(t => t.id === id ? { ...t, data: newData, width: height, height: width } : t)
                    }
                }
            })
            if (didRotate) get().recordHistory(label ?? 'Tile: Rotate')
        },

        copyTile: (id) => {
            const tile = get().tileset.tiles.find(t => t.id === id)
            if (tile) {
                set({ clipboard: [...tile.data] })
            }
        },

        cutTile: (id, label) => {
            const tile = get().tileset.tiles.find(t => t.id === id)
            if (tile) {
                set((state) => ({
                    clipboard: [...tile.data],
                    tileset: {
                        ...state.tileset,
                        tiles: state.tileset.tiles.map(t => t.id === id ? { ...t, data: Array(t.width * t.height).fill(0) } : t)
                    }
                }))
                get().recordHistory(label ?? 'Tile: Cut')
            }
        },

        pasteTile: (id, label) => {
            const { clipboard } = get()
            if (!clipboard) return
            set((state) => ({
                tileset: {
                    ...state.tileset,
                    tiles: state.tileset.tiles.map(t => t.id === id ? { ...t, data: [...clipboard] } : t)
                }
            }))
            get().recordHistory(label ?? 'Tile: Paste')
        },

        clearTile: (id, label) => {
            set((state) => ({
                tileset: {
                    ...state.tileset,
                    tiles: state.tileset.tiles.map(t => t.id === id ? { ...t, data: Array(t.width * t.height).fill(0) } : t)
                }
            }))
            get().recordHistory(label ?? 'Tile: Clear')
        },

        moveTile: (fromIndex, toIndex, label) => {
            if (fromIndex === toIndex) return
            set((state) => {
                const tiles = [...state.tileset.tiles]
                const [movedTile] = tiles.splice(fromIndex, 1)
                tiles.splice(toIndex, 0, movedTile)

                const newMaps = state.maps.map(map => ({
                    ...map,
                    layers: map.layers.map(layer => {
                        if (layer.type !== 'tile') return layer
                        return {
                            ...layer,
                            data: layer.data.map(tileIdx => {
                                if (tileIdx === -1) return -1
                                if (tileIdx === fromIndex) return toIndex
                                if (toIndex < fromIndex) {
                                    if (tileIdx >= toIndex && tileIdx < fromIndex) return tileIdx + 1
                                } else {
                                    if (tileIdx > fromIndex && tileIdx <= toIndex) return tileIdx - 1
                                }
                                return tileIdx
                            })
                        }
                    })
                }))

                return {
                    tileset: { ...state.tileset, tiles },
                    maps: newMaps
                }
            })
            get().recordHistory(label ?? 'Tile: Reorder')
        },

        reorderTile: (id, direction) => {
            const tiles = get().tileset.tiles
            const index = tiles.findIndex(t => t.id === id)
            if (index === -1) return
            const newIndex = direction === 'up' ? index - 1 : index + 1
            if (newIndex < 0 || newIndex >= tiles.length) return
            get().moveTile(index, newIndex)
        },

        addMap: (map, label) => {
            set((state) => ({
                maps: [...state.maps, map]
            }))
            get().recordHistory(label ?? 'Map: Add')
        },

        updateMap: (id, mapUpdates) => {
            set((state) => ({
                maps: state.maps.map(m => m.id === id ? { ...m, ...mapUpdates } : m)
            }))
        },

        resizeMap: (id: string, newWidth: number, newHeight: number, label) => {
            set((state) => ({
                maps: state.maps.map(m => {
                    if (m.id !== id) return m

                    const oldWidth = m.width
                    const oldHeight = m.height

                    return {
                        ...m,
                        width: newWidth,
                        height: newHeight,
                        layers: m.layers.map(layer => {
                            const emptyValue = layer.type === 'tile' ? -1 : 0
                            const newData = new Array(newWidth * newHeight).fill(emptyValue)

                            // Copy old data
                            for (let y = 0; y < Math.min(oldHeight, newHeight); y++) {
                                for (let x = 0; x < Math.min(oldWidth, newWidth); x++) {
                                    newData[y * newWidth + x] = layer.data[y * oldWidth + x]
                                }
                            }

                            return { ...layer, data: newData }
                        })
                    }
                })
            }))
            get().recordHistory(label ?? 'Map: Resize')
        },

        deleteMap: (id, label) => {
            set((state) => ({
                maps: state.maps.filter(m => m.id !== id),
                selectedMapId: state.selectedMapId === id ? null : state.selectedMapId
            }))
            get().recordHistory(label ?? 'Map: Delete')
        },

        renameMap: (id, name, label) => {
            set((state) => ({
                maps: state.maps.map(m => m.id === id ? { ...m, name } : m)
            }))
            get().recordHistory(label ?? 'Map: Rename')
        },

        clearMapLayer: (mapId, layerId, label) => {
            set((state) => ({
                maps: state.maps.map(m => {
                    if (m.id !== mapId) return m
                    const targetLayer = m.layers.find(l => l.id === layerId)
                    const emptyValue = targetLayer?.type === 'tile' ? -1 : 0
                    return {
                        ...m,
                        layers: m.layers.map(l => l.id === layerId ? { ...l, data: Array(m.width * m.height).fill(emptyValue) } : l)
                    }
                })
            }))
            get().recordHistory(label ?? 'Layer: Clear')
        },

        addLayer: (mapId, type, label) => {
            set((state) => ({
                maps: state.maps.map(m => {
                    if (m.id !== mapId) return m
                    const newLayer: MapLayer = {
                        id: `layer-${Date.now()}`,
                        name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${m.layers.length + 1}`,
                        type,
                        data: Array(m.width * m.height).fill(type === 'tile' ? -1 : 0),
                        visible: true,
                        locked: false
                    }
                    return { ...m, layers: [...m.layers, newLayer] }
                })
            }))
            get().recordHistory(label ?? 'Layer: Add')
        },

        removeLayer: (mapId, layerId, label) => {
            set((state) => ({
                maps: state.maps.map(m => {
                    if (m.id !== mapId || m.layers.length <= 1) return m
                    return { ...m, layers: m.layers.filter(l => l.id !== layerId) }
                })
            }))
            get().recordHistory(label ?? 'Layer: Remove')
        },

        updateLayer: (mapId, layerId, updates) => {
            set((state) => ({
                maps: state.maps.map(m => {
                    if (m.id !== mapId) return m
                    return {
                        ...m,
                        layers: m.layers.map(l => l.id === layerId ? { ...l, ...updates } : l)
                    }
                })
            }))
        },

        reorderLayers: (mapId, oldIndex, newIndex, label) => {
            set((state) => ({
                maps: state.maps.map(m => {
                    if (m.id !== mapId) return m
                    const newLayers = [...m.layers]
                    const [removed] = newLayers.splice(oldIndex, 1)
                    newLayers.splice(newIndex, 0, removed)
                    return { ...m, layers: newLayers }
                })
            }))
            get().recordHistory(label ?? 'Layer: Reorder')
        },

        selectTile: (id) => set({ selectedTileId: id }),
        selectMap: (id) => set({ selectedMapId: id }),

        cleanupTiles: (label) => {
            let didCleanup = false
            set((state) => {
                const oldTiles = state.tileset.tiles
                if (oldTiles.length === 0) return state

                const hashToMergedIndex = new Map<string, number>()
                const mergedTiles: Tile[] = []
                const oldIndexToMergedIndex: number[] = new Array(oldTiles.length)

                oldTiles.forEach((tile, index) => {
                    const hash = `${tile.width}x${tile.height}:${tile.data.join(',')}`
                    const existingIndex = hashToMergedIndex.get(hash)
                    if (existingIndex !== undefined) {
                        oldIndexToMergedIndex[index] = existingIndex
                        didCleanup = true
                        return
                    }

                    const newIndex = mergedTiles.length
                    hashToMergedIndex.set(hash, newIndex)
                    mergedTiles.push(tile)
                    oldIndexToMergedIndex[index] = newIndex
                })

                const usageCounts = new Array(mergedTiles.length).fill(0)
                state.maps.forEach((map) => {
                    map.layers.forEach((layer) => {
                        if (layer.type !== 'tile') return
                        layer.data.forEach((tileIdx) => {
                            if (tileIdx < 0 || tileIdx >= oldIndexToMergedIndex.length) return
                            const mergedIndex = oldIndexToMergedIndex[tileIdx]
                            if (mergedIndex >= 0) usageCounts[mergedIndex] += 1
                        })
                    })
                })

                const reorderedIndices = mergedTiles.map((_, idx) => idx).sort((a, b) => {
                    const diff = usageCounts[b] - usageCounts[a]
                    if (diff !== 0) return diff
                    return a - b
                })

                const isIdentityOrder = reorderedIndices.every((idx, i) => idx === i)
                if (!didCleanup && isIdentityOrder) return state
                if (!isIdentityOrder) didCleanup = true

                const mergedIndexToReorderedIndex: number[] = new Array(mergedTiles.length)
                const reorderedTiles = reorderedIndices.map((mergedIndex, newIndex) => {
                    mergedIndexToReorderedIndex[mergedIndex] = newIndex
                    return mergedTiles[mergedIndex]
                })

                const newMaps = state.maps.map((map) => ({
                    ...map,
                    layers: map.layers.map((layer) => {
                        if (layer.type !== 'tile') return layer
                        return {
                            ...layer,
                            data: layer.data.map((tileIdx) => {
                                if (tileIdx < 0 || tileIdx >= oldIndexToMergedIndex.length) return tileIdx
                                const mergedIndex = oldIndexToMergedIndex[tileIdx]
                                return mergedIndexToReorderedIndex[mergedIndex]
                            })
                        }
                    })
                }))

                let newSelectedTileId = state.selectedTileId
                if (state.selectedTileId) {
                    const oldIndex = oldTiles.findIndex(t => t.id === state.selectedTileId)
                    if (oldIndex !== -1) {
                        const mergedIndex = oldIndexToMergedIndex[oldIndex]
                        const reorderedIndex = mergedIndexToReorderedIndex[mergedIndex]
                        newSelectedTileId = reorderedTiles[reorderedIndex]?.id ?? null
                    }
                }

                return {
                    tileset: { ...state.tileset, tiles: reorderedTiles },
                    maps: newMaps,
                    selectedTileId: newSelectedTileId
                }
            })
            if (didCleanup) get().recordHistory(label ?? 'Tiles: Cleanup')
        },

        saveProject: () => {
            const { platform, projectName, tileset, maps } = get()
            const project = {
                version: 1,
                platformId: platform.id,
                projectName,
                tileset,
                maps,
            }
            const json = JSON.stringify(project, null, 2)
            const blob = new Blob([json], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${toProjectFileStem(projectName)}.tmproj`
            a.click()
            URL.revokeObjectURL(url)
        },

        loadProject: () => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = '.tmproj'
            input.onchange = async () => {
                const file = input.files?.[0]
                if (!file) return
                try {
                    const text = await file.text()
                    const project = JSON.parse(text)
                    if (!project.version || !project.tileset || !project.maps) {
                        alert('Invalid project file.')
                        return
                    }
                    const platformId: PlatformId = (project.platformId && project.platformId in PLATFORMS)
                        ? project.platformId
                        : 'gb'
                    const platform = PLATFORMS[platformId]
                    set({
                        platform,
                        projectName: normalizeProjectName(project.projectName),
                        tileset: project.tileset,
                        maps: project.maps,
                        selectedTileId: project.tileset.tiles[0]?.id ?? null,
                        selectedMapId: project.maps[0]?.id ?? null,
                        history: [],
                        historyIndex: -1,
                    })
                    try { localStorage.setItem(PLATFORM_KEY, platformId) } catch { /* */ }
                    get().recordHistory('Load Project')
                } catch {
                    alert('Failed to read project file.')
                }
            }
            input.click()
        },
    }
})
