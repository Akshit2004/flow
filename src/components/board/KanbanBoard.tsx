"use client";

import React, { useState, useOptimistic } from 'react';
import { updateTaskStatus } from '@/actions/task';
import TaskCard from './TaskCard';
import Button from '@/components/ui/Button';
import CreateTaskModal from './CreateTaskModal';
import { Plus } from 'lucide-react';
import styles from './KanbanBoard.module.css';

type Task = {
  _id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  order: number;
};

// Column definitions
const COLUMNS = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'DONE', title: 'Done' },
];

export default function KanbanBoard({ projectId, initialTasks }: { projectId: string; initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync state with server/prop updates
  React.useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Drag state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    const task = tasks.find(t => t._id === draggedTaskId);
    if (!task || task.status === status) return;

    // Optimistic update
    const newTasks = tasks.map(t => 
      t._id === draggedTaskId ? { ...t, status } : t
    );
    setTasks(newTasks);
    setDraggedTaskId(null);

    // Persist
    await updateTaskStatus(draggedTaskId, status, 0); 
  };

  return (
    <div className={styles.board}>
      <div className={styles.header}>
        <h2 className={styles.title}>Board</h2>
        <Button size="sm" onClick={() => setIsModalOpen(true)} type="button">
          <Plus size={16} /> Add Task
        </Button>
      </div>

      <div className={styles.columns}>
        {COLUMNS.map(col => {
           const colTasks = tasks.filter(t => t.status === col.id);
           
           return (
             <div 
                key={col.id} 
                className={styles.column}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id as Task['status'])}
             >
               <div className={styles.columnHeader}>
                 <span className={styles.columnTitle}>{col.title}</span>
                 <span className={styles.count}>{colTasks.length}</span>
               </div>
               <div className={styles.columnContent}>
                 {colTasks.map((task, index) => (
                   <TaskCard 
                      key={task._id} 
                      id={task._id} 
                      title={task.title} 
                      priority={task.priority}
                      status={task.status}
                      index={index}
                      onDragStart={handleDragStart}
                   />
                 ))}
               </div>
             </div>
           )
        })}
      </div>

      {isModalOpen && (
        <CreateTaskModal 
          projectId={projectId} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}
