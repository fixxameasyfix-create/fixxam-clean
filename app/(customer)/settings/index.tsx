import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router } from "expo-router";

import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import useUserProfile from "@/hooks/auth/useUserProfile";

/* ============================================================
   TYPES
============================================================ */

type SettingsData = {
  notificationsEnabled?: boolean;
  marketingNotificationsEnabled?: boolean;
};

/* ============================================================
   DEFAULT SETTINGS
============================================================ */

const DEFAULT_SETTINGS: Required<SettingsData> = {
  notificationsEnabled: true,
  marketingNotificationsEnabled: false,
};

/* ============================================================
   CUSTOMER SETTINGS
============================================================ */

export default function CustomerSettingsScreen() {
  const { profile } = useUserProfile();

  const [settings, setSettings] =
    useState<Required<SettingsData>>(
      DEFAULT_SETTINGS,
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  /* ==========================================================
     LOAD SETTINGS
  ========================================================== */

  useEffect(() => {
    const uid =
      auth.currentUser?.uid;

    if (!uid) {
      setLoading(false);
      return;
    }

    const userRef = doc(
      db,
      "users",
      uid,
    );

    const unsubscribe =
      onSnapshot(
        userRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            setSettings(
              DEFAULT_SETTINGS,
            );

            setLoading(false);
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
              DEFAULT_SETTINGS.notificationsEnabled,

            marketingNotificationsEnabled:
              remoteSettings
                ?.marketingNotificationsEnabled ??
              DEFAULT_SETTINGS.marketingNotificationsEnabled,
          });

          setLoading(false);
        },
        (error) => {
          console.error(
            "CUSTOMER_SETTINGS_LISTENER_ERROR:",
            error,
          );

          setLoading(false);

          Alert.alert(
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
        key: keyof SettingsData,
        value: boolean,
      ) => {
        const uid =
          auth.currentUser?.uid;

        if (!uid || saving) {
          return;
        }

        const previous =
          settings[key];

        /* Optimistic UI */

        setSettings(
          (current) => ({
            ...current,
            [key]: value,
          }),
        );

        try {
          setSaving(true);

          await setDoc(
            doc(
              db,
              "users",
              uid,
            ),
            {
              settings: {
                [key]: value,
              },

              updatedAt:
                serverTimestamp(),
            },
            {
              merge: true,
            },
          );
        } catch (error) {
          console.error(
            "CUSTOMER_SETTINGS_UPDATE_ERROR:",
            error,
          );

          /* Rollback */

          setSettings(
            (current) => ({
              ...current,
              [key]: previous,
            }),
          );

          Alert.alert(
            "Update failed",
            "We could not save this setting. Please try again.",
          );
        } finally {
          setSaving(false);
        }
      },
      [
        saving,
        settings,
      ],
    );

  /* ==========================================================
     LOCATION SETTINGS
  ========================================================== */

  const handleLocationSettings =
    useCallback(
      async () => {
        try {
          await Linking.openSettings();
        } catch (error) {
          console.error(
            "OPEN_DEVICE_SETTINGS_ERROR:",
            error,
          );

          Alert.alert(
            "Unavailable",
            "Device settings could not be opened.",
          );
        }
      },
      [],
    );

  /* ==========================================================
     PRIVACY & SECURITY
  ========================================================== */

 const handlePrivacy = useCallback(() => {
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
        contentContainerStyle={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />
      </AppScreen>
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen
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
            onPress={() =>
              router.back()
            }
            style={
              styles.backButton
            }
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#0F172A"
            />
          </Pressable>

          <View
            style={
              styles.headerText
            }
          >
            <AppText
              weight="bold"
              style={
                styles.title
              }
            >
              Settings
            </AppText>

            <AppText
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
          {/* NOTIFICATIONS */}

          <SettingSwitchRow
            icon="notifications-outline"
            title="Notifications"
            subtitle="Receive service and booking notifications"
            value={
              settings.notificationsEnabled
            }
            disabled={
              saving
            }
            onValueChange={(
              value,
            ) =>
              updateSetting(
                "notificationsEnabled",
                value,
              )
            }
          />

          <Divider />

          {/* PROMOTIONAL NOTIFICATIONS */}

          <SettingSwitchRow
            icon="megaphone-outline"
            title="Promotional Notifications"
            subtitle="Receive offers and Fixxam promotions"
            value={
              settings.marketingNotificationsEnabled
            }
            disabled={
              saving
            }
            onValueChange={(
              value,
            ) =>
              updateSetting(
                "marketingNotificationsEnabled",
                value,
              )
            }
          />

          <Divider />

          {/* LOCATION */}

          <SettingRow
            icon="location-outline"
            title="Location Services"
            subtitle="Manage your device location permission"
            onPress={
              handleLocationSettings
            }
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
            icon="shield-checkmark-outline"
            title="Privacy & Security"
            subtitle="Manage your privacy and account security"
            onPress={
              handlePrivacy
            }
          />
        </View>

        {/* ====================================================
            CUSTOMER INFO
        ==================================================== */}

        {profile && (
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
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#16A34A"
              />
            </View>

            <View
              style={
                styles.infoContent
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.infoTitle
                }
              >
                Account protected
              </AppText>

              <AppText
                style={
                  styles.infoText
                }
              >
                Your settings are securely
                connected to your Fixxam account.
              </AppText>
            </View>
          </View>
        )}
      </ScrollView>
    </AppScreen>
  );
}

/* ============================================================
   SECTION TITLE
============================================================ */

function SectionTitle({
  title,
}: {
  title: string;
}) {
  return (
    <AppText
      weight="bold"
      style={
        styles.sectionTitle
      }
    >
      {title}
    </AppText>
  );
}

/* ============================================================
   SETTING ROW
============================================================ */

function SettingRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({
        pressed,
      }) => [
        styles.row,
        pressed &&
          styles.pressedRow,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View
        style={
          styles.iconBox
        }
      >
        <Ionicons
          name={icon}
          size={20}
          color="#2563EB"
        />
      </View>

      <View
        style={
          styles.rowContent
        }
      >
        <AppText
          weight="bold"
          style={
            styles.rowTitle
          }
        >
          {title}
        </AppText>

        <AppText
          style={
            styles.rowSubtitle
          }
        >
          {subtitle}
        </AppText>
      </View>

      <Ionicons
        name="chevron-forward"
        size={19}
        color="#94A3B8"
      />
    </Pressable>
  );
}

/* ============================================================
   SWITCH ROW
============================================================ */

function SettingSwitchRow({
  icon,
  title,
  subtitle,
  value,
  disabled,
  onValueChange,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  value: boolean;
  disabled?: boolean;
  onValueChange: (
    value: boolean,
  ) => void;
}) {
  return (
    <View
      style={
        styles.row
      }
    >
      <View
        style={
          styles.iconBox
        }
      >
        <Ionicons
          name={icon}
          size={20}
          color="#2563EB"
        />
      </View>

      <View
        style={
          styles.rowContent
        }
      >
        <AppText
          weight="bold"
          style={
            styles.rowTitle
          }
        >
          {title}
        </AppText>

        <AppText
          style={
            styles.rowSubtitle
          }
        >
          {subtitle}
        </AppText>
      </View>

      <Switch
        value={value}
        disabled={disabled}
        onValueChange={
          onValueChange
        }
        trackColor={{
          false: "#CBD5E1",
          true: "#93C5FD",
        }}
        thumbColor={
          value
            ? "#2563EB"
            : "#F8FAFC"
        }
        accessibilityLabel={
          title
        }
      />
    </View>
  );
}

/* ============================================================
   DIVIDER
============================================================ */

function Divider() {
  return (
    <View
      style={
        styles.divider
      }
    />
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    screen: {
      paddingHorizontal: 0,
      paddingTop: 0,
      paddingBottom: 0,
    },

    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    content: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 110,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 22,
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      alignItems: "center",
      justifyContent: "center",
    },

    headerText: {
      flex: 1,
      marginLeft: 12,
    },

    title: {
      fontSize: 21,
      color: "#0F172A",
    },

    subtitle: {
      marginTop: 3,
      fontSize: 12,
      color: "#64748B",
    },

    /* ========================================================
       SECTION
    ======================================================== */

    sectionTitle: {
      marginBottom: 8,
      marginLeft: 4,
      fontSize: 11,
      letterSpacing: 0.7,
      color: "#64748B",
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      backgroundColor: "#FFFFFF",
      borderRadius: 17,
      borderWidth: 1,
      borderColor: "#E2E8F0",
      overflow: "hidden",
      marginBottom: 20,
    },

    /* ========================================================
       ROW
    ======================================================== */

    row: {
      minHeight: 72,
      paddingHorizontal: 14,
      paddingVertical: 11,
      flexDirection: "row",
      alignItems: "center",
    },

    pressedRow: {
      opacity: 0.7,
    },

    iconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    rowContent: {
      flex: 1,
      marginHorizontal: 12,
    },

    rowTitle: {
      fontSize: 14,
      color: "#0F172A",
    },

    rowSubtitle: {
      marginTop: 3,
      fontSize: 11,
      lineHeight: 16,
      color: "#64748B",
    },

    divider: {
      height: 1,
      backgroundColor: "#F1F5F9",
      marginLeft: 66,
    },

    /* ========================================================
       ACCOUNT INFO
    ======================================================== */

    infoCard: {
      marginTop: 0,
      padding: 13,
      borderRadius: 16,
      backgroundColor: "#F0FDF4",
      borderWidth: 1,
      borderColor: "#BBF7D0",
      flexDirection: "row",
      alignItems: "center",
    },

    infoIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
    },

    infoContent: {
      flex: 1,
      marginLeft: 10,
    },

    infoTitle: {
      fontSize: 13,
      color: "#166534",
    },

    infoText: {
      marginTop: 3,
      fontSize: 10.5,
      lineHeight: 15,
      color: "#4D7C5A",
    },
  });