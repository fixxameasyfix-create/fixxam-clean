import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, {
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useShopRegistration } from '../../../../contexts/ShopRegistrationContext';
import { createOrUpdateWorkerShop } from '../../../../services/shopService';

function formatNaira(value: number) {
  return `₦${value.toLocaleString('en-NG')}`;
}

function formatTime(time: string) {
  const [hourString, minutes] =
    time.split(':');

  const hour = Number(
    hourString,
  );

  const period =
    hour >= 12
      ? 'PM'
      : 'AM';

  const hour12 =
    hour % 12 || 12;

  return `${hour12}:${minutes} ${period}`;
}

function getErrorMessage(
  error: unknown,
) {
  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message;
  }

  return 'Something went wrong while creating your shop. Please try again.';
}

export default function ReviewShopScreen() {
  const {
    draft,
  } = useShopRegistration();

  const [
    isCreating,
    setIsCreating,
  ] = useState(false);

  const isDraftComplete =
    useMemo(() => {
      const hasOpenDay =
        draft.businessHours.some(
          (item) =>
            item.isOpen,
        );

      const servicesValid =
        draft.services.length > 0 &&
        draft.services.every(
          (service) =>
            service.name.trim() &&
            service.description.trim() &&
            service.startingPrice >
              0 &&
            service.imageUri,
        );

      return Boolean(
        draft.name.trim() &&
          draft.category.trim() &&
          draft.description.trim() &&
          draft.phone.trim() &&
          draft.address.trim() &&
          draft.latitude !== null &&
          draft.longitude !== null &&
          draft.coverPhoto &&
          draft.logo &&
          servicesValid &&
          draft.businessHours.length >
            0 &&
          hasOpenDay,
      );
    }, [
      draft,
    ]);

  const handleCreateShop =
    async () => {
      if (
        !isDraftComplete ||
        isCreating
      ) {
        return;
      }

      try {
        setIsCreating(true);

        const shopId =
          await createOrUpdateWorkerShop(
            draft,
          );

        if (__DEV__) {
          console.info(
            'FIXXAM_SHOP_CREATED:',
            {
              shopId,
            },
          );
        }

        router.replace(
          '/my-shop/create/success',
        );
      } catch (error) {
        console.error(
          'FIXXAM_CREATE_SHOP_SUBMIT_ERROR:',
          error,
        );

        Alert.alert(
          'Unable to Create Shop',
          getErrorMessage(
            error,
          ),
        );
      } finally {
        setIsCreating(false);
      }
    };

  return (
    <SafeAreaView
      edges={[
        'top',
        'bottom',
      ]}
      style={
        styles.safeArea
      }
    >
      {/* Header */}
      <View
        style={styles.header}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityState={{
            disabled:
              isCreating,
          }}
          disabled={isCreating}
          hitSlop={10}
          onPress={() =>
            router.back()
          }
          style={({
            pressed,
          }) => [
            styles.backButton,

            isCreating &&
              styles.controlDisabled,

            pressed &&
              !isCreating &&
              styles.pressed,
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={25}
            color="#1677FF"
          />
        </Pressable>

        <Text
          style={
            styles.headerTitle
          }
        >
          Create My Shop
        </Text>

        <View
          style={
            styles.headerSpacer
          }
        />
      </View>

      <ProgressIndicator />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <Text
          style={styles.title}
        >
          Review Your Shop
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          Check your information
          before creating your shop.
        </Text>

        {/* Shop preview */}
        <View
          style={
            styles.previewCard
          }
        >
          {draft.coverPhoto ? (
            <Image
              source={{
                uri:
                  draft.coverPhoto,
              }}
              resizeMode="cover"
              style={
                styles.coverPhoto
              }
            />
          ) : (
            <View
              style={
                styles.coverPlaceholder
              }
            >
              <Ionicons
                name="image-outline"
                size={36}
                color="#94A3B8"
              />
            </View>
          )}

          <View
            style={
              styles.previewBody
            }
          >
            <View
              style={
                styles.logoWrapper
              }
            >
              {draft.logo ? (
                <Image
                  source={{
                    uri:
                      draft.logo,
                  }}
                  resizeMode="cover"
                  style={
                    styles.logo
                  }
                />
              ) : (
                <View
                  style={
                    styles.logoPlaceholder
                  }
                >
                  <Ionicons
                    name="storefront-outline"
                    size={30}
                    color="#94A3B8"
                  />
                </View>
              )}
            </View>

            <View
              style={
                styles.previewInfo
              }
            >
              <Text
                style={
                  styles.shopName
                }
                numberOfLines={1}
              >
                {draft.name ||
                  'Shop Name'}
              </Text>

              <Text
                style={
                  styles.category
                }
              >
                {draft.category ||
                  'Category'}
              </Text>

              <View
                style={
                  styles.verifiedRow
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
                  Provider Shop
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Details */}
        <ReviewSection
          title="Shop Details"
          icon="storefront-outline"
          disabled={isCreating}
          onEdit={() =>
            router.push(
              '/my-shop/create/details',
            )
          }
        >
          <ReviewRow
            label="Shop Name"
            value={draft.name}
          />

          <ReviewRow
            label="Category"
            value={
              draft.category
            }
          />

          <ReviewRow
            label="Phone"
            value={draft.phone}
          />

          <View
            style={
              styles.descriptionBlock
            }
          >
            <Text
              style={
                styles.rowLabel
              }
            >
              Description
            </Text>

            <Text
              style={
                styles.descriptionText
              }
            >
              {
                draft.description
              }
            </Text>
          </View>
        </ReviewSection>

        {/* Location */}
        <ReviewSection
          title="Location"
          icon="location-outline"
          disabled={isCreating}
          onEdit={() =>
            router.push(
              '/my-shop/create/location',
            )
          }
        >
          <View
            style={
              styles.locationContent
            }
          >
            <View
              style={
                styles.locationIcon
              }
            >
              <Ionicons
                name="location"
                size={23}
                color="#1677FF"
              />
            </View>

            <View
              style={
                styles.locationTextContainer
              }
            >
              <Text
                style={
                  styles.address
                }
              >
                {draft.address}
              </Text>

              {draft.latitude !==
                null &&
                draft.longitude !==
                  null && (
                  <Text
                    style={
                      styles.coordinates
                    }
                  >
                    {draft.latitude.toFixed(
                      5,
                    )}
                    ,{' '}
                    {draft.longitude.toFixed(
                      5,
                    )}
                  </Text>
                )}
            </View>
          </View>
        </ReviewSection>

        {/* Services */}
        <ReviewSection
          title={`Services (${draft.services.length})`}
          icon="construct-outline"
          disabled={isCreating}
          onEdit={() =>
            router.push(
              '/my-shop/create/services',
            )
          }
        >
          <View
            style={
              styles.servicesList
            }
          >
            {draft.services.map(
              (service) => (
                <View
                  key={
                    service.id
                  }
                  style={
                    styles.serviceCard
                  }
                >
                  <Image
                    source={{
                      uri:
                        service.imageUri,
                    }}
                    resizeMode="cover"
                    style={
                      styles.serviceImage
                    }
                  />

                  <View
                    style={
                      styles.serviceContent
                    }
                  >
                    <View
                      style={
                        styles.serviceTitleRow
                      }
                    >
                      <Text
                        style={
                          styles.serviceName
                        }
                        numberOfLines={
                          1
                        }
                      >
                        {
                          service.name
                        }
                      </Text>

                      <View
                        style={[
                          styles.serviceStatus,

                          service.isActive
                            ? styles.activeStatus
                            : styles.inactiveStatus,
                        ]}
                      >
                        <Text
                          style={[
                            styles.serviceStatusText,

                            service.isActive
                              ? styles.activeStatusText
                              : styles.inactiveStatusText,
                          ]}
                        >
                          {service.isActive
                            ? 'Active'
                            : 'Inactive'}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={
                        styles.serviceDescription
                      }
                      numberOfLines={
                        2
                      }
                    >
                      {
                        service.description
                      }
                    </Text>

                    <Text
                      style={
                        styles.servicePrice
                      }
                    >
                      From{' '}
                      {formatNaira(
                        service.startingPrice,
                      )}
                    </Text>
                  </View>
                </View>
              ),
            )}
          </View>
        </ReviewSection>

        {/* Business Hours */}
        <ReviewSection
          title="Business Hours"
          icon="time-outline"
          disabled={isCreating}
          onEdit={() =>
            router.push(
              '/my-shop/create/hours',
            )
          }
        >
          {draft.businessHours.map(
            (item) => (
              <View
                key={item.id}
                style={
                  styles.hoursRow
                }
              >
                <View>
                  <Text
                    style={
                      styles.dayText
                    }
                  >
                    {item.day}
                  </Text>

                  <Text
                    style={[
                      styles.dayStatus,

                      item.isOpen
                        ? styles.dayOpen
                        : styles.dayClosed,
                    ]}
                  >
                    {item.isOpen
                      ? 'Open'
                      : 'Closed'}
                  </Text>
                </View>

                <Text
                  style={
                    styles.hoursText
                  }
                >
                  {item.isOpen
                    ? `${formatTime(
                        item.openTime,
                      )} – ${formatTime(
                        item.closeTime,
                      )}`
                    : 'Closed'}
                </Text>
              </View>
            ),
          )}
        </ReviewSection>

        {!isDraftComplete && (
          <View
            style={
              styles.warningBox
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color="#D97706"
            />

            <Text
              style={
                styles.warningText
              }
            >
              Some required shop
              information is missing.
              Go back and complete all
              steps before creating
              your shop.
            </Text>
          </View>
        )}

        {isCreating && (
          <View
            style={
              styles.uploadingBox
            }
          >
            <ActivityIndicator
              size="small"
              color="#1677FF"
            />

            <View
              style={
                styles.uploadingContent
              }
            >
              <Text
                style={
                  styles.uploadingTitle
                }
              >
                Creating your shop
              </Text>

              <Text
                style={
                  styles.uploadingText
                }
              >
                Uploading photos,
                services and shop
                information. Please do
                not close the app.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View
        style={styles.footer}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create shop"
          accessibilityState={{
            disabled:
              !isDraftComplete ||
              isCreating,
          }}
          disabled={
            !isDraftComplete ||
            isCreating
          }
          onPress={
            handleCreateShop
          }
          style={({
            pressed,
          }) => [
            styles.createButton,

            (
              !isDraftComplete ||
              isCreating
            ) &&
              styles.createButtonDisabled,

            pressed &&
              isDraftComplete &&
              !isCreating &&
              styles.pressed,
          ]}
        >
          {isCreating ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Ionicons
              name="storefront-outline"
              size={23}
              color="#FFFFFF"
            />
          )}

          <Text
            style={
              styles.createButtonText
            }
          >
            {isCreating
              ? 'Creating Shop...'
              : 'Create Shop'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function ReviewSection({
  title,
  icon,
  onEdit,
  disabled = false,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onEdit: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View
      style={styles.sectionCard}
    >
      <View
        style={
          styles.sectionHeader
        }
      >
        <View
          style={
            styles.sectionTitleRow
          }
        >
          <View
            style={
              styles.sectionIcon
            }
          >
            <Ionicons
              name={icon}
              size={21}
              color="#1677FF"
            />
          </View>

          <Text
            style={
              styles.sectionTitle
            }
          >
            {title}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Edit ${title}`}
          accessibilityState={{
            disabled,
          }}
          disabled={disabled}
          onPress={onEdit}
          style={({
            pressed,
          }) => [
            styles.editButton,

            disabled &&
              styles.controlDisabled,

            pressed &&
              !disabled &&
              styles.pressed,
          ]}
        >
          <Ionicons
            name="create-outline"
            size={17}
            color="#1677FF"
          />

          <Text
            style={
              styles.editText
            }
          >
            Edit
          </Text>
        </Pressable>
      </View>

      <View
        style={
          styles.sectionBody
        }
      >
        {children}
      </View>
    </View>
  );
}

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View
      style={
        styles.reviewRow
      }
    >
      <Text
        style={styles.rowLabel}
      >
        {label}
      </Text>

      <Text
        style={styles.rowValue}
        numberOfLines={2}
      >
        {value ||
          'Not provided'}
      </Text>
    </View>
  );
}

function ProgressIndicator() {
  return (
    <View
      style={
        styles.progressContainer
      }
    >
      {[1, 2, 3, 4, 5, 6].map(
        (
          step,
          index,
        ) => {
          const completed =
            step < 6;

          const active =
            step === 6;

          return (
            <React.Fragment
              key={step}
            >
              <View
                style={[
                  styles.progressDot,

                  completed &&
                    styles.progressDotCompleted,

                  active &&
                    styles.progressDotActive,
                ]}
              >
                {completed && (
                  <Ionicons
                    name="checkmark"
                    size={10}
                    color="#FFFFFF"
                  />
                )}
              </View>

              {index < 5 && (
                <View
                  style={[
                    styles.progressLine,

                    completed &&
                      styles.progressLineCompleted,
                  ]}
                />
              )}
            </React.Fragment>
          );
        },
      )}
    </View>
  );
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        '#F8FAFC',
    },

    header: {
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
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

    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '800',
      color: '#0F172A',
    },

    headerSpacer: {
      width: 44,
    },

    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 34,
      paddingVertical: 12,
    },

    progressDot: {
      width: 11,
      height: 11,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 7,
      backgroundColor:
        '#DCE5EF',
    },

    progressDotCompleted: {
      width: 14,
      height: 14,
      backgroundColor:
        '#1677FF',
    },

    progressDotActive: {
      width: 14,
      height: 14,
      backgroundColor:
        '#1677FF',
    },

    progressLine: {
      flex: 1,
      height: 2,
      backgroundColor:
        '#DCE5EF',
    },

    progressLineCompleted: {
      backgroundColor:
        '#1677FF',
    },

    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 32,
    },

    title: {
      fontSize: 25,
      fontWeight: '800',
      color: '#0F172A',
    },

    subtitle: {
      marginTop: 5,
      fontSize: 15,
      lineHeight: 22,
      color: '#64748B',
    },

    previewCard: {
      overflow: 'hidden',
      marginTop: 22,
      borderWidth: 1,
      borderColor:
        '#E2E8F0',
      borderRadius: 22,
      backgroundColor:
        '#FFFFFF',
    },

    coverPhoto: {
      width: '100%',
      height: 190,
      backgroundColor:
        '#E2E8F0',
    },

    coverPlaceholder: {
      height: 190,
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        '#E2E8F0',
    },

    previewBody: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingHorizontal: 16,
      paddingBottom: 16,
    },

    logoWrapper: {
      width: 92,
      height: 92,
      marginTop: -28,
      padding: 4,
      borderRadius: 24,
      backgroundColor:
        '#FFFFFF',
    },

    logo: {
      width: '100%',
      height: '100%',
      borderRadius: 20,
      backgroundColor:
        '#E2E8F0',
    },

    logoPlaceholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 20,
      backgroundColor:
        '#F1F5F9',
    },

    previewInfo: {
      flex: 1,
      minWidth: 0,
      paddingTop: 10,
    },

    shopName: {
      fontSize: 20,
      fontWeight: '800',
      color: '#0F172A',
    },

    category: {
      marginTop: 2,
      fontSize: 14,
      color: '#64748B',
    },

    verifiedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 6,
    },

    verifiedText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#1677FF',
    },

    sectionCard: {
      marginTop: 16,
      padding: 15,
      borderWidth: 1,
      borderColor:
        '#E2E8F0',
      borderRadius: 20,
      backgroundColor:
        '#FFFFFF',
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      gap: 10,
    },

    sectionTitleRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
    },

    sectionIcon: {
      width: 39,
      height: 39,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 13,
      backgroundColor:
        '#EFF6FF',
    },

    sectionTitle: {
      flex: 1,
      fontSize: 17,
      fontWeight: '800',
      color: '#0F172A',
    },

    editButton: {
      minHeight: 38,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 11,
      borderRadius: 12,
      backgroundColor:
        '#EFF6FF',
    },

    editText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#1677FF',
    },

    sectionBody: {
      marginTop: 14,
    },

    reviewRow: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      gap: 20,
      paddingVertical: 8,
    },

    rowLabel: {
      fontSize: 13,
      color: '#64748B',
    },

    rowValue: {
      flex: 1,
      textAlign: 'right',
      fontSize: 14,
      fontWeight: '700',
      color: '#0F172A',
    },

    descriptionBlock: {
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor:
        '#F1F5F9',
    },

    descriptionText: {
      marginTop: 6,
      fontSize: 14,
      lineHeight: 21,
      color: '#475569',
    },

    locationContent: {
      flexDirection: 'row',
      alignItems:
        'flex-start',
      gap: 11,
    },

    locationIcon: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 14,
      backgroundColor:
        '#EFF6FF',
    },

    locationTextContainer: {
      flex: 1,
    },

    address: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '700',
      color: '#0F172A',
    },

    coordinates: {
      marginTop: 4,
      fontSize: 12,
      color: '#64748B',
    },

    servicesList: {
      gap: 12,
    },

    serviceCard: {
      flexDirection: 'row',
      gap: 11,
      padding: 10,
      borderRadius: 16,
      backgroundColor:
        '#F8FAFC',
    },

    serviceImage: {
      width: 82,
      height: 82,
      borderRadius: 13,
      backgroundColor:
        '#E2E8F0',
    },

    serviceContent: {
      flex: 1,
      minWidth: 0,
    },

    serviceTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },

    serviceName: {
      flex: 1,
      fontSize: 15,
      fontWeight: '800',
      color: '#0F172A',
    },

    serviceDescription: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 17,
      color: '#64748B',
    },

    servicePrice: {
      marginTop: 6,
      fontSize: 14,
      fontWeight: '800',
      color: '#1677FF',
    },

    serviceStatus: {
      paddingHorizontal: 7,
      paddingVertical: 4,
      borderRadius: 999,
    },

    activeStatus: {
      backgroundColor:
        '#DCFCE7',
    },

    inactiveStatus: {
      backgroundColor:
        '#F1F5F9',
    },

    serviceStatusText: {
      fontSize: 10,
      fontWeight: '700',
    },

    activeStatusText: {
      color: '#16A34A',
    },

    inactiveStatusText: {
      color: '#64748B',
    },

    hoursRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      gap: 14,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor:
        '#F1F5F9',
    },

    dayText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#0F172A',
    },

    dayStatus: {
      marginTop: 2,
      fontSize: 11,
      fontWeight: '700',
    },

    dayOpen: {
      color: '#16A34A',
    },

    dayClosed: {
      color: '#64748B',
    },

    hoursText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#475569',
    },

    warningBox: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 16,
      padding: 13,
      borderRadius: 15,
      backgroundColor:
        '#FFFBEB',
    },

    warningText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 19,
      color: '#92400E',
    },

    uploadingBox: {
      flexDirection: 'row',
      alignItems:
        'flex-start',
      gap: 11,
      marginTop: 16,
      padding: 14,
      borderWidth: 1,
      borderColor:
        '#BFDBFE',
      borderRadius: 16,
      backgroundColor:
        '#EFF6FF',
    },

    uploadingContent: {
      flex: 1,
    },

    uploadingTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: '#1D4ED8',
    },

    uploadingText: {
      marginTop: 3,
      fontSize: 12,
      lineHeight: 18,
      color: '#475569',
    },

    footer: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 14,
      borderTopWidth: 1,
      borderTopColor:
        '#E2E8F0',
      backgroundColor:
        '#FFFFFF',
    },

    createButton: {
      minHeight: 60,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 9,
      borderRadius: 19,
      backgroundColor:
        '#1677FF',
    },

    createButtonDisabled: {
      opacity: 0.45,
    },

    createButtonText: {
      fontSize: 17,
      fontWeight: '800',
      color: '#FFFFFF',
    },

    controlDisabled: {
      opacity: 0.5,
    },

    pressed: {
      opacity: 0.72,
    },
  });