import React, {
  memo,
  useCallback,
  useEffect,
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
  AppScreen,
  AppText,
} from "@/components/ui";

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

import {
  getPublicWorkers,
} from "@/firebase/queries/workerPublicProfiles";

import {
  workerMapper,
} from "@/firebase/mappers/workerMapper";

import type {
  WorkerCardData,
} from "@/components/customer/worker/types";

/* ============================================================
   CONSTANTS
============================================================ */

const RELATIVE_TIME_REFRESH_INTERVAL =
  60_000;

/* ============================================================
   TYPES
============================================================ */

type PublicWorker =
  ReturnType<
    typeof workerMapper
  >;

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

function isFallbackWorkerName(
  value: unknown,
): boolean {
  const name =
    cleanString(
      value,
    );

  return (
    !name ||
    name === "Worker" ||
    name === "Fixxam Worker"
  );
}

function isFallbackWorkerService(
  value: unknown,
): boolean {
  const service =
    cleanString(
      value,
    );

  return (
    !service ||
    service ===
      "Service Provider"
  );
}

/* ============================================================
   PUBLIC WORKER NAME
============================================================ */

function getPublicWorkerName(
  worker: PublicWorker,
): string {
  const fullName =
    cleanString(
      worker.fullName,
    );

  if (
    !isFallbackWorkerName(
      fullName,
    )
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

  const combined =
    [
      firstName,
      surname,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

  return combined;
}

/* ============================================================
   PUBLIC WORKER SERVICE
============================================================ */

function getPublicWorkerService(
  worker: PublicWorker,
): string {
  const subcategory =
    cleanString(
      worker.subcategory,
    );

  if (
    !isFallbackWorkerService(
      subcategory,
    )
  ) {
    return subcategory;
  }

  const category =
    cleanString(
      worker.category,
    );

  if (
    !isFallbackWorkerService(
      category,
    )
  ) {
    return category;
  }

  const firstService =
    cleanString(
      worker.services?.[0]
        ?.name,
    );

  if (
    !isFallbackWorkerService(
      firstService,
    )
  ) {
    return firstService;
  }

  return "";
}

/* ============================================================
   PUBLIC WORKER RATING
============================================================ */

function getPublicWorkerRating(
  worker: PublicWorker,
): number {
  const rating =
    typeof worker.rating ===
      "number" &&
    Number.isFinite(
      worker.rating,
    )
      ? worker.rating
      : 0;

  return Math.min(
    5,
    Math.max(
      0,
      rating,
    ),
  );
}

/* ============================================================
   RELATIVE CALL TIME
============================================================ */

function formatRelativeCallTime(
  contactedAt: string,
  now: number,
): string {
  const time = Date.parse(
    contactedAt,
  );

  if (
    !Number.isFinite(
      time,
    )
  ) {
    return "Recently called";
  }

  const difference =
    Math.max(
      0,
      now - time,
    );

  const MINUTE =
    60_000;

  const HOUR =
    60 * MINUTE;

  const DAY =
    24 * HOUR;

  const WEEK =
    7 * DAY;

  const MONTH =
    30 * DAY;

  const YEAR =
    365 * DAY;

  if (
    difference <
    MINUTE
  ) {
    return "Called just now";
  }

  if (
    difference <
    HOUR
  ) {
    const value =
      Math.floor(
        difference /
          MINUTE,
      );

    return `Called ${value} ${
      value === 1
        ? "min"
        : "mins"
    } ago`;
  }

  if (
    difference <
    DAY
  ) {
    const value =
      Math.floor(
        difference /
          HOUR,
      );

    return `Called ${value} ${
      value === 1
        ? "hour"
        : "hours"
    } ago`;
  }

  if (
    difference <
    WEEK
  ) {
    const value =
      Math.floor(
        difference /
          DAY,
      );

    return `Called ${value} ${
      value === 1
        ? "day"
        : "days"
    } ago`;
  }

  if (
    difference <
    MONTH
  ) {
    const value =
      Math.floor(
        difference /
          WEEK,
      );

    return `Called ${value} ${
      value === 1
        ? "week"
        : "weeks"
    } ago`;
  }

  if (
    difference <
    YEAR
  ) {
    const value =
      Math.floor(
        difference /
          MONTH,
      );

    return `Called ${value} ${
      value === 1
        ? "month"
        : "months"
    } ago`;
  }

  const value =
    Math.floor(
      difference /
        YEAR,
    );

  return `Called ${value} ${
    value === 1
      ? "year"
      : "years"
  } ago`;
}

/* ============================================================
   WORKER AVATAR
============================================================ */

const WorkerAvatar = memo(
  function WorkerAvatar({
    worker,
  }: {
    worker: RecentlyContactedWorker;
  }) {
    const [
      resolvedUri,
      setResolvedUri,
    ] = useState("");

    const [
      failed,
      setFailed,
    ] = useState(false);

    useEffect(() => {
      let cancelled =
        false;

      const source =
        typeof worker.image ===
        "string"
          ? worker.image.trim()
          : "";

      setFailed(false);

      if (!source) {
        setResolvedUri("");

        return () => {
          cancelled =
            true;
        };
      }

      if (
        isHttpUrl(
          source,
        )
      ) {
        setResolvedUri(
          source,
        );

        return () => {
          cancelled =
            true;
        };
      }

      const resolveImage =
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

            if (
              cancelled
            ) {
              return;
            }

            if (
              isHttpUrl(
                downloadUrl,
              )
            ) {
              setResolvedUri(
                downloadUrl,
              );
            } else {
              setResolvedUri(
                "",
              );
            }
          } catch (error) {
            if (
              cancelled
            ) {
              return;
            }

            if (
              __DEV__
            ) {
              console.warn(
                "RECENTLY_CALLED_WORKER_IMAGE_RESOLVE_ERROR:",
                error,
              );
            }

            setResolvedUri(
              "",
            );
          }
        };

      void resolveImage();

      return () => {
        cancelled =
          true;
      };
    }, [
      worker.image,
    ]);

    const showImage =
      Boolean(
        resolvedUri.trim(),
      ) &&
      !failed;

    if (
      !showImage
    ) {
      return (
        <View
          style={
            styles.avatarPlaceholder
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
        key={
          resolvedUri
        }
        source={{
          uri:
            resolvedUri,
        }}
        style={
          styles.avatar
        }
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={150}
        accessibilityRole="image"
        accessibilityLabel={`${worker.name} profile photo`}
        onError={() => {
          setFailed(true);
        }}
      />
    );
  },
);

/* ============================================================
   WORKER CARD
============================================================ */

const RecentWorkerCard = memo(
  function RecentWorkerCard({
    worker,
    now,
    onCallAgain,
  }: {
    worker: RecentlyContactedWorker;

    now: number;

    onCallAgain: (
      worker: RecentlyContactedWorker,
    ) => void;
  }) {
    const handleCallAgain =
      useCallback(() => {
        onCallAgain(
          worker,
        );
      }, [
        onCallAgain,
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
        <WorkerAvatar
          worker={worker}
        />

        <AppText
          variant="bodyMedium"
          weight="bold"
          numberOfLines={1}
          center
          style={
            styles.workerName
          }
        >
          {worker.name}
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={1}
          center
          style={
            styles.workerService
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
          numberOfLines={1}
          center
          style={
            styles.callTime
          }
        >
          {formatRelativeCallTime(
            worker.contactedAt,
            now,
          )}
        </AppText>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Call ${worker.name} again`}
          onPress={
            handleCallAgain
          }
          style={({
            pressed,
          }) => [
            styles.callAgainButton,

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
            variant="bodyMedium"
            weight="bold"
            style={
              styles.callAgainText
            }
          >
            Call Again
          </AppText>
        </Pressable>
      </AppCard>
    );
  },
);

/* ============================================================
   CALL WORKER MODAL
============================================================ */

function CallWorkerModal({
  worker,
  onClose,
  onConfirm,
}: {
  worker:
    | RecentlyContactedWorker
    | null;

  onClose: () => void;

  onConfirm: () => void;
}) {
  if (!worker) {
    return null;
  }

  return (
    <Modal
      visible
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={
        onClose
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
            styles.modal
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
            Call {worker.name}?
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.modalDescription
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
              styles.modalQuestion
            }
          >
            You&apos;ll stay inside Fixxam
            and the worker&apos;s phone
            number won&apos;t be shown.
          </AppText>

          <View
            style={
              styles.modalActions
            }
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel call"
              onPress={
                onClose
              }
              style={({
                pressed,
              }) => [
                styles.cancelButton,

                pressed
                  ? styles.pressed
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
                styles.confirmButton,

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
                variant="bodyMedium"
                weight="bold"
                style={
                  styles.confirmText
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

/* ============================================================
   SCREEN
============================================================ */

export default function RecentlyCalledScreen() {
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
  ] = useState(
    Date.now(),
  );

  const [
    selectedWorker,
    setSelectedWorker,
  ] = useState<
    RecentlyContactedWorker | null
  >(null);

  /* ==========================================================
     PUBLIC WORKER CACHE
  ========================================================== */

  const publicWorkersRef =
    useRef<
      Map<
        string,
        PublicWorker
      >
    >(
      new Map(),
    );

  const publicWorkersLoadedRef =
    useRef(false);

  const loadRequestRef =
    useRef(0);

  /* ==========================================================
     AUTH
  ========================================================== */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        getAuth(),
        (user) => {
          const nextUserId =
            user?.uid ?? null;

          /*
           * Invalidate previous async loads.
           */
          loadRequestRef.current +=
            1;

          /*
           * Reset public worker cache
           * whenever the authenticated
           * user changes.
           */
          publicWorkersRef.current.clear();

          publicWorkersLoadedRef.current =
            false;

          setUserId(
            nextUserId,
          );

          if (
            !nextUserId
          ) {
            setWorkers(
              [],
            );

            setSelectedWorker(
              null,
            );

            setLoaded(
              true,
            );
          }
        },
      );

    return unsubscribe;
  }, []);

  /* ==========================================================
     LOAD PUBLIC WORKERS
  ========================================================== */

  const loadPublicWorkerCache =
    useCallback(
      async (
        force = false,
      ): Promise<
        Map<
          string,
          PublicWorker
        >
      > => {
        if (
          publicWorkersLoadedRef.current &&
          !force
        ) {
          return publicWorkersRef.current;
        }

        try {
          const snapshot =
            await getPublicWorkers();

          const nextMap =
            new Map<
              string,
              PublicWorker
            >();

          for (
            const document of
              snapshot.docs
          ) {
            try {
              const mapped =
                workerMapper(
                  document,
                );

              const workerId =
                cleanString(
                  mapped.id,
                );

              if (
                !workerId
              ) {
                continue;
              }

              nextMap.set(
                workerId,
                mapped,
              );
            } catch (
              mappingError
            ) {
              if (
                __DEV__
              ) {
                console.warn(
                  "RECENTLY_CALLED_PUBLIC_WORKER_MAPPING_ERROR:",
                  mappingError,
                );
              }
            }
          }

          publicWorkersRef.current =
            nextMap;

          publicWorkersLoadedRef.current =
            true;

          return nextMap;
        } catch (
          error
        ) {
          console.error(
            "RECENTLY_CALLED_PUBLIC_WORKERS_LOAD_ERROR:",
            error,
          );

          /*
           * Do not destroy an existing
           * successful cache when a
           * refresh temporarily fails.
           */
          if (
            publicWorkersLoadedRef.current
          ) {
            return publicWorkersRef.current;
          }

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
        recentWorkers:
          RecentlyContactedWorker[],
        forcePublicRefresh =
          false,
      ): Promise<
        RecentlyContactedWorker[]
      > => {
        if (
          recentWorkers.length ===
          0
        ) {
          return [];
        }

        const publicWorkers =
          await loadPublicWorkerCache(
            forcePublicRefresh,
          );

        return Promise.all(
          recentWorkers.map(
            async (
              recentWorker,
            ) => {
              const workerId =
                cleanString(
                  recentWorker.id,
                );

              const publicWorker =
                publicWorkers.get(
                  workerId,
                );

              if (
                !publicWorker
              ) {
                return recentWorker;
              }

              const publicName =
                getPublicWorkerName(
                  publicWorker,
                );

              const publicService =
                getPublicWorkerService(
                  publicWorker,
                );

              const publicRating =
                getPublicWorkerRating(
                  publicWorker,
                );

              const publicImage =
                cleanString(
                  publicWorker
                    .workerProfile
                    ?.photoUrl,
                );

              /*
               * Prefer real public profile
               * data over stale/fallback
               * local storage values.
               */
              const name =
                !isFallbackWorkerName(
                  publicName,
                )
                  ? publicName
                  : !isFallbackWorkerName(
                      recentWorker.name,
                    )
                  ? recentWorker.name
                  : "Worker";

              const service =
                !isFallbackWorkerService(
                  publicService,
                )
                  ? publicService
                  : !isFallbackWorkerService(
                      recentWorker.service,
                    )
                  ? recentWorker.service
                  : "Service Provider";

              const rating =
                publicRating >
                0
                  ? publicRating
                  : recentWorker.rating >
                    0
                  ? recentWorker.rating
                  : 0;

              const image =
                publicImage ||
                cleanString(
                  recentWorker.image,
                );

              return {
                ...recentWorker,

                name,

                service,

                rating,

                image,
              };
            },
          ),
        );
      },
      [
        loadPublicWorkerCache,
      ],
    );

  /* ==========================================================
     LOAD WORKERS
  ========================================================== */

  const loadWorkers =
    useCallback(
      async (
        forcePublicRefresh =
          false,
      ) => {
        const requestId =
          ++loadRequestRef.current;

        if (
          !userId
        ) {
          setWorkers(
            [],
          );

          setLoaded(
            true,
          );

          return;
        }

        try {
          const recentWorkers =
            await getRecentlyContactedWorkers(
              userId,
            );

          /*
           * User may have changed while
           * the storage request was running.
           */
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

          setNow(
            Date.now(),
          );
        } catch (
          error
        ) {
          console.error(
            "LOAD_RECENTLY_CALLED_SCREEN_ERROR:",
            error,
          );

          if (
            requestId ===
            loadRequestRef.current
          ) {
            /*
             * Keep the screen usable even
             * if public profile hydration
             * temporarily fails.
             */
            try {
              const fallbackWorkers =
                await getRecentlyContactedWorkers(
                  userId,
                );

              if (
                requestId ===
                loadRequestRef.current
              ) {
                setWorkers(
                  fallbackWorkers,
                );
              }
            } catch (
              fallbackError
            ) {
              console.error(
                "LOAD_RECENTLY_CALLED_FALLBACK_ERROR:",
                fallbackError,
              );

              if (
                requestId ===
                loadRequestRef.current
              ) {
                setWorkers(
                  [],
                );
              }
            }
          }
        } finally {
          if (
            requestId ===
            loadRequestRef.current
          ) {
            setLoaded(
              true,
            );
          }
        }
      },
      [
        hydrateRecentWorkers,
        userId,
      ],
    );

  /* ==========================================================
     LOAD ON USER CHANGE
  ========================================================== */

  useEffect(() => {
    setLoaded(
      false,
    );

    void loadWorkers(
      true,
    );
  }, [
    loadWorkers,
  ]);

  /* ==========================================================
     FOCUS REFRESH
  ========================================================== */

  useFocusEffect(
    useCallback(() => {
      setNow(
        Date.now(),
      );

      /*
       * Refresh public worker profile
       * data when the screen becomes active.
       */
      void loadWorkers(
        true,
      );
    }, [
      loadWorkers,
    ]),
  );

  /* ==========================================================
     STORAGE SUBSCRIPTION
  ========================================================== */

  useEffect(() => {
    if (
      !userId
    ) {
      return;
    }

    let active = true;

    const unsubscribe =
      subscribeToRecentlyContactedWorkers(
        userId,
        (
          data,
        ) => {
          /*
           * Immediately reflect the
           * local storage update.
           */
          setWorkers(
            data,
          );

          setNow(
            Date.now(),
          );

          setLoaded(
            true,
          );

          /*
           * Then hydrate the same data
           * with public worker information.
           *
           * If cache already exists this
           * does not trigger another public
           * worker fetch.
           */
          void hydrateRecentWorkers(
            data,
            false,
          ).then(
            (
              hydrated,
            ) => {
              if (
                active
              ) {
                setWorkers(
                  hydrated,
                );

                setNow(
                  Date.now(),
                );
              }
            },
          );
        },
      );

    return () => {
      active =
        false;

      unsubscribe();
    };
  }, [
    hydrateRecentWorkers,
    userId,
  ]);

  /* ==========================================================
     RELATIVE TIME CLOCK
  ========================================================== */

  useEffect(() => {
    const interval =
      setInterval(
        () => {
          setNow(
            Date.now(),
          );
        },
        RELATIVE_TIME_REFRESH_INTERVAL,
      );

    const subscription =
      AppState.addEventListener(
        "change",
        (
          nextState,
        ) => {
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
     CALL AGAIN
  ========================================================== */

  const handleCallAgain =
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
     CLOSE MODAL
  ========================================================== */

  const handleCloseModal =
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
      if (
        !selectedWorker
      ) {
        return;
      }

      const currentUser =
        getAuth()
          .currentUser;

      if (
        !currentUser
      ) {
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
       * Existing call/navigation
       * behavior remains unchanged.
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
     RENDER ITEM
  ========================================================== */

  const renderItem =
    useCallback(
      ({
        item,
      }: {
        item: RecentlyContactedWorker;
      }) => (
        <RecentWorkerCard
          worker={
            item
          }
          now={
            now
          }
          onCallAgain={
            handleCallAgain
          }
        />
      ),
      [
        handleCallAgain,
        now,
      ],
    );

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <AppScreen
      role="customer"
      padded={false}
    >
      <View
        style={
          styles.screen
        }
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <View
          style={
            styles.screenHeader
          }
        >
          <Pressable
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
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
              role="customer"
              size="sm"
            />
          </Pressable>

          <View
            style={
              styles.headerContent
            }
          >
            <AppText
              variant="heading1"
              weight="bold"
              numberOfLines={1}
            >
              Recently Called
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.subtitle
              }
            >
              See all the workers you&apos;ve recently called and contact them again anytime.
            </AppText>
          </View>
        </View>

        {/* ====================================================
            LIST
        ==================================================== */}

        <FlatList
          data={
            workers
          }
          keyExtractor={(
            item,
          ) =>
            item.id
          }
          renderItem={
            renderItem
          }
          numColumns={2}
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={[
            styles.list,

            workers.length ===
            0
              ? styles.emptyList
              : null,
          ]}
          columnWrapperStyle={
            workers.length >
            0
              ? styles.row
              : undefined
          }
          initialNumToRender={
            8
          }
          maxToRenderPerBatch={
            8
          }
          windowSize={
            7
          }
          ListEmptyComponent={
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
                variant="heading3"
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
                variant="body"
                tone="secondary"
                center
                style={
                  styles.emptyText
                }
              >
                Workers you call will appear here so you can contact them again easily.
              </AppText>
            </View>
          }
        />

        {/* ====================================================
            IN-APP CALL MODAL
        ==================================================== */}

        <CallWorkerModal
          worker={
            selectedWorker
          }
          onClose={
            handleCloseModal
          }
          onConfirm={
            handleConfirmCall
          }
        />
      </View>
    </AppScreen>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       SCREEN
    ======================================================== */

    screen: {
      flex: 1,

      backgroundColor:
        Colors.background,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    screenHeader: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.lg,
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

    headerContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 19,
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

    emptyList: {
      flexGrow: 1,
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      width: "48.5%",

      alignItems:
        "center",

      padding:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       AVATAR
    ======================================================== */

    avatar: {
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

    avatarPlaceholder: {
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

    /* ========================================================
       WORKER
    ======================================================== */

    workerName: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    workerService: {
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

      justifyContent:
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
       CALL AGAIN
    ======================================================== */

    callAgainButton: {
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

    callAgainText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyContainer: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    emptyIcon: {
      width: 64,

      height: 64,

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
      maxWidth: 300,

      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 20,
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

    modal: {
      width: "100%",

      maxWidth: 430,

      alignItems:
        "center",

      padding:
        FixxamTokens.spacing.xl,

      ...FixxamTokens.shadow.modal,
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
      marginTop:
        FixxamTokens.spacing.md,

      lineHeight: 22,
    },

    modalQuestion: {
      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 22,
    },

    modalActions: {
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

    cancelButton: {
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

    confirmButton: {
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

    confirmText: {
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