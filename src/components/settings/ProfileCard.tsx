"use client";

import { useState } from "react";
import { updateProfile } from "@/actions/settings";
import styles from "./settings.module.css";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Camera, Check } from "lucide-react";

interface ProfileCardProps {
  user: {
    name: string;
    email: string;
  };
}

export default function ProfileCard({ user }: ProfileCardProps) {
  const [name, setName] = useState(user.name);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (name === user.name) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile({ name });
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.avatarWrapper}>
          <div className={styles.avatarLarge}>
            {user.name?.[0]?.toUpperCase() || "U"}
          </div>
          <button className={styles.avatarOverlay} title="Change avatar">
            <Camera size={20} />
          </button>
        </div>
        <div className={styles.profileInfo}>
          <div className={styles.name}>{user.name}</div>
          <div className={styles.email}>{user.email}</div>
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.editableField}>
          <Input
            label="Display Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setIsEditing(true);
            }}
          />
        </div>
        <Input label="Email Address" defaultValue={user.email} disabled />
      </div>

      {isEditing && (
        <div className={styles.actionRow}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setName(user.name);
              setIsEditing(false);
            }}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}

      {saved && (
        <div className={styles.savedMessage}>
          <Check size={16} />
          <span>Profile updated successfully</span>
        </div>
      )}
    </div>
  );
}
