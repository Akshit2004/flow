"use client";

import React, { useMemo } from 'react';
import styles from './TaskCard.module.css';
import { useContextMenu } from '@/context/ContextMenuContext';
import { Edit2, Trash2, Flag, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import { motion, usePresence } from 'framer-motion';

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

const TaskContent = ({ title, ticketId, priority, priorityClass }: any) => (
    <>
      <div className={styles.title} style={{ marginBottom: ticketId ? '4px' : '8px' }}>{title}</div>
      <div className={styles.meta} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {ticketId && (
            <span style={{ fontSize: '11px', color: '#6b778c', fontWeight: 600 }}>{ticketId}</span>
        )}
        <span className={`${styles.priority} ${priorityClass}`}>
          {priority}
        </span>
      </div>
    </>
);

export default function TaskCard({ 
  id, ticketId, title, priority, status, onDragStart, onClick, 
  onEdit, onDelete, onPriorityChange, onStatusChange, onMoveNext, isLastColumn
}: TaskProps) {
  const { showContextMenu } = useContextMenu();
  const [isPresent, safeToRemove] = usePresence();

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

  // Shredding Logic
  const STRIPS = 12; // More strips for better "dissolve" feel

  return (
    <motion.div 
      layoutId={id}
      className={styles.card}
      draggable
      onDragStart={(e) => {
          if (!isPresent) return; // Prevent drag during exit
          onDragStart(e as any, id);
      }}
      onClick={onClick}
      onContextMenu={handleContextMenu}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 1, transition: { duration: 0 } }} // Keep container visible for shredder
      style={{ position: 'relative', overflow: 'visible' }} // Allow strips to fall out
    >
       {isPresent ? (
           <TaskContent title={title} ticketId={ticketId} priority={priority} priorityClass={priorityClass} />
       ) : (
           <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 50, pointerEvents: 'none' }}>
               {Array.from({ length: STRIPS }).map((_, i) => {
                   const widthPercent = 100 / STRIPS;
                   const delay = i * 0.02; // Faster ripple
                   const randomX = (Math.random() - 0.5) * 40;
                   const randomRotate = (Math.random() - 0.5) * 20;
                   
                   return (
                       <motion.div
                           key={i}
                           initial={{ 
                               y: 0, 
                               opacity: 1,
                               clipPath: `inset(0 ${(STRIPS - 1 - i) * widthPercent}% 0 ${i * widthPercent}%)`
                           }}
                           animate={{ 
                               y: 100 + Math.random() * 50, 
                               x: randomX,
                               opacity: 0,
                               rotate: randomRotate,
                               scale: 0.9
                           }}
                           transition={{ 
                               duration: 0.8, 
                               ease: "easeOut",
                               delay: delay
                           }}
                           style={{
                               position: 'absolute',
                               top: 0,
                               left: 0,
                               width: '100%',
                               height: '100%',
                               // We need to replicate the card content on each strip
                           }}
                           onAnimationComplete={() => {
                               if (i === Math.floor(STRIPS / 2)) safeToRemove();
                           }}
                       >
                            <div className={styles.card} style={{ 
                                width: '100%', 
                                height: '100%', 
                                margin: 0, 
                                border: '1px solid var(--border)',
                                boxShadow: 'none',
                                background: 'var(--surface)',
                                overflow: 'hidden' 
                            }}>
                                <TaskContent title={title} ticketId={ticketId} priority={priority} priorityClass={priorityClass} />
                            </div>
                       </motion.div>
                   );
               })}
           </div>
       )}
    </motion.div>
  );
}
