import React, {
  memo,
  type ReactNode,
} from "react";

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import {
  SafeAreaView,
  type Edge,
} from "react-native-safe-area-context";

import {
  CustomerColors,
  FixxamTokens,
  WorkerColors,
  type FixxamRole,
} from "@/theme";

export interface AppScreenProps {
  children: ReactNode;

  role?: FixxamRole;

  style?: StyleProp<ViewStyle>;

  contentContainerStyle?: StyleProp<ViewStyle>;

  /*
   * Standard screens scroll by default.
   * Maps/camera/fixed screens can disable it.
   */
  scrollEnabled?: boolean;

  /*
   * Prevent keyboard from covering forms.
   */
  keyboardAvoiding?: boolean;

  keyboardVerticalOffset?: number;

  /*
   * Safe-area edges can be customized
   * for special screens.
   */
  edges?: Edge[];

  /*
   * Disable standard screen padding
   * for maps, media, etc.
   */
  padded?: boolean;

  /*
   * Explicit background override.
   */
  backgroundColor?: string;
}

function AppScreen({
  children,
  role = "customer",
  style,
  contentContainerStyle,
  scrollEnabled = true,
  keyboardAvoiding = true,
  keyboardVerticalOffset = 0,
  edges = ["top", "left", "right"],
  padded = true,
  backgroundColor,
}: AppScreenProps) {
  const colors =
    role === "worker"
      ? WorkerColors
      : CustomerColors;

  const resolvedBackground =
    backgroundColor ??
    colors.background;

  const contentStyles = [
    styles.content,

    padded
      ? styles.padded
      : null,

    contentContainerStyle,
  ];

  const content = scrollEnabled ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={
        contentStyles
      }
      showsVerticalScrollIndicator={
        false
      }
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={
        Platform.OS === "ios"
          ? "interactive"
          : "on-drag"
      }
      contentInsetAdjustmentBehavior="automatic"
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.flex,
        ...contentStyles,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.safeArea,
        {
          backgroundColor:
            resolvedBackground,
        },
        style,
      ]}
    >
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
          keyboardVerticalOffset={
            keyboardVerticalOffset
          }
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  flex: {
    flex: 1,
  },

  content: {
    flexGrow: 1,

    paddingTop:
      FixxamTokens.spacing.sm,

    paddingBottom:
      FixxamTokens.spacing.lg,
  },

  padded: {
    paddingHorizontal:
      FixxamTokens.spacing.screen,
  },
});

export default memo(AppScreen);