import React, {
  memo,
  useMemo,
} from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  Image,
} from "expo-image";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type MaterialIconName =
  React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];

type Props = {
  workerName: string;

  workerPhoto?: string | null;

  workerCategory?: string | null;

  serviceName: string;

  serviceIcon?: string | null;

  description: string;

  photos: string[];

  address: string;

  hasCoordinates: boolean;

  urgent: boolean;

  date?: string | null;

  time?: string | null;

  onProfile: () => void;

  onMap: () => void;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanText(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function resolveServiceIcon(
  value?: string | null,
): MaterialIconName {
  const icon =
    cleanText(
      value,
    ) as MaterialIconName;

  if (
    icon &&
    icon in
      MaterialCommunityIcons.glyphMap
  ) {
    return icon;
  }

  return "tools";
}

/* ==============================================================
   SECTION TITLE
============================================================== */

function SectionTitle({
  number,
  title,
}: {
  number: string;

  title: string;
}) {
  return (
    <View
      style={
        styles.sectionTitle
      }
    >
      <View
        style={
          styles.sectionNumber
        }
      >
        <AppText
          variant="caption"
          weight="bold"
          style={
            styles.sectionNumberText
          }
        >
          {number}
        </AppText>
      </View>

      <AppText
        variant="bodyMedium"
        weight="bold"
        style={
          styles.sectionText
        }
      >
        {title}
      </AppText>
    </View>
  );
}

/* ==============================================================
   COMPONENT
============================================================== */

function CustomerOrderRequest({
  workerName,
  workerPhoto,
  workerCategory,

  serviceName,
  serviceIcon,

  description,
  photos,

  address,
  hasCoordinates,

  urgent,
  date,
  time,

  onProfile,
  onMap,
}: Props) {
  let sectionNumber = 1;

  const safeWorkerName =
    cleanText(
      workerName,
    ) || "Worker";

  const safeWorkerCategory =
    cleanText(
      workerCategory,
    ) || "Service provider";

  const safeWorkerPhoto =
    cleanText(
      workerPhoto,
    );

  const safeServiceName =
    cleanText(
      serviceName,
    ) || "Service";

  const safeServiceIcon =
    resolveServiceIcon(
      serviceIcon,
    );

  const safeDescription =
    cleanText(
      description,
    ) ||
    "No description provided.";

  const safeAddress =
    cleanText(
      address,
    ) ||
    "Location unavailable";

  const safeDate =
    cleanText(
      date,
    );

  const safeTime =
    cleanText(
      time,
    );

  const safePhotos =
    useMemo(() => {
      const seen =
        new Set<string>();

      return photos.reduce<
        string[]
      >(
        (
          items,
          photo,
        ) => {
          const value =
            cleanText(
              photo,
            );

          if (
            !value ||
            seen.has(value)
          ) {
            return items;
          }

          seen.add(value);
          items.push(value);

          return items;
        },
        [],
      );
    }, [photos]);

  return (
    <View>
      {/* ======================================================
          WORKER
      ====================================================== */}

      <SectionTitle
        number={`${sectionNumber++}`}
        title="Your worker"
      />

      <View
        style={
          styles.workerCard
        }
      >
        <View
          style={styles.avatar}
        >
          {safeWorkerPhoto ? (
            <Image
              source={{
                uri:
                  safeWorkerPhoto,
              }}
              style={
                styles.avatarImage
              }
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={150}
            />
          ) : (
            <AppIcon
              name="profile"
              size="lg"
              color={
                Colors.textMuted
              }
            />
          )}
        </View>

        <View
          style={
            styles.workerInfo
          }
        >
          <AppText
            variant="body"
            weight="bold"
            numberOfLines={1}
            style={
              styles.workerName
            }
          >
            {safeWorkerName}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            style={
              styles.workerCategory
            }
          >
            {safeWorkerCategory}
          </AppText>
        </View>

        <Pressable
          onPress={onProfile}
          accessibilityRole="button"
          accessibilityLabel={`View ${safeWorkerName} profile`}
          style={({
            pressed,
          }) => [
            styles.actionButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppIcon
            name="profile"
            role="customer"
            size="xs"
            color={
              CustomerColors.primary
            }
          />
        </Pressable>
      </View>

      {/* ======================================================
          SERVICE
      ====================================================== */}

      <SectionTitle
        number={`${sectionNumber++}`}
        title="Service"
      />

      <View
        style={
          styles.serviceCard
        }
      >
        <View
          style={
            styles.serviceIcon
          }
        >
          <MaterialCommunityIcons
            name={
              safeServiceIcon
            }
            size={22}
            color={
              CustomerColors.primary
            }
          />
        </View>

        <View
          style={
            styles.serviceInfo
          }
        >
          <AppText
            variant="caption"
            tone="muted"
            weight="semibold"
            style={
              styles.smallLabel
            }
          >
            SERVICE
          </AppText>

          <AppText
            variant="body"
            weight="bold"
            numberOfLines={2}
            style={
              styles.serviceName
            }
          >
            {safeServiceName}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          REQUEST
      ====================================================== */}

      <SectionTitle
        number={`${sectionNumber++}`}
        title="Your request"
      />

      <View
        style={
          styles.requestCard
        }
      >
        <View
          style={
            styles.requestIcon
          }
        >
          <AppIcon
            name="messages"
            role="customer"
            size="sm"
            color={
              CustomerColors.primary
            }
          />
        </View>

        <AppText
          variant="body"
          tone="secondary"
          style={
            styles.description
          }
        >
          {safeDescription}
        </AppText>
      </View>

      {/* ======================================================
          PHOTOS
      ====================================================== */}

      {safePhotos.length >
      0 ? (
        <>
          <SectionTitle
            number={`${sectionNumber++}`}
            title="Photos"
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.photos
            }
          >
            {safePhotos.map(
              (
                photo,
                index,
              ) => (
                <Image
                  key={`${photo}-${index}`}
                  source={{
                    uri: photo,
                  }}
                  style={
                    styles.photo
                  }
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={150}
                />
              ),
            )}
          </ScrollView>
        </>
      ) : null}

      {/* ======================================================
          LOCATION
      ====================================================== */}

      <SectionTitle
        number={`${sectionNumber++}`}
        title="Service location"
      />

      <View
        style={
          styles.locationCard
        }
      >
        <View
          style={
            styles.locationIcon
          }
        >
          <AppIcon
            name="location"
            role="customer"
            size="sm"
            color={
              CustomerColors.primary
            }
          />
        </View>

        <View
          style={
            styles.locationInfo
          }
        >
          <AppText
            variant="caption"
            weight="bold"
            numberOfLines={2}
            style={
              styles.locationTitle
            }
          >
            {safeAddress}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.address
            }
          >
            {hasCoordinates
              ? "Location coordinates available"
              : "Address only"}
          </AppText>
        </View>

        <Pressable
          onPress={onMap}
          accessibilityRole="button"
          accessibilityLabel="View service location"
          style={({
            pressed,
          }) => [
            styles.actionButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppIcon
            name="navigation"
            role="customer"
            size="xs"
            color={
              CustomerColors.primary
            }
          />
        </Pressable>
      </View>

      {/* ======================================================
          WHEN
      ====================================================== */}

      <SectionTitle
        number={`${sectionNumber}`}
        title="When"
      />

      <View
        style={
          styles.timingCard
        }
      >
        <View
          style={
            styles.timingIcon
          }
        >
          <AppIcon
            name="calendar"
            role="customer"
            size="sm"
            color={
              CustomerColors.primary
            }
          />
        </View>

        <View
          style={
            styles.timingInfo
          }
        >
          <AppText
            variant="caption"
            weight="bold"
            style={[
              styles.timingTitle,

              urgent
                ? styles.urgentText
                : null,
            ]}
          >
            {urgent
              ? "AS SOON AS POSSIBLE"
              : safeDate ||
                "Scheduled service"}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.timingSubtitle
            }
          >
            {urgent
              ? "The worker has been asked to respond as soon as possible."
              : safeTime ||
                "Scheduled time unavailable"}
          </AppText>
        </View>
      </View>
    </View>
  );
}

export default memo(
  CustomerOrderRequest,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       SECTION
    ======================================================== */

    sectionTitle: {
      marginTop:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",
    },

    sectionNumber: {
      width: 28,

      height: 28,

      marginRight:
        FixxamTokens.spacing.sm,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    sectionNumberText: {
      color:
        CustomerColors.primary,
    },

    sectionText: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       SHARED CARD
    ======================================================== */

    workerCard: {
      minHeight: 78,

      padding:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    serviceCard: {
      minHeight: 70,

      padding:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    requestCard: {
      padding:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems:
        "flex-start",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    locationCard: {
      minHeight: 76,

      padding:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    timingCard: {
      minHeight: 72,

      padding:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       WORKER
    ======================================================== */

    avatar: {
      width:
        FixxamTokens.size
          .avatarLg,

      height:
        FixxamTokens.size
          .avatarLg,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      overflow: "hidden",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.disabledBackground,
    },

    avatarImage: {
      width: "100%",

      height: "100%",
    },

    workerInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    workerName: {
      color:
        Colors.textPrimary,
    },

    workerCategory: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    actionButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    /* ========================================================
       SERVICE
    ======================================================== */

    serviceIcon: {
      width: 44,

      height: 44,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    serviceInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    smallLabel: {
      letterSpacing: 1,
    },

    serviceName: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       REQUEST
    ======================================================== */

    requestIcon: {
      width: 44,

      height: 44,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    description: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      lineHeight: 20,
    },

    /* ========================================================
       PHOTOS
    ======================================================== */

    photos: {
      gap:
        FixxamTokens.spacing.sm,

      paddingRight:
        FixxamTokens.spacing.md,
    },

    photo: {
      width: 110,

      height: 110,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.disabledBackground,
    },

    /* ========================================================
       LOCATION
    ======================================================== */

    locationIcon: {
      width:
        FixxamTokens.size
          .iconBox,

      height:
        FixxamTokens.size
          .iconBox,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    locationInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    locationTitle: {
      color:
        Colors.textPrimary,
    },

    address: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       TIMING
    ======================================================== */

    timingIcon: {
      width:
        FixxamTokens.size
          .iconBox,

      height:
        FixxamTokens.size
          .iconBox,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    timingInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    timingTitle: {
      color:
        Colors.textPrimary,
    },

    urgentText: {
      color:
        Colors.warning,
    },

    timingSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 16,
    },

    /* ========================================================
       PRESSED
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