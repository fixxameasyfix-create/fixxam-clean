import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Alert,
  AppState,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { Image } from "expo-image";

import {
  router,
  useFocusEffect,
} from "expo-router";

import {
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";

import {
  getDownloadURL,
  getStorage,
  ref,
} from "firebase/storage";

import {
  AppCard,
  AppIcon,
  AppText,
} from "@/components/ui";

import { getPublicWorkers } from "@/firebase/queries/workerPublicProfiles";
import { workerMapper } from "@/firebase/mappers/workerMapper";

import {
  getRecentlyContactedWorkers,
  subscribeToRecentlyContactedWorkers,
  type RecentlyContactedWorker,
} from "@/services/storage/recentlyContactedWorkers";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   CONSTANTS
============================================================ */

const HOME_RECENT_LIMIT = 3;

const RELATIVE_TIME_REFRESH_INTERVAL = 60_000;

const PUBLIC_WORKER_CACHE_TTL = 60_000;

/* ============================================================
   TYPES
============================================================ */

type MappedPublicWorker = {
  id?: string;

  fullName?: string;

  firstName?: string;

  surname?: string;

  rating?: number | string;

  services?: Array<{
    name?: string;
  }>;

  workerProfile?: {
    photoUrl?: string;
    subcategory?: string;
    category?: string;
  };
};

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

function isHttpUrl(
  value: string,
): boolean {
  return (
    value.startsWith("https://") ||
    value.startsWith("http://")
  );
}

function isValidWorkerName(
  value: string,
): boolean {
  return (
    Boolean(value) &&
    value !== "Worker" &&
    value !== "Fixxam Worker"
  );
}

function isValidWorkerService(
  value: string,
): boolean {
  return (
    Boolean(value) &&
    value !== "Service Provider"
  );
}

function getMappedWorkerName(
  worker: MappedPublicWorker,
): string {
  const fullName = cleanString(
    worker.fullName,
  );

  if (fullName) {
    return fullName;
  }

  const firstName = cleanString(
    worker.firstName,
  );

  const surname = cleanString(
    worker.surname,
  );

  return `${firstName} ${surname}`.trim();
}

function getMappedWorkerService(
  worker: MappedPublicWorker,
): string {
  const subcategory = cleanString(
    worker.workerProfile?.subcategory,
  );

  if (subcategory) {
    return subcategory;
  }

  const category = cleanString(
    worker.workerProfile?.category,
  );

  if (category) {
    return category;
  }

  if (
    Array.isArray(
      worker.services,
    )
  ) {
    const firstService = cleanString(
      worker.services[0]?.name,
    );

    if (firstService) {
      return firstService;
    }
  }

  return "";
}

function getMappedWorkerRating(
  worker: MappedPublicWorker,
): number {
  const rating = Number(
    worker.rating,
  );

  if (
    !Number.isFinite(rating) ||
    rating <= 0
  ) {
    return 0;
  }

  return Math.min(
    5,
    Math.max(0, rating),
  );
}

/* ============================================================
   RELATIVE CALL TIME
============================================================ */

function formatRelativeCallTime(
  contactedAt: string,
  now: number,
): string {
  const contactedTime =
    Date.parse(contactedAt);

  if (
    !Number.isFinite(
      contactedTime,
    )
  ) {
    return "Recently called";
  }

  const difference = Math.max(
    0,
    now - contactedTime,
  );

  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;
  const MONTH = 30 * DAY;
  const YEAR = 365 * DAY;

  if (difference < MINUTE) {
    return "Called just now";
  }

  if (difference < HOUR) {
    const minutes = Math.floor(
      difference / MINUTE,
    );

    return `Called ${minutes} ${
      minutes === 1
        ? "min"
        : "mins"
    } ago`;
  }

  if (difference < DAY) {
    const hours = Math.floor(
      difference / HOUR,
    );

    return `Called ${hours} ${
      hours === 1
        ? "hour"
        : "hours"
    } ago`;
  }

  if (difference < WEEK) {
    const days = Math.floor(
      difference / DAY,
    );

    return `Called ${days} ${
      days === 1
        ? "day"
        : "days"
    } ago`;
  }

  if (difference < MONTH) {
    const weeks = Math.floor(
      difference / WEEK,
    );

    return `Called ${weeks} ${
      weeks === 1
        ? "week"
        : "weeks"
    } ago`;
  }

  if (difference < YEAR) {
    const months = Math.floor(
      difference / MONTH,
    );

    return `Called ${months} ${
      months === 1
        ? "month"
        : "months"
    } ago`;
  }

  const years = Math.floor(
    difference / YEAR,
  );

  return `Called ${years} ${
    years === 1
      ? "year"
      : "years"
  } ago`;
}

/* ============================================================
   AVATAR
============================================================ */

const RecentlyViewedAvatar = memo(
  function RecentlyViewedAvatar({
    uri,
    name,
  }: {
    uri: string;
    name: string;
  }) {
    const [
      resolvedUri,
      setResolvedUri,
    ] = useState("");

    const [
      imageFailed,
      setImageFailed,
    ] = useState(false);

    useEffect(() => {
      let cancelled = false;

      const source =
        typeof uri === "string"
          ? uri.trim()
          : "";

      setImageFailed(false);

      if (!source) {
        setResolvedUri("");

        return () => {
          cancelled = true;
        };
      }

      if (isHttpUrl(source)) {
        setResolvedUri(source);

        return () => {
          cancelled = true;
        };
      }

      const resolveStorageImage =
        async () => {
          try {
            const storage =
              getStorage();

            const storageRef =
              ref(
                storage,
                source,
              );

            const downloadUrl =
              await getDownloadURL(
                storageRef,
              );

            if (cancelled) {
              return;
            }

            setResolvedUri(
              downloadUrl,
            );
          } catch (error) {
            if (cancelled) {
              return;
            }

            console.warn(
              "RECENTLY_CALLED_IMAGE_RESOLVE_ERROR:",
              error,
            );

            setResolvedUri("");
          }
        };

      void resolveStorageImage();

      return () => {
        cancelled = true;
      };
    }, [uri]);

    const showImage =
      Boolean(
        resolvedUri.trim(),
      ) &&
      !imageFailed;

    if (!showImage) {
      return (
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
      );
    }

    return (
      <Image
        key={resolvedUri}
        source={{
          uri: resolvedUri,
        }}
        style={
          styles.image
        }
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={150}
        accessibilityRole="image"
        accessibilityLabel={`${name} profile photo`}
        onError={() => {
          setImageFailed(true);
        }}
      />
    );
  },
);

/* ============================================================
   CALL MODAL
============================================================ */

type CallWorkerModalProps = {
  visible: boolean;

  worker:
    | RecentlyContactedWorker
    | null;

  onCancel: () => void;

  onConfirm: () => void;
};

const CallWorkerModal = memo(
  function CallWorkerModal({
    visible,
    worker,
    onCancel,
    onConfirm,
  }: CallWorkerModalProps) {
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
              Start an in-app voice call
              with {worker.name}.
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              center
              style={
                styles.callModalQuestion
              }
            >
              You&apos;ll stay inside Fixxam
              and the worker&apos;s phone
              number won&apos;t be shown.
            </AppText>

            <View
              style={
                styles.callModalActions
              }
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel call"
                onPress={onCancel}
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

const RecentlyViewedCard = memo(
  function RecentlyViewedCard({
    item,
    now,
    onViewAgain,
  }: {
    item: RecentlyContactedWorker;

    now: number;

    onViewAgain: (
      worker: RecentlyContactedWorker,
    ) => void;
  }) {
    const callTime =
      formatRelativeCallTime(
        item.contactedAt,
        now,
      );

    const handleViewAgain =
      useCallback(() => {
        onViewAgain(item);
      }, [
        item,
        onViewAgain,
      ]);

    return (
      <AppCard
        role="customer"
        style={styles.card}
      >
        <RecentlyViewedAvatar
          uri={item.image}
          name={item.name}
        />

        <AppText
          variant="bodyMedium"
          weight="bold"
          numberOfLines={1}
          center
          style={styles.name}
        >
          {item.name}
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={1}
          center
          style={styles.service}
        >
          {item.service}
        </AppText>

        <View
          style={styles.ratingRow}
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
            style={styles.rating}
          >
            {item.rating > 0
              ? item.rating.toFixed(
                  1,
                )
              : "New"}
          </AppText>
        </View>

        <AppText
          variant="caption"
          tone="muted"
          numberOfLines={1}
          center
          style={styles.callTime}
        >
          {callTime}
        </AppText>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Call ${item.name} again`}
          onPress={
            handleViewAgain
          }
          style={({
            pressed,
          }) => [
            styles.button,

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
              styles.buttonText
            }
          >
            View Again
          </AppText>
        </Pressable>
      </AppCard>
    );
  },
);

/* ============================================================
   SEPARATOR
============================================================ */

function RecentlyViewedSeparator() {
  return (
    <View
      style={styles.separator}
    />
  );
}

/* ============================================================
   COMPONENT
============================================================ */

export default function RecentlyViewed() {
  const [
    userId,
    setUserId,
  ] = useState<
    string | null
  >(
    getAuth()
      .currentUser
      ?.uid ?? null,
  );

  const [
    workers,
    setWorkers,
  ] = useState<
    RecentlyContactedWorker[]
  >([]);

  const [
    loaded,
    setLoaded,
  ] = useState(false);

  const [
    now,
    setNow,
  ] = useState(Date.now());

  const [
    selectedWorker,
    setSelectedWorker,
  ] = useState<
    RecentlyContactedWorker | null
  >(null);

  /*
   * Cache authoritative public
   * worker information by worker ID.
   */
  const publicWorkersRef =
    useRef<
      Map<
        string,
        MappedPublicWorker
      >
    >(new Map());

  const publicWorkersLoadedAtRef =
    useRef(0);

  const loadRequestRef =
    useRef(0);

  /* ==========================================================
     AUTH STATE
  ========================================================== */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        getAuth(),
        (user) => {
          const nextUserId =
            user?.uid ?? null;

          setUserId(
            nextUserId,
          );

          if (!nextUserId) {
            loadRequestRef.current += 1;

            publicWorkersRef.current.clear();

            publicWorkersLoadedAtRef.current =
              0;

            setWorkers([]);

            setSelectedWorker(
              null,
            );

            setLoaded(true);
          }
        },
      );

    return unsubscribe;
  }, []);

  /* ==========================================================
     RESET PUBLIC CACHE WHEN USER CHANGES
  ========================================================== */

  useEffect(() => {
    publicWorkersRef.current.clear();

    publicWorkersLoadedAtRef.current =
      0;
  }, [userId]);

  /* ==========================================================
     RELATIVE TIME CLOCK
  ========================================================== */

  useEffect(() => {
    const interval =
      setInterval(() => {
        setNow(Date.now());
      }, RELATIVE_TIME_REFRESH_INTERVAL);

    const subscription =
      AppState.addEventListener(
        "change",
        (nextState) => {
          if (
            nextState ===
            "active"
          ) {
            setNow(
              Date.now(),
            );
          }
        },
      );

    return () => {
      clearInterval(
        interval,
      );

      subscription.remove();
    };
  }, []);

  /* ==========================================================
     LOAD PUBLIC WORKER CACHE
  ========================================================== */

  const loadPublicWorkerCache =
    useCallback(
      async (
        forceRefresh = false,
      ): Promise<
        Map<
          string,
          MappedPublicWorker
        >
      > => {
        const currentTime =
          Date.now();

        const cacheAge =
          currentTime -
          publicWorkersLoadedAtRef.current;

        const hasValidCache =
          publicWorkersLoadedAtRef.current >
            0 &&
          cacheAge <
            PUBLIC_WORKER_CACHE_TTL;

        if (
          !forceRefresh &&
          hasValidCache
        ) {
          return publicWorkersRef.current;
        }

        try {
          const publicWorkers =
            await getPublicWorkers();

          const workerMap =
            new Map<
              string,
              MappedPublicWorker
            >();

          /*
           * getPublicWorkers()
           * returns a Firestore
           * QuerySnapshot.
           *
           * QuerySnapshot itself is
           * not iterated directly.
           * We use .docs.
           */
          for (
            const document of publicWorkers.docs
          ) {
            try {
              const mapped =
                workerMapper(
                  document,
                ) as MappedPublicWorker;

              const workerId =
                cleanString(
                  mapped.id,
                );

              if (!workerId) {
                continue;
              }

              workerMap.set(
                workerId,
                mapped,
              );
            } catch (error) {
              console.warn(
                "RECENTLY_CALLED_WORKER_MAP_ERROR:",
                error,
              );
            }
          }

          publicWorkersRef.current =
            workerMap;

          publicWorkersLoadedAtRef.current =
            Date.now();

          return workerMap;
        } catch (error) {
          console.error(
            "RECENTLY_CALLED_PUBLIC_WORKERS_ERROR:",
            error,
          );

          /*
           * Keep the previous valid
           * cache during temporary
           * Firestore/network failures.
           */
          return publicWorkersRef.current;
        }
      },
      [],
    );

  /* ==========================================================
     HYDRATE RECENT WORKERS
  ========================================================== */

  const hydrateRecentWorkers =
    useCallback(
      async (
        recentWorkers: RecentlyContactedWorker[],
        forcePublicRefresh = false,
      ): Promise<
        RecentlyContactedWorker[]
      > => {
        if (
          recentWorkers.length ===
          0
        ) {
          return [];
        }

        const workerMap =
          await loadPublicWorkerCache(
            forcePublicRefresh,
          );

        if (
          workerMap.size === 0
        ) {
          return recentWorkers;
        }

        /*
         * Public worker information
         * is authoritative.
         *
         * Local recently-called data
         * remains the fallback.
         */
        return recentWorkers.map(
          (recentWorker) => {
            const publicWorker =
              workerMap.get(
                recentWorker.id,
              );

            /*
             * Worker is no longer
             * available in public
             * profiles.
             *
             * Keep local snapshot.
             */
            if (!publicWorker) {
              return recentWorker;
            }

            const mappedName =
              getMappedWorkerName(
                publicWorker,
              );

            const mappedService =
              getMappedWorkerService(
                publicWorker,
              );

            const mappedRating =
              getMappedWorkerRating(
                publicWorker,
              );

            const publicPhoto =
              cleanString(
                publicWorker
                  .workerProfile
                  ?.photoUrl,
              );

            /*
             * workerMapper only exposes
             * valid HTTPS public photos.
             *
             * If public photo is missing,
             * keep the locally stored image.
             */
            const resolvedImage =
              isHttpUrl(
                publicPhoto,
              )
                ? publicPhoto
                : cleanString(
                    recentWorker.image,
                  );

            return {
              ...recentWorker,

              /*
               * Use current public name
               * when it is valid.
               */
              name:
                isValidWorkerName(
                  mappedName,
                )
                  ? mappedName
                  : recentWorker.name,

              /*
               * Use current public service
               * when it is valid.
               */
              service:
                isValidWorkerService(
                  mappedService,
                )
                  ? mappedService
                  : recentWorker.service,

              /*
               * Use current public rating
               * when available.
               */
              rating:
                mappedRating > 0
                  ? mappedRating
                  : recentWorker.rating,

              /*
               * Use current public photo
               * when available.
               */
              image:
                resolvedImage ||
                recentWorker.image,
            };
          },
        );
      },
      [
        loadPublicWorkerCache,
      ],
    );

  /* ==========================================================
     LOAD RECENT WORKERS
  ========================================================== */

  const loadRecentWorkers =
    useCallback(
      async (
        forcePublicRefresh = false,
      ) => {
        const requestId =
          ++loadRequestRef.current;

        if (!userId) {
          setWorkers([]);

          setLoaded(true);

          return;
        }

        try {
          const recentWorkers =
            await getRecentlyContactedWorkers(
              userId,
            );

          if (
            requestId !==
            loadRequestRef.current
          ) {
            return;
          }

          const hydratedWorkers =
            await hydrateRecentWorkers(
              recentWorkers,
              forcePublicRefresh,
            );

          if (
            requestId !==
            loadRequestRef.current
          ) {
            return;
          }

          setWorkers(
            hydratedWorkers,
          );

          setNow(Date.now());
        } catch (error) {
          if (
            requestId !==
            loadRequestRef.current
          ) {
            return;
          }

          console.error(
            "LOAD_RECENTLY_CALLED_ERROR:",
            error,
          );
        } finally {
          if (
            requestId ===
            loadRequestRef.current
          ) {
            setLoaded(true);
          }
        }
      },
      [
        userId,
        hydrateRecentWorkers,
      ],
    );

  /* ==========================================================
     LOAD ON USER CHANGE
  ========================================================== */

  useEffect(() => {
    setLoaded(false);

    void loadRecentWorkers(
      true,
    );
  }, [
    loadRecentWorkers,
  ]);

  /* ==========================================================
     LIVE STORAGE SUBSCRIPTION
  ========================================================== */

  useEffect(() => {
    if (!userId) {
      return;
    }

    const unsubscribe =
      subscribeToRecentlyContactedWorkers(
        userId,
        (recentWorkers) => {
          void (async () => {
            const hydratedWorkers =
              await hydrateRecentWorkers(
                recentWorkers,
                false,
              );

            setWorkers(
              hydratedWorkers,
            );

            setNow(Date.now());

            setLoaded(true);
          })();
        },
      );

    return unsubscribe;
  }, [
    userId,
    hydrateRecentWorkers,
  ]);

  /* ==========================================================
     REFRESH WHEN SCREEN GETS FOCUS
  ========================================================== */

  useFocusEffect(
    useCallback(() => {
      setNow(Date.now());

      /*
       * Refresh public worker data
       * so updated name, photo,
       * service and rating appear
       * when customer returns.
       */
      void loadRecentWorkers(
        true,
      );
    }, [
      loadRecentWorkers,
    ]),
  );

  /* ==========================================================
     HOME LIST
  ========================================================== */

  const visibleWorkers =
    useMemo(
      () =>
        workers.slice(
          0,
          HOME_RECENT_LIMIT,
        ),
      [workers],
    );

  const hasRecentWorkers =
    visibleWorkers.length >
    0;

  /* ==========================================================
     VIEW AGAIN
  ========================================================== */

  const handleViewAgain =
    useCallback(
      (
        worker: RecentlyContactedWorker,
      ) => {
        setSelectedWorker(
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
      setSelectedWorker(
        null,
      );
    }, []);

  /* ==========================================================
     START IN-APP CALL
  ========================================================== */

  const handleConfirmCall =
    useCallback(() => {
      if (!selectedWorker) {
        return;
      }

      const authUser =
        getAuth()
          .currentUser;

      if (!authUser) {
        Alert.alert(
          "Login required",
          "Please login again to contact this worker.",
        );

        return;
      }

      const worker =
        selectedWorker;

      setSelectedWorker(
        null,
      );

      /*
       * EXISTING CALL NAVIGATION
       * REMAINS UNCHANGED.
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
      selectedWorker,
    ]);

  /* ==========================================================
     SEE ALL
  ========================================================== */

  const handleSeeAll =
    useCallback(() => {
      router.push(
        "/recently-called",
      );
    }, []);

  /* ==========================================================
     UI
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
          style={
            styles.title
          }
        >
          Recently Called
        </AppText>

        {hasRecentWorkers ? (
          <Pressable
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="See all recently contacted workers"
            onPress={
              handleSeeAll
            }
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
        ) : null}
      </View>

      {/* ======================================================
          EMPTY STATE / LIST
      ====================================================== */}

      {!hasRecentWorkers ? (
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
              name="phone"
              role="customer"
              size="lg"
              state="muted"
            />
          </View>

          <AppText
            variant="bodyMedium"
            weight="bold"
            center
            style={
              styles.emptyTitle
            }
          >
            {loaded
              ? "No recent calls"
              : "Checking recent calls..."}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            center
            style={
              styles.emptyText
            }
          >
            {loaded
              ? "You haven't contacted any worker yet. Workers you call will appear here."
              : "Your recently contacted workers will appear here."}
          </AppText>
        </View>
      ) : (
        <FlatList
          horizontal
          data={
            visibleWorkers
          }
          keyExtractor={(
            item,
          ) => item.id}
          renderItem={({
            item,
          }) => (
            <RecentlyViewedCard
              item={item}
              now={now}
              onViewAgain={
                handleViewAgain
              }
            />
          )}
          ItemSeparatorComponent={
            RecentlyViewedSeparator
          }
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.list
          }
          initialNumToRender={
            HOME_RECENT_LIMIT
          }
          maxToRenderPerBatch={
            HOME_RECENT_LIMIT
          }
          windowSize={3}
        />
      )}

      {/* ======================================================
          IN-APP CALL CONFIRMATION
      ====================================================== */}

      <CallWorkerModal
        visible={Boolean(
          selectedWorker,
        )}
        worker={
          selectedWorker
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
    /* ========================================================
       CONTAINER
    ======================================================== */

    container: {
      marginBottom:
        FixxamTokens.spacing.xl,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      marginBottom:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",
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

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xxs,

      borderRadius:
        FixxamTokens.radius.sm,
    },

    seeAll: {
      color:
        CustomerColors.primary,
    },

    seeAllPressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyContainer: {
      minHeight: 150,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingVertical:
        FixxamTokens.spacing.xl,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    emptyIcon: {
      width: 56,

      height: 56,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

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
      maxWidth: 290,

      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 19,
    },

    /* ========================================================
       LIST
    ======================================================== */

    list: {
      paddingRight:
        FixxamTokens.spacing.md,
    },

    separator: {
      width:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      width: 170,

      padding:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       IMAGE
    ======================================================== */

    image: {
      width: 62,

      height: 62,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    imagePlaceholder: {
      width: 62,

      height: 62,

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
       NAME
    ======================================================== */

    name: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       SERVICE
    ======================================================== */

    service: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       RATING
    ======================================================== */

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

    /* ========================================================
       CALL TIME
    ======================================================== */

    callTime: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textMuted,
    },

    /* ========================================================
       VIEW AGAIN
    ======================================================== */

    button: {
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

      justifyContent:
        "center",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    buttonText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       CALL MODAL
    ======================================================== */

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

      ...FixxamTokens.shadow.modal,
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

    /* ========================================================
       PRESS
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