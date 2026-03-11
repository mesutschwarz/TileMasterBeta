import { create } from 'zustand'
import { getDefaultThemeId } from '../theme/themeRegistry'

export type ToolId = 'pencil' | 'eraser' | 'fill' | 'picker' | 'line' | 'rect' | 'circle' | 'select'
export type ViewMode = 'tile' | 'map'

interface GridSettings {
    enabled: boolean
    size: number
    opacity: number
    color: string
}

interface EditorState {
    view: ViewMode
    sidebarView: ViewMode
    selectedTool: ToolId
    zoom: number
    mapZoom: number
    activeColorIndex: number
    brushSize: number
    brushShape: 'square' | 'circle'
    showGrid: boolean
    showMapGrid: boolean
    sidebarVisible: boolean
    themeId: string

    // Canvas State
    canvasScale: number
    canvasPan: { x: number, y: number }

    // Grid Settings
    gridSettings: GridSettings
    mapGridSettings: GridSettings

    // Tool Docking
    drawingToolbarDock: 'left' | 'right' | 'top' | 'bottom' | 'floating'
    paletteDock: 'left' | 'right' | 'top' | 'bottom' | 'floating'
    drawingToolbarPos: { x: number, y: number }
    palettePos: { x: number, y: number }

    // Modals
    showSettings: boolean

    // Actions
    setView: (view: ViewMode) => void
    setSidebarView: (view: ViewMode) => void
    setSidebarVisible: (visible: boolean) => void
    toggleSidebar: () => void
    selectedLayerId: string | null
    setSelectedLayer: (id: string | null) => void
    selectedCollisionId: number
    setSelectedCollisionId: (id: number) => void
    selectedObjectId: number
    setSelectedObjectId: (id: number) => void
    setTool: (tool: ToolId) => void
    setZoom: (zoom: number) => void
    setMapZoom: (zoom: number) => void
    setActiveColorIndex: (index: number) => void
    setBrushSize: (size: number) => void
    setBrushShape: (shape: 'square' | 'circle') => void
    toggleGrid: () => void
    toggleMapGrid: () => void

    setCanvasScale: (scale: number) => void
    setCanvasPan: (pan: { x: number, y: number }) => void
    updateGridSettings: (settings: Partial<GridSettings>) => void
    updateMapGridSettings: (settings: Partial<GridSettings>) => void
    setDrawingToolbarDock: (dock: EditorState['drawingToolbarDock']) => void
    setPaletteDock: (dock: EditorState['paletteDock']) => void
    setDrawingToolbarPos: (pos: { x: number, y: number }) => void
    setPalettePos: (pos: { x: number, y: number }) => void
    setShowSettings: (show: boolean) => void
    setThemeId: (themeId: string) => void
}

export const useEditorStore = create<EditorState>((set) => ({
    view: 'tile',
    sidebarView: 'tile',
    selectedTool: 'pencil',
    activeColorIndex: 3,
    brushSize: 1,
    brushShape: 'square',
    showGrid: true,
    showMapGrid: true,
    sidebarVisible: true,
    themeId: getDefaultThemeId(),
    selectedLayerId: null,
    selectedCollisionId: 1,
    selectedObjectId: 1,

    canvasScale: 400,
    zoom: 32,
    mapZoom: 2,
    canvasPan: { x: 0, y: 0 },

    gridSettings: {
        enabled: true,
        size: 1,
        opacity: 0.1,
        color: '#ffffff'
    },
    mapGridSettings: {
        enabled: true,
        size: 8, // Represent 8x8 tiles by default
        opacity: 0.15,
        color: '#ffffff'
    },

    drawingToolbarDock: 'left',
    paletteDock: 'bottom',
    drawingToolbarPos: { x: 20, y: 20 },
    palettePos: { x: 20, y: 100 },

    showSettings: false,

    setView: (view) => set({ view }),
    setSidebarView: (sidebarView) => set({ sidebarView }),
    setSidebarVisible: (sidebarVisible) => set({ sidebarVisible }),
    toggleSidebar: () => set((state) => ({ sidebarVisible: !state.sidebarVisible })),
    setSelectedLayer: (selectedLayerId) => set({ selectedLayerId }),
    setSelectedCollisionId: (selectedCollisionId) => set({ selectedCollisionId }),
    setSelectedObjectId: (selectedObjectId) => set({ selectedObjectId }),
    setTool: (tool) => set({ selectedTool: tool }),
    setZoom: (zoom) => set({ zoom }),
    setMapZoom: (mapZoom) => set({ mapZoom }),
    setActiveColorIndex: (index) => set({ activeColorIndex: index }),
    setBrushSize: (brushSize) => set({ brushSize }),
    setBrushShape: (brushShape) => set({ brushShape }),
    toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
    toggleMapGrid: () => set((state) => ({ showMapGrid: !state.showMapGrid })),

    setCanvasScale: (canvasScale) => set({ canvasScale }),
    setCanvasPan: (canvasPan) => set({ canvasPan }),
    updateGridSettings: (settings) => set((state) => ({
        gridSettings: { ...state.gridSettings, ...settings }
    })),
    updateMapGridSettings: (settings) => set((state) => ({
        mapGridSettings: { ...state.mapGridSettings, ...settings }
    })),
    setDrawingToolbarDock: (drawingToolbarDock) => set({ drawingToolbarDock }),
    setPaletteDock: (paletteDock) => set({ paletteDock }),
    setDrawingToolbarPos: (drawingToolbarPos) => set({ drawingToolbarPos }),
    setPalettePos: (palettePos) => set({ palettePos }),
    setShowSettings: (showSettings) => set({ showSettings }),
    setThemeId: (themeId) => set({ themeId })
}))
