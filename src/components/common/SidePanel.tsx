import React from 'react'
import { useEditorStore } from '../../stores/editorStore'
import { TilesExplorer } from '../Explorer/TilesExplorer'
import { MapsExplorer } from '../Explorer/MapsExplorer'

export const SidePanel: React.FC = () => {
    const { sidebarView } = useEditorStore()

    return (
        <div className="app-sidepanel">
            {sidebarView === 'tile' ? <TilesExplorer /> : <MapsExplorer />}
        </div>
    )
}
