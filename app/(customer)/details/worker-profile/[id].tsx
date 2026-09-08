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
  FlatList,
  Linking,
  Modal,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";

import {
  AppButton,
  AppCard,
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  auth,
} from "@/firebase/config";

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

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

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

  phoneNumber?: string;

  category?: string;

  subcategory?: string;

  location?: string;

  lga?: string;

  state?: string;

  experience?:
    | string
    | number;

  hourlyRate?: number;

  aboutMe?: string;

  latitude?: number | null;

  longitude?: number | null;

  selectedServices?: string[];

  serviceDetails?: WorkerServiceDetails;
};

type WorkerData = {
  id: string;

  uid?: string;

  firstName?: string;

  otherName?: string;

  surname?: string;

  name?: string;

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

  workGallery?: unknown[];

  workerProfile?: WorkerProfile;
};

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

function cleanStringArray(
  value: unknown,
): string[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter(
          (
            item,
          ): item is string =>
            typeof item ===
              "string" &&
            item.trim().length >
              0,
        )
        .map(
          (
            item,
          ) =>
            item.trim(),
        ),
    ),
  );
}

function toNumber(
  value: unknown,
  fallback = 0,
): number {
  if (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
  ) {
    return value;
  }

  if (
    typeof value ===
    "string"
  ) {
    const parsed =
      Number(
        value,
      );

    if (
      Number.isFinite(
        parsed,
      )
    ) {
      return parsed;
    }
  }

  return fallback;
}

function normalizePhoneNumber(
  value: string,
): string {
  let phone =
    value.trim();

  if (
    !phone
  ) {
    return "";
  }

  phone =
    phone.replace(
      /[^\d+]/g,
      "",
    );

  /*
   * Nigerian local:
   * 08012345678
   */
  if (
    phone.startsWith(
      "0",
    ) &&
    phone.length === 11
  ) {
    return `+234${phone.slice(
      1,
    )}`;
  }

  /*
   * Nigerian international:
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
    return `+${phone}`;
  }

  return phone;
}

/* ==============================================================
   NORMALIZE PROFILE
============================================================== */

function normalizeWorkerProfile(
  data:
    Record<
      string,
      unknown
    >,
): WorkerProfile {
  const rawNested =
    data.workerProfile;

  const nested =
    rawNested &&
    typeof rawNested ===
      "object"
      ? (rawNested as Record<
          string,
          unknown
        >)
      : {};

  const rawServiceDetails =
    nested.serviceDetails;

  const serviceDetails =
    rawServiceDetails &&
    typeof rawServiceDetails ===
      "object"
      ? (rawServiceDetails as Record<
          string,
          unknown
        >)
      : undefined;

  const photoUrl =
    cleanString(
      data.photoURL,
    ) ||
    cleanString(
      data.photoUrl,
    ) ||
    cleanString(
      nested.photoURL,
    ) ||
    cleanString(
      nested.photoUrl,
    );

  const phoneNumber =
    cleanString(
      data.phoneNumber,
    ) ||
    cleanString(
      nested.phoneNumber,
    ) ||
    cleanString(
      data.phone,
    ) ||
    cleanString(
      nested.phone,
    );

  const location =
    cleanString(
      data.location,
    ) ||
    cleanString(
      nested.location,
    );

  const experience =
    data.experience !==
    undefined
      ? data.experience
      : nested.experience;

  const rate =
    data.rate !==
    undefined
      ? data.rate
      : data.hourlyRate !==
          undefined
        ? data.hourlyRate
        : nested.rate !==
            undefined
          ? nested.rate
          : nested.hourlyRate;

  const aboutMe =
    cleanString(
      data.aboutMe,
    ) ||
    cleanString(
      data.about,
    ) ||
    cleanString(
      nested.aboutMe,
    ) ||
    cleanString(
      nested.about,
    );

  const rootSelectedServices =
    cleanStringArray(
      data.selectedServices,
    );

  const nestedSelectedServices =
    cleanStringArray(
      nested.selectedServices,
    );

  const selectedServices =
    rootSelectedServices.length >
    0
      ? rootSelectedServices
      : nestedSelectedServices;

  return {
    photoUrl,

    phoneNumber,

    category:
      cleanString(
        data.category,
      ) ||
      cleanString(
        nested.category,
      ),

    subcategory:
      cleanString(
        data.subcategory,
      ) ||
      cleanString(
        nested.subcategory,
      ),

    location,

    lga:
      cleanString(
        data.lga,
      ) ||
      cleanString(
        nested.lga,
      ),

    state:
      cleanString(
        data.state,
      ) ||
      cleanString(
        nested.state,
      ),

    experience:
      typeof experience ===
        "string" ||
      typeof experience ===
        "number"
        ? experience
        : "",

    hourlyRate:
      toNumber(
        rate,
        0,
      ),

    aboutMe,

    latitude:
      typeof data.latitude ===
      "number"
        ? data.latitude
        : typeof nested.latitude ===
            "number"
          ? nested.latitude
          : null,

    longitude:
      typeof data.longitude ===
      "number"
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
  const params =
    useLocalSearchParams<{
      id?: string;

      serviceId?: string;

      service?: string;

      serviceIcon?: string;

      categoryId?: string;

      reward?: string;

      action?: string;
    }>();

  const workerId =
    cleanString(
      params.id,
    );

  const service =
    cleanString(
      params.service,
    );

  const serviceIcon =
    cleanString(
      params.serviceIcon,
    );

  const categoryId =
    cleanString(
      params.categoryId,
    );

  const reward =
    cleanString(
      params.reward,
    );

  const action =
    cleanString(
      params.action,
    );

  /* ============================================================
     REQUEST CONTROL
  ============================================================ */

  const workerRequestIdRef =
    useRef(0);

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
      auth.currentUser,
    );

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
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

  /* ============================================================
     WORKER
  ============================================================ */

  const [
    worker,
    setWorker,
  ] =
    useState<
      WorkerData | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    workerLoadError,
    setWorkerLoadError,
  ] =
    useState<
      string | null
    >(null);

  /* ============================================================
     SERVICES
  ============================================================ */

  const [
    services,
    setServices,
  ] =
    useState<
      WorkerService[]
    >([]);

  const [
    servicesLoading,
    setServicesLoading,
  ] =
    useState(false);

  const [
    servicesLoadError,
    setServicesLoadError,
  ] =
    useState(false);

  const [
    selectedServices,
    setSelectedServices,
  ] =
    useState<
      string[]
    >([]);

  const [
    showServiceModal,
    setShowServiceModal,
  ] =
    useState(false);

  /* ============================================================
     CALL
  ============================================================ */

  const [
    showCallModal,
    setShowCallModal,
  ] =
    useState(false);

  const [
    showLoginRequiredModal,
    setShowLoginRequiredModal,
  ] =
    useState(false);

  /* ============================================================
     LOAD WORKER
  ============================================================ */

  const loadWorker =
    useCallback(async () => {
      const cleanWorkerId =
        cleanString(
          workerId,
        );

      const requestId =
        ++workerRequestIdRef.current;

      if (
        !cleanWorkerId
      ) {
        setWorker(
          null,
        );

        setWorkerLoadError(
          null,
        );

        setLoading(
          false,
        );

        return;
      }

      try {
        setLoading(
          true,
        );

        setWorkerLoadError(
          null,
        );

        const snapshot =
          await getPublicWorker(
            cleanWorkerId,
          );

        if (
          requestId !==
          workerRequestIdRef.current
        ) {
          return;
        }

        if (
          !snapshot.exists()
        ) {
          setWorker(
            null,
          );

          return;
        }

        const data =
          snapshot.data() as Record<
            string,
            unknown
          >;

        const normalizedProfile =
          normalizeWorkerProfile(
            data,
          );

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
          topLevelGallery.length >
          0
            ? topLevelGallery
            : nestedGallery;

        setWorker({
          id:
            snapshot.id,

          uid:
            cleanString(
              data.uid,
            ) ||
            cleanString(
              data.userId,
            ) ||
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

          fullName:
            cleanString(
              data.fullName,
            ),

          name:
            cleanString(
              data.name,
            ),

          rating:
            Math.min(
              5,
              Math.max(
                0,
                toNumber(
                  data.rating,
                  0,
                ),
              ),
            ),

          totalReviews:
            Math.max(
              0,
              toNumber(
                data.totalReviews,
                0,
              ),
            ),

          completedJobs:
            Math.max(
              0,
              toNumber(
                data.completedJobs,
                0,
              ),
            ),

          verified:
            data.verified ===
            true,

          online:
            data.online ===
            true,

          available:
            data.available !==
            false,

          phoneNumber:
            cleanString(
              data.phoneNumber,
            ) ||
            undefined,

          phone:
            cleanString(
              data.phone,
            ) ||
            undefined,

          mobileNumber:
            cleanString(
              data.mobileNumber,
            ) ||
            undefined,

          reviews:
            Array.isArray(
              data.reviews,
            )
              ? data.reviews
              : [],

          workGallery,

          workerProfile:
            normalizedProfile,
        });
      } catch (
        error
      ) {
        if (
          requestId !==
          workerRequestIdRef.current
        ) {
          return;
        }

        console.error(
          "LOAD_PUBLIC_WORKER_PROFILE_ERROR:",
          error,
        );

        setWorker(
          null,
        );

        setWorkerLoadError(
          "We couldn't load this worker profile. Please try again.",
        );
      } finally {
        if (
          requestId ===
          workerRequestIdRef.current
        ) {
          setLoading(
            false,
          );
        }
      }
    }, [
      workerId,
    ]);

  /* ============================================================
     INITIAL WORKER LOAD
  ============================================================ */

  useEffect(() => {
    void loadWorker();

    return () => {
      workerRequestIdRef.current +=
        1;
    };
  }, [
    loadWorker,
  ]);

  /* ============================================================
     PROFILE
  ============================================================ */

  const workerProfile =
    worker?.workerProfile;

  /* ============================================================
     NAME
  ============================================================ */

  const workerName =
    useMemo(() => {
      const fullName =
        cleanString(
          worker?.fullName,
        );

      if (
        fullName
      ) {
        return fullName;
      }

      const individualName =
        [
          worker?.firstName,
          worker?.otherName,
          worker?.surname,
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

      return (
        cleanString(
          worker?.name,
        ) ||
        "Worker"
      );
    }, [
      worker?.firstName,
      worker?.fullName,
      worker?.name,
      worker?.otherName,
      worker?.surname,
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

  const workerLocation =
    useMemo(() => {
      const directLocation =
        cleanString(
          workerProfile
            ?.location,
        );

      if (
        directLocation
      ) {
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
        .filter(
          Boolean,
        )
        .join(
          ", ",
        );
    }, [
      workerProfile?.lga,
      workerProfile?.location,
      workerProfile?.state,
    ]);

  /* ============================================================
     PHONE
  ============================================================ */

  const workerPhone =
    useMemo(() => {
      if (
        !worker
      ) {
        return "";
      }

      return (
        cleanString(
          workerProfile
            ?.phoneNumber,
        ) ||
        cleanString(
          worker.phoneNumber,
        ) ||
        cleanString(
          worker.phone,
        ) ||
        cleanString(
          worker.mobileNumber,
        )
      );
    }, [
      worker,
      workerProfile
        ?.phoneNumber,
    ]);

  /* ============================================================
     LOAD SERVICES
  ============================================================ */

  useEffect(() => {
    let active =
      true;

    async function loadServices() {
      const cleanIds =
        cleanStringArray(
          workerProfile
            ?.selectedServices,
        );

      if (
        cleanIds.length ===
        0
      ) {
        if (
          active
        ) {
          setServices(
            [],
          );

          setSelectedServices(
            [],
          );

          setServicesLoadError(
            false,
          );

          setServicesLoading(
            false,
          );
        }

        return;
      }

      try {
        setServicesLoading(
          true,
        );

        setServicesLoadError(
          false,
        );

        const result =
          await getServicesByIds(
            cleanIds,
          );

        if (
          !active
        ) {
          return;
        }

        const mapped =
          result
            .map(
              (
                serviceItem:
                  ServiceCardData,
              ): WorkerService => ({
                id:
                  cleanString(
                    serviceItem.id,
                  ),

                name:
                  cleanString(
                    serviceItem.name,
                  ) ||
                  "Unnamed Service",

                price:
                  typeof serviceItem.price ===
                    "number" &&
                  Number.isFinite(
                    serviceItem.price,
                  )
                    ? Math.max(
                        0,
                        serviceItem.price,
                      )
                    : 0,

                /*
                 * Keep the exact
                 * service icon.
                 */
                icon:
                  cleanString(
                    serviceItem.icon,
                  ) ||
                  "construct-outline",

                color:
                  cleanString(
                    serviceItem.color,
                  ) ||
                  CustomerColors.primary,

                backgroundColor:
                  cleanString(
                    serviceItem.backgroundColor,
                  ) ||
                  CustomerColors.primarySoft,
              }),
            )
            .filter(
              (
                item,
              ) =>
                Boolean(
                  item.id,
                ),
            );

        setServices(
          mapped,
        );

        /*
         * Remove selections that no
         * longer exist.
         */
        setSelectedServices(
          (
            previous,
          ) =>
            previous.filter(
              (
                selectedId,
              ) =>
                mapped.some(
                  (
                    item,
                  ) =>
                    item.id ===
                    selectedId,
                ),
            ),
        );
      } catch (
        error
      ) {
        console.error(
          "LOAD_WORKER_SERVICES_ERROR:",
          error,
        );

        if (
          active
        ) {
          setServices(
            [],
          );

          setSelectedServices(
            [],
          );

          setServicesLoadError(
            true,
          );
        }
      } finally {
        if (
          active
        ) {
          setServicesLoading(
            false,
          );
        }
      }
    }

    void loadServices();

    return () => {
      active =
        false;
    };
  }, [
    workerProfile
      ?.selectedServices,
  ]);

  /* ============================================================
     GALLERY
  ============================================================ */

  const workGallery =
    useMemo<
      GalleryItem[]
    >(() => {
      const source =
        worker?.workGallery ??
        [];

      if (
        !Array.isArray(
          source,
        )
      ) {
        return [];
      }

      const result:
        GalleryItem[] =
        [];

      source.forEach(
        (
          item,
        ) => {
          if (
            typeof item ===
            "string"
          ) {
            const value =
              item.trim();

            if (
              value
            ) {
              result.push(
                value,
              );
            }

            return;
          }

          if (
            !item ||
            typeof item !==
              "object"
          ) {
            return;
          }

          const value =
            item as Record<
              string,
              unknown
            >;

          const url =
            cleanString(
              value.url,
            );

          const imageUrl =
            cleanString(
              value.imageUrl,
            );

          const uri =
            cleanString(
              value.uri,
            );

          if (
            url ||
            imageUrl ||
            uri
          ) {
            result.push({
              ...(url
                ? { url }
                : {}),

              ...(imageUrl
                ? {
                    imageUrl,
                  }
                : {}),

              ...(uri
                ? { uri }
                : {}),
            });
          }
        },
      );

      return result;
    }, [
      worker?.workGallery,
    ]);

  /* ============================================================
     REVIEWS
  ============================================================ */

  const reviews =
    useMemo<
      WorkerReview[]
    >(() => {
      const source =
        worker?.reviews;

      if (
        !Array.isArray(
          source,
        )
      ) {
        return [];
      }

      const result:
        WorkerReview[] =
        [];

      source.forEach(
        (
          item,
          index,
        ) => {
          if (
            !item ||
            typeof item !==
              "object"
          ) {
            return;
          }

          const value =
            item as Record<
              string,
              unknown
            >;

          result.push({
            id:
              cleanString(
                value.id,
              ) ||
              `review-${index}`,

            customerName:
              cleanString(
                value.customerName,
              ) ||
              "Customer",

            rating:
              Math.min(
                5,
                Math.max(
                  0,
                  toNumber(
                    value.rating,
                    0,
                  ),
                ),
              ),

            comment:
              cleanString(
                value.comment,
              ),

            date:
              cleanString(
                value.date,
              ),
          });
        },
      );

      return result;
    }, [
      worker?.reviews,
    ]);

  /* ============================================================
     CONTINUE CALL AFTER LOGIN
  ============================================================ */

  useEffect(() => {
    if (
      action !==
        "call" ||
      !worker ||
      !currentUser
    ) {
      return;
    }

    setShowCallModal(
      true,
    );

    /*
     * Route behavior preserved.
     */
    router.setParams({
      action:
        undefined,
    });
  }, [
    action,
    currentUser,
    worker,
  ]);

  /* ============================================================
     BOOK
  ============================================================ */

  const handleBook =
    useCallback(() => {
      if (
        servicesLoading
      ) {
        return;
      }

      if (
        services.length ===
        0
      ) {
        Alert.alert(
          "Services unavailable",
          servicesLoadError
            ? "We couldn't load this worker's services. Please try again later."
            : "This worker has not added any bookable services yet.",
        );

        return;
      }

      setShowServiceModal(
        true,
      );
    }, [
      services.length,
      servicesLoadError,
      servicesLoading,
    ]);

  /* ============================================================
     CLOSE SERVICE MODAL
  ============================================================ */

  const handleCloseServiceModal =
    useCallback(() => {
      setShowServiceModal(
        false,
      );
    }, []);

  /* ============================================================
     TOGGLE SERVICE
  ============================================================ */

  const handleToggleService =
    useCallback(
      (
        selectedServiceId:
          string,
      ) => {
        const cleanId =
          cleanString(
            selectedServiceId,
          );

        if (
          !cleanId
        ) {
          return;
        }

        setSelectedServices(
          (
            previous,
          ) => {
            if (
              previous.includes(
                cleanId,
              )
            ) {
              return previous.filter(
                (
                  item,
                ) =>
                  item !==
                  cleanId,
              );
            }

            if (
              previous.length >=
              4
            ) {
              return previous;
            }

            return [
              ...previous,
              cleanId,
            ];
          },
        );
      },
      [],
    );

  /* ============================================================
     CONTINUE BOOKING
  ============================================================ */

  const handleContinueToBooking =
    useCallback(() => {
      if (
        !worker ||
        selectedServices.length ===
          0
      ) {
        return;
      }

      /*
       * Existing booking behavior
       * is preserved:
       *
       * first selected service is
       * forwarded to BookingScreen.
       */
      const selectedServiceId =
        selectedServices[0];

      const selectedService =
        services.find(
          (
            item,
          ) =>
            item.id ===
            selectedServiceId,
        );

      if (
        !selectedService
      ) {
        return;
      }

      const resolvedServiceName =
        cleanString(
          selectedService.name,
        ) ||
        service;

      const resolvedServiceIcon =
        cleanString(
          selectedService.icon,
        ) ||
        serviceIcon ||
        "construct-outline";

      if (
        !selectedServiceId ||
        !resolvedServiceName
      ) {
        return;
      }

      setShowServiceModal(
        false,
      );

      /*
       * ROUTE PRESERVED.
       */
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
              workerProfile
                ?.category,
            ) ||
            "Service Provider",

          workerRating:
            String(
              worker.rating ??
                0,
            ),

          workerReviews:
            String(
              worker.totalReviews ??
                0,
            ),

          workerOnline:
            String(
              worker.online ??
                false,
            ),

          workerLocation,

          workerHourlyRate:
            String(
              workerProfile
                ?.hourlyRate ??
                0,
            ),

          workerVerified:
            String(
              worker.verified ??
                false,
            ),

          serviceId:
            selectedServiceId,

          serviceName:
            resolvedServiceName,

          serviceIcon:
            resolvedServiceIcon,

          ...(categoryId
            ? {
                categoryId,
              }
            : {}),

          ...(reward
            ? {
                reward,
              }
            : {}),
        },
      });
    }, [
      categoryId,
      reward,
      selectedServices,
      service,
      serviceIcon,
      services,
      worker,
      workerLocation,
      workerName,
      workerPhoto,
      workerProfile
        ?.category,
      workerProfile
        ?.hourlyRate,
    ]);

  /* ============================================================
     CALL WORKER
  ============================================================ */

  const handleCallWorker =
    useCallback(() => {
      if (
        !currentUser
      ) {
        setShowLoginRequiredModal(
          true,
        );

        return;
      }

      setShowCallModal(
        true,
      );
    }, [
      currentUser,
    ]);

  /* ============================================================
     LOGIN
  ============================================================ */

  const handleLoginFromModal =
    useCallback(() => {
      setShowLoginRequiredModal(
        false,
      );

      if (
        !workerId
      ) {
        return;
      }

      /*
       * EXACT returnTo preserved.
       */
      const returnTo =
        `/(customer)/details/worker-profile/${workerId}?action=call`;

      /*
       * ROUTE PRESERVED.
       */
      router.push({
        pathname:
          "/(auth)/login",

        params: {
          returnTo,
        },
      } as any);
    }, [
      workerId,
    ]);

  /* ============================================================
     CONFIRM CALL
  ============================================================ */

  const handleConfirmCallWorker =
    useCallback(async () => {
      const phoneNumber =
        normalizePhoneNumber(
          workerPhone,
        );

      if (
        !phoneNumber
      ) {
        setShowCallModal(
          false,
        );

        Alert.alert(
          "Phone unavailable",
          "This worker has not added a public phone number yet.",
        );

        return;
      }

      try {
        const url =
          `tel:${phoneNumber}`;

        const supported =
          await Linking.canOpenURL(
            url,
          );

        if (
          !supported
        ) {
          setShowCallModal(
            false,
          );

          Alert.alert(
            "Unable to call",
            "Your device cannot make phone calls.",
          );

          return;
        }

        setShowCallModal(
          false,
        );

        await Linking.openURL(
          url,
        );
      } catch (
        error
      ) {
        console.error(
          "CALL_WORKER_ERROR:",
          error,
        );

        setShowCallModal(
          false,
        );

        Alert.alert(
          "Unable to call",
          "We couldn't start the call. Please try again.",
        );
      }
    }, [
      workerPhone,
    ]);

  /* ============================================================
     LOADING
  ============================================================ */

  if (
    loading
  ) {
    return (
      <AppScreen
        role="customer"
        padded={false}
      >
        <View
          style={
            styles.centerScreen
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
            Loading worker profile...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     LOAD ERROR
  ============================================================ */

  if (
    workerLoadError
  ) {
    return (
      <AppScreen
        role="customer"
        padded={false}
      >
        <View
          style={
            styles.centerScreen
          }
        >
          <View
            style={[
              styles.stateIcon,
              styles.errorStateIcon,
            ]}
          >
            <AppIcon
              name="error"
              role="customer"
              size="lg"
              state="error"
            />
          </View>

          <AppText
            variant="heading2"
            weight="bold"
            center
            style={
              styles.stateTitle
            }
          >
            Unable to load worker
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.stateText
            }
          >
            {workerLoadError}
          </AppText>

          <AppButton
            title="Try Again"
            role="customer"
            leftIconName="refresh"
            onPress={
              loadWorker
            }
            style={
              styles.stateAction
            }
          />

          <AppButton
            title="Go Back"
            role="customer"
            variant="ghost"
            onPress={() =>
              router.back()
            }
            style={
              styles.secondaryStateAction
            }
          />
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     NOT FOUND
  ============================================================ */

  if (
    !worker
  ) {
    return (
      <AppScreen
        role="customer"
        padded={false}
      >
        <View
          style={
            styles.centerScreen
          }
        >
          <View
            style={
              styles.stateIcon
            }
          >
            <AppIcon
              name="profile"
              role="customer"
              size="lg"
              state="muted"
            />
          </View>

          <AppText
            variant="heading2"
            weight="bold"
            center
            style={
              styles.stateTitle
            }
          >
            Worker not found
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.stateText
            }
          >
            This worker profile is no
            longer available.
          </AppText>

          <AppButton
            title="Go Back"
            role="customer"
            leftIconName="back"
            onPress={() =>
              router.back()
            }
            style={
              styles.stateAction
            }
          />
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <>
      <AppScreen
        role="customer"
        padded={false}
      >
        <FlatList
          data={[
            worker,
          ]}
          keyExtractor={(
            item,
          ) =>
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
                  HERO
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
                  worker.rating ??
                  0
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
                  STATS
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
                  GALLERY
              ================================================== */}

              <WorkerGallery
                images={
                  workGallery
                }
              />

              {/* ==================================================
                  STORE
              ================================================== */}

              <WorkerStore
                workerId={
                  worker.id
                }
              />

              {/* ==================================================
                  ABOUT
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
                  REVIEWS
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
      </AppScreen>

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
          LOGIN REQUIRED
      ======================================================== */}

      <Modal
        visible={
          showLoginRequiredModal
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() =>
          setShowLoginRequiredModal(
            false,
          )
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <AppCard
            role="customer"
            variant="elevated"
            style={
              styles.modalCard
            }
          >
            <View
              style={
                styles.modalIcon
              }
            >
              <AppIcon
                name="lock"
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
              Login Required
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              center
              style={
                styles.modalDescription
              }
            >
              Please login to your
              Fixxam account before
              contacting this worker.
            </AppText>

            <View
              style={
                styles.modalActions
              }
            >
              <AppButton
                title="Cancel"
                role="customer"
                variant="outline"
                onPress={() =>
                  setShowLoginRequiredModal(
                    false,
                  )
                }
                style={
                  styles.modalAction
                }
              />

              <AppButton
                title="Login"
                role="customer"
                leftIconName="lock"
                onPress={
                  handleLoginFromModal
                }
                style={
                  styles.modalAction
                }
              />
            </View>
          </AppCard>
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
        statusBarTranslucent
        onRequestClose={() =>
          setShowCallModal(
            false,
          )
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <AppCard
            role="customer"
            variant="elevated"
            style={
              styles.modalCard
            }
          >
            <View
              style={
                styles.modalIcon
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
              Call {workerName}?
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              center
              style={
                styles.modalDescription
              }
            >
              {workerPhone
                ? "This worker has a phone number available."
                : "This worker has not added a public phone number."}
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              center
              style={
                styles.callQuestion
              }
            >
              {workerPhone
                ? "Do you want to call this worker?"
                : "Calling is unavailable for this worker."}
            </AppText>

            <View
              style={
                styles.modalActions
              }
            >
              <AppButton
                title="Cancel"
                role="customer"
                variant="outline"
                onPress={() =>
                  setShowCallModal(
                    false,
                  )
                }
                style={
                  styles.modalAction
                }
              />

              <AppButton
                title="Call Worker"
                role="customer"
                leftIconName="phone"
                disabled={
                  !workerPhone
                }
                onPress={
                  handleConfirmCallWorker
                }
                style={
                  styles.modalAction
                }
              />
            </View>
          </AppCard>
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
        FixxamTokens.size
          .tabBarHeight +
        FixxamTokens.spacing.xxl,

      backgroundColor:
        Colors.background,
    },

    /* ========================================================
       LOADING / STATE
    ======================================================== */

    centerScreen: {
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

    stateIcon: {
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
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.disabledBackground,
    },

    errorStateIcon: {
      backgroundColor:
        Colors.errorSoft,
    },

    stateTitle: {
      marginTop:
        FixxamTokens.spacing.lg,
    },

    stateText: {
      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.sm,
    },

    stateAction: {
      minWidth: 180,

      marginTop:
        FixxamTokens.spacing.lg,
    },

    secondaryStateAction: {
      minWidth: 180,

      marginTop:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       MODAL
    ======================================================== */

    modalOverlay: {
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

    modalCard: {
      width: "100%",

      maxWidth: 380,

      alignItems:
        "center",

      padding:
        FixxamTokens.spacing.xl,
    },

    modalIcon: {
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

    modalDescription: {
      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.md,
    },

    callQuestion: {
      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.sm,
    },

    modalActions: {
      width: "100%",

      flexDirection:
        "row",

      gap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.xl,
    },

    modalAction: {
      flex: 1,
    },
  });