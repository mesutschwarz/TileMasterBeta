export type ThemeType = 'dark' | 'light'

export interface AppThemeColors {
    appBackground: string
    panelSurface?: string
    bgPrimary: string
    bgSecondary: string
    bgTertiary: string
    bgTitlebar: string
    bgActivitybar: string
    bgStatusbar: string

    accentPrimary: string
    accentSecondary: string

    textPrimary: string
    textSecondary: string
    textDisabled: string

    uiBgHover: string
    uiBgHoverStrong: string
    uiBgSubtle: string
    uiTabContainerBg: string
    uiInputBg: string
    uiInputBorder: string
    uiBorderSubtle: string
    uiBorderStrong: string

    danger: string
    warning: string
    success: string
    info: string
}

export interface AppTheme {
    id: string
    label: string
    type: ThemeType
    colors: AppThemeColors
}
