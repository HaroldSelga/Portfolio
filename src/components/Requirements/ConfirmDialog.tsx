import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, X } from "lucide-react"

// ── Styled Confirmation Dialog ────────────────────────────────────────

interface ConfirmDialogProps {
    isOpen: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: "danger" | "warning" | "info"
    onConfirm: () => void
    onCancel: () => void
}

export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
    variant = "danger",
    onConfirm,
    onCancel
}: ConfirmDialogProps) {
    const variantStyles = {
        danger: {
            icon: "bg-rose-500/10 text-rose-500",
            button: "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20",
        },
        warning: {
            icon: "bg-amber-500/10 text-amber-500",
            button: "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20",
        },
        info: {
            icon: "bg-primary/10 text-primary",
            button: "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20",
        },
    }

    const style = variantStyles[variant]

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={onCancel}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-card w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-border/50"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 space-y-4">
                            {/* Icon */}
                            <div className="flex justify-center">
                                <div className={`p-4 rounded-2xl ${style.icon}`}>
                                    <AlertTriangle className="h-8 w-8" />
                                </div>
                            </div>

                            {/* Text */}
                            <div className="text-center space-y-2">
                                <h3 className="font-bold text-lg text-foreground">{title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={onCancel}
                                    className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground font-bold text-sm rounded-xl border border-border/40 transition-all"
                                >
                                    {cancelLabel}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className={`flex-1 px-4 py-2.5 font-bold text-sm rounded-xl shadow-md transition-all hover:-translate-y-0.5 ${style.button}`}
                                >
                                    {confirmLabel}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}


// ── Toast Notification System ─────────────────────────────────────────

interface Toast {
    id: string
    message: string
    type: "success" | "error" | "info"
}

interface ToastContainerProps {
    toasts: Toast[]
    onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
    const getStyle = (type: Toast["type"]) => {
        switch (type) {
            case "success":
                return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            case "error":
                return "bg-rose-500/10 border-rose-500/30 text-rose-400"
            case "info":
                return "bg-primary/10 border-primary/30 text-primary"
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-[130] flex flex-col gap-2 max-w-sm">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 50, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.95 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className={`px-4 py-3 rounded-xl border backdrop-blur-lg shadow-xl flex items-center gap-3 ${getStyle(toast.type)}`}
                    >
                        <span className="text-xs font-bold flex-1">{toast.message}</span>
                        <button
                            onClick={() => onDismiss(toast.id)}
                            className="p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}
