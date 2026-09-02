import React, {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { router } from "expo-router";

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

/* ============================================================
   TYPES
============================================================ */

type Props = {
  workers: WorkerCardData[];
  refreshing: boolean;
  onRefresh: () => void;

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

/* ============================================================
   CONSTANTS
============================================================ */

const MAX_SERVICES_TO_SHOW = 4;

const DEFAULT_ICON_COLOR =
  "#64748B";

const DEFAULT_ICON_BACKGROUND =
  "#F1F5F9";

const DEFAULT_SELECTED_BACKGROUND =
  "#DBEAFE";

/* ============================================================
   HELPERS
============================================================ */

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
    typeof item.id === "string"
      ? item.id.trim()
      : typeof item.serviceId === "string"
        ? item.serviceId.trim()
        : "";

  const name =
    typeof item.name === "string"
      ? item.name.trim()
      : typeof item.serviceName === "string"
        ? item.serviceName.trim()
        : "";

  if (!id || !name) {
    return null;
  }

  const icon =
    typeof item.icon === "string"
      ? item.icon.trim()
      : "";

  const color =
    typeof item.color === "string"
      ? item.color.trim()
      : "";

  const backgroundColor =
    typeof item.backgroundColor ===
    "string"
      ? item.backgroundColor.trim()
      : "";

  return {
    id,
    name,

    ...(icon
      ? {
          icon,
        }
      : {}),

    ...(color
      ? {
          color,
        }
      : {}),

    ...(backgroundColor
      ? {
          backgroundColor,
        }
      : {}),
  };
}

/* ============================================================
   NORMALIZE SERVICE IDS
============================================================ */

function normalizeServiceIds(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter(
          (id): id is string =>
            typeof id === "string" &&
            id.trim().length > 0,
        )
        .map((id) => id.trim()),
    ),
  );
}

/* ============================================================
   COMPONENT
============================================================ */

export default function NearbyWorkersList({
  workers,
  refreshing,
  onRefresh,
  categoryId,
  serviceId: requestedServiceId,
  serviceName: requestedServiceName,
}: Props) {
  const [
    selectedWorker,
    setSelectedWorker,
  ] = useState<WorkerCardData | null>(
    null,
  );

  const [
    selectedService,
    setSelectedService,
  ] = useState<WorkerService | null>(
    null,
  );

  const [
    availableServices,
    setAvailableServices,
  ] = useState<WorkerService[]>(
    [],
  );

  const [
    loadingServices,
    setLoadingServices,
  ] = useState(false);

  const [
    openingBooking,
    setOpeningBooking,
  ] = useState(false);

  /* ==========================================================
     LOAD WORKER SERVICES
  ========================================================== */

  const loadWorkerServices =
    useCallback(
      async (
        worker: WorkerCardData,
      ) => {
        setLoadingServices(true);
        setAvailableServices([]);
        setSelectedService(null);

        try {
          /* ----------------------------------------------------
             EXISTING SERVICES ON WORKER
          ---------------------------------------------------- */

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

          /* ----------------------------------------------------
             SERVICE IDS FROM WORKER
          ---------------------------------------------------- */

          const serviceIds =
            normalizeServiceIds(
              worker.serviceIds,
            );

          /* ----------------------------------------------------
             IDS FROM MAPPED SERVICES
          ---------------------------------------------------- */

          const mappedServiceIds =
            existingServices
              .map(
                (service) =>
                  service.id,
              )
              .filter(
                (
                  id,
                ): id is string =>
                  typeof id ===
                    "string" &&
                  id.trim().length > 0,
              );

          /* ----------------------------------------------------
             MERGE IDS
          ---------------------------------------------------- */

          const allServiceIds =
            Array.from(
              new Set([
                ...serviceIds,
                ...mappedServiceIds,
              ]),
            );

          /* ----------------------------------------------------
             FETCH SERVICES FROM FIREBASE
          ---------------------------------------------------- */

          if (
            allServiceIds.length > 0
          ) {
            try {
              const services =
                await getServicesByIds(
                  allServiceIds,
                );

              const mappedServices =
                services
                  .map(
                    normalizeService,
                  )
                  .filter(
                    (
                      service,
                    ): service is WorkerService =>
                      service !== null,
                  )
                  .slice(
                    0,
                    MAX_SERVICES_TO_SHOW,
                  );

              if (
                mappedServices.length >
                0
              ) {
                setAvailableServices(
                  mappedServices,
                );

                /* ----------------------------------------------
                   MATCH REQUESTED SERVICE ID
                ---------------------------------------------- */

                const requestedId =
                  requestedServiceId?.trim();

                if (
                  requestedId
                ) {
                  const matching =
                    mappedServices.find(
                      (
                        service,
                      ) =>
                        service.id ===
                        requestedId,
                    );

                  if (
                    matching
                  ) {
                    setSelectedService(
                      matching,
                    );

                    return;
                  }
                }

                /* ----------------------------------------------
                   MATCH REQUESTED SERVICE NAME
                ---------------------------------------------- */

                const requestedName =
                  requestedServiceName
                    ?.trim()
                    .toLowerCase();

                if (
                  requestedName
                ) {
                  const matching =
                    mappedServices.find(
                      (
                        service,
                      ) =>
                        service.name
                          .trim()
                          .toLowerCase() ===
                        requestedName,
                    );

                  if (
                    matching
                  ) {
                    setSelectedService(
                      matching,
                    );

                    return;
                  }
                }

                /* ----------------------------------------------
                   AUTO SELECT ONLY ONE
                ---------------------------------------------- */

                if (
                  mappedServices.length ===
                  1
                ) {
                  setSelectedService(
                    mappedServices[0],
                  );
                }

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

          /* ----------------------------------------------------
             FALLBACK TO WORKER MAPPED SERVICES
          ---------------------------------------------------- */

          if (
            existingServices.length >
            0
          ) {
            const visible =
              existingServices.slice(
                0,
                MAX_SERVICES_TO_SHOW,
              );

            setAvailableServices(
              visible,
            );

            const requestedId =
              requestedServiceId?.trim();

            if (
              requestedId
            ) {
              const matching =
                visible.find(
                  (
                    service,
                  ) =>
                    service.id ===
                    requestedId,
                );

              if (
                matching
              ) {
                setSelectedService(
                  matching,
                );

                return;
              }
            }

            const requestedName =
              requestedServiceName
                ?.trim()
                .toLowerCase();

            if (
              requestedName
            ) {
              const matching =
                visible.find(
                  (
                    service,
                  ) =>
                    service.name
                      .trim()
                      .toLowerCase() ===
                    requestedName,
                );

              if (
                matching
              ) {
                setSelectedService(
                  matching,
                );

                return;
              }
            }

            if (
              visible.length ===
              1
            ) {
              setSelectedService(
                visible[0],
              );
            }

            return;
          }

          setAvailableServices([]);
        } catch (error) {
          console.error(
            "LOAD_WORKER_SERVICES_ERROR:",
            error,
          );

          setAvailableServices([]);
        } finally {
          setLoadingServices(false);
        }
      },
      [
        requestedServiceId,
        requestedServiceName,
      ],
    );

  /* ==========================================================
     REQUEST NOW
  ========================================================== */

  const handleBookWorker =
    useCallback(
      (
        worker: WorkerCardData,
      ) => {
        setSelectedWorker(worker);

        void loadWorkerServices(
          worker,
        );
      },
      [loadWorkerServices],
    );

  /* ==========================================================
     CLOSE MODAL
  ========================================================== */

  const handleCloseModal =
    useCallback(() => {
      if (openingBooking) {
        return;
      }

      setSelectedWorker(null);
      setSelectedService(null);
      setAvailableServices([]);
      setLoadingServices(false);
    }, [openingBooking]);

  /* ==========================================================
     CONTINUE BOOKING
  ========================================================== */

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
        selectedWorker.id.trim();

      const finalServiceId =
        selectedService.id.trim();

      const finalServiceName =
        selectedService.name.trim();

      if (
        !workerId ||
        !finalServiceId ||
        !finalServiceName
      ) {
        return;
      }

      setOpeningBooking(true);

      const workerName =
        `${selectedWorker.firstName ?? ""} ${
          selectedWorker.surname ?? ""
        }`.trim();

      /* ------------------------------------------------------
         FIREBASE ICON DATA
      ------------------------------------------------------ */

      const serviceIcon =
        selectedService.icon?.trim() ??
        "";

      const serviceColor =
        selectedService.color?.trim() ??
        "";

      const serviceBackgroundColor =
        selectedService.backgroundColor?.trim() ??
        "";

      router.push({
        pathname:
          "/(customer)/booking",

        params: {
          workerId,

          workerName,

          workerPhoto:
            selectedWorker
              .workerProfile
              ?.photoUrl ?? "",

          workerCategory:
            selectedWorker.category ??
            "",

          serviceId:
            finalServiceId,

          serviceName:
            finalServiceName,

          serviceIcon,

          serviceColor,

          serviceBackgroundColor,

          categoryId:
            categoryId?.trim() ??
            "",

          basePrice:
            String(
              selectedWorker
                .workerProfile
                ?.hourlyRate ?? 0,
            ),

          workerOnline:
            String(
              selectedWorker.online ===
                true,
            ),
        },
      });

      setTimeout(() => {
        setOpeningBooking(false);
        setSelectedWorker(null);
        setSelectedService(null);
        setAvailableServices([]);
      }, 350);
    }, [
      selectedWorker,
      selectedService,
      openingBooking,
      categoryId,
    ]);

  /* ==========================================================
     EMPTY
  ========================================================== */

  const noServices =
    !loadingServices &&
    selectedWorker !== null &&
    availableServices.length === 0;

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      <FlatList
        data={workers}
        keyExtractor={(item) =>
          item.id
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
          />
        }
        renderItem={({
          item,
        }) => (
          <WorkerCard
            worker={item}
            onProfilePress={() =>
              router.push({
                pathname:
                  "/(customer)/details/worker-profile/[id]",
                params: {
                  id: item.id,
                },
              })
            }
            onBookPress={() =>
              handleBookWorker(
                item,
              )
            }
          />
        )}
      />

      {/* ======================================================
          CHOOSE SERVICE MODAL
      ====================================================== */}

      <Modal
        visible={
          selectedWorker !== null
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
            style={
              styles.modalCard
            }
          >
            {/* HANDLE */}

            <View
              style={styles.handle}
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
                <Ionicons
                  name="construct-outline"
                  size={23}
                  color="#2563EB"
                />
              </View>

              <View
                style={
                  styles.headerText
                }
              >
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Choose a service
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                  numberOfLines={2}
                >
                  Select the service you
                  want from{" "}
                  {selectedWorker
                    ? `${selectedWorker.firstName ?? ""} ${
                        selectedWorker.surname ?? ""
                      }`.trim()
                    : "this worker"}
                  .
                </Text>
              </View>

              <Pressable
                onPress={
                  handleCloseModal
                }
                disabled={
                  openingBooking
                }
                style={
                  styles.closeButton
                }
                accessibilityRole="button"
                accessibilityLabel="Close service selection"
              >
                <Ionicons
                  name="close"
                  size={22}
                  color="#64748B"
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
                  color="#2563EB"
                />

                <Text
                  style={
                    styles.loadingText
                  }
                >
                  Loading services...
                </Text>
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
                  <Ionicons
                    name="construct-outline"
                    size={38}
                    color="#94A3B8"
                  />
                </View>

                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  No services available
                </Text>

                <Text
                  style={
                    styles.emptyText
                  }
                >
                  This worker has not added
                  a service that can be
                  requested yet.
                </Text>
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
                      service.color ||
                      (isSelected
                        ? "#2563EB"
                        : DEFAULT_ICON_COLOR);

                    const serviceBackground =
                      service.backgroundColor ||
                      (isSelected
                        ? DEFAULT_SELECTED_BACKGROUND
                        : DEFAULT_ICON_BACKGROUND);

                    /*
                     * IMPORTANT:
                     *
                     * The icon name comes directly
                     * from Firebase.
                     *
                     * We now render it with the
                     * SAME icon library used by
                     * CategoryCard:
                     *
                     * MaterialCommunityIcons
                     */

                    const iconName =
                      service.icon?.trim();

                    return (
                      <Pressable
                        key={
                          service.id
                        }
                        onPress={() =>
                          setSelectedService(
                            service,
                          )
                        }
                        disabled={
                          openingBooking
                        }
                        accessibilityRole="radio"
                        accessibilityState={{
                          checked:
                            isSelected,
                        }}
                        style={({
                          pressed,
                        }) => [
                          styles.serviceOption,

                          isSelected &&
                            styles.serviceOptionSelected,

                          pressed &&
                            styles.serviceOptionPressed,
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
                                iconName as React.ComponentProps<
                                  typeof MaterialCommunityIcons
                                >["name"]
                              }
                              size={23}
                              color={
                                serviceColor
                              }
                            />
                          ) : (
                            <Ionicons
                              name="help-outline"
                              size={23}
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
                          <Text
                            style={[
                              styles.serviceName,
                              isSelected &&
                                styles.serviceNameSelected,
                            ]}
                            numberOfLines={
                              2
                            }
                          >
                            {
                              service.name
                            }
                          </Text>

                          <Text
                            style={
                              styles.serviceHint
                            }
                          >
                            Request this service
                          </Text>
                        </View>

                        {/* RADIO */}

                        <View
                          style={[
                            styles.radio,
                            isSelected &&
                              styles.radioSelected,
                          ]}
                        >
                          {isSelected && (
                            <View
                              style={
                                styles.radioDot
                              }
                            />
                          )}
                        </View>
                      </Pressable>
                    );
                  },
                )}
              </View>
            )}

            {/* CONTINUE */}

            <Pressable
              onPress={
                handleContinueBooking
              }
              disabled={
                !selectedService ||
                loadingServices ||
                openingBooking
              }
              accessibilityRole="button"
              accessibilityLabel="Continue to booking"
              style={({
                pressed,
              }) => [
                styles.continueButton,

                (!selectedService ||
                  loadingServices) &&
                  styles.continueButtonDisabled,

                pressed &&
                  selectedService &&
                  !openingBooking &&
                  styles.continueButtonPressed,
              ]}
            >
              {openingBooking ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Text
                    style={
                      styles.continueText
                    }
                  >
                    CONTINUE
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="#FFFFFF"
                  />
                </>
              )}
            </Pressable>
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
      paddingBottom: 24,
    },

    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor:
        "rgba(15, 23, 42, 0.55)",
    },

    modalCard: {
      backgroundColor: "#FFFFFF",

      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,

      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 28,

      shadowColor: "#000000",
      shadowOpacity: 0.18,
      shadowRadius: 24,

      shadowOffset: {
        width: 0,
        height: -8,
      },

      elevation: 15,
    },

    handle: {
      alignSelf: "center",

      width: 42,
      height: 5,

      borderRadius: 3,

      backgroundColor:
        "#CBD5E1",

      marginBottom: 20,
    },

    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },

    headerIcon: {
      width: 48,
      height: 48,

      borderRadius: 16,

      backgroundColor:
        "#EFF6FF",

      borderWidth: 1,
      borderColor:
        "#DBEAFE",

      alignItems: "center",
      justifyContent: "center",
    },

    headerText: {
      flex: 1,

      marginLeft: 12,
      marginRight: 8,
    },

    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: "#0F172A",
    },

    modalSubtitle: {
      marginTop: 4,

      fontSize: 12,
      lineHeight: 18,

      color: "#64748B",
    },

    closeButton: {
      width: 38,
      height: 38,

      borderRadius: 13,

      backgroundColor:
        "#F8FAFC",

      alignItems: "center",
      justifyContent: "center",
    },

    loadingContainer: {
      minHeight: 220,

      alignItems: "center",
      justifyContent: "center",
    },

    loadingText: {
      marginTop: 12,

      fontSize: 14,

      color: "#64748B",
    },

    emptyServices: {
      minHeight: 250,

      alignItems: "center",
      justifyContent: "center",

      paddingHorizontal: 30,
    },

    emptyIcon: {
      width: 88,
      height: 88,

      borderRadius: 28,

      backgroundColor:
        "#F1F5F9",

      alignItems: "center",
      justifyContent: "center",

      marginBottom: 20,
    },

    emptyTitle: {
      fontSize: 19,

      fontWeight: "700",

      color: "#0F172A",

      textAlign: "center",
    },

    emptyText: {
      marginTop: 8,

      fontSize: 14,
      lineHeight: 21,

      color: "#64748B",

      textAlign: "center",
    },

    servicesContainer: {
      gap: 10,
    },

    serviceOption: {
      minHeight: 72,

      borderRadius: 17,

      borderWidth: 1,

      borderColor:
        "#E2E8F0",

      backgroundColor:
        "#FFFFFF",

      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal: 12,
      paddingVertical: 10,
    },

    serviceOptionSelected: {
      borderColor:
        "#2563EB",

      backgroundColor:
        "#EFF6FF",
    },

    serviceOptionPressed: {
      opacity: 0.75,

      transform: [
        {
          scale: 0.985,
        },
      ],
    },

    serviceIcon: {
      width: 46,
      height: 46,

      borderRadius: 14,

      alignItems: "center",
      justifyContent: "center",
    },

    serviceContent: {
      flex: 1,

      minWidth: 0,

      marginHorizontal: 12,
    },

    serviceName: {
      fontSize: 15,

      lineHeight: 20,

      fontWeight: "700",

      color: "#334155",
    },

    serviceNameSelected: {
      color: "#2563EB",
    },

    serviceHint: {
      marginTop: 3,

      fontSize: 11,

      color: "#94A3B8",
    },

    radio: {
      width: 23,
      height: 23,

      borderRadius: 12,

      borderWidth: 2,

      borderColor:
        "#CBD5E1",

      alignItems: "center",
      justifyContent: "center",
    },

    radioSelected: {
      borderColor:
        "#2563EB",
    },

    radioDot: {
      width: 11,
      height: 11,

      borderRadius: 6,

      backgroundColor:
        "#2563EB",
    },

    continueButton: {
      minHeight: 54,

      marginTop: 20,

      borderRadius: 16,

      backgroundColor:
        "#2563EB",

      flexDirection: "row",

      alignItems: "center",
      justifyContent: "center",

      gap: 9,
    },

    continueButtonDisabled: {
      opacity: 0.45,
    },

    continueButtonPressed: {
      opacity: 0.9,

      transform: [
        {
          scale: 0.985,
        },
      ],
    },

    continueText: {
      fontSize: 14,

      fontWeight: "700",

      color: "#FFFFFF",

      letterSpacing: 0.4,
    },
  });