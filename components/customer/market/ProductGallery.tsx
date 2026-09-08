import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  type ListRenderItem,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  View,
  useWindowDimensions,
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
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  images: string[];

  onIndexChange?: (
    index: number,
  ) => void;
};

type GalleryImageProps = {
  uri: string;

  index: number;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanImageUrl(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
}

/* ==============================================================
   GALLERY IMAGE
============================================================== */

const GalleryImage =
  memo(
    function GalleryImage({
      uri,
      index,
    }: GalleryImageProps) {
      const [
        failed,
        setFailed,
      ] =
        useState(false);

      useEffect(() => {
        setFailed(false);
      }, [
        uri,
      ]);

      if (failed) {
        return (
          <View
            style={
              styles.imageFallback
            }
          >
            <View
              style={
                styles.fallbackIcon
              }
            >
              <AppIcon
                name="image"
                role="customer"
                size="xl"
                state="muted"
              />
            </View>

            <AppText
              variant="caption"
              tone="secondary"
              center
              style={
                styles.fallbackText
              }
            >
              Image unavailable
            </AppText>
          </View>
        );
      }

      return (
        <Image
          source={{
            uri,
          }}
          style={
            styles.image
          }
          contentFit="cover"
          cachePolicy="memory-disk"
          accessibilityLabel={`Product image ${
            index + 1
          }`}
          onError={() =>
            setFailed(true)
          }
        />
      );
    },
  );

/* ==============================================================
   COMPONENT
============================================================== */

function ProductGallery({
  images,
  onIndexChange,
}: Props) {
  const {
    width,
  } =
    useWindowDimensions();

  const [
    activeIndex,
    setActiveIndex,
  ] =
    useState(0);

  /* ============================================================
     NORMALIZE IMAGES
  ============================================================ */

  const validImages =
    useMemo(() => {
      const seen =
        new Set<string>();

      return images
        .map(
          cleanImageUrl,
        )
        .filter(
          (uri) => {
            if (
              !uri ||
              seen.has(uri)
            ) {
              return false;
            }

            seen.add(uri);

            return true;
          },
        );
    }, [
      images,
    ]);

  /* ============================================================
     KEEP INDEX VALID
  ============================================================ */

  useEffect(() => {
    if (
      validImages.length ===
      0
    ) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex(
      (previous) =>
        Math.min(
          previous,
          validImages.length -
            1,
        ),
    );
  }, [
    validImages.length,
  ]);

  const safeActiveIndex =
    Math.min(
      activeIndex,
      Math.max(
        validImages.length -
          1,
        0,
      ),
    );

  /* ============================================================
     SCROLL
  ============================================================ */

  const handleScrollEnd =
    useCallback(
      (
        event:
          NativeSyntheticEvent<NativeScrollEvent>,
      ) => {
        if (
          validImages.length ===
            0 ||
          width <= 0
        ) {
          return;
        }

        const offsetX =
          event.nativeEvent
            .contentOffset.x;

        const nextIndex =
          Math.max(
            0,
            Math.min(
              validImages.length -
                1,
              Math.round(
                offsetX / width,
              ),
            ),
          );

        setActiveIndex(
          nextIndex,
        );

        onIndexChange?.(
          nextIndex,
        );
      },
      [
        onIndexChange,
        validImages.length,
        width,
      ],
    );

  /* ============================================================
     RENDER IMAGE
  ============================================================ */

  const renderItem =
    useCallback<
      ListRenderItem<string>
    >(
      ({
        item,
        index,
      }) => (
        <View
          style={[
            styles.slide,
            {
              width,
            },
          ]}
        >
          <GalleryImage
            uri={item}
            index={index}
          />
        </View>
      ),
      [
        width,
      ],
    );

  const keyExtractor =
    useCallback(
      (
        item: string,
      ) => item,
      [],
    );

  /* ============================================================
     EMPTY
  ============================================================ */

  if (
    validImages.length ===
    0
  ) {
    return (
      <View
        style={
          styles.emptyGallery
        }
      >
        <View
          style={
            styles.fallbackIcon
          }
        >
          <AppIcon
            name="image"
            role="customer"
            size="xl"
            state="muted"
          />
        </View>

        <AppText
          variant="caption"
          tone="secondary"
          center
          style={
            styles.fallbackText
          }
        >
          No product images available
        </AppText>
      </View>
    );
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View
      style={
        styles.container
      }
    >
      <FlatList
        data={
          validImages
        }
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={
          false
        }
        bounces={
          validImages.length >
          1
        }
        decelerationRate="fast"
        disableIntervalMomentum
        keyExtractor={
          keyExtractor
        }
        renderItem={
          renderItem
        }
        onMomentumScrollEnd={
          handleScrollEnd
        }
        getItemLayout={(
          _data,
          index,
        ) => ({
          length:
            width,

          offset:
            width *
            index,

          index,
        })}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
      />

      {/* ======================================================
          PAGINATION
      ====================================================== */}

      {validImages.length >
      1 ? (
        <View
          style={
            styles.pagination
          }
        >
          {validImages.map(
            (
              image,
              index,
            ) => (
              <View
                key={
                  image
                }
                style={[
                  styles.dot,

                  safeActiveIndex ===
                  index
                    ? styles.activeDot
                    : null,
                ]}
              />
            ),
          )}
        </View>
      ) : null}
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      overflow:
        "hidden",

      backgroundColor:
        Colors.disabledBackground,
    },

    /* ========================================================
       IMAGE
    ======================================================== */

    slide: {
      height: 340,

      backgroundColor:
        Colors.disabledBackground,
    },

    image: {
      width: "100%",

      height: "100%",

      backgroundColor:
        Colors.disabledBackground,
    },

    /* ========================================================
       FALLBACK
    ======================================================== */

    imageFallback: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.disabledBackground,
    },

    emptyGallery: {
      width: "100%",

      height: 280,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.disabledBackground,
    },

    fallbackIcon: {
      width: 64,

      height: 64,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,
    },

    fallbackText: {
      marginTop:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       PAGINATION
    ======================================================== */

    pagination: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      paddingVertical:
        FixxamTokens.spacing.sm,

      backgroundColor:
        Colors.surface,
    },

    dot: {
      width: 7,

      height: 7,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabled,
    },

    activeDot: {
      width: 22,

      backgroundColor:
        CustomerColors.primary,
    },
  });

export default memo(
  ProductGallery,
);