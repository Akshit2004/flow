"use client";

import { useActionState, useState } from "react";
import { changePassword } from "@/actions/settings";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import styles from "./settings.module.css";
import clsx from "clsx";

const initialState = {
  error: "",
  success: "",
};

function getPasswordStrength(
  password: string
): "weak" | "medium" | "strong" | null {
  if (!password) return null;

  const hasLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const score = [
    hasLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
  ].filter(Boolean).length;

  if (score <= 2) return "weak";
  if (score <= 3) return "medium";
  return "strong";
}

export default function SecurityCard() {
  // @ts-ignore
  const [state, formAction, isPending] = useActionState(
    changePassword,
    initialState
  );
  const [newPassword, setNewPassword] = useState("");
  const strength = getPasswordStrength(newPassword);

  const strengthLabels = {
    weak: "Weak - Add more characters and variety",
    medium: "Medium - Consider adding special characters",
    strong: "Strong password",
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Change Password</h3>
      <form action={formAction} className={styles.formStack}>
        <Input
          name="currentPassword"
          type="password"
          label="Current Password"
          required
        />
        <div className={styles.fieldGroup}>
          <div>
            <Input
              name="newPassword"
              type="password"
              label="New Password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            {strength && (
              <>
                <div className={styles.strengthBar}>
                  <div
                    className={clsx(styles.strengthFill, styles[strength])}
                  />
                </div>
                <p className={clsx(styles.strengthText, styles[strength])}>
                  {strengthLabels[strength]}
                </p>
              </>
            )}
          </div>
          <Input
            name="confirmPassword"
            type="password"
            label="Confirm New Password"
            required
          />
        </div>

        {state?.error && <p className={styles.errorText}>{state.error}</p>}
        {state?.success && (
          <p className={styles.successText}>{state.success}</p>
        )}

        <div className={styles.actionRow}>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </form>
    </div>
  );
}
