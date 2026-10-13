import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, {
  useCallback,
  useState,
} from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ServiceEditorModal } from '../../../../components/worker/my-shop/ServiceEditorModal';
import { useShopRegistration } from '../../../../contexts/ShopRegistrationContext';

import type { WorkerShopService } from '../../../../types/workerShop';

/* ============================================================
   LIMITS
============================================================ */

const MAX_SHOP_SERVICES = 30;

/* ============================================================
   HELPERS
============================================================ */

function formatNaira(
  value: number,
): string {
  return `₦${value.toLocaleString(
    'en-NG',
  )}`;
}

/* ============================================================
   SCREEN
============================================================ */

export default function AddServicesScreen() {
  const {
    draft,
    updateDraft,
  } = useShopRegistration();

  const [
    services,
    setServices,
  ] = useState<
    WorkerShopService[]
  >(() => draft.services);

  const [
    modalVisible,
    setModalVisible,
  ] = useState(false);

  const [
    editingService,
    setEditingService,
  ] =
    useState<WorkerShopService | null>(
      null,
    );

  const [
    error,
    setError,
  ] = useState('');

  const hasServices =
    services.length > 0;

  const reachedServiceLimit =
    services.length >=
    MAX_SHOP_SERVICES;

  /* ==========================================================
     LOCAL + DRAFT SYNC
  ========================================================== */

  const commitServices =
    useCallback(
      (
        updater: (
          current: WorkerShopService[],
        ) => WorkerShopService[],
      ) => {
        setServices(
          (current) => {
            const nextServices =
              updater(current);

            updateDraft({
              services:
                nextServices,
            });

            return nextServices;
          },
        );
      },
      [
        updateDraft,
      ],
    );

  /* ==========================================================
     ADD SERVICE
  ========================================================== */

  const handleAddService =
    useCallback(() => {
      if (
        reachedServiceLimit
      ) {
        setError(
          `You can add up to ${MAX_SHOP_SERVICES} services.`,
        );

        return;
      }

      setError('');

      setEditingService(
        null,
      );

      setModalVisible(
        true,
      );
    }, [
      reachedServiceLimit,
    ]);

  /* ==========================================================
     EDIT SERVICE
  ========================================================== */

  const handleEditService =
    useCallback(
      (
        service: WorkerShopService,
      ) => {
        setError('');

        setEditingService(
          service,
        );

        setModalVisible(
          true,
        );
      },
      [],
    );

  /* ==========================================================
     CLOSE MODAL
  ========================================================== */

  const handleCloseModal =
    useCallback(() => {
      setModalVisible(
        false,
      );

      setEditingService(
        null,
      );
    }, []);

  /* ==========================================================
     SAVE SERVICE
  ========================================================== */

  const handleSaveService =
    useCallback(
      (
        service: WorkerShopService,
      ) => {
        const normalizedId =
          service.id.trim();

        if (!normalizedId) {
          setError(
            'Unable to save this service because its ID is invalid.',
          );

          return;
        }

        const normalizedService: WorkerShopService =
          {
            ...service,
            id: normalizedId,
          };

        let saveSucceeded =
          false;

        commitServices(
          (current) => {
            const existingIndex =
              current.findIndex(
                (item) =>
                  item.id ===
                  normalizedId,
              );

            /*
             * Editing an existing service.
             */
            if (
              existingIndex >= 0
            ) {
              const next =
                [...current];

              next[
                existingIndex
              ] =
                normalizedService;

              saveSucceeded =
                true;

              return next;
            }

            /*
             * Adding a new service.
             */
            if (
              current.length >=
              MAX_SHOP_SERVICES
            ) {
              return current;
            }

            const duplicateId =
              current.some(
                (item) =>
                  item.id ===
                  normalizedService.id,
              );

            if (
              duplicateId
            ) {
              return current;
            }

            saveSucceeded =
              true;

            return [
              ...current,
              normalizedService,
            ];
          },
        );

        if (
          !saveSucceeded
        ) {
          setError(
            `Unable to add this service. You can add up to ${MAX_SHOP_SERVICES} services.`,
          );

          return;
        }

        setError('');

        setModalVisible(
          false,
        );

        setEditingService(
          null,
        );
      },
      [
        commitServices,
      ],
    );

  /* ==========================================================
     DELETE SERVICE
  ========================================================== */

  const handleDeleteService =
    useCallback(
      (
        service: WorkerShopService,
      ) => {
        Alert.alert(
          'Delete Service',
          `Are you sure you want to remove "${service.name}"?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Delete',
              style:
                'destructive',

              onPress: () => {
                commitServices(
                  (current) =>
                    current.filter(
                      (item) =>
                        item.id !==
                        service.id,
                    ),
                );

                setError('');
              },
            },
          ],
        );
      },
      [
        commitServices,
      ],
    );

  /* ==========================================================
     ACTIVE / INACTIVE
  ========================================================== */

  const handleToggleActive =
    useCallback(
      (
        serviceId: string,
      ) => {
        commitServices(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                serviceId
                  ? {
                      ...item,
                      isActive:
                        !item.isActive,
                    }
                  : item,
            ),
        );

        setError('');
      },
      [
        commitServices,
      ],
    );

  /* ==========================================================
     NEXT
  ========================================================== */

  const handleNext =
    useCallback(() => {
      if (
        services.length ===
        0
      ) {
        setError(
          'Add at least one service before continuing.',
        );

        return;
      }

      if (
        services.length >
        MAX_SHOP_SERVICES
      ) {
        setError(
          `You can add up to ${MAX_SHOP_SERVICES} services.`,
        );

        return;
      }

      /*
       * commitServices already keeps the draft synchronized.
       * This final write guarantees the latest screen state is
       * persisted before navigation.
       */
      updateDraft({
        services,
      });

      setError('');

      router.push(
        '/my-shop/create/hours',
      );
    }, [
      services,
      updateDraft,
    ]);

  /* ==========================================================
     RENDER
  ========================================================== */

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
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={
          styles.header
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
          onPress={() =>
            router.back()
          }
          style={({
            pressed,
          }) => [
            styles.backButton,

            pressed &&
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

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <Text
          style={
            styles.title
          }
        >
          Add Services
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          Add the services customers
          can book from your shop.
        </Text>

        {/* ====================================================
            EMPTY STATE
        ==================================================== */}

        {!hasServices ? (
          <View
            style={
              styles.emptyState
            }
          >
            <View
              style={
                styles.emptyIcon
              }
            >
              <Ionicons
                name="construct-outline"
                size={42}
                color="#1677FF"
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              No services added yet
            </Text>

            <Text
              style={
                styles.emptyDescription
              }
            >
              Add your first service
              with a photo, description
              and starting price.
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add service"
              onPress={
                handleAddService
              }
              style={({
                pressed,
              }) => [
                styles.emptyAddButton,

                pressed &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name="add"
                size={22}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.emptyAddButtonText
                }
              >
                Add Service
              </Text>
            </Pressable>
          </View>
        ) : (
          /* ==================================================
             SERVICES
          ================================================== */

          <View
            style={
              styles.servicesList
            }
          >
            <View
              style={
                styles.servicesSummary
              }
            >
              <Text
                style={
                  styles.servicesCount
                }
              >
                {services.length}{' '}
                {services.length ===
                1
                  ? 'service'
                  : 'services'}
              </Text>

              <Text
                style={
                  styles.servicesLimit
                }
              >
                {services.length}/
                {MAX_SHOP_SERVICES}
              </Text>
            </View>

            {services.map(
              (service) => (
                <ServiceCard
                  key={
                    service.id
                  }
                  service={
                    service
                  }
                  onEdit={() =>
                    handleEditService(
                      service,
                    )
                  }
                  onDelete={() =>
                    handleDeleteService(
                      service,
                    )
                  }
                  onToggleActive={() =>
                    handleToggleActive(
                      service.id,
                    )
                  }
                />
              ),
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                reachedServiceLimit
                  ? 'Maximum service limit reached'
                  : 'Add another service'
              }
              accessibilityState={{
                disabled:
                  reachedServiceLimit,
              }}
              disabled={
                reachedServiceLimit
              }
              onPress={
                handleAddService
              }
              style={({
                pressed,
              }) => [
                styles.addAnotherButton,

                reachedServiceLimit &&
                  styles.addAnotherButtonDisabled,

                pressed &&
                  !reachedServiceLimit &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name={
                  reachedServiceLimit
                    ? 'checkmark-circle-outline'
                    : 'add'
                }
                size={21}
                color={
                  reachedServiceLimit
                    ? '#94A3B8'
                    : '#1677FF'
                }
              />

              <Text
                style={[
                  styles.addAnotherText,

                  reachedServiceLimit &&
                    styles.addAnotherTextDisabled,
                ]}
              >
                {reachedServiceLimit
                  ? 'Service Limit Reached'
                  : 'Add Another Service'}
              </Text>
            </Pressable>
          </View>
        )}

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error ? (
          <View
            accessibilityRole="alert"
            style={
              styles.errorBox
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color="#DC2626"
            />

            <Text
              style={
                styles.errorText
              }
            >
              {error}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <View
        style={
          styles.footer
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue to business hours"
          accessibilityState={{
            disabled:
              !hasServices,
          }}
          disabled={
            !hasServices
          }
          onPress={
            handleNext
          }
          style={({
            pressed,
          }) => [
            styles.nextButton,

            !hasServices &&
              styles.nextButtonInactive,

            pressed &&
              hasServices &&
              styles.pressed,
          ]}
        >
          <Text
            style={
              styles.nextButtonText
            }
          >
            Next
          </Text>

          <Ionicons
            name="arrow-forward"
            size={21}
            color="#FFFFFF"
          />
        </Pressable>
      </View>

      {/* ======================================================
          SERVICE EDITOR
      ====================================================== */}

      <ServiceEditorModal
        visible={
          modalVisible
        }
        service={
          editingService
        }
        onClose={
          handleCloseModal
        }
        onSave={
          handleSaveService
        }
      />
    </SafeAreaView>
  );
}

/* ============================================================
   SERVICE CARD
============================================================ */

function ServiceCard({
  service,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  service: WorkerShopService;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  return (
    <View
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
          styles.serviceBody
        }
      >
        <View
          style={
            styles.serviceTopRow
          }
        >
          <View
            style={
              styles.serviceTitleArea
            }
          >
            <Text
              style={
                styles.serviceName
              }
              numberOfLines={1}
            >
              {service.name}
            </Text>

            <Text
              style={
                styles.serviceDescription
              }
              numberOfLines={2}
            >
              {
                service.description
              }
            </Text>
          </View>

          <Pressable
            accessibilityRole="switch"
            accessibilityLabel={
              service.isActive
                ? `Deactivate ${service.name}`
                : `Activate ${service.name}`
            }
            accessibilityState={{
              checked:
                service.isActive,
            }}
            hitSlop={6}
            onPress={
              onToggleActive
            }
            style={({
              pressed,
            }) => [
              styles.statusBadge,

              service.isActive
                ? styles.activeBadge
                : styles.inactiveBadge,

              pressed &&
                styles.pressed,
            ]}
          >
            <View
              style={[
                styles.statusDot,

                service.isActive
                  ? styles.activeDot
                  : styles.inactiveDot,
              ]}
            />

            <Text
              style={[
                styles.statusText,

                service.isActive
                  ? styles.activeText
                  : styles.inactiveText,
              ]}
            >
              {service.isActive
                ? 'Active'
                : 'Inactive'}
            </Text>
          </Pressable>
        </View>

        <Text
          style={
            styles.price
          }
        >
          From{' '}
          {formatNaira(
            service.startingPrice,
          )}
        </Text>

        <View
          style={
            styles.cardActions
          }
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Edit ${service.name}`}
            onPress={
              onEdit
            }
            style={({
              pressed,
            }) => [
              styles.editButton,

              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="create-outline"
              size={18}
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

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Delete ${service.name}`}
            onPress={
              onDelete
            }
            style={({
              pressed,
            }) => [
              styles.deleteButton,

              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color="#DC2626"
            />

            <Text
              style={
                styles.deleteText
              }
            >
              Delete
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/* ============================================================
   PROGRESS INDICATOR
============================================================ */

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
            step < 4;

          const active =
            step === 4;

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
                {completed ? (
                  <Ionicons
                    name="checkmark"
                    size={10}
                    color="#FFFFFF"
                  />
                ) : null}
              </View>

              {index < 5 ? (
                <View
                  style={[
                    styles.progressLine,

                    completed &&
                      styles.progressLineCompleted,
                  ]}
                />
              ) : null}
            </React.Fragment>
          );
        },
      )}
    </View>
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
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 30,
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

    emptyState: {
      flex: 1,
      minHeight: 430,
      alignItems: 'center',
      justifyContent:
        'center',
      paddingHorizontal: 24,
    },

    emptyIcon: {
      width: 82,
      height: 82,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 28,
      backgroundColor:
        '#EFF6FF',
    },

    emptyTitle: {
      marginTop: 18,
      fontSize: 20,
      fontWeight: '800',
      color: '#0F172A',
    },

    emptyDescription: {
      maxWidth: 300,
      marginTop: 7,
      textAlign: 'center',
      fontSize: 14,
      lineHeight: 21,
      color: '#64748B',
    },

    emptyAddButton: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 7,
      marginTop: 20,
      paddingHorizontal: 24,
      borderRadius: 17,
      backgroundColor:
        '#1677FF',
    },

    emptyAddButtonText: {
      fontSize: 15,
      fontWeight: '800',
      color: '#FFFFFF',
    },

    servicesList: {
      marginTop: 22,
    },

    servicesSummary: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 12,
    },

    servicesCount: {
      fontSize: 14,
      fontWeight: '700',
      color: '#475569',
    },

    servicesLimit: {
      fontSize: 13,
      fontWeight: '700',
      color: '#64748B',
    },

    serviceCard: {
      overflow: 'hidden',
      marginBottom: 14,
      borderWidth: 1,
      borderColor:
        '#E2E8F0',
      borderRadius: 20,
      backgroundColor:
        '#FFFFFF',

      shadowColor:
        '#0F172A',

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.04,
      shadowRadius: 7,
      elevation: 2,
    },

    serviceImage: {
      width: '100%',
      height: 165,
      backgroundColor:
        '#E2E8F0',
    },

    serviceBody: {
      padding: 14,
    },

    serviceTopRow: {
      flexDirection: 'row',
      alignItems:
        'flex-start',
      gap: 10,
    },

    serviceTitleArea: {
      flex: 1,
      minWidth: 0,
    },

    serviceName: {
      fontSize: 18,
      fontWeight: '800',
      color: '#0F172A',
    },

    serviceDescription: {
      marginTop: 4,
      fontSize: 13,
      lineHeight: 19,
      color: '#64748B',
    },

    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
    },

    activeBadge: {
      backgroundColor:
        '#DCFCE7',
    },

    inactiveBadge: {
      backgroundColor:
        '#F1F5F9',
    },

    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },

    activeDot: {
      backgroundColor:
        '#16A34A',
    },

    inactiveDot: {
      backgroundColor:
        '#94A3B8',
    },

    statusText: {
      fontSize: 11,
      fontWeight: '700',
    },

    activeText: {
      color: '#16A34A',
    },

    inactiveText: {
      color: '#64748B',
    },

    price: {
      marginTop: 10,
      fontSize: 16,
      fontWeight: '800',
      color: '#1677FF',
    },

    cardActions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 14,
    },

    editButton: {
      flex: 1,
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 6,
      borderRadius: 14,
      backgroundColor:
        '#EFF6FF',
    },

    editText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#1677FF',
    },

    deleteButton: {
      flex: 1,
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 6,
      borderRadius: 14,
      backgroundColor:
        '#FEF2F2',
    },

    deleteText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#DC2626',
    },

    addAnotherButton: {
      minHeight: 54,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 7,
      borderWidth: 1.5,
      borderColor:
        '#1677FF',
      borderRadius: 17,
      backgroundColor:
        '#FFFFFF',
    },

    addAnotherButtonDisabled: {
      borderColor:
        '#CBD5E1',
      backgroundColor:
        '#F8FAFC',
    },

    addAnotherText: {
      fontSize: 15,
      fontWeight: '800',
      color: '#1677FF',
    },

    addAnotherTextDisabled: {
      color: '#94A3B8',
    },

    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      marginTop: 18,
      padding: 12,
      borderRadius: 14,
      backgroundColor:
        '#FEF2F2',
    },

    errorText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 19,
      color: '#DC2626',
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

    nextButton: {
      minHeight: 58,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 9,
      borderRadius: 18,
      backgroundColor:
        '#1677FF',
    },

    nextButtonInactive: {
      opacity: 0.5,
    },

    nextButtonText: {
      fontSize: 17,
      fontWeight: '800',
      color: '#FFFFFF',
    },

    pressed: {
      opacity: 0.72,
    },
  });