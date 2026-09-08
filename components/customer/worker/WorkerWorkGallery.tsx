import React, {
  memo,
  useEffect,
  useMemo,
  useState,
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

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  images: string[];

  onAdd: () => void;

  onRemove: (
    index: number,
  ) => void;

  maxImages?: number;
};

type GalleryImageProps = {
  uri: string;

  index: number;

  onRemove: (
    index: number,
  ) => void;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const DEFAULT_MAX_IMAGES =
  6;

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value.trim();
}

function normalizeLimit(
  value: number,
): number {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return DEFAULT_MAX_IMAGES;
  }

  return Math.max(
    1,
    Math.floor(
      value,
    ),
  );
}

/* ==============================================================
   GALLERY IMAGE
============================================================== */

const GalleryImage =
  memo(function GalleryImage({
    uri,
    index,
    onRemove,
  }: GalleryImageProps) {
    const [
      imageFailed,
      setImageFailed,
    ] =
      useState(false);

    const cleanUri =
      cleanString(
        uri,
      );

    useEffect(() => {
      setImageFailed(
        false,
      );
    }, [
      cleanUri,
    ]);

    const showImage =
      Boolean(
        cleanUri,
      ) &&
      !imageFailed;

    return (
      <View
        style={
          styles.imageWrapper
        }
      >
        {showImage ? (
          <Image
            source={{
              uri:
                cleanUri,
            }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={
              FixxamTokens.motion.fast
            }
            style={
              styles.image
            }
            accessibilityLabel={`Work photo ${
              index + 1
            }`}
            onError={() =>
              setImageFailed(
                true,
              )
            }
          />
        ) : (
          <View
            style={
              styles.imageFallback
            }
          >
            <AppIcon
              name="image"
              role="worker"
              size="lg"
              state="muted"
            />
          </View>
        )}

        {/* ====================================================
            REMOVE
        ==================================================== */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove work photo ${
            index + 1
          }`}
          hitSlop={6}
          onPress={() =>
            onRemove(
              index,
            )
          }
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
            role="worker"
            size="xs"
            color={
              Colors.textInverse
            }
          />
        </Pressable>
      </View>
    );
  });

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerWorkGallery({
  images,
  onAdd,
  onRemove,
  maxImages = DEFAULT_MAX_IMAGES,
}: Props) {
  const safeImages =
    Array.isArray(
      images,
    )
      ? images
      : [];

  const safeMaxImages =
    normalizeLimit(
      maxImages,
    );

  const imageCount =
    safeImages.length;

  const canAdd =
    imageCount <
    safeMaxImages;

  const countLabel =
    useMemo(
      () =>
        `${imageCount}/${safeMaxImages}`,
      [
        imageCount,
        safeMaxImages,
      ],
    );

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
            variant="bodyLarge"
            weight="bold"
          >
            Work Gallery
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.subtitle
            }
          >
            Show customers examples
            of your work.
          </AppText>
        </View>

        <View
          style={
            styles.countChip
          }
        >
          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.count
            }
          >
            {countLabel}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          GALLERY
      ====================================================== */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.gallery
        }
      >
        {safeImages.map(
          (
            image,
            index,
          ) => (
            <GalleryImage
              key={`${image}-${index}`}
              uri={
                image
              }
              index={
                index
              }
              onRemove={
                onRemove
              }
            />
          ),
        )}

        {/* ====================================================
            ADD PHOTO
        ==================================================== */}

        {canAdd ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add work photo"
            accessibilityHint={`You can add up to ${safeMaxImages} work photos`}
            onPress={
              onAdd
            }
            style={({
              pressed,
            }) => [
              styles.addButton,

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
                name="add"
                role="worker"
                size="md"
                state="active"
              />
            </View>

            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.addText
              }
            >
              Add Photo
            </AppText>
          </Pressable>
        ) : null}
      </ScrollView>

      {/* ======================================================
          NOTE
      ====================================================== */}

      <View
        style={
          styles.noteRow
        }
      >
        <AppIcon
          name="info"
          role="worker"
          size="xs"
          state="muted"
        />

        <AppText
          variant="caption"
          tone="muted"
          style={
            styles.note
          }
        >
          Optional · You can add up
          to {safeMaxImages} photos.
        </AppText>
      </View>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       CONTAINER
    ======================================================== */

    container: {
      marginHorizontal:
        FixxamTokens.spacing.lg,

      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        FixxamTokens.spacing.md,
    },

    headerText: {
      flex: 1,

      minWidth: 0,

      paddingRight:
        FixxamTokens.spacing.sm,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    countChip: {
      minHeight: 28,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    count: {
      color:
        WorkerColors.primary,
    },

    /* ========================================================
       GALLERY
    ======================================================== */

    gallery: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      paddingRight:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       IMAGE
    ======================================================== */

    imageWrapper: {
      position:
        "relative",

      width: 128,

      height: 72,

      overflow:
        "hidden",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },

    image: {
      width:
        "100%",

      height:
        "100%",
    },

    imageFallback: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.disabledBackground,
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

      width: 28,

      height: 28,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.error,

      ...FixxamTokens.shadow.card,
    },

    removePressed: {
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
       ADD PHOTO
    ======================================================== */

    addButton: {
      width: 128,

      height: 72,

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
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    addIcon: {
      width:
        FixxamTokens.size
          .avatarXs,

      height:
        FixxamTokens.size
          .avatarXs,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom:
        FixxamTokens.spacing.xxs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    addText: {
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

    /* ========================================================
       NOTE
    ======================================================== */

    noteRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.sm,
    },

    note: {
      flex: 1,

      marginLeft:
        FixxamTokens.spacing.xs,
    },
  });

export default memo(
  WorkerWorkGallery,
);