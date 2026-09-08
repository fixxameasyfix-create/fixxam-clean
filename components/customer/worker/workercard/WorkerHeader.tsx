import React, {
  memo,
  useEffect,
  useMemo,
  useState,
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
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import type {
  WorkerCardData,
} from "../types";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  worker: WorkerCardData;

  onProfilePress: () => void;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
}

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerHeader({
  worker,
  onProfilePress,
}: Props) {
  const [
    imageFailed,
    setImageFailed,
  ] =
    useState(false);

  /* ============================================================
     NAME
  ============================================================ */

  const workerName =
    useMemo(() => {
      const fullName =
        cleanString(
          worker.fullName,
        );

      if (
        fullName
      ) {
        return fullName;
      }

      const individualName =
        [
          cleanString(
            worker.firstName,
          ),
          cleanString(
            worker.surname,
          ),
        ]
          .filter(
            Boolean,
          )
          .join(" ")
          .trim();

      return (
        individualName ||
        "Worker"
      );
    }, [
      worker.firstName,
      worker.fullName,
      worker.surname,
    ]);

  /* ============================================================
     PHOTO
  ============================================================ */

  const photoUrl =
    cleanString(
      worker.workerProfile
        ?.photoUrl,
    );

  useEffect(() => {
    setImageFailed(
      false,
    );
  }, [
    photoUrl,
  ]);

  const showPhoto =
    Boolean(
      photoUrl,
    ) &&
    !imageFailed;

  /* ============================================================
     CATEGORY
  ============================================================ */

  const categoryText =
    useMemo(() => {
      const values = [
        cleanString(
          worker.category,
        ),
        cleanString(
          worker.subcategory,
        ),
      ].filter(
        Boolean,
      );

      return (
        values.join(" • ") ||
        "Service Provider"
      );
    }, [
      worker.category,
      worker.subcategory,
    ]);

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          PHOTO
      ====================================================== */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${workerName} profile`}
        accessibilityHint="Opens the worker profile"
        onPress={
          onProfilePress
        }
        style={({
          pressed,
        }) => [
          styles.avatarContainer,

          pressed
            ? styles.avatarPressed
            : null,
        ]}
      >
        {showPhoto ? (
          <Image
            source={{
              uri:
                photoUrl,
            }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={
              FixxamTokens.motion.fast
            }
            style={
              styles.avatar
            }
            accessibilityLabel={`${workerName} profile photo`}
            onError={() =>
              setImageFailed(
                true,
              )
            }
          />
        ) : (
          <View
            style={
              styles.avatarPlaceholder
            }
          >
            <AppIcon
              name="profile"
              role="customer"
              size="lg"
              state="muted"
            />
          </View>
        )}

        {/* ====================================================
            ONLINE
        ==================================================== */}

        {worker.online ? (
          <View
            accessibilityLabel="Worker is online"
            style={
              styles.onlineDot
            }
          />
        ) : null}

        {/* ====================================================
            PROFILE AFFORDANCE
        ==================================================== */}

        <View
          style={
            styles.profileBadge
          }
        >
          <AppIcon
            name="next"
            role="customer"
            size="xs"
            color={
              Colors.textInverse
            }
          />
        </View>
      </Pressable>

      {/* ======================================================
          NAME + CATEGORY
      ====================================================== */}

      <View
        style={
          styles.content
        }
      >
        <AppText
          variant="bodyLarge"
          weight="bold"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {workerName}
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={
            styles.category
          }
        >
          {categoryText}
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
      width: "100%",

      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },

    /* ========================================================
       AVATAR
    ======================================================== */

    avatarContainer: {
      position:
        "relative",

      width:
        FixxamTokens.size
          .avatarXl,

      height:
        FixxamTokens.size
          .avatarXl,

      flexShrink: 0,

      marginRight:
        FixxamTokens.spacing.md,
    },

    avatar: {
      width:
        FixxamTokens.size
          .avatarXl,

      height:
        FixxamTokens.size
          .avatarXl,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    avatarPlaceholder: {
      width:
        FixxamTokens.size
          .avatarXl,

      height:
        FixxamTokens.size
          .avatarXl,

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

    avatarPressed: {
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
       ONLINE
    ======================================================== */

    onlineDot: {
      position:
        "absolute",

      right: 1,

      bottom: 1,

      width: 16,

      height: 16,

      borderWidth: 2,

      borderColor:
        Colors.surface,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.success,
    },

    /* ========================================================
       PROFILE BADGE
    ======================================================== */

    profileBadge: {
      position:
        "absolute",

      right: -4,

      bottom: -4,

      width: 24,

      height: 24,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 2,

      borderColor:
        Colors.surface,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primary,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      flex: 1,

      minWidth: 0,

      paddingTop:
        FixxamTokens.spacing.xxs,
    },

    category: {
      marginTop:
        FixxamTokens.spacing.xs,
    },
  });

export default memo(
  WorkerHeader,
);