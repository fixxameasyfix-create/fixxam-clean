import React, {
  memo,
  useCallback,
  useMemo,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import type {
  WorkerOrder,
} from "@/types/workerOrders";

/* ==============================================================
   TYPES
============================================================== */

type WorkerServiceOrderCardProps = {
  order: WorkerOrder;

  onPress: (
    order: WorkerOrder,
  ) => void;
};

type StatusConfig = {
  label: string;

  backgroundColor: string;

  color: string;
};

/* ==============================================================
   HELPERS
============================================================== */

function getSafeText(
  value: unknown,
  fallback = "",
): string {
  if (
    typeof value ===
      "string" &&
    value.trim()
  ) {
    return value.trim();
  }

  if (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
  ) {
    return String(
      value,
    );
  }

  return fallback;
}

/* ==============================================================
   SERVICE ICON
============================================================== */

function resolveServiceIcon(
  value: unknown,
): keyof typeof MaterialCommunityIcons.glyphMap {
  const icon =
    getSafeText(
      value,
      "tools",
    );

  if (
    icon in
    MaterialCommunityIcons.glyphMap
  ) {
    return icon as keyof typeof MaterialCommunityIcons.glyphMap;
  }

  return "tools";
}

/* ==============================================================
   STATUS CONFIG
============================================================== */

function getStatusConfig(
  status: WorkerOrder["status"],
): StatusConfig {
  switch (status) {
    case "accepted":
      return {
        label:
          "ACCEPTED",

        backgroundColor:
          Colors.infoSoft,

        color:
          Colors.info,
      };

    case "in-progress":
      return {
        label:
          "IN PROGRESS",

        backgroundColor:
          Colors.infoSoft,

        color:
          Colors.info,
      };

    case "completed":
      return {
        label:
          "COMPLETED",

        backgroundColor:
          Colors.successSoft,

        color:
          Colors.success,
      };

    case "cancelled":
      return {
        label:
          "CANCELLED",

        backgroundColor:
          Colors.errorSoft,

        color:
          Colors.error,
      };

    case "expired":
      return {
        label:
          "EXPIRED",

        backgroundColor:
          Colors.disabledBackground,

        color:
          Colors.textSecondary,
      };

    case "pending":
    default:
      return {
        label:
          "PENDING",

        backgroundColor:
          Colors.warningSoft,

        color:
          Colors.warning,
      };
  }
}

/* ==============================================================
   STATUS BADGE
============================================================== */

const StatusBadge =
  memo(
    function StatusBadge({
      status,
    }: {
      status: WorkerOrder["status"];
    }) {
      const config =
        getStatusConfig(
          status,
        );

      return (
        <View
          style={[
            styles.statusBadge,

            {
              backgroundColor:
                config.backgroundColor,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,

              {
                backgroundColor:
                  config.color,
              },
            ]}
          />

          <AppText
            variant="caption"
            weight="bold"
            style={[
              styles.statusText,

              {
                color:
                  config.color,
              },
            ]}
          >
            {config.label}
          </AppText>
        </View>
      );
    },
  );

StatusBadge.displayName =
  "WorkerServiceOrderStatusBadge";

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerServiceOrderCard({
  order,
  onPress,
}: WorkerServiceOrderCardProps) {
  /* ============================================================
     DISPLAY VALUES
  ============================================================ */

  const orderId =
    useMemo(
      () =>
        getSafeText(
          order.id,
        ),
      [
        order.id,
      ],
    );

  const serviceName =
    useMemo(
      () =>
        getSafeText(
          order.serviceName,
          "Service",
        ),
      [
        order.serviceName,
      ],
    );

  const customerName =
    useMemo(
      () =>
        getSafeText(
          order.customerName,
          "Customer",
        ),
      [
        order.customerName,
      ],
    );

  const locationText =
    useMemo(
      () =>
        getSafeText(
          order.location,
          "Location unavailable",
        ),
      [
        order.location,
      ],
    );

  const dateText =
    useMemo(
      () =>
        getSafeText(
          order.date,
          "Date unavailable",
        ),
      [
        order.date,
      ],
    );

  const serviceIcon =
    useMemo(
      () =>
        resolveServiceIcon(
          order.serviceIcon,
        ),
      [
        order.serviceIcon,
      ],
    );

  const serviceColor =
    getSafeText(
      order.serviceColor,
      WorkerColors.primary,
    );

  const serviceBackgroundColor =
    getSafeText(
      order.serviceBackgroundColor,
      WorkerColors.primarySoft,
    );

  const isPending =
    order.status ===
    "pending";

  /* ============================================================
     PRESS
  ============================================================ */

  const handlePress =
    useCallback(() => {
      if (!orderId) {
        return;
      }

      onPress(
        order,
      );
    }, [
      onPress,
      order,
      orderId,
    ]);

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <Pressable
      onPress={
        handlePress
      }
      accessibilityRole="button"
      accessibilityLabel={`View job ${serviceName}`}
      style={({
        pressed,
      }) => [
        styles.card,

        pressed
          ? styles.pressed
          : null,
      ]}
    >
      {/* ========================================================
          TOP
      ======================================================== */}

      <View
        style={
          styles.topRow
        }
      >
        <StatusBadge
          status={
            order.status
          }
        />

        <View
          style={
            styles.idRow
          }
        >
          <AppIcon
            name="file"
            size="xs"
            color={
              Colors.textMuted
            }
          />

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            style={
              styles.orderId
            }
          >
            {orderId
              ? `#${orderId}`
              : "#—"}
          </AppText>
        </View>
      </View>

      {/* ========================================================
          SERVICE
      ======================================================== */}

      <View
        style={
          styles.mainRow
        }
      >
        {/* ======================================================
            MATERIAL COMMUNITY ICONS PRESERVED
        ====================================================== */}

        <View
          style={[
            styles.serviceIcon,

            {
              backgroundColor:
                serviceBackgroundColor,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={
              serviceIcon
            }
            size={24}
            color={
              serviceColor
            }
          />
        </View>

        <View
          style={
            styles.info
          }
        >
          <AppText
            variant="bodyMedium"
            weight="bold"
            numberOfLines={1}
            style={
              styles.serviceName
            }
          >
            {serviceName}
          </AppText>

          {/* ====================================================
              CUSTOMER
          ==================================================== */}

          <View
            style={
              styles.customerRow
            }
          >
            <View
              style={
                styles.customerAvatar
              }
            >
              <AppIcon
                name="profile"
                size="xs"
                color={
                  Colors.textMuted
                }
              />
            </View>

            <View
              style={
                styles.customerInfo
              }
            >
              <AppText
                variant="caption"
                weight="bold"
                numberOfLines={1}
                style={
                  styles.customerName
                }
              >
                {customerName}
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                numberOfLines={1}
                style={
                  styles.customerLabel
                }
              >
                Customer
              </AppText>
            </View>
          </View>
        </View>

        <View
          style={
            styles.arrow
          }
        >
          <AppIcon
            name="next"
            role="worker"
            size="sm"
            color={
              WorkerColors.primary
            }
          />
        </View>
      </View>

      {/* ========================================================
          META
      ======================================================== */}

      <View
        style={
          styles.metaRow
        }
      >
        <View
          style={
            styles.locationRow
          }
        >
          <AppIcon
            name="location"
            size="xs"
            color={
              Colors.textSecondary
            }
          />

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={
              styles.location
            }
          >
            {locationText}
          </AppText>
        </View>

        <View
          style={
            styles.divider
          }
        />

        <View
          style={
            styles.dateRow
          }
        >
          <AppIcon
            name="calendar"
            size="xs"
            color={
              Colors.textSecondary
            }
          />

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            style={
              styles.date
            }
          >
            {dateText}
          </AppText>
        </View>
      </View>

      {/* ========================================================
          NEW REQUEST
      ======================================================== */}

      {isPending ? (
        <View
          style={
            styles.pendingNotice
          }
        >
          <View
            style={
              styles.pendingLeft
            }
          >
            <View
              style={
                styles.pendingIcon
              }
            >
              <AppIcon
                name="clock"
                size="xs"
                color={
                  Colors.warning
                }
              />
            </View>

            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.pendingText
              }
            >
              NEW REQUEST
            </AppText>
          </View>

          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.pendingHint
            }
          >
            Review & respond
          </AppText>
        </View>
      ) : null}

      {/* ========================================================
          FOOTER
      ======================================================== */}

      <View
        style={
          styles.footer
        }
      >
        <View
          style={
            styles.requestedContainer
          }
        >
          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.requestedLabel
            }
          >
            Requested on
          </AppText>

          <AppText
            variant="caption"
            weight="bold"
            numberOfLines={1}
            style={
              styles.requestedDate
            }
          >
            {dateText}
          </AppText>
        </View>

        <View
          style={
            styles.viewButton
          }
        >
          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.viewButtonText
            }
          >
            VIEW JOB
          </AppText>

          <AppIcon
            name="next"
            role="worker"
            size="xs"
            color={
              Colors.textInverse
            }
          />
        </View>
      </View>
    </Pressable>
  );
}

/* ==============================================================
   MEMO
============================================================== */

WorkerServiceOrderCard.displayName =
  "WorkerServiceOrderCard";

export default memo(
  WorkerServiceOrderCard,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      width: "100%",

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    pressed: {
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

    /* ==========================================================
       TOP
    ========================================================== */

    topRow: {
      minHeight: 28,

      marginBottom:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,
    },

    idRow: {
      maxWidth: "55%",

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    orderId: {
      flexShrink: 1,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       STATUS
    ========================================================== */

    statusBadge: {
      minHeight: 26,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.sm,
    },

    statusDot: {
      width: 6,

      height: 6,

      borderRadius:
        FixxamTokens.radius.full,
    },

    statusText: {
      lineHeight: 14,
    },

    /* ==========================================================
       SERVICE
    ========================================================== */

    mainRow: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    serviceIcon: {
      width: 56,

      height: 56,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,
    },

    info: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    serviceName: {
      color:
        Colors.textPrimary,
    },

    /* ==========================================================
       CUSTOMER
    ========================================================== */

    customerRow: {
      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    customerAvatar: {
      width: 28,

      height: 28,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    customerInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    customerName: {
      color:
        Colors.textSecondary,
    },

    customerLabel: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textMuted,
    },

    arrow: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    /* ==========================================================
       META
    ========================================================== */

    metaRow: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderTopWidth: 1,

      borderBottomWidth: 1,

      borderColor:
        Colors.divider,
    },

    locationRow: {
      flex: 1,

      minWidth: 0,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    location: {
      flex: 1,

      minWidth: 0,

      color:
        Colors.textSecondary,
    },

    divider: {
      width: 1,

      height: 18,

      marginHorizontal:
        FixxamTokens.spacing.sm,

      backgroundColor:
        Colors.divider,
    },

    dateRow: {
      maxWidth: 120,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    date: {
      flexShrink: 1,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       PENDING
    ========================================================== */

    pendingNotice: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.warning,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.warningSoft,
    },

    pendingLeft: {
      flex: 1,

      minWidth: 0,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    pendingIcon: {
      width: 30,

      height: 30,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.sm,

      backgroundColor:
        Colors.surface,
    },

    pendingText: {
      color:
        Colors.warning,
    },

    pendingHint: {
      flexShrink: 0,

      color:
        Colors.warning,
    },

    /* ==========================================================
       FOOTER
    ========================================================== */

    footer: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    requestedContainer: {
      flex: 1,

      minWidth: 0,
    },

    requestedLabel: {
      color:
        Colors.textMuted,
    },

    requestedDate: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    viewButton: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        WorkerColors.primary,
    },

    viewButtonText: {
      color:
        Colors.textInverse,
    },
  });