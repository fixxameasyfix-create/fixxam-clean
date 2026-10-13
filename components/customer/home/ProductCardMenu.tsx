import React from "react";

import {
  Modal,
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
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  visible: boolean;

  favorCount?: number;

  ratingCount?: number;

  reviewCount?: number;

  onClose: () => void;

  onFavor: () => void;

  onRating: () => void;

  onReview: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

export default function ProductCardMenu({
  visible,
  favorCount = 0,
  ratingCount = 0,
  reviewCount = 0,
  onClose,
  onFavor,
  onRating,
  onReview,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* CLOSE AREA */}

        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close product menu"
        />

        {/* MENU */}

        <View style={styles.menu}>
          {/* FAVOR */}

          <MenuItem
            icon="heart"
            label="Favor"
            count={favorCount}
            onPress={() => {
              onClose();
              onFavor();
            }}
          />

          <View style={styles.divider} />

          {/* RATING */}

          <MenuItem
            icon="star"
            label="Rating"
            count={ratingCount}
            onPress={() => {
              onClose();
              onRating();
            }}
          />

          <View style={styles.divider} />

          {/* REVIEW */}

          <MenuItem
            icon="messages"
            label="Review"
            count={reviewCount}
            onPress={() => {
              onClose();
              onReview();
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

/* ============================================================
   MENU ITEM
============================================================ */

type MenuItemProps = {
  icon:
    | "heart"
    | "star"
    | "messages";

  label: string;

  count: number;

  onPress: () => void;
};

function MenuItem({
  icon,
  label,
  count,
  onPress,
}: MenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${count}`}
      style={({ pressed }) => [
        styles.item,

        pressed
          ? styles.itemPressed
          : null,
      ]}
    >
      <View style={styles.iconBox}>
        <AppIcon
          name={icon}
          size="sm"
          color={Colors.textPrimary}
        />
      </View>

      <AppText
        variant="bodyMedium"
        weight="semibold"
        style={styles.label}
      >
        {label}
      </AppText>

      <AppText
        variant="bodyMedium"
        weight="bold"
        style={styles.count}
      >
        {count}
      </AppText>
    </Pressable>
  );
}

const styles =
  StyleSheet.create({
    overlay: {
      flex: 1,

      justifyContent: "center",

      alignItems: "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      backgroundColor:
        "rgba(0, 0, 0, 0.12)",
    },

    menu: {
      width: 155,

      overflow: "hidden",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    item: {
      minHeight: 38,

      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal:
        FixxamTokens.spacing.xs,
    },

    itemPressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    iconBox: {
      width: 26,

      height: 26,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",
    },

    label: {
      flex: 1,

      minWidth: 0,

      marginLeft: 2,

      color:
        Colors.textPrimary,
    },

    count: {
      minWidth: 20,

      marginLeft:
        FixxamTokens.spacing.xs,

      textAlign: "right",

      color:
        Colors.textSecondary,
    },

    divider: {
      height:
        StyleSheet.hairlineWidth,

      marginLeft: 34,

      backgroundColor:
        Colors.divider,
    },
  });