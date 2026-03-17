import React from 'react'
import { clsx } from 'clsx'

type Orientation = 'horizontal' | 'vertical'

type ToolButtonProps = {
    id?: string
    active?: boolean
    disabled?: boolean
    intent?: 'default' | 'danger'
    onClick?: () => void
    className?: string
    children: React.ReactNode
}

export const ToolButton: React.FC<ToolButtonProps> = ({
    id,
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
            data-tool-id={id}
            className={clsx(
                "tool-button",
                active && "tool-button-active",
                intent === 'danger' && "tool-button-danger",
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
            orientation === 'horizontal' ? "w-[1px] h-5 mx-1" : "h-[1px] w-5 my-1"
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
            "swatch-button",
            active && "swatch-button-active"
        )}
        style={{ backgroundColor: color }}
    />
)
