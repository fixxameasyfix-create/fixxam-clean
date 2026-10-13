import { Ionicons } from '@expo/vector-icons';
import React, { memo, useMemo } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { Shop } from '../../types/shop';

/* ============================================================
   TYPES
============================================================ */

type ShopCardProps = {
  shop: Shop;
  isFavorite: boolean;
  onFavoritePress: () => void;
  onViewShop: () => void;
};

/* ============================================================
   HELPERS
============================================================ */

function formatServiceLabel(
  value: string,
): string {
  const normalized = value
    .trim()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ');

  if (!normalized) {
    return 'Service Provider';
  }

  return normalized.replace(
    /\b\w/g,
    (character) =>
      character.toUpperCase(),
  );
}

function formatDistance(
  value: number,
): string {
  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    return 'Nearby';
  }

  if (value < 0.1) {
    return '< 0.1 km';
  }

  return `${value.toFixed(1)} km`;
}

/* ============================================================
   COMPONENT
============================================================ */

function ShopCardComponent({
  shop,
  isFavorite,
  onFavoritePress,
  onViewShop,
}: ShopCardProps) {
  const serviceLabel = useMemo(
    () =>
      formatServiceLabel(
        shop.serviceLabel,
      ),
    [shop.serviceLabel],
  );

  const distanceLabel = useMemo(
    () =>
      formatDistance(
        shop.distanceKm,
      ),
    [shop.distanceKm],
  );

  return (
    <View style={styles.card}>
      {/* ======================================================
          SHOP IMAGE
      ====================================================== */}

      <Image
        source={{
          uri: shop.imageUrl,
        }}
        resizeMode="cover"
        style={styles.image}
        accessibilityLabel={`${shop.name} shop`}
      />

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View style={styles.content}>
        {/* ====================================================
            HEADER
        ==================================================== */}

        <View style={styles.header}>
          <View
            style={
              styles.titleSection
            }
          >
            <Text
              style={styles.name}
              numberOfLines={1}
            >
              {shop.name}
            </Text>

            <Text
              style={styles.service}
              numberOfLines={1}
            >
              {serviceLabel}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite
                ? `Remove ${shop.name} from favourites`
                : `Add ${shop.name} to favourites`
            }
            hitSlop={10}
            onPress={
              onFavoritePress
            }
            style={({ pressed }) => [
              styles.favoriteButton,

              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name={
                isFavorite
                  ? 'heart'
                  : 'heart-outline'
              }
              size={22}
              color={
                isFavorite
                  ? '#EF4444'
                  : '#64748B'
              }
            />
          </Pressable>
        </View>

        {/* ====================================================
            RATING + DISTANCE
        ==================================================== */}

        <View style={styles.metaRow}>
          <View
            style={
              styles.ratingRow
            }
          >
            <Ionicons
              name="star"
              size={16}
              color="#F59E0B"
            />

            <Text
              style={
                styles.ratingText
              }
            >
              {shop.rating.toFixed(1)}
            </Text>

            <Text
              style={
                styles.reviewText
              }
            >
              ({shop.reviews})
            </Text>
          </View>

          <View
            style={
              styles.metaDivider
            }
          />

          <View
            style={
              styles.distanceRow
            }
          >
            <Ionicons
              name="navigate-outline"
              size={15}
              color="#1677FF"
            />

            <Text
              style={
                styles.distanceText
              }
            >
              {distanceLabel}
            </Text>
          </View>
        </View>

        {/* ====================================================
            STATUS
        ==================================================== */}

        <View
          style={
            styles.statusRow
          }
        >
          <View
            style={[
              styles.statusDot,

              shop.isOpen
                ? styles.openDot
                : styles.closedDot,
            ]}
          />

          <Text
            style={[
              styles.statusText,

              shop.isOpen
                ? styles.openText
                : styles.closedText,
            ]}
          >
            {shop.isOpen
              ? 'Open Now'
              : 'Closed'}
          </Text>
        </View>

        {/* ====================================================
            VIEW SHOP
        ==================================================== */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View ${shop.name}`}
          accessibilityHint="Opens this shop profile"
          onPress={
            onViewShop
          }
          style={({ pressed }) => [
            styles.viewButton,

            pressed &&
              styles.pressed,
          ]}
        >
          <Text
            style={
              styles.viewButtonText
            }
          >
            View Shop
          </Text>

          <Ionicons
            name="chevron-forward"
            size={17}
            color="#1677FF"
          />
        </Pressable>
      </View>
    </View>
  );
}

export const ShopCard = memo(
  ShopCardComponent,
);

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  card: {
    minHeight: 142,

    flexDirection: 'row',

    gap: 12,

    marginBottom: 12,

    padding: 10,

    borderWidth: 1,
    borderColor: '#E2E8F0',

    borderRadius: 18,

    backgroundColor: '#FFFFFF',

    shadowColor: '#0F172A',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.05,
    shadowRadius: 6,

    elevation: 2,
  },

  /* ========================================================
     IMAGE
  ======================================================== */

  image: {
    width: 108,

    alignSelf: 'stretch',

    borderRadius: 14,

    backgroundColor: '#E2E8F0',
  },

  /* ========================================================
     CONTENT
  ======================================================== */

  content: {
    flex: 1,

    minWidth: 0,

    paddingVertical: 2,
  },

  /* ========================================================
     HEADER
  ======================================================== */

  header: {
    flexDirection: 'row',

    alignItems: 'flex-start',

    gap: 6,
  },

  titleSection: {
    flex: 1,

    minWidth: 0,
  },

  name: {
    fontSize: 17,

    lineHeight: 21,

    fontWeight: '800',

    color: '#0F172A',
  },

  service: {
    marginTop: 1,

    fontSize: 13,

    lineHeight: 18,

    color: '#64748B',
  },

  favoriteButton: {
    width: 32,
    height: 32,

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: -3,

    marginRight: -3,

    borderRadius: 16,
  },

  /* ========================================================
     META
  ======================================================== */

  metaRow: {
    flexDirection: 'row',

    alignItems: 'center',

    flexWrap: 'wrap',

    marginTop: 9,
  },

  ratingRow: {
    flexDirection: 'row',

    alignItems: 'center',

    gap: 3,
  },

  ratingText: {
    fontSize: 13,

    fontWeight: '700',

    color: '#0F172A',
  },

  reviewText: {
    fontSize: 12,

    color: '#94A3B8',
  },

  metaDivider: {
    width: 3,
    height: 3,

    marginHorizontal: 9,

    borderRadius: 2,

    backgroundColor: '#CBD5E1',
  },

  distanceRow: {
    flexDirection: 'row',

    alignItems: 'center',

    gap: 4,
  },

  distanceText: {
    fontSize: 12,

    fontWeight: '600',

    color: '#475569',
  },

  /* ========================================================
     STATUS
  ======================================================== */

  statusRow: {
    flexDirection: 'row',

    alignItems: 'center',

    gap: 6,

    marginTop: 8,
  },

  statusDot: {
    width: 7,
    height: 7,

    borderRadius: 4,
  },

  openDot: {
    backgroundColor: '#22C55E',
  },

  closedDot: {
    backgroundColor: '#EF4444',
  },

  statusText: {
    fontSize: 12,

    fontWeight: '700',
  },

  openText: {
    color: '#15803D',
  },

  closedText: {
    color: '#DC2626',
  },

  /* ========================================================
     VIEW SHOP
  ======================================================== */

  viewButton: {
    minHeight: 38,

    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'center',

    gap: 4,

    marginTop: 9,

    paddingHorizontal: 12,

    borderRadius: 12,

    backgroundColor: '#EFF6FF',
  },

  viewButtonText: {
    fontSize: 13,

    fontWeight: '700',

    color: '#1677FF',
  },

  /* ========================================================
     STATES
  ======================================================== */

  pressed: {
    opacity: 0.7,
  },
});