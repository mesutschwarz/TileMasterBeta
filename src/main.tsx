import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { applyThemeById } from './theme/themeApplier'

// Apply the persisted theme before the first render so the loading screen
// CSS variables resolve immediately (avoids a flash of unstyled content).
try {
    const raw = localStorage.getItem('tilemaster-settings')
    if (raw) {
        const { themeId } = JSON.parse(raw) as { themeId?: string }
        if (themeId) applyThemeById(themeId)
    }
} catch { /* storage unavailable or malformed — theme will be set in App */ }

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
