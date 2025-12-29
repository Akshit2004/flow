"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";
import Image from "next/image";
import styles from "./auth.module.css";

const initialState = {
  error: "",
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Image src="/logo.svg" alt="Flow" width={48} height={48} />
          </div>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Sign in to your account</p>
        </div>
        
        <form action={formAction} className={styles.form}>
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
            Sign in
          </Button>
        </form>

        <div className={styles.footer}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className={styles.link}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
