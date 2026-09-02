import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

import { AppText } from "@/components/ui";
import { CustomerColors } from "@/theme/customerColors";

const MAX_DESCRIPTION_LENGTH = 4000;
const MIN_DESCRIPTION_LENGTH = 5;

export default function DescribePartScreen() {
  const [description, setDescription] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const trimmedDescription = useMemo(
    () => description.trim(),
    [description],
  );

  const canContinue =
    trimmedDescription.length >=
    MIN_DESCRIPTION_LENGTH;

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const handleDescriptionChange = useCallback(
    (value: string) => {
      if (
        value.length >
        MAX_DESCRIPTION_LENGTH
      ) {
        return;
      }

      setDescription(value);
    },
    [],
  );

  const handleTakePhoto = useCallback(() => {
    router.push(
      "/(customer)/buy-spare-parts/take-photo",
    );
  }, []);

  const handleFindParts = useCallback(() => {
    if (!canContinue) {
      return;
    }

    router.push({
      pathname:
        "/(customer)/buy-spare-parts/find-part",
      params: {
        source: "description",
        description: trimmedDescription,
      },
    });
  }, [
    canContinue,
    trimmedDescription,
  ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <View style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              styles.scrollContent
            }
          >
            {/* HEADER */}

            <View style={styles.header}>
              <Pressable
                onPress={handleBack}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                style={({ pressed }) => [
                  styles.backButton,
                  pressed &&
                    styles.backButtonPressed,
                ]}
              >
                <Ionicons
                  name="arrow-back"
                  size={20}
                  color="#0F172A"
                />
              </Pressable>

              <View
                style={styles.headerContent}
              >
                <AppText
                  weight="bold"
                  numberOfLines={1}
                  style={styles.headerTitle}
                >
                  Describe Your Part
                </AppText>

                <AppText
                  numberOfLines={1}
                  style={styles.headerSubtitle}
                >
                  Tell Fixxam what you need.
                </AppText>
              </View>
            </View>

            {/* INTRO */}

            <View style={styles.introCard}>
              <View style={styles.introIcon}>
                <Ionicons
                  name="search-outline"
                  size={24}
                  color={
                    CustomerColors.primary
                  }
                />
              </View>

              <View
                style={styles.introContent}
              >
                <AppText
                  weight="bold"
                  style={styles.introTitle}
                >
                  Let Fixxam find it
                </AppText>

                <AppText
                  numberOfLines={2}
                  style={
                    styles.introDescription
                  }
                >
                  You don't need to know the
                  part name. Just describe what
                  you need.
                </AppText>
              </View>
            </View>

            {/* DESCRIPTION */}

            <View
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
                  weight="bold"
                  style={
                    styles.descriptionTitle
                  }
                >
                  What are you looking for?
                </AppText>

                <AppText
                  weight="bold"
                  style={
                    styles.characterCount
                  }
                >
                  {description.length}/
                  {MAX_DESCRIPTION_LENGTH}
                </AppText>
              </View>

              <View
                style={[
                  styles.textArea,
                  isFocused &&
                    styles.textAreaFocused,
                ]}
              >
                <TextInput
                  value={description}
                  onChangeText={
                    handleDescriptionChange
                  }
                  onFocus={() =>
                    setIsFocused(true)
                  }
                  onBlur={() =>
                    setIsFocused(false)
                  }
                  multiline
                  maxLength={
                    MAX_DESCRIPTION_LENGTH
                  }
                  textAlignVertical="top"
                  placeholder="Describe the part you need..."
                  placeholderTextColor="#A0AEC0"
                  style={
                    styles.textInput
                  }
                  autoCorrect
                  accessibilityLabel="Describe the spare part you need"
                />
              </View>

              <View
                style={styles.exampleRow}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={17}
                  color="#64748B"
                />

                <AppText
                  style={
                    styles.exampleText
                  }
                >
                  Example: I need a door handle
                  for my Samsung fridge.
                </AppText>
              </View>
            </View>

            {/* PHOTO */}

            <Pressable
              onPress={handleTakePhoto}
              accessibilityRole="button"
              accessibilityLabel="Take a photo of the spare part"
              style={({ pressed }) => [
                styles.photoCard,
                pressed &&
                  styles.photoCardPressed,
              ]}
            >
              <View
                style={styles.photoIcon}
              >
                <Ionicons
                  name="camera-outline"
                  size={23}
                  color={
                    CustomerColors.primary
                  }
                />
              </View>

              <View
                style={styles.photoContent}
              >
                <AppText
                  weight="bold"
                  style={styles.photoTitle}
                >
                  Prefer a photo?
                </AppText>

                <AppText
                  numberOfLines={2}
                  style={
                    styles.photoDescription
                  }
                >
                  Take a photo and let Fixxam
                  identify the part.
                </AppText>
              </View>

              <Ionicons
                name="chevron-forward"
                size={22}
                color="#64748B"
              />
            </Pressable>

            {/* INFO */}

            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={19}
                  color="#24956A"
                />
              </View>

              <View
                style={styles.infoContent}
              >
                <AppText
                  weight="bold"
                  style={styles.infoTitle}
                >
                  Nothing will be ordered yet
                </AppText>

                <AppText
                  numberOfLines={2}
                  style={styles.infoText}
                >
                  Fixxam will only find compatible
                  spare parts. You choose what to
                  buy.
                </AppText>
              </View>
            </View>
          </ScrollView>

          {/* ACTION */}

          <View
            style={styles.bottomContainer}
          >
            <Pressable
              onPress={handleFindParts}
              disabled={!canContinue}
              accessibilityRole="button"
              accessibilityLabel="Find compatible spare parts"
              accessibilityState={{
                disabled: !canContinue,
              }}
              style={({ pressed }) => [
                styles.findButton,
                !canContinue &&
                  styles.findButtonDisabled,
                pressed &&
                  canContinue &&
                  styles.findButtonPressed,
              ]}
            >
              <AppText
                weight="bold"
                style={
                  styles.findButtonText
                }
              >
                Find Compatible Parts
              </AppText>

              <Ionicons
                name="arrow-forward"
                size={19}
                color="#FFFFFF"
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F7FC",
  },

  keyboard: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 2,
    paddingBottom: 12,
  },

  /*
   * HEADER
   */

  header: {
    minHeight: 55,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
  },

  backButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },

  headerContent: {
    flex: 1,
    marginLeft: 9,
  },

  headerTitle: {
    fontSize: 21,
    lineHeight: 26,
    color: "#0F172A",
  },

  headerSubtitle: {
    marginTop: 1,
    fontSize: 12,
    lineHeight: 16,
    color: "#64748B",
  },

  /*
   * INTRO
   */

  introCard: {
    minHeight: 91,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 19,
    backgroundColor: "#EEF6FF",
    borderWidth: 1,
    borderColor: "#D8E8FA",
    flexDirection: "row",
    alignItems: "center",
  },

  introIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  introContent: {
    flex: 1,
    marginLeft: 12,
  },

  introTitle: {
    fontSize: 15,
    lineHeight: 20,
    color: "#0F172A",
  },

  introDescription: {
    marginTop: 3,
    fontSize: 11.5,
    lineHeight: 17,
    color: "#64748B",
  },

  /*
   * DESCRIPTION
   */

  descriptionCard: {
    marginTop: 15,
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 13,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 1,
  },

  descriptionHeader: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  descriptionTitle: {
    flex: 1,
    fontSize: 16,
    lineHeight: 21,
    color: "#0F172A",
  },

  characterCount: {
    marginLeft: 8,
    fontSize: 11,
    color: "#A0AEC0",
  },

  textArea: {
    height: 180,
    paddingHorizontal: 13,
    paddingVertical: 12,
    borderRadius: 17,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  textAreaFocused: {
    borderColor: CustomerColors.primary,
    backgroundColor: "#FFFFFF",
  },

  textInput: {
    flex: 1,
    padding: 0,
    fontSize: 14,
    lineHeight: 21,
    color: "#0F172A",
  },

  exampleRow: {
    marginTop: 11,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  exampleText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 11.5,
    lineHeight: 17,
    color: "#64748B",
  },

  /*
   * PHOTO
   */

  photoCard: {
    minHeight: 82,
    marginTop: 13,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    elevation: 1,
  },

  photoCardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },

  photoIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#EEF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  photoContent: {
    flex: 1,
    marginLeft: 11,
    paddingRight: 5,
  },

  photoTitle: {
    fontSize: 14,
    lineHeight: 19,
    color: "#0F172A",
  },

  photoDescription: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    color: "#64748B",
  },

  /*
   * INFO
   */

  infoCard: {
    marginTop: 12,
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderRadius: 17,
    backgroundColor: "#EFFAF5",
    borderWidth: 1,
    borderColor: "#D7F0E3",
    flexDirection: "row",
    alignItems: "center",
  },

  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  infoContent: {
    flex: 1,
    marginLeft: 9,
  },

  infoTitle: {
    fontSize: 11.5,
    lineHeight: 16,
    color: "#287A58",
  },

  infoText: {
    marginTop: 2,
    fontSize: 10.5,
    lineHeight: 15,
    color: "#4C806B",
  },

  /*
   * BOTTOM
   */

  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 7,
    paddingBottom:
      Platform.OS === "ios" ? 10 : 9,
    backgroundColor: "#F4F7FC",
  },

  findButton: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor:
      CustomerColors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  findButtonDisabled: {
    backgroundColor: "#DDE5EF",
  },

  findButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },

  findButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
  },
});