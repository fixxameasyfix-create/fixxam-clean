import React, {
  memo,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppButton,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import {
  type ServiceFulfillmentMode,
} from "@/types/serviceFulfillment";

import {
  type BookingFulfillmentMode,
} from "@/types/bookingFulfillment";

import {
  type BookingPriority,
} from "@/types/bookingPriority";

import RequestDescription from "./RequestDescription";
import RequestPhotos from "./RequestPhotos";
import RequestLocation from "./RequestLocation";
import RequestProviderLocation from "./RequestProviderLocation";

import RequestTiming, {
  type RequestTimingValue,
} from "./RequestTiming";

/* ==============================================================
   TYPES
============================================================== */

type MaterialIconName =
  React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];

type WorkerData = {
  name: string;

  photoUrl?: string;

  category?: string;

  online?: boolean;

  distance?: number;
};

type ServiceData = {
  name: string;

  icon: string;

  color: string;

  backgroundColor: string;
};

type SelectedCoordinates = {
  latitude: number;

  longitude: number;
};

/*
 * Canonical provider service destination.
 *
 * This must come from:
 *
 * workerPublicProfiles/{workerId}
 *   .workerProfile.serviceLocation
 *
 * It must NOT come from the worker's
 * registration/service-area location.
 */
type ProviderLocation = {
  address: string;

  state: string;

  lga: string;

  latitude:
    | number
    | null;

  longitude:
    | number
    | null;
};

type LocationSuggestion = {
  id: string;

  title: string;

  subtitle?: string;

  latitude: number;

  longitude: number;
};

type Props = {
  worker: WorkerData;

  service: ServiceData;

  fulfillmentMode:
    ServiceFulfillmentMode;

  selectedFulfillmentMode:
    | BookingFulfillmentMode
    | null;

  bookingPriority:
    | BookingPriority
    | null;

  onPriorityPress: () => void;

  providerLocation:
    | ProviderLocation
    | null;

  providerLocationLoading:
    boolean;

  description: string;

  onDescriptionChange: (
    value: string,
  ) => void;

  photos: string[];

  onAddPhoto: () => void;

  onTakePhoto: () => void;

  onRemovePhoto: (
    uri: string,
  ) => void;

  locationSelected: boolean;

  address: string;

  currentLocation:
    | SelectedCoordinates
    | null;

  locationSuggestions:
    LocationSuggestion[];

  locationSuggestionsLoading:
    boolean;

  onLocationSelected: (
    value: {
      address?: string;

      latitude: number;

      longitude: number;
    },
  ) => void;

  onSearchLocation: (
    query: string,
  ) => void;

  timing:
    RequestTimingValue;

  scheduledDate:
    | Date
    | null;

  onTimingChange: (
    value: RequestTimingValue,
  ) => void;

  onScheduledDateChange: (
    date: Date,
  ) => void;

  submitting: boolean;

  canSubmit: boolean;

  onCancel: () => void;

  onSubmit: () => void;

  disabled?: boolean;
};

/* ==============================================================
   COMPONENT
============================================================== */

function RequestServiceReviewCard({
  worker,
  service,

  fulfillmentMode,
  selectedFulfillmentMode,

  bookingPriority,
  onPriorityPress,

  providerLocation,
  providerLocationLoading,

  description,
  onDescriptionChange,

  photos,
  onAddPhoto,
  onTakePhoto,
  onRemovePhoto,

  locationSelected,
  address,
  currentLocation,
  locationSuggestions,
  locationSuggestionsLoading,
  onLocationSelected,
  onSearchLocation,

  timing,
  scheduledDate,
  onTimingChange,
  onScheduledDateChange,

  submitting,
  canSubmit,
  onCancel,
  onSubmit,

  disabled = false,
}: Props) {
  /* ============================================================
     EFFECTIVE FULFILLMENT MODE
  ============================================================ */

  const effectiveFulfillmentMode:
    | BookingFulfillmentMode
    | null =
    fulfillmentMode ===
    "flexible"
      ? selectedFulfillmentMode
      : fulfillmentMode ===
            "worker_visits_customer" ||
          fulfillmentMode ===
            "customer_visits_worker" ||
          fulfillmentMode ===
            "remote"
        ? fulfillmentMode
        : null;

  const bookingUnavailable =
    fulfillmentMode ===
    "needs_review";

  const isRemote =
    effectiveFulfillmentMode ===
    "remote";

  /* ============================================================
     PROVIDER LOCATION
  ============================================================ */

  const providerAddress =
    providerLocation
      ?.address
      ?.trim() ?? "";

  const providerState =
    providerLocation
      ?.state
      ?.trim() ?? "";

  const providerLga =
    providerLocation
      ?.lga
      ?.trim() ?? "";

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={
          styles.header
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityState={{
            disabled:
              submitting,
          }}
          disabled={
            submitting
          }
          onPress={
            onCancel
          }
          style={({
            pressed,
          }) => [
            styles.backButton,

            pressed &&
              !submitting &&
              styles.pressed,

            submitting &&
              styles.disabled,
          ]}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={27}
            color={
              Colors.textPrimary
            }
          />
        </Pressable>

        <View
          style={
            styles.headerContent
          }
        >
          <AppText
            variant="heading1"
            weight="bold"
          >
            Book Service
          </AppText>

          <AppText
            variant="bodyMedium"
            tone="secondary"
            numberOfLines={1}
            style={
              styles.headerSubtitle
            }
          >
            Send a request directly to the provider.
          </AppText>
        </View>
      </View>

      {/* ======================================================
          SELECTED SERVICE
      ====================================================== */}

      <View
        style={
          styles.firstSection
        }
      >
        <SectionTitle
          title="Selected Service"
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
                service.icon as
                  MaterialIconName
              }
              size={28}
              color={
                CustomerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.serviceContent
            }
          >
            <AppText
              variant="bodyLarge"
              weight="bold"
              numberOfLines={1}
            >
              {service.name ||
                "Selected service"}
            </AppText>

            <AppText
              variant="bodyMedium"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.serviceProvider
              }
            >
              {worker.name}
            </AppText>
          </View>

          <View
            style={
              styles.serviceCheck
            }
          >
            <MaterialCommunityIcons
              name="check"
              size={21}
              color={
                CustomerColors.primary
              }
            />
          </View>
        </View>
      </View>

      {/* ======================================================
          UNAVAILABLE
      ====================================================== */}

      {bookingUnavailable ? (
        <View
          style={
            styles.section
          }
        >
          <View
            style={
              styles.unavailableCard
            }
          >
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={25}
              color={
                CustomerColors.primary
              }
            />

            <View
              style={
                styles.unavailableContent
              }
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
              >
                Booking temporarily unavailable
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.unavailableText
                }
              >
                This service is still being configured for booking.
              </AppText>
            </View>
          </View>
        </View>
      ) : null}

      {/* ======================================================
          TIMING / PRIORITY
      ====================================================== */}

      {!bookingUnavailable ? (
        <View
          style={
            styles.section
          }
        >
          <RequestTiming
            value={
              timing
            }
            bookingPriority={
              bookingPriority
            }
            onPriorityPress={
              onPriorityPress
            }
            onChange={
              onTimingChange
            }
            disabled={
              disabled
            }
            scheduledDate={
              scheduledDate
            }
            onScheduledDateChange={
              onScheduledDateChange
            }
          />
        </View>
      ) : null}

      {/* ======================================================
          DESCRIPTION
      ====================================================== */}

      {!bookingUnavailable ? (
        <View
          style={
            styles.section
          }
        >
          <SectionTitle
            title="Describe what you need"
          />

          <RequestDescription
            value={
              description
            }
            onChangeText={
              onDescriptionChange
            }
            disabled={
              disabled
            }
          />
        </View>
      ) : null}

      {/* ======================================================
          PHOTOS
      ====================================================== */}

      {!bookingUnavailable ? (
        <View
          style={
            styles.section
          }
        >
          <View
            style={
              styles.sectionTitleRow
            }
          >
            <View
              style={
                styles.photosTitle
              }
            >
              <MaterialCommunityIcons
                name="image-outline"
                size={23}
                color={
                  CustomerColors.primary
                }
              />

              <AppText
                variant="bodyLarge"
                weight="bold"
              >
                Photos
              </AppText>
            </View>

            <AppText
              variant="caption"
              tone="muted"
            >
              {photos.length}/3
            </AppText>
          </View>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.photosHint
            }
          >
            Add photos to help the provider understand the job.
          </AppText>

          <RequestPhotos
            photos={
              photos
            }
            onAdd={
              onAddPhoto
            }
            onTakePhoto={
              onTakePhoto
            }
            onRemove={
              onRemovePhoto
            }
            disabled={
              disabled
            }
          />
        </View>
      ) : null}

      {/* ======================================================
          REMOTE SERVICE
      ====================================================== */}

      {isRemote ? (
        <View
          style={
            styles.section
          }
        >
          <SectionTitle
            title="Service Method"
          />

          <View
            style={
              styles.remoteCard
            }
          >
            <View
              style={
                styles.remoteIcon
              }
            >
              <MaterialCommunityIcons
                name="laptop"
                size={27}
                color={
                  CustomerColors.primary
                }
              />
            </View>

            <View
              style={
                styles.remoteContent
              }
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
              >
                Remote service
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.remoteDescription
                }
              >
                This service will be provided remotely. No physical service location is required.
              </AppText>
            </View>

            <MaterialCommunityIcons
              name="check-circle-outline"
              size={23}
              color={
                CustomerColors.primary
              }
            />
          </View>
        </View>
      ) : null}

      {/* ======================================================
          CUSTOMER SERVICE LOCATION
      ====================================================== */}

      {effectiveFulfillmentMode ===
      "worker_visits_customer" ? (
        <View
          style={
            styles.section
          }
        >
          <SectionTitle
            title="Service Location"
          />

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.locationHint
            }
          >
            Choose where the provider should come.
          </AppText>

          <RequestLocation
            selected={
              locationSelected
            }
            address={
              address
            }
            onPress={() => {}}
            onLocationSelected={
              onLocationSelected
            }
            currentLocation={
              currentLocation
            }
            suggestions={
              locationSuggestions
            }
            suggestionsLoading={
              locationSuggestionsLoading
            }
            onSearchLocation={
              onSearchLocation
            }
            disabled={
              disabled
            }
          />
        </View>
      ) : null}

      {/* ======================================================
          PROVIDER SERVICE LOCATION
      ====================================================== */}

      {effectiveFulfillmentMode ===
      "customer_visits_worker" ? (
        <View
          style={
            styles.section
          }
        >
          <SectionTitle
            title="Provider Location"
          />

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.locationHint
            }
          >
            This is the service location provided by {worker.name}. You&apos;ll go here for the service.
          </AppText>

          <RequestProviderLocation
            workerName={
              worker.name
            }
            address={
              providerAddress
            }
            state={
              providerState
            }
            lga={
              providerLga
            }
            latitude={
              providerLocation
                ?.latitude
            }
            longitude={
              providerLocation
                ?.longitude
            }
            loading={
              providerLocationLoading
            }
            disabled={
              disabled
            }
          />
        </View>
      ) : null}

      {/* ======================================================
          SEND REQUEST
      ====================================================== */}

      {!bookingUnavailable ? (
        <View
          style={
            styles.submitSection
          }
        >
          <AppButton
            title={
              submitting
                ? "Sending Request..."
                : "Send Request"
            }
            role="customer"
            loading={
              submitting
            }
            disabled={
              disabled ||
              submitting ||
              !canSubmit
            }
            rightIconName={
              submitting
                ? undefined
                : "next"
            }
            onPress={
              onSubmit
            }
            style={
              styles.submitButton
            }
          />

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.submitHint
            }
          >
            The provider will review your request and respond with the next steps.
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

/* ==============================================================
   SECTION TITLE
============================================================== */

function SectionTitle({
  title,
}: {
  title: string;
}) {
  return (
    <AppText
      variant="bodyLarge"
      weight="bold"
      style={
        styles.sectionTitle
      }
    >
      {title}
    </AppText>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width:
        "100%",
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        20,
    },

    backButton: {
      width:
        48,

      height:
        48,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        12,

      borderRadius:
        14,

      backgroundColor:
        "#EAF3FF",
    },

    headerContent: {
      flex:
        1,

      minWidth:
        0,
    },

    headerSubtitle: {
      marginTop:
        3,

      color:
        "#64748B",
    },

    /* ========================================================
       SECTIONS
    ======================================================== */

    firstSection: {
      marginTop:
        16,
    },

    section: {
      marginTop:
        24,
    },

    sectionTitle: {
      marginBottom:
        10,

      color:
        "#0F172A",
    },

    sectionTitleRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        8,
    },

    /* ========================================================
       SELECTED SERVICE
    ======================================================== */

    serviceCard: {
      width:
        "100%",

      minHeight:
        82,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        14,

      paddingVertical:
        14,

      borderWidth:
        1,

      borderColor:
        "#DDE5EF",

      borderRadius:
        14,

      backgroundColor:
        "#FFFFFF",
    },

    serviceIcon: {
      width:
        52,

      height:
        52,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        12,

      borderRadius:
        10,

      backgroundColor:
        "#EAF3FF",
    },

    serviceContent: {
      flex:
        1,

      minWidth:
        0,
    },

    serviceProvider: {
      marginTop:
        3,

      color:
        "#64748B",
    },

    serviceCheck: {
      width:
        36,

      height:
        36,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginLeft:
        8,

      borderRadius:
        18,

      backgroundColor:
        "#EAF3FF",
    },

    /* ========================================================
       PHOTOS
    ======================================================== */

    photosTitle: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        6,
    },

    photosHint: {
      marginBottom:
        10,

      lineHeight:
        18,

      color:
        "#64748B",
    },

    /* ========================================================
       REMOTE
    ======================================================== */

    remoteCard: {
      minHeight:
        82,

      flexDirection:
        "row",

      alignItems:
        "center",

      padding:
        14,

      borderWidth:
        1,

      borderColor:
        "#BFDBFE",

      borderRadius:
        14,

      backgroundColor:
        "#EFF6FF",
    },

    remoteIcon: {
      width:
        48,

      height:
        48,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        12,

      borderRadius:
        10,

      backgroundColor:
        "#FFFFFF",
    },

    remoteContent: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        10,
    },

    remoteDescription: {
      marginTop:
        3,

      lineHeight:
        18,

      color:
        "#64748B",
    },

    /* ========================================================
       LOCATION
    ======================================================== */

    locationHint: {
      marginTop:
        -4,

      marginBottom:
        10,

      lineHeight:
        18,

      color:
        "#64748B",
    },

    /* ========================================================
       UNAVAILABLE
    ======================================================== */

    unavailableCard: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      padding:
        14,

      borderWidth:
        1,

      borderColor:
        "#BFDBFE",

      borderRadius:
        14,

      backgroundColor:
        "#EFF6FF",
    },

    unavailableContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        10,
    },

    unavailableText: {
      marginTop:
        3,

      lineHeight:
        18,

      color:
        "#64748B",
    },

    /* ========================================================
       SUBMIT
    ======================================================== */

    submitSection: {
      width:
        "100%",

      marginTop:
        32,

      paddingBottom:
        24,
    },

    submitButton: {
      width:
        "100%",

      minHeight:
        58,

      borderRadius:
        18,
    },

    submitHint: {
      marginTop:
        10,

      paddingHorizontal:
        14,

      textAlign:
        "center",

      lineHeight:
        18,

      color:
        "#64748B",
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

    disabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },
  });

export default memo(
  RequestServiceReviewCard,
);