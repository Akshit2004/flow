"use client";

import Button from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Layout, Zap, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="landing-page" style={{ minHeight: '100vh', backgroundColor: 'var(--background)', color: 'var(--text-main)', fontFamily: 'var(--font-inter)' }}>
      {/* Navbar with Glassmorphism */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '1rem 2rem', 
          maxWidth: '1200px', 
          margin: '0 auto',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'var(--navbar-bg)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '1.25rem' }}>
          <div style={{ 
              width: '24px', 
              height: '24px', 
              background: 'linear-gradient(135deg, #2563EB, #4F46E5)', 
              borderRadius: '6px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white',
              fontSize: '14px',
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)'
          }}>F</div>
          Flow
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button>Sign up</Button>
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center', 
          padding: '5rem 1.5rem', 
          maxWidth: '1200px', 
          margin: '0 auto',
          position: 'relative',
          overflow: 'hidden'
      }}>
        {/* Background Gradients */}
        <div style={{ 
            position: 'absolute', 
            top: '-20%', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            width: '800px', 
            height: '800px', 
            background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)', 
            zIndex: -1,
            pointerEvents: 'none'
        }} />

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           style={{ 
            backgroundColor: 'rgba(37, 99, 235, 0.1)', 
            color: 'var(--primary)', 
            border: '1px solid rgba(37, 99, 235, 0.2)',
            padding: '0.25rem 0.75rem', 
            borderRadius: '999px', 
            fontSize: '0.875rem', 
            fontWeight: '600', 
            marginBottom: '1.5rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backdropFilter: 'blur(4px)'
        }}>
          <Star size={12} fill="currentColor" />
          The new standard for project management
        </motion.div>

        <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ 
            fontSize: 'clamp(3rem, 6vw, 5rem)', 
            fontWeight: '800', 
            letterSpacing: '-0.04em', 
            lineHeight: '1.05', 
            marginBottom: '1.5rem', 
            color: 'var(--text-main)'
        }}>
          Linear flow. <br />
          <span style={{ 
              background: 'linear-gradient(to right, #2563EB, #4F46E5)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
          }}>Exponential speed.</span>
        </motion.h1>

        <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ 
            fontSize: '1.25rem', 
            color: 'var(--text-secondary)', 
            maxWidth: '580px', 
            marginBottom: '3rem', 
            lineHeight: '1.6' 
        }}>
          Every detail designed for speed. Plan sprints, track progress, 
          and ship with a tool that feels like an extension of your mind.
        </motion.p>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}
        >
          <Link href="/signup">
            <Button size="lg" style={{ 
                borderRadius: '999px', 
                paddingLeft: '2.5rem', 
                paddingRight: '2.5rem',
                fontSize: '1rem',
                boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)'
            }}>
              Start building <ArrowRight size={18} style={{ marginLeft: '8px' }} />
            </Button>
          </Link>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
             No credit card required
          </div>
        </motion.div>

        {/* Visual Showcase (Abstract Board) */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 100 }}
            style={{ 
                width: '100%', 
                maxWidth: '900px', 
                height: '400px', 
                background: 'linear-gradient(180deg, var(--background) 0%, var(--surface) 100%)', 
                border: '1px solid var(--border)',
                borderRadius: '16px',
                marginTop: '5rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            {/* Sidebar Mock */}
            <div style={{ width: '200px', borderRight: '1px solid var(--border)', padding: '1.5rem' }}>
                <div style={{ width: '80%', height: '12px', background: 'var(--border)', borderRadius: '4px', marginBottom: '2rem' }} />
                <div style={{ width: '100%', height: '8px', background: 'var(--border-hover)', borderRadius: '4px', marginBottom: '1rem' }} />
                <div style={{ width: '100%', height: '8px', background: 'var(--border-hover)', borderRadius: '4px', marginBottom: '1rem' }} />
                <div style={{ width: '60%', height: '8px', background: 'var(--border-hover)', borderRadius: '4px', marginBottom: '1rem' }} />
            </div>
            {/* Board Mock */}
            <div style={{ flex: 1, padding: '1.5rem', display: 'flex', gap: '1.5rem', backgroundColor: 'var(--background)' }}>
                 {['To Do', 'In Progress', 'Done'].map((col, i) => (
                     <div key={col} style={{ flex: 1 }}>
                         <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '1rem' }}>{col}</div>
                         <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8 + (i * 0.1) }}
                            style={{ 
                                background: 'var(--surface)', 
                                padding: '1rem', 
                                borderRadius: '8px', 
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                marginBottom: '0.75rem',
                                border: '1px solid var(--border)'
                            }}
                         >
                            <div style={{ width: '70%', height: '8px', background: 'var(--border)', borderRadius: '4px', marginBottom: '0.5rem' }} />
                            <div style={{ width: '40%', height: '6px', background: 'var(--background)', borderRadius: '4px' }} />
                         </motion.div>
                         {i === 1 && (
                             <motion.div 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1 }}
                                style={{ 
                                    background: 'var(--surface)', 
                                    padding: '1rem', 
                                    borderRadius: '8px', 
                                    boxShadow: '0 4px 6px -1px rgba(37,99,235,0.1)',
                                    marginBottom: '0.75rem',
                                    border: '1px solid #BFDBFE'
                                }}
                             >
                                <div style={{ width: '80%', height: '8px', background: '#DBEAFE', borderRadius: '4px', marginBottom: '0.5rem' }} />
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#BFDBFE' }} />
                                </div>
                             </motion.div>
                         )}
                     </div>
                 ))}
            </div>
        </motion.div>
      </main>

    </div>
  );
}
