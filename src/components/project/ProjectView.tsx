"use client";

import { useState } from 'react';
import KanbanBoard from '@/components/board/KanbanBoard';
import ProjectTabs from './ProjectTabs';
import ProjectAnalytics from './ProjectAnalytics';

interface Column {
    id: string;
    title: string;
    order: number;
    _id?: string;
}

interface Task {
    _id: string;
    title: string;
    description?: string;
    status: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    order: number;
    project: string;
    ticketId?: string;
    assignedTo?: string;
    dueDate?: string;
    subtasks?: any[];
    comments?: any[];
}

interface ProjectViewProps {
    projectId: string;
    initialTasks: Task[];
    columns: Column[];
}

export default function ProjectView({ projectId, initialTasks, columns }: ProjectViewProps) {
    const [activeTab, setActiveTab] = useState<'board' | 'analytics'>('board');

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <ProjectTabs 
                projectId={projectId} 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
            />
            
            <div style={{ flex: 1, marginTop: '16px' }}>
                {activeTab === 'board' ? (
                    <KanbanBoard 
                        projectId={projectId} 
                        initialTasks={initialTasks} 
                        columns={columns} 
                    />
                ) : (
                    <ProjectAnalytics projectId={projectId} />
                )}
            </div>
        </div>
    );
}
