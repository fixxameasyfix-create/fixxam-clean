import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  Image,
} from "expo-image";

import {
  AppButton,
  AppCard,
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
  photo: string | null;

  onTakePhoto: () => void;

  onChoosePhoto: () => void;

  onSkip: () => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function CustomerPhoto({
  photo,
  onTakePhoto,
  onChoosePhoto,
  onSkip,
}: Props) {
  const hasPhoto =
    typeof photo === "string" &&
    photo.trim().length > 0;

  return (
    <AppCard
      role="customer"
      variant="outlined"
      style={
        styles.card
      }
    >
      {/* ========================================================
          HEADER
      ======================================================== */}

      <AppText
        variant="heading2"
        weight="bold"
        style={
          styles.title
        }
      >
        Add your profile photo
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        style={
          styles.subtitle
        }
      >
        Add a clear photo of yourself so workers and Fixxam can easily recognize your profile.
      </AppText>

      {/* ========================================================
          QUALITY NOTICE
      ======================================================== */}

      <View
        style={
          styles.qualityNotice
        }
      >
        <View
          style={
            styles.noticeIcon
          }
        >
          <AppIcon
            name="success"
            role="customer"
            size="sm"
            state="active"
          />
        </View>

        <AppText
          variant="caption"
          style={
            styles.qualityText
          }
        >
          Please use a clear, well-lit photo where your face is easy to see.
        </AppText>
      </View>

      {/* ========================================================
          PHOTO PREVIEW
      ======================================================== */}

      <View
        style={
          styles.previewContainer
        }
      >
        {hasPhoto ? (
          <Image
            source={{
              uri: photo,
            }}
            contentFit="cover"
            transition={150}
            accessibilityLabel="Selected profile photo"
            style={
              styles.photo
            }
          />
        ) : (
          <View
            accessibilityLabel="No profile photo selected"
            style={
              styles.placeholder
            }
          >
            <AppIcon
              name="profile"
              role="customer"
              size="xl"
              state="muted"
            />
          </View>
        )}
      </View>

      {/* ========================================================
          ACTIONS
      ======================================================== */}

      <AppButton
        title="Take Photo"
        role="customer"
        variant="primary"
        size="md"
        leftIconName="camera"
        onPress={
          onTakePhoto
        }
      />

      <View
        style={
          styles.secondaryAction
        }
      >
        <AppButton
          title="Choose from Gallery"
          role="customer"
          variant="outline"
          size="md"
          leftIconName="image"
          onPress={
            onChoosePhoto
          }
        />
      </View>

      <View
        style={
          styles.skipAction
        }
      >
        <AppButton
          title="Skip for now"
          role="customer"
          variant="ghost"
          size="sm"
          onPress={
            onSkip
          }
        />
      </View>

      {/* ========================================================
          HINT
      ======================================================== */}

      <AppText
        accessibilityRole="text"
        variant="caption"
        tone="secondary"
        center
        style={
          styles.hint
        }
      >
        You can add or change your photo later from your profile.
      </AppText>
    </AppCard>
  );
}

export default memo(
  CustomerPhoto,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.lg,
    },

    title: {
      marginBottom:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginBottom:
        FixxamTokens.spacing.md,

      color:
        Colors.textSecondary,
    },

    qualityNotice: {
      marginBottom:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    noticeIcon: {
      width:
        FixxamTokens.size.iconBox,

      flexShrink: 0,

      alignItems:
        "flex-start",

      paddingTop:
        FixxamTokens.spacing.xxs,
    },

    qualityText: {
      flex: 1,

      color:
        CustomerColors.primary,
    },

    previewContainer: {
      marginBottom:
        FixxamTokens.spacing.lg,

      alignItems:
        "center",
    },

    photo: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    placeholder: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    secondaryAction: {
      marginTop:
        FixxamTokens.spacing.sm,
    },

    skipAction: {
      marginTop:
        FixxamTokens.spacing.xs,
    },

    hint: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },
  });