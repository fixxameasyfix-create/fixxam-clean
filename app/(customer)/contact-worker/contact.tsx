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
  Alert,
  FlatList,
  Linking,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { Image } from "expo-image";

import { router } from "expo-router";

import {
  getAuth,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

import * as Location from "expo-location";

import {
  AppCard,
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import AuthRequiredModal from "@/components/auth/AuthRequiredModal";

import {
  getPublicWorkers,
  type WorkerPublicProfile,
} from "@/firebase/queries/workerPublicProfiles";

import {
  calculateDistance,
} from "@/utils/location/calculateDistance";

import {
  calculateArrivalTime,
} from "@/utils/location/calculateArrivalTime";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
  Typography,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Worker = {
  id: string;

  name: string;

  service: string;

  rating: number;

  distance: number | null;

  arrivalTime: string;

  online: boolean;

  image: string;
};

type UserLocation = {
  latitude: number;

  longitude: number;
};

type FirestoreWorker =
  WorkerPublicProfile & {
    uid?: string;

    fullName?: string;

    firstName?: string;

    otherName?: string;

    surname?: string;

    name?: string;

    rating?: number;

    online?: boolean;

    available?: boolean;

    photoURL?: string;

    photoUrl?: string;

    category?: string;

    subcategory?: string;

    latitude?: number | null;

    longitude?: number | null;

    workerProfile?: {
      category?: string;

      subcategory?: string;

      photoUrl?: string;

      photoURL?: string;

      latitude?: number | null;

      longitude?: number | null;
    };
  };

type LoadWorkersOptions = {
  silent?: boolean;

  refreshLocation?: boolean;
};

type WorkerCardProps = {
  worker: Worker;

  onContact: (
    worker: Worker,
  ) => void;

  onProfile: (
    worker: Worker,
  ) => void;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_DISTANCE_KM =
  50;

const WORKER_REFRESH_INTERVAL =
  60_000;

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value.trim();
}

function normalizeSearch(
  value: string,
): string {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(
      /\s+/g,
      " ",
    );
}

/* ==============================================================
   WORKER NAME
============================================================== */

function getWorkerName(
  worker: FirestoreWorker,
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

  const individualName =
    [
      worker.firstName,
      worker.otherName,
      worker.surname,
    ]
      .map(
        cleanString,
      )
      .filter(
        Boolean,
      )
      .join(
        " ",
      )
      .trim();

  if (
    individualName
  ) {
    return individualName;
  }

  const legacyName =
    cleanString(
      worker.name,
    );

  if (
    legacyName
  ) {
    return legacyName;
  }

  return "Worker";
}

/* ==============================================================
   WORKER SERVICE
============================================================== */

function getWorkerService(
  worker: FirestoreWorker,
): string {
  const nestedSubcategory =
    cleanString(
      worker.workerProfile
        ?.subcategory,
    );

  if (
    nestedSubcategory
  ) {
    return nestedSubcategory;
  }

  const nestedCategory =
    cleanString(
      worker.workerProfile
        ?.category,
    );

  if (
    nestedCategory
  ) {
    return nestedCategory;
  }

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

  return "Service Provider";
}

/* ==============================================================
   WORKER IMAGE
============================================================== */

function getWorkerImage(
  worker: FirestoreWorker,
): string {
  return (
    cleanString(
      worker.photoURL,
    ) ||
    cleanString(
      worker.photoUrl,
    ) ||
    cleanString(
      worker.workerProfile
        ?.photoURL,
    ) ||
    cleanString(
      worker.workerProfile
        ?.photoUrl,
    )
  );
}

/* ==============================================================
   WORKER COORDINATES
============================================================== */

function getWorkerCoordinates(
  worker: FirestoreWorker,
): UserLocation | null {
  const latitude =
    typeof worker
      .workerProfile
      ?.latitude ===
      "number"
      ? worker.workerProfile
          .latitude
      : typeof worker.latitude ===
          "number"
        ? worker.latitude
        : null;

  const longitude =
    typeof worker
      .workerProfile
      ?.longitude ===
      "number"
      ? worker.workerProfile
          .longitude
      : typeof worker.longitude ===
          "number"
        ? worker.longitude
        : null;

  if (
    latitude === null ||
    longitude === null ||
    !Number.isFinite(
      latitude,
    ) ||
    !Number.isFinite(
      longitude,
    ) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return {
    latitude,
    longitude,
  };
}

/* ==============================================================
   ARRIVAL TIME
============================================================== */

function getWorkerArrivalTime(
  distance: number | null,
): string {
  if (
    distance === null ||
    !Number.isFinite(
      distance,
    )
  ) {
    return "Location unavailable";
  }

  return calculateArrivalTime(
    distance,
  );
}

/* ==============================================================
   WORKER AVATAR
============================================================== */

const WorkerAvatar =
  memo(function WorkerAvatar({
    uri,
    online,
  }: {
    uri: string;

    online: boolean;
  }) {
    const [
      imageFailed,
      setImageFailed,
    ] =
      useState(
        false,
      );

    useEffect(() => {
      setImageFailed(
        false,
      );
    }, [
      uri,
    ]);

    const showImage =
      Boolean(
        uri.trim(),
      ) &&
      !imageFailed;

    return (
      <View
        style={
          styles.imageContainer
        }
      >
        {showImage ? (
          <Image
            source={{
              uri,
            }}
            style={
              styles.image
            }
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={150}
            accessibilityLabel="Worker profile photo"
            onError={() => {
              setImageFailed(
                true,
              );
            }}
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
          accessibilityLabel={
            online
              ? "Online"
              : "Offline"
          }
          style={[
            styles.onlineIndicator,

            online
              ? styles.onlineIndicatorActive
              : styles.onlineIndicatorInactive,
          ]}
        />
      </View>
    );
  });

/* ==============================================================
   WORKER CARD
============================================================== */

const WorkerCard =
  memo(function WorkerCard({
    worker,
    onContact,
    onProfile,
  }: WorkerCardProps) {
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

    return (
      <AppCard
        role="customer"
        variant="outlined"
        style={
          styles.card
        }
      >
        {/* ====================================================
            PROFILE AREA
        ==================================================== */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View ${worker.name}'s profile`}
          onPress={
            handleProfile
          }
          style={({
            pressed,
          }) => [
            styles.profileArea,

            pressed
              ? styles.profileAreaPressed
              : null,
          ]}
        >
          <WorkerAvatar
            uri={
              worker.image
            }
            online={
              worker.online
            }
          />

          <AppText
            variant="bodyMedium"
            weight="bold"
            center
            numberOfLines={1}
            style={
              styles.name
            }
          >
            {worker.name}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            center
            numberOfLines={1}
            style={
              styles.service
            }
          >
            {worker.service}
          </AppText>

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

          <AppText
            variant="caption"
            tone="muted"
            center
            numberOfLines={1}
            style={
              styles.distance
            }
          >
            {worker.arrivalTime}
          </AppText>
        </Pressable>

        {/* ====================================================
            CONTACT
        ==================================================== */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Contact ${worker.name}`}
          onPress={
            handleContact
          }
          style={({
            pressed,
          }) => [
            styles.callButton,

            pressed
              ? styles.callButtonPressed
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
            variant="bodyMedium"
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
  });

/* ==============================================================
   CALL WORKER MODAL
============================================================== */

function CallWorkerModal({
  visible,
  worker,
  onCancel,
  onConfirm,
}: {
  visible: boolean;

  worker:
    | Worker
    | null;

  onCancel: () => void;

  onConfirm: () => void;
}) {
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
        <AppCard
          role="customer"
          variant="elevated"
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
              state="active"
            />
          </View>

          <AppText
            variant="heading2"
            weight="bold"
            center
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
            Start an in-app voice call with{" "}
            {worker.name}.
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.callModalQuestion
            }
          >
            You&apos;ll stay inside Fixxam and
            the worker&apos;s phone number
            won&apos;t be shown.
          </AppText>

          <View
            style={
              styles.callModalActions
            }
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel call"
              onPress={
                onCancel
              }
              style={({
                pressed,
              }) => [
                styles.callModalCancel,

                pressed
                  ? styles.callModalPressed
                  : null,
              ]}
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
                tone="secondary"
              >
                Cancel
              </AppText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Call ${worker.name}`}
              onPress={
                onConfirm
              }
              style={({
                pressed,
              }) => [
                styles.callModalConfirm,

                pressed
                  ? styles.callModalConfirmPressed
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
                variant="bodyMedium"
                weight="bold"
                style={
                  styles.callModalConfirmText
                }
              >
                Call Worker
              </AppText>
            </Pressable>
          </View>
        </AppCard>
      </View>
    </Modal>
  );
}

/* ==============================================================
   SCREEN
============================================================== */

export default function ContactWorkersScreen() {
  /* ============================================================
     SEARCH
  ============================================================ */

  const [
    search,
    setSearch,
  ] =
    useState(
      "",
    );

  const [
    searchFocused,
    setSearchFocused,
  ] =
    useState(
      false,
    );

  /* ============================================================
     WORKERS
  ============================================================ */

  const [
    workers,
    setWorkers,
  ] =
    useState<
      Worker[]
    >(
      [],
    );

  /* ============================================================
     AUTH
  ============================================================ */

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

  const [
    pendingWorker,
    setPendingWorker,
  ] =
    useState<
      Worker | null
    >(
      null,
    );

  const [
    callWorker,
    setCallWorker,
  ] =
    useState<
      Worker | null
    >(
      null,
    );

  /* ============================================================
     LOADING
  ============================================================ */

  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(
      false,
    );

  /* ============================================================
     LOCATION
  ============================================================ */

  const [
    locationPermissionDenied,
    setLocationPermissionDenied,
  ] =
    useState(
      false,
    );

  const customerLocationRef =
    useRef<
      UserLocation | null
    >(
      null,
    );

  /* ============================================================
     REQUEST CONTROL
  ============================================================ */

  const requestIdRef =
    useRef(
      0,
    );

  /* ============================================================
     AUTH STATE
  ============================================================ */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        getAuth(),
        (
          user,
        ) => {
          setCurrentUser(
            user,
          );
        },
      );

    return unsubscribe;
  }, []);

  /*
   * Customer selected a worker while
   * signed out. Continue after login.
   */
  useEffect(() => {
    if (
      !currentUser ||
      !pendingWorker
    ) {
      return;
    }

    setCallWorker(
      pendingWorker,
    );

    setPendingWorker(
      null,
    );
  }, [
    currentUser,
    pendingWorker,
  ]);

  /* ============================================================
     CUSTOMER LOCATION
  ============================================================ */

  const loadCustomerLocation =
    useCallback(
      async (
        requestIfNeeded:
          boolean,
      ): Promise<
        UserLocation | null
      > => {
        try {
          let permission =
            await Location.getForegroundPermissionsAsync();

          if (
            !permission.granted &&
            requestIfNeeded &&
            permission.canAskAgain
          ) {
            permission =
              await Location.requestForegroundPermissionsAsync();
          }

          if (
            !permission.granted
          ) {
            setLocationPermissionDenied(
              true,
            );

            customerLocationRef.current =
              null;

            return null;
          }

          setLocationPermissionDenied(
            false,
          );

          const location =
            await Location.getCurrentPositionAsync(
              {
                accuracy:
                  Location.Accuracy
                    .Balanced,
              },
            );

          const latitude =
            location.coords
              .latitude;

          const longitude =
            location.coords
              .longitude;

          if (
            !Number.isFinite(
              latitude,
            ) ||
            !Number.isFinite(
              longitude,
            ) ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
          ) {
            return customerLocationRef.current;
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
          error
        ) {
          console.error(
            "CUSTOMER_LOCATION_ERROR:",
            error,
          );

          return customerLocationRef.current;
        }
      },
      [],
    );

  /* ============================================================
     LOAD WORKERS
  ============================================================ */

  const loadWorkers =
    useCallback(
      async (
        options:
          LoadWorkersOptions = {},
      ) => {
        const {
          silent = false,
          refreshLocation = false,
        } =
          options;

        const requestId =
          ++requestIdRef.current;

        try {
          if (
            !silent
          ) {
            setLoading(
              true,
            );
          }

          const customerLocation =
            refreshLocation
              ? await loadCustomerLocation(
                  true,
                )
              : customerLocationRef.current;

          const workerSnapshot =
            await getPublicWorkers();

          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          const nextWorkers: Worker[] =
            [];

          workerSnapshot.forEach(
            (
              document,
            ) => {
              const data =
                document.data() as FirestoreWorker;

              if (
                data.available ===
                false
              ) {
                return;
              }

              const coordinates =
                getWorkerCoordinates(
                  data,
                );

              let distance:
                | number
                | null =
                null;

              if (
                customerLocation &&
                coordinates
              ) {
                const calculatedDistance =
                  calculateDistance(
                    customerLocation.latitude,
                    customerLocation.longitude,
                    coordinates.latitude,
                    coordinates.longitude,
                  );

                if (
                  Number.isFinite(
                    calculatedDistance,
                  )
                ) {
                  distance =
                    calculatedDistance;
                }

                if (
                  distance !==
                    null &&
                  distance >
                    MAX_DISTANCE_KM
                ) {
                  return;
                }
              }

              const rating =
                typeof data.rating ===
                  "number" &&
                Number.isFinite(
                  data.rating,
                )
                  ? Math.min(
                      5,
                      Math.max(
                        0,
                        data.rating,
                      ),
                    )
                  : 0;

              nextWorkers.push({
                id:
                  cleanString(
                    data.uid,
                  ) ||
                  document.id,

                name:
                  getWorkerName(
                    data,
                  ),

                service:
                  getWorkerService(
                    data,
                  ),

                rating,

                distance,

                arrivalTime:
                  getWorkerArrivalTime(
                    distance,
                  ),

                online:
                  data.online ===
                  true,

                image:
                  getWorkerImage(
                    data,
                  ),
              });
            },
          );

          /* ==================================================
             NEAREST FIRST
          ================================================== */

          nextWorkers.sort(
            (
              a,
              b,
            ) => {
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

              if (
                a.online !==
                b.online
              ) {
                return a.online
                  ? -1
                  : 1;
              }

              return a.name.localeCompare(
                b.name,
              );
            },
          );

          setWorkers(
            nextWorkers,
          );
        } catch (
          error
        ) {
          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          console.error(
            "LOAD_CONTACT_WORKERS_ERROR:",
            error,
          );

          if (
            !silent
          ) {
            Alert.alert(
              "Unable to load workers",
              "We couldn't load workers right now. Please try again.",
            );
          }
        } finally {
          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          if (
            !silent
          ) {
            setLoading(
              false,
            );
          }

          setRefreshing(
            false,
          );
        }
      },
      [
        loadCustomerLocation,
      ],
    );

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    void loadWorkers({
      refreshLocation:
        true,
    });

    return () => {
      requestIdRef.current +=
        1;
    };
  }, [
    loadWorkers,
  ]);

  /* ============================================================
     SILENT PROFILE REFRESH
  ============================================================ */

  useEffect(() => {
    const interval =
      setInterval(
        () => {
          void loadWorkers({
            silent:
              true,

            refreshLocation:
              false,
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

  /* ============================================================
     MANUAL REFRESH
  ============================================================ */

  const handleRefresh =
    useCallback(() => {
      if (
        refreshing
      ) {
        return;
      }

      setRefreshing(
        true,
      );

      void loadWorkers({
        refreshLocation:
          true,
      });
    }, [
      loadWorkers,
      refreshing,
    ]);

  /* ============================================================
     LOCATION PERMISSION ACTION
  ============================================================ */

  const handleLocationPermission =
    useCallback(async () => {
      try {
        const permission =
          await Location.getForegroundPermissionsAsync();

        if (
          !permission.granted &&
          !permission.canAskAgain
        ) {
          await Linking.openSettings();

          return;
        }

        await loadWorkers({
          refreshLocation:
            true,
        });
      } catch (
        error
      ) {
        console.error(
          "LOCATION_PERMISSION_ACTION_ERROR:",
          error,
        );
      }
    }, [
      loadWorkers,
    ]);

  /* ============================================================
     SEARCH
  ============================================================ */

  const normalizedSearch =
    normalizeSearch(
      search,
    );

  const hasSearch =
    normalizedSearch.length >
    0;

  const filteredWorkers =
    useMemo(() => {
      if (
        !normalizedSearch
      ) {
        return workers;
      }

      return workers.filter(
        (
          worker,
        ) =>
          worker.name
            .toLocaleLowerCase()
            .includes(
              normalizedSearch,
            ) ||
          worker.service
            .toLocaleLowerCase()
            .includes(
              normalizedSearch,
            ),
      );
    }, [
      normalizedSearch,
      workers,
    ]);

  /* ============================================================
     OPEN WORKER PROFILE
  ============================================================ */

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

  /* ============================================================
     CONTACT
  ============================================================ */

  const handleContactPress =
    useCallback(
      (
        worker: Worker,
      ) => {
        if (
          !getAuth()
            .currentUser
        ) {
          setPendingWorker(
            worker,
          );

          return;
        }

        setCallWorker(
          worker,
        );
      },
      [],
    );

  /* ============================================================
     CALL MODAL
  ============================================================ */

  const handleCloseCallModal =
    useCallback(() => {
      setCallWorker(
        null,
      );
    }, []);

  /* ============================================================
     CONFIRM IN-APP CALL
  ============================================================ */

  const handleConfirmCall =
    useCallback(() => {
      if (
        !callWorker
      ) {
        return;
      }

      const currentAuthUser =
        getAuth()
          .currentUser;

      if (
        !currentAuthUser
      ) {
        setPendingWorker(
          callWorker,
        );

        setCallWorker(
          null,
        );

        return;
      }

      const worker =
        callWorker;

      setCallWorker(
        null,
      );

      /*
       * No phone number is sent.
       *
       * The in-app call session identifies
       * the worker with workerId.
       */
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
      callWorker,
    ]);

  /* ============================================================
     LOGIN MODAL
  ============================================================ */

  const handleCloseLoginModal =
    useCallback(() => {
      setPendingWorker(
        null,
      );
    }, []);

  /* ============================================================
     CLEAR SEARCH
  ============================================================ */

  const handleClearSearch =
    useCallback(() => {
      setSearch(
        "",
      );
    }, []);

  /* ============================================================
     RENDER ITEM
  ============================================================ */

  const renderWorker =
    useCallback(
      ({
        item,
      }: {
        item: Worker;
      }) => (
        <WorkerCard
          worker={
            item
          }
          onContact={
            handleContactPress
          }
          onProfile={
            handleWorkerProfile
          }
        />
      ),
      [
        handleContactPress,
        handleWorkerProfile,
      ],
    );

  /* ============================================================
     LOADING
  ============================================================ */

  if (
    loading &&
    workers.length ===
      0
  ) {
    return (
      <AppScreen
        role="customer"
        padded={false}
      >
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
            Finding workers near you...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <AppScreen
      role="customer"
      padded={false}
    >
      <View
        style={
          styles.container
        }
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <View
          style={
            styles.header
          }
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            onPress={() =>
              router.back()
            }
            style={({
              pressed,
            }) => [
              styles.backButton,

              pressed
                ? styles.backButtonPressed
                : null,
            ]}
          >
            <AppIcon
              name="back"
              role="customer"
              size="sm"
              state="default"
            />
          </Pressable>

          <View
            style={
              styles.headerText
            }
          >
            <AppText
              variant="heading1"
              weight="bold"
            >
              Contact Workers
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.subtitle
              }
            >
              Find an available worker and start a secure in-app call.
            </AppText>
          </View>
        </View>

        {/* ====================================================
            SEARCH
        ==================================================== */}

        <View
          style={[
            styles.searchContainer,

            searchFocused
              ? styles.searchFocused
              : null,
          ]}
        >
          <AppIcon
            name="search"
            role="customer"
            size="sm"
            state={
              searchFocused
                ? "active"
                : "muted"
            }
          />

          <TextInput
            value={
              search
            }
            onChangeText={
              setSearch
            }
            onFocus={() =>
              setSearchFocused(
                true,
              )
            }
            onBlur={() =>
              setSearchFocused(
                false,
              )
            }
            placeholder="Search workers or services..."
            placeholderTextColor={
              Colors.textMuted
            }
            selectionColor={
              CustomerColors.primary
            }
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Search workers or services"
            style={
              styles.searchInput
            }
          />

          {hasSearch ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={8}
              onPress={
                handleClearSearch
              }
              style={({
                pressed,
              }) => [
                styles.searchAction,

                pressed
                  ? styles.searchActionPressed
                  : null,
              ]}
            >
              <AppIcon
                name="close"
                role="customer"
                size="xs"
                state="muted"
              />
            </Pressable>
          ) : null}
        </View>

        {/* ====================================================
            LOCATION NOTICE
        ==================================================== */}

        {locationPermissionDenied ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enable location access"
            onPress={
              handleLocationPermission
            }
            style={({
              pressed,
            }) => [
              styles.locationNotice,

              pressed
                ? styles.locationNoticePressed
                : null,
            ]}
          >
            <View
              style={
                styles.locationNoticeIcon
              }
            >
              <AppIcon
                name="location"
                role="customer"
                size="xs"
                state="active"
              />
            </View>

            <View
              style={
                styles.locationNoticeContent
              }
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
              >
                Enable location
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.locationNoticeText
                }
              >
                Location helps Fixxam show nearby workers and estimate arrival time.
              </AppText>
            </View>

            <AppIcon
              name="next"
              role="customer"
              size="xs"
              state="muted"
            />
          </Pressable>
        ) : null}

        {/* ====================================================
            LIST
        ==================================================== */}

        <FlatList
          data={
            filteredWorkers
          }
          keyExtractor={(
            item,
          ) =>
            item.id
          }
          renderItem={
            renderWorker
          }
          numColumns={2}
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={
            styles.list
          }
          columnWrapperStyle={
            styles.row
          }
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
          refreshControl={
            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={
                handleRefresh
              }
              tintColor={
                CustomerColors.primary
              }
              colors={[
                CustomerColors.primary,
              ]}
            />
          }
          ListEmptyComponent={
            <View
              style={
                styles.empty
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
                  size="xl"
                  state="muted"
                />
              </View>

              <AppText
                variant="heading2"
                weight="bold"
                center
                style={
                  styles.emptyTitle
                }
              >
                No Workers Found
              </AppText>

              <AppText
                variant="body"
                tone="secondary"
                center
                style={
                  styles.emptyText
                }
              >
                {hasSearch
                  ? "Try searching for another worker or service."
                  : "There are no available workers near you right now."}
              </AppText>
            </View>
          }
        />

        {/* ====================================================
            LOGIN REQUIRED
        ==================================================== */}

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
            handleCloseLoginModal
          }
        />

        {/* ====================================================
            IN-APP CALL CONFIRMATION
        ==================================================== */}

        <CallWorkerModal
          visible={
            Boolean(
              callWorker,
            ) &&
            Boolean(
              currentUser,
            )
          }
          worker={
            callWorker
          }
          onCancel={
            handleCloseCallModal
          }
          onConfirm={
            handleConfirmCall
          }
        />
      </View>
    </AppScreen>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      backgroundColor:
        Colors.background,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingVertical:
        FixxamTokens.spacing.md,
    },

    backButton: {
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

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    backButtonPressed: {
      backgroundColor:
        CustomerColors.primarySoft,

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

    headerText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       SEARCH
    ======================================================== */

    searchContainer: {
      minHeight:
        FixxamTokens.size
          .inputHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginHorizontal:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.md,

      paddingLeft:
        FixxamTokens.spacing.md,

      paddingRight:
        FixxamTokens.spacing.xs,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.search,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    searchFocused: {
      borderColor:
        CustomerColors.primary,
    },

    searchInput: {
      flex: 1,

      minWidth: 0,

      minHeight:
        FixxamTokens.size
          .inputHeight,

      marginLeft:
        FixxamTokens.spacing.sm,

      paddingHorizontal: 0,

      paddingVertical: 0,

      fontSize:
        Typography.fontSize.md,

      color:
        Colors.textPrimary,
    },

    searchAction: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,
    },

    searchActionPressed: {
      backgroundColor:
        CustomerColors.primarySoft,
    },

    /* ========================================================
       LOCATION
    ======================================================== */

    locationNotice: {
      minHeight:
        FixxamTokens.size
          .cardMinHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginHorizontal:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    locationNoticePressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    locationNoticeIcon: {
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
        Colors.surface,
    },

    locationNoticeContent: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.sm,
    },

    locationNoticeText: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       LIST
    ======================================================== */

    list: {
      flexGrow: 1,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.xs,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    row: {
      justifyContent:
        "space-between",

      marginBottom:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       WORKER CARD
    ======================================================== */

    card: {
      width: "48.5%",

      alignItems:
        "center",

      padding:
        FixxamTokens.spacing.md,
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
      position:
        "relative",
    },

    image: {
      width:
        FixxamTokens.size
          .avatarXl,

      height:
        FixxamTokens.size
          .avatarXl,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    imagePlaceholder: {
      width:
        FixxamTokens.size
          .avatarXl,

      height:
        FixxamTokens.size
          .avatarXl,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    onlineIndicator: {
      position:
        "absolute",

      right: 1,

      bottom: 1,

      width: 16,

      height: 16,

      borderWidth: 2,

      borderColor:
        Colors.surface,

      borderRadius:
        FixxamTokens.radius.full,
    },

    onlineIndicatorActive: {
      backgroundColor:
        Colors.success,
    },

    onlineIndicatorInactive: {
      backgroundColor:
        Colors.textMuted,
    },

    name: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.sm,
    },

    service: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xxs,
    },

    ratingRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.sm,
    },

    rating: {
      marginLeft:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textPrimary,
    },

    distance: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       CONTACT
    ======================================================== */

    callButton: {
      width: "100%",

      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      marginTop:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    callButtonPressed: {
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

    callText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    empty: {
      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingTop:
        FixxamTokens.spacing.xxxl,
    },

    emptyIcon: {
      width: 86,

      height: 86,

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
        FixxamTokens.spacing.lg,
    },

    emptyText: {
      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       LOADING
    ======================================================== */

    loadingContainer: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      backgroundColor:
        Colors.background,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       CALL MODAL
    ======================================================== */

    callModalOverlay: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      backgroundColor:
        Colors.overlayMedium,
    },

    callModal: {
      width: "100%",

      maxWidth: 430,

      alignItems:
        "center",

      padding:
        FixxamTokens.spacing.xl,

      ...FixxamTokens.shadow.modal,
    },

    callModalIcon: {
      width:
        FixxamTokens.size
          .avatarXl,

      height:
        FixxamTokens.size
          .avatarXl,

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
      width: "100%",

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.xl,
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
        Colors.background,
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

    callModalPressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    callModalConfirmPressed: {
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