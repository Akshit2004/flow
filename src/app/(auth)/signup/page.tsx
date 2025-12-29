"use client";

import { useActionState } from "react";
import { signup } from "@/actions/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";
import Image from "next/image";
import styles from "../login/auth.module.css"; // Reuse login styles

const initialState = {
  error: "",
};

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, initialState);

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
           <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Image src="/logo.svg" alt="Flow" width={48} height={48} />
          </div>
          <h1 className={styles.title}>Create an account</h1>
          <p className={styles.subtitle}>Start managing your projects today</p>
        </div>
        
        <form action={formAction} className={styles.form}>
          <Input 
            id="name" 
            name="name" 
            type="text" 
            label="Full Name" 
            placeholder="John Doe" 
            required 
          />
          <Input 
            id="email" 
            name="email" 
            type="email" 
            label="Email" 
            placeholder="john@example.com" 
            required 
          />
          <Input 
            id="password" 
            name="password" 
            type="password" 
            label="Password" 
            placeholder="••••••••" 
            required 
          />
          
          {state?.error && (
            <div className={styles.errorAlert}>{state.error}</div>
          )}

          <Button type="submit" isLoading={isPending} className={styles.submitButton}>
            Create account
          </Button>
        </form>

        <div className={styles.footer}>
          Already have an account?{" "}
          <Link href="/login" className={styles.link}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
