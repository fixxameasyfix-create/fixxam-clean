import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { httpsCallable } from "firebase/functions";

import { functions } from "@/firebase/config";

type ServicePromotionStatus = {
  completedBookings: number;
  progress: number;
  requiredBookings: number;
  rewardUnlocked: boolean;
  rewardClaimed: boolean;
};

type FirebaseCallableError = {
  code?: string;
  message?: string;
};

const getServicePromotionStatus =
  httpsCallable<void, ServicePromotionStatus>(
    functions,
    "getServicePromotionStatus",
  );

export default function ServicePromotionsScreen() {
  const [status, setStatus] =
    useState<ServicePromotionStatus | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result =
        await getServicePromotionStatus();

      const data = result.data;

      if (!data) {
        throw new Error(
          "No reward status was returned from Firebase.",
        );
      }

      setStatus({
        completedBookings:
          Number(data.completedBookings) || 0,

        progress:
          Number(data.progress) || 0,

        requiredBookings:
          Number(data.requiredBookings) || 20,

        rewardUnlocked:
          Boolean(data.rewardUnlocked),

        rewardClaimed:
          Boolean(data.rewardClaimed),
      });
    } catch (err) {
      const firebaseError =
        err as FirebaseCallableError;

      console.error(
        "Failed to load service promotion:",
        {
          code: firebaseError?.code,
          message: firebaseError?.message,
          error: err,
        },
      );

      setStatus(null);

      setError(
        firebaseError?.message ||
          "Unable to load your reward progress. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const handleClaim = () => {
    if (!status) {
      return;
    }

    if (status.rewardClaimed) {
      return;
    }

    if (!status.rewardUnlocked) {
      return;
    }

    router.push({
      pathname:
        "/(customer)/details/categories",
      params: {
        reward:
          "service-promotion-free-service",
      },
    });
  };

  const progress =
    status?.progress ?? 0;

  const required =
    status?.requiredBookings &&
    status.requiredBookings > 0
      ? status.requiredBookings
      : 20;

  const safeProgress = Math.max(
    0,
    Math.min(progress, required),
  );

  const percentage =
    required > 0
      ? safeProgress / required
      : 0;

  const remaining =
    Math.max(
      required - safeProgress,
      0,
    );

  const rewardReady =
    Boolean(status?.rewardUnlocked) &&
    !status?.rewardClaimed;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}

        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={10}
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#0F172A"
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Service Promotions
            </Text>

            <Text style={styles.subtitle}>
              Complete 20 successful bookings and
              get one service free.
            </Text>
          </View>
        </View>

        {/* Hero */}

        <View style={styles.heroCard}>
          <View style={styles.iconBox}>
            <Ionicons
              name="construct-outline"
              size={36}
              color="#7C3AED"
            />
          </View>

          <Text style={styles.heroTitle}>
            Book 20 Services, Get 1 Free
          </Text>

          <Text style={styles.heroDescription}>
            Keep using Fixxam and complete
            successful service bookings to unlock
            your free service reward.
          </Text>
        </View>

        {/* Loading */}

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator
              size="large"
              color="#2563EB"
            />

            <Text style={styles.loadingText}>
              Loading your progress...
            </Text>
          </View>
        ) : error ? (
          /* Error */

          <View style={styles.errorCard}>
            <View style={styles.errorIcon}>
              <Ionicons
                name="alert-circle-outline"
                size={26}
                color="#DC2626"
              />
            </View>

            <Text style={styles.errorTitle}>
              Unable to load reward
            </Text>

            <Text style={styles.errorText}>
              {error}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Try again"
              onPress={() => {
                void loadStatus();
              }}
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="refresh-outline"
                size={17}
                color="#2563EB"
              />

              <Text style={styles.retryText}>
                TRY AGAIN
              </Text>
            </Pressable>
          </View>
        ) : (
          /* Progress */

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>
                Your Progress
              </Text>

              <Text style={styles.progressCount}>
                {safeProgress} / {required}
              </Text>
            </View>

            <View
              accessible
              accessibilityRole="progressbar"
              accessibilityLabel="Service promotion progress"
              accessibilityValue={{
                min: 0,
                max: required,
                now: safeProgress,
              }}
              style={styles.progressTrack}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${percentage * 100}%`,
                  },
                ]}
              />
            </View>

            <Text style={styles.progressMessage}>
              {status?.rewardClaimed
                ? "Your free service reward has already been claimed."
                : status?.rewardUnlocked
                  ? "Your free service is ready to claim."
                  : `${remaining} more completed ${
                      remaining === 1
                        ? "booking"
                        : "bookings"
                    } to unlock your reward.`}
            </Text>

            {/* Reward Unlocked */}

            {status?.rewardUnlocked &&
            !status.rewardClaimed ? (
              <View style={styles.unlockedBox}>
                <View style={styles.unlockedIcon}>
                  <Ionicons
                    name="gift-outline"
                    size={24}
                    color="#16A34A"
                  />
                </View>

                <View style={styles.unlockedContent}>
                  <Text
                    style={
                      styles.unlockedTitle
                    }
                  >
                    Reward Unlocked
                  </Text>

                  <Text
                    style={
                      styles.unlockedDescription
                    }
                  >
                    Choose one eligible service
                    from Fixxam.
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Already Claimed */}

            {status?.rewardClaimed ? (
              <View style={styles.claimedBox}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color="#2563EB"
                />

                <View
                  style={styles.unlockedContent}
                >
                  <Text
                    style={styles.claimedTitle}
                  >
                    Reward Claimed
                  </Text>

                  <Text
                    style={
                      styles.claimedDescription
                    }
                  >
                    You have already claimed this
                    free service reward.
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Claim */}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                status?.rewardClaimed
                  ? "Reward already claimed"
                  : "Claim free service"
              }
              disabled={!rewardReady}
              onPress={handleClaim}
              style={({ pressed }) => [
                styles.claimButton,

                !rewardReady &&
                  styles.claimButtonDisabled,

                pressed &&
                  rewardReady &&
                  styles.claimButtonPressed,
              ]}
            >
              <Text
                style={[
                  styles.claimText,

                  !rewardReady &&
                    styles.claimTextDisabled,
                ]}
              >
                {status?.rewardClaimed
                  ? "REWARD CLAIMED"
                  : "CLAIM FREE SERVICE"}
              </Text>

              <Ionicons
                name={
                  status?.rewardClaimed
                    ? "checkmark"
                    : "arrow-forward"
                }
                size={19}
                color={
                  rewardReady
                    ? "#FFFFFF"
                    : "#94A3B8"
                }
              />
            </Pressable>
          </View>
        )}

        {/* Info */}

        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={21}
            color="#64748B"
          />

          <Text style={styles.infoText}>
            Only completed bookings count toward
            this reward. Cancelled and unfinished
            bookings do not count.
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

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,

    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 3,
  },

  pressed: {
    opacity: 0.75,
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

  heroCard: {
    padding: 22,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,

    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 3,
  },

  iconBox: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },

  heroTitle: {
    fontSize: 23,
    lineHeight: 29,
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

    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 3,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  progressTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  progressCount: {
    fontSize: 17,
    fontWeight: "800",
    color: "#7C3AED",
  },

  progressTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
    marginTop: 16,
  },

  progressFill: {
    height: "100%",
    borderRadius: 6,
    backgroundColor: "#7C3AED",
  },

  progressMessage: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
  },

  unlockedBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#F0FDF4",
  },

  unlockedIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },

  unlockedContent: {
    flex: 1,
    marginLeft: 10,
  },

  unlockedTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#166534",
  },

  unlockedDescription: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    color: "#15803D",
  },

  claimedBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
  },

  claimedTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1D4ED8",
  },

  claimedDescription: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    color: "#2563EB",
  },

  claimButton: {
    minHeight: 52,
    marginTop: 18,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  claimButtonDisabled: {
    backgroundColor: "#E2E8F0",
  },

  claimButtonPressed: {
    opacity: 0.8,
  },

  claimText: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.3,
    color: "#FFFFFF",
  },

  claimTextDisabled: {
    color: "#94A3B8",
  },

  loading: {
    minHeight: 180,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#64748B",
  },

  errorCard: {
    padding: 20,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",

    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  errorIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },

  errorTitle: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  errorText: {
    marginTop: 7,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },

  retryButton: {
    marginTop: 14,
    minHeight: 42,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  retryText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2563EB",
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 18,
    padding: 14,
    borderRadius: 15,
    backgroundColor: "#F1F5F9",
  },

  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },
});