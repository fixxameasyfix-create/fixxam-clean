import React, {
  useMemo,
  useState,
} from "react";

import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

import WorkerMarketProductUnavailable from "./WorkerMarketProductUnavailable";

/* ============================================================
   TYPES
============================================================ */

export type WorkerMarketProduct = {
  productId: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
};

type Props = {
  orderId: string;
  products: WorkerMarketProduct[];

  /*
   * Store product IDs only.
   *
   * Example:
   * ["product_123", "product_456"]
   */
  unavailableProducts?: string[];

  disabled?: boolean;
};

/* ============================================================
   HELPERS
============================================================ */

function formatMoney(
  value: number,
): string {
  return `₦${value.toLocaleString(
    "en-NG",
  )}`;
}

/* ============================================================
   COMPONENT
============================================================ */

export default function WorkerMarketProducts({
  orderId,
  products,
  unavailableProducts = [],
  disabled = false,
}: Props) {
  const [
    galleryVisible,
    setGalleryVisible,
  ] = useState(false);

  /* ==========================================================
     PREVIEW
  ========================================================== */

  const previewProducts =
    useMemo(
      () =>
        products.slice(0, 3),
      [products],
    );

  const remainingCount =
    Math.max(
      products.length - 3,
      0,
    );

  /* ==========================================================
     ITEM COUNT
  ========================================================== */

  const itemCount =
    useMemo(
      () =>
        products.reduce(
          (
            total,
            product,
          ) =>
            total +
            Math.max(
              1,
              product.quantity,
            ),
          0,
        ),
      [products],
    );

  /* ==========================================================
     EMPTY
  ========================================================== */

  if (!products.length) {
    return (
      <View
        style={styles.card}
      >
        <AppText
          weight="bold"
          style={styles.title}
        >
          Products
        </AppText>

        <View
          style={styles.empty}
        >
          <Ionicons
            name="cube-outline"
            size={28}
            color="#94A3B8"
          />

          <AppText
            style={styles.emptyText}
          >
            No products available
          </AppText>
        </View>
      </View>
    );
  }

  /* ==========================================================
     MAIN
  ========================================================== */

  return (
    <>
      <View
        style={styles.card}
      >
        {/* HEADER */}

        <View
          style={styles.sectionHeader}
        >
          <View>
            <AppText
              weight="bold"
              style={styles.title}
            >
              Products
            </AppText>

            <AppText
              style={styles.count}
            >
              {itemCount}{" "}
              {itemCount === 1
                ? "item"
                : "items"}
            </AppText>
          </View>

          {products.length > 3 && (
            <Pressable
              onPress={() =>
                setGalleryVisible(
                  true,
                )
              }
              style={({ pressed }) => [
                styles.viewAllButton,
                pressed &&
                  styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="View all products"
            >
              <AppText
                weight="bold"
                style={styles.viewAllText}
              >
                View All
              </AppText>

              <Ionicons
                name="chevron-forward"
                size={14}
                color="#2563EB"
              />
            </Pressable>
          )}
        </View>

        {/* PREVIEW PRODUCTS */}

        {previewProducts.map(
          (
            product,
            index,
          ) => {
            const unavailable =
              unavailableProducts.includes(
                product.productId,
              );

            return (
              <ProductRow
                key={`${product.productId}-${index}`}
                product={product}
                orderId={orderId}
                last={
                  index ===
                  previewProducts.length -
                    1
                }
                unavailable={
                  unavailable
                }
                disabled={
                  disabled
                }
              />
            );
          },
        )}

        {/* MORE */}

        {remainingCount > 0 && (
          <Pressable
            onPress={() =>
              setGalleryVisible(
                true,
              )
            }
            style={({ pressed }) => [
              styles.moreButton,
              pressed &&
                styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`View ${remainingCount} more products`}
          >
            <Ionicons
              name="images-outline"
              size={17}
              color="#2563EB"
            />

            <AppText
              weight="bold"
              style={styles.moreText}
            >
              +{remainingCount} more{" "}
              {remainingCount === 1
                ? "product"
                : "products"}
            </AppText>
          </Pressable>
        )}
      </View>

      {/* ======================================================
          GALLERY
      ====================================================== */}

      <Modal
        visible={galleryVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() =>
          setGalleryVisible(false)
        }
      >
        <View
          style={styles.modal}
        >
          <View
            style={styles.modalHeader}
          >
            <View>
              <AppText
                weight="bold"
                style={styles.modalTitle}
              >
                Order Products
              </AppText>

              <AppText
                style={styles.modalSubtitle}
              >
                {itemCount}{" "}
                {itemCount === 1
                  ? "item"
                  : "items"}
              </AppText>
            </View>

            <Pressable
              onPress={() =>
                setGalleryVisible(false)
              }
              style={
                styles.closeButton
              }
              accessibilityRole="button"
              accessibilityLabel="Close products"
            >
              <Ionicons
                name="close"
                size={22}
                color="#0F172A"
              />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.gallery
            }
          >
            {products.map(
              (
                product,
                index,
              ) => {
                const unavailable =
                  unavailableProducts.includes(
                    product.productId,
                  );

                return (
                  <GalleryProduct
                    key={`${product.productId}-${index}`}
                    product={product}
                    orderId={orderId}
                    unavailable={
                      unavailable
                    }
                    disabled={
                      disabled
                    }
                  />
                );
              },
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

/* ============================================================
   PRODUCT ROW
============================================================ */

function ProductRow({
  product,
  orderId,
  last,
  unavailable,
  disabled,
}: {
  product: WorkerMarketProduct;
  orderId: string;
  last: boolean;
  unavailable: boolean;
  disabled: boolean;
}) {
  const total =
    product.price *
    product.quantity;

  return (
    <View
      style={[
        styles.productContainer,
        !last &&
          styles.productBorder,
      ]}
    >
      <View
        style={styles.productRow}
      >
        {product.image ? (
          <Image
            source={{
              uri: product.image,
            }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View
            style={styles.placeholder}
          >
            <Ionicons
              name="cube-outline"
              size={24}
              color="#94A3B8"
            />
          </View>
        )}

        <View
          style={styles.productInfo}
        >
          <AppText
            weight="bold"
            numberOfLines={2}
            style={styles.productName}
          >
            {product.name}
          </AppText>

          <AppText
            style={styles.productMeta}
          >
            {formatMoney(
              product.price,
            )}{" "}
            × {product.quantity}
          </AppText>
        </View>

        <AppText
          weight="bold"
          style={styles.productTotal}
        >
          {formatMoney(total)}
        </AppText>
      </View>

      <View
        style={styles.unavailableContainer}
      >
        <WorkerMarketProductUnavailable
          orderId={orderId}
          productId={
            product.productId
          }
          productName={product.name}
          disabled={
            disabled ||
            unavailable
          }
        />

        {unavailable && (
          <ReportedBadge />
        )}
      </View>
    </View>
  );
}

/* ============================================================
   GALLERY PRODUCT
============================================================ */

function GalleryProduct({
  product,
  orderId,
  unavailable,
  disabled,
}: {
  product: WorkerMarketProduct;
  orderId: string;
  unavailable: boolean;
  disabled: boolean;
}) {
  return (
    <View
      style={[
        styles.galleryItem,
        unavailable &&
          styles.galleryUnavailable,
      ]}
    >
      <View
        style={styles.galleryTop}
      >
        {product.image ? (
          <Image
            source={{
              uri: product.image,
            }}
            style={styles.galleryImage}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.galleryImage,
              styles.galleryPlaceholder,
            ]}
          >
            <Ionicons
              name="cube-outline"
              size={35}
              color="#94A3B8"
            />
          </View>
        )}

        {unavailable && (
          <View
            style={styles.unavailableOverlay}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color="#FFFFFF"
            />

            <AppText
              weight="bold"
              style={styles.overlayText}
            >
              UNAVAILABLE
            </AppText>
          </View>
        )}
      </View>

      <View
        style={styles.galleryInfo}
      >
        <AppText
          weight="bold"
          numberOfLines={2}
          style={styles.galleryName}
        >
          {product.name}
        </AppText>

        <AppText
          style={styles.galleryQuantity}
        >
          Quantity:{" "}
          {product.quantity}
        </AppText>

        <View
          style={styles.galleryBottom}
        >
          <AppText
            style={
              styles.galleryUnitPrice
            }
          >
            {formatMoney(
              product.price,
            )}{" "}
            each
          </AppText>

          <AppText
            weight="bold"
            style={styles.galleryTotal}
          >
            {formatMoney(
              product.price *
                product.quantity,
            )}
          </AppText>
        </View>

        <View
          style={styles.galleryAction}
        >
          <WorkerMarketProductUnavailable
            orderId={orderId}
            productId={
              product.productId
            }
            productName={product.name}
            disabled={
              disabled ||
              unavailable
            }
          />

          {unavailable && (
            <ReportedBadge />
          )}
        </View>
      </View>
    </View>
  );
}

/* ============================================================
   REPORTED BADGE
============================================================ */

function ReportedBadge() {
  return (
    <View
      style={styles.reportedBadge}
    >
      <Ionicons
        name="checkmark-circle"
        size={13}
        color="#15803D"
      />

      <AppText
        weight="bold"
        style={styles.reportedText}
      >
        Reported unavailable
      </AppText>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    card: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 20,
      padding: 17,
      marginBottom: 12,
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    sectionHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      marginBottom: 10,
    },

    title: {
      fontSize: 16,
      color: "#0F172A",
    },

    count: {
      marginTop: 2,
      fontSize: 9,
      color: "#64748B",
    },

    viewAllButton: {
      minHeight: 34,
      paddingHorizontal: 9,
      borderRadius: 10,
      backgroundColor:
        "#EFF6FF",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 2,
    },

    viewAllText: {
      fontSize: 9,
      color: "#2563EB",
    },

    productContainer: {
      paddingVertical: 2,
    },

    productRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingVertical: 11,
    },

    productBorder: {
      borderBottomWidth: 1,
      borderBottomColor:
        "#E2E8F0",
    },

    productImage: {
      width: 64,
      height: 64,
      borderRadius: 13,
      backgroundColor:
        "#F1F5F9",
    },

    placeholder: {
      width: 64,
      height: 64,
      borderRadius: 13,
      backgroundColor:
        "#F1F5F9",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    productInfo: {
      flex: 1,
      minWidth: 0,
      marginHorizontal: 11,
    },

    productName: {
      fontSize: 12.5,
      lineHeight: 18,
      color: "#0F172A",
    },

    productMeta: {
      marginTop: 5,
      fontSize: 9.5,
      color: "#64748B",
    },

    productTotal: {
      fontSize: 12,
      color: "#0F172A",
    },

    unavailableContainer: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "flex-end",
      gap: 7,
      paddingBottom: 9,
    },

    reportedBadge: {
      minHeight: 34,
      paddingHorizontal: 8,
      borderRadius: 10,
      backgroundColor:
        "#ECFDF5",
      borderWidth: 1,
      borderColor:
        "#BBF7D0",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 4,
    },

    reportedText: {
      fontSize: 8,
      color: "#15803D",
    },

    moreButton: {
      minHeight: 40,
      marginTop: 7,
      borderRadius: 12,
      backgroundColor:
        "#F8FAFC",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 6,
    },

    moreText: {
      fontSize: 10,
      color: "#2563EB",
    },

    empty: {
      minHeight: 100,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    emptyText: {
      marginTop: 7,
      fontSize: 11,
      color: "#94A3B8",
    },

    pressed: {
      opacity: 0.8,
    },

    modal: {
      flex: 1,
      backgroundColor:
        "#F8FAFC",
    },

    modalHeader: {
      minHeight: 70,
      paddingHorizontal: 17,
      backgroundColor:
        "#FFFFFF",
      borderBottomWidth: 1,
      borderBottomColor:
        "#E2E8F0",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    modalTitle: {
      fontSize: 18,
      color: "#0F172A",
    },

    modalSubtitle: {
      marginTop: 2,
      fontSize: 9,
      color: "#64748B",
    },

    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor:
        "#F1F5F9",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    gallery: {
      padding: 14,
      paddingBottom: 35,
    },

    galleryItem: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 18,
      marginBottom: 11,
      padding: 10,
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    galleryUnavailable: {
      borderColor:
        "#FECACA",
    },

    galleryTop: {
      position: "relative",
    },

    galleryImage: {
      width: "100%",
      height: 180,
      borderRadius: 14,
      backgroundColor:
        "#F1F5F9",
    },

    galleryPlaceholder: {
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    unavailableOverlay: {
      position: "absolute",
      left: 8,
      right: 8,
      bottom: 8,
      minHeight: 34,
      borderRadius: 10,
      backgroundColor:
        "rgba(185,28,28,0.92)",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 5,
    },

    overlayText: {
      fontSize: 9,
      color: "#FFFFFF",
    },

    galleryInfo: {
      paddingTop: 2,
    },

    galleryName: {
      marginTop: 8,
      fontSize: 13,
      lineHeight: 18,
      color: "#0F172A",
    },

    galleryQuantity: {
      marginTop: 7,
      fontSize: 10,
      color: "#64748B",
    },

    galleryBottom: {
      marginTop: 7,
      flexDirection:
        "row",
      alignItems:
        "flex-end",
      justifyContent:
        "space-between",
    },

    galleryUnitPrice: {
      fontSize: 9,
      color: "#64748B",
    },

    galleryTotal: {
      fontSize: 13,
      color: "#2563EB",
    },

    galleryAction: {
      marginTop: 10,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "flex-end",
      gap: 7,
    },
  });