import React from 'react'
import { Plus, Map as MapIcon, Eye, EyeOff, Lock, Unlock, Trash2, Edit3 } from 'lucide-react'
import { clsx } from 'clsx'
import { useProjectStore } from '../../stores/projectStore'
import { useEditorStore } from '../../stores/editorStore'

export const MapsExplorer: React.FC = () => {
    const {
        platform, maps, selectedMapId,
        addMap, selectMap, addLayer, updateLayer, resizeMap,
        deleteMap, renameMap
    } = useProjectStore()
    const {
        selectedLayerId, setSelectedLayer,
        selectedCollisionId, setSelectedCollisionId
    } = useEditorStore()

    const [showLayerMenu, setShowLayerMenu] = React.useState(false)
    const [editingMapId, setEditingMapId] = React.useState<string | null>(null)

    const activeMap = maps.find(m => m.id === selectedMapId)
    const activeLayer = activeMap?.layers.find(l => l.id === selectedLayerId)

    const createNewMap = () => {
        const newMap = {
            id: `map-${Date.now()}`,
            name: `Map ${maps.length + 1}`,
            width: platform.mapWidth,
            height: platform.mapHeight,
            layers: []
        }
        addMap(newMap)
        addLayer(newMap.id, 'tile')
        selectMap(newMap.id)
    }

    return (
        <div className="h-full flex flex-col min-h-0 overflow-hidden">
            {/* Header */}
            <div className="w-full flex items-center justify-between px-4 py-2 shrink-0 border-b border-ui-border-subtle/50 bg-bg-tertiary/40 backdrop-blur-md">
                <span className="text-[11px] font-black tracking-widest text-text-primary">MAPS</span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={createNewMap}
                        className="p-1.5 rounded-lg transition-all action-button hover:bg-accent-primary/20 hover:text-accent-primary"
                        title="Create Map"
                    >
                        <Plus size={14} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
                <div className="p-3 space-y-4">
                    {maps.length === 0 ? (
                        <div className="py-6 text-center text-xs italic text-text-secondary">
                            No maps yet. Create your first map.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {maps.map(map => (
                                <div
                                    key={map.id}
                                    onClick={() => selectMap(map.id)}
                                    className={clsx(
                                        "px-4 py-3 rounded-xl flex items-center justify-between group cursor-pointer transition-all duration-300",
                                        selectedMapId === map.id
                                            ? "bg-accent-primary/10 ring-[3px] ring-accent-primary shadow-[0_4px_20px_rgba(var(--accent-primary-rgb),0.3)] scale-[1.02]"
                                            : "bg-ui-bg-subtle ring-1 ring-ui-border-strong hover:ring-2 hover:bg-ui-bg-hover hover:-translate-y-1 hover:shadow-lg"
                                    )}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <MapIcon size={14} className={selectedMapId === map.id ? "text-accent-primary" : "text-text-secondary"} />
                                        <div className="flex flex-col min-w-0">
                                            {editingMapId === map.id ? (
                                                <input
                                                    autoFocus
                                                    defaultValue={map.name}
                                                    onBlur={(e) => {
                                                        renameMap(map.id, e.target.value)
                                                        setEditingMapId(null)
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            renameMap(map.id, e.currentTarget.value)
                                                            setEditingMapId(null)
                                                        }
                                                    }}
                                                    className="modern-input px-2 py-1 text-xs w-32"
                                                />
                                            ) : (
                                                <span className="text-sm font-semibold truncate text-text-primary">{map.name}</span>
                                            )}
                                            <span className="text-[10px] text-text-secondary font-medium tracking-wide mt-0.5">{map.width}x{map.height} • {map.layers.length} layers</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setEditingMapId(map.id) }}
                                            className="p-1.5 rounded transition-colors action-button hover:bg-ui-active"
                                            title="Rename"
                                        >
                                            <Edit3 size={12} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteMap(map.id) }}
                                            className="p-1.5 rounded transition-colors action-button hover:bg-ui-danger hover:text-white"
                                            title="Delete"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedMapId && activeMap && (
                        <div className="pt-4 border-t border-ui-border-subtle space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">Selected Map</span>
                                <button
                                    onClick={() => setEditingMapId(activeMap.id)}
                                    className="p-1.5 rounded transition-colors action-button hover:bg-ui-bg-hover"
                                    title="Rename"
                                >
                                    <Edit3 size={12} />
                                </button>
                            </div>
                            <div className="flex items-center gap-2 min-w-0 px-1">
                                <MapIcon size={14} className="text-accent-primary" />
                                <span className="text-sm font-semibold truncate text-text-primary">{activeMap.name}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-text-secondary">Width</label>
                                    <input
                                        type="number"
                                        value={activeMap.width}
                                        min={1}
                                        max={256}
                                        onChange={(e) => resizeMap(activeMap.id, parseInt(e.target.value) || 1, activeMap.height)}
                                        className="w-full modern-input"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-text-secondary">Height</label>
                                    <input
                                        type="number"
                                        value={activeMap.height}
                                        min={1}
                                        max={256}
                                        onChange={(e) => resizeMap(activeMap.id, activeMap.width, parseInt(e.target.value) || 1)}
                                        className="w-full modern-input"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedMapId && activeMap && (
                        <div className="pt-4 border-t border-ui-border-subtle space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">Layers</span>
                                <button
                                    onClick={() => setShowLayerMenu(!showLayerMenu)}
                                    className="p-1.5 rounded transition-colors action-button hover:bg-ui-active"
                                    title="Add Layer"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                            {showLayerMenu && (
                                <div className="grid grid-cols-3 gap-2">
                                    {['tile', 'collision', 'object'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                addLayer(activeMap.id, type as 'tile' | 'collision' | 'object')
                                                setShowLayerMenu(false)
                                            }}
                                            className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg bg-ui-bg-subtle hover:bg-ui-bg-hover border border-ui-border-subtle hover:border-accent-primary hover:text-accent-primary transition-all"
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="space-y-1.5">
                                {activeMap.layers.slice().reverse().map((layer) => (
                                    <div
                                        key={layer.id}
                                        onClick={() => setSelectedLayer(layer.id)}
                                        className={clsx(
                                            "px-4 py-3 rounded-xl flex items-center justify-between group cursor-pointer transition-all duration-300",
                                            selectedLayerId === layer.id
                                                ? "bg-accent-secondary/15 ring-[3px] ring-accent-secondary shadow-[0_4px_20px_rgba(var(--accent-secondary-rgb),0.2)] scale-[1.02] text-text-primary"
                                                : "bg-ui-bg-subtle ring-1 ring-ui-border-strong hover:ring-2 hover:bg-ui-bg-hover hover:-translate-y-1 hover:shadow-lg"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); updateLayer(selectedMapId, layer.id, { visible: !layer.visible }) }}
                                                className={clsx("p-1.5 rounded transition-colors action-button hover:bg-ui-active", !layer.visible && "text-text-disabled")}
                                            >
                                                {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                                            </button>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[13px] font-semibold truncate text-text-primary mr-2">{layer.name}</span>
                                                <span className="text-[9px] uppercase tracking-wider text-text-secondary font-bold">{layer.type}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); updateLayer(selectedMapId, layer.id, { locked: !layer.locked }) }}
                                                className={clsx("p-1.5 rounded transition-colors action-button hover:bg-ui-active", layer.locked ? "text-ui-warning" : "")}
                                                title={layer.locked ? 'Unlock' : 'Lock'}
                                            >
                                                {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedMapId && activeLayer?.type === 'collision' && (
                        <div className="pt-4 border-t border-ui-border-subtle space-y-3">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">Collision Palette</span>
                            <div className="grid grid-cols-2 gap-3">
                                {[0, 1].map((id) => (
                                    <button
                                        key={id}
                                        onClick={() => setSelectedCollisionId(id)}
                                        className={clsx(
                                            "px-3 py-2.5 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-2 transition-all shadow-sm",
                                            selectedCollisionId === id
                                                ? "bg-accent-primary text-white border-transparent"
                                                : "bg-ui-bg-subtle border-ui-border-strong text-text-primary hover:border-ui-border hover:bg-ui-bg-hover"
                                        )}
                                    >
                                        <div className={clsx("w-2.5 h-2.5 rounded-full ring-2 ring-offset-1 ring-offset-bg-primary", id === 0 ? "border border-text-disabled ring-transparent" : "bg-ui-danger ring-ui-danger/30")} />
                                        {id === 0 ? 'Passable' : 'Solid'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
