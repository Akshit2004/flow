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
  { label: "Low", value: "LOW", color: "#10B981" },
  { label: "Medium", value: "MEDIUM", color: "#F59E0B" },
  { label: "High", value: "HIGH", color: "#EF4444" },
];

export default function CreateTaskModal({
  projectId,
  onClose,
  columns,
}: {
  projectId: string;
  onClose: () => void;
  columns: { id: string; title: string }[];
}) {
  const [state, formAction, isPending] = useActionState(
    createTask,
    initialState
  );
  const modalRef = useRef<HTMLDivElement>(null);
  const [priority, setPriority] = useState("MEDIUM");

  // Use first column as default, or fallback to first available if columns exist
  const [status, setStatus] = useState(
    columns.length > 0 ? columns[0].id : "TODO"
  );

  const statusOptions = columns.map((col) => ({
    label: col.title,
    value: col.id,
    color: "#6B7280", // Default color, or we could pass colors if available
  }));

  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state.success, onClose]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
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
          <button
            onClick={onClose}
            className={styles.closeButton}
            type="button"
          >
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
                options={statusOptions}
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
