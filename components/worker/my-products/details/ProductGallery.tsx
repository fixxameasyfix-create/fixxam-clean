import React, {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  type LayoutChangeEvent,
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
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  images: string[];
};

/* ============================================================
   CONSTANTS
============================================================ */

const IMAGE_HEIGHT = 210;

/* ============================================================
   COMPONENT
============================================================ */

function ProductGallery({
  images,
}: Props) {
  const [
    galleryWidth,
    setGalleryWidth,
  ] =
    useState(0);

  /* ==========================================================
     VALID IMAGES
  ========================================================== */

  const galleryImages =
    useMemo(
      () =>
        Array.from(
          new Set(
            images
              .filter(
                (
                  image,
                ): image is string =>
                  typeof image ===
                  "string",
              )
              .map(image =>
                image.trim(),
              )
              .filter(Boolean),
          ),
        ),
      [
        images,
      ],
    );

  /* ==========================================================
     LAYOUT
  ========================================================== */

  const handleLayout =
    useCallback(
      (
        event: LayoutChangeEvent,
      ) => {
        const width =
          Math.floor(
            event.nativeEvent
              .layout.width,
          );

        if (width <= 0) {
          return;
        }

        setGalleryWidth(
          current =>
            current === width
              ? current
              : width,
        );
      },
      [],
    );

  /* ==========================================================
     EMPTY
  ========================================================== */

  if (
    galleryImages.length ===
    0
  ) {
    return (
      <View
        style={
          styles.empty
        }
        accessibilityRole="image"
        accessibilityLabel="No product image available"
      >
        <View
          style={
            styles.emptyIcon
          }
        >
          <AppIcon
            name="image"
            size="xl"
            color={
              Colors.textMuted
            }
          />
        </View>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.emptyText
          }
        >
          No image available
        </AppText>
      </View>
    );
  }

  /* ==========================================================
     GALLERY
  ========================================================== */

  return (
    <View
      onLayout={
        handleLayout
      }
      style={
        styles.container
      }
    >
      {galleryWidth > 0 ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={
            false
          }
          decelerationRate="fast"
          nestedScrollEnabled
          contentContainerStyle={
            styles.content
          }
        >
          {galleryImages.map(
            (
              image,
              index,
            ) => (
              <Image
                key={`${image}-${index}`}
                source={{
                  uri:
                    image,
                }}
                contentFit="cover"
                transition={150}
                recyclingKey={
                  image
                }
                accessibilityLabel={`Product image ${index + 1} of ${galleryImages.length}`}
                style={[
                  styles.image,

                  {
                    width:
                      galleryWidth,
                  },
                ]}
              />
            ),
          )}
        </ScrollView>
      ) : null}

      {/* ======================================================
          IMAGE COUNT
      ====================================================== */}

      {galleryImages.length >
      1 ? (
        <View
          style={
            styles.countBadge
          }
        >
          <AppIcon
            name="image"
            size="xs"
            color={
              Colors.textInverse
            }
          />

          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.countText
            }
          >
            {galleryImages.length}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

const MemoizedProductGallery =
  memo(
    ProductGallery,
  );

MemoizedProductGallery.displayName =
  "ProductGallery";

export default MemoizedProductGallery;

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      height:
        IMAGE_HEIGHT,

      position:
        "relative",

      overflow:
        "hidden",

      marginBottom:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.disabledBackground,
    },

    content: {
      alignItems:
        "stretch",
    },

    image: {
      height:
        IMAGE_HEIGHT,

      backgroundColor:
        Colors.disabledBackground,
    },

    /* ========================================================
       COUNT
    ======================================================== */

    countBadge: {
      position:
        "absolute",

      right:
        FixxamTokens.spacing.sm,

      bottom:
        FixxamTokens.spacing.sm,

      minHeight: 28,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.overlayStrong,
    },

    countText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    empty: {
      width: "100%",

      height:
        IMAGE_HEIGHT,

      marginBottom:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.disabledBackground,
    },

    emptyIcon: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    emptyText: {
      marginTop:
        FixxamTokens.spacing.sm,

      color:
        Colors.textMuted,
    },
  });