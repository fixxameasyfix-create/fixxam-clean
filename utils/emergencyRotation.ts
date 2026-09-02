import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  EMERGENCY_SERVICES,
} from "@/constants/emergencyServices";

const STORAGE_KEY =
  "@fixxam/emergency-login-index";

function getSafeIndex(index: number): number {
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= EMERGENCY_SERVICES.length
  ) {
    return 0;
  }

  return index;
}

/**
 * Called after every successful login.
 *
 * Moves the emergency service to the next item.
 */
export async function advanceEmergencyOnLogin(): Promise<void> {
  if (EMERGENCY_SERVICES.length === 0) {
    return;
  }

  try {
    const stored =
      await AsyncStorage.getItem(STORAGE_KEY);

    let currentIndex = -1;

    if (stored) {
      try {
        const parsed: unknown =
          JSON.parse(stored);

        if (
          typeof parsed === "object" &&
          parsed !== null &&
          "index" in parsed &&
          typeof parsed.index === "number"
        ) {
          currentIndex = parsed.index;
        }
      } catch {
        currentIndex = -1;
      }
    }

    const nextIndex =
      (getSafeIndex(currentIndex) + 1) %
      EMERGENCY_SERVICES.length;

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        index: nextIndex,
        updatedAt: Date.now(),
      }),
    );
  } catch (error) {
    console.warn(
      "[EmergencyRotation] Failed to advance:",
      error,
    );
  }
}

/**
 * Returns the emergency service index
 * selected during the latest successful login.
 */
export async function getEmergencyLoginIndex(): Promise<number> {
  if (EMERGENCY_SERVICES.length === 0) {
    return 0;
  }

  try {
    const stored =
      await AsyncStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return 0;
    }

    const parsed: unknown =
      JSON.parse(stored);

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "index" in parsed &&
      typeof parsed.index === "number"
    ) {
      return getSafeIndex(parsed.index);
    }

    return 0;
  } catch (error) {
    console.warn(
      "[EmergencyRotation] Failed to read index:",
      error,
    );

    return 0;
  }
}