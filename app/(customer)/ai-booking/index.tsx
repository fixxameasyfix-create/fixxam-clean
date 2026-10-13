import React, {
  memo,
  useCallback,
} from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  AppCard,
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
} from "@/theme";

/* ==============================================================
   ACTION CARD
============================================================== */

interface ActionCardProps {
  icon: AppIconName;

  title: string;

  description: string;

  accessibilityLabel: string;

  onPress: () => void;
}

const ActionCard =
  memo(function ActionCard({
    icon,
    title,
    description,
    accessibilityLabel,
    onPress,
  }: ActionCardProps) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          accessibilityLabel
        }
        onPress={onPress}
        style={({
          pressed,
        }) => [
          styles.actionCard,

          pressed
            ? styles.actionCardPressed
            : null,
        ]}
      >
        <View
          style={
            styles.actionIcon
          }
        >
          <AppIcon
            name={icon}
            role="customer"
            size="md"
            state="active"
          />
        </View>

        <View
          style={
            styles.actionContent
          }
        >
          <AppText
            variant="bodyMedium"
            weight="bold"
            numberOfLines={1}
          >
            {title}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.actionDescription
            }
          >
            {description}
          </AppText>
        </View>

        <View
          style={
            styles.arrowBox
          }
        >
          <AppIcon
            name="next"
            role="customer"
            size="sm"
            state="active"
          />
        </View>
      </Pressable>
    );
  });

/* ==============================================================
   SCREEN
============================================================== */

export default function AiBookingScreen() {
  /* ============================================================
     BACK
  ============================================================ */

  const handleBack =
    useCallback(() => {
      if (
        router.canGoBack()
      ) {
        router.back();

        return;
      }

      router.replace(
        "/(customer)/(tabs)/home",
      );
    }, []);

  /* ============================================================
     TAKE PHOTO
  ============================================================ */

  const handleTakePhoto =
    useCallback(() => {
      router.push(
        "/(customer)/ai-booking/camera",
      );
    }, []);

  /* ============================================================
     DESCRIBE
  ============================================================ */

  const handleDescribeProblem =
    useCallback(() => {
      router.push(
        "/(customer)/ai-booking/describe",
      );
    }, []);

  /* ============================================================
     UI
  ============================================================ */

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
          styles.content
        }
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <View
          style={
            styles.header
          }
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            onPress={
              handleBack
            }
            style={({
              pressed,
            }) => [
              styles.backButton,

              pressed
                ? styles.backButtonPressed
                : null,
            ]}
          >
            <AppIcon
              name="back"
              role="customer"
              size="sm"
              state="default"
            />
          </Pressable>

          <View
            style={
              styles.headerText
            }
          >
            <AppText
              variant="heading1"
              weight="bold"
            >
              Book Automatically
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.subtitle
              }
            >
              Tell Fixxam what you need
              and let AI prepare your
              service request.
            </AppText>
          </View>
        </View>

        {/* ====================================================
            AI FEATURE
        ==================================================== */}

        <AppCard
          role="customer"
          variant="accent"
          style={
            styles.aiCard
          }
        >
          <View
            style={
              styles.aiTopRow
            }
          >
            <View
              style={
                styles.aiIcon
              }
            >
              <AppIcon
                name="professional"
                role="customer"
                size="md"
                state="active"
              />
            </View>

            <View
              style={
                styles.aiBadge
              }
            >
              <AppIcon
                name="professional"
                role="customer"
                size="xs"
                state="active"
              />

              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.aiBadgeText
                }
              >
                Smarter Way
              </AppText>
            </View>
          </View>

          <AppText
            variant="heading3"
            weight="bold"
          >
            Let Fixxam understand
            your problem
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.aiDescription
            }
          >
            You don't need to know the
            service name. Describe the
            problem or show us a photo.
            Fixxam will identify the right
            service and prepare your
            request.
          </AppText>
        </AppCard>

        {/* ====================================================
            SECTION
        ==================================================== */}

        <AppText
          variant="bodyMedium"
          weight="bold"
          style={
            styles.sectionTitle
          }
        >
          How would you like to start?
        </AppText>

        {/* ====================================================
            TAKE PHOTO
        ==================================================== */}

        <ActionCard
          icon="camera"
          title="Take a Photo"
          description="Show Fixxam the problem and let AI understand what you need."
          accessibilityLabel="Take a photo of the problem"
          onPress={
            handleTakePhoto
          }
        />

        {/* ====================================================
            DESCRIBE
        ==================================================== */}

        <ActionCard
          icon="file"
          title="Describe Your Problem"
          description="Tell Fixxam what happened using your own words and AI will prepare your request."
          accessibilityLabel="Describe your repair problem"
          onPress={
            handleDescribeProblem
          }
        />

        {/* ====================================================
            CUSTOMER CONTROL
        ==================================================== */}

        <View
          style={
            styles.securityCard
          }
        >
          <View
            style={
              styles.securityIcon
            }
          >
            <AppIcon
              name="verified"
              role="customer"
              size="sm"
              state="success"
            />
          </View>

          <View
            style={
              styles.securityContent
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.securityTitle
              }
            >
              You're always in control
            </AppText>

            <AppText
              variant="caption"
              style={
                styles.securityText
              }
            >
              Fixxam only prepares your
              request. You will review
              the service, problem,
              location and worker before
              sending it.
            </AppText>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    content: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection: "row",

      alignItems:
        "flex-start",

      gap:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.xl,
    },

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
        FixxamTokens.radius
          .iconButton,

      backgroundColor:
        Colors.surface,
    },

    backButtonPressed: {
      borderColor:
        CustomerColors.primaryLight,

      backgroundColor:
        CustomerColors.primarySoft,

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

    headerText: {
      flex: 1,

      minWidth: 0,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       AI FEATURE
    ======================================================== */

    aiCard: {
      padding:
        FixxamTokens.spacing.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    aiTopRow: {
      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.md,
    },

    aiIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    aiBadge: {
      minHeight: 32,

      flexDirection: "row",

      alignItems: "center",

      gap:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        Colors.surface,
    },

    aiBadgeText: {
      color:
        CustomerColors.primary,
    },

    aiDescription: {
      marginTop:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       SECTION
    ======================================================== */

    sectionTitle: {
      marginTop:
        FixxamTokens.spacing.xxl,

      marginBottom:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       ACTION CARD
    ======================================================== */

    actionCard: {
      minHeight:
        FixxamTokens.size
          .roleCardHeight,

      flexDirection: "row",

      alignItems: "center",

      marginBottom:
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

    actionCardPressed: {
      borderColor:
        CustomerColors.primaryLight,

      backgroundColor:
        CustomerColors.primarySoft,

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

    actionIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    actionContent: {
      flex: 1,

      minWidth: 0,
    },

    actionDescription: {
      marginTop:
        FixxamTokens.spacing.xs,

      paddingRight:
        FixxamTokens.spacing.xs,
    },

    arrowBox: {
      width: 32,

      height: 32,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      marginLeft:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    /* ========================================================
       CUSTOMER CONTROL
    ======================================================== */

    securityCard: {
      flexDirection: "row",

      alignItems:
        "flex-start",

      gap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.success,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.successSoft,
    },

    securityIcon: {
      width: 36,

      height: 36,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    securityContent: {
      flex: 1,

      minWidth: 0,
    },

    securityTitle: {
      color:
        Colors.success,
    },

    securityText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.success,
    },
  });