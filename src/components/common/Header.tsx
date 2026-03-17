import React, { useMemo, useState } from 'react'
import { ChevronDown, Share2, HelpCircle, Settings as SettingsIcon, Save, FolderOpen, Check } from 'lucide-react'
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
import { ImportOptions, ImportResult } from '../../importers/pngImporter'
import { TileMap } from '../../types/map'
import { normalizeProjectName } from '../../utils/projectName'

export const Header: React.FC = () => {
    const { platform, projectName, setProjectName, setPlatform, addTiles, selectTile, cleanupTiles, saveProject, loadProject } = useProjectStore()
    const { setView, setShowSettings, showHelp, setShowHelp, dockviewApi } = useEditorStore()
    const [showExport, setShowExport] = useState(false)
    const [importFile, setImportFile] = useState<File | null>(null)
    const [codeImportData, setCodeImportData] = useState<{ result: CodeImportResult; fileName: string } | null>(null)
    const [showPlatformMenu, setShowPlatformMenu] = useState(false)
    const [isEditingProjectName, setIsEditingProjectName] = useState(false)
    const [projectNameDraft, setProjectNameDraft] = useState(projectName)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const platformMenuRef = React.useRef<HTMLDivElement>(null)
    const projectNameInputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
        if (!isEditingProjectName) {
            setProjectNameDraft(projectName)
        }
    }, [projectName, isEditingProjectName])

    React.useEffect(() => {
        if (isEditingProjectName) {
            projectNameInputRef.current?.focus()
            projectNameInputRef.current?.select()
        }
    }, [isEditingProjectName])

    React.useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            const target = event.target as Node
            if (showPlatformMenu && !platformMenuRef.current?.contains(target)) {
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
            setImportFile(file)
        }
    }

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

        addTiles(tiles, `Tile: Import ${tiles.length}`)

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
        setView('map')

        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const projectLabel = useMemo(() => normalizeProjectName(projectName), [projectName])

    const commitProjectName = () => {
        setProjectName(projectNameDraft, 'Project: Rename')
        setIsEditingProjectName(false)
    }

    const cancelProjectNameEdit = () => {
        setProjectNameDraft(projectLabel)
        setIsEditingProjectName(false)
    }

    const navButtonClass = "nav-button"

    return (
        <header className="app-header">
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

            <div className="header-container">
                <div className="flex items-center gap-2 text-accent-primary shrink-0">
                    <AppLogo size={24} />
                    <h1 style={{ margin: 0 }}>
                        <AppWordmark fontSize="14px" fontWeight={700} letterSpacing="0" style={{ textTransform: 'none' }} />
                    </h1>
                </div>
                <div className="h-6 w-px bg-ui-border-subtle shrink-0" />
                <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-semibold text-text-secondary hidden md:inline">Project Name:</span>
                    {isEditingProjectName ? (
                        <input
                            ref={projectNameInputRef}
                            type="text"
                            value={projectNameDraft}
                            onChange={(e) => setProjectNameDraft(e.target.value)}
                            onBlur={commitProjectName}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    commitProjectName()
                                }
                                if (e.key === 'Escape') {
                                    e.preventDefault()
                                    cancelProjectNameEdit()
                                }
                            }}
                            className="modern-input h-8 px-2 py-0 text-xs min-w-[120px]"
                            aria-label="Project Name"
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsEditingProjectName(true)}
                            className="list-item py-1 px-3 h-8 text-xs truncate max-w-[240px]"
                            title="Click to edit project name"
                        >
                            {projectLabel}
                        </button>
                    )}
                </div>
            </div>

            <div className="header-actions">
                <nav className="flex items-center gap-1">
                    <button
                        onClick={() => setShowHelp(true)}
                        className={navButtonClass}
                    >
                        <HelpCircle size={14} />
                        <span className="hidden lg:inline">Help</span>
                    </button>
                    <button
                        onClick={saveProject}
                        className={navButtonClass}
                    >
                        <Save size={14} />
                        <span className="hidden lg:inline">Save</span>
                    </button>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className={navButtonClass}
                    >
                        <FolderInput size={14} />
                        <span className="hidden lg:inline">Import</span>
                    </button>

                    <button
                        onClick={() => setShowExport(true)}
                        className={navButtonClass}
                    >
                        <Share2 size={14} />
                        <span className="hidden lg:inline">Export</span>
                    </button>
                </nav>

                <div className="h-6 w-px bg-ui-border-subtle shrink-0 mx-1" />

                <div className="relative" ref={platformMenuRef}>
                    <button
                        onClick={() => setShowPlatformMenu((open) => !open)}
                        className="collision-button h-8 py-0 px-3 bg-accent-primary/10 border-accent-primary/20"
                        aria-haspopup="menu"
                        aria-expanded={showPlatformMenu}
                    >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-accent-primary hidden sm:inline">Platform</span>
                        <span className="text-xs font-bold text-text-primary">{platform.name}</span>
                        <ChevronDown size={12} className="text-text-secondary" />
                    </button>

                    <div className={showPlatformMenu
                        ? "absolute right-0 top-full mt-1 w-48 bg-bg-secondary border border-ui-border-subtle rounded-md shadow-xl opacity-100 visible transition-all py-1 z-50"
                        : "absolute right-0 top-full mt-1 w-48 bg-bg-secondary border border-ui-border-subtle rounded-md shadow-xl opacity-0 invisible transition-all py-1 z-50"}
                    >
                        {(Object.keys(PLATFORMS) as PlatformId[]).map((id) => (
                            <button
                                key={id}
                                onClick={(e) => {
                                    e.preventDefault()
                                    setPlatform(id)
                                    setShowPlatformMenu(false)
                                }}
                                className="w-full px-4 py-2 text-left text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-ui-bg-hover transition-colors"
                            >
                                {PLATFORMS[id].name}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={loadProject}
                    className="action-button p-2"
                    aria-label="Load project"
                >
                    <FolderOpen size={14} />
                </button>

                <button
                    onClick={() => setShowSettings(true)}
                    className="action-button p-2 bg-bg-secondary border border-ui-border-subtle"
                    aria-label="Settings"
                >
                    <SettingsIcon size={16} />
                </button>
            </div>
        </header>
    )
}
