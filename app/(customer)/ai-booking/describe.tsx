import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  Image,
} from "expo-image";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

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
  Typography,
} from "@/theme";

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_LENGTH = 4000;
const MIN_DESCRIPTION_LENGTH = 5;

/* ==============================================================
   SCREEN
============================================================== */

export default function AiBookingDescribeScreen() {
  const {
    imageUri:
      returnedImageUri,
  } =
    useLocalSearchParams<{
      imageUri?:
        | string
        | string[];
    }>();

  const [
    description,
    setDescription,
  ] =
    useState("");

  const [
    inputFocused,
    setInputFocused,
  ] =
    useState(false);

  /* ============================================================
     IMAGE
  ============================================================ */

  const imageUri =
    Array.isArray(
      returnedImageUri,
    )
      ? returnedImageUri[0] ??
        ""
      : typeof returnedImageUri ===
          "string"
        ? returnedImageUri
        : "";

  /* ============================================================
     VALIDATION
  ============================================================ */

  const trimmedDescription =
    description.trim();

  const hasDescription =
    trimmedDescription.length >=
    MIN_DESCRIPTION_LENGTH;

  const hasPhoto =
    imageUri.length > 0;

  const canContinue =
    hasDescription ||
    hasPhoto;

  const characterCount =
    description.length;

  /* ============================================================
     HELPER TEXT
  ============================================================ */

  const helperText =
    useMemo(() => {
      if (
        hasPhoto &&
        !hasDescription
      ) {
        return "Photo added. Fixxam will use it to understand the problem.";
      }

      if (
        description.length ===
        0
      ) {
        return "Example: My AC is on but it is not cooling the room.";
      }

      if (
        trimmedDescription.length <
        MIN_DESCRIPTION_LENGTH
      ) {
        return "Please describe the problem in a little more detail.";
      }

      return "Fixxam will understand your problem and find the right service.";
    }, [
      description.length,
      hasDescription,
      hasPhoto,
      trimmedDescription.length,
    ]);

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
     CAMERA
  ============================================================ */

  const handleTakePhoto =
    useCallback(() => {
      router.push({
        pathname:
          "/(customer)/ai-booking/camera",
      });
    }, []);

  /* ============================================================
     DESCRIPTION
  ============================================================ */

  const handleDescriptionChange =
    useCallback(
      (value: string) => {
        setDescription(
          value.slice(
            0,
            MAX_LENGTH,
          ),
        );
      },
      [],
    );

  /* ============================================================
     CONTINUE
  ============================================================ */

  const handleContinue =
    useCallback(() => {
      if (!canContinue) {
        return;
      }

      router.replace({
        pathname:
          "/(customer)/ai-booking/search",

        params: {
          description:
            hasDescription
              ? trimmedDescription
              : "",

          imageUri:
            imageUri || "",
        },
      });
    }, [
      canContinue,
      hasDescription,
      imageUri,
      trimmedDescription,
    ]);

  /* ============================================================
     UI
  ============================================================ */

  return (
    <AppScreen
      role="customer"
      padded={false}
    >
      <KeyboardAvoidingView
        style={
          styles.keyboard
        }
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
        keyboardVerticalOffset={
          0
        }
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.scrollContent
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
                styles.headerContent
              }
            >
              <AppText
                variant="heading1"
                weight="bold"
              >
                Describe Your Problem
              </AppText>

              <AppText
                variant="body"
                tone="secondary"
                style={
                  styles.subtitle
                }
              >
                Tell Fixxam what is wrong.
                We'll find the right service
                and nearby worker.
              </AppText>
            </View>
          </View>

          {/* ==================================================
              AI INFORMATION
          ================================================== */}

          <AppCard
            role="customer"
            variant="accent"
            style={
              styles.aiCard
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
                styles.aiCardContent
              }
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
              >
                Let Fixxam understand it
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.aiText
                }
              >
                You don't need to know
                the service name. Just
                explain the problem
                naturally.
              </AppText>
            </View>
          </AppCard>

          {/* ==================================================
              DESCRIPTION
          ================================================== */}

          <AppCard
            role="customer"
            variant="outlined"
            style={
              styles.inputCard
            }
          >
            <View
              style={
                styles.inputHeader
              }
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
              >
                What's the problem?
              </AppText>

              <AppText
                variant="caption"
                tone="muted"
              >
                {characterCount}/
                {MAX_LENGTH}
              </AppText>
            </View>

            <TextInput
              value={
                description
              }
              onChangeText={
                handleDescriptionChange
              }
              onFocus={() =>
                setInputFocused(
                  true,
                )
              }
              onBlur={() =>
                setInputFocused(
                  false,
                )
              }
              placeholder="Describe what happened..."
              placeholderTextColor={
                Colors.textMuted
              }
              selectionColor={
                CustomerColors.primary
              }
              multiline
              textAlignVertical="top"
              autoFocus={
                !hasPhoto
              }
              maxLength={
                MAX_LENGTH
              }
              accessibilityLabel="Describe your repair problem"
              accessibilityHint="Explain what is wrong so Fixxam can identify the correct service"
              style={[
                styles.textInput,

                inputFocused
                  ? styles.textInputFocused
                  : null,
              ]}
            />

            <View
              style={
                styles.helperRow
              }
            >
              <AppIcon
                name={
                  canContinue
                    ? "success"
                    : "info"
                }
                role="customer"
                size="xs"
                state={
                  canContinue
                    ? "success"
                    : "muted"
                }
              />

              <AppText
                variant="caption"
                tone={
                  canContinue
                    ? "success"
                    : "secondary"
                }
                style={
                  styles.helperText
                }
              >
                {helperText}
              </AppText>
            </View>
          </AppCard>

          {/* ==================================================
              PHOTO
          ================================================== */}

          {hasPhoto ? (
            <AppCard
              role="customer"
              variant="outlined"
              style={
                styles.photoPreviewCard
              }
            >
              <View
                style={
                  styles.photoHeader
                }
              >
                <View
                  style={
                    styles.photoHeaderLeft
                  }
                >
                  <AppIcon
                    name="success"
                    role="customer"
                    size="sm"
                    state="success"
                  />

                  <View
                    style={
                      styles.photoHeaderText
                    }
                  >
                    <AppText
                      variant="bodyMedium"
                      weight="bold"
                    >
                      Photo added
                    </AppText>

                    <AppText
                      variant="caption"
                      tone="secondary"
                      style={
                        styles.photoSubtitle
                      }
                    >
                      Fixxam will inspect
                      this photo.
                    </AppText>
                  </View>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Retake photo"
                  hitSlop={8}
                  onPress={
                    handleTakePhoto
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.retakeButton,

                    pressed
                      ? styles.retakePressed
                      : null,
                  ]}
                >
                  <AppText
                    variant="caption"
                    weight="bold"
                    style={
                      styles.retakeText
                    }
                  >
                    Retake
                  </AppText>
                </Pressable>
              </View>

              <Image
                source={{
                  uri:
                    imageUri,
                }}
                style={
                  styles.photoPreview
                }
                contentFit="cover"
                transition={
                  FixxamTokens.motion
                    .fast
                }
                cachePolicy="memory-disk"
                accessibilityLabel="Selected repair problem photo"
              />
            </AppCard>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Take a repair photo"
              accessibilityHint="Opens the camera"
              onPress={
                handleTakePhoto
              }
              style={({
                pressed,
              }) => [
                styles.photoButton,

                pressed
                  ? styles.photoButtonPressed
                  : null,
              ]}
            >
              <View
                style={
                  styles.photoIcon
                }
              >
                <AppIcon
                  name="camera"
                  role="customer"
                  size="sm"
                  state="active"
                />
              </View>

              <View
                style={
                  styles.photoContent
                }
              >
                <AppText
                  variant="bodyMedium"
                  weight="bold"
                >
                  Prefer a photo?
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.photoText
                  }
                >
                  Tap to open your
                  camera directly.
                </AppText>
              </View>

              <AppIcon
                name="next"
                role="customer"
                size="sm"
                state="muted"
              />
            </Pressable>
          )}

          {/* ==================================================
              FOOTER
          ================================================== */}

          <View
            style={
              styles.footer
            }
          >
            <AppButton
              title="Find My Worker"
              role="customer"
              disabled={
                !canContinue
              }
              rightIconName="next"
              onPress={
                handleContinue
              }
              style={
                styles.continueButton
              }
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    keyboard: {
      flex: 1,

      minHeight: 0,

      backgroundColor:
        Colors.background,
    },

    scrollContent: {
      flexGrow: 1,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.lg,
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

    headerContent: {
      flex: 1,

      minWidth: 0,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       AI CARD
    ======================================================== */

    aiCard: {
      flexDirection: "row",

      alignItems: "center",

      marginTop:
        FixxamTokens.spacing.xxl,

      padding:
        FixxamTokens.spacing.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    aiIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    aiCardContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    aiText: {
      marginTop:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       INPUT
    ======================================================== */

    inputCard: {
      marginTop:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.lg,
    },

    inputHeader: {
      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,
    },

    textInput: {
      minHeight: 160,

      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.background,

      fontSize:
        Typography.fontSize.md,

      color:
        Colors.textPrimary,
    },

    textInputFocused: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        Colors.surface,
    },

    helperRow: {
      flexDirection: "row",

      alignItems:
        "flex-start",

      gap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.sm,
    },

    helperText: {
      flex: 1,

      minWidth: 0,
    },

    /* ========================================================
       PHOTO BUTTON
    ======================================================== */

    photoButton: {
      minHeight:
        FixxamTokens.size
          .cardMinHeight,

      flexDirection: "row",

      alignItems: "center",

      marginTop:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    photoButtonPressed: {
      borderColor:
        CustomerColors.primaryLight,

      backgroundColor:
        CustomerColors.primarySoft,

      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    photoIcon: {
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

      borderRadius:
        FixxamTokens.radius
          .iconButton,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    photoContent: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.md,
    },

    photoText: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       PHOTO PREVIEW
    ======================================================== */

    photoPreviewCard: {
      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,
    },

    photoHeader: {
      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.sm,
    },

    photoHeaderLeft: {
      flex: 1,

      minWidth: 0,

      flexDirection: "row",

      alignItems: "center",
    },

    photoHeaderText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    photoSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    retakeButton: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,
    },

    retakePressed: {
      backgroundColor:
        CustomerColors.primarySoft,
    },

    retakeText: {
      color:
        CustomerColors.primary,
    },

    photoPreview: {
      width: "100%",

      height: 180,

      borderRadius:
        FixxamTokens.radius.image,

      backgroundColor:
        Colors.disabledBackground,
    },

    /* ========================================================
       FOOTER
    ======================================================== */

    footer: {
      marginTop: "auto",

      paddingTop:
        FixxamTokens.spacing.xxl,
    },

    continueButton: {
      width: "100%",
    },
  });