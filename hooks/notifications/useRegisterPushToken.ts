import { useEffect } from "react";

import {
  Platform,
} from "react-native";

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

import {
  arrayUnion,
  doc,
  getDoc,
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
   FOREGROUND NOTIFICATION HANDLER
============================================================ */

/*
 * IMPORTANT:
 *
 * Foreground notification handling is owned by
 * app/_layout.tsx.
 *
 * Keeping another Notifications.setNotificationHandler()
 * here would create two competing global handlers.
 *
 * The root handler is responsible for:
 *
 * - incoming_call behavior
 * - foreground banners
 * - notification list behavior
 * - sound
 * - badge
 *
 * This file remains responsible for:
 *
 * - permissions
 * - Android channels
 * - Expo push token registration
 * - Firestore token persistence
 * - token rotation
 */

/* ============================================================
   NOTIFICATION CHANNELS
============================================================ */

export const FIXXAM_NOTIFICATION_CHANNELS = {
  default: "fixxam-default-v2",
  calls: "fixxam-calls-v2",
  service: "fixxam-service-v2",
  market: "fixxam-market-v2",
  messages: "fixxam-messages-v2",
} as const;

/* ============================================================
   CONSTANTS
============================================================ */

const PUSH_TOKEN_MAX_ATTEMPTS = 3;

const PUSH_TOKEN_RETRY_DELAY_MS = 1500;

/*
 * New users may trigger onAuthStateChanged before their
 * Firestore profile has finished being created.
 *
 * We wait for the profile before attempting to save the
 * push token so Firestore rules evaluate the operation as
 * an update instead of an incomplete user-profile create.
 */

const USER_PROFILE_MAX_ATTEMPTS = 8;

const USER_PROFILE_RETRY_DELAY_MS = 1000;

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

type SafeError = {
  name?: string;
  message?: string;
  code?: string;
  stack?: string;
};

/* ============================================================
   HELPERS
============================================================ */

function delay(
  milliseconds: number,
): Promise<void> {
  return new Promise(resolve => {
    setTimeout(
      resolve,
      milliseconds,
    );
  });
}

function getSafeError(
  error: unknown,
): SafeError {
  if (
    error instanceof Error
  ) {
    const errorWithCode =
      error as Error & {
        code?: unknown;
      };

    return {
      name: error.name,

      message: error.message,

      code:
        typeof errorWithCode.code ===
        "string"
          ? errorWithCode.code
          : undefined,

      stack: error.stack,
    };
  }

  if (
    error &&
    typeof error === "object"
  ) {
    const record =
      error as Record<
        string,
        unknown
      >;

    return {
      name:
        typeof record.name ===
        "string"
          ? record.name
          : undefined,

      message:
        typeof record.message ===
        "string"
          ? record.message
          : String(error),

      code:
        typeof record.code ===
        "string"
          ? record.code
          : undefined,
    };
  }

  return {
    message: String(error),
  };
}

/* ============================================================
   WAIT FOR USER PROFILE
============================================================ */

async function waitForUserProfile(
  uid: string,
): Promise<boolean> {
  const normalizedUid =
    uid.trim();

  if (!normalizedUid) {
    return false;
  }

  const userRef =
    doc(
      db,
      "users",
      normalizedUid,
    );

  for (
    let attempt = 1;
    attempt <=
    USER_PROFILE_MAX_ATTEMPTS;
    attempt++
  ) {
    try {
      const snapshot =
        await getDoc(
          userRef,
        );

      if (
        snapshot.exists()
      ) {
        console.log(
          "FIXXAM_USER_PROFILE_READY_FOR_PUSH",
          {
            uid:
              normalizedUid,

            attempt,
          },
        );

        return true;
      }

      console.log(
        "FIXXAM_USER_PROFILE_WAITING",
        {
          uid:
            normalizedUid,

          attempt,

          maxAttempts:
            USER_PROFILE_MAX_ATTEMPTS,
        },
      );
    } catch (error) {
      console.error(
        "FIXXAM_USER_PROFILE_CHECK_ERROR",
        {
          uid:
            normalizedUid,

          attempt,

          error:
            getSafeError(error),
        },
      );
    }

    if (
      attempt <
      USER_PROFILE_MAX_ATTEMPTS
    ) {
      await delay(
        USER_PROFILE_RETRY_DELAY_MS,
      );
    }
  }

  console.warn(
    "FIXXAM_USER_PROFILE_NOT_READY",
    {
      uid:
        normalizedUid,

      maxAttempts:
        USER_PROFILE_MAX_ATTEMPTS,
    },
  );

  return false;
}

/* ============================================================
   PROJECT ID
============================================================ */

function getExpoProjectId():
  | string
  | null {
  const constants =
    Constants as unknown as
      ConstantsWithExpoConfig;

  const projectId =
    constants.expoConfig
      ?.extra
      ?.eas
      ?.projectId ??
    constants.easConfig
      ?.projectId;

  if (
    typeof projectId !==
      "string" ||
    projectId.trim().length ===
      0
  ) {
    return null;
  }

  return projectId.trim();
}

/* ============================================================
   ANDROID CHANNELS
============================================================ */

async function configureAndroidChannels():
  Promise<void> {
  if (
    Platform.OS !==
    "android"
  ) {
    return;
  }

  try {
    /* ========================================================
       DEFAULT
    ======================================================== */

    await Notifications.setNotificationChannelAsync(
      FIXXAM_NOTIFICATION_CHANNELS.default,
      {
        name:
          "Fixxam Notifications",

        description:
          "General updates and important notifications from Fixxam.",

        importance:
          Notifications.AndroidImportance.HIGH,

        sound:
          "default",

        audioAttributes: {
          contentType:
            Notifications
              .AndroidAudioContentType
              .SONIFICATION,

          usage:
            Notifications
              .AndroidAudioUsage
              .NOTIFICATION,
        },

        vibrationPattern: [
          0,
          250,
          150,
          250,
        ],

        lightColor:
          "#FFFFFF",

        lockscreenVisibility:
          Notifications
            .AndroidNotificationVisibility
            .PUBLIC,

        enableVibrate:
          true,

        enableLights:
          true,

        showBadge:
          true,
      },
    );

    /* ========================================================
       VOICE CALLS
    ======================================================== */

    await Notifications.setNotificationChannelAsync(
      FIXXAM_NOTIFICATION_CHANNELS.calls,
      {
        name:
          "Fixxam Voice Calls",

        description:
          "Incoming and missed Fixxam voice call notifications.",

        importance:
          Notifications.AndroidImportance.MAX,

        sound:
          "default",

        audioAttributes: {
          contentType:
            Notifications
              .AndroidAudioContentType
              .SONIFICATION,

          usage:
            Notifications
              .AndroidAudioUsage
              .NOTIFICATION_RINGTONE,
        },

        vibrationPattern: [
          0,
          500,
          250,
          500,
          250,
          500,
        ],

        lightColor:
          "#FFFFFF",

        lockscreenVisibility:
          Notifications
            .AndroidNotificationVisibility
            .PUBLIC,

        enableVibrate:
          true,

        enableLights:
          true,

        showBadge:
          true,
      },
    );

    /* ========================================================
       SERVICE ORDERS / BOOKINGS
    ======================================================== */

    await Notifications.setNotificationChannelAsync(
      FIXXAM_NOTIFICATION_CHANNELS.service,
      {
        name:
          "Service Orders",

        description:
          "Booking, offers and service progress updates.",

        importance:
          Notifications.AndroidImportance.HIGH,

        sound:
          "default",

        audioAttributes: {
          contentType:
            Notifications
              .AndroidAudioContentType
              .SONIFICATION,

          usage:
            Notifications
              .AndroidAudioUsage
              .NOTIFICATION,
        },

        vibrationPattern: [
          0,
          250,
          150,
          250,
        ],

        lightColor:
          "#FFFFFF",

        lockscreenVisibility:
          Notifications
            .AndroidNotificationVisibility
            .PUBLIC,

        enableVibrate:
          true,

        enableLights:
          true,

        showBadge:
          true,
      },
    );

    /* ========================================================
       MARKET ORDERS
    ======================================================== */

    await Notifications.setNotificationChannelAsync(
      FIXXAM_NOTIFICATION_CHANNELS.market,
      {
        name:
          "Market Orders",

        description:
          "New market orders, order progress, delivery and cancellation updates.",

        importance:
          Notifications.AndroidImportance.HIGH,

        sound:
          "default",

        audioAttributes: {
          contentType:
            Notifications
              .AndroidAudioContentType
              .SONIFICATION,

          usage:
            Notifications
              .AndroidAudioUsage
              .NOTIFICATION,
        },

        vibrationPattern: [
          0,
          250,
          150,
          250,
        ],

        lightColor:
          "#FFFFFF",

        lockscreenVisibility:
          Notifications
            .AndroidNotificationVisibility
            .PUBLIC,

        enableVibrate:
          true,

        enableLights:
          true,

        showBadge:
          true,
      },
    );

    /* ========================================================
       MESSAGES
    ======================================================== */

    await Notifications.setNotificationChannelAsync(
      FIXXAM_NOTIFICATION_CHANNELS.messages,
      {
        name:
          "Messages",

        description:
          "Service and market chat messages.",

        importance:
          Notifications.AndroidImportance.HIGH,

        sound:
          "default",

        audioAttributes: {
          contentType:
            Notifications
              .AndroidAudioContentType
              .SONIFICATION,

          usage:
            Notifications
              .AndroidAudioUsage
              .NOTIFICATION_COMMUNICATION_INSTANT,
        },

        vibrationPattern: [
          0,
          200,
        ],

        lockscreenVisibility:
          Notifications
            .AndroidNotificationVisibility
            .PRIVATE,

        lightColor:
          "#FFFFFF",

        enableVibrate:
          true,

        enableLights:
          true,

        showBadge:
          true,
      },
    );

    /* ========================================================
       VERIFY CHANNELS
    ======================================================== */

    const channelIds =
      Object.values(
        FIXXAM_NOTIFICATION_CHANNELS,
      );

    for (
      const channelId of channelIds
    ) {
      const channel =
        await Notifications.getNotificationChannelAsync(
          channelId,
        );

      console.log(
        "FIXXAM_CHANNEL_STATE",
        {
          channelId,

          exists:
            Boolean(channel),

          importance:
            channel?.importance,

          sound:
            Boolean(
              channel?.sound,
            ),

          vibration:
            Boolean(
              channel?.vibrationPattern,
            ),
        },
      );
    }

    /* ========================================================
       CHANNELS READY
    ======================================================== */

    console.log(
      "FIXXAM_NOTIFICATION_CHANNELS_READY",
      {
        channels:
          channelIds,
      },
    );
  } catch (error) {
    console.error(
      "FIXXAM_NOTIFICATION_CHANNEL_ERROR:",
      getSafeError(error),
    );

    throw error;
  }
}

/* ============================================================
   PERMISSION
============================================================ */

async function requestNotificationPermission():
  Promise<boolean> {
  try {
    const currentPermissions =
      await Notifications.getPermissionsAsync();

    let finalStatus =
      currentPermissions.status;

    if (
      finalStatus !==
      "granted"
    ) {
      const requestedPermissions =
        await Notifications.requestPermissionsAsync();

      finalStatus =
        requestedPermissions.status;
    }

    if (
      finalStatus !==
      "granted"
    ) {
      console.warn(
        "FIXXAM_PUSH_PERMISSION_DENIED",
        {
          status:
            finalStatus,
        },
      );

      return false;
    }

    console.log(
      "FIXXAM_PUSH_PERMISSION_GRANTED",
    );

    return true;
  } catch (error) {
    console.error(
      "FIXXAM_PUSH_PERMISSION_ERROR:",
      getSafeError(error),
    );

    return false;
  }
}

/* ============================================================
   EXPO TOKEN VALIDATION
============================================================ */

function isValidExpoPushToken(
  value: unknown,
): value is string {
  if (
    typeof value !==
    "string"
  ) {
    return false;
  }

  const token =
    value.trim();

  return (
    (
      token.startsWith(
        "ExpoPushToken[",
      ) ||
      token.startsWith(
        "ExponentPushToken[",
      )
    ) &&
    token.endsWith("]")
  );
}

/* ============================================================
   GET EXPO PUSH TOKEN
============================================================ */

async function getExpoPushToken():
  Promise<string | null> {
  const projectId =
    getExpoProjectId();

  if (!projectId) {
    console.error(
      "FIXXAM_PUSH_PROJECT_ID_MISSING",
    );

    return null;
  }

  console.log(
    "FIXXAM_PUSH_PROJECT_ID_READY",
  );

  for (
    let attempt = 1;
    attempt <=
    PUSH_TOKEN_MAX_ATTEMPTS;
    attempt++
  ) {
    try {
      const tokenResponse =
        await Notifications.getExpoPushTokenAsync({
          projectId,
        });

      const token =
        tokenResponse.data?.trim();

      if (
        !token ||
        !isValidExpoPushToken(
          token,
        )
      ) {
        console.error(
          "FIXXAM_PUSH_TOKEN_INVALID",
          {
            attempt,
          },
        );

        return null;
      }

      /*
       * Never log the actual push token.
       */

      console.log(
        "FIXXAM_EXPO_PUSH_TOKEN_READY",
        {
          attempt,
        },
      );

      return token;
    } catch (error) {
      console.error(
        "FIXXAM_PUSH_TOKEN_FETCH_ERROR:",
        {
          attempt,

          maxAttempts:
            PUSH_TOKEN_MAX_ATTEMPTS,

          error:
            getSafeError(error),
        },
      );

      if (
        attempt ===
        PUSH_TOKEN_MAX_ATTEMPTS
      ) {
        return null;
      }

      await delay(
        PUSH_TOKEN_RETRY_DELAY_MS *
          attempt,
      );
    }
  }

  return null;
}

/* ============================================================
   SAVE TOKEN
============================================================ */

async function savePushToken(
  uid: string,
  expoPushToken: string,
): Promise<void> {
  const normalizedUid =
    uid.trim();

  const normalizedToken =
    expoPushToken.trim();

  if (
    !normalizedUid ||
    !isValidExpoPushToken(
      normalizedToken,
    )
  ) {
    return;
  }

  const userRef =
    doc(
      db,
      "users",
      normalizedUid,
    );

  try {
    await setDoc(
      userRef,
      {
        expoPushTokens:
          arrayUnion(
            normalizedToken,
          ),

        pushNotificationsEnabled:
          true,

        pushTokenUpdatedAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),
      },
      {
        merge:
          true,
      },
    );

    console.log(
      "FIXXAM_PUSH_TOKEN_SAVED",
      {
        uid:
          normalizedUid,
      },
    );
  } catch (error) {
    console.error(
      "FIXXAM_PUSH_TOKEN_SAVE_ERROR:",
      {
        uid:
          normalizedUid,

        error:
          getSafeError(error),
      },
    );

    throw error;
  }
}

/* ============================================================
   REGISTER PUSH TOKEN
============================================================ */

async function registerPushToken(
  uid: string,
): Promise<void> {
  try {
    const normalizedUid =
      uid.trim();

    if (!normalizedUid) {
      return;
    }

    /* --------------------------------------------------------
       PHYSICAL DEVICE
    -------------------------------------------------------- */

    if (!Device.isDevice) {
      console.warn(
        "FIXXAM_PUSH_TOKEN_SKIPPED",
        "Push notifications require a physical device.",
      );

      return;
    }

    /* --------------------------------------------------------
       WAIT FOR USER PROFILE
    -------------------------------------------------------- */

    const profileReady =
      await waitForUserProfile(
        normalizedUid,
      );

    if (!profileReady) {
      console.warn(
        "FIXXAM_PUSH_TOKEN_SKIPPED_PROFILE_NOT_READY",
        {
          uid:
            normalizedUid,
        },
      );

      return;
    }

    /* --------------------------------------------------------
       ANDROID CHANNELS
    -------------------------------------------------------- */

    await configureAndroidChannels();

    /* --------------------------------------------------------
       PERMISSION
    -------------------------------------------------------- */

    const permissionGranted =
      await requestNotificationPermission();

    if (!permissionGranted) {
      return;
    }

    /* --------------------------------------------------------
       EXPO PUSH TOKEN
    -------------------------------------------------------- */

    const expoPushToken =
      await getExpoPushToken();

    if (!expoPushToken) {
      console.warn(
        "FIXXAM_PUSH_TOKEN_REGISTRATION_SKIPPED_NO_TOKEN",
        {
          uid:
            normalizedUid,
        },
      );

      return;
    }

    /* --------------------------------------------------------
       SAVE TO FIRESTORE
    -------------------------------------------------------- */

    await savePushToken(
      normalizedUid,
      expoPushToken,
    );

    console.log(
      "FIXXAM_PUSH_TOKEN_REGISTERED",
      {
        uid:
          normalizedUid,
      },
    );
  } catch (error) {
    console.error(
      "FIXXAM_PUSH_TOKEN_REGISTRATION_ERROR:",
      getSafeError(error),
    );
  }
}

/* ============================================================
   HOOK
============================================================ */

export default function useRegisterPushToken():
  void {
  useEffect(() => {
    let mounted = true;

    /*
     * Prevent duplicate registration attempts.
     */

    let registrationInFlight =
      false;

    const safelyRegister =
      async (
        uid: string,
      ) => {
        if (
          !mounted ||
          registrationInFlight
        ) {
          return;
        }

        registrationInFlight =
          true;

        try {
          await registerPushToken(
            uid,
          );
        } finally {
          registrationInFlight =
            false;
        }
      };

    /* ========================================================
       AUTH
    ======================================================== */

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        user => {
          if (
            !mounted ||
            !user
          ) {
            return;
          }

          void safelyRegister(
            user.uid,
          );
        },
      );

    /* ========================================================
       DEVICE TOKEN ROTATION
    ======================================================== */

    const pushTokenSubscription =
      Notifications.addPushTokenListener(
        () => {
          const user =
            auth.currentUser;

          if (
            !mounted ||
            !user
          ) {
            return;
          }

          console.log(
            "FIXXAM_DEVICE_PUSH_TOKEN_CHANGED",
          );

          void safelyRegister(
            user.uid,
          );
        },
      );

    /* ========================================================
       CLEANUP
    ======================================================== */

    return () => {
      mounted = false;

      unsubscribeAuth();

      pushTokenSubscription.remove();
    };
  }, []);
}