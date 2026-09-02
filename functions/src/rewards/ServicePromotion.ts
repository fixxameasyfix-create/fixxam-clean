import { onCall, HttpsError } from "firebase-functions/v2/https";
import {
  FieldValue,
  getFirestore,
} from "firebase-admin/firestore";

const db = getFirestore();

const REQUIRED_BOOKINGS = 20;

type ServicePromotionReward = {
  baselineCompletedBookings: number;
  rewardClaimed: boolean;
};

type ServicePromotionStatus = {
  completedBookings: number;
  progress: number;
  requiredBookings: number;
  rewardUnlocked: boolean;
  rewardClaimed: boolean;
};

function normalizeNonNegativeInteger(
  value: unknown,
  fallback = 0,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    return fallback;
  }

  return Math.floor(value);
}

function normalizeBoolean(
  value: unknown,
  fallback = false,
): boolean {
  return typeof value === "boolean"
    ? value
    : fallback;
}

function normalizeReward(
  data?: FirebaseFirestore.DocumentData,
): ServicePromotionReward {
  return {
    baselineCompletedBookings:
      normalizeNonNegativeInteger(
        data?.baselineCompletedBookings,
        0,
      ),

    rewardClaimed: normalizeBoolean(
      data?.rewardClaimed,
      false,
    ),
  };
}

async function getCompletedBookingCount(
  customerId: string,
): Promise<number> {
  const snapshot = await db
    .collection("bookings")
    .where("customerId", "==", customerId)
    .where("status", "==", "completed")
    .get();

  return snapshot.size;
}

function buildStatus(
  completedBookings: number,
  reward: ServicePromotionReward,
): ServicePromotionStatus {
  const safeCompletedBookings =
    normalizeNonNegativeInteger(
      completedBookings,
      0,
    );

  const safeBaseline =
    normalizeNonNegativeInteger(
      reward.baselineCompletedBookings,
      0,
    );

  const progress = Math.max(
    safeCompletedBookings - safeBaseline,
    0,
  );

  const safeProgress = Math.min(
    progress,
    REQUIRED_BOOKINGS,
  );

  return {
    completedBookings: safeProgress,

    progress: safeProgress,

    requiredBookings:
      REQUIRED_BOOKINGS,

    rewardUnlocked:
      safeProgress >= REQUIRED_BOOKINGS &&
      !reward.rewardClaimed,

    rewardClaimed:
      reward.rewardClaimed,
  };
}

/**
 * Get customer's service promotion progress.
 */
export const getServicePromotionStatus =
  onCall(
    {
      region: "us-central1",
    },
    async (request) => {
      const uid = request.auth?.uid;

      if (!uid) {
        throw new HttpsError(
          "unauthenticated",
          "You must be signed in.",
        );
      }

      const rewardRef = db
        .collection("customerRewards")
        .doc(uid);

      const rewardSnapshot =
        await rewardRef.get();

      const reward =
        rewardSnapshot.exists
          ? normalizeReward(
              rewardSnapshot.data(),
            )
          : normalizeReward();

      const completedBookings =
        await getCompletedBookingCount(uid);

      return buildStatus(
        completedBookings,
        reward,
      );
    },
  );

/**
 * Claim customer's free service reward.
 */
export const claimServicePromotionReward =
  onCall(
    {
      region: "us-central1",
    },
    async (request) => {
      const uid = request.auth?.uid;

      if (!uid) {
        throw new HttpsError(
          "unauthenticated",
          "You must be signed in.",
        );
      }

      const rewardRef = db
        .collection("customerRewards")
        .doc(uid);

      const completedBookings =
        await getCompletedBookingCount(uid);

      const safeCompletedBookings =
        normalizeNonNegativeInteger(
          completedBookings,
          0,
        );

      const result =
        await db.runTransaction(
          async (transaction) => {
            const rewardSnapshot =
              await transaction.get(
                rewardRef,
              );

            const reward =
              rewardSnapshot.exists
                ? normalizeReward(
                    rewardSnapshot.data(),
                  )
                : normalizeReward();

            if (reward.rewardClaimed) {
              throw new HttpsError(
                "failed-precondition",
                "This reward has already been claimed.",
              );
            }

            const progress =
              Math.max(
                safeCompletedBookings -
                  reward.baselineCompletedBookings,
                0,
              );

            if (
              progress <
              REQUIRED_BOOKINGS
            ) {
              throw new HttpsError(
                "failed-precondition",
                "Complete 20 services to unlock this reward.",
              );
            }

            transaction.set(
              rewardRef,
              {
                baselineCompletedBookings:
                  safeCompletedBookings,

                rewardClaimed: true,

                updatedAt:
                  FieldValue.serverTimestamp(),
              },
              {
                merge: true,
              },
            );

            return {
              completedBookings:
                REQUIRED_BOOKINGS,

              progress:
                REQUIRED_BOOKINGS,

              requiredBookings:
                REQUIRED_BOOKINGS,

              rewardUnlocked: false,

              rewardClaimed: true,
            };
          },
        );

      return {
        ...result,

        message:
          "Your free service reward has been unlocked.",
      };
    },
  );