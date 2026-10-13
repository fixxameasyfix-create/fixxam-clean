import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, {
  useCallback,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useShopRegistration } from '../../../../contexts/ShopRegistrationContext';

function buildAddress(
  location: Location.LocationGeocodedAddress,
) {
  return [
    location.name,
    location.street,
    location.district,
    location.subregion,
    location.city,
    location.region,
    location.postalCode,
    location.country,
  ]
    .filter(
      (
        value,
      ): value is string =>
        typeof value === 'string' &&
        value.trim().length > 0,
    )
    .map((value) =>
      value.trim(),
    )
    .filter(
      (value, index, items) =>
        items.indexOf(value) === index,
    )
    .join(', ');
}

export default function ShopLocationScreen() {
  const {
    draft,
    updateDraft,
  } = useShopRegistration();

  const [
    address,
    setAddress,
  ] = useState(
    draft.address ?? '',
  );

  const [
    latitude,
    setLatitude,
  ] = useState<number | null>(
    draft.latitude ?? null,
  );

  const [
    longitude,
    setLongitude,
  ] = useState<number | null>(
    draft.longitude ?? null,
  );

  const [
    isLocating,
    setIsLocating,
  ] = useState(false);

  const [
    isSearchingAddress,
    setIsSearchingAddress,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  const locationSelected =
    latitude !== null &&
    longitude !== null;

  /* ==========================================================
     REVERSE GEOCODE
  ========================================================== */

  const reverseGeocode =
    useCallback(
      async (
        lat: number,
        lng: number,
      ) => {
        try {
          const results =
            await Location.reverseGeocodeAsync({
              latitude: lat,
              longitude: lng,
            });

          const first =
            results[0];

          if (!first) {
            return null;
          }

          const resolvedAddress =
            buildAddress(first);

          return (
            resolvedAddress ||
            null
          );
        } catch (error) {
          console.error(
            'FIXXAM_SHOP_REVERSE_GEOCODE_ERROR:',
            error,
          );

          return null;
        }
      },
      [],
    );

  /* ==========================================================
     CURRENT LOCATION
  ========================================================== */

  const handleUseCurrentLocation =
    useCallback(async () => {
      if (
        isLocating ||
        isSearchingAddress
      ) {
        return;
      }

      try {
        setIsLocating(true);
        setError('');

        const permission =
          await Location.requestForegroundPermissionsAsync();

        if (
          permission.status !==
          Location.PermissionStatus.GRANTED
        ) {
          Alert.alert(
            'Location Permission Required',
            'Allow Fixxam to access your location so your shop can be shown accurately to customers.',
          );

          return;
        }

        const servicesEnabled =
          await Location.hasServicesEnabledAsync();

        if (!servicesEnabled) {
          Alert.alert(
            'Location Is Turned Off',
            'Turn on location services on your phone and try again.',
          );

          return;
        }

        const position =
          await Location.getCurrentPositionAsync({
            accuracy:
              Location.Accuracy.Balanced,
          });

        const {
          latitude:
            currentLatitude,
          longitude:
            currentLongitude,
        } = position.coords;

        setLatitude(
          currentLatitude,
        );

        setLongitude(
          currentLongitude,
        );

        const resolvedAddress =
          await reverseGeocode(
            currentLatitude,
            currentLongitude,
          );

        if (
          resolvedAddress
        ) {
          setAddress(
            resolvedAddress,
          );
        } else if (
          !address.trim()
        ) {
          Alert.alert(
            'Location Captured',
            'Your coordinates were captured successfully. Please enter your shop address manually.',
          );
        }
      } catch (error) {
        console.error(
          'FIXXAM_SHOP_CURRENT_LOCATION_ERROR:',
          error,
        );

        Alert.alert(
          'Unable to Get Location',
          'We could not determine your current location. You can enter your shop address and use Find This Address instead.',
        );
      } finally {
        setIsLocating(false);
      }
    }, [
      address,
      isLocating,
      isSearchingAddress,
      reverseGeocode,
    ]);

  /* ==========================================================
     GEOCODE MANUAL ADDRESS
  ========================================================== */

  const handleFindAddress =
    useCallback(async () => {
      if (
        isLocating ||
        isSearchingAddress
      ) {
        return;
      }

      const trimmedAddress =
        address.trim();

      if (
        trimmedAddress.length < 5
      ) {
        setError(
          'Enter a complete shop address first.',
        );

        return;
      }

      try {
        setIsSearchingAddress(
          true,
        );

        setError('');

        const results =
          await Location.geocodeAsync(
            trimmedAddress,
          );

        const first =
          results[0];

        if (!first) {
          setLatitude(null);
          setLongitude(null);

          setError(
            'We could not find this address. Add more details such as area, city and state.',
          );

          return;
        }

        setLatitude(
          first.latitude,
        );

        setLongitude(
          first.longitude,
        );

        const resolvedAddress =
          await reverseGeocode(
            first.latitude,
            first.longitude,
          );

        if (
          resolvedAddress
        ) {
          setAddress(
            resolvedAddress,
          );
        }
      } catch (error) {
        console.error(
          'FIXXAM_SHOP_ADDRESS_GEOCODE_ERROR:',
          error,
        );

        setError(
          'Unable to find this address right now. Please check your internet connection and try again.',
        );
      } finally {
        setIsSearchingAddress(
          false,
        );
      }
    }, [
      address,
      isLocating,
      isSearchingAddress,
      reverseGeocode,
    ]);

  /* ==========================================================
     ADDRESS INPUT
  ========================================================== */

  const handleAddressChange = (
    value: string,
  ) => {
    setAddress(value);

    /*
     * The coordinates belong to the previous
     * confirmed address, so invalidate them
     * when the user changes the address.
     */
    if (locationSelected) {
      setLatitude(null);
      setLongitude(null);
    }

    if (error) {
      setError('');
    }
  };

  /* ==========================================================
     NEXT
  ========================================================== */

  const handleNext = () => {
    const trimmedAddress =
      address.trim();

    if (
      trimmedAddress.length < 5
    ) {
      setError(
        'Enter your complete shop address.',
      );

      return;
    }

    if (
      latitude === null ||
      longitude === null
    ) {
      setError(
        'Confirm your shop location using Find This Address or Use My Current Location.',
      );

      return;
    }

    updateDraft({
      address:
        trimmedAddress,

      latitude,

      longitude,
    });

    router.push(
      '/my-shop/create/photos',
    );
  };

  return (
    <SafeAreaView
      edges={[
        'top',
        'bottom',
      ]}
      style={
        styles.safeArea
      }
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS ===
          'ios'
            ? 'padding'
            : undefined
        }
      >
        {/* Header */}
        <View
          style={
            styles.header
          }
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={10}
            onPress={() =>
              router.back()
            }
            style={({
              pressed,
            }) => [
              styles.backButton,

              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={25}
              color="#1677FF"
            />
          </Pressable>

          <Text
            style={
              styles.headerTitle
            }
          >
            Create My Shop
          </Text>

          <View
            style={
              styles.headerSpacer
            }
          />
        </View>

        <ProgressIndicator />

        <ScrollView
          style={styles.flex}
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.content
          }
        >
          <Text
            style={styles.title}
          >
            Shop Location
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Set the physical location
            customers can use to find
            your shop.
          </Text>

          {/* Address */}
          <Text
            style={styles.label}
          >
            Shop Address
          </Text>

          <View
            style={[
              styles.inputContainer,

              error &&
                !address.trim() &&
                styles.inputError,
            ]}
          >
            <Ionicons
              name="location-outline"
              size={22}
              color="#1677FF"
            />

            <TextInput
              value={address}
              onChangeText={
                handleAddressChange
              }
              placeholder="e.g. Zoo Road, Kano, Kano State"
              placeholderTextColor="#94A3B8"
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={
                handleFindAddress
              }
              style={
                styles.input
              }
            />
          </View>

          <Text
            style={
              styles.addressHelper
            }
          >
            Include your street or
            area, city and state for
            better accuracy.
          </Text>

          {/* Find Address */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Find this shop address"
            disabled={
              isSearchingAddress ||
              isLocating
            }
            onPress={
              handleFindAddress
            }
            style={({
              pressed,
            }) => [
              styles.findAddressButton,

              (
                isSearchingAddress ||
                isLocating
              ) &&
                styles.buttonDisabled,

              pressed &&
                styles.pressed,
            ]}
          >
            {isSearchingAddress ? (
              <ActivityIndicator
                size="small"
                color="#1677FF"
              />
            ) : (
              <Ionicons
                name="search-outline"
                size={21}
                color="#1677FF"
              />
            )}

            <Text
              style={
                styles.findAddressButtonText
              }
            >
              {isSearchingAddress
                ? 'Finding address...'
                : 'Find This Address'}
            </Text>
          </Pressable>

          {/* Divider */}
          <View
            style={
              styles.dividerRow
            }
          >
            <View
              style={
                styles.dividerLine
              }
            />

            <Text
              style={
                styles.dividerText
              }
            >
              OR
            </Text>

            <View
              style={
                styles.dividerLine
              }
            />
          </View>

          {/* Current Location */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Use my current location"
            disabled={
              isLocating ||
              isSearchingAddress
            }
            onPress={
              handleUseCurrentLocation
            }
            style={({
              pressed,
            }) => [
              styles.locationButton,

              (
                isLocating ||
                isSearchingAddress
              ) &&
                styles.buttonDisabled,

              pressed &&
                styles.pressed,
            ]}
          >
            {isLocating ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <Ionicons
                name="locate"
                size={22}
                color="#FFFFFF"
              />
            )}

            <Text
              style={
                styles.locationButtonText
              }
            >
              {isLocating
                ? 'Finding your location...'
                : 'Use My Current Location'}
            </Text>
          </Pressable>

          {/* Location Preview */}
          <View
            style={[
              styles.locationCard,

              locationSelected
                ? styles.locationCardSuccess
                : styles.locationCardIdle,
            ]}
          >
            <View
              style={[
                styles.locationIcon,

                locationSelected
                  ? styles.locationIconSuccess
                  : styles.locationIconIdle,
              ]}
            >
              <Ionicons
                name={
                  locationSelected
                    ? 'checkmark-circle'
                    : 'location-outline'
                }
                size={28}
                color={
                  locationSelected
                    ? '#16A34A'
                    : '#64748B'
                }
              />
            </View>

            <View
              style={
                styles.locationCardContent
              }
            >
              <Text
                style={[
                  styles.locationCardTitle,

                  locationSelected &&
                    styles.locationCardTitleSuccess,
                ]}
              >
                {locationSelected
                  ? 'Shop location confirmed'
                  : 'Location not confirmed'}
              </Text>

              {locationSelected &&
              latitude !== null &&
              longitude !== null ? (
                <>
                  <Text
                    style={
                      styles.locationAddress
                    }
                    numberOfLines={
                      3
                    }
                  >
                    {address.trim() ||
                      'Shop location'}
                  </Text>

                  <View
                    style={
                      styles.coordinateRow
                    }
                  >
                    <Ionicons
                      name="navigate-outline"
                      size={15}
                      color="#64748B"
                    />

                    <Text
                      style={
                        styles.coordinates
                      }
                    >
                      {latitude.toFixed(
                        5,
                      )}
                      ,{' '}
                      {longitude.toFixed(
                        5,
                      )}
                    </Text>
                  </View>
                </>
              ) : (
                <Text
                  style={
                    styles.locationCardDescription
                  }
                >
                  Search your address or
                  use your current
                  location to confirm
                  coordinates.
                </Text>
              )}
            </View>
          </View>

          {/* Privacy */}
          <View
            style={
              styles.infoCard
            }
          >
            <Ionicons
              name="information-circle-outline"
              size={21}
              color="#1677FF"
            />

            <Text
              style={
                styles.infoText
              }
            >
              Your shop location helps
              customers find nearby
              services and estimate
              distance.
            </Text>
          </View>

          {/* Error */}
          {error ? (
            <View
              style={
                styles.errorRow
              }
            >
              <Ionicons
                name="alert-circle-outline"
                size={17}
                color="#DC2626"
              />

              <Text
                style={
                  styles.errorText
                }
              >
                {error}
              </Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Footer */}
        <View
          style={styles.footer}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Continue to shop photos"
            onPress={handleNext}
            style={({
              pressed,
            }) => [
              styles.nextButton,

              pressed &&
                styles.pressed,
            ]}
          >
            <Text
              style={
                styles.nextButtonText
              }
            >
              Next
            </Text>

            <Ionicons
              name="arrow-forward"
              size={21}
              color="#FFFFFF"
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ProgressIndicator() {
  return (
    <View
      style={
        styles.progressContainer
      }
    >
      {[
        1,
        2,
        3,
        4,
        5,
        6,
      ].map(
        (
          step,
          index,
        ) => {
          const completed =
            step < 2;

          const active =
            step === 2;

          return (
            <React.Fragment
              key={step}
            >
              <View
                style={[
                  styles.progressDot,

                  completed &&
                    styles.progressDotCompleted,

                  active &&
                    styles.progressDotActive,
                ]}
              >
                {completed && (
                  <Ionicons
                    name="checkmark"
                    size={10}
                    color="#FFFFFF"
                  />
                )}
              </View>

              {index < 5 && (
                <View
                  style={[
                    styles.progressLine,

                    completed &&
                      styles.progressLineCompleted,
                  ]}
                />
              )}
            </React.Fragment>
          );
        },
      )}
    </View>
  );
}

const styles =
  StyleSheet.create({
    flex: {
      flex: 1,
    },

    safeArea: {
      flex: 1,
      backgroundColor:
        '#F8FAFC',
    },

    header: {
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
    },

    backButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 17,
      backgroundColor:
        '#EFF6FF',
    },

    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '800',
      color: '#0F172A',
    },

    headerSpacer: {
      width: 44,
    },

    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 34,
      paddingVertical: 12,
    },

    progressDot: {
      width: 11,
      height: 11,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 7,
      backgroundColor:
        '#DCE5EF',
    },

    progressDotActive: {
      width: 14,
      height: 14,
      backgroundColor:
        '#1677FF',
    },

    progressDotCompleted: {
      width: 14,
      height: 14,
      backgroundColor:
        '#1677FF',
    },

    progressLine: {
      flex: 1,
      height: 2,
      backgroundColor:
        '#DCE5EF',
    },

    progressLineCompleted: {
      backgroundColor:
        '#1677FF',
    },

    content: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 28,
    },

    title: {
      fontSize: 25,
      fontWeight: '800',
      color: '#0F172A',
    },

    subtitle: {
      marginTop: 5,
      fontSize: 15,
      lineHeight: 21,
      color: '#64748B',
    },

    label: {
      marginTop: 27,
      marginBottom: 8,
      fontSize: 15,
      fontWeight: '700',
      color: '#0F172A',
    },

    inputContainer: {
      minHeight: 58,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 15,
      borderWidth: 1,
      borderColor:
        '#D7E0EB',
      borderRadius: 16,
      backgroundColor:
        '#FFFFFF',
    },

    inputError: {
      borderColor:
        '#EF4444',
    },

    input: {
      flex: 1,
      minHeight: 56,
      paddingVertical: 0,
      fontSize: 15,
      color: '#0F172A',
    },

    addressHelper: {
      marginTop: 7,
      fontSize: 12,
      lineHeight: 18,
      color: '#64748B',
    },

    findAddressButton: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 8,
      marginTop: 13,
      borderWidth: 1,
      borderColor:
        '#BFDBFE',
      borderRadius: 16,
      backgroundColor:
        '#EFF6FF',
    },

    findAddressButtonText: {
      fontSize: 14,
      fontWeight: '800',
      color: '#1677FF',
    },

    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginVertical: 18,
    },

    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor:
        '#E2E8F0',
    },

    dividerText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#94A3B8',
    },

    locationButton: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 9,
      borderRadius: 17,
      backgroundColor:
        '#1677FF',
    },

    locationButtonText: {
      fontSize: 15,
      fontWeight: '800',
      color: '#FFFFFF',
    },

    buttonDisabled: {
      opacity: 0.62,
    },

    locationCard: {
      flexDirection: 'row',
      alignItems:
        'flex-start',
      gap: 12,
      marginTop: 18,
      padding: 15,
      borderWidth: 1,
      borderRadius: 18,
    },

    locationCardIdle: {
      borderColor:
        '#E2E8F0',
      backgroundColor:
        '#FFFFFF',
    },

    locationCardSuccess: {
      borderColor:
        '#BBF7D0',
      backgroundColor:
        '#F0FDF4',
    },

    locationIcon: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 16,
    },

    locationIconIdle: {
      backgroundColor:
        '#F1F5F9',
    },

    locationIconSuccess: {
      backgroundColor:
        '#DCFCE7',
    },

    locationCardContent: {
      flex: 1,
      minWidth: 0,
    },

    locationCardTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: '#475569',
    },

    locationCardTitleSuccess: {
      color: '#166534',
    },

    locationAddress: {
      marginTop: 5,
      fontSize: 13,
      lineHeight: 19,
      color: '#334155',
    },

    locationCardDescription: {
      marginTop: 4,
      fontSize: 13,
      lineHeight: 19,
      color: '#64748B',
    },

    coordinateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 7,
    },

    coordinates: {
      fontSize: 12,
      color: '#64748B',
    },

    infoCard: {
      flexDirection: 'row',
      alignItems:
        'flex-start',
      gap: 9,
      marginTop: 15,
      padding: 13,
      borderRadius: 15,
      backgroundColor:
        '#EFF6FF',
    },

    infoText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 18,
      color: '#475569',
    },

    errorRow: {
      flexDirection: 'row',
      alignItems:
        'flex-start',
      gap: 6,
      marginTop: 12,
    },

    errorText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 18,
      color: '#DC2626',
    },

    footer: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 14,
      borderTopWidth: 1,
      borderTopColor:
        '#E2E8F0',
      backgroundColor:
        '#FFFFFF',
    },

    nextButton: {
      minHeight: 58,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 9,
      borderRadius: 18,
      backgroundColor:
        '#1677FF',
    },

    nextButtonText: {
      fontSize: 17,
      fontWeight: '800',
      color: '#FFFFFF',
    },

    pressed: {
      opacity: 0.72,
    },
  });