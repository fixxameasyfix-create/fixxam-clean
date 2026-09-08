import React, { memo } from "react";
import {
  StyleSheet,
  View,
} from "react-native";

import AppButton from "@/components/ui/AppButton";
import AppIcon from "@/components/ui/AppIcon";
import type { AppIconName } from "@/components/ui/AppIcon";
import AppModal from "@/components/ui/AppModal";
import AppText from "@/components/ui/AppText";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
  WorkerColors,
  type FixxamRole,
} from "@/theme";

type DialogTone =
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "error";

export interface AppDialogProps {
  visible: boolean;

  title: string;

  message: string;

  role?: FixxamRole;

  tone?: DialogTone;

  icon?: AppIconName;

  confirmText?: string;

  cancelText?: string;

  loading?: boolean;

  confirmDisabled?: boolean;

  dismissOnBackdrop?: boolean;

  onConfirm: () => void;

  onCancel: () => void;
}

function AppDialog({
  visible,
  title,
  message,

  role = "customer",
  tone = "primary",
  icon,

  confirmText = "Confirm",
  cancelText = "Cancel",

  loading = false,
  confirmDisabled = false,

  dismissOnBackdrop = false,

  onConfirm,
  onCancel,
}: AppDialogProps) {
  const roleColors =
    role === "worker"
      ? WorkerColors
      : CustomerColors;

  const palette = {
    primary: {
      color: roleColors.primary,
      background: roleColors.primarySoft,
      icon: "help" as AppIconName,
    },

    info: {
      color: Colors.info,
      background: Colors.infoSoft,
      icon: "info" as AppIconName,
    },

    success: {
      color: Colors.success,
      background: Colors.successSoft,
      icon: "success" as AppIconName,
    },

    warning: {
      color: Colors.warning,
      background: Colors.warningSoft,
      icon: "warning" as AppIconName,
    },

    error: {
      color: Colors.error,
      background: Colors.errorSoft,
      icon: "error" as AppIconName,
    },
  } as const;

  const current = palette[tone];

  const resolvedIcon =
    icon ?? current.icon;

  return (
    <AppModal
      visible={visible}
      role={role}
      onClose={onCancel}
      dismissOnBackdrop={
        dismissOnBackdrop
      }
      cardStyle={styles.card}
    >
      <View
        accessibilityViewIsModal
        style={styles.content}
      >
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor:
                current.background,
            },
          ]}
        >
          <AppIcon
            name={resolvedIcon}
            role={role}
            size="lg"
            color={current.color}
            strokeWidth="medium"
          />
        </View>

        <AppText
          variant="heading3"
          center
          style={styles.title}
        >
          {title}
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={styles.message}
        >
          {message}
        </AppText>

        <View style={styles.actions}>
          <AppButton
            title={cancelText}
            role={role}
            variant="outline"
            disabled={loading}
            onPress={onCancel}
            style={styles.action}
          />

          <AppButton
            title={confirmText}
            role={role}
            variant={
              tone === "error"
                ? "danger"
                : "primary"
            }
            loading={loading}
            disabled={
              confirmDisabled
            }
            onPress={onConfirm}
            style={styles.action}
          />
        </View>
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  card: {
    maxWidth: 380,

    padding:
      FixxamTokens.spacing.xl,
  },

  content: {
    width: "100%",

    alignItems: "center",
  },

  iconBox: {
    width: 56,
    height: 56,

    alignItems: "center",
    justifyContent: "center",

    borderRadius:
      FixxamTokens.radius.lg,
  },

  title: {
    marginTop:
      FixxamTokens.spacing.lg,

    maxWidth: 310,
  },

  message: {
    marginTop:
      FixxamTokens.spacing.sm,

    maxWidth: 320,
  },

  actions: {
    width: "100%",

    flexDirection: "row",

    gap:
      FixxamTokens.spacing.sm,

    marginTop:
      FixxamTokens.spacing.xxl,
  },

  action: {
    flex: 1,
  },
});

export default memo(AppDialog);