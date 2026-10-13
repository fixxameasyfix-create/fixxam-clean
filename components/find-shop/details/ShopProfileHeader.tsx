import { Ionicons } from '@expo/vector-icons';
import React, {
  useMemo,
  useState,
} from 'react';

import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  calculateArrivalTime,
} from '../../../utils/location/calculateArrivalTime';

import type {
  Shop,
  ShopProfileDetails,
} from '../../../types/shop';

/* ============================================================
   TYPES
============================================================ */

type Props = {
  shop: Shop;
  details: ShopProfileDetails;
  onBack: () => void;
};

/* ============================================================
   HELPERS
============================================================ */

function isValidImageUrl(
  value: string,
): boolean {
  return /^https:\/\//i.test(
    value.trim(),
  );
}

function getInitials(
  name: string,
): string {
  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);

  if (parts.length === 0) {
    return 'S';
  }

  return parts
    .map(
      (part) =>
        part
          .charAt(0)
          .toUpperCase(),
    )
    .join('');
}

/* ============================================================
   COMPONENT
============================================================ */

export function ShopProfileHeader({
  shop,
  details,
  onBack,
}: Props) {
  const [
    heroImageFailed,
    setHeroImageFailed,
  ] = useState(false);

  const [
    logoImageFailed,
    setLogoImageFailed,
  ] = useState(false);

  /* ==========================================================
     IMAGES
  ========================================================== */

  const heroImageUrl =
    useMemo(() => {
      const value =
        shop.imageUrl.trim();

      return isValidImageUrl(
        value,
      )
        ? value
        : '';
    }, [
      shop.imageUrl,
    ]);

  const logoImageUrl =
    useMemo(() => {
      const logo =
        shop.logoUrl.trim();

      if (
        isValidImageUrl(
          logo,
        )
      ) {
        return logo;
      }

      /*
       * Safe visual fallback:
       * if a shop has no logo yet,
       * use the cover photo.
       */
      if (
        isValidImageUrl(
          heroImageUrl,
        )
      ) {
        return heroImageUrl;
      }

      return '';
    }, [
      heroImageUrl,
      shop.logoUrl,
    ]);

  const showHeroImage =
    Boolean(
      heroImageUrl,
    ) &&
    !heroImageFailed;

  const showLogoImage =
    Boolean(
      logoImageUrl,
    ) &&
    !logoImageFailed;

  const shopInitials =
    useMemo(
      () =>
        getInitials(
          shop.name,
        ),
      [
        shop.name,
      ],
    );

  /* ==========================================================
     DISTANCE
  ========================================================== */

  const hasDistance =
    Number.isFinite(
      shop.distanceKm,
    ) &&
    shop.distanceKm > 0;

  const arrivalTime =
    useMemo(
      () =>
        hasDistance
          ? calculateArrivalTime(
              shop.distanceKm,
            )
          : '',
      [
        hasDistance,
        shop.distanceKm,
      ],
    );

  const distanceLabel =
    hasDistance
      ? `${shop.distanceKm.toFixed(
          1,
        )} km`
      : '';

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <View>
      {/* ======================================================
          HERO
      ====================================================== */}

      <View
        style={
          styles.heroContainer
        }
      >
        {showHeroImage ? (
          <Image
            source={{
              uri:
                heroImageUrl,
            }}
            resizeMode="cover"
            style={
              styles.heroImage
            }
            onError={() => {
              setHeroImageFailed(
                true,
              );
            }}
          />
        ) : (
          <View
            style={
              styles.heroFallback
            }
          >
            <Ionicons
              name="storefront-outline"
              size={54}
              color="#94A3B8"
            />
          </View>
        )}

        <View
          pointerEvents="none"
          style={
            styles.heroOverlay
          }
        />

        {/* ====================================================
            BACK
        ==================================================== */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          onPress={
            onBack
          }
          style={({
            pressed,
          }) => [
            styles.circleButton,
            styles.backButton,

            pressed &&
              styles.pressed,
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={27}
            color="#1677FF"
          />
        </Pressable>
      </View>

      {/* ======================================================
          PROFILE
      ====================================================== */}

      <View
        style={
          styles.profileSection
        }
      >
        {/* ====================================================
            SHOP LOGO
        ==================================================== */}

        <View
          style={
            styles.logoContainer
          }
        >
          {showLogoImage ? (
            <Image
              source={{
                uri:
                  logoImageUrl,
              }}
              resizeMode="cover"
              style={
                styles.logo
              }
              onError={() => {
                setLogoImageFailed(
                  true,
                );
              }}
            />
          ) : (
            <View
              style={
                styles.logoFallback
              }
            >
              <Text
                numberOfLines={1}
                style={
                  styles.logoFallbackText
                }
              >
                {shopInitials}
              </Text>
            </View>
          )}
        </View>

        {/* ====================================================
            INFORMATION
        ==================================================== */}

        <View
          style={
            styles.profileContent
          }
        >
          <Text
            numberOfLines={2}
            style={
              styles.shopName
            }
          >
            {shop.name}
          </Text>

          <Text
            numberOfLines={1}
            style={
              styles.category
            }
          >
            {shop.serviceLabel}
          </Text>

          {/* ==================================================
              RATING
          ================================================== */}

          <View
            style={
              styles.ratingRow
            }
          >
            <Ionicons
              name="star"
              size={18}
              color="#F59E0B"
            />

            <Text
              style={
                styles.rating
              }
            >
              {shop.rating.toFixed(
                1,
              )}
            </Text>

            <Text
              style={
                styles.reviews
              }
            >
              ({shop.reviews}{' '}
              {shop.reviews === 1
                ? 'review'
                : 'reviews'})
            </Text>
          </View>

          {/* ==================================================
              DISTANCE + ARRIVAL
          ================================================== */}

          {hasDistance ? (
            <View
              style={
                styles.travelRow
              }
            >
              <Ionicons
                name="navigate"
                size={16}
                color="#1677FF"
              />

              <Text
                style={
                  styles.distance
                }
              >
                {distanceLabel}
              </Text>

              {arrivalTime ? (
                <>
                  <View
                    style={
                      styles.travelDot
                    }
                  />

                  <Text
                    style={
                      styles.arrivalText
                    }
                  >
                    ~{arrivalTime}
                  </Text>
                </>
              ) : null}
            </View>
          ) : (
            <View
              style={
                styles.travelRow
              }
            >
              <Ionicons
                name="location-outline"
                size={16}
                color="#64748B"
              />

              <Text
                style={
                  styles.locationUnavailable
                }
              >
                Distance unavailable
              </Text>
            </View>
          )}

          {/* ==================================================
              STATUS
          ================================================== */}

          <View
            style={
              styles.badges
            }
          >
            <View
              style={[
                styles.statusBadge,

                shop.isOpen
                  ? styles.openBadge
                  : styles.closedBadge,
              ]}
            >
              <View
                style={
                  styles.statusContent
                }
              >
                <View
                  style={[
                    styles.statusDot,

                    shop.isOpen
                      ? styles.openStatusDot
                      : styles.closedStatusDot,
                  ]}
                />

                <Text
                  numberOfLines={2}
                  style={[
                    styles.statusText,

                    shop.isOpen
                      ? styles.openText
                      : styles.closedText,
                  ]}
                >
                  {
                    details.openingStatusLabel
                  }
                </Text>
              </View>
            </View>

            {details.verified ? (
              <View
                style={
                  styles.verifiedBadge
                }
              >
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color="#1677FF"
                />

                <Text
                  style={
                    styles.verifiedText
                  }
                >
                  Verified
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       HERO
    ======================================================== */

    heroContainer: {
      height: 290,

      position:
        'relative',

      overflow:
        'hidden',

      backgroundColor:
        '#CBD5E1',
    },

    heroImage: {
      width: '100%',
      height: '100%',
    },

    heroFallback: {
      width: '100%',
      height: '100%',

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        '#E2E8F0',
    },

    heroOverlay: {
      ...StyleSheet.absoluteFillObject,

      backgroundColor:
        'rgba(15, 23, 42, 0.08)',
    },

    circleButton: {
      width: 52,
      height: 52,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius: 26,

      backgroundColor:
        '#FFFFFF',

      shadowColor:
        '#0F172A',

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.12,

      shadowRadius: 6,

      elevation: 4,
    },

    backButton: {
      position:
        'absolute',

      top: 18,
      left: 20,
    },

    /* ========================================================
       PROFILE
    ======================================================== */

    profileSection: {
      flexDirection:
        'row',

      gap: 14,

      paddingHorizontal: 20,

      paddingBottom: 18,

      backgroundColor:
        '#FFFFFF',
    },

    logoContainer: {
      width: 132,
      height: 132,

      marginTop: -38,

      padding: 5,

      overflow:
        'hidden',

      borderRadius: 26,

      backgroundColor:
        '#FFFFFF',

      shadowColor:
        '#0F172A',

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.05,

      shadowRadius: 5,

      elevation: 2,
    },

    logo: {
      width: '100%',
      height: '100%',

      borderRadius: 21,

      backgroundColor:
        '#E2E8F0',
    },

    logoFallback: {
      flex: 1,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius: 21,

      backgroundColor:
        '#EFF6FF',
    },

    logoFallbackText: {
      maxWidth: '90%',

      fontSize: 34,

      fontWeight:
        '800',

      color:
        '#1677FF',
    },

    profileContent: {
      flex: 1,

      minWidth: 0,

      paddingTop: 12,
    },

    shopName: {
      fontSize: 25,

      lineHeight: 30,

      fontWeight:
        '800',

      color:
        '#0F172A',
    },

    category: {
      marginTop: 1,

      fontSize: 16,

      lineHeight: 21,

      color:
        '#64748B',
    },

    /* ========================================================
       RATING
    ======================================================== */

    ratingRow: {
      flexDirection:
        'row',

      alignItems:
        'center',

      gap: 5,

      marginTop: 8,
    },

    rating: {
      fontSize: 15,

      fontWeight:
        '800',

      color:
        '#0F172A',
    },

    reviews: {
      flexShrink: 1,

      fontSize: 14,

      color:
        '#64748B',
    },

    /* ========================================================
       DISTANCE + ARRIVAL
    ======================================================== */

    travelRow: {
      alignSelf:
        'flex-start',

      flexDirection:
        'row',

      alignItems:
        'center',

      flexWrap:
        'wrap',

      gap: 6,

      marginTop: 8,
    },

    distance: {
      fontSize: 14,

      fontWeight:
        '800',

      color:
        '#334155',
    },

    travelDot: {
      width: 4,
      height: 4,

      marginHorizontal: 1,

      borderRadius: 2,

      backgroundColor:
        '#94A3B8',
    },

    arrivalText: {
      fontSize: 14,

      fontWeight:
        '800',

      color:
        '#1677FF',
    },

    locationUnavailable: {
      fontSize: 13,

      fontWeight:
        '600',

      color:
        '#64748B',
    },

    /* ========================================================
       STATUS
    ======================================================== */

    badges: {
      flexDirection:
        'row',

      alignItems:
        'center',

      flexWrap:
        'wrap',

      gap: 7,

      marginTop: 10,
    },

    statusBadge: {
      flexShrink: 1,

      paddingHorizontal: 10,

      paddingVertical: 7,

      borderRadius: 12,
    },

    statusContent: {
      flexDirection:
        'row',

      alignItems:
        'center',

      gap: 6,
    },

    statusDot: {
      width: 7,
      height: 7,

      flexShrink: 0,

      borderRadius: 4,
    },

    openStatusDot: {
      backgroundColor:
        '#16A34A',
    },

    closedStatusDot: {
      backgroundColor:
        '#DC2626',
    },

    openBadge: {
      backgroundColor:
        '#F0FDF4',
    },

    closedBadge: {
      backgroundColor:
        '#FEF2F2',
    },

    statusText: {
      flexShrink: 1,

      fontSize: 12,

      lineHeight: 16,

      fontWeight:
        '700',
    },

    openText: {
      color:
        '#15803D',
    },

    closedText: {
      color:
        '#DC2626',
    },

    /* ========================================================
       VERIFIED
    ======================================================== */

    verifiedBadge: {
      flexDirection:
        'row',

      alignItems:
        'center',

      gap: 4,

      paddingHorizontal: 9,

      paddingVertical: 7,

      borderRadius: 12,

      backgroundColor:
        '#EFF6FF',
    },

    verifiedText: {
      fontSize: 12,

      fontWeight:
        '700',

      color:
        '#1677FF',
    },

    pressed: {
      opacity: 0.72,
    },
  });