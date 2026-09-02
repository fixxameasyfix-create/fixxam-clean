import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/firebase/config";

import HeaderAvatar from "./HeaderAvatar";
import HeaderGreeting from "./HeaderGreeting";
import HeaderNotification from "./HeaderNotification";
import HeaderStatus from "./HeaderStatus";

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

function cleanString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function isHttpUrl(value: string): boolean {
  return (
    value.startsWith("https://") ||
    value.startsWith("http://")
  );
}

/* ============================================================
   HEADER
============================================================ */

export default function Header({
  workerName = "",
  photoURL = null,
  notificationCount = 0,
  available = true,
  rating = 4.9,
  location = "Kano",
  onAvatarPress,
  onNotifications,
}: Props) {
  /* ==========================================================
     PUBLIC PROFILE
  ========================================================== */

  const [publicProfile, setPublicProfile] =
    useState<PublicWorkerProfile | null>(null);

  /* ==========================================================
     REALTIME PROFILE
  ========================================================== */

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setPublicProfile(null);
      return;
    }

    const profileRef = doc(
      db,
      "workerPublicProfiles",
      user.uid,
    );

    const unsubscribe = onSnapshot(
      profileRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setPublicProfile(null);
          return;
        }

        setPublicProfile(
          snapshot.data() as PublicWorkerProfile,
        );
      },
      (listenerError) => {
        console.error(
          "HOME_HEADER_PROFILE_LISTENER_ERROR:",
          listenerError,
        );
      },
    );

    return unsubscribe;
  }, []);

  /* ==========================================================
     WORKER NAME
  ========================================================== */

  const displayWorkerName = useMemo(() => {
    const publicName =
      cleanString(publicProfile?.fullName) ||
      cleanString(publicProfile?.name);

    if (publicName) {
      return publicName;
    }

    const generatedName = [
      publicProfile?.firstName,
      publicProfile?.otherName,
      publicProfile?.surname,
    ]
      .map(cleanString)
      .filter(Boolean)
      .join(" ")
      .trim();

    if (generatedName) {
      return generatedName;
    }

    const propName = cleanString(workerName);

    if (propName) {
      return propName;
    }

    const authName = cleanString(
      auth.currentUser?.displayName,
    );

    return authName || "Worker";
  }, [
    publicProfile,
    workerName,
  ]);

  /* ==========================================================
     WORKER PHOTO
  ========================================================== */

  const displayPhotoURL = useMemo(() => {
    const publicPhoto =
      cleanString(publicProfile?.photoUrl) ||
      cleanString(publicProfile?.photoURL);

    if (
      publicPhoto &&
      isHttpUrl(publicPhoto)
    ) {
      return publicPhoto;
    }

    const propPhoto = cleanString(photoURL);

    if (
      propPhoto &&
      isHttpUrl(propPhoto)
    ) {
      return propPhoto;
    }

    const authPhoto = cleanString(
      auth.currentUser?.photoURL,
    );

    if (
      authPhoto &&
      isHttpUrl(authPhoto)
    ) {
      return authPhoto;
    }

    return null;
  }, [
    publicProfile,
    photoURL,
  ]);

  /* ==========================================================
     AVAILABILITY
  ========================================================== */

  const displayAvailable =
    typeof publicProfile?.available === "boolean"
      ? publicProfile.available
      : available;

  /* ==========================================================
     RATING
  ========================================================== */

  const displayRating =
    typeof publicProfile?.rating === "number" &&
    Number.isFinite(publicProfile.rating)
      ? Math.min(
          5,
          Math.max(0, publicProfile.rating),
        )
      : rating;

  /* ==========================================================
     LOCATION
  ========================================================== */

  const displayLocation =
    cleanString(publicProfile?.location) ||
    location ||
    "Kano";

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View style={styles.container}>
      {/* ======================================================
          TOP
      ====================================================== */}

      <View style={styles.topRow}>
        {/* PROFILE PHOTO */}

        <HeaderAvatar
          workerName={displayWorkerName}
          photoURL={displayPhotoURL}
          onPress={onAvatarPress}
        />

        {/* NAME + SUBTITLE */}

        <View style={styles.identity}>
          <HeaderGreeting
            workerName={displayWorkerName}
          />
        </View>

        {/* NOTIFICATION */}

        <View style={styles.notification}>
          <HeaderNotification
            count={notificationCount}
            onPress={onNotifications}
          />
        </View>
      </View>

      {/* ======================================================
          STATUS
      ====================================================== */}

      <View style={styles.statusRow}>
        <HeaderStatus
          available={displayAvailable}
          rating={displayRating}
          location={displayLocation}
        />
      </View>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingTop: 8,
    paddingBottom: 10,
  },

  topRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },

  identity: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    marginRight: 8,
  },

  notification: {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  statusRow: {
    width: "100%",
    marginTop: 10,
    paddingLeft: 0,
  },
});