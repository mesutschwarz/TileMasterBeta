import React from 'react'
import { Pencil, Eraser, PaintBucket, Pipette, Grid3X3, RotateCw, FlipHorizontal, FlipVertical, Undo2, Trash2, Slash, Square, Circle, Minus, Plus } from 'lucide-react'
import { useEditorStore } from '../../stores/editorStore'
import { useProjectStore } from '../../stores/projectStore'
import { Tooltip } from '../common/Tooltip'
import { ToolButton, ToolbarDivider, ToolbarGroup } from '../common/Toolbar'
import { clsx } from 'clsx'

interface ToolBarProps {
    horizontal?: boolean
}

export const ToolBar: React.FC<ToolBarProps> = ({ horizontal = false }) => {
    const {
        view, selectedTool: tool, setTool,
        showGrid, showMapGrid, toggleGrid, toggleMapGrid,
        selectedLayerId,
        brushSize, setBrushSize,
        brushShape, setBrushShape
    } = useEditorStore()
    const {
        flipTile, rotateTile, selectedTileId,
        undo, clearTile, clearMapLayer, selectedMapId
    } = useProjectStore()

    const handleClear = () => {
        if (view === 'tile' && selectedTileId) {
            clearTile(selectedTileId, 'Tile: Clear')
        } else if (view === 'map' && selectedMapId && selectedLayerId) {
            clearMapLayer(selectedMapId, selectedLayerId, 'Map: Clear')
        }
    }

    const gridVisible = view === 'tile' ? showGrid : showMapGrid
    const handleToggleGrid = view === 'tile' ? toggleGrid : toggleMapGrid

    const orientation = horizontal ? 'horizontal' : 'vertical'

    return (
        <div className={clsx(
            "drawing-tools-layout",
            horizontal ? "drawing-tools-layout-horizontal" : "drawing-tools-layout-vertical"
        )}>
            {/* Draw Tools */}
            <ToolbarGroup orientation={orientation}>
                <Tooltip content="Pencil Tool" shortcut="P" position={horizontal ? "bottom" : "right"}>
                    <ToolButton id="pencil" onClick={() => setTool('pencil')} active={tool === 'pencil'}>
                        <Pencil size={16} />
                    </ToolButton>
                </Tooltip>

                <Tooltip content="Eraser Tool" shortcut="E" position={horizontal ? "bottom" : "right"}>
                    <ToolButton id="eraser" onClick={() => setTool('eraser')} active={tool === 'eraser'}>
                        <Eraser size={16} />
                    </ToolButton>
                </Tooltip>

                <Tooltip content="Flood Fill" shortcut="G" position={horizontal ? "bottom" : "right"}>
                    <ToolButton id="fill" onClick={() => setTool('fill')} active={tool === 'fill'}>
                        <PaintBucket size={16} />
                    </ToolButton>
                </Tooltip>

                <Tooltip content="Color Picker" shortcut="I" position={horizontal ? "bottom" : "right"}>
                    <ToolButton id="picker" onClick={() => setTool('picker')} active={tool === 'picker'}>
                        <Pipette size={16} />
                    </ToolButton>
                </Tooltip>

                <Tooltip content="Select Tool" shortcut="S" position={horizontal ? "bottom" : "right"}>
                    <ToolButton id="select" onClick={() => setTool('select')} active={tool === 'select'}>
                        <Square size={16} />
                    </ToolButton>
                </Tooltip>

                <Tooltip content="Line Tool" shortcut="L" position={horizontal ? "bottom" : "right"}>
                    <ToolButton id="line" onClick={() => setTool('line')} active={tool === 'line'}>
                        <Slash size={16} />
                    </ToolButton>
                </Tooltip>

                <Tooltip content="Rectangle Tool" shortcut="B" position={horizontal ? "bottom" : "right"}>
                    <ToolButton id="rect" onClick={() => setTool('rect')} active={tool === 'rect'}>
                        <Square size={16} />
                    </ToolButton>
                </Tooltip>

                <Tooltip content="Circle Tool" shortcut="O" position={horizontal ? "bottom" : "right"}>
                    <ToolButton id="circle" onClick={() => setTool('circle')} active={tool === 'circle'}>
                        <Circle size={16} />
                    </ToolButton>
                </Tooltip>
            </ToolbarGroup>

            <ToolbarDivider orientation={orientation} />

            {/* Grid Toggle */}
            <ToolbarGroup orientation={orientation}>
                <Tooltip content="Toggle Grid" shortcut="#" position={horizontal ? "bottom" : "right"}>
                    <ToolButton onClick={handleToggleGrid} active={gridVisible}>
                        <Grid3X3 size={16} />
                    </ToolButton>
                </Tooltip>
            </ToolbarGroup>

            <ToolbarDivider orientation={orientation} />

            {/* Brush Size */}
            <ToolbarGroup orientation={orientation}>
                <Tooltip content="Decrease Brush" shortcut="-" position={horizontal ? "bottom" : "right"}>
                    <ToolButton onClick={() => setBrushSize(Math.max(1, brushSize - 1))}>
                        <Minus size={16} />
                    </ToolButton>
                </Tooltip>
                <div className="w-8 h-8 flex items-center justify-center rounded-md text-[10px] text-text-secondary bg-bg-secondary border border-ui-border-subtle shrink-0">
                    {brushSize}
                </div>
                <Tooltip content="Increase Brush" shortcut="+" position={horizontal ? "bottom" : "right"}>
                    <ToolButton onClick={() => setBrushSize(Math.min(16, brushSize + 1))}>
                        <Plus size={16} />
                    </ToolButton>
                </Tooltip>
                <Tooltip content="Toggle Brush Shape" position={horizontal ? "bottom" : "right"}>
                    <ToolButton
                        onClick={() => setBrushShape(brushShape === 'square' ? 'circle' : 'square')}
                        active={brushShape === 'circle'}
                    >
                        {brushShape === 'circle' ? <Circle size={16} /> : <Square size={16} />}
                    </ToolButton>
                </Tooltip>
            </ToolbarGroup>

            {/* Tile Specific Tools */}
            {view === 'tile' && (
                <>
                    <ToolbarDivider orientation={orientation} />
                    <ToolbarGroup orientation={orientation}>
                        <Tooltip content="Rotate Tile" shortcut="R" position={horizontal ? "bottom" : "right"}>
                            <ToolButton
                                disabled={!selectedTileId}
                                onClick={() => {
                                    if (!selectedTileId) return
                                    rotateTile(selectedTileId, 'cw', 'Tile: Rotate')
                                }}
                            >
                                <RotateCw size={16} />
                            </ToolButton>
                        </Tooltip>

                        <Tooltip content="Flip Horizontal" shortcut="H" position={horizontal ? "bottom" : "right"}>
                            <ToolButton
                                disabled={!selectedTileId}
                                onClick={() => {
                                    if (!selectedTileId) return
                                    flipTile(selectedTileId, 'horizontal', 'Tile: Flip H')
                                }}
                            >
                                <FlipHorizontal size={16} />
                            </ToolButton>
                        </Tooltip>

                        <Tooltip content="Flip Vertical" shortcut="J" position={horizontal ? "bottom" : "right"}>
                            <ToolButton
                                disabled={!selectedTileId}
                                onClick={() => {
                                    if (!selectedTileId) return
                                    flipTile(selectedTileId, 'vertical', 'Tile: Flip V')
                                }}
                            >
                                <FlipVertical size={16} />
                            </ToolButton>
                        </Tooltip>
                    </ToolbarGroup>
                </>
            )}

            <ToolbarDivider orientation={orientation} />

            {/* History & Utility */}
            <ToolbarGroup orientation={orientation}>
                <Tooltip content="Undo" shortcut="Ctrl+Z" position={horizontal ? "bottom" : "right"}>
                    <ToolButton onClick={undo}>
                        <Undo2 size={16} />
                    </ToolButton>
                </Tooltip>

                <Tooltip content="Clear" shortcut="Delete" position={horizontal ? "bottom" : "right"}>
                    <ToolButton onClick={handleClear} intent="danger">
                        <Trash2 size={16} />
                    </ToolButton>
                </Tooltip>
            </ToolbarGroup>
        </div>
    )
}
