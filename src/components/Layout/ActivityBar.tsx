import React from 'react'
import { Grid, Map as MapIcon, Settings } from 'lucide-react'
import { useEditorStore, ViewMode } from '../../stores/editorStore'
import { clsx } from 'clsx'
import { Tooltip } from '../common/Tooltip'

export const ActivityBar: React.FC = () => {
    const { sidebarView, setSidebarView, sidebarVisible, setSidebarVisible, toggleSidebar, setShowSettings } = useEditorStore()

    const handleViewClick = (newView: ViewMode) => {
        if (sidebarView === newView) {
            toggleSidebar()
        } else {
            setSidebarView(newView)
            setSidebarVisible(true)
        }
    }

    const NavButton: React.FC<{
        id: ViewMode,
        icon: React.ReactNode,
        label: string,
        shortcut: string
    }> = ({ id, icon, label, shortcut }) => {
        const active = sidebarView === id && sidebarVisible

        return (
            <Tooltip content={label} position="right" shortcut={shortcut}>
                <button
                    onClick={() => handleViewClick(id)}
                    className={clsx(
                        "w-full aspect-square flex items-center justify-center transition-all relative group activity-icon",
                        active && "active"
                    )}
                >
                    {React.cloneElement(icon as React.ReactElement, {
                        size: 24,
                        strokeWidth: active ? 2 : 1.5
                    })}
                </button>
            </Tooltip>
        )
    }

    return (
        <div className="activity-bar glass-panel rounded-3xl h-full flex flex-col items-center py-4 shrink-0 z-50 shadow-lg">
            <div className="flex flex-col gap-3 w-full px-2">
                <NavButton id="tile" icon={<Grid />} label="Tiles Explorer" shortcut="T" />
                <NavButton id="map" icon={<MapIcon />} label="Map Explorer" shortcut="V" />
            </div>

            <div className="mt-auto flex flex-col gap-2 w-full px-2">
                <Tooltip content="Settings" position="right" shortcut="Ctrl+,">
                    <button
                        onClick={() => setShowSettings(true)}
                        className="w-full aspect-square flex items-center justify-center rounded-xl transition-colors activity-icon"
                    >
                        <Settings size={22} strokeWidth={1.5} />
                    </button>
                </Tooltip>
            </div>
        </div>
    )
}
