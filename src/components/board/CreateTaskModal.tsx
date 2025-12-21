"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createTask, TaskState } from "@/actions/task";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { X } from "lucide-react";
import styles from "./CreateTaskModal.module.css";

const initialState: TaskState = {};

const PRIORITY_OPTIONS = [
    { label: 'Low', value: 'LOW', color: '#10B981' },
    { label: 'Medium', value: 'MEDIUM', color: '#F59E0B' },
    { label: 'High', value: 'HIGH', color: '#EF4444' },
];

const STATUS_OPTIONS = [
    { label: 'To Do', value: 'TODO', color: '#6B7280' },
    { label: 'In Progress', value: 'IN_PROGRESS', color: '#3B82F6' },
    { label: 'Completed', value: 'COMPLETED', color: '#10B981' },
];

export default function CreateTaskModal({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const [state, formAction, isPending] = useActionState(createTask, initialState);
  const modalRef = useRef<HTMLDivElement>(null);
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('TODO');

  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state.success, onClose]);
  
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
          <input type="hidden" name="priority" value={priority} />
          <input type="hidden" name="status" value={status} />
          
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
                <CustomDropdown 
                    label="Priority"
                    options={PRIORITY_OPTIONS}
                    value={priority}
                    onChange={setPriority}
                />
            </div>
            <div style={{ flex: 1 }}>
                <CustomDropdown 
                    label="Status"
                    options={STATUS_OPTIONS}
                    value={status}
                    onChange={setStatus}
                />
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
