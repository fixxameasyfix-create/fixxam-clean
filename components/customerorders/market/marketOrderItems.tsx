import React, {
  memo,
  useCallback,
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

/* ==============================================================
   TYPES
============================================================== */

export type MarketOrderProduct = {
  productId: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
};

type Props = {
  products: MarketOrderProduct[];
};

/* ==============================================================
   COMPONENT
============================================================== */

function MarketOrderItems({
  products,
}: Props) {
  const [
    galleryVisible,
    setGalleryVisible,
  ] = useState(false);

  const openGallery =
    useCallback(() => {
      if (products.length > 0) {
        setGalleryVisible(true);
      }
    }, [
      products.length,
    ]);

  const closeGallery =
    useCallback(() => {
      setGalleryVisible(false);
    }, []);

  /*
   * IMPORTANT:
   * Main Order Items card shows ONLY the first product.
   * Gallery contains ALL products.
   */
  const firstProduct =
    products[0] ?? null;

  return (
    <>
      <View
        style={
          styles.card
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
              styles.headerTitleBox
            }
          >
            <AppText
              weight="bold"
              style={
                styles.title
              }
            >
              Order Items
            </AppText>

            <AppText
              style={
                styles.count
              }
            >
              {products.length}{" "}
              {products.length ===
              1
                ? "item"
                : "items"}
            </AppText>
          </View>

          {products.length >
          0 ? (
            <Pressable
              onPress={
                openGallery
              }
              accessibilityRole="button"
              accessibilityLabel={`View all ${products.length} order items`}
              style={({ pressed }) => [
                styles.galleryButton,
                pressed &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name="images-outline"
                size={17}
                color="#2563EB"
              />

              <AppText
                weight="bold"
                style={
                  styles.galleryText
                }
              >
                Gallery
              </AppText>
            </Pressable>
          ) : null}
        </View>

        {/* ======================================================
            EMPTY
        ====================================================== */}

        {!firstProduct ? (
          <View
            style={
              styles.empty
            }
          >
            <Ionicons
              name="cube-outline"
              size={25}
              color="#94A3B8"
            />

            <AppText
              style={
                styles.emptyText
              }
            >
              No items found.
            </AppText>
          </View>
        ) : (
          /*
           * ONLY ONE PRODUCT IS SHOWN HERE.
           * Other products are available inside Gallery.
           */
          <ProductRow
            product={
              firstProduct
            }
          />
        )}
      </View>

      {/* ========================================================
          FULL GALLERY
      ======================================================== */}

      <MarketOrderGallery
        visible={
          galleryVisible
        }
        products={
          products
        }
        onClose={
          closeGallery
        }
      />
    </>
  );
}

export default memo(
  MarketOrderItems,
);

/* ==============================================================
   PRODUCT ROW
============================================================== */

const ProductRow = memo(
  ({
    product,
  }: {
    product: MarketOrderProduct;
  }) => {
    const image =
      typeof product.image ===
        "string" &&
      product.image.trim()
        ? product.image.trim()
        : "";

    const price =
      Number.isFinite(
        product.price,
      )
        ? product.price
        : 0;

    const quantity =
      Number.isFinite(
        product.quantity,
      ) &&
      product.quantity > 0
        ? product.quantity
        : 1;

    const itemTotal =
      price * quantity;

    return (
      <View
        style={
          styles.productRow
        }
      >
        {/* IMAGE */}

        <View
          style={
            styles.productImageBox
          }
        >
          {image ? (
            <Image
              source={{
                uri: image,
              }}
              style={
                styles.productImage
              }
            />
          ) : (
            <Ionicons
              name="cube-outline"
              size={24}
              color="#94A3B8"
            />
          )}
        </View>

        {/* INFO */}

        <View
          style={
            styles.productInfo
          }
        >
          <AppText
            weight="bold"
            numberOfLines={2}
            style={
              styles.productName
            }
          >
            {product.name ||
              "Product"}
          </AppText>

          <AppText
            style={
              styles.quantity
            }
          >
            {quantity} × ₦
            {price.toLocaleString(
              "en-NG",
            )}
          </AppText>
        </View>

        {/* TOTAL */}

        <AppText
          weight="bold"
          style={
            styles.productTotal
          }
        >
          ₦
          {itemTotal.toLocaleString(
            "en-NG",
          )}
        </AppText>
      </View>
    );
  },
);

ProductRow.displayName =
  "ProductRow";

/* ==============================================================
   GALLERY MODAL
============================================================== */

function MarketOrderGallery({
  visible,
  products,
  onClose,
}: {
  visible: boolean;
  products: MarketOrderProduct[];
  onClose: () => void;
}) {
  return (
    <Modal
      visible={
        visible
      }
      transparent
      animationType="slide"
      onRequestClose={
        onClose
      }
    >
      <View
        style={
          styles.modalOverlay
        }
      >
        <View
          style={
            styles.modal
          }
        >
          {/* ==================================================
              HEADER
          ================================================== */}

          <View
            style={
              styles.modalHeader
            }
          >
            <View>
              <AppText
                weight="bold"
                style={
                  styles.modalTitle
                }
              >
                Order Gallery
              </AppText>

              <AppText
                style={
                  styles.modalSubtitle
                }
              >
                {products.length}{" "}
                {products.length ===
                1
                  ? "item"
                  : "items"}
              </AppText>
            </View>

            <Pressable
              onPress={
                onClose
              }
              accessibilityRole="button"
              accessibilityLabel="Close order gallery"
              style={({ pressed }) => [
                styles.closeButton,
                pressed &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name="close"
                size={20}
                color="#0F172A"
              />
            </Pressable>
          </View>

          {/* ==================================================
              ALL PRODUCTS
          ================================================== */}

          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.galleryContent
            }
          >
            <View
              style={
                styles.galleryGrid
              }
            >
              {products.map(
                (
                  product,
                  index,
                ) => (
                  <GalleryItem
                    key={`${product.productId}-${index}`}
                    product={
                      product
                    }
                  />
                ),
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ==============================================================
   GALLERY ITEM
============================================================== */

const GalleryItem = memo(
  ({
    product,
  }: {
    product: MarketOrderProduct;
  }) => {
    const image =
      typeof product.image ===
        "string" &&
      product.image.trim()
        ? product.image.trim()
        : "";

    const price =
      Number.isFinite(
        product.price,
      )
        ? product.price
        : 0;

    const quantity =
      Number.isFinite(
        product.quantity,
      ) &&
      product.quantity > 0
        ? product.quantity
        : 1;

    return (
      <View
        style={
          styles.galleryItem
        }
      >
        {/* IMAGE */}

        <View
          style={
            styles.galleryImageBox
          }
        >
          {image ? (
            <Image
              source={{
                uri: image,
              }}
              style={
                styles.galleryImage
              }
            />
          ) : (
            <Ionicons
              name="cube-outline"
              size={30}
              color="#94A3B8"
            />
          )}
        </View>

        {/* NAME */}

        <AppText
          weight="bold"
          numberOfLines={2}
          style={
            styles.galleryName
          }
        >
          {product.name ||
            "Product"}
        </AppText>

        {/* QUANTITY */}

        <AppText
          style={
            styles.galleryQuantity
          }
        >
          Qty:{" "}
          {quantity}
        </AppText>

        {/* PRICE */}

        <AppText
          weight="bold"
          style={
            styles.galleryPrice
          }
        >
          ₦
          {price.toLocaleString(
            "en-NG",
          )}
        </AppText>
      </View>
    );
  },
);

GalleryItem.displayName =
  "GalleryItem";

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      marginTop: 10,
      padding: 14,
      borderRadius: 18,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
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
    },

    headerTitleBox: {
      flex: 1,
      minWidth: 0,
    },

    title: {
      fontSize: 14,
      color: "#0F172A",
    },

    count: {
      marginTop: 2,
      fontSize: 8.5,
      color: "#64748B",
    },

    galleryButton: {
      minHeight: 36,
      paddingHorizontal: 11,
      borderRadius: 11,
      backgroundColor:
        "#EFF6FF",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 6,
    },

    galleryText: {
      fontSize: 9,
      color: "#2563EB",
    },

    pressed: {
      opacity: 0.7,
      transform: [
        {
          scale: 0.97,
        },
      ],
    },

    /* ========================================================
       PRODUCT
    ======================================================== */

    productRow: {
      marginTop: 8,
      paddingTop: 8,
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    productImageBox: {
      width: 72,
      height: 72,
      borderRadius: 15,
      backgroundColor:
        "#F8FAFC",
      overflow: "hidden",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    productImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },

    productInfo: {
      flex: 1,
      minWidth: 0,
      marginLeft: 12,
      marginRight: 8,
    },

    productName: {
      fontSize: 11,
      lineHeight: 15,
      color: "#0F172A",
    },

    quantity: {
      marginTop: 5,
      fontSize: 8.5,
      color: "#64748B",
    },

    productTotal: {
      fontSize: 10.5,
      color: "#0F172A",
    },

    empty: {
      minHeight: 100,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    emptyText: {
      marginTop: 6,
      fontSize: 9,
      color: "#64748B",
    },

    /* ========================================================
       MODAL
    ======================================================== */

    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(15,23,42,0.45)",
      justifyContent:
        "flex-end",
    },

    modal: {
      maxHeight: "88%",
      minHeight: "45%",
      backgroundColor:
        "#F8FAFC",
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 8,
    },

    modalHeader: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      backgroundColor:
        "#FFFFFF",
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderBottomWidth: 1,
      borderBottomColor:
        "#E2E8F0",
    },

    modalTitle: {
      fontSize: 16,
      color: "#0F172A",
    },

    modalSubtitle: {
      marginTop: 2,
      fontSize: 8.5,
      color: "#64748B",
    },

    closeButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor:
        "#F1F5F9",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    galleryContent: {
      padding: 14,
      paddingBottom: 30,
    },

    galleryGrid: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      justifyContent:
        "space-between",
      gap: 10,
    },

    galleryItem: {
      width: "48.5%",
      padding: 8,
      borderRadius: 14,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    galleryImageBox: {
      width: "100%",
      aspectRatio: 1,
      borderRadius: 10,
      backgroundColor:
        "#F8FAFC",
      overflow: "hidden",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    galleryImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },

    galleryName: {
      marginTop: 7,
      fontSize: 9.5,
      lineHeight: 13,
      color: "#0F172A",
    },

    galleryQuantity: {
      marginTop: 3,
      fontSize: 8,
      color: "#64748B",
    },

    galleryPrice: {
      marginTop: 4,
      fontSize: 9,
      color: "#2563EB",
    },
  });