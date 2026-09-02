import React, {
  useEffect,
  useState,
} from "react";

import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { router } from "expo-router";

import {
  signOut,
} from "firebase/auth";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
  AppScreen,
} from "@/components/ui";

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
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
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

  /* ==========================================================
     PUBLIC PROFILE
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
    const user =
      auth.currentUser;

    if (!user) {
      setPublicProfile(null);
      return;
    }

    const publicProfileRef =
      doc(
        db,
        "workerPublicProfiles",
        user.uid,
      );

    const unsubscribe =
      onSnapshot(
        publicProfileRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            setPublicProfile(null);
            return;
          }

          const data =
            snapshot.data() as PublicWorkerProfile;

          setPublicProfile(
            data,
          );

          if (__DEV__) {
            console.log(
              "WORKER_PROFILE_REALTIME_UPDATE:",
              {
                uid:
                  user.uid,

                fullName:
                  data.fullName,

                name:
                  data.name,

                photoURL:
                  data.photoURL,

                photoUrl:
                  data.photoUrl,

                nestedPhotoUrl:
                  data.workerProfile
                    ?.photoUrl,

                phoneNumber:
                  data.phoneNumber,
              },
            );
          }
        },
        (error) => {
          console.error(
            "WORKER_PUBLIC_PROFILE_LISTENER_ERROR:",
            error,
          );

          setPublicProfile(null);
        },
      );

    return unsubscribe;
  }, []);

  /* ==========================================================
     LOADING
  ========================================================== */

  if (
    loading ||
    !profile
  ) {
    return null;
  }

  /* ==========================================================
     FULL NAME
  ========================================================== */

  /*
   * IMPORTANT:
   *
   * First use the realtime public profile name.
   *
   * This is the same name saved by
   * Build Your Profile.
   */

  const publicFullName =
    cleanString(
      publicProfile?.fullName,
    ) ||
    cleanString(
      publicProfile?.name,
    );

  /*
   * Fallback to the main user profile.
   */

  const profileFullName =
    [
      profile.firstName,
      profile.otherName,
      profile.surname,
    ]
      .map(cleanString)
      .filter(Boolean)
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
      publicProfile
        ?.phoneNumber,
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

  /*
   * IMPORTANT:
   *
   * Build Your Profile currently saves:
   *
   * photoURL
   *
   * while the public profile sync may save:
   *
   * workerProfile.photoUrl
   *
   * We support BOTH.
   */

  const publicPhotoUrl =
    cleanString(
      publicProfile
        ?.workerProfile
        ?.photoUrl,
    ) ||
    cleanString(
      publicProfile
        ?.photoUrl,
    ) ||
    cleanString(
      publicProfile
        ?.photoURL,
    );

  const profilePhotoUrl =
    cleanString(
      profile.workerProfile
        ?.photoUrl,
    ) ||
    cleanString(
      profile.photoUrl,
    );

  const photoUrl =
    publicPhotoUrl ||
    profilePhotoUrl ||
    "";

  /* ==========================================================
     SWITCH TO CUSTOMER
  ========================================================== */

  const handleSwitchCustomer =
    async (): Promise<boolean> => {
      if (
        !profile.roles.includes(
          "customer",
        )
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
          "SWITCH CUSTOMER ERROR:",
          error,
        );

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
          "LOGOUT ERROR:",
          error,
        );
      }
    };

  /* ==========================================================
     EDIT PHOTO
  ========================================================== */

  const handleEditPhoto =
    () => {
      /*
       * Keep this callback available.
       *
       * If your Build Your Profile route is known,
       * it can navigate there.
       *
       * We intentionally don't guess the route here.
       */
    };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
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
              profile.email ??
              ""
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
            onNotifications={() => {}}
            onSettings={() => {}}
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
            rating={
              0
            }
            earnings={
              0
            }
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
              profile.roles.includes(
                "customer",
              )
            }
            onSwitchCustomer={
              handleSwitchCustomer
            }
            onCreateCustomer={
              handleCreateCustomer
            }
            onJobs={() => {}}
            onProducts={() => {}}
            onOrders={() => {}}
            onEarnings={() => {}}
            onOnlineStatus={() => {}}
            onBusinessAddress={() => {}}
            onNotifications={() => {}}
            onReviews={() => {}}
            onSupport={() => {}}
            onSettings={() => {}}
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
      paddingHorizontal: 12,
      paddingTop: 4,
      paddingBottom: 28,
    },

    profileCard: {
      borderRadius: 17,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      overflow: "hidden",
    },

    statsCard: {
      marginTop: 8,
      borderRadius: 17,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      overflow: "hidden",
    },

    menuSection: {
      marginTop: 8,
    },
  });