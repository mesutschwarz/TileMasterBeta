import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './theme/index.css'
import { applyThemeById } from './theme/theme.runtime'
import { APP_TITLE } from './app.config'
import { readStoredThemeId } from './theme/theme.userSettings'

document.title = APP_TITLE

// Apply the persisted theme before the first render so the loading screen
// CSS variables resolve immediately (avoids a flash of unstyled content).
try {
    const themeId = readStoredThemeId()
    if (themeId) applyThemeById(themeId)
} catch { /* storage unavailable or malformed — theme will be set in App */ }

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
