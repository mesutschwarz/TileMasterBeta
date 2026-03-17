import React from 'react'
import { ToolBar } from './ToolBar'

type DrawingToolbarProps = {
    horizontal?: boolean
}

export const DrawingToolbar: React.FC<DrawingToolbarProps> = ({ horizontal = false }) => {
    return (
        <div className="drawing-tools-content">
            <ToolBar horizontal={horizontal} />
        </div>
    )
}
