import React, {
  memo,
  useMemo,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  Image,
} from "expo-image";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  photoURL?: string | null;

  workerName: string;

  onPress?: () => void;
};

/* ============================================================
   HELPERS
============================================================ */

function getSafeText(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function getValidPhotoURL(
  value: unknown,
): string | null {
  const url =
    getSafeText(value);

  if (
    url.startsWith("https://") ||
    url.startsWith("http://")
  ) {
    return url;
  }

  return null;
}

function getInitials(
  value: string,
): string {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(
      part =>
        part.charAt(0),
    )
    .join("")
    .toUpperCase();
}

/* ============================================================
   COMPONENT
============================================================ */

function HeaderAvatar({
  photoURL,
  workerName,
  onPress,
}: Props) {
  const displayName =
    useMemo(
      () =>
        getSafeText(
          workerName,
        ) || "Worker",
      [workerName],
    );

  const initials =
    useMemo(
      () =>
        getInitials(
          displayName,
        ),
      [displayName],
    );

  const validPhotoURL =
    useMemo(
      () =>
        getValidPhotoURL(
          photoURL,
        ),
      [photoURL],
    );

  return (
    <Pressable
      onPress={
        onPress
      }
      disabled={
        !onPress
      }
      accessibilityRole={
        onPress
          ? "button"
          : undefined
      }
      accessibilityLabel={
        onPress
          ? `Open ${displayName} profile`
          : `${displayName} profile photo`
      }
      style={({
        pressed,
      }) => [
        styles.container,

        pressed &&
        onPress
          ? styles.pressed
          : null,
      ]}
    >
      {validPhotoURL ? (
        <Image
          source={{
            uri:
              validPhotoURL,
          }}
          style={
            styles.image
          }
          contentFit="cover"
          transition={150}
          recyclingKey={
            validPhotoURL
          }
          accessibilityLabel={`${displayName} profile photo`}
        />
      ) : (
        <View
          style={
            styles.placeholder
          }
        >
          {initials ? (
            <AppText
              variant="heading3"
              weight="bold"
              center
              style={
                styles.initials
              }
            >
              {initials}
            </AppText>
          ) : (
            <AppIcon
              name="profile"
              role="worker"
              size="lg"
              color={
                Colors.textInverse
              }
            />
          )}
        </View>
      )}
    </Pressable>
  );
}

/* ============================================================
   MEMO
============================================================ */

HeaderAvatar.displayName =
  "HeaderAvatar";

export default memo(
  HeaderAvatar,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      flexShrink: 0,

      overflow:
        "hidden",

      borderWidth: 2,

      borderColor:
        Colors.surface,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,

      ...FixxamTokens.shadow.card,
    },

    image: {
      width: "100%",

      height: "100%",

      backgroundColor:
        Colors.disabledBackground,
    },

    placeholder: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primary,
    },

    initials: {
      color:
        Colors.textInverse,
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