import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { AppText } from "@/components/ui";
import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

type Props = {
  shopName: string;
  shopImageUrl: string | null;
  onPress: () => void;
  disabled?: boolean;
};

export default function ShopCard({
  shopName,
  shopImageUrl,
  onPress,
  disabled = false,
}: Props) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionTitleRow}>
        <Ionicons
          name="storefront-outline"
          size={16}
          color={CustomerColors.primary}
        />

        <AppText
          variant="caption"
          weight="bold"
        >
          Shop
        </AppText>
      </View>

      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`View ${
          shopName || "shop"
        }`}
        accessibilityHint="Opens the shop profile."
        style={({ pressed }) => [
          styles.shopRow,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.shopImageWrapper}>
          {shopImageUrl ? (
            <Image
              source={{ uri: shopImageUrl }}
              resizeMode="cover"
              style={styles.shopImage}
            />
          ) : (
            <View style={styles.shopImageFallback}>
              <Ionicons
                name="storefront-outline"
                size={21}
                color={CustomerColors.primary}
              />
            </View>
          )}
        </View>

        <View style={styles.flexContent}>
          <AppText
            weight="bold"
            numberOfLines={1}
          >
            {shopName || "Service Shop"}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={styles.subText}
          >
            View shop profile
          </AppText>
        </View>

        <Ionicons
          name="chevron-forward"
          size={17}
          color={Colors.textSecondary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: FixxamTokens.motion.pressedOpacity,
  },

  flexContent: {
    flex: 1,
    minWidth: 0,
  },

  sectionCard: {
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 6,
  },

  shopRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 7,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: Colors.background,
  },

  shopImageWrapper: {
    width: 48,
    height: 48,
    flexShrink: 0,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
  },

  shopImage: {
    width: "100%",
    height: "100%",
  },

  shopImageFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
  },

  subText: {
    marginTop: 1,
  },
});