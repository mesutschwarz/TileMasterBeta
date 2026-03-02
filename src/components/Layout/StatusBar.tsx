import React from 'react'
import { Info, AlertTriangle, Cpu, CheckCircle2 } from 'lucide-react'
import { useProjectStore } from '../../stores/projectStore'
import { validateProject } from '../../core/validation/ConstraintEngine'

export const StatusBar: React.FC = () => {
    const { platform, tileset, maps, lastHistoryLabel, historyIndex, history } = useProjectStore()
    const issues = React.useMemo(() => validateProject(platform, tileset, maps), [platform, tileset, maps])

    const errors = issues.filter(i => i.severity === 'error').length
    const warnings = issues.filter(i => i.severity === 'warning').length

    return (
        <footer className="status-bar glass-panel rounded-3xl flex items-center justify-between px-6 select-none shrink-0 border-transparent shadow-lg py-1 relative z-20">
            <div className="flex items-center gap-4 h-full">
                <div className="flex items-center gap-1.5 h-full px-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors">
                    <Cpu size={12} className="text-gray-400" />
                    <span className="font-bold text-gray-200">{platform.name}</span>
                </div>

                <div className="flex items-center gap-3 h-full px-2">
                    <div className="flex items-center gap-1">
                        <AlertTriangle size={12} className={errors > 0 ? "text-white" : "opacity-50"} />
                        <span className="text-gray-300">{errors}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Info size={12} className={warnings > 0 ? "text-white" : "opacity-50"} />
                        <span className="text-gray-300">{warnings}</span>
                    </div>
                </div>

                {errors === 0 && (
                    <div className="flex items-center gap-1 text-gray-300">
                        <CheckCircle2 size={12} />
                        <span>Project Valid</span>
                    </div>
                )}

                {lastHistoryLabel && (
                    <div className="flex items-center gap-1 text-gray-400">
                        <span className="uppercase tracking-[0.2em] text-[9px]">Last</span>
                        <span className="text-gray-300">{lastHistoryLabel}</span>
                    </div>
                )}

                <div className="flex items-center gap-1 text-gray-400">
                    <span className="uppercase tracking-[0.2em] text-[9px]">History</span>
                    <span className="text-gray-300">{Math.max(historyIndex + 1, 0)}/{history.length}</span>
                </div>
            </div>

            <div className="flex items-center gap-4 h-full">
                <div className="px-2 h-full flex items-center hover:bg-white/10 cursor-pointer transition-colors text-gray-300">
                    Tiles: {tileset.tiles.length}/{platform.maxTiles}
                </div>
                <div className="px-2 h-full flex items-center hover:bg-white/10 cursor-pointer transition-colors text-gray-300">
                    Maps: {maps.length}
                </div>
                <div className="px-2 h-full flex items-center hover:bg-white/10 cursor-pointer transition-colors text-gray-300">
                    {platform.tileWidth}x{platform.tileHeight}
                </div>
            </div>
        </footer>
    )
}
