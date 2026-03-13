import { AppTheme } from './theme.types'

export const DEFAULT_THEME_ID = 'nova'

export const THEME_PRESETS: AppTheme[] = [
    {
        id: 'nova',
        label: 'Nova (Dark)',
        type: 'dark',
        colors: {
            appBackground: '#0f172a',
            panelSurface: 'rgba(15, 23, 42, 0.3)',
            bgPrimary: 'rgba(2, 6, 23, 0.5)',
            bgSecondary: 'rgba(15, 23, 42, 0.8)',
            bgTertiary: 'rgba(15, 23, 42, 0.5)',
            bgTitlebar: 'rgba(15, 23, 42, 0.5)',
            bgActivitybar: '#0f172a',
            bgStatusbar: '#0f172a',

            accentPrimary: '#5dadec',
            accentSecondary: '#eff6ff',

            textPrimary: '#eff6ff',
            textSecondary: '#94a3b8',
            textDisabled: '#64748b',

            uiBgHover: 'rgba(93, 173, 236, 0.1)',
            uiBgHoverStrong: 'rgba(93, 173, 236, 0.14)',
            uiBgSubtle: 'rgba(93, 173, 236, 0.05)',
            uiTabContainerBg: '#0b1124',
            uiInputBg: 'rgba(15, 23, 42, 0.85)',
            uiInputBorder: 'rgba(93, 173, 236, 0.2)',
            uiBorderSubtle: 'rgba(93, 173, 236, 0.1)',
            uiBorderStrong: 'rgba(93, 173, 236, 0.2)',

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

            accentPrimary: '#f97316',
            accentSecondary: '#ef4444',

            textPrimary: '#fff7ed',
            textSecondary: '#fdba74',
            textDisabled: '#9a3412',

            uiBgHover: 'rgba(249, 115, 22, 0.1)',
            uiBgHoverStrong: 'rgba(249, 115, 22, 0.2)',
            uiBgSubtle: 'rgba(249, 115, 22, 0.03)',
            uiTabContainerBg: 'rgba(27, 14, 7, 0.9)',
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

            accentPrimary: '#0ea5e9',
            accentSecondary: '#10b981',

            textPrimary: '#0f172a',
            textSecondary: '#475569',
            textDisabled: '#94a3b8',

            uiBgHover: 'rgba(14, 165, 233, 0.05)',
            uiBgHoverStrong: 'rgba(14, 165, 233, 0.1)',
            uiBgSubtle: 'rgba(255, 255, 255, 0.5)',
            uiTabContainerBg: '#e8f2fd',
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

            accentPrimary: '#22c55e',
            accentSecondary: '#10b981',

            textPrimary: '#4ade80',
            textSecondary: '#166534',
            textDisabled: '#064e3b',

            uiBgHover: 'rgba(34, 197, 94, 0.1)',
            uiBgHoverStrong: 'rgba(34, 197, 94, 0.2)',
            uiBgSubtle: 'rgba(34, 197, 94, 0.03)',
            uiTabContainerBg: 'rgba(8, 18, 10, 0.95)',
            uiInputBg: '#020202',
            uiInputBorder: 'rgba(34, 197, 94, 0.3)',
            uiBorderSubtle: 'rgba(34, 197, 94, 0.15)',
            uiBorderStrong: 'rgba(34, 197, 94, 0.4)',

            danger: '#dc2626',
            warning: '#eab308',
            success: '#22c55e',
            info: '#14b8a6',
        }
    },
    {
        id: 'milkyway',
        label: 'Milkyway (Light)',
        type: 'light',
        colors: {
            appBackground: 'radial-gradient(circle at 12% 18%, rgba(255, 189, 89, 0.45) 0%, transparent 38%), radial-gradient(circle at 85% 22%, rgba(125, 211, 252, 0.42) 0%, transparent 40%), radial-gradient(circle at 70% 86%, rgba(244, 114, 182, 0.26) 0%, transparent 45%), radial-gradient(circle at 28% 78%, rgba(192, 132, 252, 0.20) 0%, transparent 44%), linear-gradient(160deg, #fffaf2 0%, #fff4e9 52%, #fef6ff 100%)',
            panelSurface: 'linear-gradient(145deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 244, 229, 0.82) 55%, rgba(242, 250, 255, 0.84) 100%)',
            bgPrimary: 'rgba(255, 255, 255, 0.72)',
            bgSecondary: 'rgba(255, 250, 244, 0.88)',
            bgTertiary: 'rgba(255, 245, 236, 0.93)',
            bgTitlebar: 'rgba(255, 251, 247, 0.78)',
            bgActivitybar: 'transparent',
            bgStatusbar: 'rgba(255, 248, 241, 0.78)',

            accentPrimary: '#fb7185',
            accentSecondary: '#38bdf8',

            textPrimary: '#3f2c24',
            textSecondary: '#7c5b4c',
            textDisabled: '#b48f7f',

            uiBgHover: 'rgba(251, 113, 133, 0.09)',
            uiBgHoverStrong: 'rgba(251, 113, 133, 0.16)',
            uiBgSubtle: 'rgba(255, 255, 255, 0.58)',
            uiTabContainerBg: 'rgba(255, 246, 238, 0.95)',
            uiInputBg: 'rgba(255, 255, 255, 0.94)',
            uiInputBorder: 'rgba(251, 146, 60, 0.26)',
            uiBorderSubtle: 'rgba(248, 113, 113, 0.18)',
            uiBorderStrong: 'rgba(56, 189, 248, 0.36)',

            danger: '#ef4444',
            warning: '#f59e0b',
            success: '#10b981',
            info: '#0ea5e9',
        }
    }
]
