import { Users } from "lucide-react"
import type { FamilyMember } from "./types"

interface PersonFilterProps {
    familyMembers: FamilyMember[]
    selectedPerson: string
    onChange: (personId: string) => void
}

export default function PersonFilter({ familyMembers, selectedPerson, onChange }: PersonFilterProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/40 rounded-2xl px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Users className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-bold text-sm">Requirement Owner</h3>
                    <p className="text-xs text-muted-foreground">View and manage documents for yourself or family members</p>
                </div>
            </div>
            <div className="relative min-w-[200px]">
                <select
                    value={selectedPerson}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold transition-colors cursor-pointer appearance-none text-foreground"
                >
                    <option value="self">👤 Me (Harold)</option>
                    {familyMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                            👥 {member.name} ({member.relationship})
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                </div>
            </div>
        </div>
    )
}
