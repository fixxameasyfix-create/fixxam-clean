import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  Ionicons,
} from "@expo/vector-icons";

import {
  AppScreen,
} from "@/components/ui";

export default function AiBookingCameraScreen() {
  const [
    permission,
    requestPermission,
  ] = useCameraPermissions();

  const cameraRef =
    useRef<CameraView | null>(null);

  const [
    takingPhoto,
    setTakingPhoto,
  ] = useState(false);

  /*
   * ----------------------------------------------------------
   * REQUEST CAMERA PERMISSION
   * ----------------------------------------------------------
   */

  useEffect(() => {
    if (
      permission &&
      !permission.granted &&
      permission.canAskAgain
    ) {
      void requestPermission();
    }
  }, [
    permission,
    requestPermission,
  ]);

  /*
   * ----------------------------------------------------------
   * TAKE PHOTO
   * ----------------------------------------------------------
   *
   * Camera only captures the image.
   *
   * AI analysis happens in search.tsx/backend.
   * This keeps the camera screen fast and simple.
   */

  const takePhoto =
    useCallback(async () => {
      if (
        takingPhoto ||
        !cameraRef.current
      ) {
        return;
      }

      try {
        setTakingPhoto(true);

        const photo =
          await cameraRef.current.takePictureAsync(
            {
              quality: 0.8,
              skipProcessing: false,
            },
          );

        if (!photo?.uri) {
          throw new Error(
            "Unable to capture the photo.",
          );
        }

        /*
         * Send the image to the AI
         * processing screen.
         *
         * IMPORTANT:
         *
         * We do NOT create a booking here.
         *
         * search.tsx will:
         *
         * 1. Upload/process image
         * 2. Ask AI to understand problem
         * 3. Identify service
         * 4. Find suitable worker
         * 5. Prepare request form
         * 6. Let customer review/edit
         * 7. Customer finally submits request
         */

        router.replace({
          pathname:
            "/(customer)/ai-booking/search",
          params: {
            imageUri: photo.uri,
            source: "camera",
          },
        });
      } catch (error) {
        console.error(
          "AI BOOKING CAMERA ERROR:",
          error,
        );

        Alert.alert(
          "Photo Error",
          "We couldn't take the photo. Please try again.",
        );

        setTakingPhoto(false);
      }
    }, [
      takingPhoto,
    ]);

  /*
   * ----------------------------------------------------------
   * LOADING PERMISSION
   * ----------------------------------------------------------
   */

  if (!permission) {
    return (
      <AppScreen>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#F97316"
          />

          <Text
            style={styles.loadingText}
          >
            Preparing camera...
          </Text>
        </View>
      </AppScreen>
    );
  }

  /*
   * ----------------------------------------------------------
   * PERMISSION DENIED
   * ----------------------------------------------------------
   */

  if (!permission.granted) {
    return (
      <AppScreen>
        <View
          style={
            styles.permissionContainer
          }
        >
          <View
            style={
              styles.permissionIcon
            }
          >
            <Ionicons
              name="camera-outline"
              size={38}
              color="#F97316"
            />
          </View>

          <Text
            style={
              styles.permissionTitle
            }
          >
            Camera Access Needed
          </Text>

          <Text
            style={
              styles.permissionText
            }
          >
            Fixxam needs access to your
            camera so you can show us
            the problem you're experiencing.
          </Text>

          {permission.canAskAgain ? (
            <TouchableOpacity
              style={
                styles.permissionButton
              }
              onPress={() =>
                void requestPermission()
              }
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel="Allow camera"
            >
              <Ionicons
                name="camera-outline"
                size={19}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.permissionButtonText
                }
              >
                Allow Camera
              </Text>
            </TouchableOpacity>
          ) : (
            <View
              style={
                styles.deniedBox
              }
            >
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color="#DC2626"
              />

              <Text
                style={
                  styles.settingsText
                }
              >
                Camera permission was denied.
                Please enable camera access
                from your device settings.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              router.back()
            }
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={18}
              color="#0F172A"
            />

            <Text
              style={styles.backText}
            >
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </AppScreen>
    );
  }

  /*
   * ----------------------------------------------------------
   * CAMERA
   * ----------------------------------------------------------
   */

  return (
    <View
      style={
        styles.cameraContainer
      }
    >
      <CameraView
        ref={cameraRef}
        style={
          StyleSheet.absoluteFill
        }
        facing="back"
        mode="picture"
      />

      {/* ==================================================== */}
      {/* TOP BAR                                               */}
      {/* ==================================================== */}

      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() =>
            router.back()
          }
          activeOpacity={0.8}
          disabled={takingPhoto}
          accessibilityRole="button"
          accessibilityLabel="Close camera"
        >
          <Ionicons
            name="close"
            size={26}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View
          style={
            styles.topTitleContainer
          }
        >
          <Text
            style={styles.topTitle}
          >
            Show Us The Problem
          </Text>

          <Text
            style={styles.topSubtitle}
          >
            Take a clear photo of the
            problem area.
          </Text>
        </View>
      </View>

      {/* ==================================================== */}
      {/* GUIDE                                                 */}
      {/* ==================================================== */}

      <View
        pointerEvents="none"
        style={
          styles.guideContainer
        }
      >
        <View style={styles.guide}>
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
          style={styles.guideLabel}
        >
          <Ionicons
            name="scan-outline"
            size={15}
            color="#FFFFFF"
          />

          <Text
            style={styles.guideText}
          >
            Keep the problem clearly
            visible inside the frame
          </Text>
        </View>
      </View>

      {/* ==================================================== */}
      {/* AI INFORMATION                                        */}
      {/* ==================================================== */}

      <View
        pointerEvents="none"
        style={styles.aiHint}
      >
        <Ionicons
          name="sparkles"
          size={15}
          color="#FFFFFF"
        />

        <Text
          style={styles.aiHintText}
        >
          Fixxam AI will analyze this photo
        </Text>
      </View>

      {/* ==================================================== */}
      {/* BOTTOM CONTROLS                                       */}
      {/* ==================================================== */}

      <View
        style={styles.bottomBar}
      >
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() =>
            router.back()
          }
          activeOpacity={0.8}
          disabled={takingPhoto}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#FFFFFF"
          />

          <Text
            style={styles.cancelText}
          >
            Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.captureButton,
            takingPhoto &&
              styles.captureButtonBusy,
          ]}
          onPress={() =>
            void takePhoto()
          }
          disabled={takingPhoto}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Take photo"
        >
          {takingPhoto ? (
            <ActivityIndicator
              size="small"
              color="#0F172A"
            />
          ) : (
            <View
              style={styles.captureInner}
            />
          )}
        </TouchableOpacity>

        <View
          style={styles.bottomSpacer}
        />
      </View>

      {/* ==================================================== */}
      {/* PROCESSING OVERLAY                                    */}
      {/* ==================================================== */}

      {takingPhoto && (
        <View
          style={
            styles.processingOverlay
          }
        >
          <View
            style={
              styles.processingCard
            }
          >
            <ActivityIndicator
              size="large"
              color="#F97316"
            />

            <Text
              style={
                styles.processingTitle
              }
            >
              Preparing your photo
            </Text>

            <Text
              style={
                styles.processingText
              }
            >
              Fixxam will analyze the problem
              and prepare your request.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  /* ======================================================== */
  /* LOADING                                                  */
  /* ======================================================== */

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
  },

  /* ======================================================== */
  /* PERMISSION                                               */
  /* ======================================================== */

  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  permissionIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
  },

  permissionTitle: {
    marginTop: 20,
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },

  permissionText: {
    marginTop: 10,
    color: "#64748B",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },

  permissionButton: {
    marginTop: 24,
    minHeight: 50,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: "#F97316",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  permissionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  deniedBox: {
    marginTop: 22,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  settingsText: {
    flex: 1,
    color: "#B91C1C",
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "600",
    textAlign: "left",
  },

  backButton: {
    marginTop: 18,
    minHeight: 46,
    paddingHorizontal: 22,
    borderRadius: 15,
    backgroundColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  backText: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "700",
  },

  /* ======================================================== */
  /* CAMERA                                                   */
  /* ======================================================== */

  cameraContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },

  /* ======================================================== */
  /* TOP BAR                                                   */
  /* ======================================================== */

  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,

    paddingTop: 56,
    paddingHorizontal: 18,

    flexDirection: "row",
    alignItems: "flex-start",
  },

  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,

    backgroundColor:
      "rgba(15,23,42,0.68)",

    alignItems: "center",
    justifyContent: "center",
  },

  topTitleContainer: {
    flex: 1,
    marginLeft: 12,
    paddingTop: 2,
  },

  topTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  topSubtitle: {
    marginTop: 4,
    color:
      "rgba(255,255,255,0.80)",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "500",
  },

  /* ======================================================== */
  /* GUIDE                                                     */
  /* ======================================================== */

  guideContainer: {
    position: "absolute",
    left: 24,
    right: 24,
    top: "27%",
    alignItems: "center",
  },

  guide: {
    width: "100%",
    height: 250,
    position: "relative",
  },

  corner: {
    position: "absolute",
    width: 34,
    height: 34,
    borderColor: "#FFFFFF",
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
    marginTop: 16,

    paddingHorizontal: 14,
    paddingVertical: 8,

    borderRadius: 12,

    backgroundColor:
      "rgba(15,23,42,0.68)",

    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  guideText: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: "600",
    textAlign: "center",
  },

  /* ======================================================== */
  /* AI HINT                                                   */
  /* ======================================================== */

  aiHint: {
    position: "absolute",

    left: 24,
    right: 24,
    bottom: 140,

    alignItems: "center",
    justifyContent: "center",

    flexDirection: "row",
    gap: 6,

    paddingVertical: 9,
    paddingHorizontal: 14,

    borderRadius: 14,

    backgroundColor:
      "rgba(15,23,42,0.62)",
  },

  aiHintText: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: "600",
  },

  /* ======================================================== */
  /* BOTTOM                                                    */
  /* ======================================================== */

  bottomBar: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    paddingBottom: 42,
    paddingHorizontal: 28,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cancelButton: {
    width: 80,

    flexDirection: "row",
    alignItems: "center",

    gap: 5,
  },

  cancelText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  captureButton: {
    width: 78,
    height: 78,

    borderRadius: 39,

    backgroundColor: "#FFFFFF",

    borderWidth: 5,
    borderColor:
      "rgba(255,255,255,0.45)",

    alignItems: "center",
    justifyContent: "center",
  },

  captureButtonBusy: {
    opacity: 0.8,
  },

  captureInner: {
    width: 62,
    height: 62,

    borderRadius: 31,

    backgroundColor: "#FFFFFF",

    borderWidth: 2,
    borderColor: "#0F172A",
  },

  bottomSpacer: {
    width: 80,
  },

  /* ======================================================== */
  /* PROCESSING                                                */
  /* ======================================================== */

  processingOverlay: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor:
      "rgba(0,0,0,0.48)",

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 28,
  },

  processingCard: {
    width: "100%",

    maxWidth: 340,

    padding: 24,

    borderRadius: 22,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
  },

  processingTitle: {
    marginTop: 16,

    color: "#0F172A",

    fontSize: 17,
    fontWeight: "800",

    textAlign: "center",
  },

  processingText: {
    marginTop: 7,

    color: "#64748B",

    fontSize: 12.5,
    lineHeight: 19,

    fontWeight: "500",

    textAlign: "center",
  },
});