import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router } from "expo-router";

import {
  getAuth,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

import {
  getDownloadURL,
  getStorage,
  ref,
} from "firebase/storage";

import * as Location from "expo-location";

import {
  AppCard,
  AppText,
} from "@/components/ui";

import AuthRequiredModal from "@/components/auth/AuthRequiredModal";

import {
  getPublicWorkers,
} from "@/firebase/queries/workerPublicProfiles";

import {
  workerMapper,
} from "@/firebase/mappers/workerMapper";

import type {
  WorkerCardData,
} from "@/components/customer/worker/types";

import {
  calculateDistance,
} from "@/utils/location/calculateDistance";

import {
  calculateArrivalTime,
} from "@/utils/location/calculateArrivalTime";

/* ============================================================
   TYPES
============================================================ */

type Worker = {
  id: string;

  name: string;

  service: string;

  rating: number;

  distance: number | null;

  arrivalTime: string;

  online: boolean;

  image: string;

  phoneNumber: string;
};

type UserLocation = {
  latitude: number;

  longitude: number;
};

/* ============================================================
   CONSTANTS
============================================================ */

const MAX_DISTANCE_KM = 50;

const HOME_WORKER_LIMIT = 5;

const WORKER_CARD_WIDTH = 170;

const WORKER_CARD_GAP = 12;

const WORKER_SNAP_INTERVAL =
  WORKER_CARD_WIDTH +
  WORKER_CARD_GAP;

const WORKER_REFRESH_INTERVAL =
  10_000;

/* ============================================================
   HELPERS
============================================================ */

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/* ============================================================
   URL HELPERS
============================================================ */

function isHttpUrl(
  value: string,
): boolean {
  return (
    value.startsWith(
      "https://",
    ) ||
    value.startsWith(
      "http://",
    )
  );
}

function isLocalImageUri(
  value: string,
): boolean {
  return (
    value.startsWith(
      "file://",
    ) ||
    value.startsWith(
      "content://",
    )
  );
}

function isGsUrl(
  value: string,
): boolean {
  return value.startsWith(
    "gs://",
  );
}

/* ============================================================
   RESOLVE WORKER IMAGE
============================================================ */

/**
 * Converts Firebase Storage references into
 * an Image-compatible HTTPS URL.
 *
 * IMPORTANT:
 *
 * file:// and content:// are NEVER returned.
 *
 * Those paths belong to the worker's local
 * device and cannot be displayed reliably
 * on the customer's device.
 */
async function resolveWorkerImage(
  source: unknown,
): Promise<string> {
  const value =
    cleanString(source);

  if (!value) {
    return "";
  }

  /* ==========================================================
     HTTPS / HTTP
  ========================================================== */

  if (
    isHttpUrl(value)
  ) {
    return value;
  }

  /* ==========================================================
     LOCAL EXPO IMAGE
  ========================================================== */

  if (
    isLocalImageUri(value)
  ) {
    if (__DEV__) {
      console.warn(
        "WORKER_LOCAL_IMAGE_REJECTED:",
        value,
      );
    }

    return "";
  }

  /* ==========================================================
     GS:// FIREBASE STORAGE URL
  ========================================================== */

  if (
    isGsUrl(value)
  ) {
    try {
      const storage =
        getStorage();

      const storageRef =
        ref(
          storage,
          value,
        );

      const downloadUrl =
        await getDownloadURL(
          storageRef,
        );

      if (
        isHttpUrl(
          downloadUrl,
        )
      ) {
        return downloadUrl;
      }

      return "";
    } catch (error) {
      console.warn(
        "WORKER_GS_IMAGE_RESOLVE_ERROR:",
        {
          source: value,
          error,
        },
      );

      return "";
    }
  }

  /*
   * Firebase Storage path without
   * gs:// prefix.
   *
   * Example:
   *
   * workerProfiles/UID/profile.jpg
   */

  try {
    const storage =
      getStorage();

    const storageRef =
      ref(
        storage,
        value,
      );

    const downloadUrl =
      await getDownloadURL(
        storageRef,
      );

    if (
      isHttpUrl(
        downloadUrl,
      )
    ) {
      return downloadUrl;
    }
  } catch {
    /*
     * Unknown value.
     *
     * Do not allow it into Image.
     */
  }

  return "";
}

/* ============================================================
   WORKER NAME
============================================================ */

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

  const firstName =
    cleanString(
      worker.firstName,
    );

  const surname =
    cleanString(
      worker.surname,
    );

  return (
    [
      firstName,
      surname,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "Worker"
  );
}

/* ============================================================
   WORKER SERVICE
============================================================ */

function getWorkerService(
  worker: WorkerCardData,
): string {
  const subcategory =
    cleanString(
      worker.subcategory,
    );

  if (subcategory) {
    return subcategory;
  }

  const category =
    cleanString(
      worker.category,
    );

  if (category) {
    return category;
  }

  const firstService =
    worker.services?.[0]?.name;

  if (
    typeof firstService ===
      "string" &&
    firstService.trim()
  ) {
    return firstService.trim();
  }

  return "Service Provider";
}

/* ============================================================
   WORKER PHONE
============================================================ */

function getWorkerPhone(
  worker: WorkerCardData,
): string {
  return cleanString(
    worker.workerProfile
      ?.phoneNumber,
  );
}

/* ============================================================
   ARRIVAL
============================================================ */

function getWorkerArrivalTime(
  distance: number | null,
): string {
  if (
    distance === null ||
    !Number.isFinite(distance)
  ) {
    return "Nearby";
  }

  return calculateArrivalTime(
    distance,
  );
}

/* ============================================================
   CALL WORKER MODAL
============================================================ */

function CallWorkerModal({
  visible,
  worker,
  onCancel,
  onConfirm,
}: {
  visible: boolean;

  worker: Worker | null;

  onCancel: () => void;

  onConfirm: () => void;
}) {
  if (!worker) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={
        onCancel
      }
    >
      <View
        style={
          styles.callModalOverlay
        }
      >
        <View
          style={
            styles.callModal
          }
        >
          <View
            style={
              styles.callModalIcon
            }
          >
            <Ionicons
              name="call-outline"
              size={34}
              color="#2563EB"
            />
          </View>

          <AppText
            weight="bold"
            style={
              styles.callModalTitle
            }
          >
            Call {worker.name}?
          </AppText>

          <AppText
            style={
              styles.callModalDescription
            }
          >
            {worker.name} is
            available for contact.
          </AppText>

          <AppText
            style={
              styles.callModalQuestion
            }
          >
            Do you want to call this
            worker?
          </AppText>

          <View
            style={
              styles.callModalActions
            }
          >
            <Pressable
              onPress={
                onCancel
              }
              style={({
                pressed,
              }) => [
                styles.callModalCancel,

                pressed &&
                  styles.callModalPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Cancel call"
            >
              <AppText
                weight="bold"
                style={
                  styles.callModalCancelText
                }
              >
                Cancel
              </AppText>
            </Pressable>

            <Pressable
              onPress={
                onConfirm
              }
              style={({
                pressed,
              }) => [
                styles.callModalConfirm,

                pressed &&
                  styles.callModalConfirmPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Call ${worker.name}`}
            >
              <Ionicons
                name="call-outline"
                size={18}
                color="#FFFFFF"
              />

              <AppText
                weight="bold"
                style={
                  styles.callModalConfirmText
                }
              >
                Call Worker
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ============================================================
   COMPONENT
============================================================ */

export default function ContactWorkers() {
  /* ==========================================================
     WORKERS
  ========================================================== */

  const [
    workers,
    setWorkers,
  ] = useState<Worker[]>([]);

  /* ==========================================================
     LOADING
  ========================================================== */

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  /* ==========================================================
     AUTH
  ========================================================== */

  const [
    currentUser,
    setCurrentUser,
  ] = useState<User | null>(
    getAuth().currentUser,
  );

  /* ==========================================================
     PENDING WORKER
  ========================================================== */

  const [
    pendingWorker,
    setPendingWorker,
  ] = useState<Worker | null>(
    null,
  );

  /* ==========================================================
     SELECTED WORKER
  ========================================================== */

  const [
    selectedWorker,
    setSelectedWorker,
  ] = useState<Worker | null>(
    null,
  );

  /* ==========================================================
     AUTH REF
  ========================================================== */

  const pendingWorkerRef =
    useRef<Worker | null>(
      null,
    );

  useEffect(() => {
    pendingWorkerRef.current =
      pendingWorker;
  }, [
    pendingWorker,
  ]);

  /* ==========================================================
     CUSTOMER LOCATION
  ========================================================== */

  const loadCustomerLocation =
    useCallback(
      async (): Promise<
        UserLocation | null
      > => {
        try {
          const {
            status,
          } =
            await Location.requestForegroundPermissionsAsync();

          if (
            status !==
            Location.PermissionStatus.GRANTED
          ) {
            return null;
          }

          const location =
            await Location.getCurrentPositionAsync(
              {
                accuracy:
                  Location.Accuracy.Balanced,
              },
            );

          const {
            latitude,
            longitude,
          } =
            location.coords;

          if (
            !Number.isFinite(
              latitude,
            ) ||
            !Number.isFinite(
              longitude,
            )
          ) {
            return null;
          }

          return {
            latitude,
            longitude,
          };
        } catch (locationError) {
          console.error(
            "HOME_WORKER_LOCATION_ERROR:",
            locationError,
          );

          return null;
        }
      },
      [],
    );

  /* ==========================================================
     MAP WORKER
  ========================================================== */

  const mapWorker =
    useCallback(
      (
        document: Parameters<
          typeof workerMapper
        >[0],
        customerLocation:
          | UserLocation
          | null,
      ): Worker | null => {
        try {
          const mapped =
            workerMapper(
              document,
            );

          /* ==================================================
             LOCATION
          ================================================== */

          const latitude =
            mapped.workerProfile
              ?.latitude;

          const longitude =
            mapped.workerProfile
              ?.longitude;

          let distance:
            | number
            | null = null;

          if (
            customerLocation &&
            typeof latitude ===
              "number" &&
            typeof longitude ===
              "number" &&
            Number.isFinite(
              latitude,
            ) &&
            Number.isFinite(
              longitude,
            )
          ) {
            distance =
              calculateDistance(
                customerLocation.latitude,
                customerLocation.longitude,
                latitude,
                longitude,
              );

            if (
              !Number.isFinite(
                distance,
              )
            ) {
              distance = null;
            }
          }

          /* ==================================================
             DISTANCE FILTER
          ================================================== */

          if (
            distance !== null &&
            distance >
              MAX_DISTANCE_KM
          ) {
            return null;
          }

          /* ==================================================
             IMAGE SOURCE
          ================================================== */

          const imageSource =
            cleanString(
              mapped.workerProfile
                ?.photoUrl,
            );

          /*
           * Do NOT put the source directly
           * into Image.
           *
           * resolveWorkerImage() will make
           * sure it is a usable URL.
           */

          if (__DEV__) {
            console.log(
              "HOME_WORKER_IMAGE_SOURCE:",
              {
                workerId:
                  mapped.id,

                workerName:
                  mapped.fullName,

                imageSource,
              },
            );
          }

          return {
            id:
              mapped.id,

            name:
              getWorkerName(
                mapped,
              ),

            service:
              getWorkerService(
                mapped,
              ),

            rating:
              Math.min(
                5,
                Math.max(
                  0,
                  Number.isFinite(
                    mapped.rating,
                  )
                    ? mapped.rating
                    : 0,
                ),
              ),

            distance,

            arrivalTime:
              getWorkerArrivalTime(
                distance,
              ),

            online:
              mapped.online ===
              true,

            /*
             * Temporary source.
             *
             * It will be resolved in
             * loadWorkers().
             */
            image:
              imageSource,

            phoneNumber:
              getWorkerPhone(
                mapped,
              ),
          };
        } catch (mappingError) {
          console.error(
            "HOME_WORKER_MAPPING_ERROR:",
            mappingError,
          );

          return null;
        }
      },
      [],
    );

  /* ==========================================================
     LOAD WORKERS
  ========================================================== */

  const loadWorkers =
    useCallback(
      async (
        options?: {
          silent?: boolean;
        },
      ) => {
        const silent =
          options?.silent === true;

        try {
          if (!silent) {
            setLoading(true);
            setError(null);
          }

          const [
            workerSnapshot,
            customerLocation,
          ] =
            await Promise.all([
              getPublicWorkers(),
              loadCustomerLocation(),
            ]);

          /* ==================================================
             MAP
          ================================================== */

          const rawWorkers: Worker[] =
            [];

          for (
            const document of
              workerSnapshot.docs
          ) {
            const worker =
              mapWorker(
                document,
                customerLocation,
              );

            if (!worker) {
              continue;
            }

            rawWorkers.push(
              worker,
            );
          }

          /* ==================================================
             RESOLVE IMAGES
          ================================================== */

          const resolvedWorkers =
            await Promise.all(
              rawWorkers.map(
                async (
                  worker,
                ) => {
                  const image =
                    await resolveWorkerImage(
                      worker.image,
                    );

                  return {
                    ...worker,
                    image,
                  };
                },
              ),
            );

          /* ==================================================
             SORT
          ================================================== */

          resolvedWorkers.sort(
            (a, b) => {
              /*
               * Online workers first.
               */

              if (
                a.online !==
                b.online
              ) {
                return a.online
                  ? -1
                  : 1;
              }

              /*
               * Nearest workers next.
               */

              if (
                a.distance !==
                  null &&
                b.distance !==
                  null
              ) {
                return (
                  a.distance -
                  b.distance
                );
              }

              if (
                a.distance !==
                null
              ) {
                return -1;
              }

              if (
                b.distance !==
                null
              ) {
                return 1;
              }

              /*
               * Finally name.
               */

              return a.name.localeCompare(
                b.name,
              );
            },
          );

          /* ==================================================
             SAVE
          ================================================== */

          setWorkers(
            resolvedWorkers,
          );

          /* ==================================================
             DEBUG
          ================================================== */

          if (__DEV__) {
            console.log(
              "HOME_WORKERS_LOADED:",
              resolvedWorkers.map(
                (worker) => ({
                  id:
                    worker.id,

                  name:
                    worker.name,

                  image:
                    worker.image,

                  hasImage:
                    Boolean(
                      worker.image,
                    ),

                  online:
                    worker.online,
                }),
              ),
            );
          }
        } catch (loadError) {
          console.error(
            "LOAD_HOME_PUBLIC_WORKERS_ERROR:",
            loadError,
          );

          if (!silent) {
            setWorkers([]);

            setError(
              "Unable to load workers. Please try again.",
            );
          }
        } finally {
          if (!silent) {
            setLoading(false);
          }
        }
      },
      [
        loadCustomerLocation,
        mapWorker,
      ],
    );

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    void loadWorkers();
  }, [
    loadWorkers,
  ]);

  /* ==========================================================
     AUTO REFRESH
  ========================================================== */

  useEffect(() => {
    const interval =
      setInterval(() => {
        void loadWorkers({
          silent: true,
        });
      }, WORKER_REFRESH_INTERVAL);

    return () => {
      clearInterval(
        interval,
      );
    };
  }, [
    loadWorkers,
  ]);

  /* ==========================================================
     AUTH LISTENER
  ========================================================== */

  useEffect(() => {
    const auth =
      getAuth();

    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user) => {
          setCurrentUser(user);

          /*
           * If login completed while a worker
           * was waiting, open that worker.
           */

          const pending =
            pendingWorkerRef.current;

          if (
            user &&
            pending
          ) {
            setSelectedWorker(
              pending,
            );

            setPendingWorker(
              null,
            );

            pendingWorkerRef.current =
              null;
          }
        },
      );

    return unsubscribe;
  }, []);

  /* ==========================================================
     FIRST FIVE
  ========================================================== */

  const homeWorkers =
    useMemo(
      () =>
        workers.slice(
          0,
          HOME_WORKER_LIMIT,
        ),
      [workers],
    );

  /* ==========================================================
     CONTACT WORKER
  ========================================================== */

  const handleWorkerPress =
    useCallback(
      (worker: Worker) => {
        const auth =
          getAuth();

        if (!auth.currentUser) {
          pendingWorkerRef.current =
            worker;

          setPendingWorker(
            worker,
          );

          return;
        }

        setSelectedWorker(
          worker,
        );
      },
      [],
    );

  /* ==========================================================
     CLOSE LOGIN
  ========================================================== */

  const handleCloseLogin =
    useCallback(() => {
      pendingWorkerRef.current =
        null;

      setPendingWorker(
        null,
      );
    }, []);

  /* ==========================================================
     CLOSE CALL
  ========================================================== */

  const handleCloseCall =
    useCallback(() => {
      setSelectedWorker(
        null,
      );
    }, []);

  /* ==========================================================
     CONFIRM CALL
  ========================================================== */

  const handleConfirmCall =
    useCallback(async () => {
      if (!selectedWorker) {
        return;
      }

      const auth =
        getAuth();

      if (!auth.currentUser) {
        pendingWorkerRef.current =
          selectedWorker;

        setPendingWorker(
          selectedWorker,
        );

        setSelectedWorker(
          null,
        );

        return;
      }

      const phone =
        selectedWorker.phoneNumber.trim();

      if (!phone) {
        Alert.alert(
          "Phone unavailable",
          "This worker does not have a contact number available yet.",
        );

        return;
      }

      try {
        const phoneUrl =
          `tel:${phone}`;

        const supported =
          await Linking.canOpenURL(
            phoneUrl,
          );

        if (!supported) {
          Alert.alert(
            "Unable to call",
            "Your device cannot make phone calls.",
          );

          return;
        }

        setSelectedWorker(
          null,
        );

        await Linking.openURL(
          phoneUrl,
        );
      } catch (callError) {
        console.error(
          "HOME_WORKER_CALL_ERROR:",
          callError,
        );

        Alert.alert(
          "Unable to call",
          "We couldn't start the call. Please try again.",
        );
      }
    }, [
      selectedWorker,
    ]);

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="small"
          color="#2563EB"
        />

        <AppText
          style={
            styles.loadingText
          }
        >
          Finding workers near you...
        </AppText>
      </View>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (error) {
    return (
      <View
        style={
          styles.errorContainer
        }
      >
        <View
          style={
            styles.errorIcon
          }
        >
          <Ionicons
            name="alert-circle-outline"
            size={28}
            color="#EF4444"
          />
        </View>

        <AppText
          weight="bold"
          style={
            styles.errorTitle
          }
        >
          Unable to load workers
        </AppText>

        <AppText
          center
          style={
            styles.errorText
          }
        >
          {error}
        </AppText>

        <Pressable
          onPress={() =>
            void loadWorkers()
          }
          style={({ pressed }) => [
            styles.retryButton,

            pressed &&
              styles.retryPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Retry loading workers"
        >
          <Ionicons
            name="refresh-outline"
            size={18}
            color="#FFFFFF"
          />

          <AppText
            weight="bold"
            style={
              styles.retryText
            }
          >
            Try Again
          </AppText>
        </Pressable>
      </View>
    );
  }

  /* ==========================================================
     MAIN
  ========================================================== */

  return (
    <View
      style={
        styles.container
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
        <AppText
          weight="bold"
          style={
            styles.title
          }
        >
          Contact Worker Nearby You
        </AppText>

        <Pressable
          onPress={() =>
            router.push(
              "/(customer)/contact-worker/contact",
            )
          }
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="View all contact workers"
        >
          <AppText
            weight="bold"
            style={
              styles.seeAll
            }
          >
            See All
          </AppText>
        </Pressable>
      </View>

      {/* ======================================================
          EMPTY
      ====================================================== */}

      {homeWorkers.length ===
      0 ? (
        <View
          style={
            styles.emptyContainer
          }
        >
          <View
            style={
              styles.emptyIcon
            }
          >
            <Ionicons
              name="people-outline"
              size={30}
              color="#94A3B8"
            />
          </View>

          <AppText
            weight="bold"
            style={
              styles.emptyTitle
            }
          >
            No workers available
          </AppText>

          <AppText
            center
            style={
              styles.emptyText
            }
          >
            There are currently no
            workers available near
            you.
          </AppText>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.workerScrollContent
          }
          decelerationRate="fast"
          snapToInterval={
            WORKER_SNAP_INTERVAL
          }
          snapToAlignment="start"
          directionalLockEnabled
          bounces
        >
          {homeWorkers.map(
            (
              worker,
              index,
            ) => (
              <AppCard
                key={
                  worker.id
                }
                style={[
                  styles.card,

                  index ===
                    homeWorkers.length -
                      1 &&
                    styles.cardLast,
                ]}
              >
                {/* ==================================================
                    IMAGE
                ================================================== */}

                <View
                  style={
                    styles.imageContainer
                  }
                >
                  {worker.image ? (
                    <Image
                      source={{
                        uri: worker.image,
                      }}
                      style={
                        styles.image
                      }
                      resizeMode="cover"
                      onError={(event) => {
                        /*
                         * Do not throw an error.
                         *
                         * The worker card will remain
                         * visible and the image can fall
                         * back to the placeholder.
                         */

                        console.warn(
                          "HOME_WORKER_IMAGE_LOAD_FAILED:",
                          {
                            workerId:
                              worker.id,

                            workerName:
                              worker.name,

                            image:
                              worker.image,

                            error:
                              event
                                .nativeEvent
                                .error,
                          },
                        );

                        setWorkers(
                          (
                            current,
                          ) =>
                            current.map(
                              (
                                item,
                              ) =>
                                item.id ===
                                worker.id
                                  ? {
                                      ...item,

                                      image:
                                        "",
                                    }
                                  : item,
                            ),
                        );
                      }}
                    />
                  ) : (
                    <View
                      style={
                        styles.imagePlaceholder
                      }
                    >
                      <Ionicons
                        name="person"
                        size={34}
                        color="#94A3B8"
                      />
                    </View>
                  )}

                  <View
                    style={[
                      styles.online,
                      {
                        backgroundColor:
                          worker.online
                            ? "#22C55E"
                            : "#9CA3AF",
                      },
                    ]}
                  />
                </View>

                {/* ==================================================
                    NAME
                ================================================== */}

                <AppText
                  weight="bold"
                  numberOfLines={1}
                  style={
                    styles.name
                  }
                >
                  {worker.name}
                </AppText>

                {/* ==================================================
                    SERVICE
                ================================================== */}

                <AppText
                  numberOfLines={1}
                  style={
                    styles.service
                  }
                >
                  {worker.service}
                </AppText>

                {/* ==================================================
                    RATING
                ================================================== */}

                <View
                  style={
                    styles.ratingRow
                  }
                >
                  <Ionicons
                    name="star"
                    size={13}
                    color="#F59E0B"
                  />

                  <AppText
                    style={
                      styles.rating
                    }
                  >
                    {worker.rating >
                    0
                      ? worker.rating.toFixed(
                          1,
                        )
                      : "New"}
                  </AppText>
                </View>

                {/* ==================================================
                    ARRIVAL
                ================================================== */}

                <AppText
                  style={
                    styles.arrivalTime
                  }
                >
                  {worker.arrivalTime}
                </AppText>

                {/* ==================================================
                    CONTACT
                ================================================== */}

                <Pressable
                  onPress={() =>
                    handleWorkerPress(
                      worker,
                    )
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.callButton,

                    pressed &&
                      styles.callButtonPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Contact ${worker.name}`}
                >
                  <Ionicons
                    name="call-outline"
                    size={17}
                    color="#FFFFFF"
                  />

                  <AppText
                    weight="bold"
                    style={
                      styles.callText
                    }
                  >
                    Contact
                  </AppText>
                </Pressable>
              </AppCard>
            ),
          )}
        </ScrollView>
      )}

      {/* ======================================================
          LOGIN REQUIRED
      ====================================================== */}

      <AuthRequiredModal
        visible={
          !!pendingWorker &&
          !currentUser
        }
        title="Login required"
        description="You can browse workers freely. Login or create an account to contact a worker."
        onClose={
          handleCloseLogin
        }
      />

      {/* ======================================================
          CALL CONFIRMATION
      ====================================================== */}

      <CallWorkerModal
        visible={
          !!selectedWorker &&
          !!currentUser
        }
        worker={
          selectedWorker
        }
        onCancel={
          handleCloseCall
        }
        onConfirm={
          handleConfirmCall
        }
      />
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      marginBottom: 24,
    },

    /* ========================================================
       LOADING
    ======================================================== */

    loadingContainer: {
      minHeight: 140,

      alignItems: "center",

      justifyContent: "center",

      marginBottom: 24,
    },

    loadingText: {
      marginTop: 8,

      fontSize: 13,

      color: "#64748B",
    },

    /* ========================================================
       ERROR
    ======================================================== */

    errorContainer: {
      alignItems: "center",

      justifyContent: "center",

      paddingVertical: 30,

      paddingHorizontal: 20,

      marginBottom: 24,
    },

    errorIcon: {
      width: 56,

      height: 56,

      borderRadius: 18,

      backgroundColor: "#FEF2F2",

      alignItems: "center",

      justifyContent: "center",
    },

    errorTitle: {
      marginTop: 12,

      fontSize: 16,

      color: "#111827",
    },

    errorText: {
      marginTop: 5,

      fontSize: 13,

      lineHeight: 20,

      color: "#64748B",

      textAlign: "center",
    },

    retryButton: {
      marginTop: 16,

      height: 44,

      paddingHorizontal: 18,

      borderRadius: 13,

      backgroundColor: "#2563EB",

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

      gap: 7,
    },

    retryPressed: {
      opacity: 0.8,

      transform: [
        {
          scale: 0.98,
        },
      ],
    },

    retryText: {
      fontSize: 13,

      color: "#FFFFFF",
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection: "row",

      justifyContent: "space-between",

      alignItems: "center",

      marginBottom: 14,
    },

    title: {
      flex: 1,

      marginRight: 12,

      fontSize: 18,

      color: "#111827",
    },

    seeAll: {
      color: "#2563EB",

      fontSize: 13,
    },

    /* ========================================================
       WORKER SCROLL
    ======================================================== */

    workerScrollContent: {
      paddingRight: 20,
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      width: WORKER_CARD_WIDTH,

      marginRight:
        WORKER_CARD_GAP,

      padding: 14,

      alignItems: "center",

      borderRadius: 20,
    },

    cardLast: {
      marginRight: 0,
    },

    /* ========================================================
       IMAGE
    ======================================================== */

    imageContainer: {
      width: 72,

      height: 72,

      position: "relative",
    },

    image: {
      width: 72,

      height: 72,

      borderRadius: 36,

      backgroundColor: "#E2E8F0",
    },

    imagePlaceholder: {
      width: 72,

      height: 72,

      borderRadius: 36,

      backgroundColor: "#E2E8F0",

      alignItems: "center",

      justifyContent: "center",
    },

    /* ========================================================
       ONLINE
    ======================================================== */

    online: {
      position: "absolute",

      right: 1,

      bottom: 1,

      width: 15,

      height: 15,

      borderRadius: 8,

      borderWidth: 2,

      borderColor: "#FFFFFF",
    },

    /* ========================================================
       NAME
    ======================================================== */

    name: {
      width: "100%",

      marginTop: 10,

      fontSize: 15,

      color: "#111827",

      textAlign: "center",
    },

    /* ========================================================
       SERVICE
    ======================================================== */

    service: {
      width: "100%",

      marginTop: 3,

      fontSize: 12,

      color: "#64748B",

      textAlign: "center",
    },

    /* ========================================================
       RATING
    ======================================================== */

    ratingRow: {
      flexDirection: "row",

      alignItems: "center",

      marginTop: 8,
    },

    rating: {
      marginLeft: 4,

      fontSize: 12,

      color: "#111827",
    },

    /* ========================================================
       ARRIVAL
    ======================================================== */

    arrivalTime: {
      marginTop: 3,

      fontSize: 12,

      color: "#94A3B8",

      textAlign: "center",
    },

    /* ========================================================
       CONTACT
    ======================================================== */

    callButton: {
      marginTop: 12,

      width: "100%",

      height: 40,

      borderRadius: 12,

      backgroundColor: "#F97316",

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

      gap: 6,
    },

    callButtonPressed: {
      opacity: 0.82,

      transform: [
        {
          scale: 0.98,
        },
      ],
    },

    callText: {
      color: "#FFFFFF",

      fontSize: 13,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyContainer: {
      alignItems: "center",

      paddingVertical: 28,

      paddingHorizontal: 24,
    },

    emptyIcon: {
      width: 62,

      height: 62,

      borderRadius: 20,

      backgroundColor: "#F1F5F9",

      alignItems: "center",

      justifyContent: "center",
    },

    emptyTitle: {
      marginTop: 12,

      fontSize: 16,

      color: "#111827",
    },

    emptyText: {
      marginTop: 5,

      fontSize: 13,

      lineHeight: 19,

      color: "#64748B",
    },

    /* ========================================================
       CALL MODAL
    ======================================================== */

    callModalOverlay: {
      flex: 1,

      backgroundColor:
        "rgba(15, 23, 42, 0.52)",

      alignItems: "center",

      justifyContent: "center",

      paddingHorizontal: 24,
    },

    callModal: {
      width: "100%",

      maxWidth: 430,

      backgroundColor: "#FFFFFF",

      borderRadius: 28,

      paddingTop: 28,

      paddingHorizontal: 26,

      paddingBottom: 24,

      shadowColor: "#000000",

      shadowOffset: {
        width: 0,

        height: 12,
      },

      shadowOpacity: 0.22,

      shadowRadius: 24,

      elevation: 12,
    },

    callModalIcon: {
      width: 76,

      height: 76,

      borderRadius: 22,

      backgroundColor: "#EFF6FF",

      alignItems: "center",

      justifyContent: "center",

      alignSelf: "center",

      marginBottom: 22,
    },

    callModalTitle: {
      fontSize: 23,

      lineHeight: 29,

      color: "#111827",

      textAlign: "center",
    },

    callModalDescription: {
      marginTop: 12,

      fontSize: 15,

      lineHeight: 22,

      color: "#64748B",

      textAlign: "center",
    },

    callModalQuestion: {
      marginTop: 8,

      fontSize: 15,

      lineHeight: 22,

      color: "#64748B",

      textAlign: "center",
    },

    callModalActions: {
      marginTop: 26,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "space-between",

      gap: 12,
    },

    callModalCancel: {
      flex: 1,

      height: 52,

      borderRadius: 14,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor: "#F8FAFC",
    },

    callModalCancelText: {
      fontSize: 14,

      color: "#64748B",
    },

    callModalConfirm: {
      flex: 1.35,

      height: 52,

      borderRadius: 14,

      backgroundColor: "#2563EB",

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

      gap: 8,
    },

    callModalConfirmText: {
      fontSize: 14,

      color: "#FFFFFF",
    },

    callModalPressed: {
      opacity: 0.7,
    },

    callModalConfirmPressed: {
      opacity: 0.85,

      transform: [
        {
          scale: 0.98,
        },
      ],
    },
  });