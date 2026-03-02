import React from 'react'
import { ShieldAlert, ShieldCheck, ChevronDown, ChevronUp, AlertCircle, AlertTriangle } from 'lucide-react'
import { useProjectStore } from '../../stores/projectStore'
import { validateProject } from '../../core/validation/ConstraintEngine'
import { clsx } from 'clsx'

export const HealthPanel: React.FC = () => {
    const { platform, tileset, maps } = useProjectStore()
    const [isCollapsed, setIsCollapsed] = React.useState(false)
    const issues = validateProject(platform, tileset, maps)

    const errors = issues.filter(i => i.severity === 'error')
    const warnings = issues.filter(i => i.severity === 'warning')

    return (
        <div className="border-t border-white/5 bg-bg-tertiary/30">
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full px-4 py-2 flex items-center justify-between hover:bg-white/5 transition-colors group"
            >
                <div className="flex items-center gap-2">
                    {errors.length > 0 ? (
                        <ShieldAlert size={14} className="text-red-400" />
                    ) : warnings.length > 0 ? (
                        <AlertTriangle size={14} className="text-yellow-400" />
                    ) : (
                        <ShieldCheck size={14} className="text-green-400" />
                    )}
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Platform Health</span>
                </div>
                <div className="flex items-center gap-2">
                    {errors.length > 0 && <span className="text-[10px] px-1 bg-red-400/20 text-red-400 rounded tabular-nums">{errors.length}</span>}
                    {isCollapsed ? <ChevronUp size={12} className="text-gray-500" /> : <ChevronDown size={12} className="text-gray-500" />}
                </div>
            </button>

            {!isCollapsed && (
                <div className="px-4 pb-4 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {issues.length === 0 ? (
                        <div className="text-[10px] text-gray-500 italic pb-2">All assets are within hardware constraints.</div>
                    ) : (
                        issues.map((issue) => (
                            <div key={issue.id} className="flex gap-2 group">
                                {issue.severity === 'error' ? (
                                    <AlertCircle size={10} className="text-red-400 shrink-0 mt-0.5" />
                                ) : (
                                    <AlertTriangle size={10} className="text-yellow-400 shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <div className={clsx(
                                        "text-[10px] leading-tight",
                                        issue.severity === 'error' ? "text-red-300" : "text-yellow-300"
                                    )}>
                                        {issue.message}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
