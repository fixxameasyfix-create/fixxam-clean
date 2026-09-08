import React, {
  useCallback,
  useRef,
  useState,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import FixxamSmartModal from "@/components/customer/home/FixxamSmartModal";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Anchor = {
  x: number;

  y: number;

  width: number;

  height: number;
};

/* ============================================================
   INITIAL STATE
============================================================ */

const INITIAL_ANCHOR: Anchor = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};

/* ============================================================
   COMPONENT
============================================================ */

export default function HomeSearch() {
  const workerButtonRef =
    useRef<View>(null);

  const [
    smartVisible,
    setSmartVisible,
  ] =
    useState(false);

  const [
    anchor,
    setAnchor,
  ] =
    useState<Anchor>(
      INITIAL_ANCHOR,
    );

  /* ==========================================================
     SEARCH
  ========================================================== */

  const handleSearchPress =
    useCallback(() => {
      router.push(
        "/search",
      );
    }, []);

  /* ==========================================================
     FIXXAM SMART
  ========================================================== */

  const openSmartModal =
    useCallback(() => {
      workerButtonRef.current?.measureInWindow(
        (
          x,
          y,
          width,
          height,
        ) => {
          /*
           * Avoid opening against an
           * invalid/unmeasured anchor.
           */
          if (
            width <= 0 ||
            height <= 0
          ) {
            return;
          }

          setAnchor({
            x,
            y,
            width,
            height,
          });

          setSmartVisible(
            true,
          );
        },
      );
    }, []);

  const closeSmartModal =
    useCallback(() => {
      setSmartVisible(
        false,
      );
    }, []);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      <View
        style={
          styles.container
        }
      >
        {/* ==================================================
            SEARCH
        ================================================== */}

        <Pressable
          onPress={
            handleSearchPress
          }
          accessibilityRole="button"
          accessibilityLabel="Search workers or services"
          accessibilityHint="Opens search"
          style={({
            pressed,
          }) => [
            styles.searchBox,

            pressed
              ? styles.searchPressed
              : null,
          ]}
        >
          <AppIcon
            name="search"
            role="customer"
            size="sm"
            state="muted"
            color={
              Colors.textMuted
            }
          />

          <AppText
            variant="body"
            numberOfLines={1}
            style={
              styles.placeholder
            }
          >
            Search workers or services...
          </AppText>
        </Pressable>

        {/* ==================================================
            FIXXAM SMART

            MaterialCommunityIcons intentionally
            preserved for this existing icon.
        ================================================== */}

        <View
          ref={
            workerButtonRef
          }
          collapsable={false}
          style={
            styles.smartAnchor
          }
        >
          <Pressable
            onPress={
              openSmartModal
            }
            accessibilityRole="button"
            accessibilityLabel="Open Fixxam Smart"
            accessibilityHint="Shows information about Fixxam Smart"
            style={({
              pressed,
            }) => [
              styles.workerButton,

              pressed
                ? styles.workerButtonPressed
                : null,
            ]}
          >
            <MaterialCommunityIcons
              name="account-hard-hat-outline"
              size={22}
              color={
                Colors.textInverse
              }
            />
          </Pressable>
        </View>
      </View>

      {/* ====================================================
          FIXXAM SMART MODAL
      ==================================================== */}

      <FixxamSmartModal
        visible={
          smartVisible
        }
        anchor={
          anchor
        }
        onClose={
          closeSmartModal
        }
      />
    </>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CONTAINER
    ======================================================== */

    container: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    /* ========================================================
       SEARCH
    ======================================================== */

    searchBox: {
      flex: 1,

      minWidth: 0,

      height:
        FixxamTokens.size
          .inputHeight,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.search,

      backgroundColor:
        Colors.surface,
    },

    searchPressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      backgroundColor:
        Colors.disabledBackground,
    },

    placeholder: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      color:
        Colors.textMuted,
    },

    /* ========================================================
       FIXXAM SMART
    ======================================================== */

    smartAnchor: {
      marginLeft:
        FixxamTokens.spacing.sm,
    },

    workerButton: {
      width:
        FixxamTokens.size
          .inputHeight,

      height:
        FixxamTokens.size
          .inputHeight,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.search,

      backgroundColor:
        CustomerColors.primary,

      ...FixxamTokens.shadow.card,
    },

    workerButtonPressed: {
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