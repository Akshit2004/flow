"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { filterUsersForMention } from '@/lib/mentions';
import styles from './MentionInput.module.css';

interface User {
    _id: string;
    name: string;
    avatar?: string;
}

interface MentionInputProps {
    value: string;
    onChange: (value: string) => void;
    users: User[];
    placeholder?: string;
    onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    className?: string;
}

export default function MentionInput({ 
    value, 
    onChange, 
    users, 
    placeholder = "Add a comment...",
    onKeyDown,
    className
}: MentionInputProps) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionStart, setMentionStart] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const filteredUsers = filterUsersForMention(users, mentionQuery);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        const cursorPos = e.target.selectionStart || 0;
        
        onChange(newValue);

        // Check if we're typing a mention
        const textBeforeCursor = newValue.slice(0, cursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        
        if (lastAtIndex !== -1) {
            const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
            // Check if there's a space before @ or @ is at start
            const charBeforeAt = lastAtIndex > 0 ? newValue[lastAtIndex - 1] : ' ';
            
            if ((charBeforeAt === ' ' || charBeforeAt === '\n' || lastAtIndex === 0) && 
                !textAfterAt.includes(' ')) {
                setMentionStart(lastAtIndex);
                setMentionQuery(textAfterAt);
                setShowDropdown(true);
                setActiveIndex(0);
                return;
            }
        }
        
        setShowDropdown(false);
        setMentionStart(null);
        setMentionQuery('');
    };

    const insertMention = useCallback((user: User) => {
        if (mentionStart === null) return;
        
        const beforeMention = value.slice(0, mentionStart);
        const afterMention = value.slice(mentionStart + 1 + mentionQuery.length);
        const mentionText = `@${user.name.replace(/\s+/g, '')} `;
        
        const newValue = beforeMention + mentionText + afterMention;
        onChange(newValue);
        
        setShowDropdown(false);
        setMentionStart(null);
        setMentionQuery('');
        
        // Focus and set cursor after mention
        setTimeout(() => {
            if (textareaRef.current) {
                const newCursorPos = beforeMention.length + mentionText.length;
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    }, [mentionStart, mentionQuery, value, onChange]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showDropdown && filteredUsers.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(prev => (prev + 1) % filteredUsers.length);
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(prev => (prev - 1 + filteredUsers.length) % filteredUsers.length);
                return;
            }
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                insertMention(filteredUsers[activeIndex]);
                return;
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                setShowDropdown(false);
                return;
            }
        }
        
        // Forward other key events
        onKeyDown?.(e);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (textareaRef.current && !textareaRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={styles.container}>
            <textarea
                ref={textareaRef}
                className={`${styles.textarea} ${className || ''}`}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
            />
            
            {showDropdown && (
                <div className={styles.dropdown}>
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user, index) => (
                            <div
                                key={user._id}
                                className={`${styles.dropdownItem} ${index === activeIndex ? styles.active : ''}`}
                                onClick={() => insertMention(user)}
                                onMouseEnter={() => setActiveIndex(index)}
                            >
                                <div className={styles.avatar}>
                                    {user.name[0]?.toUpperCase()}
                                </div>
                                <span className={styles.userName}>{user.name}</span>
                            </div>
                        ))
                    ) : (
                        <div className={styles.noResults}>No users found</div>
                    )}
                </div>
            )}
        </div>
    );
}
