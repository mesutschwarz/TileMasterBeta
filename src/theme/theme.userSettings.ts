import { STORAGE_KEYS } from '../app.config'

export interface PersistedEditorSettingsLike {
    themeId?: string
    [key: string]: unknown
}

export const readStoredThemeId = (): string | null => {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.settings)
        if (!raw) return null
        const parsed = JSON.parse(raw) as PersistedEditorSettingsLike
        return typeof parsed.themeId === 'string' ? parsed.themeId : null
    } catch {
        return null
    }
}

export const writeStoredThemeId = (themeId: string): void => {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.settings)
        const parsed = raw ? (JSON.parse(raw) as PersistedEditorSettingsLike) : {}
        parsed.themeId = themeId
        localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(parsed))
    } catch {
        // no-op: storage unavailable or malformed
    }
}
