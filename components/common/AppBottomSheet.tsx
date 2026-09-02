import React, {
  forwardRef,
  useMemo,
} from "react";

import {
  View,
  StyleSheet,
} from "react-native";

import BottomSheet, {
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";

import Ionicons from "@expo/vector-icons/Ionicons";

import AppButton from "@/components/ui/AppButton";
import { AppText } from "@/components/ui";

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;

  buttonText?: string;

  onButtonPress: () => void;
};

const AppBottomSheet = forwardRef<
  BottomSheet,
  Props
>(
  (
    {
      icon = "information-circle",

      title,

      message,

      buttonText = "OK",

      onButtonPress,
    },

    ref
  ) => {
    const snapPoints = useMemo(
      () => ["38%"],
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
        backgroundStyle={
          styles.background
        }
        handleIndicatorStyle={
          styles.handle
        }
      >
        <View style={styles.container}>
          <Ionicons
            name={icon}
            size={62}
            color="#2563EB"
          />

          <AppText
            weight="bold"
            style={styles.title}
          >
            {title}
          </AppText>

          <AppText
            style={styles.message}
          >
            {message}
          </AppText>

          <AppButton
            title={buttonText}
            onPress={onButtonPress}
          />
        </View>
      </BottomSheet>
    );
  }
);

export default AppBottomSheet;

const styles = StyleSheet.create({
  background: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  handle: {
    backgroundColor: "#CBD5E1",
    width: 70,
  },

  container: {
    flex: 1,

    paddingHorizontal: 24,

    alignItems: "center",

    justifyContent: "center",
  },

  title: {
    marginTop: 18,

    fontSize: 22,

    color: "#0F172A",
  },

  message: {
    marginTop: 10,

    marginBottom: 30,

    textAlign: "center",

    fontSize: 15,

    color: "#64748B",

    lineHeight: 22,
  },
});