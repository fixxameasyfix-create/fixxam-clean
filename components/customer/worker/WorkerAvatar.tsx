import React, {
  memo,
  useEffect,
  useState,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  Image,
} from "expo-image";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  photoUrl?: string;

  online?: boolean;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const RING_SIZE = 92;
const IMAGE_SIZE = 84;
const STATUS_SIZE = 22;

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

function WorkerAvatar({
  photoUrl,
  online = false,
}: Props) {
  const [
    imageFailed,
    setImageFailed,
  ] =
    useState(false);

  const photo =
    cleanString(
      photoUrl,
    );

  /* ============================================================
     RESET IMAGE ERROR
  ============================================================ */

  useEffect(() => {
    setImageFailed(
      false,
    );
  }, [
    photo,
  ]);

  const hasRemotePhoto =
    Boolean(
      photo,
    ) &&
    !imageFailed;

  return (
    <View
      style={[
        styles.wrapper,

        online
          ? styles.onlineRing
          : styles.offlineRing,
      ]}
    >
      {/* ======================================================
          PHOTO
      ====================================================== */}

      <Image
        source={
          hasRemotePhoto
            ? {
                uri: photo,
              }
            : require("@/assets/images/avatar-placeholder.png")
        }
        style={
          styles.image
        }
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={
          FixxamTokens.motion.fast
        }
        accessibilityLabel="Worker profile photo"
        onError={() => {
          if (
            hasRemotePhoto
          ) {
            setImageFailed(
              true,
            );
          }
        }}
      />

      {/* ======================================================
          ONLINE STATUS
      ====================================================== */}

      {online ? (
        <View
          accessibilityLabel="Worker is online"
          style={
            styles.onlineIndicator
          }
        />
      ) : null}
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    wrapper: {
      width:
        RING_SIZE,

      height:
        RING_SIZE,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      overflow:
        "visible",

      borderWidth: 4,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    onlineRing: {
      borderColor:
        Colors.success,
    },

    offlineRing: {
      borderColor:
        Colors.border,
    },

    image: {
      width:
        IMAGE_SIZE,

      height:
        IMAGE_SIZE,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    onlineIndicator: {
      position:
        "absolute",

      right: -2,

      bottom: -2,

      width:
        STATUS_SIZE,

      height:
        STATUS_SIZE,

      borderWidth: 3,

      borderColor:
        Colors.surface,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.success,
    },
  });

export default memo(
  WorkerAvatar,
);