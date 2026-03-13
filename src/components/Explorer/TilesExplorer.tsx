import React from 'react'
import { Plus, Upload, Copy, Scissors, Clipboard, Eraser, Trash2, MousePointer2, Info, Layers } from 'lucide-react'
import { clsx } from 'clsx'
import { useProjectStore } from '../../stores/projectStore'
import { useEditorStore } from '../../stores/editorStore'
import { validateProject } from '../../core/validation/ConstraintEngine'
import { ImportPreviewDialog } from '../ImportPanel/ImportPreviewDialog'
import { ImportOptions, ImportResult } from '../../importers/pngImporter'
import { Tile } from '../../types/tile'
import { TileMap } from '../../types/map'
import { Tooltip } from '../common/Tooltip'
import { ContextMenu, ContextMenuEntry } from '../common/ContextMenu'
import { Modal } from '../common/Modal'
import { formatTileNumber } from '../../utils/tileLabels'

const TileThumbnail: React.FC<{ tile: Tile, palette: string[] }> = ({ tile, palette }) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null)

    React.useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        tile.data.forEach((colorIdx, i) => {
            const x = i % tile.width
            const y = Math.floor(i / tile.width)
            ctx.fillStyle = palette[colorIdx]
            ctx.fillRect(x, y, 1, 1)
        })
    }, [tile, palette])

    return (
        <canvas
            ref={canvasRef}
            width={tile.width}
            height={tile.height}
            className="w-full h-full pixelated"
        />
    )
}

export const TilesExplorer: React.FC = () => {
    const {
        platform, tileset, maps, selectedTileId, clipboard,
        addTiles, selectTile, addMap, selectMap, moveTile,
        deleteTile, duplicateTile,
        copyTile, cutTile, pasteTile, clearTile,
        setTileName, cleanupTiles
    } = useProjectStore()
    const { setView } = useEditorStore()

    const [importFile, setImportFile] = React.useState<File | null>(null)
    const [tileScale, setTileScale] = React.useState(6)
    const [contextMenu, setContextMenu] = React.useState<{ tileId: string, x: number, y: number } | null>(null)
    const [infoTileId, setInfoTileId] = React.useState<string | null>(null)
    const [infoTileName, setInfoTileName] = React.useState('')
    const [draggedTileIndex, setDraggedTileIndex] = React.useState<number | null>(null)
    const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)
    const [draggableTileId, setDraggableTileId] = React.useState<string | null>(null)

    const tilePreviewWidth = React.useMemo(() => Math.max(8, platform.tileWidth * tileScale), [platform.tileWidth, tileScale])
    const tilePreviewHeight = React.useMemo(() => Math.max(8, platform.tileHeight * tileScale), [platform.tileHeight, tileScale])

    const issues = React.useMemo(() => validateProject(platform, tileset, maps), [platform, tileset, maps])
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const longPressTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setImportFile(e.target.files[0])
        }
    }

    const handleImportConfirm = (result: ImportResult, options: ImportOptions) => {
        const { tiles, mapWidth, mapHeight, mapData } = result
        const tileOffset = tileset.tiles.length
        const adjustedMapData = mapData.map((idx) => (idx >= 0 ? idx + tileOffset : idx))
        addTiles(tiles, `Tile: Import ${tiles.length}`)

        const newMapId = crypto.randomUUID()
        const newMap: TileMap = {
            id: newMapId,
            name: `Imported Map ${maps.length + 1}`,
            width: mapWidth,
            height: mapHeight,
            layers: [{
                id: crypto.randomUUID(),
                name: 'Background',
                type: 'tile',
                data: adjustedMapData,
                visible: true,
                locked: false
            }]
        }
        addMap(newMap)
        selectMap(newMapId)
        if (options.cleanup !== false) {
            cleanupTiles('Tiles: Cleanup')
        }
        setImportFile(null)
        setView('map')
    }

    const handleCleanupTiles = () => {
        cleanupTiles('Tiles: Cleanup')
    }

    const createNewTile = () => {
        const newTile: Tile = {
            id: crypto.randomUUID(),
            width: platform.tileWidth,
            height: platform.tileHeight,
            data: new Array(platform.tileWidth * platform.tileHeight).fill(0)
        }
        addTiles([newTile], 'Tile: Add')
        selectTile(newTile.id)
    }

    const openInfoDialog = (tileId: string) => {
        const tile = tileset.tiles.find(t => t.id === tileId)
        setInfoTileId(tileId)
        setInfoTileName(tile?.name ?? '')
    }

    const closeInfoDialog = () => {
        setInfoTileId(null)
        setInfoTileName('')
    }

    const handleSaveInfo = () => {
        if (!infoTileId) return
        const trimmed = infoTileName.trim()
        setTileName(infoTileId, trimmed)
        closeInfoDialog()
    }

    const contextMenuEntries = React.useMemo<ContextMenuEntry[]>(() => {
        if (!contextMenu) return []
        const tileId = contextMenu.tileId
        return [
            {
                type: 'item',
                id: 'info',
                label: 'Info',
                icon: <Info size={12} className="menu-icon" />,
                onSelect: () => openInfoDialog(tileId)
            },
            { type: 'separator', id: 'divider-0' },
            {
                type: 'item',
                id: 'cut',
                label: 'Cut',
                icon: <Scissors size={12} className="menu-icon" />,
                onSelect: () => cutTile(tileId)
            },
            {
                type: 'item',
                id: 'copy',
                label: 'Copy',
                icon: <Copy size={12} className="menu-icon" />,
                onSelect: () => copyTile(tileId)
            },
            {
                type: 'item',
                id: 'paste',
                label: 'Paste',
                icon: <Clipboard size={12} className="menu-icon" />,
                onSelect: () => pasteTile(tileId),
                disabled: !clipboard
            },
            { type: 'separator', id: 'divider-1' },
            {
                type: 'item',
                id: 'duplicate',
                label: 'Duplicate',
                icon: <Copy size={12} className="menu-icon" />,
                onSelect: () => duplicateTile(tileId)
            },
            {
                type: 'item',
                id: 'clear',
                label: 'Clear',
                icon: <Eraser size={12} className="menu-icon" />,
                onSelect: () => clearTile(tileId)
            },
            {
                type: 'item',
                id: 'delete',
                label: 'Delete',
                icon: <Trash2 size={12} className="menu-icon" />,
                onSelect: () => deleteTile(tileId)
            }
        ]
    }, [contextMenu, clipboard, cutTile, copyTile, pasteTile, duplicateTile, clearTile, deleteTile])

    const handleTileScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value)
        if (!Number.isFinite(value)) return
        const clamped = Math.min(32, Math.max(4, Math.round(value)))
        setTileScale(clamped)
    }

    return (
        <div className="h-full flex flex-col min-h-0 overflow-hidden">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png"
                onChange={handleFileSelect}
            />

            {importFile && (
                <ImportPreviewDialog
                    file={importFile}
                    platform={platform}
                    onImport={handleImportConfirm}
                    onCancel={() => setImportFile(null)}
                />
            )}

            {/* Header */}
            <div className="w-full flex items-center justify-between px-4 py-3 shrink-0 border-b border-ui-border-subtle bg-bg-primary">
                <span className="text-[10px] font-semibold tracking-[0.2em] text-text-secondary uppercase">Tiles Explorer</span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={createNewTile}
                        className="flex h-6 w-6 items-center justify-center rounded bg-accent-primary text-white hover:bg-accent-primary/80 transition-colors"
                        title="Add Tile"
                    >
                        <Plus size={14} strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={handleCleanupTiles}
                        className="p-1.5 rounded-md transition-all action-button hover:bg-ui-active hover:text-text-primary"
                        title="Cleanup duplicates"
                    >
                        <Eraser size={14} strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 rounded-md transition-all action-button hover:bg-ui-active hover:text-text-primary"
                        title="Import PNG"
                    >
                        <Upload size={14} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Scrollable tile grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
                <div className="p-3">
                    <div
                        className="flex flex-wrap content-start gap-3"
                        onDragOver={(e) => e.preventDefault()}
                    >
                        {tileset.tiles.map((tile, index) => {
                            const tileUsage = maps.reduce((count, map) => {
                                return count + map.layers.reduce((layerCount, layer) => {
                                    return layerCount + layer.data.filter(idx => idx === index).length
                                }, 0)
                            }, 0)

                            const hasError = issues.some(i => i.type === 'tile' && i.targetId === tile.id && i.severity === 'error')

                            const handleTouchStart = () => {
                                longPressTimerRef.current = setTimeout(() => {
                                    setDraggableTileId(tile.id)
                                }, 500)
                            }

                            const handleTouchEnd = () => {
                                if (longPressTimerRef.current) {
                                    clearTimeout(longPressTimerRef.current)
                                }
                            }

                            return (
                                <Tooltip
                                    key={tile.id}
                                    content={
                                        <div className="tile-tooltip">
                                            <div className="tile-tooltip-line">{formatTileNumber(index)}</div>
                                            {tile.name?.trim() && (
                                                <div className="tile-tooltip-name">{tile.name.trim()}</div>
                                            )}
                                            <div className="tile-tooltip-line flex items-center gap-1">
                                                <Layers size={11} className="text-text-secondary" />
                                                <span className="tabular-nums">{tileUsage}</span>
                                            </div>
                                            {hasError && (
                                                <div className="tile-tooltip-line tile-tooltip-error">
                                                    {issues.find(i => i.type === 'tile' && i.targetId === tile.id)?.message || 'Tile error'}
                                                </div>
                                            )}
                                        </div>
                                    }
                                    position="right"
                                >
                                    <button
                                        draggable={draggableTileId === tile.id}
                                        onClick={() => selectTile(tile.id)}
                                        onMouseDown={handleTouchStart}
                                        onMouseUp={() => { handleTouchEnd(); if (draggableTileId !== tile.id) selectTile(tile.id) }}
                                        onMouseLeave={() => { handleTouchEnd(); if (draggableTileId === tile.id) setDraggableTileId(null) }}
                                        onDragStart={(e) => {
                                            setDraggedTileIndex(index)
                                            e.dataTransfer.effectAllowed = 'move'
                                        }}
                                        onDragEnd={() => {
                                            setDraggedTileIndex(null)
                                            setDragOverIndex(null)
                                            setDraggableTileId(null)
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault()
                                            setDragOverIndex(index)
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault()
                                            if (draggedTileIndex !== null) {
                                                moveTile(draggedTileIndex, index)
                                            }
                                        }}
                                        onContextMenu={(e) => {
                                            e.preventDefault()
                                            setContextMenu({
                                                tileId: tile.id,
                                                x: e.clientX,
                                                y: e.clientY
                                            })
                                            setDraggableTileId(null)
                                        }}
                                        style={{
                                            width: `${tile.width * tileScale}px`,
                                            height: `${tile.height * tileScale}px`
                                        }}
                                        className={clsx(
                                            "rounded border overflow-hidden transition-all duration-200 relative shrink-0 p-1",
                                            selectedTileId === tile.id
                                                ? "border-accent-primary bg-accent-primary/10 shadow-[0_0_0_1px_rgba(var(--accent-primary-rgb),0.5)] z-10"
                                                : hasError
                                                    ? "border-ui-danger bg-ui-danger/10"
                                                    : "border-ui-border-subtle bg-bg-secondary hover:border-ui-border-strong hover:bg-ui-bg-hover",
                                            dragOverIndex === index && draggedTileIndex !== index && "border-accent-secondary z-20",
                                            draggableTileId === tile.id && "cursor-move border-accent-secondary opacity-50"
                                        )}
                                    >
                                        <div className="w-full h-full relative pointer-events-none rounded-sm overflow-hidden">
                                            <TileThumbnail tile={tile} palette={platform.defaultPalette} />
                                        </div>

                                        {draggableTileId === tile.id && (
                                            <div className="absolute inset-0 bg-accent-primary/20 backdrop-blur-sm flex items-center justify-center pointer-events-none">
                                                <MousePointer2 size={24} className="text-white animate-bounce shadow-xl" />
                                            </div>
                                        )}
                                    </button>
                                </Tooltip>
                            )
                        })}
                        <button
                            onClick={createNewTile}
                            disabled={tileset.tiles.length >= platform.maxTiles}
                            style={{
                                width: `${tilePreviewWidth}px`,
                                height: `${tilePreviewHeight}px`
                            }}
                            className="rounded border-2 border-dashed border-ui-border-strong bg-transparent flex flex-col items-center justify-center gap-2 transition-all hover:border-accent-primary hover:bg-accent-primary/10 group disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                        >
                            <Plus size={24} strokeWidth={2.5} className="text-ui-border-strong group-hover:text-accent-primary transition-colors hover:scale-110" />
                        </button>
                    </div>

                    {tileset.tiles.length === 0 && (
                        <div className="py-12 text-center text-sm italic text-text-disabled  shadow-inner">
                            No tiles yet
                        </div>
                    )}
                </div>
            </div>

            {/* Tile size slider — pinned to bottom */}
            <div className="h-10 px-4 flex items-center gap-3 shrink-0 border-t border-ui-border-subtle bg-bg-primary">
                <span className="text-[9px] font-bold tracking-wider text-text-disabled uppercase whitespace-nowrap">Size</span>
                <input
                    type="range"
                    min="4"
                    max="32"
                    step="1"
                    value={tileScale}
                    onChange={handleTileScaleChange}
                    className="flex-1 h-1 rounded-full appearance-none cursor-pointer bg-ui-bg-subtle accent-accent-primary"
                />
                <span className="text-[10px] font-mono min-w-[72px] text-right text-text-disabled font-bold tabular-nums">{tilePreviewWidth}x{tilePreviewHeight}</span>
            </div>

            <ContextMenu
                open={!!contextMenu}
                x={contextMenu?.x ?? 0}
                y={contextMenu?.y ?? 0}
                entries={contextMenuEntries}
                onClose={() => setContextMenu(null)}
            />

            <Modal
                isOpen={!!infoTileId}
                onClose={closeInfoDialog}
                title="Tile Info"
                icon={<Info size={18} />}
                maxWidth="sm"
                footer={
                    <>
                        <button
                            onClick={closeInfoDialog}
                            className="px-4 py-2 rounded-lg bg-bg-tertiary border border-ui-border text-[10px] font-bold text-gray-400 hover:text-white hover:border-ui-border-strong transition-colors uppercase tracking-wider"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveInfo}
                            className="px-6 py-2 rounded-lg bg-accent-primary hover:bg-accent-secondary text-white text-[10px] font-bold transition-all shadow-lg shadow-accent-primary/20 uppercase tracking-wider"
                        >
                            Save
                        </button>
                    </>
                }
            >
                <form
                    className="p-6 space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSaveInfo()
                    }}
                >
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tile Name (optional)</label>
                        <input
                            type="text"
                            value={infoTileName}
                            onChange={(e) => setInfoTileName(e.target.value)}
                            placeholder="Leave empty for unnamed tile"
                            className="w-full modern-input"
                            autoFocus
                        />
                        <p className="text-[10px] text-gray-500">Used in C export comments for tile identification.</p>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
