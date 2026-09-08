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

import {
  router,
} from "expo-router";

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

/* ============================================================
   SCREEN
============================================================ */

export default function WorkerProfileScreen() {
  const {
    profile,
    loading,
  } =
    useUserProfile();

  const {
    switchRole,
  } =
    useSwitchRole();

  /* ==========================================================
     PUBLIC PROFILE
  ========================================================== */

  const [
    publicProfile,
    setPublicProfile,
  ] =
    useState<PublicWorkerProfile | null>(
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

                /*
                 * Keep main user profile
                 * available as fallback.
                 */
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

  const publicFullName =
    cleanString(
      publicProfile?.fullName,
    ) ||
    cleanString(
      publicProfile?.name,
    );

  const profileFullName =
    [
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

  const fullName =
    publicFullName ||
    profileFullName ||
    "Worker";

  /* ==========================================================
     PHONE
  ========================================================== */

  const phone =
    cleanString(
      publicProfile?.phoneNumber,
    ) ||
    cleanString(
      publicProfile
        ?.workerProfile
        ?.phoneNumber,
    ) ||
    cleanString(
      profile.phone,
    );

  /* ==========================================================
     PHOTO
  ========================================================== */

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

  const profilePhoto =
    cleanString(
      profile.workerProfile
        ?.photoUrl,
    ) ||
    cleanString(
      profile.photoUrl,
    );

  const photoUrl =
    publicPhoto &&
    isHttpUrl(
      publicPhoto,
    )
      ? publicPhoto
      : profilePhoto &&
          isHttpUrl(
            profilePhoto,
          )
        ? profilePhoto
        : "";

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
        "/(auth)/customer-signup",
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

  /*
   * No verified Build Your Profile
   * route is available here.
   *
   * Do not invent a route.
   */
  const handleEditPhoto =
    handleUnavailableAction;

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen
      role="worker"
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
            verified={
              profile.verified ??
              false
            }
            onEditPhoto={
              handleEditPhoto
            }
            onNotifications={
              handleUnavailableAction
            }
            onSettings={
              handleUnavailableAction
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
              profile.completedJobs ??
              0
            }
            completed={
              profile.completedJobs ??
              0
            }
            rating={0}
            earnings={0}
          />
        </View>

        {/* ==================================================
            WORKER MENU
        ================================================== */}

        <View
          style={
            styles.menuSection
          }
        >
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
              handleUnavailableAction
            }
            onProducts={
              handleUnavailableAction
            }
            onOrders={
              handleUnavailableAction
            }
            onEarnings={
              handleUnavailableAction
            }
            onOnlineStatus={
              handleUnavailableAction
            }
            onBusinessAddress={
              handleUnavailableAction
            }
            onNotifications={
              handleUnavailableAction
            }
            onReviews={
              handleUnavailableAction
            }
            onSupport={
              handleUnavailableAction
            }
            onSettings={
              handleUnavailableAction
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
    content: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    /* ========================================================
       LOADING
    ======================================================== */

    loadingContainer: {
      flex: 1,

      minHeight: 420,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingIcon: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      alignItems:
        "center",

      justifyContent:
        "center",

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
      overflow:
        "hidden",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       STATS
    ======================================================== */

    statsCard: {
      marginTop:
        FixxamTokens.spacing.md,

      overflow:
        "hidden",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       MENU
    ======================================================== */

    menuSection: {
      marginTop:
        FixxamTokens.spacing.md,
    },
  });