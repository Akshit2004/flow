'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, X, Bell } from 'lucide-react';
import { acceptInvitation, declineInvitation } from '@/actions/invite';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import styles from './PendingInvites.module.css';

interface Invitation {
    _id: string;
    projectName: string;
    inviterName: string;
    token: string;
    expiresAt: string;
}

interface PendingInvitesProps {
    initialInvites: Invitation[];
}

export default function PendingInvites({ initialInvites }: PendingInvitesProps) {
    const [invites, setInvites] = useState(initialInvites);
    const [processing, setProcessing] = useState<string | null>(null);
    const { showToast, confirmAction } = useToast();
    const router = useRouter();

    if (invites.length === 0) return null;

    const handleAccept = async (token: string, id: string) => {
        setProcessing(id);
        const res = await acceptInvitation(token);
        setProcessing(null);

        if (res.error) {
            showToast(res.error, 'error');
        } else {
            showToast('Welcome to the project!', 'success');
            setInvites(prev => prev.filter(i => i._id !== id));
            router.refresh();
        }
    };

    const handleDecline = async (id: string, projectName: string) => {
        const ok = await confirmAction({
            title: 'Decline Invitation',
            message: `Are you sure you want to decline the invitation for "${projectName}"?`,
            confirmText: 'Decline',
            type: 'danger'
        });

        if (!ok) return;

        setProcessing(id);
        const res = await declineInvitation(id);
        setProcessing(null);

        if (res.error) {
            showToast(res.error, 'error');
        } else {
            showToast('Invitation declined.', 'info');
            setInvites(prev => prev.filter(i => i._id !== id));
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Bell size={18} className={styles.bellIcon} />
                <h3 className={styles.title}>Pending Invitations ({invites.length})</h3>
            </div>
            
            <div className={styles.grid}>
                <AnimatePresence mode="popLayout">
                    {invites.map((invite) => (
                        <motion.div
                            key={invite._id}
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, x: -20 }}
                            layout
                            className={styles.card}
                        >
                            <div className={styles.info}>
                                <div className={styles.avatar}>
                                    <Mail size={16} />
                                </div>
                                <div className={styles.text}>
                                    <p className={styles.message}>
                                        <strong>{invite.inviterName}</strong> invited you to join <strong>{invite.projectName}</strong>
                                    </p>
                                    <p className={styles.expiry}>
                                        Expires on {new Date(invite.expiresAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            
                            <div className={styles.actions}>
                                <button 
                                    className={styles.acceptBtn}
                                    onClick={() => handleAccept(invite.token, invite._id)}
                                    disabled={!!processing}
                                >
                                    {processing === invite._id ? '...' : <Check size={18} />}
                                    <span>Accept</span>
                                </button>
                                <button 
                                    className={styles.declineBtn}
                                    onClick={() => handleDecline(invite._id, invite.projectName)}
                                    disabled={!!processing}
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
