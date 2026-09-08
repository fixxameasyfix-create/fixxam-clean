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

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import {
  ServiceItem,
} from "@/constants/serviceLoader";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  selectedServices: string[];

  availableServices: ServiceItem[];

  onRemove: (
    serviceId: string,
  ) => void;
};

type SelectedServiceChipProps = {
  service: ServiceItem;

  onRemove: (
    serviceId: string,
  ) => void;
};

/* ============================================================
   SELECTED SERVICE CHIP
============================================================ */

const SelectedServiceChip =
  memo(function SelectedServiceChip({
    service,
    onRemove,
  }: SelectedServiceChipProps) {
    const handleRemove =
      useCallback(() => {
        onRemove(
          service.id,
        );
      }, [
        onRemove,
        service.id,
      ]);

    return (
      <View
        style={
          styles.chip
        }
      >
        <View
          style={
            styles.serviceIcon
          }
        >
          <AppIcon
            name="check"
            role="worker"
            size="xs"
            state="active"
          />
        </View>

        <AppText
          variant="caption"
          weight="medium"
          numberOfLines={1}
          style={
            styles.chipText
          }
        >
          {service.name}
        </AppText>

        <Pressable
          onPress={
            handleRemove
          }
          accessibilityRole="button"
          accessibilityLabel={`Remove ${service.name}`}
          hitSlop={
            FixxamTokens.spacing.sm
          }
          style={({
            pressed,
          }) => [
            styles.removeButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppIcon
            name="close"
            role="worker"
            size="xs"
            state="muted"
          />
        </Pressable>
      </View>
    );
  });

/* ============================================================
   COMPONENT
============================================================ */

function SelectedServices({
  selectedServices,
  availableServices,
  onRemove,
}: Props) {
  const selectedItems =
    useMemo(
      () =>
        selectedServices
          .map(
            (serviceId) =>
              availableServices.find(
                (item) =>
                  item.id ===
                  serviceId,
              ),
          )
          .filter(
            (
              service,
            ): service is ServiceItem =>
              Boolean(
                service,
              ),
          ),
      [
        availableServices,
        selectedServices,
      ],
    );

  if (
    selectedItems.length === 0
  ) {
    return null;
  }

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ==================================================
          HEADER
      ================================================== */}

      <View
        style={
          styles.header
        }
      >
        <View
          style={
            styles.headerContent
          }
        >
          <AppText
            variant="body"
            weight="medium"
            style={
              styles.title
            }
          >
            Selected services
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.subtitle
            }
          >
            Services you offer to customers
          </AppText>
        </View>

        <View
          style={
            styles.counterBadge
          }
        >
          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.counterText
            }
          >
            {selectedItems.length}/4
          </AppText>
        </View>
      </View>

      {/* ==================================================
          SERVICES
      ================================================== */}

      <View
        style={
          styles.chipsContainer
        }
      >
        {selectedItems.map(
          (service) => (
            <SelectedServiceChip
              key={
                service.id
              }
              service={
                service
              }
              onRemove={
                onRemove
              }
            />
          ),
        )}
      </View>
    </View>
  );
}

export default memo(
  SelectedServices,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      marginTop:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.background,

      borderWidth: 1,

      borderColor:
        Colors.border,
    },

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.sm,
    },

    headerContent: {
      flex: 1,

      minWidth: 0,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    counterBadge: {
      minWidth:
        FixxamTokens.size.minimumTouchTarget,

      minHeight:
        FixxamTokens.spacing.xxl,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    counterText: {
      color:
        WorkerColors.primary,
    },

    chipsContainer: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        FixxamTokens.spacing.xs,
    },

    chip: {
      maxWidth:
        "100%",

      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      paddingLeft:
        FixxamTokens.spacing.xs,

      paddingRight:
        FixxamTokens.spacing.xxs,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,

      borderWidth: 1,

      borderColor:
        Colors.border,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    serviceIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      borderRadius:
        FixxamTokens.radius.sm,

      backgroundColor:
        WorkerColors.primarySoft,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.xs,
    },

    chipText: {
      maxWidth: 150,

      color:
        Colors.textPrimary,
    },

    removeButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      marginLeft:
        FixxamTokens.spacing.xxs,

      borderRadius:
        FixxamTokens.radius.md,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.disabledBackground,
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
  });