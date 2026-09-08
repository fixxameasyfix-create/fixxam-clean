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

  onAdd: () => void;

  onRemove: (
    index: number,
  ) => void;

  maxImages?: number;
};

/* ============================================================
   COMPONENT
============================================================ */

function WorkerWorkGallery({
  images,
  onAdd,
  onRemove,
  maxImages = 6,
}: Props) {
  const safeMaxImages =
    Number.isFinite(maxImages) &&
    maxImages > 0
      ? Math.floor(maxImages)
      : 6;

  const canAdd =
    images.length <
    safeMaxImages;

  return (
    <View
      style={
        styles.container
      }
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <View
        style={
          styles.header
        }
      >
        <View
          style={
            styles.headerContent
          }
        >
          <AppText
            variant="bodyLarge"
            weight="bold"
            style={
              styles.title
            }
          >
            Your Work Gallery
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.subtitle
            }
          >
            Show customers examples of your work.
          </AppText>
        </View>

        <AppText
          variant="caption"
          weight="bold"
          style={
            styles.count
          }
        >
          {images.length}/{safeMaxImages}
        </AppText>
      </View>

      {/* =====================================================
          GALLERY
      ===================================================== */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.gallery
        }
      >
        {canAdd ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add work photo"
            onPress={
              onAdd
            }
            style={({
              pressed,
            }) => [
              styles.addCard,

              pressed
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

        {images.map(
          (
            uri,
            index,
          ) => (
            <WorkImage
              key={`${uri}-${index}`}
              uri={
                uri
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
      </ScrollView>
    </View>
  );
}

export default memo(
  WorkerWorkGallery,
);

/* ============================================================
   WORK IMAGE
============================================================ */

const WorkImage = memo(
  function WorkImage({
    uri,
    index,
    onRemove,
  }: {
    uri: string;
    index: number;
    onRemove: (
      index: number,
    ) => void;
  }) {
    const handleRemove =
      useCallback(() => {
        onRemove(index);
      }, [
        index,
        onRemove,
      ]);

    return (
      <View
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
          accessibilityLabel={`Work photo ${index + 1}`}
          style={
            styles.image
          }
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove work photo ${index + 1}`}
          hitSlop={8}
          onPress={
            handleRemove
          }
          style={({
            pressed,
          }) => [
            styles.removeButton,

            pressed
              ? styles.pressed
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
  },
);

WorkImage.displayName =
  "WorkerWorkImage";

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      marginTop:
        FixxamTokens.spacing.sm,

      marginHorizontal:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.surface,

      borderRadius:
        FixxamTokens.radius.lg,

      borderWidth: 1,

      borderColor:
        Colors.border,
    },

    header: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.sm,
    },

    headerContent: {
      flex: 1,

      minWidth: 0,
    },

    title: {
      color:
        Colors.textPrimary,

      marginBottom:
        FixxamTokens.spacing.xxs,
    },

    subtitle: {
      color:
        Colors.textSecondary,
    },

    count: {
      flexShrink: 0,

      color:
        Colors.textSecondary,
    },

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

    addCard: {
      width: 105,

      height: 115,

      borderRadius:
        FixxamTokens.radius.md,

      borderWidth: 1.5,

      borderStyle:
        "dashed",

      borderColor:
        WorkerColors.primary,

      backgroundColor:
        WorkerColors.primarySoft,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    addIconContainer: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      marginBottom:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    addText: {
      color:
        WorkerColors.primary,
    },

    imageCard: {
      width: 105,

      height: 115,

      position:
        "relative",

      overflow:
        "hidden",

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

   removeButton: {
  position: "absolute",

  top:
    FixxamTokens.spacing.xs,

  right:
    FixxamTokens.spacing.xs,

  width: 30,

  height: 30,

  borderRadius:
    FixxamTokens.radius.full,

  backgroundColor:
    "rgba(15, 23, 42, 0.72)",

  alignItems:
    "center",

  justifyContent:
    "center",
},

    pressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },
  });