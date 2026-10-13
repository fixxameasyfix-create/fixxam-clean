import React, {
  memo,
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
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  disabled?: boolean;

  onBack: () => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function RequestServiceHeader({
  disabled = false,
  onBack,
}: Props) {
  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          BACK
      ====================================================== */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        accessibilityState={{
          disabled,
        }}
        disabled={
          disabled
        }
        hitSlop={8}
        onPress={
          onBack
        }
        style={({
          pressed,
        }) => [
          styles.backButton,

          pressed &&
          !disabled
            ? styles.backButtonPressed
            : null,

          disabled
            ? styles.disabled
            : null,
        ]}
      >
        <AppIcon
          name="back"
          role="customer"
          size="md"
          state="default"
        />
      </Pressable>

      {/* ======================================================
          TITLE
      ====================================================== */}

      <View
        style={
          styles.content
        }
      >
        <AppText
          variant="heading1"
          weight="bold"
          numberOfLines={1}
          style={
            styles.title
          }
        >
          Book Service
        </AppText>

        <AppText
          variant="bodyMedium"
          tone="secondary"
          numberOfLines={2}
          style={
            styles.subtitle
          }
        >
          Send a request directly to the provider.
        </AppText>
      </View>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width:
        "100%",

      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        FixxamTokens.spacing.xxl,
    },

    /* ========================================================
       BACK BUTTON
    ======================================================== */

    backButton: {
      width:
        64,

      height:
        64,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    backButtonPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.lg,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,

      lineHeight:
        22,
    },

    /* ========================================================
       STATES
    ======================================================== */

    disabled: {
      opacity:
        FixxamTokens.motion.disabledOpacity,
    },
  });

export default memo(
  RequestServiceHeader,
);