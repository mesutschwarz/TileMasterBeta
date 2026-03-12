import { create } from 'zustand'
import { getDefaultThemeId } from '../theme/theme.catalog'
import { STORAGE_KEYS } from '../app.config'
import { readStoredThemeId, writeStoredThemeId } from '../theme/theme.userSettings'

export type ToolId = 'pencil' | 'eraser' | 'fill' | 'picker' | 'line' | 'rect' | 'circle' | 'select'
export type ViewMode = 'tile' | 'map'

interface GridSettings {
    enabled: boolean
    size: number
    opacity: number
    color: string
}

const SETTINGS_KEY = STORAGE_KEYS.settings

interface PersistedSettings {
    themeId: string
    gridSettings: GridSettings
    mapGridSettings: GridSettings
    drawingToolbarDock: 'left' | 'right' | 'top' | 'bottom' | 'floating'
    paletteDock: 'left' | 'right' | 'top' | 'bottom' | 'floating'
}

const defaultSettings: PersistedSettings = {
    themeId: getDefaultThemeId(),
    gridSettings: {
        enabled: true,
        size: 1,
        opacity: 0.1,
        color: '#ffffff'
    },
    mapGridSettings: {
        enabled: true,
        size: 8,
        opacity: 0.15,
        color: '#ffffff'
    },
    drawingToolbarDock: 'left',
    paletteDock: 'bottom',
}

function loadSettings(): Partial<PersistedSettings> {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY)
        if (!raw) return {}
        return JSON.parse(raw)
    } catch {
        return {}
    }
}

function saveSettings(state: PersistedSettings) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(state))
    } catch { /* storage full or unavailable */ }
}

const saved = loadSettings()
const savedThemeId = readStoredThemeId()

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

    updateGridSettings: (settings: Partial<GridSettings>) => void
    updateMapGridSettings: (settings: Partial<GridSettings>) => void
    setDrawingToolbarDock: (dock: EditorState['drawingToolbarDock']) => void
    setPaletteDock: (dock: EditorState['paletteDock']) => void
    setDrawingToolbarPos: (pos: { x: number, y: number }) => void
    setPalettePos: (pos: { x: number, y: number }) => void
    setShowSettings: (show: boolean) => void
    setThemeId: (themeId: string) => void
    resetSettings: () => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
    view: 'tile',
    sidebarView: 'tile',
    selectedTool: 'pencil',
    activeColorIndex: 3,
    brushSize: 1,
    brushShape: 'square',
    showGrid: true,
    showMapGrid: true,
    sidebarVisible: true,
    themeId: savedThemeId ?? saved.themeId ?? defaultSettings.themeId,
    selectedLayerId: null,
    selectedCollisionId: 1,
    selectedObjectId: 1,

    zoom: 32,
    mapZoom: 2,

    gridSettings: saved.gridSettings ?? { ...defaultSettings.gridSettings },
    mapGridSettings: saved.mapGridSettings ?? { ...defaultSettings.mapGridSettings },

    drawingToolbarDock: saved.drawingToolbarDock ?? defaultSettings.drawingToolbarDock,
    paletteDock: saved.paletteDock ?? defaultSettings.paletteDock,
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

    updateGridSettings: (settings) => set((state) => {
        const gridSettings = { ...state.gridSettings, ...settings }
        saveSettings({ themeId: state.themeId, gridSettings, mapGridSettings: state.mapGridSettings, drawingToolbarDock: state.drawingToolbarDock, paletteDock: state.paletteDock })
        return { gridSettings }
    }),
    updateMapGridSettings: (settings) => set((state) => {
        const mapGridSettings = { ...state.mapGridSettings, ...settings }
        saveSettings({ themeId: state.themeId, gridSettings: state.gridSettings, mapGridSettings, drawingToolbarDock: state.drawingToolbarDock, paletteDock: state.paletteDock })
        return { mapGridSettings }
    }),
    setDrawingToolbarDock: (drawingToolbarDock) => { const s = get(); saveSettings({ themeId: s.themeId, gridSettings: s.gridSettings, mapGridSettings: s.mapGridSettings, drawingToolbarDock, paletteDock: s.paletteDock }); set({ drawingToolbarDock }) },
    setPaletteDock: (paletteDock) => { const s = get(); saveSettings({ themeId: s.themeId, gridSettings: s.gridSettings, mapGridSettings: s.mapGridSettings, drawingToolbarDock: s.drawingToolbarDock, paletteDock }); set({ paletteDock }) },
    setDrawingToolbarPos: (drawingToolbarPos) => set({ drawingToolbarPos }),
    setPalettePos: (palettePos) => set({ palettePos }),
    setShowSettings: (showSettings) => set({ showSettings }),
    setThemeId: (themeId) => {
        const s = get()
        saveSettings({ themeId, gridSettings: s.gridSettings, mapGridSettings: s.mapGridSettings, drawingToolbarDock: s.drawingToolbarDock, paletteDock: s.paletteDock })
        writeStoredThemeId(themeId)
        set({ themeId })
    },
    resetSettings: () => {
        saveSettings(defaultSettings)
        set({
            themeId: defaultSettings.themeId,
            gridSettings: { ...defaultSettings.gridSettings },
            mapGridSettings: { ...defaultSettings.mapGridSettings },
            drawingToolbarDock: defaultSettings.drawingToolbarDock,
            paletteDock: defaultSettings.paletteDock,
        })
    }
}))
