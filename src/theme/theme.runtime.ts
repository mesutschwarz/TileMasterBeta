import { getResolvedTheme } from './theme.catalog'
import { AppTheme } from './theme.types'

declare global {
    interface Window {
        __TileMasterTheme?: AppTheme
    }
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

    // The theme variables are now handled by CSS files in src/theme/themes/*.css
    // using the [data-theme="id"] selector.
    applyThemeModeClasses(theme.type)
    document.documentElement.dataset.theme = themeId
    window.__TileMasterTheme = theme
}
