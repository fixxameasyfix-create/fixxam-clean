import React, { useCallback, useEffect, useState } from "react";

import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { FirebaseError } from "firebase/app";

import {
    claim90DayReward,
    get90DayRewardStatus,
    type RewardStatus,
} from "../../../services/rewards/90DayReward";

const REWARD_DAYS = 90;

function getErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "functions/unauthenticated":
        return "Please sign in to claim your daily reward.";

      case "functions/already-exists":
        return "Today's reward has already been claimed.";

      case "functions/failed-precondition":
        return "This reward is not available for claiming.";

      default:
        return error.message || "Something went wrong.";
    }
  }

  return "Something went wrong. Please try again.";
}

export default function SpecialOfferScreen() {
  const [reward, setReward] =
    useState<RewardStatus | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReward = useCallback(async () => {
    try {
      setError(null);

      const status =
        await get90DayRewardStatus();

      setReward(status);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadReward();
  }, [loadReward]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void loadReward();
  }, [loadReward]);

  const handleClaim = useCallback(async () => {
    if (!reward?.canClaimToday || claiming) {
      return;
    }

    try {
      setClaiming(true);
      setError(null);

      const result =
        await claim90DayReward();

      setReward(result);
    } catch (err) {
      setError(getErrorMessage(err));

      // Refresh in case another request/device
      // already changed the reward state.
      await loadReward();
    } finally {
      setClaiming(false);
    }
  }, [claiming, loadReward, reward?.canClaimToday]);

 
const handleFreeServiceClaim = useCallback(() => {
  if (!reward?.rewardUnlocked || reward.rewardClaimed) {
    return;
  }

  router.push({
    pathname: "/(customer)/details/categories",
    params: {
      reward: "90-day-free-service",
    },
  });
}, [
  reward?.rewardClaimed,
  reward?.rewardUnlocked,
]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Loading your reward...
        </Text>
      </View>
    );
  }

  const streakDay = reward?.streakDay ?? 0;

  const progress =
    Math.min(streakDay / REWARD_DAYS, 1);

  const progressPercentage =
  `${Math.round(progress * 100)}%` as `${number}%`;

  const daysRemaining =
    reward?.daysRemaining ??
    Math.max(REWARD_DAYS - streakDay, 0);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        {/* Header */}

        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={10}
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#0F172A"
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              90-Day Reward
            </Text>

            <Text style={styles.subtitle}>
              Claim every day and keep your streak
              alive for a free Fixxam service.
            </Text>
          </View>
        </View>

        {/* Error */}

        {error && (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle-outline"
              size={21}
              color="#DC2626"
            />

            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        )}

        {/* Hero */}

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="gift-outline"
              size={38}
              color="#CA8A04"
            />
          </View>

          <Text style={styles.heroTitle}>
            Fixxam 90-Day Reward
          </Text>

          <Text style={styles.heroDescription}>
            Claim one reward every day. Stay
            consistent for 90 days to unlock
            one free service.
          </Text>
        </View>

        {/* Progress */}

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>
                YOUR STREAK
              </Text>

              <Text style={styles.dayText}>
                Day {streakDay} / {REWARD_DAYS}
              </Text>
            </View>

            <View style={styles.dayBadge}>
              <Ionicons
                name="flame-outline"
                size={18}
                color="#EA580C"
              />

              <Text style={styles.dayBadgeText}>
                {streakDay}
              </Text>
            </View>
          </View>

          <View
            style={styles.progressTrack}
            accessible
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: REWARD_DAYS,
              now: streakDay,
            }}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: progressPercentage,
                },
              ]}
            />
          </View>

          <View style={styles.progressFooter}>
            <Text style={styles.progressFooterText}>
              {daysRemaining > 0
                ? `${daysRemaining} days to go`
                : "90 days completed"}
            </Text>

            <Text style={styles.progressFooterText}>
              {progressPercentage}
            </Text>
          </View>
        </View>

        {/* Daily Claim */}

        {!reward?.rewardUnlocked && (
          <View style={styles.claimCard}>
            <View style={styles.claimIcon}>
              <Ionicons
                name={
                  reward?.canClaimToday
                    ? "calendar-outline"
                    : "checkmark-circle-outline"
                }
                size={28}
                color={
                  reward?.canClaimToday
                    ? "#2563EB"
                    : "#16A34A"
                }
              />
            </View>

            <Text style={styles.claimTitle}>
              {reward?.canClaimToday
                ? "Claim today's reward"
                : "Today's reward claimed"}
            </Text>

            <Text style={styles.claimDescription}>
              {reward?.canClaimToday
                ? "Claim today to continue your 90-day streak."
                : "Come back tomorrow to continue your streak."}
            </Text>

            <Pressable
              disabled={
                !reward?.canClaimToday ||
                claiming
              }
              onPress={handleClaim}
              accessibilityRole="button"
              accessibilityLabel="Claim today's reward"
              accessibilityState={{
                disabled:
                  !reward?.canClaimToday ||
                  claiming,
                busy: claiming,
              }}
              style={({ pressed }) => [
                styles.claimButton,
                !reward?.canClaimToday &&
                  styles.claimButtonDisabled,
                pressed &&
                  reward?.canClaimToday &&
                  styles.pressed,
              ]}
            >
              {claiming ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Text
                    style={[
                      styles.claimButtonText,
                      !reward?.canClaimToday &&
                        styles.claimButtonTextDisabled,
                    ]}
                  >
                    {reward?.canClaimToday
                      ? "CLAIM TODAY"
                      : "CLAIMED TODAY"}
                  </Text>

                  <Ionicons
                    name={
                      reward?.canClaimToday
                        ? "arrow-forward"
                        : "checkmark"
                    }
                    size={19}
                    color={
                      reward?.canClaimToday
                        ? "#FFFFFF"
                        : "#64748B"
                    }
                  />
                </>
              )}
            </Pressable>
          </View>
        )}

        {/* Unlocked Reward */}

        {reward?.rewardUnlocked && (
          <View style={styles.unlockedCard}>
            <View style={styles.unlockedIcon}>
              <Ionicons
                name="trophy-outline"
                size={34}
                color="#CA8A04"
              />
            </View>

            <Text style={styles.unlockedTitle}>
              🎉 Congratulations!
            </Text>

            <Text style={styles.unlockedDescription}>
              You completed your 90-day streak.
              Your free service reward is now
              unlocked.
            </Text>

            <View style={styles.freeServiceBox}>
              <Text style={styles.freeServiceLabel}>
                YOUR REWARD
              </Text>

              <Text style={styles.freeServiceTitle}>
                1 FREE SERVICE
              </Text>
            </View>

            {!reward.rewardClaimed && (
              <Pressable
                onPress={handleFreeServiceClaim}
                accessibilityRole="button"
                accessibilityLabel="Claim free service"
                style={({ pressed }) => [
                  styles.freeServiceButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.freeServiceButtonText}>
                  CLAIM FREE SERVICE
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#FFFFFF"
                />
              </Pressable>
            )}
          </View>
        )}

        {/* How It Works */}

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color="#2563EB"
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              How it works
            </Text>

            <Text style={styles.infoText}>
              Claim once each day to increase your
              streak. If you stay away for 7 days,
              your streak starts again from Day 1.
            </Text>
          </View>
        </View>

        {/* Terms */}

        <View style={styles.termsCard}>
          <Text style={styles.termsTitle}>
            Reward terms
          </Text>

          <Text style={styles.termsText}>
            Daily claims are limited to one per day.
            A streak resets after 7 days without a
            claim. Completing Day 90 unlocks one
            eligible free service.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    elevation: 3,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 16,
  },

  errorText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 13,
    lineHeight: 19,
    color: "#B91C1C",
  },

  heroCard: {
    padding: 22,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "#FEFCE8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  heroTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800",
    color: "#0F172A",
  },

  heroDescription: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 23,
    color: "#64748B",
  },

  progressCard: {
    padding: 20,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  progressTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#64748B",
  },

  dayText: {
    marginTop: 3,
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },

  dayBadge: {
    minWidth: 48,
    height: 42,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "#FFF7ED",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  dayBadgeText: {
    marginLeft: 5,
    fontSize: 15,
    fontWeight: "800",
    color: "#EA580C",
  },

  progressTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 6,
    backgroundColor: "#2563EB",
  },

  progressFooter: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  progressFooterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },

  claimCard: {
    padding: 20,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  claimIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  claimTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
  },

  claimDescription: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
  },

  claimButton: {
    minHeight: 54,
    marginTop: 18,
    borderRadius: 17,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  claimButtonDisabled: {
    backgroundColor: "#E2E8F0",
  },

  claimButtonText: {
    marginRight: 8,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.4,
    color: "#FFFFFF",
  },

  claimButtonTextDisabled: {
    color: "#64748B",
  },

  unlockedCard: {
    padding: 22,
    borderRadius: 24,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginBottom: 16,
  },

  unlockedIcon: {
    width: 66,
    height: 66,
    borderRadius: 20,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  unlockedTitle: {
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "800",
    color: "#0F172A",
  },

  unlockedDescription: {
    marginTop: 7,
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
  },

  freeServiceBox: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },

  freeServiceLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    color: "#A16207",
  },

  freeServiceTitle: {
    marginTop: 3,
    fontSize: 21,
    fontWeight: "800",
    color: "#0F172A",
  },

  freeServiceButton: {
    minHeight: 54,
    marginTop: 16,
    borderRadius: 17,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  freeServiceButtonText: {
    marginRight: 8,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.3,
    color: "#FFFFFF",
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    marginBottom: 16,
  },

  infoIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  infoText: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },

  termsCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
  },

  termsTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#475569",
  },

  termsText: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },

  pressed: {
    opacity: 0.78,
  },
});