import React, {
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { router } from "expo-router";

import Toast from "react-native-toast-message";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import {
  auth,
  db,
} from "@/firebase/config";

import useUserProfile from "@/hooks/auth/useUserProfile";
import useSwitchRole from "@/hooks/auth/useSwitchRole";
import useWorkerOrderCounts from "@/hooks/worker/useWorkerOrderCounts";

import WorkerProfileHeader from "@/components/profile/worker/WorkerProfileHeader";
import WorkerStats from "@/components/profile/worker/WorkerStats";
import WorkerProfile from "@/components/profile/WorkerProfile";

/* ============================================================
   PUBLIC WORKER PROFILE TYPE
============================================================ */

type PublicWorkerProfile = {
  fullName?: string;
  name?: string;

  phoneNumber?: string;

  photoURL?: string;
  photoUrl?: string;

  rating?: number;
  totalReviews?: number;

  workerProfile?: {
    photoUrl?: string;
    phoneNumber?: string;
  };
};

/* ============================================================
   HELPERS
============================================================ */

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function isHttpUrl(
  value: string,
): boolean {
  return (
    value.startsWith("https://") ||
    value.startsWith("http://")
  );
}

function normalizeRating(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.min(
    5,
    Math.max(
      0,
      value,
    ),
  );
}

/* ============================================================
   SCREEN
============================================================ */

export default function WorkerProfileScreen() {
  const {
    profile,
    loading,
  } = useUserProfile();

  const {
    switchRole,
  } = useSwitchRole();

  const {
    counts: orderCounts,
  } = useWorkerOrderCounts();

  /* ==========================================================
     PUBLIC PROFILE STATE
  ========================================================== */

  const [
    publicProfile,
    setPublicProfile,
  ] = useState<PublicWorkerProfile | null>(
    null,
  );

  /* ==========================================================
     PUBLIC PROFILE LISTENER
  ========================================================== */

  useEffect(() => {
    let unsubscribeProfile:
      | (() => void)
      | undefined;

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        user => {
          unsubscribeProfile?.();

          unsubscribeProfile =
            undefined;

          if (!user) {
            setPublicProfile(
              null,
            );

            return;
          }

          const publicProfileRef =
            doc(
              db,
              "workerPublicProfiles",
              user.uid,
            );

          unsubscribeProfile =
            onSnapshot(
              publicProfileRef,
              snapshot => {
                if (
                  !snapshot.exists()
                ) {
                  setPublicProfile(
                    null,
                  );

                  return;
                }

                setPublicProfile(
                  snapshot.data() as PublicWorkerProfile,
                );
              },
              error => {
                console.error(
                  "WORKER_PUBLIC_PROFILE_LISTENER_ERROR:",
                  error,
                );

                setPublicProfile(
                  null,
                );
              },
            );
        },
      );

    return () => {
      unsubscribeProfile?.();
      unsubscribeAuth();
    };
  }, []);

  /* ==========================================================
     LOADING
  ========================================================== */

  if (
    loading ||
    !profile
  ) {
    return (
      <AppScreen
        role="worker"
        padded={false}
      >
        <View
          style={
            styles.loadingContainer
          }
        >
          <View
            style={
              styles.loadingIcon
            }
          >
            <ActivityIndicator
              size="large"
              color={
                WorkerColors.primary
              }
            />
          </View>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.loadingText
            }
          >
            Loading your profile...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
     FULL NAME
  ========================================================== */

  const profileFullName = [
    profile.firstName,
    profile.otherName,
    profile.surname,
  ]
    .map(
      cleanString,
    )
    .filter(
      Boolean,
    )
    .join(" ")
    .trim();

  const publicFullName =
    cleanString(
      publicProfile?.fullName,
    ) ||
    cleanString(
      publicProfile?.name,
    );

  /*
   * Logged-in worker profile is the
   * primary source of truth.
   *
   * Public profile is only a fallback.
   */

  const fullName =
    profileFullName ||
    publicFullName ||
    "Worker";

  /* ==========================================================
     PHONE
  ========================================================== */

  const profilePhone =
    cleanString(
      profile.phone,
    );

  const publicPhone =
    cleanString(
      publicProfile?.phoneNumber,
    ) ||
    cleanString(
      publicProfile
        ?.workerProfile
        ?.phoneNumber,
    );

  const phone =
    profilePhone ||
    publicPhone;

  /* ==========================================================
     PHOTO
  ========================================================== */

  const profilePhoto =
    cleanString(
      profile.workerProfile
        ?.photoUrl,
    ) ||
    cleanString(
      profile.photoUrl,
    );

  const publicPhoto =
    cleanString(
      publicProfile
        ?.workerProfile
        ?.photoUrl,
    ) ||
    cleanString(
      publicProfile?.photoUrl,
    ) ||
    cleanString(
      publicProfile?.photoURL,
    );

  /*
   * Prefer the authenticated worker profile
   * photo. Public profile remains fallback.
   */

  const photoUrl =
    isHttpUrl(
      profilePhoto,
    )
      ? profilePhoto
      : isHttpUrl(
          publicPhoto,
        )
        ? publicPhoto
        : "";

  /* ==========================================================
     REAL PUBLIC RATING
  ========================================================== */

  const workerRating =
    normalizeRating(
      publicProfile?.rating,
    );

  /* ==========================================================
     CUSTOMER ROLE
  ========================================================== */

  const hasCustomerAccount =
    Array.isArray(
      profile.roles,
    ) &&
    profile.roles.includes(
      "customer",
    );

  /* ==========================================================
     SWITCH TO CUSTOMER
  ========================================================== */

  const handleSwitchCustomer =
    async (): Promise<boolean> => {
      if (
        !hasCustomerAccount
      ) {
        return false;
      }

      /*
       * If the user has both Worker and Customer roles,
       * open Select Account instead of automatically
       * switching to Customer.
       */

      const hasWorkerAccount =
        Array.isArray(
          profile.roles,
        ) &&
        profile.roles.includes(
          "worker",
        );

      if (
        hasWorkerAccount &&
        hasCustomerAccount
      ) {
        router.push(
          "/(auth)/select-account" as never,
        );

        return true;
      }

      try {
        const success =
          await switchRole(
            "customer",
          );

        if (!success) {
          return false;
        }

        router.replace(
          "/(customer)/(tabs)/home",
        );

        return true;
      } catch (error) {
        console.error(
          "SWITCH_CUSTOMER_ERROR:",
          error,
        );

        Toast.show({
          type: "error",
          text1:
            "Unable to switch account",
          text2:
            "Please try again.",
        });

        return false;
      }
    };

  /* ==========================================================
     CREATE CUSTOMER ACCOUNT
  ========================================================== */

  const handleCreateCustomer =
    () => {
      router.push(
        "/(auth)/customer-registration-choice" as never,
      );
    };

  /* ==========================================================
     HELP & SUPPORT
  ========================================================== */

  const handleOpenSupport =
    () => {
      router.push(
        "/(worker)/profile/help-support",
      );
    };

  /* ==========================================================
     SETTINGS
  ========================================================== */

  const handleOpenSettings =
    () => {
      router.push(
        "/(worker)/profile/settings",
      );
    };

  /* ==========================================================
     NOTIFICATIONS
  ========================================================== */

  const handleOpenNotifications =
    () => {
      router.push(
        "/(worker)/notifications" as never,
      );
    };

  /* ==========================================================
     LOCATION
  ========================================================== */

  const handleOpenLocation =
    () => {
      router.push(
        "/(worker)/profile/location" as never,
      );
    };

  /* ==========================================================
     PROMOTIONS
  ========================================================== */

  const handleOpenPromotions =
    () => {
      router.push(
        "/(worker)/profile/promotions" as never,
      );
    };

  /* ==========================================================
     ONLINE STATUS
  ========================================================== */

  const handleOpenOnlineStatus =
    () => {
      router.push(
        "/(worker)/profile/online-status" as never,
      );
    };

  /* ==========================================================
     MY JOBS
  ========================================================== */

  const handleOpenJobs =
    () => {
      router.push(
        "/(worker)/profile/my-jobs" as never,
      );
    };

  /* ==========================================================
     WALLET
  ========================================================== */

  const handleOpenWallet =
    () => {
      router.push(
        "/(worker)/profile/wallet" as never,
      );
    };

  /* ==========================================================
     SAVED
  ========================================================== */

  const handleOpenSaved =
    () => {
      router.push(
        "/(worker)/profile/saved" as never,
      );
    };

  /* ==========================================================
     LOGOUT
  ========================================================== */

  const handleLogout =
    async () => {
      try {
        await signOut(
          auth,
        );

        router.replace(
          "/(auth)/login",
        );
      } catch (error) {
        console.error(
          "WORKER_LOGOUT_ERROR:",
          error,
        );

        Toast.show({
          type: "error",
          text1:
            "Unable to sign out",
          text2:
            "Please try again.",
        });
      }
    };

  /* ==========================================================
     UNCONNECTED ACTIONS
  ========================================================== */

  const handleUnavailableAction =
    () => {
      Toast.show({
        type: "info",
        text1:
          "Not available yet",
        text2:
          "This profile action is not connected yet.",
      });
    };

  /* ==========================================================
     EDIT PHOTO
  ========================================================== */

  const handleEditPhoto =
    () => {
      router.push(
        "/(worker)/jobs/build-profile" as never,
      );
    };

  /* ==========================================================
     REVIEWS
  ========================================================== */

  const handleOpenReviews =
    () => {
      router.push(
        "/(worker)/reviews" as never,
      );
    };

  /* ==========================================================
     MY PRODUCTS
  ========================================================== */

  const handleOpenProducts =
    () => {
      router.push(
        "/(worker)/profile/my-products" as never,
      );
    };

  /* ==========================================================
     ORDERS
  ========================================================== */

  const handleOpenOrders =
    () => {
      router.push(
        "/(worker)/profile/orders" as never,
      );
    };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen
      role="worker"
      padded={false}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.content
        }
      >
        {/* ==================================================
            PROFILE HEADER
        ================================================== */}

        <View
          style={
            styles.profileCard
          }
        >
          <WorkerProfileHeader
            /*
             * Force the header to receive a
             * fresh identity whenever the
             * worker name or photo changes.
             */
            key={`${fullName}-${photoUrl}`}
            name={
              fullName
            }
            phone={
              phone
            }
            email={
              cleanString(
                profile.email,
              )
            }
            photoUrl={
              photoUrl
            }
            onEditPhoto={
              handleEditPhoto
            }
          />
        </View>

        {/* ==================================================
            STATS
        ================================================== */}

        <View
          style={
            styles.statsCard
          }
        >
          <WorkerStats
            jobs={
              orderCounts.pending
            }
            completed={
              orderCounts.completed
            }
            rating={
              workerRating
            }
            earnings={
              0
            }
          />
        </View>

        {/* ==================================================
            MY ACCOUNT
        ================================================== */}

        <View
          style={
            styles.menuSection
          }
        >
          <AppText
            variant="bodyMedium"
            weight="bold"
            style={
              styles.menuTitle
            }
          >
            My Account
          </AppText>

          <WorkerProfile
            hasCustomerAccount={
              hasCustomerAccount
            }
            onSwitchCustomer={
              handleSwitchCustomer
            }
            onCreateCustomer={
              handleCreateCustomer
            }
            onJobs={
              handleOpenJobs
            }
            onProducts={
              handleOpenProducts
            }
            onOrders={
              handleOpenOrders
            }
            onSaved={
              handleOpenSaved
            }
            onPromotions={
              handleOpenPromotions
            }
            onEarnings={
              handleOpenWallet
            }
            onOnlineStatus={
              handleOpenOnlineStatus
            }
            onLocation={
              handleOpenLocation
            }
            onNotifications={
              handleOpenNotifications
            }
            onReviews={
              handleOpenReviews
            }
            onSupport={
              handleOpenSupport
            }
            onSettings={
              handleOpenSettings
            }
            onLogout={
              handleLogout
            }
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.xs,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    /* ========================================================
       LOADING
    ======================================================== */

    loadingContainer: {
      flex: 1,

      minHeight: 420,

      alignItems: "center",

      justifyContent: "center",
    },

    loadingIcon: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       PROFILE
    ======================================================== */

    profileCard: {
      overflow: "hidden",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       STATS
    ======================================================== */

    statsCard: {
      overflow: "hidden",

      marginTop:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       MENU
    ======================================================== */

    menuSection: {
      marginTop:
        FixxamTokens.spacing.sm,
    },

    menuTitle: {
      marginLeft:
        FixxamTokens.spacing.xxs,

      marginBottom:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },
  });