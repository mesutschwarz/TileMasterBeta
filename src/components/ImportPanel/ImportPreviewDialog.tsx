import React, { useState, useEffect, useMemo } from 'react'
import { Check, Grid, Shield, LayoutGrid, Image as ImageIcon, Map as MapIcon, FileCode } from 'lucide-react'
import { PlatformSpec } from '../../types/platform'
import { importPng, ImportOptions, ImportResult } from '../../importers/pngImporter'
import { CodeImportResult } from '../../importers/codeImporter'
import { TileMap } from '../../types/map'
import { Tile } from '../../types/tile'
import { clsx } from 'clsx'
import { Modal } from '../common/Modal'
import { formatTileNumber } from '../../utils/tileLabels'

interface ImportPreviewDialogBaseProps {
    platform: PlatformSpec
    onCancel: () => void
}

interface PngImportProps extends ImportPreviewDialogBaseProps {
    mode: 'png'
    file: File
    onImport: (result: ImportResult, options: ImportOptions) => void
}

interface CodeImportProps extends ImportPreviewDialogBaseProps {
    mode: 'code'
    codeResult: CodeImportResult
    fileName: string
    onImportCode: (result: CodeImportResult, cleanup: boolean) => void
}

type ImportPreviewDialogProps = PngImportProps | CodeImportProps

// Legacy compat: also support the old props shape (file + onImport without mode)
interface LegacyImportProps extends ImportPreviewDialogBaseProps {
    file: File
    onImport: (result: ImportResult, options: ImportOptions) => void
}

export const ImportPreviewDialog: React.FC<ImportPreviewDialogProps | LegacyImportProps> = (props) => {
    const mode = 'mode' in props ? props.mode : 'png'
    const platform = props.platform
    const onCancel = props.onCancel

    // --- PNG state ---
    const [importResult, setImportResult] = useState<ImportResult | null>(null)
    const [options, setOptions] = useState<ImportOptions>({ dither: false, cleanup: true })
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(mode === 'png')
    const [stats, setStats] = useState({ width: 0, height: 0, count: 0 })

    // --- Code state ---
    const [codeCleanup, setCodeCleanup] = useState(true)

    // Tabs
    type TabId = 'result' | 'tiles' | 'original' | 'maps'
    const [activeTab, setActiveTab] = useState<TabId>(mode === 'code' ? 'tiles' : 'result')

    // Code result convenience
    const codeResult = mode === 'code' && 'codeResult' in props ? props.codeResult : null
    const codeTiles = codeResult?.tiles ?? []
    const codeMaps = codeResult?.maps ?? []

    // --- PNG processing ---
    useEffect(() => {
        if (mode !== 'png') return
        const file = 'file' in props ? props.file : null
        if (!file) return
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
        processFile(file, url)
        return () => URL.revokeObjectURL(url)
    }, [mode === 'png' ? ('file' in props ? props.file : null) : null, options])

    const processFile = async (file: File, fileUrl: string) => {
        setLoading(true)
        try {
            const result = await importPng(file, platform, options)
            setImportResult(result)
            const img = new Image()
            img.onload = () => {
                setStats({ width: img.width, height: img.height, count: result.tiles.length })
                setLoading(false)
            }
            img.src = fileUrl
        } catch (err) {
            console.error('Processing failed:', err)
            setLoading(false)
        }
    }

    // --- Confirm ---
    const handleConfirm = () => {
        if (mode === 'code' && 'onImportCode' in props && codeResult) {
            props.onImportCode(codeResult, codeCleanup)
        } else if (importResult && 'onImport' in props) {
            props.onImport(importResult, options)
        }
    }

    const isReady = mode === 'code' ? (codeTiles.length > 0 || codeMaps.length > 0) : (!loading && stats.count > 0)

    // --- Tile renderer helper ---
    const TilePreview: React.FC<{ tile: Tile; scale?: number; showIndex?: boolean; index?: number }> = ({ tile, scale = 4, showIndex, index }) => (
        <div
            className="border border-ui-border group relative shrink-0 shadow-lg hover:border-accent-primary/50 transition-colors"
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${tile.width}, 1fr)`,
                width: platform.tileWidth * scale,
                height: platform.tileHeight * scale,
            }}
        >
            {tile.data.map((colorIdx, pi) => (
                <div key={pi} style={{ backgroundColor: platform.defaultPalette[colorIdx] ?? '#000' }} />
            ))}
            {showIndex && (
                <div className="absolute inset-0 bg-accent-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[8px] font-bold text-white tabular-nums bg-black/80 px-1.5 py-0.5 rounded-full border border-ui-border-strong shadow-xl">{formatTileNumber(index ?? 0)}</span>
                </div>
            )}
        </div>
    )

    // --- Map preview helper ---
    const MapPreview: React.FC<{ map: TileMap; tiles: Tile[] }> = ({ map, tiles: mapTiles }) => {
        const layer = map.layers[0]
        if (!layer) return null
        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">{map.name}</span>
                    <span className="text-[9px] text-gray-500 font-mono">{map.width}x{map.height} · {map.layers.length} layer(s)</span>
                </div>
                <div
                    className="grid border border-ui-border-strong rounded-lg overflow-hidden shadow-lg origin-top-left"
                    style={{
                        gridTemplateColumns: `repeat(${map.width}, ${platform.tileWidth}px)`,
                        width: map.width * platform.tileWidth,
                        transform: `scale(${Math.min(2, 400 / (map.width * platform.tileWidth))})`,
                        transformOrigin: 'top left',
                    }}
                >
                    {layer.data.map((tileIdx, i) => {
                        const tile = tileIdx >= 0 && tileIdx < mapTiles.length ? mapTiles[tileIdx] : null
                        return (
                            <div
                                key={i}
                                style={{
                                    width: platform.tileWidth,
                                    height: platform.tileHeight,
                                    backgroundColor: tile ? 'transparent' : 'var(--ui-bg-subtle, #111)'
                                }}
                            >
                                {tile && (
                                    <div
                                        className="w-full h-full"
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: `repeat(${tile.width}, 1fr)`,
                                        }}
                                    >
                                        {tile.data.map((colorIdx, pi) => (
                                            <div key={pi} style={{ backgroundColor: platform.defaultPalette[colorIdx] ?? '#000' }} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    const TabButton = ({ id, label, icon }: { id: TabId, label: string, icon: React.ReactNode }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={clsx(
                "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === id
                    ? "bg-accent-primary text-white shadow-lg shadow-accent-primary/20"
                    : "text-gray-500 hover:text-gray-300 bg-white/5 hover:bg-white/10"
            )}
        >
            {icon}
            {label}
        </button>
    )

    // --- Build tabs list ---
    const tabs = useMemo(() => {
        if (mode === 'code') {
            const t: { id: TabId; label: string; icon: React.ReactNode }[] = [
                { id: 'tiles', label: `Tiles (${codeTiles.length})`, icon: <Grid size={14} /> },
            ]
            if (codeMaps.length > 0) {
                t.push({ id: 'maps', label: `Maps (${codeMaps.length})`, icon: <MapIcon size={14} /> })
            }
            return t
        }
        return [
            { id: 'result' as TabId, label: 'Tilemap', icon: <LayoutGrid size={14} /> },
            { id: 'tiles' as TabId, label: 'Tiles', icon: <Grid size={14} /> },
            { id: 'original' as TabId, label: 'Original Image', icon: <ImageIcon size={14} /> },
        ]
    }, [mode, codeTiles.length, codeMaps.length])

    return (
        <Modal
            isOpen={true}
            onClose={onCancel}
            title={mode === 'code' ? 'Import Code' : 'Import Assets'}
            icon={mode === 'code' ? <FileCode size={18} /> : <ImageIcon size={18} />}
            maxWidth="6xl"
            footer={
                <div className="flex items-center justify-between w-full gap-4">
                    <div className="flex items-center gap-2">
                        {tabs.map(t => <TabButton key={t.id} id={t.id} label={t.label} icon={t.icon} />)}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onCancel}
                            className="px-6 py-2 rounded-lg bg-bg-tertiary border border-ui-border hover:border-ui-border-strong text-gray-500 hover:text-white text-[10px] font-bold transition-all uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!isReady}
                            className="px-8 py-2 rounded-lg bg-accent-primary hover:bg-accent-secondary disabled:opacity-30 text-white text-[10px] font-bold transition-all shadow-lg shadow-accent-primary/20 flex items-center justify-center gap-2 uppercase tracking-widest"
                        >
                            <Check size={16} /> Confirm Import
                        </button>
                    </div>
                </div>
            }
        >
            <div className="flex flex-col md:flex-row min-h-[500px]">
                {/* Main Preview Area */}
                <div className="flex-1 bg-black/40 overflow-hidden flex flex-col relative border-r border-ui-border">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center text-gray-700 animate-pulse uppercase tracking-[0.3em] text-[10px] font-bold">Processing Logic...</div>
                    ) : (
                        <div className="flex-1 overflow-auto p-12 flex items-start justify-center relative bg-checkered custom-scrollbar">
                            {/* PNG: Original image */}
                            {mode === 'png' && activeTab === 'original' && previewUrl && (
                                <div className="relative animate-in fade-in duration-300">
                                    <div className="shadow-preview-glow border border-ui-border-strong rounded-lg overflow-hidden scale-[2] origin-top">
                                        <img src={previewUrl} className="pixelated" alt="Original" />
                                    </div>
                                </div>
                            )}

                            {/* PNG: Tilemap result */}
                            {mode === 'png' && activeTab === 'result' && importResult && (
                                <div className="relative animate-in fade-in duration-300 text-center">
                                    <div
                                        className="grid shadow-preview-glow border border-ui-border-strong rounded-lg overflow-hidden scale-[2] origin-top"
                                        style={{
                                            gridTemplateColumns: `repeat(${importResult.mapWidth}, ${platform.tileWidth}px)`,
                                            width: importResult.mapWidth * platform.tileWidth,
                                        }}
                                    >
                                        {importResult.mapData.map((tileIdx, i) => {
                                            const tile = tileIdx !== -1 ? importResult.tiles[tileIdx] : null
                                            return (
                                                <div
                                                    key={i}
                                                    style={{
                                                        width: platform.tileWidth,
                                                        height: platform.tileHeight,
                                                        backgroundColor: tile ? 'transparent' : 'var(--ui-bg-subtle)'
                                                    }}
                                                >
                                                    {tile && (
                                                        <div
                                                            className="w-full h-full"
                                                            style={{
                                                                display: 'grid',
                                                                gridTemplateColumns: `repeat(${tile.width}, 1fr)`,
                                                            }}
                                                        >
                                                            {tile.data.map((colorIdx, pi) => (
                                                                <div key={pi} style={{ backgroundColor: platform.defaultPalette[colorIdx] }} />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Shared: Tile grid (both PNG and Code) */}
                            {activeTab === 'tiles' && (
                                <div className="w-full max-w-2xl animate-in fade-in duration-300 pt-4">
                                    {(() => {
                                        const tilesToShow = mode === 'code' ? codeTiles : (importResult?.tiles ?? [])
                                        if (tilesToShow.length === 0) {
                                            return <div className="text-center text-gray-600 text-[10px] uppercase tracking-widest font-bold py-12">No tiles found</div>
                                        }
                                        return (
                                            <div className="flex flex-wrap gap-2 pb-12 justify-center">
                                                {tilesToShow.map((tile, i) => (
                                                    <div key={i} className="flex flex-col items-center gap-1">
                                                        <TilePreview tile={tile} showIndex index={i} />
                                                        {tile.name && (
                                                            <span className="text-[7px] text-gray-500 font-bold max-w-[32px] truncate text-center" title={tile.name}>{tile.name}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    })()}
                                </div>
                            )}

                            {/* Code: Maps tab */}
                            {mode === 'code' && activeTab === 'maps' && codeMaps.length > 0 && (
                                <div className="w-full max-w-3xl animate-in fade-in duration-300 pt-4 space-y-8 pb-12">
                                    {codeMaps.map((map) => (
                                        <MapPreview key={map.id} map={map} tiles={codeTiles} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Stats & Options Sidebar */}
                <div className="w-full md:w-72 bg-bg-tertiary/20 p-8 space-y-8">
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-ui-border pb-2">Analysis</h3>
                        <div className="space-y-4">
                            {mode === 'png' && (
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 uppercase font-bold text-[9px]">Source</span>
                                    <span className="text-white font-mono">{stats.width}x{stats.height}</span>
                                </div>
                            )}
                            {mode === 'code' && 'fileName' in props && (
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 uppercase font-bold text-[9px]">File</span>
                                    <span className="text-white font-mono text-[9px] truncate max-w-[140px]" title={props.fileName}>{props.fileName}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500 uppercase font-bold text-[9px]">Tiles Found</span>
                                <span className="text-accent-primary font-bold font-mono">{mode === 'code' ? codeTiles.length : stats.count}</span>
                            </div>
                            {mode === 'code' && codeMaps.length > 0 && (
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 uppercase font-bold text-[9px]">Maps Found</span>
                                    <span className="text-accent-primary font-bold font-mono">{codeMaps.length}</span>
                                </div>
                            )}
                            {(mode === 'code' ? codeTiles.length : stats.count) > platform.maxTiles && (
                                <div className="flex items-center gap-2 text-[9px] text-red-400 font-bold bg-red-400/10 p-3 rounded-xl border border-red-400/20 animate-pulse">
                                    <Shield size={12} /> Limit Exceeded ({platform.maxTiles})
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-ui-border pb-2">Processing</h3>

                        {/* Dither - PNG only */}
                        {mode === 'png' && (
                            <label className="flex items-center gap-4 p-4 rounded-xl bg-white/2 border border-ui-border hover:border-ui-border-strong transition-all cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={options.dither}
                                    onChange={(e) => setOptions(prev => ({ ...prev, dither: e.target.checked }))}
                                />
                                <div className={clsx(
                                    "w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center",
                                    options.dither ? "bg-accent-primary border-accent-primary shadow-lg shadow-accent-primary/20" : "border-ui-border-strong group-hover:border-ui-border-strong"
                                )}>
                                    {options.dither && <Check size={12} className="text-white" />}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Dithering</span>
                                    <span className="text-[9px] text-gray-500 italic">Smooth color blends</span>
                                </div>
                            </label>
                        )}

                        {/* Cleanup - shared */}
                        <label className="flex items-center gap-4 p-4 rounded-xl bg-white/2 border border-ui-border hover:border-ui-border-strong transition-all cursor-pointer group">
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={mode === 'code' ? codeCleanup : (options.cleanup ?? true)}
                                onChange={(e) => {
                                    if (mode === 'code') {
                                        setCodeCleanup(e.target.checked)
                                    } else {
                                        setOptions(prev => ({ ...prev, cleanup: e.target.checked }))
                                    }
                                }}
                            />
                            <div className={clsx(
                                "w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center",
                                (mode === 'code' ? codeCleanup : (options.cleanup ?? true))
                                    ? "bg-accent-primary border-accent-primary shadow-lg shadow-accent-primary/20"
                                    : "border-ui-border-strong group-hover:border-ui-border-strong"
                            )}>
                                {(mode === 'code' ? codeCleanup : (options.cleanup ?? true)) && <Check size={12} className="text-white" />}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Cleanup duplicates</span>
                                <span className="text-[9px] text-gray-500 italic">Merge identical tiles and reorder by usage</span>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
