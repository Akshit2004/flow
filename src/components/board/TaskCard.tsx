"use client";

import React from 'react';
import styles from './TaskCard.module.css';

interface TaskProps {
  id: string;
  ticketId?: string;
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: string;
  index: number;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onClick: () => void;
}

export default function TaskCard({ id, ticketId, title, priority, onDragStart, onClick }: TaskProps) {
  const priorityClass = 
    priority === 'HIGH' ? styles.priorityHigh :
    priority === 'MEDIUM' ? styles.priorityMedium :
    styles.priorityLow;

  return (
    <div 
      className={styles.card}
      draggable
      onDragStart={(e) => onDragStart(e, id)}
      onClick={onClick}
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
