"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useContextMenu, MenuItem } from '@/context/ContextMenuContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContextMenu() {
  const { isOpen, position, items, closeContextMenu } = useContextMenu();
  const menuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcut handler
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeItem = items.find(item => {
          // Rudimentary shortcut check - assumes single key shortcuts for now like 'E', 'Delete'
          // A more robust system would parse modifier keys.
          if (!item.shortcut) return false;
          if (item.shortcut === 'Del' && e.key === 'Delete') return true;
          return item.shortcut.toLowerCase() === e.key.toLowerCase();
      });

      if (activeItem) {
          e.preventDefault();
          activeItem.action();
          closeContextMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, items, closeContextMenu]);


  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", bounce: 0, duration: 0.2 }}
          className="fixed z-[100] min-w-[260px] overflow-hidden rounded-xl border border-white/50 bg-white/70 p-2 shadow-2xl backdrop-blur-2xl"
          style={{
            top: position.y,
            left: position.x,
            boxShadow: '0 20px 40px -4px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255,255,255,0.4) inset'
          }}
        >
          <div className="flex flex-col gap-1.5">
            {items.map((item, index) => {
              if (item.variant === 'separator') {
                return <div key={index} className="my-1.5 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />;
              }

              return (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    item.action();
                    closeContextMenu();
                  }}
                  disabled={item.disabled}
                  className={`
                    group flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-[15px] font-medium transition-all duration-200
                    ${item.variant === 'destructive' 
                      ? 'text-red-600 hover:bg-red-50/80 hover:text-red-700' 
                      : 'text-gray-700 hover:bg-white/60 hover:text-blue-600 hover:shadow-sm'
                    }
                    ${item.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center gap-3.5">
                    {item.icon && (
                      <span className={`transition-colors duration-200 ${item.variant === 'destructive' ? 'text-red-500' : 'text-gray-400 group-hover:text-blue-500'}`}>
                        {item.icon}
                      </span>
                    )}
                    <span>{item.label}</span>
                  </div>
                  {item.shortcut && (
                    <kbd className={`
                      ml-4 inline-flex h-6 items-center gap-1 rounded-[6px] border px-2 font-sans text-[11px] font-medium
                      ${item.variant === 'destructive' 
                         ? 'border-red-200 bg-red-50 text-red-600' 
                         : 'border-gray-200 bg-gray-50 text-gray-400 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-500'
                      }
                    `}>
                      {item.shortcut}
                    </kbd>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
