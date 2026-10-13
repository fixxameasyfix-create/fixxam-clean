import React, {
  memo,
  useCallback,
  useState,
} from "react";

import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

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
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type SettingsRowProps = {
  icon: AppIconName;

  title: string;

  description: string;

  onPress?: () => void;

  switchValue?: boolean;

  onSwitchChange?: (
    value: boolean,
  ) => void;

  disabled?: boolean;
};

/* ============================================================
   SCREEN
============================================================ */

export default function WorkerSettingsScreen() {
  const [
    notificationsEnabled,
    setNotificationsEnabled,
  ] =
    useState(
      true,
    );

  const [
    promotionalEnabled,
    setPromotionalEnabled,
  ] =
    useState(
      true,
    );

  /* ==========================================================
     BACK
  ========================================================== */

  const handleBack =
    useCallback(
      () => {
        router.back();
      },
      [],
    );

  /* ==========================================================
     NOTIFICATIONS
  ========================================================== */

  const handleNotificationsChange =
    useCallback(
      (
        enabled: boolean,
      ) => {
        setNotificationsEnabled(
          enabled,
        );

        /*
         * UI state only for now.
         *
         * Do not create a new Firebase preference schema here.
         * This should later connect to the existing Fixxam
         * notification preference service.
         */
      },
      [],
    );

  /* ==========================================================
     PROMOTIONAL NOTIFICATIONS
  ========================================================== */

  const handlePromotionalChange =
    useCallback(
      (
        enabled: boolean,
      ) => {
        setPromotionalEnabled(
          enabled,
        );

        /*
         * UI state only for now.
         *
         * Persistence should reuse the existing Fixxam
         * preference architecture.
         */
      },
      [],
    );

  /* ==========================================================
     LOCATION SERVICES
  ========================================================== */

  const handleLocationServices =
    useCallback(
      async () => {
        try {
          /*
           * Opens this app's native settings page.
           *
           * Android:
           * Fixxam App Info -> Permissions -> Location
           *
           * iOS:
           * Fixxam Settings -> Location
           */
          await Linking.openSettings();
        } catch (error) {
          console.error(
            "WORKER_OPEN_LOCATION_SETTINGS_ERROR:",
            error,
          );

          Toast.show({
            type:
              "error",

            text1:
              "Unable to open settings",

            text2:
              "Please open your device settings and manage Fixxam location permission.",
          });
        }
      },
      [],
    );

  /* ==========================================================
     PRIVACY & SECURITY
  ========================================================== */

  const handlePrivacySecurity =
    useCallback(
      () => {
        router.push(
          "/(worker)/profile/settings/privacy-security",
        );
      },
      [],
    );

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
            HEADER
        ================================================== */}

        <View
          style={
            styles.header
          }
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Returns to your worker profile"
            hitSlop={
              8
            }
            onPress={
              handleBack
            }
            style={({
              pressed,
            }) => [
              styles.backButton,

              pressed
                ? styles.buttonPressed
                : null,
            ]}
          >
            <AppIcon
              name="back"
              size="md"
              color={
                Colors.textPrimary
              }
            />
          </Pressable>

          <View
            style={
              styles.headerContent
            }
          >
            <AppText
              variant="heading1"
              weight="bold"
              style={
                styles.title
              }
            >
              Settings
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.subtitle
              }
            >
              Manage your Fixxam work preferences
            </AppText>
          </View>
        </View>

        {/* ==================================================
            PREFERENCES
        ================================================== */}

        <SettingsSectionTitle>
          PREFERENCES
        </SettingsSectionTitle>

        <View
          style={
            styles.settingsCard
          }
        >
          {/* ==================================================
              NOTIFICATIONS
          ================================================== */}

          <SettingsRow
            icon="notifications"
            title="Notifications"
            description="Receive job, booking and work notifications"
            switchValue={
              notificationsEnabled
            }
            onSwitchChange={
              handleNotificationsChange
            }
          />

          <View
            style={
              styles.divider
            }
          />

          {/* ==================================================
              PROMOTIONAL NOTIFICATIONS
          ================================================== */}

          <SettingsRow
            icon="star"
            title="Promotional Notifications"
            description="Receive offers and Fixxam promotions"
            switchValue={
              promotionalEnabled
            }
            onSwitchChange={
              handlePromotionalChange
            }
          />

          <View
            style={
              styles.divider
            }
          />

          {/* ==================================================
              LOCATION SERVICES
          ================================================== */}

          <SettingsRow
            icon="location"
            title="Location Services"
            description="Manage your device location permission"
            onPress={
              handleLocationServices
            }
          />
        </View>

        {/* ==================================================
            PRIVACY & SECURITY
        ================================================== */}

        <SettingsSectionTitle>
          PRIVACY & SECURITY
        </SettingsSectionTitle>

        <View
          style={
            styles.settingsCard
          }
        >
          <SettingsRow
            icon="security"
            title="Privacy & Security"
            description="Manage your privacy and account security"
            onPress={
              handlePrivacySecurity
            }
          />
        </View>

        {/* ==================================================
            STATUS
        ================================================== */}

        <View
          style={
            styles.syncCard
          }
        >
          <View
            style={
              styles.syncIcon
            }
          >
            <AppIcon
              name="check"
              size="sm"
              color={
                Colors.success
              }
            />
          </View>

          <View
            style={
              styles.syncContent
            }
          >
            <AppText
              variant="body"
              weight="bold"
              style={
                styles.syncTitle
              }
            >
              Settings ready
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.syncDescription
              }
            >
              Your worker preferences are managed securely through your Fixxam account.
            </AppText>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

/* ============================================================
   SECTION TITLE
============================================================ */

type SettingsSectionTitleProps = {
  children:
    React.ReactNode;
};

const SettingsSectionTitle =
  memo(
    function SettingsSectionTitle({
      children,
    }: SettingsSectionTitleProps) {
      return (
        <AppText
          variant="caption"
          weight="medium"
          style={
            styles.sectionTitle
          }
        >
          {children}
        </AppText>
      );
    },
  );

/* ============================================================
   SETTINGS ROW
============================================================ */

const SettingsRow =
  memo(
    function SettingsRow({
      icon,
      title,
      description,
      onPress,
      switchValue,
      onSwitchChange,
      disabled = false,
    }: SettingsRowProps) {
      const hasSwitch =
        typeof switchValue ===
          "boolean" &&
        Boolean(
          onSwitchChange,
        );

      const actionable =
        Boolean(
          onPress,
        ) ||
        hasSwitch;

      const handleRowPress =
        () => {
          if (
            disabled
          ) {
            return;
          }

          if (
            hasSwitch
          ) {
            onSwitchChange?.(
              !switchValue,
            );

            return;
          }

          onPress?.();
        };

      return (
        <Pressable
          accessibilityRole={
            hasSwitch
              ? "switch"
              : actionable
                ? "button"
                : undefined
          }
          accessibilityLabel={
            title
          }
          accessibilityHint={
            description
          }
          accessibilityState={
            hasSwitch
              ? {
                  checked:
                    switchValue,
                  disabled,
                }
              : {
                  disabled,
                }
          }
          disabled={
            disabled ||
            !actionable
          }
          onPress={
            handleRowPress
          }
          style={({
            pressed,
          }) => [
            styles.settingsRow,

            pressed &&
            actionable &&
            !disabled
              ? styles.rowPressed
              : null,

            disabled
              ? styles.rowDisabled
              : null,
          ]}
        >
          {/* ==================================================
              ICON
          ================================================== */}

          <View
            style={
              styles.rowIcon
            }
          >
            <AppIcon
              name={
                icon
              }
              role="worker"
              size="sm"
              color={
                WorkerColors.primary
              }
            />
          </View>

          {/* ==================================================
              CONTENT
          ================================================== */}

          <View
            style={
              styles.rowContent
            }
          >
            <AppText
              variant="bodyLarge"
              weight="medium"
              style={
                styles.rowTitle
              }
            >
              {title}
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.rowDescription
              }
            >
              {description}
            </AppText>
          </View>

          {/* ==================================================
              ACTION
          ================================================== */}

          {hasSwitch ? (
            <Switch
              value={
                switchValue
              }
              onValueChange={
                onSwitchChange
              }
              disabled={
                disabled
              }
              trackColor={{
                false:
                  Colors.disabledBackground,

                true:
                  WorkerColors.primarySoft,
              }}
              thumbColor={
                switchValue
                  ? WorkerColors.primary
                  : Colors.disabled
              }
            />
          ) : onPress ? (
            <View
              style={
                styles.chevron
              }
            >
              <AppIcon
                name="next"
                size="sm"
                color={
                  Colors.textSecondary
                }
              />
            </View>
          ) : null}
        </Pressable>
      );
    },
  );

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
       HEADER
    ======================================================== */

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        FixxamTokens.spacing.xl,
    },

    backButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.md,

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    buttonPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },

    headerContent: {
      flex:
        1,

      minWidth:
        0,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       SECTIONS
    ======================================================== */

    sectionTitle: {
      marginLeft:
        FixxamTokens.spacing.xs,

      marginBottom:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.md,

      letterSpacing:
        0.8,

      color:
        Colors.textSecondary,
    },

    settingsCard: {
      overflow:
        "hidden",

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       ROW
    ======================================================== */

    settingsRow: {
      minHeight:
        92,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,
    },

    rowPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,
    },

    rowDisabled: {
      opacity:
        FixxamTokens.motion.disabledOpacity,
    },

    rowIcon: {
      width:
        52,

      height:
        52,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    rowContent: {
      flex:
        1,

      minWidth:
        0,

      paddingRight:
        FixxamTokens.spacing.sm,
    },

    rowTitle: {
      color:
        Colors.textPrimary,
    },

    rowDescription: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight:
        20,
    },

    /* ========================================================
       DIVIDER
    ======================================================== */

    divider: {
      height:
        StyleSheet.hairlineWidth,

      marginLeft:
        52 +
        FixxamTokens.spacing.md *
          2,

      backgroundColor:
        Colors.border,
    },

    /* ========================================================
       CHEVRON
    ======================================================== */

    chevron: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    /* ========================================================
       STATUS
    ======================================================== */

    syncCard: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.xl,

      padding:
        FixxamTokens.spacing.md,

      borderWidth:
        1,

      borderColor:
        Colors.success,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.successSoft,
    },

    syncIcon: {
      width:
        52,

      height:
        52,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    syncContent: {
      flex:
        1,

      minWidth:
        0,
    },

    syncTitle: {
      color:
        Colors.success,
    },

    syncDescription: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight:
        20,
    },
  });