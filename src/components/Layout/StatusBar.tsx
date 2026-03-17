import React from 'react'
import { Info, AlertTriangle, AlertCircle, Cpu, CheckCircle2, ShieldCheck, ShieldAlert } from 'lucide-react'
import { useProjectStore } from '../../stores/projectStore'
import { validateProject } from '../../core/validation/ConstraintEngine'
import { useEditorStore } from '../../stores/editorStore'
import { clsx } from 'clsx'

export const StatusBar: React.FC = () => {
    const { platform, tileset, maps } = useProjectStore()
    const { view, zoom, mapZoom } = useEditorStore()
    const [showIssues, setShowIssues] = React.useState(false)

    const issues = React.useMemo(() => validateProject(platform, tileset, maps), [platform, tileset, maps])
    const errors = issues.filter(i => i.severity === 'error')
    const warnings = issues.filter(i => i.severity === 'warning')

    const zoomLabel = view === 'tile'
        ? `${(zoom * 100).toFixed(0)}%`
        : `${(mapZoom * 100).toFixed(0)}%`

    return (
        <footer className="status-bar select-none shrink-0 py-0 relative z-20 text-[10px] font-medium tracking-wide uppercase">
            <div className="status-bar-group">
                <div className="status-bar-item">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-text-primary">Ready</span>
                </div>

                <div className="status-bar-item text-text-secondary">
                    <Cpu size={12} />
                    <span>{platform.name}</span>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowIssues(!showIssues)}
                        className={clsx(
                            "status-bar-item px-2 py-1 rounded-md transition-colors",
                            errors.length > 0 ? "text-red-400 hover:bg-red-400/10" :
                                warnings.length > 0 ? "text-amber-400 hover:bg-amber-400/10" :
                                    "text-text-secondary hover:bg-white/5"
                        )}
                    >
                        {errors.length > 0 ? <ShieldAlert size={12} /> :
                            warnings.length > 0 ? <AlertTriangle size={12} /> :
                                <ShieldCheck size={12} />}
                        <span>{errors.length} Errors, {warnings.length} Warnings</span>
                    </button>

                    {showIssues && issues.length > 0 && (
                        <div className="absolute bottom-full left-0 mb-2 w-80 rounded-lg bg-bg-secondary border border-ui-border-subtle shadow-2xl overflow-hidden">
                            <div className="px-4 py-2.5 border-b border-ui-border-subtle flex items-center gap-2">
                                <span className="font-bold text-text-primary">Project Issues</span>
                                <span className="ml-auto text-[9px] text-text-disabled">{issues.length} Total</span>
                            </div>
                            <div className="max-h-60 overflow-y-auto custom-scrollbar p-2 space-y-1">
                                {issues.map(issue => (
                                    <div key={issue.id} className="flex gap-2 items-start p-2 rounded hover:bg-white/5 transition-colors">
                                        {issue.severity === 'error' ?
                                            <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" /> :
                                            <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />}
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-text-primary leading-tight lowercase first-letter:uppercase">{issue.message}</span>
                                            <span className="text-[9px] text-text-disabled uppercase">{issue.type} • {issue.targetId}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="status-bar-group">
                <div className="status-bar-item">
                    <span className="text-text-secondary">Tiles:</span>
                    <span className="text-text-primary">{tileset.tiles.length}</span>
                </div>
                <div className="status-bar-item">
                    <span className="text-text-secondary">Maps:</span>
                    <span className="text-text-primary">{maps.length}</span>
                </div>
                <div className="status-bar-item">
                    <span className="text-text-secondary">Zoom:</span>
                    <span className="text-text-primary">{zoomLabel}</span>
                </div>
            </div>
        </footer>
    )
}
