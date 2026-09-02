import React, {
  useEffect,
  useRef,
} from "react";

import {
  Animated,
  Modal,
  Pressable,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

import styles from "./ProductPopupMenu.styles";
import { ProductPopupMenuProps } from "./ProductPopupMenu.types";

export default function ProductPopupMenu({
  visible,
  anchor,
  onClose,
  onEdit,
  onDuplicate,
  onShare,
  onDelete,
}: ProductPopupMenuProps) {
  const opacity = useRef(
    new Animated.Value(0),
  ).current;

  const scale = useRef(
    new Animated.Value(0.95),
  ).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      opacity.setValue(0);
      scale.setValue(0.95);
    }
  }, [visible]);

  if (!anchor) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.menu,
            {
              top: anchor.y + anchor.height + 6,
              left: Math.max(
                12,
                anchor.x - 160,
              ),
              opacity,
              transform: [{ scale }],
            },
          ]}
        >
          <MenuItem
            icon={
              <Ionicons
                name="create-outline"
                size={20}
                color="#2563EB"
              />
            }
            title="Edit Product"
            onPress={onEdit}
          />

          <MenuItem
            icon={
              <Ionicons
                name="copy-outline"
                size={20}
                color="#64748B"
              />
            }
            title="Duplicate Product"
            onPress={onDuplicate}
          />

          <MenuItem
            icon={
              <Ionicons
                name="share-social-outline"
                size={20}
                color="#16A34A"
              />
            }
            title="Share Product"
            onPress={onShare}
          />

          <View style={styles.divider} />

          <MenuItem
            icon={
              <Ionicons
                name="trash-outline"
                size={20}
                color="#DC2626"
              />
            }
            title="Delete Product"
            danger
            onPress={onDelete}
          />
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

type MenuItemProps = {
  icon: React.ReactNode;
  title: string;
  danger?: boolean;
  onPress: () => void;
};

function MenuItem({
  icon,
  title,
  danger,
  onPress,
}: MenuItemProps) {
  return (
    <Pressable
      style={styles.item}
      android_ripple={{
        color: "#F1F5F9",
      }}
      onPress={onPress}
    >
      {icon}

      <AppText
        style={[
          styles.itemText,
          danger && styles.deleteText,
        ]}
      >
        {title}
      </AppText>
    </Pressable>
  );
}