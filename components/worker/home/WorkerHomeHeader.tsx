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
  router,
} from "expo-router";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import {
  useWorkerNotifications,
} from "@/hooks/notifications/useWorkerNotifications";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  name?: string;

  photo?: string;

  unreadNotifications?: number;

  location?: string;
};

/* ============================================================
   HELPERS
============================================================ */

function getSafeText(
  value: unknown,
  fallback = "",
): string {
  if (
    typeof value === "string" &&
    value.trim()
  ) {
    return value.trim();
  }

  return fallback;
}

function getSafeCount(
  value: unknown,
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  return Math.max(
    0,
    Math.floor(value),
  );
}

function getGreetingContent(
  date: Date,
) {
  const hour =
    date.getHours();

  if (
    hour >= 5 &&
    hour < 12
  ) {
    return {
      greeting:
        "Good Morning",
      subtitle:
        "Ready to take new jobs today?",
    };
  }

  if (
    hour >= 12 &&
    hour < 17
  ) {
    return {
      greeting:
        "Good Afternoon",
      subtitle:
        "Hope your day is going well.",
    };
  }

  if (
    hour >= 17 &&
    hour < 20
  ) {
    return {
      greeting:
        "Good Evening",
      subtitle:
        "Let's finish today's bookings strong.",
    };
  }

  return {
    greeting:
      "Good Night",
    subtitle:
      "Time to review today's work.",
  };
}

/* ============================================================
   COMPONENT
============================================================ */

function WorkerHomeHeader({
  name = "Worker",
  photo,
  unreadNotifications,
  location,
}: Props) {
  const {
    unreadCount:
      liveUnreadCount,
  } =
    useWorkerNotifications();

  /* ==========================================================
     CURRENT TIME
  ========================================================== */

  const [
    now,
    setNow,
  ] = useState(
    () => new Date(),
  );

  useEffect(() => {
    const timer =
      setInterval(() => {
        setNow(
          new Date(),
        );
      }, 60_000);

    return () => {
      clearInterval(
        timer,
      );
    };
  }, []);

  /* ==========================================================
     SAFE DISPLAY VALUES
  ========================================================== */

  const displayName =
    useMemo(
      () =>
        getSafeText(
          name,
          "Worker",
        ),
      [name],
    );

  const displayPhoto =
    useMemo(
      () =>
        getSafeText(
          photo,
        ),
      [photo],
    );

  const displayLocation =
    useMemo(
      () =>
        getSafeText(
          location,
          "Location unavailable",
        ),
      [location],
    );

  /* ==========================================================
     NOTIFICATIONS
  ========================================================== */

  const notificationCount =
    useMemo(() => {
      const liveCount =
        getSafeCount(
          liveUnreadCount,
        );

      if (
        liveCount !== null
      ) {
        return liveCount;
      }

      return (
        getSafeCount(
          unreadNotifications,
        ) ?? 0
      );
    }, [
      liveUnreadCount,
      unreadNotifications,
    ]);

  const notificationBadge =
    notificationCount > 99
      ? "99+"
      : String(
          notificationCount,
        );

  /* ==========================================================
     GREETING
  ========================================================== */

  const {
    greeting,
    subtitle,
  } =
    useMemo(
      () =>
        getGreetingContent(
          now,
        ),
      [now],
    );

  const dateTime =
    useMemo(
      () =>
        new Intl.DateTimeFormat(
          "en-GB",
          {
            weekday:
              "long",

            day:
              "numeric",

            month:
              "long",

            hour:
              "numeric",

            minute:
              "2-digit",
          },
        ).format(
          now,
        ),
      [now],
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          PROFILE
      ====================================================== */}

      <View
        style={
          styles.left
        }
      >
        {displayPhoto ? (
          <Image
            source={{
              uri:
                displayPhoto,
            }}
            style={
              styles.avatar
            }
            contentFit="cover"
            transition={150}
            recyclingKey={
              displayPhoto
            }
            accessibilityLabel={`${displayName} profile photo`}
          />
        ) : (
          <View
            style={
              styles.placeholder
            }
          >
            <AppIcon
              name="profile"
              role="worker"
              size="lg"
              color={
                WorkerColors.primary
              }
            />
          </View>
        )}

        {/* ====================================================
            INFORMATION
        ==================================================== */}

        <View
          style={
            styles.info
          }
        >
          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.greeting
            }
          >
            {greeting}
          </AppText>

          <AppText
            variant="heading2"
            weight="bold"
            numberOfLines={1}
            style={
              styles.name
            }
          >
            {displayName}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={2}
            style={
              styles.subtitle
            }
          >
            {subtitle}
          </AppText>

          {/* ==================================================
              DATE
          ================================================== */}

          <View
            style={
              styles.metaRow
            }
          >
            <AppIcon
              name="calendar"
              size="xs"
              color={
                Colors.textMuted
              }
            />

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.metaText
              }
            >
              {dateTime}
            </AppText>
          </View>

          {/* ==================================================
              LOCATION
          ================================================== */}

          <View
            style={
              styles.metaRow
            }
          >
            <AppIcon
              name="location"
              size="xs"
              color={
                Colors.textMuted
              }
            />

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.metaText
              }
            >
              {displayLocation}
            </AppText>
          </View>
        </View>
      </View>

      {/* ======================================================
          NOTIFICATIONS
      ====================================================== */}

      <Pressable
        onPress={() => {
          router.push(
            "/(worker)/notifications" as never,
          );
        }}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={
          notificationCount >
          0
            ? `${notificationCount} unread notifications`
            : "Notifications"
        }
        accessibilityHint="Open worker notifications"
        android_ripple={{
          color:
            WorkerColors.primarySoft,

          borderless:
            true,
        }}
        style={({
          pressed,
        }) => [
          styles.notification,

          pressed
            ? styles.notificationPressed
            : null,
        ]}
      >
        <AppIcon
          name="notifications"
          role="worker"
          size="md"
          color={
            WorkerColors.primary
          }
        />

        {notificationCount >
        0 ? (
          <View
            style={
              styles.badge
            }
          >
            <AppText
              weight="bold"
              numberOfLines={1}
              style={
                styles.badgeText
              }
            >
              {notificationBadge}
            </AppText>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

WorkerHomeHeader.displayName =
  "WorkerHomeHeader";

export default memo(
  WorkerHomeHeader,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    /* ========================================================
       PROFILE
    ======================================================== */

    left: {
      flex: 1,

      minWidth: 0,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    avatar: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      flexShrink: 0,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    placeholder: {
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
        WorkerColors.primarySoft,
    },

    /* ========================================================
       INFORMATION
    ======================================================== */

    info: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    greeting: {
      color:
        Colors.textSecondary,
    },

    name: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       META
    ======================================================== */

    metaRow: {
      marginTop:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    metaText: {
      flexShrink: 1,

      marginLeft:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       NOTIFICATION
    ======================================================== */

    notification: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      flexShrink: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      position:
        "relative",

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
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    notificationPressed: {
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
       BADGE
    ======================================================== */

    badge: {
      position:
        "absolute",

      top: -4,

      right: -4,

      minWidth: 20,

      height: 20,

      paddingHorizontal:
        FixxamTokens.spacing.xs,

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
        Colors.error,
    },

    badgeText: {
      fontSize: 9,

      lineHeight: 11,

      color:
        Colors.textInverse,
    },
  });