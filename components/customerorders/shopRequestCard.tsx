import { Ionicons } from "@expo/vector-icons";

import React, {
  memo,
  useMemo,
} from "react";

import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import type {
  FirebaseShopRequest,
  FirebaseShopRequestStatus,
} from "@/types/firebaseShopRequest";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";


/* ==============================================================
   TYPES
============================================================== */

type Props = {
  request: FirebaseShopRequest;
  onPress?: () => void;
};


type StatusConfig = {
  label: string;
  backgroundColor: string;
  color: string;
};


/* ==============================================================
   HELPERS
============================================================== */

/**
 * Format the request creation time.
 *
 * Examples:
 *
 * Just now
 * 5 mins ago
 * 2 hrs ago
 * 3 days ago
 * 24 Sep
 */
function formatCreatedAt(
  request: FirebaseShopRequest,
): string {
  if (!request.createdAt) {
    return "Just now";
  }

  try {
    const createdAt =
      request.createdAt.toDate();

    const differenceMs =
      Math.max(
        0,
        Date.now() -
          createdAt.getTime(),
      );

    const minutes =
      Math.floor(
        differenceMs / 60_000,
      );


    /* ----------------------------------------------------------
       JUST NOW
    ---------------------------------------------------------- */

    if (minutes < 1) {
      return "Just now";
    }


    /* ----------------------------------------------------------
       MINUTES
    ---------------------------------------------------------- */

    if (minutes < 60) {
      return `${minutes} min${
        minutes === 1
          ? ""
          : "s"
      } ago`;
    }


    /* ----------------------------------------------------------
       HOURS
    ---------------------------------------------------------- */

    const hours =
      Math.floor(
        minutes / 60,
      );

    if (hours < 24) {
      return `${hours} hr${
        hours === 1
          ? ""
          : "s"
      } ago`;
    }


    /* ----------------------------------------------------------
       DAYS
    ---------------------------------------------------------- */

    const days =
      Math.floor(
        hours / 24,
      );

    if (days < 7) {
      return `${days} day${
        days === 1
          ? ""
          : "s"
      } ago`;
    }


    /* ----------------------------------------------------------
       OLDER
    ---------------------------------------------------------- */

    return createdAt.toLocaleDateString(
      "en-NG",
      {
        day: "numeric",
        month: "short",
      },
    );
  } catch {
    return "Recently";
  }
}


/* ==============================================================
   STATUS CONFIG
============================================================== */

function getStatusConfig(
  status: FirebaseShopRequestStatus,
): StatusConfig {
  switch (status) {

    case "accepted":
      return {
        label: "Accepted",

        backgroundColor:
          "#DBEAFE",

        color:
          CustomerColors.primary,
      };


    case "completed":
      return {
        label: "Completed",

        backgroundColor:
          "#DCFCE7",

        color:
          "#15803D",
      };


    case "declined":
      return {
        label: "Declined",

        backgroundColor:
          "#FEE2E2",

        color:
          "#DC2626",
      };


    case "cancelled":
      return {
        label: "Cancelled",

        backgroundColor:
          Colors.background,

        color:
          Colors.textSecondary,
      };


    case "pending":

    default:
      return {
        label: "Pending",

        backgroundColor:
          "#FEF3C7",

        color:
          "#B45309",
      };
  }
}


/* ==============================================================
   PHOTO URL HELPER
============================================================== */

function getValidPhotoUrl(
  value: unknown,
): string | null {

  if (
    typeof value !==
    "string"
  ) {
    return null;
  }


  const url =
    value.trim();


  if (!url) {
    return null;
  }


  /*
   * Only accept HTTP/HTTPS URLs.
   */
  if (
    !/^https?:\/\//i.test(
      url,
    )
  ) {
    return null;
  }


  return url;
}


/* ==============================================================
   COMPONENT
============================================================== */

function ShopRequestCardComponent({
  request,
  onPress,
}: Props) {

  /* ==========================================================
     STATUS
  ========================================================== */

  const status =
    useMemo(
      () =>
        getStatusConfig(
          request.status,
        ),
      [
        request.status,
      ],
    );


  /* ==========================================================
     SHOP PHOTO
  ========================================================== */

  const shopPhoto =
    useMemo(
      () =>
        getValidPhotoUrl(
          request.shopPhotoUrl,
        ),
      [
        request.shopPhotoUrl,
      ],
    );


  /* ==========================================================
     SHOP LOGO
  ========================================================== */

  const shopLogo =
    useMemo(
      () =>
        getValidPhotoUrl(
          request.shopLogoUrl,
        ),
      [
        request.shopLogoUrl,
      ],
    );


  /* ==========================================================
     FINAL SHOP IMAGE
     
     Priority:
     
     1. Shop photo
     2. Shop logo
     3. Store icon
  ========================================================== */

  const displayShopPhoto =
    shopPhoto ||
    shopLogo;


  /* ==========================================================
     SHOP NAME
  ========================================================== */

  const shopName =
    useMemo(
      () =>
        request.shopName?.trim() ||
        "Service Shop",
      [
        request.shopName,
      ],
    );


  /* ==========================================================
     CREATED TIME
  ========================================================== */

  const createdAt =
    useMemo(
      () =>
        formatCreatedAt(
          request,
        ),
      [
        request.createdAt,
      ],
    );


  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <Pressable
      accessibilityRole={
        onPress
          ? "button"
          : undefined
      }

      accessibilityLabel={
        onPress
          ? `View ${shopName} shop request`
          : undefined
      }

      accessibilityHint={
        onPress
          ? "Opens your shop request details"
          : undefined
      }

      disabled={!onPress}

      onPress={onPress}

      style={({
        pressed,
      }) => [
        styles.card,

        pressed && onPress
          ? styles.pressed
          : null,
      ]}
    >

      <View
        style={
          styles.content
        }
      >

        {/* ====================================================
            SHOP PHOTO
        ==================================================== */}

        <View
          style={
            styles.shopPhotoContainer
          }
        >

          {displayShopPhoto ? (

            <Image
              source={{
                uri:
                  displayShopPhoto,
              }}

              resizeMode="cover"

              style={
                styles.shopPhoto
              }
            />

          ) : (

            <View
              style={
                styles.shopPhotoFallback
              }
            >

              <Ionicons
                name="storefront-outline"

                size={23}

                color={
                  CustomerColors.primary
                }
              />

            </View>

          )}

        </View>


        {/* ====================================================
            SHOP INFORMATION
        ==================================================== */}

        <View
          style={
            styles.shopInfo
          }
        >

          <AppText
            variant="bodyMedium"

            weight="bold"

            numberOfLines={1}

            style={
              styles.shopName
            }
          >
            {shopName}
          </AppText>


          <AppText
            variant="caption"

            numberOfLines={1}

            style={
              styles.createdAt
            }
          >
            {createdAt}
          </AppText>

        </View>


        {/* ====================================================
            STATUS + ARROW
        ==================================================== */}

        <View
          style={
            styles.trailing
          }
        >

          {/* STATUS */}

          <View
            style={[
              styles.statusBadge,

              {
                backgroundColor:
                  status.backgroundColor,
              },
            ]}
          >

            <AppText
              variant="caption"

              weight="medium"

              numberOfLines={1}

              style={[
                styles.statusText,

                {
                  color:
                    status.color,
                },
              ]}
            >
              {status.label}
            </AppText>

          </View>


          {/* ARROW */}

          {onPress ? (

            <Ionicons
              name="chevron-forward"

              size={19}

              color={
                Colors.textSecondary
              }
            />

          ) : null}

        </View>

      </View>

    </Pressable>
  );
}


/* ==============================================================
   MEMO
============================================================== */

ShopRequestCardComponent.displayName =
  "ShopRequestCard";


export default memo(
  ShopRequestCardComponent,
);


/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({

    /* ==========================================================
       CARD
    ========================================================== */

    card: {
      width: "100%",

      /*
       * Very small compact card.
       */

      paddingHorizontal: 9,

      paddingVertical: 7,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.border,

      borderRadius: 14,

      backgroundColor:
        Colors.surface,

      shadowColor:
        "#0F172A",

      shadowOffset: {
        width: 0,
        height: 1,
      },

      shadowOpacity: 0.04,

      shadowRadius: 3,

      elevation: 1,
    },


    /* ==========================================================
       PRESSED
    ========================================================== */

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


    /* ==========================================================
       CONTENT
    ========================================================== */

    content: {
      minHeight: 68,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 8,
    },


    /* ==========================================================
       SHOP PHOTO CONTAINER
    ========================================================== */

    shopPhotoContainer: {
      width: 54,

      height: 54,

      flexShrink: 0,

      overflow: "hidden",

      borderRadius: 11,

      backgroundColor:
        "#EFF6FF",
    },


    /* ==========================================================
       SHOP PHOTO
    ========================================================== */

    shopPhoto: {
      width: "100%",

      height: "100%",
    },


    /* ==========================================================
       PHOTO FALLBACK
    ========================================================== */

    shopPhotoFallback: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#EFF6FF",
    },


    /* ==========================================================
       SHOP INFORMATION
    ========================================================== */

    shopInfo: {
      flex: 1,

      minWidth: 0,

      justifyContent:
        "center",
    },


    /* ==========================================================
       SHOP NAME
    ========================================================== */

    shopName: {
      fontSize: 15,

      lineHeight: 19,

      color:
        Colors.textPrimary,
    },


    /* ==========================================================
       CREATED TIME
    ========================================================== */

    createdAt: {
      marginTop: 2,

      fontSize: 11,

      lineHeight: 15,

      color:
        Colors.textSecondary,
    },


    /* ==========================================================
       TRAILING
    ========================================================== */

    trailing: {
      flexShrink: 0,

      alignItems:
        "flex-end",

      justifyContent:
        "center",

      gap: 5,
    },


    /* ==========================================================
       STATUS BADGE
    ========================================================== */

    statusBadge: {
      minHeight: 26,

      paddingHorizontal: 8,

      borderRadius:
        FixxamTokens.radius.full,

      alignItems:
        "center",

      justifyContent:
        "center",

      maxWidth: 82,
    },


    /* ==========================================================
       STATUS TEXT
    ========================================================== */

    statusText: {
      fontSize: 10,

      lineHeight: 13,
    },

  });