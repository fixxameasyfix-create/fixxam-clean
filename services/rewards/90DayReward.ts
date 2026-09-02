import {
  httpsCallable,
  type HttpsCallableResult,
} from "firebase/functions";

import { functions } from "@/firebase/config";

export type RewardStatus = {
  streakDay: number;
  lastClaimDate: string | null;
  canClaimToday: boolean;
  daysRemaining: number;
  rewardUnlocked: boolean;
  rewardClaimed: boolean;
};

type ClaimRewardResponse = RewardStatus & {
  message: string;
};

const get90DayRewardStatusCallable =
  httpsCallable<void, RewardStatus>(
    functions,
    "get90DayRewardStatus",
  );

const claim90DayRewardCallable =
  httpsCallable<void, ClaimRewardResponse>(
    functions,
    "claim90DayReward",
  );

export async function get90DayRewardStatus(): Promise<RewardStatus> {
  const result: HttpsCallableResult<RewardStatus> =
    await get90DayRewardStatusCallable();

  return result.data;
}

export async function claim90DayReward(): Promise<ClaimRewardResponse> {
  const result: HttpsCallableResult<ClaimRewardResponse> =
    await claim90DayRewardCallable();

  return result.data;
}