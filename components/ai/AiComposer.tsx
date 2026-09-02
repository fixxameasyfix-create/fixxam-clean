import React, {
  useState,
} from "react";

import {
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  CustomerColors,
  FixxamTokens,
} from "@/theme";

interface AiComposerProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;

  onCameraPress: () => void;
  onGalleryPress: () => void;

  selectedImage?: string | null;
  onRemoveImage?: () => void;

  disabled?: boolean;
  isSending?: boolean;
}

export default function AiComposer({
  value,
  onChangeText,
  onSend,
  onCameraPress,
  onGalleryPress,
  selectedImage,
  onRemoveImage,
  disabled = false,
  isSending = false,
}: AiComposerProps) {
  const [inputHeight, setInputHeight] =
    useState(24);

const canSend =
  (
    value.trim().length > 0 ||
    !!selectedImage
  ) &&
  !disabled &&
  !isSending;

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>

{selectedImage && (
  <View style={styles.previewContainer}>
    <Image
      source={{
        uri: selectedImage,
      }}
      style={styles.previewImage}
    />

    <TouchableOpacity
      onPress={onRemoveImage}
      style={styles.removeButton}
      activeOpacity={0.8}
    >
      <Ionicons
        name="close"
        size={18}
        color="#FFFFFF"
      />
    </TouchableOpacity>
  </View>
)}


        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Ask Fixxam Smarter..."
          placeholderTextColor={
            CustomerColors.textSecondary
          }
          multiline
          textAlignVertical="top"
          scrollEnabled={
            inputHeight >= 140
          }
          onContentSizeChange={(
            event,
          ) =>
            setInputHeight(
              Math.min(
                140,
                Math.max(
                  24,
                  event.nativeEvent
                    .contentSize.height,
                ),
              ),
            )
          }
          style={[
            styles.input,
            {
              height: inputHeight,
            },
          ]}
        />

        <View style={styles.bottomRow}>
          <View style={styles.leftActions}>
           <TouchableOpacity
  activeOpacity={0.7}
  style={styles.iconButton}
  onPress={onCameraPress}
>
              <Ionicons
                name="camera-outline"
                size={22}
                color={
                  CustomerColors.textSecondary
                }
              />
            </TouchableOpacity>

           <TouchableOpacity
  activeOpacity={0.7}
  style={styles.iconButton}
  onPress={onGalleryPress}
>
              <Ionicons
                name="image-outline"
                size={22}
                color={
                  CustomerColors.textSecondary
                }
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
  activeOpacity={0.8}
  disabled={!canSend}
  onPress={() => {
    if (canSend) {
      onSend();
    }
  }}
            style={[
              styles.sendButton,
              !canSend &&
                styles.sendDisabled,
            ]}
          >
            <Ionicons
              name="arrow-up"
              size={22}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    wrapper: {
      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingTop: 8,

      paddingBottom: 14,

      backgroundColor:
        CustomerColors.background,
    },

    container: {
      borderRadius: 26,

      backgroundColor: "#FFFFFF",

      borderWidth: 1,

      borderColor:
        CustomerColors.border,

      paddingHorizontal: 16,

      paddingTop: 12,

      paddingBottom: 10,

      ...FixxamTokens.shadow.card,
    },

    input: {
      minHeight: 24,

      maxHeight: 140,

      fontSize: 16,

      lineHeight: 24,

      color:
        CustomerColors.textPrimary,

      padding: 0,
    },

    bottomRow: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems: "center",

      marginTop: 10,
    },

    leftActions: {
      flexDirection: "row",

      alignItems: "center",
    },

    iconButton: {
      width: 38,

      height: 38,

      borderRadius: 19,

      justifyContent:
        "center",

      alignItems: "center",

      marginRight: 4,
    },

    sendButton: {
      width: 42,

      height: 42,

      borderRadius: 21,

      justifyContent:
        "center",

      alignItems: "center",

      backgroundColor:
        CustomerColors.primary,
    },

    sendDisabled: {
      opacity: 0.35,
    },

previewContainer: {
  marginBottom: 12,
  alignSelf: "flex-start",
},

previewImage: {
  width: 110,
  height: 110,
  borderRadius: 16,
},

removeButton: {
  position: "absolute",
  right: -6,
  top: -6,

  width: 28,
  height: 28,

  borderRadius: 14,

  justifyContent: "center",
  alignItems: "center",

  backgroundColor: "#EF4444",
},

  });