import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBackground: string;
  onPress: () => void;
  compact?: boolean;
};

export default function BookCard({
  title,
  description,
  icon,
  iconColor,
  iconBackground,
  onPress,
  compact = false,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.card,
        compact && styles.compactCard,
        pressed && styles.pressed,
      ]}
    >
      {/* ICON */}
      <View
        style={[
          styles.iconBox,
          compact && styles.compactIconBox,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <Ionicons
          name={icon as keyof typeof Ionicons.glyphMap}
          size={compact ? 20 : 26}
          color={iconColor}
        />
      </View>

      {/* CONTENT */}
      <View
        style={[
          styles.content,
          compact && styles.compactContent,
        ]}
      >
        <AppText
          weight="bold"
          numberOfLines={compact ? 1 : 2}
          ellipsizeMode="tail"
          style={[
            styles.title,
            compact && styles.compactTitle,
          ]}
        >
          {title}
        </AppText>

        {!compact && (
          <AppText
            numberOfLines={2}
            ellipsizeMode="tail"
            style={styles.description}
          >
            {description}
          </AppText>
        )}
      </View>

      {/* ARROW */}
      <View
        style={[
          styles.arrowBox,
          compact && styles.compactArrowBox,
        ]}
      >
        <Ionicons
          name="chevron-forward"
          size={20}
          color={compact ? "#64748B" : "#2563EB"}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  /* ==========================================================
     NORMAL CARD
  ========================================================== */

  card: {
    height: 245,

    width: "100%",

    backgroundColor: "#FFFFFF",

    borderRadius: 20,

    padding: 18,

    borderWidth: 1,

    borderColor: "#E8EDF3",

    overflow: "hidden",

    shadowColor: "#0F172A",

    shadowOpacity: 0.06,

    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 3,
  },

  /* ==========================================================
     ICON
  ========================================================== */

  iconBox: {
    width: 76,

    height: 76,

    borderRadius: 20,

    alignItems: "center",

    justifyContent: "center",

    flexShrink: 0,
  },

  /* ==========================================================
     CONTENT
  ========================================================== */

  content: {
    minHeight: 0,

    marginTop: 16,

    paddingBottom: 42,

    justifyContent: "flex-start",
  },

  /* ==========================================================
     TITLE
  ========================================================== */

  title: {
    height: 56,

    fontSize: 20,

    lineHeight: 28,

    color: "#0F172A",

    flexShrink: 0,
  },

  /* ==========================================================
     DESCRIPTION
  ========================================================== */

  description: {
    marginTop: 8,

    height: 42,

    paddingRight: 42,

    fontSize: 15,

    lineHeight: 21,

    color: "#64748B",

    flexShrink: 0,
  },

  /* ==========================================================
     ARROW
  ========================================================== */

  arrowBox: {
    position: "absolute",

    right: 14,

    bottom: 14,

    width: 32,

    height: 32,

    borderRadius: 10,

    backgroundColor: "#F8FAFC",

    alignItems: "center",

    justifyContent: "center",
  },

  /* ==========================================================
     COMPACT CARD
  ========================================================== */

  compactCard: {
    height: 68,

    minHeight: 68,

    borderRadius: 16,

    paddingHorizontal: 12,

    paddingVertical: 10,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "flex-start",
  },

  compactIconBox: {
    width: 42,

    height: 42,

    borderRadius: 12,

    flexShrink: 0,
  },

  compactContent: {
    flex: 1,

    minWidth: 0,

    marginTop: 0,

    marginLeft: 11,

    paddingRight: 38,

    paddingBottom: 0,

    justifyContent: "center",
  },

  compactTitle: {
    fontSize: 14,

    lineHeight: 19,

    color: "#0F172A",

    flexShrink: 1,
  },

  /* ==========================================================
     COMPACT ARROW
  ========================================================== */

  compactArrowBox: {
    right: 10,

    bottom: 18,

    width: 28,

    height: 28,

    borderRadius: 9,

    backgroundColor: "#F8FAFC",
  },

  /* ==========================================================
     PRESSED
  ========================================================== */

  pressed: {
    opacity: 0.82,

    transform: [
      {
        scale: 0.985,
      },
    ],
  },
});