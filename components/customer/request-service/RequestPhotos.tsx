import React, {
  memo,
  useCallback,
  useState,
} from "react";

import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  Image,
} from "expo-image";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppButton,
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_PHOTOS = 3;

const PHOTO_SIZE = 88;

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  photos: string[];

  onAdd: () => void;

  onTakePhoto: () => void;

  onRemove: (
    uri: string,
  ) => void;

  disabled?: boolean;
};

/* ==============================================================
   COMPONENT
============================================================== */

function RequestPhotos({
  photos,
  onAdd,
  onTakePhoto,
  onRemove,
  disabled = false,
}: Props) {
  const insets =
    useSafeAreaInsets();

  const [
    pickerVisible,
    setPickerVisible,
  ] =
    useState(false);

  const reachedLimit =
    photos.length >=
    MAX_PHOTOS;

  const canAdd =
    !disabled &&
    !reachedLimit;

  /* ============================================================
     PICKER
  ============================================================ */

  const handleAddPress =
    useCallback(
      () => {
        if (
          !canAdd
        ) {
          return;
        }

        setPickerVisible(
          true,
        );
      },
      [
        canAdd,
      ],
    );

  const handleClosePicker =
    useCallback(
      () => {
        setPickerVisible(
          false,
        );
      },
      [],
    );

  const handleTakePhoto =
    useCallback(
      () => {
        setPickerVisible(
          false,
        );

        onTakePhoto();
      },
      [
        onTakePhoto,
      ],
    );

  const handleGallery =
    useCallback(
      () => {
        setPickerVisible(
          false,
        );

        onAdd();
      },
      [
        onAdd,
      ],
    );

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          ADD PHOTOS
      ====================================================== */}

      {!reachedLimit ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add photos"
          accessibilityHint="Choose whether to take a new photo or select one from your gallery"
          accessibilityState={{
            disabled:
              !canAdd,
          }}
          disabled={
            !canAdd
          }
          onPress={
            handleAddPress
          }
          style={({
            pressed,
          }) => [
            styles.addButton,

            pressed &&
              canAdd &&
              styles.addButtonPressed,

            !canAdd &&
              styles.disabled,
          ]}
        >
          <MaterialCommunityIcons
            name="image-plus-outline"
            size={22}
            color={
              canAdd
                ? CustomerColors.primary
                : Colors.textMuted
            }
          />

          <AppText
            variant="bodyMedium"
            weight="semibold"
            style={[
              styles.addButtonText,

              !canAdd &&
                styles.addButtonTextDisabled,
            ]}
          >
            Add Photos
          </AppText>

          <MaterialCommunityIcons
            name="plus"
            size={20}
            color={
              canAdd
                ? CustomerColors.primary
                : Colors.textMuted
            }
          />
        </Pressable>
      ) : null}

      {/* ======================================================
          PHOTO PREVIEWS
      ====================================================== */}

      {photos.length > 0 ? (
        <ScrollView
          horizontal
          bounces={false}
          overScrollMode="never"
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.photoList
          }
        >
          {photos.map(
            (
              uri,
              index,
            ) => (
              <View
                key={`${uri}-${index}`}
                style={
                  styles.photoWrapper
                }
              >
                <Image
                  source={{
                    uri,
                  }}
                  style={
                    styles.photo
                  }
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={
                    FixxamTokens.motion.fast
                  }
                  accessibilityLabel={`Service request photo ${index + 1}`}
                />

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove photo ${index + 1}`}
                  accessibilityState={{
                    disabled,
                  }}
                  disabled={
                    disabled
                  }
                  hitSlop={8}
                  onPress={() =>
                    onRemove(
                      uri,
                    )
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.removeButton,

                    pressed &&
                      !disabled &&
                      styles.removeButtonPressed,

                    disabled &&
                      styles.disabled,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={17}
                    color={
                      Colors.textInverse
                    }
                  />
                </Pressable>
              </View>
            ),
          )}
        </ScrollView>
      ) : null}

      {/* ======================================================
          LIMIT MESSAGE
      ====================================================== */}

      <View
        style={
          styles.footer
        }
      >
        <MaterialCommunityIcons
          name={
            reachedLimit
              ? "check-circle-outline"
              : "information-outline"
          }
          size={16}
          color={
            Colors.textMuted
          }
        />

        <AppText
          variant="caption"
          tone="muted"
          style={
            styles.footerText
          }
        >
          {reachedLimit
            ? `Maximum of ${MAX_PHOTOS} photos added`
            : `You can add up to ${MAX_PHOTOS} photos`}
        </AppText>
      </View>

      {/* ======================================================
          PHOTO SOURCE MODAL
      ====================================================== */}

      <Modal
        visible={
          pickerVisible
        }
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={
          handleClosePicker
        }
      >
        <View
          style={
            styles.modalRoot
          }
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close photo options"
            onPress={
              handleClosePicker
            }
            style={
              styles.backdrop
            }
          />

          <View
            style={[
              styles.sheet,

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
            <View
              style={
                styles.handle
              }
            />

            {/* ==================================================
                MODAL HEADER
            ================================================== */}

            <View
              style={
                styles.modalHeader
              }
            >
              <View
                style={
                  styles.modalHeaderIcon
                }
              >
                <MaterialCommunityIcons
                  name="image-plus-outline"
                  size={26}
                  color={
                    CustomerColors.primary
                  }
                />
              </View>

              <View
                style={
                  styles.modalHeaderText
                }
              >
                <AppText
                  variant="heading2"
                  weight="bold"
                >
                  Add Photos
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.modalSubtitle
                  }
                >
                  Choose how you want to add a photo.
                </AppText>
              </View>
            </View>

            {/* ==================================================
                CAMERA
            ================================================== */}

            <PhotoSourceOption
              icon="camera"
              title="Take Photo"
              subtitle="Take a new photo with your camera"
              onPress={
                handleTakePhoto
              }
            />

            {/* ==================================================
                GALLERY
            ================================================== */}

            <PhotoSourceOption
              icon="image"
              title="Choose from Gallery"
              subtitle="Select an existing photo from your device"
              onPress={
                handleGallery
              }
            />

            <AppButton
              title="Cancel"
              role="customer"
              variant="outline"
              onPress={
                handleClosePicker
              }
              style={
                styles.cancelButton
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ==============================================================
   PHOTO SOURCE OPTION
============================================================== */

function PhotoSourceOption({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon:
    | "camera"
    | "image";

  title: string;

  subtitle: string;

  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        title
      }
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        styles.option,

        pressed &&
          styles.optionPressed,
      ]}
    >
      <View
        style={
          styles.optionIcon
        }
      >
        <AppIcon
          name={
            icon
          }
          role="customer"
          size="sm"
          state="active"
        />
      </View>

      <View
        style={
          styles.optionContent
        }
      >
        <AppText
          variant="bodyMedium"
          weight="bold"
          numberOfLines={1}
        >
          {title}
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={2}
          style={
            styles.optionSubtitle
          }
        >
          {subtitle}
        </AppText>
      </View>

      <MaterialCommunityIcons
        name="chevron-right"
        size={24}
        color={
          Colors.textSecondary
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
    container: {
      width:
        "100%",
    },

    /* ========================================================
       ADD BUTTON
    ======================================================== */

    addButton: {
      width:
        "100%",

      minHeight:
        62,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        16,

      borderWidth:
        1,

      borderColor:
        "#BFDBFE",

      borderRadius:
        14,

      backgroundColor:
        "#EFF6FF",
    },

    addButtonPressed: {
      borderColor:
        "#93C5FD",

      backgroundColor:
        "#EAF3FF",

      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },

    addButtonText: {
      marginHorizontal:
        8,

      color:
        "#3B82F6",
    },

    addButtonTextDisabled: {
      color:
        "#94A3B8",
    },

    disabled: {
      opacity:
        FixxamTokens.motion.disabledOpacity,
    },

    /* ========================================================
       PHOTO PREVIEWS
    ======================================================== */

    photoList: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        10,

      paddingTop:
        12,

      paddingRight:
        8,
    },

    photoWrapper: {
      width:
        PHOTO_SIZE,

      height:
        PHOTO_SIZE,

      position:
        "relative",

      flexShrink:
        0,

      overflow:
        "hidden",

      borderWidth:
        1,

      borderColor:
        "#DDE5EF",

      borderRadius:
        14,

      backgroundColor:
        "#F8FAFC",
    },

    photo: {
      width:
        "100%",

      height:
        "100%",
    },

    removeButton: {
      position:
        "absolute",

      top:
        6,

      right:
        6,

      width:
        28,

      height:
        28,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        2,

      borderColor:
        "#FFFFFF",

      borderRadius:
        14,

      backgroundColor:
        Colors.error,
    },

    removeButtonPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },

    /* ========================================================
       FOOTER
    ======================================================== */

    footer: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        10,
    },

    footerText: {
      flex:
        1,

      marginLeft:
        6,

      lineHeight:
        18,

      color:
        "#94A3B8",
    },

    /* ========================================================
       MODAL
    ======================================================== */

    modalRoot: {
      flex:
        1,

      justifyContent:
        "flex-end",
    },

    backdrop: {
      ...StyleSheet.absoluteFillObject,

      backgroundColor:
        Colors.overlayMedium,
    },

    sheet: {
      paddingHorizontal:
        20,

      paddingTop:
        10,

      borderTopLeftRadius:
        24,

      borderTopRightRadius:
        24,

      backgroundColor:
        "#FFFFFF",

      ...FixxamTokens.shadow.modal,
    },

    handle: {
      width:
        42,

      height:
        5,

      alignSelf:
        "center",

      marginBottom:
        20,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        "#CBD5E1",
    },

    modalHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        20,
    },

    modalHeaderIcon: {
      width:
        48,

      height:
        48,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        12,

      borderRadius:
        12,

      backgroundColor:
        "#EFF6FF",
    },

    modalHeaderText: {
      flex:
        1,

      minWidth:
        0,
    },

    modalSubtitle: {
      marginTop:
        3,

      color:
        "#64748B",
    },

    /* ========================================================
       SOURCE OPTIONS
    ======================================================== */

    option: {
      minHeight:
        72,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        10,

      padding:
        14,

      borderWidth:
        1,

      borderColor:
        "#DDE5EF",

      borderRadius:
        14,

      backgroundColor:
        "#FFFFFF",
    },

    optionPressed: {
      borderColor:
        "#93C5FD",

      backgroundColor:
        "#EFF6FF",
    },

    optionIcon: {
      width:
        46,

      height:
        46,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        10,

      backgroundColor:
        "#EFF6FF",
    },

    optionContent: {
      flex:
        1,

      minWidth:
        0,

      marginHorizontal:
        12,
    },

    optionSubtitle: {
      marginTop:
        3,

      lineHeight:
        18,

      color:
        "#64748B",
    },

    cancelButton: {
      width:
        "100%",

      marginTop:
        6,
    },
  });

export default memo(
  RequestPhotos,
);