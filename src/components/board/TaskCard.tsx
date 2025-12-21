"use client";

import React from 'react';
import styles from './TaskCard.module.css';

interface TaskProps {
  id: string;
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: string;
  index: number;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

export default function TaskCard({ id, title, priority, onDragStart }: TaskProps) {
  const priorityClass = 
    priority === 'HIGH' ? styles.priorityHigh :
    priority === 'MEDIUM' ? styles.priorityMedium :
    styles.priorityLow;

  return (
    <div 
      className={styles.card}
      draggable
      onDragStart={(e) => onDragStart(e, id)}
    >
      <div className={styles.title}>{title}</div>
      <div className={styles.meta}>
        <span className={`${styles.priority} ${priorityClass}`}>
          {priority}
        </span>
      </div>
    </div>
  );
}
