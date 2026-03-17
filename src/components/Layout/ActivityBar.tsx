import React from 'react'
import { Grid, Map as MapIcon, Settings } from 'lucide-react'
import { useEditorStore, ViewMode } from '../../stores/editorStore'
import { clsx } from 'clsx'
import { Tooltip } from '../common/Tooltip'

interface NavItem {
    view: ViewMode
    label: string
    icon: typeof Grid
    shortcut?: string
}

export const ActivityBar: React.FC = () => {
    const { sidebarView, setSidebarView, sidebarVisible, setSidebarVisible, setShowSettings } = useEditorStore()

    const navItems: NavItem[] = [
        { view: 'tile', label: 'Tile Editor', icon: Grid, shortcut: 'T' },
        { view: 'map', label: 'Map Builder', icon: MapIcon, shortcut: 'M' },
    ]

    return (
        <aside className="activity-bar">
            <div className="activity-bar-group">
                {navItems.map((item) => {
                    const isActive = sidebarView === item.view && sidebarVisible
                    return (
                        <Tooltip key={item.view} content={item.label} shortcut={item.shortcut} position="right">
                            <button
                                onClick={() => {
                                    if (sidebarView === item.view && sidebarVisible) {
                                        setSidebarVisible(false)
                                    } else {
                                        setSidebarView(item.view)
                                        setSidebarVisible(true)
                                    }
                                }}
                                className={clsx(
                                    "h-10 w-10 mx-auto flex items-center justify-center transition-colors activity-icon",
                                    isActive && "active"
                                )}
                            >
                                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            </button>
                        </Tooltip>
                    )
                })}
            </div>

            <div className="mt-auto activity-bar-group">
                <Tooltip content="Settings" shortcut="," position="right">
                    <button
                        onClick={() => setShowSettings(true)}
                        className="h-10 w-10 mx-auto flex items-center justify-center transition-colors activity-icon"
                    >
                        <Settings size={22} strokeWidth={1.5} />
                    </button>
                </Tooltip>
            </div>
        </aside>
    )
}
