"use client";


import { useState, useEffect, useRef } from 'react';
import styles from './TaskDetailModal.module.css';
import Button from '@/components/ui/Button';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { updateTaskDetails, getProjectUsers, addComment, deleteTask } from '@/actions/task';
import { updateProjectLabels } from '@/actions/project';
import { X, Calendar, User, Clock, CheckCircle, Trash2, ListChecks, Tag, Plus, Check } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import ActivityFeed from './ActivityFeed';
import SubtaskList from './SubtaskList';

interface Subtask {
  _id: string;
  text: string;
  completed: boolean;
  order: number;
}

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
  labels?: string[];
  ticketId?: string;
  subtasks?: Subtask[];
  comments?: { _id: string; text: string; user: { _id: string; name: string; avatar?: string } | string; createdAt: string }[];
}

interface TaskDetailModalProps {
  task: Task;
  columns?: { id: string; title: string }[];
  labels?: { id: string; name: string; color: string }[];
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const PRIORITY_OPTIONS = [
    { label: 'Low', value: 'LOW', color: '#10B981' },
    { label: 'Medium', value: 'MEDIUM', color: '#F59E0B' },
    { label: 'High', value: 'HIGH', color: '#EF4444' },
];

export default function TaskDetailModal({ task, columns = [], labels = [], onClose, onUpdate, onDelete }: TaskDetailModalProps) {
  const { confirmAction } = useToast();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [assignedTo, setAssignedTo] = useState(typeof task.assignedTo === 'object' ? task.assignedTo?._id : task.assignedTo || '');
  const [dueDate, setDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
  const [selectedLabels, setSelectedLabels] = useState<string[]>(task.labels || []);
  const [newComment, setNewComment] = useState('');
  const [users, setUsers] = useState<{ _id: string; name: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks || []);
  const [menuOpenLabels, setMenuOpenLabels] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#EF4444');
  const labelsMenuRef = useRef<HTMLDivElement>(null);

  // Close Labels menu on outside click
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (labelsMenuRef.current && !labelsMenuRef.current.contains(event.target as Node)) {
              setMenuOpenLabels(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const hasChanges = 
    title !== task.title || 
    description !== (task.description || '') || 
    status !== task.status || 
    priority !== task.priority || 
    assignedTo !== (typeof task.assignedTo === 'object' ? task.assignedTo?._id : task.assignedTo || '') ||
    priority !== task.priority || 
    assignedTo !== (typeof task.assignedTo === 'object' ? task.assignedTo?._id : task.assignedTo || '') ||
    dueDate !== (task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '') ||
    JSON.stringify(selectedLabels.sort()) !== JSON.stringify((task.labels || []).sort());

  const handleApplyChanges = async () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    const updates: any = {};
    if (title !== task.title) updates.title = title;
    if (description !== (task.description || '')) updates.description = description;
    if (status !== task.status) updates.status = status;
    if (priority !== task.priority) updates.priority = priority;
    if (assignedTo !== (typeof task.assignedTo === 'object' ? task.assignedTo?._id : task.assignedTo || '')) updates.assignedTo = assignedTo || null;
    if (assignedTo !== (typeof task.assignedTo === 'object' ? task.assignedTo?._id : task.assignedTo || '')) updates.assignedTo = assignedTo || null;
    if (dueDate !== (task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '')) updates.dueDate = dueDate || null;
    if (JSON.stringify(selectedLabels.sort()) !== JSON.stringify((task.labels || []).sort())) updates.labels = selectedLabels;

    const result = await updateTaskDetails(task._id, updates);
    setIsSaving(false);
    
    if (result.success && result.task) {
      onUpdate(result.task as any);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
  };

  const handlePriorityChange = (newPriority: string) => {
    setPriority(newPriority as any);
  };

  const handleAssigneeChange = (newAssignee: string) => {
      setAssignedTo(newAssignee);
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setDueDate(e.target.value);
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
      const ok = await confirmAction({
          title: 'Delete Task',
          message: 'Are you sure you want to delete this task? This action cannot be undone.',
          confirmText: 'Delete',
          type: 'danger'
      });
      
      if (ok) {
          const result = await deleteTask(task._id);
          if (result.success) {
              onDelete(task._id);
              onClose();
          }
      }
  };

  const handleToggleLabel = (labelId: string) => {
      setSelectedLabels(prev => 
          prev.includes(labelId) 
              ? prev.filter(id => id !== labelId)
              : [...prev, labelId]
      );
  };

  const handleCreateLabel = async () => {
      if (!newLabelName.trim()) return;
      
      const newId = newLabelName.toUpperCase().replace(/\s+/g, '_');
      
      // Random color
      const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#6B7280'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      const newLabel = { id: newId, name: newLabelName, color: randomColor };
      
      // Optimistically update
      // We need to update project labels via server action
      // In a real app we'd need the project ID here
      if (!task.project) return;
      
      const projectId = typeof task.project === 'object' ? (task.project as any)._id : task.project;
      const updatedLabels = [...labels, newLabel];
      
      await updateProjectLabels(projectId, updatedLabels);
      
      setNewLabelName('');
      // Keep menu open for multiple additions or close? 
      // User simplified flow suggests quick add, so maybe keep open or clear input.
      // Let's clear input and select it.
      handleToggleLabel(newId);
  };

  return (
    <div className={styles.overlay} onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
            <div className={styles.breadcrumbs}>
                {task.ticketId || `PROJECT / ${task._id.slice(-4).toUpperCase()}`}
                {hasChanges && (
                    <span className={styles.unsavedIndicator}>
                        <Clock size={14} /> Unsaved Changes
                    </span>
                )}
            </div>
            <div className={styles.actionButtons}>
                <button 
                    className={styles.saveButton} 
                    onClick={handleApplyChanges}
                    disabled={!hasChanges || isSaving}
                >
                    <CheckCircle size={18} />
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
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
                        placeholder="Task Title"
                    />
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionHeader}>Description</div>
                    <textarea 
                        className={styles.descriptionInput}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add a description..."
                    />
                </div>

                {/* Subtasks/Checklist Section */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ListChecks size={16} />
                        Checklist
                    </div>
                    <SubtaskList 
                        taskId={task._id} 
                        subtasks={subtasks} 
                        onUpdate={setSubtasks} 
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
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className={styles.commentInput}
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

                <div className={styles.sidebarGroup}>
                    <div className={styles.sectionHeader} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Labels</span>
                        <button 
                            className={styles.iconButton} 
                            onClick={() => setMenuOpenLabels(!menuOpenLabels)}
                            style={{ width: '24px', height: '24px', padding: 0 }}
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px', alignItems: 'center' }}>
                        {selectedLabels.map(labelId => {
                            const label = labels.find(l => l.id === labelId);
                            if (!label) return null;
                            return (
                                <div key={labelId} style={{ 
                                    backgroundColor: label.color + '20', 
                                    color: label.color,
                                    border: `1px solid ${label.color}`,
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    {label.name}
                                    <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleToggleLabel(labelId)} />
                                </div>
                            );
                        })}
                        
                        {/* Inline Input or Add Button */}
                        {menuOpenLabels ? (
                            <input
                                autoFocus
                                value={newLabelName}
                                onChange={(e) => setNewLabelName(e.target.value)}
                                onBlur={() => {
                                    // Delay closing to allow clicking suggestions if we added them, 
                                    // but for now just close if empty or keep open? 
                                    // Better UX: if empty, close.
                                    if (!newLabelName.trim()) setMenuOpenLabels(false);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleCreateLabel();
                                    } else if (e.key === 'Escape') {
                                        setMenuOpenLabels(false);
                                        setNewLabelName('');
                                    }
                                }}
                                placeholder="Type label..."
                                style={{
                                    fontSize: '12px',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--primary)',
                                    outline: 'none',
                                    minWidth: '60px',
                                    width: '100px' // explicit width
                                }}
                            />
                        ) : (
                            <button 
                                className={styles.iconButton} 
                                onClick={() => setMenuOpenLabels(true)}
                                style={{ width: '24px', height: '24px', padding: 0, borderRadius: '50%', border: '1px dashed #9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Add Label"
                            >
                                <Plus size={14} color="#6b7280" />
                            </button>
                        )}
                    </div>

                    {/* Simple Suggestions (Optional: Only show if typing matches something NOT selected) */}
                    {menuOpenLabels && newLabelName.trim() && (
                        <div style={{ position: 'absolute', zIndex: 10,  backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '4px', marginTop: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            {labels
                                .filter(l => l.name.toLowerCase().includes(newLabelName.toLowerCase()) && !selectedLabels.includes(l.id))
                                .map(l => (
                                    <div 
                                        key={l.id}
                                        onMouseDown={(e) => {
                                            e.preventDefault(); // Prevent blur
                                            handleToggleLabel(l.id);
                                            setNewLabelName('');
                                            // Keep input open for more?
                                        }}
                                        style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        className="hover:bg-gray-50"
                                    >
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: l.color }}></div>
                                        {l.name}
                                    </div>
                                ))
                            }
                        </div>
                    )}
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
