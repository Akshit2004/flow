'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './CustomDropdown.module.css';

interface Option {
    label: string;
    value: string;
    color?: string;
}

interface CustomDropdownProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    label?: string;
}

export default function CustomDropdown({ options, value, onChange, label }: CustomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value) || options[0];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={styles.dropdownContainer} ref={containerRef}>
            {label && <label className={styles.label}>{label}</label>}
            <button
                type="button"
                className={`${styles.trigger} ${isOpen ? styles.active : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {selectedOption?.color && (
                        <div className={styles.dot} style={{ backgroundColor: selectedOption.color }} />
                    )}
                    <span>{selectedOption?.label}</span>
                </div>
                <ChevronDown size={16} className={styles.chevron} />
            </button>

            {isOpen && (
                <div className={styles.menu}>
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            className={`${styles.option} ${value === option.value ? styles.selected : ''}`}
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.color && (
                                <div className={styles.dot} style={{ backgroundColor: option.color }} />
                            )}
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
