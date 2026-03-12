import React, { useState, useMemo } from 'react'
import { Grid, Eye, Map as MapIcon, Settings as SettingsIcon } from 'lucide-react'
import { useEditorStore } from '../../stores/editorStore'
import { themeEntries } from '../../theme/theme.catalog'
import { clsx } from 'clsx'
import { Modal } from './Modal'

export const SettingsModal: React.FC = () => {
    const {
        showSettings, setShowSettings,
        gridSettings, updateGridSettings,
        mapGridSettings, updateMapGridSettings,
        themeId, setThemeId,
        resetSettings
    } = useEditorStore()

    const [activeTab, setActiveTab] = useState<'tile' | 'map' | 'editor'>('tile')

    const getThemeSwatch = (name: string, fallback: string) => {
        if (typeof window === 'undefined') return fallback
        const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
        return value || fallback
    }

    const tileGridSwatches = useMemo(() => ([
        getThemeSwatch('--text-primary', '#ffffff'),
        getThemeSwatch('--bg-primary', '#000000'),
        getThemeSwatch('--accent-primary', '#6366f1'),
        getThemeSwatch('--ui-success', '#22c55e')
    ]), [themeId])

    const mapGridSwatches = useMemo(() => ([
        getThemeSwatch('--text-primary', '#ffffff'),
        getThemeSwatch('--bg-primary', '#000000'),
        getThemeSwatch('--accent-primary', '#6366f1'),
        getThemeSwatch('--ui-warning', '#f59e0b')
    ]), [themeId])

    const TabButton: React.FC<{ id: typeof activeTab, label: string, icon: React.ReactNode }> = ({ id, label, icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={clsx(
                "flex items-center gap-2 px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2",
                activeTab === id
                    ? "border-accent-primary text-white bg-white/5"
                    : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5"
            )}
        >
            {icon}
            {label}
        </button>
    )

    return (
        <Modal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            title="Preferences"
            icon={<SettingsIcon size={18} />}
            maxWidth="lg"
            footer={
                <div className="flex items-center justify-between w-full">
                    <button
                        onClick={resetSettings}
                        className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-ui-danger hover:bg-ui-danger/10 transition-all"
                    >
                        Reset to Defaults
                    </button>
                    <button
                        onClick={() => setShowSettings(false)}
                        className="px-6 py-2 bg-accent-primary hover:bg-accent-secondary text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-accent-primary/20"
                    >
                        Save & Close
                    </button>
                </div>
            }
        >
            <div className="flex flex-col">
                {/* Tabs */}
                <div className="flex bg-bg-tertiary/10 border-b border-white/5 overflow-x-auto no-scrollbar">
                    <TabButton id="tile" label="Tile Grid" icon={<Grid size={14} />} />
                    <TabButton id="map" label="Map Grid" icon={<MapIcon size={14} />} />
                    <TabButton id="editor" label="Appearance" icon={<Eye size={14} />} />
                </div>

                {/* Tab Content */}
                <div className="p-8 space-y-8 min-h-[400px]">
                    {activeTab === 'tile' && (
                        <div className="space-y-8 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between p-4 bg-white/2 rounded-xl border border-white/5">
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-white uppercase tracking-wider">Enable Tile Grid</div>
                                    <div className="text-[10px] text-gray-500 italic">Show thin lines between pixels on the tile canvas</div>
                                </div>
                                <button
                                    onClick={() => updateGridSettings({ enabled: !gridSettings.enabled })}
                                    className={clsx(
                                        "w-10 h-5 rounded-full relative transition-colors",
                                        gridSettings.enabled ? "bg-accent-primary" : "bg-white/10"
                                    )}
                                >
                                    <div className={clsx(
                                        "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                                        gridSettings.enabled ? "left-6" : "left-1"
                                    )} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Grid Opacity</label>
                                    <span className="text-[10px] font-mono text-accent-primary">{(gridSettings.opacity * 100).toFixed(0)}%</span>
                                </div>
                                <input
                                    type="range" min="0.05" max="0.5" step="0.01" value={gridSettings.opacity}
                                    onChange={(e) => updateGridSettings({ opacity: parseFloat(e.target.value) })}
                                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-primary"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Grid Color</label>
                                <div className="flex gap-3">
                                    {tileGridSwatches.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => updateGridSettings({ color })}
                                            className={clsx(
                                                "w-10 h-10 rounded-xl border-2 transition-all shadow-lg",
                                                gridSettings.color === color
                                                    ? "border-accent-primary scale-110 shadow-accent-primary/20"
                                                    : "border-white/5 hover:border-white/20"
                                            )}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'map' && (
                        <div className="space-y-8 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between p-4 bg-white/2 rounded-xl border border-white/5">
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-white uppercase tracking-wider">Enable Map Grid</div>
                                    <div className="text-[10px] text-gray-500 italic">Show lines representing tiles on the map canvas</div>
                                </div>
                                <button
                                    onClick={() => updateMapGridSettings({ enabled: !mapGridSettings.enabled })}
                                    className={clsx(
                                        "w-10 h-5 rounded-full relative transition-colors",
                                        mapGridSettings.enabled ? "bg-accent-primary" : "bg-white/10"
                                    )}
                                >
                                    <div className={clsx(
                                        "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                                        mapGridSettings.enabled ? "left-6" : "left-1"
                                    )} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Grid Size (Pixels per line)</label>
                                    <span className="text-[10px] font-mono text-accent-primary">{mapGridSettings.size}px</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range" min="1" max="32" step="1" value={mapGridSettings.size}
                                        onChange={(e) => updateMapGridSettings({ size: parseInt(e.target.value) })}
                                        className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-primary"
                                    />
                                    <input
                                        type="number" value={mapGridSettings.size} min={1} max={32}
                                        onChange={(e) => updateMapGridSettings({ size: parseInt(e.target.value) || 1 })}
                                        className="w-16 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono focus:border-accent-primary outline-none"
                                    />
                                </div>
                                <div className="text-[9px] text-gray-500 italic bg-white/5 p-2 rounded-lg">Pro-tip: Set this to match your target platform's tile size (usually 8).</div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Grid Opacity</label>
                                    <span className="text-[10px] font-mono text-accent-primary">{(mapGridSettings.opacity * 100).toFixed(0)}%</span>
                                </div>
                                <input
                                    type="range" min="0.05" max="0.5" step="0.01" value={mapGridSettings.opacity}
                                    onChange={(e) => updateMapGridSettings({ opacity: parseFloat(e.target.value) })}
                                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-primary"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Grid Color</label>
                                <div className="flex gap-3">
                                    {mapGridSwatches.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => updateMapGridSettings({ color })}
                                            className={clsx(
                                                "w-10 h-10 rounded-xl border-2 transition-all shadow-lg",
                                                mapGridSettings.color === color ? "border-accent-primary scale-110 shadow-accent-primary/20" : "border-white/5 hover:border-white/20"
                                            )}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'editor' && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Theme</div>
                            <div className="space-y-1 max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
                                {themeEntries.map((theme) => (
                                    <button
                                        key={theme.id}
                                        onClick={() => setThemeId(theme.id)}
                                        className={clsx(
                                            "w-full px-3 py-2 rounded flex items-center justify-between text-left transition-all",
                                            themeId === theme.id
                                                ? "bg-accent-primary/15 text-white"
                                                : "hover:bg-white/5 text-gray-300"
                                        )}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium">{theme.label}</span>
                                            <span className="text-[9px] uppercase tracking-widest text-gray-500">{theme.type}</span>
                                        </div>
                                        {themeId === theme.id && (
                                            <span className="text-[9px] uppercase tracking-widest text-accent-primary font-bold">Active</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    )
}
