import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../../hooks/useAuth';
import {
  subscribeToWorkerShopRequests,
  updateShopRequestStatus,
} from '../../../services/shopRequestService';
import {
  FirebaseShopRequest,
  FirebaseShopRequestStatus,
} from '../../../types/firebaseShopRequest';

const COLORS = {
  bg: '#F5F9FF',
  white: '#FFFFFF',

  blue: '#2563EB',
  blueSoft: '#EFF6FF',
  blueBorder: '#DBEAFE',

  text: '#172033',
  secondary: '#64748B',
  muted: '#94A3B8',

  border: '#E2E8F0',

  green: '#16A34A',
  greenSoft: '#DCFCE7',

  red: '#DC2626',
  redSoft: '#FEE2E2',

  orange: '#D97706',
  orangeSoft: '#FEF3C7',

  graySoft: '#F1F5F9',
};

const formatNaira = (amount?: number | null) => {
  if (typeof amount !== 'number') {
    return 'Price not set';
  }

  return `₦${amount.toLocaleString('en-NG')}`;
};

type ActionType = 'accept' | 'decline' | 'complete' | null;

const getStatusConfig = (status?: FirebaseShopRequestStatus) => {
  switch (status) {
    case 'accepted':
      return {
        label: 'Accepted',
        icon: 'checkmark-circle' as const,
        color: COLORS.blue,
        backgroundColor: COLORS.blueSoft,
      };

    case 'completed':
      return {
        label: 'Completed',
        icon: 'checkmark-done-circle' as const,
        color: COLORS.green,
        backgroundColor: COLORS.greenSoft,
      };

    case 'declined':
      return {
        label: 'Declined',
        icon: 'close-circle' as const,
        color: COLORS.red,
        backgroundColor: COLORS.redSoft,
      };

    case 'cancelled':
      return {
        label: 'Cancelled',
        icon: 'ban' as const,
        color: COLORS.secondary,
        backgroundColor: COLORS.graySoft,
      };

    case 'pending':
    default:
      return {
        label: 'Pending',
        icon: 'time-outline' as const,
        color: COLORS.orange,
        backgroundColor: COLORS.orangeSoft,
      };
  }
};

export default function ShopRequestDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();

  const [request, setRequest] = useState<FirebaseShopRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState<ActionType>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid || !id) {
      setLoading(false);
      setError('Request could not be found.');
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToWorkerShopRequests(
      user.uid,
      (requests) => {
        const foundRequest = requests.find(
          (item) => item.id === id,
        );

        if (!foundRequest) {
          setRequest(null);
          setError('This request could not be found.');
        } else {
          setRequest(foundRequest);
          setError(null);
        }

        setLoading(false);
      },
      (subscriptionError) => {
        console.error(
          'Failed to subscribe to shop request:',
          subscriptionError,
        );

        setError(
          'Unable to load this request. Please try again.',
        );
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [id, user?.uid]);

  const statusConfig = useMemo(
    () => getStatusConfig(request?.status),
    [request?.status],
  );

  const handleAccept = async () => {
    if (
      !request ||
      request.status !== 'pending' ||
      !user?.uid ||
      actionLoading
    ) {
      return;
    }

    try {
      setActionLoading('accept');

      await updateShopRequestStatus({
        requestId: request.id,
        status: 'accepted',
      });
    } catch (actionError) {
      console.error('Failed to accept shop request:', actionError);

      Alert.alert(
        'Unable to accept request',
        actionError instanceof Error
          ? actionError.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setActionLoading(null);
    }
  };

  const declineRequest = async () => {
    if (
      !request ||
      request.status !== 'pending' ||
      !user?.uid ||
      actionLoading
    ) {
      return;
    }

    try {
      setActionLoading('decline');

      await updateShopRequestStatus({
        requestId: request.id,
        status: 'declined',
      });
    } catch (actionError) {
      console.error('Failed to decline shop request:', actionError);

      Alert.alert(
        'Unable to decline request',
        actionError instanceof Error
          ? actionError.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = () => {
    if (!request || request.status !== 'pending') {
      return;
    }

    Alert.alert(
      'Decline Request',
      'Are you sure you want to decline this service request?',
      [
        {
          text: 'Keep Request',
          style: 'cancel',
        },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: declineRequest,
        },
      ],
    );
  };

  const completeRequest = async () => {
    if (
      !request ||
      request.status !== 'accepted' ||
      !user?.uid ||
      actionLoading
    ) {
      return;
    }

    try {
      setActionLoading('complete');

      await updateShopRequestStatus({
        requestId: request.id,
        status: 'completed',
      });
    } catch (actionError) {
      console.error(
        'Failed to complete shop request:',
        actionError,
      );

      Alert.alert(
        'Unable to complete request',
        actionError instanceof Error
          ? actionError.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = () => {
    if (!request || request.status !== 'accepted') {
      return;
    }

    Alert.alert(
      'Warning',
      'Only mark this request as completed after the customer has visited your shop.\n\nOnce you mark it as completed, the customer will no longer see your shop location.',
      [
        {
          text: 'Not Yet',
          style: 'cancel',
        },
        {
          text: 'Mark as Completed',
          onPress: completeRequest,
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <ActivityIndicator
            size="large"
            color={COLORS.blue}
          />

          <Text style={styles.loadingText}>
            Loading request...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !request) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={34}
              color={COLORS.red}
            />
          </View>

          <Text style={styles.errorTitle}>
            Request unavailable
          </Text>

          <Text style={styles.errorText}>
            {error ?? 'This request could not be found.'}
          </Text>

          <Pressable
            style={styles.backButtonLarge}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonLargeText}>
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isPending = request.status === 'pending';
  const isAccepted = request.status === 'accepted';
  const isCompleted = request.status === 'completed';
  const isDeclined = request.status === 'declined';
  const isCancelled = request.status === 'cancelled';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.headerBackButton}
            onPress={() => router.back()}
            hitSlop={10}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={COLORS.text}
            />
          </Pressable>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              Request Details
            </Text>

            <Text style={styles.headerSubtitle}>
              {isPending
                ? 'New service request'
                : 'Customer visit'}
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Hero */}
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.heroIcon}>
                <Ionicons
                  name="briefcase-outline"
                  size={24}
                  color={COLORS.blue}
                />
              </View>

              <View
                style={[
                  styles.statusChip,
                  {
                    backgroundColor:
                      statusConfig.backgroundColor,
                  },
                ]}
              >
                <Ionicons
                  name={statusConfig.icon}
                  size={15}
                  color={statusConfig.color}
                />

                <Text
                  style={[
                    styles.statusChipText,
                    { color: statusConfig.color },
                  ]}
                >
                  {statusConfig.label}
                </Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>
              {request.serviceName}
            </Text>

            <Text style={styles.heroPrice}>
              {formatNaira(request.servicePrice)}
            </Text>
          </View>

          {/* Shop notice */}
          <View style={styles.shopNotice}>
            <View style={styles.shopNoticeIcon}>
              <Ionicons
                name="storefront-outline"
                size={21}
                color={COLORS.blue}
              />
            </View>

            <View style={styles.shopNoticeContent}>
              <Text style={styles.shopNoticeTitle}>
                Customer comes to your shop
              </Text>

              <Text style={styles.shopNoticeText}>
                Be ready at the selected date and time.
              </Text>
            </View>
          </View>

          {/* Customer */}
          <Section title="Customer">
            <View style={styles.customerRow}>
              {request.customerPhotoUrl ? (
                <Image
                  source={{
                    uri: request.customerPhotoUrl,
                  }}
                  style={styles.customerAvatar}
                />
              ) : (
                <View style={styles.customerAvatarPlaceholder}>
                  <Ionicons
                    name="person"
                    size={24}
                    color={COLORS.muted}
                  />
                </View>
              )}

              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>
                  {request.customerName || 'Customer'}
                </Text>

                <Text style={styles.customerSubtitle}>
                  Service customer
                </Text>
              </View>
            </View>
          </Section>

          {/* Visit */}
          <Section title="Visit Details">
            <InfoRow
              icon="calendar-outline"
              label="Date"
              value={request.requestedDateLabel}
            />

            <InfoRow
              icon="time-outline"
              label="Time"
              value={request.requestedTime}
            />

            <InfoRow
              icon="location-outline"
              label="Location"
              value="Your shop"
              last
            />
          </Section>

          {/* Service */}
          <Section title="Service">
            <InfoRow
              icon="construct-outline"
              label="Service"
              value={request.serviceName}
            />

            <InfoRow
              icon="cash-outline"
              label="Price"
              value={formatNaira(request.servicePrice)}
              last
            />
          </Section>

          {/* Customer note */}
          {!!request.description?.trim() && (
            <Section title="Customer Note">
              <View style={styles.noteCard}>
                <Ionicons
                  name="chatbox-ellipses-outline"
                  size={20}
                  color={COLORS.blue}
                />

                <Text style={styles.noteText}>
                  {request.description.trim()}
                </Text>
              </View>
            </Section>
          )}

          {/* Customer photos */}
          {request.photoUrls?.length > 0 && (
            <Section title="Customer Photos">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={
                  styles.photoListContent
                }
              >
                {request.photoUrls.map((photoUrl, index) => (
                  <Pressable
                    key={`${photoUrl}-${index}`}
                    style={styles.photoItem}
                    onPress={() =>
                      setSelectedPhoto(photoUrl)
                    }
                  >
                    <Image
                      source={{ uri: photoUrl }}
                      style={styles.requestPhoto}
                    />

                    <View style={styles.photoOverlay}>
                      <Ionicons
                        name="expand-outline"
                        size={18}
                        color={COLORS.white}
                      />
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </Section>
          )}

          {/* Accepted */}
          {isAccepted && (
            <>
              <StateCard
                icon="checkmark-circle"
                title="Request Accepted"
                message={`The customer will come to your shop for ${request.serviceName} on ${request.requestedDateLabel} at ${request.requestedTime}.`}
                color={COLORS.blue}
                backgroundColor={COLORS.blueSoft}
              />

              {/* IMPORTANT WARNING */}
              <View style={styles.completionWarning}>
                <View style={styles.warningIcon}>
                  <Ionicons
                    name="warning-outline"
                    size={22}
                    color={COLORS.orange}
                  />
                </View>

                <View style={styles.warningContent}>
                  <Text style={styles.warningTitle}>
                    Warning
                  </Text>

                  <Text style={styles.warningText}>
                    Mark this request as completed only
                    after the customer has visited your shop.
                  </Text>

                  <Text style={styles.warningSubtext}>
                    Once completed, the customer will no
                    longer see your shop location.
                  </Text>
                </View>
              </View>

              {/* Complete button */}
              <Pressable
                style={[
                  styles.completeButton,
                  actionLoading !== null &&
                    styles.buttonDisabled,
                ]}
                onPress={handleComplete}
                disabled={actionLoading !== null}
              >
                {actionLoading === 'complete' ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-done-circle-outline"
                      size={21}
                      color={COLORS.white}
                    />

                    <Text style={styles.completeButtonText}>
                      Mark as Completed
                    </Text>
                  </>
                )}
              </Pressable>
            </>
          )}

          {/* Completed */}
          {isCompleted && (
            <StateCard
              icon="checkmark-done-circle"
              title="Service Completed"
              message="This request has been marked as completed."
              color={COLORS.green}
              backgroundColor={COLORS.greenSoft}
            />
          )}

          {/* Declined */}
          {isDeclined && (
            <StateCard
              icon="close-circle"
              title="Request Declined"
              message="You declined this service request."
              color={COLORS.red}
              backgroundColor={COLORS.redSoft}
            />
          )}

          {/* Cancelled */}
          {isCancelled && (
            <StateCard
              icon="ban"
              title="Request Cancelled"
              message="This service request has been cancelled."
              color={COLORS.secondary}
              backgroundColor={COLORS.graySoft}
            />
          )}

          {/* Pending actions */}
          {isPending && (
            <View style={styles.actionsContainer}>
              <Pressable
                style={[
                  styles.acceptButton,
                  actionLoading !== null &&
                    styles.buttonDisabled,
                ]}
                onPress={handleAccept}
                disabled={actionLoading !== null}
              >
                {actionLoading === 'accept' ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={21}
                      color={COLORS.white}
                    />

                    <Text style={styles.acceptButtonText}>
                      Accept Request
                    </Text>
                  </>
                )}
              </Pressable>

              <Pressable
                style={[
                  styles.declineButton,
                  actionLoading !== null &&
                    styles.buttonDisabled,
                ]}
                onPress={handleDecline}
                disabled={actionLoading !== null}
              >
                {actionLoading === 'decline' ? (
                  <ActivityIndicator color={COLORS.red} />
                ) : (
                  <>
                    <Ionicons
                      name="close-circle-outline"
                      size={21}
                      color={COLORS.red}
                    />

                    <Text style={styles.declineButtonText}>
                      Decline Request
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          )}

          <View style={styles.bottomSpace} />
        </ScrollView>

        {/* Photo Viewer */}
        <Modal
          visible={!!selectedPhoto}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedPhoto(null)}
        >
          <View style={styles.photoModal}>
            <Pressable
              style={styles.photoModalClose}
              onPress={() => setSelectedPhoto(null)}
              hitSlop={10}
            >
              <Ionicons
                name="close"
                size={28}
                color={COLORS.white}
              />
            </Pressable>

            {selectedPhoto && (
              <Image
                source={{ uri: selectedPhoto }}
                style={styles.fullPhoto}
                resizeMode="contain"
              />
            )}
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({
  title,
  children,
}: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      <View style={styles.sectionCard}>
        {children}
      </View>
    </View>
  );
}

type InfoRowProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  last?: boolean;
};

function InfoRow({
  icon,
  label,
  value,
  last = false,
}: InfoRowProps) {
  return (
    <View
      style={[
        styles.infoRow,
        !last && styles.infoRowBorder,
      ]}
    >
      <View style={styles.infoIcon}>
        <Ionicons
          name={icon}
          size={19}
          color={COLORS.blue}
        />
      </View>

      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>
          {label}
        </Text>

        <Text style={styles.infoValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

type StateCardProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  message: string;
  color: string;
  backgroundColor: string;
};

function StateCard({
  icon,
  title,
  message,
  color,
  backgroundColor,
}: StateCardProps) {
  return (
    <View
      style={[
        styles.stateCard,
        {
          backgroundColor,
        },
      ]}
    >
      <View
        style={[
          styles.stateIcon,
          {
            backgroundColor: COLORS.white,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={24}
          color={color}
        />
      </View>

      <View style={styles.stateContent}>
        <Text
          style={[
            styles.stateTitle,
            { color },
          ]}
        >
          {title}
        </Text>

        <Text style={styles.stateMessage}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  container: {
    flex: 1,
  },

  /* Header */
  header: {
    minHeight: 58,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  headerBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.graySoft,
  },

  headerTextContainer: {
    flex: 1,
    marginLeft: 9,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },

  headerSubtitle: {
    marginTop: 1,
    fontSize: 11,
    color: COLORS.secondary,
  },

  content: {
    padding: 12,
  },

  /* Hero */
  heroCard: {
    padding: 13,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  heroIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.blueSoft,
  },

  statusChip: {
    minHeight: 27,
    paddingHorizontal: 9,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  statusChipText: {
    fontSize: 11,
    fontWeight: '800',
  },

  heroTitle: {
    marginTop: 11,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '800',
    color: COLORS.text,
  },

  heroPrice: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.blue,
  },

  /* Shop notice */
  shopNotice: {
    marginTop: 8,
    padding: 10,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.blueSoft,
    borderWidth: 1,
    borderColor: COLORS.blueBorder,
  },

  shopNoticeIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },

  shopNoticeContent: {
    flex: 1,
    marginLeft: 9,
  },

  shopNoticeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
  },

  shopNoticeText: {
    marginTop: 1,
    fontSize: 11,
    lineHeight: 15,
    color: COLORS.secondary,
  },

  /* Sections */
  section: {
    marginTop: 13,
  },

  sectionTitle: {
    marginBottom: 6,
    paddingHorizontal: 1,
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
  },

  sectionCard: {
    overflow: 'hidden',
    borderRadius: 13,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  /* Customer */
  customerRow: {
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  customerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.graySoft,
  },

  customerAvatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.graySoft,
  },

  customerInfo: {
    flex: 1,
    marginLeft: 9,
  },

  customerName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },

  customerSubtitle: {
    marginTop: 1,
    fontSize: 11,
    color: COLORS.secondary,
  },

  /* Info rows */
  infoRow: {
    minHeight: 52,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  infoIcon: {
    width: 31,
    height: 31,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.blueSoft,
  },

  infoContent: {
    flex: 1,
    marginLeft: 9,
  },

  infoLabel: {
    fontSize: 10,
    color: COLORS.secondary,
  },

  infoValue: {
    marginTop: 1,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },

  /* Note */
  noteCard: {
    padding: 11,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  noteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.text,
  },

  /* Photos */
  photoListContent: {
    padding: 9,
    gap: 8,
  },

  photoItem: {
    width: 82,
    height: 82,
    overflow: 'hidden',
    borderRadius: 11,
    backgroundColor: COLORS.graySoft,
  },

  requestPhoto: {
    width: '100%',
    height: '100%',
  },

  photoOverlay: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  /* Status card */
  stateCard: {
    marginTop: 13,
    padding: 11,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  stateIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stateContent: {
    flex: 1,
    marginLeft: 9,
  },

  stateTitle: {
    fontSize: 13,
    fontWeight: '800',
  },

  stateMessage: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.secondary,
  },

  /* Completion warning */
  completionWarning: {
    marginTop: 9,
    padding: 10,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.orangeSoft,
    borderWidth: 1,
    borderColor: COLORS.orange,
  },

  warningIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },

  warningContent: {
    flex: 1,
    marginLeft: 8,
  },

  warningTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.orange,
  },

  warningText: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    color: COLORS.text,
  },

  warningSubtext: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 14,
    color: COLORS.secondary,
  },

  /* Buttons */
  completeButton: {
    minHeight: 45,
    marginTop: 9,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: COLORS.blue,
  },

  completeButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.white,
  },

  actionsContainer: {
    marginTop: 13,
    gap: 8,
  },

  acceptButton: {
    minHeight: 45,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: COLORS.blue,
  },

  acceptButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.white,
  },

  declineButton: {
    minHeight: 43,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.red,
  },

  declineButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.red,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  /* Loading / error */
  centerState: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 9,
    fontSize: 13,
    color: COLORS.secondary,
  },

  errorIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.redSoft,
  },

  errorTitle: {
    marginTop: 13,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },

  errorText: {
    maxWidth: 290,
    marginTop: 5,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    color: COLORS.secondary,
  },

  backButtonLarge: {
    minHeight: 44,
    marginTop: 16,
    paddingHorizontal: 22,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.blue,
  },

  backButtonLargeText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.white,
  },

  /* Photo modal */
  photoModal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.94)',
  },

  photoModalClose: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  fullPhoto: {
    width: '100%',
    height: '80%',
  },

  bottomSpace: {
    height: 20,
  },
});