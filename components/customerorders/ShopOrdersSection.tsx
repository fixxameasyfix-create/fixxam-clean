import React, { memo } from "react";
import {
  StyleSheet,
  View,
} from "react-native";

import ShopRequestCard from "@/components/customerorders/shopRequestCard";

import {
  AppText,
} from "@/components/ui";

import type {
  FirebaseShopRequest,
} from "@/types/firebaseShopRequest";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

type Props = {
  requests: FirebaseShopRequest[];
  onPress: (
    request: FirebaseShopRequest,
  ) => void;
};

function ShopOrdersSection({
  requests,
  onPress,
}: Props) {
  if (requests.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <AppText
            variant="heading3"
            weight="bold"
          >
            Shop
          </AppText>

          <AppText
            variant="caption"
            style={styles.subtitle}
          >
            Your shop requests
          </AppText>
        </View>

        <View style={styles.count}>
          <AppText
            variant="caption"
            weight="bold"
            style={styles.countText}
          >
            {requests.length}
          </AppText>
        </View>
      </View>

      <View style={styles.list}>
        {requests.map((request) => (
          <ShopRequestCard
            key={request.id}
            request={request}
            onPress={() =>
              onPress(request)
            }
          />
        ))}
      </View>
    </View>
  );
}

export default memo(
  ShopOrdersSection,
);

const styles = StyleSheet.create({
  container: {
    marginTop:
      FixxamTokens.spacing.lg,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom:
      FixxamTokens.spacing.sm,
  },

  subtitle: {
    marginTop: 2,
    color: Colors.textSecondary,
  },

  count: {
    minWidth: 34,
    height: 34,

    paddingHorizontal:
      FixxamTokens.spacing.sm,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 17,

    backgroundColor:
      Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  countText: {
    color: Colors.textSecondary,
  },

  list: {
    gap: FixxamTokens.spacing.sm,
  },
});