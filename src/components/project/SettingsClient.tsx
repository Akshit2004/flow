'use client';

import styles from './SettingsClient.module.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    updateProjectDetails, 
    removeProjectMember, 
    updateProjectColumns,
    updateProjectLabels,
    deleteProject
} from '@/actions/project';
import { addProjectMember, revokeInvitation } from '@/actions/invite';
import Button from '@/components/ui/Button';
import { ArrowLeft, Trash2, Plus, X, Save, User as UserIcon, Tag, Columns, Mail } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';

interface ProjectSettingsProps {
    project: any;
    initialInvitations?: any[];
}

export default function SettingsClient({ project, initialInvitations = [] }: ProjectSettingsProps) {
    const router = useRouter();
    const { showToast, confirmAction } = useToast();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('general'); // general, members, columns, labels, danger

    const [invitations, setInvitations] = useState(initialInvitations);

    // General State
    const [name, setName] = useState(project.name || '');
    const [description, setDescription] = useState(project.description || '');
    const [key, setKey] = useState(project.key || '');

    // Members State
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('MEMBER');

    // Columns State
    const [columns, setColumns] = useState(project.columns || []);
    const [newColTitle, setNewColTitle] = useState('');

     // Labels State
     const [labels, setLabels] = useState(project.labels || []);
     const [newLabelName, setNewLabelName] = useState('');
     const [newLabelColor, setNewLabelColor] = useState('#2563EB');

    const handleUpdateDetails = async () => {
        setLoading(true);
        const res = await updateProjectDetails(project._id, { name, description, key });
        setLoading(false);
        if (res.error) showToast(res.error, 'error');
        else showToast('Project details updated successfully!', 'success');
    };

    const handleAddMember = async () => {
        if (!inviteEmail) return;
        setLoading(true);
        const res = await addProjectMember(project._id, inviteEmail, inviteRole);
        setLoading(false);
        if (res.error) showToast(res.error, 'error');
        else {
            setInviteEmail('');
            showToast('Invitation sent! Your colleague will receive an email shortly.', 'success');
            router.refresh(); 
        }
    };

    const handleRevokeInvite = async (id: string) => {
        const ok = await confirmAction({
            title: 'Revoke Invitation',
            message: 'Are you sure you want to revoke this invitation? The link will no longer work.',
            confirmText: 'Revoke',
            type: 'danger'
        });
        if (!ok) return;

        setLoading(true);
        const res = await revokeInvitation(id);
        setLoading(false);
        if (res.error) showToast(res.error, 'error');
        else {
            showToast('Invitation revoked.', 'success');
            router.refresh();
        }
    };

    const handleRemoveMember = async (userId: string) => {
        const ok = await confirmAction({
            title: 'Remove Member',
            message: 'Are you sure you want to remove this member from the project?',
            confirmText: 'Remove',
            type: 'danger'
        });
        if (!ok) return;

        setLoading(true);
        const res = await removeProjectMember(project._id, userId);
        setLoading(false);
        if (res.error) showToast(res.error, 'error');
        else {
            showToast('Member removed from project.', 'success');
            router.refresh();
        }
    };

    const handleUpdateColumns = async () => {
        setLoading(true);
        const res = await updateProjectColumns(project._id, columns);
        setLoading(false);
        if (res.error) showToast(res.error, 'error');
        else showToast('Columns updated successfully!', 'success');
    };

    const handleUpdateLabels = async () => {
        setLoading(true);
        const res = await updateProjectLabels(project._id, labels);
        setLoading(false);
        if (res.error) showToast(res.error, 'error');
        else showToast('Labels updated successfully!', 'success');
    };

    const handleDeleteProject = async () => {
        const confirmName = prompt(`To confirm, type "${project.name}"`);
        if (!confirmName) return;
        
        if (confirmName !== project.name) {
            showToast('Project name does not match. Deletion cancelled.', 'warning');
            return;
        }

        setLoading(true);
        const res = await deleteProject(project._id);
        if (res.error) {
            setLoading(false);
            showToast(res.error, 'error');
        } else {
            // Force full reload to ensure dashboard updates
            window.location.href = '/dashboard';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href={`/dashboard/project/${project._id}`} className={styles.backButton}>
                    <ArrowLeft size={20} />
                </Link>
                <h1 className={styles.title}>Project Settings</h1>
            </div>

            <div className={styles.layout}>
                {/* Sidebar Navigation */}
                <nav className={styles.sidebar}>
                    {[
                        { id: 'general', label: 'General', icon: Save },
                        { id: 'members', label: 'Team Members', icon: UserIcon },
                        { id: 'columns', label: 'Columns', icon: Columns },
                        { id: 'labels', label: 'Labels', icon: Tag },
                        { id: 'danger', label: 'Danger Zone', icon: Trash2, danger: true }
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`${styles.navItem} ${activeTab === item.id ? styles.activeNavItem : ''} ${item.danger ? styles.dangerNavItem : ''}`}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Content Area */}
                <div className={styles.content}>
                    
                    {/* General Section */}
                    {activeTab === 'general' && (
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h2 className={styles.cardTitle}>General Details</h2>
                                <p className={styles.cardDescription}>Manage basic project information.</p>
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Project Name</label>
                                    <input 
                                        value={name} onChange={e => setName(e.target.value)}
                                        className={styles.input}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Description</label>
                                    <textarea 
                                        value={description} onChange={e => setDescription(e.target.value)}
                                        className={styles.textarea}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Project Key (Prefix)</label>
                                    <div className="relative">
                                        <input 
                                            value={key} onChange={e => setKey(e.target.value.toUpperCase())}
                                            maxLength={6}
                                            className={`${styles.input} uppercase font-mono`}
                                            style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}
                                        />
                                        <div style={{ position: 'absolute', right: '12px', top: '10px', fontSize: '12px', color: '#9CA3AF' }}>MAX 6</div>
                                    </div>
                                    <p className={styles.helperText}>Used for task IDs (e.g., {key}-123).</p>
                                </div>
                                <div className={styles.actions}>
                                    <Button onClick={handleUpdateDetails} disabled={loading}>
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Members Section */}
                    {activeTab === 'members' && (
                         <div className={styles.card}>
                            <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 className={styles.cardTitle}>Team Members</h2>
                                    <p className={styles.cardDescription}>Manage who has access to this project.</p>
                                </div>
                                <span className={styles.count} style={{ background: '#DBEAFE', color: '#1D4ED8', padding: '2px 8px', borderRadius: '99px', fontSize: '12px', fontWeight: 'bold' }}>
                                    {project.members.length} Members
                                </span>
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.inviteRow}>
                                    <input 
                                        placeholder="colleague@example.com"
                                        value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                                        className={styles.input}
                                    />
                                    <select
                                        value={inviteRole}
                                        onChange={e => setInviteRole(e.target.value)}
                                        className={styles.input}
                                        style={{ width: 'auto' }}
                                    >
                                        <option value="MEMBER">Member</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                    <Button onClick={handleAddMember} disabled={loading || !inviteEmail}>
                                        <Plus size={16} className="mr-2" /> Invite
                                    </Button>
                                </div>
                                <div className={styles.memberList}>
                                    {project.members.map((member: any) => (
                                        <div key={member._id} className={styles.memberItem}>
                                            <div className={styles.memberInfo}>
                                                <div className={styles.avatar}>
                                                    {member.avatar ? <img src={member.avatar} alt={member.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : member.name[0]}
                                                </div>
                                                <div>
                                                    <div className={styles.memberName}>{member.name}</div>
                                                    <div className={styles.memberEmail}>{member.email}</div>
                                                </div>
                                                {project.owner && project.owner._id === member._id && (
                                                     <span className={styles.badge}>OWNER</span>
                                                 )}
                                                 {project.owner?._id !== member._id && member.role === 'ADMIN' && (
                                                     <span className={styles.badge} style={{ background: '#DCFCE7', color: '#166534' }}>ADMIN</span>
                                                 )}
                                                 {project.owner?._id !== member._id && member.role === 'MEMBER' && (
                                                     <span className={styles.badge} style={{ background: '#F3F4F6', color: '#374151' }}>MEMBER</span>
                                                 )}
                                            </div>
                                            {(!project.owner || project.owner._id !== member._id) && (
                                                <button onClick={() => handleRemoveMember(member._id)} className={styles.removeButton}>
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {invitations.length > 0 && (
                                    <div className={styles.invitationSection}>
                                        <h3 className={styles.sectionSubtitle}>Pending Invitations</h3>
                                        <div className={styles.memberList}>
                                            {invitations.map((invite: any) => (
                                                <div key={invite._id} className={styles.memberItem}>
                                                    <div className={styles.memberInfo}>
                                                        <div className={styles.avatar} style={{ background: '#F3F4F6', color: '#6B7280' }}>
                                                            <Mail size={16} />
                                                        </div>
                                                        <div>
                                                            <div className={styles.memberName}>{invite.email}</div>
                                                            <div className={styles.memberEmail}>Expires: {new Date(invite.expiresAt).toLocaleDateString()}</div>
                                                        </div>
                                                        <span className={styles.badge} style={{ background: '#FEF3C7', color: '#92400E' }}>PENDING</span>
                                                    </div>
                                                    <button onClick={() => handleRevokeInvite(invite._id)} className={styles.removeButton} title="Revoke Invitation">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                         </div>
                    )}

                    {/* Columns Section */}
                    {activeTab === 'columns' && (
                        <div className={styles.card}>
                             <div className={styles.cardHeader}>
                                <h2 className={styles.cardTitle}>Board Columns</h2>
                                <p className={styles.cardDescription}>Customize your workflow stages.</p>
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.memberList}>
                                    {columns.map((col: any, idx: number) => (
                                        <div key={col.id} className={styles.columnItem}>
                                            <div className={styles.colIndex}>{idx + 1}</div>
                                            <input 
                                                value={col.title}
                                                onChange={e => {
                                                    const newCols = [...columns];
                                                    newCols[idx].title = e.target.value;
                                                    setColumns(newCols);
                                                }}
                                                className={styles.colInput}
                                            />
                                            <button 
                                                onClick={() => {
                                                    const newCols = columns.filter((_: any, i: number) => i !== idx);
                                                    setColumns(newCols);
                                                }}
                                                className={styles.deleteIcon}
                                                disabled={columns.length <= 1}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className={styles.inviteRow}>
                                    <input 
                                        placeholder="New Column (e.g. Review)"
                                        value={newColTitle} onChange={e => setNewColTitle(e.target.value)}
                                        className={styles.input}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && newColTitle) {
                                                setColumns([...columns, { id: newColTitle.toUpperCase().replace(/\s+/g, '_'), title: newColTitle, order: columns.length }]);
                                                setNewColTitle('');
                                            }
                                        }}
                                    />
                                    <Button onClick={() => {
                                        if (newColTitle) {
                                            setColumns([...columns, { id: newColTitle.toUpperCase().replace(/\s+/g, '_'), title: newColTitle, order: columns.length }]);
                                            setNewColTitle('');
                                        }
                                    }} variant="secondary">
                                        Add
                                    </Button>
                                </div>
                                <div className={styles.actions}>
                                     <Button onClick={handleUpdateColumns} disabled={loading}>Save Workflow</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Labels Section */}
                    {activeTab === 'labels' && (
                         <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h2 className={styles.cardTitle}>Task Labels</h2>
                                <p className={styles.cardDescription}>Categorize tasks with color-coded tags.</p>
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.labelsContainer}>
                                    {labels.map((label: any, idx: number) => (
                                         <div key={idx} className={styles.labelTag} style={{ backgroundColor: label.color + '20', color: label.color, borderColor: label.color + '40' }}>
                                            <span>{label.name}</span>
                                            <button onClick={() => setLabels(labels.filter((_: any, i: number) => i !== idx))} style={{ color: 'inherit' }}><X size={12} /></button>
                                         </div>
                                    ))}
                                    {labels.length === 0 && <div className={styles.helperText}>No labels created yet.</div>}
                                </div>
                                <div className={styles.inviteRow}>
                                    <div className={styles.colorPickerWrapper}>
                                        <input 
                                            type="color" 
                                            value={newLabelColor}
                                            onChange={e => setNewLabelColor(e.target.value)}
                                            className={styles.colorInput}
                                        />
                                    </div>
                                    <input 
                                        placeholder="Label Name (e.g. Bug)"
                                        value={newLabelName} onChange={e => setNewLabelName(e.target.value)}
                                        className={styles.input}
                                    />
                                    <Button onClick={() => {
                                        if (newLabelName) {
                                            setLabels([...labels, { id: crypto.randomUUID(), name: newLabelName, color: newLabelColor }]);
                                            setNewLabelName('');
                                        }
                                    }} variant="secondary">Add Label</Button>
                                </div>
                                 <div className={styles.actions}>
                                     <Button onClick={handleUpdateLabels} disabled={loading}>Save Labels</Button>
                                </div>
                            </div>
                         </div>
                    )}

                    {/* Danger Zone */}
                    {activeTab === 'danger' && (
                        <div className={styles.dangerCard}>
                            <div className={styles.dangerHeader}>
                                <h2 className={styles.dangerTitle}>Danger Zone</h2>
                                <p className={styles.dangerDesc}>Irreversible actions for this project.</p>
                            </div>
                            <div className={styles.dangerAction}>
                                <div>
                                    <div style={{ fontWeight: 500, color: '#111827' }}>Delete this project</div>
                                    <div style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.25rem' }}>Once you delete a project, there is no going back. Please be certain.</div>
                                </div>
                                <Button variant="ghost" className={styles.deleteButton} onClick={handleDeleteProject}>
                                    Delete Project
                                </Button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
