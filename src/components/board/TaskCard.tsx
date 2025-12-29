"use client";

import React from 'react';
import styles from './TaskCard.module.css';
import { useContextMenu } from '@/context/ContextMenuContext';
import { Edit2, Trash2, Flag, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

interface TaskProps {
  id: string;
  ticketId?: string;
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: string;
  index: number;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPriorityChange: (priority: 'LOW' | 'MEDIUM' | 'HIGH') => void;
  onStatusChange: (status: string) => void;
  // New props
  onMoveNext: () => void;
  isLastColumn: boolean;
}

export default function TaskCard({ 
  id, ticketId, title, priority, status, onDragStart, onClick, 
  onEdit, onDelete, onPriorityChange, onStatusChange, onMoveNext, isLastColumn
}: TaskProps) {
  const { showContextMenu } = useContextMenu();

  const priorityClass = 
    priority === 'HIGH' ? styles.priorityHigh :
    priority === 'MEDIUM' ? styles.priorityMedium :
    styles.priorityLow;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); 
    
    showContextMenu(e, [
      { 
        label: 'Edit Task', 
        icon: <Edit2 size={18} />, 
        action: onEdit
      },
      { 
        label: 'Higher Priority', 
        icon: <ArrowUp size={18} />, 
        action: () => onPriorityChange(priority === 'LOW' ? 'MEDIUM' : 'HIGH'),
        disabled: priority === 'HIGH'
      },
      { 
        label: 'Lower Priority', 
        icon: <ArrowDown size={18} />, 
        action: () => onPriorityChange(priority === 'HIGH' ? 'MEDIUM' : 'LOW'),
        disabled: priority === 'LOW'
      },
      { 
        label: 'Move to Next', 
        icon: <ArrowRight size={18} />, 
        action: onMoveNext,
        disabled: isLastColumn
      },
      { variant: 'separator', label: '', action: () => {} },
      { 
        label: 'Delete Task', 
        icon: <Trash2 size={18} />, 
        action: onDelete, 
        variant: 'destructive' 
      }
    ], id);
  };

  return (
    <div 
      className={styles.card}
      draggable
      onDragStart={(e) => onDragStart(e, id)}
      onClick={onClick}
      onContextMenu={handleContextMenu}
    >
      <div className={styles.title} style={{ marginBottom: ticketId ? '4px' : '8px' }}>{title}</div>
      <div className={styles.meta} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {ticketId && (
            <span style={{ fontSize: '11px', color: '#6b778c', fontWeight: 600 }}>{ticketId}</span>
        )}
        <span className={`${styles.priority} ${priorityClass}`}>
          {priority}
        </span>
      </div>
    </div>
  );
}
