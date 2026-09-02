import React, {
  useCallback,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
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

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

import {
  setCapturedPhoto,
} from "@/utils/capturedPhotoStore";

/* ==============================================================
   CONSTANTS
============================================================== */

const FRAME_WIDTH = 300;
const FRAME_HEIGHT = 390;

/* ==============================================================
   SCREEN
============================================================== */

export default function BookingCameraScreen() {
  const cameraRef =
    useRef<CameraView | null>(
      null,
    );

  const [
    permission,
    requestPermission,
  ] =
    useCameraPermissions();

  const [
    cameraReady,
    setCameraReady,
  ] = useState(false);

  const [
    capturing,
    setCapturing,
  ] = useState(false);

  /* ============================================================
     PERMISSION
  ============================================================ */

  const handleRequestPermission =
    useCallback(async () => {
      try {
        await requestPermission();
      } catch (error) {
        console.error(
          "CAMERA_PERMISSION_ERROR",
          error,
        );

        Alert.alert(
          "Camera permission",
          "Unable to request camera permission.",
        );
      }
    }, [
      requestPermission,
    ]);

  /* ============================================================
     TAKE PHOTO
  ============================================================ */

  const handleCapture =
    useCallback(async () => {
      if (
        capturing ||
        !cameraReady ||
        !cameraRef.current
      ) {
        return;
      }

      setCapturing(true);

      try {
        const photo =
          await cameraRef.current.takePictureAsync(
            {
              quality: 0.8,
              skipProcessing: false,
            },
          );

        if (!photo?.uri) {
          throw new Error(
            "Camera did not return an image.",
          );
        }

        setCapturedPhoto(
          photo.uri,
        );

        router.back();
      } catch (error) {
        console.error(
          "TAKE_BOOKING_PHOTO_ERROR",
          error,
        );

        Alert.alert(
          "Photo error",
          "We could not take the photo. Please try again.",
        );
      } finally {
        setCapturing(false);
      }
    }, [
      capturing,
      cameraReady,
    ]);

  /* ============================================================
     LOADING PERMISSION
  ============================================================ */

  if (!permission) {
    return (
      <View
        style={
          styles.permissionScreen
        }
      >
        <ActivityIndicator
          size="large"
          color="#FFFFFF"
        />
      </View>
    );
  }

  /* ============================================================
     PERMISSION DENIED
  ============================================================ */

  if (!permission.granted) {
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
            <Ionicons
              name="camera-outline"
              size={34}
              color="#FFFFFF"
            />
          </View>

          <AppText
            weight="bold"
            style={
              styles.permissionTitle
            }
          >
            Camera Access Needed
          </AppText>

          <AppText
            center
            style={
              styles.permissionText
            }
          >
            Fixxam needs access to
            your camera so you can
            show the worker the
            problem clearly.
          </AppText>

          <Pressable
            onPress={
              handleRequestPermission
            }
            style={
              styles.permissionButton
            }
          >
            <AppText
              weight="bold"
              style={
                styles.permissionButtonText
              }
            >
              Allow Camera
            </AppText>
          </Pressable>

          <Pressable
            onPress={() =>
              router.back()
            }
            style={
              styles.permissionBack
            }
          >
            <AppText
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

  /* ============================================================
     CAMERA
  ============================================================ */

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        mode="picture"
        onCameraReady={() =>
          setCameraReady(true)
        }
      />

      {/* DARK OVERLAY */}

      <View
        pointerEvents="none"
        style={
          styles.overlay
        }
      />

      {/* TOP */}

      <SafeAreaView
        style={styles.topArea}
      >
        <View
          style={
            styles.topContent
          }
        >
          <Pressable
            onPress={() =>
              router.back()
            }
            disabled={capturing}
            style={
              styles.closeButton
            }
            accessibilityRole="button"
            accessibilityLabel="Close camera"
          >
            <Ionicons
              name="close"
              size={24}
              color="#FFFFFF"
            />
          </Pressable>

          <View
            style={
              styles.titleContainer
            }
          >
            <AppText
              weight="bold"
              style={
                styles.title
              }
            >
              Show Us The Problem
            </AppText>

            <AppText
              style={
                styles.subtitle
              }
            >
              Take a clear photo of the
              problem area.
            </AppText>
          </View>
        </View>
      </SafeAreaView>

      {/* CAMERA FRAME */}

      <View
        pointerEvents="none"
        style={
          styles.frameContainer
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

      {/* INSTRUCTION */}

      <View
        pointerEvents="none"
        style={
          styles.instruction
        }
      >
        <Ionicons
          name="sparkles-outline"
          size={15}
          color="#FFFFFF"
        />

        <AppText
          style={
            styles.instructionText
          }
        >
          Keep the problem clearly
          visible inside the frame
        </AppText>
      </View>

      {/* BOTTOM */}

      <SafeAreaView
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
            onPress={() =>
              router.back()
            }
            disabled={capturing}
            style={
              styles.backControl
            }
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color="#FFFFFF"
            />

            <AppText
              weight="bold"
              style={
                styles.backText
              }
            >
              Back
            </AppText>
          </Pressable>

          <Pressable
            onPress={
              handleCapture
            }
            disabled={
              capturing ||
              !cameraReady
            }
            accessibilityRole="button"
            accessibilityLabel="Take photo"
            style={({ pressed }) => [
              styles.shutterOuter,

              pressed &&
                !capturing &&
                styles.shutterPressed,

              (!cameraReady ||
                capturing) &&
                styles.shutterDisabled,
            ]}
          >
            {capturing ? (
              <ActivityIndicator
                size="small"
                color="#0F172A"
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

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#020617",
    },

    permissionScreen: {
      flex: 1,
      backgroundColor: "#020617",
      alignItems: "center",
      justifyContent: "center",
    },

    permissionContent: {
      width: "100%",
      paddingHorizontal: 28,
      alignItems: "center",
    },

    permissionIcon: {
      width: 76,
      height: 76,
      borderRadius: 25,
      backgroundColor:
        "rgba(37,99,235,0.85)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },

    permissionTitle: {
      fontSize: 22,
      color: "#FFFFFF",
      textAlign: "center",
    },

    permissionText: {
      marginTop: 9,
      maxWidth: 330,
      fontSize: 14,
      lineHeight: 21,
      color: "#CBD5E1",
    },

    permissionButton: {
      width: "100%",
      height: 54,
      borderRadius: 17,
      backgroundColor: "#2563EB",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 26,
    },

    permissionButtonText: {
      fontSize: 14,
      color: "#FFFFFF",
    },

    permissionBack: {
      marginTop: 17,
      paddingVertical: 10,
      paddingHorizontal: 20,
    },

    permissionBackText: {
      fontSize: 13,
      color: "#CBD5E1",
    },

    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor:
        "rgba(2,6,23,0.18)",
    },

    topArea: {
      zIndex: 10,
    },

    topContent: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 18,
      paddingTop: 10,
    },

    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor:
        "rgba(15,23,42,0.45)",
      alignItems: "center",
      justifyContent: "center",
    },

    titleContainer: {
      flex: 1,
      marginLeft: 13,
    },

    title: {
      fontSize: 17,
      lineHeight: 22,
      color: "#FFFFFF",
    },

    subtitle: {
      marginTop: 2,
      fontSize: 11.5,
      lineHeight: 17,
      color: "#E2E8F0",
    },

    frameContainer: {
      position: "absolute",
      width: FRAME_WIDTH,
      height: FRAME_HEIGHT,
      left: "50%",
      top: "50%",
      marginLeft:
        -(FRAME_WIDTH / 2),
      marginTop:
        -(FRAME_HEIGHT / 2),
    },

    corner: {
      position: "absolute",
      width: 42,
      height: 42,
      borderColor: "#FFFFFF",
    },

    cornerTopLeft: {
      left: 0,
      top: 0,
      borderLeftWidth: 4,
      borderTopWidth: 4,
      borderTopLeftRadius: 5,
    },

    cornerTopRight: {
      right: 0,
      top: 0,
      borderRightWidth: 4,
      borderTopWidth: 4,
      borderTopRightRadius: 5,
    },

    cornerBottomLeft: {
      left: 0,
      bottom: 0,
      borderLeftWidth: 4,
      borderBottomWidth: 4,
      borderBottomLeftRadius: 5,
    },

    cornerBottomRight: {
      right: 0,
      bottom: 0,
      borderRightWidth: 4,
      borderBottomWidth: 4,
      borderBottomRightRadius: 5,
    },

    instruction: {
      position: "absolute",
      left: 28,
      right: 28,
      bottom: 150,
      minHeight: 38,
      borderRadius: 20,
      backgroundColor:
        "rgba(37,99,235,0.82)",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 15,
      gap: 7,
    },

    instructionText: {
      fontSize: 11,
      lineHeight: 16,
      color: "#FFFFFF",
    },

    bottomArea: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
    },

    bottomContent: {
      minHeight: 120,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 28,
    },

    backControl: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      width: 80,
    },

    backText: {
      fontSize: 13,
      color: "#FFFFFF",
    },

    shutterOuter: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 5,
      borderColor:
        "rgba(255,255,255,0.45)",
    },

    shutterInner: {
      width: 62,
      height: 62,
      borderRadius: 31,
      backgroundColor: "#FFFFFF",
      borderWidth: 2,
      borderColor: "#CBD5E1",
    },

    shutterPressed: {
      transform: [
        { scale: 0.92 },
      ],
    },

    shutterDisabled: {
      opacity: 0.55,
    },

    bottomSpacer: {
      width: 80,
    },
  });