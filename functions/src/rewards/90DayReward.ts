import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const db = getFirestore();

const REWARD_DAYS = 90;
const RESET_AFTER_DAYS = 7;

type RewardData = {
  streakDay: number;
  lastClaimDate: string | null;
  rewardUnlocked: boolean;
  rewardClaimed: boolean;
};

const emptyReward = (): RewardData => ({
  streakDay: 0,
  lastClaimDate: null,
  rewardUnlocked: false,
  rewardClaimed: false,
});

function getDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function daysBetween(
  from: string,
  to: string,
): number {
  const fromTime = Date.parse(
    `${from}T00:00:00.000Z`,
  );

  const toTime = Date.parse(
    `${to}T00:00:00.000Z`,
  );

  return Math.floor(
    (toTime - fromTime) /
      (1000 * 60 * 60 * 24),
  );
}

function toStatus(data: RewardData) {
  const today = getDateKey();

  return {
    ...data,
    canClaimToday:
      data.lastClaimDate !== today &&
      !data.rewardClaimed,
    daysRemaining: Math.max(
      REWARD_DAYS - data.streakDay,
      0,
    ),
  };
}

export const get90DayRewardStatus = onCall(
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

    const snapshot =
      await rewardRef.get();

    const data: RewardData = snapshot.exists
      ? (snapshot.data() as RewardData)
      : emptyReward();

    return toStatus(data);
  },
);

export const claim90DayReward = onCall(
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

    const today = getDateKey();

    const nextReward =
      await db.runTransaction(async (transaction) => {
        const snapshot =
          await transaction.get(rewardRef);

        const current: RewardData =
          snapshot.exists
            ? (snapshot.data() as RewardData)
            : emptyReward();

        if (current.rewardClaimed) {
          throw new HttpsError(
            "failed-precondition",
            "This reward has already been claimed.",
          );
        }

        if (current.lastClaimDate === today) {
          throw new HttpsError(
            "already-exists",
            "Today's reward has already been claimed.",
          );
        }

        let streakDay = 1;

        if (current.lastClaimDate) {
          const gap = daysBetween(
            current.lastClaimDate,
            today,
          );

          streakDay =
            gap >= RESET_AFTER_DAYS
              ? 1
              : current.streakDay + 1;
        }

        streakDay = Math.min(
          streakDay,
          REWARD_DAYS,
        );

        const updated: RewardData = {
          streakDay,
          lastClaimDate: today,
          rewardUnlocked:
            streakDay >= REWARD_DAYS,
          rewardClaimed: false,
        };

        transaction.set(
          rewardRef,
          {
            ...updated,
            updatedAt:
              FieldValue.serverTimestamp(),
          },
          { merge: true },
        );

        return updated;
      });

    return {
      ...toStatus(nextReward),
      message:
        nextReward.rewardUnlocked
          ? "90-day reward unlocked."
          : "Today's reward has been claimed.",
    };
  },
);