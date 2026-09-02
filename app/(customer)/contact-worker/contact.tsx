import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router } from "expo-router";

import {
  getAuth,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

import * as Location from "expo-location";

import {
  AppCard,
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

/*
 * Flexible public worker shape.
 *
 * This allows the screen to support both:
 *
 * NEW Build Your Profile fields
 * and
 * LEGACY fields.
 */
type FirestoreWorker = WorkerPublicProfile & {
  uid?: string;

  fullName?: string;

  firstName?: string;
  otherName?: string;
  surname?: string;

  name?: string;

  rating?: number;
  online?: boolean;
  available?: boolean;

  phoneNumber?: string;
  phone?: string;
  mobileNumber?: string;

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

    phoneNumber?: string;
    phone?: string;
  };
};

/* ============================================================
   CONSTANTS
============================================================ */

const MAX_DISTANCE_KM = 50;

const PAGE_HORIZONTAL_PADDING = 20;

const WORKER_CARD_RADIUS = 20;

/*
 * Public profile refresh.
 *
 * If worker changes:
 *
 * name
 * photo
 * phone
 * category
 * online
 * location
 *
 * the screen will fetch the latest public profile.
 */
const WORKER_REFRESH_INTERVAL = 10_000;

/* ============================================================
   SAFE STRING
============================================================ */

function cleanString(
  value: unknown,
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

/* ============================================================
   WORKER NAME
============================================================ */

function getWorkerName(
  worker: FirestoreWorker,
): string {
  /*
   * 1. NEW BUILD YOUR PROFILE
   *
   * fullName has highest priority.
   */
  const fullName =
    cleanString(
      worker.fullName,
    );

  if (fullName) {
    return fullName;
  }

  /*
   * 2. LEGACY INDIVIDUAL NAMES
   */
  const individualName = [
    worker.firstName,
    worker.otherName,
    worker.surname,
  ]
    .map(cleanString)
    .filter(Boolean)
    .join(" ")
    .trim();

  if (individualName) {
    return individualName;
  }

  /*
   * 3. LEGACY name
   */
  const legacyName =
    cleanString(
      worker.name,
    );

  if (legacyName) {
    return legacyName;
  }

  return "Worker";
}

/* ============================================================
   WORKER SERVICE
============================================================ */

function getWorkerService(
  worker: FirestoreWorker,
): string {
  /*
   * New editable workerProfile fields.
   */
  const subcategory =
    cleanString(
      worker.workerProfile
        ?.subcategory,
    );

  if (subcategory) {
    return subcategory;
  }

  const category =
    cleanString(
      worker.workerProfile
        ?.category,
    );

  if (category) {
    return category;
  }

  /*
   * Top-level fallback.
   */
  const topSubcategory =
    cleanString(
      worker.subcategory,
    );

  if (topSubcategory) {
    return topSubcategory;
  }

  const topCategory =
    cleanString(
      worker.category,
    );

  if (topCategory) {
    return topCategory;
  }

  return "Service Provider";
}

/* ============================================================
   WORKER IMAGE
============================================================ */

function getWorkerImage(
  worker: FirestoreWorker,
): string {
  /*
   * IMPORTANT:
   *
   * Build Your Profile may save the image
   * using different field names depending
   * on the current/legacy profile structure.
   *
   * Priority:
   *
   * 1. top-level photoURL
   * 2. top-level photoUrl
   * 3. nested workerProfile.photoURL
   * 4. nested workerProfile.photoUrl
   */

  const topPhotoURL =
    cleanString(
      worker.photoURL,
    );

  if (topPhotoURL) {
    return topPhotoURL;
  }

  const topPhotoUrl =
    cleanString(
      worker.photoUrl,
    );

  if (topPhotoUrl) {
    return topPhotoUrl;
  }

  const nestedPhotoURL =
    cleanString(
      worker.workerProfile
        ?.photoURL,
    );

  if (nestedPhotoURL) {
    return nestedPhotoURL;
  }

  const nestedPhotoUrl =
    cleanString(
      worker.workerProfile
        ?.photoUrl,
    );

  if (nestedPhotoUrl) {
    return nestedPhotoUrl;
  }

  return "";
}

/* ============================================================
   WORKER PHONE
============================================================ */

function getWorkerPhone(
  worker: FirestoreWorker,
): string {
  /*
   * Prefer top-level public phone.
   */
  const phoneNumber =
    cleanString(
      worker.phoneNumber,
    );

  if (phoneNumber) {
    return phoneNumber;
  }

  const phone =
    cleanString(
      worker.phone,
    );

  if (phone) {
    return phone;
  }

  const mobileNumber =
    cleanString(
      worker.mobileNumber,
    );

  if (mobileNumber) {
    return mobileNumber;
  }

  /*
   * Legacy nested fallback.
   */
  const nestedPhoneNumber =
    cleanString(
      worker.workerProfile
        ?.phoneNumber,
    );

  if (nestedPhoneNumber) {
    return nestedPhoneNumber;
  }

  const nestedPhone =
    cleanString(
      worker.workerProfile
        ?.phone,
    );

  if (nestedPhone) {
    return nestedPhone;
  }

  return "";
}

/* ============================================================
   ARRIVAL TIME
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

  const hasPhone =
    Boolean(
      worker.phoneNumber.trim(),
    );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
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
              name={
                hasPhone
                  ? "call-outline"
                  : "call-outline"
              }
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
            {hasPhone
              ? `${worker.name} is available for contact.`
              : `${worker.name} has not added a public phone number yet.`}
          </AppText>

          <AppText
            style={
              styles.callModalQuestion
            }
          >
            {hasPhone
              ? "Do you want to call this worker?"
              : "Calling is currently unavailable."}
          </AppText>

          <View
            style={
              styles.callModalActions
            }
          >
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
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
              onPress={onConfirm}
              disabled={!hasPhone}
              style={({ pressed }) => [
                styles.callModalConfirm,

                !hasPhone &&
                  styles.callModalDisabled,

                pressed &&
                  hasPhone &&
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
   SCREEN
============================================================ */

export default function ContactWorkersScreen() {
  /* ==========================================================
     SEARCH
  ========================================================== */

  const [
    search,
    setSearch,
  ] = useState("");

  /* ==========================================================
     WORKERS
  ========================================================== */

  const [
    workers,
    setWorkers,
  ] = useState<Worker[]>([]);

  /* ==========================================================
     AUTH
  ========================================================== */

  const [
    currentUser,
    setCurrentUser,
  ] = useState<User | null>(
    getAuth().currentUser,
  );

  /*
   * Worker selected by guest before login.
   */
  const [
    pendingWorker,
    setPendingWorker,
  ] = useState<Worker | null>(
    null,
  );

  /*
   * Worker currently being called.
   */
  const [
    callWorker,
    setCallWorker,
  ] = useState<Worker | null>(
    null,
  );

  /* ==========================================================
     LOADING
  ========================================================== */

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  /* ==========================================================
     LOCATION
  ========================================================== */

  const [
    locationPermissionDenied,
    setLocationPermissionDenied,
  ] = useState(false);

  /* ==========================================================
     AUTH STATE
  ========================================================== */

  useEffect(() => {
    const firebaseAuth =
      getAuth();

    const unsubscribe =
      onAuthStateChanged(
        firebaseAuth,
        (user) => {
          setCurrentUser(user);

          /*
           * Guest pressed Contact.
           *
           * After successful login,
           * automatically continue.
           */
          if (
            user &&
            pendingWorker
          ) {
            setCallWorker(
              pendingWorker,
            );

            setPendingWorker(
              null,
            );
          }
        },
      );

    return unsubscribe;
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
            setLocationPermissionDenied(
              true,
            );

            return null;
          }

          setLocationPermissionDenied(
            false,
          );

          const location =
            await Location.getCurrentPositionAsync(
              {
                accuracy:
                  Location.Accuracy.Balanced,
              },
            );

          const latitude =
            location.coords.latitude;

          const longitude =
            location.coords.longitude;

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
        } catch (error) {
          console.error(
            "CUSTOMER_LOCATION_ERROR:",
            error,
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
          }

          /*
           * Public workers do not require login.
           */
          const [
            workerSnapshot,
            customerLocation,
          ] =
            await Promise.all([
              getPublicWorkers(),
              loadCustomerLocation(),
            ]);

          const firebaseWorkers: Worker[] =
            [];

          workerSnapshot.forEach(
            (document) => {
              const data =
                document.data() as FirestoreWorker;

              /*
               * Worker must be available.
               */
              if (
                data.available === false
              ) {
                return;
              }

              /*
               * LOCATION
               */
              const latitude =
                typeof data.workerProfile
                  ?.latitude ===
                "number"
                  ? data.workerProfile
                      .latitude
                  : typeof data.latitude ===
                      "number"
                    ? data.latitude
                    : null;

              const longitude =
                typeof data.workerProfile
                  ?.longitude ===
                "number"
                  ? data.workerProfile
                      .longitude
                  : typeof data.longitude ===
                      "number"
                    ? data.longitude
                    : null;

              let distance:
                | number
                | null = null;

              /*
               * Calculate customer → worker distance.
               */
              if (
                customerLocation &&
                latitude !== null &&
                longitude !== null &&
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

                /*
                 * Ignore workers outside
                 * the configured radius.
                 */
                if (
                  distance !== null &&
                  distance >
                    MAX_DISTANCE_KM
                ) {
                  return;
                }
              }

              /*
               * Build current worker object
               * from the latest public document.
               */
              firebaseWorkers.push({
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

                rating:
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
                    : 0,

                distance,

                arrivalTime:
                  getWorkerArrivalTime(
                    distance,
                  ),

                online:
                  data.online ===
                  true,

                /*
                 * IMPORTANT:
                 *
                 * Image now reads both:
                 *
                 * photoURL
                 * photoUrl
                 *
                 * top-level and nested.
                 */
                image:
                  getWorkerImage(
                    data,
                  ),

                phoneNumber:
                  getWorkerPhone(
                    data,
                  ),
              });
            },
          );

          /*
           * Nearest worker first.
           */
          firebaseWorkers.sort(
            (a, b) => {
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
            firebaseWorkers,
          );
        } catch (error) {
          console.error(
            "LOAD_CONTACT_WORKERS_ERROR:",
            error,
          );

          if (!silent) {
            Alert.alert(
              "Unable to load workers",
              "We couldn't load workers right now. Please try again.",
            );
          }
        } finally {
          if (!silent) {
            setLoading(false);
          }

          setRefreshing(false);
        }
      },
      [
        loadCustomerLocation,
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
     AUTOMATIC PROFILE REFRESH
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
     MANUAL REFRESH
  ========================================================== */

  const handleRefresh =
    useCallback(async () => {
      setRefreshing(true);

      await loadWorkers();
    }, [
      loadWorkers,
    ]);

  /* ==========================================================
     SEARCH
  ========================================================== */

  const filteredWorkers =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return workers;
      }

      return workers.filter(
        (worker) =>
          worker.name
            .toLowerCase()
            .includes(query) ||
          worker.service
            .toLowerCase()
            .includes(query),
      );
    }, [
      search,
      workers,
    ]);

  /* ==========================================================
     CONTACT WORKER
  ========================================================== */

  const handleContactPress =
    useCallback(
      (worker: Worker) => {
        /*
         * Always check Firebase Auth directly.
         */
        const firebaseAuth =
          getAuth();

        if (
          !firebaseAuth.currentUser
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

  /* ==========================================================
     CLOSE CALL MODAL
  ========================================================== */

  const handleCloseCallModal =
    useCallback(() => {
      setCallWorker(
        null,
      );
    }, []);

  /* ==========================================================
     NORMALIZE PHONE
  ========================================================== */

  const normalizePhoneNumber =
    useCallback(
      (
        value: string,
      ): string => {
        let phone =
          value.trim();

        if (!phone) {
          return "";
        }

        /*
         * Remove spaces, brackets,
         * dashes and other characters.
         */
        phone =
          phone.replace(
            /[^\d+]/g,
            "",
          );

        /*
         * Nigerian local format:
         *
         * 08012345678
         */
        if (
          phone.startsWith(
            "0",
          ) &&
          phone.length === 11
        ) {
          phone =
            `+234${phone.slice(1)}`;
        }

        /*
         * Nigerian international format:
         *
         * 2348012345678
         */
        if (
          phone.startsWith(
            "234",
          ) &&
          !phone.startsWith(
            "+234",
          )
        ) {
          phone =
            `+${phone}`;
        }

        return phone;
      },
      [],
    );

  /* ==========================================================
     CONFIRM CALL
  ========================================================== */

  const handleConfirmCall =
    useCallback(async () => {
      if (!callWorker) {
        return;
      }

      /*
       * Re-check authentication.
       */
      const firebaseAuth =
        getAuth();

      if (
        !firebaseAuth.currentUser
      ) {
        setPendingWorker(
          callWorker,
        );

        setCallWorker(
          null,
        );

        return;
      }

      const phone =
        normalizePhoneNumber(
          callWorker.phoneNumber,
        );

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

        setCallWorker(
          null,
        );

        await Linking.openURL(
          phoneUrl,
        );
      } catch (error) {
        console.error(
          "CALL_WORKER_ERROR:",
          error,
        );

        Alert.alert(
          "Unable to call",
          "We couldn't start the call. Please try again.",
        );
      }
    }, [
      callWorker,
      normalizePhoneNumber,
    ]);

  /* ==========================================================
     CLOSE LOGIN
  ========================================================== */

  const handleCloseLoginModal =
    useCallback(() => {
      setPendingWorker(
        null,
      );
    }, []);

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
          size="large"
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
     MAIN
  ========================================================== */

  return (
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
          style={
            styles.backButton
          }
          onPress={() =>
            router.back()
          }
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color="#111827"
          />
        </Pressable>

        <View
          style={
            styles.headerText
          }
        >
          <AppText
            weight="bold"
            style={
              styles.title
            }
          >
            Contact Workers
          </AppText>

          <AppText
            style={
              styles.subtitle
            }
          >
            Easily connect with your favorite worker
            with just a call for better service.
          </AppText>
        </View>
      </View>

      {/* ====================================================
          SEARCH
      ==================================================== */}

      <View
        style={
          styles.searchContainer
        }
      >
        <Ionicons
          name="search-outline"
          size={21}
          color="#94A3B8"
        />

        <TextInput
          value={search}
          onChangeText={
            setSearch
          }
          placeholder="Search workers or services..."
          placeholderTextColor="#94A3B8"
          style={
            styles.searchInput
          }
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Search workers or services"
        />

        {search.length > 0 && (
          <Pressable
            onPress={() =>
              setSearch("")
            }
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Ionicons
              name="close-circle"
              size={20}
              color="#94A3B8"
            />
          </Pressable>
        )}
      </View>

      {/* ====================================================
          LOCATION NOTICE
      ==================================================== */}

      {locationPermissionDenied && (
        <View
          style={
            styles.locationNotice
          }
        >
          <Ionicons
            name="location-outline"
            size={18}
            color="#F59E0B"
          />

          <AppText
            style={
              styles.locationNoticeText
            }
          >
            Location permission is off. Worker
            distances cannot be calculated accurately.
          </AppText>
        </View>
      )}

      {/* ====================================================
          LIST
      ==================================================== */}

      <FlatList
        data={
          filteredWorkers
        }
        keyExtractor={(
          item,
        ) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.list
        }
        columnWrapperStyle={
          styles.row
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              handleRefresh
            }
            tintColor="#2563EB"
          />
        }
        renderItem={({
          item,
        }) => (
          <AppCard
            style={
              styles.card
            }
          >
            {/* ==================================================
                IMAGE
            ================================================== */}

            <View
              style={
                styles.imageContainer
              }
            >
              {item.image ? (
                <Image
                  source={{
                    uri: item.image,
                  }}
                  style={
                    styles.image
                  }
                  resizeMode="cover"
                  onError={() => {
                    /*
                     * Image error is intentionally
                     * not shown to the customer.
                     *
                     * Placeholder remains visually
                     * safe if the remote image fails.
                     */
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
                      item.online
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
              {item.name}
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
              {item.service}
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
                {item.rating >
                0
                  ? item.rating.toFixed(
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
                styles.distance
              }
            >
              {item.arrivalTime}
            </AppText>

            {/* ==================================================
                CONTACT
            ================================================== */}

            <Pressable
              style={({
                pressed,
              }) => [
                styles.callButton,
                pressed &&
                  styles.callButtonPressed,
              ]}
              onPress={() =>
                handleContactPress(
                  item,
                )
              }
              accessibilityRole="button"
              accessibilityLabel={`Contact ${item.name}`}
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
        )}
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
              <Ionicons
                name="people-outline"
                size={42}
                color="#94A3B8"
              />
            </View>

            <AppText
              weight="bold"
              style={
                styles.emptyTitle
              }
            >
              No Workers Found
            </AppText>

            <AppText
              center
              style={
                styles.emptyText
              }
            >
              {search.trim()
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
          !!pendingWorker &&
          !currentUser
        }
        title="Login required"
        description="You can browse workers freely. Login or create an account to contact a worker."
        onClose={
          handleCloseLoginModal
        }
      />

      {/* ====================================================
          CALL CONFIRMATION
      ==================================================== */}

      <CallWorkerModal
        visible={
          !!callWorker &&
          !!currentUser
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
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#F8FAFC",
    },

    header: {
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingHorizontal:
        PAGE_HORIZONTAL_PADDING,
      paddingTop: 16,
      paddingBottom: 18,
    },

    backButton: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
      justifyContent:
        "center",
      shadowColor:
        "#000000",
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      elevation: 2,
    },

    headerText: {
      flex: 1,
      marginLeft: 14,
    },

    title: {
      fontSize: 25,
      color: "#111827",
    },

    subtitle: {
      marginTop: 4,
      fontSize: 13,
      lineHeight: 19,
      color: "#64748B",
    },

    searchContainer: {
      height: 48,
      marginHorizontal:
        PAGE_HORIZONTAL_PADDING,
      marginBottom: 14,
      paddingHorizontal: 16,
      borderRadius: 24,
      backgroundColor:
        "#FFFFFF",
      flexDirection:
        "row",
      alignItems:
        "center",
      shadowColor:
        "#000000",
      shadowOpacity: 0.05,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      elevation: 2,
    },

    searchInput: {
      flex: 1,
      marginLeft: 9,
      fontSize: 14,
      color: "#111827",
      paddingVertical: 0,
    },

    locationNotice: {
      marginHorizontal:
        PAGE_HORIZONTAL_PADDING,
      marginBottom: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor:
        "#FFFBEB",
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    locationNoticeText: {
      flex: 1,
      marginLeft: 8,
      fontSize: 12,
      lineHeight: 17,
      color: "#92400E",
    },

    loadingContainer: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal: 30,
      backgroundColor:
        "#F8FAFC",
    },

    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: "#64748B",
    },

    list: {
      paddingHorizontal:
        PAGE_HORIZONTAL_PADDING,
      paddingTop: 4,
      paddingBottom: 40,
    },

    row: {
      justifyContent:
        "space-between",
      marginBottom: 14,
    },

    card: {
      width: "48.2%",
      padding: 14,
      alignItems:
        "center",
      borderRadius:
        WORKER_CARD_RADIUS,
    },

    imageContainer: {
      position: "relative",
    },

    image: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor:
        "#E2E8F0",
    },

    imagePlaceholder: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor:
        "#E2E8F0",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    online: {
      position: "absolute",
      right: 1,
      bottom: 1,
      width: 15,
      height: 15,
      borderRadius: 8,
      borderWidth: 2,
      borderColor:
        "#FFFFFF",
    },

    name: {
      width: "100%",
      marginTop: 10,
      fontSize: 15,
      color: "#111827",
      textAlign:
        "center",
    },

    service: {
      width: "100%",
      marginTop: 3,
      fontSize: 12,
      color: "#64748B",
      textAlign:
        "center",
    },

    ratingRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginTop: 8,
    },

    rating: {
      marginLeft: 4,
      fontSize: 12,
      color: "#111827",
    },

    distance: {
      marginTop: 3,
      fontSize: 12,
      color: "#94A3B8",
      textAlign:
        "center",
    },

    callButton: {
      marginTop: 12,
      width: "100%",
      height: 40,
      borderRadius: 12,
      backgroundColor:
        "#F97316",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
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

    empty: {
      alignItems:
        "center",
      paddingHorizontal: 30,
      paddingTop: 90,
    },

    emptyIcon: {
      width: 86,
      height: 86,
      borderRadius: 28,
      backgroundColor:
        "#E2E8F0",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    emptyTitle: {
      marginTop: 16,
      fontSize: 20,
      color: "#111827",
    },

    emptyText: {
      marginTop: 7,
      fontSize: 14,
      lineHeight: 21,
      color: "#64748B",
    },

    /* ========================================================
       CALL MODAL
    ======================================================== */

    callModalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(15, 23, 42, 0.52)",
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal: 24,
    },

    callModal: {
      width: "100%",
      maxWidth: 430,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 28,
      paddingTop: 28,
      paddingHorizontal: 26,
      paddingBottom: 24,
      shadowColor:
        "#000000",
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
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
      alignSelf:
        "center",
      marginBottom: 22,
    },

    callModalTitle: {
      fontSize: 23,
      lineHeight: 29,
      color: "#111827",
      textAlign:
        "center",
    },

    callModalDescription: {
      marginTop: 12,
      fontSize: 15,
      lineHeight: 22,
      color: "#64748B",
      textAlign:
        "center",
    },

    callModalQuestion: {
      marginTop: 8,
      fontSize: 15,
      lineHeight: 22,
      color: "#64748B",
      textAlign:
        "center",
    },

    callModalActions: {
      marginTop: 26,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      gap: 12,
    },

    callModalCancel: {
      flex: 1,
      height: 52,
      borderRadius: 14,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#F8FAFC",
    },

    callModalCancelText: {
      fontSize: 14,
      color: "#64748B",
    },

    callModalConfirm: {
      flex: 1.35,
      height: 52,
      borderRadius: 14,
      backgroundColor:
        "#2563EB",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 8,
    },

    callModalDisabled: {
      backgroundColor:
        "#CBD5E1",
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