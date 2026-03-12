import React, { useState } from 'react'
import { ChevronDown, Share2, HelpCircle, Settings as SettingsIcon, Save, FolderOpen } from 'lucide-react'
import { useProjectStore } from '../../stores/projectStore'
import { PLATFORMS } from '../../core/platforms'
import { AppLogo } from '../../assets/AppLogo'
import { AppWordmark } from '../../assets/AppWordmark'
import { PlatformId } from '../../types/platform'
import { ExportDialog } from '../ExportPanel/ExportDialog'
import { OnboardingModal } from '../common/OnboardingModal'
import { ImportPreviewDialog } from '../ImportPanel/ImportPreviewDialog'
import { FolderInput } from 'lucide-react'
import { isCFile, importCode, CodeImportResult } from '../../importers/codeImporter'

import { useEditorStore } from '../../stores/editorStore'
import { themeEntries } from '../../theme/theme.catalog'
import { ImportOptions, ImportResult } from '../../importers/pngImporter'
import { TileMap } from '../../types/map'

export const Header: React.FC = () => {
    const { platform, setPlatform, addTiles, selectTile, cleanupTiles, saveProject, loadProject } = useProjectStore()
    const { setView, setShowSettings, themeId, setThemeId } = useEditorStore()
    const [showExport, setShowExport] = useState(false)
    const [showHelp, setShowHelp] = useState(false)
    const [importFile, setImportFile] = useState<File | null>(null)
    const [codeImportData, setCodeImportData] = useState<{ result: CodeImportResult; fileName: string } | null>(null)
    const [showPlatformMenu, setShowPlatformMenu] = useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const platformMenuRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        if (!showPlatformMenu) return

        const handlePointerDown = (event: MouseEvent) => {
            const target = event.target as Node
            if (!platformMenuRef.current?.contains(target)) {
                setShowPlatformMenu(false)
            }
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowPlatformMenu(false)
            }
        }

        document.addEventListener('mousedown', handlePointerDown)
        window.addEventListener('keydown', handleEscape)

        return () => {
            document.removeEventListener('mousedown', handlePointerDown)
            window.removeEventListener('keydown', handleEscape)
        }
    }, [showPlatformMenu])

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (isCFile(file.name)) {
            const text = await file.text()
            const result = importCode(text, platform.tileWidth, platform.tileHeight, platform.encoding)

            if (result.tiles.length === 0 && result.maps.length === 0) {
                alert('No valid tile or map data found in file.')
                if (fileInputRef.current) fileInputRef.current.value = ''
                return
            }

            setCodeImportData({ result, fileName: file.name })
            if (fileInputRef.current) fileInputRef.current.value = ''
        } else {
            // Assume image, open preview dialog
            setImportFile(file)
        }
    }

    /** Remove the default empty tile & map if they're the only content in the project. */
    const removeDefaultsIfNeeded = () => {
        const state = useProjectStore.getState()
        const { tiles } = state.tileset
        const { maps } = state

        const hasOnlyDefaultTile = tiles.length === 1 && tiles[0].data.every(v => v === 0)
        const hasOnlyDefaultMap = maps.length === 1 && maps[0].layers.every(
            l => l.type !== 'tile' || l.data.every(v => v === 0)
        )

        if (hasOnlyDefaultTile && hasOnlyDefaultMap) {
            useProjectStore.setState({
                tileset: { ...state.tileset, tiles: [] },
                maps: [],
                selectedTileId: null,
                selectedMapId: null,
            })
        }
    }

    const handleCodeImportConfirm = (result: CodeImportResult, cleanup: boolean) => {
        removeDefaultsIfNeeded()
        const { tiles, maps } = result
        const existingTileCount = useProjectStore.getState().tileset.tiles.length

        if (tiles.length > 0) {
            addTiles(tiles, `Tile: Import ${tiles.length}`)
            selectTile(tiles[0].id)
        }

        const { addMap, selectMap } = useProjectStore.getState()
        for (const map of maps) {
            const remapped: TileMap = {
                ...map,
                layers: map.layers.map(layer => {
                    if (layer.type !== 'tile') return layer
                    return {
                        ...layer,
                        data: layer.data.map(idx => idx >= 0 ? idx + existingTileCount : idx),
                    }
                }),
            }
            addMap(remapped)
            selectMap(remapped.id)
        }

        if (cleanup) {
            cleanupTiles('Tiles: Cleanup')
        }

        if (maps.length > 0) {
            setView('map')
        } else {
            setView('tile')
        }

        setCodeImportData(null)
    }

    const handleImportConfirm = (result: ImportResult, options: ImportOptions) => {
        removeDefaultsIfNeeded()
        const { tiles, mapWidth, mapHeight, mapData } = result
        const existingTileCount = useProjectStore.getState().tileset.tiles.length
        const adjustedMapData = mapData.map((idx) => (idx >= 0 ? idx + existingTileCount : idx))

        // Add all tiles in one history entry
        addTiles(tiles, `Tile: Import ${tiles.length}`)

        // Create auto-map
        const newMapId = crypto.randomUUID()
        const newMap: TileMap = {
            id: newMapId,
            name: `Imported Map ${useProjectStore.getState().maps.length + 1}`,
            width: mapWidth,
            height: mapHeight,
            layers: [{
                id: crypto.randomUUID(),
                name: 'Background',
                type: 'tile',
                data: adjustedMapData,
                visible: true,
                locked: false
            }]
        }

        const { addMap, selectMap } = useProjectStore.getState()
        addMap(newMap)
        selectMap(newMapId)

        if (options.cleanup !== false) {
            cleanupTiles('Tiles: Cleanup')
        }

        if (tiles.length > 0) selectTile(tiles[0].id)
        setImportFile(null)
        setView('map') // Switch to map view to show the result

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <header className="h-16 glass-panel rounded-3xl px-6 flex items-center justify-between z-10 shrink-0 shadow-lg">
            {showExport && <ExportDialog onClose={() => setShowExport(false)} />}
            {showHelp && <OnboardingModal onForceClose={() => setShowHelp(false)} forceOpen={true} />}
            {importFile && (
                <ImportPreviewDialog
                    mode="png"
                    file={importFile}
                    platform={platform}
                    onImport={handleImportConfirm}
                    onCancel={() => {
                        setImportFile(null)
                        if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                />
            )}
            {codeImportData && (
                <ImportPreviewDialog
                    mode="code"
                    codeResult={codeImportData.result}
                    fileName={codeImportData.fileName}
                    platform={platform}
                    onImportCode={handleCodeImportConfirm}
                    onCancel={() => setCodeImportData(null)}
                />
            )}

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".png,.c,.h"
                onChange={handleFileSelect}
            />

            <div className="flex items-center gap-3">
                <AppLogo size={28} />
                <h1 style={{ margin: 0 }}>
                    <AppWordmark fontSize="13px" fontWeight={800} letterSpacing="0.18em" style={{ textTransform: 'uppercase' }} />
                </h1>
            </div>

            <div className="flex items-center gap-2">
                <select
                    value={themeId}
                    onChange={(e) => setThemeId(e.target.value)}
                    className="quick-theme-select text-[10px] font-bold uppercase tracking-wider rounded px-2 py-1 h-[26px]"
                    aria-label="Theme"
                >
                    {themeEntries.map((theme) => (
                        <option key={theme.id} value={theme.id}>
                            {theme.label}
                        </option>
                    ))}
                </select>

                <button
                    onClick={() => setShowHelp(true)}
                    className="flex items-center gap-2 px-3 py-1 rounded bg-bg-tertiary border border-white/5 text-[10px] font-bold text-gray-400 hover:text-white hover:border-white/20 transition-colors uppercase tracking-wider"
                >
                    <HelpCircle size={14} />
                    Help
                </button>

                <button
                    onClick={() => setShowSettings(true)}
                    className="flex items-center gap-2 px-3 py-1 rounded bg-bg-tertiary border border-white/5 text-[10px] font-bold text-gray-400 hover:text-white hover:border-white/20 transition-colors uppercase tracking-wider"
                >
                    <SettingsIcon size={14} />
                    Settings
                </button>

                <button
                    onClick={saveProject}
                    className="flex items-center gap-2 px-3 py-1 rounded bg-bg-tertiary border border-white/5 text-[10px] font-bold text-gray-300 hover:text-white hover:border-white/20 transition-colors uppercase tracking-wider"
                >
                    <Save size={14} />
                    Save
                </button>

                <button
                    onClick={loadProject}
                    className="flex items-center gap-2 px-3 py-1 rounded bg-bg-tertiary border border-white/5 text-[10px] font-bold text-gray-300 hover:text-white hover:border-white/20 transition-colors uppercase tracking-wider"
                >
                    <FolderOpen size={14} />
                    Load
                </button>

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-1 rounded bg-bg-tertiary border border-white/5 text-[10px] font-bold text-gray-300 hover:text-white hover:border-white/20 transition-colors uppercase tracking-wider"
                >
                    <FolderInput size={14} />
                    Import
                </button>

                <button
                    onClick={() => setShowExport(true)}
                    className="flex items-center gap-2 px-3 py-1 rounded bg-accent-primary text-white text-[10px] font-bold hover:bg-accent-secondary transition-all shadow-lg shadow-accent-primary/20 uppercase tracking-wider"
                >
                    <Share2 size={14} />
                    Export
                </button>

                <div className="relative" ref={platformMenuRef}>
                    <button
                        onClick={() => setShowPlatformMenu((open) => !open)}
                        className="flex items-center gap-2 px-3 py-1 rounded bg-bg-tertiary border border-white/5 text-[10px] font-bold text-gray-300 hover:border-white/20 transition-colors uppercase tracking-wider"
                        aria-haspopup="menu"
                        aria-expanded={showPlatformMenu}
                    >
                        Target: <span className="text-accent-secondary">{platform.name}</span>
                        <ChevronDown size={14} className="text-gray-500" />
                    </button>

                    <div className={showPlatformMenu
                        ? "absolute right-0 top-full mt-1 w-48 bg-bg-tertiary border border-white/10 rounded shadow-xl opacity-100 visible transition-all py-1 z-50"
                        : "absolute right-0 top-full mt-1 w-48 bg-bg-tertiary border border-white/10 rounded shadow-xl opacity-0 invisible transition-all py-1 z-50"}
                    >
                        {(Object.keys(PLATFORMS) as PlatformId[]).map((id) => (
                            <button
                                key={id}
                                onClick={(e) => {
                                    e.preventDefault()
                                    setPlatform(id)
                                    setShowPlatformMenu(false)
                                }}
                                className="w-full px-4 py-2 text-left text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors uppercase tracking-wider"
                            >
                                {PLATFORMS[id].name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </header>
    )
}
