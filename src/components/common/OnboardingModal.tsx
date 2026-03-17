import React, { useState } from 'react'
import { HelpCircle, MousePointer2, PaintBucket, Layers, Share2, ArrowRight, ArrowLeft, CheckCircle2, Monitor, Cpu } from 'lucide-react'
import { Modal } from './Modal'
import { clsx } from 'clsx'
import { useEditorStore } from '../../stores/editorStore'

interface Step {
    id: string
    title: string
    icon: React.ReactNode
    content: React.ReactNode
}

export const OnboardingModal: React.FC<{ onForceClose?: () => void, forceOpen?: boolean }> = ({ onForceClose, forceOpen }) => {
    const { showHelp, setShowHelp } = useEditorStore()
    const [currentStep, setCurrentStep] = useState(0)

    const isOpen = forceOpen || showHelp

    const steps: Step[] = [
        {
            id: 'welcome',
            title: 'Welcome',
            icon: <Monitor size={24} />,
            content: (
                <div className="space-y-4">
                    <p className="text-sm text-text-secondary leading-relaxed">
                        TileMaster is a professional pixel art and tilemap editor designed specifically for **retro console development**.
                    </p>
                    <div className="p-4 rounded-xl bg-accent-primary/5 border border-accent-primary/20 space-y-2">
                        <h4 className="text-xs font-bold text-accent-primary uppercase tracking-wider">Target GBDK-2020</h4>
                        <p className="text-[11px] text-text-secondary leading-relaxed">
                            Export production-ready C code, headers, and binary data directly compatible with GBDK-2020 for Game Boy, NES, and SMS.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'editor',
            title: 'Tile Editor',
            icon: <MousePointer2 size={24} />,
            content: (
                <div className="space-y-4">
                    <p className="text-sm text-text-secondary">Draw and manage your tileset with precision. Support for multiple platforms and hardware-level constraints.</p>
                    <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-[11px] text-text-secondary">
                            <CheckCircle2 size={14} className="text-accent-primary shrink-0 mt-0.5" />
                            <span>8x8 and 8x16 tile support depending on platform.</span>
                        </li>
                        <li className="flex items-start gap-2 text-[11px] text-text-secondary">
                            <CheckCircle2 size={14} className="text-accent-primary shrink-0 mt-0.5" />
                            <span>Real-time constraint checking for hardware limits.</span>
                        </li>
                    </ul>
                </div>
            )
        },
        {
            id: 'map',
            title: 'Map Builder',
            icon: <Layers size={24} />,
            content: (
                <div className="space-y-4">
                    <p className="text-sm text-text-secondary">Compose complex worlds using layers. Seamlessly integrates with your tileset.</p>
                    <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-[11px] text-text-secondary">
                            <CheckCircle2 size={14} className="text-accent-primary shrink-0 mt-0.5" />
                            <span>Tile, Collision, and Object layers.</span>
                        </li>
                        <li className="flex items-start gap-2 text-[11px] text-text-secondary">
                            <CheckCircle2 size={14} className="text-accent-primary shrink-0 mt-0.5" />
                            <span>Efficient painting and flood-fill tools.</span>
                        </li>
                    </ul>
                </div>
            )
        },
        {
            id: 'export',
            title: 'Production Export',
            icon: <Share2 size={24} />,
            content: (
                <div className="space-y-4">
                    <p className="text-sm text-text-secondary">Get your game assets into your engine instantly.</p>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 rounded-lg bg-bg-secondary border border-ui-border-subtle">
                            <span className="block text-[10px] font-bold text-accent-primary uppercase mb-1">C Source</span>
                            <span className="text-[9px] text-text-disabled">Optimized arrays</span>
                        </div>
                        <div className="p-3 rounded-lg bg-bg-secondary border border-ui-border-subtle">
                            <span className="block text-[10px] font-bold text-accent-primary uppercase mb-1">Binary</span>
                            <span className="text-[9px] text-text-disabled">Raw hardware data</span>
                        </div>
                    </div>
                </div>
            )
        }
    ]

    const handleClose = () => {
        if (onForceClose) onForceClose()
        else setShowHelp(false)
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Getting Started"
            icon={<HelpCircle size={18} />}
            maxWidth="3xl"
            footer={
                <div className="flex items-center justify-between w-full">
                    <div className="flex gap-1.5">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={clsx(
                                    "h-1.5 rounded-full transition-all duration-300",
                                    currentStep === i ? "w-6 bg-accent-primary" : "w-1.5 bg-ui-border-subtle"
                                )}
                            />
                        ))}
                    </div>
                    <div className="flex gap-3">
                        {currentStep > 0 && (
                            <button
                                onClick={() => setCurrentStep(s => s - 1)}
                                className="modal-button-secondary flex items-center gap-2"
                            >
                                <ArrowLeft size={14} /> Back
                            </button>
                        )}
                        <button
                            onClick={() => {
                                if (currentStep === steps.length - 1) handleClose()
                                else setCurrentStep(s => s + 1)
                            }}
                            className="modal-button-primary flex items-center gap-2"
                        >
                            {currentStep === steps.length - 1 ? 'Start Creating' : 'Next'}
                            {currentStep < steps.length - 1 && <ArrowRight size={14} />}
                        </button>
                    </div>
                </div>
            }
        >
            <div className="flex flex-col md:flex-row flex-1 min-h-[360px]">
                {/* Sidebar: Navigation */}
                <div className="modal-sidebar md:w-64 space-y-2">
                    {steps.map((step, i) => (
                        <button
                            key={step.id}
                            onClick={() => setCurrentStep(i)}
                            className={clsx(
                                "w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3",
                                currentStep === i
                                    ? "bg-accent-primary/10 text-accent-primary border border-accent-primary/20 shadow-sm"
                                    : "text-text-secondary hover:bg-white/5 border border-transparent"
                            )}
                        >
                            <div className={clsx(
                                "p-2 rounded-lg",
                                currentStep === i ? "bg-accent-primary text-white" : "bg-bg-secondary text-text-disabled"
                            )}>
                                {React.cloneElement(step.icon as React.ReactElement, { size: 16 })}
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider">{step.title}</span>
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                <div className="modal-main-content p-8 md:p-12">
                    <div className="max-w-md animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                                {steps[currentStep].icon}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-text-primary tracking-tight">{steps[currentStep].title}</h3>
                                <span className="text-[10px] font-bold text-accent-primary/60 uppercase tracking-widest">Step {currentStep + 1} of {steps.length}</span>
                            </div>
                        </div>
                        {steps[currentStep].content}
                    </div>
                </div>
            </div>
        </Modal>
    )
}
