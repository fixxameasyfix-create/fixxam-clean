import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import {
  router,
} from "expo-router";

import Toast from "react-native-toast-message";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import {
  setCapturedPhoto,
} from "@/utils/capturedPhotoStore";

/* ============================================================
   CONSTANTS
============================================================ */

const MAX_FRAME_WIDTH =
  300;

const MAX_FRAME_HEIGHT =
  390;

const FRAME_ASPECT_RATIO =
  MAX_FRAME_WIDTH /
  MAX_FRAME_HEIGHT;

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

function showInfoToast(
  title: string,
  message: string,
) {
  Toast.show({
    type: "info",
    text1: title,
    text2: message,
  });
}

/* ============================================================
   SCREEN
============================================================ */

export default function BookingCameraScreen() {
  const {
    width:
      screenWidth,
    height:
      screenHeight,
  } =
    useWindowDimensions();

  const cameraRef =
    useRef<CameraView | null>(
      null,
    );

  const captureInFlight =
    useRef(false);

  const [
    permission,
    requestPermission,
  ] =
    useCameraPermissions();

  const [
    cameraReady,
    setCameraReady,
  ] =
    useState(false);

  const [
    capturing,
    setCapturing,
  ] =
    useState(false);

  const [
    requestingPermission,
    setRequestingPermission,
  ] =
    useState(false);

  /* ==========================================================
     RESPONSIVE FRAME
  ========================================================== */

  const {
    frameWidth,
    frameHeight,
    instructionTop,
  } =
    useMemo(() => {
      const availableWidth =
        Math.max(
          220,
          screenWidth -
            FixxamTokens.spacing.xxl *
              2,
        );

      const availableHeight =
        Math.max(
          260,
          screenHeight -
            300,
        );

      const widthFromHeight =
        availableHeight *
        FRAME_ASPECT_RATIO;

      const resolvedWidth =
        Math.min(
          MAX_FRAME_WIDTH,
          availableWidth,
          widthFromHeight,
        );

      const resolvedHeight =
        Math.min(
          MAX_FRAME_HEIGHT,
          resolvedWidth /
            FRAME_ASPECT_RATIO,
        );

      const frameBottom =
        screenHeight / 2 +
        resolvedHeight / 2;

      return {
        frameWidth:
          resolvedWidth,

        frameHeight:
          resolvedHeight,

        instructionTop:
          Math.min(
            screenHeight -
              165,
            frameBottom +
              FixxamTokens.spacing.lg,
          ),
      };
    }, [
      screenHeight,
      screenWidth,
    ]);

  /* ==========================================================
     CLOSE
  ========================================================== */

  const handleClose =
    useCallback(() => {
      if (
        captureInFlight.current
      ) {
        return;
      }

      router.back();
    }, []);

  /* ==========================================================
     CAMERA PERMISSION
  ========================================================== */

  const handleRequestPermission =
    useCallback(async () => {
      if (
        requestingPermission
      ) {
        return;
      }

      try {
        setRequestingPermission(
          true,
        );

        /*
         * Android/iOS will not show the
         * system permission dialog again
         * when canAskAgain is false.
         */
        if (
          permission &&
          !permission.granted &&
          permission.canAskAgain ===
            false
        ) {
          try {
            await Linking.openSettings();
          } catch (
            settingsError
          ) {
            console.error(
              "CAMERA_SETTINGS_ERROR:",
              settingsError,
            );

            showErrorToast(
              "Unable to open settings",
              "Please open your device settings and allow camera access for Fixxam.",
            );
          }

          return;
        }

        const result =
          await requestPermission();

        if (
          !result.granted &&
          result.canAskAgain ===
            false
        ) {
          showInfoToast(
            "Camera permission blocked",
            "Open your device settings to allow camera access for Fixxam.",
          );
        }
      } catch (
        error
      ) {
        console.error(
          "CAMERA_PERMISSION_ERROR:",
          error,
        );

        showErrorToast(
          "Camera permission",
          "Unable to request camera permission. Please try again.",
        );
      } finally {
        setRequestingPermission(
          false,
        );
      }
    }, [
      permission,
      requestPermission,
      requestingPermission,
    ]);

  /* ==========================================================
     TAKE PHOTO
  ========================================================== */

  const handleCapture =
    useCallback(async () => {
      if (
        captureInFlight.current ||
        capturing ||
        !cameraReady ||
        !cameraRef.current
      ) {
        return;
      }

      captureInFlight.current =
        true;

      setCapturing(
        true,
      );

      try {
        const photo =
          await cameraRef.current
            .takePictureAsync({
              quality:
                0.8,

              skipProcessing:
                false,
            });

        if (
          !photo?.uri
        ) {
          throw new Error(
            "CAMERA_IMAGE_URI_MISSING",
          );
        }

        setCapturedPhoto(
          photo.uri,
        );

        router.back();
      } catch (
        error
      ) {
        console.error(
          "TAKE_BOOKING_PHOTO_ERROR:",
          error,
        );

        showErrorToast(
          "Photo error",
          "We could not take the photo. Please try again.",
        );
      } finally {
        captureInFlight.current =
          false;

        setCapturing(
          false,
        );
      }
    }, [
      cameraReady,
      capturing,
    ]);

  /* ==========================================================
     PERMISSION LOADING
  ========================================================== */

  if (!permission) {
    return (
      <View
        style={
          styles.permissionScreen
        }
      >
        <ActivityIndicator
          size="large"
          color={
            Colors.textInverse
          }
        />

        <AppText
          variant="body"
          style={
            styles.permissionLoadingText
          }
        >
          Checking camera access...
        </AppText>
      </View>
    );
  }

  /* ==========================================================
     PERMISSION DENIED
  ========================================================== */

  if (
    !permission.granted
  ) {
    const mustOpenSettings =
      permission.canAskAgain ===
      false;

    return (
      <SafeAreaView
        style={
          styles.permissionScreen
        }
      >
        <View
          style={
            styles.permissionContent
          }
        >
          <View
            style={
              styles.permissionIcon
            }
          >
            <AppIcon
              name="camera"
              role="customer"
              size="lg"
              color={
                Colors.textInverse
              }
            />
          </View>

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
            center
            style={
              styles.permissionText
            }
          >
            Fixxam needs camera access so you can show the worker the problem clearly.
          </AppText>

          <Pressable
            onPress={() => {
              void handleRequestPermission();
            }}
            disabled={
              requestingPermission
            }
            accessibilityRole="button"
            accessibilityLabel={
              mustOpenSettings
                ? "Open camera settings"
                : "Allow camera access"
            }
            accessibilityState={{
              disabled:
                requestingPermission,

              busy:
                requestingPermission,
            }}
            style={({
              pressed,
            }) => [
              styles.permissionButton,

              requestingPermission
                ? styles.disabled
                : null,

              pressed &&
              !requestingPermission
                ? styles.pressed
                : null,
            ]}
          >
            {requestingPermission ? (
              <ActivityIndicator
                size="small"
                color={
                  Colors.textInverse
                }
              />
            ) : (
              <AppIcon
                name={
                  mustOpenSettings
                    ? "settings"
                    : "camera"
                }
                size="sm"
                color={
                  Colors.textInverse
                }
              />
            )}

            <AppText
              variant="body"
              weight="bold"
              style={
                styles.permissionButtonText
              }
            >
              {mustOpenSettings
                ? "Open Settings"
                : "Allow Camera"}
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => {
              router.back();
            }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({
              pressed,
            }) => [
              styles.permissionBack,

              pressed
                ? styles.pressed
                : null,
            ]}
          >
            <AppIcon
              name="back"
              size="xs"
              color={
                Colors.disabled
              }
            />

            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.permissionBackText
              }
            >
              Go Back
            </AppText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  /* ==========================================================
     CAMERA
  ========================================================== */

  return (
    <View
      style={
        styles.container
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
        onCameraReady={() => {
          setCameraReady(
            true,
          );
        }}
      />

      {/* ======================================================
          DARK OVERLAY
      ====================================================== */}

      <View
        pointerEvents="none"
        style={
          styles.overlay
        }
      />

      {/* ======================================================
          TOP
      ====================================================== */}

      <SafeAreaView
        pointerEvents="box-none"
        style={
          styles.topArea
        }
      >
        <View
          style={
            styles.topContent
          }
        >
          <Pressable
            onPress={
              handleClose
            }
            disabled={
              capturing
            }
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Close camera"
            accessibilityState={{
              disabled:
                capturing,
            }}
            style={({
              pressed,
            }) => [
              styles.closeButton,

              capturing
                ? styles.disabled
                : null,

              pressed &&
              !capturing
                ? styles.pressed
                : null,
            ]}
          >
            <AppIcon
              name="close"
              size="md"
              color={
                Colors.textInverse
              }
            />
          </Pressable>

          <View
            style={
              styles.titleContainer
            }
          >
            <AppText
              variant="bodyLarge"
              weight="bold"
              style={
                styles.title
              }
            >
              Show Us The Problem
            </AppText>

            <AppText
              variant="caption"
              style={
                styles.subtitle
              }
            >
              Take a clear photo of the problem area.
            </AppText>
          </View>
        </View>
      </SafeAreaView>

      {/* ======================================================
          CAMERA FRAME
      ====================================================== */}

      <View
        pointerEvents="none"
        style={[
          styles.frameContainer,

          {
            width:
              frameWidth,

            height:
              frameHeight,

            marginLeft:
              -(frameWidth / 2),

            marginTop:
              -(frameHeight / 2),
          },
        ]}
      >
        <View
          style={[
            styles.corner,
            styles.cornerTopLeft,
          ]}
        />

        <View
          style={[
            styles.corner,
            styles.cornerTopRight,
          ]}
        />

        <View
          style={[
            styles.corner,
            styles.cornerBottomLeft,
          ]}
        />

        <View
          style={[
            styles.corner,
            styles.cornerBottomRight,
          ]}
        />
      </View>

      {/* ======================================================
          INSTRUCTION
      ====================================================== */}

      <View
        pointerEvents="none"
        style={[
          styles.instruction,

          {
            top:
              instructionTop,
          },
        ]}
      >
        <AppIcon
          name="camera"
          size="xs"
          color={
            Colors.textInverse
          }
        />

        <AppText
          variant="caption"
          style={
            styles.instructionText
          }
        >
          Keep the problem clearly visible inside the frame
        </AppText>
      </View>

      {/* ======================================================
          BOTTOM CONTROLS
      ====================================================== */}

      <SafeAreaView
        pointerEvents="box-none"
        style={
          styles.bottomArea
        }
      >
        <View
          style={
            styles.bottomContent
          }
        >
          <Pressable
            onPress={
              handleClose
            }
            disabled={
              capturing
            }
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityState={{
              disabled:
                capturing,
            }}
            style={({
              pressed,
            }) => [
              styles.backControl,

              capturing
                ? styles.disabled
                : null,

              pressed &&
              !capturing
                ? styles.pressed
                : null,
            ]}
          >
            <AppIcon
              name="back"
              size="sm"
              color={
                Colors.textInverse
              }
            />

            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.backText
              }
            >
              Back
            </AppText>
          </Pressable>

          {/* ==================================================
              SHUTTER
          ================================================== */}

          <Pressable
            onPress={() => {
              void handleCapture();
            }}
            disabled={
              capturing ||
              !cameraReady
            }
            accessibilityRole="button"
            accessibilityLabel={
              cameraReady
                ? "Take photo"
                : "Camera is getting ready"
            }
            accessibilityState={{
              disabled:
                capturing ||
                !cameraReady,

              busy:
                capturing,
            }}
            style={({
              pressed,
            }) => [
              styles.shutterOuter,

              pressed &&
              !capturing &&
              cameraReady
                ? styles.shutterPressed
                : null,

              !cameraReady ||
              capturing
                ? styles.shutterDisabled
                : null,
            ]}
          >
            {capturing ? (
              <ActivityIndicator
                size="small"
                color={
                  Colors.textPrimary
                }
              />
            ) : (
              <View
                style={
                  styles.shutterInner
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
      </SafeAreaView>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CAMERA
    ======================================================== */

    container: {
      flex: 1,

      backgroundColor:
        "#020617",
    },

    overlay: {
      ...StyleSheet.absoluteFillObject,

      backgroundColor:
        "rgba(2,6,23,0.18)",
    },

    /* ========================================================
       PERMISSION
    ======================================================== */

    permissionScreen: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#020617",
    },

    permissionContent: {
      width: "100%",

      maxWidth: 440,

      paddingHorizontal:
        FixxamTokens.spacing.xxl,

      alignItems:
        "center",
    },

    permissionLoadingText: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.disabled,
    },

    permissionIcon: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      marginBottom:
        FixxamTokens.spacing.lg,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        CustomerColors.primary,
    },

    permissionTitle: {
      color:
        Colors.textInverse,
    },

    permissionText: {
      maxWidth: 330,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 21,

      color:
        Colors.disabled,
    },

    permissionButton: {
      width: "100%",

      minHeight:
        FixxamTokens.size.buttonHeight,

      marginTop:
        FixxamTokens.spacing.xl,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    permissionButtonText: {
      color:
        Colors.textInverse,
    },

    permissionBack: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    permissionBackText: {
      color:
        Colors.disabled,
    },

    /* ========================================================
       TOP
    ======================================================== */

    topArea: {
      zIndex: 10,
    },

    topContent: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    closeButton: {
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
        FixxamTokens.radius.full,

      backgroundColor:
        "rgba(15,23,42,0.48)",
    },

    titleContainer: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    title: {
      color:
        Colors.textInverse,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 17,

      color:
        Colors.disabled,
    },

    /* ========================================================
       FRAME
    ======================================================== */

    frameContainer: {
      position:
        "absolute",

      left: "50%",

      top: "50%",
    },

    corner: {
      position:
        "absolute",

      width: 42,

      height: 42,

      borderColor:
        Colors.textInverse,
    },

    cornerTopLeft: {
      left: 0,

      top: 0,

      borderLeftWidth: 4,

      borderTopWidth: 4,

      borderTopLeftRadius:
        FixxamTokens.radius.xs,
    },

    cornerTopRight: {
      right: 0,

      top: 0,

      borderRightWidth: 4,

      borderTopWidth: 4,

      borderTopRightRadius:
        FixxamTokens.radius.xs,
    },

    cornerBottomLeft: {
      left: 0,

      bottom: 0,

      borderLeftWidth: 4,

      borderBottomWidth: 4,

      borderBottomLeftRadius:
        FixxamTokens.radius.xs,
    },

    cornerBottomRight: {
      right: 0,

      bottom: 0,

      borderRightWidth: 4,

      borderBottomWidth: 4,

      borderBottomRightRadius:
        FixxamTokens.radius.xs,
    },

    /* ========================================================
       INSTRUCTION
    ======================================================== */

    instruction: {
      position:
        "absolute",

      left:
        FixxamTokens.spacing.xxl,

      right:
        FixxamTokens.spacing.xxl,

      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        "rgba(37,99,235,0.84)",
    },

    instructionText: {
      flexShrink: 1,

      lineHeight: 16,

      color:
        Colors.textInverse,
    },

    /* ========================================================
       BOTTOM
    ======================================================== */

    bottomArea: {
      position:
        "absolute",

      left: 0,

      right: 0,

      bottom: 0,
    },

    bottomContent: {
      minHeight: 120,

      paddingHorizontal:
        FixxamTokens.spacing.xxl,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    backControl: {
      width: 80,

      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    backText: {
      color:
        Colors.textInverse,
    },

    bottomSpacer: {
      width: 80,
    },

    /* ========================================================
       SHUTTER
    ======================================================== */

    shutterOuter: {
      width: 76,

      height: 76,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 5,

      borderColor:
        "rgba(255,255,255,0.45)",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.textInverse,
    },

    shutterInner: {
      width: 62,

      height: 62,

      borderWidth: 2,

      borderColor:
        Colors.disabled,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.textInverse,
    },

    /* ========================================================
       STATES
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

    shutterPressed: {
      transform: [
        {
          scale: 0.92,
        },
      ],
    },

    shutterDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    disabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },
  });