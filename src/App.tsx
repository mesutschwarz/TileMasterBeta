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
            <div className="h-screen flex flex-col app-shell overflow-hidden text-text-primary font-sans">
                <Header />
                <div className="flex-1 flex overflow-hidden min-h-0">
                    {/* 1. Activity Bar (Fixed, Leftmost) */}
                    <ActivityBar />

                    {/* 2. Resizable Panels (Sidebar | Editor) */}
                    <Group orientation="horizontal" className="flex-1 h-full">

                        {/* LEFT PANEL: SIDEBAR (Explorer) */}
                        {sidebarVisible && (
                            <>
                                <Panel id="sidebar" defaultSize="24" minSize="16" maxSize="36" className="flex flex-col overflow-hidden border-r border-ui-border-subtle bg-bg-primary">
                                    <SidePanel />
                                </Panel>
                                <Separator className="w-[1px] bg-ui-border-subtle hover:bg-accent-primary/60 transition-colors cursor-col-resize relative z-50 flex-shrink-0" />
                            </>
                        )}

                        {/* RIGHT PANEL: EDITOR (Dockview) */}
                        <Panel className="relative overflow-hidden bg-bg-primary flex flex-col">
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
