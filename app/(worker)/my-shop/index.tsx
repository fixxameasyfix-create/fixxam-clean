import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useAuth,
} from '../../../contexts/AuthContext';

import {
  subscribeToWorkerShop,
} from '../../../services/shopService';

type ScreenState =
  | 'loading'
  | 'empty'
  | 'error';

export default function MyShopScreen() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const userId =
    user?.uid ?? null;

  const [
    screenState,
    setScreenState,
  ] = useState<ScreenState>(
    'loading',
  );

  const [
    retryKey,
    setRetryKey,
  ] = useState(0);

  /*
   * Prevent repeated router.replace()
   * calls if Firestore emits multiple
   * snapshots before this screen unmounts.
   */
  const hasNavigatedRef =
    useRef(false);

  /* ==========================================================
     RESET NAVIGATION GUARD
  ========================================================== */

  useEffect(() => {
    hasNavigatedRef.current =
      false;
  }, [
    retryKey,
    userId,
  ]);

  /* ==========================================================
     CHECK WORKER SHOP
  ========================================================== */

  useEffect(() => {
    if (authLoading) {
      setScreenState(
        'loading',
      );

      return;
    }

    if (!userId) {
      setScreenState(
        'error',
      );

      return;
    }

    setScreenState(
      'loading',
    );

    const unsubscribe =
      subscribeToWorkerShop(
        userId,

        (shop) => {
          if (shop) {
            if (
              hasNavigatedRef.current
            ) {
              return;
            }

            hasNavigatedRef.current =
              true;

            router.replace(
              '/my-shop/dashboard',
            );

            return;
          }

          hasNavigatedRef.current =
            false;

          setScreenState(
            'empty',
          );
        },

        (error) => {
          console.error(
            'Unable to load worker shop:',
            error,
          );

          hasNavigatedRef.current =
            false;

          setScreenState(
            'error',
          );
        },
      );

    return () => {
      unsubscribe();
    };
  }, [
    authLoading,
    retryKey,
    userId,
  ]);

  /* ==========================================================
     ACTIONS
  ========================================================== */

  const handleCreateShop =
    useCallback(() => {
      if (!userId) {
        setScreenState(
          'error',
        );

        return;
      }

      router.push(
        '/my-shop/create/details',
      );
    }, [
      userId,
    ]);

  const handleRetry =
    useCallback(() => {
      if (!userId) {
        return;
      }

      hasNavigatedRef.current =
        false;

      setScreenState(
        'loading',
      );

      setRetryKey(
        (current) =>
          current + 1,
      );
    }, [
      userId,
    ]);

  /* ==========================================================
     LOADING
  ========================================================== */

  if (
    authLoading ||
    screenState === 'loading'
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
              accessibilityLabel="Loading shop"
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
              styles.stateDescription
            }
          >
            Checking your shop
            information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (
    screenState === 'error'
  ) {
    const signedOut =
      !userId;

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
              name={
                signedOut
                  ? 'person-circle-outline'
                  : 'cloud-offline-outline'
              }
              size={46}
              color="#DC2626"
            />
          </View>

          <Text
            style={
              styles.stateTitle
            }
          >
            {signedOut
              ? 'Sign In Required'
              : 'Unable to Load Shop'}
          </Text>

          <Text
            style={
              styles.stateDescription
            }
          >
            {signedOut
              ? 'You must be signed in to access and manage your shop.'
              : 'We couldn’t check your shop information. Check your connection and try again.'}
          </Text>

          {!signedOut ? (
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
        </View>
      </SafeAreaView>
    );
  }

  /* ==========================================================
     EMPTY SHOP STATE
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

      <View
        style={
          styles.content
        }
      >
        <View
          style={
            styles.shopIconContainer
          }
        >
          <Ionicons
            name="storefront"
            size={76}
            color="#1677FF"
          />
        </View>

        <Text
          style={
            styles.title
          }
        >
          You don&apos;t have a shop
          yet
        </Text>

        <Text
          style={
            styles.description
          }
        >
          Create your shop to showcase
          your services, business
          location and availability to
          customers.
        </Text>

        <View
          style={
            styles.features
          }
        >
          <FeatureRow
            icon="location-outline"
            text="Show your business location to customers"
          />

          <FeatureRow
            icon="construct-outline"
            text="Add your services and starting prices"
          />

          <FeatureRow
            icon="calendar-outline"
            text="Receive and manage shop visit requests"
          />
        </View>
      </View>

      <View
        style={
          styles.footer
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create my shop"
          onPress={
            handleCreateShop
          }
          style={({
            pressed,
          }) => [
            styles.createButton,

            pressed &&
              styles.pressed,
          ]}
        >
          <Text
            style={
              styles.createButtonText
            }
          >
            Create My Shop
          </Text>

          <Ionicons
            name="arrow-forward"
            size={22}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
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
          size={26}
          color="#1677FF"
        />
      </Pressable>

      <Text
        style={
          styles.headerTitle
        }
      >
        My Shop
      </Text>

      <View
        style={
          styles.headerSpacer
        }
      />
    </View>
  );
}

/* ============================================================
   FEATURE ROW
============================================================ */

type FeatureIcon =
  | 'location-outline'
  | 'construct-outline'
  | 'calendar-outline';

type FeatureRowProps = {
  icon: FeatureIcon;
  text: string;
};

function FeatureRow({
  icon,
  text,
}: FeatureRowProps) {
  return (
    <View
      style={
        styles.featureRow
      }
    >
      <View
        style={
          styles.featureIcon
        }
      >
        <Ionicons
          name={icon}
          size={21}
          color="#1677FF"
        />
      </View>

      <Text
        style={
          styles.featureText
        }
      >
        {text}
      </Text>
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
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
    },

    backButton: {
      width: 46,
      height: 46,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 18,
      backgroundColor:
        '#EFF6FF',
    },

    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 21,
      fontWeight: '800',
      color: '#0F172A',
    },

    headerSpacer: {
      width: 46,
    },

    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent:
        'center',
      paddingHorizontal: 28,
      paddingBottom: 60,
    },

    shopIconContainer: {
      width: 150,
      height: 150,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 50,
      backgroundColor:
        '#EFF6FF',
    },

    title: {
      maxWidth: 330,
      marginTop: 28,
      textAlign: 'center',
      fontSize: 24,
      lineHeight: 31,
      fontWeight: '800',
      color: '#0F172A',
    },

    description: {
      maxWidth: 340,
      marginTop: 10,
      textAlign: 'center',
      fontSize: 15,
      lineHeight: 23,
      color: '#64748B',
    },

    features: {
      width: '100%',
      maxWidth: 370,
      marginTop: 32,
      gap: 17,
    },

    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
    },

    featureIcon: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 14,
      backgroundColor:
        '#EFF6FF',
    },

    featureText: {
      flex: 1,
      fontSize: 15,
      lineHeight: 21,
      fontWeight: '500',
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
      marginTop: 20,
      textAlign: 'center',
      fontSize: 21,
      fontWeight: '800',
      color: '#0F172A',
    },

    stateDescription: {
      maxWidth: 320,
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
      marginTop: 21,
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

    footer: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 18,
      borderTopWidth: 1,
      borderTopColor:
        '#E2E8F0',
      backgroundColor:
        '#FFFFFF',
    },

    createButton: {
      minHeight: 58,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 10,
      borderRadius: 18,
      backgroundColor:
        '#1677FF',
    },

    createButtonText: {
      fontSize: 17,
      fontWeight: '800',
      color: '#FFFFFF',
    },

    pressed: {
      opacity: 0.76,
    },
  });