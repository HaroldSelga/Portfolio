import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Calendar, Plus, Edit2, Trash2, Sparkles, Search } from "lucide-react"
import type { DateTrackerItem } from "./types"
import { EVENT_TYPES, calculateDaysAway } from "./types"

interface DateTrackerViewProps {
    trackers: DateTrackerItem[]
    onAddTracker: () => void
    onEditTracker: (tracker: DateTrackerItem) => void
    onDeleteTracker: (id: string, title: string) => void
}

export default function DateTrackerView({
    trackers,
    onAddTracker,
    onEditTracker,
    onDeleteTracker
}: DateTrackerViewProps) {
    const [selectedFilter, setSelectedFilter] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState<string>("")

    // Computed items with days away calculation
    const processedTrackers = useMemo(() => {
        return trackers.map(item => {
            const daysInfo = calculateDaysAway(item.date)
            return { ...item, ...daysInfo }
        }).sort((a, b) => a.daysAway - b.daysAway)
    }, [trackers])

    // Collect all unique event types dynamically (both presets and custom ones)
    const uniqueCategories = useMemo(() => {
        const types = new Set<string>()
        processedTrackers.forEach(t => {
            if (t.event_type) types.add(t.event_type)
        })
        return Array.from(types)
    }, [processedTrackers])

    // Filtered list
    const filteredTrackers = useMemo(() => {
        return processedTrackers.filter(item => {
            const matchesFilter = selectedFilter === "all" || item.event_type === selectedFilter
            const matchesSearch = searchQuery.trim() === "" ||
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.person_name && item.person_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (item.event_type && item.event_type.toLowerCase().includes(searchQuery.toLowerCase()))
            return matchesFilter && matchesSearch
        })
    }, [processedTrackers, selectedFilter, searchQuery])

    // Upcoming within 30 days
    const upcomingTrackers = useMemo(() => {
        return processedTrackers.filter(item => item.daysAway <= 30)
    }, [processedTrackers])

    const getEventBadge = (type: string) => {
        switch (type) {
            case "birthday":
                return { label: "Birthday", emoji: "🎂", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" }
            case "marriage_anniversary":
                return { label: "Marriage Anniversary", emoji: "💍", color: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20" }
            case "couple_anniversary":
                return { label: "Couple Anniversary", emoji: "❤️", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" }
            case "milestone":
                return { label: "Milestone", emoji: "🌟", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" }
            case "other":
                return { label: "Custom Event", emoji: "📅", color: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" }
            default:
                return { label: type, emoji: "✨", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" }
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
        >
            {/* Header & Main Controls */}
            <div className="bg-card border border-border/40 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/30 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">Date Tracker & Anniversaries</h2>
                            <p className="text-xs text-muted-foreground font-medium">Track birthdays, anniversaries, and custom milestones</p>
                        </div>
                    </div>
                    <button
                        onClick={onAddTracker}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-300 self-start sm:self-auto cursor-pointer"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Date Tracker</span>
                    </button>
                </div>

                {/* Upcoming Banner Highlight */}
                {upcomingTrackers.length > 0 && (
                    <div className="bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-purple-500/10 border border-pink-500/20 rounded-2xl p-4 shadow-sm space-y-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-pink-500 animate-pulse" />
                            <h3 className="text-xs font-black uppercase tracking-wider text-pink-600 dark:text-pink-400">
                                Upcoming Celebrations (Next 30 Days)
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                            {upcomingTrackers.map(item => {
                                const badge = getEventBadge(item.event_type)
                                return (
                                    <div
                                        key={`up-${item.id}`}
                                        className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-xl p-3 flex items-center justify-between gap-2 shadow-sm"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm">{badge.emoji}</span>
                                                <p className="text-xs font-bold truncate">{item.title}</p>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                                                {item.nextOccurrenceDate}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black shrink-0 ${
                                            item.isToday
                                                ? "bg-pink-500 text-white animate-bounce"
                                                : "bg-primary/10 text-primary border border-primary/20"
                                        }`}>
                                            {item.isToday ? "🎉 TODAY!" : `In ${item.daysAway} day${item.daysAway > 1 ? "s" : ""}`}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Dynamic Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        <button
                            onClick={() => setSelectedFilter("all")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                                selectedFilter === "all"
                                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                    : "bg-background border-border/50 text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            All ({processedTrackers.length})
                        </button>

                        {uniqueCategories.map(catKey => {
                            const badge = getEventBadge(catKey)
                            const count = processedTrackers.filter(t => t.event_type === catKey).length
                            const isSelected = selectedFilter === catKey
                            return (
                                <button
                                    key={catKey}
                                    onClick={() => setSelectedFilter(catKey)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border flex items-center gap-1.5 ${
                                        isSelected
                                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                            : "bg-background border-border/50 text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <span>{badge.emoji}</span>
                                    <span className="capitalize">{badge.label}</span>
                                    <span className={`px-1.5 py-0.2 text-[9px] rounded-md font-black ${
                                        isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                                    }`}>
                                        {count}
                                    </span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Search Input */}
                    <div className="relative shrink-0 sm:w-64">
                        <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search trackers..."
                            className="w-full pl-9 pr-3 py-1.5 bg-background border border-border/60 rounded-xl text-xs font-medium focus:outline-none focus:border-primary text-foreground"
                        />
                    </div>
                </div>

                {/* Trackers Card Grid */}
                {filteredTrackers.length === 0 ? (
                    <div className="text-center py-16 bg-muted/20 border border-dashed border-border/50 rounded-3xl space-y-3">
                        <Calendar className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                        <h3 className="font-bold text-base text-foreground">No date trackers found</h3>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                            Add birthdays, marriage anniversaries, or couple anniversaries to track upcoming celebrations.
                        </p>
                        <button
                            onClick={onAddTracker}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary font-bold text-xs rounded-xl hover:bg-primary/20 transition-all mt-2 cursor-pointer"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add Your First Tracker</span>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTrackers.map((item) => {
                            const badge = getEventBadge(item.event_type)
                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-background border border-border/40 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all hover:border-primary/30 flex flex-col justify-between space-y-3 relative group"
                                >
                                    <div className="space-y-2">
                                        {/* Card Top Row: Badge & Action Buttons */}
                                        <div className="flex items-center justify-between gap-2">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold border capitalize ${badge.color}`}>
                                                <span>{badge.emoji}</span>
                                                <span>{badge.label}</span>
                                            </span>

                                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => onEditTracker(item)}
                                                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => onDeleteTracker(item.id, item.title)}
                                                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Title & Person */}
                                        <div>
                                            <h3 className="font-black text-base text-foreground leading-snug">{item.title}</h3>
                                            {item.person_name && (
                                                <p className="text-xs font-semibold text-muted-foreground mt-0.5 flex items-center gap-1">
                                                    <span>👤</span> {item.person_name}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Middle: Days Countdown Banner */}
                                    <div className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                                        item.isToday
                                            ? "bg-pink-500/15 border-pink-500/30 text-pink-600 dark:text-pink-300"
                                            : item.daysAway <= 30
                                                ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-300"
                                                : "bg-muted/40 border-border/30 text-muted-foreground"
                                    }`}>
                                        <div className="min-w-0">
                                            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">Next Date</span>
                                            <span className="text-xs font-black block text-foreground">{item.nextOccurrenceDate}</span>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black ${
                                                item.isToday
                                                    ? "bg-pink-500 text-white shadow-sm animate-pulse"
                                                    : item.daysAway <= 30
                                                        ? "bg-amber-500 text-white"
                                                        : "bg-card border border-border/50 text-foreground"
                                            }`}>
                                                {item.isToday ? "🎉 TODAY!" : `In ${item.daysAway} day${item.daysAway > 1 ? "s" : ""}`}
                                            </span>
                                            {item.yearsCount > 0 && (
                                                <span className="text-[10px] font-bold text-muted-foreground block mt-0.5">
                                                    {item.event_type.includes("anniversary") ? `${item.yearsCount}th Year` : `Turning ${item.yearsCount}`}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    {item.notes && (
                                        <p className="text-xs text-muted-foreground font-medium pt-1 border-t border-border/20 line-clamp-2">
                                            📝 {item.notes}
                                        </p>
                                    )}
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>
        </motion.div>
    )
}
