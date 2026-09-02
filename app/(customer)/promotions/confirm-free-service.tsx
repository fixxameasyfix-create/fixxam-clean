import React, {
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  httpsCallable,
} from "firebase/functions";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import { functions } from "@/firebase/config";

type ClaimRewardResponse = {
  success: boolean;
  rewardId: string;
  message: string;
};

const claimServicePromotionReward =
  httpsCallable<
    {
      workerId: string;
      serviceId: string;
      reward: string;
    },
    ClaimRewardResponse
  >(
    functions,
    "claimServicePromotionReward",
  );

export default function ConfirmFreeServiceScreen() {
  const {
    reward,
    workerId,
    workerName,
    workerPhoto,
    serviceId,
    serviceName,
  } = useLocalSearchParams<{
    reward?: string;
    workerId?: string;
    workerName?: string;
    workerPhoto?: string;
    serviceId?: string;
    serviceName?: string;
  }>();

  const [claiming, setClaiming] =
    useState(false);

  const isValidReward =
    reward ===
      "service-promotion-free-service" ||
    reward ===
      "90-day-free-service";

  async function handleConfirm() {
    if (
      !workerId ||
      !serviceId ||
      !reward ||
      !isValidReward
    ) {
      Alert.alert(
        "Unable to continue",
        "The reward information is incomplete. Please go back and select the service again.",
      );

      return;
    }

    try {
      setClaiming(true);

      /*
       * IMPORTANT:
       *
       * The server must verify the reward again.
       * Never trust the reward value coming from
       * navigation params.
       */

      const result =
        await claimServicePromotionReward({
          workerId,
          serviceId,
          reward,
        });

      if (!result.data.success) {
        throw new Error(
          result.data.message ||
            "Unable to claim the reward.",
        );
      }

      Alert.alert(
        "Free Service Claimed",
        "Your free service has been successfully claimed.",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace(
                "/(customer)/(tabs)/orders",
              );
            },
          },
        ],
      );
    } catch (error) {
      console.error(
        "Free service claim failed:",
        error,
      );

      Alert.alert(
        "Claim Failed",
        "We could not complete your free service claim. Please try again.",
      );
    } finally {
      setClaiming(false);
    }
  }

  return (
    <AppScreen
      contentContainerStyle={
        styles.container
      }
    >
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={claiming}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#0F172A"
          />
        </Pressable>

        <AppText
          weight="bold"
          style={styles.title}
        >
          Confirm Free Service
        </AppText>

        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View style={styles.rewardCard}>
          <View style={styles.rewardIcon}>
            <Ionicons
              name="gift-outline"
              size={34}
              color="#2563EB"
            />
          </View>

          <AppText
            weight="bold"
            style={styles.rewardTitle}
          >
            Free Service Reward
          </AppText>

          <AppText
            center
            style={styles.rewardDescription}
          >
            You are using your Fixxam free
            service reward.
          </AppText>
        </View>

        <View style={styles.card}>
          <AppText
            weight="bold"
            style={styles.sectionTitle}
          >
            Selected Service
          </AppText>

          <View style={styles.serviceRow}>
            <View style={styles.serviceIcon}>
              <Ionicons
                name="construct-outline"
                size={25}
                color="#7C3AED"
              />
            </View>

            <View
              style={styles.serviceContent}
            >
              <AppText
                weight="bold"
                style={styles.serviceName}
              >
                {serviceName ||
                  "Selected Service"}
              </AppText>

              <AppText
                style={styles.freeText}
              >
                FREE
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <AppText
            weight="bold"
            style={styles.sectionTitle}
          >
            Selected Worker
          </AppText>

          <View style={styles.workerRow}>
            {workerPhoto ? (
              <Image
                source={{
                  uri: workerPhoto,
                }}
                style={styles.workerImage}
              />
            ) : (
              <View
                style={
                  styles.workerPlaceholder
                }
              >
                <Ionicons
                  name="person-outline"
                  size={28}
                  color="#94A3B8"
                />
              </View>
            )}

            <View
              style={styles.workerContent}
            >
              <AppText
                weight="bold"
                style={styles.workerName}
              >
                {workerName ||
                  "Selected Worker"}
              </AppText>

              <AppText
                style={styles.workerDescription}
              >
                Your selected service
                provider.
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.notice}>
          <Ionicons
            name="information-circle-outline"
            size={21}
            color="#64748B"
          />

          <AppText
            style={styles.noticeText}
          >
            The service price will be covered
            by your eligible Fixxam reward.
          </AppText>
        </View>

        <Pressable
          disabled={claiming}
          onPress={handleConfirm}
          style={({ pressed }) => [
            styles.confirmButton,
            pressed &&
              !claiming &&
              styles.pressed,
            claiming &&
              styles.disabledButton,
          ]}
        >
          {claiming ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle-outline"
                size={22}
                color="#FFFFFF"
              />

              <AppText
                weight="bold"
                style={styles.confirmText}
              >
                CONFIRM FREE SERVICE
              </AppText>
            </>
          )}
        </Pressable>

        <Pressable
          disabled={claiming}
          onPress={() => router.back()}
          style={styles.changeButton}
        >
          <AppText
            weight="bold"
            style={styles.changeText}
          >
            CHANGE SERVICE OR WORKER
          </AppText>
        </Pressable>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },

  scrollContent: {
    paddingBottom: 30,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },

  placeholder: {
    width: 40,
  },

  title: {
    fontSize: 20,
    color: "#0F172A",
  },

  rewardCard: {
    alignItems: "center",
    padding: 24,
    borderRadius: 22,
    backgroundColor: "#EFF6FF",
    marginBottom: 16,
  },

  rewardIcon: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  rewardTitle: {
    fontSize: 22,
    color: "#0F172A",
  },

  rewardDescription: {
    marginTop: 7,
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
  },

  card: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    marginBottom: 14,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 16,
    color: "#0F172A",
    marginBottom: 14,
  },

  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
  },

  serviceContent: {
    flex: 1,
    marginLeft: 12,
  },

  serviceName: {
    fontSize: 16,
    color: "#0F172A",
  },

  freeText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "800",
    color: "#16A34A",
  },

  workerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  workerImage: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },

  workerPlaceholder: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  workerContent: {
    flex: 1,
    marginLeft: 12,
  },

  workerName: {
    fontSize: 16,
    color: "#0F172A",
  },

  workerDescription: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },

  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 15,
    backgroundColor: "#F1F5F9",
    marginBottom: 18,
  },

  noticeText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },

  confirmButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  disabledButton: {
    opacity: 0.65,
  },

  pressed: {
    opacity: 0.8,
  },

  confirmText: {
    fontSize: 13,
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },

  changeButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  changeText: {
    fontSize: 12,
    color: "#2563EB",
  },
});