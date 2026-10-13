import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useAuth,
} from '../../../contexts/AuthContext';

import {
  subscribeToShopReviews,
  type ShopReviewRecord,
} from '../../../services/reviews/shopReviewService';

import {
  subscribeToWorkerShop,
} from '../../../services/shopService';

import type {
  FirebaseShop,
} from '../../../types/firebaseShop';

/* ============================================================
   HELPERS
============================================================ */

function formatReviewDate(
  review: ShopReviewRecord,
): string {
  const timestamp =
    review.createdAt;

  if (!timestamp) {
    return 'Recently';
  }

  const date =
    timestamp.toDate();

  const now =
    new Date();

  const difference =
    now.getTime() -
    date.getTime();

  const minute =
    60 * 1000;

  const hour =
    60 * minute;

  const day =
    24 * hour;

  if (
    difference < minute
  ) {
    return 'Just now';
  }

  if (
    difference < hour
  ) {
    const minutes =
      Math.floor(
        difference / minute,
      );

    return `${minutes} ${
      minutes === 1
        ? 'minute'
        : 'minutes'
    } ago`;
  }

  if (
    difference < day
  ) {
    const hours =
      Math.floor(
        difference / hour,
      );

    return `${hours} ${
      hours === 1
        ? 'hour'
        : 'hours'
    } ago`;
  }

  if (
    difference <
    7 * day
  ) {
    const days =
      Math.floor(
        difference / day,
      );

    return `${days} ${
      days === 1
        ? 'day'
        : 'days'
    } ago`;
  }

  return date.toLocaleDateString(
    'en-NG',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  );
}

/* ============================================================
   SCREEN
============================================================ */

export default function ShopReviewsScreen() {
  const {
    user,
    loading:
      authLoading,
  } = useAuth();

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
    reviews,
    setReviews,
  ] =
    useState<
      ShopReviewRecord[]
    >([]);

  const [
    shopLoaded,
    setShopLoaded,
  ] = useState(false);

  const [
    reviewsLoaded,
    setReviewsLoaded,
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
     LOAD WORKER SHOP
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
        'You must be signed in to view your shop reviews.',
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

        nextShop => {
          if (!nextShop) {
            setShop(null);

            setShopLoaded(
              true,
            );

            setError(
              'Your shop could not be found.',
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

        shopError => {
          console.error(
            'Shop reviews shop subscription failed:',
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
     LOAD SHOP REVIEWS
  ========================================================== */

  useEffect(() => {
    if (
      authLoading ||
      !userId ||
      !shop?.id
    ) {
      return;
    }

    setReviewsLoaded(
      false,
    );

    const unsubscribe =
      subscribeToShopReviews(
        shop.id,

        nextReviews => {
          setReviews(
            nextReviews,
          );

          setReviewsLoaded(
            true,
          );
        },

        reviewError => {
          console.error(
            'Shop reviews subscription failed:',
            reviewError,
          );

          setError(
            'Unable to load your shop reviews. Check your connection and try again.',
          );

          setReviewsLoaded(
            true,
          );
        },
      );

    return unsubscribe;
  }, [
    authLoading,
    retryKey,
    shop?.id,
    userId,
  ]);

  /* ==========================================================
     DERIVED DATA
  ========================================================== */

  const reviewCount =
    reviews.length;

  const averageRating =
    useMemo(() => {
      if (
        reviews.length ===
        0
      ) {
        return 0;
      }

      const total =
        reviews.reduce(
          (
            sum,
            review,
          ) =>
            sum +
            review.rating,
          0,
        );

      return (
        total /
        reviews.length
      );
    }, [
      reviews,
    ]);

  const isLoading =
    authLoading ||
    !shopLoaded ||
    !reviewsLoaded;

  /* ==========================================================
     RETRY
  ========================================================== */

  const handleRetry =
    () => {
      setError('');

      setShopLoaded(
        false,
      );

      setReviewsLoaded(
        false,
      );

      setRetryKey(
        current =>
          current + 1,
      );
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
        <ReviewsHeader />

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
            Loading Reviews
          </Text>

          <Text
            style={
              styles.stateText
            }
          >
            Getting your customer
            ratings and feedback.
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
        <ReviewsHeader />

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
              size={42}
              color="#DC2626"
            />
          </View>

          <Text
            style={
              styles.stateTitle
            }
          >
            Unable to Load Reviews
          </Text>

          <Text
            style={
              styles.stateText
            }
          >
            {error ||
              'Your shop reviews could not be loaded.'}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry loading reviews"
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
      edges={['top']}
      style={
        styles.safeArea
      }
    >
      <ReviewsHeader />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* ====================================================
            SHOP TITLE
        ==================================================== */}

        <View
          style={
            styles.titleSection
          }
        >
          <Text
            style={
              styles.pageTitle
            }
          >
            Customer Reviews
          </Text>

          <Text
            style={
              styles.pageSubtitle
            }
            numberOfLines={2}
          >
            See what customers are saying
            about {shop.name}.
          </Text>
        </View>

        {/* ====================================================
            SUMMARY
        ==================================================== */}

        <View
          style={
            styles.summaryCard
          }
        >
          <View
            style={
              styles.ratingBlock
            }
          >
            <Text
              style={
                styles.ratingValue
              }
            >
              {averageRating > 0
                ? averageRating.toFixed(
                    1,
                  )
                : '—'}
            </Text>

            <StarRating
              rating={
                averageRating
              }
              size={19}
            />

            <Text
              style={
                styles.ratingCount
              }
            >
              {reviewCount}{' '}
              {reviewCount === 1
                ? 'review'
                : 'reviews'}
            </Text>
          </View>

          <View
            style={
              styles.summaryDivider
            }
          />

          <View
            style={
              styles.summaryInfo
            }
          >
            <View
              style={
                styles.summaryIcon
              }
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={23}
                color="#1677FF"
              />
            </View>

            <Text
              style={
                styles.summaryInfoTitle
              }
            >
              Customer Feedback
            </Text>

            <Text
              style={
                styles.summaryInfoText
              }
            >
              Ratings and comments from
              your customers.
            </Text>
          </View>
        </View>

        {/* ====================================================
            REVIEW LIST
        ==================================================== */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          All Reviews
        </Text>

        {reviews.length ===
        0 ? (
          <EmptyReviews />
        ) : (
          <View
            style={
              styles.reviewList
            }
          >
            {reviews.map(
              review => (
                <ReviewCard
                  key={
                    review.id
                  }
                  review={
                    review
                  }
                />
              ),
            )}
          </View>
        )}

        {/* ====================================================
            VIEW ONLY NOTICE
        ==================================================== */}

        {reviews.length >
        0 ? (
          <View
            style={
              styles.infoBox
            }
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#1677FF"
            />

            <Text
              style={
                styles.infoText
              }
            >
              Customer reviews are shown
              here for viewing. Reviews
              cannot be edited or deleted
              from your shop.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================================================
   HEADER
============================================================ */

function ReviewsHeader() {
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
          Reviews
        </Text>

        <Text
          style={
            styles.headerSubtitle
          }
        >
          Customer ratings and feedback
        </Text>
      </View>
    </View>
  );
}

/* ============================================================
   STAR RATING
============================================================ */

function StarRating({
  rating,
  size = 18,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <View
      style={
        styles.stars
      }
    >
      {[
        1,
        2,
        3,
        4,
        5,
      ].map(star => (
        <Ionicons
          key={star}
          name={
            rating >= star
              ? 'star'
              : rating >=
                  star - 0.5
                ? 'star-half'
                : 'star-outline'
          }
          size={size}
          color="#F59E0B"
        />
      ))}
    </View>
  );
}

/* ============================================================
   REVIEW CARD
============================================================ */

function ReviewCard({
  review,
}: {
  review: ShopReviewRecord;
}) {
  return (
    <View
      style={
        styles.reviewCard
      }
    >
      <View
        style={
          styles.reviewHeader
        }
      >
        <View
          style={
            styles.customerAvatar
          }
        >
          <Text
            style={
              styles.customerAvatarText
            }
          >
            {review.customerName
              .charAt(0)
              .toUpperCase()}
          </Text>
        </View>

        <View
          style={
            styles.customerInfo
          }
        >
          <Text
            style={
              styles.customerName
            }
            numberOfLines={1}
          >
            {review.customerName}
          </Text>

          <StarRating
            rating={
              review.rating
            }
            size={16}
          />
        </View>

        <Text
          style={
            styles.reviewDate
          }
        >
          {formatReviewDate(
            review,
          )}
        </Text>
      </View>

      {review.comment ? (
        <Text
          style={
            styles.reviewComment
          }
        >
          {review.comment}
        </Text>
      ) : (
        <Text
          style={
            styles.noComment
          }
        >
          No comment provided.
        </Text>
      )}
    </View>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyReviews() {
  return (
    <View
      style={
        styles.emptyCard
      }
    >
      <View
        style={
          styles.emptyIcon
        }
      >
        <Ionicons
          name="star-outline"
          size={38}
          color="#94A3B8"
        />
      </View>

      <Text
        style={
          styles.emptyTitle
        }
      >
        No Reviews Yet
      </Text>

      <Text
        style={
          styles.emptyText
        }
      >
        When customers rate your shop,
        their reviews will appear here.
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

    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 40,
    },

    titleSection: {
      marginBottom: 16,
    },

    pageTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: '#0F172A',
    },

    pageSubtitle: {
      marginTop: 5,
      fontSize: 14,
      lineHeight: 20,
      color: '#64748B',
    },

    summaryCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 18,
      borderWidth: 1,
      borderColor:
        '#E2E8F0',
      borderRadius: 20,
      backgroundColor:
        '#FFFFFF',
    },

    ratingBlock: {
      width: 125,
      alignItems: 'center',
    },

    ratingValue: {
      fontSize: 34,
      fontWeight: '800',
      color: '#0F172A',
    },

    stars: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },

    ratingCount: {
      marginTop: 5,
      fontSize: 12,
      color: '#64748B',
    },

    summaryDivider: {
      width: 1,
      alignSelf: 'stretch',
      marginHorizontal: 15,
      backgroundColor:
        '#E2E8F0',
    },

    summaryInfo: {
      flex: 1,
    },

    summaryIcon: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 14,
      backgroundColor:
        '#EFF6FF',
    },

    summaryInfoTitle: {
      marginTop: 8,
      fontSize: 14,
      fontWeight: '800',
      color: '#0F172A',
    },

    summaryInfoText: {
      marginTop: 3,
      fontSize: 12,
      lineHeight: 17,
      color: '#64748B',
    },

    sectionTitle: {
      marginTop: 26,
      marginBottom: 12,
      fontSize: 19,
      fontWeight: '800',
      color: '#0F172A',
    },

    reviewList: {
      gap: 12,
    },

    reviewCard: {
      padding: 16,
      borderWidth: 1,
      borderColor:
        '#E2E8F0',
      borderRadius: 19,
      backgroundColor:
        '#FFFFFF',
    },

    reviewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
    },

    customerAvatar: {
      width: 43,
      height: 43,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 15,
      backgroundColor:
        '#EFF6FF',
    },

    customerAvatarText: {
      fontSize: 16,
      fontWeight: '800',
      color: '#1677FF',
    },

    customerInfo: {
      flex: 1,
      minWidth: 0,
    },

    customerName: {
      fontSize: 14,
      fontWeight: '800',
      color: '#0F172A',
    },

    reviewDate: {
      alignSelf: 'flex-start',
      fontSize: 11,
      color: '#94A3B8',
    },

    reviewComment: {
      marginTop: 14,
      fontSize: 14,
      lineHeight: 21,
      color: '#475569',
    },

    noComment: {
      marginTop: 13,
      fontSize: 13,
      fontStyle: 'italic',
      color: '#94A3B8',
    },

    emptyCard: {
      alignItems: 'center',
      paddingHorizontal: 25,
      paddingVertical: 34,
      borderWidth: 1,
      borderColor:
        '#E2E8F0',
      borderRadius: 20,
      backgroundColor:
        '#FFFFFF',
    },

    emptyIcon: {
      width: 76,
      height: 76,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 25,
      backgroundColor:
        '#F1F5F9',
    },

    emptyTitle: {
      marginTop: 15,
      fontSize: 18,
      fontWeight: '800',
      color: '#0F172A',
    },

    emptyText: {
      maxWidth: 300,
      marginTop: 6,
      textAlign: 'center',
      fontSize: 13,
      lineHeight: 19,
      color: '#64748B',
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