import React, {
  memo,
  useCallback,
} from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  Image,
} from "expo-image";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  images: string[];

  onPickImages: () => void;

  onRemoveImage: (
    uri: string,
  ) => void;
};

/* ============================================================
   CONSTANTS
============================================================ */

const MAX_IMAGES = 5;

const IMAGE_SIZE = 120;

/* ============================================================
   COMPONENT
============================================================ */

function ProductImages({
  images,
  onPickImages,
  onRemoveImage,
}: Props) {
  const imageCount =
    images.length;

  const canAddMore =
    imageCount <
    MAX_IMAGES;

  /* ==========================================================
     REMOVE IMAGE
  ========================================================== */

  const handleRemoveImage =
    useCallback(
      (
        uri: string,
      ) => {
        onRemoveImage(
          uri,
        );
      },
      [
        onRemoveImage,
      ],
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={
          styles.header
        }
      >
        <View
          style={
            styles.headerText
          }
        >
          <AppText
            variant="heading3"
            weight="bold"
            style={
              styles.title
            }
          >
            Product Images
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.subtitle
            }
          >
            Add clear photos of your product.
          </AppText>
        </View>

        <View
          style={
            styles.countBadge
          }
        >
          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.countText
            }
          >
            {imageCount}/{MAX_IMAGES}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          IMAGES
      ====================================================== */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.imagesContent
        }
      >
        {images.map(
          (
            uri,
            index,
          ) => (
            <View
              key={`${uri}-${index}`}
              style={
                styles.imageCard
              }
            >
              <Image
                source={{
                  uri,
                }}
                contentFit="cover"
                transition={150}
                recyclingKey={
                  uri
                }
                accessibilityLabel={`Product image ${index + 1}`}
                style={
                  styles.image
                }
              />

              {/* ==============================================
                  REMOVE
              ============================================== */}

              <Pressable
                onPress={() => {
                  handleRemoveImage(
                    uri,
                  );
                }}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Remove product image ${index + 1}`}
                style={({
                  pressed,
                }) => [
                  styles.removeButton,

                  pressed
                    ? styles.removePressed
                    : null,
                ]}
              >
                <AppIcon
                  name="close"
                  size="xs"
                  color={
                    Colors.error
                  }
                />
              </Pressable>
            </View>
          ),
        )}

        {/* ====================================================
            ADD IMAGE
        ==================================================== */}

        {canAddMore ? (
          <Pressable
            onPress={
              onPickImages
            }
            accessibilityRole="button"
            accessibilityLabel="Add product image"
            accessibilityHint={`You can add up to ${MAX_IMAGES} product images`}
            style={({
              pressed,
            }) => [
              styles.addCard,

              pressed
                ? styles.addPressed
                : null,
            ]}
          >
            <View
              style={
                styles.addIcon
              }
            >
              <AppIcon
                name="camera"
                role="worker"
                size="lg"
                color={
                  WorkerColors.primary
                }
              />
            </View>

            <AppText
              variant="caption"
              weight="bold"
              center
              style={
                styles.addText
              }
            >
              Add Image
            </AppText>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

const MemoizedProductImages =
  memo(
    ProductImages,
  );

MemoizedProductImages.displayName =
  "ProductImages";

export default MemoizedProductImages;

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.xl,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      marginBottom:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,
    },

    headerText: {
      flex: 1,

      minWidth: 0,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },

    countBadge: {
      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    countText: {
      color:
        WorkerColors.primary,
    },

    /* ========================================================
       IMAGE LIST
    ======================================================== */

    imagesContent: {
      paddingRight:
        FixxamTokens.spacing.sm,

      gap:
        FixxamTokens.spacing.md,
    },

    imageCard: {
      width:
        IMAGE_SIZE,

      height:
        IMAGE_SIZE,

      position:
        "relative",

      overflow:
        "hidden",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.disabledBackground,
    },

    image: {
      width: "100%",

      height: "100%",
    },

    /* ========================================================
       REMOVE
    ======================================================== */

    removeButton: {
      position:
        "absolute",

      top:
        FixxamTokens.spacing.xs,

      right:
        FixxamTokens.spacing.xs,

      width: 32,

      height: 32,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    removePressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      backgroundColor:
        Colors.errorSoft,
    },

    /* ========================================================
       ADD IMAGE
    ======================================================== */

    addCard: {
      width:
        IMAGE_SIZE,

      height:
        IMAGE_SIZE,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderStyle:
        "dashed",

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    addIcon: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    addText: {
      marginTop:
        FixxamTokens.spacing.sm,

      color:
        WorkerColors.primary,
    },

    addPressed: {
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
  });