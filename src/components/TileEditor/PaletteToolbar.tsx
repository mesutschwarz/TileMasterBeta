import React from 'react'
import { useEditorStore } from '../../stores/editorStore'
import { useProjectStore } from '../../stores/projectStore'
import { DraggableToolbar } from './DraggableToolbar'
import { clsx } from 'clsx'
import { SwatchButton, ToolbarGroup } from '../common/Toolbar'

export const PaletteToolbar: React.FC = () => {
    const { platform } = useProjectStore()
    const {
        paletteDock, setPaletteDock,
        palettePos, setPalettePos,
        activeColorIndex, setActiveColorIndex
    } = useEditorStore()

    return (
        <DraggableToolbar
            id="palette"
            title="Palette"
            dock={paletteDock}
            position={palettePos}
            onDockChange={setPaletteDock}
            onPositionChange={setPalettePos}
            className="z-40"
        >
            <ToolbarGroup
                orientation={(paletteDock === 'top' || paletteDock === 'bottom') ? 'horizontal' : 'vertical'}
                className={clsx(
                    (paletteDock === 'top' || paletteDock === 'bottom') ? "px-4" : "py-4"
                )}
            >
                {platform.defaultPalette.map((color, index) => (
                    <SwatchButton
                        key={index}
                        color={color}
                        active={activeColorIndex === index}
                        onClick={() => setActiveColorIndex(index)}
                    />
                ))}
            </ToolbarGroup>
        </DraggableToolbar>
    )
}
