import React, {
  useRef,
  useState,
} from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import FixxamSmartModal from "@/components/customer/home/FixxamSmartModal";

type Anchor = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export default function HomeSearch() {
  const workerButtonRef =
    useRef<View>(null);

  const [smartVisible, setSmartVisible] =
    useState(false);

  const [anchor, setAnchor] =
    useState<Anchor>({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });

  const openSmartModal = () => {
    workerButtonRef.current?.measureInWindow(
      (x, y, width, height) => {
        setAnchor({
          x,
          y,
          width,
          height,
        });

        setSmartVisible(true);
      },
    );
  };

  const closeSmartModal = () => {
    setSmartVisible(false);
  };

  return (
    <>
      <View style={styles.container}>
        {/* ==================================================
            SEARCH
        ================================================== */}

        <Pressable
          style={({ pressed }) => [
            styles.searchBox,
            pressed &&
              styles.searchPressed,
          ]}
          android_ripple={{
            color: "#F1F5F9",
          }}
          onPress={() => {
            router.push("/search");
          }}
          accessibilityRole="button"
          accessibilityLabel="Search workers or services"
        >
          <Ionicons
            name="search-outline"
            size={18}
            color="#94A3B8"
          />

          <Text
            numberOfLines={1}
            style={styles.placeholder}
          >
            Search workers or services...
          </Text>
        </Pressable>

        {/* ==================================================
            FIXxAM SMART / WORKER BUTTON
        ================================================== */}

        <View
          ref={workerButtonRef}
          collapsable={false}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.workerButton}
            onPress={openSmartModal}
            accessibilityRole="button"
            accessibilityLabel="Open Fixxam Smart"
          >
            <MaterialCommunityIcons
              name="account-hard-hat-outline"
              size={21}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ====================================================
          FIXXAM SMART MODAL
      ==================================================== */}

      <FixxamSmartModal
        visible={smartVisible}
        anchor={anchor}
        onClose={closeSmartModal}
      />
    </>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      flexDirection: "row",
      alignItems: "center",

      marginBottom: 7,
    },

    /* ========================================================
       SEARCH
    ======================================================== */

    searchBox: {
      flex: 1,

      height: 38,

      flexDirection: "row",
      alignItems: "center",

      backgroundColor: "#FFFFFF",

      borderRadius: 12,

      paddingHorizontal: 10,

      borderWidth: 1,
      borderColor: "#EEF2F7",

      shadowColor: "#000",
      shadowOpacity: 0.02,
      shadowRadius: 3,
      shadowOffset: {
        width: 0,
        height: 1,
      },

      elevation: 1,
    },

    searchPressed: {
      opacity: 0.8,
    },

    placeholder: {
      flex: 1,

      marginLeft: 7,

      fontSize: 12,
      color: "#94A3B8",
    },

    /* ========================================================
       WORKER / FIXXAM SMART
    ======================================================== */

    workerButton: {
      width: 38,
      height: 38,

      marginLeft: 6,

      borderRadius: 12,

      backgroundColor: "#2563EB",

      alignItems: "center",
      justifyContent: "center",

      elevation: 2,

      shadowColor: "#2563EB",
      shadowOpacity: 0.18,
      shadowRadius: 5,

      shadowOffset: {
        width: 0,
        height: 2,
      },
    },
  });