import React, {
  memo,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type ServiceConfirmationType =
  | "started"
  | "completed";

type Props = {
  type: ServiceConfirmationType;

  workerName: string;

  confirmed: boolean;

  onConfirm: () => void;

  onHelp: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

function ServiceConfirmationCardComponent({
  type,
  workerName,
  confirmed,
  onConfirm,
  onHelp,
}: Props) {
  const isStarted =
    type === "started";

  const title =
    isStarted
      ? "SERVICE STARTED"
      : "SERVICE COMPLETED";

  const message =
    confirmed
      ? isStarted
        ? "You confirmed that the worker has started the service."
        : "You confirmed that the worker has completed the service."
      : isStarted
        ? `${workerName} has started working. Please confirm that the service has started.`
        : `${workerName} has marked the service as completed. Please confirm that the work is finished.`;

  const confirmLabel =
    isStarted
      ? "CONFIRM START"
      : "CONFIRM COMPLETION";

  const accessibilityLabel =
    isStarted
      ? "Confirm service started"
      : "Confirm service completed";

  return (
    <View
      style={styles.card}
      accessibilityLabel={`${title}. ${message}`}
    >
      {/* ======================================================
          STATUS ICON
      ====================================================== */}

      <View
        style={styles.icon}
      >
        <AppIcon
          name={
            isStarted
              ? "service"
              : "success"
          }
          size="lg"
          color={
            Colors.success
          }
        />
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View
        style={styles.content}
      >
        <AppText
          variant="caption"
          weight="bold"
          style={styles.title}
        >
          {title}
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          style={styles.text}
        >
          {message}
        </AppText>

        {/* ====================================================
            NOT CONFIRMED
        ==================================================== */}

        {!confirmed ? (
          <View
            style={styles.actions}
          >
            <Pressable
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel={
                accessibilityLabel
              }
              style={({
                pressed,
              }) => [
                styles.confirmButton,

                pressed
                  ? styles.buttonPressed
                  : null,
              ]}
            >
              <AppIcon
                name="check"
                size="xs"
                color={
                  Colors.textInverse
                }
              />

              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.confirmButtonText
                }
              >
                {confirmLabel}
              </AppText>
            </Pressable>

            <HelpButton
              onPress={onHelp}
            />
          </View>
        ) : (
          <>
            {/* =================================================
                CONFIRMED
            ================================================= */}

            <View
              style={
                styles.confirmedRow
              }
            >
              <AppIcon
                name="success"
                size="xs"
                color={
                  Colors.success
                }
              />

              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.confirmedText
                }
              >
                CONFIRMED
              </AppText>
            </View>

            <View
              style={
                styles.confirmedHelpWrapper
              }
            >
              <HelpButton
                onPress={onHelp}
                compact
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

/* ============================================================
   HELP BUTTON
============================================================ */

function HelpButton({
  onPress,
  compact = false,
}: {
  onPress: () => void;

  compact?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Get help"
      style={({
        pressed,
      }) => [
        styles.helpButton,

        compact
          ? styles.helpButtonCompact
          : null,

        pressed
          ? styles.buttonPressed
          : null,
      ]}
    >
      <AppIcon
        name="help"
        role="customer"
        size="xs"
        color={
          CustomerColors.primary
        }
      />

      <AppText
        variant="caption"
        weight="bold"
        style={
          styles.helpButtonText
        }
      >
        HELP
      </AppText>
    </Pressable>
  );
}

/* ============================================================
   MEMO
============================================================ */

const ServiceConfirmationCard =
  memo(
    ServiceConfirmationCardComponent,
  );

export default ServiceConfirmationCard;

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CARD
    ======================================================== */

    card: {
      marginTop:
        FixxamTokens.spacing.lg,

      marginHorizontal:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems:
        "flex-start",

      borderWidth: 1,

      borderColor:
        Colors.success,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.successSoft,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       ICON
    ======================================================== */

    icon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    title: {
      color:
        Colors.success,
    },

    text: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 17,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       ACTIONS
    ======================================================== */

    actions: {
      marginTop:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    confirmButton: {
      flex: 1,

      minWidth: 0,

      minHeight:
        FixxamTokens.size.buttonSmallHeight,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        Colors.success,
    },

    confirmButtonText: {
      textAlign: "center",

      color:
        Colors.textInverse,
    },

    /* ========================================================
       HELP
    ======================================================== */

    helpButton: {
      minWidth: 82,

      minHeight:
        FixxamTokens.size.buttonSmallHeight,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderWidth: 1,

      borderColor:
        CustomerColors.primary,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        Colors.surface,
    },

    helpButtonCompact: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      minWidth: 76,
    },

    helpButtonText: {
      color:
        CustomerColors.primary,
    },

    confirmedHelpWrapper: {
      alignSelf:
        "flex-start",

      marginTop:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       CONFIRMED
    ======================================================== */

    confirmedRow: {
      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    confirmedText: {
      color:
        Colors.success,
    },

    /* ========================================================
       PRESS STATE
    ======================================================== */

    buttonPressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },
  });