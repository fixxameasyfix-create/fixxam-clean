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

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

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
   TYPES
============================================================== */

type ActionCardProps = {
  title: string;

  description: string;

  icon: AppIconName;

  onPress: () => void;

  badge?: string;
};

/* ==============================================================
   ACTION CARD
============================================================== */

const ActionCard =
  memo(function ActionCard({
    title,
    description,
    icon,
    onPress,
    badge,
  }: ActionCardProps) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          title
        }
        onPress={
          onPress
        }
        style={({
          pressed,
        }) => [
          styles.actionCard,

          pressed
            ? styles.actionCardPressed
            : null,
        ]}
      >
        {/* ====================================================
            ICON
        ==================================================== */}

        <View
          style={
            styles.actionIcon
          }
        >
          <AppIcon
            name={icon}
            role="customer"
            size="lg"
            state="active"
          />
        </View>

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <View
          style={
            styles.actionContent
          }
        >
          <View
            style={
              styles.actionTitleRow
            }
          >
            <AppText
              variant="bodyLarge"
              weight="bold"
              numberOfLines={1}
              style={
                styles.actionTitle
              }
            >
              {title}
            </AppText>

            {badge ? (
              <View
                style={
                  styles.easyBadge
                }
              >
                <AppText
                  variant="caption"
                  weight="bold"
                  style={
                    styles.easyBadgeText
                  }
                >
                  {badge}
                </AppText>
              </View>
            ) : null}
          </View>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={2}
            style={
              styles.actionDescription
            }
          >
            {description}
          </AppText>
        </View>

        {/* ====================================================
            NEXT
        ==================================================== */}

        <View
          style={
            styles.chevronWrap
          }
        >
          <AppIcon
            name="next"
            role="customer"
            size="sm"
            state="muted"
          />
        </View>
      </Pressable>
    );
  });

/* ==============================================================
   SCREEN
============================================================== */

export default function FindPartScreen() {
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
        "/(customer)/buy-spare-parts/take-photo",
      );
    }, []);

  /* ============================================================
     DESCRIBE
  ============================================================ */

  const handleDescribePart =
    useCallback(() => {
      router.push(
        "/(customer)/buy-spare-parts/describe-part",
      );
    }, []);

  /* ============================================================
     EQUIPMENT
  ============================================================ */

  const handleChooseEquipment =
    useCallback(() => {
      router.push(
        "/(customer)/buy-spare-parts/choose-equipment",
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
        style={
          styles.screen
        }
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
              numberOfLines={1}
            >
              Find a Spare Part
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.headerSubtitle
              }
            >
              Find the right part easily
            </AppText>
          </View>
        </View>

        {/* ====================================================
            HELP CARD
        ==================================================== */}

        <AppCard
          role="customer"
          variant="accent"
          style={
            styles.helpCard
          }
        >
          <View
            style={
              styles.helpIcon
            }
          >
            {/* MaterialCommunityIcons intentionally preserved */}
            <MaterialCommunityIcons
              name="puzzle-outline"
              size={
                FixxamTokens.size
                  .iconLg
              }
              color={
                CustomerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.helpContent
            }
          >
            <AppText
              variant="bodyLarge"
              weight="bold"
            >
              Need help finding a part?
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.helpDescription
              }
            >
              You don't need to know
              the exact part name.
              Fixxam can help you
              identify what you need.
            </AppText>
          </View>
        </AppCard>

        {/* ====================================================
            ACTIONS
        ==================================================== */}

        <View
          style={
            styles.actions
          }
        >
          <ActionCard
            title="Take a Photo"
            description="Show us the part and we'll help you identify it."
            icon="camera"
            badge="EASY"
            onPress={
              handleTakePhoto
            }
          />

          <ActionCard
            title="Describe Your Part"
            description="Tell Fixxam what you need in your own words."
            icon="file"
            onPress={
              handleDescribePart
            }
          />

          <ActionCard
            title="Choose Your Equipment"
            description="Select your equipment and find compatible parts."
            icon="service"
            onPress={
              handleChooseEquipment
            }
          />
        </View>

        {/* ====================================================
            REASSURANCE
        ==================================================== */}

        <View
          style={
            styles.reassurance
          }
        >
          <View
            style={
              styles.reassuranceIcon
            }
          >
            <AppIcon
              name="shield"
              role="customer"
              size="sm"
              state="success"
            />
          </View>

          <View
            style={
              styles.reassuranceContent
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.reassuranceTitle
              }
            >
              Don't know the part name?
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.reassuranceText
              }
            >
              That's okay. Take a photo
              or describe what you need
              and we'll help you.
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
    /* ========================================================
       SCREEN
    ======================================================== */

    screen: {
      flex: 1,

      backgroundColor:
        Colors.background,
    },

    content: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      minHeight:
        FixxamTokens.size
          .headerHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingVertical:
        FixxamTokens.spacing.sm,
    },

    backButton: {
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

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius
          .iconButton,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    backButtonPressed: {
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

      marginLeft:
        FixxamTokens.spacing.md,
    },

    headerSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       HELP
    ======================================================== */

    helpCard: {
      minHeight: 112,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.lg,
    },

    helpIcon: {
      width:
        FixxamTokens.size.fabLarge,

      height:
        FixxamTokens.size.fabLarge,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    helpContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.lg,
    },

    helpDescription: {
      marginTop:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       ACTIONS
    ======================================================== */

    actions: {
      marginTop:
        FixxamTokens.spacing.xl,
    },

    actionCard: {
      width: "100%",

      minHeight:
        FixxamTokens.size
          .roleCardHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        FixxamTokens.spacing.md,

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
        CustomerColors.primary,

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
        FixxamTokens.size.fab,

      height:
        FixxamTokens.size.fab,

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

    actionContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    actionTitleRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      flexWrap:
        "wrap",
    },

    actionTitle: {
      flexShrink: 1,
    },

    actionDescription: {
      marginTop:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       BADGE
    ======================================================== */

    easyBadge: {
      minHeight: 24,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginLeft:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    easyBadgeText: {
      color:
        CustomerColors.primary,
    },

    /* ========================================================
       NEXT
    ======================================================== */

    chevronWrap: {
      width: 28,

      flexShrink: 0,

      alignItems:
        "flex-end",

      justifyContent:
        "center",
    },

    /* ========================================================
       REASSURANCE
    ======================================================== */

    reassurance: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.xs,

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

    reassuranceIcon: {
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
        FixxamTokens.radius
          .iconButton,

      backgroundColor:
        Colors.surface,
    },

    reassuranceContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    reassuranceTitle: {
      color:
        Colors.success,
    },

    reassuranceText: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },
  });