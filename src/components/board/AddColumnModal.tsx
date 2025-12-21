'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './AddColumnModal.module.css';

interface AddColumnModalProps {
    onClose: () => void;
    onAdd: (title: string) => Promise<void>;
}

export default function AddColumnModal({ onClose, onAdd }: AddColumnModalProps) {
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        try {
            await onAdd(title);
            onClose();
        } catch (error) {
            console.error('Failed to add column', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Add New Column</h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={styles.form}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Column Title</label>
                            <input 
                                autoFocus
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Review, QA, Deployment"
                                className={styles.input}
                                maxLength={30}
                            />
                        </div>
                    </div>
                    <div className={styles.footer}>
                        <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!title.trim() || loading}>
                            {loading ? 'Adding...' : 'Add Column'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
