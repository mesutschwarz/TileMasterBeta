import { DEFAULT_THEME_ID, THEME_PRESETS } from './theme.presets'
import { AppTheme } from './theme.types'

export const themes = THEME_PRESETS

export const themeEntries = themes.map((theme) => ({
    id: theme.id,
    label: theme.label,
    type: theme.type,
}))

export const getResolvedTheme = (id: string): AppTheme => {
    return themes.find((theme) => theme.id === id) ?? themes[0]
}

export const getDefaultThemeId = () => DEFAULT_THEME_ID
