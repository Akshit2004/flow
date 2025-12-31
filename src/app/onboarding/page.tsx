"use client";

import { useActionState, useState, useEffect } from "react";
import { createProject, ProjectState } from "@/actions/project";
import { completeOnboarding } from "@/actions/onboarding";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import styles from "./page.module.css";
import { PROJECT_TEMPLATES } from "@/lib/project-templates";
import { CheckCircle, ArrowRight } from "lucide-react";

const initialState: ProjectState = {};

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(PROJECT_TEMPLATES[0].key);
  const [state, formAction, isPending] = useActionState(createProject, initialState);
  
  const handleNext = () => setStep(step + 1);

  // If project creation succeeded, move to finish
  if (state.success && step === 2) {
     // We can't update state during render, so we rely on the button action or effect?
     // Actually, if we use formAction, we need an effect.
  }

  // Effect to handle success
  // We can't use `step === 3` for redirect because we want to go to the project page.
  // Unless we want to show the specific "success" screen first?
  // Let's show success screen, then button goes to Project.
  
  const handleFinish = async () => {
    // If it's the first project (onboarding), mark as complete.
    // Ideally we check if it was false before.
    await completeOnboarding();
    // Redirect to project
    if (state.projectId) {
        // We need to use `window.location` or client-side router because completeOnboarding might redirect to dashboard?
        // completeOnboarding redirects to /dashboard. 
        // We should probably NOT use completeOnboarding's redirect if we have a specific project.
        // Actually, let's just use router.push.
    }
  };

  // If newly created project, update step
  if (state.success && step === 2) {
      // Use effect to avoid bad setstate
  }
  
  // Use useEffect for state updates
  useEffect(() => {
    if (state.success && step === 2) {
        setStep(3);
    }
  }, [state.success, step]);

  return (
    <div className={styles.card}>
       {step === 1 && (
         <div className={styles.step}>
            <h1 className={styles.heading}>New Project</h1>
            <p className={styles.subtext}>Choose a template to get started with your new project.</p>
            
            <div className={styles.templateGrid}>
              {PROJECT_TEMPLATES.map((template) => (
                <button
                  key={template.key}
                  type="button"
                  className={`${styles.templateOption} ${selectedTemplate === template.key ? styles.selected : ''}`}
                  onClick={() => setSelectedTemplate(template.key)}
                >
                  <span className={styles.templateName}>{template.name}</span>
                  <p className={styles.templateDesc}>{template.description}</p>
                </button>
              ))}
            </div>

            <Button onClick={handleNext} className={styles.nextButton}>
              Continue <ArrowRight size={16} />
            </Button>
         </div>
       )}

       {step === 2 && (
         <div className={styles.step}>
            <h1 className={styles.heading}>Project Details</h1>
            <p className={styles.subtext}>Template: <strong>{PROJECT_TEMPLATES.find(t=>t.key===selectedTemplate)?.name}</strong></p>
            
            <form action={formAction} className={styles.form}>
                
               <Input 
                 name="name" 
                 label="Project Name" 
                 placeholder="e.g. Q4 Launch" 
                 required 
                 autoFocus
               />
               <Input 
                 name="description" 
                 label="Description" 
                 placeholder="What's this project about?" 
               />
               <input type="hidden" name="template" value={selectedTemplate} />
               
               {state.error && <p className={styles.error}>{state.error}</p>}
               
               <Button type="submit" isLoading={isPending} className={styles.createButton}>
                 Create Project
               </Button>
            </form>
         </div>
       )}

       {step === 3 && (
         <div className={styles.step}>
            <div className={styles.successIcon}>
              <CheckCircle size={48} color="var(--primary)" />
            </div>
            <h1 className={styles.heading}>Project Created!</h1>
            <p className={styles.subtext}>Your new workspace is ready.</p>
            
            <form action={async () => {
                await completeOnboarding(); // Mark as complete just in case
                // Redirect to the specific project
                if (state.projectId) {
                    window.location.href = `/dashboard/project/${state.projectId}`;
                } else {
                    window.location.href = '/dashboard';
                }
            }}>
               <Button type="submit" className={styles.finishButton}>
                 Go to Project
               </Button>
            </form>
         </div>
       )}
    </div>
  );
}
