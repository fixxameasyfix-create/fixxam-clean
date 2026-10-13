import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ServiceSelectionModal } from '../../../../components/find-shop/details/ServiceSelectionModal';
import { ShopDetailTabs } from '../../../../components/find-shop/details/ShopDetailTabs';

import {
  ShopAboutSection,
  ShopLocationSection,
  ShopOpeningHoursSection,
  ShopPhotosSection,
  ShopReviewsSection,
  ShopServicesSection,
} from '../../../../components/find-shop/details/ShopDetailSections';

import { ShopProfileHeader } from '../../../../components/find-shop/details/ShopProfileHeader';

import {
  getShopCategory,
  isShopCategoryId,
} from '../../../../constants/shopCategories';

import {
  subscribeToShopServices,
  subscribeToWorkerShop,
} from '../../../../services/shopService';

import {
  calculateDistance,
} from '../../../../utils/location/calculateDistance';

import type {
  FirebaseShop,
  FirebaseShopService,
} from '../../../../types/firebaseShop';

import type {
  Shop,
  ShopCategory,
  ShopDetailTab,
  ShopOpeningHour,
  ShopProfileDetails,
  ShopService,
} from '../../../../types/shop';

/* ============================================================
   TYPES
============================================================ */

type CustomerCoordinates = {
  latitude: number;
  longitude: number;
};

/* ============================================================
   CONSTANTS
============================================================ */

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

/* ============================================================
   CATEGORY
============================================================ */

function getCategoryLabel(
  category: ShopCategory,
): string {
  return (
    getShopCategory(category)?.label ??
    category
  );
}

/* ============================================================
   MONEY
============================================================ */

function formatNaira(
  value: number,
): string {
  const safeValue =
    Number.isFinite(value)
      ? Math.max(0, value)
      : 0;

  return `₦${safeValue.toLocaleString(
    'en-NG',
  )}`;
}

/* ============================================================
   TIME
============================================================ */

function parseTimeToMinutes(
  value: string,
): number | null {
  if (
    typeof value !== 'string'
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
    Number(match[1]);

  const minute =
    Number(match[2]);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
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

function formatTime(
  value: string,
): string {
  const minutes =
    parseTimeToMinutes(
      value,
    );

  if (
    minutes === null
  ) {
    return value.trim();
  }

  const hour24 =
    Math.floor(
      minutes / 60,
    );

  const minute =
    minutes % 60;

  const period =
    hour24 >= 12
      ? 'PM'
      : 'AM';

  const hour12 =
    hour24 % 12 || 12;

  return `${hour12}:${String(
    minute,
  ).padStart(
    2,
    '0',
  )} ${period}`;
}

/* ============================================================
   OPENING HOURS
============================================================ */

function mapOpeningHours(
  shop: FirebaseShop,
): ShopOpeningHour[] {
  if (
    !Array.isArray(
      shop.businessHours,
    )
  ) {
    return [];
  }

  return shop.businessHours.map(
    (item) => {
      const openTime =
        typeof item.openTime ===
        'string'
          ? item.openTime
          : '';

      const closeTime =
        typeof item.closeTime ===
        'string'
          ? item.closeTime
          : '';

      return {
        id: item.id,

        day: item.day,

        hours:
          item.isOpen &&
          openTime &&
          closeTime
            ? `${formatTime(
                openTime,
              )} – ${formatTime(
                closeTime,
              )}`
            : 'Closed',
      };
    },
  );
}

function getOpeningStatusLabel(
  shop: FirebaseShop,
  now: Date,
): string {
  if (!shop.isActive) {
    return 'Shop unavailable';
  }

  if (
    !Array.isArray(
      shop.businessHours,
    )
  ) {
    return 'Opening hours unavailable';
  }

  const today =
    DAY_NAMES[
      now.getDay()
    ];

  const businessDay =
    shop.businessHours.find(
      (item) =>
        item.day === today,
    );

  if (
    !businessDay ||
    !businessDay.isOpen
  ) {
    return 'Closed Today';
  }

  const openingMinutes =
    parseTimeToMinutes(
      businessDay.openTime,
    );

  const closingMinutes =
    parseTimeToMinutes(
      businessDay.closeTime,
    );

  if (
    openingMinutes === null ||
    closingMinutes === null ||
    openingMinutes ===
      closingMinutes
  ) {
    return 'Opening hours unavailable';
  }

  const currentMinutes =
    now.getHours() * 60 +
    now.getMinutes();

  let isOpen = false;

  if (
    closingMinutes >
    openingMinutes
  ) {
    isOpen =
      currentMinutes >=
        openingMinutes &&
      currentMinutes <
        closingMinutes;
  } else {
    isOpen =
      currentMinutes >=
        openingMinutes ||
      currentMinutes <
        closingMinutes;
  }

  const openingLabel =
    formatTime(
      businessDay.openTime,
    );

  const closingLabel =
    formatTime(
      businessDay.closeTime,
    );

  return isOpen
    ? `Open Now (${openingLabel} – ${closingLabel})`
    : `Closed (${openingLabel} – ${closingLabel})`;
}

/* ============================================================
   SERVICES
============================================================ */

function mapServices(
  services: FirebaseShopService[],
): ShopService[] {
  return services
    .filter(
      (service) =>
        service.isActive === true,
    )
    .map(
      (service) => ({
        id:
          service.id.trim(),

        name:
          service.name.trim(),

        description:
          service.description.trim(),

        priceLabel:
          `From ${formatNaira(
            service.startingPrice,
          )}`,

        imageUrl:
          service.imageUrl.trim(),
      }),
    )
    .filter(
      (service) =>
        service.id.length > 0 &&
        service.name.length > 0,
    );
}

/* ============================================================
   PHOTOS
============================================================ */

function isHttpsUrl(
  value: unknown,
): value is string {
  return (
    typeof value ===
      'string' &&
    /^https:\/\//i.test(
      value.trim(),
    )
  );
}

function buildPhotos(
  shop: FirebaseShop,
  services: FirebaseShopService[],
): string[] {
  const urls: unknown[] = [
    shop.coverPhotoUrl,
    shop.logoUrl,

    ...services
      .filter(
        (service) =>
          service.isActive ===
          true,
      )
      .map(
        (service) =>
          service.imageUrl,
      ),
  ];

  const uniqueUrls =
    new Set<string>();

  for (
    const value
    of urls
  ) {
    if (
      !isHttpsUrl(value)
    ) {
      continue;
    }

    uniqueUrls.add(
      value.trim(),
    );
  }

  return Array.from(
    uniqueUrls,
  );
}

/* ============================================================
   SHOP MODEL
============================================================ */

function mapFirebaseShopToShop(
  shop: FirebaseShop,
  category: ShopCategory,
  openingStatusLabel: string,
  customerLocation:
    CustomerCoordinates | null,
): Shop {
  let distanceKm = 0;

  const shopCoordinates:
    CustomerCoordinates = {
      latitude:
        shop.latitude,

      longitude:
        shop.longitude,
    };

  if (
    customerLocation &&
    isValidCoordinates(
      customerLocation,
    ) &&
    isValidCoordinates(
      shopCoordinates,
    )
  ) {
    distanceKm =
      calculateDistance(
        customerLocation.latitude,
        customerLocation.longitude,
        shopCoordinates.latitude,
        shopCoordinates.longitude,
      );
  }

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

  return {
    id:
      shop.id.trim(),

    name:
      shop.name.trim(),

    category,

    serviceLabel:
      getCategoryLabel(
        category,
      ),

    rating:
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
        : 0,

    reviews:
      Number.isFinite(
        shop.reviewCount,
      )
        ? Math.max(
            0,
            Math.floor(
              shop.reviewCount,
            ),
          )
        : 0,

    distanceKm,

    /*
     * Kept in the internal model because other
     * sections currently depend on it.
     *
     * ShopProfileHeader intentionally does not
     * display the exact address before request.
     */
    location:
      shop.address.trim(),

    isOpen:
      openingStatusLabel.startsWith(
        'Open Now',
      ),

    imageUrl:
      coverPhotoUrl,

    logoUrl:
      logoUrl ||
      coverPhotoUrl,
  };
}

/* ============================================================
   PROFILE DETAILS
============================================================ */

function createProfileDetails(
  shop: FirebaseShop,
  services: FirebaseShopService[],
  openingStatusLabel: string,
): ShopProfileDetails {
  return {
    description:
      shop.description.trim(),

    verified: false,

    openingStatusLabel,

    services:
      mapServices(
        services,
      ),

    openingHours:
      mapOpeningHours(
        shop,
      ),

    photos:
      buildPhotos(
        shop,
        services,
      ),

    reviews: [],
  };
}

/* ============================================================
   SCREEN
============================================================ */

export default function ShopDetailsScreen() {
  const params =
    useLocalSearchParams<{
      shopId?:
        | string
        | string[];
    }>();

  const shopId =
    useMemo(() => {
      const value =
        Array.isArray(
          params.shopId,
        )
          ? params.shopId[0]
          : params.shopId;

      if (
        typeof value !==
        'string'
      ) {
        return null;
      }

      const normalized =
        value.trim();

      return normalized ||
        null;
    }, [
      params.shopId,
    ]);

  const [
    firebaseShop,
    setFirebaseShop,
  ] =
    useState<FirebaseShop | null>(
      null,
    );

  const [
    firebaseServices,
    setFirebaseServices,
  ] =
    useState<
      FirebaseShopService[]
    >([]);

  const [
    customerLocation,
    setCustomerLocation,
  ] =
    useState<CustomerCoordinates | null>(
      null,
    );

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<ShopDetailTab>(
      'Overview',
    );

  const [
    serviceModalVisible,
    setServiceModalVisible,
  ] = useState(false);

  const [
    shopLoaded,
    setShopLoaded,
  ] = useState(false);

  const [
    servicesLoaded,
    setServicesLoaded,
  ] = useState(false);

  const [
    shopError,
    setShopError,
  ] = useState('');

  const [
    servicesError,
    setServicesError,
  ] = useState('');

  const [
    retryKey,
    setRetryKey,
  ] = useState(0);

  const [
    currentTime,
    setCurrentTime,
  ] = useState(
    () => new Date(),
  );

  /* ==========================================================
     CUSTOMER LOCATION
  ========================================================== */

  useEffect(() => {
    let active = true;

    async function loadCustomerLocation() {
      try {
        const permission =
          await Location.getForegroundPermissionsAsync();

        if (
          permission.status !==
          Location.PermissionStatus.GRANTED
        ) {
          return;
        }

        let position =
          await Location.getLastKnownPositionAsync();

        if (!position) {
          const servicesEnabled =
            await Location.hasServicesEnabledAsync();

          if (
            !servicesEnabled
          ) {
            return;
          }

          position =
            await Location.getCurrentPositionAsync(
              {
                accuracy:
                  Location.Accuracy.Balanced,
              },
            );
        }

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
      } catch (error) {
        console.warn(
          'Unable to load customer location on shop details:',
          error,
        );
      }
    }

    void loadCustomerLocation();

    return () => {
      active = false;
    };
  }, []);

  /* ==========================================================
     REFRESH OPEN/CLOSED
  ========================================================== */

  useEffect(() => {
    const interval =
      setInterval(() => {
        setCurrentTime(
          new Date(),
        );
      }, 60_000);

    return () => {
      clearInterval(
        interval,
      );
    };
  }, []);

  /* ==========================================================
     RESET SCREEN
  ========================================================== */

  useEffect(() => {
    setActiveTab(
      'Overview',
    );

    setServiceModalVisible(
      false,
    );
  }, [
    shopId,
  ]);

  /* ==========================================================
     REALTIME SHOP
  ========================================================== */

  useEffect(() => {
    if (!shopId) {
      setFirebaseShop(
        null,
      );

      setShopError(
        'Shop information is missing.',
      );

      setShopLoaded(
        true,
      );

      return;
    }

    setFirebaseShop(
      null,
    );

    setShopError('');

    setShopLoaded(
      false,
    );

    const unsubscribe =
      subscribeToWorkerShop(
        shopId,

        (nextShop) => {
          if (
            !nextShop ||
            nextShop.isActive !==
              true
          ) {
            setFirebaseShop(
              null,
            );

            setShopError(
              'This shop is no longer available.',
            );

            setShopLoaded(
              true,
            );

            return;
          }

          setFirebaseShop(
            nextShop,
          );

          setShopError('');

          setShopLoaded(
            true,
          );
        },

        (error) => {
          console.error(
            'Unable to load customer shop details:',
            error,
          );

          setFirebaseShop(
            null,
          );

          setShopError(
            'Unable to load this shop. Check your connection and try again.',
          );

          setShopLoaded(
            true,
          );
        },
      );

    return () => {
      unsubscribe();
    };
  }, [
    retryKey,
    shopId,
  ]);

  /* ==========================================================
     REALTIME SERVICES
  ========================================================== */

  useEffect(() => {
    if (!shopId) {
      setFirebaseServices(
        [],
      );

      setServicesError('');

      setServicesLoaded(
        true,
      );

      return;
    }

    setFirebaseServices(
      [],
    );

    setServicesError('');

    setServicesLoaded(
      false,
    );

    const unsubscribe =
      subscribeToShopServices(
        shopId,

        (services) => {
          setFirebaseServices(
            Array.isArray(
              services,
            )
              ? services
              : [],
          );

          setServicesError('');

          setServicesLoaded(
            true,
          );
        },

        (error) => {
          console.error(
            'Unable to load customer shop services:',
            error,
          );

          setFirebaseServices(
            [],
          );

          setServicesError(
            'Unable to load shop services. Check your connection and try again.',
          );

          setServicesLoaded(
            true,
          );
        },
      );

    return () => {
      unsubscribe();
    };
  }, [
    retryKey,
    shopId,
  ]);

  /* ==========================================================
     CATEGORY
  ========================================================== */

  const category =
    useMemo<ShopCategory | null>(
      () => {
        if (
          !firebaseShop
        ) {
          return null;
        }

        const value =
          firebaseShop.category.trim();

        return isShopCategoryId(
          value,
        )
          ? value
          : null;
      },
      [
        firebaseShop,
      ],
    );

  /* ==========================================================
     OPENING STATUS
  ========================================================== */

  const openingStatusLabel =
    useMemo(() => {
      if (!firebaseShop) {
        return '';
      }

      return getOpeningStatusLabel(
        firebaseShop,
        currentTime,
      );
    }, [
      currentTime,
      firebaseShop,
    ]);

  /* ==========================================================
     UI SHOP MODEL
  ========================================================== */

  const shop =
    useMemo<Shop | null>(
      () => {
        if (
          !firebaseShop ||
          !category
        ) {
          return null;
        }

        return mapFirebaseShopToShop(
          firebaseShop,
          category,
          openingStatusLabel,
          customerLocation,
        );
      },
      [
        category,
        customerLocation,
        firebaseShop,
        openingStatusLabel,
      ],
    );

  /* ==========================================================
     PROFILE DETAILS
  ========================================================== */

  const details =
    useMemo<ShopProfileDetails | null>(
      () => {
        if (
          !firebaseShop
        ) {
          return null;
        }

        return createProfileDetails(
          firebaseShop,
          firebaseServices,
          openingStatusLabel,
        );
      },
      [
        firebaseServices,
        firebaseShop,
        openingStatusLabel,
      ],
    );

  /* ==========================================================
     DERIVED STATE
  ========================================================== */

  const isLoading =
    !shopLoaded ||
    !servicesLoaded;

  const categoryError =
    firebaseShop &&
    !category
      ? 'This shop has an unsupported category.'
      : '';

  const loadError =
    shopError ||
    servicesError ||
    categoryError;

  const hasServices =
    Boolean(
      details &&
        details.services.length >
          0,
    );

  /* ==========================================================
     RETRY
  ========================================================== */

  const handleRetry =
    useCallback(() => {
      if (!shopId) {
        return;
      }

      setFirebaseShop(
        null,
      );

      setFirebaseServices(
        [],
      );

      setShopError('');

      setServicesError('');

      setShopLoaded(
        false,
      );

      setServicesLoaded(
        false,
      );

      setRetryKey(
        (current) =>
          current + 1,
      );
    }, [
      shopId,
    ]);

  /* ==========================================================
     SHARE
  ========================================================== */

  const handleShare =
    useCallback(
      async () => {
        if (!shop) {
          return;
        }

        try {
          await Share.share({
            title:
              shop.name,

            message:
              `${shop.name}\n` +
              `${shop.serviceLabel}`,
          });
        } catch (error) {
          console.error(
            'Unable to share shop:',
            error,
          );

          Alert.alert(
            'Unable to Share',
            'We could not share this shop. Please try again.',
          );
        }
      },
      [
        shop,
      ],
    );

  /*
   * Keep handleShare available for the existing
   * share flow when the header/action is connected.
   */
  void handleShare;

  /* ==========================================================
     CHOOSE SERVICE
  ========================================================== */

  const handleChooseService =
    useCallback(() => {
      if (
        !details ||
        details.services.length ===
          0
      ) {
        Alert.alert(
          'No Services Available',
          'This shop currently has no active services available for booking.',
        );

        return;
      }

      setServiceModalVisible(
        true,
      );
    }, [
      details,
    ]);

  /* ==========================================================
     SELECT SERVICE
  ========================================================== */

  const handleSelectService =
    useCallback(
      (
        service:
          ShopService,
      ) => {
        if (
          !shop ||
          !details
        ) {
          return;
        }

        const serviceExists =
          details.services.some(
            (item) =>
              item.id ===
              service.id,
          );

        if (
          !serviceExists
        ) {
          Alert.alert(
            'Service Unavailable',
            'This service is no longer available. Please choose another service.',
          );

          return;
        }

        const normalizedServiceId =
          service.id.trim();

        if (
          !normalizedServiceId
        ) {
          return;
        }

        setServiceModalVisible(
          false,
        );

        router.push({
          pathname:
            '/find-shop/[shopId]/book',

          params: {
            shopId:
              shop.id,

            serviceId:
              normalizedServiceId,
          },
        });
      },
      [
        details,
        shop,
      ],
    );

  /* ==========================================================
     LOADING
  ========================================================== */

  if (isLoading) {
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
              accessibilityLabel="Loading shop information"
            />
          </View>

          <Text
            style={
              styles.stateTitle
            }
          >
            Loading Shop
          </Text>

          <Text
            style={
              styles.stateText
            }
          >
            Loading shop information
            and available services...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (
    loadError ||
    !shop ||
    !details
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
        <View
          style={
            styles.notFound
          }
        >
          <View
            style={
              styles.notFoundIcon
            }
          >
            <Ionicons
              name="storefront-outline"
              size={42}
              color="#64748B"
            />
          </View>

          <Text
            style={
              styles.notFoundTitle
            }
          >
            Shop unavailable
          </Text>

          <Text
            style={
              styles.notFoundText
            }
          >
            {loadError ||
              'This shop may no longer be available.'}
          </Text>

          {shopId ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retry loading shop"
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
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to shops"
            onPress={() =>
              router.back()
            }
            style={({
              pressed,
            }) => [
              styles.backToShopsButton,

              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={18}
              color="#334155"
            />

            <Text
              style={
                styles.backToShopsText
              }
            >
              Back to Shops
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  /* ==========================================================
     TAB CONTENT
  ========================================================== */

  const renderContent =
    () => {
      switch (
        activeTab
      ) {
        case 'Services':
          return (
            <ShopServicesSection
              shop={shop}
              details={
                details
              }
            />
          );

        case 'Reviews':
  return (
    <ShopReviewsSection
      shop={shop}
      details={details}
      onSeeAll={() =>
        router.push({
          pathname:
            '/find-shop/[shopId]/reviews',
          params: {
            shopId: shop.id,
          },
        })
      }
    />
  );

        case 'Location':
          return (
            <>
              <ShopLocationSection
                shop={shop}
                details={
                  details
                }
              />

              <ShopOpeningHoursSection
                shop={shop}
                details={
                  details
                }
              />
            </>
          );

        case 'Photos':
          return (
            <ShopPhotosSection
              shop={shop}
              details={
                details
              }
            />
          );

        case 'Overview':
        default:
          return (
            <>
              <ShopServicesSection
                shop={shop}
                details={
                  details
                }
                onSeeAll={() =>
                  setActiveTab(
                    'Services',
                  )
                }
              />

              <View
                style={
                  styles.infoGrid
                }
              >
                <View
                  style={
                    styles.infoItem
                  }
                >
                  <ShopAboutSection
                    shop={shop}
                    details={
                      details
                    }
                  />
                </View>

                <View
                  style={
                    styles.infoItem
                  }
                >
                  <ShopOpeningHoursSection
                    shop={shop}
                    details={
                      details
                    }
                  />
                </View>
              </View>

              <ShopLocationSection
                shop={shop}
                details={
                  details
                }
              />

              <ShopPhotosSection
                shop={shop}
                details={
                  details
                }
                onSeeAll={() =>
                  setActiveTab(
                    'Photos',
                  )
                }
              />

              <ShopReviewsSection
  shop={shop}
  details={details}
  onSeeAll={() =>
    router.push({
      pathname:
        '/find-shop/[shopId]/reviews',
      params: {
        shopId: shop.id,
      },
    })
  }
/>
            </>
          );
      }
    };

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
      <View
        style={
          styles.container
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.scrollContent
          }
        >
          <ShopProfileHeader
            shop={shop}
            details={
              details
            }
            onBack={() =>
              router.back()
            }
          />

          <ShopDetailTabs
            activeTab={
              activeTab
            }
            onChange={
              setActiveTab
            }
          />

          {renderContent()}
        </ScrollView>

        <View
          style={
            styles.bottomContainer
          }
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              hasServices
                ? 'Choose a service'
                : 'No services available'
            }
            accessibilityState={{
              disabled:
                !hasServices,
            }}
            disabled={
              !hasServices
            }
            onPress={
              handleChooseService
            }
            style={({
              pressed,
            }) => [
              styles.chooseButton,

              !hasServices &&
                styles.chooseButtonDisabled,

              pressed &&
                hasServices &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={25}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.chooseButtonText
              }
            >
              {hasServices
                ? 'Choose Service'
                : 'No Services Available'}
            </Text>

            <Ionicons
              name={
                hasServices
                  ? 'chevron-forward'
                  : 'remove-outline'
              }
              size={27}
              color="#FFFFFF"
            />
          </Pressable>
        </View>
      </View>

      <ServiceSelectionModal
        visible={
          serviceModalVisible
        }
        services={
          details.services
        }
        onClose={() =>
          setServiceModalVisible(
            false,
          )
        }
        onSelectService={
          handleSelectService
        }
      />
    </SafeAreaView>
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

    container: {
      flex: 1,
    },

    scrollContent: {
      paddingBottom: 120,
    },

    infoGrid: {
      marginTop: 0,
    },

    infoItem: {
      width: '100%',
    },

    bottomContainer: {
      position:
        'absolute',

      left: 0,
      right: 0,
      bottom: 0,

      paddingHorizontal: 20,

      paddingTop: 12,

      paddingBottom: 14,

      borderTopWidth: 1,

      borderTopColor:
        '#E2E8F0',

      backgroundColor:
        '#FFFFFF',

      shadowColor:
        '#0F172A',

      shadowOffset: {
        width: 0,
        height: -3,
      },

      shadowOpacity: 0.06,

      shadowRadius: 8,

      elevation: 8,
    },

    chooseButton: {
      minHeight: 62,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      paddingHorizontal: 24,

      borderRadius: 31,

      backgroundColor:
        '#1677FF',

      shadowColor:
        '#1677FF',

      shadowOffset: {
        width: 0,
        height: 5,
      },

      shadowOpacity: 0.2,

      shadowRadius: 10,

      elevation: 5,
    },

    chooseButtonDisabled: {
      opacity: 0.5,

      shadowOpacity: 0,

      elevation: 0,
    },

    chooseButtonText: {
      flex: 1,

      marginHorizontal: 12,

      textAlign:
        'center',

      fontSize: 18,

      fontWeight:
        '800',

      color:
        '#FFFFFF',
    },

    pressed: {
      opacity: 0.8,
    },

    stateContainer: {
      flex: 1,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal: 30,

      paddingBottom: 60,
    },

    loadingIcon: {
      width: 90,
      height: 90,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius: 30,

      backgroundColor:
        '#EFF6FF',
    },

    stateTitle: {
      marginTop: 18,

      textAlign:
        'center',

      fontSize: 22,

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

      fontSize: 15,

      lineHeight: 22,

      color:
        '#64748B',
    },

    notFound: {
      flex: 1,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal: 30,

      paddingBottom: 40,
    },

    notFoundIcon: {
      width: 82,
      height: 82,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius: 28,

      backgroundColor:
        '#F1F5F9',
    },

    notFoundTitle: {
      marginTop: 18,

      textAlign:
        'center',

      fontSize: 22,

      fontWeight:
        '800',

      color:
        '#0F172A',
    },

    notFoundText: {
      maxWidth: 320,

      marginTop: 7,

      textAlign:
        'center',

      fontSize: 15,

      lineHeight: 22,

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
      fontSize: 15,

      fontWeight:
        '800',

      color:
        '#FFFFFF',
    },

    backToShopsButton: {
      minHeight: 48,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap: 7,

      marginTop: 10,

      paddingHorizontal: 22,

      borderRadius: 16,

      backgroundColor:
        '#E2E8F0',
    },

    backToShopsText: {
      fontSize: 15,

      fontWeight:
        '700',

      color:
        '#334155',
    },
  });