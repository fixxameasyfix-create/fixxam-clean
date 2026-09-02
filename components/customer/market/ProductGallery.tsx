import React, {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  Image,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

type Props = {
  images: string[];
  onIndexChange?: (index: number) => void;
};

type GalleryImageProps = {
  uri: string;
};

const GalleryImage = memo(
  function GalleryImage({
    uri,
  }: GalleryImageProps) {
    const [failed, setFailed] =
      useState(false);

    if (failed) {
      return (
        <View style={styles.imageFallback}>
          <Ionicons
            name="image-outline"
            size={34}
            color="#94A3B8"
          />

          <View style={styles.fallbackText}>
            <View style={styles.fallbackLine} />
            <View style={styles.fallbackShortLine} />
          </View>
        </View>
      );
    }

    return (
      <Image
        source={{ uri }}
        style={styles.image}
        resizeMode="cover"
        onError={() =>
          setFailed(true)
        }
      />
    );
  },
);

export default function ProductGallery({
  images,
  onIndexChange,
}: Props) {
  const { width } =
    useWindowDimensions();

  const validImages =
    useMemo(() => {
      const seen =
        new Set<string>();

      return images.filter(
        (image): image is string => {
          if (
            typeof image !==
              "string" ||
            !image.trim()
          ) {
            return false;
          }

          const uri =
            image.trim();

          if (
            seen.has(uri)
          ) {
            return false;
          }

          seen.add(uri);

          return true;
        },
      );
    }, [images]);

  const [activeIndex, setActiveIndex] =
    useState(0);

  const safeActiveIndex =
    Math.min(
      activeIndex,
      Math.max(
        validImages.length - 1,
        0,
      ),
    );

  const handleScrollEnd =
    useCallback(
      (
        event: NativeSyntheticEvent<NativeScrollEvent>,
      ) => {
        if (
          validImages.length ===
          0
        ) {
          return;
        }

        const offsetX =
          event.nativeEvent
            .contentOffset.x;

        const index = Math.max(
          0,
          Math.min(
            validImages.length - 1,
            Math.round(
              offsetX / width,
            ),
          ),
        );

        setActiveIndex(index);

        onIndexChange?.(
          index,
        );
      },
      [
        validImages.length,
        width,
        onIndexChange,
      ],
    );

  const renderItem =
    useCallback<
      ListRenderItem<string>
    >(
      ({ item }) => (
        <View
          style={[
            styles.slide,
            {
              width,
            },
          ]}
        >
          <GalleryImage uri={item} />
        </View>
      ),
      [width],
    );

  const keyExtractor =
    useCallback(
      (item: string) =>
        item,
      [],
    );

  if (
    validImages.length ===
    0
  ) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={validImages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={
          false
        }
        bounces={
          validImages.length > 1
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
          length: width,
          offset:
            width * index,
          index,
        })}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews
      />

      {validImages.length >
        1 && (
        <View
          style={
            styles.dots
          }
        >
          {validImages.map(
            (image, index) => (
              <View
                key={`${image}-${index}`}
                style={[
                  styles.dot,
                  safeActiveIndex ===
                    index &&
                    styles.activeDot,
                ]}
              />
            ),
          )}
        </View>
      )}
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      width: "100%",
      overflow: "hidden",
    },

    slide: {
      height: 340,
      backgroundColor:
        "#F3F4F6",
    },

    image: {
      width: "100%",
      height: "100%",
      backgroundColor:
        "#F3F4F6",
    },

    imageFallback: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#F1F5F9",
    },

    fallbackText: {
      marginTop: 9,
      alignItems: "center",
    },

    fallbackLine: {
      width: 75,
      height: 5,
      borderRadius: 3,
      backgroundColor:
        "#CBD5E1",
    },

    fallbackShortLine: {
      width: 45,
      height: 4,
      marginTop: 5,
      borderRadius: 3,
      backgroundColor:
        "#E2E8F0",
    },

    dots: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 10,
      marginBottom: 2,
    },

    dot: {
      width: 7,
      height: 7,
      marginHorizontal: 3,
      borderRadius: 4,
      backgroundColor:
        "#D1D5DB",
    },

    activeDot: {
      width: 20,
      backgroundColor:
        "#2563EB",
    },
  });