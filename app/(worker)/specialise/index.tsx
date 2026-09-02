import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { router } from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

import * as Location from "expo-location";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
  httpsCallable,
} from "firebase/functions";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  auth,
  db,
  functions,
} from "@/firebase/config";

import {
  getUser,
} from "@/firebase/queries/users";

import ServiceSelectModal, {
  ServiceOption,
} from "@/components/worker/specialise/ServiceSelectModal";

import RequestConfirmationModal from "@/components/worker/specialise/RequestConfirmationModal";

/* ==============================================================
   TYPES
============================================================== */

type Coordinates = {
  latitude: number;
  longitude: number;
};

type SendServiceRequestPayload = {
  service: string;
  location: string;
  phone: string;
  latitude: number;
  longitude: number;
};

type SendServiceRequestResponse = {
  success: boolean;
  sentCount: number;
  customers: Array<{
    id: string;
    distanceKm: number;
  }>;
  message: string;
};

/* ==============================================================
   SERVICES
============================================================== */

const SERVICES: ServiceOption[] = [
  {
    id: "electrical",
    name: "Electrical",
  },
  {
    id: "plumbing",
    name: "Plumbing",
  },
  {
    id: "painting",
    name: "Painting",
  },
  {
    id: "carpentry",
    name: "Carpentry",
  },
  {
    id: "building",
    name: "Building",
  },
  {
    id: "welding",
    name: "Welding",
  },
  {
    id: "tiling",
    name: "Tiling",
  },
  {
    id: "cleaning",
    name: "Cleaning",
  },
];

/* ==============================================================
   HELPERS
============================================================== */

function formatLocation(
  address: Location.LocationGeocodedAddress,
): string {
  const parts = [
    address.district,
    address.subregion,
    address.city,
    address.region,
  ].filter(
    (
      value,
    ): value is string =>
      typeof value === "string" &&
      value.trim().length > 0,
  );

  return Array.from(
    new Set(parts),
  ).join(", ");
}

function normalizePhone(
  value: string,
): string {
  return value
    .replace(/[^\d+]/g, "")
    .slice(0, 15);
}

function buildWorkerName(
  data: Record<string, unknown>,
  authDisplayName?: string | null,
): string {
  const fullName =
    typeof data.fullName === "string"
      ? data.fullName.trim()
      : "";

  if (fullName) {
    return fullName;
  }

  const firstName =
    typeof data.firstName === "string"
      ? data.firstName.trim()
      : "";

  const otherName =
    typeof data.otherName === "string"
      ? data.otherName.trim()
      : "";

  const surname =
    typeof data.surname === "string"
      ? data.surname.trim()
      : "";

  const combinedName = [
    firstName,
    otherName,
    surname,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (combinedName) {
    return combinedName;
  }

  if (
    typeof authDisplayName === "string" &&
    authDisplayName.trim()
  ) {
    return authDisplayName.trim();
  }

  return "";
}

function isValidCoordinates(
  coordinates: Coordinates | null,
): coordinates is Coordinates {
  if (!coordinates) {
    return false;
  }

  return (
    Number.isFinite(
      coordinates.latitude,
    ) &&
    Number.isFinite(
      coordinates.longitude,
    ) &&
    coordinates.latitude >= -90 &&
    coordinates.latitude <= 90 &&
    coordinates.longitude >= -180 &&
    coordinates.longitude <= 180
  );
}

function getCallableErrorMessage(
  error: unknown,
): string {
  if (
    error &&
    typeof error === "object"
  ) {
    const callableError =
      error as {
        code?: unknown;
        message?: unknown;
        details?: unknown;
      };

    if (
      typeof callableError.message ===
        "string" &&
      callableError.message.trim()
    ) {
      return callableError.message;
    }
  }

  return "Something went wrong while sending your request. Please try again.";
}

/* ==============================================================
   SCREEN
============================================================== */

export default function SpecialiseYourMarketScreen() {
  /* ============================================================
     FORM
  ============================================================ */

  const [service, setService] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [coordinates, setCoordinates] =
    useState<Coordinates | null>(
      null,
    );

  /* ============================================================
     WORKER PROFILE
  ============================================================ */

  const [workerName, setWorkerName] =
    useState("");

  const [workerLoading, setWorkerLoading] =
    useState(true);

  /* ============================================================
     UI STATE
  ============================================================ */

  const [showServices, setShowServices] =
    useState(false);

  const [
    showConfirmation,
    setShowConfirmation,
  ] = useState(false);

  const [
    locationLoading,
    setLocationLoading,
  ] = useState(false);

  const [sending, setSending] =
    useState(false);

  /* ============================================================
     SELECTED SERVICE
  ============================================================ */

  const selectedService =
    useMemo(
      () =>
        SERVICES.find(
          (item) =>
            item.id === service,
        ),
      [service],
    );

  /* ============================================================
     LOAD + LISTEN TO WORKER PROFILE
  ============================================================ */

  useEffect(() => {
    let mounted = true;

    let unsubscribePublicProfile:
      | (() => void)
      | undefined;

    const loadWorkerProfile =
      async () => {
        try {
          setWorkerLoading(true);

          await auth.authStateReady();

          const currentUser =
            auth.currentUser;

          if (!currentUser) {
            throw new Error(
              "No authenticated worker found.",
            );
          }

          /* ==================================================
             MAIN USER PROFILE
          ================================================== */

          const userSnapshot =
            await getUser(
              currentUser.uid,
            );

          if (
            !userSnapshot.exists()
          ) {
            throw new Error(
              "Worker profile does not exist.",
            );
          }

          const userData =
            userSnapshot.data() as Record<
              string,
              unknown
            >;

          /*
           * Initial name fallback.
           */

          const initialWorkerName =
            buildWorkerName(
              userData,
              currentUser.displayName,
            );

          /*
           * Initial phone fallback.
           */

          const initialPhone =
            typeof userData.phone ===
            "string"
              ? userData.phone.trim()
              : "";

          if (!mounted) {
            return;
          }

          if (
            initialWorkerName
          ) {
            setWorkerName(
              initialWorkerName,
            );
          }

          if (initialPhone) {
            setPhone(
              normalizePhone(
                initialPhone,
              ),
            );
          }

          /* ==================================================
             PUBLIC WORKER PROFILE REALTIME LISTENER
          ================================================== */

          const publicProfileRef =
            doc(
              db,
              "workerPublicProfiles",
              currentUser.uid,
            );

          unsubscribePublicProfile =
            onSnapshot(
              publicProfileRef,
              (snapshot) => {
                if (!mounted) {
                  return;
                }

                if (
                  !snapshot.exists()
                ) {
                  return;
                }

                const publicData =
                  snapshot.data() as Record<
                    string,
                    unknown
                  >;

                /* ============================================
                   UPDATED NAME
                ============================================ */

                const updatedWorkerName =
                  buildWorkerName(
                    publicData,
                    currentUser.displayName,
                  );

                if (
                  updatedWorkerName
                ) {
                  setWorkerName(
                    updatedWorkerName,
                  );
                }

                /* ============================================
                   UPDATED PHONE
                ============================================ */

                const publicPhone =
                  typeof publicData.phoneNumber ===
                  "string"
                    ? publicData.phoneNumber.trim()
                    : typeof publicData.phone ===
                        "string"
                      ? publicData.phone.trim()
                      : "";

                if (publicPhone) {
                  setPhone(
                    normalizePhone(
                      publicPhone,
                    ),
                  );
                }

                if (__DEV__) {
                  console.log(
                    "FIXXAM_SPECIALISE_PROFILE_UPDATE:",
                    {
                      workerName:
                        updatedWorkerName,
                      phone:
                        publicPhone,
                    },
                  );
                }
              },
              (error) => {
                console.error(
                  "FIXXAM_PUBLIC_PROFILE_LISTENER_ERROR:",
                  error,
                );
              },
            );
        } catch (error) {
          console.error(
            "FIXXAM_LOAD_WORKER_PROFILE_ERROR:",
            error,
          );

          if (!mounted) {
            return;
          }

          setWorkerName("");

          Alert.alert(
            "Profile Error",
            "Unable to load your worker profile. Please try again.",
          );
        } finally {
          if (mounted) {
            setWorkerLoading(
              false,
            );
          }
        }
      };

    loadWorkerProfile();

    return () => {
      mounted = false;

      if (
        unsubscribePublicProfile
      ) {
        unsubscribePublicProfile();
      }
    };
  }, []);

  /* ============================================================
     CURRENT LOCATION
  ============================================================ */

  const handleCurrentLocation =
    useCallback(async () => {
      if (locationLoading) {
        return;
      }

      try {
        setLocationLoading(true);

        const permission =
          await Location.getForegroundPermissionsAsync();

        let status =
          permission.status;

        if (
          status !==
          Location.PermissionStatus.GRANTED
        ) {
          const requested =
            await Location.requestForegroundPermissionsAsync();

          status =
            requested.status;
        }

        if (
          status !==
          Location.PermissionStatus.GRANTED
        ) {
          Alert.alert(
            "Location Permission Required",
            "Please allow Fixxam to access your location.",
          );

          return;
        }

        const enabled =
          await Location.hasServicesEnabledAsync();

        if (!enabled) {
          Alert.alert(
            "Location Is Off",
            "Please turn on your phone location and try again.",
          );

          return;
        }

        const position =
          await Location.getCurrentPositionAsync(
            {
              accuracy:
                Location.Accuracy.Balanced,
            },
          );

        const {
          latitude,
          longitude,
        } = position.coords;

        if (
          !Number.isFinite(
            latitude,
          ) ||
          !Number.isFinite(
            longitude,
          )
        ) {
          throw new Error(
            "Invalid coordinates received from device.",
          );
        }

        setCoordinates({
          latitude,
          longitude,
        });

        let addresses: Location.LocationGeocodedAddress[] =
          [];

        try {
          addresses =
            await Location.reverseGeocodeAsync(
              {
                latitude,
                longitude,
              },
            );
        } catch (geocodeError) {
          console.warn(
            "FIXXAM_REVERSE_GEOCODE_ERROR:",
            geocodeError,
          );
        }

        if (
          addresses.length ===
          0
        ) {
          Alert.alert(
            "GPS Location Detected",
            "Your GPS location was detected, but the address could not be determined. Please enter your service area manually.",
          );

          return;
        }

        const formatted =
          formatLocation(
            addresses[0],
          );

        if (!formatted) {
          Alert.alert(
            "GPS Location Detected",
            "Your GPS location was detected, but the address could not be determined. Please enter your service area manually.",
          );

          return;
        }

        setLocation(
          formatted,
        );
      } catch (error) {
        console.error(
          "FIXXAM_CURRENT_LOCATION_ERROR:",
          error,
        );

        setCoordinates(null);

        Alert.alert(
          "Location Error",
          "Unable to get your current location. Please try again.",
        );
      } finally {
        setLocationLoading(
          false,
        );
      }
    }, [
      locationLoading,
    ]);

  /* ============================================================
     PHONE
  ============================================================ */

  const handlePhoneChange =
    useCallback(
      (value: string) => {
        setPhone(
          normalizePhone(value),
        );
      },
      [],
    );

  /* ============================================================
     CONTINUE
  ============================================================ */

  const handleContinue =
    useCallback(() => {
      const cleanService =
        service.trim();

      const cleanLocation =
        location.trim();

      const cleanPhone =
        phone.trim();

      if (!cleanService) {
        Alert.alert(
          "Service Required",
          "Please enter or select your service.",
        );

        return;
      }

      if (!cleanLocation) {
        Alert.alert(
          "Location Required",
          "Please enter your service area or use current location.",
        );

        return;
      }

      if (
        cleanPhone.length < 10
      ) {
        Alert.alert(
          "Invalid Phone Number",
          "Please enter a valid phone number.",
        );

        return;
      }

      if (!workerName.trim()) {
        Alert.alert(
          "Profile Not Ready",
          "We could not load your worker name. Please try again.",
        );

        return;
      }

      if (
        !isValidCoordinates(
          coordinates,
        )
      ) {
        Alert.alert(
          "Location Required",
          "Please tap 'Use Current Location' so we can find customers near you.",
        );

        return;
      }

      setShowConfirmation(
        true,
      );
    }, [
      service,
      location,
      phone,
      workerName,
      coordinates,
    ]);

  /* ============================================================
     SEND REQUEST
  ============================================================ */

  const handleSendRequest =
    useCallback(async () => {
      if (sending) {
        return;
      }

      const cleanService =
        selectedService?.name ??
        service.trim();

      const cleanLocation =
        location.trim();

      const cleanPhone =
        phone.trim();

      const cleanWorkerName =
        workerName.trim();

      if (
        !isValidCoordinates(
          coordinates,
        )
      ) {
        setShowConfirmation(
          false,
        );

        Alert.alert(
          "Location Required",
          "Please use Current Location before sending the request.",
        );

        return;
      }

      if (
        !cleanService ||
        !cleanLocation ||
        cleanPhone.length < 10 ||
        !cleanWorkerName
      ) {
        setShowConfirmation(
          false,
        );

        Alert.alert(
          "Incomplete Request",
          "Please check your service, location, phone number and worker profile.",
        );

        return;
      }

      try {
        setSending(true);

        await auth.authStateReady();

        const currentUser =
          auth.currentUser;

        if (!currentUser) {
          throw new Error(
            "Worker is not authenticated.",
          );
        }

        const sendRequest =
          httpsCallable<
            SendServiceRequestPayload,
            SendServiceRequestResponse
          >(
            functions,
            "sendServiceRequest",
          );

        const payload: SendServiceRequestPayload =
          {
            service:
              cleanService,

            location:
              cleanLocation,

            phone:
              cleanPhone,

            latitude:
              coordinates.latitude,

            longitude:
              coordinates.longitude,
          };

        if (__DEV__) {
          console.log(
            "FIXXAM_SEND_SERVICE_REQUEST:",
            {
              ...payload,
              workerId:
                currentUser.uid,
            },
          );
        }

        const result =
          await sendRequest(
            payload,
          );

        const response =
          result.data;

        if (__DEV__) {
          console.log(
            "FIXXAM_SERVICE_REQUEST_RESPONSE:",
            response,
          );
        }

        if (
          !response ||
          !response.success ||
          response.sentCount <= 0
        ) {
          setShowConfirmation(
            false,
          );

          Alert.alert(
            "No Customers Found",
            response?.message ||
              "No customers with a valid location were found nearby.",
          );

          return;
        }

        setShowConfirmation(
          false,
        );

        Alert.alert(
          "Request Sent",
          `Your request has been sent to ${response.sentCount} customer${
            response.sentCount ===
            1
              ? ""
              : "s"
          } nearby.`,
          [
            {
              text: "Done",
              onPress: () =>
                router.back(),
            },
          ],
        );

        if (__DEV__) {
          console.log(
            "FIXXAM_SERVICE_REQUEST_SENT:",
            {
              workerId:
                currentUser.uid,

              workerName:
                cleanWorkerName,

              service:
                cleanService,

              location:
                cleanLocation,

              latitude:
                coordinates.latitude,

              longitude:
                coordinates.longitude,

              sentCount:
                response.sentCount,

              customers:
                response.customers,
            },
          );
        }
      } catch (error) {
        console.error(
          "FIXXAM_SEND_REQUEST_ERROR:",
          error,
        );

        const message =
          getCallableErrorMessage(
            error,
          );

        setShowConfirmation(
          false,
        );

        Alert.alert(
          "Request Failed",
          message,
        );
      } finally {
        setSending(false);
      }
    }, [
      sending,
      selectedService,
      service,
      location,
      phone,
      workerName,
      coordinates,
    ]);

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <AppScreen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.container
          }
        >
          {/* ==================================================
              HEADER
          ================================================== */}

          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={10}
              onPress={() =>
                router.back()
              }
              style={({ pressed }) => [
                styles.backButton,
                pressed &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name="arrow-back"
                size={23}
                color="#0F172A"
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
                Specialise Your Market
              </AppText>

              <AppText
                style={
                  styles.subtitle
                }
              >
                Tell customers what you offer.
              </AppText>
            </View>
          </View>

          {/* ==================================================
              SERVICE
          ================================================== */}

          <View
            style={
              styles.fieldSection
            }
          >
            <AppText
              weight="bold"
              style={
                styles.label
              }
            >
              Service
            </AppText>

            <View
              style={
                styles.serviceInput
              }
            >
              <Ionicons
                name="briefcase-outline"
                size={22}
                color="#64748B"
              />

              <TextInput
                value={
                  selectedService?.name ??
                  service
                }
                onChangeText={
                  setService
                }
                placeholder="Enter service"
                placeholderTextColor="#94A3B8"
                autoCapitalize="words"
                style={
                  styles.serviceText
                }
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Select service"
                onPress={() =>
                  setShowServices(
                    true,
                  )
                }
                style={({ pressed }) => [
                  styles.selectButton,
                  pressed &&
                    styles.selectPressed,
                ]}
              >
                <AppText
                  weight="bold"
                  style={
                    styles.selectText
                  }
                >
                  Select
                </AppText>

                <Ionicons
                  name="chevron-down"
                  size={17}
                  color="#FF6B00"
                />
              </Pressable>
            </View>
          </View>

          {/* ==================================================
              LOCATION
          ================================================== */}

          <View
            style={
              styles.fieldSection
            }
          >
            <AppText
              weight="bold"
              style={
                styles.label
              }
            >
              Location
            </AppText>

            <View
              style={
                styles.inputContainer
              }
            >
              <Ionicons
                name="location-outline"
                size={22}
                color="#64748B"
              />

              <TextInput
                value={
                  location
                }
                onChangeText={(
                  value,
                ) => {
                  setLocation(
                    value,
                  );

                  /*
                   * Clear old coordinates when
                   * the location is manually changed.
                   */
                  setCoordinates(
                    null,
                  );
                }}
                placeholder="Enter your service area"
                placeholderTextColor="#94A3B8"
                autoCapitalize="words"
                style={
                  styles.input
                }
              />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Use current location"
              accessibilityState={{
                busy:
                  locationLoading,
              }}
              disabled={
                locationLoading
              }
              onPress={
                handleCurrentLocation
              }
              style={({ pressed }) => [
                styles.currentLocationButton,
                pressed &&
                  !locationLoading &&
                  styles.locationPressed,
                locationLoading &&
                  styles.locationDisabled,
              ]}
            >
              {locationLoading ? (
                <ActivityIndicator
                  size="small"
                  color="#FF6B00"
                />
              ) : (
                <Ionicons
                  name="navigate-outline"
                  size={20}
                  color="#FF6B00"
                />
              )}

              <AppText
                weight="bold"
                style={
                  styles.currentLocationText
                }
              >
                {locationLoading
                  ? "Getting Location..."
                  : "Use Current Location"}
              </AppText>
            </Pressable>

            {coordinates && (
              <View
                style={
                  styles.locationReady
                }
              >
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color="#16A34A"
                />

                <AppText
                  style={
                    styles.locationReadyText
                  }
                >
                  Current location detected
                </AppText>
              </View>
            )}
          </View>

          {/* ==================================================
              PHONE
          ================================================== */}

          <View
            style={
              styles.fieldSection
            }
          >
            <AppText
              weight="bold"
              style={
                styles.label
              }
            >
              Phone Number
            </AppText>

            <View
              style={
                styles.inputContainer
              }
            >
              <Ionicons
                name="call-outline"
                size={22}
                color="#64748B"
              />

              <TextInput
                value={phone}
                onChangeText={
                  handlePhoneChange
                }
                placeholder="080XXXXXXXX"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                maxLength={15}
                style={
                  styles.input
                }
              />
            </View>
          </View>

          {/* ==================================================
              CONTINUE
          ================================================== */}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Continue with service request"
            accessibilityState={{
              disabled:
                sending ||
                workerLoading ||
                locationLoading,
              busy: sending,
            }}
            disabled={
              sending ||
              workerLoading ||
              locationLoading
            }
            onPress={
              handleContinue
            }
            style={({ pressed }) => [
              styles.saveButton,
              pressed &&
                !sending &&
                !workerLoading &&
                !locationLoading &&
                styles.savePressed,
              (sending ||
                workerLoading ||
                locationLoading) &&
                styles.saveDisabled,
            ]}
          >
            {workerLoading ||
            sending ||
            locationLoading ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <Ionicons
                name="arrow-forward-circle-outline"
                size={23}
                color="#FFFFFF"
              />
            )}

            <AppText
              weight="bold"
              style={
                styles.saveText
              }
            >
              {workerLoading
                ? "Loading Profile..."
                : locationLoading
                  ? "Getting Location..."
                  : sending
                    ? "Sending..."
                    : "Continue"}
            </AppText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ========================================================
          SERVICE SELECT MODAL
      ======================================================== */}

      <ServiceSelectModal
        visible={
          showServices
        }
        services={
          SERVICES
        }
        selectedId={
          service
        }
        onSelect={(item) => {
          setService(
            item.id,
          );

          setShowServices(
            false,
          );
        }}
        onClose={() =>
          setShowServices(
            false,
          )
        }
      />

      {/* ========================================================
          REQUEST CONFIRMATION MODAL
      ======================================================== */}

      <RequestConfirmationModal
        visible={
          showConfirmation
        }
        workerName={
          workerName
        }
        service={
          selectedService?.name ??
          service.trim()
        }
        location={
          location.trim()
        }
        phone={
          phone.trim()
        }
        loading={
          sending
        }
        onCancel={() => {
          if (sending) {
            return;
          }

          setShowConfirmation(
            false,
          );
        }}
        onConfirm={
          handleSendRequest
        }
      />
    </AppScreen>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    flex: {
      flex: 1,
    },

    container: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 32,
      backgroundColor: "#F8FAFC",
    },

    /* ==========================================================
       HEADER
    ========================================================== */

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 28,
    },

    backButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 11,

      shadowColor: "#000000",
      shadowOpacity: 0.05,
      shadowRadius: 7,

      shadowOffset: {
        width: 0,
        height: 3,
      },

      elevation: 2,
    },

    headerText: {
      flex: 1,
      minWidth: 0,
    },

    title: {
      fontSize: 24,
      lineHeight: 30,
      color: "#0F172A",
    },

    subtitle: {
      marginTop: 2,
      color: "#64748B",
      fontSize: 13,
    },

    /* ==========================================================
       FIELD
    ========================================================== */

    fieldSection: {
      marginBottom: 24,
    },

    label: {
      fontSize: 15,
      lineHeight: 20,
      color: "#0F172A",
      marginBottom: 9,
    },

    /* ==========================================================
       SERVICE
    ========================================================== */

    serviceInput: {
      minHeight: 62,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: "#E2E8F0",
      backgroundColor: "#FFFFFF",

      flexDirection: "row",
      alignItems: "center",

      paddingLeft: 16,
      paddingRight: 7,
    },

    serviceText: {
      flex: 1,
      marginLeft: 11,
      color: "#0F172A",
      fontSize: 15,
      paddingVertical: 0,
    },

    selectButton: {
      minHeight: 48,
      paddingHorizontal: 13,
      borderRadius: 14,
      backgroundColor: "#FFF7ED",

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      gap: 4,
    },

    selectPressed: {
      opacity: 0.7,
    },

    selectText: {
      color: "#FF6B00",
      fontSize: 13,
    },

    /* ==========================================================
       INPUT
    ========================================================== */

    inputContainer: {
      minHeight: 62,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: "#E2E8F0",
      backgroundColor: "#FFFFFF",

      flexDirection: "row",
      alignItems: "center",

      paddingHorizontal: 16,
    },

    input: {
      flex: 1,
      marginLeft: 11,
      color: "#0F172A",
      fontSize: 15,
      minHeight: 60,
      paddingVertical: 0,
    },

    /* ==========================================================
       CURRENT LOCATION
    ========================================================== */

    currentLocationButton: {
      marginTop: 11,
      alignSelf: "flex-start",
      minHeight: 38,

      paddingHorizontal: 4,

      flexDirection: "row",
      alignItems: "center",

      gap: 7,
    },

    currentLocationText: {
      color: "#FF6B00",
      fontSize: 14,
    },

    locationPressed: {
      opacity: 0.65,
    },

    locationDisabled: {
      opacity: 0.55,
    },

    locationReady: {
      marginTop: 5,

      flexDirection: "row",
      alignItems: "center",

      gap: 5,
    },

    locationReadyText: {
      color: "#16A34A",
      fontSize: 11,
    },

    /* ==========================================================
       CONTINUE
    ========================================================== */

    saveButton: {
      minHeight: 58,

      borderRadius: 18,

      backgroundColor: "#FF6B00",

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      gap: 9,

      marginTop: 2,

      shadowColor: "#FF6B00",
      shadowOpacity: 0.18,
      shadowRadius: 9,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 3,
    },

    savePressed: {
      opacity: 0.82,

      transform: [
        {
          scale: 0.985,
        },
      ],
    },

    saveDisabled: {
      opacity: 0.65,
    },

    saveText: {
      color: "#FFFFFF",
      fontSize: 15,
    },

    /* ==========================================================
       GENERAL
    ========================================================== */

    pressed: {
      opacity: 0.7,
    },
  });