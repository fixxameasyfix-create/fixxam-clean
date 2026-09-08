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

const PHOTO_WIDTH = 105;
const PHOTO_HEIGHT = 118;

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

  const canAdd =
    !disabled &&
    photos.length <
      MAX_PHOTOS;

  /* ============================================================
     OPEN PICKER
  ============================================================ */

  const handleAddPress =
    useCallback(() => {
      if (!canAdd) {
        return;
      }

      setPickerVisible(
        true,
      );
    }, [
      canAdd,
    ]);

  /* ============================================================
     CLOSE PICKER
  ============================================================ */

  const handleClosePicker =
    useCallback(() => {
      setPickerVisible(
        false,
      );
    }, []);

  /* ============================================================
     CAMERA
  ============================================================ */

  const handleTakePhoto =
    useCallback(() => {
      setPickerVisible(
        false,
      );

      onTakePhoto();
    }, [
      onTakePhoto,
    ]);

  /* ============================================================
     GALLERY
  ============================================================ */

  const handleGallery =
    useCallback(() => {
      setPickerVisible(
        false,
      );

      onAdd();
    }, [
      onAdd,
    ]);

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
          PHOTO ROW
      ====================================================== */}

      <ScrollView
        horizontal
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.grid
        }
      >
        {/* ====================================================
            ADD PHOTO
        ==================================================== */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add photo"
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
            styles.addCard,

            !canAdd
              ? styles.disabledCard
              : null,

            pressed &&
            canAdd
              ? styles.pressed
              : null,
          ]}
        >
          <View
            style={
              styles.addIconContainer
            }
          >
            <AppIcon
              name="camera"
              role="customer"
              size="md"
              state={
                canAdd
                  ? "active"
                  : "muted"
              }
            />
          </View>

          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.addText
            }
          >
            Add photo
          </AppText>

          <AppText
            variant="caption"
            tone="muted"
            style={
              styles.addSubtext
            }
          >
            {photos.length >=
            MAX_PHOTOS
              ? "Limit reached"
              : "Optional"}
          </AppText>
        </Pressable>

        {/* ====================================================
            PHOTOS
        ==================================================== */}

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
                  FixxamTokens
                    .motion.fast
                }
                accessibilityLabel={`Service request photo ${index + 1}`}
              />

              {/* ==============================================
                  NUMBER
              ============================================== */}

              <View
                style={
                  styles.photoNumber
                }
              >
                <AppText
                  variant="caption"
                  weight="bold"
                  style={
                    styles.photoNumberText
                  }
                >
                  {index + 1}
                </AppText>
              </View>

              {/* ==============================================
                  REMOVE
              ============================================== */}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove photo ${index + 1}`}
                accessibilityState={{
                  disabled,
                }}
                disabled={
                  disabled
                }
                hitSlop={6}
                onPress={() =>
                  onRemove(
                    uri,
                  )
                }
                style={({
                  pressed,
                }) => [
                  styles.removeButton,

                  disabled
                    ? styles.removeDisabled
                    : null,

                  pressed &&
                  !disabled
                    ? styles.removeButtonPressed
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
            </View>
          ),
        )}
      </ScrollView>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <View
        style={
          styles.footer
        }
      >
        <View
          style={
            styles.footerIcon
          }
        >
          <AppIcon
            name="professional"
            role="customer"
            size="xs"
            state="active"
          />
        </View>

        <AppText
          variant="caption"
          tone="secondary"
          style={
            styles.hint
          }
        >
          Clear photos help our pros
          understand the job better.
        </AppText>

        <AppText
          variant="caption"
          tone="muted"
          style={
            styles.count
          }
        >
          {photos.length}/
          {MAX_PHOTOS}
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
        animationType="fade"
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
          {/* ==================================================
              BACKDROP
          ================================================== */}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close photo options"
            onPress={
              handleClosePicker
            }
            style={
              styles.modalBackdrop
            }
          />

          {/* ==================================================
              SHEET
          ================================================== */}

          <View
            style={[
              styles.modalCard,

              {
                paddingBottom:
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
            {/* ================================================
                HANDLE
            ================================================ */}

            <View
              style={
                styles.modalHandle
              }
            />

            {/* ================================================
                TITLE
            ================================================ */}

            <AppText
              variant="heading2"
              weight="bold"
            >
              Add a photo
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.modalSubtitle
              }
            >
              Choose how you want to
              add the problem photo.
            </AppText>

            {/* ================================================
                CAMERA
            ================================================ */}

            <PhotoSourceOption
              icon="camera"
              title="Take a Photo"
              subtitle="Use your camera"
              onPress={
                handleTakePhoto
              }
            />

            {/* ================================================
                GALLERY
            ================================================ */}

            <PhotoSourceOption
              icon="image"
              title="Choose from Gallery"
              subtitle="Select an existing photo"
              onPress={
                handleGallery
              }
            />

            {/* ================================================
                CANCEL
            ================================================ */}

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

        pressed
          ? styles.optionPressed
          : null,
      ]}
    >
      <View
        style={
          styles.optionIcon
        }
      >
        <AppIcon
          name={icon}
          role="customer"
          size="md"
          state="active"
        />
      </View>

      <View
        style={
          styles.optionText
        }
      >
        <AppText
          variant="bodyMedium"
          weight="bold"
        >
          {title}
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          style={
            styles.optionSubtitle
          }
        >
          {subtitle}
        </AppText>
      </View>

      <AppIcon
        name="next"
        role="customer"
        size="sm"
        state="muted"
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
      width: "100%",
    },

    /* ========================================================
       PHOTO ROW
    ======================================================== */

    grid: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      paddingRight:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       ADD PHOTO
    ======================================================== */

    addCard: {
      width:
        PHOTO_WIDTH,

      height:
        PHOTO_HEIGHT,

      flexShrink: 0,

      overflow:
        "hidden",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderStyle:
        "dashed",

      borderColor:
        CustomerColors.primaryLight,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    addIconContainer: {
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

      marginBottom:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius
          .iconButton,

      backgroundColor:
        Colors.surface,
    },

    addText: {
      color:
        CustomerColors.primary,
    },

    addSubtext: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    disabledCard: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

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

    /* ========================================================
       PHOTO
    ======================================================== */

    photoWrapper: {
      width:
        PHOTO_WIDTH,

      height:
        PHOTO_HEIGHT,

      position:
        "relative",

      flexShrink: 0,

      borderRadius:
        FixxamTokens.radius.image,

      backgroundColor:
        Colors.disabledBackground,

      ...FixxamTokens.shadow.card,
    },

    photo: {
      width: "100%",

      height: "100%",

      borderRadius:
        FixxamTokens.radius.image,

      backgroundColor:
        Colors.disabledBackground,
    },

    /* ========================================================
       PHOTO NUMBER
    ======================================================== */

    photoNumber: {
      position:
        "absolute",

      left:
        FixxamTokens.spacing.sm,

      bottom:
        FixxamTokens.spacing.sm,

      minWidth: 24,

      height: 24,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.overlayStrong,
    },

    photoNumberText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       REMOVE
    ======================================================== */

    removeButton: {
      position:
        "absolute",

      top: -5,

      right: -5,

      width: 30,

      height: 30,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 2,

      borderColor:
        Colors.surface,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.error,

      ...FixxamTokens.shadow.card,
    },

    removeButtonPressed: {
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

    removeDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
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
        FixxamTokens.spacing.sm,
    },

    footerIcon: {
      width: 28,

      height: 28,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    hint: {
      flex: 1,

      minWidth: 0,
    },

    count: {
      flexShrink: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       MODAL
    ======================================================== */

    modalRoot: {
      flex: 1,

      justifyContent:
        "flex-end",
    },

    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,

      backgroundColor:
        Colors.overlayMedium,
    },

    modalCard: {
      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingTop:
        FixxamTokens.spacing.sm,

      borderTopLeftRadius:
        FixxamTokens.radius.xl,

      borderTopRightRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.modal,
    },

    modalHandle: {
      width: 42,

      height: 5,

      alignSelf:
        "center",

      marginBottom:
        FixxamTokens.spacing.lg,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabled,
    },

    modalSubtitle: {
      marginTop:
        FixxamTokens.spacing.xs,

      marginBottom:
        FixxamTokens.spacing.lg,
    },

    /* ========================================================
       OPTIONS
    ======================================================== */

    option: {
      minHeight:
        FixxamTokens.size
          .cardMinHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.background,
    },

    optionPressed: {
      borderColor:
        CustomerColors.primaryLight,

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

    optionIcon: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius
          .iconButton,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    optionText: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.md,
    },

    optionSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    cancelButton: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xs,
    },
  });

export default memo(
  RequestPhotos,
);