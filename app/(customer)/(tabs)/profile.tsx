import React, {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  signOut,
} from "firebase/auth";

import Toast from "react-native-toast-message";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import type {
  AppIconName,
} from "@/components/ui/AppIcon";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import {
  auth,
} from "@/firebase/config";

import useUserProfile from "@/hooks/auth/useUserProfile";
import useSwitchRole from "@/hooks/auth/useSwitchRole";

import CustomerProfileHeader from "@/components/profile/customer/CustomerProfileHeader";
import CustomerStats from "@/components/profile/customer/CustomerStats";
import CustomerProfile from "@/components/profile/CustomerProfile";

import AuthRequiredModa from "@/components/auth/AuthRequiredModa";

/* ============================================================
   TYPES
============================================================ */

type GuestAccountItem = {
  icon: AppIconName;

  title: string;
};

/* ============================================================
   CONSTANTS
============================================================ */

const GUEST_ACCOUNT_ITEMS: GuestAccountItem[] = [
  {
    icon: "profile",
    title: "Profile",
  },
  {
    icon: "jobs",
    title: "Orders",
  },
  {
    icon: "heart",
    title: "Saved",
  },
  {
    icon: "info",
    title: "Promotions",
  },
  {
    icon: "location",
    title: "Addresses",
  },
  {
    icon: "payment",
    title: "Payment Methods",
  },
  {
    icon: "notifications",
    title: "Notifications",
  },
  {
    icon: "star",
    title: "Reviews",
  },
  {
    icon: "settings",
    title: "Settings",
  },
];

/* ============================================================
   SCREEN
============================================================ */

export default function CustomerProfileScreen() {
  const {
    profile,
    loading,
  } =
    useUserProfile();

  const {
    switchRole,
  } =
    useSwitchRole();

  const [
    authModaVisible,
    setAuthModaVisible,
  ] =
    useState(false);

  /* ==========================================================
     PROFILE STATE
  ========================================================== */

  const hasWorkerAccount =
    profile?.roles?.includes(
      "worker",
    ) ?? false;

  const profileName =
    useMemo(() => {
      if (!profile) {
        return "";
      }

      return [
        profile.firstName,
        profile.otherName,
        profile.surname,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();
    }, [profile]);

  /* ==========================================================
     AUTH MODAL
  ========================================================== */

  const handleCloseAuthModal =
    useCallback(() => {
      setAuthModaVisible(
        false,
      );
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
        setAuthModaVisible(
          true,
        );

        return;
      }

      if (
        profile.roles?.includes(
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
     LOGIN
  ========================================================== */

  const handleLogin =
    useCallback(() => {
      router.push(
        "/(auth)/login" as never,
      );
    }, []);

  /* ==========================================================
     SIGN UP
  ========================================================== */

  const handleSignup =
    useCallback(() => {
      router.push(
        "/(auth)/customer-signup" as never,
      );
    }, []);

  /* ==========================================================
     LOGOUT
  ========================================================== */

  const handleLogout =
    useCallback(async () => {
      try {
        await signOut(
          auth,
        );

        router.replace(
          "/(auth)/login" as never,
        );
      } catch (error) {
        console.error(
          "CUSTOMER_LOGOUT_ERROR:",
          error,
        );

        Toast.show({
          type: "error",
          text1:
            "Unable to log out",
          text2:
            "Please try again.",
        });
      }
    }, []);

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <AppScreen
        role="customer"
        padded={false}
      >
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="small"
            color={
              CustomerColors.primary
            }
          />

          <AppText
            variant="caption"
            tone="secondary"
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
      <AppScreen
        role="customer"
        padded={false}
      >
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
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
              <AppIcon
                name="profile"
                role="customer"
                size="lg"
                state="muted"
              />
            </View>

            <View
              style={
                styles.guestProfileContent
              }
            >
              <AppText
                variant="bodyLarge"
                weight="bold"
                style={
                  styles.guestName
                }
              >
                Welcome to Fixxam
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.guestStatus
                }
              >
                Sign in to manage your account
              </AppText>
            </View>
          </View>

          {/* ==================================================
              ACCOUNT ACCESS
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
                <AppIcon
                  name="lock"
                  role="customer"
                  size="sm"
                  color={
                    CustomerColors.primary
                  }
                />
              </View>

              <View
                style={
                  styles.authCardHeaderText
                }
              >
                <AppText
                  variant="bodyMedium"
                  weight="bold"
                  style={
                    styles.authCardTitle
                  }
                >
                  Account access
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.authCardDescription
                  }
                >
                  Login to access your personal profile.
                </AppText>
              </View>
            </View>

            {/* LOGIN */}

            <Pressable
              onPress={
                handleLogin
              }
              accessibilityRole="button"
              accessibilityLabel="Login to Fixxam"
              style={({
                pressed,
              }) => [
                styles.loginButton,

                pressed
                  ? styles.buttonPressed
                  : null,
              ]}
            >
              <AppIcon
                name="lock"
                role="customer"
                size="sm"
                color={
                  Colors.textInverse
                }
              />

              <AppText
                variant="bodyMedium"
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
              onPress={
                handleSignup
              }
              accessibilityRole="button"
              accessibilityLabel="Create a Fixxam customer account"
              style={({
                pressed,
              }) => [
                styles.signupButton,

                pressed
                  ? styles.signupPressed
                  : null,
              ]}
            >
              <AppIcon
                name="profile"
                role="customer"
                size="sm"
                color={
                  CustomerColors.primary
                }
              />

              <AppText
                variant="bodyMedium"
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
              variant="bodyMedium"
              weight="bold"
              style={
                styles.sectionTitle
              }
            >
              My Account
            </AppText>

            {GUEST_ACCOUNT_ITEMS.map(
              (item) => (
                <GuestProfileRow
                  key={
                    item.title
                  }
                  icon={
                    item.icon
                  }
                  title={
                    item.title
                  }
                />
              ),
            )}
          </View>

          {/* ==================================================
              BECOME WORKER
          ================================================== */}

          <Pressable
            onPress={
              handleWorker
            }
            accessibilityRole="button"
            accessibilityLabel="Become a Fixxam worker"
            accessibilityHint="Opens worker account registration"
            style={({
              pressed,
            }) => [
              styles.workerCard,

              pressed
                ? styles.workerCardPressed
                : null,
            ]}
          >
            <View
              style={
                styles.workerIcon
              }
            >
              <AppIcon
                name="service"
                role="worker"
                size="md"
                color={
                  WorkerColors.primary
                }
              />
            </View>

            <View
              style={
                styles.workerContent
              }
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
                style={
                  styles.workerTitle
                }
              >
                Join As a Worker
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.workerDescription
                }
              >
                Offer your professional services and connect with customers.
              </AppText>
            </View>

            <AppIcon
              name="next"
              size="sm"
              state="muted"
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
    <AppScreen
      role="customer"
      padded={false}
    >
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
            name={
              profileName
            }
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
            variant="bodyMedium"
            weight="bold"
            style={
              styles.menuTitle
            }
          >
            My Account
          </AppText>

          <CustomerProfile
            hasWorkerAccount={
              hasWorkerAccount
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

const GuestProfileRow =
  memo(
    function GuestProfileRow({
      icon,
      title,
    }: {
      icon: AppIconName;

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
            <AppIcon
              name={icon}
              size="sm"
              state="muted"
            />
          </View>

          <AppText
            variant="body"
            style={
              styles.guestRowTitle
            }
          >
            {title}
          </AppText>

          <AppIcon
            name="lock"
            size="xs"
            state="muted"
          />

          <View
            style={
              styles.guestRowArrow
            }
          >
            <AppIcon
              name="next"
              size="xs"
              color={
                Colors.disabled
              }
            />
          </View>
        </View>
      );
    },
  );

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

      minHeight: 300,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       AUTHENTICATED PROFILE
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
    },

    statsCard: {
      overflow:
        "hidden",

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

    /* ========================================================
       GUEST CONTENT
    ======================================================== */

    guestContent: {
      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.xs,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    /* ========================================================
       GUEST PROFILE
    ======================================================== */

    guestProfileCard: {
      marginTop:
        FixxamTokens.spacing.xs,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    guestAvatar: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    guestProfileContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    guestName: {
      color:
        Colors.textPrimary,
    },

    guestStatus: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       AUTH CARD
    ======================================================== */

    authCard: {
      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    authCardHeader: {
      marginBottom:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    authCardIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    authCardHeaderText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    authCardTitle: {
      color:
        Colors.textPrimary,
    },

    authCardDescription: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 16,
    },

    /* ========================================================
       LOGIN
    ======================================================== */

    loginButton: {
      minHeight:
        FixxamTokens.size.buttonSmallHeight,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    loginButtonText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       SIGNUP
    ======================================================== */

    signupButton: {
      minHeight:
        FixxamTokens.size.buttonSmallHeight,

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderWidth: 1,

      borderColor:
        CustomerColors.primary,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        Colors.surface,
    },

    signupButtonText: {
      color:
        CustomerColors.primary,
    },

    buttonPressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },

    signupPressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },

    /* ========================================================
       GUEST ACCOUNT
    ======================================================== */

    sectionCard: {
      overflow:
        "hidden",

      marginTop:
        FixxamTokens.spacing.sm,

      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.xxs,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    sectionTitle: {
      paddingHorizontal:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    guestRow: {
      minHeight: 52,

      marginHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderTopWidth: 1,

      borderTopColor:
        Colors.divider,
    },

    guestRowIcon: {
      width: 36,

      height: 36,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },

    guestRowTitle: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    guestRowArrow: {
      marginLeft:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       WORKER CTA
    ======================================================== */

    workerCard: {
      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    workerCardPressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },

    workerIcon: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    workerContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    workerTitle: {
      color:
        Colors.textPrimary,
    },

    workerDescription: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 16,
    },
  });