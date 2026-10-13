import React, { useCallback } from "react";

import {
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import { router } from "expo-router";
import { Image } from "expo-image";

import { AppScreen, AppText } from "@/components/ui";
import RoleCard from "@/components/auth/RoleCard";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

export default function RoleSelection() {
  const { width, height } = useWindowDimensions();

  const isSmallScreen = height < 720;
  const horizontalPadding = Math.max(20, width * 0.04);

  const heroHeight = Math.min(
    Math.max(height * (isSmallScreen ? 0.38 : 0.46), 260),
    440,
  );

  const handleCustomerPress = useCallback(() => {
    router.push("/(auth)/customer-signup");
  }, []);

  const handleWorkerPress = useCallback(() => {
    router.push("/(auth)/worker/worker-signup");
  }, []);

  const handleLoginPress = useCallback(() => {
    router.push("/(auth)/login");
  }, []);

  return (
    <AppScreen
      role="customer"
      padded={false}
      scrollEnabled
      contentContainerStyle={styles.screen}
      backgroundColor="#F1F8FF"
      edges={["top", "left", "right"]}
    >
      {/* Decorative background */}
      <View
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      >
        <View style={styles.topCircleLeft} />
        <View style={styles.topCircleRight} />
        <View style={styles.bottomWaveOne} />
        <View style={styles.bottomWaveTwo} />
      </View>

      {/* Brand and introduction */}
      <View
        style={[
          styles.intro,
          { paddingHorizontal: horizontalPadding },
        ]}
      >
        
          
    

        <AppText
          variant="heading1"
          weight="bold"
          center
          style={styles.title}
        >
          How will you use Fixxam?
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={styles.subtitle}
        >
          Choose the experience that fits you best.
        </AppText>
      </View>

      {/* Customer and worker hero image */}
      <View
        style={[
          styles.hero,
          {
            height: heroHeight,
            marginHorizontal: horizontalPadding * 0.6,
          },
        ]}
      >
        <Image
          source={require("../../assets/ui-images/role-selection.jpg")}
          contentFit="cover"
          contentPosition="center top"
          transition={200}
          cachePolicy="memory-disk"
          accessibilityLabel="A Fixxam customer beside a professional worker"
          style={styles.heroImage}
        />
      </View>

      {/* Role selection cards */}
      <View
        style={[
          styles.roles,
          {
            paddingHorizontal: horizontalPadding,
            marginTop: isSmallScreen ? -18 : -28,
          },
        ]}
      >
        <RoleCard
          title="Join as Customer"
          description="Find trusted professionals and get jobs done with confidence."
          icon="profile"
          color={CustomerColors.primary}
          onPress={handleCustomerPress}
        />

        <RoleCard
          title="Join as Worker"
          description="Offer your skills, reach customers, and grow your work."
          icon="professional"
          color={WorkerColors.primary}
          onPress={handleWorkerPress}
        />
      </View>

      {/* Sign in footer */}
      <View
        style={[
          styles.footer,
          {
            paddingHorizontal: horizontalPadding,
            paddingBottom: isSmallScreen
              ? FixxamTokens.spacing.lg
              : FixxamTokens.spacing.xl,
          },
        ]}
      >
        <Pressable
          onPress={handleLoginPress}
          accessibilityRole="link"
          accessibilityLabel="Sign in to your Fixxam account"
          hitSlop={8}
          style={({ pressed }) => [
            styles.loginRow,
            pressed && styles.pressed,
          ]}
        >
          <AppText
            variant="body"
            tone="secondary"
            style={styles.loginText}
          >
            Already have an account?
          </AppText>

          <AppText
            variant="bodyMedium"
            weight="bold"
            style={styles.loginLink}
          >
            Sign in
          </AppText>
        </Pressable>

        <AppText
          variant="caption"
          tone="secondary"
          center
          style={styles.note}
        >
          You can change this later in your profile.
        </AppText>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    width: "100%",
    paddingTop: FixxamTokens.spacing.md,
    paddingBottom: 0,
    backgroundColor: "#F1F8FF",
  },

  intro: {
    alignItems: "center",
    paddingTop: FixxamTokens.spacing.sm,
    paddingBottom: FixxamTokens.spacing.md,
  },

  logo: {
    color: CustomerColors.primary,
    fontSize: 38,
    lineHeight: 46,
    letterSpacing: -1.5,
    marginBottom: FixxamTokens.spacing.md,
  },

  title: {
    width: "100%",
    color: "#111B35",
    fontSize: 29,
    lineHeight: 36,
    letterSpacing: -0.7,
  },

  subtitle: {
    marginTop: FixxamTokens.spacing.sm,
    lineHeight: 23,
    color: "#64748B",
  },

  hero: {
    width: "auto",
    overflow: "hidden",
    borderRadius: FixxamTokens.radius.xl,
    backgroundColor: "#DCEEFF",
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },

  roles: {
    zIndex: 2,
    gap: FixxamTokens.spacing.md,
  },

  footer: {
    alignItems: "center",
    marginTop: FixxamTokens.spacing.lg,
  },

  loginRow: {
    minHeight: FixxamTokens.size.minimumTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: FixxamTokens.spacing.xs,
  },

  loginText: {
    color: "#64748B",
  },

  loginLink: {
    color: CustomerColors.primary,
  },

  note: {
    marginTop: FixxamTokens.spacing.xs,
    lineHeight: 19,
    color: "#94A3B8",
  },

  pressed: {
    opacity: FixxamTokens.motion.pressedOpacity,
    transform: [
      {
        scale: FixxamTokens.motion.scalePressed,
      },
    ],
  },

  topCircleLeft: {
    position: "absolute",
    top: -105,
    left: -105,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "#D9ECFF",
    opacity: 0.65,
  },

  topCircleRight: {
    position: "absolute",
    top: -120,
    right: -120,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#D7EBFF",
    opacity: 0.65,
  },

  bottomWaveOne: {
    position: "absolute",
    bottom: -175,
    left: -100,
    width: 330,
    height: 260,
    borderRadius: 165,
    backgroundColor: "#D5EAFE",
    transform: [{ rotate: "-18deg" }],
  },

  bottomWaveTwo: {
    position: "absolute",
    bottom: -205,
    right: -120,
    width: 370,
    height: 270,
    borderRadius: 185,
    backgroundColor: "#B8DCFF",
    transform: [{ rotate: "18deg" }],
  },
});