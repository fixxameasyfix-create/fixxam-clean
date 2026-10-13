import React, {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import * as Location from "expo-location";

import {
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

type Props = {
  serviceAddress: string;

  setServiceAddress: (
    value: string,
  ) => void;

  latitude: number | null;

  longitude: number | null;

  setLatitude: (
    value: number | null,
  ) => void;

  setLongitude: (
    value: number | null,
  ) => void;

  hourlyRate: string;

  setHourlyRate: (
    value: string,
  ) => void;

  phoneNumber: string;

  setPhoneNumber: (
    value: string,
  ) => void;
};

/* ============================================================
   HELPERS
============================================================ */

function formatHourlyRate(
  value: string,
): string {
  const digits =
    value.replace(
      /[^\d]/g,
      "",
    );

  if (!digits) {
    return "";
  }

  return Number(
    digits,
  ).toLocaleString(
    "en-NG",
  );
}

function buildAddressFromGeocode(
  result: Location.LocationGeocodedAddress,
): string {
  const parts = [
    result.name,
    result.street,
    result.streetNumber,
    result.district,
    result.subregion,
    result.city,
    result.region,
    result.postalCode,
    result.country,
  ]
    .map(
      value =>
        typeof value === "string"
          ? value.trim()
          : "",
    )
    .filter(Boolean);

  return Array.from(
    new Set(parts),
  ).join(", ");
}

/* ============================================================
   COMPONENT
============================================================ */

export default function WorkerServiceInfoStep({
  serviceAddress,
  setServiceAddress,

  latitude,
  longitude,

  setLatitude,
  setLongitude,

  hourlyRate,
  setHourlyRate,

  phoneNumber,
  setPhoneNumber,
}: Props) {
  const [
    locationLoading,
    setLocationLoading,
  ] = useState(false);

  const [
    locationError,
    setLocationError,
  ] = useState("");

  const hasLocation =
    latitude !== null &&
    longitude !== null;

  /* ==========================================================
     SERVICE ADDRESS
  ========================================================== */

  const handleServiceAddressChange =
    useCallback(
      (value: string) => {
        setServiceAddress(
          value,
        );

        /*
         * Manual address changes invalidate
         * the previous GPS/address pairing.
         */
        if (hasLocation) {
          setLatitude(null);
          setLongitude(null);
        }

        setLocationError("");
      },
      [
        hasLocation,
        setLatitude,
        setLongitude,
        setServiceAddress,
      ],
    );

  /* ==========================================================
     CURRENT LOCATION
  ========================================================== */

  const handleUseCurrentLocation =
    useCallback(
      async () => {
        if (
          locationLoading
        ) {
          return;
        }

        try {
          setLocationLoading(
            true,
          );

          setLocationError("");

          const permission =
            await Location.requestForegroundPermissionsAsync();

          if (
            permission.status !==
            "granted"
          ) {
            setLocationError(
              "Location permission was not granted. You can enter your service address manually.",
            );

            return;
          }

          const position =
            await Location.getCurrentPositionAsync(
              {
                accuracy:
                  Location.Accuracy.Balanced,
              },
            );

          const nextLatitude =
            position.coords.latitude;

          const nextLongitude =
            position.coords.longitude;

          if (
            !Number.isFinite(
              nextLatitude,
            ) ||
            !Number.isFinite(
              nextLongitude,
            )
          ) {
            setLocationError(
              "We could not determine a valid location. Please try again.",
            );

            return;
          }

          setLatitude(
            nextLatitude,
          );

          setLongitude(
            nextLongitude,
          );

          try {
            const addresses =
              await Location.reverseGeocodeAsync(
                {
                  latitude:
                    nextLatitude,
                  longitude:
                    nextLongitude,
                },
              );

            const firstAddress =
              addresses[0];

            if (
              firstAddress
            ) {
              const formattedAddress =
                buildAddressFromGeocode(
                  firstAddress,
                );

              if (
                formattedAddress
              ) {
                setServiceAddress(
                  formattedAddress,
                );

                setLocationError(
                  "",
                );

                return;
              }
            }

            setLocationError(
              "Your location was detected, but we could not automatically find the address. Please enter it manually.",
            );
          } catch (
            geocodeError
          ) {
            console.error(
              "WORKER_REVERSE_GEOCODING_ERROR:",
              geocodeError,
            );

            setLocationError(
              "Your GPS location was saved, but we could not automatically fill the address. Please enter the address manually.",
            );
          }
        } catch (error) {
          console.error(
            "WORKER_CURRENT_LOCATION_ERROR:",
            error,
          );

          setLocationError(
            "Unable to get your current location. Please check your location settings and try again.",
          );
        } finally {
          setLocationLoading(
            false,
          );
        }
      },
      [
        locationLoading,
        setLatitude,
        setLongitude,
        setServiceAddress,
      ],
    );

  /* ==========================================================
     HOURLY RATE
  ========================================================== */

  const handleHourlyRateChange =
    useCallback(
      (value: string) => {
        const digits =
          value.replace(
            /[^\d]/g,
            "",
          );

        if (!digits) {
          setHourlyRate("");
          return;
        }

        setHourlyRate(
          formatHourlyRate(
            value,
          ),
        );
      },
      [setHourlyRate],
    );

  /* ==========================================================
     PHONE NUMBER
  ========================================================== */

  const handlePhoneNumberChange =
    useCallback(
      (value: string) => {
        /*
         * Phone number is OPTIONAL.
         *
         * Empty value is intentionally
         * allowed and must not block
         * registration.
         */
        setPhoneNumber(
          value,
        );
      },
      [setPhoneNumber],
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <KeyboardAvoidingView
      style={
        styles.keyboardContainer
      }
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* ====================================================
            SERVICE ADDRESS
        ==================================================== */}

        <View
          style={
            styles.section
          }
        >
          <AppText
            variant="body"
            weight="semibold"
            style={
              styles.label
            }
          >
            Service Address
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.helper
            }
          >
            Use your GPS to fill this automatically, or enter and edit the address yourself.
          </AppText>

          <TextInput
            value={
              serviceAddress
            }
            onChangeText={
              handleServiceAddressChange
            }
            placeholder="Enter your service address"
            placeholderTextColor={
              Colors.textSecondary
            }
            multiline
            numberOfLines={3}
            maxLength={200}
            textAlignVertical="top"
            autoCapitalize="sentences"
            autoCorrect
            editable
            accessibilityLabel="Service address"
            style={
              styles.textArea
            }
          />

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.counter
            }
          >
            {serviceAddress.length}/200
          </AppText>
        </View>

        {/* ====================================================
            GPS
        ==================================================== */}

        <View
          style={
            styles.locationCard
          }
        >
          <View
            style={
              styles.locationHeader
            }
          >
            <View
              style={
                styles.locationText
              }
            >
              <AppText
                variant="body"
                weight="semibold"
              >
                Use My Current Location
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.locationHelper
                }
              >
                We'll use your phone's GPS to fill your service address automatically.
              </AppText>
            </View>

            <Pressable
              onPress={
                handleUseCurrentLocation
              }
              disabled={
                locationLoading
              }
              accessibilityRole="button"
              accessibilityLabel="Use my current location"
              accessibilityState={{
                disabled:
                  locationLoading,
              }}
              style={({
                pressed,
              }) => [
                styles.locationButton,

                pressed &&
                  styles.locationButtonPressed,

                locationLoading &&
                  styles.locationButtonDisabled,
              ]}
            >
              {locationLoading ? (
                <ActivityIndicator
                  size="small"
                  color={
                    Colors.textPrimary
                  }
                />
              ) : (
                <AppText
                  variant="caption"
                  weight="semibold"
                  role="worker"
                  tone="primary"
                >
                  {hasLocation
                    ? "Update Location"
                    : "Use Location"}
                </AppText>
              )}
            </Pressable>
          </View>

          {hasLocation ? (
            <View
              style={
                styles.locationStatus
              }
            >
              <View
                style={
                  styles.statusDot
                }
              />

              <AppText
                variant="caption"
                tone="secondary"
              >
                GPS location saved.
              </AppText>
            </View>
          ) : null}

          {locationError ? (
            <AppText
              variant="caption"
              style={
                styles.errorText
              }
            >
              {locationError}
            </AppText>
          ) : null}
        </View>

        {/* ====================================================
            HOURLY RATE
        ==================================================== */}

        <View
          style={
            styles.section
          }
        >
          <AppText
            variant="body"
            weight="semibold"
            style={
              styles.label
            }
          >
            Hourly Rate
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.helper
            }
          >
            Set the amount you charge per hour.
          </AppText>

          <View
            style={
              styles.rateInputContainer
            }
          >
            <AppText
              variant="body"
              weight="semibold"
              style={
                styles.currency
              }
            >
              ₦
            </AppText>

            <TextInput
              value={
                hourlyRate
              }
              onChangeText={
                handleHourlyRateChange
              }
              placeholder="0"
              placeholderTextColor={
                Colors.textSecondary
              }
              keyboardType="number-pad"
              inputMode="numeric"
              maxLength={11}
              editable
              accessibilityLabel="Hourly rate"
              style={
                styles.rateInput
              }
            />

            <AppText
              variant="caption"
              tone="secondary"
            >
              / hour
            </AppText>
          </View>
        </View>

        {/* ====================================================
            PHONE
        ==================================================== */}

        <View
          style={
            styles.section
          }
        >
          <AppText
            variant="body"
            weight="semibold"
            style={
              styles.label
            }
          >
            Phone Number{" "}
            <AppText
              variant="caption"
              tone="secondary"
            >
              (Optional)
            </AppText>
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.helper
            }
          >
            Add a phone number if you want customers to have an additional way to contact you. You can leave this blank and continue.
          </AppText>

          <TextInput
            value={
              phoneNumber
            }
            onChangeText={
              handlePhoneNumberChange
            }
            placeholder="Enter phone number (optional)"
            placeholderTextColor={
              Colors.textSecondary
            }
            keyboardType="phone-pad"
            inputMode="tel"
            maxLength={20}
            autoCapitalize="none"
            autoCorrect={false}
            editable
            accessibilityLabel="Phone number (optional)"
            style={
              styles.input
            }
          />
        </View>

        {/* ====================================================
            PRIVACY
        ==================================================== */}

        <View
          style={
            styles.privacyNote
          }
        >
          <AppText
            variant="caption"
            tone="secondary"
          >
            Your phone number is kept on your account and is not included in your public worker profile.
          </AppText>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    keyboardContainer: {
      flex: 1,
    },

    content: {
      paddingHorizontal:
        FixxamTokens.spacing.md,
      paddingTop:
        FixxamTokens.spacing.sm,
      paddingBottom:
        FixxamTokens.spacing.xl,
    },

    section: {
      marginBottom:
        FixxamTokens.spacing.lg,
    },

    label: {
      color:
        Colors.textPrimary,
    },

    helper: {
      marginTop:
        FixxamTokens.spacing.xs,
      marginBottom:
        FixxamTokens.spacing.sm,
    },

    input: {
      minHeight: 52,
      borderWidth: 1,
      borderColor:
        Colors.border,
      borderRadius:
        FixxamTokens.radius.md,
      backgroundColor:
        Colors.surface,
      color:
        Colors.textPrimary,
      paddingHorizontal:
        FixxamTokens.spacing.md,
      fontSize: 16,
    },

    textArea: {
      minHeight: 100,
      borderWidth: 1,
      borderColor:
        Colors.border,
      borderRadius:
        FixxamTokens.radius.md,
      backgroundColor:
        Colors.surface,
      color:
        Colors.textPrimary,
      paddingHorizontal:
        FixxamTokens.spacing.md,
      paddingTop:
        FixxamTokens.spacing.md,
      fontSize: 16,
    },

    counter: {
      textAlign:
        "right",
      marginTop:
        FixxamTokens.spacing.xs,
    },

    locationCard: {
      marginBottom:
        FixxamTokens.spacing.lg,
      padding:
        FixxamTokens.spacing.md,
      borderWidth: 1,
      borderColor:
        Colors.border,
      borderRadius:
        FixxamTokens.radius.md,
      backgroundColor:
        Colors.surface,
    },

    locationHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      gap:
        FixxamTokens.spacing.md,
    },

    locationText: {
      flex: 1,
    },

    locationHelper: {
      marginTop:
        FixxamTokens.spacing.xs,
    },

    locationButton: {
      minHeight: 42,
      paddingHorizontal:
        FixxamTokens.spacing.md,
      borderWidth: 1,
      borderColor:
        Colors.textPrimary,
      borderRadius:
        FixxamTokens.radius.sm,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    locationButtonPressed: {
      opacity: 0.7,
    },

    locationButtonDisabled: {
      opacity: 0.5,
    },

    locationStatus: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        FixxamTokens.spacing.xs,
      marginTop:
        FixxamTokens.spacing.md,
      paddingTop:
        FixxamTokens.spacing.sm,
      borderTopWidth: 1,
      borderTopColor:
        Colors.border,
    },

    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor:
        Colors.success,
    },

    errorText: {
      marginTop:
        FixxamTokens.spacing.sm,
      color:
        Colors.error,
    },

    rateInputContainer: {
      minHeight: 52,
      flexDirection:
        "row",
      alignItems:
        "center",
      borderWidth: 1,
      borderColor:
        Colors.border,
      borderRadius:
        FixxamTokens.radius.md,
      backgroundColor:
        Colors.surface,
      paddingHorizontal:
        FixxamTokens.spacing.md,
    },

    currency: {
      color:
        Colors.textPrimary,
      marginRight:
        FixxamTokens.spacing.xs,
    },

    rateInput: {
      flex: 1,
      color:
        Colors.textPrimary,
      fontSize: 16,
      paddingVertical: 0,
    },

    privacyNote: {
      padding:
        FixxamTokens.spacing.md,
      borderRadius:
        FixxamTokens.radius.md,
      backgroundColor:
        Colors.background,
    },
  });