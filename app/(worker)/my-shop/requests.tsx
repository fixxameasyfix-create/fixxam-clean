import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
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

import { useAuth } from '../../../contexts/AuthContext';
import {
  subscribeToWorkerShopRequests,
} from '../../../services/shopRequestService';

import type {
  FirebaseShopRequest,
} from '../../../types/firebaseShopRequest';

/* ============================================================
   TYPES
============================================================ */

type RequestFilter =
  | 'pending'
  | 'accepted'
  | 'completed'
  | 'cancelled';

type ScreenState =
  | 'loading'
  | 'ready'
  | 'error'
  | 'signedOut';

type FilterConfig = {
  id: RequestFilter;
  label: string;
};

/* ============================================================
   CONSTANTS
============================================================ */

const PRIMARY_BLUE = '#60A5FA';
const DARK_TEXT = '#172033';
const SECONDARY_TEXT = '#64748B';
const MUTED_TEXT = '#94A3B8';
const BORDER = '#DCEEFF';
const SOFT_BLUE = '#EAF5FF';
const BACKGROUND = '#F8FAFC';

/* ============================================================
   FILTERS
============================================================ */

const FILTERS: FilterConfig[] = [
  {
    id: 'pending',
    label: 'Pending',
  },
  {
    id: 'accepted',
    label: 'Accepted',
  },
  {
    id: 'completed',
    label: 'Completed',
  },
  {
    id: 'cancelled',
    label: 'Cancelled',
  },
];

/* ============================================================
   HELPERS
============================================================ */

function formatCreatedAt(
  request: FirebaseShopRequest,
): string {
  const timestamp = request.createdAt;

  if (
    !timestamp ||
    typeof timestamp.toDate !== 'function'
  ) {
    return 'Just now';
  }

  try {
    const createdDate = timestamp.toDate();

    if (Number.isNaN(createdDate.getTime())) {
      return 'Just now';
    }

    const now = new Date();

    const differenceMs = Math.max(
      0,
      now.getTime() - createdDate.getTime(),
    );

    const minutes = Math.floor(
      differenceMs / 60_000,
    );

    if (minutes < 1) {
      return 'Just now';
    }

    if (minutes < 60) {
      return `${minutes} min${
        minutes === 1 ? '' : 's'
      } ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} hour${
        hours === 1 ? '' : 's'
      } ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
      return `${days} day${
        days === 1 ? '' : 's'
      } ago`;
    }

    return createdDate.toLocaleDateString(
      'en-NG',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      },
    );
  } catch {
    return 'Just now';
  }
}

function getCustomerInitials(
  customerName: string,
): string {
  const initials = customerName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) =>
      part.charAt(0),
    )
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return initials || 'CU';
}

function isValidImageUrl(
  value: unknown,
): value is string {
  return (
    typeof value === 'string' &&
    /^https?:\/\//i.test(value.trim())
  );
}

/* ============================================================
   SCREEN
============================================================ */

export default function ShopRequestsScreen() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const userId = user?.uid ?? null;

  const [
    requests,
    setRequests,
  ] = useState<FirebaseShopRequest[]>([]);

  const [
    selectedFilter,
    setSelectedFilter,
  ] = useState<RequestFilter>('pending');

  const [
    screenState,
    setScreenState,
  ] = useState<ScreenState>('loading');

  const [
    loadError,
    setLoadError,
  ] = useState('');

  const [
    retryKey,
    setRetryKey,
  ] = useState(0);

  /* ==========================================================
     REALTIME REQUEST SUBSCRIPTION
  ========================================================== */

  useEffect(() => {
    if (authLoading) {
      setScreenState('loading');
      return;
    }

    if (!userId) {
      setRequests([]);
      setLoadError('');
      setScreenState('signedOut');
      return;
    }

    setLoadError('');
    setScreenState('loading');

    const unsubscribe =
      subscribeToWorkerShopRequests(
        userId,
        (nextRequests) => {
          setRequests(
            Array.isArray(nextRequests)
              ? nextRequests
              : [],
          );

          setLoadError('');
          setScreenState('ready');
        },
        (error) => {
          console.error(
            'Unable to load shop requests:',
            error,
          );

          setRequests([]);

          setLoadError(
            'Unable to load shop requests. Check your connection and try again.',
          );

          setScreenState('error');
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
     COUNTS
  ========================================================== */

  const filterCounts = useMemo(() => {
    const counts: Record<
      RequestFilter,
      number
    > = {
      pending: 0,
      accepted: 0,
      completed: 0,
      cancelled: 0,
    };

    requests.forEach((request) => {
      switch (request.status) {
        case 'pending':
          counts.pending += 1;
          break;

        case 'accepted':
          counts.accepted += 1;
          break;

        case 'completed':
          counts.completed += 1;
          break;

        case 'cancelled':
          counts.cancelled += 1;
          break;

        default:
          break;
      }
    });

    return counts;
  }, [requests]);

  const pendingCount =
    filterCounts.pending;

  /* ==========================================================
     FILTERED REQUESTS
  ========================================================== */

  const filteredRequests = useMemo(() => {
    return requests.filter(
      (request) =>
        request.status === selectedFilter,
    );
  }, [
    requests,
    selectedFilter,
  ]);

  /* ==========================================================
     RETRY
  ========================================================== */

  const handleRetry = useCallback(() => {
    if (!userId) {
      return;
    }

    setLoadError('');
    setScreenState('loading');

    setRetryKey(
      (current) => current + 1,
    );
  }, [userId]);

  /* ==========================================================
     OPEN REQUEST
  ========================================================== */

  const handleOpenRequest = useCallback(
    (requestId: string) => {
      router.push({
        pathname: '/my-shop/[id]',
        params: {
          id: requestId,
        },
      });
    },
    [],
  );

  /* ==========================================================
     LOADING
  ========================================================== */

  if (
    authLoading ||
    screenState === 'loading'
  ) {
    return (
      <SafeAreaView
        edges={['top', 'bottom']}
        style={styles.safeArea}
      >
        <Header pendingCount={0} />

        <View style={styles.stateContainer}>
          <View style={styles.loadingIcon}>
            <ActivityIndicator
              size="large"
              color={PRIMARY_BLUE}
              accessibilityLabel="Loading shop requests"
            />
          </View>

          <Text style={styles.stateTitle}>
            Loading Requests
          </Text>

          <Text style={styles.stateText}>
            Checking for customer booking
            requests...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ==========================================================
     SIGNED OUT
  ========================================================== */

  if (screenState === 'signedOut') {
    return (
      <SafeAreaView
        edges={['top', 'bottom']}
        style={styles.safeArea}
      >
        <Header pendingCount={0} />

        <View style={styles.stateContainer}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="person-circle-outline"
              size={46}
              color="#DC2626"
            />
          </View>

          <Text style={styles.stateTitle}>
            Sign In Required
          </Text>

          <Text style={styles.stateText}>
            You must be signed in to view and
            manage your shop requests.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (screenState === 'error') {
    return (
      <SafeAreaView
        edges={['top', 'bottom']}
        style={styles.safeArea}
      >
        <Header pendingCount={0} />

        <View style={styles.stateContainer}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="cloud-offline-outline"
              size={44}
              color="#DC2626"
            />
          </View>

          <Text style={styles.stateTitle}>
            Unable to Load Requests
          </Text>

          <Text style={styles.stateText}>
            {loadError ||
              'Unable to load shop requests. Please try again.'}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry loading requests"
            onPress={handleRetry}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="refresh"
              size={20}
              color="#FFFFFF"
            />

            <Text style={styles.retryButtonText}>
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
      edges={['top', 'bottom']}
      style={styles.safeArea}
    >
      <Header pendingCount={pendingCount} />

      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.filtersContainer
          }
        >
          {FILTERS.map((filter) => {
            const selected =
              selectedFilter === filter.id;

            const count =
              filterCounts[filter.id];

            return (
              <Pressable
                key={filter.id}
                accessibilityRole="button"
                accessibilityLabel={`${filter.label} requests, ${count}`}
                accessibilityState={{
                  selected,
                }}
                onPress={() =>
                  setSelectedFilter(filter.id)
                }
                style={({ pressed }) => [
                  styles.filterButton,
                  selected &&
                    styles.filterButtonActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    selected &&
                      styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>

                <View
                  style={[
                    styles.filterCount,
                    selected &&
                      styles.filterCountActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterCountText,
                      selected &&
                        styles.filterCountTextActive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onPress={handleOpenRequest}
            />
          ))
        ) : (
          <EmptyState
            filter={selectedFilter}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================================================
   HEADER
============================================================ */

function Header({
  pendingCount,
}: {
  pendingCount: number;
}) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={10}
        onPress={() => router.back()}
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="arrow-back"
          size={23}
          color={PRIMARY_BLUE}
        />
      </Pressable>

      <View style={styles.headerText}>
        <Text style={styles.headerTitle}>
          Shop Requests
        </Text>

        <Text style={styles.headerSubtitle}>
          Manage customer booking requests
        </Text>
      </View>

      <View
        accessibilityLabel={`${pendingCount} pending requests`}
        style={styles.headerCount}
      >
        <Text style={styles.headerCountText}>
          {pendingCount}
        </Text>
      </View>
    </View>
  );
}

/* ============================================================
   REQUEST CARD
============================================================ */

function RequestCard({
  request,
  onPress,
}: {
  request: FirebaseShopRequest;
  onPress: (requestId: string) => void;
}) {
  const customerName =
    request.customerName?.trim() ||
    'Customer';

  const customerPhotoUrl =
    request.customerPhotoUrl?.trim() ?? '';

  const hasPhoto =
    isValidImageUrl(customerPhotoUrl);

  const initials = useMemo(
    () =>
      getCustomerInitials(
        customerName,
      ),
    [customerName],
  );

  const createdAt = useMemo(
    () => formatCreatedAt(request),
    [request],
  );

  const handlePress = useCallback(() => {
    onPress(request.id);
  }, [
    onPress,
    request.id,
  ]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View request from ${customerName}`}
      accessibilityHint="Opens the full shop request"
      onPress={handlePress}
      style={({ pressed }) => [
        styles.requestCard,
        pressed && styles.requestCardPressed,
      ]}
    >
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
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {initials}
          </Text>
        </View>
      )}

      <View style={styles.requestMain}>
        <Text
          style={styles.customerName}
          numberOfLines={1}
        >
          {customerName}
        </Text>

        <Text
          style={styles.viewRequestText}
          numberOfLines={1}
        >
          View Shop Request
        </Text>
      </View>

      <View style={styles.requestRight}>
        <Text
          style={styles.createdAt}
          numberOfLines={1}
        >
          {createdAt}
        </Text>

        <View style={styles.actionCircle}>
          <Ionicons
            name="chevron-forward"
            size={21}
            color={PRIMARY_BLUE}
          />
        </View>
      </View>
    </Pressable>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({
  filter,
}: {
  filter: RequestFilter;
}) {
  const config: Record<
    RequestFilter,
    {
      title: string;
      message: string;
      icon:
        | 'time-outline'
        | 'checkmark-circle-outline'
        | 'checkmark-done-outline'
        | 'close-circle-outline';
    }
  > = {
    pending: {
      title: 'No pending requests',
      message:
        'New customer requests will appear here.',
      icon: 'time-outline',
    },

    accepted: {
      title: 'No accepted requests',
      message:
        'Accepted shop requests will appear here.',
      icon: 'checkmark-circle-outline',
    },

    completed: {
      title: 'No completed services',
      message:
        'Completed services will appear here.',
      icon: 'checkmark-done-outline',
    },

    cancelled: {
      title: 'No cancelled requests',
      message:
        'Requests cancelled by customers will appear here.',
      icon: 'close-circle-outline',
    },
  };

  const current = config[filter];

  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name={current.icon}
          size={40}
          color={SECONDARY_TEXT}
        />
      </View>

      <Text style={styles.emptyTitle}>
        {current.title}
      </Text>

      <Text style={styles.emptyText}>
        {current.message}
      </Text>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  /* ==========================================================
     HEADER
  ========================================================== */

  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,

    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,

    borderRadius: 15,

    backgroundColor: SOFT_BLUE,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  headerTitle: {
    fontSize: 26,
    lineHeight: 32,

    fontWeight: '700',

    color: DARK_TEXT,
  },

  headerSubtitle: {
    marginTop: 4,

    fontSize: 14,
    lineHeight: 20,

    color: SECONDARY_TEXT,
  },

  headerCount: {
    minWidth: 44,
    height: 44,

    paddingHorizontal: 12,

    alignItems: 'center',
    justifyContent: 'center',

    marginLeft: 12,

    borderRadius: 22,

    backgroundColor: SOFT_BLUE,
  },

  headerCountText: {
    fontSize: 15,

    fontWeight: '700',

    color: '#3B82F6',
  },

  /* ==========================================================
     FILTERS
  ========================================================== */

  filtersWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#E7EEF4',

    backgroundColor: BACKGROUND,
  },

  filtersContainer: {
    gap: 9,

    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 14,
  },

  filterButton: {
    minHeight: 42,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 7,

    paddingHorizontal: 16,

    borderRadius: 21,

    backgroundColor: '#EDF2F6',
  },

  filterButtonActive: {
    backgroundColor: PRIMARY_BLUE,
  },

  filterText: {
    fontSize: 13,

    fontWeight: '700',

    color: SECONDARY_TEXT,
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  filterCount: {
    minWidth: 22,
    height: 22,

    paddingHorizontal: 5,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 11,

    backgroundColor: '#DCE5EC',
  },

  filterCountActive: {
    backgroundColor:
      'rgba(255,255,255,0.22)',
  },

  filterCountText: {
    fontSize: 10,

    fontWeight: '800',

    color: SECONDARY_TEXT,
  },

  filterCountTextActive: {
    color: '#FFFFFF',
  },

  /* ==========================================================
     CONTENT
  ========================================================== */

  content: {
    flexGrow: 1,

    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 32,
  },

  /* ==========================================================
     REQUEST CARD
  ========================================================== */

  requestCard: {
    marginBottom: 12,

    minHeight: 78,

    paddingHorizontal: 14,
    paddingVertical: 10,

    borderRadius: 20,

    backgroundColor: '#FFFFFF',

    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: BORDER,
  },

  requestCardPressed: {
    opacity: 0.82,
  },

  /* ==========================================================
     CUSTOMER PHOTO
  ========================================================== */

  avatar: {
    width: 54,
    height: 54,

    flexShrink: 0,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 27,

    backgroundColor: SOFT_BLUE,

    overflow: 'hidden',
  },

  avatarText: {
    fontSize: 17,

    fontWeight: '700',

    color: PRIMARY_BLUE,
  },

  /* ==========================================================
     CUSTOMER INFO
  ========================================================== */

  requestMain: {
    flex: 1,
    minWidth: 0,

    marginLeft: 13,
    marginRight: 8,
  },

  customerName: {
    fontSize: 17,

    lineHeight: 22,

    fontWeight: '700',

    color: DARK_TEXT,
  },

  viewRequestText: {
    marginTop: 5,

    fontSize: 13,

    lineHeight: 18,

    fontWeight: '500',

    color: PRIMARY_BLUE,
  },

  /* ==========================================================
     RIGHT CONTENT
  ========================================================== */

  requestRight: {
    flexShrink: 0,

    marginLeft: 8,

    alignItems: 'flex-end',

    justifyContent: 'center',
  },

  createdAt: {
    marginBottom: 5,

    maxWidth: 110,

    fontSize: 12,

    lineHeight: 16,

    textAlign: 'right',

    color: MUTED_TEXT,
  },

  actionCircle: {
    width: 38,
    height: 38,

    borderRadius: 19,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: SOFT_BLUE,
  },

  /* ==========================================================
     EMPTY STATE
  ========================================================== */

  emptyState: {
    flex: 1,

    minHeight: 430,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 32,
  },

  emptyIcon: {
    width: 76,
    height: 76,

    marginBottom: 18,

    borderRadius: 38,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: SOFT_BLUE,
  },

  emptyTitle: {
    fontSize: 19,

    fontWeight: '700',

    color: DARK_TEXT,

    textAlign: 'center',
  },

  emptyText: {
    maxWidth: 280,

    marginTop: 8,

    fontSize: 14,

    lineHeight: 21,

    color: SECONDARY_TEXT,

    textAlign: 'center',
  },

  /* ==========================================================
     LOADING / ERROR
  ========================================================== */

  stateContainer: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 30,
  },

  loadingIcon: {
    width: 76,
    height: 76,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 24,

    backgroundColor: SOFT_BLUE,
  },

  errorIcon: {
    width: 76,
    height: 76,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 24,

    backgroundColor: '#FEF2F2',
  },

  stateTitle: {
    marginTop: 18,

    fontSize: 20,

    fontWeight: '700',

    color: DARK_TEXT,

    textAlign: 'center',
  },

  stateText: {
    maxWidth: 320,

    marginTop: 7,

    fontSize: 14,

    lineHeight: 21,

    color: SECONDARY_TEXT,

    textAlign: 'center',
  },

  retryButton: {
    height: 46,

    marginTop: 20,

    paddingHorizontal: 22,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,

    borderRadius: 13,

    backgroundColor: PRIMARY_BLUE,
  },

  retryButtonText: {
    fontSize: 14,

    fontWeight: '700',

    color: '#FFFFFF',
  },

  pressed: {
    opacity: 0.72,
  },
});