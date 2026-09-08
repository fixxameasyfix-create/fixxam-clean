import React, {
  memo,
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
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type MaterialIconName =
  React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];

export type ServiceCardData = {
  id: string;

  name: string;

  description: string;

  icon: string;

  color: string;

  backgroundColor: string;
};

type Props = {
  service: ServiceCardData;

  onPress: () => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function ServiceCard({
  service,
  onPress,
}: Props) {
  const description =
    typeof service.description === "string"
      ? service.description.trim()
      : "";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View materials for ${service.name}`}
      onPress={onPress}
      style={({
        pressed,
      }) => [
        styles.card,

        pressed
          ? styles.pressed
          : null,
      ]}
    >
      {/* ======================================================
          SERVICE ICON
      ====================================================== */}

      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor:
              service.backgroundColor,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={
            service.icon as MaterialIconName
          }
          size={24}
          color={
            service.color
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
          variant="bodyMedium"
          weight="bold"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {service.name}
        </AppText>

        {description ? (
          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={
              styles.description
            }
          >
            {description}
          </AppText>
        ) : null}
      </View>

      {/* ======================================================
          NEXT
      ====================================================== */}

      <View
        style={
          styles.arrowContainer
        }
      >
        <AppIcon
          name="next"
          role="customer"
          size="sm"
          state="muted"
        />
      </View>
    </Pressable>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      width: "100%",

      minHeight:
        FixxamTokens.size
          .cardMinHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        FixxamTokens.spacing.md,

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
       ICON
    ======================================================== */

    iconContainer: {
      width:
        FixxamTokens.size
          .iconBox,

      height:
        FixxamTokens.size
          .iconBox,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.md,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      flex: 1,

      minWidth: 0,

      justifyContent:
        "center",
    },

    description: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       ARROW
    ======================================================== */

    arrowContainer: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginLeft:
        FixxamTokens.spacing.xs,
    },
  });

export default memo(
  ServiceCard,
);