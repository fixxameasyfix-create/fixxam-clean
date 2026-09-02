import React, { ReactNode } from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet,
  ViewStyle,
} from "react-native";

import {
  CustomerColors,
} from "@/theme";

interface AppScreenProps {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  contentContainerStyle?: ViewStyle | ViewStyle[];
  scrollEnabled?: boolean;
}

export default function AppScreen({
  children,
  style,
  contentContainerStyle,
  scrollEnabled = true,
}: AppScreenProps) {
  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          scrollEnabled={scrollEnabled}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            contentContainerStyle,
          ]}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CustomerColors.background,
  },

  flex: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
});