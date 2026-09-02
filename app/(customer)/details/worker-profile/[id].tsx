import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

import { auth } from "@/firebase/config";

import WorkerGallery from "@/components/customer/worker/WorkerGallery";
import WorkerHero from "@/components/customer/worker/WorkerHero";
import WorkerStats from "@/components/customer/worker/WorkerStats";
import WorkerStore from "@/components/customer/worker/WorkerStore";
import WorkerAbout from "@/components/customer/worker/WorkerAbout";
import WorkerReviews from "@/components/customer/worker/WorkerReviews";
import WorkerActions from "@/components/customer/worker/WorkerActions";
import WorkerBookingBar from "@/components/customer/worker/WorkerBookingBar";
import WorkerServicePickerModal from "@/components/customer/worker/WorkerServicePickerModal";

import {
  getPublicWorker,
} from "@/firebase/queries/workerPublicProfiles";

import {
  getServicesByIds,
} from "@/firebase/queries/getServicesByIds";

import type {
  ServiceCardData,
} from "@/firebase/mappers/serviceMapper";

/* ==============================================================
   TYPES
============================================================== */

type GalleryItem =
  | string
  | {
      url?: string;
      imageUrl?: string;
      uri?: string;
    };

type WorkerService = {
  id: string;
  name: string;
  price: number;
  icon?: string;
  color?: string;
  backgroundColor?: string;
};

type WorkerReview = {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
};

type WorkerServiceDetails = {
  state?: string;
  subcategory?: string;
};

type WorkerProfile = {
  photoUrl?: string;

  /*
   * PHONE NUMBER
   *
   * Supports the number saved by
   * Build Your Profile.
   */
  phoneNumber?: string;

  category?: string;
  subcategory?: string;

  /*
   * NEW EDITABLE LOCATION
   */
  location?: string;

  /*
   * LEGACY LOCATION
   */
  lga?: string;
  state?: string;

  /*
   * EDITABLE
   */
  experience?: string | number;

  /*
   * EDITABLE
   */
  hourlyRate?: number;

  /*
   * EDITABLE
   */
  aboutMe?: string;

  latitude?: number | null;
  longitude?: number | null;

  selectedServices?: string[];

  serviceDetails?: WorkerServiceDetails;
};

type WorkerData = {
  id: string;

  uid?: string;

  /*
   * READ-ONLY / DISPLAY
   */
  firstName?: string;
  otherName?: string;
  surname?: string;

  /*
   * Legacy name
   */
  name?: string;

  /*
   * NEW EDITABLE NAME
   */
  fullName?: string;

  rating?: number;

  totalReviews?: number;

  completedJobs?: number;

  verified?: boolean;
  online?: boolean;
  available?: boolean;

  phoneNumber?: string;
  phone?: string;
  mobileNumber?: string;

  reviews?: unknown[];

  /*
   * NEW EDITABLE GALLERY
   */
  workGallery?: unknown[];

  /*
   * OLD / NESTED PROFILE
   */
  workerProfile?: WorkerProfile;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function cleanStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter(
          (
            item,
          ): item is string =>
            typeof item === "string" &&
            item.trim().length > 0,
        )
        .map((item) => item.trim()),
    ),
  );
}

function toNumber(
  value: unknown,
  fallback = 0,
): number {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

/* ==============================================================
   NORMALIZE PROFILE
============================================================== */

function normalizeWorkerProfile(
  data: Record<string, unknown>,
): WorkerProfile {
  const rawNested =
    data.workerProfile;

  const nested =
    rawNested &&
    typeof rawNested === "object"
      ? (rawNested as Record<
          string,
          unknown
        >)
      : {};

  const rawServiceDetails =
    nested.serviceDetails;

  const serviceDetails =
    rawServiceDetails &&
    typeof rawServiceDetails === "object"
      ? (rawServiceDetails as Record<
          string,
          unknown
        >)
      : undefined;

  /*
   * ============================================================
   * IMPORTANT
   *
   * Build Your Profile saves:
   *
   * location
   * experience
   * rate
   * aboutMe
   * photoURL
   * phoneNumber
   *
   * directly on the public document.
   *
   * Therefore top-level fields are preferred.
   * ============================================================
   */

  const photoUrl =
    cleanString(data.photoURL) ||
    cleanString(data.photoUrl) ||
    cleanString(nested.photoURL) ||
    cleanString(nested.photoUrl);

  /*
   * PHONE NUMBER
   *
   * Top-level phoneNumber has priority.
   * Older structures remain supported.
   */
  const phoneNumber =
    cleanString(data.phoneNumber) ||
    cleanString(nested.phoneNumber) ||
    cleanString(data.phone) ||
    cleanString(nested.phone);

  const location =
    cleanString(data.location) ||
    cleanString(nested.location);

  const experience =
    data.experience !== undefined
      ? data.experience
      : nested.experience;

  const rate =
    data.rate !== undefined
      ? data.rate
      : data.hourlyRate !== undefined
        ? data.hourlyRate
        : nested.rate !== undefined
          ? nested.rate
          : nested.hourlyRate;

  const aboutMe =
    cleanString(data.aboutMe) ||
    cleanString(data.about) ||
    cleanString(nested.aboutMe) ||
    cleanString(nested.about);

  const rootSelectedServices =
    cleanStringArray(
      data.selectedServices,
    );

  const nestedSelectedServices =
    cleanStringArray(
      nested.selectedServices,
    );

  const selectedServices =
    rootSelectedServices.length > 0
      ? rootSelectedServices
      : nestedSelectedServices;

  return {
    photoUrl,

    /*
     * PHONE NUMBER
     */
    phoneNumber,

    category:
      cleanString(data.category) ||
      cleanString(nested.category),

    subcategory:
      cleanString(data.subcategory) ||
      cleanString(nested.subcategory),

    location,

    lga:
      cleanString(data.lga) ||
      cleanString(nested.lga),

    state:
      cleanString(data.state) ||
      cleanString(nested.state),

    experience:
      typeof experience === "string" ||
      typeof experience === "number"
        ? experience
        : "",

    hourlyRate:
      toNumber(rate, 0),

    aboutMe,

    latitude:
      typeof data.latitude === "number"
        ? data.latitude
        : typeof nested.latitude ===
            "number"
          ? nested.latitude
          : null,

    longitude:
      typeof data.longitude === "number"
        ? data.longitude
        : typeof nested.longitude ===
            "number"
          ? nested.longitude
          : null,

    selectedServices,

    serviceDetails:
      serviceDetails
        ? {
            state:
              cleanString(
                serviceDetails.state,
              ),

            subcategory:
              cleanString(
                serviceDetails.subcategory,
              ),
          }
        : undefined,
  };
}

/* ==============================================================
   SCREEN
============================================================== */

export default function WorkerProfileScreen() {
  const {
    id,
    serviceId,
    service,
    serviceIcon,
    categoryId,
    reward,
    action,
  } =
    useLocalSearchParams<{
      id?: string;
      serviceId?: string;
      service?: string;
      serviceIcon?: string;
      categoryId?: string;
      reward?: string;
      action?: string;
    }>();

  /* ============================================================
     WORKER
  ============================================================ */

  const [worker, setWorker] =
    useState<WorkerData | null>(null);

  const [loading, setLoading] =
    useState(true);

  /* ============================================================
     SERVICES
  ============================================================ */

  const [services, setServices] =
    useState<WorkerService[]>([]);

  const [servicesLoading, setServicesLoading] =
    useState(false);

  const [selectedServices, setSelectedServices] =
    useState<string[]>([]);

  const [showServiceModal, setShowServiceModal] =
    useState(false);

  /* ============================================================
     CALL
  ============================================================ */

  const [workerPhone, setWorkerPhone] =
    useState("");

  const [showCallModal, setShowCallModal] =
    useState(false);

  const [
    showLoginRequiredModal,
    setShowLoginRequiredModal,
  ] = useState(false);

  /* ============================================================
     WORKER ID
  ============================================================ */

  const workerId =
    Array.isArray(id)
      ? id[0]
      : id;

  /* ============================================================
     LOAD WORKER
  ============================================================ */

  useEffect(() => {
    let mounted = true;

    async function loadWorker() {
      const cleanWorkerId =
        cleanString(workerId);

      if (!cleanWorkerId) {
        if (mounted) {
          setWorker(null);
          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);

        const snapshot =
          await getPublicWorker(
            cleanWorkerId,
          );

        if (!snapshot.exists()) {
          if (mounted) {
            setWorker(null);
          }

          return;
        }

        const data =
          snapshot.data() as Record<
            string,
            unknown
          >;

        const normalizedProfile =
          normalizeWorkerProfile(data);

        /* ======================================================
           NAME
        ====================================================== */

        const fullName =
          cleanString(data.fullName);

        /* ======================================================
           GALLERY
        ====================================================== */

        const topLevelGallery =
          Array.isArray(
            data.workGallery,
          )
            ? data.workGallery
            : [];

        const nestedProfile =
          data.workerProfile &&
          typeof data.workerProfile ===
            "object"
            ? (data.workerProfile as Record<
                string,
                unknown
              >)
            : {};

        const nestedGallery =
          Array.isArray(
            nestedProfile.workGallery,
          )
            ? nestedProfile.workGallery
            : [];

        const workGallery =
          topLevelGallery.length > 0
            ? topLevelGallery
            : nestedGallery;

        if (!mounted) {
          return;
        }

        setWorker({
          id: snapshot.id,

          uid:
            cleanString(data.uid) ||
            cleanString(data.userId) ||
            snapshot.id,

          firstName:
            cleanString(
              data.firstName,
            ),

          otherName:
            cleanString(
              data.otherName,
            ),

          surname:
            cleanString(
              data.surname,
            ),

          fullName,

          name:
            cleanString(data.name),

          rating:
            toNumber(data.rating, 0),

          totalReviews:
            toNumber(
              data.totalReviews,
              0,
            ),

          completedJobs:
            toNumber(
              data.completedJobs,
              0,
            ),

          verified:
            data.verified === true,

          online:
            data.online === true,

          available:
            data.available !== false,

          /*
           * Keep root phone fields for compatibility.
           */
          phoneNumber:
            cleanString(
              data.phoneNumber,
            ) || undefined,

          phone:
            cleanString(
              data.phone,
            ) || undefined,

          mobileNumber:
            cleanString(
              data.mobileNumber,
            ) || undefined,

          reviews:
            Array.isArray(data.reviews)
              ? data.reviews
              : [],

          workGallery,

          workerProfile:
            normalizedProfile,
        });
      } catch (error) {
        console.error(
          "LOAD_PUBLIC_WORKER_PROFILE_ERROR:",
          error,
        );

        if (mounted) {
          setWorker(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadWorker();

    return () => {
      mounted = false;
    };
  }, [workerId]);

  /* ============================================================
     PROFILE
  ============================================================ */

  const workerProfile =
    worker?.workerProfile;

  /* ============================================================
     WORKER NAME
  ============================================================ */

  const workerName = useMemo(() => {
    if (
      cleanString(
        worker?.fullName,
      )
    ) {
      return cleanString(
        worker?.fullName,
      );
    }

    const individualName = [
      worker?.firstName,
      worker?.otherName,
      worker?.surname,
    ]
      .map(cleanString)
      .filter(Boolean)
      .join(" ")
      .trim();

    if (individualName) {
      return individualName;
    }

    if (
      cleanString(worker?.name)
    ) {
      return cleanString(
        worker?.name,
      );
    }

    return "Worker";
  }, [
    worker?.fullName,
    worker?.firstName,
    worker?.otherName,
    worker?.surname,
    worker?.name,
  ]);

  /* ============================================================
     PHOTO
  ============================================================ */

  const workerPhoto =
    cleanString(
      workerProfile?.photoUrl,
    );

  /* ============================================================
     LOCATION
  ============================================================ */

  const workerLocation = useMemo(() => {
    const directLocation =
      cleanString(
        workerProfile?.location,
      );

    if (directLocation) {
      return directLocation;
    }

    return [
      cleanString(
        workerProfile?.lga,
      ),
      cleanString(
        workerProfile?.state,
      ),
    ]
      .filter(Boolean)
      .join(", ");
  }, [
    workerProfile?.location,
    workerProfile?.lga,
    workerProfile?.state,
  ]);

  /* ============================================================
     LOAD SERVICES
  ============================================================ */

  useEffect(() => {
    let mounted = true;

    async function loadServices() {
      const serviceIds =
        workerProfile?.selectedServices ??
        [];

      const cleanIds =
        Array.from(
          new Set(
            serviceIds
              .filter(
                (
                  value,
                ): value is string =>
                  typeof value === "string" &&
                  value.trim().length > 0,
              )
              .map(
                (value) =>
                  value.trim(),
              ),
          ),
        );

      if (
        cleanIds.length === 0
      ) {
        if (mounted) {
          setServices([]);
          setServicesLoading(false);
        }

        return;
      }

      try {
        setServicesLoading(true);

        const result =
          await getServicesByIds(
            cleanIds,
          );

        if (!mounted) {
          return;
        }

        const mapped =
          result.map(
            (
              serviceItem: ServiceCardData,
            ): WorkerService => ({
              id: serviceItem.id,

              name:
                serviceItem.name ||
                "Unnamed Service",

              price:
                typeof serviceItem.price ===
                "number"
                  ? serviceItem.price
                  : 0,

              icon:
                serviceItem.icon ||
                "construct-outline",

              color:
                serviceItem.color ||
                "#2563EB",

              backgroundColor:
                serviceItem.backgroundColor ||
                "#EFF6FF",
            }),
          );

        setServices(mapped);
      } catch (error) {
        console.error(
          "LOAD_WORKER_SERVICES_ERROR:",
          error,
        );

        if (mounted) {
          setServices([]);
        }
      } finally {
        if (mounted) {
          setServicesLoading(false);
        }
      }
    }

    void loadServices();

    return () => {
      mounted = false;
    };
  }, [
    workerProfile?.selectedServices,
  ]);

  /* ============================================================
     NORMALIZE GALLERY
  ============================================================ */

  const workGallery =
    useMemo<GalleryItem[]>(() => {
      const source =
        worker?.workGallery ?? [];

      if (!Array.isArray(source)) {
        return [];
      }

      const result: GalleryItem[] = [];

      source.forEach((item) => {
        if (
          typeof item === "string"
        ) {
          const value =
            item.trim();

          if (value) {
            result.push(value);
          }

          return;
        }

        if (
          !item ||
          typeof item !== "object"
        ) {
          return;
        }

        const value =
          item as Record<
            string,
            unknown
          >;

        const url =
          typeof value.url === "string"
            ? value.url.trim()
            : undefined;

        const imageUrl =
          typeof value.imageUrl ===
          "string"
            ? value.imageUrl.trim()
            : undefined;

        const uri =
          typeof value.uri === "string"
            ? value.uri.trim()
            : undefined;

        if (
          url ||
          imageUrl ||
          uri
        ) {
          result.push({
            url,
            imageUrl,
            uri,
          });
        }
      });

      return result;
    }, [
      worker?.workGallery,
    ]);

  /* ============================================================
     NORMALIZE REVIEWS
  ============================================================ */

  const reviews =
    useMemo<WorkerReview[]>(() => {
      const source =
        worker?.reviews;

      if (!Array.isArray(source)) {
        return [];
      }

      const result: WorkerReview[] = [];

      source.forEach(
        (
          item,
          index,
        ) => {
          if (
            !item ||
            typeof item !== "object"
          ) {
            return;
          }

          const value =
            item as Record<
              string,
              unknown
            >;

          const reviewId =
            cleanString(value.id) ||
            `review-${index}`;

          const customerName =
            cleanString(
              value.customerName,
            ) ||
            "Customer";

          const comment =
            cleanString(
              value.comment,
            );

          const date =
            cleanString(
              value.date,
            );

          const rating = Math.min(
            5,
            Math.max(
              0,
              toNumber(
                value.rating,
                0,
              ),
            ),
          );

          result.push({
            id: reviewId,
            customerName,
            rating,
            comment,
            date,
          });
        },
      );

      return result;
    }, [
      worker?.reviews,
    ]);

  /* ============================================================
     PHONE
  ============================================================ */

  useEffect(() => {
    if (!worker) {
      setWorkerPhone("");
      return;
    }

    /*
     * IMPORTANT:
     *
     * workerProfile.phoneNumber is now
     * checked first because Build Your
     * Profile data is normalized there.
     *
     * Root fields remain as fallbacks.
     */
    const phone =
      workerProfile?.phoneNumber ??
      worker.phoneNumber ??
      worker.phone ??
      worker.mobileNumber ??
      "";

    setWorkerPhone(
      String(phone).trim(),
    );
  }, [
    worker,
    workerProfile?.phoneNumber,
  ]);

  /* ============================================================
     CONTINUE CALL AFTER LOGIN
  ============================================================ */

  useEffect(() => {
    if (
      action !== "call" ||
      !worker ||
      !auth.currentUser
    ) {
      return;
    }

    setShowCallModal(true);

    router.setParams({
      action: undefined,
    });
  }, [
    action,
    worker,
  ]);

  /* ============================================================
     BOOK
  ============================================================ */

  function handleBook() {
    if (servicesLoading) {
      return;
    }

    if (services.length === 0) {
      return;
    }

    setShowServiceModal(true);
  }

  /* ============================================================
     CLOSE SERVICE MODAL
  ============================================================ */

  function handleCloseServiceModal() {
    setShowServiceModal(false);
  }

  /* ============================================================
     TOGGLE SERVICE
  ============================================================ */

  function handleToggleService(
    selectedServiceId: string,
  ) {
    const cleanId =
      selectedServiceId.trim();

    if (!cleanId) {
      return;
    }

    setSelectedServices(
      (previous) => {
        if (
          previous.includes(
            cleanId,
          )
        ) {
          return previous.filter(
            (item) =>
              item !== cleanId,
          );
        }

        if (
          previous.length >= 4
        ) {
          return previous;
        }

        return [
          ...previous,
          cleanId,
        ];
      },
    );
  }

  /* ============================================================
     CONTINUE BOOKING
  ============================================================ */

  function handleContinueToBooking() {
    if (!worker) {
      return;
    }

    if (
      selectedServices.length === 0
    ) {
      return;
    }

    const selectedServiceId =
      selectedServices[0];

    const selectedService =
      services.find(
        (item) =>
          item.id ===
          selectedServiceId,
      );

    if (!selectedService) {
      return;
    }

    const resolvedServiceName =
      cleanString(
        selectedService.name,
      ) ||
      cleanString(service);

    const resolvedServiceIcon =
      cleanString(
        selectedService.icon,
      ) ||
      cleanString(serviceIcon) ||
      "construct-outline";

    if (
      !selectedServiceId ||
      !resolvedServiceName
    ) {
      return;
    }

    setShowServiceModal(false);

    router.push({
      pathname:
        "/(customer)/booking",

      params: {
        workerId:
          worker.id,

        workerName,

        workerPhoto,

        workerCategory:
          cleanString(
            workerProfile?.category,
          ) ||
          "Service Provider",

        workerRating:
          String(
            worker.rating ?? 0,
          ),

        workerReviews:
          String(
            worker.totalReviews ?? 0,
          ),

        workerOnline:
          String(
            worker.online ?? false,
          ),

        workerLocation,

        workerHourlyRate:
          String(
            workerProfile
              ?.hourlyRate ?? 0,
          ),

        workerVerified:
          String(
            worker.verified ?? false,
          ),

        serviceId:
          selectedServiceId,

        serviceName:
          resolvedServiceName,

        serviceIcon:
          resolvedServiceIcon,

        ...(categoryId
          ? { categoryId }
          : {}),

        ...(reward
          ? { reward }
          : {}),
      },
    });
  }

  /* ============================================================
     NORMALIZE PHONE
  ============================================================ */

  function normalizePhoneNumber(
    value: string,
  ): string {
    let phone =
      value.trim();

    if (!phone) {
      return "";
    }

    phone =
      phone.replace(
        /[^\d+]/g,
        "",
      );

    /*
     * Nigerian local format:
     * 08012345678
     */
    if (
      phone.startsWith("0") &&
      phone.length === 11
    ) {
      phone =
        `+234${phone.slice(1)}`;
    }

    /*
     * 2348012345678
     */
    if (
      phone.startsWith("234") &&
      !phone.startsWith("+234")
    ) {
      phone =
        `+${phone}`;
    }

    return phone;
  }

  /* ============================================================
     CALL WORKER
  ============================================================ */

  function handleCallWorker() {
    /*
     * Customer must login first.
     */
    if (!auth.currentUser) {
      setShowLoginRequiredModal(
        true,
      );

      return;
    }

    setShowCallModal(true);
  }

  /* ============================================================
     LOGIN
  ============================================================ */

  function handleLoginFromModal() {
    setShowLoginRequiredModal(
      false,
    );

    if (!workerId) {
      return;
    }

    const returnTo =
      `/(customer)/details/worker-profile/${workerId}?action=call`;

    router.push({
      pathname: "/(auth)/login",

      params: {
        returnTo,
      },
    } as any);
  }

  /* ============================================================
     CONFIRM CALL
  ============================================================ */

  async function handleConfirmCallWorker() {
    const phoneNumber =
      normalizePhoneNumber(
        workerPhone,
      );

    if (!phoneNumber) {
      setShowCallModal(false);
      return;
    }

    try {
      const url =
        `tel:${phoneNumber}`;

      const supported =
        await Linking.canOpenURL(
          url,
        );

      if (!supported) {
        setShowCallModal(false);

        return;
      }

      setShowCallModal(false);

      await Linking.openURL(
        url,
      );
    } catch (error) {
      console.error(
        "CALL_WORKER_ERROR:",
        error,
      );
    }
  }

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <SafeAreaView
        style={
          styles.centerScreen
        }
      >
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />
      </SafeAreaView>
    );
  }

  /* ============================================================
     NOT FOUND
  ============================================================ */

  if (!worker) {
    return (
      <SafeAreaView
        style={
          styles.centerScreen
        }
      >
        <View
          style={
            styles.notFoundIcon
          }
        >
          <Ionicons
            name="person-outline"
            size={34}
            color="#94A3B8"
          />
        </View>

        <AppText
          weight="bold"
          style={
            styles.notFoundTitle
          }
        >
          Worker not found.
        </AppText>

        <AppText
          style={
            styles.notFoundText
          }
        >
          This worker profile is
          no longer available.
        </AppText>

        <Pressable
          onPress={() =>
            router.back()
          }
          style={({ pressed }) => [
            styles.backButton,

            pressed &&
              styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="arrow-back"
            size={18}
            color="#FFFFFF"
          />

          <AppText
            weight="bold"
            style={
              styles.backButtonText
            }
          >
            Go Back
          </AppText>
        </Pressable>
      </SafeAreaView>
    );
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <>
      <SafeAreaView
        style={styles.screen}
      >
        <FlatList
          data={[worker]}
          keyExtractor={(item) =>
            item.id
          }
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.listContent
          }
          renderItem={() => (
            <>
              {/* ==================================================
                  1. HERO
              ================================================== */}

              <WorkerHero
                photo={
                  workerPhoto
                }
                name={
                  workerName
                }
                category={
                  cleanString(
                    workerProfile
                      ?.category,
                  )
                }
                location={
                  workerLocation
                }
                rating={
                  worker.rating ?? 0
                }
                reviews={
                  worker.totalReviews ??
                  0
                }
                verified={
                  worker.verified ??
                  false
                }
                online={
                  worker.online ??
                  false
                }
              />

              {/* ==================================================
                  2. STATS
              ================================================== */}

              <WorkerStats
                experience={
                  workerProfile
                    ?.experience !=
                  null
                    ? String(
                        workerProfile
                          .experience,
                      )
                    : ""
                }
                state={
                  workerProfile
                    ?.state ??
                  ""
                }
                lga={
                  workerProfile
                    ?.lga ??
                  ""
                }
                hourlyRate={
                  workerProfile
                    ?.hourlyRate ??
                  0
                }
                completedJobs={
                  worker.completedJobs ??
                  0
                }
              />

              {/* ==================================================
                  3. WORK GALLERY
              ================================================== */}

              <WorkerGallery
                images={
                  workGallery
                }
              />

              {/* ==================================================
                  4. WORKER STORE
              ================================================== */}

              <WorkerStore
                workerId={
                  worker.id
                }
              />

              {/* ==================================================
                  5. ABOUT ME
              ================================================== */}

              <WorkerAbout
                about={
                  workerProfile
                    ?.aboutMe ??
                  ""
                }
                experience={
                  workerProfile
                    ?.experience !=
                  null
                    ? String(
                        workerProfile
                          .experience,
                      )
                    : ""
                }
                category={
                  workerProfile
                    ?.category ??
                  ""
                }
              />

              {/* ==================================================
                  6. REVIEWS
              ================================================== */}

              <WorkerReviews
                rating={
                  worker.rating ??
                  0
                }
                totalReviews={
                  worker.totalReviews ??
                  0
                }
                reviews={
                  reviews
                }
              />

              {/* ==================================================
                  ACTIONS
              ================================================== */}

              <WorkerActions
                onReview={() => {}}
                onCall={
                  handleCallWorker
                }
                onFavorite={() => {}}
              />
            </>
          )}
        />
      </SafeAreaView>

      {/* ========================================================
          BOOKING BAR
      ======================================================== */}

      <WorkerBookingBar
        selectedServices={
          selectedServices.length
        }
        hourlyRate={
          workerProfile
            ?.hourlyRate ??
          0
        }
        onBook={
          handleBook
        }
      />

      {/* ========================================================
          SERVICE PICKER
      ======================================================== */}

      <WorkerServicePickerModal
        visible={
          showServiceModal
        }
        services={
          services
        }
        selectedServices={
          selectedServices
        }
        onToggle={
          handleToggleService
        }
        onClose={
          handleCloseServiceModal
        }
        onContinue={
          handleContinueToBooking
        }
      />

      {/* ========================================================
          LOGIN REQUIRED MODAL
      ======================================================== */}

      <Modal
        visible={
          showLoginRequiredModal
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowLoginRequiredModal(
            false,
          )
        }
      >
        <View
          style={
            styles.loginModalOverlay
          }
        >
          <View
            style={
              styles.loginModal
            }
          >
            <View
              style={
                styles.loginModalIcon
              }
            >
              <Ionicons
                name="lock-closed-outline"
                size={42}
                color="#2563EB"
              />
            </View>

            <AppText
              weight="bold"
              style={
                styles.loginModalTitle
              }
            >
              Login Required
            </AppText>

            <AppText
              style={
                styles.loginModalText
              }
            >
              Please login to your
              Fixxam account before
              contacting this worker.
            </AppText>

            <View
              style={
                styles.loginModalActions
              }
            >
              <Pressable
                onPress={() =>
                  setShowLoginRequiredModal(
                    false,
                  )
                }
                style={({ pressed }) => [
                  styles.loginCancelButton,

                  pressed &&
                    styles.modalPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Cancel login"
              >
                <AppText
                  weight="bold"
                  style={
                    styles.loginCancelText
                  }
                >
                  Cancel
                </AppText>
              </Pressable>

              <Pressable
                onPress={
                  handleLoginFromModal
                }
                style={({ pressed }) => [
                  styles.loginButton,

                  pressed &&
                    styles.modalPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Login to continue"
              >
                <Ionicons
                  name="log-in-outline"
                  size={21}
                  color="#FFFFFF"
                />

                <AppText
                  weight="bold"
                  style={
                    styles.loginButtonText
                  }
                >
                  Login
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================
          CALL MODAL
      ======================================================== */}

      <Modal
        visible={
          showCallModal
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowCallModal(
            false,
          )
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
                size={42}
                color="#2563EB"
              />
            </View>

            <AppText
              weight="bold"
              style={
                styles.callModalTitle
              }
            >
              Call {workerName}?
            </AppText>

            <AppText
              style={
                styles.callModalDistance
              }
            >
              {workerPhone
                ? "This worker has a phone number available."
                : "This worker has not added a public phone number."}
            </AppText>

            <AppText
              style={
                styles.callModalQuestion
              }
            >
              {workerPhone
                ? "Do you want to call this worker?"
                : "Calling is unavailable for this worker."}
            </AppText>

            <View
              style={
                styles.callModalActions
              }
            >
              <Pressable
                onPress={() =>
                  setShowCallModal(
                    false,
                  )
                }
                style={({ pressed }) => [
                  styles.callCancelButton,

                  pressed &&
                    styles.modalPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Cancel call"
              >
                <AppText
                  weight="bold"
                  style={
                    styles.callCancelText
                  }
                >
                  Cancel
                </AppText>
              </Pressable>

              <Pressable
                onPress={
                  handleConfirmCallWorker
                }
                disabled={
                  !workerPhone
                }
                style={({ pressed }) => [
                  styles.callConfirmButton,

                  !workerPhone &&
                    styles.callDisabled,

                  pressed &&
                    workerPhone &&
                    styles.modalPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Call ${workerName}`}
              >
                <Ionicons
                  name="call-outline"
                  size={21}
                  color="#FFFFFF"
                />

                <AppText
                  weight="bold"
                  style={
                    styles.callConfirmText
                  }
                >
                  Call Worker
                </AppText>
              </Pressable>
            </View>
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
    screen: {
      flex: 1,
      backgroundColor:
        "#F8FAFC",
    },

    listContent: {
      paddingBottom: 24,
    },

    centerScreen: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal: 24,
      backgroundColor:
        "#F8FAFC",
    },

    notFoundIcon: {
      width: 76,
      height: 76,
      borderRadius: 24,
      backgroundColor:
        "#F1F5F9",
      alignItems: "center",
      justifyContent:
        "center",
    },

    notFoundTitle: {
      marginTop: 18,
      fontSize: 18,
      color: "#0F172A",
    },

    notFoundText: {
      marginTop: 8,
      textAlign: "center",
      fontSize: 14,
      lineHeight: 21,
      color: "#64748B",
    },

    backButton: {
      marginTop: 20,
      minWidth: 120,
      height: 44,
      paddingHorizontal: 18,
      borderRadius: 13,
      backgroundColor:
        "#2563EB",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 7,
    },

    backButtonText: {
      fontSize: 14,
      color: "#FFFFFF",
    },

    /* ==========================================================
       LOGIN MODAL
    ========================================================== */

    loginModalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(15, 23, 42, 0.48)",
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal: 28,
    },

    loginModal: {
      width: "100%",
      maxWidth: 360,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 22,
      paddingBottom: 18,
    },

    loginModalIcon: {
      width: 80,
      height: 80,
      borderRadius: 24,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent:
        "center",
      alignSelf: "center",
      marginBottom: 18,
    },

    loginModalTitle: {
      fontSize: 24,
      lineHeight: 30,
      color: "#0F172A",
      textAlign: "center",
    },

    loginModalText: {
      marginTop: 10,
      fontSize: 15,
      lineHeight: 23,
      color: "#64748B",
      textAlign: "center",
      paddingHorizontal: 10,
    },

    loginModalActions: {
      flexDirection: "row",
      gap: 12,
      marginTop: 24,
    },

    loginCancelButton: {
      flex: 1,
      height: 54,
      borderRadius: 16,
      backgroundColor:
        "#F1F5F9",
      alignItems: "center",
      justifyContent:
        "center",
    },

    loginCancelText: {
      fontSize: 15,
      color: "#475569",
    },

    loginButton: {
      flex: 1,
      height: 54,
      borderRadius: 16,
      backgroundColor:
        "#2563EB",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 7,
    },

    loginButtonText: {
      fontSize: 15,
      color: "#FFFFFF",
    },

    /* ==========================================================
       CALL MODAL
    ========================================================== */

    callModalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(15, 23, 42, 0.48)",
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal: 28,
    },

    callModal: {
      width: "100%",
      maxWidth: 360,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 22,
      paddingHorizontal: 18,
      paddingTop: 22,
      paddingBottom: 16,
    },

    callModalIcon: {
      width: 68,
      height: 68,
      borderRadius: 20,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent:
        "center",
      alignSelf: "center",
      marginBottom: 16,
    },

    callModalTitle: {
      fontSize: 20,
      lineHeight: 25,
      color: "#0F172A",
      textAlign: "center",
    },

    callModalDistance: {
      marginTop: 8,
      fontSize: 13,
      lineHeight: 19,
      color: "#64748B",
      textAlign: "center",
    },

    callModalQuestion: {
      marginTop: 10,
      fontSize: 13,
      lineHeight: 19,
      color: "#334155",
      textAlign: "center",
    },

    callModalActions: {
      flexDirection: "row",
      gap: 10,
      marginTop: 18,
    },

    callCancelButton: {
      flex: 1,
      height: 46,
      borderRadius: 13,
      backgroundColor:
        "#F1F5F9",
      alignItems: "center",
      justifyContent:
        "center",
    },

    callCancelText: {
      fontSize: 14,
      color: "#475569",
    },

    callConfirmButton: {
      flex: 1,
      height: 46,
      borderRadius: 13,
      backgroundColor:
        "#2563EB",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 6,
      paddingHorizontal: 8,
    },

    callDisabled: {
      backgroundColor:
        "#CBD5E1",
    },

    callConfirmText: {
      fontSize: 14,
      color: "#FFFFFF",
    },

    /* ==========================================================
       PRESSED
    ========================================================== */

    modalPressed: {
      opacity: 0.78,
      transform: [
        {
          scale: 0.98,
        },
      ],
    },

    pressed: {
      opacity: 0.78,
      transform: [
        {
          scale: 0.98,
        },
      ],
    },
  });