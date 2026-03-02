import React, { useState, useEffect } from 'react'
import { Grid, Map, Monitor, Zap, Play, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import { Modal } from './Modal'

export const OnboardingModal: React.FC<{ forceOpen?: boolean, onForceClose?: () => void }> = ({ forceOpen, onForceClose }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [step, setStep] = useState(0)

    useEffect(() => {
        if (forceOpen) {
            setIsOpen(true)
            return
        }
        const hasSeenOnboarding = localStorage.getItem('tilemaster_onboarding_v1')
        if (!hasSeenOnboarding) {
            setIsOpen(true)
        }
    }, [forceOpen])

    const handleClose = () => {
        if (onForceClose) {
            onForceClose()
        } else {
            localStorage.setItem('tilemaster_onboarding_v1', 'true')
        }
        setIsOpen(false)
    }

    const steps = [
        {
            title: "Welcome to TileMaster",
            description: "The professional asset editor for retro game developers. Let's get you oriented in 30 seconds.",
            icon: Zap,
            color: "text-accent-primary",
            bgColor: "bg-accent-primary/10"
        },
        {
            title: "Tile Designer",
            description: "Create 8x8 assets with precision tools. Use 'P' for pencil, 'E' for eraser, and 'G' to fill.",
            icon: Grid,
            color: "text-accent-secondary",
            bgColor: "bg-accent-secondary/10"
        },
        {
            title: "Map Builder",
            description: "Compose scenes with sub-layers. Mark collisions with different colors for your game engine.",
            icon: Map,
            color: "text-orange-400",
            bgColor: "bg-orange-400/10"
        },
        {
            title: "Platform Guard",
            description: "Get real-time feedback. We check your tile counts and color indices against local hardware limits.",
            icon: Monitor,
            color: "text-green-400",
            bgColor: "bg-green-400/10"
        }
    ]

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Getting Started"
            icon={<Zap size={18} />}
            maxWidth="md"
        >
            <div className="flex flex-col items-center p-12 text-center min-h-[480px]">
                <div className={clsx("w-24 h-24 rounded-[2.5rem] flex items-center justify-center mb-10 transition-all duration-500 shadow-2xl", steps[step].bgColor)}>
                    {React.createElement(steps[step].icon, { size: 48, className: steps[step].color })}
                </div>

                <h2 className="text-2xl font-bold text-white mb-4 tracking-tight animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {steps[step].title}
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-12 max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {steps[step].description}
                </p>

                <div className="flex gap-2.5 mb-14">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            onClick={() => setStep(i)}
                            className={clsx(
                                "h-1.5 rounded-full transition-all duration-500 cursor-pointer",
                                i === step ? "w-8 bg-accent-primary shadow-accent-glow" : "w-1.5 bg-white/10 hover:bg-white/20"
                            )}
                        />
                    ))}
                </div>

                <div className="w-full space-y-4 mt-auto">
                    {step < steps.length - 1 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            className="w-full py-4 rounded-2xl bg-accent-primary hover:bg-accent-secondary text-white text-[10px] font-bold transition-all shadow-xl shadow-accent-primary/20 uppercase tracking-widest flex items-center justify-center gap-2 group"
                        >
                            Next Module
                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    ) : (
                        <button
                            onClick={handleClose}
                            className="w-full py-4 rounded-2xl bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold transition-all shadow-xl shadow-green-500/20 uppercase tracking-widest flex items-center justify-center gap-2 group"
                        >
                            <Play size={16} /> Enter Workspace
                        </button>
                    )}
                    <button
                        onClick={handleClose}
                        className="w-full py-2 text-gray-500 hover:text-white text-[9px] font-bold uppercase tracking-widest transition-colors"
                    >
                        Skip Onboarding
                    </button>
                </div>
            </div>
        </Modal>
    )
}
