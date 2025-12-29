"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  shortcut?: string;
  variant?: 'default' | 'destructive' | 'separator';
  disabled?: boolean;
}

interface ContextMenuState {
  isOpen: boolean;
  position: { x: number; y: number };
  items: MenuItem[];
  targetId: string | null;
}

interface ContextMenuContextType extends ContextMenuState {
  showContextMenu: (event: React.MouseEvent, items: MenuItem[], targetId?: string) => void;
  closeContextMenu: () => void;
}

const ContextMenuContext = createContext<ContextMenuContextType | undefined>(undefined);

export function ContextMenuProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ContextMenuState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    items: [],
    targetId: null,
  });

  const showContextMenu = (event: React.MouseEvent, items: MenuItem[], targetId: string | null = null) => {
    event.preventDefault();
    setState({
      isOpen: true,
      position: { x: event.clientX, y: event.clientY },
      items,
      targetId,
    });
  };

  const closeContextMenu = () => {
    setState((prev) => ({ ...prev, isOpen: false }));
  };

  // Close on click outside
  useEffect(() => {
    const handleClick = () => {
      if (state.isOpen) closeContextMenu();
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [state.isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.isOpen) {
        closeContextMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isOpen]);

  return (
    <ContextMenuContext.Provider value={{ ...state, showContextMenu, closeContextMenu }}>
      {children}
    </ContextMenuContext.Provider>
  );
}

export function useContextMenu() {
  const context = useContext(ContextMenuContext);
  if (context === undefined) {
    throw new Error('useContextMenu must be used within a ContextMenuProvider');
  }
  return context;
}
