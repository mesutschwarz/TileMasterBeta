/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: {
                    primary: 'rgb(var(--bg-primary-rgb) / <alpha-value>)',
                    secondary: 'rgb(var(--bg-secondary-rgb) / <alpha-value>)',
                    tertiary: 'rgb(var(--bg-tertiary-rgb) / <alpha-value>)',
                    titlebar: 'rgb(var(--bg-titlebar-rgb) / <alpha-value>)',
                    activitybar: 'rgb(var(--bg-activitybar-rgb) / <alpha-value>)',
                    statusbar: 'rgb(var(--bg-statusbar-rgb) / <alpha-value>)'
                },
                accent: {
                    primary: 'rgb(var(--accent-primary-rgb) / <alpha-value>)',
                    secondary: 'rgb(var(--accent-secondary-rgb) / <alpha-value>)'
                },
                text: {
                    primary: 'var(--text-primary)',
                    secondary: 'var(--text-secondary)',
                    disabled: 'var(--text-disabled)'
                },
                status: {
                    success: 'rgb(var(--success-rgb) / <alpha-value>)',
                    warning: 'rgb(var(--warning-rgb) / <alpha-value>)',
                    error: 'rgb(var(--error-rgb) / <alpha-value>)'
                },
                ui: {
                    hover: 'var(--ui-bg-hover)',
                    active: 'var(--ui-bg-hover-strong)',
                    subtle: 'var(--ui-bg-subtle)',
                    'bg-hover': 'var(--ui-bg-hover)',
                    'bg-hover-strong': 'var(--ui-bg-hover-strong)',
                    'bg-subtle': 'var(--ui-bg-subtle)',
                    input: 'var(--ui-input-bg)',
                    border: 'var(--ui-border-subtle)',
                    borderStrong: 'var(--ui-border-strong)',
                    'border-subtle': 'var(--ui-border-subtle)',
                    'border-strong': 'var(--ui-border-strong)',
                    danger: 'var(--ui-danger)',
                    warning: 'var(--ui-warning)',
                    success: 'var(--ui-success)'
                }
            }
        },
    },
    plugins: [],
}
