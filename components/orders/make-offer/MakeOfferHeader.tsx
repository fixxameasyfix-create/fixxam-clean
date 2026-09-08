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
  FixxamTokens,
} from "@/theme";

type Props = {
  disabled?: boolean;
  onBack: () => void;
};

function MakeOfferHeader({
  disabled = false,
  onBack,
}: Props) {
  return (
    <View
      style={
        styles.header
      }
    >
      <Pressable
        onPress={
          onBack
        }
        disabled={
          disabled
        }
        accessibilityRole="button"
        accessibilityLabel="Go back"
        accessibilityState={{
          disabled,
        }}
        style={({
          pressed,
        }) => [
          styles.backButton,

          pressed &&
          !disabled
            ? styles.pressed
            : null,
        ]}
      >
        <AppIcon
          name="back"
          size="md"
          color={
            Colors.textPrimary
          }
        />
      </Pressable>

      <View
        style={
          styles.headerText
        }
      >
        <AppText
          variant="heading2"
          weight="bold"
          style={
            styles.headerTitle
          }
        >
          Make Offer
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          style={
            styles.headerSubtitle
          }
        >
          Send your price to the customer.
        </AppText>
      </View>
    </View>
  );
}

export default memo(
  MakeOfferHeader,
);

const styles =
  StyleSheet.create({
    header: {
      width: "100%",

      minHeight:
        FixxamTokens.size.headerHeight,

      paddingBottom:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    backButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    headerText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    headerTitle: {
      color:
        Colors.textPrimary,
    },

    headerSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
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