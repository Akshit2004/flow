'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  confirmAction: (options: ConfirmOptions) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const confirmAction = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        options: {
          ...options,
          confirmText: options.confirmText || 'Confirm',
          cancelText: options.cancelText || 'Cancel',
          type: options.type || 'info'
        },
        resolve
      });
    });
  }, []);

  const handleConfirm = (value: boolean) => {
    if (confirmState) {
      confirmState.resolve(value);
      setConfirmState(null);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, confirmAction: confirmAction }}>
      {children}
      
      {/* Toasts Container */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        pointerEvents: 'none'
      }}>
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmState && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)'
          }} onClick={() => handleConfirm(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '400px',
                padding: '32px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid #F1F5F9'
              }}
            >
              <div style={{
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                 {confirmState.options.type === 'danger' ? (
                   <div style={{ padding: '10px', backgroundColor: '#FEF2F2', borderRadius: '12px' }}>
                     <AlertCircle size={24} color="#EF4444" />
                   </div>
                 ) : (
                   <div style={{ padding: '10px', backgroundColor: '#EFF6FF', borderRadius: '12px' }}>
                     <Info size={24} color="#3B82F6" />
                   </div>
                 )}
                 <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                      {confirmState.options.title}
                    </h3>
                 </div>
              </div>

              <p style={{ fontSize: '15px', color: '#64748B', lineHeight: '1.6', marginBottom: '32px' }}>
                {confirmState.options.message}
              </p>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => handleConfirm(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: 'white',
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  {confirmState.options.cancelText}
                </button>
                <button
                  onClick={() => handleConfirm(true)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: confirmState.options.type === 'danger' ? '#EF4444' : '#4F46E5',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: confirmState.options.type === 'danger' 
                      ? '0 4px 12px rgba(239, 68, 68, 0.2)' 
                      : '0 4px 12px rgba(79, 70, 229, 0.2)',
                  }}
                >
                  {confirmState.options.confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

const ToastItem: React.FC<{ toast: Toast, onRemove: () => void }> = ({ toast, onRemove }) => {
  const icons = {
    success: <CheckCircle2 size={20} color="#10B981" />,
    error: <AlertCircle size={20} color="#EF4444" />,
    warning: <AlertTriangle size={20} color="#F59E0B" />,
    info: <Info size={20} color="#3B82F6" />
  };

  const bgColors = {
    success: '#ECFDF5',
    error: '#FEF2F2',
    warning: '#FFFBEB',
    info: '#EFF6FF'
  };

  const borderColors = {
    success: '#10B98133',
    error: '#EF444433',
    warning: '#F59E0B33',
    info: '#3B82F633'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95, x: 20 }}
      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: 20 }}
      layout
      style={{
        backgroundColor: '#FFFFFF',
        border: `1px solid ${borderColors[toast.type]}`,
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        minWidth: '320px',
        maxWidth: '450px',
        pointerEvents: 'auto',
      }}
    >
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        backgroundColor: bgColors[toast.type],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {icons[toast.type]}
      </div>
      
      <div style={{ flex: 1, fontSize: '14px', fontWeight: '500', color: '#1F2937' }}>
        {toast.message}
      </div>

      <button
        onClick={onRemove}
        style={{
          padding: '4px',
          borderRadius: '6px',
          color: '#9CA3AF',
          cursor: 'pointer',
          border: 'none',
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};
