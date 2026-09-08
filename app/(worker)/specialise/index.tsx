import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import Toast from "react-native-toast-message";

import * as Location from "expo-location";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
  httpsCallable,
} from "firebase/functions";

import {
  AppButton,
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  AppLoader,
} from "@/components/common";

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

import {
  Colors,
  FixxamTokens,
  Typography,
  WorkerColors,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Coordinates = {
  latitude: number;

  longitude: number;
};

type FocusedField =
  | "service"
  | "location"
  | "phone"
  | null;

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

function safeString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

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
      typeof value ===
        "string" &&
      value.trim().length >
        0,
  );

  return Array.from(
    new Set(
      parts.map(
        part =>
          part.trim(),
      ),
    ),
  ).join(", ");
}

function normalizePhone(
  value: string,
): string {
  const trimmed =
    value.trim();

  const hasLeadingPlus =
    trimmed.startsWith(
      "+",
    );

  const digits =
    trimmed
      .replace(/\D/g, "")
      .slice(0, 15);

  if (!digits) {
    return hasLeadingPlus
      ? "+"
      : "";
  }

  return hasLeadingPlus
    ? `+${digits}`
    : digits;
}

function isValidPhone(
  value: string,
): boolean {
  const digitCount =
    value.replace(
      /\D/g,
      "",
    ).length;

  return (
    digitCount >= 10 &&
    digitCount <= 15
  );
}

function buildWorkerName(
  data: Record<
    string,
    unknown
  >,
  authDisplayName?:
    | string
    | null,
): string {
  const fullName =
    safeString(
      data.fullName,
    );

  if (fullName) {
    return fullName;
  }

  const firstName =
    safeString(
      data.firstName,
    );

  const otherName =
    safeString(
      data.otherName,
    );

  const surname =
    safeString(
      data.surname,
    );

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

  return safeString(
    authDisplayName,
  );
}

function getProfilePhone(
  data: Record<
    string,
    unknown
  >,
): string {
  return (
    safeString(
      data.phoneNumber,
    ) ||
    safeString(
      data.phone,
    )
  );
}

function isValidCoordinates(
  coordinates:
    | Coordinates
    | null,
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
    coordinates.latitude >=
      -90 &&
    coordinates.latitude <=
      90 &&
    coordinates.longitude >=
      -180 &&
    coordinates.longitude <=
      180
  );
}

function showInfo(
  title: string,
  message?: string,
) {
  Toast.show({
    type: "info",

    text1: title,

    text2: message,
  });
}

function showError(
  title: string,
  message?: string,
) {
  Toast.show({
    type: "error",

    text1: title,

    text2: message,
  });
}

function showSuccess(
  title: string,
  message?: string,
) {
  Toast.show({
    type: "success",

    text1: title,

    text2: message,
  });
}

function getCallableErrorMessage(
  error: unknown,
): string {
  if (
    !error ||
    typeof error !==
      "object"
  ) {
    return "Something went wrong while sending your request. Please try again.";
  }

  const callableError =
    error as {
      code?: unknown;
    };

  const code =
    safeString(
      callableError.code,
    ).toLowerCase();

  switch (code) {
    case "functions/unauthenticated":
    case "unauthenticated":
      return "Please sign in again before sending your request.";

    case "functions/permission-denied":
    case "permission-denied":
      return "You do not have permission to send this request.";

    case "functions/invalid-argument":
    case "invalid-argument":
      return "Some request information is invalid. Please check the form and try again.";

    case "functions/resource-exhausted":
    case "resource-exhausted":
      return "Too many requests have been sent. Please try again later.";

    case "functions/unavailable":
    case "unavailable":
      return "The service is temporarily unavailable. Please try again.";

    case "functions/deadline-exceeded":
    case "deadline-exceeded":
      return "The request took too long. Please check your connection and try again.";

    default:
      return "Something went wrong while sending your request. Please try again.";
  }
}

/* ==============================================================
   SCREEN
============================================================== */

export default function SpecialiseYourMarketScreen() {
  /* ============================================================
     FORM
  ============================================================ */

  const [
    service,
    setService,
  ] =
    useState("");

  const [
    location,
    setLocation,
  ] =
    useState("");

  const [
    phone,
    setPhone,
  ] =
    useState("");

  const [
    coordinates,
    setCoordinates,
  ] =
    useState<
      Coordinates | null
    >(null);

  /* ============================================================
     WORKER PROFILE
  ============================================================ */

  const [
    workerName,
    setWorkerName,
  ] =
    useState("");

  const [
    workerLoading,
    setWorkerLoading,
  ] =
    useState(true);

  /* ============================================================
     UI STATE
  ============================================================ */

  const [
    showServices,
    setShowServices,
  ] =
    useState(false);

  const [
    showConfirmation,
    setShowConfirmation,
  ] =
    useState(false);

  const [
    locationLoading,
    setLocationLoading,
  ] =
    useState(false);

  const [
    sending,
    setSending,
  ] =
    useState(false);

  const [
    focusedField,
    setFocusedField,
  ] =
    useState<FocusedField>(
      null,
    );

  /* ============================================================
     GUARDS
  ============================================================ */

  const locationLoadingRef =
    useRef(false);

  const sendingRef =
    useRef(false);

  /* ============================================================
     SELECTED SERVICE
  ============================================================ */

  const selectedService =
    useMemo(
      () =>
        SERVICES.find(
          item =>
            item.id ===
            service,
        ),
      [
        service,
      ],
    );

  /* ============================================================
     LOAD + LISTEN TO WORKER PROFILE
  ============================================================ */

  useEffect(() => {
    let active = true;

    let profileVersion = 0;

    let unsubscribePublicProfile:
      | (() => void)
      | undefined;

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        currentUser => {
          profileVersion +=
            1;

          const currentVersion =
            profileVersion;

          unsubscribePublicProfile?.();

          unsubscribePublicProfile =
            undefined;

          if (!active) {
            return;
          }

          if (!currentUser) {
            setWorkerName(
              "",
            );

            setPhone(
              "",
            );

            setWorkerLoading(
              false,
            );

            showError(
              "Sign in required",
              "Please sign in again to continue.",
            );

            return;
          }

          setWorkerLoading(
            true,
          );

          void (async () => {
            try {
              /* ==============================================
                 MAIN USER PROFILE
              ============================================== */

              const userSnapshot =
                await getUser(
                  currentUser.uid,
                );

              if (
                !active ||
                currentVersion !==
                  profileVersion
              ) {
                return;
              }

              if (
                !userSnapshot.exists()
              ) {
                throw new Error(
                  "WORKER_PROFILE_NOT_FOUND",
                );
              }

              const userData =
                userSnapshot.data() as Record<
                  string,
                  unknown
                >;

              const initialWorkerName =
                buildWorkerName(
                  userData,
                  currentUser.displayName,
                );

              const initialPhone =
                getProfilePhone(
                  userData,
                );

              if (
                initialWorkerName
              ) {
                setWorkerName(
                  initialWorkerName,
                );
              }

              if (
                initialPhone
              ) {
                setPhone(
                  normalizePhone(
                    initialPhone,
                  ),
                );
              }

              /* ==============================================
                 PUBLIC PROFILE LISTENER
              ============================================== */

              const publicProfileRef =
                doc(
                  db,
                  "workerPublicProfiles",
                  currentUser.uid,
                );

              unsubscribePublicProfile =
                onSnapshot(
                  publicProfileRef,
                  snapshot => {
                    if (
                      !active ||
                      currentVersion !==
                        profileVersion ||
                      !snapshot.exists()
                    ) {
                      return;
                    }

                    const publicData =
                      snapshot.data() as Record<
                        string,
                        unknown
                      >;

                    const updatedWorkerName =
                      buildWorkerName(
                        publicData,
                        currentUser.displayName,
                      );

                    const updatedPhone =
                      getProfilePhone(
                        publicData,
                      );

                    if (
                      updatedWorkerName
                    ) {
                      setWorkerName(
                        updatedWorkerName,
                      );
                    }

                    if (
                      updatedPhone
                    ) {
                      setPhone(
                        normalizePhone(
                          updatedPhone,
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
                            updatedPhone,
                        },
                      );
                    }
                  },
                  listenerError => {
                    console.error(
                      "FIXXAM_PUBLIC_PROFILE_LISTENER_ERROR:",
                      listenerError,
                    );
                  },
                );
            } catch (profileError) {
              console.error(
                "FIXXAM_LOAD_WORKER_PROFILE_ERROR:",
                profileError,
              );

              if (
                !active ||
                currentVersion !==
                  profileVersion
              ) {
                return;
              }

              setWorkerName(
                "",
              );

              showError(
                "Profile unavailable",
                "Unable to load your worker profile. Please try again.",
              );
            } finally {
              if (
                active &&
                currentVersion ===
                  profileVersion
              ) {
                setWorkerLoading(
                  false,
                );
              }
            }
          })();
        },
      );

    return () => {
      active = false;

      profileVersion +=
        1;

      unsubscribePublicProfile?.();

      unsubscribeAuth();
    };
  }, []);

  /* ============================================================
     CURRENT LOCATION
  ============================================================ */

  const handleCurrentLocation =
    useCallback(
      async () => {
        if (
          locationLoadingRef.current
        ) {
          return;
        }

        locationLoadingRef.current =
          true;

        setLocationLoading(
          true,
        );

        try {
          const currentPermission =
            await Location.getForegroundPermissionsAsync();

          let permission =
            currentPermission;

          if (
            permission.status !==
              Location.PermissionStatus.GRANTED &&
            permission.canAskAgain
          ) {
            permission =
              await Location.requestForegroundPermissionsAsync();
          }

          if (
            permission.status !==
            Location.PermissionStatus.GRANTED
          ) {
            showInfo(
              "Location permission required",
              "Allow Fixxam to access your location before searching for nearby customers.",
            );

            return;
          }

          const servicesEnabled =
            await Location.hasServicesEnabledAsync();

          if (
            !servicesEnabled
          ) {
            showInfo(
              "Location is off",
              "Turn on your phone location and try again.",
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
          } =
            position.coords;

          const nextCoordinates: Coordinates =
            {
              latitude,

              longitude,
            };

          if (
            !isValidCoordinates(
              nextCoordinates,
            )
          ) {
            throw new Error(
              "INVALID_DEVICE_COORDINATES",
            );
          }

          setCoordinates(
            nextCoordinates,
          );

          try {
            const addresses =
              await Location.reverseGeocodeAsync(
                nextCoordinates,
              );

            const address =
              addresses[0];

            if (!address) {
              showInfo(
                "GPS detected",
                "Your location was detected, but the address could not be determined. Enter your service area manually.",
              );

              return;
            }

            const formatted =
              formatLocation(
                address,
              );

            if (!formatted) {
              showInfo(
                "GPS detected",
                "Your location was detected, but the address could not be determined. Enter your service area manually.",
              );

              return;
            }

            setLocation(
              formatted,
            );
          } catch (geocodeError) {
            console.warn(
              "FIXXAM_REVERSE_GEOCODE_ERROR:",
              geocodeError,
            );

            showInfo(
              "GPS detected",
              "Your coordinates are ready. Enter your service area manually.",
            );
          }
        } catch (locationError) {
          console.error(
            "FIXXAM_CURRENT_LOCATION_ERROR:",
            locationError,
          );

          setCoordinates(
            null,
          );

          showError(
            "Unable to get location",
            "Please check your location settings and try again.",
          );
        } finally {
          locationLoadingRef.current =
            false;

          setLocationLoading(
            false,
          );
        }
      },
      [],
    );

  /* ============================================================
     FORM HANDLERS
  ============================================================ */

  const handleServiceChange =
    useCallback(
      (
        value: string,
      ) => {
        setService(
          value,
        );
      },
      [],
    );

  const handleLocationChange =
    useCallback(
      (
        value: string,
      ) => {
        setLocation(
          value,
        );

        /*
         * Prevent stale GPS coordinates from
         * being paired with a manually changed address.
         */
        setCoordinates(
          null,
        );
      },
      [],
    );

  const handlePhoneChange =
    useCallback(
      (
        value: string,
      ) => {
        setPhone(
          normalizePhone(
            value,
          ),
        );
      },
      [],
    );

  const handleSelectService =
    useCallback(
      (
        item: ServiceOption,
      ) => {
        setService(
          item.id,
        );

        setShowServices(
          false,
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
        showInfo(
          "Service required",
          "Enter or select the service you provide.",
        );

        return;
      }

      if (!cleanLocation) {
        showInfo(
          "Location required",
          "Enter your service area and use your current GPS location.",
        );

        return;
      }

      if (
        !isValidPhone(
          cleanPhone,
        )
      ) {
        showInfo(
          "Invalid phone number",
          "Enter a valid phone number.",
        );

        return;
      }

      if (
        !workerName.trim()
      ) {
        showError(
          "Profile not ready",
          "We could not load your worker name. Please try again.",
        );

        return;
      }

      if (
        !isValidCoordinates(
          coordinates,
        )
      ) {
        showInfo(
          "GPS location required",
          "Tap Use Current Location so Fixxam can find customers near you.",
        );

        return;
      }

      setShowConfirmation(
        true,
      );
    }, [
      coordinates,
      location,
      phone,
      service,
      workerName,
    ]);

  /* ============================================================
     SEND REQUEST
  ============================================================ */

  const handleSendRequest =
    useCallback(
      async () => {
        if (
          sendingRef.current
        ) {
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

          showInfo(
            "GPS location required",
            "Use Current Location before sending your request.",
          );

          return;
        }

        if (
          !cleanService ||
          !cleanLocation ||
          !isValidPhone(
            cleanPhone,
          ) ||
          !cleanWorkerName
        ) {
          setShowConfirmation(
            false,
          );

          showInfo(
            "Incomplete request",
            "Check your service, location, phone number, and worker profile.",
          );

          return;
        }

        sendingRef.current =
          true;

        setSending(
          true,
        );

        try {
          const currentUser =
            auth.currentUser;

          if (!currentUser) {
            throw {
              code:
                "functions/unauthenticated",
            };
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

          if (
            !response ||
            !response.success ||
            response.sentCount <=
              0
          ) {
            setShowConfirmation(
              false,
            );

            showInfo(
              "No customers found",
              response?.message ||
                "No nearby customers with a valid location were found.",
            );

            return;
          }

          setShowConfirmation(
            false,
          );

          showSuccess(
            "Request sent",
            `Sent to ${response.sentCount} nearby customer${
              response.sentCount ===
              1
                ? ""
                : "s"
            }.`,
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

          router.back();
        } catch (sendError) {
          console.error(
            "FIXXAM_SEND_REQUEST_ERROR:",
            sendError,
          );

          setShowConfirmation(
            false,
          );

          showError(
            "Request failed",
            getCallableErrorMessage(
              sendError,
            ),
          );
        } finally {
          sendingRef.current =
            false;

          setSending(
            false,
          );
        }
      },
      [
        coordinates,
        location,
        phone,
        selectedService,
        service,
        workerName,
      ],
    );

  /* ============================================================
     DERIVED
  ============================================================ */

  const screenBusy =
    workerLoading ||
    locationLoading ||
    sending;

  const locationReady =
    isValidCoordinates(
      coordinates,
    );

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <AppScreen
      role="worker"
    >
      <KeyboardAvoidingView
        style={
          styles.flex
        }
        behavior={
          Platform.OS ===
          "ios"
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
                  ? styles.pressed
                  : null,
              ]}
            >
              <AppIcon
                name="back"
                size="md"
                color={
                  Colors.textPrimary
                }
              />
            </Pressable>

            <View
              style={
                styles.headerText
              }
            >
              <AppText
                variant="heading2"
                weight="bold"
                numberOfLines={1}
                style={
                  styles.title
                }
              >
                Specialise Your Market
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                numberOfLines={2}
                style={
                  styles.subtitle
                }
              >
                Tell nearby customers what service you offer.
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
              variant="bodyMedium"
              weight="medium"
              style={
                styles.label
              }
            >
              Service
            </AppText>

            <View
              style={[
                styles.inputContainer,

                focusedField ===
                "service"
                  ? styles.inputContainerFocused
                  : null,
              ]}
            >
              <AppIcon
                name="professional"
                size="sm"
                color={
                  Colors.textSecondary
                }
              />

              <TextInput
                accessibilityLabel="Service"
                value={
                  selectedService?.name ??
                  service
                }
                onChangeText={
                  handleServiceChange
                }
                onFocus={() =>
                  setFocusedField(
                    "service",
                  )
                }
                onBlur={() =>
                  setFocusedField(
                    null,
                  )
                }
                placeholder="Enter service"
                placeholderTextColor={
                  Colors.textMuted
                }
                autoCapitalize="words"
                maxLength={80}
                style={
                  styles.input
                }
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Select service"
                hitSlop={4}
                onPress={() =>
                  setShowServices(
                    true,
                  )
                }
                style={({
                  pressed,
                }) => [
                  styles.selectButton,

                  pressed
                    ? styles.pressed
                    : null,
                ]}
              >
                <AppText
                  variant="caption"
                  weight="medium"
                  style={
                    styles.selectText
                  }
                >
                  Select
                </AppText>

                <AppIcon
                  name="down"
                  role="worker"
                  size="xs"
                  color={
                    WorkerColors.primary
                  }
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
              variant="bodyMedium"
              weight="medium"
              style={
                styles.label
              }
            >
              Location
            </AppText>

            <View
              style={[
                styles.inputContainer,

                focusedField ===
                "location"
                  ? styles.inputContainerFocused
                  : null,
              ]}
            >
              <AppIcon
                name="location"
                size="sm"
                color={
                  Colors.textSecondary
                }
              />

              <TextInput
                accessibilityLabel="Service area"
                value={
                  location
                }
                onChangeText={
                  handleLocationChange
                }
                onFocus={() =>
                  setFocusedField(
                    "location",
                  )
                }
                onBlur={() =>
                  setFocusedField(
                    null,
                  )
                }
                placeholder="Enter your service area"
                placeholderTextColor={
                  Colors.textMuted
                }
                autoCapitalize="words"
                maxLength={120}
                style={
                  styles.input
                }
              />
            </View>

            <AppButton
              title={
                locationLoading
                  ? "Getting Location..."
                  : "Use Current Location"
              }
              role="worker"
              variant="ghost"
              size="sm"
              leftIconName="locate"
              loading={
                locationLoading
              }
              disabled={
                locationLoading
              }
              onPress={() =>
                void handleCurrentLocation()
              }
              style={
                styles.locationButton
              }
            />

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.locationHelp
              }
            >
              GPS is required so Fixxam can find customers near you.
            </AppText>

            {locationReady ? (
              <View
                style={
                  styles.locationReady
                }
              >
                <AppIcon
                  name="success"
                  size="xs"
                  color={
                    Colors.success
                  }
                />

                <AppText
                  variant="caption"
                  weight="medium"
                  style={
                    styles.locationReadyText
                  }
                >
                  Current location detected
                </AppText>
              </View>
            ) : null}
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
              variant="bodyMedium"
              weight="medium"
              style={
                styles.label
              }
            >
              Phone Number
            </AppText>

            <View
              style={[
                styles.inputContainer,

                focusedField ===
                "phone"
                  ? styles.inputContainerFocused
                  : null,
              ]}
            >
              <AppIcon
                name="phone"
                size="sm"
                color={
                  Colors.textSecondary
                }
              />

              <TextInput
                accessibilityLabel="Phone number"
                value={
                  phone
                }
                onChangeText={
                  handlePhoneChange
                }
                onFocus={() =>
                  setFocusedField(
                    "phone",
                  )
                }
                onBlur={() =>
                  setFocusedField(
                    null,
                  )
                }
                placeholder="080XXXXXXXX"
                placeholderTextColor={
                  Colors.textMuted
                }
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                maxLength={16}
                style={
                  styles.input
                }
              />
            </View>
          </View>

          {/* ==================================================
              CONTINUE
          ================================================== */}

          <AppButton
            title={
              workerLoading
                ? "Loading Profile..."
                : locationLoading
                  ? "Getting Location..."
                  : sending
                    ? "Sending..."
                    : "Continue"
            }
            role="worker"
            variant="primary"
            leftIconName="next"
            loading={
              workerLoading ||
              sending
            }
            disabled={
              screenBusy
            }
            onPress={
              handleContinue
            }
            style={
              styles.continueButton
            }
          />
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
          selectedService?.id ??
          ""
        }
        onSelect={
          handleSelectService
        }
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
          if (
            sendingRef.current
          ) {
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

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.xxxl,

      backgroundColor:
        Colors.background,
    },

    /* ==========================================================
       HEADER
    ========================================================== */

    header: {
      marginBottom:
        FixxamTokens.spacing.xl,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    backButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    headerText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       FIELD
    ========================================================== */

    fieldSection: {
      marginBottom:
        FixxamTokens.spacing.xl,
    },

    label: {
      marginBottom:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    inputContainer: {
      minHeight:
        FixxamTokens.size.inputHeight,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    inputContainerFocused: {
      borderColor:
        WorkerColors.primary,
    },

    input: {
      flex: 1,

      minWidth: 0,

      minHeight:
        FixxamTokens.size.inputHeight,

      marginLeft:
        FixxamTokens.spacing.sm,

      paddingVertical: 0,

      color:
        Colors.textPrimary,

      fontSize:
        Typography.fontSize.md,
    },

    /* ==========================================================
       SERVICE
    ========================================================== */

    selectButton: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      marginLeft:
        FixxamTokens.spacing.sm,

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
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    selectText: {
      color:
        WorkerColors.primary,
    },

    /* ==========================================================
       LOCATION
    ========================================================== */

    locationButton: {
      alignSelf:
        "flex-start",

      marginTop:
        FixxamTokens.spacing.sm,
    },

    locationHelp: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    locationReady: {
      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    locationReadyText: {
      color:
        Colors.success,
    },

    /* ==========================================================
       CONTINUE
    ========================================================== */

    continueButton: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.sm,
    },

    /* ==========================================================
       GENERAL
    ========================================================== */

    pressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },
  });