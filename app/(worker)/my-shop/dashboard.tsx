import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  httpsCallable,
} from 'firebase/functions';
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ShopSettingsModal from '../../../components/delete-shop/ShopSettingsModal';
import DeleteShopConfirmModal from '../../../components/delete-shop/DeleteShopConfirmModal';
import DeleteShopErrorModal from '../../../components/delete-shop/DeleteShopErrorModal';

import {
  useAuth,
} from '../../../contexts/AuthContext';

import {
  useShopRegistration,
} from '../../../contexts/ShopRegistrationContext';

import {
  functions,
} from '../../../firebase/config';

import {
  subscribeToShopServices,
  subscribeToWorkerShop,
} from '../../../services/shopService';

import {
  subscribeToWorkerPendingShopRequestCount,
} from '../../../services/shopRequestService';

import type {
  FirebaseShop,
  FirebaseShopService,
} from '../../../types/firebaseShop';

/* ============================================================
   HELPERS
============================================================ */

function formatNaira(
  value: number,
): string {
  return `₦${value.toLocaleString(
    'en-NG',
  )}`;
}

function getDeleteShopErrorMessage(
  error: unknown,
): string {
  if (
    typeof error !== 'object' ||
    error === null
  ) {
    return 'Unable to delete your shop. Check your connection and try again.';
  }

  const code =
    'code' in error &&
    typeof error.code ===
      'string'
      ? error.code
      : '';

  if (
    code.includes(
      'failed-precondition',
    )
  ) {
    return 'Complete or decline your pending and accepted customer requests before deleting your shop.';
  }

  if (
    code.includes(
      'unauthenticated',
    )
  ) {
    return 'Your session has expired. Please sign in again.';
  }

  if (
    code.includes(
      'permission-denied',
    )
  ) {
    return 'You do not have permission to delete this shop.';
  }

  if (
    code.includes(
      'not-found',
    )
  ) {
    return 'This shop no longer exists.';
  }

  return 'Unable to delete your shop. Check your connection and try again.';
}

/* ============================================================
   SCREEN
============================================================ */

export default function MyShopDashboardScreen() {
  const {
    user,
    loading:
      authLoading,
  } = useAuth();

  const {
    updateDraft,
    resetDraft,
  } = useShopRegistration();

  const userId =
    user?.uid ?? null;

  const [
    shop,
    setShop,
  ] =
    useState<FirebaseShop | null>(
      null,
    );

  const [
    services,
    setServices,
  ] =
    useState<
      FirebaseShopService[]
    >([]);

  const [
    pendingRequestCount,
    setPendingRequestCount,
  ] = useState(0);

  /*
   * Controls whether the request count badge
   * should currently be visible.
   *
   * The actual Firestore request count remains
   * unchanged. This only controls the UI indicator.
   */
  const [
    requestsBadgeVisible,
    setRequestsBadgeVisible,
  ] = useState(true);

  /*
   * Stores the previous realtime request count
   * without causing unnecessary renders.
   */
  const previousPendingRequestCount =
    useRef(0);

  const [
    shopLoaded,
    setShopLoaded,
  ] = useState(false);

  const [
    servicesLoaded,
    setServicesLoaded,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  const [
    retryKey,
    setRetryKey,
  ] = useState(0);

  /* ==========================================================
     SETTINGS / DELETE
  ========================================================== */

  const [
    settingsVisible,
    setSettingsVisible,
  ] = useState(false);

  const [
    deleteConfirmVisible,
    setDeleteConfirmVisible,
  ] = useState(false);

  const [
    deleteError,
    setDeleteError,
  ] = useState('');

  const [
    deletingShop,
    setDeletingShop,
  ] = useState(false);

  /* ==========================================================
     REALTIME SHOP
  ========================================================== */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!userId) {
      setShop(null);

      setShopLoaded(
        true,
      );

      setError(
        'You must be signed in to manage your shop.',
      );

      return;
    }

    setShopLoaded(
      false,
    );

    setError('');

    const unsubscribe =
      subscribeToWorkerShop(
        userId,

        (nextShop) => {
          if (!nextShop) {
            setShop(null);

            setShopLoaded(
              true,
            );

            router.replace(
              '/my-shop',
            );

            return;
          }

          setShop(
            nextShop,
          );

          setShopLoaded(
            true,
          );
        },

        (shopError) => {
          console.error(
            'Dashboard shop subscription failed:',
            shopError,
          );

          setError(
            'Unable to load your shop. Check your connection and try again.',
          );

          setShopLoaded(
            true,
          );
        },
      );

    return unsubscribe;
  }, [
    authLoading,
    retryKey,
    userId,
  ]);

  /* ==========================================================
     REALTIME SERVICES
  ========================================================== */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!userId) {
      setServices([]);

      setServicesLoaded(
        true,
      );

      return;
    }

    setServicesLoaded(
      false,
    );

    const unsubscribe =
      subscribeToShopServices(
        userId,

        (nextServices) => {
          setServices(
            nextServices,
          );

          setServicesLoaded(
            true,
          );
        },

        (serviceError) => {
          console.error(
            'Dashboard services subscription failed:',
            serviceError,
          );

          setError(
            'Unable to load your shop services. Check your connection and try again.',
          );

          setServicesLoaded(
            true,
          );
        },
      );

    return unsubscribe;
  }, [
    authLoading,
    retryKey,
    userId,
  ]);

  /* ==========================================================
     HYDRATE EDIT DRAFT
  ========================================================== */

  useEffect(() => {
    if (
      !shop ||
      !shopLoaded ||
      !servicesLoaded
    ) {
      return;
    }

    updateDraft({
      name:
        shop.name,

      category:
        shop.category,

      description:
        shop.description,

      phone:
        shop.phone,

      address:
        shop.address,

      latitude:
        shop.latitude,

      longitude:
        shop.longitude,

      coverPhoto:
        shop.coverPhotoUrl,

      logo:
        shop.logoUrl,

      businessHours:
        shop.businessHours,

      services:
        services.map(
          (service) => ({
            id:
              service.id,

            name:
              service.name,

            description:
              service.description,

            startingPrice:
              service.startingPrice,

            imageUri:
              service.imageUrl,

            isActive:
              service.isActive,
          }),
        ),
    });
  }, [
    services,
    servicesLoaded,
    shop,
    shopLoaded,
    updateDraft,
  ]);

  /* ==========================================================
     REALTIME PENDING REQUEST COUNT
  ========================================================== */

  useEffect(() => {
    if (
      authLoading ||
      !userId
    ) {
      setPendingRequestCount(
        0,
      );

      setRequestsBadgeVisible(
        false,
      );

      previousPendingRequestCount.current =
        0;

      return;
    }

    /*
     * New realtime subscription starts from zero
     * for this local comparison.
     */
    previousPendingRequestCount.current =
      0;

    const unsubscribe =
      subscribeToWorkerPendingShopRequestCount(
        userId,

        (count) => {
          const previousCount =
            previousPendingRequestCount.current;

          setPendingRequestCount(
            count,
          );

          /*
           * Show the badge when:
           *
           * 1. The first realtime value is greater than zero.
           * 2. A new request increases the count.
           *
           * Opening the Requests screen hides the badge,
           * but a later increase will show it again.
           */
          if (
            count > 0 &&
            (
              previousCount === 0 ||
              count > previousCount
            )
          ) {
            setRequestsBadgeVisible(
              true,
            );
          }

          previousPendingRequestCount.current =
            count;
        },

        (requestError) => {
          console.error(
            'Dashboard request count subscription failed:',
            requestError,
          );
        },
      );

    return unsubscribe;
  }, [
    authLoading,
    userId,
  ]);

  /* ==========================================================
     DERIVED SHOP STATS
  ========================================================== */

  const activeServices =
    useMemo(
      () =>
        services.filter(
          (service) =>
            service.isActive,
        ),
      [services],
    );

  const openDays =
    useMemo(
      () =>
        shop?.businessHours.filter(
          (day) =>
            day.isOpen,
        ).length ?? 0,
      [
        shop?.businessHours,
      ],
    );

  const lowestPrice =
    useMemo(() => {
      if (
        activeServices.length ===
        0
      ) {
        return null;
      }

      return Math.min(
        ...activeServices.map(
          (service) =>
            service.startingPrice,
        ),
      );
    }, [
      activeServices,
    ]);

  const isLoading =
    authLoading ||
    !shopLoaded ||
    !servicesLoaded;

  /* ==========================================================
     RETRY
  ========================================================== */

  const handleRetry = () => {
    setError('');

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
  };

  /* ==========================================================
     SHOP REQUESTS
  ========================================================== */

  const handleOpenRequests =
    () => {
      /*
       * The requests screen is now considered
       * opened/read from the dashboard perspective.
       *
       * This does NOT modify Firestore request data.
       */
      setRequestsBadgeVisible(
        false,
      );

      router.push(
        '/my-shop/requests',
      );
    };

  /* ==========================================================
     SETTINGS
  ========================================================== */

  const handleOpenSettings = () => {
    if (deletingShop) {
      return;
    }

    setDeleteError('');

    setSettingsVisible(
      true,
    );
  };

  const handleCloseSettings = () => {
    if (deletingShop) {
      return;
    }

    setSettingsVisible(
      false,
    );
  };

  const handleOpenDeleteConfirmation =
    () => {
      if (deletingShop) {
        return;
      }

      setDeleteError('');

      setSettingsVisible(
        false,
      );

      setDeleteConfirmVisible(
        true,
      );
    };

  const handleCloseDeleteConfirmation =
    () => {
      if (deletingShop) {
        return;
      }

      setDeleteConfirmVisible(
        false,
      );
    };

  const handleCloseDeleteError =
    () => {
      setDeleteError('');
    };

  /* ==========================================================
     DELETE SHOP
  ========================================================== */

  const handleDeleteShop =
    async () => {
      if (
        deletingShop ||
        !userId
      ) {
        return;
      }

      setDeletingShop(
        true,
      );

      setDeleteError('');

      try {
        const deleteShop =
          httpsCallable<
            Record<
              string,
              never
            >,
            {
              success: boolean;
            }
          >(
            functions,
            'deleteShop',
          );

        const result =
          await deleteShop({});

        if (
          result.data.success !==
          true
        ) {
          throw new Error(
            'Delete shop failed.',
          );
        }

        /*
         * Clear the old shop draft before
         * returning to the create-shop flow.
         */
        resetDraft();

        setDeleteConfirmVisible(
          false,
        );

        setSettingsVisible(
          false,
        );

        router.replace(
          '/my-shop',
        );
      } catch (
        deleteShopError
      ) {
        console.error(
          'Delete shop failed:',
          deleteShopError,
        );

        setDeleteConfirmVisible(
          false,
        );

        setDeleteError(
          getDeleteShopErrorMessage(
            deleteShopError,
          ),
        );
      } finally {
        setDeletingShop(
          false,
        );
      }
    };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (isLoading) {
    return (
      <SafeAreaView
        edges={['top']}
        style={
          styles.safeArea
        }
      >
        <DashboardHeader />

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
            />
          </View>

          <Text
            style={
              styles.stateTitle
            }
          >
            Loading Your Shop
          </Text>

          <Text
            style={
              styles.stateText
            }
          >
            Syncing your shop,
            services and requests.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (
    error ||
    !shop
  ) {
    return (
      <SafeAreaView
        edges={['top']}
        style={
          styles.safeArea
        }
      >
        <DashboardHeader />

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
            Unable to Load Shop
          </Text>

          <Text
            style={
              styles.stateText
            }
          >
            {error ||
              'Your shop could not be loaded.'}
          </Text>

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
        </View>
      </SafeAreaView>
    );
  }

  /* ==========================================================
     DASHBOARD
  ========================================================== */

  return (
    <SafeAreaView
      edges={['top']}
      style={
        styles.safeArea
      }
    >
      <DashboardHeader
        onSettingsPress={
          handleOpenSettings
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* ====================================================
            SHOP HERO
        ==================================================== */}

        <View
          style={
            styles.shopCard
          }
        >
          {shop.coverPhotoUrl ? (
            <Image
              source={{
                uri:
                  shop.coverPhotoUrl,
              }}
              resizeMode="cover"
              style={
                styles.coverPhoto
              }
            />
          ) : (
            <View
              style={
                styles.coverPlaceholder
              }
            >
              <Ionicons
                name="image-outline"
                size={38}
                color="#94A3B8"
              />
            </View>
          )}

          <View
            style={
              styles.shopBody
            }
          >
            <View
              style={
                styles.logoContainer
              }
            >
              {shop.logoUrl ? (
                <Image
                  source={{
                    uri:
                      shop.logoUrl,
                  }}
                  resizeMode="cover"
                  style={
                    styles.logo
                  }
                />
              ) : (
                <View
                  style={
                    styles.logoPlaceholder
                  }
                >
                  <Ionicons
                    name="storefront-outline"
                    size={32}
                    color="#94A3B8"
                  />
                </View>
              )}
            </View>

            <View
              style={
                styles.shopInfo
              }
            >
              <View
                style={
                  styles.shopNameRow
                }
              >
                <Text
                  style={
                    styles.shopName
                  }
                  numberOfLines={1}
                >
                  {shop.name}
                </Text>

                <View
                  style={[
                    styles.statusBadge,

                    shop.isActive
                      ? styles.activeBadge
                      : styles.inactiveBadge,
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,

                      shop.isActive
                        ? styles.activeDot
                        : styles.inactiveDot,
                    ]}
                  />

                  <Text
                    style={[
                      styles.statusText,

                      shop.isActive
                        ? styles.activeText
                        : styles.inactiveText,
                    ]}
                  >
                    {shop.isActive
                      ? 'Active'
                      : 'Inactive'}
                  </Text>
                </View>
              </View>

              <Text
                style={
                  styles.category
                }
              >
                {shop.category}
              </Text>

              <View
                style={
                  styles.locationRow
                }
              >
                <Ionicons
                  name="location-outline"
                  size={17}
                  color="#64748B"
                />

                <Text
                  style={
                    styles.locationText
                  }
                  numberOfLines={1}
                >
                  {shop.address}
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit shop details"
            onPress={() =>
              router.push(
                '/my-shop/create/details',
              )
            }
            style={({
              pressed,
            }) => [
              styles.editShopButton,

              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="create-outline"
              size={19}
              color="#1677FF"
            />

            <Text
              style={
                styles.editShopText
              }
            >
              Edit Shop
            </Text>
          </Pressable>
        </View>

        {/* ====================================================
            STATS
        ==================================================== */}

        <View
          style={
            styles.statsRow
          }
        >
          <StatCard
            icon="construct-outline"
            value={`${activeServices.length}`}
            label="Services"
          />

          <StatCard
            icon="calendar-outline"
            value={`${openDays}`}
            label="Open Days"
          />

          <StatCard
            icon="cash-outline"
            value={
              lowestPrice !==
              null
                ? formatNaira(
                    lowestPrice,
                  )
                : '—'
            }
            label="From"
            compact
          />
        </View>

        {/* ====================================================
            MANAGEMENT
        ==================================================== */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Shop Management
        </Text>

        <View
          style={
            styles.actionsGrid
          }
        >
          <DashboardAction
            icon="construct-outline"
            title="Manage Services"
            description="Add, edit and manage your services"
            onPress={() =>
              router.push(
                '/my-shop/create/services',
              )
            }
          />

          <DashboardAction
            icon="time-outline"
            title="Business Hours"
            description="Update your opening and closing times"
            onPress={() =>
              router.push(
                '/my-shop/create/hours',
              )
            }
          />

          <DashboardAction
            icon="location-outline"
            title="Shop Location"
            description="Update your shop address and location"
            onPress={() =>
              router.push(
                '/my-shop/create/location',
              )
            }
          />

          <DashboardAction
            icon="images-outline"
            title="Shop Photos"
            description="Change your cover photo and logo"
            onPress={() =>
              router.push(
                '/my-shop/create/photos',
              )
            }
          />
        </View>

        {/* ====================================================
            CUSTOMER ACTIVITY
        ==================================================== */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Customer Activity
        </Text>

        <View
          style={
            styles.activityCard
          }
        >
          <ActivityRow
            icon="receipt-outline"
            title="Shop Requests"
            description="Bookings and customer requests"
            badge={
              requestsBadgeVisible &&
              pendingRequestCount > 0
                ? `${pendingRequestCount}`
                : undefined
            }
            onPress={
              handleOpenRequests
            }
          />

          <View
            style={
              styles.divider
            }
          />

          <ActivityRow
            icon="star-outline"
            title="Reviews"
            description="Customer ratings and feedback"
            badge={`${shop.reviewCount}`}
            onPress={() =>
              router.push(
                '/my-shop/reviews',
              )
            }
          />
        </View>

        <View
          style={
            styles.infoBox
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
            Services marked active
            will be available for
            customers to choose when
            booking your shop.
          </Text>
        </View>
      </ScrollView>

      {/* ======================================================
          SHOP SETTINGS
      ====================================================== */}

      <ShopSettingsModal
        visible={
          settingsVisible
        }
        onClose={
          handleCloseSettings
        }
        onDeletePress={
          handleOpenDeleteConfirmation
        }
      />

      {/* ======================================================
          DELETE CONFIRMATION
      ====================================================== */}

      <DeleteShopConfirmModal
        visible={
          deleteConfirmVisible
        }
        shopName={
          shop.name
        }
        loading={
          deletingShop
        }
        onCancel={
          handleCloseDeleteConfirmation
        }
        onConfirm={
          handleDeleteShop
        }
      />

      {/* ======================================================
          DELETE ERROR
      ====================================================== */}

      <DeleteShopErrorModal
        visible={
          deleteError.length > 0
        }
        message={
          deleteError
        }
        onClose={
          handleCloseDeleteError
        }
      />
    </SafeAreaView>
  );
}

/* ============================================================
   HEADER
============================================================ */

function DashboardHeader({
  onSettingsPress,
}: {
  onSettingsPress?: () => void;
}) {
  const settingsEnabled =
    Boolean(
      onSettingsPress,
    );

  return (
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

      <View
        style={
          styles.headerText
        }
      >
        <Text
          style={
            styles.headerTitle
          }
        >
          My Shop
        </Text>

        <Text
          style={
            styles.headerSubtitle
          }
        >
          Manage your shop and
          services
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Shop settings"
        accessibilityState={{
          disabled:
            !settingsEnabled,
        }}
        disabled={
          !settingsEnabled
        }
        hitSlop={8}
        onPress={
          onSettingsPress
        }
        style={({
          pressed,
        }) => [
          styles.settingsButton,

          !settingsEnabled &&
            styles.settingsButtonDisabled,

          pressed &&
            settingsEnabled &&
            styles.pressed,
        ]}
      >
        <Ionicons
          name="settings-outline"
          size={24}
          color={
            settingsEnabled
              ? '#1677FF'
              : '#94A3B8'
          }
        />
      </Pressable>
    </View>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  icon,
  value,
  label,
  compact = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  compact?: boolean;
}) {
  return (
    <View
      style={
        styles.statCard
      }
    >
      <View
        style={
          styles.statIcon
        }
      >
        <Ionicons
          name={icon}
          size={21}
          color="#1677FF"
        />
      </View>

      <Text
        style={[
          styles.statValue,

          compact &&
            styles.compactValue,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>

      <Text
        style={
          styles.statLabel
        }
      >
        {label}
      </Text>
    </View>
  );
}

/* ============================================================
   MANAGEMENT ACTION
============================================================ */

function DashboardAction({
  icon,
  title,
  description,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({
        pressed,
      }) => [
        styles.actionCard,

        pressed &&
          styles.pressed,
      ]}
    >
      <View
        style={
          styles.actionIcon
        }
      >
        <Ionicons
          name={icon}
          size={25}
          color="#1677FF"
        />
      </View>

      <Text
        style={
          styles.actionTitle
        }
      >
        {title}
      </Text>

      <Text
        style={
          styles.actionDescription
        }
      >
        {description}
      </Text>

      <View
        style={
          styles.actionArrow
        }
      >
        <Ionicons
          name="chevron-forward"
          size={20}
          color="#1677FF"
        />
      </View>
    </Pressable>
  );
}

/* ============================================================
   ACTIVITY ROW
============================================================ */

function ActivityRow({
  icon,
  title,
  description,
  badge,
  onPress,
  disabled = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  badge?: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const isDisabled =
    disabled || !onPress;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{
        disabled:
          isDisabled,
      }}
      disabled={
        isDisabled
      }
      onPress={onPress}
      style={({
        pressed,
      }) => [
        styles.activityRow,

        isDisabled &&
          styles.disabledRow,

        pressed &&
          !isDisabled &&
          styles.pressed,
      ]}
    >
      <View
        style={
          styles.activityIcon
        }
      >
        <Ionicons
          name={icon}
          size={23}
          color={
            isDisabled
              ? '#94A3B8'
              : '#1677FF'
          }
        />
      </View>

      <View
        style={
          styles.activityContent
        }
      >
        <Text
          style={
            styles.activityTitle
          }
        >
          {title}
        </Text>

        <Text
          style={
            styles.activityDescription
          }
        >
          {description}
        </Text>
      </View>

      {badge !== undefined ? (
        <View
          style={[
            styles.activityBadge,

            isDisabled &&
              styles.activityBadgeDisabled,
          ]}
        >
          <Text
            style={[
              styles.activityBadgeText,

              isDisabled &&
                styles.activityBadgeTextDisabled,
            ]}
          >
            {badge}
          </Text>
        </View>
      ) : null}

      <Ionicons
        name="chevron-forward"
        size={20}
        color={
          isDisabled
            ? '#CBD5E1'
            : '#1677FF'
        }
      />
    </Pressable>
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
      minHeight: 70,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 20,
    },

    backButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 17,
      backgroundColor:
        '#EFF6FF',
    },

    headerText: {
      flex: 1,
    },

    headerTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: '#0F172A',
    },

    headerSubtitle: {
      marginTop: 1,
      fontSize: 13,
      color: '#64748B',
    },

    settingsButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 17,
      backgroundColor:
        '#EFF6FF',
    },

    settingsButtonDisabled: {
      backgroundColor:
        '#F1F5F9',
    },

    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 40,
    },

    shopCard: {
      overflow: 'hidden',
      borderWidth: 1,
      borderColor:
        '#E2E8F0',
      borderRadius: 22,
      backgroundColor:
        '#FFFFFF',
    },

    coverPhoto: {
      width: '100%',
      height: 185,
      backgroundColor:
        '#E2E8F0',
    },

    coverPlaceholder: {
      height: 185,
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        '#E2E8F0',
    },

    shopBody: {
      flexDirection: 'row',
      gap: 13,
      paddingHorizontal: 15,
    },

    logoContainer: {
      width: 92,
      height: 92,
      marginTop: -28,
      padding: 4,
      borderRadius: 24,
      backgroundColor:
        '#FFFFFF',
    },

    logo: {
      width: '100%',
      height: '100%',
      borderRadius: 20,
      backgroundColor:
        '#E2E8F0',
    },

    logoPlaceholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 20,
      backgroundColor:
        '#F1F5F9',
    },

    shopInfo: {
      flex: 1,
      minWidth: 0,
      paddingTop: 11,
    },

    shopNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    shopName: {
      flex: 1,
      fontSize: 19,
      fontWeight: '800',
      color: '#0F172A',
    },

    category: {
      marginTop: 2,
      fontSize: 14,
      color: '#64748B',
    },

    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 6,
    },

    locationText: {
      flex: 1,
      fontSize: 13,
      color: '#64748B',
    },

    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 999,
    },

    activeBadge: {
      backgroundColor:
        '#DCFCE7',
    },

    inactiveBadge: {
      backgroundColor:
        '#F1F5F9',
    },

    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },

    activeDot: {
      backgroundColor:
        '#16A34A',
    },

    inactiveDot: {
      backgroundColor:
        '#64748B',
    },

    statusText: {
      fontSize: 10,
      fontWeight: '700',
    },

    activeText: {
      color: '#16A34A',
    },

    inactiveText: {
      color: '#64748B',
    },

    editShopButton: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 7,
      margin: 14,
      borderRadius: 15,
      backgroundColor:
        '#EFF6FF',
    },

    editShopText: {
      fontSize: 14,
      fontWeight: '800',
      color: '#1677FF',
    },

    statsRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 14,
    },

    statCard: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 6,
      borderWidth: 1,
      borderColor:
        '#E2E8F0',
      borderRadius: 18,
      backgroundColor:
        '#FFFFFF',
    },

    statIcon: {
      width: 38,
      height: 38,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 13,
      backgroundColor:
        '#EFF6FF',
    },

    statValue: {
      marginTop: 8,
      fontSize: 20,
      fontWeight: '800',
      color: '#0F172A',
    },

    compactValue: {
      fontSize: 15,
    },

    statLabel: {
      marginTop: 2,
      textAlign: 'center',
      fontSize: 11,
      color: '#64748B',
    },

    sectionTitle: {
      marginTop: 26,
      marginBottom: 12,
      fontSize: 19,
      fontWeight: '800',
      color: '#0F172A',
    },

    actionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },

    actionCard: {
      width: '48%',
      minHeight: 168,
      padding: 15,
      borderWidth: 1,
      borderColor:
        '#E2E8F0',
      borderRadius: 19,
      backgroundColor:
        '#FFFFFF',
    },

    actionIcon: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 15,
      backgroundColor:
        '#EFF6FF',
    },

    actionTitle: {
      marginTop: 13,
      fontSize: 15,
      fontWeight: '800',
      color: '#0F172A',
    },

    actionDescription: {
      marginTop: 5,
      paddingRight: 6,
      fontSize: 12,
      lineHeight: 18,
      color: '#64748B',
    },

    actionArrow: {
      position: 'absolute',
      right: 12,
      bottom: 12,
    },

    activityCard: {
      overflow: 'hidden',
      borderWidth: 1,
      borderColor:
        '#E2E8F0',
      borderRadius: 19,
      backgroundColor:
        '#FFFFFF',
    },

    activityRow: {
      minHeight: 78,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
      paddingHorizontal: 14,
    },

    disabledRow: {
      opacity: 0.6,
    },

    activityIcon: {
      width: 45,
      height: 45,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 14,
      backgroundColor:
        '#EFF6FF',
    },

    activityContent: {
      flex: 1,
    },

    activityTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: '#0F172A',
    },

    activityDescription: {
      marginTop: 2,
      fontSize: 12,
      color: '#64748B',
    },

    activityBadge: {
      minWidth: 27,
      height: 27,
      alignItems: 'center',
      justifyContent:
        'center',
      paddingHorizontal: 7,
      borderRadius: 14,
      backgroundColor:
        '#EFF6FF',
    },

    activityBadgeDisabled: {
      backgroundColor:
        '#F1F5F9',
    },

    activityBadgeText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#1677FF',
    },

    activityBadgeTextDisabled: {
      color: '#94A3B8',
    },

    divider: {
      height: 1,
      marginLeft: 70,
      backgroundColor:
        '#F1F5F9',
    },

    infoBox: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 18,
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

    stateContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent:
        'center',
      paddingHorizontal: 30,
      paddingBottom: 70,
    },

    loadingIcon: {
      width: 92,
      height: 92,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 30,
      backgroundColor:
        '#EFF6FF',
    },

    errorIcon: {
      width: 92,
      height: 92,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 30,
      backgroundColor:
        '#FEF2F2',
    },

    stateTitle: {
      marginTop: 18,
      textAlign: 'center',
      fontSize: 21,
      fontWeight: '800',
      color: '#0F172A',
    },

    stateText: {
      maxWidth: 310,
      marginTop: 7,
      textAlign: 'center',
      fontSize: 14,
      lineHeight: 21,
      color: '#64748B',
    },

    retryButton: {
      minHeight: 50,
      flexDirection: 'row',
      alignItems: 'center',
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
      fontWeight: '800',
      color: '#FFFFFF',
    },

    pressed: {
      opacity: 0.72,
    },
  });