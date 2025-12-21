"use client";

import { useState, useEffect } from 'react';
import styles from './TaskDetailModal.module.css';
import Button from '@/components/ui/Button';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { updateTaskDetails, getProjectUsers, addComment, deleteTask } from '@/actions/task';
import { X, Calendar, User, Clock, CheckCircle, Trash2, Send } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt?: string;
  updatedAt?: string;
  project: string;
  order: number;
  assignedTo?: { _id: string; name: string; avatar?: string } | string;
  dueDate?: string;
  ticketId?: string;
  comments?: { _id: string; text: string; user: { _id: string; name: string; avatar?: string } | string; createdAt: string }[];
}

interface TaskDetailModalProps {
  task: Task;
  columns?: { id: string; title: string }[];
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const PRIORITY_OPTIONS = [
    { label: 'Low', value: 'LOW', color: '#10B981' },
    { label: 'Medium', value: 'MEDIUM', color: '#F59E0B' },
    { label: 'High', value: 'HIGH', color: '#EF4444' },
];

export default function TaskDetailModal({ task, columns = [], onClose, onUpdate, onDelete }: TaskDetailModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [assignedTo, setAssignedTo] = useState(typeof task.assignedTo === 'object' ? task.assignedTo?._id : task.assignedTo || '');
  const [dueDate, setDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
  const [newComment, setNewComment] = useState('');
  const [users, setUsers] = useState<{ _id: string; name: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
      getProjectUsers().then(setUsers);
  }, []);

  // Map columns to options
  const statusOptions = columns.map(c => ({
      label: c.title,
      value: c.id,
      color: c.id === 'DONE' || c.id === 'COMPLETED' ? '#10B981' : c.id === 'IN_PROGRESS' ? '#3B82F6' : '#6B7280'
  }));

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSave = async (updates: Partial<Task>) => {
    setIsSaving(true);
    const result = await updateTaskDetails(task._id, updates as any);
    setIsSaving(false);
    
    if (result.success && result.task) {
      onUpdate(result.task as any);
    }
  };

  const handleTitleBlur = () => {
    if (title !== task.title) {
      handleSave({ title });
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== (task.description || '')) {
      handleSave({ description });
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    handleSave({ status: newStatus });
  };

  const handlePriorityChange = (newPriority: string) => {
    setPriority(newPriority as any);
    handleSave({ priority: newPriority as any });
  };

  const handleAssigneeChange = (newAssignee: string) => {
      setAssignedTo(newAssignee);
      handleSave({ assignedTo: newAssignee as any });
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = e.target.value;
      setDueDate(newDate);
      handleSave({ dueDate: (newDate || null) as any });
  };

  const handleAddComment = async () => {
      if (!newComment.trim()) return;
      
      const result = await addComment(task._id, newComment);
      if (result.success && result.task) {
          setNewComment('');
          onUpdate(result.task as any);
      }
  };

  const handleDelete = async () => {
      if (confirm('Are you sure you want to delete this task?')) {
          const result = await deleteTask(task._id);
          if (result.success) {
              onDelete(task._id);
              onClose();
          }
      }
  };

  return (
    <div className={styles.overlay} onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
            <div className={styles.breadcrumbs}>
                {/* Assuming project naming convention or passing project name could be an improvement */}
                {task.ticketId || `PROJECT / ${task._id.slice(-4).toUpperCase()}`}
            </div>
            <div className={styles.actionButtons}>
                <button className={`${styles.iconButton} ${styles.deleteButton}`} onClick={handleDelete} title="Delete Task">
                    <Trash2 size={20} />
                </button>
                <button className={styles.iconButton} onClick={onClose} title="Close">
                    <X size={24} />
                </button>
            </div>
        </div>

        <div className={styles.content}>
            {/* Main Column */}
            <div className={styles.mainColumn}>
                <div className={styles.titleSection}>
                    <input 
                        className={styles.titleInput}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleTitleBlur}
                        placeholder="Task Title"
                    />
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionHeader}>Description</div>
                    <textarea 
                        className={styles.descriptionInput}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onBlur={handleDescriptionBlur}
                        placeholder="Add a description..."
                    />
                </div>

                {/* Comments Section */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>Activity</div>
                    
                    <div className={styles.commentList}>
                        {task.comments?.map((comment) => (
                            <div key={comment._id} className={styles.commentItem}>
                                <div className={styles.avatar}>
                                    {(typeof comment.user === 'object' && comment.user?.name?.[0]?.toUpperCase()) || 'U'}
                                </div>
                                <div className={styles.commentContent}>
                                    <div className={styles.commentHeader}>
                    <span className={styles.commentUser}>
                        {typeof comment.user === 'object' ? comment.user.name : 'Unknown User'}
                    </span>
                    <span className={styles.commentDate}>
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.commentText}>{comment.text}</div>
                </div>
              </div>
            ))}
            {(!task.comments || task.comments.length === 0) && (
              <div style={{ color: '#6b778c', fontStyle: 'italic', padding: '1rem', textAlign: 'center' }}>
                No comments yet.
              </div>
            )}
                    </div>

                    <div className={styles.commentItem}>
                         <div className={styles.avatar} style={{ backgroundColor: '#dfe1e6', color: '#5e6c84' }}>
                            <User size={16} />
                        </div>
                        <div className={styles.commentInputContainer}>
                            <textarea
                                className={styles.commentInput}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAddComment();
                                    }
                                }}
                            />
                            {newComment.trim() && (
                                <div className={styles.commentActions}>
                                    <Button size="sm" onClick={handleAddComment}>
                                        Save
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className={styles.sidebar}>
                <div className={styles.sidebarGroup}>
                    <CustomDropdown 
                        label="Status"
                        options={statusOptions}
                        value={status}
                        onChange={handleStatusChange}
                    />
                </div>

                <div className={styles.sidebarGroup}>
                    <CustomDropdown 
                        label="Priority"
                        options={PRIORITY_OPTIONS}
                        value={priority}
                        onChange={handlePriorityChange}
                    />
                </div>

                <div className={styles.sidebarGroup} style={{ border: 'none', background: 'transparent', padding: 0 }}>
                    <div className={styles.sectionHeader}>Details</div>
                    <ul className={styles.metaList}>
                        <li className={styles.metaItem}>
                            <CustomDropdown 
                                label="Assignee"
                                options={[
                                    { label: 'Unassigned', value: '' },
                                    ...users.map(u => ({ label: u.name, value: u._id }))
                                ]}
                                value={assignedTo}
                                onChange={handleAssigneeChange}
                            />
                        </li>
                        <li className={styles.metaItem}>
                            <span className={styles.sidebarLabel}>Due Date</span>
                            <div className={styles.dateInputContainer}>
                                <Calendar size={14} className={styles.calendarIcon} />
                                <input 
                                    type="date"
                                    className={styles.dateInput}
                                    value={dueDate}
                                    onChange={handleDueDateChange}
                                />
                            </div>
                        </li>
                        {task.createdAt && (
                             <li className={styles.metaItem}>
                                <span className={styles.sidebarLabel}>Created</span>
                                <span className={styles.metaValueControl} style={{border: 'none', paddingLeft: 0, cursor: 'default'}}>
                                    {new Date(task.createdAt).toLocaleDateString()}
                                </span>
                            </li>
                        )}
                        {task.updatedAt && (
                             <li className={styles.metaItem}>
                                <span className={styles.sidebarLabel}>Updated</span>
                                <span className={styles.metaValueControl} style={{border: 'none', paddingLeft: 0, cursor: 'default'}}>
                                    {new Date(task.updatedAt).toLocaleDateString()}
                                </span>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
