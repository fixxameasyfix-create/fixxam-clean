import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";

import { Pressable, View } from "react-native";

import BottomSheet, {
  BottomSheetView,
} from "@gorhom/bottom-sheet";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

import styles from "./ProductActionSheet.styles";

import {
  ProductActionSheetProps,
  ProductActionSheetRef,
} from "./ProductActionSheet.types";

const ProductActionSheet = forwardRef<
  ProductActionSheetRef,
  ProductActionSheetProps
>(
  (
    {
      onEdit,
      onDuplicate,
      onShare,
      onDelete,
    },
    ref,
  ) => {
    const bottomSheetRef =
      useRef<BottomSheet>(null);

    const snapPoints =
      useMemo(() => ["50%"], []);

    useImperativeHandle(ref, () => ({
      present() {
        bottomSheetRef.current?.snapToIndex(0);
      },

      dismiss() {
        bottomSheetRef.current?.close();
      },
    }));

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
      >
        <BottomSheetView
          style={styles.content}
        >
          <View style={styles.handle} />

          <AppText
            weight="bold"
            style={styles.title}
          >
            Product Actions
          </AppText>

          <Pressable
            style={styles.action}
            onPress={onEdit}
          >
            <Ionicons
              name="create-outline"
              size={22}
              color="#2563EB"
            />

            <AppText
              style={styles.actionText}
            >
              Edit Product
            </AppText>
          </Pressable>

          <Pressable
            style={styles.action}
            onPress={onDuplicate}
          >
            <Ionicons
              name="copy-outline"
              size={22}
              color="#475569"
            />

            <AppText
              style={styles.actionText}
            >
              Duplicate Product
            </AppText>
          </Pressable>

          <Pressable
            style={styles.action}
            onPress={onShare}
          >
            <Ionicons
              name="share-social-outline"
              size={22}
              color="#16A34A"
            />

            <AppText
              style={styles.actionText}
            >
              Share Product
            </AppText>
          </Pressable>

          <Pressable
            style={styles.action}
            onPress={onDelete}
          >
            <Ionicons
              name="trash-outline"
              size={22}
              color="#DC2626"
            />

            <AppText
              style={[
                styles.actionText,
                styles.deleteText,
              ]}
            >
              Delete Product
            </AppText>
          </Pressable>

          <Pressable
            style={styles.cancel}
            onPress={() =>
              bottomSheetRef.current?.close()
            }
          >
            <AppText
              style={styles.cancelText}
            >
              Cancel
            </AppText>
          </Pressable>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

ProductActionSheet.displayName =
  "ProductActionSheet";

export default ProductActionSheet;