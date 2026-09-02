import { useEffect } from "react";

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

import {
  arrayUnion,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  auth,
  db,
} from "@/firebase/config";

/* ============================================================
   TYPES
============================================================ */

type ExpoConfigWithProject = {
  projectId?: string;
};

type ConstantsWithExpoConfig = {
  expoConfig?: {
    extra?: {
      eas?: ExpoConfigWithProject;
    };
  };
};

/* ============================================================
   PROJECT ID
============================================================ */

function getExpoProjectId(): string | null {
  const constants =
    Constants as unknown as ConstantsWithExpoConfig;

  const projectId =
    constants.expoConfig?.extra?.eas?.projectId;

  if (
    typeof projectId !== "string" ||
    projectId.trim().length === 0
  ) {
    return null;
  }

  return projectId.trim();
}

/* ============================================================
   ANDROID CHANNEL
============================================================ */

async function configureAndroidChannel(): Promise<void> {
  if (Device.osName !== "Android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(
    "fixxam-default",
    {
      name: "Fixxam Notifications",
      description:
        "Booking, market order and service updates from Fixxam.",
      importance:
        Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FFFFFF",
      sound: "default",
      lockscreenVisibility:
        Notifications.AndroidNotificationVisibility.PUBLIC,
      enableVibrate: true,
      enableLights: true,
      showBadge: true,
    },
  );
}

/* ============================================================
   PERMISSION
============================================================ */

async function requestNotificationPermission(): Promise<boolean> {
  const currentPermissions =
    await Notifications.getPermissionsAsync();

  let finalStatus =
    currentPermissions.status;

  if (finalStatus !== "granted") {
    const requested =
      await Notifications.requestPermissionsAsync();

    finalStatus = requested.status;
  }

  return finalStatus === "granted";
}

/* ============================================================
   REGISTER TOKEN
============================================================ */

async function registerPushToken(
  uid: string,
): Promise<void> {
  try {
    /* --------------------------------------------------------
       Physical device check
    -------------------------------------------------------- */

    if (!Device.isDevice) {
      console.warn(
        "FIXXAM_PUSH_TOKEN_SKIPPED: Push notifications require a physical device.",
      );

      return;
    }

    /* --------------------------------------------------------
       Android notification channel
    -------------------------------------------------------- */

    await configureAndroidChannel();

    /* --------------------------------------------------------
       Permission
    -------------------------------------------------------- */

    const permissionGranted =
      await requestNotificationPermission();

    if (!permissionGranted) {
      console.warn(
        "FIXXAM_PUSH_PERMISSION_DENIED",
      );

      return;
    }

    /* --------------------------------------------------------
       Expo project ID
    -------------------------------------------------------- */

    const projectId =
      getExpoProjectId();

    if (!projectId) {
      console.error(
        "FIXXAM_PUSH_PROJECT_ID_MISSING: Add EAS projectId to app.json.",
      );

      return;
    }

    /* --------------------------------------------------------
       Expo Push Token
    -------------------------------------------------------- */

    const tokenResponse =
      await Notifications.getExpoPushTokenAsync({
        projectId,
      });

    const expoPushToken =
      tokenResponse.data;

    if (
      typeof expoPushToken !== "string" ||
      expoPushToken.trim().length === 0
    ) {
      console.error(
        "FIXXAM_PUSH_TOKEN_INVALID",
      );

      return;
    }

    /* --------------------------------------------------------
       Save token
    -------------------------------------------------------- */

    const userRef = doc(
      db,
      "users",
      uid,
    );

    await setDoc(
      userRef,
      {
        expoPushTokens:
          arrayUnion(expoPushToken),

        pushNotificationsEnabled: true,

        pushTokenUpdatedAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),
      },
      {
        merge: true,
      },
    );

    console.log(
      "FIXXAM_PUSH_TOKEN_REGISTERED",
    );
  } catch (error) {
    console.error(
      "FIXXAM_PUSH_TOKEN_REGISTRATION_ERROR:",
      error,
    );
  }
}

/* ============================================================
   HOOK
============================================================ */

export default function useRegisterPushToken(): void {
  useEffect(() => {
    let mounted = true;

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          if (!mounted) {
            return;
          }

          /* --------------------------------------------------
             User logged out
          -------------------------------------------------- */

          if (!user) {
            return;
          }

          /* --------------------------------------------------
             Register current device
          -------------------------------------------------- */

          await registerPushToken(
            user.uid,
          );
        },
      );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);
}