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

  const safeWorkerName =
    typeof workerName === "string" &&
    workerName.trim()
      ? workerName.trim()
      : "The worker";

  const title =
    isStarted
      ? "Service started"
      : "Service completed";

  const message =
    confirmed
      ? isStarted
        ? "You confirmed that the service has started."
        : "You confirmed that the service has been completed."
      : isStarted
        ? `${safeWorkerName} says the service has started. Confirm only if work has actually begun.`
        : `${safeWorkerName} marked the service as completed. Confirm only if the work is finished.`;

  const confirmLabel =
    isStarted
      ? "Confirm start"
      : "Confirm completion";

  const accessibilityLabel =
    isStarted
      ? "Confirm service started"
      : "Confirm service completed";

  return (
    <View
      accessible
      accessibilityLabel={`${title}. ${message}`}
      style={[
        styles.card,

        confirmed
          ? styles.cardConfirmed
          : null,
      ]}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={
          styles.header
        }
      >
        <View
          style={[
            styles.icon,

            confirmed
              ? styles.iconConfirmed
              : null,
          ]}
        >
          <AppIcon
            name={
              isStarted
                ? "service"
                : "success"
            }
            size="xs"
            color={
              Colors.success
            }
          />
        </View>

        <View
          style={
            styles.headerContent
          }
        >
          <View
            style={
              styles.titleRow
            }
          >
            <AppText
              variant="bodyMedium"
              weight="semibold"
              numberOfLines={1}
              style={
                styles.title
              }
            >
              {title}
            </AppText>

            {confirmed ? (
              <View
                style={
                  styles.confirmedBadge
                }
              >
                <View
                  style={
                    styles.confirmedDot
                  }
                />

                <AppText
                  variant="caption"
                  weight="semibold"
                  style={
                    styles.confirmedBadgeText
                  }
                >
                  Confirmed
                </AppText>
              </View>
            ) : null}
          </View>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={
              confirmed
                ? 2
                : 3
            }
            style={
              styles.message
            }
          >
            {message}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          NOT CONFIRMED
      ====================================================== */}

      {!confirmed ? (
        <View
          style={
            styles.actions
          }
        >
          <Pressable
            onPress={
              onConfirm
            }
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
              weight="semibold"
              numberOfLines={1}
              style={
                styles.confirmButtonText
              }
            >
              {confirmLabel}
            </AppText>
          </Pressable>

          <HelpButton
            onPress={
              onHelp
            }
          />
        </View>
      ) : (
        <Pressable
          onPress={
            onHelp
          }
          accessibilityRole="button"
          accessibilityLabel="Get help with this service"
          hitSlop={8}
          style={({
            pressed,
          }) => [
            styles.confirmedHelp,

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
            weight="semibold"
            style={
              styles.confirmedHelpText
            }
          >
            Need help?
          </AppText>
        </Pressable>
      )}
    </View>
  );
}

/* ============================================================
   HELP BUTTON
============================================================ */

function HelpButton({
  onPress,
}: {
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={
        onPress
      }
      accessibilityRole="button"
      accessibilityLabel="Get help"
      style={({
        pressed,
      }) => [
        styles.helpButton,

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
        weight="semibold"
        style={
          styles.helpButtonText
        }
      >
        Help
      </AppText>
    </Pressable>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CARD
    ======================================================== */

    card: {
      width:
        "100%",

      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.sm,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.success,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.successSoft,
    },

    cardConfirmed: {
      borderColor:
        Colors.border,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },

    icon: {
      width:
        34,

      height:
        34,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    iconConfirmed: {
      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.success,
    },

    headerContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    titleRow: {
      minHeight:
        22,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,
    },

    title: {
      flex:
        1,

      minWidth:
        0,

      color:
        Colors.textPrimary,
    },

    message: {
      marginTop:
        2,

      lineHeight:
        17,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       CONFIRMED BADGE
    ======================================================== */

    confirmedBadge: {
      flexShrink:
        0,

      minHeight:
        21,

      paddingHorizontal:
        7,

      paddingVertical:
        2,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        4,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    confirmedDot: {
      width:
        5,

      height:
        5,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.success,
    },

    confirmedBadgeText: {
      fontSize:
        10,

      color:
        Colors.success,
    },

    /* ========================================================
       ACTIONS
    ======================================================== */

    actions: {
      width:
        "100%",

      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    confirmButton: {
      flex:
        1,

      minWidth:
        0,

      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.success,
    },

    confirmButtonText: {
      flexShrink:
        1,

      textAlign:
        "center",

      color:
        Colors.textInverse,
    },

    /* ========================================================
       HELP
    ======================================================== */

    helpButton: {
      minWidth:
        78,

      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderWidth:
        1,

      borderColor:
        CustomerColors.primary,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    helpButtonText: {
      color:
        CustomerColors.primary,
    },

    confirmedHelp: {
      alignSelf:
        "flex-start",

      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      marginTop:
        4,

      paddingHorizontal:
        2,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        5,
    },

    confirmedHelpText: {
      color:
        CustomerColors.primary,
    },

    /* ========================================================
       PRESS
    ======================================================== */

    buttonPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },
  });

/* ============================================================
   MEMO / EXPORT
============================================================ */

const ServiceConfirmationCard =
  memo(
    ServiceConfirmationCardComponent,
  );

ServiceConfirmationCard.displayName =
  "ServiceConfirmationCard";

export default ServiceConfirmationCard;