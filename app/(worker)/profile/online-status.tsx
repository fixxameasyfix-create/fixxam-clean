import React, {
  useCallback,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";

import {
  router,
  Stack,
} from "expo-router";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import useWorkerDashboard from "@/hooks/worker/useWorkerDashboard";

/* ============================================================
   SCREEN
============================================================ */

export default function WorkerOnlineStatusScreen() {
  const {
    online,
    updatingOnline,
    loading,
    toggleOnline,
  } = useWorkerDashboard();

  /* ==========================================================
     TOGGLE
  ========================================================== */

  const handleToggle =
    useCallback(
      (
        value: boolean,
      ) => {
        if (
          loading ||
          updatingOnline
        ) {
          return;
        }

        void toggleOnline(
          value,
        );
      },
      [
        loading,
        toggleOnline,
        updatingOnline,
      ],
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <AppScreen
        role="worker"
        padded={false}
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
            onPress={() =>
              router.back()
            }
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            style={({
              pressed,
            }) => [
              styles.backButton,

              pressed
                ? styles.pressed
                : null,
            ]}
          >
            <AppIcon
              name="back"
              role="worker"
              size="sm"
              color={
                Colors.textPrimary
              }
            />
          </Pressable>

          <AppText
            variant="bodyLarge"
            weight="bold"
            style={
              styles.headerTitle
            }
          >
            Online / Offline
          </AppText>

          <View
            style={
              styles.headerSpacer
            }
          />
        </View>

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
              STATUS HERO
          ================================================== */}

          <View
            style={
              styles.hero
            }
          >
            <View
              style={[
                styles.statusIcon,

                online
                  ? styles.onlineIcon
                  : styles.offlineIcon,
              ]}
            >
              <AppIcon
                name={
                  online
                    ? "success"
                    : "wifi-off"
                }
                role="worker"
                size="lg"
                color={
                  online
                    ? Colors.success
                    : Colors.textSecondary
                }
              />
            </View>

            <AppText
              variant="bodyLarge"
              weight="bold"
              style={
                styles.heroTitle
              }
            >
              {online
                ? "You’re Online"
                : "You’re Offline"}
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.heroDescription
              }
            >
              {online
                ? "Stay online to receive job opportunities faster and connect with customers looking for your services."
                : "Go online when you’re ready to work so customers can find you and you can receive new job opportunities."}
            </AppText>
          </View>

          {/* ==================================================
              TOGGLE
          ================================================== */}

          <View
            style={
              styles.statusCard
            }
          >
            <View
              style={
                styles.statusContent
              }
            >
              <View
                style={
                  styles.statusTitleRow
                }
              >
                <View
                  style={[
                    styles.statusDot,

                    online
                      ? styles.onlineDot
                      : styles.offlineDot,
                  ]}
                />

                <AppText
                  variant="bodyMedium"
                  weight="bold"
                  style={
                    styles.statusTitle
                  }
                >
                  {online
                    ? "Online"
                    : "Offline"}
                </AppText>
              </View>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.statusDescription
                }
              >
                {online
                  ? "You’re available for new jobs."
                  : "You’re not available for new jobs."}
              </AppText>
            </View>

            <View
              style={
                styles.switchContainer
              }
            >
              {updatingOnline ? (
                <ActivityIndicator
                  size="small"
                  color={
                    WorkerColors.primary
                  }
                  style={
                    styles.savingIndicator
                  }
                />
              ) : null}

              <Switch
                value={
                  online
                }
                onValueChange={
                  handleToggle
                }
                disabled={
                  loading ||
                  updatingOnline
                }
                accessibilityRole="switch"
                accessibilityLabel="Worker availability"
                accessibilityHint={
                  online
                    ? "Turn off to stop showing as available for new jobs"
                    : "Turn on to show that you are available for new jobs"
                }
                accessibilityState={{
                  checked:
                    online,

                  disabled:
                    loading ||
                    updatingOnline,

                  busy:
                    updatingOnline,
                }}
                trackColor={{
                  false:
                    Colors.border,

                  true:
                    WorkerColors.primarySoft,
                }}
                thumbColor={
                  online
                    ? WorkerColors.primary
                    : Colors.textSecondary
                }
              />
            </View>
          </View>

          {/* ==================================================
              ADVICE
          ================================================== */}

          <View
            style={
              styles.tipCard
            }
          >
            <View
              style={
                styles.tipIcon
              }
            >
              <AppIcon
                name="info"
                role="worker"
                size="sm"
                color={
                  WorkerColors.primary
                }
              />
            </View>

            <View
              style={
                styles.tipContent
              }
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
                style={
                  styles.tipTitle
                }
              >
                Get jobs faster
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.tipText
                }
              >
                Workers who stay online
                can be easier for nearby
                customers to reach. Keep
                your status online when
                you’re available and ready
                to accept work.
              </AppText>
            </View>
          </View>

          {/* ==================================================
              PRIVACY
          ================================================== */}

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.footerText
            }
          >
            You’re always in control.
            Switch to Offline whenever
            you’re unavailable or don’t
            want to receive new job
            opportunities.
          </AppText>
        </ScrollView>
      </AppScreen>
    </>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    header: {
      minHeight:
        FixxamTokens.size
          .headerHeight,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,

      backgroundColor:
        Colors.surface,
    },

    backButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.button,
    },

    headerTitle: {
      flex: 1,

      textAlign:
        "center",

      color:
        Colors.textPrimary,
    },

    headerSpacer: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,
    },

    content: {
      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.xl,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    hero: {
      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,
    },

    statusIcon: {
      width: 72,

      height: 72,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,
    },

    onlineIcon: {
      backgroundColor:
        Colors.successSoft,
    },

    offlineIcon: {
      backgroundColor:
        Colors.background,
    },

    heroTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      textAlign:
        "center",

      color:
        Colors.textPrimary,
    },

    heroDescription: {
      maxWidth: 430,

      marginTop:
        FixxamTokens.spacing.sm,

      textAlign:
        "center",

      lineHeight: 21,
    },

    statusCard: {
      minHeight: 84,

      marginTop:
        FixxamTokens.spacing.xl,

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

    statusContent: {
      flex: 1,

      minWidth: 0,

      paddingRight:
        FixxamTokens.spacing.md,
    },

    statusTitleRow: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    statusDot: {
      width: 9,

      height: 9,

      marginRight:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,
    },

    onlineDot: {
      backgroundColor:
        Colors.success,
    },

    offlineDot: {
      backgroundColor:
        Colors.textSecondary,
    },

    statusTitle: {
      color:
        Colors.textPrimary,
    },

    statusDescription: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    switchContainer: {
      flexShrink: 0,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    savingIndicator: {
      marginRight:
        FixxamTokens.spacing.xs,
    },

    tipCard: {
      marginTop:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    tipIcon: {
      width: 38,

      height: 38,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    tipContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    tipTitle: {
      color:
        Colors.textPrimary,
    },

    tipText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 18,
    },

    footerText: {
      marginTop:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      textAlign:
        "center",

      lineHeight: 18,
    },

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