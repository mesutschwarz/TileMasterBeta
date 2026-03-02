import React from 'react'
import { useProjectStore } from '../../stores/projectStore'
import { useEditorStore } from '../../stores/editorStore'
import { clsx } from 'clsx'

export const PaletteEditor: React.FC = () => {
    const { platform, updatePaletteColor } = useProjectStore()
    const { activeColorIndex, setActiveColorIndex } = useEditorStore()
    const colorInputRef = React.useRef<HTMLInputElement>(null)
    const [editingIndex, setEditingIndex] = React.useState<number | null>(null)

    const handleSwatchClick = (index: number) => {
        setActiveColorIndex(index)
    }

    const handleSwatchDoubleClick = (index: number) => {
        setEditingIndex(index)
        setTimeout(() => colorInputRef.current?.click(), 10)
    }

    return (
        <div className="p-2 shrink-0">
            <input
                type="color"
                ref={colorInputRef}
                className="hidden"
                value={editingIndex !== null ? platform.defaultPalette[editingIndex] : '#000000'}
                onChange={(e) => {
                    if (editingIndex !== null) {
                        updatePaletteColor(editingIndex, e.target.value)
                    }
                }}
                onBlur={() => setEditingIndex(null)}
            />
            <div className="flex flex-wrap gap-2">
                {platform.defaultPalette.map((color, index) => (
                    <button
                        key={index}
                        onClick={() => handleSwatchClick(index)}
                        onDoubleClick={() => handleSwatchDoubleClick(index)}
                        className={clsx(
                            "w-8 h-8 rounded border-2 transition-all p-0.5",
                            activeColorIndex === index
                                ? "border-accent-primary scale-110 shadow-lg"
                                : "border-transparent hover:border-white/20"
                        )}
                        title={`Color ${index} - ${color}`}
                    >
                        <div
                            className="w-full h-full rounded-sm shadow-inner"
                            style={{ backgroundColor: color }}
                        />
                    </button>
                ))}
            </div>
        </div>
    )
}
