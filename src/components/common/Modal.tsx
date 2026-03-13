import React, { ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    icon?: React.ReactNode
    children: ReactNode
    footer?: ReactNode
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full'
    maxHeight?: string
}

const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    'full': 'max-w-[95vw]'
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    icon,
    children,
    footer,
    maxWidth = 'lg',
    maxHeight = '90vh'
}) => {
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen) return null

    const content = (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-transparent backdrop-blur-[2px] animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div
                className={clsx(
                    "relative w-full bg-bg-secondary border border-ui-border-strong rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200",
                    maxWidthClasses[maxWidth]
                )}
                style={{ maxHeight }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border bg-bg-tertiary/30">
                    <div className="flex items-center gap-3">
                        {icon && <div className="text-accent-primary">{icon}</div>}
                        <h2 className="text-sm font-bold uppercase tracking-widest text-white">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 bg-bg-tertiary/20 border-t border-ui-border flex items-center justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )

    return createPortal(content, document.body)
}
