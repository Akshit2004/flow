"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, FileQuestion, Compass, Map, Search } from "lucide-react";
import Button from "@/components/ui/Button";

export default function NotFound() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const floatVariants = (delay: number) => ({
    animate: {
      y: [0, -20, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        repeatType: "reverse" as const, // Cast to specific string literal type
        ease: "easeInOut",
        delay: delay
      }
    }
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--background)] px-4">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, var(--text-main) 1px, transparent 0)",
          backgroundSize: "40px 40px"
        }}
        aria-hidden="true"
      />

      {/* Floating Background Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute left-[15%] top-[20%] text-[var(--primary)] opacity-10"
          variants={floatVariants(0)}
          animate="animate"
        >
          <Compass size={120} />
        </motion.div>
        
        <motion.div 
          className="absolute right-[15%] top-[25%] text-[var(--success)] opacity-10"
          variants={floatVariants(2)}
          animate="animate"
        >
          <Map size={100} />
        </motion.div>

        <motion.div 
          className="absolute left-[20%] bottom-[20%] text-[var(--warning)] opacity-10"
          variants={floatVariants(4)}
          animate="animate"
        >
          <FileQuestion size={90} />
        </motion.div>

        <motion.div 
          className="absolute right-[20%] bottom-[25%] text-[var(--info)] opacity-10"
          variants={floatVariants(1)}
          animate="animate"
        >
          <Search size={110} />
        </motion.div>
      </div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex max-w-lg flex-col items-center text-center"
      >
        <motion.h1 
          variants={itemVariants}
          className="mb-2 text-8xl font-black tracking-tighter sm:text-9xl"
          style={{
            background: "linear-gradient(135deg, var(--primary) 0%, var(--info) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          404
        </motion.h1>
        
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-2xl font-bold text-[var(--text-main)] sm:text-3xl">
            Lost in the Flow?
          </h2>
          <p className="text-lg text-[var(--text-secondary)]">
            It looks like this page has gone off-grid. Let's get you back on track to your projects.
          </p>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="mt-10"
        >
          <Link href="/">
            <Button size="lg" className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Home size={20} />
              Return to Dashboard
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
