import React, { useState, useRef, useEffect } from 'react'
import { DockviewReact, DockviewReadyEvent, IDockviewPanelProps } from 'dockview-react'
import { TileCanvas } from '../TileEditor/TileCanvas'
import { MapCanvas } from '../MapBuilder/MapCanvas'
import { DrawingToolsPanel } from './DrawingToolsPanel'
import { PaletteToolbar } from '../TileEditor/PaletteToolbar'
import { useEditorStore } from '../../stores/editorStore'
import { useProjectStore } from '../../stores/projectStore'
import { formatTileLabel } from '../../utils/tileLabels'
import { Layout as LayoutIcon, Check } from 'lucide-react'
import { clsx } from 'clsx'


const TileEditorView: React.FC<IDockviewPanelProps> = () => {
    const { paletteDock } = useEditorStore()

    return (
        <div className="h-full w-full relative bg-bg-primary overflow-hidden flex flex-col text-text-primary">
            <div className="flex flex-1 overflow-hidden min-h-0 min-w-0">
                {/* --- INNER SHELL (Palette & Canvas) --- */}
                <div className="flex-1 flex flex-col min-h-0 min-w-0 relative">
                    {paletteDock === 'top' && <PaletteToolbar />}

                    <div className="flex flex-1 overflow-hidden min-h-0 min-w-0">
                        {paletteDock === 'left' && <PaletteToolbar />}

                        {/* THE CANVAS CORE */}
                        <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-bg-primary">
                            <TileCanvas />
                        </div>

                        {paletteDock === 'right' && <PaletteToolbar />}
                    </div>

                    {paletteDock === 'bottom' && <PaletteToolbar />}
                </div>

            </div>
            {paletteDock === 'floating' && <PaletteToolbar />}
        </div>
    )
}

const MapEditorView: React.FC<IDockviewPanelProps> = () => {
    return (
        <div className="h-full w-full relative bg-bg-primary overflow-hidden flex flex-col text-text-primary">
            <div className="flex flex-1 overflow-hidden min-h-0 min-w-0">
                <div className="flex-1 flex flex-col min-h-0 min-w-0 relative">
                    <div className="flex flex-1 overflow-hidden min-h-0 min-w-0">
                        <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-bg-primary">
                            <MapCanvas />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const componentMap = {
    tileEditor: TileEditorView,
    mapEditor: MapEditorView,
    drawingTools: DrawingToolsPanel,
}

const LayoutToggleMenu: React.FC = () => {
    const { dockviewApi } = useEditorStore()
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isOpen) return
        const handlePointerDown = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handlePointerDown)
        return () => document.removeEventListener('mousedown', handlePointerDown)
    }, [isOpen])

    const togglePanel = (id: 'tileEditor' | 'mapEditor') => {
        if (!dockviewApi) return
        const existing = dockviewApi.getPanel(id)
        if (existing) {
            existing.api.close()
        } else {
            if (id === 'tileEditor') {
                dockviewApi.addPanel({ id: 'tileEditor', component: 'tileEditor', title: 'Tile Editor' })
            } else {
                dockviewApi.addPanel({
                    id: 'mapEditor',
                    component: 'mapEditor',
                    title: 'Map Editor',
                    position: { referencePanel: 'tileEditor', direction: 'within' }
                })
            }
        }
        setIsOpen(false)
    }

    return (
        <div className="dockview-right-actions" ref={menuRef}>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={clsx(
                        "p-1.5 rounded transition-colors hover:bg-ui-bg-hover text-text-secondary hover:text-text-primary",
                        isOpen && "bg-ui-bg-hover text-accent-primary"
                    )}
                    title="Panels & Layout"
                >
                    <LayoutIcon size={16} />
                </button>

                {isOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-bg-secondary border border-ui-border-subtle rounded-md shadow-xl py-1 z-[1000]">
                        <button
                            onClick={() => togglePanel('tileEditor')}
                            className="w-full px-4 py-2 text-left text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-ui-bg-hover transition-colors flex items-center justify-between"
                        >
                            <span>Tile Editor</span>
                            {dockviewApi?.getPanel('tileEditor') && <Check size={12} className="text-accent-primary" />}
                        </button>
                        <button
                            onClick={() => togglePanel('mapEditor')}
                            className="w-full px-4 py-2 text-left text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-ui-bg-hover transition-colors flex items-center justify-between"
                        >
                            <span>Map Editor</span>
                            {dockviewApi?.getPanel('mapEditor') && <Check size={12} className="text-accent-primary" />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export const DockLayout: React.FC = () => {
    const { view, setDockviewApi } = useEditorStore()
    const { tileset, selectedTileId, maps, selectedMapId } = useProjectStore()
    const apiRef = React.useRef<any>(null)

    const tileIndex = React.useMemo(() => tileset.tiles.findIndex(t => t.id === selectedTileId), [tileset.tiles, selectedTileId])
    const selectedTile = React.useMemo(() => tileset.tiles.find(t => t.id === selectedTileId) ?? null, [tileset.tiles, selectedTileId])
    const tileTitle = React.useMemo(() => {
        if (tileIndex < 0) return 'Tile Editor'
        return `Tile Editor — ${formatTileLabel(tileIndex, selectedTile?.name)}`
    }, [tileIndex, selectedTile])

    const selectedMap = React.useMemo(() => maps.find(m => m.id === selectedMapId) ?? null, [maps, selectedMapId])
    const mapTitle = React.useMemo(() => {
        return selectedMap?.name?.trim() ? `Map Editor — ${selectedMap.name.trim()}` : 'Map Editor'
    }, [selectedMap])

    const onReady = (event: DockviewReadyEvent) => {
        apiRef.current = event.api
        setDockviewApi(event.api)

        event.api.addPanel({ id: 'tileEditor', component: 'tileEditor', title: tileTitle })
        event.api.addPanel({
            id: 'mapEditor',
            component: 'mapEditor',
            title: mapTitle,
            position: { referencePanel: 'tileEditor', direction: 'within' },
        })
        event.api.addPanel({
            id: 'drawingTools',
            component: 'drawingTools',
            title: 'Drawing Tools',
            position: { referencePanel: 'tileEditor', direction: 'left' },
            initialWidth: 240,
            minimumWidth: 120,
            minimumHeight: 120,
        })

        const panelId = view === 'tile' ? 'tileEditor' : 'mapEditor'
        event.api.getPanel(panelId)?.focus()
    }

    React.useEffect(() => {
        if (!apiRef.current) return
        const panelId = view === 'tile' ? 'tileEditor' : 'mapEditor'
        const panel = apiRef.current.getPanel(panelId)
        if (panel) panel.focus()
    }, [view])

    React.useEffect(() => {
        if (!apiRef.current) return
        apiRef.current.getPanel('tileEditor')?.setTitle?.(tileTitle)
        apiRef.current.getPanel('mapEditor')?.setTitle?.(mapTitle)
    }, [tileTitle, mapTitle])

    const dockviewTheme = React.useMemo(() => ({ name: 'tilemaster', className: 'dockview-theme-custom' }), [])

    return (
        <div className="h-full w-full bg-bg-primary relative">
            <DockviewReact
                components={componentMap}
                onReady={onReady}
                disableAutoResizing={false}
                theme={dockviewTheme}
            />
            <LayoutToggleMenu />
        </div>
    )
}
