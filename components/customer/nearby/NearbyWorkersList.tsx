import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  router,
} from "expo-router";

import {
  AppButton,
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import {
  WorkerCard,
} from "@/components/customer/worker/workercard";

import type {
  WorkerCardData,
  WorkerService as WorkerServiceType,
} from "@/components/customer/worker/types";

import {
  getServicesByIds,
} from "@/firebase/queries/getServicesByIds";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  workers: WorkerCardData[];

  refreshing: boolean;

  onRefresh: () => void | Promise<void>;

  serviceId?: string;

  serviceName?: string;

  categoryId?: string;
};

type WorkerService = Omit<
  WorkerServiceType,
  "id" | "name"
> & {
  id: string;

  name: string;
};

type MaterialIconName =
  React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_SERVICES_TO_SHOW =
  4;

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
}

function normalizeService(
  service: unknown,
): WorkerService | null {
  if (
    typeof service !== "object" ||
    service === null
  ) {
    return null;
  }

  const item = service as {
    id?: unknown;
    serviceId?: unknown;

    name?: unknown;
    serviceName?: unknown;

    icon?: unknown;

    color?: unknown;

    backgroundColor?: unknown;
  };

  const id =
    cleanString(
      item.id,
    ) ||
    cleanString(
      item.serviceId,
    );

  const name =
    cleanString(
      item.name,
    ) ||
    cleanString(
      item.serviceName,
    );

  if (
    !id ||
    !name
  ) {
    return null;
  }

  const icon =
    cleanString(
      item.icon,
    );

  const color =
    cleanString(
      item.color,
    );

  const backgroundColor =
    cleanString(
      item.backgroundColor,
    );

  return {
    id,
    name,

    ...(icon
      ? { icon }
      : {}),

    ...(color
      ? { color }
      : {}),

    ...(backgroundColor
      ? {
          backgroundColor,
        }
      : {}),
  };
}

function normalizeServiceIds(
  value: unknown,
): string[] {
  if (
    !Array.isArray(value)
  ) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map(
          cleanString,
        )
        .filter(
          Boolean,
        ),
    ),
  );
}

function prioritizeServices(
  services: WorkerService[],
  requestedServiceId: string,
  requestedServiceName: string,
): WorkerService[] {
  const requestedName =
    requestedServiceName.toLowerCase();

  const requested =
    services.find(
      (service) =>
        (requestedServiceId &&
          service.id ===
            requestedServiceId) ||
        (requestedName &&
          service.name
            .trim()
            .toLowerCase() ===
            requestedName),
    );

  if (!requested) {
    return services.slice(
      0,
      MAX_SERVICES_TO_SHOW,
    );
  }

  return [
    requested,

    ...services.filter(
      (service) =>
        service.id !==
        requested.id,
    ),
  ].slice(
    0,
    MAX_SERVICES_TO_SHOW,
  );
}

/* ==============================================================
   WORKER PHOTO
============================================================== */

function getWorkerPhotoUrl(
  worker: WorkerCardData,
): string {
  const profile =
    worker.workerProfile;

  const workerRecord =
    worker as WorkerCardData & {
      image?: unknown;

      photoUrl?: unknown;

      photoURL?: unknown;
    };

  const profileRecord =
    profile as {
      photoUrl?: unknown;

      photoURL?: unknown;
    };

  const candidates: unknown[] =
    [
      profileRecord.photoUrl,

      profileRecord.photoURL,

      workerRecord.image,

      workerRecord.photoUrl,

      workerRecord.photoURL,
    ];

  for (
    const value of candidates
  ) {
    const url =
      cleanString(
        value,
      );

    if (
      url.startsWith(
        "https://",
      ) ||
      url.startsWith(
        "http://",
      )
    ) {
      return url;
    }
  }

  return "";
}

/* ==============================================================
   WORKER NAME
============================================================== */

function getWorkerName(
  worker: WorkerCardData,
): string {
  const fullName =
    cleanString(
      worker.fullName,
    );

  if (fullName) {
    return fullName;
  }

  const combined =
    [
      cleanString(
        worker.firstName,
      ),

      cleanString(
        worker.surname,
      ),
    ]
      .filter(
        Boolean,
      )
      .join(" ");

  return (
    combined ||
    "Service Provider"
  );
}

/* ==============================================================
   COMPONENT
============================================================== */

export default function NearbyWorkersList({
  workers,
  refreshing,
  onRefresh,
  categoryId,
  serviceId:
    requestedServiceId,
  serviceName:
    requestedServiceName,
}: Props) {
  const insets =
    useSafeAreaInsets();

  const [
    selectedWorker,
    setSelectedWorker,
  ] =
    useState<WorkerCardData | null>(
      null,
    );

  const [
    selectedService,
    setSelectedService,
  ] =
    useState<WorkerService | null>(
      null,
    );

  const [
    availableServices,
    setAvailableServices,
  ] =
    useState<WorkerService[]>(
      [],
    );

  const [
    loadingServices,
    setLoadingServices,
  ] =
    useState(false);

  const [
    openingBooking,
    setOpeningBooking,
  ] =
    useState(false);

  const serviceRequestRef =
    useRef(0);

  const bookingTimerRef =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(null);

  const normalizedRequestedId =
    cleanString(
      requestedServiceId,
    );

  const normalizedRequestedName =
    cleanString(
      requestedServiceName,
    );

  /* ============================================================
     CLEANUP
  ============================================================ */

  useEffect(() => {
    return () => {
      serviceRequestRef.current +=
        1;

      if (
        bookingTimerRef.current
      ) {
        clearTimeout(
          bookingTimerRef.current,
        );
      }
    };
  }, []);

  /* ============================================================
     SELECT REQUESTED SERVICE
  ============================================================ */

  const resolveInitialSelection =
    useCallback(
      (
        services: WorkerService[],
      ) => {
        if (
          services.length === 0
        ) {
          return null;
        }

        const requestedName =
          normalizedRequestedName.toLowerCase();

        const matching =
          services.find(
            (service) =>
              (normalizedRequestedId &&
                service.id ===
                  normalizedRequestedId) ||
              (requestedName &&
                service.name
                  .trim()
                  .toLowerCase() ===
                  requestedName),
          );

        if (matching) {
          return matching;
        }

        return services.length ===
          1
          ? services[0]
          : null;
      },
      [
        normalizedRequestedId,
        normalizedRequestedName,
      ],
    );

  /* ============================================================
     LOAD WORKER SERVICES
  ============================================================ */

  const loadWorkerServices =
    useCallback(
      async (
        worker: WorkerCardData,
      ) => {
        const requestId =
          ++serviceRequestRef.current;

        setLoadingServices(
          true,
        );

        setAvailableServices(
          [],
        );

        setSelectedService(
          null,
        );

        try {
          const existingServices =
            Array.isArray(
              worker.services,
            )
              ? worker.services
                  .map(
                    normalizeService,
                  )
                  .filter(
                    (
                      service,
                    ): service is WorkerService =>
                      service !== null,
                  )
              : [];

          const serviceIds =
            normalizeServiceIds(
              worker.serviceIds,
            );

          const mappedServiceIds =
            existingServices.map(
              (service) =>
                service.id,
            );

          const allServiceIds =
            Array.from(
              new Set([
                ...serviceIds,
                ...mappedServiceIds,
              ]),
            );

          /* ==================================================
             FIRESTORE SERVICES
          ================================================== */

          if (
            allServiceIds.length >
            0
          ) {
            try {
              const services =
                await getServicesByIds(
                  allServiceIds,
                );

              if (
                requestId !==
                serviceRequestRef.current
              ) {
                return;
              }

              const normalized =
                services
                  .map(
                    normalizeService,
                  )
                  .filter(
                    (
                      service,
                    ): service is WorkerService =>
                      service !== null,
                  );

              if (
                normalized.length >
                0
              ) {
                const visible =
                  prioritizeServices(
                    normalized,
                    normalizedRequestedId,
                    normalizedRequestedName,
                  );

                setAvailableServices(
                  visible,
                );

                setSelectedService(
                  resolveInitialSelection(
                    visible,
                  ),
                );

                return;
              }
            } catch (
              serviceError
            ) {
              console.warn(
                "GET_WORKER_SERVICES_FAILED:",
                serviceError,
              );
            }
          }

          /* ==================================================
             FALLBACK TO MAPPED WORKER SERVICES
          ================================================== */

          if (
            requestId !==
            serviceRequestRef.current
          ) {
            return;
          }

          const visible =
            prioritizeServices(
              existingServices,
              normalizedRequestedId,
              normalizedRequestedName,
            );

          setAvailableServices(
            visible,
          );

          setSelectedService(
            resolveInitialSelection(
              visible,
            ),
          );
        } catch (error) {
          console.error(
            "LOAD_WORKER_SERVICES_ERROR:",
            error,
          );

          if (
            requestId ===
            serviceRequestRef.current
          ) {
            setAvailableServices(
              [],
            );

            setSelectedService(
              null,
            );
          }
        } finally {
          if (
            requestId ===
            serviceRequestRef.current
          ) {
            setLoadingServices(
              false,
            );
          }
        }
      },
      [
        normalizedRequestedId,
        normalizedRequestedName,
        resolveInitialSelection,
      ],
    );

  /* ============================================================
     REQUEST WORKER
  ============================================================ */

  const handleBookWorker =
    useCallback(
      (
        worker: WorkerCardData,
      ) => {
        setSelectedWorker(
          worker,
        );

        void loadWorkerServices(
          worker,
        );
      },
      [
        loadWorkerServices,
      ],
    );

  /* ============================================================
     CLOSE MODAL
  ============================================================ */

  const handleCloseModal =
    useCallback(() => {
      if (
        openingBooking
      ) {
        return;
      }

      serviceRequestRef.current +=
        1;

      setSelectedWorker(
        null,
      );

      setSelectedService(
        null,
      );

      setAvailableServices(
        [],
      );

      setLoadingServices(
        false,
      );
    }, [
      openingBooking,
    ]);

  /* ============================================================
     CONTINUE BOOKING
  ============================================================ */

  const handleContinueBooking =
    useCallback(() => {
      if (
        !selectedWorker ||
        !selectedService ||
        openingBooking
      ) {
        return;
      }

      const workerId =
        cleanString(
          selectedWorker.id,
        );

      const finalServiceId =
        cleanString(
          selectedService.id,
        );

      const finalServiceName =
        cleanString(
          selectedService.name,
        );

      if (
        !workerId ||
        !finalServiceId ||
        !finalServiceName
      ) {
        return;
      }

      const workerName =
        getWorkerName(
          selectedWorker,
        );

      const workerPhoto =
        getWorkerPhotoUrl(
          selectedWorker,
        );

      const serviceIcon =
        cleanString(
          selectedService.icon,
        );

      const serviceColor =
        cleanString(
          selectedService.color,
        );

      const serviceBackgroundColor =
        cleanString(
          selectedService.backgroundColor,
        );

      const workerCategory =
        cleanString(
          selectedWorker.category,
        );

      const workerHourlyRate =
        Number(
          selectedWorker
            .workerProfile
            .hourlyRate,
        );

      const safeHourlyRate =
        Number.isFinite(
          workerHourlyRate,
        ) &&
        workerHourlyRate >= 0
          ? workerHourlyRate
          : 0;

      if (__DEV__) {
        console.log(
          "CHOOSE_SERVICE_TO_BOOKING",
          {
            workerId,

            workerName,

            workerPhoto,

            hasWorkerPhoto:
              Boolean(
                workerPhoto,
              ),

            workerProfile:
              selectedWorker.workerProfile,

            serviceId:
              finalServiceId,

            serviceName:
              finalServiceName,
          },
        );
      }

      setOpeningBooking(
        true,
      );

      /* ======================================================
         ROUTE — PRESERVED EXACTLY
      ====================================================== */

      router.push({
        pathname:
          "/(customer)/booking",

        params: {
          workerId,

          workerName,

          workerPhoto,

          workerCategory,

          workerHourlyRate:
            String(
              safeHourlyRate,
            ),

          workerOnline:
            String(
              selectedWorker.online ===
                true,
            ),

          serviceId:
            finalServiceId,

          serviceName:
            finalServiceName,

          serviceIcon,

          serviceColor,

          serviceBackgroundColor,

          categoryId:
            cleanString(
              categoryId,
            ),

          basePrice:
            String(
              safeHourlyRate,
            ),
        },
      });

      bookingTimerRef.current =
        setTimeout(() => {
          setOpeningBooking(
            false,
          );

          setSelectedWorker(
            null,
          );

          setSelectedService(
            null,
          );

          setAvailableServices(
            [],
          );

          setLoadingServices(
            false,
          );

          bookingTimerRef.current =
            null;
        }, 350);
    }, [
      categoryId,
      openingBooking,
      selectedService,
      selectedWorker,
    ]);

  /* ============================================================
     PROFILE
  ============================================================ */

  const handleProfilePress =
    useCallback(
      (
        worker: WorkerCardData,
      ) => {
        router.push({
          pathname:
            "/(customer)/details/worker-profile/[id]",

          params: {
            id: worker.id,
          },
        });
      },
      [],
    );

  /* ============================================================
     LIST ITEM
  ============================================================ */

  const renderWorker =
    useCallback(
      ({
        item,
      }: {
        item: WorkerCardData;
      }) => (
        <WorkerCard
          worker={item}
          onProfilePress={() =>
            handleProfilePress(
              item,
            )
          }
          onBookPress={() =>
            handleBookWorker(
              item,
            )
          }
        />
      ),
      [
        handleBookWorker,
        handleProfilePress,
      ],
    );

  const noServices =
    !loadingServices &&
    selectedWorker !== null &&
    availableServices.length ===
      0;

  /* ============================================================
     UI
  ============================================================ */

  return (
    <>
      <FlatList
        data={
          workers
        }
        keyExtractor={(
          item,
        ) => item.id}
        renderItem={
          renderWorker
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.listContent
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              onRefresh
            }
            tintColor={
              CustomerColors.primary
            }
            colors={[
              CustomerColors.primary,
            ]}
          />
        }
      />

      {/* ======================================================
          CHOOSE SERVICE MODAL
      ====================================================== */}

      <Modal
        visible={
          selectedWorker !==
          null
        }
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={
          handleCloseModal
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <Pressable
            style={
              StyleSheet.absoluteFill
            }
            onPress={
              handleCloseModal
            }
          />

          <View
            accessibilityViewIsModal
            style={[
              styles.modalCard,

              {
                paddingBottom:
                  Math.max(
                    insets.bottom,
                    FixxamTokens
                      .spacing.lg,
                  ),
              },
            ]}
          >
            {/* HANDLE */}

            <View
              style={
                styles.handle
              }
            />

            {/* HEADER */}

            <View
              style={
                styles.modalHeader
              }
            >
              <View
                style={
                  styles.headerIcon
                }
              >
                <AppIcon
                  name="service"
                  role="customer"
                  size="md"
                  state="active"
                />
              </View>

              <View
                style={
                  styles.headerText
                }
              >
                <AppText
                  variant="bodyLarge"
                  weight="bold"
                >
                  Choose a service
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  numberOfLines={2}
                  style={
                    styles.modalSubtitle
                  }
                >
                  Select the service you
                  want from{" "}
                  {selectedWorker
                    ? getWorkerName(
                        selectedWorker,
                      )
                    : "this worker"}
                  .
                </AppText>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close service selection"
                hitSlop={8}
                disabled={
                  openingBooking
                }
                onPress={
                  handleCloseModal
                }
                style={({
                  pressed,
                }) => [
                  styles.closeButton,

                  pressed &&
                  !openingBooking
                    ? styles.pressed
                    : null,
                ]}
              >
                <AppIcon
                  name="close"
                  role="customer"
                  size="sm"
                  state="muted"
                />
              </Pressable>
            </View>

            {/* LOADING */}

            {loadingServices ? (
              <View
                style={
                  styles.loadingContainer
                }
              >
                <ActivityIndicator
                  size="large"
                  color={
                    CustomerColors.primary
                  }
                />

                <AppText
                  variant="body"
                  tone="secondary"
                  style={
                    styles.loadingText
                  }
                >
                  Loading services...
                </AppText>
              </View>
            ) : noServices ? (
              <View
                style={
                  styles.emptyServices
                }
              >
                <View
                  style={
                    styles.emptyIcon
                  }
                >
                  <AppIcon
                    name="service"
                    role="customer"
                    size="xl"
                    state="muted"
                  />
                </View>

                <AppText
                  variant="bodyLarge"
                  weight="bold"
                  center
                >
                  No services available
                </AppText>

                <AppText
                  variant="body"
                  tone="secondary"
                  center
                  style={
                    styles.emptyText
                  }
                >
                  This worker has not added
                  a service that can be
                  requested yet.
                </AppText>
              </View>
            ) : (
              <View
                style={
                  styles.servicesContainer
                }
              >
                {availableServices.map(
                  (
                    service,
                  ) => {
                    const isSelected =
                      selectedService?.id ===
                      service.id;

                    const serviceColor =
                      cleanString(
                        service.color,
                      ) ||
                      (isSelected
                        ? CustomerColors.primary
                        : Colors.textSecondary);

                    const serviceBackground =
                      cleanString(
                        service.backgroundColor,
                      ) ||
                      (isSelected
                        ? CustomerColors.primarySoft
                        : Colors.disabledBackground);

                    const iconName =
                      cleanString(
                        service.icon,
                      );

                    return (
                      <Pressable
                        key={
                          service.id
                        }
                        accessibilityRole="radio"
                        accessibilityLabel={
                          service.name
                        }
                        accessibilityState={{
                          checked:
                            isSelected,
                        }}
                        disabled={
                          openingBooking
                        }
                        onPress={() =>
                          setSelectedService(
                            service,
                          )
                        }
                        style={({
                          pressed,
                        }) => [
                          styles.serviceOption,

                          isSelected
                            ? styles.serviceOptionSelected
                            : null,

                          pressed &&
                          !openingBooking
                            ? styles.pressed
                            : null,
                        ]}
                      >
                        {/* SERVICE ICON */}

                        <View
                          style={[
                            styles.serviceIcon,

                            {
                              backgroundColor:
                                serviceBackground,
                            },
                          ]}
                        >
                          {iconName ? (
                            <MaterialCommunityIcons
                              name={
                                iconName as MaterialIconName
                              }
                              size={23}
                              color={
                                serviceColor
                              }
                            />
                          ) : (
                            <AppIcon
                              name="help"
                              role="customer"
                              size="md"
                              color={
                                serviceColor
                              }
                            />
                          )}
                        </View>

                        {/* SERVICE INFO */}

                        <View
                          style={
                            styles.serviceContent
                          }
                        >
                          <AppText
                            variant="bodyMedium"
                            weight="bold"
                            numberOfLines={2}
                            style={
                              isSelected
                                ? styles.serviceNameSelected
                                : undefined
                            }
                          >
                            {service.name}
                          </AppText>

                          <AppText
                            variant="caption"
                            tone="secondary"
                            style={
                              styles.serviceHint
                            }
                          >
                            Request this service
                          </AppText>
                        </View>

                        {/* RADIO */}

                        <View
                          style={[
                            styles.radio,

                            isSelected
                              ? styles.radioSelected
                              : null,
                          ]}
                        >
                          {isSelected ? (
                            <View
                              style={
                                styles.radioDot
                              }
                            />
                          ) : null}
                        </View>
                      </Pressable>
                    );
                  },
                )}
              </View>
            )}

            {/* CONTINUE */}

            <AppButton
              title="Continue"
              role="customer"
              loading={
                openingBooking
              }
              disabled={
                !selectedService ||
                loadingServices ||
                openingBooking
              }
              onPress={
                handleContinueBooking
              }
              style={
                styles.continueButton
              }
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    listContent: {
      paddingBottom:
        FixxamTokens.spacing.xl,
    },

    /* ========================================================
       MODAL
    ======================================================== */

    modalOverlay: {
      flex: 1,

      justifyContent:
        "flex-end",

      backgroundColor:
        Colors.overlayStrong,
    },

    modalCard: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      borderTopLeftRadius:
        FixxamTokens.radius.xl,

      borderTopRightRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    handle: {
      alignSelf:
        "center",

      width: 42,

      height: 5,

      marginBottom:
        FixxamTokens.spacing.lg,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        Colors.disabled,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    modalHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        FixxamTokens.spacing.lg,
    },

    headerIcon: {
      width:
        FixxamTokens.size
          .iconBox,

      height:
        FixxamTokens.size
          .iconBox,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    headerText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    modalSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    closeButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    /* ========================================================
       LOADING
    ======================================================== */

    loadingContainer: {
      minHeight: 220,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyServices: {
      minHeight: 250,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,
    },

    emptyIcon: {
      width: 88,

      height: 88,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom:
        FixxamTokens.spacing.lg,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.disabledBackground,
    },

    emptyText: {
      marginTop:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       SERVICES
    ======================================================== */

    servicesContainer: {
      gap:
        FixxamTokens.spacing.sm,
    },

    serviceOption: {
      minHeight: 72,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    serviceOptionSelected: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    serviceIcon: {
      width:
        FixxamTokens.size
          .iconBox,

      height:
        FixxamTokens.size
          .iconBox,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,
    },

    serviceContent: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.md,
    },

    serviceNameSelected: {
      color:
        CustomerColors.primary,
    },

    serviceHint: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       RADIO
    ======================================================== */

    radio: {
      width: 24,

      height: 24,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 2,

      borderColor:
        Colors.disabled,

      borderRadius:
        FixxamTokens.radius.full,
    },

    radioSelected: {
      borderColor:
        CustomerColors.primary,
    },

    radioDot: {
      width: 12,

      height: 12,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primary,
    },

    /* ========================================================
       CONTINUE
    ======================================================== */

    continueButton: {
      width: "100%",

      minHeight:
        FixxamTokens.size
          .buttonHeight,

      marginTop:
        FixxamTokens.spacing.lg,
    },

    /* ========================================================
       PRESSED
    ======================================================== */

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },
  });