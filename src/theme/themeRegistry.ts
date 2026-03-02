export type ThemeType = 'dark' | 'light'

export interface AppTheme {
    id: string
    label: string
    type: ThemeType
    colors: {
        appBackground: string
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
        uiInputBg: string
        uiInputBorder: string
        uiBorderSubtle: string
        uiBorderStrong: string

        danger: string
        warning: string
        success: string
        info: string
    }
}

export const themes: AppTheme[] = [
    {
        id: 'nova',
        label: 'Nova (Dark)',
        type: 'dark',
        colors: {
            appBackground: 'radial-gradient(circle at 10% 20%, rgba(139, 92, 246, 0.5) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(236, 72, 153, 0.5) 0%, transparent 40%), radial-gradient(circle at 50% 10%, rgba(56, 189, 248, 0.3) 0%, transparent 50%), #09090b',
            bgPrimary: 'rgba(9, 9, 11, 0.65)',
            bgSecondary: 'rgba(24, 24, 27, 0.7)',
            bgTertiary: 'rgba(39, 39, 42, 0.8)',
            bgTitlebar: 'rgba(9, 9, 11, 0.6)',
            bgActivitybar: 'transparent',
            bgStatusbar: 'rgba(9, 9, 11, 0.5)',

            accentPrimary: '#ec4899', // pink-500
            accentSecondary: '#8b5cf6', // violet-500

            textPrimary: '#ffffff',
            textSecondary: '#a1a1aa',
            textDisabled: '#52525b',

            uiBgHover: 'rgba(255, 255, 255, 0.08)',
            uiBgHoverStrong: 'rgba(255, 255, 255, 0.12)',
            uiBgSubtle: 'rgba(255, 255, 255, 0.03)',
            uiInputBg: 'rgba(0, 0, 0, 0.4)',
            uiInputBorder: 'rgba(255, 255, 255, 0.1)',
            uiBorderSubtle: 'rgba(236, 72, 153, 0.15)', // subtly colored borders!
            uiBorderStrong: 'rgba(236, 72, 153, 0.4)',

            danger: '#f43f5e',
            warning: '#f59e0b',
            success: '#10b981',
            info: '#3b82f6',
        }
    },
    {
        id: 'magma',
        label: 'Magma (Dark)',
        type: 'dark',
        colors: {
            appBackground: 'radial-gradient(circle at 80% 10%, rgba(239, 68, 68, 0.5) 0%, transparent 40%), radial-gradient(circle at 20% 90%, rgba(249, 115, 22, 0.5) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(234, 179, 8, 0.2) 0%, transparent 50%), #000000',
            bgPrimary: 'rgba(0, 0, 0, 0.7)',
            bgSecondary: 'rgba(15, 10, 5, 0.8)',
            bgTertiary: 'rgba(30, 20, 10, 0.9)',
            bgTitlebar: 'rgba(0, 0, 0, 0.6)',
            bgActivitybar: 'transparent',
            bgStatusbar: 'rgba(0, 0, 0, 0.5)',

            accentPrimary: '#f97316', // orange-500
            accentSecondary: '#ef4444', // red-500

            textPrimary: '#fff7ed',
            textSecondary: '#fdba74',
            textDisabled: '#9a3412',

            uiBgHover: 'rgba(249, 115, 22, 0.1)',
            uiBgHoverStrong: 'rgba(249, 115, 22, 0.2)',
            uiBgSubtle: 'rgba(249, 115, 22, 0.03)',
            uiInputBg: 'rgba(0, 0, 0, 0.5)',
            uiInputBorder: 'rgba(249, 115, 22, 0.2)',
            uiBorderSubtle: 'rgba(249, 115, 22, 0.15)',
            uiBorderStrong: 'rgba(249, 115, 22, 0.4)',

            danger: '#dc2626',
            warning: '#eab308',
            success: '#22c55e',
            info: '#06b6d4',
        }
    },
    {
        id: 'frost',
        label: 'Frost (Light)',
        type: 'light',
        colors: {
            appBackground: 'radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.5) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(52, 211, 153, 0.5) 0%, transparent 40%), radial-gradient(circle at 50% 90%, rgba(139, 92, 246, 0.2) 0%, transparent 50%), #f8fafc',
            bgPrimary: 'rgba(255, 255, 255, 0.6)',
            bgSecondary: 'rgba(255, 255, 255, 0.85)',
            bgTertiary: 'rgba(248, 250, 252, 0.95)',
            bgTitlebar: 'rgba(255, 255, 255, 0.6)',
            bgActivitybar: 'transparent',
            bgStatusbar: 'rgba(255, 255, 255, 0.6)',

            accentPrimary: '#0ea5e9', // sky-500
            accentSecondary: '#10b981', // emerald-500

            textPrimary: '#0f172a',
            textSecondary: '#475569',
            textDisabled: '#94a3b8',

            uiBgHover: 'rgba(14, 165, 233, 0.05)',
            uiBgHoverStrong: 'rgba(14, 165, 233, 0.1)',
            uiBgSubtle: 'rgba(255, 255, 255, 0.5)',
            uiInputBg: 'rgba(255, 255, 255, 0.9)',
            uiInputBorder: 'rgba(14, 165, 233, 0.2)',
            uiBorderSubtle: 'rgba(14, 165, 233, 0.15)',
            uiBorderStrong: 'rgba(14, 165, 233, 0.4)',

            danger: '#e11d48',
            warning: '#d97706',
            success: '#059669',
            info: '#0284c7',
        }
    },
    {
        id: 'hacker',
        label: 'Hacker (Dark)',
        type: 'dark',
        colors: {
            appBackground: 'radial-gradient(circle at 50% 0%, rgba(34, 197, 94, 0.2) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(16, 185, 129, 0.2) 0%, transparent 50%), #050505',
            bgPrimary: 'rgba(5, 5, 5, 0.8)',
            bgSecondary: 'rgba(10, 15, 10, 0.8)',
            bgTertiary: 'rgba(20, 25, 20, 0.9)',
            bgTitlebar: 'rgba(5, 5, 5, 0.8)',
            bgActivitybar: 'transparent',
            bgStatusbar: 'rgba(5, 5, 5, 0.8)',

            accentPrimary: '#22c55e', // green-500
            accentSecondary: '#10b981', // emerald-500

            textPrimary: '#4ade80',
            textSecondary: '#166534',
            textDisabled: '#064e3b',

            uiBgHover: 'rgba(34, 197, 94, 0.1)',
            uiBgHoverStrong: 'rgba(34, 197, 94, 0.2)',
            uiBgSubtle: 'rgba(34, 197, 94, 0.03)',
            uiInputBg: '#020202',
            uiInputBorder: 'rgba(34, 197, 94, 0.3)',
            uiBorderSubtle: 'rgba(34, 197, 94, 0.15)',
            uiBorderStrong: 'rgba(34, 197, 94, 0.4)',

            danger: '#dc2626',
            warning: '#eab308',
            success: '#22c55e',
            info: '#14b8a6',
        }
    }
]

export const themeEntries = themes.map(t => ({ id: t.id, label: t.label, type: t.type }))

export const getResolvedTheme = (id: string): AppTheme | null => {
    return themes.find(t => t.id === id) || themes[0]
}

export const getDefaultThemeId = () => {
    return 'nova'
}
