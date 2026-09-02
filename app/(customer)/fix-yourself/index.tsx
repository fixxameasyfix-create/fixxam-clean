import React, { useState } from "react";

import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";

import { getAuth } from "firebase/auth";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppScreen,
  AppInput,
  AppButton,
  AppText,
} from "@/components/ui";

import {
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   CONSTANTS
============================================================== */

const EXAMPLES = [
  "My TV won't turn on",
  "My car is smoking",
  "AC is not cooling",
  "Water is leaking",
];

/* ==============================================================
   SCREEN
============================================================== */

export default function FixYourselfScreen() {
  const [problem, setProblem] =
    useState("");

  const [
    loginModalVisible,
    setLoginModalVisible,
  ] = useState(false);

  /* ============================================================
     OPEN LOGIN MODAL
  ============================================================ */

  const openLoginModal = () => {
    setLoginModalVisible(true);
  };

  /* ============================================================
     CLOSE LOGIN MODAL
  ============================================================ */

  const closeLoginModal = () => {
    setLoginModalVisible(false);
  };

  /* ============================================================
     LOGIN
  ============================================================ */

  const handleLogin = () => {
    setLoginModalVisible(false);

    router.push(
      "/(auth)/login",
    );
  };

  /* ============================================================
     SEARCH
  ============================================================ */

  const handleSearch = () => {
    const query =
      problem.trim();

    /* ----------------------------------------------------------
       VALIDATION
    ---------------------------------------------------------- */

    if (query.length < 5) {
      return;
    }

    /* ----------------------------------------------------------
       AUTHENTICATION
    ---------------------------------------------------------- */

    const auth =
      getAuth();

    if (!auth.currentUser) {
      openLoginModal();
      return;
    }

    /* ----------------------------------------------------------
       AUTHENTICATED USER
    ---------------------------------------------------------- */

    router.push({
      pathname:
        "/(customer)/fix-yourself/loading",

      params: {
        query,

        messages:
          JSON.stringify([
            {
              role: "user",
              content: query,
            },
          ]),
      },
    });
  };

  /* ============================================================
     UI
  ============================================================ */

  return (
    <>
      <AppScreen>
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.container
          }
          keyboardShouldPersistTaps="handled"
        >
          {/* ==================================================
              TITLE
          ================================================== */}

          <AppText
            size="xl"
            weight="bold"
          >
            Fix Yourself
          </AppText>

          <AppText
            style={
              styles.subtitle
            }
            color={
              CustomerColors.textSecondary
            }
          >
            How can Fixxam help you
            today?
          </AppText>

          {/* ==================================================
              DESCRIPTION
          ================================================== */}

          <AppText
            size="sm"
            color={
              CustomerColors.textSecondary
            }
            style={
              styles.description
            }
          >
            Describe what's wrong
            with your car, TV, AC,
            plumbing, electrical,
            generator or any other
            problem.
          </AppText>

          {/* ==================================================
              PROBLEM INPUT
          ================================================== */}

          <AppInput
            placeholder="Describe your problem in detail..."
            value={problem}
            onChangeText={
              setProblem
            }
            leftIcon="search"
            multiline
            numberOfLines={5}
            returnKeyType="done"
            blurOnSubmit={false}
            onSubmitEditing={
              handleSearch
            }
          />

          {/* ==================================================
              EXAMPLES
          ================================================== */}

          <View
            style={
              styles.examplesContainer
            }
          >
            <AppText
              weight="semibold"
              style={
                styles.examplesTitle
              }
            >
              Examples
            </AppText>

            <View
              style={
                styles.chips
              }
            >
              {EXAMPLES.map(
                (item) => (
                  <TouchableOpacity
                    key={item}
                    activeOpacity={
                      0.8
                    }
                    style={
                      styles.chip
                    }
                    onPress={() =>
                      setProblem(
                        item,
                      )
                    }
                  >
                    <AppText
                      size="sm"
                    >
                      {item}
                    </AppText>
                  </TouchableOpacity>
                ),
              )}
            </View>
          </View>

          {/* ==================================================
              SEARCH BUTTON
          ================================================== */}

          <AppButton
            title="Search Problem"
            onPress={
              handleSearch
            }
            disabled={
              !problem.trim()
            }
            style={
              styles.searchButton
            }
          />
        </ScrollView>
      </AppScreen>

      {/* ========================================================
          LOGIN MODAL
      ======================================================== */}

      <Modal
        visible={
          loginModalVisible
        }
        transparent={true}
        animationType="fade"
        onRequestClose={
          closeLoginModal
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          {/* ----------------------------------------------------
              BACKDROP
          ---------------------------------------------------- */}

          <Pressable
            style={
              StyleSheet.absoluteFill
            }
            onPress={
              closeLoginModal
          }
          />

          {/* ----------------------------------------------------
              MODAL CARD
          ---------------------------------------------------- */}

          <View
            style={
              styles.modalCard
            }
          >
            {/* --------------------------------------------------
                ICON
            -------------------------------------------------- */}

            <View
              style={
                styles.modalIcon
              }
            >
              <Ionicons
                name="person-outline"
                size={28}
                color="#2563EB"
              />
            </View>

            {/* --------------------------------------------------
                TITLE
            -------------------------------------------------- */}

            <AppText
              weight="bold"
              style={
                styles.modalTitle
              }
            >
              Login required
            </AppText>

            {/* --------------------------------------------------
                MESSAGE
            -------------------------------------------------- */}

            <AppText
              style={
                styles.modalMessage
              }
            >
              Please login to use
              Fix Yourself.
            </AppText>

            {/* --------------------------------------------------
                ACTIONS
            -------------------------------------------------- */}

            <View
              style={
                styles.modalActions
              }
            >
              {/* CANCEL */}

              <Pressable
                onPress={
                  closeLoginModal
                }
                accessibilityRole="button"
                accessibilityLabel="Cancel login"
                style={({ pressed }) => [
                  styles.modalButton,
                  pressed &&
                    styles.modalButtonPressed,
                ]}
              >
                <AppText
                  weight="bold"
                  style={
                    styles.cancelText
                  }
                >
                  CANCEL
                </AppText>
              </Pressable>

              {/* LOGIN */}

              <Pressable
                onPress={
                  handleLogin
                }
                accessibilityRole="button"
                accessibilityLabel="Login"
                style={({ pressed }) => [
                  styles.modalButton,
                  pressed &&
                    styles.modalButtonPressed,
                ]}
              >
                <AppText
                  weight="bold"
                  style={
                    styles.loginText
                  }
                >
                  LOGIN
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ==========================================================
       SCREEN
    ========================================================== */

    container: {
      padding:
        FixxamTokens.spacing.lg,

      paddingBottom: 40,

      gap: 20,
    },

    subtitle: {
      marginTop: -8,
    },

    description: {
      marginTop: -12,

      lineHeight: 22,
    },

    /* ==========================================================
       EXAMPLES
    ========================================================== */

    examplesContainer: {
      gap: 12,
    },

    examplesTitle: {
      fontSize: 15,
    },

    chips: {
      flexDirection: "row",

      flexWrap: "wrap",

      gap: 10,
    },

    chip: {
      borderWidth: 1,

      borderColor:
        CustomerColors.border,

      borderRadius: 20,

      paddingHorizontal: 14,

      paddingVertical: 10,

      backgroundColor:
        "#FFFFFF",
    },

    /* ==========================================================
       SEARCH BUTTON
    ========================================================== */

    searchButton: {
      marginTop: 10,
    },

    /* ==========================================================
       LOGIN MODAL OVERLAY
    ========================================================== */

    modalOverlay: {
      flex: 1,

      backgroundColor:
        "rgba(15, 23, 42, 0.58)",

      alignItems: "center",

      justifyContent: "center",

      paddingHorizontal: 28,
    },

    /* ==========================================================
       LOGIN MODAL CARD
    ========================================================== */

    modalCard: {
      width: "100%",

      maxWidth: 420,

      backgroundColor:
        "#FFFFFF",

      borderRadius: 24,

      paddingHorizontal: 22,

      paddingTop: 24,

      paddingBottom: 14,

      shadowColor:
        "#000000",

      shadowOpacity: 0.2,

      shadowRadius: 24,

      shadowOffset: {
        width: 0,
        height: 10,
      },

      elevation: 12,
    },

    /* ==========================================================
       MODAL ICON
    ========================================================== */

    modalIcon: {
      width: 54,

      height: 54,

      borderRadius: 18,

      backgroundColor:
        "#EFF6FF",

      alignItems: "center",

      justifyContent: "center",

      marginBottom: 16,
    },

    /* ==========================================================
       MODAL TITLE
    ========================================================== */

    modalTitle: {
      fontSize: 22,

      lineHeight: 28,

      color: "#0F172A",
    },

    /* ==========================================================
       MODAL MESSAGE
    ========================================================== */

    modalMessage: {
      marginTop: 8,

      fontSize: 15,

      lineHeight: 22,

      color: "#64748B",

      maxWidth: 330,
    },

    /* ==========================================================
       MODAL ACTIONS
    ========================================================== */

    modalActions: {
      marginTop: 22,

      flexDirection: "row",

      justifyContent:
        "flex-end",

      alignItems: "center",

      gap: 4,
    },

    modalButton: {
      minHeight: 44,

      paddingHorizontal: 14,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius: 12,
    },

    modalButtonPressed: {
      backgroundColor:
        "#F8FAFC",

      opacity: 0.75,
    },

    /* ==========================================================
       CANCEL
    ========================================================== */

    cancelText: {
      fontSize: 14,

      letterSpacing: 0.8,

      color: "#64748B",
    },

    /* ==========================================================
       LOGIN
    ========================================================== */

    loginText: {
      fontSize: 14,

      letterSpacing: 0.8,

      color: "#2563EB",
    },
  });