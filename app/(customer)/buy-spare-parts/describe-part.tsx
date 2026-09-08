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
  router,
} from "expo-router";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

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

const MAX_DESCRIPTION_LENGTH =
  4000;

const MIN_DESCRIPTION_LENGTH =
  5;

const WARNING_THRESHOLD =
  3600;

/* ==============================================================
   SCREEN
============================================================== */

export default function DescribePartScreen() {
  const insets =
    useSafeAreaInsets();

  const [
    description,
    setDescription,
  ] =
    useState("");

  const [
    isFocused,
    setIsFocused,
  ] =
    useState(false);

  /* ============================================================
     DESCRIPTION STATE
  ============================================================ */

  const trimmedDescription =
    useMemo(
      () =>
        description.trim(),
      [
        description,
      ],
    );

  const characterCount =
    description.length;

  const canContinue =
    trimmedDescription.length >=
    MIN_DESCRIPTION_LENGTH;

  const isNearLimit =
    characterCount >=
    WARNING_THRESHOLD;

  const isAtLimit =
    characterCount >=
    MAX_DESCRIPTION_LENGTH;

  const counterColor =
    useMemo(() => {
      if (
        isAtLimit
      ) {
        return Colors.error;
      }

      if (
        isNearLimit
      ) {
        return Colors.warning;
      }

      return Colors.textMuted;
    }, [
      isAtLimit,
      isNearLimit,
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
        "/(customer)/buy-spare-parts/spare-products",
      );
    }, []);

  /* ============================================================
     DESCRIPTION
  ============================================================ */

  const handleDescriptionChange =
    useCallback(
      (
        value: string,
      ) => {
        setDescription(
          value.slice(
            0,
            MAX_DESCRIPTION_LENGTH,
          ),
        );
      },
      [],
    );

  /* ============================================================
     PHOTO
  ============================================================ */

  const handleTakePhoto =
    useCallback(() => {
      router.push(
        "/(customer)/buy-spare-parts/take-photo",
      );
    }, []);

  /* ============================================================
     FIND PARTS
  ============================================================ */

  const handleFindParts =
    useCallback(() => {
      if (
        !canContinue
      ) {
        return;
      }

      router.push({
        pathname:
          "/(customer)/buy-spare-parts/find-part",

        params: {
          source:
            "description",

          description:
            trimmedDescription,
        },
      });
    }, [
      canContinue,
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
          Platform.OS ===
          "ios"
            ? "padding"
            : "height"
        }
        keyboardVerticalOffset={
          0
        }
      >
        <View
          style={
            styles.container
          }
        >
          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
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
                  numberOfLines={1}
                >
                  Describe Your Part
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  numberOfLines={1}
                  style={
                    styles.headerSubtitle
                  }
                >
                  Tell Fixxam what you need.
                </AppText>
              </View>
            </View>

            {/* ==================================================
                INTRO
            ================================================== */}

            <AppCard
              role="customer"
              variant="accent"
              style={
                styles.introCard
              }
            >
              <View
                style={
                  styles.introIcon
                }
              >
                <AppIcon
                  name="search"
                  role="customer"
                  size="md"
                  state="active"
                />
              </View>

              <View
                style={
                  styles.introContent
                }
              >
                <AppText
                  variant="bodyLarge"
                  weight="bold"
                >
                  Let Fixxam find it
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.introDescription
                  }
                >
                  You don't need to know
                  the exact part name.
                  Describe what you need
                  and we'll help identify it.
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
                styles.descriptionCard
              }
            >
              <View
                style={
                  styles.descriptionHeader
                }
              >
                <AppText
                  variant="bodyMedium"
                  weight="bold"
                  style={
                    styles.descriptionTitle
                  }
                >
                  What are you looking for?
                </AppText>

                <AppText
                  variant="caption"
                  weight="semibold"
                  style={[
                    styles.characterCount,

                    {
                      color:
                        counterColor,
                    },
                  ]}
                >
                  {characterCount}/
                  {MAX_DESCRIPTION_LENGTH}
                </AppText>
              </View>

              {/* ================================================
                  TEXT AREA
              ================================================ */}

              <View
                style={[
                  styles.textArea,

                  isFocused
                    ? styles.textAreaFocused
                    : null,
                ]}
              >
                <TextInput
                  value={
                    description
                  }
                  onChangeText={
                    handleDescriptionChange
                  }
                  onFocus={() =>
                    setIsFocused(
                      true,
                    )
                  }
                  onBlur={() =>
                    setIsFocused(
                      false,
                    )
                  }
                  multiline
                  maxLength={
                    MAX_DESCRIPTION_LENGTH
                  }
                  textAlignVertical="top"
                  placeholder="Describe the part you need..."
                  placeholderTextColor={
                    Colors.textMuted
                  }
                  selectionColor={
                    CustomerColors.primary
                  }
                  autoCorrect
                  autoCapitalize="sentences"
                  accessibilityLabel="Describe the spare part you need"
                  accessibilityHint="Describe the equipment, problem, brand, model, or spare part you are looking for"
                  style={
                    styles.textInput
                  }
                />
              </View>

              {/* ================================================
                  EXAMPLE
              ================================================ */}

              <View
                style={
                  styles.exampleRow
                }
              >
                <AppIcon
                  name="info"
                  role="customer"
                  size="xs"
                  state="muted"
                />

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.exampleText
                  }
                >
                  Example: I need a door
                  handle for my Samsung
                  fridge.
                </AppText>
              </View>
            </AppCard>

            {/* ==================================================
                PHOTO OPTION
            ================================================== */}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Take a photo of the spare part"
              onPress={
                handleTakePhoto
              }
              style={({
                pressed,
              }) => [
                styles.photoCard,

                pressed
                  ? styles.photoCardPressed
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
                  size="md"
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
                  numberOfLines={2}
                  style={
                    styles.photoDescription
                  }
                >
                  Take a photo and let
                  Fixxam help identify
                  the part.
                </AppText>
              </View>

              <AppIcon
                name="next"
                role="customer"
                size="sm"
                state="muted"
              />
            </Pressable>

            {/* ==================================================
                REASSURANCE
            ================================================== */}

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
                  name="shield"
                  role="customer"
                  size="sm"
                  state="success"
                />
              </View>

              <View
                style={
                  styles.infoContent
                }
              >
                <AppText
                  variant="bodyMedium"
                  weight="bold"
                  style={
                    styles.infoTitle
                  }
                >
                  Nothing will be ordered yet
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.infoText
                  }
                >
                  Fixxam will only find
                  compatible spare parts.
                  You decide what to buy.
                </AppText>
              </View>
            </View>
          </ScrollView>

          {/* ==================================================
              ACTION
          ================================================== */}

          <View
            style={[
              styles.bottomContainer,

              {
                paddingBottom:
                  Math.max(
                    insets.bottom,
                    FixxamTokens
                      .spacing.sm,
                  ),
              },
            ]}
          >
            <AppButton
              title="Find Compatible Parts"
              role="customer"
              disabled={
                !canContinue
              }
              rightIconName="next"
              onPress={
                handleFindParts
              }
              style={
                styles.findButton
              }
            />
          </View>
        </View>
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
    },

    container: {
      flex: 1,

      backgroundColor:
        Colors.background,
    },

    scrollContent: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.lg,
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

    headerContent: {
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
       INTRO
    ======================================================== */

    introCard: {
      minHeight: 92,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,
    },

    introIcon: {
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
        Colors.surface,
    },

    introContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    introDescription: {
      marginTop:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       DESCRIPTION
    ======================================================== */

    descriptionCard: {
      marginTop:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.md,
    },

    descriptionHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        FixxamTokens.spacing.sm,
    },

    descriptionTitle: {
      flex: 1,

      minWidth: 0,
    },

    characterCount: {
      flexShrink: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       TEXT AREA
    ======================================================== */

    textArea: {
      minHeight: 180,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.background,
    },

    textAreaFocused: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        Colors.surface,
    },

    textInput: {
      flex: 1,

      minHeight: 154,

      padding: 0,

      fontSize:
        Typography.fontSize.md,

      color:
        Colors.textPrimary,

      textAlignVertical:
        "top",
    },

    /* ========================================================
       EXAMPLE
    ======================================================== */

    exampleRow: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      marginTop:
        FixxamTokens.spacing.sm,

      gap:
        FixxamTokens.spacing.xs,
    },

    exampleText: {
      flex: 1,

      minWidth: 0,
    },

    /* ========================================================
       PHOTO
    ======================================================== */

    photoCard: {
      minHeight:
        FixxamTokens.size
          .roleCardHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
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

    photoCardPressed: {
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

    photoIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

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

    photoContent: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.md,
    },

    photoDescription: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       INFO
    ======================================================== */

    infoCard: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.md,

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

    infoIcon: {
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
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       BOTTOM ACTION
    ======================================================== */

    bottomContainer: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      borderTopWidth: 1,

      borderTopColor:
        Colors.divider,

      backgroundColor:
        Colors.background,
    },

    findButton: {
      width: "100%",
    },
  });