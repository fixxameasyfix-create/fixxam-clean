import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  BackHandler,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Stack,
  router,
} from "expo-router";

import {
  AppScreen,
  AppCard,
  AppText,
  AppButton,
} from "@/components/ui";

export default function WorkerSetupComplete() {
  useEffect(() => {
    const backHandler =
      BackHandler.addEventListener(
        "hardwareBackPress",
        () => true
      );

    return () =>
      backHandler.remove();
  }, []);

  const handleContinue = () => {
    router.dismissAll();
    router.replace("/(worker)/(tabs)/home");
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      <AppScreen>
        <View style={styles.container}>
          <AppCard style={styles.card}>
            <Ionicons
              name="checkmark-circle"
              size={70}
              color="#22C55E"
            />

            <AppText
              size="xl"
              weight="bold"
              center
              style={styles.title}
            >
              Setup Complete
            </AppText>

            <AppText
              center
              style={styles.description}
            >
              Your worker profile has been created
              {"\n"}
              successfully.
            </AppText>

            <AppText
              center
              style={styles.subtitle}
            >
              You can now start receiving job requests
              {"\n"}
              from customers.
            </AppText>

            <View
              style={styles.buttonContainer}
            >
              <AppButton
                title="Go to Home"
                variant="worker"
                onPress={handleContinue}
              />
            </View>
          </AppCard>
        </View>
      </AppScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  card: {
    alignItems: "center",

    paddingHorizontal: 18,
    paddingVertical: 24,

    borderRadius: 18,
  },

  title: {
    marginTop: 12,
    marginBottom: 8,

    fontSize: 22,
  },

  description: {
    textAlign: "center",

    fontSize: 14,
    lineHeight: 22,

    color: "#6B7280",

    marginBottom: 8,

    paddingHorizontal: 8,
  },

  subtitle: {
    textAlign: "center",

    fontSize: 13,
    lineHeight: 20,

    color: "#6B7280",

    marginBottom: 20,

    paddingHorizontal: 10,
  },

  buttonContainer: {
    width: "100%",
    marginTop: 4,
  },
});