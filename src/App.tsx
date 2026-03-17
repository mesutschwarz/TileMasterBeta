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
import { applyThemeById } from './theme/theme.runtime'
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
            <div className="app-container app-shell font-sans">
                <Header />
                <div className="flex-1 flex overflow-hidden min-h-0">
                    {/* 1. Activity Bar (Fixed, Leftmost) */}
                    <ActivityBar />

                    {/* 2. Resizable Panels (Sidebar | Editor) */}
                    <Group orientation="horizontal" className="flex-1 h-full">

                        {/* LEFT PANEL: SIDEBAR (Explorer) */}
                        {sidebarVisible && (
                            <>
                                <Panel id="sidebar" defaultSize="24" minSize="16" maxSize="36" className="panel-container">
                                    <SidePanel />
                                </Panel>
                                <Separator className="panel-separator" />
                            </>
                        )}

                        {/* RIGHT PANEL: EDITOR (Dockview) */}
                        <Panel className="main-editor-panel">
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
