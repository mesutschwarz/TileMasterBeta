import React from 'react'
import { clsx } from 'clsx'

type Orientation = 'horizontal' | 'vertical'

type ToolButtonProps = {
    active?: boolean
    disabled?: boolean
    intent?: 'default' | 'danger'
    onClick?: () => void
    className?: string
    children: React.ReactNode
}

export const ToolButton: React.FC<ToolButtonProps> = ({
    active,
    disabled,
    intent = 'default',
    onClick,
    className,
    children
}) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={clsx(
                "w-9 h-9 flex items-center justify-center rounded-lg transition-all",
                active ? "bg-accent-primary text-white shadow-lg" : "text-text-secondary hover:text-text-primary hover:bg-ui-hover",
                intent === 'danger' && "hover:text-ui-danger hover:bg-red-400/5",
                disabled && "opacity-20",
                className
            )}
        >
            {children}
        </button>
    )
}

export const ToolbarGroup: React.FC<{ orientation: Orientation, className?: string, children: React.ReactNode }> = ({
    orientation,
    className,
    children
}) => (
    <div className={clsx(
        "flex gap-1",
        orientation === 'horizontal' ? "flex-row flex-wrap" : "flex-col flex-wrap",
        className
    )}>
        {children}
    </div>
)

export const ToolbarDivider: React.FC<{ orientation: Orientation }> = ({ orientation }) => (
    <div
        className={clsx(
            "bg-ui-border-subtle shrink-0",
            orientation === 'horizontal' ? "w-[1px] h-6 mx-1" : "h-[1px] w-6 my-1"
        )}
    />
)

type SwatchButtonProps = {
    color: string
    active?: boolean
    onClick?: () => void
}

export const SwatchButton: React.FC<SwatchButtonProps> = ({ color, active, onClick }) => (
    <button
        onClick={onClick}
        className={clsx(
            "w-6 h-6 rounded-md border transition-all",
            active
                ? "border-accent-primary scale-110 shadow-lg shadow-accent-primary/50"
                : "border-ui-border-subtle hover:border-ui-borderStrong"
        )}
        style={{ backgroundColor: color }}
    />
)
