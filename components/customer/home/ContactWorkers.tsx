import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  Image,
} from "expo-image";

import {
  router,
} from "expo-router";

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
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

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

  imageSource: string;

  image: string;
};

type UserLocation = {
  latitude: number;

  longitude: number;
};

type LoadWorkerOptions = {
  silent?: boolean;

  refreshLocation?: boolean;
};

/* ============================================================
   CONSTANTS
============================================================ */

const MAX_DISTANCE_KM =
  50;

const HOME_WORKER_LIMIT =
  5;

const WORKER_CARD_WIDTH =
  170;

const WORKER_CARD_GAP =
  FixxamTokens.spacing.md;

const WORKER_SNAP_INTERVAL =
  WORKER_CARD_WIDTH +
  WORKER_CARD_GAP;

const WORKER_REFRESH_INTERVAL =
  30_000;

/* ============================================================
   HELPERS
============================================================ */

function cleanString(
  value: unknown,
): string {
  return typeof value ===
    "string"
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

async function resolveWorkerImage(
  source: unknown,
): Promise<string> {
  const value =
    cleanString(
      source,
    );

  if (
    !value
  ) {
    return "";
  }

  /* ==========================================================
     HTTP / HTTPS
  ========================================================== */

  if (
    isHttpUrl(
      value,
    )
  ) {
    return value;
  }

  /* ==========================================================
     LOCAL DEVICE IMAGE
  ========================================================== */

  if (
    isLocalImageUri(
      value,
    )
  ) {
    if (
      __DEV__
    ) {
      console.warn(
        "WORKER_LOCAL_IMAGE_REJECTED:",
        value,
      );
    }

    return "";
  }

  /* ==========================================================
     FIREBASE STORAGE
  ========================================================== */

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

    return isHttpUrl(
      downloadUrl,
    )
      ? downloadUrl
      : "";
  } catch (
    error
  ) {
    if (
      __DEV__ &&
      isGsUrl(
        value,
      )
    ) {
      console.warn(
        "WORKER_IMAGE_RESOLVE_ERROR:",
        {
          source:
            value,

          error,
        },
      );
    }

    return "";
  }
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

  if (
    fullName
  ) {
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
      .filter(
        Boolean,
      )
      .join(
        " ",
      )
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

  if (
    subcategory
  ) {
    return subcategory;
  }

  const category =
    cleanString(
      worker.category,
    );

  if (
    category
  ) {
    return category;
  }

  const firstService =
    cleanString(
      worker.services?.[0]
        ?.name,
    );

  return (
    firstService ||
    "Service Provider"
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
    !Number.isFinite(
      distance,
    )
  ) {
    return "Distance unavailable";
  }

  return calculateArrivalTime(
    distance,
  );
}

/* ============================================================
   CALL MODAL
============================================================ */

type CallWorkerModalProps = {
  visible: boolean;

  worker:
    | Worker
    | null;

  onCancel: () => void;

  onConfirm: () => void;
};

const CallWorkerModal =
  memo(
    function CallWorkerModal({
      visible,
      worker,
      onCancel,
      onConfirm,
    }: CallWorkerModalProps) {
      if (
        !worker
      ) {
        return null;
      }

      return (
        <Modal
          visible={
            visible
          }
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
              accessibilityViewIsModal
              style={
                styles.callModal
              }
            >
              <View
                style={
                  styles.callModalIcon
                }
              >
                <AppIcon
                  name="phone"
                  role="customer"
                  size="xl"
                  color={
                    CustomerColors.primary
                  }
                />
              </View>

              <AppText
                variant="heading2"
                weight="bold"
                center
                style={
                  styles.callModalTitle
                }
              >
                Call {worker.name}?
              </AppText>

              <AppText
                variant="body"
                tone="secondary"
                center
                style={
                  styles.callModalDescription
                }
              >
                Start an in-app voice call with {worker.name}.
              </AppText>

              <AppText
                variant="body"
                tone="secondary"
                center
                style={
                  styles.callModalQuestion
                }
              >
                You&apos;ll stay inside Fixxam and the worker&apos;s phone number won&apos;t be shown.
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
                  accessibilityRole="button"
                  accessibilityLabel="Cancel call"
                  style={({
                    pressed,
                  }) => [
                    styles.callModalCancel,

                    pressed
                      ? styles.pressed
                      : null,
                  ]}
                >
                  <AppText
                    variant="body"
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
                  accessibilityRole="button"
                  accessibilityLabel={`Call ${worker.name}`}
                  style={({
                    pressed,
                  }) => [
                    styles.callModalConfirm,

                    pressed
                      ? styles.pressed
                      : null,
                  ]}
                >
                  <AppIcon
                    name="phone"
                    role="customer"
                    size="xs"
                    color={
                      Colors.textInverse
                    }
                  />

                  <AppText
                    variant="body"
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
    },
  );

/* ============================================================
   WORKER CARD
============================================================ */

type WorkerHomeCardProps = {
  worker: Worker;

  onContact: (
    worker: Worker,
  ) => void;

  onProfile: (
    worker: Worker,
  ) => void;

  onImageError: (
    worker: Worker,
  ) => void;
};

const WorkerHomeCard =
  memo(
    function WorkerHomeCard({
      worker,
      onContact,
      onProfile,
      onImageError,
    }: WorkerHomeCardProps) {
      const handleContact =
        useCallback(() => {
          onContact(
            worker,
          );
        }, [
          onContact,
          worker,
        ]);

      const handleProfile =
        useCallback(() => {
          onProfile(
            worker,
          );
        }, [
          onProfile,
          worker,
        ]);

      const handleImageError =
        useCallback(() => {
          onImageError(
            worker,
          );
        }, [
          onImageError,
          worker,
        ]);

      return (
        <AppCard
          role="customer"
          style={
            styles.card
          }
        >
          {/* ==================================================
              PROFILE AREA
          ================================================== */}

          <Pressable
            onPress={
              handleProfile
            }
            accessibilityRole="button"
            accessibilityLabel={`View ${worker.name} profile`}
            style={({
              pressed,
            }) => [
              styles.profileArea,

              pressed
                ? styles.profileAreaPressed
                : null,
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
                    uri:
                      worker.image,
                  }}
                  style={
                    styles.image
                  }
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={150}
                  accessibilityLabel={`${worker.name} profile photo`}
                  onError={
                    handleImageError
                  }
                />
              ) : (
                <View
                  style={
                    styles.imagePlaceholder
                  }
                >
                  <AppIcon
                    name="profile"
                    role="customer"
                    size="lg"
                    state="muted"
                  />
                </View>
              )}

              <View
                accessible
                accessibilityLabel={
                  worker.online
                    ? "Worker online"
                    : "Worker offline"
                }
                style={[
                  styles.online,

                  worker.online
                    ? styles.onlineActive
                    : styles.onlineOffline,
                ]}
              />
            </View>

            {/* ==================================================
                NAME
            ================================================== */}

            <AppText
              variant="bodyMedium"
              weight="bold"
              numberOfLines={1}
              center
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
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              center
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
              <AppIcon
                name="star"
                role="customer"
                size="xs"
                color={
                  Colors.warning
                }
              />

              <AppText
                variant="caption"
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
              variant="caption"
              tone="secondary"
              center
              numberOfLines={1}
              style={
                styles.arrivalTime
              }
            >
              {worker.arrivalTime}
            </AppText>
          </Pressable>

          {/* ==================================================
              CONTACT
          ================================================== */}

          <Pressable
            onPress={
              handleContact
            }
            accessibilityRole="button"
            accessibilityLabel={`Contact ${worker.name}`}
            style={({
              pressed,
            }) => [
              styles.callButton,

              pressed
                ? styles.pressed
                : null,
            ]}
          >
            <AppIcon
              name="phone"
              role="customer"
              size="xs"
              color={
                Colors.textInverse
              }
            />

            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.callText
              }
            >
              Contact
            </AppText>
          </Pressable>
        </AppCard>
      );
    },
  );

/* ============================================================
   SEPARATOR
============================================================ */

function WorkerSeparator() {
  return (
    <View
      style={
        styles.workerSeparator
      }
    />
  );
}

/* ============================================================
   COMPONENT
============================================================ */

export default function ContactWorkers() {
  const [
    workers,
    setWorkers,
  ] =
    useState<
      Worker[]
    >(
      [],
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  /* ==========================================================
     AUTH
  ========================================================== */

  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<
      User | null
    >(
      getAuth()
        .currentUser,
    );

  /* ==========================================================
     PENDING WORKER
  ========================================================== */

  const [
    pendingWorker,
    setPendingWorker,
  ] =
    useState<
      Worker | null
    >(
      null,
    );

  const pendingWorkerRef =
    useRef<
      Worker | null
    >(
      null,
    );

  /* ==========================================================
     SELECTED WORKER
  ========================================================== */

  const [
    selectedWorker,
    setSelectedWorker,
  ] =
    useState<
      Worker | null
    >(
      null,
    );

  /* ==========================================================
     LOCATION CACHE
  ========================================================== */

  const customerLocationRef =
    useRef<
      UserLocation | null
    >(
      null,
    );

  const locationCheckedRef =
    useRef(
      false,
    );

  /* ==========================================================
     IMAGE CACHE
  ========================================================== */

  const imageCacheRef =
    useRef(
      new Map<
        string,
        string
      >(),
    );

  /* ==========================================================
     PENDING REF
  ========================================================== */

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
      async (
        force =
          false,
      ): Promise<
        UserLocation | null
      > => {
        if (
          !force &&
          locationCheckedRef.current
        ) {
          return customerLocationRef.current;
        }

        locationCheckedRef.current =
          true;

        try {
          const {
            status,
          } =
            await Location.requestForegroundPermissionsAsync();

          if (
            status !==
            Location.PermissionStatus.GRANTED
          ) {
            customerLocationRef.current =
              null;

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

          const validCoordinates =
            Number.isFinite(
              latitude,
            ) &&
            latitude >=
              -90 &&
            latitude <=
              90 &&
            Number.isFinite(
              longitude,
            ) &&
            longitude >=
              -180 &&
            longitude <=
              180;

          if (
            !validCoordinates
          ) {
            customerLocationRef.current =
              null;

            return null;
          }

          const nextLocation: UserLocation =
            {
              latitude,
              longitude,
            };

          customerLocationRef.current =
            nextLocation;

          return nextLocation;
        } catch (
          locationError
        ) {
          console.error(
            "HOME_WORKER_LOCATION_ERROR:",
            locationError,
          );

          customerLocationRef.current =
            null;

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

          const latitude =
            mapped.workerProfile
              ?.latitude;

          const longitude =
            mapped.workerProfile
              ?.longitude;

          let distance:
            | number
            | null =
            null;

          const validWorkerLocation =
            typeof latitude ===
              "number" &&
            Number.isFinite(
              latitude,
            ) &&
            latitude >=
              -90 &&
            latitude <=
              90 &&
            typeof longitude ===
              "number" &&
            Number.isFinite(
              longitude,
            ) &&
            longitude >=
              -180 &&
            longitude <=
              180;

          if (
            customerLocation &&
            validWorkerLocation
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
              ) ||
              distance <
                0
            ) {
              distance =
                null;
            }
          }

          if (
            distance !==
              null &&
            distance >
              MAX_DISTANCE_KM
          ) {
            return null;
          }

          const imageSource =
            cleanString(
              mapped.workerProfile
                ?.photoUrl,
            );

          const ratingValue =
            typeof mapped.rating ===
              "number" &&
            Number.isFinite(
              mapped.rating,
            )
              ? mapped.rating
              : 0;

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
                  ratingValue,
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

            imageSource,

            image:
              "",
          };
        } catch (
          mappingError
        ) {
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
     RESOLVE CACHED IMAGE
  ========================================================== */

  const resolveCachedWorkerImage =
    useCallback(
      async (
        source: string,
      ): Promise<string> => {
        if (
          !source
        ) {
          return "";
        }

        const cached =
          imageCacheRef.current.get(
            source,
          );

        if (
          cached
        ) {
          return cached;
        }

        const image =
          await resolveWorkerImage(
            source,
          );

        if (
          image
        ) {
          imageCacheRef.current.set(
            source,
            image,
          );
        }

        return image;
      },
      [],
    );

  /* ==========================================================
     LOAD WORKERS
  ========================================================== */

  const loadWorkers =
    useCallback(
      async (
        options?:
          LoadWorkerOptions,
      ) => {
        const silent =
          options?.silent ===
          true;

        try {
          if (
            !silent
          ) {
            setLoading(
              true,
            );

            setError(
              null,
            );
          }

          const [
            workerSnapshot,
            customerLocation,
          ] =
            await Promise.all([
              getPublicWorkers(),

              loadCustomerLocation(
                options
                  ?.refreshLocation ===
                  true,
              ),
            ]);

          const rawWorkers:
            Worker[] =
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

            if (
              worker
            ) {
              rawWorkers.push(
                worker,
              );
            }
          }

          const resolvedWorkers =
            await Promise.all(
              rawWorkers.map(
                async (
                  worker,
                ) => {
                  const image =
                    await resolveCachedWorkerImage(
                      worker.imageSource,
                    );

                  return {
                    ...worker,
                    image,
                  };
                },
              ),
            );

          resolvedWorkers.sort(
            (
              a,
              b,
            ) => {
              if (
                a.online !==
                b.online
              ) {
                return a.online
                  ? -1
                  : 1;
              }

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

              return a.name.localeCompare(
                b.name,
              );
            },
          );

          setWorkers(
            resolvedWorkers,
          );

          if (
            __DEV__
          ) {
            console.log(
              "HOME_WORKERS_LOADED:",
              resolvedWorkers.map(
                (
                  worker,
                ) => ({
                  id:
                    worker.id,

                  name:
                    worker.name,

                  online:
                    worker.online,

                  distance:
                    worker.distance,

                  hasImage:
                    Boolean(
                      worker.image,
                    ),
                }),
              ),
            );
          }
        } catch (
          loadError
        ) {
          console.error(
            "LOAD_HOME_PUBLIC_WORKERS_ERROR:",
            loadError,
          );

          if (
            !silent
          ) {
            setWorkers(
              [],
            );

            setError(
              "Unable to load workers. Please try again.",
            );
          }
        } finally {
          if (
            !silent
          ) {
            setLoading(
              false,
            );
          }
        }
      },
      [
        loadCustomerLocation,
        mapWorker,
        resolveCachedWorkerImage,
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
      setInterval(
        () => {
          void loadWorkers({
            silent:
              true,
          });
        },
        WORKER_REFRESH_INTERVAL,
      );

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
        (
          user,
        ) => {
          setCurrentUser(
            user,
          );

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

          if (
            !user
          ) {
            setSelectedWorker(
              null,
            );
          }
        },
      );

    return unsubscribe;
  }, []);

  /* ==========================================================
     HOME WORKERS
  ========================================================== */

  const homeWorkers =
    useMemo(
      () =>
        workers.slice(
          0,
          HOME_WORKER_LIMIT,
        ),
      [
        workers,
      ],
    );

  /* ==========================================================
     OPEN WORKER PROFILE
  ========================================================== */

  const handleWorkerProfile =
    useCallback(
      (
        worker: Worker,
      ) => {
        const workerId =
          cleanString(
            worker.id,
          );

        if (
          !workerId
        ) {
          return;
        }

        router.push({
          pathname:
            "/(customer)/details/worker-profile/[id]",

          params: {
            id:
              workerId,
          },
        });
      },
      [],
    );

  /* ==========================================================
     CONTACT WORKER
  ========================================================== */

  const handleWorkerPress =
    useCallback(
      (
        worker: Worker,
      ) => {
        const auth =
          getAuth();

        if (
          !auth.currentUser
        ) {
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
     IMAGE ERROR
  ========================================================== */

  const handleImageError =
    useCallback(
      (
        worker: Worker,
      ) => {
        if (
          __DEV__
        ) {
          console.warn(
            "HOME_WORKER_IMAGE_LOAD_FAILED:",
            {
              workerId:
                worker.id,

              image:
                worker.image,
            },
          );
        }

        if (
          worker.imageSource
        ) {
          imageCacheRef.current.delete(
            worker.imageSource,
          );
        }

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
      },
      [],
    );

  /* ==========================================================
     LOGIN MODAL
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
     CALL MODAL
  ========================================================== */

  const handleCloseCall =
    useCallback(() => {
      setSelectedWorker(
        null,
      );
    }, []);

  /* ==========================================================
     CONFIRM IN-APP CALL
  ========================================================== */

  const handleConfirmCall =
    useCallback(() => {
      if (
        !selectedWorker
      ) {
        return;
      }

      const auth =
        getAuth();

      if (
        !auth.currentUser
      ) {
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

      const worker =
        selectedWorker;

      setSelectedWorker(
        null,
      );

      router.push({
        pathname:
          "/(customer)/call/[workerId]",

        params: {
          workerId:
            worker.id,

          name:
            worker.name,

          service:
            worker.service,

          image:
            worker.image,

          rating:
            String(
              worker.rating,
            ),
        },
      });
    }, [
      selectedWorker,
    ]);

  /* ==========================================================
     RETRY
  ========================================================== */

  const handleRetry =
    useCallback(() => {
      void loadWorkers({
        refreshLocation:
          true,
      });
    }, [
      loadWorkers,
    ]);

  /* ==========================================================
     SEE ALL
  ========================================================== */

  const handleSeeAll =
    useCallback(() => {
      router.push(
        "/(customer)/contact-worker/contact",
      );
    }, []);

  /* ==========================================================
     RENDER WORKER
  ========================================================== */

  const renderWorker =
    useCallback(
      ({
        item,
      }: {
        item: Worker;
      }) => (
        <WorkerHomeCard
          worker={
            item
          }
          onContact={
            handleWorkerPress
          }
          onProfile={
            handleWorkerProfile
          }
          onImageError={
            handleImageError
          }
        />
      ),
      [
        handleImageError,
        handleWorkerPress,
        handleWorkerProfile,
      ],
    );

  /* ==========================================================
     LOADING
  ========================================================== */

  if (
    loading
  ) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="small"
          color={
            CustomerColors.primary
          }
        />

        <AppText
          variant="caption"
          tone="secondary"
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

  if (
    error
  ) {
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
          <AppIcon
            name="error"
            role="customer"
            size="lg"
            color={
              Colors.error
            }
          />
        </View>

        <AppText
          variant="bodyLarge"
          weight="bold"
          style={
            styles.errorTitle
          }
        >
          Unable to load workers
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.errorText
          }
        >
          {error}
        </AppText>

        <Pressable
          onPress={
            handleRetry
          }
          accessibilityRole="button"
          accessibilityLabel="Retry loading workers"
          style={({
            pressed,
          }) => [
            styles.retryButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppIcon
            name="refresh"
            role="customer"
            size="xs"
            color={
              Colors.textInverse
            }
          />

          <AppText
            variant="caption"
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
          variant="heading3"
          weight="bold"
          numberOfLines={1}
          style={
            styles.title
          }
        >
          Contact Workers Near You
        </AppText>

        <Pressable
          onPress={
            handleSeeAll
          }
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="View all contact workers"
          style={({
            pressed,
          }) => [
            styles.seeAllButton,

            pressed
              ? styles.seeAllPressed
              : null,
          ]}
        >
          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.seeAll
            }
          >
            See All
          </AppText>

          <AppIcon
            name="next"
            role="customer"
            size="xs"
            color={
              CustomerColors.primary
            }
          />
        </Pressable>
      </View>

      {/* ======================================================
          EMPTY / LIST
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
            <AppIcon
              name="users"
              role="customer"
              size="lg"
              state="muted"
            />
          </View>

          <AppText
            variant="bodyLarge"
            weight="bold"
            style={
              styles.emptyTitle
            }
          >
            No workers available
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.emptyText
            }
          >
            There are currently no workers available near you.
          </AppText>
        </View>
      ) : (
        <FlatList
          horizontal
          data={
            homeWorkers
          }
          keyExtractor={(
            item,
          ) =>
            item.id
          }
          renderItem={
            renderWorker
          }
          ItemSeparatorComponent={
            WorkerSeparator
          }
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.workerListContent
          }
          initialNumToRender={
            HOME_WORKER_LIMIT
          }
          maxToRenderPerBatch={
            HOME_WORKER_LIMIT
          }
          snapToInterval={
            WORKER_SNAP_INTERVAL
          }
          snapToAlignment="start"
          decelerationRate="fast"
          directionalLockEnabled
          getItemLayout={(
            _,
            index,
          ) => ({
            length:
              WORKER_SNAP_INTERVAL,

            offset:
              WORKER_SNAP_INTERVAL *
              index,

            index,
          })}
        />
      )}

      {/* ======================================================
          LOGIN REQUIRED
      ====================================================== */}

      <AuthRequiredModal
        visible={
          Boolean(
            pendingWorker,
          ) &&
          !currentUser
        }
        title="Login required"
        description="You can browse workers freely. Login or create an account to contact a worker."
        onClose={
          handleCloseLogin
        }
      />

      {/* ======================================================
          IN-APP CALL CONFIRMATION
      ====================================================== */}

      <CallWorkerModal
        visible={
          Boolean(
            selectedWorker,
          ) &&
          Boolean(
            currentUser,
          )
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
      marginBottom:
        FixxamTokens.spacing.xl,
    },

    loadingContainer: {
      minHeight: 140,

      marginBottom:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.sm,
    },

    errorContainer: {
      marginBottom:
        FixxamTokens.spacing.xl,

      paddingVertical:
        FixxamTokens.spacing.xxl,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    errorIcon: {
      width:
        FixxamTokens.size
          .avatarLg,

      height:
        FixxamTokens.size
          .avatarLg,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.errorSoft,
    },

    errorTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    errorText: {
      maxWidth: 300,

      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 20,
    },

    retryButton: {
      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      marginTop:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    retryText: {
      color:
        Colors.textInverse,
    },

    header: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      marginBottom:
        FixxamTokens.spacing.md,
    },

    title: {
      flex: 1,

      minWidth: 0,

      marginRight:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    seeAllButton: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xxs,

      paddingHorizontal:
        FixxamTokens.spacing.xs,
    },

    seeAllPressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    seeAll: {
      color:
        CustomerColors.primary,
    },

    workerListContent: {
      paddingRight:
        FixxamTokens.spacing.lg,
    },

    workerSeparator: {
      width:
        WORKER_CARD_GAP,
    },

    card: {
      width:
        WORKER_CARD_WIDTH,

      padding:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,
    },

    profileArea: {
      width: "100%",

      alignItems:
        "center",
    },

    profileAreaPressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    imageContainer: {
      width:
        FixxamTokens.size
          .avatarXl,

      height:
        FixxamTokens.size
          .avatarXl,

      position:
        "relative",
    },

    image: {
      width: "100%",

      height: "100%",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    imagePlaceholder: {
      width: "100%",

      height: "100%",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    online: {
      position:
        "absolute",

      right: 1,

      bottom: 1,

      width: 15,

      height: 15,

      borderWidth: 2,

      borderColor:
        Colors.surface,

      borderRadius:
        FixxamTokens.radius.full,
    },

    onlineActive: {
      backgroundColor:
        Colors.success,
    },

    onlineOffline: {
      backgroundColor:
        Colors.textMuted,
    },

    name: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    service: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xxs,
    },

    ratingRow: {
      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xxs,
    },

    rating: {
      color:
        Colors.textPrimary,
    },

    arrivalTime: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xxs,
    },

    callButton: {
      width: "100%",

      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      marginTop:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    callText: {
      color:
        Colors.textInverse,
    },

    emptyContainer: {
      alignItems:
        "center",

      paddingVertical:
        FixxamTokens.spacing.xxl,

      paddingHorizontal:
        FixxamTokens.spacing.xl,
    },

    emptyIcon: {
      width: 62,

      height: 62,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.disabledBackground,
    },

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    emptyText: {
      maxWidth: 300,

      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 19,
    },

    callModalOverlay: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.overlayMedium,
    },

    callModal: {
      width: "100%",

      maxWidth: 430,

      paddingTop:
        FixxamTokens.spacing.xl,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingBottom:
        FixxamTokens.spacing.lg,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    callModalIcon: {
      width:
        FixxamTokens.size
          .avatarXl,

      height:
        FixxamTokens.size
          .avatarXl,

      alignSelf:
        "center",

      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom:
        FixxamTokens.spacing.lg,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    callModalTitle: {
      color:
        Colors.textPrimary,
    },

    callModalDescription: {
      marginTop:
        FixxamTokens.spacing.md,

      lineHeight: 22,
    },

    callModalQuestion: {
      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 22,
    },

    callModalActions: {
      marginTop:
        FixxamTokens.spacing.xl,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    callModalCancel: {
      flex: 1,

      minHeight:
        FixxamTokens.size
          .buttonHeight,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        Colors.disabledBackground,
    },

    callModalCancelText: {
      color:
        Colors.textSecondary,
    },

    callModalConfirm: {
      flex: 1.35,

      minHeight:
        FixxamTokens.size
          .buttonHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    callModalConfirmText: {
      color:
        Colors.textInverse,
    },

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