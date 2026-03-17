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
                className="modal-overlay animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div
                className={clsx(
                    "modal-container animate-in fade-in zoom-in-95 duration-200",
                    maxWidthClasses[maxWidth]
                )}
                style={{ maxHeight }}
            >
                {/* Header */}
                <div className="modal-header">
                    <div className="flex items-center gap-3">
                        {icon && <div className="text-accent-primary">{icon}</div>}
                        <h2 className="modal-title">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="modal-close-button"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body custom-scrollbar">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )

    return createPortal(content, document.body)
}
