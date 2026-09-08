import React, {
  memo,
  useMemo,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  Image,
} from "expo-image";

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
  WorkerOrderStatus,
  WorkerServiceOrder,
} from "@/types/workerOrders";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  order: WorkerServiceOrder;

  onPress: (
    order: WorkerServiceOrder,
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
    value.trim().length >
      0
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

function getOptionalNumber(
  value: unknown,
): number | undefined {
  if (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
  ) {
    return value;
  }

  if (
    typeof value ===
    "string"
  ) {
    const cleaned =
      value
        .replace(
          /[₦,\s]/g,
          "",
        )
        .trim();

    if (!cleaned) {
      return undefined;
    }

    const parsed =
      Number(
        cleaned,
      );

    return Number.isFinite(
      parsed,
    )
      ? parsed
      : undefined;
  }

  return undefined;
}

function formatMoney(
  value: unknown,
): string {
  const amount =
    getOptionalNumber(
      value,
    );

  if (
    amount ===
    undefined
  ) {
    return "₦0";
  }

  return `₦${Math.max(
    0,
    amount,
  ).toLocaleString(
    "en-NG",
    {
      maximumFractionDigits:
        2,
    },
  )}`;
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
   LOCATION
============================================================== */

function getLocationText(
  order: WorkerServiceOrder,
): string {
  const address =
    getSafeText(
      order.address,
    );

  if (address) {
    return address;
  }

  const location =
    getSafeText(
      order.location,
    );

  if (location) {
    return location;
  }

  return "Location unavailable";
}

/* ==============================================================
   STATUS
============================================================== */

function getStatusConfig(
  status: WorkerOrderStatus,
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
          Colors.successSoft,

        color:
          Colors.success,
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
      status: WorkerOrderStatus;
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
   CARD
============================================================== */

function WorkerOrderCard({
  order,
  onPress,
}: Props) {
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

  const locationText =
    useMemo(
      () =>
        getLocationText(
          order,
        ),
      [
        order,
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

  const customerPhoto =
    useMemo(
      () =>
        getSafeText(
          order.customerPhotoURL ??
            order.customerPhoto,
        ),
      [
        order.customerPhoto,
        order.customerPhotoURL,
      ],
    );

  const dateText =
    getSafeText(
      order.date,
      "Date unavailable",
    );

  const timeText =
    getSafeText(
      order.time,
    );

  const description =
    getSafeText(
      order.description,
    );

  const isPending =
    order.status ===
    "pending";

  const offerAmount =
    getOptionalNumber(
      order.offerAmount,
    );

  const hasOffer =
    order.offerStatus ===
      "sent";

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <Pressable
      onPress={() => {
        if (!orderId) {
          return;
        }

        onPress(
          order,
        );
      }}
      accessibilityRole="button"
      accessibilityLabel={`View job ${orderId || "unknown"}`}
      style={({
        pressed,
      }) => [
        styles.card,

        pressed
          ? styles.cardPressed
          : null,
      ]}
    >
      {/* ========================================================
          HEADER
      ======================================================== */}

      <View
        style={
          styles.header
        }
      >
        <StatusBadge
          status={
            order.status
          }
        />

        <View
          style={
            styles.orderIdRow
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
          SERVICE + CUSTOMER
      ======================================================== */}

      <View
        style={
          styles.mainRow
        }
      >
        {/* ======================================================
            KEEP MATERIAL COMMUNITY ICONS

            Service icons are dynamic Firestore/service icons.
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
            styles.mainInfo
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

          <View
            style={
              styles.customerRow
            }
          >
            {customerPhoto ? (
              <Image
                source={{
                  uri:
                    customerPhoto,
                }}
                contentFit="cover"
                transition={150}
                recyclingKey={
                  customerPhoto
                }
                accessibilityLabel={`${customerName} profile photo`}
                style={
                  styles.customerPhoto
                }
              />
            ) : (
              <View
                style={
                  styles.customerPlaceholder
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
            )}

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
          TIME
      ======================================================== */}

      {timeText ? (
        <View
          style={
            styles.timeRow
          }
        >
          <AppIcon
            name="clock"
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
              styles.timeText
            }
          >
            {timeText}
          </AppText>
        </View>
      ) : null}

      {/* ========================================================
          DESCRIPTION
      ======================================================== */}

      {description ? (
        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={2}
          style={
            styles.description
          }
        >
          {description}
        </AppText>
      ) : null}

      {/* ========================================================
          PENDING
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
                styles.pendingTitle
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
          OFFER
      ======================================================== */}

      {hasOffer ? (
        <View
          style={
            styles.offerNotice
          }
        >
          <View
            style={
              styles.offerLeft
            }
          >
            <AppIcon
              name="payment"
              size="xs"
              color={
                Colors.success
              }
            />

            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.offerTitle
              }
            >
              OFFER SENT
            </AppText>
          </View>

          {offerAmount !==
          undefined ? (
            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.offerAmount
              }
            >
              {formatMoney(
                offerAmount,
              )}
            </AppText>
          ) : null}
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
            {getSafeText(
              order.date,
              "Unknown date",
            )}
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

WorkerOrderCard.displayName =
  "WorkerServiceOrderCard";

export default memo(
  WorkerOrderCard,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       CARD
    ======================================================== */

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

    cardPressed: {
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

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
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

    orderIdRow: {
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

    /* ========================================================
       MAIN
    ======================================================== */

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

    mainInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    serviceName: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       CUSTOMER
    ======================================================== */

    customerRow: {
      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    customerPhoto: {
      width: 28,

      height: 28,

      flexShrink: 0,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    customerPlaceholder: {
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

    /* ========================================================
       META
    ======================================================== */

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

    /* ========================================================
       TIME
    ======================================================== */

    timeRow: {
      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    timeText: {
      color:
        Colors.textSecondary,
    },

    /* ========================================================
       DESCRIPTION
    ======================================================== */

    description: {
      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       PENDING
    ======================================================== */

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

    pendingTitle: {
      color:
        Colors.warning,
    },

    pendingHint: {
      flexShrink: 0,

      color:
        Colors.warning,
    },

    /* ========================================================
       OFFER
    ======================================================== */

    offerNotice: {
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
        Colors.success,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.successSoft,
    },

    offerLeft: {
      flex: 1,

      minWidth: 0,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    offerTitle: {
      color:
        Colors.success,
    },

    offerAmount: {
      flexShrink: 0,

      color:
        Colors.success,
    },

    /* ========================================================
       FOOTER
    ======================================================== */

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