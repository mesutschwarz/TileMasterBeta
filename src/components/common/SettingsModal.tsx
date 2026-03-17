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

    return (
        <Modal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            title="Preferences"
            icon={<SettingsIcon size={18} />}
            maxWidth="3xl"
            footer={
                <div className="flex items-center justify-between w-full">
                    <button
                        onClick={resetSettings}
                        className="modal-button-secondary border-ui-border-strong hover:border-ui-danger hover:bg-ui-danger/10"
                    >
                        Reset Defaults
                    </button>
                    <button
                        onClick={() => setShowSettings(false)}
                        className="modal-button-primary"
                    >
                        Save & Close
                    </button>
                </div>
            }
        >
            <div className="flex flex-col md:flex-row flex-1 min-h-[400px]">
                {/* Tabs Sidebar */}
                <div className="modal-sidebar md:w-64 space-y-2">
                    {[
                        { id: 'tile', label: 'Tile Grid', icon: Grid },
                        { id: 'map', label: 'Map Grid', icon: MapIcon },
                        { id: 'editor', label: 'Appearance', icon: Eye },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={clsx(
                                "w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3",
                                activeTab === tab.id
                                    ? "bg-accent-primary/10 text-accent-primary border border-accent-primary/20 shadow-sm"
                                    : "text-text-secondary hover:bg-white/5 border border-transparent"
                            )}
                        >
                            <tab.icon size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="modal-main-content p-8 md:p-12">
                    {activeTab === 'tile' && (
                        <div className="space-y-8 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between p-4 bg-white/2 rounded-xl border border-ui-border-subtle">
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-text-primary uppercase tracking-wider">Enable Tile Grid</div>
                                    <div className="text-[10px] text-text-disabled italic">Show thin lines between pixels on the tile canvas</div>
                                </div>
                                <button
                                    onClick={() => updateGridSettings({ enabled: !gridSettings.enabled })}
                                    className={clsx(
                                        "toggle-switch",
                                        gridSettings.enabled ? "toggle-switch-on" : "toggle-switch-off"
                                    )}
                                >
                                    <div className={clsx(
                                        "toggle-knob",
                                        gridSettings.enabled ? "toggle-knob-on" : "toggle-knob-off"
                                    )} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="label-xs opacity-70">Grid Opacity</label>
                                    <span className="text-[10px] font-mono text-accent-primary">{(gridSettings.opacity * 100).toFixed(0)}%</span>
                                </div>
                                <input
                                    type="range" min="0.05" max="0.5" step="0.01" value={gridSettings.opacity}
                                    onChange={(e) => updateGridSettings({ opacity: parseFloat(e.target.value) })}
                                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-primary"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="label-xs opacity-70">Grid Color</label>
                                <div className="flex gap-3">
                                    {tileGridSwatches.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => updateGridSettings({ color })}
                                            className={clsx(
                                                "w-10 h-10 rounded-xl border-2 transition-all shadow-lg",
                                                gridSettings.color === color
                                                    ? "border-accent-primary scale-110 shadow-accent-primary/20"
                                                    : "border-ui-border-subtle hover:border-ui-border-strong"
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
                            <div className="flex items-center justify-between p-4 bg-white/2 rounded-xl border border-ui-border-subtle">
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-text-primary uppercase tracking-wider">Enable Map Grid</div>
                                    <div className="text-[10px] text-text-disabled italic">Show lines representing tiles on the map canvas</div>
                                </div>
                                <button
                                    onClick={() => updateMapGridSettings({ enabled: !mapGridSettings.enabled })}
                                    className={clsx(
                                        "toggle-switch",
                                        mapGridSettings.enabled ? "toggle-switch-on" : "toggle-switch-off"
                                    )}
                                >
                                    <div className={clsx(
                                        "toggle-knob",
                                        mapGridSettings.enabled ? "toggle-knob-on" : "toggle-knob-off"
                                    )} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="label-xs opacity-70">Grid Size (Pixels per line)</label>
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
                                        className="w-16 modern-input px-2 py-1.5 text-xs text-center font-mono"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="label-xs opacity-70">Grid Opacity</label>
                                    <span className="text-[10px] font-mono text-accent-primary">{(mapGridSettings.opacity * 100).toFixed(0)}%</span>
                                </div>
                                <input
                                    type="range" min="0.05" max="0.5" step="0.01" value={mapGridSettings.opacity}
                                    onChange={(e) => updateMapGridSettings({ opacity: parseFloat(e.target.value) })}
                                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-primary"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="label-xs opacity-70">Grid Color</label>
                                <div className="flex gap-3">
                                    {mapGridSwatches.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => updateMapGridSettings({ color })}
                                            className={clsx(
                                                "w-10 h-10 rounded-xl border-2 transition-all shadow-lg",
                                                mapGridSettings.color === color ? "border-accent-primary scale-110 shadow-accent-primary/20" : "border-ui-border-subtle hover:border-ui-border-strong"
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
                            <div className="label-xs opacity-70">Theme Selection</div>
                            <div className="space-y-1 max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
                                {themeEntries.map((theme) => (
                                    <button
                                        key={theme.id}
                                        onClick={() => setThemeId(theme.id)}
                                        className={clsx(
                                            "w-full px-4 py-3 rounded-xl flex items-center justify-between text-left transition-all border",
                                            themeId === theme.id
                                                ? "bg-accent-primary/10 border-accent-primary/30 text-text-primary"
                                                : "bg-white/2 border-transparent text-text-secondary hover:bg-white/5"
                                        )}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold uppercase tracking-wider">{theme.label}</span>
                                            <span className="badge mt-0.5">{theme.type} mode</span>
                                        </div>
                                        {themeId === theme.id && (
                                            <span className="badge text-accent-primary font-bold">Active</span>
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
