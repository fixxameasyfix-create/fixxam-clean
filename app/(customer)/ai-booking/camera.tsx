import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

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
} from "@/theme";

/* ==============================================================
   SCREEN
============================================================== */

export default function AiBookingCameraScreen() {
  const [
    permission,
    requestPermission,
  ] = useCameraPermissions();

  const insets =
    useSafeAreaInsets();

  const cameraRef =
    useRef<CameraView | null>(
      null,
    );

  const permissionRequestedRef =
    useRef(false);

  const [
    takingPhoto,
    setTakingPhoto,
  ] =
    useState(false);

  /* ============================================================
     REQUEST CAMERA PERMISSION
  ============================================================ */

  useEffect(() => {
    if (
      !permission ||
      permission.granted ||
      !permission.canAskAgain ||
      permissionRequestedRef.current
    ) {
      return;
    }

    permissionRequestedRef.current =
      true;

    void requestPermission();
  }, [
    permission,
    requestPermission,
  ]);

  /* ============================================================
     TAKE PHOTO
  ============================================================ */

  const takePhoto =
    useCallback(async () => {
      if (
        takingPhoto ||
        !cameraRef.current
      ) {
        return;
      }

      try {
        setTakingPhoto(
          true,
        );

        const photo =
          await cameraRef.current
            .takePictureAsync({
              quality: 0.8,

              skipProcessing:
                false,
            });

        if (!photo?.uri) {
          throw new Error(
            "Unable to capture the photo.",
          );
        }

        /*
         * Camera only captures.
         *
         * AI processing and booking
         * preparation happen on the
         * search screen.
         */
        router.replace({
          pathname:
            "/(customer)/ai-booking/search",

          params: {
            imageUri:
              photo.uri,

            source:
              "camera",
          },
        });
      } catch (error) {
        console.error(
          "AI_BOOKING_CAMERA_ERROR:",
          error,
        );

        setTakingPhoto(
          false,
        );

        Alert.alert(
          "Photo Error",
          "We couldn't take the photo. Please try again.",
        );
      }
    }, [
      takingPhoto,
    ]);

  /* ============================================================
     REQUEST PERMISSION MANUALLY
  ============================================================ */

  const handleRequestPermission =
    useCallback(async () => {
      try {
        await requestPermission();
      } catch (error) {
        console.error(
          "CAMERA_PERMISSION_ERROR:",
          error,
        );

        Alert.alert(
          "Camera Permission",
          "Unable to request camera access. Please try again.",
        );
      }
    }, [
      requestPermission,
    ]);

  /* ============================================================
     OPEN SETTINGS
  ============================================================ */

  const handleOpenSettings =
    useCallback(async () => {
      try {
        await Linking.openSettings();
      } catch (error) {
        console.error(
          "OPEN_SETTINGS_ERROR:",
          error,
        );

        Alert.alert(
          "Settings",
          "Unable to open device settings.",
        );
      }
    }, []);

  /* ============================================================
     BACK
  ============================================================ */

  const handleBack =
    useCallback(() => {
      if (takingPhoto) {
        return;
      }

      if (
        router.canGoBack()
      ) {
        router.back();

        return;
      }

      router.replace(
        "/(customer)/(tabs)/home",
      );
    }, [
      takingPhoto,
    ]);

  /* ============================================================
     LOADING PERMISSION
  ============================================================ */

  if (!permission) {
    return (
      <AppScreen
        role="customer"
        padded={false}
      >
        <View
          style={
            styles.center
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
            weight="semibold"
            style={
              styles.loadingText
            }
          >
            Preparing camera...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     PERMISSION DENIED
  ============================================================ */

  if (
    !permission.granted
  ) {
    return (
      <AppScreen
        role="customer"
        padded={false}
      >
        <View
          style={
            styles.permissionContainer
          }
        >
          {/* ==================================================
              ICON
          ================================================== */}

          <View
            style={
              styles.permissionIcon
            }
          >
            <AppIcon
              name="camera"
              role="customer"
              size="xl"
              state="active"
            />
          </View>

          {/* ==================================================
              CONTENT
          ================================================== */}

          <AppText
            variant="heading2"
            weight="bold"
            center
            style={
              styles.permissionTitle
            }
          >
            Camera Access Needed
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.permissionText
            }
          >
            Fixxam needs camera access
            so you can show us the
            repair problem you're
            experiencing.
          </AppText>

          {/* ==================================================
              ACTION
          ================================================== */}

          {permission.canAskAgain ? (
            <AppButton
              title="Allow Camera"
              role="customer"
              leftIconName="camera"
              onPress={
                handleRequestPermission
              }
              style={
                styles.permissionAction
              }
            />
          ) : (
            <>
              <View
                style={
                  styles.deniedBox
                }
              >
                <AppIcon
                  name="warning"
                  role="customer"
                  size="sm"
                  state="error"
                />

                <AppText
                  variant="caption"
                  style={
                    styles.deniedText
                  }
                >
                  Camera permission
                  is disabled. Enable
                  camera access from
                  your device settings
                  to continue.
                </AppText>
              </View>

              <AppButton
                title="Open Settings"
                role="customer"
                leftIconName="settings"
                onPress={
                  handleOpenSettings
                }
                style={
                  styles.permissionAction
                }
              />
            </>
          )}

          <AppButton
            title="Go Back"
            role="customer"
            variant="ghost"
            leftIconName="back"
            onPress={
              handleBack
            }
            style={
              styles.backAction
            }
          />
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     CAMERA
  ============================================================ */

  return (
    <View
      style={
        styles.cameraContainer
      }
    >
      <CameraView
        ref={
          cameraRef
        }
        style={
          StyleSheet.absoluteFill
        }
        facing="back"
        mode="picture"
      />

      {/* ======================================================
          TOP BAR
      ====================================================== */}

      <View
        style={[
          styles.topBar,

          {
            paddingTop:
              insets.top +
              FixxamTokens.spacing.sm,
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close camera"
          accessibilityState={{
            disabled:
              takingPhoto,
          }}
          disabled={
            takingPhoto
          }
          hitSlop={8}
          onPress={
            handleBack
          }
          style={({
            pressed,
          }) => [
            styles.closeButton,

            pressed &&
            !takingPhoto
              ? styles.overlayButtonPressed
              : null,

            takingPhoto
              ? styles.disabledControl
              : null,
          ]}
        >
          <AppIcon
            name="close"
            role="customer"
            size="md"
            color={
              Colors.textInverse
            }
            strokeWidth="strong"
          />
        </Pressable>

        <View
          style={
            styles.topTitleContainer
          }
        >
          <AppText
            variant="heading3"
            weight="bold"
            style={
              styles.inverseText
            }
          >
            Show Us The Problem
          </AppText>

          <AppText
            variant="caption"
            style={
              styles.topSubtitle
            }
          >
            Take a clear photo of
            the problem area.
          </AppText>
        </View>
      </View>

      {/* ======================================================
          CAMERA GUIDE
      ====================================================== */}

      <View
        pointerEvents="none"
        style={
          styles.guideContainer
        }
      >
        <View
          style={
            styles.guide
          }
        >
          <View
            style={[
              styles.corner,
              styles.topLeft,
            ]}
          />

          <View
            style={[
              styles.corner,
              styles.topRight,
            ]}
          />

          <View
            style={[
              styles.corner,
              styles.bottomLeft,
            ]}
          />

          <View
            style={[
              styles.corner,
              styles.bottomRight,
            ]}
          />
        </View>

        <View
          style={
            styles.guideLabel
          }
        >
          <AppIcon
            name="camera"
            role="customer"
            size="xs"
            color={
              Colors.textInverse
            }
          />

          <AppText
            variant="caption"
            style={
              styles.guideText
            }
          >
            Keep the problem clearly
            visible inside the frame
          </AppText>
        </View>
      </View>

      {/* ======================================================
          AI HINT
      ====================================================== */}

      <View
        pointerEvents="none"
        style={[
          styles.aiHint,

          {
            bottom:
              insets.bottom +
              118,
          },
        ]}
      >
        <AppIcon
          name="professional"
          role="customer"
          size="xs"
          color={
            Colors.textInverse
          }
        />

        <AppText
          variant="caption"
          weight="semibold"
          style={
            styles.inverseText
          }
        >
          Fixxam AI will analyze
          this photo
        </AppText>
      </View>

      {/* ======================================================
          BOTTOM CONTROLS
      ====================================================== */}

      <View
        style={[
          styles.bottomBar,

          {
            paddingBottom:
              Math.max(
                insets.bottom,
                FixxamTokens.spacing.lg,
              ) +
              FixxamTokens.spacing.sm,
          },
        ]}
      >
        {/* BACK */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityState={{
            disabled:
              takingPhoto,
          }}
          disabled={
            takingPhoto
          }
          hitSlop={8}
          onPress={
            handleBack
          }
          style={({
            pressed,
          }) => [
            styles.backButton,

            pressed &&
            !takingPhoto
              ? styles.overlayButtonPressed
              : null,

            takingPhoto
              ? styles.disabledControl
              : null,
          ]}
        >
          <AppIcon
            name="back"
            role="customer"
            size="sm"
            color={
              Colors.textInverse
            }
          />

          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.inverseText
            }
          >
            Back
          </AppText>
        </Pressable>

        {/* CAPTURE */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            takingPhoto
              ? "Taking photo"
              : "Take photo"
          }
          accessibilityState={{
            disabled:
              takingPhoto,

            busy:
              takingPhoto,
          }}
          disabled={
            takingPhoto
          }
          onPress={() =>
            void takePhoto()
          }
          style={({
            pressed,
          }) => [
            styles.captureButton,

            pressed &&
            !takingPhoto
              ? styles.capturePressed
              : null,

            takingPhoto
              ? styles.captureBusy
              : null,
          ]}
        >
          {takingPhoto ? (
            <ActivityIndicator
              size="small"
              color={
                Colors.textPrimary
              }
            />
          ) : (
            <View
              style={
                styles.captureInner
              }
            />
          )}
        </Pressable>

        <View
          style={
            styles.bottomSpacer
          }
        />
      </View>

      {/* ======================================================
          PROCESSING OVERLAY
      ====================================================== */}

      {takingPhoto ? (
        <View
          style={
            styles.processingOverlay
          }
        >
          <AppCard
            role="customer"
            variant="elevated"
            style={
              styles.processingCard
            }
          >
            <ActivityIndicator
              size="large"
              color={
                CustomerColors.primary
              }
            />

            <AppText
              variant="heading3"
              weight="bold"
              center
              style={
                styles.processingTitle
              }
            >
              Preparing your photo
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              center
              style={
                styles.processingText
              }
            >
              Fixxam will analyze
              the problem and prepare
              your request.
            </AppText>
          </AppCard>
        </View>
      ) : null}
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       LOADING
    ======================================================== */

    center: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xxl,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       PERMISSION
    ======================================================== */

    permissionContainer: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xxl,

      backgroundColor:
        Colors.background,
    },

    permissionIcon: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    permissionTitle: {
      marginTop:
        FixxamTokens.spacing.xl,
    },

    permissionText: {
      maxWidth: 340,

      marginTop:
        FixxamTokens.spacing.sm,
    },

    permissionAction: {
      width: "100%",

      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.xl,
    },

    backAction: {
      width: "100%",

      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.sm,
    },

    deniedBox: {
      width: "100%",

      maxWidth: 340,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.xl,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.error,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.errorSoft,
    },

    deniedText: {
      flex: 1,

      minWidth: 0,

      color:
        Colors.error,
    },

    /* ========================================================
       CAMERA
    ======================================================== */

    cameraContainer: {
      flex: 1,

      backgroundColor:
        Colors.black,
    },

    /* ========================================================
       TOP BAR
    ======================================================== */

    topBar: {
      position:
        "absolute",

      top: 0,

      left: 0,

      right: 0,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      paddingHorizontal:
        FixxamTokens.spacing.lg,
    },

    closeButton: {
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
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.overlayStrong,
    },

    topTitleContainer: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.xxs,
    },

    inverseText: {
      color:
        Colors.textInverse,
    },

    topSubtitle: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textInverse,
    },

    /* ========================================================
       GUIDE
    ======================================================== */

    guideContainer: {
      position:
        "absolute",

      top: "27%",

      left:
        FixxamTokens.spacing.xxl,

      right:
        FixxamTokens.spacing.xxl,

      alignItems:
        "center",
    },

    guide: {
      width: "100%",

      maxWidth: 440,

      aspectRatio: 4 / 3,

      position:
        "relative",
    },

    corner: {
      position:
        "absolute",

      width: 34,

      height: 34,

      borderColor:
        Colors.white,
    },

    topLeft: {
      top: 0,

      left: 0,

      borderTopWidth: 3,

      borderLeftWidth: 3,
    },

    topRight: {
      top: 0,

      right: 0,

      borderTopWidth: 3,

      borderRightWidth: 3,
    },

    bottomLeft: {
      bottom: 0,

      left: 0,

      borderBottomWidth: 3,

      borderLeftWidth: 3,
    },

    bottomRight: {
      bottom: 0,

      right: 0,

      borderBottomWidth: 3,

      borderRightWidth: 3,
    },

    guideLabel: {
      maxWidth: "100%",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      marginTop:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.overlayStrong,
    },

    guideText: {
      flexShrink: 1,

      color:
        Colors.textInverse,

      textAlign:
        "center",
    },

    /* ========================================================
       AI HINT
    ======================================================== */

    aiHint: {
      position:
        "absolute",

      left:
        FixxamTokens.spacing.xxl,

      right:
        FixxamTokens.spacing.xxl,

      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.overlayStrong,
    },

    /* ========================================================
       BOTTOM CONTROLS
    ======================================================== */

    bottomBar: {
      position:
        "absolute",

      left: 0,

      right: 0,

      bottom: 0,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      paddingHorizontal:
        FixxamTokens.spacing.xxl,
    },

    backButton: {
      width: 84,

      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    overlayButtonPressed: {
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

    disabledControl: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    captureButton: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      borderWidth: 4,

      borderColor:
        Colors.white,

      backgroundColor:
        Colors.surface,
    },

    captureInner: {
      width:
        FixxamTokens.size.fab,

      height:
        FixxamTokens.size.fab,

      borderWidth: 2,

      borderColor:
        Colors.textPrimary,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    capturePressed: {
      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },

    captureBusy: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    bottomSpacer: {
      width: 84,
    },

    /* ========================================================
       PROCESSING
    ======================================================== */

    processingOverlay: {
      ...StyleSheet.absoluteFillObject,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xxl,

      backgroundColor:
        Colors.overlayStrong,
    },

    processingCard: {
      width: "100%",

      maxWidth: 340,

      alignItems:
        "center",

      padding:
        FixxamTokens.spacing.xxl,
    },

    processingTitle: {
      marginTop:
        FixxamTokens.spacing.lg,
    },

    processingText: {
      marginTop:
        FixxamTokens.spacing.sm,
    },
  });