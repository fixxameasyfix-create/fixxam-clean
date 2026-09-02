import React from "react";

import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import { router } from "expo-router";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import RoleCard from "@/components/auth/RoleCard";

import {
  CustomerColors,
  WorkerColors,
} from "@/theme";

export default function RoleSelection() {
  const { height } =
    useWindowDimensions();

  /*
   * Keep the composition responsive.
   *
   * Small phones:
   *   slightly smaller image/cards
   *
   * Normal/large phones:
   *   more breathing room
   */
  const isSmallScreen =
    height < 700;

  const imageHeight =
    isSmallScreen ? 175 : 205;

  return (
    <AppScreen>
      <View style={styles.container}>      

        {/* ==================================================
            TITLE
        ================================================== */}

        <View style={styles.intro}>
          <AppText
            weight="bold"
            center
            style={styles.title}
          >
            How will you use Fixxam?
          </AppText>

          <AppText
            center
            color={
              CustomerColors.textSecondary
            }
            style={styles.subtitle}
          >
            Choose the experience that fits
            you best.
          </AppText>
        </View>

        {/* ==================================================
            IMAGE
        ================================================== */}

        <Image
          source={require("../../assets/ui-images/role-selection.jpg")}
          resizeMode="cover"
          style={[
            styles.image,
            {
              height: imageHeight,
            },
          ]}
        />

        {/* ==================================================
            ROLES
        ================================================== */}

        <View style={styles.roles}>
          <RoleCard
            title="Join as Customer"
            description="Find trusted professionals and get jobs done with confidence."
            icon="person-circle"
            color={
              CustomerColors.primary
            }
            onPress={() =>
              router.push(
                "/(auth)/customer-signup",
              )
            }
          />

          <View style={styles.cardGap} />

          <RoleCard
            title="Join as Worker"
            description="Offer your skills, reach customers, and grow your work."
            icon="construct"
            color={
              WorkerColors.primary
            }
            onPress={() =>
              router.push(
                "/(auth)/worker/worker-signup",
              )
            }
          />
        </View>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() =>
              router.push(
                "/(auth)/login",
              )
            }
            style={styles.loginRow}
          >
            <AppText
              style={styles.loginText}
            >
              Already have an account?
            </AppText>

            <AppText
              weight="bold"
              style={styles.loginLink}
            >
              Sign in
            </AppText>
          </TouchableOpacity>

          <AppText
            center
            style={styles.note}
          >
            You can change this later in
            your profile.
          </AppText>
        </View>
      </View>
    </AppScreen>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      width: "100%",
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 22,
      backgroundColor: "#F8FAFF",

      /*
       * This is the important change.
       *
       * The whole composition is centered vertically
       * instead of staying near the top.
       */
      justifyContent: "center",
    },

    /* ========================================================
       BRAND
    ======================================================== */

    logoRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },

    logoMark: {
      width: 43,
      height: 43,
      borderRadius: 13,
      backgroundColor: "#2563EB",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 9,
    },

    logoMarkText: {
      color: "#FFFFFF",
      fontSize: 27,
      lineHeight: 31,
    },

    logoText: {
      color: "#0F2A59",
      fontSize: 27,
      letterSpacing: -0.8,
    },

    /* ========================================================
       INTRO
    ======================================================== */

    intro: {
      alignItems: "center",
      marginBottom: 18,
    },

    title: {
      fontSize: 24,
      lineHeight: 30,
      letterSpacing: -0.6,
      color: "#071A41",
    },

    subtitle: {
      marginTop: 6,
      maxWidth: 320,
      fontSize: 14,
      lineHeight: 20,
      color: "#64748B",
    },

    /* ========================================================
       IMAGE
    ======================================================== */

    image: {
      width: "100%",
      borderRadius: 20,
      marginBottom: 16,
      backgroundColor: "#EFF6FF",
    },

    /* ========================================================
       ROLES
    ======================================================== */

    roles: {
      width: "100%",
    },

    cardGap: {
      height: 10,
    },

    /* ========================================================
       FOOTER
    ======================================================== */

    footer: {
      alignItems: "center",
      marginTop: 20,
    },

    loginRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 5,
    },

    loginText: {
      fontSize: 13,
      color: "#64748B",
    },

    loginLink: {
      marginLeft: 5,
      fontSize: 13,
      color: "#F97316",
    },

    note: {
      marginTop: 7,
      fontSize: 10.5,
      lineHeight: 16,
      color: "#94A3B8",
    },
  });