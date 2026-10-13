import React, {
  memo,
  useCallback,
  useEffect,
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

import { router } from "expo-router";

import { signOut } from "firebase/auth";

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

import { auth } from "@/firebase/config";

import useUserProfile from "@/hooks/auth/useUserProfile";
import useSwitchRole from "@/hooks/auth/useSwitchRole";
import useCustomerOrderCounts from "@/hooks/customer/useCustomerOrderCounts";
import useCustomerReviewCount from "@/hooks/customer/useCustomerReviewCount";

import {
  subscribeToSavedWorkersCount,
} from "@/services/customer-saved/savedWorkers";

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
    icon: "jobs",
    title: "My Requests",
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
    title: "Location",
  },
  {
    icon: "wallet",
    title: "My Wallet",
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
  } = useUserProfile();

  const {
    switchRole,
  } = useSwitchRole();

  const {
    counts: orderCounts,
  } = useCustomerOrderCounts();

  const {
    count: reviewCount,
  } = useCustomerReviewCount();

  const [
    savedCount,
    setSavedCount,
  ] = useState(0);

  const [
    authModaVisible,
    setAuthModaVisible,
  ] = useState(false);

  /* ==========================================================
     SAVED COUNT

     Realtime count from savedWorkers collection.
     This is intentionally separate from profile.savedCount.
  ========================================================== */

  useEffect(() => {
    if (!profile) {
      setSavedCount(0);
      return;
    }

    const unsubscribe =
      subscribeToSavedWorkersCount(
        (count) => {
          setSavedCount(count);
        },
        (error) => {
          console.error(
            "CUSTOMER_SAVED_COUNT_ERROR:",
            error,
          );

          // Keep the last known count instead of
          // replacing it with an incorrect value.
        },
      );

    return () => {
      unsubscribe?.();
    };
  }, [profile]);

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
     LOCATION
  ========================================================== */

  const handleLocation =
    useCallback(() => {
      router.push(
        "/(customer)/profile/location" as never,
      );
    }, []);

  /* ==========================================================
     MY REQUESTS
  ========================================================== */

  const handleRequests =
    useCallback(() => {
      router.push(
        "/(customer)/profile/my-requests" as never,
      );
    }, []);

  /* ==========================================================
     MY WALLET
  ========================================================== */

  const handleWallet =
    useCallback(() => {
      router.push(
        "/(customer)/wallet" as never,
      );
    }, []);

  /* ==========================================================
     PROMOTIONS
  ========================================================== */

  const handlePromotions =
    useCallback(() => {
      router.push(
        "/(customer)/profile/promotions" as never,
      );
    }, []);

  /* ==========================================================
     REVIEWS
  ========================================================== */

  const handleReviews =
    useCallback(() => {
      router.push(
        "/(customer)/reviews" as never,
      );
    }, []);

  /* ==========================================================
     SAVED
  ========================================================== */

  const handleSaved =
    useCallback(() => {
      router.push(
        "/(customer)/profile/saved" as never,
      );
    }, []);

  /* ==========================================================
     BECOME / SWITCH WORKER

     Existing customer + worker accounts:
       Customer → Select Account
                   ↓
            Customer / Worker

     Existing worker-only role:
       Customer → Worker Mode

     New worker:
       Customer → Become a Provider
                   ↓
          Use customer details
                   OR
          Make new registration
  ========================================================== */

  const handleWorker =
    useCallback(async () => {
      if (!profile) {
        setAuthModaVisible(true);
        return;
      }

      /* ========================================================
         ACCOUNT ROLES
      ======================================================== */

      const hasCustomerRole =
        profile.roles?.includes(
          "customer",
        ) ?? false;

      const hasWorkerRole =
        profile.roles?.includes(
          "worker",
        ) ?? false;

      /* ========================================================
         EXISTING CUSTOMER + WORKER ACCOUNTS

         Do NOT switch automatically.

         Send the user to Select Account so they can explicitly
         choose whether to continue as Customer or Worker.
      ======================================================== */

      if (
        hasCustomerRole &&
        hasWorkerRole
      ) {
        router.push(
          "/(auth)/select-account" as never,
        );

        return;
      }

      /* ========================================================
         EXISTING WORKER ACCOUNT

         Keep the existing behavior for a worker role that does
         not also have the customer role.
      ======================================================== */

      if (
        hasWorkerRole
      ) {
        const success =
          await switchRole("worker");

        if (success) {
          router.replace(
            "/(auth)/role-resolver" as never,
          );
        }

        return;
      }

      /* ========================================================
         NEW WORKER REGISTRATION

         Do not open worker registration directly.
         First let the customer choose whether to:
         - use existing customer details
         - make a new registration
      ======================================================== */

      router.push(
        "/(auth)/worker/become-a-provider" as never,
      );
    }, [
      profile,
      switchRole,
    ]);

  /* ==========================================================
     FIXXAM ACTIVITY
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
     MY MARKET
  ========================================================== */

  const handleMarket =
    useCallback(() => {
      router.push(
        "/(customer)/profile/my-market" as never,
      );
    }, []);

  /* ==========================================================
     ORDERS
  ========================================================== */

  const handleOrders =
    useCallback(() => {
      router.push(
        "/(customer)/profile/orders" as never,
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
      router.push({
        pathname:
          "/customer-signup",
      });
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
          "CUSTOMER_LOGOUT_ERROR:",
          error,
        );

        Toast.show({
          type: "error",
          text1: "Unable to log out",
          text2: "Please try again.",
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
          <View
            style={
              styles.loadingIcon
            }
          >
            <ActivityIndicator
              size="large"
              color={
                CustomerColors.primary
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
     GUEST PROFILE
  ========================================================== */

  if (!profile) {
    return (
      <AppScreen
        role="customer"
        padded={false}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
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
                  key={item.title}
                  icon={item.icon}
                  title={item.title}
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
            accessibilityHint="Opens worker provider options"
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
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
            name={profileName}
            phone={profile.phone}
            email={profile.email}
            photoUrl={profile.photoUrl}
            verified={
              profile.verified ?? false
            }
            onEditPhoto={
              handleProfile
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
              orderCounts.total
            }
            saved={
              savedCount
            }
            reviews={
              reviewCount
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
            onRequests={
              handleRequests
            }
            onMarket={
              handleMarket
            }
            onOrders={
              handleOrders
            }
            onPromotions={
              handlePromotions
            }
            onActivity={
              handleActivity
            }
            onSaved={
              handleSaved
            }
            onLocation={
              handleLocation
            }
            onMywallet={
              handleWallet
            }
            onNotifications={
              handleNotifications
            }
            onReviews={
              handleReviews
            }
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

const GuestProfileRow = memo(
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

GuestProfileRow.displayName =
  "GuestProfileRow";

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
        CustomerColors.primarySoft,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       AUTHENTICATED PROFILE
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

      flexDirection: "row",

      alignItems: "center",

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

      alignItems: "center",

      justifyContent: "center",

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

      flexDirection: "row",

      alignItems: "center",
    },

    authCardIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

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

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

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
       SIGN UP
    ======================================================== */

    signupButton: {
      minHeight:
        FixxamTokens.size.buttonSmallHeight,

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

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
      overflow: "hidden",

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

      flexDirection: "row",

      alignItems: "center",

      borderTopWidth:
        StyleSheet.hairlineWidth,

      borderTopColor:
        Colors.divider,
    },

    guestRowIcon: {
      width: 36,

      height: 36,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

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
       GUEST WORKER CTA
    ======================================================== */

    workerCard: {
      minHeight: 76,

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

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
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

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