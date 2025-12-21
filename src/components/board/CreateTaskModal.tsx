"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTask, TaskState } from "@/actions/task";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { X } from "lucide-react";
import styles from "./CreateTaskModal.module.css";

const initialState: TaskState = {};

export default function CreateTaskModal({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const [state, formAction, isPending] = useActionState(createTask, initialState);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state.success, onClose]);
  
  // Close on click outside... (omitted for brevity in replacement if unchanged)
  // Re-implementing for safety in replacement block:
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} ref={modalRef}>
        <div className={styles.header}>
          <h2 className={styles.title}>New Task</h2>
          <button onClick={onClose} className={styles.closeButton} type="button">
            <X size={20} />
          </button>
        </div>
        
        <form action={formAction} className={styles.form}>
          <input type="hidden" name="projectId" value={projectId} />
          
          <Input 
            name="title" 
            label="Task Title" 
            placeholder="What needs to be done?" 
            required
            autoFocus 
          />
          <Input 
            name="description" 
            label="Description (Optional)" 
            placeholder="Details..." 
          />
          
          <div className={styles.fieldGroup}>
            <div style={{ flex: 1 }}>
                <label className={styles.label}>Priority</label>
                <select name="priority" className={styles.select} defaultValue="MEDIUM">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                </select>
            </div>
            <div style={{ flex: 1 }}>
                <label className={styles.label}>Status</label>
                <select name="status" className={styles.select} defaultValue="TODO">
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                </select>
            </div>
          </div>

          {state.error && <p className={styles.error}>{state.error}</p>}

          <div className={styles.footer}>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
