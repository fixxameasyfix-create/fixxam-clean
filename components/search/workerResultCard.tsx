import React, {
  memo,
  useCallback,
  useMemo,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Worker = {
  id: string;

  fullName: string;

  category: string;

  rating: number;

  verified: boolean;
};

type Props = {
  worker: Worker;
};

/* ============================================================
   COMPONENT
============================================================ */

function WorkerResultCard({
  worker,
}: Props) {
  /* ==========================================================
     RESOLVED DATA
  ========================================================== */

  const workerId =
    useMemo(
      () =>
        worker.id.trim(),
      [
        worker.id,
      ],
    );

  const workerName =
    useMemo(
      () =>
        worker.fullName.trim() ||
        "Worker",
      [
        worker.fullName,
      ],
    );

  const category =
    useMemo(
      () =>
        worker.category.trim() ||
        "Service provider",
      [
        worker.category,
      ],
    );

  const rating =
    useMemo(() => {
      const value =
        Number(
          worker.rating,
        );

      if (
        !Number.isFinite(
          value,
        )
      ) {
        return 0;
      }

      return Math.max(
        0,
        Math.min(
          value,
          5,
        ),
      );
    }, [
      worker.rating,
    ]);

  /* ==========================================================
     OPEN WORKER
  ========================================================== */

  const handlePress =
    useCallback(() => {
      if (!workerId) {
        return;
      }

      router.push({
        pathname:
          "/(customer)/workers/[id]",

        params: {
          id:
            workerId,
        },
      });
    }, [
      workerId,
    ]);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <Pressable
      onPress={
        handlePress
      }
      disabled={
        !workerId
      }
      accessibilityRole="button"
      accessibilityLabel={`View ${workerName} profile`}
      accessibilityState={{
        disabled:
          !workerId,
      }}
      style={({
        pressed,
      }) => [
        styles.container,

        !workerId
          ? styles.disabled
          : null,

        pressed &&
        workerId
          ? styles.pressed
          : null,
      ]}
    >
      {/* ======================================================
          AVATAR
      ====================================================== */}

      <View
        style={
          styles.avatar
        }
      >
        <AppIcon
          name="profile"
          role="customer"
          size="md"
          color={
            CustomerColors.primary
          }
        />
      </View>

      {/* ======================================================
          WORKER
      ====================================================== */}

      <View
        style={
          styles.content
        }
      >
        <View
          style={
            styles.nameRow
          }
        >
          <AppText
            variant="body"
            weight="bold"
            numberOfLines={1}
            style={
              styles.name
            }
          >
            {workerName}
          </AppText>

          {worker.verified ? (
            <View
              accessibilityLabel="Verified worker"
              style={
                styles.verified
              }
            >
              <AppIcon
                name="verified"
                size="xs"
                color={
                  Colors.success
                }
              />
            </View>
          ) : null}
        </View>

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={1}
          style={
            styles.category
          }
        >
          {category}
        </AppText>
      </View>

      {/* ======================================================
          RATING
      ====================================================== */}

      <View
        accessibilityLabel={`${rating.toFixed(
          1,
        )} out of 5 stars`}
        style={
          styles.rating
        }
      >
        <AppIcon
          name="star"
          size="xs"
          color={
            Colors.warning
          }
        />

        <AppText
          variant="caption"
          weight="bold"
          style={
            styles.ratingText
          }
        >
          {rating.toFixed(
            1,
          )}
        </AppText>
      </View>

      <AppIcon
        name="next"
        size="sm"
        color={
          Colors.textMuted
        }
      />
    </Pressable>
  );
}

/* ============================================================
   MEMO
============================================================ */

const MemoizedWorkerResultCard =
  memo(
    WorkerResultCard,
  );

MemoizedWorkerResultCard.displayName =
  "WorkerResultCard";

export default MemoizedWorkerResultCard;

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      minHeight: 80,

      marginHorizontal:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    avatar: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    content: {
      flex: 1,

      minWidth: 0,
    },

    nameRow: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    name: {
      flexShrink: 1,

      color:
        Colors.textPrimary,
    },

    verified: {
      marginLeft:
        FixxamTokens.spacing.xs,

      flexShrink: 0,
    },

    category: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },

    rating: {
      flexShrink: 0,

      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        Colors.warningSoft,
    },

    ratingText: {
      color:
        Colors.textPrimary,
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

    disabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },
  });