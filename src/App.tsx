import { useEffect, useState } from 'react'
import { ActivityBar } from './components/Layout/ActivityBar'
import { SidePanel } from './components/common/SidePanel'
import { DockLayout } from './components/Layout/DockLayout'
import { StatusBar } from './components/Layout/StatusBar'
import { Header } from './components/common/Header'
import { OnboardingModal } from './components/common/OnboardingModal'
import { useEditorStore } from './stores/editorStore'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { SettingsModal } from './components/common/SettingsModal'
import { Panel, Group, Separator } from 'react-resizable-panels'
import { applyThemeById } from './theme/themeApplier'
import { LoadingScreen } from './loading/LoadingScreen'

function App() {
    const { sidebarVisible, themeId } = useEditorStore()
    const [loadingDone, setLoadingDone] = useState(false)
    useKeyboardShortcuts()

    useEffect(() => {
        applyThemeById(themeId)
    }, [themeId])

    return (
        <>
            {!loadingDone && (
                <LoadingScreen onComplete={() => setLoadingDone(true)} />
            )}
            <div className="h-screen flex flex-col app-shell overflow-hidden text-text-primary font-sans p-3 gap-3">
                <Header />
                <div className="flex-1 flex overflow-hidden gap-3">
                    {/* 1. Activity Bar (Fixed, Leftmost) */}
                    <ActivityBar />

                    {/* 2. Resizable Panels (Sidebar | Editor) */}
                    <Group orientation="horizontal" className="flex-1 h-full">

                        {/* LEFT PANEL: SIDEBAR (Explorer) */}
                        {sidebarVisible && (
                            <>
                                <Panel id="sidebar" defaultSize="20" minSize="15" maxSize="80" className="flex flex-col glass-panel overflow-hidden rounded-2xl">
                                    <SidePanel />
                                </Panel>
                                <Separator className="w-2 mx-1 rounded-full hover:bg-accent-primary/50 transition-colors cursor-col-resize relative z-50 flex-shrink-0" />
                            </>
                        )}

                        {/* RIGHT PANEL: EDITOR (Dockview) */}
                        <Panel className="relative glass-panel overflow-hidden rounded-2xl flex flex-col">
                            <DockLayout />
                        </Panel>
                    </Group>
                </div>
                <StatusBar />
                <SettingsModal />
                <OnboardingModal />
            </div>
        </>
    )
}

export default App
