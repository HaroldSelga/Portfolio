export interface ApplicationEntry {
    id: string
    companyName: string
    companyAddress: string
    role: string
    dateSubmitted: string
    status: 'Pending' | 'Interviewing' | 'Accepted' | 'Rejected' | 'Followed Up' | 'Ghosted' | 'Pending'
    notes: string
    coverLetter?: string
    // Personal Info for the document header
    userName?: string
    userEmail?: string
    userPhone?: string
    userAddress?: string
    userPortfolio?: string
}

export const defaultApplications: ApplicationEntry[] = [
    {
        id: '1',
        companyName: 'Sample Tech Solutions',
        companyAddress: '123 Tech Lane, Silicon Valley, CA',
        role: 'Full Stack Developer',
        dateSubmitted: new Date().toISOString().split('T')[0],
        status: 'Pending',
        notes: 'Submitted via company website.'
    }
]
