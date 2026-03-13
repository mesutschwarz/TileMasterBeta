import React from 'react'
import { DockviewReact, DockviewReadyEvent, IDockviewPanelProps } from 'dockview-react'
import { TileCanvas } from '../TileEditor/TileCanvas'
import { MapCanvas } from '../MapBuilder/MapCanvas'
import { DrawingToolbar } from '../TileEditor/DrawingToolbar'
import { PaletteToolbar } from '../TileEditor/PaletteToolbar'
import { useEditorStore } from '../../stores/editorStore'
import { useProjectStore } from '../../stores/projectStore'
import { formatTileLabel } from '../../utils/tileLabels'


const TileEditorView: React.FC<IDockviewPanelProps> = () => {
    const { drawingToolbarDock, paletteDock } = useEditorStore()

    return (
        <div className="h-full w-full relative bg-bg-primary overflow-hidden flex flex-col text-text-primary">
            {/* --- OUTER SHELL (Drawing Tool Priority) --- */}
            {drawingToolbarDock === 'top' && <DrawingToolbar />}

            <div className="flex flex-1 overflow-hidden min-h-0 min-w-0">
                {drawingToolbarDock === 'left' && <DrawingToolbar />}

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

                {drawingToolbarDock === 'right' && <DrawingToolbar />}
            </div>

            {drawingToolbarDock === 'bottom' && <DrawingToolbar />}

            {/* --- FLOATING OVERLAYS --- */}
            {drawingToolbarDock === 'floating' && <DrawingToolbar />}
            {paletteDock === 'floating' && <PaletteToolbar />}
        </div>
    )
}

const MapEditorView: React.FC<IDockviewPanelProps> = () => {
    const { drawingToolbarDock } = useEditorStore()

    return (
        <div className="h-full w-full relative bg-bg-primary overflow-hidden flex flex-col text-text-primary">
            {drawingToolbarDock === 'top' && <DrawingToolbar />}
            <div className="flex flex-1 overflow-hidden min-h-0 min-w-0">
                {drawingToolbarDock === 'left' && <DrawingToolbar />}
                <div className="flex-1 flex flex-col min-h-0 min-w-0 relative">
                    <div className="flex flex-1 overflow-hidden min-h-0 min-w-0">
                        <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-bg-primary">
                            <MapCanvas />
                        </div>
                    </div>
                </div>
                {drawingToolbarDock === 'right' && <DrawingToolbar />}
            </div>
            {drawingToolbarDock === 'bottom' && <DrawingToolbar />}
            {drawingToolbarDock === 'floating' && <DrawingToolbar />}
        </div>
    )
}

const componentMap = {
    tileEditor: TileEditorView,
    mapEditor: MapEditorView,
}

export const DockLayout: React.FC = () => {
    const { view } = useEditorStore()
    const { tileset, selectedTileId, maps, selectedMapId } = useProjectStore()
    const apiRef = React.useRef<any>(null)

    const tileIndex = React.useMemo(() => tileset.tiles.findIndex(t => t.id === selectedTileId), [tileset.tiles, selectedTileId])
    const selectedTile = React.useMemo(() => tileset.tiles.find(t => t.id === selectedTileId) ?? null, [tileset.tiles, selectedTileId])
    const tileTitle = React.useMemo(() => {
        if (tileIndex < 0) {
            return 'Tile Editor'
        }

        return formatTileLabel(tileIndex, selectedTile?.name)
    }, [tileIndex, selectedTile])

    const mapIndex = React.useMemo(() => maps.findIndex(m => m.id === selectedMapId), [maps, selectedMapId])
    const selectedMap = React.useMemo(() => maps.find(m => m.id === selectedMapId) ?? null, [maps, selectedMapId])
    const mapTitle = React.useMemo(() => {
        return selectedMap?.name?.trim() ? `Map: ${selectedMap.name.trim()}` : 'Map Editor'
    }, [mapIndex, selectedMap])

    const onReady = (event: DockviewReadyEvent) => {
        apiRef.current = event.api

        // 1. Add Tile Editor (Main)
        event.api.addPanel({
            id: 'tileEditor',
            component: 'tileEditor',
            title: tileTitle,
        })

        // 2. Add Map Editor in the same group as Tile Editor
        event.api.addPanel({
            id: 'mapEditor',
            component: 'mapEditor',
            title: mapTitle,
            position: { referencePanel: 'tileEditor', direction: 'within' },
        })

        // Initial focus
        const panelId = view === 'tile' ? 'tileEditor' : 'mapEditor'
        event.api.getPanel(panelId)?.focus()
    }

    React.useEffect(() => {
        if (!apiRef.current) return
        const panelId = view === 'tile' ? 'tileEditor' : 'mapEditor'
        apiRef.current.getPanel(panelId)?.focus()
    }, [view])

    React.useEffect(() => {
        if (!apiRef.current) return
        apiRef.current.getPanel('tileEditor')?.setTitle?.(tileTitle)
        apiRef.current.getPanel('mapEditor')?.setTitle?.(mapTitle)
    }, [tileTitle, mapTitle])

    const dockviewTheme = React.useMemo(
        () => ({
            name: 'tilemaster',
            className: 'dockview-theme-custom',
        }),
        []
    )


    return (
        <div className="h-full w-full bg-bg-primary">
            <DockviewReact
                components={componentMap}
                onReady={onReady}
                disableAutoResizing={false}
                theme={dockviewTheme}
            />
        </div>
    )
}
