import React, {
  memo,
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import * as Location from "expo-location";

import Toast from "react-native-toast-message";

import {
  AppButton,
  AppCard,
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type DealSection =
  | "discounted-services"
  | "limited-offers";

/* ============================================================
   BACK BUTTON
============================================================ */

type BackButtonProps = {
  onPress: () => void;
};

const BackButton = memo(
  function BackButton({
    onPress,
  }: BackButtonProps) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
        style={({ pressed }) => [
          styles.backButton,

          pressed
            ? styles.pressed
            : null,
        ]}
      >
        <AppIcon
          name="back"
          role="customer"
          size="md"
          color={
            Colors.textPrimary
          }
        />
      </Pressable>
    );
  },
);

/* ============================================================
   MAIN SCREEN
============================================================ */

export default function GoodDealSectionScreen() {
  const router =
    useRouter();

  const { section } =
    useLocalSearchParams<{
      section?: string;
    }>();

  const [
    loading,
    setLoading,
  ] = useState(false);

  /* ==========================================================
     SECTION
  ========================================================== */

  const isDiscountedServices =
    section ===
    "discounted-services";

  const isLimitedOffers =
    section ===
    "limited-offers";

  const isValidSection =
    isDiscountedServices ||
    isLimitedOffers;

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const handleBack =
    useCallback(() => {
      router.back();
    }, [router]);

  /* ==========================================================
     FIND NEARBY WORKERS
  ========================================================== */

  const handleClaim =
    useCallback(async () => {
      if (loading) {
        return;
      }

      setLoading(true);

      try {
        const permission =
          await Location.requestForegroundPermissionsAsync();

        if (
          permission.status !==
          "granted"
        ) {
          Toast.show({
            type: "error",

            text1:
              "Location permission required",

            text2:
              "Allow location access to find workers near you.",
          });

          return;
        }

        const currentLocation =
          await Location.getCurrentPositionAsync(
            {
              accuracy:
                Location.Accuracy
                  .Balanced,
            },
          );

        const {
          latitude,
          longitude,
        } =
          currentLocation.coords;

        if (
          !Number.isFinite(
            latitude,
          ) ||
          !Number.isFinite(
            longitude,
          )
        ) {
          throw new Error(
            "Invalid location coordinates.",
          );
        }

        router.push({
          pathname:
            "/nearby-workers",

          params: {
            source:
              "discounted-services",

            latitude:
              String(latitude),

            longitude:
              String(longitude),

            limit: "5",
          },
        });
      } catch (claimError) {
        console.error(
          "Nearby worker search failed:",
          claimError,
        );

        Toast.show({
          type: "error",

          text1:
            "Unable to get location",

          text2:
            "Please check your location settings and try again.",
        });
      } finally {
        setLoading(false);
      }
    }, [
      loading,
      router,
    ]);

  /* ==========================================================
     INVALID SECTION
  ========================================================== */

  if (!isValidSection) {
    return (
      <AppScreen
        role="customer"
        style={styles.screen}
      >
        <View
          style={
            styles.stateContainer
          }
        >
          <View
            style={
              styles.stateIconBox
            }
          >
            <AppIcon
              name="warning"
              size="xl"
              color={
                Colors.warning
              }
            />
          </View>

          <AppText
            variant="heading2"
            weight="bold"
            center
            style={
              styles.stateTitle
            }
          >
            Deal not found
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.stateText
            }
          >
            This deal section is not available.
          </AppText>

          <AppButton
            title="GO BACK"
            role="customer"
            variant="primary"
            onPress={
              handleBack
            }
            style={
              styles.stateButton
            }
          />
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
     LIMITED-TIME OFFERS
  ========================================================== */

  if (isLimitedOffers) {
    return (
      <AppScreen
        role="customer"
        style={styles.screen}
      >
        <View
          style={
            styles.pageContainer
          }
        >
          <BackButton
            onPress={
              handleBack
            }
          />

          <View
            style={
              styles.emptyContent
            }
          >
            <View
              style={
                styles.emptyIconBox
              }
            >
              <AppIcon
                name="clock"
                role="customer"
                size="xl"
                color={
                  CustomerColors.primary
                }
              />
            </View>

            <AppText
              variant="heading2"
              weight="bold"
              center
              style={
                styles.emptyTitle
              }
            >
              No Limited-Time Offers
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              center
              style={
                styles.emptyText
              }
            >
              There are no active limited-time offers available right now.
            </AppText>

            <AppButton
              title="GO BACK"
              role="customer"
              variant="primary"
              onPress={
                handleBack
              }
              style={
                styles.emptyButton
              }
            />
          </View>
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
     DISCOUNTED SERVICES
  ========================================================== */

  return (
    <AppScreen
      role="customer"
      style={styles.screen}
    >
      <View
        style={
          styles.pageContainer
        }
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <View
          style={styles.header}
        >
          <BackButton
            onPress={
              handleBack
            }
          />

          <View
            style={
              styles.headerText
            }
          >
            <AppText
              variant="heading2"
              weight="bold"
              style={
                styles.title
              }
            >
              Get a Discount from a Nearby Worker
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.subtitle
              }
            >
              Find nearby workers who may offer you a special discount.
            </AppText>
          </View>
        </View>

        {/* ==================================================
            OFFER CARD
        ================================================== */}

        <AppCard
          role="customer"
          style={
            styles.offerCard
          }
        >
          {/* ICON */}

          <View
            style={
              styles.iconContainer
            }
          >
            <AppIcon
              name="service"
              role="customer"
              size="xl"
              color={
                CustomerColors.primary
              }
            />
          </View>

          {/* TITLE */}

          <AppText
            variant="heading2"
            weight="bold"
            style={
              styles.offerTitle
            }
          >
            You May Get a Special Discount
          </AppText>

          {/* DESCRIPTION */}

          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.offerDescription
            }
          >
            Claim now to find workers near you who may offer you a better price for their services.
          </AppText>

          {/* LOCATION */}

          <View
            style={
              styles.locationBox
            }
          >
            <AppIcon
              name="location"
              role="customer"
              size="sm"
              color={
                CustomerColors.primary
              }
            />

            <AppText
              variant="body"
              weight="semibold"
              style={
                styles.locationText
              }
            >
              We'll use your location to find workers near you.
            </AppText>
          </View>

          {/* WORKERS INFO */}

          <View
            style={
              styles.infoBox
            }
          >
            <AppIcon
              name="users"
              size="sm"
              color={
                Colors.textSecondary
              }
            />

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.infoText
              }
            >
              We'll show you the 5 closest workers so you can choose the one that's right for you.
            </AppText>
          </View>

          {/* CLAIM */}

          <Pressable
            onPress={
              handleClaim
            }
            disabled={
              loading
            }
            accessibilityRole="button"
            accessibilityLabel="Find nearby workers"
            accessibilityState={{
              busy:
                loading,

              disabled:
                loading,
            }}
            style={({
              pressed,
            }) => [
              styles.claimButton,

              pressed &&
              !loading
                ? styles.pressed
                : null,

              loading
                ? styles.claimButtonDisabled
                : null,
            ]}
          >
            {loading ? (
              <>
                <ActivityIndicator
                  size="small"
                  color={
                    Colors.textInverse
                  }
                />

                <AppText
                  variant="bodyMedium"
                  weight="bold"
                  style={
                    styles.claimText
                  }
                >
                  GETTING LOCATION...
                </AppText>
              </>
            ) : (
              <>
                <AppIcon
                  name="location"
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
                    styles.claimText
                  }
                >
                  FIND NEARBY WORKERS
                </AppText>
              </>
            )}
          </Pressable>
        </AppCard>
      </View>
    </AppScreen>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       SCREEN
    ======================================================== */

    screen: {
      backgroundColor:
        Colors.background,
    },

    pageContainer: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.xxl,
    },

    /* ========================================================
       BACK BUTTON
    ======================================================== */

    backButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection: "row",

      alignItems:
        "flex-start",

      marginBottom:
        FixxamTokens.spacing.xl,
    },

    headerText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 23,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       OFFER CARD
    ======================================================== */

    offerCard: {
      padding:
        FixxamTokens.spacing.xl,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    iconContainer: {
      width: 72,

      height: 72,

      marginBottom:
        FixxamTokens.spacing.lg,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    offerTitle: {
      color:
        Colors.textPrimary,
    },

    offerDescription: {
      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 24,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       LOCATION
    ======================================================== */

    locationBox: {
      marginTop:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    locationText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        CustomerColors.primary,
    },

    /* ========================================================
       INFO
    ======================================================== */

    infoBox: {
      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems:
        "flex-start",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.background,
    },

    infoText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      lineHeight: 21,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       CLAIM
    ======================================================== */

    claimButton: {
      minHeight:
        FixxamTokens.size
          .buttonHeight,

      marginTop:
        FixxamTokens.spacing.xl,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,

      gap:
        FixxamTokens.spacing.sm,
    },

    claimButtonDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    claimText: {
      color:
        Colors.textInverse,

      letterSpacing: 0.3,
    },

    /* ========================================================
       LIMITED OFFERS
    ======================================================== */

    emptyContent: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      alignItems: "center",

      justifyContent:
        "center",
    },

    emptyIconBox: {
      width: 96,

      height: 96,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    emptyText: {
      maxWidth: 330,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 23,

      color:
        Colors.textSecondary,
    },

    emptyButton: {
      minWidth: 150,

      marginTop:
        FixxamTokens.spacing.xl,
    },

    /* ========================================================
       INVALID SECTION
    ======================================================== */

    stateContainer: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems: "center",

      justifyContent:
        "center",
    },

    stateIconBox: {
      width: 88,

      height: 88,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.warningSoft,
    },

    stateTitle: {
      marginTop:
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    stateText: {
      marginTop:
        FixxamTokens.spacing.sm,

      color:
        Colors.textSecondary,
    },

    stateButton: {
      minWidth: 150,

      marginTop:
        FixxamTokens.spacing.xl,
    },

    /* ========================================================
       STATES
    ======================================================== */

    pressed: {
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
  });