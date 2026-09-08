import React, {
  memo,
} from "react";

import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  Image,
} from "expo-image";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import WorkerCustomerCard from "@/components/orders/WorkerCustomerCard";
import WorkerOrderRequest from "@/components/orders/WorkerOrderRequest";
import WorkerOrderLocation from "@/components/orders/WorkerOrderLocation";
import WorkerOrderTiming from "@/components/orders/WorkerOrderTiming";
import WorkerLiveLocationTracker from "@/components/orders/WorkerLiveLocationTracker";

import type {
  BookingStatus,
} from "@/types/booking";

type OfferState =
  | "none"
  | "sent"
  | "counter";

type Props = {
  orderId: string;

  status: BookingStatus;

  offerState: OfferState;

  customerName: string;

  customerPhotoURL?:
    | string
    | null;

  serviceName: string;

  serviceIcon?: unknown;

  serviceIconColor?:
    | string
    | null;

  serviceIconBackground?:
    | string
    | null;

  description: string;

  photos: string[];

  address: string;

  latitude?:
    | number
    | null;

  longitude?:
    | number
    | null;

  urgent: boolean;

  date?:
    | string
    | null;

  time?:
    | string
    | null;

  onCustomerProfile: () => void;

  onViewLocation: () => void;
};

type ServiceIcon =
  keyof typeof MaterialCommunityIcons.glyphMap;

function resolveServiceIcon(
  value: unknown,
): ServiceIcon {
  if (
    typeof value !==
      "string" ||
    !value.trim()
  ) {
    return "tools";
  }

  const icon =
    value.trim() as ServiceIcon;

  return icon in
    MaterialCommunityIcons.glyphMap
    ? icon
    : "tools";
}

function WorkerOrderInfoSections({
  orderId,
  status,
  offerState,
  customerName,
  customerPhotoURL,
  serviceName,
  serviceIcon,
  serviceIconColor,
  serviceIconBackground,
  description,
  photos,
  address,
  latitude,
  longitude,
  urgent,
  date,
  time,
  onCustomerProfile,
  onViewLocation,
}: Props) {
  const hasPhotos =
    photos.length > 0;

  return (
    <>
      {status ===
        "pending" &&
      offerState ===
        "none" ? (
        <NewRequestStatusCard />
      ) : null}

      <WorkerOrderSectionTitle
        number="1"
        title="Request from customer"
      />

      <WorkerCustomerCard
        name={
          customerName
        }
        photoURL={
          customerPhotoURL
        }
        onProfile={
          onCustomerProfile
        }
      />

      <WorkerOrderSectionTitle
        number="2"
        title="Service"
      />

      <View
        style={
          styles.serviceCard
        }
      >
        <View
          style={[
            styles.serviceIcon,

            {
              backgroundColor:
                serviceIconBackground ||
                WorkerColors.primarySoft,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={
              resolveServiceIcon(
                serviceIcon,
              )
            }
            size={25}
            color={
              serviceIconColor ||
              WorkerColors.primary
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
            tone="secondary"
            style={
              styles.smallLabel
            }
          >
            SERVICE
          </AppText>

          <AppText
            variant="bodyMedium"
            weight="bold"
            numberOfLines={2}
            style={
              styles.serviceName
            }
          >
            {serviceName}
          </AppText>
        </View>
      </View>

      <WorkerOrderSectionTitle
        number="3"
        title="Customer Request"
      />

      <WorkerOrderRequest
        description={
          description
        }
      />

      <WorkerLiveLocationTracker
        orderId={
          orderId
        }
        enabled={
          status ===
          "in-progress"
        }
      />

      {hasPhotos ? (
        <>
          <WorkerOrderSectionTitle
            number="4"
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
            {photos.map(
              (
                photo,
                index,
              ) => (
                <Image
                  key={
                    photo
                  }
                  source={{
                    uri:
                      photo,
                  }}
                  style={
                    styles.photo
                  }
                  contentFit="cover"
                  transition={150}
                  recyclingKey={
                    photo
                  }
                  accessibilityLabel={`Request photo ${index + 1}`}
                />
              ),
            )}
          </ScrollView>
        </>
      ) : null}

      <WorkerOrderSectionTitle
        number={
          hasPhotos
            ? "5"
            : "4"
        }
        title="Service Location"
      />

      <WorkerOrderLocation
        address={
          address
        }
        latitude={
          latitude
        }
        longitude={
          longitude
        }
        onViewLocation={
          onViewLocation
        }
      />

      <WorkerOrderSectionTitle
        number={
          hasPhotos
            ? "6"
            : "5"
        }
        title="When"
      />

      <WorkerOrderTiming
        urgent={
          urgent
        }
        date={
          date
        }
        time={
          time
        }
      />
    </>
  );
}

export default memo(
  WorkerOrderInfoSections,
);

/* ==============================================================
   NEW REQUEST
============================================================== */

const NewRequestStatusCard =
  memo(
    function NewRequestStatusCard() {
      return (
        <View
          style={
            styles.statusCard
          }
        >
          <View
            style={
              styles.statusIcon
            }
          >
            <MaterialCommunityIcons
              name="bell-outline"
              size={24}
              color={
                WorkerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.statusContent
            }
          >
            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.statusTitle
              }
            >
              NEW REQUEST
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.statusText
              }
            >
              A customer has sent you a service request. Review the details and send your offer.
            </AppText>
          </View>

          <View
            style={
              styles.newBadge
            }
          >
            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.newBadgeText
              }
            >
              NEW
            </AppText>
          </View>
        </View>
      );
    },
  );

/* ==============================================================
   SECTION TITLE
============================================================== */

export const WorkerOrderSectionTitle =
  memo(
    function WorkerOrderSectionTitle({
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
              center
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
    },
  );

WorkerOrderSectionTitle.displayName =
  "WorkerOrderSectionTitle";

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    statusCard: {
      minHeight: 106,

      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    statusIcon: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    statusContent: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.md,
    },

    statusTitle: {
      color:
        WorkerColors.primary,
    },

    statusText: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 17,

      color:
        Colors.textSecondary,
    },

    newBadge: {
      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    newBadgeText: {
      color:
        WorkerColors.primary,
    },

    sectionTitle: {
      marginTop:
        FixxamTokens.spacing.xl,

      marginBottom:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    sectionNumber: {
      width: 28,

      height: 28,

      marginRight:
        FixxamTokens.spacing.sm,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    sectionNumberText: {
      color:
        WorkerColors.primary,
    },

    sectionText: {
      flex: 1,

      color:
        Colors.textPrimary,
    },

    serviceCard: {
      minHeight: 70,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    serviceIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,
    },

    serviceInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    smallLabel: {
      letterSpacing: 0.8,

      color:
        Colors.textMuted,
    },

    serviceName: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textPrimary,
    },

    photos: {
      gap:
        FixxamTokens.spacing.sm,

      paddingRight:
        FixxamTokens.spacing.lg,
    },

    photo: {
      width: 110,

      height: 110,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.disabledBackground,
    },
  });