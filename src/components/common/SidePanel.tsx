import React from 'react'
import { useEditorStore } from '../../stores/editorStore'
import { TilesExplorer } from '../Explorer/TilesExplorer'
import { MapsExplorer } from '../Explorer/MapsExplorer'
import { HealthPanel } from './HealthPanel'

export const SidePanel: React.FC = () => {
    const { view } = useEditorStore()

    return (
        <div className="w-full h-full flex flex-col relative z-10 bg-transparent overflow-hidden min-h-0">
            <div className="panel-header bg-transparent border-b border-ui-border-strong/10">
                <span>Explorer</span>
                <span className="text-[9px] tracking-[0.2em] opacity-70">
                    {view === 'tile' ? 'TILES' : 'MAPS'}
                </span>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
                {view === 'tile' ? <TilesExplorer /> : <MapsExplorer />}
            </div>
            <HealthPanel />
        </div>
    )
}
