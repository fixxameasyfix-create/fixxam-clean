import React, {
  useMemo,
  useState,
} from "react";

import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  AppScreen,
} from "@/components/ui";

const MAX_LENGTH = 4000;

export default function AiBookingDescribeScreen() {
  const {
    imageUri: returnedImageUri,
  } =
    useLocalSearchParams<{
      imageUri?: string;
    }>();

  const [
    description,
    setDescription,
  ] = useState("");

  const imageUri =
    typeof returnedImageUri ===
    "string"
      ? returnedImageUri
      : "";

  const trimmedDescription =
    description.trim();

  const hasDescription =
    trimmedDescription.length >= 5;

  const hasPhoto =
    imageUri.length > 0;

  const canContinue =
    hasDescription ||
    hasPhoto;

  const characterCount =
    description.length;

  const helperText =
    useMemo(() => {
      if (
        hasPhoto &&
        !hasDescription
      ) {
        return "Photo added. Fixxam will use it to understand the problem.";
      }

      if (!description) {
        return "Example: My AC is on but it is not cooling the room.";
      }

      if (
        trimmedDescription.length < 5
      ) {
        return "Please describe the problem in a little more detail.";
      }

      return "Fixxam will understand your problem and find the right service.";
    }, [
      description,
      trimmedDescription,
      hasDescription,
      hasPhoto,
    ]);

  /*
   * ---------------------------------------------
   * OPEN EXISTING CAMERA SCREEN
   * ---------------------------------------------
   */

  function handleTakePhoto() {
    router.push({
      pathname:
        "/(customer)/ai-booking/camera",
    });
  }

  /*
   * ---------------------------------------------
   * CONTINUE TO AI SEARCH
   * ---------------------------------------------
   */

  function handleContinue() {
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
  }

  return (
    <AppScreen>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
              router.back()
            }
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color="#0B1F3A"
            />
          </TouchableOpacity>

          <View
            style={
              styles.headerContent
            }
          >
            <Text
              style={styles.title}
            >
              Describe Your Problem
            </Text>

            <Text
              style={styles.subtitle}
            >
              Tell Fixxam what is wrong.
              We'll find the right service
              and nearby worker.
            </Text>
          </View>
        </View>

        {/* AI CARD */}

        <View style={styles.aiCard}>
          <View style={styles.aiIcon}>
            <Ionicons
              name="sparkles"
              size={25}
              color="#F97316"
            />
          </View>

          <View
            style={
              styles.aiCardContent
            }
          >
            <Text
              style={styles.aiTitle}
            >
              Let Fixxam understand it
            </Text>

            <Text
              style={styles.aiText}
            >
              You don't need to know the
              service name. Just explain
              the problem naturally.
            </Text>
          </View>
        </View>

        {/* DESCRIPTION */}

        <View
          style={styles.inputCard}
        >
          <View
            style={styles.inputHeader}
          >
            <Text
              style={styles.inputLabel}
            >
              What's the problem?
            </Text>

            <Text
              style={styles.counter}
            >
              {characterCount}/
              {MAX_LENGTH}
            </Text>
          </View>

          <TextInput
            value={description}
            onChangeText={(value) =>
              setDescription(
                value.slice(
                  0,
                  MAX_LENGTH,
                ),
              )
            }
            placeholder="Describe what happened..."
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
            autoFocus={!hasPhoto}
            maxLength={MAX_LENGTH}
            style={styles.textInput}
          />

          <View
            style={styles.helperRow}
          >
            <Ionicons
              name={
                canContinue
                  ? "checkmark-circle-outline"
                  : "information-circle-outline"
              }
              size={18}
              color={
                canContinue
                  ? "#16A34A"
                  : "#64748B"
              }
            />

            <Text
              style={[
                styles.helperText,
                canContinue &&
                  styles.helperTextSuccess,
              ]}
            >
              {helperText}
            </Text>
          </View>
        </View>

        {/* PHOTO */}

        {hasPhoto ? (
          <View
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
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color="#16A34A"
                />

                <View
                  style={
                    styles.photoHeaderText
                  }
                >
                  <Text
                    style={
                      styles.photoTitle
                    }
                  >
                    Photo added
                  </Text>

                  <Text
                    style={
                      styles.photoSubtitle
                    }
                  >
                    Fixxam will inspect this photo.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={
                  handleTakePhoto
                }
                activeOpacity={0.8}
              >
                <Text
                  style={
                    styles.retakeText
                  }
                >
                  Retake
                </Text>
              </TouchableOpacity>
            </View>

            <Image
              source={{
                uri: imageUri,
              }}
              style={
                styles.photoPreview
              }
              resizeMode="cover"
            />
          </View>
        ) : (
          <TouchableOpacity
            style={
              styles.photoButton
            }
            activeOpacity={0.85}
            onPress={
              handleTakePhoto
            }
          >
            <View
              style={
                styles.photoIcon
              }
            >
              <Ionicons
                name="camera-outline"
                size={22}
                color="#2563EB"
              />
            </View>

            <View
              style={
                styles.photoContent
              }
            >
              <Text
                style={
                  styles.photoTitle
                }
              >
                Prefer a photo?
              </Text>

              <Text
                style={
                  styles.photoText
                }
              >
                Tap to open your camera directly.
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={21}
              color="#94A3B8"
            />
          </TouchableOpacity>
        )}

        {/* FIND WORKER */}

        <View
          style={styles.footer}
        >
          <TouchableOpacity
            style={[
              styles.continueButton,
              !canContinue &&
                styles.continueButtonDisabled,
            ]}
            disabled={!canContinue}
            onPress={
              handleContinue
            }
            activeOpacity={0.88}
          >
            <Text
              style={[
                styles.continueText,
                !canContinue &&
                  styles.continueTextDisabled,
              ]}
            >
              Find My Worker
            </Text>

            <Ionicons
              name="arrow-forward"
              size={21}
              color={
                canContinue
                  ? "#FFFFFF"
                  : "#94A3B8"
              }
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
    backgroundColor: "#F4F7FC",
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E7ECF3",
  },

  headerContent: {
    flex: 1,
  },

  title: {
    color: "#0B1F3A",
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "800",
    letterSpacing: -0.4,
  },

  subtitle: {
    marginTop: 6,
    color: "#64748B",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },

  aiCard: {
    marginTop: 24,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FFEDD5",
    flexDirection: "row",
    alignItems: "center",
  },

  aiIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  aiCardContent: {
    flex: 1,
    marginLeft: 13,
  },

  aiTitle: {
    color: "#0B1F3A",
    fontSize: 15,
    fontWeight: "800",
  },

  aiText: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "500",
  },

  inputCard: {
    marginTop: 16,
    minHeight: 255,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7ECF3",
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  inputLabel: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "800",
  },

  counter: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
  },

  textInput: {
    flex: 1,
    minHeight: 160,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    color: "#0F172A",
    fontSize: 15,
    lineHeight: 22,
  },

  helperRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  helperText: {
    flex: 1,
    marginLeft: 7,
    color: "#64748B",
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: "500",
  },

  helperTextSuccess: {
    color: "#166534",
  },

  photoButton: {
    marginTop: 14,
    minHeight: 72,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7ECF3",
    flexDirection: "row",
    alignItems: "center",
  },

  photoIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  photoContent: {
    flex: 1,
    marginLeft: 12,
  },

  photoTitle: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "800",
  },

  photoText: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 12,
    fontWeight: "500",
  },

  photoPreviewCard: {
    marginTop: 14,
    padding: 12,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7ECF3",
  },

  photoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  photoHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  photoHeaderText: {
    marginLeft: 8,
  },

  photoSubtitle: {
    marginTop: 2,
    color: "#64748B",
    fontSize: 11,
  },

  retakeText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "800",
  },

  photoPreview: {
    width: "100%",
    height: 180,
    borderRadius: 15,
    backgroundColor: "#F1F5F9",
  },

  footer: {
    marginTop: "auto",
    paddingTop: 16,
    paddingBottom: 12,
  },

  continueButton: {
    minHeight: 54,
    borderRadius: 17,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  continueButtonDisabled: {
    backgroundColor: "#E2E8F0",
  },

  continueText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  continueTextDisabled: {
    color: "#94A3B8",
  },
});