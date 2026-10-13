import { Ionicons } from '@expo/vector-icons';
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui';
import { auth } from '@/firebase/config';
import { createWorkerShopRequestCallSession } from '@/services/calls/callSession';
import {
  subscribeToWorkerShopRequest,
  updateShopRequestStatus,
} from '@/services/shopRequestService';
import { Colors, FixxamTokens, WorkerColors } from '@/theme';
import type {
  FirebaseShopRequest,
  FirebaseShopRequestStatus,
} from '@/types/firebaseShopRequest';

const param = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v[0] : v)?.trim() ?? '';

const price = (v: number) =>
  `₦${(Number.isFinite(v) && v >= 0 ? v : 0).toLocaleString('en-NG')}`;

const createdAt = (r: FirebaseShopRequest) => {
  if (!r.createdAt) return 'Just now';
  try {
    return r.createdAt.toDate().toLocaleString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return 'Recently';
  }
};

const errorText = (e: unknown) =>
  e instanceof Error && e.message.trim()
    ? e.message.trim()
    : 'Something went wrong. Please try again.';

const statusConfig = (s: FirebaseShopRequestStatus) => {
  switch (s) {
    case 'accepted':
      return {
        label: 'Accepted',
        icon: 'checkmark-circle-outline' as const,
        bg: '#EFF6FF',
        color: WorkerColors.primary,
        message: 'You accepted this service request.',
      };
    case 'completed':
      return {
        label: 'Completed',
        icon: 'checkmark-done-circle-outline' as const,
        bg: '#DCFCE7',
        color: '#15803D',
        message: 'This service request has been completed.',
      };
    case 'declined':
      return {
        label: 'Declined',
        icon: 'close-circle-outline' as const,
        bg: Colors.errorSoft,
        color: Colors.error,
        message: 'This service request was declined.',
      };
    default:
      return {
        label: 'Pending',
        icon: 'time-outline' as const,
        bg: '#FEF3C7',
        color: '#D97706',
        message: 'Review this request and choose whether to accept it.',
      };
  }
};

export default function WorkerShopRequestDetailsScreen() {
  const navigation = useNavigation();
  const { requestId: rawId } =
    useLocalSearchParams<{ requestId?: string | string[] }>();
  const requestId = param(rawId);

  const [request, setRequest] = useState<FirebaseShopRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [calling, setCalling] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({ tabBarStyle: { display: 'none' } });
      return () => parent?.setOptions({ tabBarStyle: undefined });
    }, [navigation]),
  );

  useEffect(() => {
    if (!requestId) {
      setLoading(false);
      setError('Request information is missing.');
      return;
    }

    setLoading(true);
    setError('');

    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = subscribeToWorkerShopRequest(
        requestId,
        r => {
          setRequest(r);
          setLoading(false);
          setError(r ? '' : 'This request could not be found.');
        },
        e => {
          console.error('Request subscription failed:', e);
          setRequest(null);
          setLoading(false);
          setError(errorText(e));
        },
      );
    } catch (e) {
      console.error('Request subscription setup failed:', e);
      setRequest(null);
      setLoading(false);
      setError(errorText(e));
    }

    return () => unsubscribe?.();
  }, [requestId]);

  const updateStatus = useCallback(
    async (status: FirebaseShopRequestStatus) => {
      if (!request || updating || calling) return;

      try {
        setUpdating(true);
        await updateShopRequestStatus({
          requestId: request.id,
          status,
        });
      } catch (e) {
        console.error('Request status update failed:', e);
        Alert.alert('Unable to Update Request', errorText(e));
      } finally {
        setUpdating(false);
      }
    },
    [request, updating, calling],
  );

  const confirmStatus = useCallback(
    (
      status: FirebaseShopRequestStatus,
      title: string,
      message: string,
      confirmText: string,
    ) => {
      if (!request || updating || calling) return;

      Alert.alert(title, message, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: confirmText,
          style: status === 'declined' ? 'destructive' : 'default',
          onPress: () => void updateStatus(status),
        },
      ]);
    },
    [request, updating, calling, updateStatus],
  );

  const accept = () =>
    confirmStatus(
      'accepted',
      'Accept Request',
      `Accept ${request?.customerName}'s request for ${request?.serviceName}?`,
      'Accept',
    );

  const decline = () =>
    confirmStatus(
      'declined',
      'Decline Request',
      `Decline ${request?.customerName}'s request for ${request?.serviceName}?`,
      'Decline',
    );

  const complete = () =>
    confirmStatus(
      'completed',
      'Complete Service',
      `Mark ${request?.serviceName} for ${request?.customerName} as completed?`,
      'Complete',
    );

  const callCustomer = useCallback(async () => {
    if (!request || calling || updating) return;

    if (!['pending', 'accepted'].includes(request.status)) {
      Alert.alert(
        'Call Unavailable',
        'Calls are no longer available for this request.',
      );
      return;
    }

    const workerId = auth.currentUser?.uid?.trim();

    if (!workerId) {
      Alert.alert(
        'Sign In Required',
        'Please sign in again before starting a call.',
      );
      return;
    }

    if (workerId !== request.workerId) {
      Alert.alert(
        'Call Unavailable',
        'You are not assigned to this request.',
      );
      return;
    }

    const customerId = request.customerId?.trim();

    if (!customerId) {
      Alert.alert(
        'Call Unavailable',
        'Customer information is missing.',
      );
      return;
    }

    try {
      setCalling(true);

      const callId = await createWorkerShopRequestCallSession({
        workerId,
        customerId,
        shopRequestId: request.id,
        workerSnapshot: {
          name: request.shopName || 'Shop',
          image: '',
          service: request.serviceName || 'Shop service',
        },
        customerSnapshot: {
          name: request.customerName || 'Customer',
          image: '',
          service: request.serviceName || 'Customer',
        },
      });

      router.push({
        pathname: '/(worker)/call/[customer]',
        params: {
          customer: customerId,
          callId,
          customerName: request.customerName || 'Customer',
        },
      } as never);
    } catch (e) {
      console.error('Worker shop request call failed:', e);
      Alert.alert('Unable to Start Call', errorText(e));
    } finally {
      setCalling(false);
    }
  }, [request, calling, updating]);

  const back = useCallback(() => {
    router.canGoBack()
      ? router.back()
      : router.replace('/(worker)/(tabs)/orders');
  }, []);

  if (loading)
    return <State loading />;

  if (error || !request)
    return <State error={error || 'Unable to load this request.'} onBack={back} />;

  const status = statusConfig(request.status);
  const photos = [...new Set(
    request.photoUrls
      .map(v => v.trim())
      .filter(v => /^https:\/\//i.test(v)),
  )];

  const disabled = updating || calling;
  const canCall = request.status === 'pending' || request.status === 'accepted';

  return (
    <>
      <SafeAreaView edges={['top', 'bottom']} style={s.safe}>
        <View style={s.header}>
          <Pressable onPress={back} hitSlop={8} style={s.iconButton}>
            <Ionicons name="chevron-back" size={23} color={Colors.textPrimary} />
          </Pressable>

          <AppText weight="bold" style={s.headerTitle}>
            Request Details
          </AppText>

          <View style={s.iconButton} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.content}
        >
          <View style={s.hero}>
            <View style={s.rowBetween}>
              <View style={s.heroIcon}>
                <Ionicons
                  name="briefcase-outline"
                  size={22}
                  color={WorkerColors.primary}
                />
              </View>

              <View style={[s.status, { backgroundColor: status.bg }]}>
                <Ionicons name={status.icon} size={14} color={status.color} />
                <AppText variant="caption" weight="bold" style={{ color: status.color }}>
                  {status.label}
                </AppText>
              </View>
            </View>

            <AppText weight="bold" style={s.heroTitle}>
              {request.serviceName || 'Shop Service'}
            </AppText>

            <View style={s.rowBetween}>
              <AppText variant="caption" tone="secondary">
                Service request
              </AppText>
              <AppText weight="bold" style={s.price}>
                {price(request.servicePrice)}
              </AppText>
            </View>
          </View>

          <View style={s.notice}>
            <View style={s.smallIcon}>
              <Ionicons
                name="storefront-outline"
                size={20}
                color={WorkerColors.primary}
              />
            </View>

            <View style={s.flex}>
              <AppText weight="bold">Customer comes to your shop</AppText>
              <AppText variant="caption" tone="secondary">
                Be ready at the selected date and time for this service.
              </AppText>
            </View>
          </View>

          <Section title="Customer">
            <View style={s.customer}>
              <View style={s.avatar}>
                <Ionicons name="person" size={19} color={WorkerColors.primary} />
              </View>

              <View style={s.flex}>
                <AppText weight="bold" numberOfLines={1}>
                  {request.customerName || 'Customer'}
                </AppText>
                <AppText variant="caption" tone="secondary">
                  Request sent {createdAt(request)}
                </AppText>
              </View>
            </View>
          </Section>

          <Section title="Visit Details">
            <InfoRow
              icon="calendar-outline"
              label="Date"
              value={request.requestedDateLabel || 'Unavailable'}
            />
            <Divider />
            <InfoRow
              icon="time-outline"
              label="Time"
              value={request.requestedTime || 'Unavailable'}
            />
            <Divider />
            <InfoRow icon="location-outline" label="Location" value="Your shop" />
          </Section>

          <Section title="Service">
            <InfoRow
              icon="construct-outline"
              label="Service"
              value={request.serviceName || 'Service'}
            />
            <Divider />
            <InfoRow
              icon="cash-outline"
              label="Price"
              value={price(request.servicePrice)}
              valueStyle={s.price}
            />
          </Section>

          {request.description ? (
            <View style={s.card}>
              <View style={s.noteHeader}>
                <View style={s.smallIcon}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={17}
                    color={WorkerColors.primary}
                  />
                </View>
                <AppText variant="caption" weight="bold">
                  Customer Note
                </AppText>
              </View>

              <AppText style={s.note}>
                {request.description}
              </AppText>
            </View>
          ) : null}

          {photos.length ? (
            <Section title="Customer Photos">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.photos}
              >
                {photos.map((uri, i) => (
                  <Pressable
                    key={uri}
                    onPress={() => setPhoto(uri)}
                    style={s.photoButton}
                    accessibilityRole="button"
                    accessibilityLabel={`Open customer photo ${i + 1}`}
                  >
                    <Image source={{ uri }} style={s.photo} />
                    <View style={s.expand}>
                      <Ionicons name="expand-outline" size={12} color="#FFF" />
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </Section>
          ) : null}

          <View style={s.requestInfo}>
            <View style={s.requestLabel}>
              <Ionicons name="receipt-outline" size={15} color={Colors.textSecondary} />
              <AppText variant="caption" weight="semibold" tone="secondary">
                Request ID
              </AppText>
            </View>
            <AppText variant="caption" tone="secondary" selectable numberOfLines={1}>
              {request.id}
            </AppText>
          </View>

          {canCall && (
            <Button
              outline
              disabled={disabled}
              loading={calling}
              icon="call-outline"
              text={calling ? 'Starting Call...' : 'Call Customer'}
              onPress={() => void callCustomer()}
            />
          )}

          {request.status === 'accepted' && (
            <>
              <StateCard
                icon="checkmark-circle-outline"
                title="Request Accepted"
                message="The customer can now come to your shop at the selected date and time."
                bg="#EFF6FF"
                color={WorkerColors.primary}
              />

              <View style={s.warning}>
                <Ionicons name="information-circle-outline" size={19} color="#B45309" />
                <View style={s.flex}>
                  <AppText variant="caption" weight="bold" style={{ color: '#92400E' }}>
                    Complete only after service
                  </AppText>
                  <AppText variant="caption" style={{ color: '#92400E' }}>
                    Mark this request as completed only after the customer has visited your shop.
                  </AppText>
                </View>
              </View>

              <Button
                disabled={disabled}
                loading={updating}
                icon="checkmark-done-outline"
                text={updating ? 'Updating...' : 'Mark as Completed'}
                onPress={complete}
              />
            </>
          )}

          {request.status === 'completed' && (
            <StateCard
              icon="checkmark-done-circle-outline"
              title="Service Completed"
              message="This request has been successfully completed."
              bg="#DCFCE7"
              color="#15803D"
            />
          )}

          {request.status === 'declined' && (
            <StateCard
              icon="close-circle-outline"
              title="Request Declined"
              message="You declined this service request."
              bg={Colors.errorSoft}
              color={Colors.error}
            />
          )}

          {request.status === 'pending' && (
            <View style={s.actions}>
              <Button
                disabled={disabled}
                loading={updating}
                icon="checkmark"
                text={updating ? 'Updating...' : 'Accept Request'}
                onPress={accept}
              />

              <Button
                outline
                danger
                disabled={disabled}
                icon="close-outline"
                text="Decline Request"
                onPress={decline}
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={!!photo}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setPhoto(null)}
      >
        <View style={s.modal}>
          <SafeAreaView style={s.modalSafe}>
            <View style={s.modalHeader}>
              <AppText weight="bold" style={{ color: '#FFF' }}>
                Customer Photo
              </AppText>

              <Pressable onPress={() => setPhoto(null)} style={s.close}>
                <Ionicons name="close" size={23} color="#FFF" />
              </Pressable>
            </View>

            <View style={s.modalContent}>
              {photo && (
                <Image
                  source={{ uri: photo }}
                  resizeMode="contain"
                  style={s.fullPhoto}
                />
              )}
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.card}>
      <AppText variant="caption" weight="bold" style={s.sectionTitle}>
        {title}
      </AppText>
      {children}
    </View>
  );
}

function Divider() {
  return <View style={s.divider} />;
}

function InfoRow({
  icon,
  label,
  value,
  valueStyle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  valueStyle?: object;
}) {
  return (
    <View style={s.infoRow}>
      <View style={s.infoLeft}>
        <View style={s.infoIcon}>
          <Ionicons name={icon} size={16} color={WorkerColors.primary} />
        </View>
        <AppText variant="caption" tone="secondary">
          {label}
        </AppText>
      </View>

      <AppText
        variant="caption"
        weight="semibold"
        numberOfLines={2}
        style={[s.infoValue, valueStyle]}
      >
        {value}
      </AppText>
    </View>
  );
}

function Button({
  text,
  icon,
  onPress,
  disabled,
  loading,
  outline,
  danger,
}: {
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  outline?: boolean;
  danger?: boolean;
}) {
  const color = danger ? Colors.error : WorkerColors.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        s.button,
        outline
          ? { backgroundColor: Colors.surface, borderColor: color, borderWidth: 1 }
          : { backgroundColor: color },
        disabled && s.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={outline ? color : '#FFF'} />
      ) : (
        <Ionicons name={icon} size={19} color={outline ? color : '#FFF'} />
      )}

      <AppText
        weight="bold"
        style={{ color: outline ? color : '#FFF' }}
      >
        {text}
      </AppText>
    </Pressable>
  );
}

function StateCard({
  icon,
  title,
  message,
  bg,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  bg: string;
  color: string;
}) {
  return (
    <View style={[s.stateCard, { backgroundColor: bg }]}>
      <View style={s.stateIcon}>
        <Ionicons name={icon} size={22} color={color} />
      </View>

      <View style={s.flex}>
        <AppText weight="bold" style={{ color }}>
          {title}
        </AppText>
        <AppText variant="caption" tone="secondary">
          {message}
        </AppText>
      </View>
    </View>
  );
}

function State({
  loading,
  error,
  onBack,
}: {
  loading?: boolean;
  error?: string;
  onBack?: () => void;
}) {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={s.safe}>
      <View style={s.state}>
        {loading ? (
          <ActivityIndicator size="small" color={WorkerColors.primary} />
        ) : (
          <View style={s.errorIcon}>
            <Ionicons name="alert-circle-outline" size={27} color={Colors.error} />
          </View>
        )}

        <AppText weight="bold" style={s.stateTitle}>
          {loading ? 'Loading Request' : 'Request Unavailable'}
        </AppText>

        <AppText variant="caption" tone="secondary" center style={s.stateText}>
          {loading
            ? 'Loading customer request details...'
            : error}
        </AppText>

        {!loading && onBack && (
          <Pressable onPress={onBack} style={s.backButton}>
            <AppText weight="bold" style={{ color: Colors.textInverse }}>
              Go Back
            </AppText>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 14,
    gap: 12,
    paddingBottom: 30,
  },
  flex: {
    flex: 1,
    minWidth: 0,
  },
  header: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  iconButton: {
    width: FixxamTokens.size.minimumTouchTarget,
    height: FixxamTokens.size.minimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: WorkerColors.primarySoft,
  },
  status: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    borderRadius: 15,
  },
  heroTitle: {
    marginTop: 13,
    marginBottom: 8,
    fontSize: 20,
    lineHeight: 25,
    color: Colors.textPrimary,
  },
  price: {
    color: WorkerColors.primary,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: WorkerColors.primarySoft,
  },
  smallIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: Colors.surface,
  },
  card: {
    padding: 13,
    borderRadius: 15,
    backgroundColor: Colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  sectionTitle: {
    marginBottom: 10,
    color: Colors.textPrimary,
  },
  customer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: WorkerColors.primarySoft,
  },
  infoRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  infoIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: WorkerColors.primarySoft,
  },
  infoValue: {
    flex: 1,
    textAlign: 'right',
    color: Colors.textPrimary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 41,
    backgroundColor: Colors.border,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 9,
  },
  note: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textPrimary,
  },
  photos: {
    gap: 8,
  },
  photoButton: {
    width: 84,
    height: 84,
    overflow: 'hidden',
    borderRadius: 12,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  expand: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    width: 21,
    height: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,.55)',
  },
  requestInfo: {
    paddingHorizontal: 3,
  },
  requestLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  button: {
    minHeight: FixxamTokens.size.minimumTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 14,
    borderRadius: 13,
  },
  disabled: {
    opacity: 0.55,
  },
  actions: {
    gap: 9,
  },
  stateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 13,
    borderRadius: 15,
  },
  stateIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,.72)',
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFFBEB',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#FDE68A',
  },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    backgroundColor: Colors.errorSoft,
  },
  stateTitle: {
    marginTop: 9,
    textAlign: 'center',
    fontSize: 17,
  },
  stateText: {
    maxWidth: 300,
    marginTop: 5,
    lineHeight: 18,
    textAlign: 'center',
  },
  backButton: {
    minHeight: FixxamTokens.size.minimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    paddingHorizontal: 22,
    borderRadius: 12,
    backgroundColor: WorkerColors.primary,
  },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,.96)',
  },
  modalSafe: {
    flex: 1,
  },
  modalHeader: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 13,
  },
  close: {
    width: FixxamTokens.size.minimumTouchTarget,
    height: FixxamTokens.size.minimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: FixxamTokens.radius.chip,
    backgroundColor: 'rgba(255,255,255,.12)',
  },
  modalContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullPhoto: {
    width: '100%',
    height: '100%',
  },
});