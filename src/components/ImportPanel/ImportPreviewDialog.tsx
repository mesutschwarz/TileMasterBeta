import React, { useState, useEffect } from 'react'
import { Check, Grid, Shield, LayoutGrid, Image as ImageIcon } from 'lucide-react'
import { PlatformSpec } from '../../types/platform'
import { importPng, ImportOptions, ImportResult } from '../../importers/pngImporter'
import { clsx } from 'clsx'
import { Modal } from '../common/Modal'

interface ImportPreviewDialogProps {
    file: File
    platform: PlatformSpec
    onImport: (result: ImportResult, options: ImportOptions) => void
    onCancel: () => void
}

export const ImportPreviewDialog: React.FC<ImportPreviewDialogProps> = ({ file, platform, onImport, onCancel }) => {
    const [importResult, setImportResult] = useState<ImportResult | null>(null)
    const [options, setOptions] = useState<ImportOptions>({ dither: false, cleanup: true })
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ width: 0, height: 0, count: 0 })
    const [activeTab, setActiveTab] = useState<'result' | 'tiles' | 'original'>('result')

    useEffect(() => {
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
        processFile(url)
        return () => URL.revokeObjectURL(url)
    }, [file, options])

    const processFile = async (fileUrl: string) => {
        setLoading(true)
        try {
            const result = await importPng(file, platform, options)
            setImportResult(result)

            const img = new Image()
            img.onload = () => {
                setStats({
                    width: img.width,
                    height: img.height,
                    count: result.tiles.length
                })
                setLoading(false)
            }
            img.src = fileUrl
        } catch (err) {
            console.error('Processing failed:', err)
            setLoading(false)
        }
    }

    const TabButton = ({ id, label, icon }: { id: typeof activeTab, label: string, icon: React.ReactNode }) => (
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

    return (
        <Modal
            isOpen={true}
            onClose={onCancel}
            title="Import Assets"
            icon={<ImageIcon size={18} />}
            maxWidth="6xl"
            footer={
                <div className="flex items-center justify-between w-full gap-4">
                    {/* Centered Tabs (restored at bottom) */}
                    <div className="flex items-center gap-2">
                        <TabButton id="result" label="Tilemap" icon={<LayoutGrid size={14} />} />
                        <TabButton id="tiles" label="Tiles" icon={<Grid size={14} />} />
                        <TabButton id="original" label="Original Image" icon={<ImageIcon size={14} />} />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onCancel}
                            className="px-6 py-2 rounded-lg bg-bg-tertiary border border-white/5 hover:border-white/20 text-gray-500 hover:text-white text-[10px] font-bold transition-all uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => importResult && onImport(importResult, options)}
                            disabled={loading || stats.count === 0}
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
                <div className="flex-1 bg-black/40 overflow-hidden flex flex-col relative border-r border-white/5">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center text-gray-700 animate-pulse uppercase tracking-[0.3em] text-[10px] font-bold">Processing Logic...</div>
                    ) : (
                        <div className="flex-1 overflow-auto p-12 flex items-start justify-center relative bg-checkered custom-scrollbar">
                            {activeTab === 'original' && previewUrl && (
                                <div className="relative animate-in fade-in duration-300">
                                    <div className="shadow-preview-glow border border-white/10 rounded-lg overflow-hidden scale-[2] origin-top">
                                        <img src={previewUrl} className="pixelated" alt="Original" />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'result' && importResult && (
                                <div className="relative animate-in fade-in duration-300 text-center">
                                    <div
                                        className="grid shadow-preview-glow border border-white/10 rounded-lg overflow-hidden scale-[2] origin-top"
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

                            {activeTab === 'tiles' && importResult && (
                                <div className="w-full max-w-2xl animate-in fade-in duration-300 pt-4">
                                    <div className="flex flex-wrap gap-2 pb-12 justify-center">
                                        {importResult.tiles.map((tile, i) => (
                                            <div
                                                key={i}
                                                className="border border-white/5 group relative shrink-0 shadow-lg hover:border-accent-primary/50 transition-colors"
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: `repeat(${tile.width}, 1fr)`,
                                                    width: platform.tileWidth * 4,
                                                    height: platform.tileHeight * 4
                                                }}
                                            >
                                                {tile.data.map((colorIdx, pi) => (
                                                    <div key={pi} style={{ backgroundColor: platform.defaultPalette[colorIdx] }} />
                                                ))}
                                                <div className="absolute inset-0 bg-accent-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="text-[8px] font-bold text-white tabular-nums bg-black/80 px-1.5 py-0.5 rounded-full border border-white/10 shadow-xl">{i}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Stats & Options Sidebar */}
                <div className="w-full md:w-72 bg-bg-tertiary/20 p-8 space-y-8">
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">Analysis</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500 uppercase font-bold text-[9px]">Source</span>
                                <span className="text-white font-mono">{stats.width}×{stats.height}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500 uppercase font-bold text-[9px]">Tiles Found</span>
                                <span className="text-accent-primary font-bold font-mono">{stats.count}</span>
                            </div>
                            {stats.count > platform.maxTiles && (
                                <div className="flex items-center gap-2 text-[9px] text-red-400 font-bold bg-red-400/10 p-3 rounded-xl border border-red-400/20 animate-pulse">
                                    <Shield size={12} /> Limit Exceeded ({platform.maxTiles})
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">Processing</h3>
                        <label className="flex items-center gap-4 p-4 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={options.dither}
                                onChange={(e) => setOptions(prev => ({ ...prev, dither: e.target.checked }))}
                            />
                            <div className={clsx(
                                "w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center",
                                options.dither ? "bg-accent-primary border-accent-primary shadow-lg shadow-accent-primary/20" : "border-white/10 group-hover:border-white/20"
                            )}>
                                {options.dither && <Check size={12} className="text-white" />}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Dithering</span>
                                <span className="text-[9px] text-gray-500 italic">Smooth color blends</span>
                            </div>
                        </label>
                        <label className="flex items-center gap-4 p-4 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={options.cleanup ?? true}
                                onChange={(e) => setOptions(prev => ({ ...prev, cleanup: e.target.checked }))}
                            />
                            <div className={clsx(
                                "w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center",
                                (options.cleanup ?? true) ? "bg-accent-primary border-accent-primary shadow-lg shadow-accent-primary/20" : "border-white/10 group-hover:border-white/20"
                            )}>
                                {(options.cleanup ?? true) && <Check size={12} className="text-white" />}
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
