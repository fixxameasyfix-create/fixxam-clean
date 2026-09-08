import React, {
  forwardRef,
  useCallback,
} from "react";

import {
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "@/components/ui/AppButton";
import AppIcon from "@/components/ui/AppIcon";
import AppText from "@/components/ui/AppText";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
  WorkerColors,
  type FixxamRole,
} from "@/theme";

type SheetTone =
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "error";

export interface AppBottomSheetProps {
  title: string;

  message: string;

  icon?: string;

  role?: FixxamRole;

  tone?: SheetTone;

  buttonText?: string;

  onButtonPress: () => void;

  secondaryButtonText?: string;

  onSecondaryButtonPress?: () => void;

  onClose?: () => void;
}

const legacyIcons: Record<string, string> = {
  "information-circle": "info",
  "information-circle-outline": "info",

  "checkmark-circle": "success",
  "checkmark-circle-outline": "success",

  "alert-circle": "warning",
  "alert-circle-outline": "warning",

  "close-circle": "error",
  "close-circle-outline": "error",
};

const AppBottomSheet = forwardRef<
  React.ElementRef<typeof BottomSheet>,
  AppBottomSheetProps
>(
  (
    {
      title,
      message,

      icon,

      role = "customer",
      tone = "primary",

      buttonText = "Continue",
      onButtonPress,

      secondaryButtonText,
      onSecondaryButtonPress,

      onClose,
    },
    ref,
  ) => {
    const insets = useSafeAreaInsets();

    const { height: screenHeight } =
      useWindowDimensions();

    const roleColors =
      role === "worker"
        ? WorkerColors
        : CustomerColors;

    const tonePalette = {
      primary: {
        color: roleColors.primary,
        background:
          roleColors.primarySoft,
        icon: "info",
      },

      info: {
        color: Colors.info,
        background: Colors.infoSoft,
        icon: "info",
      },

      success: {
        color: Colors.success,
        background:
          Colors.successSoft,
        icon: "success",
      },

      warning: {
        color: Colors.warning,
        background:
          Colors.warningSoft,
        icon: "warning",
      },

      error: {
        color: Colors.error,
        background:
          Colors.errorSoft,
        icon: "error",
      },
    } as const;

    const current =
      tonePalette[tone];

    const resolvedIcon =
      icon
        ? legacyIcons[icon] ?? icon
        : current.icon;

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
        enableDynamicSizing
        enablePanDownToClose
        maxDynamicContentSize={
          screenHeight * 0.82
        }
        backdropComponent={
          renderBackdrop
        }
        backgroundStyle={
          styles.background
        }
        handleIndicatorStyle={
          styles.handle
        }
        onClose={onClose}
      >
        <BottomSheetView
          style={[
            styles.container,
            {
              paddingBottom:
                Math.max(
                  insets.bottom,
                  FixxamTokens.spacing.xl,
                ),
            },
          ]}
        >
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor:
                  current.background,
              },
            ]}
          >
            <AppIcon
              name={resolvedIcon}
              role={role}
              size="lg"
              color={current.color}
              strokeWidth="medium"
            />
          </View>

          <AppText
            variant="heading2"
            center
            style={styles.title}
          >
            {title}
          </AppText>

          <AppText
            variant="bodyLarge"
            tone="secondary"
            center
            style={styles.message}
          >
            {message}
          </AppText>

          <View
            style={styles.actions}
          >
            <AppButton
              title={buttonText}
              role={role}
              variant={
                tone === "error"
                  ? "danger"
                  : "primary"
              }
              onPress={onButtonPress}
              style={styles.button}
            />

            {secondaryButtonText &&
            onSecondaryButtonPress ? (
              <AppButton
                title={
                  secondaryButtonText
                }
                role={role}
                variant="ghost"
                onPress={
                  onSecondaryButtonPress
                }
                style={styles.button}
              />
            ) : null}
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

AppBottomSheet.displayName =
  "AppBottomSheet";

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

  container: {
    width: "100%",

    alignItems: "center",

    paddingHorizontal:
      FixxamTokens.spacing.xxl,

    paddingTop:
      FixxamTokens.spacing.md,
  },

  iconBox: {
    width: 64,
    height: 64,

    alignItems: "center",
    justifyContent: "center",

    borderRadius:
      FixxamTokens.radius.lg,
  },

  title: {
    marginTop:
      FixxamTokens.spacing.lg,

    maxWidth: 360,
  },

  message: {
    marginTop:
      FixxamTokens.spacing.sm,

    maxWidth: 360,
  },

  actions: {
    width: "100%",

    marginTop:
      FixxamTokens.spacing.xxl,

    gap:
      FixxamTokens.spacing.sm,
  },

  button: {
    width: "100%",
  },
});

export default AppBottomSheet;