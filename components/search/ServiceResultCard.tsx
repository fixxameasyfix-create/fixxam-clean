import React, {
  memo,
  useCallback,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

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

type Props = {
  service: {
    id: string;

    name: string;

    description?: string;
  };
};

/* ============================================================
   COMPONENT
============================================================ */

function ServiceResultCard({
  service,
}: Props) {
  const handlePress =
    useCallback(() => {
      const serviceId =
        service.id.trim();

      if (!serviceId) {
        return;
      }

      router.push({
        pathname:
          "/(customer)/details/workers/[id]" as any,

        params: {
          id:
            serviceId,
        },
      });
    }, [
      service.id,
    ]);

  return (
    <Pressable
      onPress={
        handlePress
      }
      accessibilityRole="button"
      accessibilityLabel={`View workers for ${service.name}`}
      style={({
        pressed,
      }) => [
        styles.container,

        pressed
          ? styles.pressed
          : null,
      ]}
    >
      {/* ======================================================
          ICON
      ====================================================== */}

      <View
        style={
          styles.iconBox
        }
      >
        <AppIcon
          name="service"
          role="customer"
          size="md"
          color={
            CustomerColors.primary
          }
        />
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View
        style={
          styles.content
        }
      >
        <AppText
          variant="body"
          weight="bold"
          numberOfLines={1}
          style={
            styles.name
          }
        >
          {service.name}
        </AppText>

        {service.description ? (
          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={2}
            style={
              styles.description
            }
          >
            {service.description}
          </AppText>
        ) : null}
      </View>

      {/* ======================================================
          NEXT
      ====================================================== */}

      <View
        style={
          styles.nextIcon
        }
      >
        <AppIcon
          name="next"
          size="sm"
          color={
            Colors.textMuted
          }
        />
      </View>
    </Pressable>
  );
}

/* ============================================================
   MEMO
============================================================ */

const MemoizedServiceResultCard =
  memo(
    ServiceResultCard,
  );

MemoizedServiceResultCard.displayName =
  "ServiceResultCard";

export default MemoizedServiceResultCard;

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      minHeight: 78,

      marginHorizontal:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    iconBox: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    content: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    name: {
      color:
        Colors.textPrimary,
    },

    description: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    nextIcon: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.background,
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