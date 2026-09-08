import React, {
  memo,
  useMemo,
} from "react";

import {
  FlatList,
  type ListRenderItemInfo,
  StyleSheet,
  View,
} from "react-native";

import {
  Image,
} from "expo-image";

import {
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
  photos?: string[];
};

/* ============================================================
   PHOTO ITEM
============================================================ */

const PhotoItem = memo(
  function PhotoItem({
    photo,
    index,
  }: {
    photo: string;
    index: number;
  }) {
    return (
      <Image
        source={{
          uri: photo,
        }}
        style={
          styles.image
        }
        contentFit="cover"
        transition={150}
        recyclingKey={
          photo
        }
        accessibilityLabel={`Booking photo ${index + 1}`}
      />
    );
  },
);

PhotoItem.displayName =
  "WorkerOrderPhotoItem";

/* ============================================================
   COMPONENT
============================================================ */

function WorkerOrderPhotos({
  photos = [],
}: Props) {
  /* ==========================================================
     NORMALIZE PHOTOS
  ========================================================== */

  const validPhotos =
    useMemo(() => {
      return Array.from(
        new Set(
          photos
            .filter(
              (
                photo,
              ): photo is string =>
                typeof photo ===
                "string",
            )
            .map(
              photo =>
                photo.trim(),
            )
            .filter(Boolean),
        ),
      );
    }, [
      photos,
    ]);

  /* ==========================================================
     EMPTY
  ========================================================== */

  if (
    validPhotos.length === 0
  ) {
    return null;
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      style={
        styles.container
      }
    >
      <AppText
        variant="heading3"
        weight="bold"
        style={
          styles.title
        }
      >
        Booking Photos
      </AppText>

      <FlatList
        horizontal
        data={
          validPhotos
        }
        keyExtractor={
          photo =>
            photo
        }
        renderItem={({
          item,
          index,
        }: ListRenderItemInfo<string>) => (
          <PhotoItem
            photo={
              item
            }
            index={
              index
            }
          />
        )}
        showsHorizontalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.photosContent
        }
        ItemSeparatorComponent={
          PhotoSeparator
        }
        initialNumToRender={4}
        maxToRenderPerBatch={6}
        windowSize={5}
      />
    </View>
  );
}

/* ============================================================
   SEPARATOR
============================================================ */

function PhotoSeparator() {
  return (
    <View
      style={
        styles.separator
      }
    />
  );
}

/* ============================================================
   MEMO
============================================================ */

WorkerOrderPhotos.displayName =
  "WorkerOrderPhotos";

export default memo(
  WorkerOrderPhotos,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.lg,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    title: {
      marginBottom:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    photosContent: {
      paddingRight:
        FixxamTokens.spacing.xs,
    },

    separator: {
      width:
        FixxamTokens.spacing.md,
    },

    image: {
      width: 120,

      height: 120,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.disabledBackground,
    },
  });