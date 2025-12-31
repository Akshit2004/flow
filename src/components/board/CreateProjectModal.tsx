import { useActionState, useEffect, useRef, useState } from "react";
import { createProject, ProjectState } from "@/actions/project";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { X } from "lucide-react";
import styles from "./CreateProjectModal.module.css";
import { useRouter } from "next/navigation";
import { PROJECT_TEMPLATES } from "@/lib/project-templates";

const initialState: ProjectState = {};

export default function CreateProjectModal({ onClose }: { onClose: () => void }) {
  const [state, formAction, isPending] = useActionState(createProject, initialState);
  const [selectedTemplate, setSelectedTemplate] = useState(PROJECT_TEMPLATES[0].key);
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      onClose();
      // Optional: Trigger a toast
    }
  }, [state.success, onClose]);

  // Close on click outside
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
          <h2 className={styles.title}>New Project</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>
        
        <form action={formAction} className={styles.form}>
          <div className={styles.section}>
            <Input 
              name="name" 
              label="Project Name" 
              placeholder="e.g. Q3 Marketing Campaign" 
              required
              autoFocus 
            />
            <Input 
              name="description" 
              label="Description (Optional)" 
              placeholder="Brief details..." 
            />
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Select Template</h3>
            <input type="hidden" name="template" value={selectedTemplate} />
            <div className={styles.templateGrid}>
              {PROJECT_TEMPLATES.map((template) => (
                <button
                  key={template.key}
                  type="button"
                  className={`${styles.templateCard} ${selectedTemplate === template.key ? styles.selected : ''}`}
                  onClick={() => setSelectedTemplate(template.key)}
                >
                  <span className={styles.templateName}>{template.name}</span>
                  <span className={styles.templateDesc}>{template.description}</span>
                </button>
              ))}
            </div>
          </div>
          
          {state.error && <p className={styles.error}>{state.error}</p>}

          <div className={styles.footer}>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
