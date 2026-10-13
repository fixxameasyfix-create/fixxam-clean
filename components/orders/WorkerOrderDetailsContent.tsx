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
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import type {
  WorkerBooking,
} from "@/utils/worker/workerOrderDetails";

/* ==============================================================
   TYPES
============================================================== */

type WorkerLiveTrackingState =
  | "idle"
  | "requesting-permission"
  | "tracking"
  | "permission-denied"
  | "error";

type WorkerOrderDetailsContentProps = {
  booking: WorkerBooking;

  onCustomerPress: () => void;

  onLocationPress: () => void;

  onTrackCustomerPress: () => void;

  customerLiveLocationAvailable: boolean;

  workerLiveLocationState: WorkerLiveTrackingState;

  workerLiveLocationTracking: boolean;

  workerLiveLocationError: string | null;
};

type MaterialIconName =
  keyof typeof MaterialCommunityIcons.glyphMap;

type TimingPresentation = {
  title: string;

  subtitle: string;

  urgent: boolean;
};

type WorkerSharingPresentation = {
  status:
    | "STARTING"
    | "LIVE"
    | "ATTENTION";

  message: string;

  attention: boolean;

  live: boolean;
};

/* ==============================================================
   HELPERS
============================================================== */

function getSafeText(
  value: unknown,
  fallback = "",
): string {
  if (
    typeof value ===
    "string"
  ) {
    const text =
      value.trim();

    if (text) {
      return text;
    }
  }

  return fallback;
}

function getSafeImageUrl(
  value: unknown,
): string {
  const url =
    getSafeText(
      value,
    );

  if (
    url.startsWith(
      "https://",
    ) ||
    url.startsWith(
      "http://",
    )
  ) {
    return url;
  }

  return "";
}

function resolveServiceIcon(
  value: unknown,
): MaterialIconName {
  const icon =
    getSafeText(
      value,
      "tools",
    );

  if (
    icon in
    MaterialCommunityIcons.glyphMap
  ) {
    return icon as MaterialIconName;
  }

  return "tools";
}

function formatScheduleDate(
  value: unknown,
): string {
  const raw =
    getSafeText(
      value,
    );

  if (!raw) {
    return "";
  }

  const parsed =
    new Date(
      raw,
    );

  if (
    !Number.isFinite(
      parsed.getTime(),
    )
  ) {
    return raw;
  }

  return parsed.toLocaleDateString(
    "en-NG",
    {
      weekday:
        "short",

      day:
        "numeric",

      month:
        "short",

      year:
        "numeric",
    },
  );
}

function formatCurrency(
  value: number,
): string {
  return `₦${value.toLocaleString(
    "en-NG",
    {
      minimumFractionDigits:
        0,

      maximumFractionDigits:
        2,
    },
  )}`;
}

function resolveTimingPresentation(
  booking: WorkerBooking,
): TimingPresentation {
  const timing =
    booking.timing;

  const priority =
    booking.bookingPriority;

  const rawDate =
    getSafeText(
      booking.bookingDate,
    ) ||
    getSafeText(
      booking.date,
    );

  const rawTime =
    getSafeText(
      booking.bookingTime,
    ) ||
    getSafeText(
      booking.time,
    );

  const formattedDate =
    formatScheduleDate(
      rawDate,
    );

  const scheduleText =
    [
      formattedDate,
      rawTime,
    ]
      .filter(
        value =>
          value.length >
          0,
      )
      .join(
        " • ",
      );

  if (
    timing ===
    "schedule"
  ) {
    return {
      title:
        "Scheduled",

      subtitle:
        scheduleText ||
        "Scheduled for later",

      urgent:
        false,
    };
  }

  if (
    priority ===
    "immediate"
  ) {
    return {
      title:
        "Immediately",

      subtitle:
        "Service requested as soon as possible.",

      urgent:
        false,
    };
  }

  if (
    priority ===
    "normal"
  ) {
    return {
      title:
        "Normally",

      subtitle:
        "Standard service priority.",

      urgent:
        false,
    };
  }

  if (
    priority ===
    "urgent"
  ) {
    return {
      title:
        "Urgently",

      subtitle:
        "Customer requested urgent service.",

      urgent:
        true,
    };
  }

  if (
    scheduleText
  ) {
    return {
      title:
        "Scheduled",

      subtitle:
        scheduleText,

      urgent:
        false,
    };
  }

  if (
    booking.urgent
  ) {
    return {
      title:
        "Urgently",

      subtitle:
        "Customer requested urgent service.",

      urgent:
        true,
    };
  }

  return {
    title:
      "Timing unavailable",

    subtitle:
      "Service timing information is not available.",

    urgent:
      false,
  };
}

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerOrderDetailsContent({
  booking,
  onCustomerPress,
  onLocationPress,
  onTrackCustomerPress,
  customerLiveLocationAvailable,
  workerLiveLocationState,
  workerLiveLocationTracking,
  workerLiveLocationError,
}: WorkerOrderDetailsContentProps) {
  /* ============================================================
     CUSTOMER
  ============================================================ */

  const customerName =
    useMemo(
      () =>
        getSafeText(
          booking.customerName,
          "Customer",
        ),
      [
        booking.customerName,
      ],
    );

  const customerPhoto =
    useMemo(
      () =>
        getSafeImageUrl(
          booking.customerPhotoURL,
        ),
      [
        booking.customerPhotoURL,
      ],
    );

  /* ============================================================
     SERVICE
  ============================================================ */

  const serviceName =
    useMemo(
      () =>
        getSafeText(
          booking.serviceName,
          "Service request",
        ),
      [
        booking.serviceName,
      ],
    );

  const serviceIcon =
    useMemo(
      () =>
        resolveServiceIcon(
          booking.serviceIcon,
        ),
      [
        booking.serviceIcon,
      ],
    );

  const serviceIconColor =
    useMemo(
      () =>
        getSafeText(
          booking.serviceIconColor,
          WorkerColors.primary,
        ),
      [
        booking.serviceIconColor,
      ],
    );

  const serviceIconBackground =
    useMemo(
      () =>
        getSafeText(
          booking.serviceIconBackground,
          WorkerColors.primarySoft,
        ),
      [
        booking.serviceIconBackground,
      ],
    );

  /* ============================================================
     FULFILLMENT
  ============================================================ */

  const isRemote =
    booking.fulfillmentMode ===
    "remote";

  const workerTravels =
    booking.fulfillmentMode ===
    "worker_visits_customer";

  const customerTravels =
    booking.fulfillmentMode ===
    "customer_visits_worker";

  /* ============================================================
     REQUEST
  ============================================================ */

  const description =
    useMemo(
      () =>
        getSafeText(
          booking.description,
        ),
      [
        booking.description,
      ],
    );

  const photos =
    useMemo<string[]>(
      () => {
        if (
          !Array.isArray(
            booking.photos,
          )
        ) {
          return [];
        }

        return Array.from(
          new Set(
            booking.photos
              .map(
                (
                  photo: unknown,
                ) =>
                  getSafeImageUrl(
                    photo,
                  ),
              )
              .filter(
                (
                  photo: string,
                ) =>
                  photo.length >
                  0,
              ),
          ),
        );
      },
      [
        booking.photos,
      ],
    );

  const hasPhotos =
    photos.length >
    0;

  /* ============================================================
     LOCATION
  ============================================================ */

  const address =
    useMemo(
      () =>
        getSafeText(
          booking.address,
          "Location unavailable",
        ),
      [
        booking.address,
      ],
    );

  const locationTitle =
    workerTravels
      ? "Customer service location"
      : customerTravels
        ? "Your service location"
        : "Service location";

  const locationDescription =
    workerTravels
      ? `You will go to ${customerName}'s service location.`
      : customerTravels
        ? `${customerName} will come to your service location.`
        : "";

  /* ============================================================
     TRACKING LIFECYCLE
  ============================================================ */

  const trackingActive =
    booking.status ===
      "accepted" ||
    booking.status ===
      "in-progress";

  const pendingTracking =
    workerTravels &&
    booking.status ===
      "pending";

  /*
   * completed / cancelled / expired:
   * live tracking UI is no longer useful.
   */
  const showActiveTracking =
    workerTravels &&
    trackingActive;

  /* ============================================================
     CUSTOMER LIVE LOCATION
  ============================================================ */

  const canTrackCustomer =
    showActiveTracking &&
    customerLiveLocationAvailable;

  /* ============================================================
     WORKER LIVE LOCATION SHARING
  ============================================================ */

  const workerSharingPresentation =
    useMemo<WorkerSharingPresentation>(
      () => {
        if (
          workerLiveLocationError
        ) {
          return {
            status:
              "ATTENTION",

            message:
              workerLiveLocationError,

            attention:
              true,

            live:
              false,
          };
        }

        if (
          workerLiveLocationTracking ||
          workerLiveLocationState ===
            "tracking"
        ) {
          return {
            status:
              "LIVE",

            message:
              "Your location is being shared with the customer.",

            attention:
              false,

            live:
              true,
          };
        }

        if (
          workerLiveLocationState ===
            "permission-denied"
        ) {
          return {
            status:
              "ATTENTION",

            message:
              "Location permission is required for live tracking.",

            attention:
              true,

            live:
              false,
          };
        }

        if (
          workerLiveLocationState ===
            "error"
        ) {
          return {
            status:
              "ATTENTION",

            message:
              "Your live location could not be shared.",

            attention:
              true,

            live:
              false,
          };
        }

        return {
          status:
            "STARTING",

          message:
            workerLiveLocationState ===
            "requesting-permission"
              ? "Preparing live location sharing..."
              : "Starting live location sharing...",

          attention:
            false,

          live:
            false,
        };
      },
      [
        workerLiveLocationError,
        workerLiveLocationState,
        workerLiveLocationTracking,
      ],
    );

  /* ============================================================
     TIMING
  ============================================================ */

  const timingPresentation =
    useMemo(
      () =>
        resolveTimingPresentation(
          booking,
        ),
      [
        booking.timing,
        booking.bookingPriority,
        booking.bookingDate,
        booking.bookingTime,
        booking.date,
        booking.time,
        booking.urgent,
      ],
    );

  /* ============================================================
     AGREED SERVICE AMOUNT
  ============================================================ */

  const agreedPrice =
    useMemo(() => {
      const value =
        booking.agreedPrice;

      if (
        typeof value !==
          "number" ||
        !Number.isFinite(
          value,
        ) ||
        value <= 0
      ) {
        return null;
      }

      return value;
    }, [
      booking.agreedPrice,
    ]);

  const formattedAgreedPrice =
    useMemo(
      () =>
        agreedPrice !==
        null
          ? formatCurrency(
              agreedPrice,
            )
          : "",
      [
        agreedPrice,
      ],
    );

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ========================================================
          CUSTOMER
      ======================================================== */}

      <Pressable
        onPress={
          onCustomerPress
        }
        accessibilityRole="button"
        accessibilityLabel={`Customer ${customerName}`}
        accessibilityHint="Open customer profile"
        hitSlop={4}
        style={({
          pressed,
        }) => [
          styles.customerRow,

          pressed
            ? styles.pressed
            : null,
        ]}
      >
        {customerPhoto ? (
          <Image
            source={{
              uri:
                customerPhoto,
            }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={150}
            recyclingKey={
              customerPhoto
            }
            accessibilityLabel={`${customerName} profile photo`}
            style={
              styles.customerPhoto
            }
          />
        ) : (
          <View
            style={
              styles.customerPlaceholder
            }
          >
            <AppIcon
              name="profile"
              size="sm"
              color={
                Colors.textMuted
              }
            />
          </View>
        )}

        <View
          style={
            styles.customerInfo
          }
        >
          <AppText
            variant="bodyMedium"
            weight="bold"
            numberOfLines={1}
            style={
              styles.customerName
            }
          >
            {customerName}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            style={
              styles.customerLabel
            }
          >
            Customer
          </AppText>
        </View>

        <View
          style={
            styles.trailingIcon
          }
        >
          <AppIcon
            name="next"
            size="xs"
            color={
              Colors.textMuted
            }
          />
        </View>
      </Pressable>

      {/* ========================================================
          SERVICE
      ======================================================== */}

      <View
        style={
          styles.serviceRow
        }
      >
        <View
          style={[
            styles.serviceIcon,

            {
              backgroundColor:
                serviceIconBackground,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={
              serviceIcon
            }
            size={21}
            color={
              serviceIconColor
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
            numberOfLines={1}
            style={
              styles.rowLabel
            }
          >
            Service
          </AppText>

          <AppText
            variant="bodyMedium"
            weight="bold"
            numberOfLines={2}
            style={
              styles.rowValue
            }
          >
            {serviceName}
          </AppText>
        </View>
      </View>

      {/* ========================================================
          CUSTOMER REQUEST
      ======================================================== */}

      {description ||
      hasPhotos ? (
        <View
          style={
            styles.requestSection
          }
        >
          <View
            style={
              styles.sectionHeader
            }
          >
            <View
              style={
                styles.sectionIcon
              }
            >
              <AppIcon
                name="file"
                size="xs"
                color={
                  WorkerColors.primary
                }
              />
            </View>

            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.sectionTitle
              }
            >
              Customer request
            </AppText>
          </View>

          {description ? (
            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.description
              }
            >
              {description}
            </AppText>
          ) : null}

          {hasPhotos ? (
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
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
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={150}
                    recyclingKey={
                      photo
                    }
                    accessibilityLabel={`Request photo ${index + 1}`}
                    style={
                      styles.photo
                    }
                  />
                ),
              )}
            </ScrollView>
          ) : null}
        </View>
      ) : null}

      {/* ========================================================
          SERVICE LOCATION
      ======================================================== */}

      {isRemote ? (
        <View
          style={
            styles.compactSection
          }
        >
          <View
            style={
              styles.compactIcon
            }
          >
            <MaterialCommunityIcons
              name="laptop"
              size={20}
              color={
                WorkerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.compactContent
            }
          >
            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.rowLabel
              }
            >
              Service method
            </AppText>

            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.rowValue
              }
            >
              Remote service
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.compactDescription
              }
            >
              No physical service location is required.
            </AppText>
          </View>
        </View>
      ) : (
        <View
          style={
            styles.locationSection
          }
        >
          <View
            style={
              styles.locationHeader
            }
          >
            <View
              style={
                styles.locationMainIcon
              }
            >
              <AppIcon
                name="location"
                size="sm"
                color={
                  WorkerColors.primary
                }
              />
            </View>

            <View
              style={
                styles.locationMainContent
              }
            >
              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.locationLabel
                }
              >
                {locationTitle}
              </AppText>

              <AppText
                variant="bodyMedium"
                weight="bold"
                style={
                  styles.locationAddress
                }
              >
                {address}
              </AppText>

              {locationDescription ? (
                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.locationDescription
                  }
                >
                  {locationDescription}
                </AppText>
              ) : null}
            </View>
          </View>

          {/* ==================================================
              LOCATION ACTIONS
          ================================================== */}

          <View
            style={
              styles.locationActions
            }
          >
            <Pressable
              onPress={
                onLocationPress
              }
              accessibilityRole="button"
              accessibilityLabel={`View location. ${address}`}
              accessibilityHint="Open the fixed service location on the map"
              style={({
                pressed,
              }) => [
                styles.locationButton,

                showActiveTracking
                  ? styles.locationButtonHalf
                  : styles.locationButtonFull,

                pressed
                  ? styles.pressed
                  : null,
              ]}
            >
              <AppIcon
                name="location"
                role="worker"
                size="xs"
                color={
                  WorkerColors.primary
                }
              />

              <AppText
                variant="caption"
                weight="bold"
                numberOfLines={1}
                style={
                  styles.locationButtonText
                }
              >
                View Location
              </AppText>
            </Pressable>

            {showActiveTracking ? (
              <Pressable
                onPress={
                  onTrackCustomerPress
                }
                accessibilityRole="button"
                accessibilityLabel="Track customer"
                accessibilityHint={
                  canTrackCustomer
                    ? "Open the customer's live location"
                    : "Check whether the customer has started sharing a live location"
                }
                style={({
                  pressed,
                }) => [
                  styles.locationButton,
                  styles.locationButtonHalf,

                  canTrackCustomer
                    ? styles.liveTrackButton
                    : styles.waitingTrackButton,

                  pressed
                    ? styles.pressed
                    : null,
                ]}
              >
                <MaterialCommunityIcons
                  name="crosshairs-gps"
                  size={18}
                  color={
                    canTrackCustomer
                      ? WorkerColors.primary
                      : Colors.textSecondary
                  }
                />

                <AppText
                  variant="caption"
                  weight="bold"
                  numberOfLines={1}
                  style={[
                    styles.locationButtonText,

                    !canTrackCustomer
                      ? styles.waitingTrackText
                      : null,
                  ]}
                >
                  {canTrackCustomer
                    ? "Track Live"
                    : "Track Customer"}
                </AppText>
              </Pressable>
            ) : null}
          </View>

          {/* ==================================================
              PENDING TRACKING NOTE

              No large disabled tracking controls.
          ================================================== */}

          {pendingTracking ? (
            <View
              style={
                styles.trackingAvailability
              }
            >
              <MaterialCommunityIcons
                name="crosshairs-gps"
                size={16}
                color={
                  Colors.textSecondary
                }
              />

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.trackingAvailabilityText
                }
              >
                Live tracking becomes available after the offer is accepted.
              </AppText>
            </View>
          ) : null}

          {/* ==================================================
              ACTIVE TRACKING

              Render only while accepted / in-progress.
          ================================================== */}

          {showActiveTracking ? (
            <View
              style={
                styles.trackingPanel
              }
            >
              {/* ==============================================
                  CUSTOMER LIVE LOCATION
              ============================================== */}

              <View
                style={
                  styles.trackingItem
                }
              >
                <View
                  style={[
                    styles.trackingItemIcon,

                    canTrackCustomer
                      ? styles.trackingItemIconLive
                      : null,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="crosshairs-gps"
                    size={17}
                    color={
                      canTrackCustomer
                        ? WorkerColors.primary
                        : Colors.textSecondary
                    }
                  />
                </View>

                <View
                  style={
                    styles.trackingItemContent
                  }
                >
                  <View
                    style={
                      styles.trackingTitleRow
                    }
                  >
                    <AppText
                      variant="caption"
                      weight="semibold"
                      numberOfLines={1}
                      style={
                        styles.trackingItemTitle
                      }
                    >
                      Customer location
                    </AppText>

                    <TrackingBadge
                      status={
                        canTrackCustomer
                          ? "LIVE"
                          : "WAITING"
                      }
                    />
                  </View>

                  <AppText
                    variant="caption"
                    tone="secondary"
                    numberOfLines={2}
                    style={
                      styles.trackingItemDescription
                    }
                  >
                    {canTrackCustomer
                      ? `${customerName} is sharing a live location.`
                      : `Waiting for ${customerName} to share a live location.`}
                  </AppText>
                </View>
              </View>

              <View
                style={
                  styles.trackingDivider
                }
              />

              {/* ==============================================
                  WORKER LIVE LOCATION
              ============================================== */}

              <View
                style={
                  styles.trackingItem
                }
              >
                <View
                  style={[
                    styles.trackingItemIcon,

                    workerSharingPresentation.live
                      ? styles.trackingItemIconLive
                      : null,

                    workerSharingPresentation.attention
                      ? styles.trackingItemIconAttention
                      : null,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={
                      workerSharingPresentation.attention
                        ? "alert-circle-outline"
                        : workerSharingPresentation.live
                          ? "broadcast"
                          : "map-marker-radius-outline"
                    }
                    size={17}
                    color={
                      workerSharingPresentation.attention
                        ? Colors.warning
                        : workerSharingPresentation.live
                          ? WorkerColors.primary
                          : Colors.textSecondary
                    }
                  />
                </View>

                <View
                  style={
                    styles.trackingItemContent
                  }
                >
                  <View
                    style={
                      styles.trackingTitleRow
                    }
                  >
                    <AppText
                      variant="caption"
                      weight="semibold"
                      numberOfLines={1}
                      style={
                        styles.trackingItemTitle
                      }
                    >
                      Your location sharing
                    </AppText>

                    <TrackingBadge
                      status={
                        workerSharingPresentation.status
                      }
                    />
                  </View>

                  <AppText
                    variant="caption"
                    tone="secondary"
                    numberOfLines={2}
                    style={[
                      styles.trackingItemDescription,

                      workerSharingPresentation.attention
                        ? styles.trackingAttentionDescription
                        : null,
                    ]}
                  >
                    {workerSharingPresentation.message}
                  </AppText>
                </View>
              </View>
            </View>
          ) : null}
        </View>
      )}

      {/* ========================================================
          TIMING
      ======================================================== */}

      <View
        style={
          styles.timingRow
        }
      >
        <View
          style={[
            styles.timingIcon,

            timingPresentation.urgent
              ? styles.urgentIcon
              : null,
          ]}
        >
          <AppIcon
            name="clock"
            size="xs"
            color={
              timingPresentation.urgent
                ? Colors.warning
                : Colors.textSecondary
            }
          />
        </View>

        <View
          style={
            styles.timingContent
          }
        >
          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            style={
              styles.rowLabel
            }
          >
            Timing
          </AppText>

          <AppText
            variant="bodyMedium"
            weight="semibold"
            numberOfLines={1}
            style={[
              styles.rowValue,

              timingPresentation.urgent
                ? styles.urgentText
                : null,
            ]}
          >
            {timingPresentation.title}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            style={
              styles.timingSubtitle
            }
          >
            {timingPresentation.subtitle}
          </AppText>
        </View>
      </View>

      {/* ========================================================
          AGREED SERVICE AMOUNT
      ======================================================== */}

      {agreedPrice !==
      null ? (
        <View
          style={
            styles.agreedPriceCard
          }
          accessible
          accessibilityRole="summary"
          accessibilityLabel={`Agreed service amount ${formattedAgreedPrice}`}
        >
          <View
            style={
              styles.agreedPriceIcon
            }
          >
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={21}
              color={
                WorkerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.agreedPriceContent
            }
          >
            <AppText
              variant="caption"
              weight="semibold"
              numberOfLines={1}
              style={
                styles.agreedPriceLabel
              }
            >
              AGREED SERVICE AMOUNT
            </AppText>

            <AppText
              variant="heading3"
              weight="bold"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={
                0.8
              }
              style={
                styles.agreedPriceAmount
              }
            >
              {formattedAgreedPrice}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={2}
              style={
                styles.agreedPriceDescription
              }
            >
              Final amount agreed with the customer.
            </AppText>
          </View>
        </View>
      ) : null}
    </View>
  );
}

/* ==============================================================
   TRACKING BADGE
============================================================== */

function TrackingBadge({
  status,
}: {
  status:
    | "WAITING"
    | "STARTING"
    | "LIVE"
    | "ATTENTION";
}) {
  const live =
    status ===
    "LIVE";

  const attention =
    status ===
    "ATTENTION";

  return (
    <View
      style={[
        styles.statusBadge,

        live
          ? styles.statusBadgeLive
          : attention
            ? styles.statusBadgeAttention
            : styles.statusBadgeWaiting,
      ]}
    >
      {live ? (
        <View
          style={
            styles.liveDot
          }
        />
      ) : null}

      <AppText
        variant="caption"
        weight="bold"
        style={[
          styles.statusText,

          live
            ? styles.statusTextLive
            : attention
              ? styles.statusTextAttention
              : styles.statusTextWaiting,
        ]}
      >
        {status}
      </AppText>
    </View>
  );
}

/* ==============================================================
   MEMO
============================================================== */

WorkerOrderDetailsContent.displayName =
  "WorkerOrderDetailsContent";

export default memo(
  WorkerOrderDetailsContent,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width:
        "100%",

      backgroundColor:
        Colors.background,
    },

    /* ==========================================================
       CUSTOMER
    ========================================================== */

    customerRow: {
      minHeight:
        62,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,
    },

    customerPhoto: {
      width:
        44,

      height:
        44,

      flexShrink:
        0,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },

    customerPlaceholder: {
      width:
        44,

      height:
        44,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },

    customerInfo: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,

      marginRight:
        FixxamTokens.spacing.xs,
    },

    customerName: {
      color:
        Colors.textPrimary,
    },

    customerLabel: {
      marginTop:
        1,

      color:
        Colors.textMuted,
    },

    trailingIcon: {
      width:
        32,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    /* ==========================================================
       SERVICE
    ========================================================== */

    serviceRow: {
      minHeight:
        58,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,
    },

    serviceIcon: {
      width:
        38,

      height:
        38,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,
    },

    serviceInfo: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    rowLabel: {
      color:
        Colors.textMuted,
    },

    rowValue: {
      marginTop:
        1,

      color:
        Colors.textPrimary,
    },

    /* ==========================================================
       REQUEST
    ========================================================== */

    requestSection: {
      paddingVertical:
        FixxamTokens.spacing.sm,

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,
    },

    sectionHeader: {
      minHeight:
        30,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    sectionIcon: {
      width:
        28,

      height:
        28,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    sectionTitle: {
      flex:
        1,

      minWidth:
        0,

      color:
        Colors.textPrimary,
    },

    description: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight:
        19,

      color:
        Colors.textSecondary,
    },

    photos: {
      paddingTop:
        FixxamTokens.spacing.sm,

      paddingRight:
        FixxamTokens.spacing.sm,

      gap:
        FixxamTokens.spacing.sm,
    },

    photo: {
      width:
        82,

      height:
        82,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },

    /* ==========================================================
       REMOTE
    ========================================================== */

    compactSection: {
      minHeight:
        62,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,
    },

    compactIcon: {
      width:
        38,

      height:
        38,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    compactContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    compactDescription: {
      marginTop:
        2,

      lineHeight:
        17,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       LOCATION
    ========================================================== */

    locationSection: {
      paddingVertical:
        FixxamTokens.spacing.sm,

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,
    },

    locationHeader: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },

    locationMainIcon: {
      width:
        38,

      height:
        38,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    locationMainContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    locationLabel: {
      color:
        Colors.textMuted,
    },

    locationAddress: {
      marginTop:
        1,

      lineHeight:
        20,

      color:
        Colors.textPrimary,
    },

    locationDescription: {
      marginTop:
        3,

      lineHeight:
        17,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       LOCATION ACTIONS
    ========================================================== */

    locationActions: {
      width:
        "100%",

      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    locationButton: {
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

      gap:
        FixxamTokens.spacing.xs,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    locationButtonFull: {
      flex:
        1,
    },

    locationButtonHalf: {
      flex:
        1,

      minWidth:
        0,
    },

    liveTrackButton: {
      borderColor:
        WorkerColors.primary,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    waitingTrackButton: {
      borderColor:
        Colors.border,

      backgroundColor:
        Colors.disabledBackground,
    },

    locationButtonText: {
      flexShrink:
        1,

      color:
        WorkerColors.primary,
    },

    waitingTrackText: {
      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       TRACKING AVAILABILITY
    ========================================================== */

    trackingAvailability: {
      minHeight:
        40,

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },

    trackingAvailabilityText: {
      flex:
        1,

      minWidth:
        0,

      lineHeight:
        17,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       ACTIVE TRACKING PANEL
    ========================================================== */

    trackingPanel: {
      width:
        "100%",

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },

    trackingItem: {
      width:
        "100%",

      minHeight:
        58,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },

    trackingItemIcon: {
      width:
        32,

      height:
        32,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.background,
    },

    trackingItemIconLive: {
      backgroundColor:
        WorkerColors.primarySoft,
    },

    trackingItemIconAttention: {
      backgroundColor:
        Colors.warningSoft,
    },

    trackingItemContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    trackingTitleRow: {
      width:
        "100%",

      minHeight:
        22,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.xs,
    },

    trackingItemTitle: {
      flex:
        1,

      minWidth:
        0,

      color:
        Colors.textPrimary,
    },

    trackingItemDescription: {
      marginTop:
        2,

      lineHeight:
        17,

      color:
        Colors.textSecondary,
    },

    trackingAttentionDescription: {
      color:
        Colors.warning,
    },

    trackingDivider: {
      width:
        "100%",

      height:
        StyleSheet.hairlineWidth,

      backgroundColor:
        Colors.divider,
    },

    /* ==========================================================
       TRACKING BADGES
    ========================================================== */

    statusBadge: {
      minHeight:
        20,

      flexShrink:
        0,

      paddingHorizontal:
        7,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        4,

      borderRadius:
        FixxamTokens.radius.full,
    },

    statusBadgeLive: {
      backgroundColor:
        WorkerColors.primarySoft,
    },

    statusBadgeWaiting: {
      backgroundColor:
        Colors.background,
    },

    statusBadgeAttention: {
      backgroundColor:
        Colors.warningSoft,
    },

    liveDot: {
      width:
        5,

      height:
        5,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primary,
    },

    statusText: {
      fontSize:
        10,

      letterSpacing:
        0.2,
    },

    statusTextLive: {
      color:
        WorkerColors.primary,
    },

    statusTextWaiting: {
      color:
        Colors.textSecondary,
    },

    statusTextAttention: {
      color:
        Colors.warning,
    },

    /* ==========================================================
       TIMING
    ========================================================== */

    timingRow: {
      minHeight:
        62,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,
    },

    timingIcon: {
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

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    timingContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    timingSubtitle: {
      marginTop:
        2,

      lineHeight:
        17,

      color:
        Colors.textSecondary,
    },

    urgentIcon: {
      backgroundColor:
        Colors.warningSoft,
    },

    urgentText: {
      color:
        Colors.warning,
    },

    /* ==========================================================
       AGREED PRICE
    ========================================================== */

    agreedPriceCard: {
      width:
        "100%",

      minHeight:
        82,

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    agreedPriceIcon: {
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

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.background,
    },

    agreedPriceContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    agreedPriceLabel: {
      fontSize:
        10,

      color:
        WorkerColors.primary,

      letterSpacing:
        0.3,
    },

    agreedPriceAmount: {
      marginTop:
        1,

      color:
        Colors.textPrimary,
    },

    agreedPriceDescription: {
      marginTop:
        2,

      lineHeight:
        16,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       INTERACTION
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
  });