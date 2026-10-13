import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  subscribeToShopReviews,
  type ShopReviewRecord,
} from '../../../../services/reviews/shopReviewService';

/* ============================================================
   HELPERS
============================================================ */

function formatReviewDate(value: unknown): string {
  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (
      value as {
        toDate?: unknown;
      }
    ).toDate === 'function'
  ) {
    const date = (
      value as {
        toDate: () => Date;
      }
    ).toDate();

    const diff =
      Date.now() - date.getTime();

    if (diff < 0) {
      return 'Just now';
    }

    const minutes =
      Math.floor(diff / 60000);

    if (minutes < 1) {
      return 'Just now';
    }

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours =
      Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days =
      Math.floor(hours / 24);

    if (days < 7) {
      return `${days}d ago`;
    }

    return date.toLocaleDateString();
  }

  return 'Recently';
}

/* ============================================================
   STARS
============================================================ */

function StarRow({
  rating,
  size = 18,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <View style={styles.starRow}>
      {Array.from({ length: 5 }).map(
        (_, index) => (
          <Ionicons
            key={index}
            name={
              index < rating
                ? 'star'
                : 'star-outline'
            }
            size={size}
            color="#F59E0B"
          />
        ),
      )}
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
  const initial =
    review.customerName
      .trim()
      .charAt(0)
      .toUpperCase() || 'C';

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {initial}
          </Text>
        </View>

        <View style={styles.reviewerInfo}>
          <Text
            style={styles.customerName}
            numberOfLines={1}
          >
            {review.customerName}
          </Text>

          <StarRow
            rating={review.rating}
            size={16}
          />
        </View>

        <Text style={styles.reviewDate}>
          {formatReviewDate(
            review.createdAt,
          )}
        </Text>
      </View>

      {review.comment ? (
        <Text style={styles.reviewComment}>
          {review.comment}
        </Text>
      ) : (
        <Text style={styles.noComment}>
          No comment provided.
        </Text>
      )}
    </View>
  );
}

/* ============================================================
   SCREEN
============================================================ */

export default function ShopReviewsScreen() {
  const params =
    useLocalSearchParams<{
      shopId?: string;
    }>();

  const shopId =
    typeof params.shopId === 'string'
      ? params.shopId.trim()
      : '';

  const [
    reviews,
    setReviews,
  ] = useState<ShopReviewRecord[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  /* ==========================================================
     REALTIME REVIEWS
  ========================================================== */

  useEffect(() => {
    if (!shopId) {
      setIsLoading(false);
      setError(
        'Shop information is unavailable.',
      );
      return;
    }

    let mounted = true;

    setIsLoading(true);
    setError(null);

    const unsubscribe =
      subscribeToShopReviews(
        shopId,
        (nextReviews) => {
          if (!mounted) {
            return;
          }

          setReviews(nextReviews);
          setIsLoading(false);
        },
        (subscriptionError) => {
          if (!mounted) {
            return;
          }

          if (__DEV__) {
            console.error(
              'CUSTOMER_SHOP_REVIEWS_ERROR',
              subscriptionError,
            );
          }

          setError(
            'Unable to load reviews. Please try again.',
          );

          setIsLoading(false);
        },
      );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [shopId]);

  /* ==========================================================
     RATING
  ========================================================== */

  const averageRating =
    useMemo(() => {
      if (reviews.length === 0) {
        return 0;
      }

      const total =
        reviews.reduce(
          (sum, review) =>
            sum + review.rating,
          0,
        );

      return total / reviews.length;
    }, [reviews]);

  const ratingBreakdown =
    useMemo(
      () =>
        [5, 4, 3, 2, 1].map(
          (rating) => {
            const count =
              reviews.filter(
                (review) =>
                  review.rating ===
                  rating,
              ).length;

            const percentage =
              reviews.length > 0
                ? (count /
                    reviews.length) *
                  100
                : 0;

            return {
              rating,
              count,
              percentage,
            };
          },
        ),
      [reviews],
    );

  /* ==========================================================
     EMPTY STATE
  ========================================================== */

  const renderEmpty =
    () => {
      if (isLoading) {
        return (
          <View
            style={
              styles.centerState
            }
          >
            <ActivityIndicator
              size="large"
              color="#1677FF"
            />

            <Text
              style={
                styles.stateText
              }
            >
              Loading reviews...
            </Text>
          </View>
        );
      }

      if (error) {
        return (
          <View
            style={
              styles.centerState
            }
          >
            <Ionicons
              name="cloud-offline-outline"
              size={44}
              color="#94A3B8"
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              Unable to load reviews
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              {error}
            </Text>
          </View>
        );
      }

      return (
        <View
          style={
            styles.centerState
          }
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={46}
            color="#94A3B8"
          />

          <Text
            style={
              styles.emptyTitle
            }
          >
            No reviews yet
          </Text>

          <Text
            style={
              styles.emptyText
            }
          >
            Customers have not reviewed
            this shop yet.
          </Text>
        </View>
      );
    };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() =>
            router.back()
          }
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#0F172A"
          />
        </Pressable>

        <View style={styles.headerText}>
          <Text
            style={
              styles.headerTitle
            }
          >
            Customer Reviews
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
          >
            Reviews & Ratings
          </Text>
        </View>
      </View>

      {/* SUMMARY */}

      {!isLoading &&
      !error &&
      reviews.length > 0 ? (
        <View
          style={
            styles.summaryCard
          }
        >
          <View
            style={
              styles.summaryScore
            }
          >
            <Text
              style={
                styles.averageRating
              }
            >
              {averageRating.toFixed(1)}
            </Text>

            <StarRow
              rating={Math.round(
                averageRating,
              )}
              size={19}
            />

            <Text
              style={
                styles.totalReviews
              }
            >
              {reviews.length}{' '}
              {reviews.length === 1
                ? 'review'
                : 'reviews'}
            </Text>
          </View>

          <View
            style={
              styles.breakdown
            }
          >
            {ratingBreakdown.map(
              (item) => (
                <View
                  key={
                    item.rating
                  }
                  style={
                    styles.breakdownRow
                  }
                >
                  <Text
                    style={
                      styles.breakdownRating
                    }
                  >
                    {item.rating}
                  </Text>

                  <Ionicons
                    name="star"
                    size={12}
                    color="#F59E0B"
                  />

                  <View
                    style={
                      styles.progressTrack
                    }
                  >
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${item.percentage}%`,
                        },
                      ]}
                    />
                  </View>

                  <Text
                    style={
                      styles.breakdownCount
                    }
                  >
                    {item.count}
                  </Text>
                </View>
              ),
            )}
          </View>
        </View>
      ) : null}

      {/* ALL REVIEWS */}

      <FlatList
        data={reviews}
        keyExtractor={(item) =>
          item.id
        }
        renderItem={({ item }) => (
          <ReviewCard
            review={item}
          />
        )}
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={[
          styles.listContent,
          reviews.length === 0 &&
            styles.emptyListContent,
        ]}
        ListHeaderComponent={
          reviews.length > 0 ? (
            <Text
              style={
                styles.listTitle
              }
            >
              All Customer Reviews
            </Text>
          ) : null
        }
        ListEmptyComponent={
          renderEmpty()
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

    header: {
      flexDirection: 'row',
      alignItems: 'center',

      paddingHorizontal: 18,
      paddingVertical: 14,

      backgroundColor:
        '#FFFFFF',

      borderBottomWidth: 1,
      borderBottomColor:
        '#E2E8F0',
    },

    backButton: {
      width: 42,
      height: 42,

      alignItems:
        'center',
      justifyContent:
        'center',

      borderRadius: 21,

      backgroundColor:
        '#F1F5F9',
    },

    headerText: {
      flex: 1,
      marginLeft: 12,
    },

    headerTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: '#0F172A',
    },

    headerSubtitle: {
      marginTop: 2,
      fontSize: 13,
      color: '#64748B',
    },

    summaryCard: {
      flexDirection:
        'row',

      marginHorizontal: 16,
      marginTop: 14,
      padding: 18,

      borderWidth: 1,
      borderColor:
        '#E2E8F0',

      borderRadius: 20,

      backgroundColor:
        '#FFFFFF',
    },

    summaryScore: {
      width: 120,

      alignItems:
        'center',
      justifyContent:
        'center',
    },

    averageRating: {
      fontSize: 42,
      lineHeight: 48,
      fontWeight: '800',
      color: '#0F172A',
    },

    starRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 2,
    },

    totalReviews: {
      marginTop: 6,
      fontSize: 13,
      color: '#64748B',
    },

    breakdown: {
      flex: 1,
      justifyContent:
        'center',
      gap: 5,
    },

    breakdownRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 4,
    },

    breakdownRating: {
      width: 10,
      fontSize: 12,
      fontWeight: '700',
      textAlign: 'right',
      color: '#475569',
    },

    progressTrack: {
      flex: 1,
      height: 7,
      marginLeft: 4,
      overflow: 'hidden',
      borderRadius: 4,
      backgroundColor:
        '#E2E8F0',
    },

    progressFill: {
      height: '100%',
      borderRadius: 4,
      backgroundColor:
        '#F59E0B',
    },

    breakdownCount: {
      width: 20,
      fontSize: 11,
      textAlign: 'right',
      color: '#64748B',
    },

    listContent: {
      paddingHorizontal: 16,
      paddingTop: 18,
      paddingBottom: 30,
    },

    emptyListContent: {
      flexGrow: 1,
      justifyContent:
        'center',
    },

    listTitle: {
      marginBottom: 10,
      fontSize: 17,
      fontWeight: '800',
      color: '#0F172A',
    },

    reviewCard: {
      marginBottom: 10,
      padding: 15,

      borderWidth: 1,
      borderColor:
        '#E2E8F0',

      borderRadius: 18,

      backgroundColor:
        '#FFFFFF',
    },

    reviewHeader: {
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    avatar: {
      width: 42,
      height: 42,

      alignItems:
        'center',
      justifyContent:
        'center',

      borderRadius: 21,

      backgroundColor:
        '#64748B',
    },

    avatarText: {
      fontSize: 17,
      fontWeight: '800',
      color: '#FFFFFF',
    },

    reviewerInfo: {
      flex: 1,
      marginLeft: 10,
    },

    customerName: {
      fontSize: 14,
      fontWeight: '800',
      color: '#0F172A',
    },

    reviewDate: {
      marginLeft: 8,
      fontSize: 11,
      color: '#64748B',
    },

    reviewComment: {
      marginTop: 12,
      fontSize: 14,
      lineHeight: 21,
      color: '#475569',
    },

    noComment: {
      marginTop: 12,
      fontSize: 13,
      fontStyle: 'italic',
      color: '#94A3B8',
    },

    centerState: {
      alignItems:
        'center',
      justifyContent:
        'center',

      paddingHorizontal: 30,
    },

    stateText: {
      marginTop: 12,
      fontSize: 14,
      color: '#64748B',
    },

    emptyTitle: {
      marginTop: 12,
      fontSize: 17,
      fontWeight: '800',
      color: '#475569',
    },

    emptyText: {
      maxWidth: 280,
      marginTop: 5,
      fontSize: 13,
      lineHeight: 19,
      textAlign: 'center',
      color: '#94A3B8',
    },
  });