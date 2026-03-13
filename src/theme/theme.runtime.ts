import { getResolvedTheme } from './theme.catalog'
import { AppTheme } from './theme.types'

declare global {
    interface Window {
        __TileMasterTheme?: AppTheme
    }
}

const setCssVar = (name: string, value: string) => {
    document.documentElement.style.setProperty(name, value)
}

const toRgbTuple = (hex: string): string | null => {
    if (!hex) return null
    let normalized = hex.trim()

    if (normalized.startsWith('rgb')) {
        const match = normalized.match(/\((.*?)\)/)
        if (!match) return null
        const parts = match[1].split(',').map((p) => parseFloat(p))
        if (parts.length < 3) return null
        return `${Math.round(parts[0])} ${Math.round(parts[1])} ${Math.round(parts[2])}`
    }

    if (normalized.startsWith('#')) {
        normalized = normalized.slice(1)
        if (normalized.length === 3) {
            const r = parseInt(normalized[0] + normalized[0], 16)
            const g = parseInt(normalized[1] + normalized[1], 16)
            const b = parseInt(normalized[2] + normalized[2], 16)
            return `${r} ${g} ${b}`
        }
        if (normalized.length === 6 || normalized.length === 8) {
            const r = parseInt(normalized.substring(0, 2), 16)
            const g = parseInt(normalized.substring(2, 4), 16)
            const b = parseInt(normalized.substring(4, 6), 16)
            return `${r} ${g} ${b}`
        }
    }

    return null
}

const setCssVarRgb = (name: string, value: string) => {
    const rgb = toRgbTuple(value)
    if (rgb) setCssVar(name, rgb)
}

const applyThemeModeClasses = (themeType: 'dark' | 'light') => {
    if (themeType === 'dark') {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
        return
    }

    document.documentElement.classList.add('light')
    document.documentElement.classList.remove('dark')
}

export const applyThemeById = (themeId: string) => {
    const theme = getResolvedTheme(themeId)
    const { colors } = theme

    setCssVar('--app-background', colors.appBackground)
    setCssVar('--panel-surface', colors.panelSurface ?? colors.bgPrimary)
    setCssVar('--bg-primary', colors.bgPrimary)
    setCssVar('--bg-secondary', colors.bgSecondary)
    setCssVar('--bg-tertiary', colors.bgTertiary)
    setCssVar('--bg-titlebar', colors.bgTitlebar)
    setCssVar('--bg-activitybar', colors.bgActivitybar)
    setCssVar('--bg-statusbar', colors.bgStatusbar)

    setCssVar('--accent-primary', colors.accentPrimary)
    setCssVar('--accent-secondary', colors.accentSecondary)

    setCssVar('--text-primary', colors.textPrimary)
    setCssVar('--text-secondary', colors.textSecondary)
    setCssVar('--text-disabled', colors.textDisabled)

    setCssVar('--ui-bg-hover', colors.uiBgHover)
    setCssVar('--ui-bg-hover-strong', colors.uiBgHoverStrong)
    setCssVar('--ui-bg-subtle', colors.uiBgSubtle)
    setCssVar('--ui-tab-container-bg', colors.uiTabContainerBg)
    setCssVar('--ui-input-bg', colors.uiInputBg)
    setCssVar('--ui-input-border', colors.uiInputBorder)
    setCssVar('--ui-border-subtle', colors.uiBorderSubtle)
    setCssVar('--ui-border-strong', colors.uiBorderStrong)

    setCssVar('--ui-danger', colors.danger)
    setCssVar('--ui-warning', colors.warning)
    setCssVar('--ui-success', colors.success)
    setCssVar('--ui-info', colors.info)

    setCssVar('--success', colors.success)
    setCssVar('--warning', colors.warning)
    setCssVar('--error', colors.danger)

    setCssVarRgb('--bg-primary-rgb', colors.bgPrimary)
    setCssVarRgb('--bg-secondary-rgb', colors.bgSecondary)
    setCssVarRgb('--bg-tertiary-rgb', colors.bgTertiary)
    setCssVarRgb('--bg-titlebar-rgb', colors.bgTitlebar)
    setCssVarRgb('--bg-activitybar-rgb', colors.bgActivitybar)
    setCssVarRgb('--bg-statusbar-rgb', colors.bgStatusbar)

    setCssVarRgb('--accent-primary-rgb', colors.accentPrimary)
    setCssVarRgb('--accent-secondary-rgb', colors.accentSecondary)

    setCssVarRgb('--success-rgb', colors.success)
    setCssVarRgb('--warning-rgb', colors.warning)
    setCssVarRgb('--error-rgb', colors.danger)

    applyThemeModeClasses(theme.type)
    document.documentElement.dataset.theme = themeId
    window.__TileMasterTheme = theme
}
