"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { Home, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gray-900" 
         style={{ fontFamily: 'var(--font-inter)' }}>
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" style={{ backgroundSize: '30px 30px' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto"
      >
        <div className="relative mb-8 group">
            <motion.div 
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-gray-700 shadow-2xl shadow-blue-900/20 group-hover:scale-105 transition-transform duration-300"
            >
                <AlertTriangle size={40} className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            </motion.div>
            
            {/* Floating particles suggestion */}
            <motion.div 
                animate={{ y: [-10, 10, -10] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-blue-500/20 blur-xl" 
            />
        </div>
        
        <h1 className="text-8xl md:text-9xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600">
          404
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-100">
          Page not found
        </h2>
        
        <p className="text-lg text-gray-400 mb-10 leading-relaxed max-w-md">
          The page you are looking for doesn&apos;t exist or is currently under construction.
        </p>

        <Link href="/">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button size="lg" className="h-14 px-10 rounded-full text-lg font-medium shadow-lg shadow-blue-600/25 border border-blue-500/50 bg-blue-600 hover:bg-blue-500 text-white transition-all">
              <Home size={20} className="mr-2" />
              Return Home
            </Button>
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
}
