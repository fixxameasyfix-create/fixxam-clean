import React, {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router } from "expo-router";

import { signOut } from "firebase/auth";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import { auth } from "@/firebase/config";

import useUserProfile from "@/hooks/auth/useUserProfile";
import useSwitchRole from "@/hooks/auth/useSwitchRole";

import CustomerProfileHeader from "@/components/profile/customer/CustomerProfileHeader";
import CustomerStats from "@/components/profile/customer/CustomerStats";
import CustomerProfile from "@/components/profile/CustomerProfile";

import AuthRequiredModa from "@/components/auth/AuthRequiredModa";

/* ============================================================
   SCREEN
============================================================ */

export default function CustomerProfileScreen() {
  const {
    profile,
    loading,
  } = useUserProfile();

  const {
    switchRole,
  } = useSwitchRole();

  const [
    authModaVisible,
    setAuthModaVisible,
  ] = useState(false);

  /* ==========================================================
     AUTH MODAL
  ========================================================== */

  const handleCloseAuthModal =
    useCallback(() => {
      setAuthModaVisible(false);
    }, []);

  /* ==========================================================
     PROFILE
  ========================================================== */

  const handleProfile =
    useCallback(() => {
      router.push(
        "/(customer)/profile/edit" as never,
      );
    }, []);

  /* ==========================================================
     BECOME / SWITCH WORKER
  ========================================================== */

  const handleWorker =
    useCallback(async () => {
      if (!profile) {
        setAuthModaVisible(true);
        return;
      }

      if (
        profile.roles.includes(
          "worker",
        )
      ) {
        const success =
          await switchRole(
            "worker",
          );

        if (success) {
          router.replace(
            "/(auth)/role-resolver" as never,
          );
        }

        return;
      }

      router.push(
        "/(auth)/worker/worker-signup" as never,
      );
    }, [
      profile,
      switchRole,
    ]);

  /* ==========================================================
     FIXxAM ACTIVITY
  ========================================================== */

  const handleActivity =
    useCallback(() => {
      router.push(
        "/(customer)/activity/activities" as never,
      );
    }, []);

  /* ==========================================================
     NOTIFICATIONS
  ========================================================== */

  const handleNotifications =
    useCallback(() => {
      router.push(
        "/(customer)/notifications" as never,
      );
    }, []);

  /* ==========================================================
     HELP & SUPPORT
  ========================================================== */

  const handleSupport =
    useCallback(() => {
      router.push(
        "/(customer)/help-support" as never,
      );
    }, []);

  /* ==========================================================
     SETTINGS
  ========================================================== */

  const handleSettings =
    useCallback(() => {
      router.push(
        "/(customer)/settings" as never,
      );
    }, []);

  /* ==========================================================
     LOGOUT
  ========================================================== */

  const handleLogout =
    useCallback(async () => {
      try {
        await signOut(auth);

        router.replace(
          "/(auth)/login" as never,
        );
      } catch (error) {
        console.error(
          "CUSTOMER LOGOUT ERROR:",
          error,
        );
      }
    }, []);

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <AppScreen>
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="small"
            color="#2563EB"
          />

          <AppText
            style={
              styles.loadingText
            }
          >
            Loading profile...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
     GUEST PROFILE
  ========================================================== */

  if (!profile) {
    return (
      <AppScreen>
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.guestContent
          }
        >
          {/* ==================================================
              GUEST PROFILE
          ================================================== */}

          <View
            style={
              styles.guestProfileCard
            }
          >
            <View
              style={
                styles.guestAvatar
              }
            >
              <Ionicons
                name="person-outline"
                size={30}
                color="#64748B"
              />
            </View>

            <View
              style={
                styles.guestProfileContent
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.guestName
                }
              >
                Welcome to Fixxam
              </AppText>

              <AppText
                style={
                  styles.guestStatus
                }
              >
                Sign in to manage your
                account
              </AppText>
            </View>
          </View>

          {/* ==================================================
              AUTH
          ================================================== */}

          <View
            style={
              styles.authCard
            }
          >
            <View
              style={
                styles.authCardHeader
              }
            >
              <View
                style={
                  styles.authCardIcon
                }
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={19}
                  color="#2563EB"
                />
              </View>

              <View
                style={
                  styles.authCardHeaderText
                }
              >
                <AppText
                  weight="bold"
                  style={
                    styles.authCardTitle
                  }
                >
                  Account access
                </AppText>

                <AppText
                  style={
                    styles.authCardDescription
                  }
                >
                  Login to access your
                  personal profile.
                </AppText>
              </View>
            </View>

            {/* LOGIN */}

            <Pressable
              onPress={() =>
                router.push(
                  "/(auth)/login" as never,
                )
              }
              style={({
                pressed,
              }) => [
                styles.loginButton,
                pressed &&
                  styles.buttonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Login to Fixxam"
            >
              <Ionicons
                name="log-in-outline"
                size={19}
                color="#FFFFFF"
              />

              <AppText
                weight="bold"
                style={
                  styles.loginButtonText
                }
              >
                Login
              </AppText>
            </Pressable>

            {/* SIGN UP */}

            <Pressable
              onPress={() =>
                router.push(
                  "/(auth)/customer-signup" as never,
                )
              }
              style={({
                pressed,
              }) => [
                styles.signupButton,
                pressed &&
                  styles.signupPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Create a Fixxam account"
            >
              <Ionicons
                name="person-add-outline"
                size={19}
                color="#2563EB"
              />

              <AppText
                weight="bold"
                style={
                  styles.signupButtonText
                }
              >
                Join as a Customer
              </AppText>
            </Pressable>
          </View>

          {/* ==================================================
              LOCKED ACCOUNT PREVIEW
          ================================================== */}

          <View
            style={
              styles.sectionCard
            }
          >
            <AppText
              weight="bold"
              style={
                styles.sectionTitle
              }
            >
              My Account
            </AppText>

            <GuestProfileRow
              icon="person-outline"
              title="Profile"
            />

            <GuestProfileRow
              icon="receipt-outline"
              title="Orders"
            />

            <GuestProfileRow
              icon="bookmark-outline"
              title="Saved"
            />

            <GuestProfileRow
              icon="pricetag-outline"
              title="Promotions"
            />

            <GuestProfileRow
              icon="location-outline"
              title="Addresses"
            />

            <GuestProfileRow
              icon="card-outline"
              title="Payment Methods"
            />

            <GuestProfileRow
              icon="notifications-outline"
              title="Notifications"
            />

            <GuestProfileRow
              icon="star-outline"
              title="Reviews"
            />

            <GuestProfileRow
              icon="settings-outline"
              title="Settings"
            />
          </View>

          {/* ==================================================
              BECOME WORKER
          ================================================== */}

          <Pressable
            onPress={
              handleWorker
            }
            style={({
              pressed,
            }) => [
              styles.workerCard,
              pressed &&
                styles.workerCardPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Become a Fixxam worker"
          >
            <View
              style={
                styles.workerIcon
              }
            >
              <Ionicons
                name="construct-outline"
                size={22}
                color="#F97316"
              />
            </View>

            <View
              style={
                styles.workerContent
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.workerTitle
                }
              >
                Join As a Worker
              </AppText>

              <AppText
                style={
                  styles.workerDescription
                }
              >
                Offer your professional
                services and connect with
                customers.
              </AppText>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color="#94A3B8"
            />
          </Pressable>
        </ScrollView>

        <AuthRequiredModa
          visible={
            authModaVisible
          }
          title="Account required"
          description="Create a Fixxam account or login before you can register as a worker."
          onClose={
            handleCloseAuthModal
          }
        />
      </AppScreen>
    );
  }

  /* ==========================================================
     AUTHENTICATED CUSTOMER
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
            CUSTOMER PROFILE HEADER
        ================================================== */}

        <View
          style={
            styles.profileCard
          }
        >
          <CustomerProfileHeader
            name={[
              profile.firstName,
              profile.otherName,
              profile.surname,
            ]
              .filter(Boolean)
              .join(" ")}
            phone={
              profile.phone
            }
            email={
              profile.email
            }
            photoUrl={
              profile.photoUrl
            }
            verified={
              profile.verified ??
              false
            }
            onEditPhoto={() => {}}
            onNotifications={
              handleNotifications
            }
            onSettings={
              handleSettings
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
          <CustomerStats
            orders={
              profile.totalOrders ??
              0
            }
            saved={
              profile.savedCount ??
              0
            }
            reviews={
              profile.totalReviews ??
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
            weight="bold"
            style={
              styles.menuTitle
            }
          >
            My Account
          </AppText>

          <CustomerProfile
            hasWorkerAccount={
              profile.roles.includes(
                "worker",
              )
            }

            onBecomeWorker={
              handleWorker
            }

            onSwitchWorker={
              handleWorker
            }

            onProfile={
              handleProfile
            }

            onActivity={
              handleActivity
            }

            onSaved={() => {}}

            onAddresses={() => {}}

            onPayments={() => {}}

            onNotifications={
              handleNotifications
            }

            onReviews={() => {}}

            onSupport={
              handleSupport
            }

            onSettings={
              handleSettings
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
   GUEST PROFILE ROW
============================================================ */

function GuestProfileRow({
  icon,
  title,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
}) {
  return (
    <View
      style={
        styles.guestRow
      }
    >
      <View
        style={
          styles.guestRowIcon
        }
      >
        <Ionicons
          name={icon}
          size={18}
          color="#64748B"
        />
      </View>

      <AppText
        style={
          styles.guestRowTitle
        }
      >
        {title}
      </AppText>

      <Ionicons
        name="lock-closed-outline"
        size={14}
        color="#94A3B8"
      />

      <Ionicons
        name="chevron-forward"
        size={17}
        color="#CBD5E1"
      />
    </View>
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

    loadingContainer: {
      flex: 1,
      minHeight: 300,
      alignItems: "center",
      justifyContent: "center",
    },

    loadingText: {
      marginTop: 8,
      fontSize: 12,
      color: "#64748B",
    },

    profileCard: {
      borderRadius: 17,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      overflow: "hidden",
    },

    statsCard: {
      marginTop: 8,
      borderRadius: 17,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      overflow: "hidden",
    },

    menuSection: {
      marginTop: 8,
    },

    menuTitle: {
      marginLeft: 3,
      marginBottom: 5,
      fontSize: 13,
      color: "#0F172A",
    },

    /* ========================================================
       GUEST
    ======================================================== */

    guestContent: {
      paddingHorizontal: 12,
      paddingTop: 4,
      paddingBottom: 28,
    },

    guestProfileCard: {
      marginTop: 6,
      padding: 12,
      borderRadius: 17,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      flexDirection: "row",
      alignItems: "center",
    },

    guestAvatar: {
      width: 58,
      height: 58,
      borderRadius: 18,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    guestProfileContent: {
      flex: 1,
      marginLeft: 11,
    },

    guestName: {
      fontSize: 16,
      color: "#0F172A",
    },

    guestStatus: {
      marginTop: 3,
      fontSize: 10.5,
      color: "#64748B",
    },

    /* ========================================================
       AUTH
    ======================================================== */

    authCard: {
      marginTop: 8,
      padding: 12,
      borderRadius: 17,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },

    authCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },

    authCardIcon: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    authCardHeaderText: {
      flex: 1,
      marginLeft: 10,
    },

    authCardTitle: {
      fontSize: 13,
      color: "#0F172A",
    },

    authCardDescription: {
      marginTop: 2,
      fontSize: 10,
      lineHeight: 15,
      color: "#64748B",
    },

    loginButton: {
      height: 44,
      borderRadius: 12,
      backgroundColor: "#2563EB",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
    },

    loginButtonText: {
      fontSize: 13,
      color: "#FFFFFF",
    },

    signupButton: {
      marginTop: 7,
      height: 44,
      borderRadius: 12,
      backgroundColor: "#FFFFFF",
      borderWidth: 1.5,
      borderColor: "#2563EB",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
    },

    signupButtonText: {
      fontSize: 13,
      color: "#2563EB",
    },

    buttonPressed: {
      opacity: 0.82,
      transform: [
        {
          scale: 0.98,
        },
      ],
    },

    signupPressed: {
      opacity: 0.75,
      transform: [
        {
          scale: 0.99,
        },
      ],
    },

    /* ========================================================
       GUEST ACCOUNT
    ======================================================== */

    sectionCard: {
      marginTop: 8,
      paddingTop: 11,
      paddingBottom: 2,
      borderRadius: 17,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      overflow: "hidden",
    },

    sectionTitle: {
      paddingHorizontal: 12,
      marginBottom: 4,
      fontSize: 13,
      color: "#0F172A",
    },

    guestRow: {
      minHeight: 52,
      marginHorizontal: 10,
      borderTopWidth: 1,
      borderTopColor: "#F1F5F9",
      flexDirection: "row",
      alignItems: "center",
    },

    guestRowIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor: "#F8FAFC",
      alignItems: "center",
      justifyContent: "center",
    },

    guestRowTitle: {
      flex: 1,
      marginLeft: 10,
      fontSize: 12.5,
      color: "#1E293B",
    },

    /* ========================================================
       WORKER
    ======================================================== */

    workerCard: {
      marginTop: 8,
      padding: 12,
      borderRadius: 17,
      backgroundColor: "#FFF7ED",
      borderWidth: 1,
      borderColor: "#FED7AA",
      flexDirection: "row",
      alignItems: "center",
    },

    workerCardPressed: {
      opacity: 0.82,
      transform: [
        {
          scale: 0.99,
        },
      ],
    },

    workerIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
    },

    workerContent: {
      flex: 1,
      marginLeft: 10,
      marginRight: 7,
    },

    workerTitle: {
      fontSize: 14,
      color: "#111827",
    },

    workerDescription: {
      marginTop: 2,
      fontSize: 10.5,
      lineHeight: 15,
      color: "#64748B",
    },
  });