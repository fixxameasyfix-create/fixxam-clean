import React, {
  useCallback,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  Image,
} from "expo-image";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import RoleCard from "@/components/auth/RoleCard";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   SCREEN
============================================================ */

export default function RoleSelection() {
  const {
    height,
  } =
    useWindowDimensions();

  /* ==========================================================
     RESPONSIVE LAYOUT
  ========================================================== */

  const isSmallScreen =
    height < 700;

  const imageHeight =
    isSmallScreen
      ? 160
      : 205;

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const handleCustomerPress =
    useCallback(() => {
      router.push(
        "/(auth)/customer-signup",
      );
    }, []);

  const handleWorkerPress =
    useCallback(() => {
      router.push(
        "/(auth)/worker/worker-signup",
      );
    }, []);

  const handleLoginPress =
    useCallback(() => {
      router.push(
        "/(auth)/login",
      );
    }, []);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen
      scrollEnabled
      contentContainerStyle={[
        styles.screen,

        isSmallScreen
          ? styles.smallScreen
          : null,
      ]}
    >
      {/* ======================================================
          INTRO
      ====================================================== */}

      <View
        style={
          styles.intro
        }
      >
        <AppText
          variant="heading1"
          weight="bold"
          center
          style={
            styles.title
          }
        >
          How will you use Fixxam?
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.subtitle
          }
        >
          Choose the experience that fits you best.
        </AppText>
      </View>

      {/* ======================================================
          IMAGE
      ====================================================== */}

      <Image
        source={require("../../assets/ui-images/role-selection.jpg")}
        contentFit="cover"
        transition={150}
        accessibilityLabel="Fixxam customers and professionals"
        style={[
          styles.image,

          {
            height:
              imageHeight,
          },
        ]}
      />

      {/* ======================================================
          ROLES
      ====================================================== */}

      <View
        style={
          styles.roles
        }
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

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <View
        style={
          styles.footer
        }
      >
        <Pressable
          onPress={
            handleLoginPress
          }
          accessibilityRole="link"
          accessibilityLabel="Sign in to your Fixxam account"
          style={({
            pressed,
          }) => [
            styles.loginRow,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.loginText
            }
          >
            Already have an account?
          </AppText>

          <AppText
            variant="bodyMedium"
            weight="bold"
            style={
              styles.loginLink
            }
          >
            Sign in
          </AppText>
        </Pressable>

        <AppText
          variant="caption"
          tone="secondary"
          center
          style={
            styles.note
          }
        >
          You can change this later in your profile.
        </AppText>
      </View>
    </AppScreen>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       SCREEN
    ======================================================== */

    screen: {
      flexGrow: 1,

      width: "100%",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.xl,

      justifyContent:
        "center",

      backgroundColor:
        Colors.background,
    },

    smallScreen: {
      justifyContent:
        "flex-start",

      paddingTop:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       INTRO
    ======================================================== */

    intro: {
      alignItems:
        "center",

      marginBottom:
        FixxamTokens.spacing.lg,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       IMAGE
    ======================================================== */

    image: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.lg,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    /* ========================================================
       ROLES
    ======================================================== */

    roles: {
      width: "100%",

      gap:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       FOOTER
    ======================================================== */

    footer: {
      marginTop:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",
    },

    loginRow: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loginText: {
      color:
        Colors.textSecondary,
    },

    loginLink: {
      marginLeft:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    note: {
      maxWidth: 300,

      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 16,

      color:
        Colors.textMuted,
    },

    /* ========================================================
       STATES
    ======================================================== */

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },
  });