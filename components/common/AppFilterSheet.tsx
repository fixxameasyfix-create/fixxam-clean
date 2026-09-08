import React, {
  forwardRef,
  memo,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";

import {
  Colors,
  FixxamTokens,
  type FixxamRole,
} from "@/theme";

export interface AppFilterSheetProps {
  children: ReactNode;

  title?: string;

  role?: FixxamRole;

  applyText?: string;

  resetText?: string;

  applying?: boolean;

  applyDisabled?: boolean;

  onApply: () => void;

  onReset?: () => void;

  onClose?: () => void;
}

const AppFilterSheet = forwardRef<
  React.ElementRef<typeof BottomSheet>,
  AppFilterSheetProps
>(
  (
    {
      children,

      title = "Filters",

      role = "customer",

      applyText = "Apply filters",

      resetText = "Reset",

      applying = false,

      applyDisabled = false,

      onApply,

      onReset,

      onClose,
    },
    ref,
  ) => {
    const insets = useSafeAreaInsets();

    const snapPoints = useMemo(
      () => ["72%", "88%"],
      [],
    );

    const renderBackdrop = useCallback(
      (
        props: BottomSheetBackdropProps,
      ) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.32}
          pressBehavior="close"
        />
      ),
      [],
    );

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.background}
        handleIndicatorStyle={styles.handle}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        onClose={onClose}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <AppText
              variant="heading2"
              numberOfLines={1}
            >
              {title}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={styles.subtitle}
            >
              Refine your results
            </AppText>
          </View>

          {onReset ? (
            <AppButton
              title={resetText}
              role={role}
              variant="ghost"
              size="sm"
              disabled={applying}
              onPress={onReset}
            />
          ) : null}
        </View>

        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.content
          }
        >
          {children}
        </BottomSheetScrollView>

        <View
          style={[
            styles.footer,
            {
              paddingBottom: Math.max(
                insets.bottom,
                FixxamTokens.spacing.lg,
              ),
            },
          ]}
        >
          {onReset ? (
            <AppButton
              title={resetText}
              role={role}
              variant="outline"
              disabled={applying}
              onPress={onReset}
              style={styles.secondaryAction}
            />
          ) : null}

          <AppButton
            title={applyText}
            role={role}
            loading={applying}
            disabled={applyDisabled}
            onPress={onApply}
            style={styles.primaryAction}
          />
        </View>
      </BottomSheet>
    );
  },
);

AppFilterSheet.displayName =
  "AppFilterSheet";

const styles = StyleSheet.create({
  background: {
    backgroundColor: Colors.surface,

    borderTopLeftRadius:
      FixxamTokens.radius.bottomSheet,

    borderTopRightRadius:
      FixxamTokens.radius.bottomSheet,
  },

  handle: {
    width: 40,
    height: 4,

    borderRadius:
      FixxamTokens.radius.full,

    backgroundColor:
      Colors.borderStrong,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal:
      FixxamTokens.spacing.xl,

    paddingTop:
      FixxamTokens.spacing.sm,

    paddingBottom:
      FixxamTokens.spacing.md,

    borderBottomWidth:
      StyleSheet.hairlineWidth,

    borderBottomColor:
      Colors.divider,
  },

  headerText: {
    flex: 1,
    minWidth: 0,

    marginRight:
      FixxamTokens.spacing.md,
  },

  subtitle: {
    marginTop:
      FixxamTokens.spacing.xxs,
  },

  content: {
    paddingHorizontal:
      FixxamTokens.spacing.xl,

    paddingTop:
      FixxamTokens.spacing.lg,

    paddingBottom:
      FixxamTokens.spacing.xxl,
  },

  footer: {
    flexDirection: "row",

    gap:
      FixxamTokens.spacing.sm,

    paddingHorizontal:
      FixxamTokens.spacing.xl,

    paddingTop:
      FixxamTokens.spacing.md,

    borderTopWidth:
      StyleSheet.hairlineWidth,

    borderTopColor:
      Colors.divider,

    backgroundColor:
      Colors.surface,
  },

  secondaryAction: {
    flex: 1,
  },

  primaryAction: {
    flex: 1.4,
  },
});

export default memo(AppFilterSheet);