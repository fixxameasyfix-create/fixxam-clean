import React, {
  useMemo,
  useState,
} from "react";

import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

import type {
  ActiveProductDeal,
} from "@/services/deals/getActiveProductDeal";

export interface ProductGridCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  activeDeal?: ActiveProductDeal | null;
  onPress: () => void;
  onBuy: () => void;
}

const MODAL_WIDTH = 190;
const MODAL_HEIGHT = 112;
const SCREEN_PADDING = 8;

export default function ProductGridCard({
  name,
  price,
  image,
  activeDeal,
  onPress,
  onBuy,
}: ProductGridCardProps) {
  const [detailsVisible, setDetailsVisible] =
    useState(false);

  const [modalPosition, setModalPosition] =
    useState({ x: 0, y: 0 });

  const [isFavorite, setIsFavorite] =
    useState(false);

  const [favoriteCount, setFavoriteCount] =
    useState(27);

  const [hasRated, setHasRated] =
    useState(false);

  const [ratingCount, setRatingCount] =
    useState(23);

  const originalPrice = useMemo(
    () => Number(price),
    [price],
  );

  const dealPrice = useMemo(
    () =>
      Number(
        activeDeal?.discountedPrice,
      ),
    [activeDeal],
  );

  const discountPercentage = useMemo(
    () =>
      Number(
        activeDeal?.discountPercentage,
      ),
    [activeDeal],
  );

  const hasDeal = useMemo(() => {
    return (
      !!activeDeal &&
      Number.isFinite(originalPrice) &&
      originalPrice > 0 &&
      Number.isFinite(dealPrice) &&
      dealPrice > 0 &&
      dealPrice < originalPrice &&
      Number.isFinite(discountPercentage) &&
      discountPercentage > 0 &&
      discountPercentage < 100
    );
  }, [
    activeDeal,
    originalPrice,
    dealPrice,
    discountPercentage,
  ]);

  const formattedOriginalPrice = useMemo(
    () =>
      originalPrice.toLocaleString("en-NG"),
    [originalPrice],
  );

  const formattedDealPrice = useMemo(
    () =>
      dealPrice.toLocaleString("en-NG"),
    [dealPrice],
  );

  const hasImage =
    typeof image === "string" &&
    image.trim().length > 0;

  const handleFavorite = () => {
    setIsFavorite((current) => {
      setFavoriteCount((count) =>
        current
          ? Math.max(0, count - 1)
          : count + 1,
      );

      return !current;
    });
  };

  const handleRating = () => {
    setHasRated((current) => {
      setRatingCount((count) =>
        current
          ? Math.max(0, count - 1)
          : count + 1,
      );

      return !current;
    });
  };

  const openFavoriteModal = (
    event: GestureResponderEvent,
  ) => {
    const {
      pageX,
      pageY,
    } = event.nativeEvent;

    const {
      width,
      height,
    } = Dimensions.get("window");

    let x =
      pageX -
      MODAL_WIDTH +
      18;

    let y =
      pageY -
      MODAL_HEIGHT / 2;

    x = Math.max(
      SCREEN_PADDING,
      Math.min(
        x,
        width -
          MODAL_WIDTH -
          SCREEN_PADDING,
      ),
    );

    y = Math.max(
      SCREEN_PADDING,
      Math.min(
        y,
        height -
          MODAL_HEIGHT -
          SCREEN_PADDING,
      ),
    );

    setModalPosition({ x, y });
    setDetailsVisible(true);

    handleFavorite();
  };

  return (
    <View style={styles.card}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.productPressable,
          pressed &&
            styles.productPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`View ${name}`}
      >
        <View
          style={styles.imageContainer}
        >
          {hasImage ? (
            <Image
              source={{
                uri: image.trim(),
              }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View
              style={styles.imagePlaceholder}
            >
              <Ionicons
                name="cube-outline"
                size={28}
                color="#94A3B8"
              />
            </View>
          )}

          {hasDeal && (
            <View
              style={styles.discountBadge}
            >
              <AppText
                weight="bold"
                style={styles.discountText}
              >
                -
                {Math.round(
                  discountPercentage,
                )}
                %
              </AppText>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.favorite,
              isFavorite &&
                styles.favoriteActive,
              pressed &&
                styles.favoritePressed,
            ]}
            onPress={(event) => {
              event.stopPropagation();
              openFavoriteModal(event);
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite
                ? "Remove favorite"
                : "Add favorite"
            }
          >
            <Ionicons
              name={
                isFavorite
                  ? "heart"
                  : "heart-outline"
              }
              size={17}
              color={
                isFavorite
                  ? "#DC2626"
                  : "#64748B"
              }
            />
          </Pressable>
        </View>

        <View style={styles.content}>
          <AppText
            weight="semibold"
            numberOfLines={2}
            style={styles.name}
          >
            {name}
          </AppText>

          <View style={styles.cardRating}>
            <Ionicons
              name="star"
              size={14}
              color="#F59E0B"
            />

            <AppText
              weight="semibold"
              style={styles.rating}
            >
              {ratingCount}
            </AppText>
          </View>

          {hasDeal ? (
            <View
              style={styles.dealPriceRow}
            >
              <AppText
                weight="bold"
                style={styles.dealPrice}
                numberOfLines={1}
              >
                ₦{formattedDealPrice}
              </AppText>

              <AppText
                style={styles.originalPrice}
                numberOfLines={1}
              >
                ₦{formattedOriginalPrice}
              </AppText>
            </View>
          ) : (
            <AppText
              weight="bold"
              style={styles.price}
              numberOfLines={1}
            >
              ₦{formattedOriginalPrice}
            </AppText>
          )}

          <View style={styles.bottomRow}>
            <View style={styles.dealStatus}>
              <Ionicons
                name={
                  hasDeal
                    ? "pricetag"
                    : "pricetag-outline"
                }
                size={12}
                color={
                  hasDeal
                    ? "#2563EB"
                    : "#94A3B8"
                }
              />

              <AppText
                weight="semibold"
                style={[
                  styles.dealStatusText,
                  hasDeal &&
                    styles.dealActiveText,
                ]}
                numberOfLines={1}
              >
                {hasDeal
                  ? "Deal"
                  : "No Deal"}
              </AppText>
            </View>

            <Pressable
              onPress={onBuy}
              style={({ pressed }) => [
                styles.buyButton,
                pressed &&
                  styles.buyPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Buy ${name}`}
              hitSlop={4}
            >
              <AppText
                weight="bold"
                style={styles.buyText}
              >
                Buy
              </AppText>
            </Pressable>
          </View>
        </View>
      </Pressable>

      <Modal
        visible={detailsVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() =>
          setDetailsVisible(false)
        }
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setDetailsVisible(false)
          }
        >
          <View
            style={[
              styles.modalContent,
              {
                left: modalPosition.x,
                top: modalPosition.y,
              },
            ]}
          >
            <Pressable
              style={styles.modalClose}
              onPress={() =>
                setDetailsVisible(false)
              }
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons
                name="close"
                size={17}
                color="#64748B"
              />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionRow,
                pressed &&
                  styles.actionPressed,
              ]}
              onPress={handleFavorite}
              accessibilityRole="button"
            >
              <Ionicons
                name={
                  isFavorite
                    ? "heart"
                    : "heart-outline"
                }
                size={21}
                color={
                  isFavorite
                    ? "#DC2626"
                    : "#64748B"
                }
              />

              <AppText
                weight="semibold"
                style={styles.actionLabel}
              >
                Favor
              </AppText>

              <AppText
                weight="bold"
                style={styles.actionCount}
              >
                {favoriteCount}
              </AppText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionRow,
                pressed &&
                  styles.actionPressed,
              ]}
              onPress={handleRating}
              accessibilityRole="button"
            >
              <Ionicons
                name="star"
                size={21}
                color={
                  hasRated
                    ? "#F59E0B"
                    : "#FFFFFF"
                }
                style={
                  !hasRated &&
                  styles.starOutline
                }
              />

              <AppText
                weight="semibold"
                style={styles.actionLabel}
              >
                Rating
              </AppText>

              <AppText
                weight="bold"
                style={styles.actionCount}
              >
                {ratingCount}
              </AppText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      width: "100%",
      backgroundColor: "#FFFFFF",
      borderRadius: 15,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "#EEF2F7",
      shadowColor: "#000000",
      shadowOpacity: 0.05,
      shadowRadius: 7,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      elevation: 2,
    },

    productPressable: {
      backgroundColor: "#FFFFFF",
    },

    productPressed: {
      opacity: 0.88,
      transform: [{ scale: 0.985 }],
    },

    imageContainer: {
      width: "100%",
      aspectRatio: 1,
      position: "relative",
      backgroundColor: "#F8FAFC",
    },

    image: {
      width: "100%",
      height: "100%",
    },

    imagePlaceholder: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#F8FAFC",
    },

    discountBadge: {
      position: "absolute",
      top: 8,
      left: 8,
      minWidth: 46,
      height: 26,
      paddingHorizontal: 8,
      borderRadius: 8,
      backgroundColor: "#DC2626",
      alignItems: "center",
      justifyContent: "center",
      elevation: 2,
    },

    discountText: {
      fontSize: 10,
      color: "#FFFFFF",
    },

    favorite: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000000",
      shadowOpacity: 0.07,
      shadowRadius: 4,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      elevation: 2,
    },

    favoriteActive: {
      backgroundColor: "#FEF2F2",
    },

    favoritePressed: {
      transform: [{ scale: 0.9 }],
    },

    content: {
      paddingHorizontal: 9,
      paddingTop: 8,
      paddingBottom: 8,
    },

    name: {
      minHeight: 36,
      fontSize: 13,
      lineHeight: 18,
      color: "#0F172A",
    },

    cardRating: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 3,
    },

    rating: {
      marginLeft: 4,
      fontSize: 11,
      color: "#64748B",
    },

    price: {
      marginTop: 5,
      fontSize: 15,
      color: "#2563EB",
    },

    dealPriceRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 5,
      minWidth: 0,
    },

    dealPrice: {
      flexShrink: 1,
      fontSize: 15,
      color: "#2563EB",
      marginRight: 6,
    },

    originalPrice: {
      flexShrink: 1,
      fontSize: 10,
      color: "#94A3B8",
      textDecorationLine: "line-through",
    },

    bottomRow: {
      minHeight: 32,
      marginTop: 6,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    dealStatus: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      marginRight: 5,
      minWidth: 0,
    },

    dealStatusText: {
      marginLeft: 4,
      fontSize: 10,
      color: "#94A3B8",
    },

    dealActiveText: {
      color: "#2563EB",
    },

    buyButton: {
      height: 30,
      minWidth: 52,
      paddingHorizontal: 10,
      borderRadius: 9,
      backgroundColor: "#2563EB",
      alignItems: "center",
      justifyContent: "center",
    },

    buyText: {
      fontSize: 11,
      color: "#FFFFFF",
    },

    buyPressed: {
      opacity: 0.78,
      transform: [{ scale: 0.95 }],
    },

    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(15, 23, 42, 0.12)",
    },

    modalContent: {
      position: "absolute",
      width: MODAL_WIDTH,
      height: MODAL_HEIGHT,
      paddingTop: 8,
      paddingBottom: 7,
      paddingHorizontal: 8,
      borderRadius: 14,
      backgroundColor: "#FFFFFF",
      shadowColor: "#000000",
      shadowOpacity: 0.16,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      elevation: 10,
    },

    modalClose: {
      position: "absolute",
      top: 6,
      right: 6,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: "#F8FAFC",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },

    actionRow: {
      minHeight: 45,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 7,
      paddingRight: 4,
      borderRadius: 10,
      marginVertical: 2,
    },

    actionPressed: {
      backgroundColor: "#F8FAFC",
      transform: [{ scale: 0.98 }],
    },

    actionLabel: {
      flex: 1,
      marginLeft: 10,
      fontSize: 13,
      color: "#334155",
    },

    actionCount: {
      minWidth: 28,
      textAlign: "right",
      fontSize: 14,
      color: "#0F172A",
    },

    starOutline: {
      textShadowColor: "#94A3B8",
      textShadowOffset: {
        width: 0,
        height: 0,
      },
      textShadowRadius: 1.5,
    },
  });