"use client";

import React, { useState, useOptimistic } from 'react';
import { updateTaskStatus } from '@/actions/task';
import { updateProjectColumns } from '@/actions/project';
import TaskCard from './TaskCard';
import Button from '@/components/ui/Button';
import CreateTaskModal from './CreateTaskModal';
import TaskDetailModal from './TaskDetailModal';
import AddColumnModal from './AddColumnModal';
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
  subtasks?: {
    _id: string;
    text: string;
    completed: boolean;
    order: number;
  }[];
  comments?: { 
    _id: string; 
    text: string; 
    user: { _id: string; name: string; avatar?: string } | string; 
    createdAt: string 
  }[];
  order: number;
  project: string;
  createdAt?: string;
  updatedAt?: string;
};

// Column definitions
// Default columns if none provided
const DEFAULT_COLUMNS = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'COMPLETED', title: 'Completed' },
];

export default function KanbanBoard({ 
    projectId, 
    initialTasks, 
    columns = DEFAULT_COLUMNS,
    labels = []
}: { 
    projectId: string; 
    initialTasks: Task[]; 
    columns?: { id: string; title: string }[];
    labels?: { id: string; name: string; color: string }[];
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Sync state with server/prop updates
  React.useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  React.useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  const [localColumns, setLocalColumns] = useState(columns);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [draggedColId, setDraggedColId] = useState<string | null>(null);

  // Task Drag Handlers
  const handleTaskDragStart = (e: React.DragEvent, id: string) => {
    e.stopPropagation();
    setDraggedTaskId(id);
    setDraggedColId(null);
    e.dataTransfer.setData('type', 'TASK'); // Mark as task
    e.dataTransfer.effectAllowed = 'move';
  };

  // Column Drag Handlers
  const handleColumnDragStart = (e: React.DragEvent, id: string) => {
    setDraggedColId(id);
    setDraggedTaskId(null);
    e.dataTransfer.setData('type', 'COLUMN');
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleColumnDrop = async (e: React.DragEvent, targetColId: string) => {
      e.preventDefault();
      // If dropping a column
      if (draggedColId && draggedColId !== targetColId) {
          const oldIndex = localColumns.findIndex(c => c.id === draggedColId);
          const newIndex = localColumns.findIndex(c => c.id === targetColId);
          
          if (oldIndex === -1 || newIndex === -1) return;

          const newCols = [...localColumns];
          const [movedCol] = newCols.splice(oldIndex, 1);
          newCols.splice(newIndex, 0, movedCol);

          // Update Order prop
          const orderedCols = newCols.map((c, i) => ({ ...c, order: i }));
          
          setLocalColumns(orderedCols);
          setDraggedColId(null);
          
          await updateProjectColumns(projectId, orderedCols);
          return;
      }
      
      // If dropping a task
      if (draggedTaskId) {
           handleTaskDrop(e, targetColId);
      }
  };

  const handleTaskDrop = async (e: React.DragEvent, status: string) => {
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

  // Add Column Handler
  const handleAddColumn = async (title: string) => {
      const newId = title.toUpperCase().replace(/\s+/g, '_');
      const newColumn = { id: newId, title, order: localColumns.length };
      const newColumns = [...localColumns, newColumn];
      
      setLocalColumns(newColumns); // Optimistic
      await updateProjectColumns(projectId, newColumns);
  };

  return (
    <div className={styles.board}>
      <div className={styles.header}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <h2 className={styles.title}>Board</h2>
            <Button size="sm" variant="secondary" onClick={() => setIsAddColumnModalOpen(true)} type="button" className="!py-1 !px-2 !text-xs">
                 <Plus size={14} className="mr-1" /> Column
            </Button>
        </div>
        <Button size="sm" onClick={() => setIsModalOpen(true)} type="button">
          <Plus size={16} /> Add Task
        </Button>
      </div>

      <div className={styles.columns}>
        {localColumns.map(col => {
           const colTasks = tasks.filter(t => t.status === col.id);
           
           return (
             <div 
                key={col.id} 
                className={styles.column}
                draggable
                onDragStart={(e) => handleColumnDragStart(e, col.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleColumnDrop(e, col.id)}
                style={{ cursor: 'grab' }}
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
                      onDragStart={handleTaskDragStart}
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

      {isAddColumnModalOpen && (
        <AddColumnModal
            onClose={() => setIsAddColumnModalOpen(false)}
            onAdd={handleAddColumn}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
            task={selectedTask}
            columns={localColumns}
            labels={labels}
            onClose={() => setSelectedTask(null)}
            onUpdate={handleTaskUpdate}
            onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
}
