import React, {
  memo,
  useCallback,
  useEffect,
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

import {
  Image,
} from "expo-image";

import {
  router,
  useFocusEffect,
} from "expo-router";

import {
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";

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

/* ============================================================
   CONSTANTS
============================================================ */

const RELATIVE_TIME_REFRESH_INTERVAL =
  60_000;

/* ============================================================
   RELATIVE CALL TIME
============================================================ */

function formatRelativeCallTime(
  contactedAt: string,
  now: number,
): string {
  const time =
    Date.parse(
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
      now -
        time,
    );

  const MINUTE =
    60_000;

  const HOUR =
    60 *
    MINUTE;

  const DAY =
    24 *
    HOUR;

  const WEEK =
    7 *
    DAY;

  const MONTH =
    30 *
    DAY;

  const YEAR =
    365 *
    DAY;

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

const WorkerAvatar =
  memo(
    function WorkerAvatar({
      worker,
    }: {
      worker: RecentlyContactedWorker;
    }) {
      const [
        failed,
        setFailed,
      ] =
        useState(
          false,
        );

      useEffect(() => {
        setFailed(
          false,
        );
      }, [
        worker.image,
      ]);

      const showImage =
        Boolean(
          worker.image.trim(),
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
          source={{
            uri:
              worker.image,
          }}
          style={
            styles.avatar
          }
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={150}
          accessibilityLabel={`${worker.name} profile photo`}
          onError={() => {
            setFailed(
              true,
            );
          }}
        />
      );
    },
  );

/* ============================================================
   WORKER CARD
============================================================ */

const RecentWorkerCard =
  memo(
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
          {/* ==================================================
              AVATAR
          ================================================== */}

          <WorkerAvatar
            worker={
              worker
            }
          />

          {/* ==================================================
              NAME
          ================================================== */}

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

          {/* ==================================================
              SERVICE
          ================================================== */}

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
              LAST CALL
          ================================================== */}

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

          {/* ==================================================
              CALL AGAIN
          ================================================== */}

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
  if (
    !worker
  ) {
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
          {/* ==================================================
              ICON
          ================================================== */}

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

          {/* ==================================================
              TITLE
          ================================================== */}

          <AppText
            variant="heading2"
            weight="bold"
            center
          >
            Call {worker.name}?
          </AppText>

          {/* ==================================================
              DESCRIPTION
          ================================================== */}

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.modalDescription
            }
          >
            Start an in-app voice call with {worker.name}.
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.modalQuestion
            }
          >
            You&apos;ll stay inside Fixxam and the worker&apos;s phone number won&apos;t be shown.
          </AppText>

          {/* ==================================================
              ACTIONS
          ================================================== */}

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
  ] =
    useState<
      string | null
    >(
      getAuth()
        .currentUser
        ?.uid ??
        null,
    );

  const [
    workers,
    setWorkers,
  ] =
    useState<
      RecentlyContactedWorker[]
    >(
      [],
    );

  const [
    loaded,
    setLoaded,
  ] =
    useState(
      false,
    );

  const [
    now,
    setNow,
  ] =
    useState(
      Date.now(),
    );

  const [
    selectedWorker,
    setSelectedWorker,
  ] =
    useState<
      RecentlyContactedWorker | null
    >(
      null,
    );

  /* ==========================================================
     AUTH
  ========================================================== */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        getAuth(),
        (
          user,
        ) => {
          const nextUserId =
            user?.uid ??
            null;

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
     LOAD WORKERS
  ========================================================== */

  const loadWorkers =
    useCallback(
      async () => {
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
          const data =
            await getRecentlyContactedWorkers(
              userId,
            );

          setWorkers(
            data,
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

          setWorkers(
            [],
          );
        } finally {
          setLoaded(
            true,
          );
        }
      },
      [
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

    void loadWorkers();
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

      void loadWorkers();
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

    const unsubscribe =
      subscribeToRecentlyContactedWorkers(
        userId,
        (
          data,
        ) => {
          setWorkers(
            data,
          );

          setNow(
            Date.now(),
          );

          setLoaded(
            true,
          );
        },
      );

    return unsubscribe;
  }, [
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
     * Start Fixxam in-app calling.
     *
     * No phone number is sent.
     * The worker is identified by workerId.
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
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
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