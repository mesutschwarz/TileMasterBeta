import React from 'react'
import { Info, AlertTriangle, AlertCircle, Cpu, CheckCircle2, ShieldCheck, ShieldAlert } from 'lucide-react'
import { useProjectStore } from '../../stores/projectStore'
import { validateProject } from '../../core/validation/ConstraintEngine'
import { clsx } from 'clsx'
import { useEditorStore } from '../../stores/editorStore'
import { formatTileNumber } from '../../utils/tileLabels'

export const StatusBar: React.FC = () => {
    const { platform, tileset, maps, selectedMapId, selectedTileId, lastHistoryLabel, historyIndex, history } = useProjectStore()
    const { view, zoom, mapZoom } = useEditorStore()
    const issues = React.useMemo(() => validateProject(platform, tileset, maps), [platform, tileset, maps])
    const [showHealth, setShowHealth] = React.useState(false)
    const healthRef = React.useRef<HTMLDivElement>(null)

    const errors = issues.filter(i => i.severity === 'error')
    const warnings = issues.filter(i => i.severity === 'warning')
    const selectedTileIndex = React.useMemo(() => tileset.tiles.findIndex((tile) => tile.id === selectedTileId), [tileset.tiles, selectedTileId])
    const selectedTileLabel = React.useMemo(() => formatTileNumber(selectedTileIndex < 0 ? 0 : selectedTileIndex), [selectedTileIndex])
    const selectedMap = React.useMemo(() => maps.find((map) => map.id === selectedMapId) ?? maps[0], [maps, selectedMapId])
    const zoomLabel = view === 'tile' ? `${Math.round((zoom / 16) * 100)}%` : `${Math.round(mapZoom * 100)}%`

    React.useEffect(() => {
        if (!showHealth) return
        const handleClickOutside = (e: MouseEvent) => {
            if (healthRef.current && !healthRef.current.contains(e.target as Node)) {
                setShowHealth(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showHealth])

    return (
        <footer className="status-bar flex items-center justify-between px-4 select-none shrink-0 py-0 relative z-20 border-t border-ui-border-subtle text-[10px] font-medium tracking-wide uppercase">
            <div className="flex items-center gap-6 h-full">
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-text-secondary">Ready</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                    <Cpu size={12} className="text-text-disabled" />
                    <span>Platform: {platform.name}</span>
                </div>

                {/* Platform Health indicator — click to expand details */}
                {(errors.length > 0 || warnings.length > 0) && (
                    <div className="relative" ref={healthRef}>
                        <button
                            onClick={() => setShowHealth(!showHealth)}
                            className={clsx(
                                "flex items-center gap-3 h-full px-2 py-1 rounded-lg transition-colors",
                                showHealth ? "bg-ui-bg-hover" : "hover:bg-ui-bg-hover"
                            )}
                        >
                            {errors.length > 0 ? (
                                <ShieldAlert size={12} className="text-red-400" />
                            ) : warnings.length > 0 ? (
                                <AlertTriangle size={12} className="text-yellow-400" />
                            ) : (
                                <ShieldCheck size={12} className="text-green-400" />
                            )}
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <AlertCircle size={10} className={errors.length > 0 ? "text-red-400" : "opacity-40"} />
                                    <span className="text-text-secondary text-xs">{errors.length}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <AlertTriangle size={10} className={warnings.length > 0 ? "text-yellow-400" : "opacity-40"} />
                                    <span className="text-text-secondary text-xs">{warnings.length}</span>
                                </div>
                            </div>
                        </button>

                        {showHealth && (
                            <div className="absolute bottom-full left-0 mb-2 w-80 rounded-lg bg-bg-secondary border border-ui-border-subtle shadow-2xl overflow-hidden">
                                <div className="px-4 py-2.5 border-b border-ui-border-subtle flex items-center gap-2">
                                    {errors.length > 0 ? (
                                        <ShieldAlert size={14} className="text-red-400" />
                                    ) : warnings.length > 0 ? (
                                        <AlertTriangle size={14} className="text-yellow-400" />
                                    ) : (
                                        <ShieldCheck size={14} className="text-green-400" />
                                    )}
                                    <span className="text-[10px] font-semibold text-text-primary uppercase tracking-widest">Platform Health</span>
                                </div>
                                <div className="px-4 py-3 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                    {issues.length === 0 ? (
                                        <div className="text-[10px] text-gray-400 italic">All assets are within hardware constraints.</div>
                                    ) : (
                                        issues.map((issue) => (
                                            <div key={issue.id} className="flex gap-2 items-start">
                                                {issue.severity === 'error' ? (
                                                    <AlertCircle size={10} className="text-red-400 shrink-0 mt-0.5" />
                                                ) : (
                                                    <AlertTriangle size={10} className="text-yellow-400 shrink-0 mt-0.5" />
                                                )}
                                                <span className={clsx(
                                                    "text-[10px] leading-tight",
                                                    issue.severity === 'error' ? "text-red-300" : "text-yellow-300"
                                                )}>
                                                    {issue.message}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {errors.length === 0 && <div className="hidden"><CheckCircle2 size={12} /></div>}

                {lastHistoryLabel && <div className="hidden">{lastHistoryLabel}{historyIndex}{history.length}</div>}
            </div>

            <div className="flex items-center gap-6 h-full">
                <div className="flex items-center gap-1">
                    <span className="text-text-secondary">Tile:</span>
                    <span className="text-text-primary">{selectedTileLabel} / {platform.maxTiles}</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-text-secondary">Map:</span>
                    <span className="text-text-primary">{selectedMap?.name ?? `Map ${maps.length}`}</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-text-secondary">Grid:</span>
                    <span className="text-text-primary">{platform.tileWidth} x {platform.tileHeight} px</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-text-secondary">Zoom:</span>
                    <span className="text-text-primary">{zoomLabel}</span>
                </div>
            </div>
        </footer>
    )
}
