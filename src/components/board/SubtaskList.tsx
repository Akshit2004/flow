"use client";

import { useState } from 'react';
import { addSubtask, toggleSubtask, deleteSubtask } from '@/actions/task';
import { Check, Trash2, Plus } from 'lucide-react';
import styles from './SubtaskList.module.css';

interface Subtask {
    _id: string;
    text: string;
    completed: boolean;
    order: number;
}

interface SubtaskListProps {
    taskId: string;
    subtasks: Subtask[];
    onUpdate: (subtasks: Subtask[]) => void;
}

export default function SubtaskList({ taskId, subtasks, onUpdate }: SubtaskListProps) {
    const [newSubtask, setNewSubtask] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const completedCount = subtasks.filter(s => s.completed).length;
    const totalCount = subtasks.length;
    const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    const handleAdd = async () => {
        if (!newSubtask.trim()) return;
        
        setIsAdding(true);
        console.log('Adding subtask:', newSubtask.trim(), 'to task:', taskId);
        
        const result = await addSubtask(taskId, newSubtask.trim());
        console.log('addSubtask result:', result);
        
        setIsAdding(false);
        
        if (result.success && result.subtasks) {
            console.log('Updating subtasks with:', result.subtasks);
            onUpdate(result.subtasks);
            setNewSubtask('');
        } else {
            console.error('Failed to add subtask:', result.error);
        }
    };

    const handleToggle = async (subtaskId: string) => {
        // Optimistic update
        const updatedSubtasks = subtasks.map(s => 
            s._id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        onUpdate(updatedSubtasks);

        const result = await toggleSubtask(taskId, subtaskId);
        if (result.success && result.subtasks) {
            onUpdate(result.subtasks);
        }
    };

    const handleDelete = async (subtaskId: string) => {
        // Optimistic update
        const updatedSubtasks = subtasks.filter(s => s._id !== subtaskId);
        onUpdate(updatedSubtasks);

        const result = await deleteSubtask(taskId, subtaskId);
        if (result.success && result.subtasks) {
            onUpdate(result.subtasks);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div className={styles.container}>
            {totalCount > 0 && (
                <>
                    <div className={styles.progressText}>
                        {completedCount} of {totalCount} completed
                    </div>
                    <div className={styles.progressBar}>
                        <div 
                            className={styles.progressFill} 
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </>
            )}

            <div className={styles.list}>
                {subtasks.map((subtask) => (
                    <div key={subtask._id} className={styles.item}>
                        <button
                            className={`${styles.checkbox} ${subtask.completed ? styles.checked : ''}`}
                            onClick={() => handleToggle(subtask._id)}
                            aria-label={subtask.completed ? 'Mark incomplete' : 'Mark complete'}
                        >
                            {subtask.completed && <Check size={12} />}
                        </button>
                        <span className={`${styles.text} ${subtask.completed ? styles.completed : ''}`}>
                            {subtask.text}
                        </span>
                        <button
                            className={styles.deleteButton}
                            onClick={() => handleDelete(subtask._id)}
                            aria-label="Delete subtask"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>

            <div className={styles.addForm}>
                <input
                    type="text"
                    className={styles.addInput}
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add subtask..."
                />
                <button
                    className={styles.addButton}
                    onClick={handleAdd}
                    disabled={!newSubtask.trim() || isAdding}
                >
                    <Plus size={16} />
                </button>
            </div>
        </div>
    );
}
