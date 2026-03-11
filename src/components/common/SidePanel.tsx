import React from 'react'
import { useEditorStore } from '../../stores/editorStore'
import { TilesExplorer } from '../Explorer/TilesExplorer'
import { MapsExplorer } from '../Explorer/MapsExplorer'

export const SidePanel: React.FC = () => {
    const { sidebarView } = useEditorStore()

    return (
        <div className="w-full h-full flex flex-col relative z-10 bg-transparent overflow-hidden min-h-0">
            {sidebarView === 'tile' ? <TilesExplorer /> : <MapsExplorer />}
        </div>
    )
}
