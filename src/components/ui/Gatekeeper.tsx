import React, { useState, useEffect } from "react"
import { Lock, Unlock, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { Button } from "./Button"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"

interface GatekeeperProps {
    children: React.ReactNode
}

export function Gatekeeper({ children }: GatekeeperProps) {
    const [isUnlocked, setIsUnlocked] = useState(() => {
        return sessionStorage.getItem("portfolio_unlocked") === "true"
    })
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError("")

        // Simulate a slight delay for verification feel
        setTimeout(() => {
            if (password === "selgaharold") {
                sessionStorage.setItem("portfolio_unlocked", "true")
                setIsUnlocked(true)
            } else {
                setError("Please check this field")
                setIsSubmitting(false)
            }
        }, 600)
    }

    useEffect(() => {
        if (!isUnlocked) return

        let timeoutId: number;

        const resetTimer = () => {
            if (timeoutId) window.clearTimeout(timeoutId)
            timeoutId = window.setTimeout(() => {
                sessionStorage.removeItem("portfolio_unlocked")
                setIsUnlocked(false)
            }, 15 * 60 * 1000) // 15 minutes of inactivity
        }

        const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"]
        events.forEach(event => window.addEventListener(event, resetTimer))

        resetTimer()

        return () => {
            if (timeoutId) window.clearTimeout(timeoutId)
            events.forEach(event => window.removeEventListener(event, resetTimer))
        }
    }, [isUnlocked])

    if (isUnlocked) {
        return <>{children}</>
    }

    return (
        <div className="min-h-[85vh] w-full flex items-center justify-center py-20 px-4 bg-background relative overflow-hidden">
            {/* Subtle background patterns */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "30px 30px" }} />
            
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl p-8 md:p-10 shadow-2xl relative z-10"
            >
                <div className="flex flex-col items-center text-center space-y-6">
                    {/* Glowing lock icon */}
                    <div className="relative w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                        <motion.div
                            animate={isSubmitting && !error ? { rotate: [0, -10, 10, 0] } : {}}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                        >
                            {isSubmitting && !error ? <Unlock className="h-7 w-7" /> : <Lock className="h-7 w-7" />}
                        </motion.div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-black tracking-tight uppercase">Authorized Access Only</h2>
                        <p className="text-muted-foreground text-sm font-medium">
                            Please enter the passcode to view this protected workspace.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="w-full space-y-4">
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    if (error) setError("")
                                }}
                                placeholder="••••••••"
                                disabled={isSubmitting}
                                className={`w-full px-5 py-3.5 bg-background border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium transition-all text-center tracking-widest text-lg ${
                                    error 
                                        ? "border-rose-500/50 bg-rose-500/[0.02] focus:border-rose-500" 
                                        : "border-border/60 focus:border-primary"
                                }`}
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                                disabled={isSubmitting}
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="text-rose-500 font-bold text-sm"
                                >
                                    {error}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        <Button
                            type="submit"
                            disabled={isSubmitting || !password}
                            className="w-full py-6 rounded-2xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/15 hover:shadow-primary/25 disabled:opacity-50"
                        >
                            {isSubmitting ? "Unlocking..." : "Unlock"}
                        </Button>
                    </form>

                    <div className="w-full border-t border-border/40 pt-4 flex justify-center">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors group"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Return to Home
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
