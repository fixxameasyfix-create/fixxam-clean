import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
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
  CustomerColors,
} from "@/theme";

import type {
  OrderItem,
} from "./marketChatHelpers";

import {
  styles,
} from "./marketChatStyles";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  visible: boolean;

  busy: boolean;

  canCall: boolean;

  deleting: boolean;

  items: OrderItem[];

  onClose: () => void;

  onCall: () => void;

  onDelete: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

function MarketChatMenuComponent({
  visible,
  busy,
  canCall,
  deleting,
  items,
  onClose,
  onCall,
  onDelete,
}: Props) {
  const [
    galleryVisible,
    setGalleryVisible,
  ] =
    useState(false);

  const callDisabled =
    busy ||
    !canCall;

  /* ==========================================================
     GALLERY ITEMS
  ========================================================== */

  const galleryItems =
    useMemo(() => {
      const seen =
        new Set<string>();

      return items.filter(
        (
          item,
        ) => {
          const image =
            typeof item.image ===
            "string"
              ? item.image.trim()
              : "";

          if (
            !image ||
            seen.has(
              image,
            )
          ) {
            return false;
          }

          seen.add(
            image,
          );

          return true;
        },
      );
    }, [
      items,
    ]);

  const galleryDisabled =
    busy ||
    galleryItems.length ===
      0;

  /* ==========================================================
     RESET
  ========================================================== */

  useEffect(() => {
    if (
      !visible
    ) {
      setGalleryVisible(
        false,
      );
    }
  }, [
    visible,
  ]);

  /* ==========================================================
     CLOSE
  ========================================================== */

  const handleClose =
    () => {
      setGalleryVisible(
        false,
      );

      onClose();
    };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <Modal
      visible={
        visible
      }
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={
        galleryVisible
          ? () => {
              setGalleryVisible(
                false,
              );
            }
          : handleClose
      }
    >
      <Pressable
        style={
          styles.menuOverlay
        }
        onPress={
          handleClose
        }
        accessible={false}
      >
        {galleryVisible ? (
          /* ==================================================
             GALLERY
          ================================================== */

          <Pressable
            style={[
              styles.menuCard,
              styles.galleryCard,
            ]}
            onPress={(
              event,
            ) => {
              event.stopPropagation();
            }}
            accessible={false}
          >
            {/* ================================================
                GALLERY HEADER
            ================================================ */}

            <View
              style={
                styles.menuHeader
              }
            >
              <Pressable
                onPress={() => {
                  setGalleryVisible(
                    false,
                  );
                }}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Back to chat options"
                style={
                  styles.menuClose
                }
              >
                <AppIcon
                  name="back"
                  size="sm"
                  color={
                    Colors.textPrimary
                  }
                />
              </Pressable>

              <AppText
                variant="bodyMedium"
                weight="semibold"
                numberOfLines={1}
                style={
                  styles.galleryTitle
                }
              >
                Gallery
              </AppText>

              <Pressable
                onPress={
                  handleClose
                }
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Close gallery"
                style={
                  styles.menuClose
                }
              >
                <AppIcon
                  name="close"
                  size="sm"
                  color={
                    Colors.textPrimary
                  }
                />
              </Pressable>
            </View>

            {/* ================================================
                IMAGES ONLY
            ================================================ */}

            <FlatList
              data={
                galleryItems
              }
              numColumns={
                2
              }
              keyExtractor={(
                item,
              ) =>
                item.id
              }
              renderItem={({
                item,
              }) => (
                <GalleryImage
                  item={
                    item
                  }
                />
              )}
              showsVerticalScrollIndicator={
                false
              }
              initialNumToRender={
                6
              }
              maxToRenderPerBatch={
                8
              }
              windowSize={
                5
              }
              contentContainerStyle={
                styles.galleryContent
              }
              columnWrapperStyle={
                styles.galleryRow
              }
            />
          </Pressable>
        ) : (
          /* ==================================================
             CHAT OPTIONS
          ================================================== */

          <Pressable
            style={
              styles.menuCard
            }
            onPress={(
              event,
            ) => {
              event.stopPropagation();
            }}
            accessible={false}
          >
            {/* ================================================
                HEADER
            ================================================ */}

            <View
              style={
                styles.menuHeader
              }
            >
              <AppText
                variant="bodyMedium"
                weight="semibold"
                style={
                  styles.menuTitle
                }
              >
                Chat options
              </AppText>

              <Pressable
                onPress={
                  handleClose
                }
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Close chat options"
                style={
                  styles.menuClose
                }
              >
                <AppIcon
                  name="close"
                  size="sm"
                  color={
                    Colors.textPrimary
                  }
                />
              </Pressable>
            </View>

            {/* ================================================
                CALL STORE
            ================================================ */}

            <Pressable
              onPress={
                onCall
              }
              disabled={
                callDisabled
              }
              accessibilityRole="button"
              accessibilityLabel="Call store"
              accessibilityHint={
                canCall
                  ? "Call Directly"
                  : "Calling is unavailable"
              }
              accessibilityState={{
                disabled:
                  callDisabled,
              }}
              style={[
                styles.menuItem,

                callDisabled
                  ? styles.menuItemDisabled
                  : null,
              ]}
            >
              <View
                style={[
                  styles.menuIcon,
                  styles.callIcon,
                ]}
              >
                <AppIcon
                  name="phone"
                  size="sm"
                  color={
                    Colors.success
                  }
                />
              </View>

              <View
                style={
                  styles.menuItemInfo
                }
              >
                <AppText
                  variant="bodyMedium"
                  weight="semibold"
                  style={
                    styles.menuItemTitle
                  }
                >
                  Call store
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.menuItemSubtitle
                  }
                >
                  {canCall
                    ? "Start a call"
                    : "Calling is unavailable"}
                </AppText>
              </View>

              <AppIcon
                name="next"
                size="xs"
                color={
                  Colors.textMuted
                }
              />
            </Pressable>

            {/* ================================================
                GALLERY
            ================================================ */}

            <Pressable
              onPress={() => {
                setGalleryVisible(
                  true,
                );
              }}
              disabled={
                galleryDisabled
              }
              accessibilityRole="button"
              accessibilityLabel="Open product gallery"
              accessibilityState={{
                disabled:
                  galleryDisabled,
              }}
              style={[
                styles.menuItem,

                galleryDisabled
                  ? styles.menuItemDisabled
                  : null,
              ]}
            >
              <View
                style={[
                  styles.menuIcon,
                  styles.galleryIcon,
                ]}
              >
                <AppIcon
                  name="image"
                  role="customer"
                  size="sm"
                  color={
                    galleryDisabled
                      ? Colors.textMuted
                      : CustomerColors.primary
                  }
                />
              </View>

              <View
                style={
                  styles.menuItemInfo
                }
              >
                <AppText
                  variant="bodyMedium"
                  weight="semibold"
                  style={
                    styles.menuItemTitle
                  }
                >
                  Gallery
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.menuItemSubtitle
                  }
                >
                  {galleryItems.length >
                  0
                    ? `View ${galleryItems.length} ${
                        galleryItems.length ===
                        1
                          ? "photo"
                          : "photos"
                      }`
                    : "No product photos"}
                </AppText>
              </View>

              <AppIcon
                name="next"
                size="xs"
                color={
                  Colors.textMuted
                }
              />
            </Pressable>

            {/* ================================================
                DELETE MY MESSAGES
            ================================================ */}

            <Pressable
              onPress={
                onDelete
              }
              disabled={
                busy
              }
              accessibilityRole="button"
              accessibilityLabel={
                deleting
                  ? "Deleting your messages"
                  : "Delete my messages"
              }
              accessibilityHint="Deletes only messages that you sent"
              accessibilityState={{
                disabled:
                  busy,

                busy:
                  deleting,
              }}
              style={[
                styles.menuItem,
                styles.deleteMenuItem,

                busy
                  ? styles.menuItemDisabled
                  : null,
              ]}
            >
              <View
                style={[
                  styles.menuIcon,
                  styles.deleteIcon,
                ]}
              >
                {deleting ? (
                  <ActivityIndicator
                    size="small"
                    color={
                      Colors.error
                    }
                  />
                ) : (
                  <AppIcon
                    name="delete"
                    size="sm"
                    color={
                      Colors.error
                    }
                  />
                )}
              </View>

              <View
                style={
                  styles.menuItemInfo
                }
              >
                <AppText
                  variant="bodyMedium"
                  weight="semibold"
                  style={
                    styles.deleteTitle
                  }
                >
                  {deleting
                    ? "Deleting messages..."
                    : "Delete my messages"}
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.menuItemSubtitle
                  }
                >
                  Only messages you sent will be deleted
                </AppText>
              </View>

              <AppIcon
                name="next"
                size="xs"
                color={
                  Colors.textMuted
                }
              />
            </Pressable>
          </Pressable>
        )}
      </Pressable>
    </Modal>
  );
}

/* ============================================================
   GALLERY IMAGE
============================================================ */

const GalleryImage =
  memo(
    function GalleryImage({
      item,
    }: {
      item: OrderItem;
    }) {
      const [
        imageFailed,
        setImageFailed,
      ] =
        useState(false);

      const image =
        typeof item.image ===
          "string"
          ? item.image.trim()
          : "";

      useEffect(() => {
        setImageFailed(
          false,
        );
      }, [
        image,
      ]);

      return (
        <View
          style={
            styles.galleryImageBox
          }
        >
          {image &&
          !imageFailed ? (
            <Image
              source={{
                uri:
                  image,
              }}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={
                150
              }
              accessibilityLabel={`${item.name} product image`}
              onError={() => {
                setImageFailed(
                  true,
                );
              }}
              style={
                styles.galleryImage
              }
            />
          ) : (
            <View
              style={
                styles.galleryImageFallback
              }
            >
              <AppIcon
                name="image"
                size="md"
                color={
                  Colors.textMuted
                }
              />
            </View>
          )}
        </View>
      );
    },
  );

GalleryImage.displayName =
  "GalleryImage";

/* ============================================================
   MEMO
============================================================ */

const MarketChatMenu =
  memo(
    MarketChatMenuComponent,
  );

MarketChatMenu.displayName =
  "MarketChatMenu";

export default MarketChatMenu;