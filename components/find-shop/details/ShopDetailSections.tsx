import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type {
  Shop,
  ShopProfileDetails,
  ShopReview,
} from '../../../types/shop';

import {
  calculateArrivalTime,
} from '../../../utils/location/calculateArrivalTime';

import {
  createShopReview,
  subscribeToShopReviews,
  type ShopReviewRating,
  type ShopReviewRecord,
} from '../../../services/reviews/shopReviewService';

/* ============================================================
   TYPES
============================================================ */

type BaseProps = {
  shop: Shop;
  details: ShopProfileDetails;
};

type ServicesProps = BaseProps & {
  onSeeAll?: () => void;
};

type PhotosProps = BaseProps & {
  onSeeAll?: () => void;
};

type ReviewsProps = BaseProps & {
  onSeeAll?: () => void;
};

/* ============================================================
   SERVICES
============================================================ */

export function ShopServicesSection({
  details,
  onSeeAll,
}: ServicesProps) {
  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Services Available
        </Text>

        {onSeeAll ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="See all services"
            onPress={onSeeAll}
          >
            <Text style={styles.seeAll}>
              See All
            </Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.servicesContainer}
      >
        {details.services.map((service) => (
          <View
            key={service.id}
            style={styles.serviceCard}
          >
            <Image
              source={{
                uri: service.imageUrl,
              }}
              resizeMode="cover"
              style={styles.serviceImage}
            />

            <Text
              style={styles.serviceName}
              numberOfLines={2}
            >
              {service.name}
            </Text>

            <Text style={styles.servicePrice}>
              {service.priceLabel}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/* ============================================================
   ABOUT
============================================================ */

export function ShopAboutSection({
  details,
}: BaseProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconTitle}>
        <Ionicons
          name="storefront-outline"
          size={24}
          color="#1677FF"
        />

        <Text style={styles.sectionTitle}>
          About Shop
        </Text>
      </View>

      <Text style={styles.bodyText}>
        {details.description}
      </Text>
    </View>
  );
}

/* ============================================================
   OPENING HOURS
============================================================ */

export function ShopOpeningHoursSection({
  details,
}: BaseProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconTitle}>
        <Ionicons
          name="time-outline"
          size={25}
          color="#1677FF"
        />

        <Text style={styles.sectionTitle}>
          Opening Hours
        </Text>
      </View>

      {details.openingHours.map((item) => (
        <View
          key={item.id}
          style={styles.hoursRow}
        >
          <Text style={styles.hoursDay}>
            {item.day}
          </Text>

          <Text style={styles.hoursTime}>
            {item.hours}
          </Text>
        </View>
      ))}
    </View>
  );
}

/* ============================================================
   LOCATION
============================================================ */

export function ShopLocationSection({
  shop,
}: BaseProps) {
  const hasLocation =
    shop.location.trim().length > 0;

  const hasDistance =
    Number.isFinite(shop.distanceKm) &&
    shop.distanceKm > 0;

  const arrivalTime =
    hasDistance
      ? calculateArrivalTime(
          shop.distanceKm,
        )
      : '';

  return (
    <View style={styles.card}>
      <View style={styles.locationHeader}>
        <View style={styles.locationHeading}>
          <View style={styles.locationMainRow}>
            <Ionicons
              name="location"
              size={24}
              color="#1677FF"
            />

            <Text style={styles.sectionTitle}>
              Location
            </Text>
          </View>

          {arrivalTime ? (
            <View style={styles.travelTimeRow}>
              <Ionicons
                name="time-outline"
                size={14}
                color="#16A34A"
              />

              <Text style={styles.travelTimeText}>
                {arrivalTime}
              </Text>
            </View>
          ) : (
            <View style={styles.travelTimeRow}>
              <Ionicons
                name="navigate-outline"
                size={14}
                color="#64748B"
              />

              <Text
                style={
                  styles.travelTimeUnavailableText
                }
              >
                Distance unavailable
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.privateLocation}>
        <View style={styles.privateLocationIcon}>
          <Ionicons
            name={
              hasLocation
                ? 'location'
                : 'location-outline'
            }
            size={30}
            color="#1677FF"
          />
        </View>

        <View style={styles.privateLocationContent}>
          <Text style={styles.privateLocationTitle}>
            {hasLocation
              ? 'Shop location available'
              : 'Location unavailable'}
          </Text>

          <Text style={styles.privateLocationText}>
            {hasLocation
              ? 'The exact shop location and directions will be available after you send a service request.'
              : 'This shop has not provided a location yet.'}
          </Text>
        </View>
      </View>

      {hasLocation ? (
        <View style={styles.locationPrivacy}>
          <Ionicons
            name="lock-closed-outline"
            size={16}
            color="#64748B"
          />

          <Text style={styles.locationPrivacyText}>
            Exact address hidden until request
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/* ============================================================
   PHOTOS
============================================================ */

export function ShopPhotosSection({
  details,
  onSeeAll,
}: PhotosProps) {
  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <View style={styles.iconTitle}>
          <Ionicons
            name="image-outline"
            size={24}
            color="#1677FF"
          />

          <Text style={styles.sectionTitle}>
            Photos
          </Text>
        </View>

        {onSeeAll ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="See all shop photos"
            onPress={onSeeAll}
          >
            <Text style={styles.seeAll}>
              See All
            </Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.photosRow}
      >
        {details.photos.map(
          (photo, index) => (
            <Image
              key={`${photo}-${index}`}
              source={{
                uri: photo,
              }}
              resizeMode="cover"
              style={styles.photo}
            />
          ),
        )}
      </ScrollView>
    </View>
  );
}

/* ============================================================
   REVIEWS
============================================================ */

export function ShopReviewsSection({
  shop,
  details,
  onSeeAll,
}: ReviewsProps) {
  const [reviews, setReviews] =
    useState<ShopReviewRecord[]>([]);

  const [isLoadingReviews, setIsLoadingReviews] =
    useState(true);

  const [hasLoadedReviews, setHasLoadedReviews] =
    useState(false);

  const [isReviewModalVisible, setIsReviewModalVisible] =
    useState(false);

  const [selectedRating, setSelectedRating] =
    useState<ShopReviewRating | 0>(0);

  const [comment, setComment] =
    useState('');

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /* ==========================================================
     REALTIME REVIEWS
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    setIsLoadingReviews(true);
    setHasLoadedReviews(false);

    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe =
        subscribeToShopReviews(
          shop.id,
          (nextReviews) => {
            if (!mounted) {
              return;
            }

            setReviews(nextReviews);
            setIsLoadingReviews(false);
            setHasLoadedReviews(true);
          },
          (error) => {
            if (!mounted) {
              return;
            }

            setIsLoadingReviews(false);
            setHasLoadedReviews(true);

            if (__DEV__) {
              console.error(
                'SHOP_REVIEWS_LOAD_ERROR',
                error,
              );
            }
          },
        );
    } catch (error) {
      if (mounted) {
        setIsLoadingReviews(false);
        setHasLoadedReviews(true);
      }

      if (__DEV__) {
        console.error(
          'SHOP_REVIEWS_SUBSCRIPTION_ERROR',
          error,
        );
      }
    }

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [shop.id]);

  /* ==========================================================
     NORMALIZE REALTIME REVIEWS
     
     ShopReviewRecord uses createdAt.
     ShopReview uses createdLabel.

     The UI works with ShopReview so we convert the
     Firestore record into the UI model here.
  ========================================================== */

  const realtimeReviews: ShopReview[] =
    reviews.map((review) => ({
      id: review.id,
      customerName: review.customerName,
      rating: review.rating,
      comment: review.comment,
      createdLabel: formatReviewDate(
        review.createdAt,
      ),
    }));

  /* ==========================================================
     REVIEW DATA
  ========================================================== */

  const visibleReviews: ShopReview[] =
    hasLoadedReviews
      ? realtimeReviews
      : details.reviews;

  const reviewCount =
    hasLoadedReviews
      ? reviews.length
      : shop.reviews;

  const averageRating =
    hasLoadedReviews
      ? reviews.length > 0
        ? reviews.reduce(
            (total, review) =>
              total + review.rating,
            0,
          ) / reviews.length
        : 0
      : shop.rating;

  const firstReview =
    visibleReviews[0];

  /* ==========================================================
     MODAL
  ========================================================== */

  const openReviewModal = () => {
    setSelectedRating(0);
    setComment('');
    setIsReviewModalVisible(true);
  };

  const closeReviewModal = () => {
    if (isSubmitting) {
      return;
    }

    setIsReviewModalVisible(false);
    setSelectedRating(0);
    setComment('');
  };

  /* ==========================================================
     SUBMIT
  ========================================================== */

  const submitReview = async () => {
    const cleanedComment =
      comment.trim();

    if (selectedRating === 0) {
      Alert.alert(
        'Rating required',
        'Please select a star rating before submitting.',
      );

      return;
    }

    if (
      cleanedComment.length > 0 &&
      cleanedComment.length < 3
    ) {
      Alert.alert(
        'Comment too short',
        'Your comment must be at least 3 characters.',
      );

      return;
    }

    if (
      cleanedComment.length > 500
    ) {
      Alert.alert(
        'Comment too long',
        'Your comment cannot exceed 500 characters.',
      );

      return;
    }

    try {
      setIsSubmitting(true);

      await createShopReview({
        shopId: shop.id,
        rating: selectedRating,
        comment: cleanedComment,
      });

      setIsReviewModalVisible(false);
      setSelectedRating(0);
      setComment('');

      Alert.alert(
        'Review submitted',
        'Thank you for reviewing this shop.',
      );
    } catch (error) {
      if (__DEV__) {
        console.error(
          'SHOP_REVIEW_CREATE_ERROR',
          error,
        );
      }

      Alert.alert(
        'Unable to submit review',
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <View style={styles.iconTitle}>
            <Ionicons
              name="star"
              size={23}
              color="#F59E0B"
            />

            <Text style={styles.sectionTitle}>
              Reviews & Ratings
            </Text>
          </View>

          {onSeeAll ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="See all reviews"
              onPress={onSeeAll}
            >
              <Text style={styles.seeAll}>
                See All
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.reviewLayout}>
          <View style={styles.reviewScore}>
            <Text style={styles.bigRating}>
              {averageRating.toFixed(1)}
            </Text>

            <View style={styles.stars}>
              {Array.from({
                length: 5,
              }).map((_, index) => (
                <Ionicons
                  key={index}
                  name={
                    index <
                    Math.round(
                      averageRating,
                    )
                      ? 'star'
                      : 'star-outline'
                  }
                  size={19}
                  color="#F59E0B"
                />
              ))}
            </View>

            <Text style={styles.mutedText}>
              {reviewCount} reviews
            </Text>
          </View>

          <View style={styles.reviewContent}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Write a review"
              onPress={openReviewModal}
              style={styles.writeReviewButton}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color="#FFFFFF"
              />

              <Text style={styles.writeReviewButtonText}>
                Write a Review
              </Text>
            </Pressable>

            {isLoadingReviews ? (
              <View style={styles.reviewLoading}>
                <ActivityIndicator
                  size="small"
                  color="#F59E0B"
                />
              </View>
            ) : firstReview ? (
              <View style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {firstReview.customerName
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.reviewHeaderText}>
                    <Text style={styles.reviewer}>
                      {firstReview.customerName}
                    </Text>

                    <View style={styles.reviewStars}>
                      {Array.from({
                        length: firstReview.rating,
                      }).map((_, index) => (
                        <Ionicons
                          key={index}
                          name="star"
                          size={15}
                          color="#F59E0B"
                        />
                      ))}
                    </View>
                  </View>

                  <View style={styles.reviewMeta}>
                    <Text style={styles.reviewDate}>
                      {firstReview.createdLabel}
                    </Text>
                  </View>
                </View>

                {firstReview.comment ? (
                  <Text style={styles.reviewComment}>
                    {firstReview.comment}
                  </Text>
                ) : (
                  <Text
                    style={
                      styles.noCommentText
                    }
                  >
                    No comment provided.
                  </Text>
                )}
              </View>
            ) : (
              <View style={styles.emptyReviews}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={28}
                  color="#94A3B8"
                />

                <Text style={styles.emptyReviewsTitle}>
                  No reviews yet
                </Text>

                <Text style={styles.emptyReviewsText}>
                  Be the first customer to review this shop.
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* ======================================================
          WRITE REVIEW MODAL
      ====================================================== */}

      <Modal
        visible={isReviewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeReviewModal}
      >
        <View style={styles.reviewModalOverlay}>
          <View style={styles.reviewModal}>
            <View style={styles.reviewModalHeader}>
              <View style={styles.reviewModalHeading}>
                <Text style={styles.reviewModalTitle}>
                  Write a Review
                </Text>

                <Text style={styles.reviewModalSubtitle}>
                  Share your experience with {shop.name}.
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close review form"
                disabled={isSubmitting}
                onPress={closeReviewModal}
                style={styles.reviewModalClose}
              >
                <Ionicons
                  name="close"
                  size={23}
                  color="#475569"
                />
              </Pressable>
            </View>

            <Text style={styles.reviewFieldLabel}>
              Your rating
            </Text>

            <View style={styles.ratingSelector}>
              {(
                [1, 2, 3, 4, 5] as const
              ).map((rating) => (
                <Pressable
                  key={rating}
                  accessibilityRole="button"
                  accessibilityLabel={`${rating} star${
                    rating > 1
                      ? 's'
                      : ''
                  }`}
                  accessibilityState={{
                    selected:
                      rating ===
                      selectedRating,
                  }}
                  disabled={isSubmitting}
                  onPress={() =>
                    setSelectedRating(
                      rating,
                    )
                  }
                  style={
                    styles.ratingStarButton
                  }
                >
                  <Ionicons
                    name={
                      rating <=
                      selectedRating
                        ? 'star'
                        : 'star-outline'
                    }
                    size={34}
                    color="#F59E0B"
                  />
                </Pressable>
              ))}
            </View>

            <Text style={styles.ratingHint}>
              {selectedRating > 0
                ? `${selectedRating}/5 rating`
                : 'Tap a star to rate'}
            </Text>

            <Text style={styles.reviewFieldLabel}>
              Comment
              <Text style={styles.optionalLabel}>
                {' '}
                (optional)
              </Text>
            </Text>

            <TextInput
              value={comment}
              onChangeText={setComment}
              editable={!isSubmitting}
              multiline
              maxLength={500}
              placeholder="Tell others about your experience..."
              placeholderTextColor="#94A3B8"
              textAlignVertical="top"
              style={styles.reviewInput}
            />

            <Text style={styles.reviewCharacterCount}>
              {comment.length}/500
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Submit review"
              disabled={
                isSubmitting ||
                selectedRating === 0
              }
              onPress={submitReview}
              style={[
                styles.submitReviewButton,
                (isSubmitting ||
                  selectedRating === 0) &&
                  styles.submitReviewButtonDisabled,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={
                    styles.submitReviewButtonText
                  }
                >
                  Submit Review
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ============================================================
   REVIEW DATE
============================================================ */

function formatReviewDate(
  value: unknown,
): string {
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

    const minutes = Math.floor(
      diff / 60000,
    );

    if (minutes < 1) {
      return 'Just now';
    }

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(
      minutes / 60,
    );

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(
      hours / 24,
    );

    if (days < 7) {
      return `${days}d ago`;
    }

    return date.toLocaleDateString();
  }

  return 'Recently';
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 14,
    padding: 16,

    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,

    backgroundColor: '#FFFFFF',

    shadowColor: '#0F172A',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.04,
    shadowRadius: 6,

    elevation: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    gap: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',

    color: '#0F172A',
  },

  seeAll: {
    fontSize: 14,
    fontWeight: '700',

    color: '#1677FF',
  },

  iconTitle: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 9,
  },

  /* ==========================================================
     SERVICES
  ========================================================== */

  servicesContainer: {
    gap: 12,

    paddingTop: 14,
    paddingRight: 4,
  },

  serviceCard: {
    width: 158,
  },

  serviceImage: {
    width: 158,
    height: 100,

    borderRadius: 14,

    backgroundColor: '#E2E8F0',
  },

  serviceName: {
    minHeight: 38,

    marginTop: 8,

    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',

    color: '#0F172A',
  },

  servicePrice: {
    marginTop: 4,

    fontSize: 15,
    fontWeight: '700',

    color: '#1677FF',
  },

  /* ==========================================================
     ABOUT
  ========================================================== */

  bodyText: {
    marginTop: 12,

    fontSize: 15,
    lineHeight: 23,

    color: '#64748B',
  },

  /* ==========================================================
     OPENING HOURS
  ========================================================== */

  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',

    gap: 16,

    marginTop: 12,
  },

  hoursDay: {
    flex: 1,

    fontSize: 14,

    color: '#64748B',
  },

  hoursTime: {
    fontSize: 14,
    fontWeight: '600',

    color: '#475569',
  },

  /* ==========================================================
     LOCATION
  ========================================================== */

  locationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  locationHeading: {
    flex: 1,
  },

  locationMainRow: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 9,
  },

  travelTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 5,

    marginTop: 6,
    marginLeft: 33,
  },

  travelTimeText: {
    fontSize: 13,
    fontWeight: '800',

    color: '#16A34A',
  },

  travelTimeUnavailableText: {
    fontSize: 13,
    fontWeight: '600',

    color: '#64748B',
  },

  privateLocation: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 14,

    marginTop: 14,
    padding: 16,

    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,

    backgroundColor: '#F8FAFC',
  },

  privateLocationIcon: {
    width: 54,
    height: 54,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 27,

    backgroundColor: '#EFF6FF',
  },

  privateLocationContent: {
    flex: 1,
  },

  privateLocationTitle: {
    fontSize: 15,
    fontWeight: '800',

    color: '#0F172A',
  },

  privateLocationText: {
    marginTop: 4,

    fontSize: 13,
    lineHeight: 19,

    color: '#64748B',
  },

  locationPrivacy: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 6,

    marginTop: 10,
  },

  locationPrivacyText: {
    flex: 1,

    fontSize: 12,
    fontWeight: '600',

    color: '#64748B',
  },

  /* ==========================================================
     SHARED
  ========================================================== */

  mutedText: {
    fontSize: 13,

    color: '#64748B',
  },

  /* ==========================================================
     PHOTOS
  ========================================================== */

  photosRow: {
    gap: 10,

    paddingTop: 14,
  },

  photo: {
    width: 140,
    height: 120,

    borderRadius: 14,

    backgroundColor: '#E2E8F0',
  },

  /* ==========================================================
     REVIEWS
  ========================================================== */

  reviewLayout: {
    flexDirection: 'row',

    gap: 18,

    marginTop: 16,
  },

  reviewScore: {
    width: 105,
  },

  bigRating: {
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '800',

    color: '#0F172A',
  },

  stars: {
    flexDirection: 'row',

    marginVertical: 5,
  },

  reviewContent: {
    flex: 1,
    minWidth: 0,
  },

  writeReviewButton: {
    minHeight: 44,

    paddingHorizontal: 14,

    borderRadius: 12,

    backgroundColor: '#0F172A',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 7,

    marginBottom: 10,
  },

  writeReviewButtonText: {
    fontSize: 13,
    fontWeight: '700',

    color: '#FFFFFF',
  },

  reviewLoading: {
    minHeight: 100,

    alignItems: 'center',
    justifyContent: 'center',
  },

  reviewCard: {
    flex: 1,

    padding: 14,

    borderRadius: 16,

    backgroundColor: '#F8FAFC',
  },

  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 40,
    height: 40,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 20,

    backgroundColor: '#64748B',
  },

  avatarText: {
    fontSize: 17,
    fontWeight: '700',

    color: '#FFFFFF',
  },

  reviewHeaderText: {
    flex: 1,

    marginLeft: 9,
  },

  reviewer: {
    fontSize: 14,
    fontWeight: '700',

    color: '#0F172A',
  },

  reviewStars: {
    flexDirection: 'row',

    marginTop: 3,
  },

  reviewMeta: {
    marginLeft: 8,
  },

  reviewDate: {
    fontSize: 11,

    color: '#64748B',
  },

  reviewComment: {
    marginTop: 10,

    fontSize: 14,
    lineHeight: 20,

    color: '#475569',
  },

  noCommentText: {
    marginTop: 10,

    fontSize: 13,
    fontStyle: 'italic',

    color: '#94A3B8',
  },

  emptyReviews: {
    minHeight: 130,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 12,

    borderRadius: 16,

    backgroundColor: '#F8FAFC',
  },

  emptyReviewsTitle: {
    marginTop: 8,

    fontSize: 14,
    fontWeight: '700',

    color: '#475569',
  },

  emptyReviewsText: {
    marginTop: 4,

    fontSize: 12,
    lineHeight: 18,

    textAlign: 'center',

    color: '#94A3B8',
  },

  /* ==========================================================
     REVIEW MODAL
  ========================================================== */

  reviewModalOverlay: {
    flex: 1,

    justifyContent: 'flex-end',

    backgroundColor:
      'rgba(15, 23, 42, 0.45)',
  },

  reviewModal: {
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 28,

    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,

    backgroundColor: '#FFFFFF',
  },

  reviewModalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',

    gap: 12,
  },

  reviewModalHeading: {
    flex: 1,
  },

  reviewModalTitle: {
    fontSize: 20,
    fontWeight: '800',

    color: '#0F172A',
  },

  reviewModalSubtitle: {
    maxWidth: 300,

    marginTop: 5,

    fontSize: 13,
    lineHeight: 19,

    color: '#64748B',
  },

  reviewModalClose: {
    width: 38,
    height: 38,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 19,

    backgroundColor: '#F1F5F9',
  },

  reviewFieldLabel: {
    marginTop: 22,
    marginBottom: 10,

    fontSize: 14,
    fontWeight: '700',

    color: '#0F172A',
  },

  optionalLabel: {
    fontWeight: '500',

    color: '#94A3B8',
  },

  ratingSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 5,
  },

  ratingStarButton: {
    padding: 3,
  },

  ratingHint: {
    marginTop: 4,

    textAlign: 'center',

    fontSize: 12,
    fontWeight: '600',

    color: '#64748B',
  },

  reviewInput: {
    minHeight: 120,

    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 13,

    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,

    backgroundColor: '#F8FAFC',

    fontSize: 14,
    lineHeight: 20,

    color: '#0F172A',
  },

  reviewCharacterCount: {
    marginTop: 6,

    textAlign: 'right',

    fontSize: 11,

    color: '#94A3B8',
  },

  submitReviewButton: {
    minHeight: 50,

    marginTop: 18,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 14,

    backgroundColor: '#0F172A',
  },

  submitReviewButtonDisabled: {
    opacity: 0.45,
  },

  submitReviewButtonText: {
    fontSize: 15,
    fontWeight: '800',

    color: '#FFFFFF',
  },
});