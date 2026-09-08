// app/(customer)/buy-spare-parts/take-photo.tsx

import React, {
  memo,
  useCallback,
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
  Image,
} from "expo-image";

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
   TYPES
============================================================== */

type CameraFacing =
  | "front"
  | "back";

type CameraFlash =
  | "off"
  | "on";

type PhotoPreviewProps = {
  uri: string;
};

/* ==============================================================
   SCREEN
============================================================== */

export default function TakePhotoScreen() {
  const insets =
    useSafeAreaInsets();

  const cameraRef =
    useRef<CameraView>(
      null,
    );

  const [
    permission,
    requestPermission,
  ] =
    useCameraPermissions();

  const [
    facing,
    setFacing,
  ] =
    useState<CameraFacing>(
      "back",
    );

  const [
    flash,
    setFlash,
  ] =
    useState<CameraFlash>(
      "off",
    );

  const [
    isCameraReady,
    setIsCameraReady,
  ] =
    useState(false);

  const [
    isCapturing,
    setIsCapturing,
  ] =
    useState(false);

  const [
    permissionLoading,
    setPermissionLoading,
  ] =
    useState(false);

  const [
    photoUri,
    setPhotoUri,
  ] =
    useState<
      string | null
    >(null);

  const captureDisabled =
    !isCameraReady ||
    isCapturing;

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
     PERMISSION
  ============================================================ */

  const handlePermissionAction =
    useCallback(async () => {
      if (
        permissionLoading
      ) {
        return;
      }

      /*
       * Android/iOS may stop allowing
       * the system permission dialog
       * after repeated denials.
       */
      if (
        permission &&
        !permission.canAskAgain
      ) {
        try {
          await Linking.openSettings();
        } catch (
          error
        ) {
          console.error(
            "OPEN_CAMERA_SETTINGS_ERROR:",
            error,
          );

          Alert.alert(
            "Unable to open settings",
            "Please open your device settings and allow camera access for Fixxam.",
          );
        }

        return;
      }

      try {
        setPermissionLoading(
          true,
        );

        await requestPermission();
      } catch (
        error
      ) {
        console.error(
          "CAMERA_PERMISSION_ERROR:",
          error,
        );

        Alert.alert(
          "Camera permission",
          "We couldn't request camera access. Please try again.",
        );
      } finally {
        setPermissionLoading(
          false,
        );
      }
    }, [
      permission,
      permissionLoading,
      requestPermission,
    ]);

  /* ============================================================
     CAMERA READY
  ============================================================ */

  const handleCameraReady =
    useCallback(() => {
      setIsCameraReady(
        true,
      );
    }, []);

  /* ============================================================
     FLIP CAMERA
  ============================================================ */

  const handleFlipCamera =
    useCallback(() => {
      if (
        isCapturing
      ) {
        return;
      }

      setIsCameraReady(
        false,
      );

      setFacing(
        (
          current,
        ) =>
          current === "back"
            ? "front"
            : "back",
      );

      /*
       * Front camera generally should
       * not retain rear-camera flash.
       */
      setFlash(
        "off",
      );
    }, [
      isCapturing,
    ]);

  /* ============================================================
     FLASH
  ============================================================ */

  const handleToggleFlash =
    useCallback(() => {
      if (
        isCapturing
      ) {
        return;
      }

      setFlash(
        (
          current,
        ) =>
          current === "off"
            ? "on"
            : "off",
      );
    }, [
      isCapturing,
    ]);

  /* ============================================================
     TAKE PHOTO
  ============================================================ */

  const handleTakePhoto =
    useCallback(async () => {
      const camera =
        cameraRef.current;

      if (
        !camera ||
        !isCameraReady ||
        isCapturing
      ) {
        return;
      }

      try {
        setIsCapturing(
          true,
        );

        const photo =
          await camera.takePictureAsync({
            quality: 0.85,
            skipProcessing:
              false,
          });

        const uri =
          photo?.uri?.trim();

        if (
          !uri
        ) {
          throw new Error(
            "Camera returned no photo URI.",
          );
        }

        setPhotoUri(
          uri,
        );
      } catch (
        error
      ) {
        console.error(
          "TAKE_SPARE_PART_PHOTO_ERROR:",
          error,
        );

        Alert.alert(
          "Photo unavailable",
          "We couldn't take the photo. Please try again.",
        );
      } finally {
        setIsCapturing(
          false,
        );
      }
    }, [
      isCameraReady,
      isCapturing,
    ]);

  /* ============================================================
     RETAKE
  ============================================================ */

  const handleRetake =
    useCallback(() => {
      if (
        isCapturing
      ) {
        return;
      }

      setPhotoUri(
        null,
      );

      /*
       * CameraView will mount again and
       * onCameraReady will set this true.
       */
      setIsCameraReady(
        false,
      );
    }, [
      isCapturing,
    ]);

  /* ============================================================
     USE PHOTO
  ============================================================ */

  const handleUsePhoto =
    useCallback(() => {
      const uri =
        photoUri?.trim();

      if (
        !uri
      ) {
        return;
      }

      router.push({
        pathname:
          "/(customer)/buy-spare-parts/find-part",

        params: {
          source:
            "photo",

          photoUri:
            uri,
        },
      });
    }, [
      photoUri,
    ]);

  /* ============================================================
     PERMISSION LOADING
  ============================================================ */

  if (
    !permission
  ) {
    return (
      <AppScreen
        role="customer"
        padded={false}
      >
        <View
          style={
            styles.permissionLoading
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
              styles.permissionLoadingText
            }
          >
            Checking camera access...
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
    const requiresSettings =
      !permission.canAskAgain;

    return (
      <AppScreen
        role="customer"
        padded={false}
      >
        <View
          style={
            styles.permissionScreen
          }
        >
          <AppCard
            role="customer"
            variant="outlined"
            style={
              styles.permissionCard
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
                size="xl"
                state="active"
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
              tone="secondary"
              center
              style={
                styles.permissionText
              }
            >
              Fixxam needs camera
              access so you can take
              a clear photo of the
              spare part you need.
            </AppText>

            <AppButton
              title={
                requiresSettings
                  ? "Open Settings"
                  : "Allow Camera Access"
              }
              role="customer"
              leftIconName={
                requiresSettings
                  ? "settings"
                  : "camera"
              }
              loading={
                permissionLoading
              }
              disabled={
                permissionLoading
              }
              onPress={
                handlePermissionAction
              }
              style={
                styles.permissionButton
              }
            />

            <AppButton
              title="Go Back"
              role="customer"
              variant="ghost"
              onPress={
                handleBack
              }
              style={
                styles.permissionBackButton
              }
            />
          </AppCard>
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
        styles.screen
      }
    >
      {/* ======================================================
          CAMERA / PREVIEW
      ====================================================== */}

      <View
        style={
          styles.cameraContainer
        }
      >
        {photoUri ? (
          <PhotoPreview
            uri={
              photoUri
            }
            topInset={
              insets.top
            }
          />
        ) : (
          <CameraView
            ref={
              cameraRef
            }
            style={
              styles.camera
            }
            facing={
              facing
            }
            flash={
              flash
            }
            mode="picture"
            onCameraReady={
              handleCameraReady
            }
          >
            {/* ==================================================
                TOP CONTROLS
            ================================================== */}

            <View
              style={[
                styles.topControls,

                {
                  top:
                    Math.max(
                      insets.top,
                      FixxamTokens
                        .spacing.md,
                    ),
                },
              ]}
            >
              <CameraControlButton
                accessibilityLabel="Close camera"
                onPress={
                  handleBack
                }
              >
                <AppIcon
                  name="close"
                  role="customer"
                  size="md"
                  color={
                    Colors.textInverse
                  }
                />
              </CameraControlButton>

              <View
                style={
                  styles.topRightControls
                }
              >
                {/* ==============================================
                    FLASH

                    AppIcon currently has no dedicated flash
                    registry entry, so use a clear text control
                    rather than adding another direct icon lib.
                ============================================== */}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    flash === "on"
                      ? "Turn flash off"
                      : "Turn flash on"
                  }
                  accessibilityState={{
                    selected:
                      flash ===
                      "on",
                  }}
                  disabled={
                    isCapturing
                  }
                  onPress={
                    handleToggleFlash
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.flashButton,

                    flash ===
                    "on"
                      ? styles.flashButtonActive
                      : null,

                    pressed &&
                    !isCapturing
                      ? styles.cameraControlPressed
                      : null,

                    isCapturing
                      ? styles.controlDisabled
                      : null,
                  ]}
                >
                  <AppText
                    variant="caption"
                    weight="bold"
                    style={
                      styles.cameraControlText
                    }
                  >
                    {flash ===
                    "on"
                      ? "FLASH ON"
                      : "FLASH"}
                  </AppText>
                </Pressable>

                <CameraControlButton
                  accessibilityLabel="Flip camera"
                  disabled={
                    isCapturing
                  }
                  onPress={
                    handleFlipCamera
                  }
                  style={
                    styles.topButtonSpacing
                  }
                >
                  <AppIcon
                    name="refresh"
                    role="customer"
                    size="sm"
                    color={
                      Colors.textInverse
                    }
                  />
                </CameraControlButton>
              </View>
            </View>

            {/* ==================================================
                GUIDE
            ================================================== */}

            <View
              pointerEvents="none"
              style={
                styles.guideContainer
              }
            >
              <View
                style={
                  styles.guideFrame
                }
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

              <View
                style={
                  styles.guideTextContainer
                }
              >
                <AppText
                  variant="bodyMedium"
                  weight="bold"
                  center
                  style={
                    styles.guideTitle
                  }
                >
                  Show us the spare part
                </AppText>

                <AppText
                  variant="caption"
                  center
                  style={
                    styles.guideText
                  }
                >
                  Keep the part clear
                  and inside the frame.
                </AppText>
              </View>
            </View>

            {/* ==================================================
                CAPTURE
            ================================================== */}

            <View
              style={[
                styles.bottomControls,

                {
                  bottom:
                    Math.max(
                      insets.bottom,
                      FixxamTokens
                        .spacing.lg,
                    ) +
                    FixxamTokens
                      .spacing.sm,
                },
              ]}
            >
              <View
                style={
                  styles.bottomSide
                }
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Take photo"
                accessibilityState={{
                  disabled:
                    captureDisabled,

                  busy:
                    isCapturing,
                }}
                disabled={
                  captureDisabled
                }
                onPress={
                  handleTakePhoto
                }
                style={({
                  pressed,
                }) => [
                  styles.captureOuter,

                  captureDisabled
                    ? styles.captureDisabled
                    : null,

                  pressed &&
                  !captureDisabled
                    ? styles.capturePressed
                    : null,
                ]}
              >
                <View
                  style={
                    styles.captureInner
                  }
                >
                  {isCapturing ? (
                    <ActivityIndicator
                      size="small"
                      color={
                        CustomerColors.primary
                      }
                    />
                  ) : (
                    <View
                      style={
                        styles.captureDot
                      }
                    />
                  )}
                </View>
              </Pressable>

              <View
                style={
                  styles.bottomSide
                }
              >
                <View
                  style={
                    styles.cameraHint
                  }
                >
                  <AppIcon
                    name="camera"
                    role="customer"
                    size="sm"
                    color={
                      Colors.textInverse
                    }
                  />
                </View>
              </View>
            </View>
          </CameraView>
        )}
      </View>

      {/* ======================================================
          PREVIEW ACTIONS
      ====================================================== */}

      {photoUri ? (
        <View
          style={[
            styles.previewActions,

            {
              paddingBottom:
                Math.max(
                  insets.bottom,
                  FixxamTokens
                    .spacing.md,
                ),
            },
          ]}
        >
          <View
            style={
              styles.previewInfo
            }
          >
            <View
              style={
                styles.previewCheck
              }
            >
              <AppIcon
                name="check"
                role="customer"
                size="sm"
                state="success"
              />
            </View>

            <View
              style={
                styles.previewInfoContent
              }
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
              >
                Photo ready
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.previewText
                }
              >
                Use this photo to help
                Fixxam find your part.
              </AppText>
            </View>
          </View>

          <View
            style={
              styles.actionRow
            }
          >
            <AppButton
              title="Retake"
              role="customer"
              variant="outline"
              leftIconName="refresh"
              onPress={
                handleRetake
              }
              style={
                styles.retakeButton
              }
            />

            <AppButton
              title="Use Photo"
              role="customer"
              onPress={
                handleUsePhoto
              }
              style={
                styles.usePhotoButton
              }
            />
          </View>
        </View>
      ) : (
        <View
          style={[
            styles.cameraFooter,

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
              styles.cameraFooterText
            }
          >
            You can retake the photo
            if the part isn't clear.
          </AppText>
        </View>
      )}
    </View>
  );
}

/* ==============================================================
   CAMERA CONTROL
============================================================== */

type CameraControlButtonProps = {
  accessibilityLabel: string;

  onPress: () => void;

  disabled?: boolean;

  style?: object;

  children:
    React.ReactNode;
};

const CameraControlButton =
  memo(function CameraControlButton({
    accessibilityLabel,
    onPress,
    disabled = false,
    style,
    children,
  }: CameraControlButtonProps) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          accessibilityLabel
        }
        accessibilityState={{
          disabled,
        }}
        disabled={
          disabled
        }
        hitSlop={8}
        onPress={
          onPress
        }
        style={({
          pressed,
        }) => [
          styles.topButton,

          style,

          pressed &&
          !disabled
            ? styles.cameraControlPressed
            : null,

          disabled
            ? styles.controlDisabled
            : null,
        ]}
      >
        {children}
      </Pressable>
    );
  });

/* ==============================================================
   PHOTO PREVIEW
============================================================== */

const PhotoPreview =
  memo(function PhotoPreview({
    uri,
    topInset,
  }: PhotoPreviewProps & {
    topInset: number;
  }) {
    return (
      <View
        style={
          styles.previewImageWrapper
        }
      >
        <Image
          source={{
            uri,
          }}
          style={
            styles.previewImage
          }
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={150}
        />

        <View
          pointerEvents="none"
          style={
            styles.previewOverlay
          }
        >
          <View
            style={[
              styles.previewTopBar,

              {
                paddingTop:
                  Math.max(
                    topInset,
                    FixxamTokens
                      .spacing.md,
                  ),
              },
            ]}
          >
            <View
              style={
                styles.previewBadge
              }
            >
              <AppIcon
                name="image"
                role="customer"
                size="xs"
                color={
                  Colors.textInverse
                }
              />

              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.previewBadgeText
                }
              >
                Preview
              </AppText>
            </View>
          </View>
        </View>
      </View>
    );
  });

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       SCREEN
    ======================================================== */

    screen: {
      flex: 1,

      backgroundColor:
        Colors.textPrimary,
    },

    cameraContainer: {
      flex: 1,

      overflow:
        "hidden",

      backgroundColor:
        Colors.textPrimary,
    },

    camera: {
      flex: 1,
    },

    /* ========================================================
       TOP CONTROLS
    ======================================================== */

    topControls: {
      position:
        "absolute",

      left:
        FixxamTokens.spacing.lg,

      right:
        FixxamTokens.spacing.lg,

      zIndex: 10,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    topRightControls: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    topButton: {
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
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.overlayStrong,
    },

    topButtonSpacing: {
      marginLeft:
        FixxamTokens.spacing.sm,
    },

    flashButton: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        Colors.overlayStrong,
    },

    flashButtonActive: {
      backgroundColor:
        CustomerColors.primary,
    },

    cameraControlPressed: {
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

    cameraControlText: {
      color:
        Colors.textInverse,
    },

    controlDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    /* ========================================================
       CAMERA GUIDE
    ======================================================== */

    guideContainer: {
      ...StyleSheet.absoluteFillObject,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    guideFrame: {
      width: "78%",

      aspectRatio: 1,

      position:
        "relative",
    },

    corner: {
      position:
        "absolute",

      width: 34,

      height: 34,

      borderColor:
        Colors.textInverse,
    },

    cornerTopLeft: {
      top: 0,

      left: 0,

      borderTopWidth: 3,

      borderLeftWidth: 3,

      borderTopLeftRadius:
        FixxamTokens.radius.sm,
    },

    cornerTopRight: {
      top: 0,

      right: 0,

      borderTopWidth: 3,

      borderRightWidth: 3,

      borderTopRightRadius:
        FixxamTokens.radius.sm,
    },

    cornerBottomLeft: {
      bottom: 0,

      left: 0,

      borderBottomWidth: 3,

      borderLeftWidth: 3,

      borderBottomLeftRadius:
        FixxamTokens.radius.sm,
    },

    cornerBottomRight: {
      right: 0,

      bottom: 0,

      borderBottomWidth: 3,

      borderRightWidth: 3,

      borderBottomRightRadius:
        FixxamTokens.radius.sm,
    },

    guideTextContainer: {
      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.xl,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.overlayStrong,
    },

    guideTitle: {
      color:
        Colors.textInverse,
    },

    guideText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textInverse,

      opacity: 0.82,
    },

    /* ========================================================
       CAPTURE
    ======================================================== */

    bottomControls: {
      position:
        "absolute",

      right: 0,

      left: 0,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      paddingHorizontal:
        FixxamTokens.spacing.xl,
    },

    bottomSide: {
      width:
        FixxamTokens.size.fab,

      alignItems:
        "center",
    },

    captureOuter: {
      width: 78,

      height: 78,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 5,

      borderColor:
        Colors.textInverse,

      borderRadius:
        FixxamTokens.radius.full,
    },

    captureInner: {
      width: 62,

      height: 62,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.textInverse,
    },

    captureDot: {
      width: 54,

      height: 54,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primary,
    },

    captureDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
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

    cameraHint: {
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
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.overlayStrong,
    },

    /* ========================================================
       CAMERA FOOTER
    ======================================================== */

    cameraFooter: {
      minHeight: 58,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      backgroundColor:
        Colors.surface,
    },

    cameraFooterText: {
      flexShrink: 1,

      marginLeft:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       PREVIEW
    ======================================================== */

    previewImageWrapper: {
      flex: 1,

      position:
        "relative",

      backgroundColor:
        Colors.textPrimary,
    },

    previewImage: {
      width: "100%",

      height: "100%",
    },

    previewOverlay: {
      ...StyleSheet.absoluteFillObject,
    },

    previewTopBar: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,
    },

    previewBadge: {
      alignSelf:
        "flex-start",

      minHeight: 38,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        Colors.overlayStrong,
    },

    previewBadgeText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       PREVIEW ACTIONS
    ======================================================== */

    previewActions: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.surface,
    },

    previewInfo: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    previewCheck: {
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
        FixxamTokens.radius
          .iconButton,

      backgroundColor:
        Colors.successSoft,
    },

    previewInfoContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    previewText: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    actionRow: {
      flexDirection:
        "row",

      gap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.md,
    },

    retakeButton: {
      flex: 1,
    },

    usePhotoButton: {
      flex: 1.35,
    },

    /* ========================================================
       PERMISSION
    ======================================================== */

    permissionLoading: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.background,
    },

    permissionLoadingText: {
      marginTop:
        FixxamTokens.spacing.md,
    },

    permissionScreen: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      backgroundColor:
        Colors.background,
    },

    permissionCard: {
      width: "100%",

      maxWidth: 440,

      alignItems:
        "center",

      padding:
        FixxamTokens.spacing.xl,
    },

    permissionIcon: {
      width:
        FixxamTokens.size
          .avatarXl,

      height:
        FixxamTokens.size
          .avatarXl,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    permissionTitle: {
      marginTop:
        FixxamTokens.spacing.lg,
    },

    permissionText: {
      maxWidth: 340,

      marginTop:
        FixxamTokens.spacing.sm,
    },

    permissionButton: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xl,
    },

    permissionBackButton: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xs,
    },
  });