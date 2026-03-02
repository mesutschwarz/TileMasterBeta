import React, { useState, useEffect } from 'react'
import { Download, Copy, FileCode, Check, FileJson, FileType, Image as ImageIcon, Settings } from 'lucide-react'
import { useProjectStore } from '../../stores/projectStore'
import { generateGbdkC, generateGbdkH, generateGbdkBin, GbdkExportOptions } from '../../exporters/gbdk/GbdkExporter'
import { exportTilesetToPng, exportMapToPng } from '../../exporters/png/PngExporter'
import { clsx } from 'clsx'
import { Modal } from '../common/Modal'

type ExportTab = 'c' | 'h' | 'bin' | 'png'

export const ExportDialog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { platform, tileset, maps, selectedMapId } = useProjectStore()
    const [activeTab, setActiveTab] = useState<ExportTab>('c')
    const [copied, setCopied] = useState(false)
    const [pngBlob, setPngBlob] = useState<Blob | null>(null)
    const [pngPreviewUrl, setPngPreviewUrl] = useState<string | null>(null)
    const [pngTarget, setPngTarget] = useState<'tileset' | 'map'>('tileset')

    const [options, setOptions] = useState<GbdkExportOptions>({
        projectName: 'tilemaster_assets',
        includeComments: true,
        exportAllLayers: true,
        useBank: undefined
    })

    const selectedMap = maps.find(m => m.id === selectedMapId)
    const cCode = generateGbdkC(platform, tileset, selectedMap, options)
    const hCode = generateGbdkH(tileset, selectedMap, options)
    const binData = generateGbdkBin(tileset)

    useEffect(() => {
        if (activeTab === 'png') generatePng()
    }, [activeTab, pngTarget, tileset, selectedMap, platform])

    useEffect(() => {
        return () => {
            if (pngPreviewUrl) {
                URL.revokeObjectURL(pngPreviewUrl)
            }
        }
    }, [pngPreviewUrl])

    const generatePng = async () => {
        try {
            let blob: Blob
            if (pngTarget === 'tileset') {
                blob = await exportTilesetToPng(tileset, platform)
            } else {
                if (!selectedMap) return
                blob = await exportMapToPng(selectedMap, tileset, platform)
            }
            setPngBlob(blob)
            if (pngPreviewUrl) URL.revokeObjectURL(pngPreviewUrl)
            setPngPreviewUrl(URL.createObjectURL(blob))
        } catch (err) {
            console.error('PNG Generation failed:', err)
        }
    }

    const handleCopy = () => {
        const textToCopy = activeTab === 'c' ? cCode : hCode
        navigator.clipboard.writeText(textToCopy)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const downloadFile = (filename: string, content: string | Uint8Array | Blob, type: string) => {
        const blob = content instanceof Blob ? content : new Blob([content as any], { type })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleDownload = () => {
        const safeName = options.projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
        if (activeTab === 'c') downloadFile(`${safeName}.c`, cCode, 'text/plain')
        if (activeTab === 'h') downloadFile(`${safeName}.h`, hCode, 'text/plain')
        if (activeTab === 'bin') downloadFile(`${safeName}.bin`, binData, 'application/octet-stream')
        if (activeTab === 'png' && pngBlob) {
            downloadFile(`${safeName}_${pngTarget}.png`, pngBlob, 'image/png')
        }
    }

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Export Assets"
            icon={<FileCode size={18} />}
            maxWidth="6xl"
            footer={
                <div className="flex gap-3">
                    {(activeTab === 'c' || activeTab === 'h') && (
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-tertiary border border-white/10 text-[10px] font-bold text-gray-400 hover:text-white hover:border-white/20 transition-all uppercase tracking-widest"
                        >
                            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            {copied ? 'Copied' : 'Copy Code'}
                        </button>
                    )}
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-6 py-2 rounded-lg bg-accent-primary text-white text-[10px] font-bold hover:bg-accent-secondary transition-all shadow-lg shadow-accent-primary/30 uppercase tracking-widest"
                    >
                        <Download size={14} />
                        Download {activeTab === 'c' ? '.c' : activeTab === 'h' ? '.h' : activeTab === 'bin' ? '.bin' : '.png'}
                    </button>
                </div>
            }
        >
            <div className="flex flex-col lg:flex-row min-h-[500px]">
                {/* Settings Sidebar */}
                <div className="w-full lg:w-72 bg-bg-tertiary/20 border-b lg:border-b-0 lg:border-r border-white/5 p-8 space-y-8">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">
                        <Settings size={12} /> Config
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Asset Name</label>
                            <input
                                type="text"
                                value={options.projectName}
                                onChange={(e) => setOptions({ ...options, projectName: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:border-accent-primary outline-none transition-colors font-mono"
                            />
                        </div>

                        <div className="space-y-1">
                            <button
                                onClick={() => setOptions({ ...options, includeComments: !options.includeComments })}
                                className="w-full flex items-center justify-between group py-2 hover:bg-white/5 rounded transition-colors"
                            >
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Comments</span>
                                <div className={clsx("w-8 h-4 rounded-full p-1 transition-colors", options.includeComments ? "bg-accent-primary" : "bg-white/10")}>
                                    <div className={clsx("w-2 h-2 rounded-full bg-white transition-transform", options.includeComments ? "translate-x-4" : "translate-x-0")} />
                                </div>
                            </button>

                            <button
                                onClick={() => setOptions({ ...options, exportAllLayers: !options.exportAllLayers })}
                                className="w-full flex items-center justify-between group py-2 hover:bg-white/5 rounded transition-colors"
                            >
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">All Layers</span>
                                <div className={clsx("w-8 h-4 rounded-full p-1 transition-colors", options.exportAllLayers ? "bg-accent-primary" : "bg-white/10")}>
                                    <div className={clsx("w-2 h-2 rounded-full bg-white transition-transform", options.exportAllLayers ? "translate-x-4" : "translate-x-0")} />
                                </div>
                            </button>
                        </div>

                        <div className="space-y-2 border-t border-white/5 pt-6">
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">ROM Bank</label>
                            <input
                                type="number"
                                placeholder="Auto"
                                value={options.useBank ?? ''}
                                onChange={(e) => setOptions({ ...options, useBank: e.target.value ? parseInt(e.target.value) : undefined })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:border-accent-primary outline-none transition-colors font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* Main Preview */}
                <div className="flex-1 flex flex-col min-w-0 bg-black/40">
                    <div className="flex border-b border-white/5 bg-bg-tertiary/10">
                        {[
                            { id: 'c', label: '.C Source', icon: FileCode },
                            { id: 'h', label: '.H Header', icon: FileType },
                            { id: 'bin', label: '.BIN Binary', icon: FileJson },
                            { id: 'png', label: '.PNG Image', icon: ImageIcon },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as ExportTab)}
                                className={clsx(
                                    "flex-1 py-4 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all border-b-2",
                                    activeTab === tab.id
                                        ? "text-accent-primary border-accent-primary bg-white/5 shadow-inner"
                                        : "text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5"
                                )}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col">
                        {activeTab === 'png' ? (
                            <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-300">
                                <div className="p-4 bg-white/2 flex items-center gap-4 justify-center border-b border-white/5">
                                    <button
                                        onClick={() => setPngTarget('tileset')}
                                        className={clsx(
                                            "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                                            pngTarget === 'tileset' ? "bg-accent-primary text-white" : "bg-white/5 text-gray-500 hover:text-white"
                                        )}
                                    >
                                        Tileset
                                    </button>
                                    <button
                                        onClick={() => setPngTarget('map')}
                                        disabled={!selectedMap}
                                        className={clsx(
                                            "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                                            pngTarget === 'map' ? "bg-accent-primary text-white" : "bg-white/5 text-gray-500 hover:text-white disabled:opacity-20"
                                        )}
                                    >
                                        Map Result
                                    </button>
                                </div>
                                <div className="flex-1 flex items-center justify-center p-12 overflow-auto bg-checkered">
                                    {pngPreviewUrl ? (
                                        <div className="shadow-preview-glow border border-white/10 rounded-lg overflow-hidden scale-[4] transition-transform origin-center">
                                            <img src={pngPreviewUrl} alt="Export Preview" className="pixelated" />
                                        </div>
                                    ) : (
                                        <div className="text-gray-700 animate-pulse uppercase tracking-[0.3em] text-[10px] font-bold">Rendering Asset...</div>
                                    )}
                                </div>
                            </div>
                        ) : activeTab === 'bin' ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-12 text-center animate-in fade-in duration-300">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                                    <FileJson size={32} className="opacity-50" />
                                </div>
                                <p className="text-xs font-bold uppercase tracking-widest mb-2">Binary Output Ready</p>
                                <p className="text-[10px] opacity-60 max-w-xs">{binData.length} bytes of raw tile data optimized for {platform.name}.</p>
                            </div>
                        ) : (
                            <div className="p-8 font-mono text-[11px] leading-relaxed text-gray-400 overflow-y-auto whitespace-pre custom-scrollbar selection:bg-accent-primary/20 animate-in fade-in duration-300">
                                {activeTab === 'c' ? cCode : hCode}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    )
}
