import React, {
  forwardRef,
  useMemo,
} from "react";

import {
  View,
  StyleSheet,
} from "react-native";

import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";

import AppButton from "@/components/ui/AppButton";
import { AppText } from "@/components/ui";

type Props = {
  title?: string;
  children: React.ReactNode;
  onApply: () => void;
  onReset?: () => void;
};

const AppFilterSheet = forwardRef<
  BottomSheet,
  Props
>(
  (
    {
      title = "Filters",
      children,
      onApply,
      onReset,
    },
    ref
  ) => {
    const snapPoints = useMemo(
      () => ["70%"],
      []
    );

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.45}
          />
        )}
        backgroundStyle={styles.background}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.content}
        >
          <AppText
            weight="bold"
            style={styles.title}
          >
            {title}
          </AppText>

          {children}

          <View style={styles.footer}>
            {onReset && (
              <AppButton
                title="Reset"
                variant="customer"
                onPress={onReset}
              />
            )}

            <View style={{ height: 12 }} />

            <AppButton
              title="Apply"
              onPress={onApply}
            />
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    );
  }
);

export default AppFilterSheet;

const styles = StyleSheet.create({
  background: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: "#FFFFFF",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 22,
    color: "#0F172A",
    marginBottom: 20,
  },

  footer: {
    marginTop: 30,
  },
});