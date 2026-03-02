import { useEffect } from 'react'
import { useProjectStore } from '../stores/projectStore'
import { useEditorStore } from '../stores/editorStore'

export const useKeyboardShortcuts = () => {
    const { undo, redo, selectedTileId, flipTile, rotateTile, clearTile, clearMapLayer, selectedMapId } = useProjectStore()
    const { setTool, setView, toggleGrid, toggleMapGrid, view, selectedLayerId, brushSize, setBrushSize, setActiveColorIndex, brushShape, setBrushShape, setShowSettings } = useEditorStore()

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Priority shortcuts (Ctrl/Meta)
            if (e.ctrlKey || e.metaKey) {
                if (e.key.toLowerCase() === 'z') {
                    e.preventDefault()
                    if (e.shiftKey) redo()
                    else undo()
                    return
                }
                if (e.key === ',') {
                    e.preventDefault()
                    setShowSettings(true)
                    return
                }
            }

            // Don't trigger tools if typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

            // Simple tools
            switch (e.key.toLowerCase()) {
                case 'p': setTool('pencil'); break
                case 'e': setTool('eraser'); break
                case 'g': setTool('fill'); break
                case 'i': setTool('picker'); break
                case 'l': setTool('line'); break
                case 'b': setTool('rect'); break
                case 's': setTool('select'); break
                case 'o': setTool('circle'); break
                case 'v': setView('map'); break
                case 't': setView('tile'); break
                case '#':
                    if (view === 'tile') toggleGrid();
                    else toggleMapGrid();
                    break
                case '+':
                case '=':
                    setBrushSize(Math.min(16, brushSize + 1));
                    break
                case '-':
                case '_':
                    setBrushSize(Math.max(1, brushSize - 1));
                    break
                case 'k':
                    setBrushShape(brushShape === 'square' ? 'circle' : 'square');
                    break
                case 'delete':
                case 'backspace':
                    if (view === 'tile' && selectedTileId) clearTile(selectedTileId);
                    else if (view === 'map' && selectedMapId && selectedLayerId) clearMapLayer(selectedMapId, selectedLayerId);
                    break
            }

            // Palette hotkeys 1-8
            if (/^[1-8]$/.test(e.key)) {
                const index = parseInt(e.key, 10) - 1
                setActiveColorIndex(index)
            }

            // View-Specific Transformations
            // Strict check: Only rotate/flip tiles if in 'tile' view
            if (view === 'tile' && selectedTileId) {
                switch (e.key.toLowerCase()) {
                    case 'r': rotateTile(selectedTileId, 'cw'); break
                    case 'h': flipTile(selectedTileId, 'horizontal'); break
                    case 'j': flipTile(selectedTileId, 'vertical'); break
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [
        undo, redo, setTool, setView, toggleGrid, toggleMapGrid, view, brushSize, setBrushSize, setActiveColorIndex, brushShape, setBrushShape, setShowSettings,
        selectedTileId, flipTile, rotateTile, clearTile, clearMapLayer,
        selectedMapId, selectedLayerId
    ])
}
