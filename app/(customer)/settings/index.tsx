import React, {
  memo,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
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
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

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
} from "@/theme";

import {
  auth,
  db,
} from "@/firebase/config";

import useUserProfile from "@/hooks/auth/useUserProfile";

/* ============================================================
   TYPES
============================================================ */

type SettingsData = {
  notificationsEnabled?: boolean;

  marketingNotificationsEnabled?: boolean;
};

type SettingsKey =
  keyof SettingsData;

/* ============================================================
   DEFAULT SETTINGS
============================================================ */

const DEFAULT_SETTINGS: Required<SettingsData> = {
  notificationsEnabled:
    true,

  marketingNotificationsEnabled:
    false,
};

/* ============================================================
   TOAST
============================================================ */

function showErrorToast(
  title: string,
  message: string,
) {
  Toast.show({
    type: "error",
    text1: title,
    text2: message,
  });
}

/* ============================================================
   CUSTOMER SETTINGS
============================================================ */

export default function CustomerSettingsScreen() {
  const {
    profile,
  } =
    useUserProfile();

  const [
    settings,
    setSettings,
  ] =
    useState<Required<SettingsData>>(
      DEFAULT_SETTINGS,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    savingKey,
    setSavingKey,
  ] =
    useState<SettingsKey | null>(
      null,
    );

  /* ==========================================================
     LOAD SETTINGS
  ========================================================== */

  useEffect(() => {
    const uid =
      auth.currentUser?.uid;

    if (!uid) {
      setLoading(
        false,
      );

      return;
    }

    const userRef =
      doc(
        db,
        "users",
        uid,
      );

    const unsubscribe =
      onSnapshot(
        userRef,
        snapshot => {
          if (
            !snapshot.exists()
          ) {
            setSettings(
              DEFAULT_SETTINGS,
            );

            setLoading(
              false,
            );

            return;
          }

          const data =
            snapshot.data();

          const remoteSettings =
            data.settings as
              | SettingsData
              | undefined;

          setSettings({
            notificationsEnabled:
              remoteSettings
                ?.notificationsEnabled ??
              DEFAULT_SETTINGS
                .notificationsEnabled,

            marketingNotificationsEnabled:
              remoteSettings
                ?.marketingNotificationsEnabled ??
              DEFAULT_SETTINGS
                .marketingNotificationsEnabled,
          });

          setLoading(
            false,
          );
        },
        error => {
          console.error(
            "CUSTOMER_SETTINGS_LISTENER_ERROR:",
            error,
          );

          setLoading(
            false,
          );

          showErrorToast(
            "Unable to load settings",
            "Please try again.",
          );
        },
      );

    return unsubscribe;
  }, []);

  /* ==========================================================
     UPDATE SETTING
  ========================================================== */

  const updateSetting =
    useCallback(
      async (
        key: SettingsKey,
        value: boolean,
      ) => {
        const uid =
          auth.currentUser?.uid;

        if (!uid) {
          showErrorToast(
            "Sign in required",
            "Please sign in again before changing your settings.",
          );

          return;
        }

        if (
          savingKey !== null
        ) {
          return;
        }

        const previous =
          settings[key];

        /*
         * Optimistic UI.
         */
        setSettings(
          current => ({
            ...current,

            [key]:
              value,
          }),
        );

        setSavingKey(
          key,
        );

        try {
          /*
           * Dot notation updates only the selected
           * nested setting and preserves sibling
           * settings.
           *
           * setDoc + merge also remains safe if an
           * older user document is missing settings.
           */
          await setDoc(
            doc(
              db,
              "users",
              uid,
            ),
            {
              [`settings.${key}`]:
                value,

              updatedAt:
                serverTimestamp(),
            },
            {
              merge: true,
            },
          );
        } catch (
          error
        ) {
          console.error(
            "CUSTOMER_SETTINGS_UPDATE_ERROR:",
            {
              key,
              value,
              error,
            },
          );

          /*
           * Roll back only the failed
           * setting.
           */
          setSettings(
            current => ({
              ...current,

              [key]:
                previous,
            }),
          );

          showErrorToast(
            "Update failed",
            "We could not save this setting. Please try again.",
          );
        } finally {
          setSavingKey(
            null,
          );
        }
      },
      [
        savingKey,
        settings,
      ],
    );

  /* ==========================================================
     DEVICE LOCATION SETTINGS
  ========================================================== */

  const handleLocationSettings =
    useCallback(async () => {
      try {
        await Linking.openSettings();
      } catch (
        error
      ) {
        console.error(
          "OPEN_DEVICE_SETTINGS_ERROR:",
          error,
        );

        showErrorToast(
          "Unable to open settings",
          "Device settings could not be opened.",
        );
      }
    }, []);

  /* ==========================================================
     PRIVACY & SECURITY
  ========================================================== */

  const handlePrivacy =
    useCallback(() => {
      router.push(
        "/(customer)/settings/privacy-security" as never,
      );
    }, []);

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <AppScreen
        role="customer"
        contentContainerStyle={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color={
            CustomerColors.primary
          }
        />

        <AppText
          variant="body"
          tone="secondary"
          style={
            styles.loadingText
          }
        >
          Loading settings...
        </AppText>
      </AppScreen>
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen
      role="customer"
      contentContainerStyle={
        styles.screen
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
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
            onPress={() => {
              router.back();
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
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
              size="md"
              color={
                Colors.textPrimary
              }
            />
          </Pressable>

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
              Settings
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.subtitle
              }
            >
              Manage your Fixxam preferences
            </AppText>
          </View>
        </View>

        {/* ====================================================
            PREFERENCES
        ==================================================== */}

        <SectionTitle
          title="PREFERENCES"
        />

        <View
          style={
            styles.card
          }
        >
          <SettingSwitchRow
            icon="notifications"
            title="Notifications"
            subtitle="Receive service and booking notifications"
            value={
              settings.notificationsEnabled
            }
            disabled={
              savingKey !== null
            }
            loading={
              savingKey ===
              "notificationsEnabled"
            }
            onValueChange={
              value => {
                void updateSetting(
                  "notificationsEnabled",
                  value,
                );
              }
            }
          />

          <Divider />

          <SettingSwitchRow
            icon="star"
            title="Promotional Notifications"
            subtitle="Receive offers and Fixxam promotions"
            value={
              settings
                .marketingNotificationsEnabled
            }
            disabled={
              savingKey !== null
            }
            loading={
              savingKey ===
              "marketingNotificationsEnabled"
            }
            onValueChange={
              value => {
                void updateSetting(
                  "marketingNotificationsEnabled",
                  value,
                );
              }
            }
          />

          <Divider />

          <SettingRow
            icon="location"
            title="Location Services"
            subtitle="Manage your device location permission"
            onPress={() => {
              void handleLocationSettings();
            }}
          />
        </View>

        {/* ====================================================
            PRIVACY & SECURITY
        ==================================================== */}

        <SectionTitle
          title="PRIVACY & SECURITY"
        />

        <View
          style={
            styles.card
          }
        >
          <SettingRow
            icon="shield"
            title="Privacy & Security"
            subtitle="Manage your privacy and account security"
            onPress={
              handlePrivacy
            }
          />
        </View>

        {/* ====================================================
            ACCOUNT INFO
        ==================================================== */}

        {profile ? (
          <View
            style={
              styles.infoCard
            }
          >
            <View
              style={
                styles.infoIcon
              }
            >
              <AppIcon
                name="success"
                size="sm"
                color={
                  Colors.success
                }
              />
            </View>

            <View
              style={
                styles.infoContent
              }
            >
              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.infoTitle
                }
              >
                Settings synced
              </AppText>

              <AppText
                variant="caption"
                style={
                  styles.infoText
                }
              >
                Your preferences are securely connected to your Fixxam account.
              </AppText>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

/* ============================================================
   SECTION TITLE
============================================================ */

const SectionTitle =
  memo(
    function SectionTitle({
      title,
    }: {
      title: string;
    }) {
      return (
        <AppText
          variant="caption"
          weight="bold"
          style={
            styles.sectionTitle
          }
        >
          {title}
        </AppText>
      );
    },
  );

SectionTitle.displayName =
  "SectionTitle";

/* ============================================================
   SETTING ROW
============================================================ */

const SettingRow =
  memo(
    function SettingRow({
      icon,
      title,
      subtitle,
      onPress,
    }: {
      icon: AppIconName;

      title: string;

      subtitle: string;

      onPress: () => void;
    }) {
      return (
        <Pressable
          onPress={
            onPress
          }
          accessibilityRole="button"
          accessibilityLabel={
            title
          }
          style={({
            pressed,
          }) => [
            styles.row,

            pressed
              ? styles.pressedRow
              : null,
          ]}
        >
          <View
            style={
              styles.iconBox
            }
          >
            <AppIcon
              name={
                icon
              }
              role="customer"
              size="sm"
              color={
                CustomerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.rowContent
            }
          >
            <AppText
              variant="body"
              weight="bold"
              style={
                styles.rowTitle
              }
            >
              {title}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.rowSubtitle
              }
            >
              {subtitle}
            </AppText>
          </View>

          <AppIcon
            name="next"
            size="sm"
            color={
              Colors.textMuted
            }
          />
        </Pressable>
      );
    },
  );

SettingRow.displayName =
  "SettingRow";

/* ============================================================
   SWITCH ROW
============================================================ */

const SettingSwitchRow =
  memo(
    function SettingSwitchRow({
      icon,
      title,
      subtitle,
      value,
      disabled = false,
      loading = false,
      onValueChange,
    }: {
      icon: AppIconName;

      title: string;

      subtitle: string;

      value: boolean;

      disabled?: boolean;

      loading?: boolean;

      onValueChange: (
        value: boolean,
      ) => void;
    }) {
      return (
        <View
          style={[
            styles.row,

            disabled
              ? styles.disabledRow
              : null,
          ]}
        >
          <View
            style={
              styles.iconBox
            }
          >
            <AppIcon
              name={
                icon
              }
              role="customer"
              size="sm"
              color={
                CustomerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.rowContent
            }
          >
            <AppText
              variant="body"
              weight="bold"
              style={
                styles.rowTitle
              }
            >
              {title}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.rowSubtitle
              }
            >
              {subtitle}
            </AppText>
          </View>

          {loading ? (
            <View
              style={
                styles.switchLoader
              }
            >
              <ActivityIndicator
                size="small"
                color={
                  CustomerColors.primary
                }
              />
            </View>
          ) : (
            <Switch
              value={
                value
              }
              disabled={
                disabled
              }
              onValueChange={
                onValueChange
              }
              trackColor={{
                false:
                  Colors.disabled,

                true:
                  CustomerColors.primarySoft,
              }}
              thumbColor={
                value
                  ? CustomerColors.primary
                  : Colors.surface
              }
              accessibilityLabel={
                title
              }
              accessibilityState={{
                checked:
                  value,

                disabled,
              }}
            />
          )}
        </View>
      );
    },
  );

SettingSwitchRow.displayName =
  "SettingSwitchRow";

/* ============================================================
   DIVIDER
============================================================ */

const Divider =
  memo(
    function Divider() {
      return (
        <View
          style={
            styles.divider
          }
        />
      );
    },
  );

Divider.displayName =
  "Divider";

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       SCREEN
    ======================================================== */

    screen: {
      flex: 1,

      paddingHorizontal: 0,

      paddingTop: 0,

      paddingBottom: 0,

      backgroundColor:
        Colors.background,
    },

    loadingContainer: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.background,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textSecondary,
    },

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
      marginBottom:
        FixxamTokens.spacing.xl,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    backButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
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
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       SECTION
    ======================================================== */

    sectionTitle: {
      marginLeft:
        FixxamTokens.spacing.xs,

      marginBottom:
        FixxamTokens.spacing.sm,

      letterSpacing: 0.7,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      overflow:
        "hidden",

      marginBottom:
        FixxamTokens.spacing.xl,

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
       ROW
    ======================================================== */

    row: {
      minHeight: 76,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    pressedRow: {
      backgroundColor:
        Colors.disabledBackground,

      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    disabledRow: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    iconBox: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

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

    rowContent: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.md,
    },

    rowTitle: {
      color:
        Colors.textPrimary,
    },

    rowSubtitle: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 16,

      color:
        Colors.textSecondary,
    },

    divider: {
      height: 1,

      marginLeft:
        68,

      backgroundColor:
        Colors.divider,
    },

    switchLoader: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    /* ========================================================
       ACCOUNT INFO
    ======================================================== */

    infoCard: {
      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.success,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.successSoft,
    },

    infoIcon: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

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

    infoContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    infoTitle: {
      color:
        Colors.success,
    },

    infoText: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 16,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       PRESS
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