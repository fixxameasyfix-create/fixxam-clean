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

import { onAuthStateChanged } from "firebase/auth";

import { auth, db } from "@/firebase/config";

/* ============================================================
   CONSTANTS
============================================================ */

const ANDROID_CHANNEL_ID = "fixxam-default";

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
  easConfig?: ExpoConfigWithProject;
};

/* ============================================================
   PROJECT ID
============================================================ */

function getExpoProjectId(): string | null {
  const constants =
    Constants as unknown as ConstantsWithExpoConfig;

  const projectId =
    constants.expoConfig?.extra?.eas?.projectId ??
    constants.easConfig?.projectId;

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

  try {
    await Notifications.setNotificationChannelAsync(
      ANDROID_CHANNEL_ID,
      {
        name: "Fixxam Notifications",
        description:
          "Booking, market order and service updates from Fixxam.",

        importance:
          Notifications.AndroidImportance.MAX,

        sound: "default",

        vibrationPattern: [
          0,
          250,
          250,
          250,
        ],

        lightColor: "#FFFFFF",

        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,

        enableVibrate: true,
        enableLights: true,
        showBadge: true,
      },
    );

    console.log(
      "FIXXAM_NOTIFICATION_CHANNEL_READY",
      {
        channelId: ANDROID_CHANNEL_ID,
      },
    );
  } catch (error) {
    console.error(
      "FIXXAM_NOTIFICATION_CHANNEL_ERROR:",
      error,
    );

    throw error;
  }
}

/* ============================================================
   PERMISSION
============================================================ */

async function requestNotificationPermission(): Promise<boolean> {
  try {
    const currentPermissions =
      await Notifications.getPermissionsAsync();

    let finalStatus =
      currentPermissions.status;

    if (finalStatus !== "granted") {
      const requestedPermissions =
        await Notifications.requestPermissionsAsync();

      finalStatus =
        requestedPermissions.status;
    }

    if (finalStatus !== "granted") {
      console.warn(
        "FIXXAM_PUSH_PERMISSION_DENIED",
        {
          status: finalStatus,
        },
      );

      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "FIXXAM_PUSH_PERMISSION_ERROR:",
      error,
    );

    return false;
  }
}

/* ============================================================
   GET EXPO PUSH TOKEN
============================================================ */

async function getExpoPushToken(): Promise<string | null> {
  try {
    const projectId =
      getExpoProjectId();

    if (!projectId) {
      console.error(
        "FIXXAM_PUSH_PROJECT_ID_MISSING",
      );

      return null;
    }

    const tokenResponse =
      await Notifications.getExpoPushTokenAsync({
        projectId,
      });

    const token =
      tokenResponse.data?.trim();

    if (!token) {
      console.error(
        "FIXXAM_PUSH_TOKEN_INVALID",
      );

      return null;
    }

    return token;
  } catch (error) {
    console.error(
      "FIXXAM_PUSH_TOKEN_FETCH_ERROR:",
      error,
    );

    return null;
  }
}

/* ============================================================
   SAVE TOKEN
============================================================ */

async function savePushToken(
  uid: string,
  expoPushToken: string,
): Promise<void> {
  const userRef =
    doc(db, "users", uid);

  await setDoc(
    userRef,
    {
      expoPushTokens:
        arrayUnion(expoPushToken),

      pushNotificationsEnabled:
        true,

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
    "FIXXAM_PUSH_TOKEN_SAVED",
    {
      uid,
      tokenPrefix:
        expoPushToken.slice(0, 24),
    },
  );
}

/* ============================================================
   REGISTER PUSH TOKEN
============================================================ */

async function registerPushToken(
  uid: string,
): Promise<void> {
  try {
    /* --------------------------------------------------------
       Physical device
    -------------------------------------------------------- */

    if (!Device.isDevice) {
      console.warn(
        "FIXXAM_PUSH_TOKEN_SKIPPED",
        "Push notifications require a physical device.",
      );

      return;
    }

    /* --------------------------------------------------------
       Android channel
    -------------------------------------------------------- */

    await configureAndroidChannel();

    /* --------------------------------------------------------
       Permission
    -------------------------------------------------------- */

    const permissionGranted =
      await requestNotificationPermission();

    if (!permissionGranted) {
      return;
    }

    /* --------------------------------------------------------
       Expo push token
    -------------------------------------------------------- */

    const expoPushToken =
      await getExpoPushToken();

    if (!expoPushToken) {
      return;
    }

    /* --------------------------------------------------------
       Save to Firestore
    -------------------------------------------------------- */

    await savePushToken(
      uid,
      expoPushToken,
    );

    console.log(
      "FIXXAM_PUSH_TOKEN_REGISTERED",
      {
        uid,
        tokenPrefix:
          expoPushToken.slice(0, 24),
      },
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
          if (!mounted || !user) {
            return;
          }

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