import React, { memo } from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import AppIcon from "@/components/ui/AppIcon";
import AppText from "@/components/ui/AppText";

import {
  FixxamTokens,
  type FixxamRole,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  title: string;
  subtitle: string;

  icon?: string;

  role?: FixxamRole;

  // Legacy support
  variant?: "customer" | "worker";

  /**
   * Controls whether the illustration/avatar is displayed.
   *
   * Default: true
   */
  showIllustration?: boolean;
};

/* ============================================================
   HEADER ILLUSTRATION
============================================================ */

function HeaderIllustration({
  icon,
  role,
}: {
  icon: string;
  role: FixxamRole;
}) {
  /* ============================================================
     EMAIL
  ============================================================ */

  if (icon === "mail") {
    return (
      <View style={styles.illustration}>
        <View style={styles.mailCircle}>
          <AppIcon
            name="mail"
            role={role}
            state="active"
            size="xl"
          />
        </View>

        <View style={styles.mailBadge}>
          <AppText
            variant="caption"
            weight="bold"
            style={styles.badgeText}
          >
            @
          </AppText>
        </View>
      </View>
    );
  }

  /* ============================================================
     PASSWORD
  ============================================================ */

  if (icon === "lock") {
    return (
      <View style={styles.illustration}>
        <View style={styles.lockBox}>
          <AppIcon
            name="lock"
            role={role}
            state="active"
            size="lg"
          />
        </View>

        <View style={styles.lockBadge}>
          <AppIcon
            name="check"
            role={role}
            state="success"
            size="sm"
          />
        </View>
      </View>
    );
  }

  /* ============================================================
     PROFILE
  ============================================================ */

  if (icon === "person") {
    return (
      <View style={styles.illustration}>
        <View style={styles.personCircle}>
          <AppIcon
            name="profile"
            role={role}
            state="active"
            size="xl"
          />
        </View>

        <View style={styles.cameraBadge}>
          <AppIcon
            name="camera"
            role={role}
            state="active"
            size="sm"
          />
        </View>
      </View>
    );
  }

  /* ============================================================
     SUCCESS
  ============================================================ */

  if (icon === "checkmark-circle") {
    return (
      <View style={styles.illustration}>
        <View style={styles.successCircle}>
          <AppIcon
            name="success"
            role={role}
            state="success"
            size="xl"
          />
        </View>
      </View>
    );
  }

  /* ============================================================
     RESUME REGISTRATION
  ============================================================ */

  if (icon === "refresh") {
    return (
      <View style={styles.illustration}>
        <View style={styles.resumeCircle}>
          <AppIcon
            name="refresh"
            role={role}
            state="success"
            size="xl"
          />

          <View style={styles.resumeClock}>
            <AppIcon
              name="clock"
              role={role}
              state="success"
              size="sm"
            />
          </View>
        </View>
      </View>
    );
  }

  /* ============================================================
     DEFAULT
  ============================================================ */

  return (
    <View style={styles.illustration}>
      <View style={styles.defaultCircle}>
        <AppIcon
          name={icon}
          role={role}
          state="active"
          size="xl"
        />
      </View>
    </View>
  );
}

/* ============================================================
   AUTH HEADER
============================================================ */

function AuthHeader({
  title,
  subtitle,
  icon = "profile",
  role = "customer",
  variant,
  showIllustration = true,
}: Props) {
  const resolvedRole: FixxamRole =
    variant ?? role;

  return (
    <View
      style={[
        styles.container,
        !showIllustration &&
          styles.containerWithoutIllustration,
      ]}
    >
      {/* ======================================================
          OPTIONAL ILLUSTRATION
          
          Step 4 can disable this so the profile avatar
          does not appear twice.
      ====================================================== */}

      {showIllustration && (
        <HeaderIllustration
          icon={icon}
          role={resolvedRole}
        />
      )}

      {/* ======================================================
          TITLE
      ====================================================== */}

      <AppText
        variant="heading1"
        center
        weight="bold"
        style={styles.title}
      >
        {title}
      </AppText>

      {/* ======================================================
          SUBTITLE
      ====================================================== */}

      <AppText
        variant="body"
        tone="secondary"
        center
        style={styles.subtitle}
      >
        {subtitle}
      </AppText>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      alignItems: "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.lg,
    },

    /*
     * When the illustration is disabled, reduce the
     * vertical space so the title moves naturally upward.
     */
    containerWithoutIllustration: {
      paddingTop:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       ILLUSTRATION
    ======================================================== */

    illustration: {
      width: 84,
      height: 84,

      alignItems: "center",
      justifyContent: "center",

      position: "relative",

      marginBottom:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       EMAIL
    ======================================================== */

    mailCircle: {
      width: 72,
      height: 72,

      borderRadius: 36,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "#EEF6FF",
    },

    mailBadge: {
      position: "absolute",

      right: 0,
      bottom: 2,

      width: 30,
      height: 30,

      borderRadius: 15,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "#22C55E",

      borderWidth: 3,
      borderColor: "#FFFFFF",
    },

    badgeText: {
      color: "#FFFFFF",
    },

    /* ========================================================
       PASSWORD
    ======================================================== */

    lockBox: {
      width: 64,
      height: 64,

      borderRadius: 18,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "#2F80ED",
    },

    lockBadge: {
      position: "absolute",

      right: 2,
      bottom: 2,

      width: 28,
      height: 28,

      borderRadius: 14,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "#DCFCE7",

      borderWidth: 3,
      borderColor: "#FFFFFF",
    },

    /* ========================================================
       PROFILE
    ======================================================== */

    personCircle: {
      width: 72,
      height: 72,

      borderRadius: 36,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "#EEF6FF",
    },

    cameraBadge: {
      position: "absolute",

      right: 0,
      bottom: 0,

      width: 30,
      height: 30,

      borderRadius: 15,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "#2F80ED",

      borderWidth: 3,
      borderColor: "#FFFFFF",
    },

    /* ========================================================
       SUCCESS
    ======================================================== */

    successCircle: {
      width: 72,
      height: 72,

      borderRadius: 36,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "#DCFCE7",
    },

    /* ========================================================
       RESUME REGISTRATION
    ======================================================== */

    resumeCircle: {
      width: 72,
      height: 72,

      borderRadius: 36,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "#F0FBF6",

      position: "relative",
    },

    resumeClock: {
      position: "absolute",

      right: 3,
      bottom: 4,

      width: 24,
      height: 24,

      borderRadius: 12,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "#FFFFFF",

      borderWidth: 2,

      borderColor:
        "#43B982",
    },

    /* ========================================================
       DEFAULT
    ======================================================== */

    defaultCircle: {
      width: 72,
      height: 72,

      borderRadius: 36,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "#EEF6FF",
    },

    /* ========================================================
       TEXT
    ======================================================== */

    title: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xs,

      marginBottom:
        FixxamTokens.spacing.xs,
    },

    subtitle: {
      width: "100%",

      maxWidth: 340,

      lineHeight: 24,
    },
  });

export default memo(
  AuthHeader,
);