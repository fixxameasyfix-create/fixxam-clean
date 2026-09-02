// app/(customer)/buy-spare-parts/take-photo.tsx

import React, {
  useCallback,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";

import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import { router } from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";
import { CustomerColors } from "@/theme/customerColors";

type CameraFacing = "front" | "back";

type PhotoPreviewProps = {
  uri: string;
};

export default function TakePhotoScreen() {
  const cameraRef = useRef<CameraView>(null);

  const [
    permission,
    requestPermission,
  ] = useCameraPermissions();

  const [facing, setFacing] =
    useState<CameraFacing>("back");

  const [flash, setFlash] =
    useState<"off" | "on">("off");

  const [isCameraReady, setIsCameraReady] =
    useState(false);

  const [isCapturing, setIsCapturing] =
    useState(false);

  const [photoUri, setPhotoUri] =
    useState<string | null>(null);

  /*
   * ============================================================
   * PERMISSION
   * ============================================================
   */

  const handleRequestPermission =
    useCallback(async () => {
      try {
        await requestPermission();
      } catch (error) {
        console.error(
          "Camera permission error:",
          error,
        );
      }
    }, [requestPermission]);

  /*
   * ============================================================
   * CAMERA READY
   * ============================================================
   */

  const handleCameraReady =
    useCallback(() => {
      setIsCameraReady(true);
    }, []);

  /*
   * ============================================================
   * FLIP CAMERA
   * ============================================================
   */

  const handleFlipCamera =
    useCallback(() => {
      setIsCameraReady(false);

      setFacing((current) =>
        current === "back"
          ? "front"
          : "back",
      );
    }, []);

  /*
   * ============================================================
   * FLASH
   * ============================================================
   */

  const handleToggleFlash =
    useCallback(() => {
      setFlash((current) =>
        current === "off"
          ? "on"
          : "off",
      );
    }, []);

  /*
   * ============================================================
   * TAKE PHOTO
   * ============================================================
   */

  const handleTakePhoto =
    useCallback(async () => {
      const camera = cameraRef.current;

      if (
        !camera ||
        !isCameraReady ||
        isCapturing
      ) {
        return;
      }

      try {
        setIsCapturing(true);

        const photo =
          await camera.takePictureAsync({
            quality: 0.85,
            skipProcessing: false,
          });

        if (photo?.uri) {
          setPhotoUri(photo.uri);
        }
      } catch (error) {
        console.error(
          "Take photo error:",
          error,
        );
      } finally {
        setIsCapturing(false);
      }
    }, [
      isCameraReady,
      isCapturing,
    ]);

  /*
   * ============================================================
   * RETAKE
   * ============================================================
   */

  const handleRetake =
    useCallback(() => {
      setPhotoUri(null);
      setIsCameraReady(false);
    }, []);

  /*
   * ============================================================
   * USE PHOTO
   * ============================================================
   */

  const handleUsePhoto =
    useCallback(() => {
      if (!photoUri) {
        return;
      }

      router.push({
        pathname:
          "/(customer)/buy-spare-parts/find-part",
        params: {
          source: "camera",
          photoUri,
        },
      });
    }, [photoUri]);

  /*
   * ============================================================
   * BACK
   * ============================================================
   */

  const handleBack =
    useCallback(() => {
      router.back();
    }, []);

  /*
   * ============================================================
   * PERMISSION LOADING
   * ============================================================
   */

  if (!permission) {
    return (
      <SafeAreaView
        style={styles.permissionScreen}
      >
        <ActivityIndicator
          size="large"
          color={CustomerColors.primary}
        />
      </SafeAreaView>
    );
  }

  /*
   * ============================================================
   * PERMISSION DENIED
   * ============================================================
   */

  if (!permission.granted) {
    return (
      <SafeAreaView
        style={styles.permissionScreen}
      >
        <View
          style={styles.permissionCard}
        >
          <View
            style={styles.permissionIcon}
          >
            <Ionicons
              name="camera-outline"
              size={34}
              color={
                CustomerColors.primary
              }
            />
          </View>

          <AppText
            weight="bold"
            style={styles.permissionTitle}
          >
            Camera Access Needed
          </AppText>

          <AppText
            center
            style={styles.permissionText}
          >
            Fixxam needs access to your
            camera so you can take a photo
            of the spare part you need.
          </AppText>

          <Pressable
            onPress={
              handleRequestPermission
            }
            accessibilityRole="button"
            accessibilityLabel="Allow camera access"
            style={({ pressed }) => [
              styles.permissionButton,
              pressed &&
                styles.buttonPressed,
            ]}
          >
            <Ionicons
              name="camera"
              size={19}
              color={
                CustomerColors.background
              }
            />

            <AppText
              weight="bold"
              style={
                styles.permissionButtonText
              }
            >
              Allow Camera Access
            </AppText>
          </Pressable>

          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={
              styles.cancelButton
            }
          >
            <AppText
              weight="bold"
              style={
                styles.cancelButtonText
              }
            >
              Go Back
            </AppText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * ============================================================
   * MAIN CAMERA
   * ============================================================
   */

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <View
        style={styles.container}
      >
        <View
          style={styles.cameraContainer}
        >
          {photoUri ? (
            <View
              style={
                styles.previewContainer
              }
            >
              <PhotoPreview
                uri={photoUri}
              />
            </View>
          ) : (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
              flash={flash}
              mode="picture"
              onCameraReady={
                handleCameraReady
              }
            >
              {/* TOP CONTROLS */}

              <View
                style={
                  styles.topControls
                }
              >
                <Pressable
                  onPress={handleBack}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Close camera"
                  style={({
                    pressed,
                  }) => [
                    styles.topButton,
                    pressed &&
                      styles.buttonPressed,
                  ]}
                >
                  <Ionicons
                    name="close"
                    size={25}
                    color="#FFFFFF"
                  />
                </Pressable>

                <View
                  style={
                    styles.topRightControls
                  }
                >
                  <Pressable
                    onPress={
                      handleToggleFlash
                    }
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel={
                      flash === "on"
                        ? "Turn flash off"
                        : "Turn flash on"
                    }
                    style={({
                      pressed,
                    }) => [
                      styles.topButton,
                      pressed &&
                        styles.buttonPressed,
                    ]}
                  >
                    <Ionicons
                      name={
                        flash === "on"
                          ? "flash"
                          : "flash-off-outline"
                      }
                      size={22}
                      color="#FFFFFF"
                    />
                  </Pressable>

                  <Pressable
                    onPress={
                      handleFlipCamera
                    }
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel="Flip camera"
                    style={({
                      pressed,
                    }) => [
                      styles.topButton,
                      styles.topButtonSpacing,
                      pressed &&
                        styles.buttonPressed,
                    ]}
                  >
                    <Ionicons
                      name="camera-reverse-outline"
                      size={24}
                      color="#FFFFFF"
                    />
                  </Pressable>
                </View>
              </View>

              {/* CAMERA GUIDE */}

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
                    weight="bold"
                    style={
                      styles.guideTitle
                    }
                  >
                    Show us the spare part
                  </AppText>

                  <AppText
                    style={
                      styles.guideText
                    }
                  >
                    Keep the part clear and
                    inside the frame.
                  </AppText>
                </View>
              </View>

              {/* BOTTOM CONTROLS */}

              <View
                style={
                  styles.bottomControls
                }
              >
                <View
                  style={styles.bottomSide}
                />

                <Pressable
                  onPress={
                    handleTakePhoto
                  }
                  disabled={
                    !isCameraReady ||
                    isCapturing
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Take photo"
                  style={({
                    pressed,
                  }) => [
                    styles.captureOuter,

                    !isCameraReady &&
                      styles.captureDisabled,

                    pressed &&
                      isCameraReady &&
                      styles.capturePressed,
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
                  style={styles.bottomSide}
                >
                  <View
                    style={
                      styles.cameraHint
                    }
                  >
                    <Ionicons
                      name="scan-outline"
                      size={19}
                      color="#FFFFFF"
                    />
                  </View>
                </View>
              </View>
            </CameraView>
          )}
        </View>

        {/* PHOTO ACTIONS */}

        {photoUri ? (
          <View
            style={
              styles.previewActions
            }
          >
            <View
              style={styles.previewInfo}
            >
              <View
                style={
                  styles.previewCheck
                }
              >
                <Ionicons
                  name="checkmark"
                  size={18}
                  color="#FFFFFF"
                />
              </View>

              <View
                style={
                  styles.previewInfoContent
                }
              >
                <AppText
                  weight="bold"
                  style={
                    styles.previewTitle
                  }
                >
                  Photo ready
                </AppText>

                <AppText
                  style={
                    styles.previewText
                  }
                >
                  Use this photo to help
                  find your part.
                </AppText>
              </View>
            </View>

            <View
              style={styles.actionRow}
            >
              <Pressable
                onPress={
                  handleRetake
                }
                accessibilityRole="button"
                accessibilityLabel="Retake photo"
                style={({
                  pressed,
                }) => [
                  styles.retakeButton,
                  pressed &&
                    styles.buttonPressed,
                ]}
              >
                <Ionicons
                  name="refresh"
                  size={19}
                  color={
                    CustomerColors.primary
                  }
                />

                <AppText
                  weight="bold"
                  style={
                    styles.retakeButtonText
                  }
                >
                  Retake
                </AppText>
              </Pressable>

              <Pressable
                onPress={
                  handleUsePhoto
                }
                accessibilityRole="button"
                accessibilityLabel="Use this photo"
                style={({
                  pressed,
                }) => [
                  styles.usePhotoButton,
                  pressed &&
                    styles.buttonPressed,
                ]}
              >
                <AppText
                  weight="bold"
                  style={
                    styles.usePhotoButtonText
                  }
                >
                  Use Photo
                </AppText>

                <Ionicons
                  name="arrow-forward"
                  size={19}
                  color={
                    CustomerColors.background
                  }
                />
              </Pressable>
            </View>
          </View>
        ) : (
          <View
            style={
              styles.cameraFooter
            }
          >
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#64748B"
            />

            <AppText
              style={
                styles.cameraFooterText
              }
            >
              You can retake the photo if
              the part isn't clear.
            </AppText>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

/*
 * ============================================================
 * PHOTO PREVIEW
 * ============================================================
 */

function PhotoPreview({
  uri,
}: PhotoPreviewProps) {
  return (
    <View
      style={
        styles.previewImageWrapper
      }
    >
      <Image
        source={{ uri }}
        style={styles.previewImage}
        resizeMode="cover"
      />

      <View
        style={styles.previewOverlay}
      >
        <View
          style={styles.previewTopBar}
        >
          <View
            style={styles.previewBadge}
          >
            <Ionicons
              name="image-outline"
              size={17}
              color="#FFFFFF"
            />

            <AppText
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
}

/*
 * ============================================================
 * STYLES
 * ============================================================
 */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },

  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  cameraContainer: {
    flex: 1,
    overflow: "hidden",
  },

  camera: {
    flex: 1,
  },

  topControls: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  topRightControls: {
    flexDirection: "row",
    alignItems: "center",
  },

  topButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor:
      "rgba(0,0,0,0.42)",
    alignItems: "center",
    justifyContent: "center",
  },

  topButtonSpacing: {
    marginLeft: 10,
  },

  buttonPressed: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  guideContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  guideFrame: {
    width: "78%",
    aspectRatio: 1,
    position: "relative",
  },

  corner: {
    position: "absolute",
    width: 34,
    height: 34,
    borderColor: "#FFFFFF",
  },

  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },

  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },

  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },

  cornerBottomRight: {
    right: 0,
    bottom: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },

  guideTextContainer: {
    marginTop: 28,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 15,
    backgroundColor:
      "rgba(0,0,0,0.48)",
    alignItems: "center",
  },

  guideTitle: {
    fontSize: 14,
    color: "#FFFFFF",
  },

  guideText: {
    marginTop: 3,
    fontSize: 11,
    color:
      "rgba(255,255,255,0.82)",
  },

  bottomControls: {
    position: "absolute",
    right: 0,
    bottom: 24,
    left: 0,
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  bottomSide: {
    width: 58,
    alignItems: "center",
  },

  captureOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 5,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  captureInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  captureDot: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor:
      CustomerColors.primary,
  },

  captureDisabled: {
    opacity: 0.45,
  },

  capturePressed: {
    transform: [
      {
        scale: 0.94,
      },
    ],
  },

  cameraHint: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      "rgba(0,0,0,0.42)",
    alignItems: "center",
    justifyContent: "center",
  },

  cameraFooter: {
    minHeight: 58,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  cameraFooterText: {
    marginLeft: 7,
    fontSize: 11,
    color: "#64748B",
  },

  previewContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },

  previewImageWrapper: {
    flex: 1,
    position: "relative",
  },

  previewImage: {
    width: "100%",
    height: "100%",
  },

  previewOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  previewTopBar: {
    paddingTop: 18,
    paddingHorizontal: 18,
  },

  previewBadge: {
    alignSelf: "flex-start",
    minHeight: 38,
    paddingHorizontal: 13,
    borderRadius: 19,
    backgroundColor:
      "rgba(0,0,0,0.48)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  previewBadgeText: {
    fontSize: 12,
    color: "#FFFFFF",
  },

  previewActions: {
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 18,
    backgroundColor: "#FFFFFF",
  },

  previewInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  previewCheck: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#159A68",
    alignItems: "center",
    justifyContent: "center",
  },

  previewInfoContent: {
    flex: 1,
    marginLeft: 10,
  },

  previewTitle: {
    fontSize: 13.5,
    color:
      CustomerColors.textPrimary,
  },

  previewText: {
    marginTop: 2,
    fontSize: 10.5,
    color:
      CustomerColors.textSecondary,
  },

  actionRow: {
    marginTop: 13,
    flexDirection: "row",
    gap: 10,
  },

  retakeButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 15,
    borderWidth: 1,
    borderColor:
      CustomerColors.border,
    backgroundColor: "#F6F8FC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  retakeButtonText: {
    fontSize: 12,
    color:
      CustomerColors.primary,
  },

  usePhotoButton: {
    flex: 1.35,
    minHeight: 48,
    borderRadius: 15,
    backgroundColor:
      CustomerColors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  usePhotoButtonText: {
    fontSize: 12,
    color:
      CustomerColors.background,
  },

  permissionScreen: {
    flex: 1,
    backgroundColor: "#F6F8FC",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  permissionCard: {
    width: "100%",
    padding: 24,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor:
      CustomerColors.border,
    alignItems: "center",
  },

  permissionIcon: {
    width: 70,
    height: 70,
    borderRadius: 23,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
  },

  permissionTitle: {
    marginTop: 16,
    fontSize: 20,
    color:
      CustomerColors.textPrimary,
  },

  permissionText: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 19,
    color:
      CustomerColors.textSecondary,
  },

  permissionButton: {
    width: "100%",
    minHeight: 50,
    marginTop: 20,
    borderRadius: 15,
    backgroundColor:
      CustomerColors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  permissionButtonText: {
    fontSize: 12,
    color:
      CustomerColors.background,
  },

  cancelButton: {
    minHeight: 42,
    marginTop: 5,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    fontSize: 12,
    color:
      CustomerColors.textSecondary,
  },
});