import React, {
  memo,
  useMemo,
} from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type {
  FirebaseShopService,
} from '../../../types/firebaseShop';

/* ============================================================
   TYPES
============================================================ */

type ShopBookingSummaryProps = {
  service: FirebaseShopService;
  disabled?: boolean;
  onChangeService: () => void;
};

/* ============================================================
   HELPERS
============================================================ */

function formatNaira(
  value: number,
): string {
  const safeValue =
    Number.isFinite(value) &&
    value >= 0
      ? value
      : 0;

  return `₦${safeValue.toLocaleString(
    'en-NG',
  )}`;
}

/* ============================================================
   COMPONENT
============================================================ */

function ShopBookingSummary({
  service,
  disabled = false,
  onChangeService,
}: ShopBookingSummaryProps) {
  const formattedPrice =
    useMemo(
      () =>
        formatNaira(
          service.startingPrice,
        ),
      [
        service.startingPrice,
      ],
    );

  return (
    <View
      style={
        styles.section
      }
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={
          styles.sectionHeader
        }
      >
        <Text
          style={
            styles.sectionTitle
          }
        >
          Selected Service
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change selected service"
          accessibilityState={{
            disabled,
          }}
          disabled={disabled}
          onPress={
            onChangeService
          }
          hitSlop={8}
          style={({
            pressed,
          }) => [
            styles.changeButton,

            disabled &&
              styles.disabled,

            pressed &&
              !disabled &&
              styles.pressed,
          ]}
        >
          <Text
            style={
              styles.changeText
            }
          >
            Change
          </Text>
        </Pressable>
      </View>

      {/* ======================================================
          SELECTED SERVICE
      ====================================================== */}

      <View
        style={
          styles.selectedServiceCard
        }
      >
        <Image
          source={{
            uri: service.imageUrl,
          }}
          resizeMode="cover"
          style={
            styles.serviceImage
          }
        />

        <View
          style={
            styles.selectedServiceContent
          }
        >
          <Text
            style={
              styles.selectedServiceName
            }
            numberOfLines={1}
          >
            {service.name}
          </Text>

          {service.description.trim() ? (
            <Text
              style={
                styles.selectedServiceDescription
              }
              numberOfLines={2}
            >
              {service.description}
            </Text>
          ) : null}
        </View>

        <View
          style={
            styles.priceContainer
          }
        >
          <Text
            style={
              styles.priceLabel
            }
          >
            From
          </Text>

          <Text
            style={
              styles.price
            }
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {formattedPrice}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default memo(
  ShopBookingSummary,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    section: {
      marginTop: 12,
    },

    sectionHeader: {
      minHeight: 42,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      gap: 12,
    },

    sectionTitle: {
      flex: 1,

      fontSize: 19,

      fontWeight:
        '800',

      color:
        '#0F172A',
    },

    changeButton: {
      minHeight: 40,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal: 6,
    },

    changeText: {
      fontSize: 15,

      fontWeight:
        '700',

      color:
        '#1677FF',
    },

    selectedServiceCard: {
      minHeight: 92,

      flexDirection:
        'row',

      alignItems:
        'center',

      gap: 12,

      marginTop: 8,

      padding: 12,

      borderWidth: 1,

      borderColor:
        '#E2E8F0',

      borderRadius: 18,

      backgroundColor:
        '#FFFFFF',
    },

    serviceImage: {
      width: 70,
      height: 70,

      flexShrink: 0,

      borderRadius: 14,

      backgroundColor:
        '#E2E8F0',
    },

    selectedServiceContent: {
      flex: 1,

      minWidth: 0,
    },

    selectedServiceName: {
      fontSize: 16,

      lineHeight: 21,

      fontWeight:
        '800',

      color:
        '#0F172A',
    },

    selectedServiceDescription: {
      marginTop: 4,

      fontSize: 13,

      lineHeight: 18,

      color:
        '#64748B',
    },

    priceContainer: {
      maxWidth: 105,

      flexShrink: 0,

      alignItems:
        'flex-end',

      justifyContent:
        'center',
    },

    priceLabel: {
      fontSize: 12,

      fontWeight:
        '600',

      color:
        '#64748B',
    },

    price: {
      marginTop: 2,

      textAlign:
        'right',

      fontSize: 15,

      fontWeight:
        '800',

      color:
        '#1677FF',
    },

    disabled: {
      opacity: 0.5,
    },

    pressed: {
      opacity: 0.72,
    },
  });