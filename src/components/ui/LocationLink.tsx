import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { MapPin, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface LocationLinkProps {
    location: string
    query?: string
    className?: string
    iconClassName?: string
}

export function LocationLink({ location, query, className = "", iconClassName = "" }: LocationLinkProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {

        setMounted(true)
    }, [])

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }
        return () => {
            document.body.style.overflow = "unset"
        }
    }, [isOpen])

    const mapQuery = encodeURIComponent(query || location)
    const embedUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="location-modal-title"
                        className="relative w-full max-w-4xl bg-card border shadow-2xl rounded-xl overflow-hidden flex flex-col h-[70vh] md:h-[80vh]"
                    >
                        <div className="flex items-center justify-between p-4 border-b bg-card">
                            <div id="location-modal-title" className="flex items-center gap-2 font-medium">
                                <MapPin className="h-5 w-5 text-primary" />
                                {location}
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-full hover:bg-muted transition-colors"
                                aria-label="Close map"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex-1 w-full bg-muted/10 relative">
                            <iframe
                                src={embedUrl}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="absolute inset-0 w-full h-full"
                            ></iframe>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )

    return (
        <>
            <div
                onClick={() => setIsOpen(true)}
                className={`flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors group ${className}`}
            >
                <MapPin className={`shrink-0 ${iconClassName || "h-4 w-4 text-primary"}`} />
                <span className="underline-offset-4 group-hover:underline">{location}</span>
            </div>

            {mounted && createPortal(modalContent, document.body)}
        </>
    )
}
