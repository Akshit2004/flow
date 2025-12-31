
export interface ProjectTemplate {
    key: string;
    name: string;
    description: string;
    columns: { id: string; title: string; order: number }[];
    labels: { id: string; name: string; color: string }[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
    {
        key: 'SOFTWARE',
        name: 'Software Development',
        description: 'Track tasks, bugs, and features.',
        columns: [
            { id: 'TODO', title: 'To Do', order: 0 },
            { id: 'IN_PROGRESS', title: 'In Progress', order: 1 },
            { id: 'CODE_REVIEW', title: 'Code Review', order: 2 },
            { id: 'TESTING', title: 'QA / Testing', order: 3 },
            { id: 'DONE', title: 'Done', order: 4 },
        ],
        labels: [
            { id: 'bug', name: 'Bug', color: '#ef4444' }, // Red
            { id: 'feature', name: 'Feature', color: '#3b82f6' }, // Blue
            { id: 'enhancement', name: 'Enhancement', color: '#10b981' }, // Green
            { id: 'documentation', name: 'Documentation', color: '#f59e0b' }, // Amber
            { id: 'design', name: 'Design', color: '#8b5cf6' }, // Purple
        ],
    },
    {
        key: 'MARKETING',
        name: 'Marketing Campaign',
        description: 'Manage content, campaigns, and assets.',
        columns: [
            { id: 'IDEATION', title: 'Ideation', order: 0 },
            { id: 'DRAFTING', title: 'Drafting', order: 1 },
            { id: 'DESIGN', title: 'Design', order: 2 },
            { id: 'REVIEW', title: 'Review', order: 3 },
            { id: 'SCHEDULED', title: 'Scheduled', order: 4 },
            { id: 'PUBLISHED', title: 'Published', order: 5 },
        ],
        labels: [
            { id: 'social', name: 'Social Media', color: '#3b82f6' },
            { id: 'blog', name: 'Blog Post', color: '#10b981' },
            { id: 'email', name: 'Email Newsletter', color: '#f59e0b' },
            { id: 'ad', name: 'Advertisement', color: '#ef4444' },
        ],
    },
    {
        key: 'SALES',
        name: 'Sales Pipeline',
        description: 'Track leads and potential deals.',
        columns: [
            { id: 'LEAD', title: 'New Lead', order: 0 },
            { id: 'CONTACTED', title: 'Contacted', order: 1 },
            { id: 'MEETING', title: 'Meeting Scheduled', order: 2 },
            { id: 'PROPOSAL', title: 'Proposal Sent', order: 3 },
            { id: 'NEGOTIATION', title: 'Negotiation', order: 4 },
            { id: 'CLOSED_WON', title: 'Closed (Won)', order: 5 },
            { id: 'CLOSED_LOST', title: 'Closed (Lost)', order: 6 },
        ],
        labels: [
            { id: 'hot', name: 'Hot Lead', color: '#ef4444' },
            { id: 'warm', name: 'Warm Lead', color: '#f59e0b' },
            { id: 'cold', name: 'Cold Lead', color: '#3b82f6' },
            { id: 'enterprise', name: 'Enterprise', color: '#8b5cf6' },
        ],
    },
    {
        key: 'DESIGN',
        name: 'Design Requests',
        description: 'Track design tasks and feedback.',
        columns: [
            { id: 'REQUESTED', title: 'Requested', order: 0 },
            { id: 'CONCEPT', title: 'Concept', order: 1 },
            { id: 'WIREFRAMING', title: 'Wireframing', order: 2 },
            { id: 'PROTOTYPING', title: 'Prototyping', order: 3 },
            { id: 'FEEDBACK', title: 'Client Feedback', order: 4 },
            { id: 'FINAL_POLISH', title: 'Final Polish', order: 5 },
            { id: 'DELIVERED', title: 'Delivered', order: 6 },
        ],
        labels: [
            { id: 'ui', name: 'UI / Visual', color: '#3b82f6' },
            { id: 'ux', name: 'UX / Research', color: '#10b981' },
            { id: 'mobile', name: 'Mobile', color: '#f59e0b' },
            { id: 'web', name: 'Web', color: '#8b5cf6' },
        ],
    },
    {
        key: 'HR',
        name: 'Recruitment Pipeline',
        description: 'Track candidates through the hiring process.',
        columns: [
            { id: 'APPLIED', title: 'Applied', order: 0 },
            { id: 'SCREENING', title: 'Screening', order: 1 },
            { id: 'INTERVIEW_1', title: '1st Interview', order: 2 },
            { id: 'INTERVIEW_2', title: '2nd Interview', order: 3 },
            { id: 'OFFER', title: 'Offer Sent', order: 4 },
            { id: 'HIRED', title: 'Hired', order: 5 },
            { id: 'REJECTED', title: 'Rejected', order: 6 },
        ],
        labels: [
            { id: 'engineering', name: 'Engineering', color: '#3b82f6' },
            { id: 'product', name: 'Product', color: '#10b981' },
            { id: 'design', name: 'Design', color: '#8b5cf6' },
            { id: 'sales', name: 'Sales', color: '#f59e0b' },
        ],
    },
];
