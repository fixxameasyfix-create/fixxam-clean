import React, {
  memo,
  useCallback,
  useMemo,
} from "react";

import {
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

/*
 * IMPORTANT:
 * Keep this renderer because it preserves
 * the exact service icon/color/background
 * coming from Firebase.
 */
import ServiceIcon from "@/components/common/AppIcon";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

export type WorkerService = {
  id: string;

  name: string;

  price?:
    | number
    | string;

  icon?: string;

  color?: string;

  backgroundColor?: string;
};

type Props = {
  services: WorkerService[];

  selectedServices: string[];

  onToggle: (
    serviceId: string,
  ) => void;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_SELECTED_SERVICES =
  4;

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value.trim();
}

function normalizePrice(
  value: unknown,
): number | null {
  if (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    ) &&
    value >= 0
  ) {
    return value;
  }

  if (
    typeof value ===
    "string"
  ) {
    const parsed =
      Number(
        value.replace(
          /,/g,
          "",
        ),
      );

    if (
      Number.isFinite(
        parsed,
      ) &&
      parsed >= 0
    ) {
      return parsed;
    }
  }

  return null;
}

function formatPrice(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-NG",
    {
      maximumFractionDigits:
        0,
    },
  ).format(value);
}

/* ==============================================================
   SERVICE CARD
============================================================== */

type ServiceCardProps = {
  service: WorkerService;

  selected: boolean;

  selectionLimitReached: boolean;

  onToggle: (
    serviceId: string,
  ) => void;
};

const WorkerServiceCard =
  memo(function WorkerServiceCard({
    service,
    selected,
    selectionLimitReached,
    onToggle,
  }: ServiceCardProps) {
    const serviceId =
      cleanString(
        service.id,
      );

    const serviceName =
      cleanString(
        service.name,
      ) ||
      "Unnamed Service";

    const price =
      normalizePrice(
        service.price,
      );

    const handlePress =
      useCallback(() => {
        if (
          !serviceId
        ) {
          return;
        }

        if (
          !selected &&
          selectionLimitReached
        ) {
          Alert.alert(
            "Maximum Reached",
            `You can select up to ${MAX_SELECTED_SERVICES} services.`,
          );

          return;
        }

        onToggle(
          serviceId,
        );
      }, [
        onToggle,
        selected,
        selectionLimitReached,
        serviceId,
      ]);

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          selected
            ? `${serviceName}, selected`
            : `Select ${serviceName}`
        }
        accessibilityState={{
          selected,
        }}
        onPress={
          handlePress
        }
        style={({
          pressed,
        }) => [
          styles.card,

          selected
            ? styles.selectedCard
            : null,

          pressed
            ? styles.pressed
            : null,
        ]}
      >
        {/* ====================================================
            LEFT
        ==================================================== */}

        <View
          style={
            styles.left
          }
        >
          <ServiceIcon
            icon={
              service.icon
            }
            color={
              service.color
            }
            backgroundColor={
              service.backgroundColor
            }
            containerSize={40}
            size={18}
          />

          <View
            style={
              styles.serviceInfo
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              numberOfLines={2}
              style={
                selected
                  ? styles.selectedName
                  : undefined
              }
            >
              {serviceName}
            </AppText>

            {price !==
            null ? (
              <AppText
                variant="caption"
                tone="secondary"
                numberOfLines={1}
                style={
                  styles.price
                }
              >
                ₦
                {formatPrice(
                  price,
                )}
              </AppText>
            ) : null}
          </View>
        </View>

        {/* ====================================================
            SELECTED INDICATOR
        ==================================================== */}

        <View
          style={[
            styles.selectionIndicator,

            selected
              ? styles.selectionIndicatorSelected
              : null,
          ]}
        >
          {selected ? (
            <AppIcon
              name="check"
              role="customer"
              size="xs"
              color={
                Colors.textInverse
              }
            />
          ) : null}
        </View>
      </Pressable>
    );
  });

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerServices({
  services,
  selectedServices,
  onToggle,
}: Props) {
  const selectedSet =
    useMemo(
      () =>
        new Set(
          selectedServices
            .map(
              cleanString,
            )
            .filter(
              Boolean,
            ),
        ),
      [
        selectedServices,
      ],
    );

  const selectedCount =
    selectedSet.size;

  const selectionLimitReached =
    selectedCount >=
    MAX_SELECTED_SERVICES;

  return (
    <View
      style={
        styles.container
      }
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
          style={
            styles.headerTop
          }
        >
          <AppText
            variant="bodyLarge"
            weight="bold"
          >
            Services
          </AppText>

          <View
            style={
              styles.countBadge
            }
          >
            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.countText
              }
            >
              {selectedCount} /{" "}
              {MAX_SELECTED_SERVICES}
            </AppText>
          </View>
        </View>

        <AppText
          variant="caption"
          tone="secondary"
          style={
            styles.subtitle
          }
        >
          Choose up to{" "}
          {MAX_SELECTED_SERVICES} services
        </AppText>
      </View>

      {/* ======================================================
          SERVICES
      ====================================================== */}

      {services.length >
      0 ? (
        <View
          style={
            styles.serviceList
          }
        >
          {services.map(
            (
              service,
            ) => {
              const selected =
                selectedSet.has(
                  cleanString(
                    service.id,
                  ),
                );

              return (
                <WorkerServiceCard
                  key={
                    service.id
                  }
                  service={
                    service
                  }
                  selected={
                    selected
                  }
                  selectionLimitReached={
                    selectionLimitReached
                  }
                  onToggle={
                    onToggle
                  }
                />
              );
            },
          )}
        </View>
      ) : (
        /* ====================================================
           EMPTY
        ==================================================== */

        <View
          style={
            styles.emptyCard
          }
        >
          <View
            style={
              styles.emptyIcon
            }
          >
            <AppIcon
              name="service"
              role="customer"
              size="lg"
              state="muted"
            />
          </View>

          <AppText
            variant="bodyMedium"
            weight="bold"
            center
            style={
              styles.emptyTitle
            }
          >
            No services available
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            center
            style={
              styles.emptyText
            }
          >
            This worker has not added
            any services yet.
          </AppText>
        </View>
      )}
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      marginTop:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.lg,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      marginBottom:
        FixxamTokens.spacing.sm,
    },

    headerTop: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    countBadge: {
      minHeight: 28,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    countText: {
      color:
        CustomerColors.primary,
    },

    /* ========================================================
       LIST
    ======================================================== */

    serviceList: {
      gap:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      minHeight:
        FixxamTokens.size
          .cardMinHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    selectedCard: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primarySoft,
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

    /* ========================================================
       SERVICE
    ======================================================== */

    left: {
      flex: 1,

      minWidth: 0,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginRight:
        FixxamTokens.spacing.sm,
    },

    serviceInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    selectedName: {
      color:
        CustomerColors.primary,
    },

    price: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       SELECTION
    ======================================================== */

    selectionIndicator: {
      width: 24,

      height: 24,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 2,

      borderColor:
        Colors.disabled,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    selectionIndicatorSelected: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primary,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyCard: {
      minHeight: 150,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingVertical:
        FixxamTokens.spacing.lg,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    emptyIcon: {
      width:
        FixxamTokens.size
          .avatarLg,

      height:
        FixxamTokens.size
          .avatarLg,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.md,
    },

    emptyText: {
      maxWidth: 280,

      marginTop:
        FixxamTokens.spacing.xs,
    },
  });

export default memo(
  WorkerServices,
);