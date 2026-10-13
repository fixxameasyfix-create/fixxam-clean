import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ShopCard } from '../../../components/find-shop/ShopCard';
import { ShopCategoryList } from '../../../components/find-shop/ShopCategoryList';
import { ShopLocationBar } from '../../../components/find-shop/ShopLocationBar';
import { ShopSearchBar } from '../../../components/find-shop/ShopSearchBar';

import {
  getShopCategory,
  isShopCategoryId,
} from '../../../constants/shopCategories';

import {
  subscribeToPublicShops,
} from '../../../services/shopService';

import type {
  FirebaseShop,
} from '../../../types/firebaseShop';

import type {
  Shop,
  ShopCategoryFilter,
} from '../../../types/shop';

/* ============================================================
   TYPES
============================================================ */

type CustomerCoordinates = {
  latitude: number;
  longitude: number;
};

type ScreenState =
  | 'loading'
  | 'ready'
  | 'error';

/* ============================================================
   CONSTANTS
============================================================ */

const DEFAULT_LOCATION_LABEL =
  'Set your location';

const EARTH_RADIUS_KM = 6371;

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

/* ============================================================
   COORDINATES
============================================================ */

function isValidCoordinates(
  coordinates: CustomerCoordinates,
): boolean {
  return (
    Number.isFinite(
      coordinates.latitude,
    ) &&
    Number.isFinite(
      coordinates.longitude,
    ) &&
    coordinates.latitude >= -90 &&
    coordinates.latitude <= 90 &&
    coordinates.longitude >= -180 &&
    coordinates.longitude <= 180
  );
}

function getShopCoordinates(
  shop: FirebaseShop,
): CustomerCoordinates | null {
  const coordinates:
    CustomerCoordinates = {
      latitude:
        shop.latitude,

      longitude:
        shop.longitude,
    };

  return isValidCoordinates(
    coordinates,
  )
    ? coordinates
    : null;
}

/* ============================================================
   DISTANCE
============================================================ */

function toRadians(
  value: number,
): number {
  return (
    value *
    (Math.PI / 180)
  );
}

function calculateDistanceKm(
  from: CustomerCoordinates,
  to: CustomerCoordinates,
): number {
  if (
    !isValidCoordinates(from) ||
    !isValidCoordinates(to)
  ) {
    return Number.POSITIVE_INFINITY;
  }

  const latitudeDifference =
    toRadians(
      to.latitude -
        from.latitude,
    );

  const longitudeDifference =
    toRadians(
      to.longitude -
        from.longitude,
    );

  const fromLatitude =
    toRadians(
      from.latitude,
    );

  const toLatitude =
    toRadians(
      to.latitude,
    );

  const a =
    Math.sin(
      latitudeDifference / 2,
    ) **
      2 +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(
        longitudeDifference / 2,
      ) **
        2;

  const normalizedA =
    Math.min(
      1,
      Math.max(
        0,
        a,
      ),
    );

  const c =
    2 *
    Math.atan2(
      Math.sqrt(
        normalizedA,
      ),
      Math.sqrt(
        1 -
          normalizedA,
      ),
    );

  return (
    EARTH_RADIUS_KM *
    c
  );
}

/* ============================================================
   BUSINESS HOURS
============================================================ */

function parseTimeToMinutes(
  value: string,
): number | null {
  if (
    typeof value !==
    'string'
  ) {
    return null;
  }

  const match =
    value
      .trim()
      .match(
        /^(\d{1,2}):(\d{2})$/,
      );

  if (!match) {
    return null;
  }

  const hour =
    Number(
      match[1],
    );

  const minute =
    Number(
      match[2],
    );

  if (
    !Number.isInteger(
      hour,
    ) ||
    !Number.isInteger(
      minute,
    ) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return (
    hour * 60 +
    minute
  );
}

function isShopOpenNow(
  shop: FirebaseShop,
  now = new Date(),
): boolean {
  if (!shop.isActive) {
    return false;
  }

  if (
    !Array.isArray(
      shop.businessHours,
    )
  ) {
    return false;
  }

  const currentDay =
    DAY_NAMES[
      now.getDay()
    ];

  const businessDay =
    shop.businessHours.find(
      (item) =>
        item?.day ===
        currentDay,
    );

  if (
    !businessDay ||
    !businessDay.isOpen
  ) {
    return false;
  }

  const openMinutes =
    parseTimeToMinutes(
      businessDay.openTime,
    );

  const closeMinutes =
    parseTimeToMinutes(
      businessDay.closeTime,
    );

  if (
    openMinutes === null ||
    closeMinutes === null ||
    openMinutes ===
      closeMinutes
  ) {
    return false;
  }

  const currentMinutes =
    now.getHours() *
      60 +
    now.getMinutes();

  /*
   * Normal same-day opening hours.
   * Example: 08:00 -> 18:00
   */
  if (
    closeMinutes >
    openMinutes
  ) {
    return (
      currentMinutes >=
        openMinutes &&
      currentMinutes <
        closeMinutes
    );
  }

  /*
   * Overnight opening hours.
   * Example: 20:00 -> 04:00
   */
  return (
    currentMinutes >=
      openMinutes ||
    currentMinutes <
      closeMinutes
  );
}

/* ============================================================
   LOCATION LABEL
============================================================ */

function buildLocationLabel(
  address:
    Location.LocationGeocodedAddress,
): string {
  const candidates = [
    address.district,
    address.subregion,
    address.city,
    address.region,
    address.country,
  ];

  const uniqueParts:
    string[] = [];

  for (
    const value
    of candidates
  ) {
    if (
      typeof value !==
      'string'
    ) {
      continue;
    }

    const normalized =
      value.trim();

    if (!normalized) {
      continue;
    }

    const alreadyExists =
      uniqueParts.some(
        (item) =>
          item.toLowerCase() ===
          normalized.toLowerCase(),
      );

    if (!alreadyExists) {
      uniqueParts.push(
        normalized,
      );
    }
  }

  return uniqueParts.join(
    ', ',
  );
}

/* ============================================================
   FIREBASE SHOP -> SHOP CARD MODEL
============================================================ */

function mapFirebaseShopToShop({
  shop,
  customerLocation,
  now,
}: {
  shop: FirebaseShop;
  customerLocation:
    CustomerCoordinates | null;
  now: Date;
}): Shop | null {
  const categoryId =
    typeof shop.category ===
    'string'
      ? shop.category.trim()
      : '';

  if (
    !isShopCategoryId(
      categoryId,
    )
  ) {
    return null;
  }

  const category =
    getShopCategory(
      categoryId,
    );

  if (!category) {
    return null;
  }

  const shopId =
    typeof shop.id ===
    'string'
      ? shop.id.trim()
      : '';

  const shopName =
    typeof shop.name ===
    'string'
      ? shop.name.trim()
      : '';

  if (
    !shopId ||
    !shopName
  ) {
    return null;
  }

  const shopCoordinates =
    getShopCoordinates(
      shop,
    );

  const distance =
    customerLocation &&
    shopCoordinates
      ? calculateDistanceKm(
          customerLocation,
          shopCoordinates,
        )
      : 0;

  const coverPhotoUrl =
    typeof shop.coverPhotoUrl ===
    'string'
      ? shop.coverPhotoUrl.trim()
      : '';

  const logoUrl =
    typeof shop.logoUrl ===
    'string'
      ? shop.logoUrl.trim()
      : '';

  const address =
    typeof shop.address ===
    'string'
      ? shop.address.trim()
      : '';

  const rating =
    Number.isFinite(
      shop.rating,
    )
      ? Math.min(
          5,
          Math.max(
            0,
            shop.rating,
          ),
        )
      : 0;

  const reviews =
    Number.isFinite(
      shop.reviewCount,
    )
      ? Math.max(
          0,
          Math.floor(
            shop.reviewCount,
          ),
        )
      : 0;

  return {
    id:
      shopId,

    name:
      shopName,

    category:
      category.id,

    serviceLabel:
      category.label,

    location:
      address,

    imageUrl:
      coverPhotoUrl,

    logoUrl:
      logoUrl ||
      coverPhotoUrl,

    rating,

    reviews,

    distanceKm:
      Number.isFinite(
        distance,
      )
        ? Math.max(
            0,
            distance,
          )
        : 0,

    isOpen:
      isShopOpenNow(
        shop,
        now,
      ),
  };
}

/* ============================================================
   SCREEN
============================================================ */

export default function FindShopScreen() {
  const [
    firebaseShops,
    setFirebaseShops,
  ] =
    useState<
      FirebaseShop[]
    >([]);

  const [
    searchQuery,
    setSearchQuery,
  ] =
    useState('');

  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState<ShopCategoryFilter>(
      'all',
    );

  const [
    favoriteShopIds,
    setFavoriteShopIds,
  ] =
    useState<Set<string>>(
      () => new Set(),
    );

  const [
    showOpenOnly,
    setShowOpenOnly,
  ] =
    useState(false);

  const [
    customerLocation,
    setCustomerLocation,
  ] =
    useState<CustomerCoordinates | null>(
      null,
    );

  const [
    locationLabel,
    setLocationLabel,
  ] =
    useState(
      DEFAULT_LOCATION_LABEL,
    );

  const [
    screenState,
    setScreenState,
  ] =
    useState<ScreenState>(
      'loading',
    );

  const [
    isLocating,
    setIsLocating,
  ] =
    useState(false);

  const [
    loadError,
    setLoadError,
  ] =
    useState('');

  const [
    retryKey,
    setRetryKey,
  ] =
    useState(0);

  const [
    currentTime,
    setCurrentTime,
  ] =
    useState(
      () => new Date(),
    );

  /* ==========================================================
     PUBLIC REALTIME SHOPS

     Authentication is intentionally NOT required here.

     Firestore permits public reads only for active shops.
     Creating a shop request remains protected separately.
  ========================================================== */

  useEffect(() => {
    let active = true;

    setLoadError('');

    setScreenState(
      'loading',
    );

    const unsubscribe =
      subscribeToPublicShops(
        (nextShops) => {
          if (!active) {
            return;
          }

          setFirebaseShops(
            Array.isArray(
              nextShops,
            )
              ? nextShops
              : [],
          );

          setLoadError('');

          setScreenState(
            'ready',
          );
        },

        (error) => {
          if (!active) {
            return;
          }

          console.error(
            'Unable to load public shops:',
            {
              code:
                typeof error ===
                  'object' &&
                error !== null &&
                'code' in error
                  ? error.code
                  : null,

              message:
                error instanceof Error
                  ? error.message
                  : String(error),
            },
          );

          setFirebaseShops(
            [],
          );

          setLoadError(
            'Unable to load shops. Check your connection and try again.',
          );

          setScreenState(
            'error',
          );
        },
      );

    return () => {
      active = false;

      unsubscribe();
    };
  }, [
    retryKey,
  ]);

  /* ==========================================================
     REFRESH OPEN/CLOSED STATE
  ========================================================== */

  useEffect(() => {
    const interval =
      setInterval(
        () => {
          setCurrentTime(
            new Date(),
          );
        },
        60_000,
      );

    return () => {
      clearInterval(
        interval,
      );
    };
  }, []);

  /* ==========================================================
     LOAD LAST KNOWN LOCATION

     This does NOT force a permission prompt.
     We only use location automatically when permission
     has already been granted.
  ========================================================== */

  useEffect(() => {
    let active = true;

    async function loadLastKnownLocation() {
      try {
        const permission =
          await Location.getForegroundPermissionsAsync();

        if (
          permission.status !==
          Location.PermissionStatus.GRANTED
        ) {
          return;
        }

        const position =
          await Location.getLastKnownPositionAsync();

        if (
          !active ||
          !position
        ) {
          return;
        }

        const nextLocation:
          CustomerCoordinates = {
            latitude:
              position.coords.latitude,

            longitude:
              position.coords.longitude,
          };

        if (
          !isValidCoordinates(
            nextLocation,
          )
        ) {
          return;
        }

        setCustomerLocation(
          nextLocation,
        );

        try {
          const addresses =
            await Location.reverseGeocodeAsync(
              nextLocation,
            );

          if (!active) {
            return;
          }

          const firstAddress =
            addresses[0];

          if (!firstAddress) {
            return;
          }

          const label =
            buildLocationLabel(
              firstAddress,
            );

          if (label) {
            setLocationLabel(
              label,
            );
          }
        } catch (error) {
          console.warn(
            'Unable to reverse geocode last known location:',
            error,
          );
        }
      } catch (error) {
        console.warn(
          'Unable to load last known location:',
          error,
        );
      }
    }

    void loadLastKnownLocation();

    return () => {
      active = false;
    };
  }, []);

  /* ==========================================================
     MAP FIREBASE SHOPS
  ========================================================== */

  const shops =
    useMemo<Shop[]>(
      () =>
        firebaseShops
          .filter(
            (shop) =>
              shop.isActive ===
              true,
          )
          .map(
            (shop) =>
              mapFirebaseShopToShop(
                {
                  shop,

                  customerLocation,

                  now:
                    currentTime,
                },
              ),
          )
          .filter(
            (
              shop,
            ): shop is Shop =>
              shop !== null,
          ),
      [
        customerLocation,
        currentTime,
        firebaseShops,
      ],
    );

  /* ==========================================================
     FILTERS + SORTING
  ========================================================== */

  const filteredShops =
    useMemo<Shop[]>(
      () => {
        const normalizedQuery =
          searchQuery
            .trim()
            .toLowerCase();

        const filtered =
          shops.filter(
            (shop) => {
              const matchesCategory =
                selectedCategory ===
                  'all' ||
                shop.category ===
                  selectedCategory;

              const shopName =
                shop.name
                  .trim()
                  .toLowerCase();

              const serviceLabel =
                shop.serviceLabel
                  .trim()
                  .toLowerCase();

              const shopLocation =
                shop.location
                  .trim()
                  .toLowerCase();

              const matchesSearch =
                !normalizedQuery ||
                shopName.includes(
                  normalizedQuery,
                ) ||
                serviceLabel.includes(
                  normalizedQuery,
                ) ||
                shopLocation.includes(
                  normalizedQuery,
                );

              const matchesOpen =
                !showOpenOnly ||
                shop.isOpen;

              return (
                matchesCategory &&
                matchesSearch &&
                matchesOpen
              );
            },
          );

        return filtered.sort(
          (a, b) => {
            if (
              customerLocation
            ) {
              const distanceDifference =
                a.distanceKm -
                b.distanceKm;

              if (
                Math.abs(
                  distanceDifference,
                ) > 0.01
              ) {
                return distanceDifference;
              }

              const ratingDifference =
                b.rating -
                a.rating;

              if (
                ratingDifference !==
                0
              ) {
                return ratingDifference;
              }
            }

            if (
              b.rating !==
              a.rating
            ) {
              return (
                b.rating -
                a.rating
              );
            }

            if (
              b.reviews !==
              a.reviews
            ) {
              return (
                b.reviews -
                a.reviews
              );
            }

            return (
              a.name.localeCompare(
                b.name,
              )
            );
          },
        );
      },
      [
        customerLocation,
        searchQuery,
        selectedCategory,
        shops,
        showOpenOnly,
      ],
    );

  /* ==========================================================
     FAVORITES
  ========================================================== */

  const toggleFavorite =
    useCallback(
      (
        shopId: string,
      ) => {
        const normalizedShopId =
          shopId.trim();

        if (
          !normalizedShopId
        ) {
          return;
        }

        setFavoriteShopIds(
          (current) => {
            const next =
              new Set(
                current,
              );

            if (
              next.has(
                normalizedShopId,
              )
            ) {
              next.delete(
                normalizedShopId,
              );
            } else {
              next.add(
                normalizedShopId,
              );
            }

            return next;
          },
        );
      },
      [],
    );

  /* ==========================================================
     VIEW SHOP

     Public action:
     No authentication check here.
  ========================================================== */

  const handleViewShop =
    useCallback(
      (
        shop: Shop,
      ) => {
        const shopId =
          shop.id.trim();

        if (!shopId) {
          return;
        }

        router.push({
          pathname:
            '/find-shop/[shopId]',

          params: {
            shopId,
          },
        });
      },
      [],
    );

  /* ==========================================================
     USE CURRENT LOCATION
  ========================================================== */

  const handleUseCurrentLocation =
    useCallback(
      async () => {
        if (isLocating) {
          return;
        }

        try {
          setIsLocating(
            true,
          );

          const permission =
            await Location.requestForegroundPermissionsAsync();

          if (
            permission.status !==
            Location.PermissionStatus.GRANTED
          ) {
            Alert.alert(
              'Location Permission Required',
              'Allow location access to see shops closest to you.',
            );

            return;
          }

          const servicesEnabled =
            await Location.hasServicesEnabledAsync();

          if (
            !servicesEnabled
          ) {
            Alert.alert(
              'Location Is Turned Off',
              'Turn on location services on your phone and try again.',
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

          const nextLocation:
            CustomerCoordinates = {
              latitude:
                position.coords.latitude,

              longitude:
                position.coords.longitude,
            };

          if (
            !isValidCoordinates(
              nextLocation,
            )
          ) {
            throw new Error(
              'Invalid location coordinates.',
            );
          }

          setCustomerLocation(
            nextLocation,
          );

          try {
            const addresses =
              await Location.reverseGeocodeAsync(
                nextLocation,
              );

            const firstAddress =
              addresses[0];

            if (
              firstAddress
            ) {
              const label =
                buildLocationLabel(
                  firstAddress,
                );

              setLocationLabel(
                label ||
                  'Current location',
              );
            } else {
              setLocationLabel(
                'Current location',
              );
            }
          } catch (error) {
            console.warn(
              'Unable to reverse geocode current location:',
              error,
            );

            setLocationLabel(
              'Current location',
            );
          }
        } catch (error) {
          console.error(
            'Unable to get customer location:',
            error,
          );

          Alert.alert(
            'Unable to Get Location',
            'We could not determine your current location. Please try again.',
          );
        } finally {
          setIsLocating(
            false,
          );
        }
      },
      [
        isLocating,
      ],
    );

  /* ==========================================================
     RESET FILTERS
  ========================================================== */

  const resetFilters =
    useCallback(
      () => {
        setSearchQuery('');

        setSelectedCategory(
          'all',
        );

        setShowOpenOnly(
          false,
        );
      },
      [],
    );

  /* ==========================================================
     RETRY
  ========================================================== */

  const handleRetry =
    useCallback(
      () => {
        setLoadError('');

        setScreenState(
          'loading',
        );

        setRetryKey(
          (current) =>
            current + 1,
        );
      },
      [],
    );

  /* ==========================================================
     LIST HEADER
  ========================================================== */

  const listHeader =
    useMemo(
      () => (
        <>
          <ShopSearchBar
            value={
              searchQuery
            }
            onChangeText={
              setSearchQuery
            }
            isFilterActive={
              showOpenOnly
            }
            onFilterPress={() =>
              setShowOpenOnly(
                (current) =>
                  !current,
              )
            }
          />

          <ShopLocationBar
            location={
              isLocating
                ? 'Finding your location...'
                : locationLabel
            }
            onUseCurrentLocation={
              handleUseCurrentLocation
            }
          />

          <ShopCategoryList
            selectedCategory={
              selectedCategory
            }
            onSelectCategory={
              setSelectedCategory
            }
          />

          {!customerLocation ? (
            <View
              style={
                styles.locationNotice
              }
            >
              <Ionicons
                name="navigate-outline"
                size={19}
                color="#1677FF"
              />

              <Text
                style={
                  styles.locationNoticeText
                }
              >
                Use your location to
                see the nearest shops
                first.
              </Text>
            </View>
          ) : (
            <View
              style={
                styles.locationActiveNotice
              }
            >
              <Ionicons
                name="location"
                size={18}
                color="#16A34A"
              />

              <Text
                style={
                  styles.locationActiveText
                }
              >
                Shops are sorted by
                distance from your
                location.
              </Text>
            </View>
          )}
        </>
      ),
      [
        customerLocation,
        handleUseCurrentLocation,
        isLocating,
        locationLabel,
        searchQuery,
        selectedCategory,
        showOpenOnly,
      ],
    );

  /* ==========================================================
     LOADING
  ========================================================== */

  if (
    screenState ===
    'loading'
  ) {
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
        <Header />

        <View
          style={
            styles.stateContainer
          }
        >
          <View
            style={
              styles.loadingIcon
            }
          >
            <ActivityIndicator
              size="large"
              color="#1677FF"
              accessibilityLabel="Loading shops"
            />
          </View>

          <Text
            style={
              styles.stateTitle
            }
          >
            Finding Shops
          </Text>

          <Text
            style={
              styles.stateText
            }
          >
            Loading available service
            shops...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (
    screenState ===
    'error'
  ) {
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
        <Header />

        <View
          style={
            styles.stateContainer
          }
        >
          <View
            style={
              styles.errorIcon
            }
          >
            <Ionicons
              name="cloud-offline-outline"
              size={44}
              color="#DC2626"
            />
          </View>

          <Text
            style={
              styles.stateTitle
            }
          >
            Unable to Load Shops
          </Text>

          <Text
            style={
              styles.stateText
            }
          >
            {loadError ||
              'Unable to load shops. Please try again.'}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry loading shops"
            onPress={
              handleRetry
            }
            style={({
              pressed,
            }) => [
              styles.retryButton,

              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="refresh"
              size={20}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.retryButtonText
              }
            >
              Try Again
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  /* ==========================================================
     MAIN
  ========================================================== */

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
      <Header />

      <FlatList
        data={
          filteredShops
        }
        keyExtractor={(
          item,
        ) => item.id}
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.listContent
        }
        ListHeaderComponent={
          listHeader
        }
        renderItem={({
          item,
        }) => (
          <ShopCard
            shop={item}
            isFavorite={
              favoriteShopIds.has(
                item.id,
              )
            }
            onFavoritePress={() =>
              toggleFavorite(
                item.id,
              )
            }
            onViewShop={() =>
              handleViewShop(
                item,
              )
            }
          />
        )}
        ListEmptyComponent={
          <View
            style={
              styles.emptyContainer
            }
          >
            <View
              style={
                styles.emptyIcon
              }
            >
              <Ionicons
                name="storefront-outline"
                size={38}
                color="#64748B"
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              No shops found
            </Text>

            <Text
              style={
                styles.emptyDescription
              }
            >
              {firebaseShops.length ===
              0
                ? 'There are no active shops available yet.'
                : 'Try another shop name, location, service or category.'}
            </Text>

            {firebaseShops.length >
            0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Reset shop filters"
                onPress={
                  resetFilters
                }
                style={({
                  pressed,
                }) => [
                  styles.resetButton,

                  pressed &&
                    styles.pressed,
                ]}
              >
                <Ionicons
                  name="refresh-outline"
                  size={18}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.resetButtonText
                  }
                >
                  Reset filters
                </Text>
              </Pressable>
            ) : null}
          </View>
        }
      />
    </SafeAreaView>
  );
}

/* ============================================================
   HEADER
============================================================ */

function Header() {
  return (
    <View
      style={
        styles.header
      }
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
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
          size={27}
          color="#1557A0"
        />
      </Pressable>

      <View
        style={
          styles.headerText
        }
      >
        <Text
          style={
            styles.title
          }
        >
          Find a Shop Near You
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          Discover trusted service
          shops close to you.
        </Text>
      </View>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,

      backgroundColor:
        '#F8FAFC',
    },

    header: {
      flexDirection:
        'row',

      alignItems:
        'center',

      gap: 14,

      paddingHorizontal: 20,

      paddingTop: 8,

      paddingBottom: 16,
    },

    backButton: {
      width: 56,
      height: 56,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius: 20,

      backgroundColor:
        '#EFF6FF',
    },

    headerText: {
      flex: 1,

      minWidth: 0,
    },

    title: {
      fontSize: 24,

      lineHeight: 30,

      fontWeight:
        '800',

      color:
        '#0F172A',
    },

    subtitle: {
      marginTop: 2,

      fontSize: 15,

      lineHeight: 21,

      color:
        '#64748B',
    },

    listContent: {
      flexGrow: 1,

      paddingHorizontal: 20,

      paddingBottom: 40,
    },

    locationNotice: {
      flexDirection:
        'row',

      alignItems:
        'center',

      gap: 8,

      marginTop: 4,

      marginBottom: 10,

      padding: 11,

      borderRadius: 14,

      backgroundColor:
        '#EFF6FF',
    },

    locationNoticeText: {
      flex: 1,

      fontSize: 12,

      lineHeight: 18,

      color:
        '#475569',
    },

    locationActiveNotice: {
      flexDirection:
        'row',

      alignItems:
        'center',

      gap: 8,

      marginTop: 4,

      marginBottom: 10,

      padding: 11,

      borderRadius: 14,

      backgroundColor:
        '#F0FDF4',
    },

    locationActiveText: {
      flex: 1,

      fontSize: 12,

      lineHeight: 18,

      color:
        '#166534',
    },

    emptyContainer: {
      alignItems:
        'center',

      paddingHorizontal: 24,

      paddingVertical: 64,
    },

    emptyIcon: {
      width: 76,
      height: 76,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius: 28,

      backgroundColor:
        '#F1F5F9',
    },

    emptyTitle: {
      marginTop: 16,

      fontSize: 20,

      fontWeight:
        '800',

      color:
        '#0F172A',
    },

    emptyDescription: {
      maxWidth: 320,

      marginTop: 7,

      textAlign:
        'center',

      fontSize: 15,

      lineHeight: 22,

      color:
        '#64748B',
    },

    resetButton: {
      minHeight: 46,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap: 7,

      marginTop: 18,

      paddingHorizontal: 22,

      borderRadius: 16,

      backgroundColor:
        '#1677FF',
    },

    resetButtonText: {
      fontSize: 15,

      fontWeight:
        '700',

      color:
        '#FFFFFF',
    },

    stateContainer: {
      flex: 1,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal: 30,

      paddingBottom: 70,
    },

    loadingIcon: {
      width: 92,
      height: 92,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius: 30,

      backgroundColor:
        '#EFF6FF',
    },

    errorIcon: {
      width: 92,
      height: 92,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius: 30,

      backgroundColor:
        '#FEF2F2',
    },

    stateTitle: {
      marginTop: 18,

      textAlign:
        'center',

      fontSize: 21,

      fontWeight:
        '800',

      color:
        '#0F172A',
    },

    stateText: {
      maxWidth: 320,

      marginTop: 7,

      textAlign:
        'center',

      fontSize: 14,

      lineHeight: 21,

      color:
        '#64748B',
    },

    retryButton: {
      minHeight: 50,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap: 8,

      marginTop: 20,

      paddingHorizontal: 22,

      borderRadius: 16,

      backgroundColor:
        '#1677FF',
    },

    retryButtonText: {
      fontSize: 14,

      fontWeight:
        '800',

      color:
        '#FFFFFF',
    },

    pressed: {
      opacity: 0.72,
    },
  });