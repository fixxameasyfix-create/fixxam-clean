import React, {
  memo,
  useCallback,
  useState,
} from "react";

import AppInput from "@/components/ui/AppInput";

import type { FixxamRole } from "@/theme";

export interface PasswordFieldProps {
  placeholder: string;

  value: string;

  onChangeText: (value: string) => void;

  role?: FixxamRole;

  /*
   * Legacy support.
   */
  variant?: "customer" | "worker";

  label?: string;

  error?: string;

  helperText?: string;

  required?: boolean;

  disabled?: boolean;

  /*
   * Use "new-password" during signup/reset.
   * Default is current password/login.
   */
  mode?: "current" | "new";
}

function PasswordField({
  placeholder,
  value,
  onChangeText,

  role = "customer",
  variant,

  label,
  error,
  helperText,
  required = false,

  disabled = false,

  mode = "current",
}: PasswordFieldProps) {
  const [secure, setSecure] =
    useState(true);

  const resolvedRole: FixxamRole =
    variant ?? role;

  const toggleVisibility =
    useCallback(() => {
      setSecure((current) => !current);
    }, []);

  return (
    <AppInput
      role={resolvedRole}
      label={label}
      error={error}
      helperText={helperText}
      required={required}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      editable={!disabled}
      secureTextEntry={secure}
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete={
        mode === "new"
          ? "new-password"
          : "current-password"
      }
      textContentType={
        mode === "new"
          ? "newPassword"
          : "password"
      }
      rightIconName={
        secure
          ? "eye-off"
          : "eye"
      }
      rightIconAccessibilityLabel={
        secure
          ? "Show password"
          : "Hide password"
      }
      onRightIconPress={
        disabled
          ? undefined
          : toggleVisibility
      }
    />
  );
}

export default memo(PasswordField);