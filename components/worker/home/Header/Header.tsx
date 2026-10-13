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

import * as Location from "expo-location";

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

type WorkerLocation = {
  address?: string;

  state?: string;

  lga?: string;

  latitude?: number | null;

  longitude?: number | null;
};

type PublicWorkerProfile = {
  uid?: string;

  firstName?: string;

  otherName?: string;

  surname?: string;

  fullName?: string;

  name?: string;

  photoUrl?: string;

  photoURL?: string;

  workerProfile?: {
    photoUrl?: string;

    photoURL?: string;

    fullName?: string;

    name?: string;

    location?: string;

    state?: string;

    lga?: string;

    latitude?: number | null;

    longitude?: number | null;

    serviceLocation?: WorkerLocation;
  };

  rating?: number;

  online?: boolean;

  available?: boolean;

  location?: string;

  state?: string;

  lga?: string;

  latitude?: number | null;

  longitude?: number | null;

  serviceLocation?: WorkerLocation;
};

type WorkerUserProfile = {
  firstName?: string;

  otherName?: string;

  surname?: string;

  fullName?: string;

  name?: string;

  phoneNumber?: string;

  photoUrl?: string | null;

  photoURL?: string | null;

  location?: string;

  state?: string;

  lga?: string;

  latitude?: number | null;

  longitude?: number | null;

  serviceLocation?: WorkerLocation;

  workerProfile?: {
    photoUrl?: string | null;

    photoURL?: string | null;

    fullName?: string;

    name?: string;

    location?: string;

    state?: string;

    lga?: string;

    latitude?: number | null;

    longitude?: number | null;

    serviceLocation?: WorkerLocation;
  };
};

type WorkerHeaderProfile = {
  publicProfile:
    | PublicWorkerProfile
    | null;

  userProfile:
    | WorkerUserProfile
    | null;
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

/* ============================================================
   VALID PHOTO URL
============================================================ */

function isHttpUrl(
  value: string,
): boolean {
  return (
    value.startsWith(
      "https://",
    ) ||
    value.startsWith(
      "http://",
    )
  );
}

/* ============================================================
   SAFE RATING
============================================================ */

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
    !Number.isFinite(
      rating,
    )
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

/* ============================================================
   SAFE COUNT
============================================================ */

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
   NUMBER
============================================================ */

function getValidCoordinate(
  value: unknown,
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  return value;
}

/* ============================================================
   NAME BUILDER
============================================================ */

function getFullName(
  profile:
    | PublicWorkerProfile
    | WorkerUserProfile
    | null
    | undefined,
): string {
  if (!profile) {
    return "";
  }

  const directName =
    cleanString(
      profile.fullName,
    ) ||
    cleanString(
      profile.name,
    );

  if (directName) {
    return directName;
  }

  const generatedName =
    [
      profile.firstName,
      profile.otherName,
      profile.surname,
    ]
      .map(cleanString)
      .filter(Boolean)
      .join(" ")
      .trim();

  return generatedName;
}

/* ============================================================
   PHOTO RESOLVER
============================================================ */

function resolveWorkerPhoto(
  userProfile:
    | WorkerUserProfile
    | null,

  publicProfile:
    | PublicWorkerProfile
    | null,

  authPhotoURL:
    | string
    | null
    | undefined,

  propPhotoURL:
    | string
    | null
    | undefined,
): string | null {
  const userWorkerPhoto =
    cleanString(
      userProfile
        ?.workerProfile
        ?.photoUrl,
    ) ||
    cleanString(
      userProfile
        ?.workerProfile
        ?.photoURL,
    );

  if (
    userWorkerPhoto &&
    isHttpUrl(
      userWorkerPhoto,
    )
  ) {
    return userWorkerPhoto;
  }

  const userPhoto =
    cleanString(
      userProfile?.photoUrl,
    ) ||
    cleanString(
      userProfile?.photoURL,
    );

  if (
    userPhoto &&
    isHttpUrl(
      userPhoto,
    )
  ) {
    return userPhoto;
  }

  const publicWorkerPhoto =
    cleanString(
      publicProfile
        ?.workerProfile
        ?.photoUrl,
    ) ||
    cleanString(
      publicProfile
        ?.workerProfile
        ?.photoURL,
    );

  if (
    publicWorkerPhoto &&
    isHttpUrl(
      publicWorkerPhoto,
    )
  ) {
    return publicWorkerPhoto;
  }

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

  const authPhoto =
    cleanString(
      authPhotoURL,
    );

  if (
    authPhoto &&
    isHttpUrl(
      authPhoto,
    )
  ) {
    return authPhoto;
  }

  const propPhoto =
    cleanString(
      propPhotoURL,
    );

  if (
    propPhoto &&
    isHttpUrl(
      propPhoto,
    )
  ) {
    return propPhoto;
  }

  return null;
}

/* ============================================================
   LOCATION RESOLVER
============================================================ */

function resolveWorkerCoordinates(
  userProfile:
    | WorkerUserProfile
    | null,

  publicProfile:
    | PublicWorkerProfile
    | null,
): {
  latitude: number | null;
  longitude: number | null;
} {
  const candidates = [
    {
      latitude:
        userProfile
          ?.workerProfile
          ?.latitude,

      longitude:
        userProfile
          ?.workerProfile
          ?.longitude,
    },

    {
      latitude:
        userProfile
          ?.serviceLocation
          ?.latitude,

      longitude:
        userProfile
          ?.serviceLocation
          ?.longitude,
    },

    {
      latitude:
        userProfile?.latitude,

      longitude:
        userProfile?.longitude,
    },

    {
      latitude:
        publicProfile
          ?.workerProfile
          ?.latitude,

      longitude:
        publicProfile
          ?.workerProfile
          ?.longitude,
    },

    {
      latitude:
        publicProfile
          ?.serviceLocation
          ?.latitude,

      longitude:
        publicProfile
          ?.serviceLocation
          ?.longitude,
    },

    {
      latitude:
        publicProfile?.latitude,

      longitude:
        publicProfile?.longitude,
    },
  ];

  for (
    const candidate of candidates
  ) {
    const latitude =
      getValidCoordinate(
        candidate.latitude,
      );

    const longitude =
      getValidCoordinate(
        candidate.longitude,
      );

    if (
      latitude !== null &&
      longitude !== null
    ) {
      return {
        latitude,
        longitude,
      };
    }
  }

  return {
    latitude: null,
    longitude: null,
  };
}

/* ============================================================
   FALLBACK LOCATION
============================================================ */

function resolveStoredLocation(
  userProfile:
    | WorkerUserProfile
    | null,

  publicProfile:
    | PublicWorkerProfile
    | null,

  propLocation: string,
): string {
  const serviceLocations = [
    userProfile
      ?.workerProfile
      ?.serviceLocation,

    userProfile?.serviceLocation,

    publicProfile
      ?.workerProfile
      ?.serviceLocation,

    publicProfile?.serviceLocation,
  ];

  for (
    const serviceLocation of
    serviceLocations
  ) {
    const address =
      cleanString(
        serviceLocation?.address,
      );

    if (address) {
      return address;
    }
  }

  const directLocations = [
    userProfile
      ?.workerProfile
      ?.location,

    userProfile?.location,

    publicProfile
      ?.workerProfile
      ?.location,

    publicProfile?.location,

    propLocation,
  ];

  for (
    const value of directLocations
  ) {
    const location =
      cleanString(value);

    if (location) {
      return location;
    }
  }

  const state =
    cleanString(
      userProfile
        ?.workerProfile
        ?.state,
    ) ||
    cleanString(
      userProfile?.state,
    ) ||
    cleanString(
      publicProfile
        ?.workerProfile
        ?.state,
    ) ||
    cleanString(
      publicProfile?.state,
    );

  const lga =
    cleanString(
      userProfile
        ?.workerProfile
        ?.lga,
    ) ||
    cleanString(
      userProfile?.lga,
    ) ||
    cleanString(
      publicProfile
        ?.workerProfile
        ?.lga,
    ) ||
    cleanString(
      publicProfile?.lga,
    );

  if (
    lga &&
    state
  ) {
    return `${lga}, ${state}`;
  }

  return lga || state || "";
}

/* ============================================================
   REVERSE GEOCODE
============================================================ */

async function reverseGeocodeWorkerLocation(
  latitude: number,
  longitude: number,
): Promise<string> {
  try {
    const results =
      await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

    if (
      !results.length
    ) {
      return "";
    }

    const place =
      results[0];

    const district =
      cleanString(
        place.district,
      );

    const city =
      cleanString(
        place.city,
      );

    const subregion =
      cleanString(
        place.subregion,
      );

    const region =
      cleanString(
        place.region,
      );

    /*
     * Prefer the most useful
     * human-readable local information.
     */
    const primary =
      city ||
      district ||
      subregion;

    if (
      primary &&
      region &&
      primary.toLowerCase() !==
        region.toLowerCase()
    ) {
      return `${primary}, ${region}`;
    }

    return (
      primary ||
      region ||
      ""
    );
  } catch (
    error
  ) {
    console.warn(
      "[WorkerHomeHeader] Reverse geocoding failed:",
      error,
    );

    return "";
  }
}

/* ============================================================
   COMPONENT
============================================================ */

function Header({
  workerName = "",
  photoURL = null,
  notificationCount = 0,
  rating = 0,
  location = "",
  onAvatarPress,
  onNotifications,
}: Props) {
  /* ==========================================================
     PROFILE STATE
  ========================================================== */

  const [
    headerProfile,
    setHeaderProfile,
  ] =
    useState<WorkerHeaderProfile>(
      () => ({
        publicProfile:
          null,

        userProfile:
          null,
      }),
    );

  const [
    notificationsVisible,
    setNotificationsVisible,
  ] =
    useState(false);

  const [
    resolvedLocation,
    setResolvedLocation,
  ] =
    useState("");

  /* ==========================================================
     NOTIFICATIONS
  ========================================================== */

  const {
    notifications,
    unreadCount,
    loading:
      notificationsLoading,
    markNotificationAsRead,
  } =
    useWorkerNotifications();

  /* ==========================================================
     WORKER PROFILE LISTENERS
  ========================================================== */

  useEffect(() => {
    let unsubscribePublicProfile:
      | (() => void)
      | undefined;

    let unsubscribeUserProfile:
      | (() => void)
      | undefined;

    let unsubscribeAuth:
      | (() => void)
      | undefined;

    let active = true;

    let subscribedUid:
      | string
      | null = null;

    const clearProfile =
      () => {
        if (!active) {
          return;
        }

        setHeaderProfile({
          publicProfile:
            null,

          userProfile:
            null,
        });

        setResolvedLocation("");
      };

    const stopProfileListeners =
      () => {
        unsubscribePublicProfile?.();

        unsubscribeUserProfile?.();

        unsubscribePublicProfile =
          undefined;

        unsubscribeUserProfile =
          undefined;

        subscribedUid =
          null;
      };

    const subscribeToWorker =
      (
        uid: string,
      ) => {
        if (!active) {
          return;
        }

        const normalizedUid =
          uid.trim();

        if (
          !normalizedUid
        ) {
          stopProfileListeners();

          clearProfile();

          return;
        }

        if (
          subscribedUid ===
          normalizedUid
        ) {
          return;
        }

        stopProfileListeners();

        subscribedUid =
          normalizedUid;

        const publicProfileRef =
          doc(
            db,
            "workerPublicProfiles",
            normalizedUid,
          );

        const userProfileRef =
          doc(
            db,
            "users",
            normalizedUid,
          );

        /* ====================================================
           PUBLIC PROFILE
        ==================================================== */

        unsubscribePublicProfile =
          onSnapshot(
            publicProfileRef,

            snapshot => {
              if (!active) {
                return;
              }

              if (
                !snapshot.exists()
              ) {
                return;
              }

              const data =
                snapshot.data();

              setHeaderProfile(
                current => ({
                  ...current,

                  publicProfile:
                    data as PublicWorkerProfile,
                }),
              );
            },

            error => {
              console.error(
                "FIXXAM_WORKER_HEADER_PUBLIC_PROFILE_ERROR:",
                error,
              );
            },
          );

        /* ====================================================
           USER PROFILE
        ==================================================== */

        unsubscribeUserProfile =
          onSnapshot(
            userProfileRef,

            snapshot => {
              if (!active) {
                return;
              }

              if (
                !snapshot.exists()
              ) {
                return;
              }

              const data =
                snapshot.data();

              setHeaderProfile(
                current => ({
                  ...current,

                  userProfile:
                    data as WorkerUserProfile,
                }),
              );
            },

            error => {
              console.error(
                "FIXXAM_WORKER_HEADER_USER_PROFILE_ERROR:",
                error,
              );
            },
          );
      };

    /* ========================================================
       AUTH
    ======================================================== */

    const handleAuthUser =
      (
        user:
          | typeof auth.currentUser
          | null,
      ) => {
        if (!active) {
          return;
        }

        const uid =
          user?.uid ??
          null;

        if (
          uid &&
          subscribedUid === uid
        ) {
          return;
        }

        if (!uid) {
          stopProfileListeners();

          clearProfile();

          return;
        }

        subscribeToWorker(
          uid,
        );
      };

    if (
      auth.currentUser?.uid
    ) {
      handleAuthUser(
        auth.currentUser,
      );
    }

    unsubscribeAuth =
      onAuthStateChanged(
        auth,
        user => {
          handleAuthUser(
            user,
          );
        },
      );

    return () => {
      active = false;

      stopProfileListeners();

      unsubscribeAuth?.();
    };
  }, []);

  /* ==========================================================
     PROFILE REFERENCES
  ========================================================== */

  const publicProfile =
    headerProfile.publicProfile;

  const userProfile =
    headerProfile.userProfile;

  /* ==========================================================
     DISPLAY NAME
  ========================================================== */

  const displayWorkerName =
    useMemo(() => {
      const userName =
        getFullName(
          userProfile,
        );

      if (userName) {
        return userName;
      }

      const publicName =
        getFullName(
          publicProfile,
        );

      if (publicName) {
        return publicName;
      }

      const authName =
        cleanString(
          auth.currentUser
            ?.displayName,
        );

      if (authName) {
        return authName;
      }

      const propName =
        cleanString(
          workerName,
        );

      if (propName) {
        return propName;
      }

      return "Worker";
    }, [
      publicProfile,
      userProfile,
      workerName,
    ]);

  /* ==========================================================
     DISPLAY PHOTO
  ========================================================== */

  const displayPhotoURL =
    useMemo(
      () =>
        resolveWorkerPhoto(
          userProfile,
          publicProfile,
          auth.currentUser
            ?.photoURL,
          photoURL,
        ),
      [
        photoURL,
        publicProfile,
        userProfile,
      ],
    );

  /* ==========================================================
     ONLINE / AVAILABLE
  ========================================================== */

  const displayAvailable =
    publicProfile?.online === true;

  /* ==========================================================
     RATING
  ========================================================== */

  const displayRating =
    useMemo(() => {
      const publicRating =
        publicProfile?.rating;

      if (
        typeof publicRating ===
          "number" &&
        Number.isFinite(
          publicRating,
        )
      ) {
        return getSafeRating(
          publicRating,
        );
      }

      return getSafeRating(
        rating,
        0,
      );
    }, [
      publicProfile?.rating,
      rating,
    ]);

  /* ==========================================================
     STORED LOCATION
  ========================================================== */

  const storedLocation =
    useMemo(
      () =>
        resolveStoredLocation(
          userProfile,
          publicProfile,
          location,
        ),
      [
        location,
        publicProfile,
        userProfile,
      ],
    );

  /* ==========================================================
     COORDINATES
  ========================================================== */

  const workerCoordinates =
    useMemo(
      () =>
        resolveWorkerCoordinates(
          userProfile,
          publicProfile,
        ),
      [
        publicProfile,
        userProfile,
      ],
    );

  /* ==========================================================
     REVERSE GEOCODE WORKER LOCATION
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    const {
      latitude,
      longitude,
    } =
      workerCoordinates;

    /*
     * No coordinates.
     *
     * Use the saved Firestore location
     * instead.
     */
    if (
      latitude === null ||
      longitude === null
    ) {
      setResolvedLocation(
        "",
      );

      return () => {
        cancelled = true;
      };
    }

    /*
     * Immediately show the stored
     * location while reverse geocoding.
     */
    setResolvedLocation(
      storedLocation,
    );

    const resolveLocation =
      async () => {
        const readableLocation =
          await reverseGeocodeWorkerLocation(
            latitude,
            longitude,
          );

        if (
          cancelled
        ) {
          return;
        }

        if (
          readableLocation
        ) {
          setResolvedLocation(
            readableLocation,
          );

          return;
        }

        /*
         * Keep stored location
         * when reverse geocoding
         * does not return anything.
         */
        setResolvedLocation(
          storedLocation,
        );
      };

    void resolveLocation();

    return () => {
      cancelled = true;
    };
  }, [
    storedLocation,
    workerCoordinates.latitude,
    workerCoordinates.longitude,
  ]);

  /* ==========================================================
     DISPLAY LOCATION
  ========================================================== */

  const displayLocation =
    useMemo(() => {
      return (
        cleanString(
          resolvedLocation,
        ) ||
        cleanString(
          storedLocation,
        ) ||
        "Location unavailable"
      );
    }, [
      resolvedLocation,
      storedLocation,
    ]);

  /* ==========================================================
     NOTIFICATIONS
  ========================================================== */

  const liveNotificationCount =
    useMemo(() => {
      const liveCount =
        getSafeCount(
          unreadCount,
        );

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

  /* ==========================================================
     NOTIFICATION HANDLERS
  ========================================================== */

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
        onMarkAsRead={
          markNotificationAsRead
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