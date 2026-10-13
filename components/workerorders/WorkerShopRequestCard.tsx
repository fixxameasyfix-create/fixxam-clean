import { Ionicons } from '@expo/vector-icons';

import React, {
  memo,
  useCallback,
  useMemo,
} from 'react';

import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import {
  AppText,
} from '@/components/ui';

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from '@/theme';

import type {
  FirebaseShopRequest,
} from '@/types/firebaseShopRequest';

/* ============================================================
TYPES
============================================================ */

type Props = {
  request: FirebaseShopRequest;

  onPress: (
    request: FirebaseShopRequest,
  ) => void;
};

/* ============================================================
HELPERS
============================================================ */

function formatCreatedAt(
  request: FirebaseShopRequest,
): string {
  const timestamp =
    request.createdAt;

  if (!timestamp) {
    return 'Just now';
  }

  try {
    const createdAt =
      timestamp.toDate();

    const difference =
      Date.now() -
      createdAt.getTime();

    if (
      !Number.isFinite(
        difference,
      ) ||
      difference < 0
    ) {
      return 'Just now';
    }

    const minutes =
      Math.floor(
        difference /
          60_000,
      );

    if (minutes < 1) {
      return 'Just now';
    }

    if (minutes < 60) {
      return `${minutes} min${
        minutes === 1
          ? ''
          : 's'
      } ago`;
    }

    const hours =
      Math.floor(
        minutes / 60,
      );

    if (hours < 24) {
      return `${hours} hr${
        hours === 1
          ? ''
          : 's'
      } ago`;
    }

    const days =
      Math.floor(
        hours / 24,
      );

    if (days < 7) {
      return `${days} day${
        days === 1
          ? ''
          : 's'
      } ago`;
    }

    return createdAt.toLocaleDateString(
      'en-NG',
      {
        day: 'numeric',
        month: 'short',
      },
    );
  } catch {
    return 'Recently';
  }
}

function getInitials(
  name: string,
): string {
  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (
    parts.length === 0
  ) {
    return 'C';
  }

  if (
    parts.length === 1
  ) {
    return parts[0]
      .slice(0, 1)
      .toUpperCase();
  }

  return (
    parts[0].slice(0, 1) +
    parts[1].slice(0, 1)
  ).toUpperCase();
}

function isValidImageUrl(
  value: string,
): boolean {
  return /^https?:\/\/\S+$/i.test(
    value,
  );
}

/* ============================================================
COMPONENT
============================================================ */

function WorkerShopRequestCardComponent({
  request,
  onPress,
}: Props) {
  const customerName =
    request.customerName?.trim() ||
    'Customer';

  const customerPhotoUrl =
    request.customerPhotoUrl?.trim() ??
    '';

  const hasPhoto =
    isValidImageUrl(
      customerPhotoUrl,
    );

  const initials =
    useMemo(
      () =>
        getInitials(
          customerName,
        ),
      [customerName],
    );

  const createdAt =
    useMemo(
      () =>
        formatCreatedAt(
          request,
        ),
      [request],
    );

  const handlePress =
    useCallback(() => {
      onPress(request);
    }, [
      onPress,
      request,
    ]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View request from ${customerName}`}
      accessibilityHint="Opens the full shop request"
      onPress={handlePress}
      style={({
        pressed,
      }) => [
        styles.requestCard,

        pressed &&
          styles.requestCardPressed,
      ]}
    >
      {/* ======================================================
          CUSTOMER AVATAR
      ====================================================== */}

      {hasPhoto ? (
        <Image
          source={{
            uri: customerPhotoUrl,
          }}
          style={styles.avatar}
          resizeMode="cover"
          accessibilityLabel={`${customerName} profile photo`}
        />
      ) : (
        <View
          style={
            styles.avatar
          }
        >
          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.avatarText
            }
          >
            {initials}
          </AppText>
        </View>
      )}

      {/* ======================================================
          CUSTOMER INFO
      ====================================================== */}

      <View
        style={
          styles.requestMain
        }
      >
        <AppText
          variant="bodyMedium"
          weight="bold"
          numberOfLines={1}
          style={
            styles.customerName
          }
        >
          {customerName}
        </AppText>

        <AppText
          variant="caption"
          weight="medium"
          numberOfLines={1}
          style={
            styles.viewRequestText
          }
        >
          View Shop Request
        </AppText>
      </View>

      {/* ======================================================
          TIME + ACTION
      ====================================================== */}

      <View
        style={
          styles.requestRight
        }
      >
        <AppText
          variant="caption"
          numberOfLines={1}
          style={
            styles.createdAt
          }
        >
          {createdAt}
        </AppText>

        <View
          style={
            styles.actionCircle
          }
        >
          <Ionicons
            name="chevron-forward"
            size={21}
            color={
              WorkerColors.primary
            }
          />
        </View>
      </View>
    </Pressable>
  );
}

/* ============================================================
MEMO
============================================================ */

WorkerShopRequestCardComponent.displayName =
  'WorkerShopRequestCard';

const WorkerShopRequestCard =
  memo(
    WorkerShopRequestCardComponent,
  );

export default WorkerShopRequestCard;

/* ============================================================
STYLES
============================================================ */

const styles =
  StyleSheet.create({
    requestCard: {
      width: '100%',

      minHeight: 78,

      marginBottom: 12,

      paddingHorizontal: 14,
      paddingVertical: 10,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.border,

      borderRadius: 20,

      backgroundColor:
        Colors.surface,

      flexDirection:
        'row',

      alignItems:
        'center',
    },

    requestCardPressed: {
      opacity: 0.82,
    },

    /* ======================================================
       AVATAR
    ====================================================== */

    avatar: {
      width: 54,
      height: 54,

      flexShrink: 0,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius: 27,

      backgroundColor:
        WorkerColors.primarySoft,

      overflow: 'hidden',
    },

    avatarText: {
      fontSize: 17,
      lineHeight: 21,

      color:
        WorkerColors.primary,
    },

    /* ======================================================
       MAIN CONTENT
    ====================================================== */

    requestMain: {
      flex: 1,

      minWidth: 0,

      marginLeft: 13,
      marginRight: 8,

      justifyContent:
        'center',
    },

    customerName: {
      fontSize: 17,
      lineHeight: 22,

      color:
        Colors.textPrimary,
    },

    viewRequestText: {
      marginTop: 5,

      fontSize: 13,
      lineHeight: 18,

      color:
        WorkerColors.primary,
    },

    /* ======================================================
       RIGHT CONTENT
    ====================================================== */

    requestRight: {
      flexShrink: 0,

      marginLeft: 8,

      alignItems:
        'flex-end',

      justifyContent:
        'center',
    },

    createdAt: {
      maxWidth: 110,

      marginBottom: 5,

      fontSize: 12,
      lineHeight: 16,

      textAlign: 'right',

      color:
        Colors.textSecondary,
    },

    actionCircle: {
      width: 38,
      height: 38,

      borderRadius: 19,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        WorkerColors.primarySoft,
    },
  });