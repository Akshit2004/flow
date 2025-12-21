"use client";

import React, { useState, useOptimistic } from 'react';
import { updateTaskStatus } from '@/actions/task';
import TaskCard from './TaskCard';
import Button from '@/components/ui/Button';
import CreateTaskModal from './CreateTaskModal';
import TaskDetailModal from './TaskDetailModal';
import { Plus } from 'lucide-react';
import styles from './KanbanBoard.module.css';

type Task = {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedTo?: { _id: string; name: string; avatar?: string } | string;
  dueDate?: string;
  ticketId?: string;
  comments?: { 
    _id: string; 
    text: string; 
    user: { _id: string; name: string; avatar?: string } | string; 
    createdAt: string 
  }[];
  order: number;
  project: string;
};

// Column definitions
// Default columns if none provided
const DEFAULT_COLUMNS = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'DONE', title: 'Done' },
];

export default function KanbanBoard({ 
    projectId, 
    initialTasks, 
    columns = DEFAULT_COLUMNS 
}: { 
    projectId: string; 
    initialTasks: Task[]; 
    columns?: { id: string; title: string }[] 
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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

  const handleDrop = async (e: React.DragEvent, status: string) => {
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

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
    setSelectedTask(updatedTask); // Update the modal view too
  };

  const handleDeleteTask = (taskId: string) => {
      setTasks(prev => prev.filter(t => t._id !== taskId));
      setSelectedTask(null);
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
        {columns.map(col => {
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
                      ticketId={task.ticketId}
                      title={task.title}
                      priority={task.priority}
                      status={task.status}
                      index={index}
                      onDragStart={handleDragStart}
                      onClick={() => setSelectedTask(task)}
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

      {selectedTask && (
        <TaskDetailModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={handleTaskUpdate}
            onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
}
