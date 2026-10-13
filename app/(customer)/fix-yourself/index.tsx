import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  getAuth,
} from "firebase/auth";

import Toast from "react-native-toast-message";

import {
  AppButton,
  AppIcon,
  AppInput,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   CONSTANTS
============================================================== */

const MIN_PROBLEM_LENGTH = 5;

const EXAMPLES = [
  "My TV won't turn on",
  "My car is smoking",
  "AC is not cooling",
  "Water is leaking",
] as const;

/* ==============================================================
   SCREEN
============================================================== */

export default function FixYourselfScreen() {
  const [
    problem,
    setProblem,
  ] = useState("");

  const [
    loginModalVisible,
    setLoginModalVisible,
  ] = useState(false);

  /* ============================================================
     VALIDATION
  ============================================================ */

  const normalizedProblem =
    useMemo(
      () =>
        problem.trim(),
      [
        problem,
      ],
    );

  const canSearch =
    normalizedProblem.length >=
    MIN_PROBLEM_LENGTH;

  /* ============================================================
     LOGIN MODAL
  ============================================================ */

  const openLoginModal =
    useCallback(() => {
      setLoginModalVisible(
        true,
      );
    }, []);

  const closeLoginModal =
    useCallback(() => {
      setLoginModalVisible(
        false,
      );
    }, []);

  /* ============================================================
     LOGIN
  ============================================================ */

  const handleLogin =
    useCallback(() => {
      setLoginModalVisible(
        false,
      );

      router.push(
        "/(auth)/login",
      );
    }, []);

  /* ============================================================
     EXAMPLE
  ============================================================ */

  const handleExamplePress =
    useCallback(
      (
        example: string,
      ) => {
        setProblem(example);
      },
      [],
    );

  /* ============================================================
     SEARCH
  ============================================================ */

  const handleSearch =
    useCallback(() => {
      const query =
        problem.trim();

      /* --------------------------------------------------------
         VALIDATION
      -------------------------------------------------------- */

      if (
        query.length <
        MIN_PROBLEM_LENGTH
      ) {
        Toast.show({
          type: "error",

          text1:
            "Describe the problem",

          text2:
            "Please enter at least 5 characters.",
        });

        return;
      }

      /* --------------------------------------------------------
         AUTHENTICATION
      -------------------------------------------------------- */

      const auth =
        getAuth();

      if (
        !auth.currentUser
      ) {
        openLoginModal();

        return;
      }

      /* --------------------------------------------------------
         CONTINUE
      -------------------------------------------------------- */

      router.push({
        pathname:
          "/(customer)/fix-yourself/loading",

        params: {
          query,

          messages:
            JSON.stringify([
              {
                role: "user",
                content:
                  query,
              },
            ]),
        },
      });
    }, [
      openLoginModal,
      problem,
    ]);

  /* ============================================================
     UI
  ============================================================ */

  return (
    <>
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
            styles.container
          }
        >
          {/* ==================================================
              INTRO
          ================================================== */}

          <View
            style={
              styles.intro
            }
          >
            <View
              style={
                styles.iconBox
              }
            >
              <AppIcon
                name="service"
                role="customer"
                size="lg"
                state="active"
              />
            </View>

            <AppText
              variant="heading2"
              weight="bold"
              style={
                styles.title
              }
            >
              Fix Yourself
            </AppText>

            <AppText
              variant="bodyLarge"
              tone="secondary"
              style={
                styles.subtitle
              }
            >
              How can Fixxam help you today?
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.description
              }
            >
              Describe what's wrong with your car, TV, AC, plumbing, electrical, generator or any other problem.
            </AppText>
          </View>

          {/* ==================================================
              PROBLEM INPUT
          ================================================== */}

          <View
            style={
              styles.inputSection
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.sectionTitle
              }
            >
              What's the problem?
            </AppText>

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
          </View>

          {/* ==================================================
              EXAMPLES
          ================================================== */}

          <View
            style={
              styles.examplesContainer
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.sectionTitle
              }
            >
              Try an example
            </AppText>

            <View
              style={
                styles.chips
              }
            >
              {EXAMPLES.map(
                (
                  item,
                ) => (
                  <Pressable
                    key={item}
                    accessibilityRole="button"
                    accessibilityLabel={`Use example: ${item}`}
                    onPress={() =>
                      handleExamplePress(
                        item,
                      )
                    }
                    style={({
                      pressed,
                    }) => [
                      styles.chip,

                      pressed
                        ? styles.pressed
                        : null,
                    ]}
                  >
                    <AppText
                      variant="caption"
                      weight="medium"
                      style={
                        styles.chipText
                      }
                    >
                      {item}
                    </AppText>
                  </Pressable>
                ),
              )}
            </View>
          </View>

          {/* ==================================================
              SEARCH
          ================================================== */}

          <AppButton
            title="Search Problem"
            role="customer"
            variant="primary"
            onPress={
              handleSearch
            }
            disabled={
              !canSearch
            }
            leftIconName="search"
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
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={
          closeLoginModal
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          {/* BACKDROP */}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close login dialog"
            style={
              StyleSheet.absoluteFill
            }
            onPress={
              closeLoginModal
            }
          />

          {/* MODAL */}

          <View
            accessibilityViewIsModal
            style={
              styles.modalCard
            }
          >
            <View
              style={
                styles.modalIcon
              }
            >
              <AppIcon
                name="profile"
                role="customer"
                size="lg"
                state="active"
              />
            </View>

            <AppText
              variant="heading3"
              weight="bold"
              style={
                styles.modalTitle
              }
            >
              Login required
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.modalMessage
              }
            >
              Please login to use Fix Yourself and continue with smart troubleshooting.
            </AppText>

            <View
              style={
                styles.modalActions
              }
            >
              <View
                style={
                  styles.modalAction
                }
              >
                <AppButton
                  title="Cancel"
                  role="customer"
                  variant="outline"
                  onPress={
                    closeLoginModal
                  }
                />
              </View>

              <View
                style={
                  styles.modalAction
                }
              >
                <AppButton
                  title="Login"
                  role="customer"
                  variant="primary"
                  onPress={
                    handleLogin
                  }
                />
              </View>
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
    /* ========================================================
       SCREEN
    ======================================================== */

    container: {
      flexGrow: 1,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.xxl,
    },

    /* ========================================================
       INTRO
    ======================================================== */

    intro: {
      alignItems:
        "flex-start",
    },

    iconBox: {
      width: 56,

      height: 56,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    title: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xs,
    },

    description: {
      marginTop:
        FixxamTokens.spacing.md,

      maxWidth: 520,

      lineHeight: 22,
    },

    /* ========================================================
       INPUT
    ======================================================== */

    inputSection: {
      marginTop:
        FixxamTokens.spacing.xl,
    },

    sectionTitle: {
      marginBottom:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       EXAMPLES
    ======================================================== */

    examplesContainer: {
      marginTop:
        FixxamTokens.spacing.lg,
    },

    chips: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        FixxamTokens.spacing.sm,
    },

    chip: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        Colors.surface,
    },

    chipText: {
      color:
        Colors.textSecondary,
    },

    /* ========================================================
       SEARCH
    ======================================================== */

    searchButton: {
      marginTop:
        FixxamTokens.spacing.xl,
    },

    /* ========================================================
       MODAL
    ======================================================== */

    modalOverlay: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      backgroundColor:
        Colors.overlayStrong,
    },

    modalCard: {
      width: "100%",

      maxWidth: 420,

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

    modalIcon: {
      width: 56,

      height: 56,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    modalTitle: {
      marginTop:
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    modalMessage: {
      marginTop:
        FixxamTokens.spacing.sm,

      maxWidth: 340,

      lineHeight: 22,
    },

    modalActions: {
      flexDirection:
        "row",

      gap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.xl,
    },

    modalAction: {
      flex: 1,

      minWidth: 0,
    },

    /* ========================================================
       PRESSED
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