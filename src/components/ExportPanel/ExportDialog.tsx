import React, { useState, useEffect } from 'react'
import { Download, Copy, FileCode, Check, FileJson, FileType, Image as ImageIcon, Settings } from 'lucide-react'
import { useProjectStore } from '../../stores/projectStore'
import { generateGbdkC, generateGbdkH, generateGbdkBin, GbdkExportOptions } from '../../exporters/gbdk/GbdkExporter'
import { exportTilesetToPng, exportMapToPng } from '../../exporters/png/PngExporter'
import { clsx } from 'clsx'
import { Modal } from '../common/Modal'
import { toProjectFileStem, toSnakeCaseIdentifier } from '../../utils/projectName'

type ExportTab = 'c' | 'h' | 'bin' | 'png'

export const ExportDialog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { platform, projectName, setProjectName, tileset, maps, selectedMapId } = useProjectStore()
    const [activeTab, setActiveTab] = useState<ExportTab>('c')
    const [copied, setCopied] = useState(false)
    const [pngBlob, setPngBlob] = useState<Blob | null>(null)
    const [pngPreviewUrl, setPngPreviewUrl] = useState<string | null>(null)
    const [pngTarget, setPngTarget] = useState<'tileset' | 'map'>('tileset')
    const [projectNameDraft, setProjectNameDraft] = useState(projectName)

    const [options, setOptions] = useState<Omit<GbdkExportOptions, 'projectName'>>({
        includeComments: true,
        exportAllLayers: true,
        useBank: undefined
    })

    const exportOptions: GbdkExportOptions = {
        ...options,
        projectName,
    }

    const selectedMap = maps.find(m => m.id === selectedMapId)
    const cCode = generateGbdkC(platform, tileset, selectedMap, exportOptions)
    const hCode = generateGbdkH(platform, tileset, selectedMap, exportOptions)
    const binData = generateGbdkBin(platform, tileset)

    useEffect(() => {
        if (activeTab === 'png') generatePng()
    }, [activeTab, pngTarget, tileset, selectedMap, platform])

    useEffect(() => {
        setProjectNameDraft(projectName)
    }, [projectName])

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

    const commitProjectName = () => {
        setProjectName(projectNameDraft, 'Project: Rename')
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
        const variableStem = toSnakeCaseIdentifier(projectName)
        const projectFileStem = toProjectFileStem(projectName)
        if (activeTab === 'c') downloadFile(`${variableStem}.c`, cCode, 'text/plain')
        if (activeTab === 'h') downloadFile(`${variableStem}.h`, hCode, 'text/plain')
        if (activeTab === 'bin') downloadFile(`${variableStem}.bin`, binData, 'application/octet-stream')
        if (activeTab === 'png' && pngBlob) {
            downloadFile(`${projectFileStem}.png`, pngBlob, 'image/png')
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
                            className="modal-button-secondary flex items-center gap-2"
                        >
                            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            {copied ? 'Copied' : 'Copy Code'}
                        </button>
                    )}
                    <button
                        onClick={handleDownload}
                        className="modal-button-primary flex items-center gap-2"
                    >
                        <Download size={14} />
                        Download {activeTab === 'c' ? '.c' : activeTab === 'h' ? '.h' : activeTab === 'bin' ? '.bin' : '.png'}
                    </button>
                </div>
            }
        >
            <div className="flex flex-col lg:flex-row flex-1">
                {/* Settings Sidebar */}
                <div className="modal-sidebar space-y-8">
                    <div className="flex items-center gap-2 label-xs border-b border-ui-border-subtle pb-2">
                        <Settings size={12} /> Config
                    </div>

                    <div className="space-y-6">
                        <div className="form-group">
                            <label className="label-xs opacity-70">Project Name</label>
                            <input
                                type="text"
                                value={projectNameDraft}
                                onChange={(e) => setProjectNameDraft(e.target.value)}
                                onBlur={commitProjectName}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        commitProjectName()
                                    }
                                }}
                                className="w-full modern-input"
                            />
                        </div>

                        <div className="space-y-1">
                            <button
                                onClick={() => setOptions({ ...options, includeComments: !options.includeComments })}
                                className="w-full flex items-center justify-between group py-2 hover:bg-white/5 rounded transition-colors"
                            >
                                <span className="label-xs opacity-70">Comments</span>
                                <div className={clsx("toggle-switch", options.includeComments ? "toggle-switch-on" : "toggle-switch-off")}>
                                    <div className={clsx("toggle-knob", options.includeComments ? "toggle-knob-on" : "toggle-knob-off")} />
                                </div>
                            </button>

                            <button
                                onClick={() => setOptions({ ...options, exportAllLayers: !options.exportAllLayers })}
                                className="w-full flex items-center justify-between group py-2 hover:bg-white/5 rounded transition-colors"
                            >
                                <span className="label-xs opacity-70">All Layers</span>
                                <div className={clsx("toggle-switch", options.exportAllLayers ? "toggle-switch-on" : "toggle-switch-off")}>
                                    <div className={clsx("toggle-knob", options.exportAllLayers ? "toggle-knob-on" : "toggle-knob-off")} />
                                </div>
                            </button>
                        </div>

                        <div className="form-group border-t border-ui-border-subtle pt-6">
                            <label className="label-xs opacity-70">ROM Bank</label>
                            <input
                                type="number"
                                placeholder="Auto"
                                value={options.useBank ?? ''}
                                onChange={(e) => setOptions({ ...options, useBank: e.target.value ? parseInt(e.target.value) : undefined })}
                                className="w-full modern-input"
                            />
                        </div>
                    </div>
                </div>

                {/* Main Preview */}
                <div className="modal-main-content">
                    <div className="modal-tab-bar">
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
                                    "modal-tab-button",
                                    activeTab === tab.id && "modal-tab-button-active"
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
                                <div className="p-4 bg-white/2 flex items-center gap-4 justify-center border-b border-ui-border-subtle">
                                    <button
                                        onClick={() => setPngTarget('tileset')}
                                        className={clsx(
                                            "collision-button h-8 px-4",
                                            pngTarget === 'tileset' && "collision-button-selected"
                                        )}
                                    >
                                        Tileset
                                    </button>
                                    <button
                                        onClick={() => setPngTarget('map')}
                                        disabled={!selectedMap}
                                        className={clsx(
                                            "collision-button h-8 px-4",
                                            pngTarget === 'map' && "collision-button-selected"
                                        )}
                                    >
                                        Map Result
                                    </button>
                                </div>
                                <div className="flex-1 flex items-center justify-center p-12 overflow-auto bg-checkered">
                                    {pngPreviewUrl ? (
                                        <div className="shadow-preview-glow border border-ui-border-strong rounded-lg overflow-hidden scale-[4] transition-transform origin-center">
                                            <img src={pngPreviewUrl} alt="Export Preview" className="pixelated" />
                                        </div>
                                    ) : (
                                        <div className="text-text-disabled animate-pulse uppercase tracking-[0.3em] text-[10px] font-bold">Rendering Asset...</div>
                                    )}
                                </div>
                            </div>
                        ) : activeTab === 'bin' ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-text-secondary p-12 text-center animate-in fade-in duration-300">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                                    <FileJson size={32} className="opacity-50" />
                                </div>
                                <p className="text-xs font-bold uppercase tracking-widest mb-2">Binary Output Ready</p>
                                <p className="text-[10px] opacity-60 max-w-xs">{binData.length} bytes of raw tile data optimized for {platform.name}.</p>
                            </div>
                        ) : (
                            <div className="p-8 font-mono text-[11px] leading-relaxed text-text-secondary overflow-y-auto whitespace-pre custom-scrollbar selection:bg-accent-primary/20 animate-in fade-in duration-300">
                                {activeTab === 'c' ? cCode : hCode}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    )
}
