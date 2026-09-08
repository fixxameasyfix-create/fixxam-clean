import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  useWorkerNotifications,
} from "@/hooks/notifications/useWorkerNotifications";

import {
  FixxamTokens,
} from "@/theme";

import HeaderAvatar from "./HeaderAvatar";
import HeaderGreeting from "./HeaderGreeting";
import HeaderNotification from "./HeaderNotification";
import HeaderStatus from "./HeaderStatus";
import WorkerNotificationModal from "./WorkerNotificationModal";

/* ============================================================
   TYPES
============================================================ */

type PublicWorkerProfile = {
  uid?: string;

  firstName?: string;

  otherName?: string;

  surname?: string;

  fullName?: string;

  name?: string;

  photoUrl?: string;

  photoURL?: string;

  rating?: number;

  online?: boolean;

  available?: boolean;

  location?: string;
};

type Props = {
  workerName?: string;

  photoURL?: string | null;

  notificationCount?: number;

  available?: boolean;

  rating?: number;

  location?: string;

  onAvatarPress?: () => void;

  onNotifications?: () => void;
};

/* ============================================================
   HELPERS
============================================================ */

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function isHttpUrl(
  value: string,
): boolean {
  return (
    value.startsWith("https://") ||
    value.startsWith("http://")
  );
}

function getSafeRating(
  value: unknown,
  fallback = 0,
): number {
  const rating =
    typeof value === "number" &&
    Number.isFinite(value)
      ? value
      : fallback;

  if (
    !Number.isFinite(rating)
  ) {
    return 0;
  }

  return Math.min(
    5,
    Math.max(
      0,
      rating,
    ),
  );
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

/* ============================================================
   COMPONENT
============================================================ */

function Header({
  workerName = "",
  photoURL = null,
  notificationCount = 0,
  available = true,
  rating = 4.9,
  location = "",
  onAvatarPress,
  onNotifications,
}: Props) {
  const [
    publicProfile,
    setPublicProfile,
  ] =
    useState<PublicWorkerProfile | null>(
      null,
    );

  const [
    notificationsVisible,
    setNotificationsVisible,
  ] =
    useState(false);

  const {
    notifications,
    unreadCount,
    loading:
      notificationsLoading,
  } =
    useWorkerNotifications();

  /* ==========================================================
     PUBLIC PROFILE LISTENER
  ========================================================== */

  useEffect(() => {
    let unsubscribeProfile:
      | (() => void)
      | undefined;

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        user => {
          unsubscribeProfile?.();

          unsubscribeProfile =
            undefined;

          if (!user) {
            setPublicProfile(
              null,
            );

            return;
          }

          const profileRef =
            doc(
              db,
              "workerPublicProfiles",
              user.uid,
            );

          unsubscribeProfile =
            onSnapshot(
              profileRef,
              snapshot => {
                if (
                  !snapshot.exists()
                ) {
                  setPublicProfile(
                    null,
                  );

                  return;
                }

                setPublicProfile(
                  snapshot.data() as PublicWorkerProfile,
                );
              },
              error => {
                console.error(
                  "FIXXAM_WORKER_HEADER_PROFILE_ERROR:",
                  error,
                );

                setPublicProfile(
                  null,
                );
              },
            );
        },
      );

    return () => {
      unsubscribeProfile?.();

      unsubscribeAuth();
    };
  }, []);

  /* ==========================================================
     DISPLAY NAME
  ========================================================== */

  const displayWorkerName =
    useMemo(() => {
      const publicName =
        cleanString(
          publicProfile?.fullName,
        ) ||
        cleanString(
          publicProfile?.name,
        );

      if (publicName) {
        return publicName;
      }

      const generatedName =
        [
          publicProfile?.firstName,
          publicProfile?.otherName,
          publicProfile?.surname,
        ]
          .map(
            cleanString,
          )
          .filter(
            Boolean,
          )
          .join(" ")
          .trim();

      if (generatedName) {
        return generatedName;
      }

      return (
        cleanString(
          workerName,
        ) ||
        cleanString(
          auth.currentUser
            ?.displayName,
        ) ||
        "Worker"
      );
    }, [
      publicProfile,
      workerName,
    ]);

  /* ==========================================================
     PHOTO
  ========================================================== */

  const displayPhotoURL =
    useMemo(() => {
      const publicPhoto =
        cleanString(
          publicProfile?.photoUrl,
        ) ||
        cleanString(
          publicProfile?.photoURL,
        );

      if (
        publicPhoto &&
        isHttpUrl(
          publicPhoto,
        )
      ) {
        return publicPhoto;
      }

      const propPhoto =
        cleanString(
          photoURL,
        );

      if (
        propPhoto &&
        isHttpUrl(
          propPhoto,
        )
      ) {
        return propPhoto;
      }

      const authPhoto =
        cleanString(
          auth.currentUser
            ?.photoURL,
        );

      return isHttpUrl(
        authPhoto,
      )
        ? authPhoto
        : null;
    }, [
      publicProfile,
      photoURL,
    ]);

  /* ==========================================================
     STATUS
  ========================================================== */

  const displayAvailable =
    typeof publicProfile?.available ===
    "boolean"
      ? publicProfile.available
      : available;

  const displayRating =
    useMemo(
      () =>
        getSafeRating(
          publicProfile?.rating,
          getSafeRating(
            rating,
          ),
        ),
      [
        publicProfile?.rating,
        rating,
      ],
    );

  const displayLocation =
    useMemo(
      () =>
        cleanString(
          publicProfile?.location,
        ) ||
        cleanString(
          location,
        ) ||
        "Location unavailable",
      [
        publicProfile?.location,
        location,
      ],
    );

  /* ==========================================================
     NOTIFICATIONS
  ========================================================== */

  const liveNotificationCount =
    useMemo(() => {
      const liveCount =
        getSafeCount(
          unreadCount,
        );

      /*
       * 0 is a valid realtime value.
       * Do not fall back to a stale prop
       * just because the realtime count is zero.
       */
      if (
        liveCount !== null
      ) {
        return liveCount;
      }

      return (
        getSafeCount(
          notificationCount,
        ) ?? 0
      );
    }, [
      notificationCount,
      unreadCount,
    ]);

  const handleNotifications =
    useCallback(() => {
      setNotificationsVisible(
        true,
      );

      onNotifications?.();
    }, [
      onNotifications,
    ]);

  const handleCloseNotifications =
    useCallback(() => {
      setNotificationsVisible(
        false,
      );
    }, []);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      <View
        style={
          styles.container
        }
      >
        {/* ====================================================
            TOP
        ==================================================== */}

        <View
          style={
            styles.topRow
          }
        >
          <HeaderAvatar
            workerName={
              displayWorkerName
            }
            photoURL={
              displayPhotoURL
            }
            onPress={
              onAvatarPress
            }
          />

          <View
            style={
              styles.identity
            }
          >
            <HeaderGreeting
              workerName={
                displayWorkerName
              }
            />
          </View>

          <View
            style={
              styles.notification
            }
          >
            <HeaderNotification
              count={
                liveNotificationCount
              }
              onPress={
                handleNotifications
              }
            />
          </View>
        </View>

        {/* ====================================================
            STATUS
        ==================================================== */}

        <View
          style={
            styles.statusRow
          }
        >
          <HeaderStatus
            available={
              displayAvailable
            }
            rating={
              displayRating
            }
            location={
              displayLocation
            }
          />
        </View>
      </View>

      {/* ======================================================
          NOTIFICATIONS MODAL
      ====================================================== */}

      <WorkerNotificationModal
        visible={
          notificationsVisible
        }
        loading={
          notificationsLoading
        }
        notifications={
          notifications
        }
        onClose={
          handleCloseNotifications
        }
      />
    </>
  );
}

/* ============================================================
   MEMO
============================================================ */

Header.displayName =
  "WorkerHomeHeader";

export default memo(
  Header,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.sm,
    },

    topRow: {
      width: "100%",

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    identity: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    notification: {
      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    statusRow: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.sm,
    },
  });