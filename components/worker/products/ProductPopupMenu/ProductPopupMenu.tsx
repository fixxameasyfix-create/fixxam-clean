import React, {
  memo,
  useEffect,
  useRef,
} from "react";

import {
  Animated,
  Modal,
  Pressable,
  View,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import type {
  AppIconName,
} from "@/components/ui/AppIcon";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import styles from "./ProductPopupMenu.styles";

import type {
  ProductPopupMenuProps,
} from "./ProductPopupMenu.types";

/* ============================================================
   TYPES
============================================================ */

type MenuItemProps = {
  icon: AppIconName;

  title: string;

  color: string;

  danger?: boolean;

  onPress: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

export default function ProductPopupMenu({
  visible,
  anchor,
  onClose,
  onEdit,
  onDuplicate,
  onShare,
  onDelete,
}: ProductPopupMenuProps) {
  const opacity =
    useRef(
      new Animated.Value(0),
    ).current;

  const scale =
    useRef(
      new Animated.Value(
        FixxamTokens.motion
          .scalePressed,
      ),
    ).current;

  /* ==========================================================
     ANIMATION
  ========================================================== */

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(
          opacity,
          {
            toValue: 1,

            duration:
              FixxamTokens
                .motion
                .fast,

            useNativeDriver:
              true,
          },
        ),

        Animated.spring(
          scale,
          {
            toValue: 1,

            useNativeDriver:
              true,
          },
        ),
      ]).start();

      return;
    }

    opacity.setValue(0);

    scale.setValue(
      FixxamTokens.motion
        .scalePressed,
    );
  }, [
    opacity,
    scale,
    visible,
  ]);

  /* ==========================================================
     ANCHOR
  ========================================================== */

  if (!anchor) {
    return null;
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <Modal
      visible={
        visible
      }
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={
        onClose
      }
    >
      <Pressable
        style={
          styles.overlay
        }
        onPress={
          onClose
        }
        accessibilityRole="button"
        accessibilityLabel="Close product actions"
      >
        <Animated.View
          style={[
            styles.menu,

            {
              top:
                anchor.y +
                anchor.height +
                6,

              left:
                Math.max(
                  12,
                  anchor.x -
                    160,
                ),

              opacity,

              transform: [
                {
                  scale,
                },
              ],
            },
          ]}
        >
          {/* ==================================================
              EDIT
          ================================================== */}

          <MenuItem
            icon="settings"
            title="Edit Product"
            color={
              WorkerColors.primary
            }
            onPress={
              onEdit
            }
          />

          {/* ==================================================
              DUPLICATE
          ================================================== */}

          <MenuItem
            icon="file"
            title="Duplicate Product"
            color={
              Colors.textSecondary
            }
            onPress={
              onDuplicate
            }
          />

          {/* ==================================================
              SHARE
          ================================================== */}

          <MenuItem
            icon="upload"
            title="Share Product"
            color={
              WorkerColors.primary
            }
            onPress={
              onShare
            }
          />

          <View
            style={
              styles.divider
            }
          />

          {/* ==================================================
              DELETE
          ================================================== */}

          <MenuItem
            icon="delete"
            title="Delete Product"
            color={
              Colors.error
            }
            danger
            onPress={
              onDelete
            }
          />
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

/* ============================================================
   MENU ITEM
============================================================ */

const MenuItem =
  memo(
    function MenuItem({
      icon,
      title,
      color,
      danger = false,
      onPress,
    }: MenuItemProps) {
      return (
        <Pressable
          onPress={
            onPress
          }
          accessibilityRole="button"
          accessibilityLabel={
            title
          }
          android_ripple={{
            color:
              Colors.disabledBackground,
          }}
          style={
            styles.item
          }
        >
          <AppIcon
            name={
              icon
            }
            role={
              danger
                ? undefined
                : "worker"
            }
            size="sm"
            color={
              color
            }
          />

          <AppText
            variant="bodyMedium"
            weight="medium"
            style={[
              styles.itemText,

              danger
                ? styles.deleteText
                : null,
            ]}
          >
            {title}
          </AppText>
        </Pressable>
      );
    },
  );

MenuItem.displayName =
  "ProductPopupMenuItem";