import React from 'react'
import { ToolBar } from './ToolBar'
import { DraggableToolbar } from './DraggableToolbar'
import { useEditorStore } from '../../stores/editorStore'

export const DrawingToolbar: React.FC = () => {
    const {
        drawingToolbarDock, setDrawingToolbarDock,
        drawingToolbarPos, setDrawingToolbarPos
    } = useEditorStore()

    const isHorizontal = drawingToolbarDock === 'top' || drawingToolbarDock === 'bottom'

    return (
        <DraggableToolbar
            id="drawing"
            title="Drawing Tools"
            showTitle={false}
            dock={drawingToolbarDock}
            position={drawingToolbarPos}
            onDockChange={setDrawingToolbarDock}
            onPositionChange={setDrawingToolbarPos}
            className="z-40"
        >
            <div className="flex h-full w-full">
                <ToolBar horizontal={isHorizontal} />
            </div>
        </DraggableToolbar>
    )
}
