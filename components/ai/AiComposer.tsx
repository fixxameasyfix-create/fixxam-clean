import React, {
  memo,
  useCallback,
  useState,
} from "react";

import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  Image,
} from "expo-image";

import {
  AppIcon,
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

const MIN_INPUT_HEIGHT = 24;
const MAX_INPUT_HEIGHT = 140;
const IMAGE_PREVIEW_SIZE = 104;

/* ==============================================================
   TYPES
============================================================== */

interface AiComposerProps {
  value: string;

  onChangeText: (
    text: string,
  ) => void;

  onSend: () => void;

  onCameraPress: () => void;

  onGalleryPress: () => void;

  selectedImage?:
    | string
    | null;

  onRemoveImage?: () => void;

  disabled?: boolean;

  isSending?: boolean;
}

/* ==============================================================
   COMPONENT
============================================================== */

function AiComposer({
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
  const [
    inputHeight,
    setInputHeight,
  ] = useState(
    MIN_INPUT_HEIGHT,
  );

  const hasMessage =
    value.trim().length > 0;

  const hasImage =
    Boolean(selectedImage);

  const canSend =
    (hasMessage ||
      hasImage) &&
    !disabled &&
    !isSending;

  const actionsDisabled =
    disabled ||
    isSending;

  /* ============================================================
     SEND
  ============================================================ */

  const handleSend =
    useCallback(() => {
      if (!canSend) {
        return;
      }

      onSend();
    }, [
      canSend,
      onSend,
    ]);

  /* ============================================================
     INPUT HEIGHT
  ============================================================ */

 const handleContentSizeChange = useCallback(
  (event: {
    nativeEvent: {
      contentSize: {
        height: number;
      };
    };
  }) => {
    const nextHeight = Math.ceil(
      Math.min(
        MAX_INPUT_HEIGHT,
        Math.max(
          MIN_INPUT_HEIGHT,
          event.nativeEvent.contentSize.height,
        ),
      ),
    );

    setInputHeight(previous =>
      previous === nextHeight
        ? previous
        : nextHeight,
    );
  },
  [],
);

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <View
      style={
        styles.wrapper
      }
    >
      <View
        style={
          styles.container
        }
      >
        {/* ====================================================
            IMAGE PREVIEW
        ==================================================== */}

        {selectedImage ? (
          <View
            style={
              styles.previewContainer
            }
          >
            <Image
              source={{
                uri: selectedImage,
              }}
              style={
                styles.previewImage
              }
              contentFit="cover"
              transition={
                FixxamTokens.motion.fast
              }
              cachePolicy="memory-disk"
              accessibilityLabel="Selected repair image"
            />

            {onRemoveImage ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove selected image"
                hitSlop={8}
                onPress={
                  onRemoveImage
                }
                style={({
                  pressed,
                }) => [
                  styles.removeButton,

                  pressed
                    ? styles.actionPressed
                    : null,
                ]}
              >
                <AppIcon
                  name="close"
                  role="customer"
                  size="xs"
                  color={
                    Colors.textInverse
                  }
                  strokeWidth="strong"
                />
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {/* ====================================================
            MESSAGE INPUT
        ==================================================== */}

        <TextInput
  value={value}
  onChangeText={onChangeText}
  editable={!disabled}
  multiline
  textAlignVertical="top"
  scrollEnabled={inputHeight >= MAX_INPUT_HEIGHT}
  placeholder="Ask Fixxam Smarter..."
  placeholderTextColor={Colors.textMuted}
  selectionColor={CustomerColors.primary}
  accessibilityLabel="Message Fixxam Smarter"
  accessibilityHint="Type your repair question here"
  onContentSizeChange={handleContentSizeChange}
  style={[
    styles.input,
    {
      height: inputHeight,
    },
  ]}
/>

        {/* ====================================================
            ACTIONS
        ==================================================== */}

        <View
          style={
            styles.bottomRow
          }
        >
          <View
            style={
              styles.leftActions
            }
          >
            <ComposerAction
              icon="camera"
              label="Take a photo"
              disabled={
                actionsDisabled
              }
              onPress={
                onCameraPress
              }
            />

            <ComposerAction
              icon="image"
              label="Choose image from gallery"
              disabled={
                actionsDisabled
              }
              onPress={
                onGalleryPress
              }
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isSending
                ? "Sending message"
                : "Send message"
            }
            accessibilityState={{
              disabled:
                !canSend,
              busy:
                isSending,
            }}
            disabled={!canSend}
            hitSlop={6}
            onPress={
              handleSend
            }
            style={({
              pressed,
            }) => [
              styles.sendButton,

              !canSend
                ? styles.sendDisabled
                : null,

              pressed &&
              canSend
                ? styles.sendPressed
                : null,
            ]}
          >
           <AppIcon
  name={
    isSending
      ? "refresh"
      : "arrow-up"
  }
  role="customer"
  size="md"
  color={
    Colors.textInverse
  }
  strokeWidth="strong"
/>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/* ==============================================================
   ACTION BUTTON
============================================================== */

function ComposerAction({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon:
    | "camera"
    | "image";

  label: string;

  disabled: boolean;

  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        label
      }
      accessibilityState={{
        disabled,
      }}
      disabled={disabled}
      hitSlop={6}
      onPress={onPress}
      style={({
        pressed,
      }) => [
        styles.iconButton,

        disabled
          ? styles.actionDisabled
          : null,

        pressed &&
        !disabled
          ? styles.actionPressed
          : null,
      ]}
    >
      <AppIcon
        name={icon}
        role="customer"
        size="sm"
        state={
          disabled
            ? "muted"
            : "default"
        }
      />
    </Pressable>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    wrapper: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.lg,

      backgroundColor:
        Colors.background,
    },

    container: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       INPUT
    ======================================================== */
input: {
  minHeight:
    MIN_INPUT_HEIGHT,

  maxHeight:
    MAX_INPUT_HEIGHT,

  padding: 0,

  fontSize:
    Typography.fontSize.md,

  color:
    Colors.textPrimary,
},

    /* ========================================================
       ACTIONS
    ======================================================== */

    bottomRow: {
      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      marginTop:
        FixxamTokens.spacing.md,
    },

    leftActions: {
      flexDirection: "row",

      alignItems: "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    iconButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius
          .iconButton,
    },

    actionDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    actionPressed: {
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

    /* ========================================================
       SEND
    ======================================================== */

    sendButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primary,
    },

    sendDisabled: {
      backgroundColor:
        CustomerColors
          .primaryDisabled,

      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    sendPressed: {
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

    /* ========================================================
       IMAGE PREVIEW
    ======================================================== */

    previewContainer: {
      alignSelf:
        "flex-start",

      marginBottom:
        FixxamTokens.spacing.md,
    },

    previewImage: {
      width:
        IMAGE_PREVIEW_SIZE,

      height:
        IMAGE_PREVIEW_SIZE,

      borderRadius:
        FixxamTokens.radius.image,

      backgroundColor:
        Colors.iconBackground,
    },

    removeButton: {
      position: "absolute",

      top: -6,

      right: -6,

      width: 28,

      height: 28,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      borderWidth: 2,

      borderColor:
        Colors.surface,

      backgroundColor:
        Colors.error,
    },
  });

export default memo(
  AiComposer,
);