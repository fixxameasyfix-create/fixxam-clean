import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

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

type Props = {
  description: string;
};

/* ==============================================================
   COMPONENT
============================================================== */

function ProductDescription({
  description,
}: Props) {
  const normalizedDescription =
    typeof description === "string"
      ? description.trim()
      : "";

  return (
    <View style={styles.container}>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View style={styles.header}>
        <View style={styles.iconBox}>
          <AppIcon
            name="file"
            role="customer"
            size="xs"
            state="active"
          />
        </View>

        <AppText
          variant="bodyMedium"
          weight="bold"
          style={styles.title}
        >
          Product Description
        </AppText>
      </View>

      {/* ======================================================
          DESCRIPTION
      ====================================================== */}

      <AppText
        variant="body"
        tone="secondary"
        style={styles.description}
      >
        {normalizedDescription ||
          "No description available for this product."}
      </AppText>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  container: {
    marginHorizontal:
      FixxamTokens.spacing.lg,

    marginTop:
      FixxamTokens.spacing.md,

    padding:
      FixxamTokens.spacing.md,

    borderWidth: 1,

    borderColor:
      Colors.border,

    borderRadius:
      FixxamTokens.radius.lg,

    backgroundColor:
      Colors.surface,
  },

  header: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom:
      FixxamTokens.spacing.sm,
  },

  iconBox: {
    width: 30,

    height: 30,

    alignItems: "center",

    justifyContent: "center",

    borderRadius:
      FixxamTokens.radius.sm,

    backgroundColor:
      CustomerColors.primarySoft,
  },

  title: {
    flex: 1,

    minWidth: 0,

    marginLeft:
      FixxamTokens.spacing.sm,

    color:
      Colors.textPrimary,
  },

  description: {
    lineHeight: 20,
  },
});

export default memo(
  ProductDescription,
);