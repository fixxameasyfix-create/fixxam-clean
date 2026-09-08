import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  Image,
} from "expo-image";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import CategoryCard from "@/components/categories/CategoryCard";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import {
  getServicesByIds,
} from "@/firebase/queries/getServicesByIds";

import {
  getPublicWorker,
} from "@/firebase/queries/workerPublicProfiles";

/* ============================================================
   TYPES
============================================================ */

type ServiceData = {
  id: string;

  name: string;

  icon?: string;

  color?: string;

  backgroundColor?: string;
};

type PendingParams = {
  bookingId?:
    | string
    | string[];

  serviceId?:
    | string
    | string[];

  serviceName?:
    | string
    | string[];

  serviceIcon?:
    | string
    | string[];

  serviceColor?:
    | string
    | string[];

  serviceBackgroundColor?:
    | string
    | string[];

  workerId?:
    | string
    | string[];

  workerName?:
    | string
    | string[];

  workerPhoto?:
    | string
    | string[];
};

/* ============================================================
   CONSTANTS
============================================================ */

const DEFAULT_SERVICE_ICON =
  "tools";

const DEFAULT_SERVICE_COLOR =
  CustomerColors.primary;

const DEFAULT_SERVICE_BACKGROUND =
  CustomerColors.primarySoft;

/* ============================================================
   HELPERS
============================================================ */

function getParamValue(
  value:
    | string
    | string[]
    | undefined,
): string {
  if (
    Array.isArray(value)
  ) {
    return (
      value[0] ??
      ""
    ).trim();
  }

  return (
    value ??
    ""
  ).trim();
}

function normalizeWorkerPhotoUrl(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  const url =
    value.trim();

  if (!url) {
    return "";
  }

  /*
   * Only secure remote URLs are rendered
   * directly on this confirmation screen.
   */
  if (
    !url.startsWith(
      "https://",
    )
  ) {
    return "";
  }

  return url;
}

/* ============================================================
   SCREEN
============================================================ */

export default function PendingScreen() {
  const params =
    useLocalSearchParams<PendingParams>();

  /* ==========================================================
     RESOLVED BOOKING
  ========================================================== */

  const resolvedBookingId =
    useMemo(
      () =>
        getParamValue(
          params.bookingId,
        ),
      [
        params.bookingId,
      ],
    );

  /* ==========================================================
     WORKER
  ========================================================== */

  const resolvedWorkerId =
    useMemo(
      () =>
        getParamValue(
          params.workerId,
        ),
      [
        params.workerId,
      ],
    );

  const resolvedWorkerName =
    useMemo(
      () =>
        getParamValue(
          params.workerName,
        ) ||
        "Selected worker",
      [
        params.workerName,
      ],
    );

  const routeWorkerPhoto =
    useMemo(
      () =>
        normalizeWorkerPhotoUrl(
          getParamValue(
            params.workerPhoto,
          ),
        ),
      [
        params.workerPhoto,
      ],
    );

  const [
    firebaseWorkerPhoto,
    setFirebaseWorkerPhoto,
  ] =
    useState("");

  const [
    workerPhotoLoading,
    setWorkerPhotoLoading,
  ] =
    useState(false);

  const [
    workerPhotoFailed,
    setWorkerPhotoFailed,
  ] =
    useState(false);

  const resolvedWorkerPhoto =
    useMemo(
      () =>
        normalizeWorkerPhotoUrl(
          firebaseWorkerPhoto ||
            routeWorkerPhoto,
        ),
      [
        firebaseWorkerPhoto,
        routeWorkerPhoto,
      ],
    );

  /* ==========================================================
     LOAD WORKER PHOTO
  ========================================================== */

  useEffect(() => {
    let cancelled =
      false;

    async function loadWorkerPhoto() {
      if (
        !resolvedWorkerId
      ) {
        setFirebaseWorkerPhoto(
          "",
        );

        setWorkerPhotoLoading(
          false,
        );

        return;
      }

      setWorkerPhotoLoading(
        true,
      );

      setWorkerPhotoFailed(
        false,
      );

      try {
        const snapshot =
          await getPublicWorker(
            resolvedWorkerId,
          );

        if (cancelled) {
          return;
        }

        if (
          !snapshot.exists()
        ) {
          console.warn(
            "PENDING_WORKER_NOT_FOUND",
            {
              workerId:
                resolvedWorkerId,
            },
          );

          setFirebaseWorkerPhoto(
            routeWorkerPhoto,
          );

          return;
        }

        const data =
          snapshot.data();

        const workerProfile =
          data?.workerProfile;

        let nestedPhoto =
          "";

        if (
          workerProfile &&
          typeof workerProfile ===
            "object"
        ) {
          const profile =
            workerProfile as {
              photoUrl?: unknown;

              photoURL?: unknown;
            };

          nestedPhoto =
            normalizeWorkerPhotoUrl(
              profile.photoUrl,
            ) ||
            normalizeWorkerPhotoUrl(
              profile.photoURL,
            );
        }

        /*
         * Backward compatibility for
         * older worker documents.
         */
        const rootPhoto =
          normalizeWorkerPhotoUrl(
            data?.photoUrl,
          ) ||
          normalizeWorkerPhotoUrl(
            data?.photoURL,
          );

        const finalPhoto =
          nestedPhoto ||
          rootPhoto ||
          routeWorkerPhoto;

        if (
          !cancelled
        ) {
          setFirebaseWorkerPhoto(
            finalPhoto,
          );
        }
      } catch (
        error
      ) {
        console.warn(
          "PENDING_WORKER_PHOTO_LOAD_ERROR",
          {
            workerId:
              resolvedWorkerId,

            error,
          },
        );

        if (
          !cancelled
        ) {
          /*
           * Firestore refresh failure should
           * not discard a valid route image.
           */
          setFirebaseWorkerPhoto(
            routeWorkerPhoto,
          );
        }
      } finally {
        if (
          !cancelled
        ) {
          setWorkerPhotoLoading(
            false,
          );
        }
      }
    }

    void loadWorkerPhoto();

    return () => {
      cancelled =
        true;
    };
  }, [
    resolvedWorkerId,
    routeWorkerPhoto,
  ]);

  /* ==========================================================
     WORKER IMAGE EVENTS
  ========================================================== */

  const handleWorkerImageError =
    useCallback(
      (
        error: unknown,
      ) => {
        setWorkerPhotoLoading(
          false,
        );

        setWorkerPhotoFailed(
          true,
        );

        console.warn(
          "PENDING_WORKER_IMAGE_LOAD_FAILED",
          {
            workerId:
              resolvedWorkerId,

            photoUrl:
              resolvedWorkerPhoto,

            error,
          },
        );
      },
      [
        resolvedWorkerId,
        resolvedWorkerPhoto,
      ],
    );

  const handleWorkerImageLoaded =
    useCallback(() => {
      setWorkerPhotoLoading(
        false,
      );

      setWorkerPhotoFailed(
        false,
      );
    }, []);

  const shouldShowWorkerImage =
    Boolean(
      resolvedWorkerPhoto &&
      !workerPhotoFailed,
    );

  /* ==========================================================
     SERVICE
  ========================================================== */

  const [
    firebaseService,
    setFirebaseService,
  ] =
    useState<ServiceData | null>(
      null,
    );

  const [
    loadingService,
    setLoadingService,
  ] =
    useState(false);

  const resolvedServiceId =
    useMemo(
      () =>
        getParamValue(
          params.serviceId,
        ),
      [
        params.serviceId,
      ],
    );

  const resolvedServiceName =
    useMemo(
      () =>
        getParamValue(
          params.serviceName,
        ) ||
        firebaseService
          ?.name
          ?.trim() ||
        "Selected service",
      [
        params.serviceName,
        firebaseService?.name,
      ],
    );

  const resolvedServiceIcon =
    useMemo(
      () =>
        getParamValue(
          params.serviceIcon,
        ) ||
        firebaseService
          ?.icon
          ?.trim() ||
        DEFAULT_SERVICE_ICON,
      [
        params.serviceIcon,
        firebaseService?.icon,
      ],
    );

  const resolvedServiceColor =
    useMemo(
      () =>
        getParamValue(
          params.serviceColor,
        ) ||
        firebaseService
          ?.color
          ?.trim() ||
        DEFAULT_SERVICE_COLOR,
      [
        params.serviceColor,
        firebaseService?.color,
      ],
    );

  const resolvedServiceBackground =
    useMemo(
      () =>
        getParamValue(
          params.serviceBackgroundColor,
        ) ||
        firebaseService
          ?.backgroundColor
          ?.trim() ||
        DEFAULT_SERVICE_BACKGROUND,
      [
        params.serviceBackgroundColor,
        firebaseService
          ?.backgroundColor,
      ],
    );

  /* ==========================================================
     LOAD SERVICE
  ========================================================== */

  useEffect(() => {
    let mounted =
      true;

    async function loadService() {
      if (
        !resolvedServiceId
      ) {
        return;
      }

      /*
       * BookingScreen may already provide
       * the full dynamic service presentation.
       */
      if (
        getParamValue(
          params.serviceIcon,
        ) &&
        getParamValue(
          params.serviceColor,
        ) &&
        getParamValue(
          params.serviceBackgroundColor,
        )
      ) {
        return;
      }

      setLoadingService(
        true,
      );

      try {
        const services =
          await getServicesByIds([
            resolvedServiceId,
          ]);

        if (
          !mounted
        ) {
          return;
        }

        const rawService =
          services.find(
            service => {
              const item =
                service as {
                  id?: unknown;

                  serviceId?: unknown;
                };

              const id =
                typeof item.id ===
                  "string"
                  ? item.id.trim()
                  : typeof item.serviceId ===
                      "string"
                    ? item.serviceId.trim()
                    : "";

              return (
                id ===
                resolvedServiceId
              );
            },
          );

        if (
          !rawService
        ) {
          setFirebaseService(
            null,
          );

          return;
        }

        const item =
          rawService as {
            id?: unknown;

            serviceId?: unknown;

            name?: unknown;

            serviceName?: unknown;

            icon?: unknown;

            color?: unknown;

            backgroundColor?: unknown;
          };

        const id =
          typeof item.id ===
            "string"
            ? item.id.trim()
            : typeof item.serviceId ===
                "string"
              ? item.serviceId.trim()
              : resolvedServiceId;

        const name =
          typeof item.name ===
            "string"
            ? item.name.trim()
            : typeof item.serviceName ===
                "string"
              ? item.serviceName.trim()
              : "";

        const icon =
          typeof item.icon ===
            "string"
            ? item.icon.trim()
            : "";

        const color =
          typeof item.color ===
            "string"
            ? item.color.trim()
            : "";

        const backgroundColor =
          typeof item.backgroundColor ===
            "string"
            ? item.backgroundColor.trim()
            : "";

        setFirebaseService({
          id,

          name,

          ...(icon
            ? {
                icon,
              }
            : {}),

          ...(color
            ? {
                color,
              }
            : {}),

          ...(backgroundColor
            ? {
                backgroundColor,
              }
            : {}),
        });
      } catch (
        error
      ) {
        console.error(
          "PENDING_LOAD_SERVICE_ERROR:",
          error,
        );

        if (
          mounted
        ) {
          setFirebaseService(
            null,
          );
        }
      } finally {
        if (
          mounted
        ) {
          setLoadingService(
            false,
          );
        }
      }
    }

    void loadService();

    return () => {
      mounted =
        false;
    };
  }, [
    params.serviceBackgroundColor,
    params.serviceColor,
    params.serviceIcon,
    resolvedServiceId,
  ]);

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const handleViewOrder =
    useCallback(() => {
      if (
        !resolvedBookingId
      ) {
        router.replace(
          "/(customer)/(tabs)/orders",
        );

        return;
      }

      router.push({
        pathname:
          "/(customer)/orders/[orderId]",

        params: {
          orderId:
            resolvedBookingId,
        },
      });
    }, [
      resolvedBookingId,
    ]);

  const handleBackHome =
    useCallback(() => {
      router.replace(
        "/(customer)/(tabs)/home",
      );
    }, []);

  const handleWorkerProfile =
    useCallback(() => {
      if (
        !resolvedWorkerId
      ) {
        return;
      }

      router.push({
        pathname:
          "/(customer)/details/worker-profile/[id]",

        params: {
          id:
            resolvedWorkerId,
        },
      } as const);
    }, [
      resolvedWorkerId,
    ]);

  const handleServicePress =
    useCallback(() => {
      /*
       * Service is already selected.
       * Existing behavior intentionally
       * performs no navigation.
       */
    }, []);

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <AppScreen
      role="customer"
      contentContainerStyle={
        styles.container
      }
    >
      {/* ======================================================
          SUCCESS
      ====================================================== */}

      <View
        style={
          styles.successIcon
        }
      >
        <AppIcon
          name="success"
          size="lg"
          color={
            Colors.success
          }
        />
      </View>

      <AppText
        variant="heading2"
        weight="bold"
        center
        style={
          styles.title
        }
      >
        Request Sent Successfully
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        center
        style={
          styles.description
        }
      >
        Your request has been sent successfully.
      </AppText>

      {/* ======================================================
          1 — WORKER
      ====================================================== */}

      <SectionTitle
        number="1"
        title="Request sent to worker"
      />

      {resolvedWorkerId ? (
        <Pressable
          onPress={
            handleWorkerProfile
          }
          accessibilityRole="button"
          accessibilityLabel="View selected worker"
          style={({
            pressed,
          }) => [
            styles.workerCard,

            pressed
              ? styles.cardPressed
              : null,
          ]}
        >
          <View
            style={
              styles.avatarContainer
            }
          >
            {shouldShowWorkerImage ? (
              <Image
                source={{
                  uri:
                    resolvedWorkerPhoto,
                }}
                contentFit="cover"
                cachePolicy="disk"
                transition={180}
                onLoadStart={() => {
                  setWorkerPhotoLoading(
                    true,
                  );
                }}
                onLoad={
                  handleWorkerImageLoaded
                }
                onError={
                  handleWorkerImageError
                }
                accessibilityLabel={`${resolvedWorkerName} profile photo`}
                style={
                  styles.avatar
                }
              />
            ) : (
              <View
                style={
                  styles.avatarPlaceholder
                }
              >
                <AppIcon
                  name="profile"
                  size="md"
                  color={
                    Colors.textMuted
                  }
                />
              </View>
            )}

            {workerPhotoLoading &&
            shouldShowWorkerImage ? (
              <View
                pointerEvents="none"
                style={
                  styles.imageLoadingOverlay
                }
              >
                <ActivityIndicator
                  size="small"
                  color={
                    CustomerColors.primary
                  }
                />
              </View>
            ) : null}

            <View
              style={
                styles.workerCheck
              }
            >
              <AppIcon
                name="check"
                size="xs"
                color={
                  Colors.textInverse
                }
              />
            </View>
          </View>

          <View
            style={
              styles.workerContent
            }
          >
            <AppText
              variant="caption"
              style={
                styles.cardLabel
              }
            >
              SELECTED WORKER
            </AppText>

            <AppText
              variant="body"
              weight="bold"
              numberOfLines={1}
              style={
                styles.workerName
              }
            >
              {resolvedWorkerName}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.cardHint
              }
            >
              Tap to view worker profile
            </AppText>
          </View>

          <View
            style={
              styles.chevronBox
            }
          >
            <AppIcon
              name="next"
              size="sm"
              color={
                Colors.textSecondary
              }
            />
          </View>
        </Pressable>
      ) : (
        <View
          style={
            styles.workerCard
          }
        >
          <View
            style={
              styles.avatarPlaceholder
            }
          >
            <AppIcon
              name="profile"
              size="md"
              color={
                Colors.textMuted
              }
            />
          </View>

          <View
            style={
              styles.workerContent
            }
          >
            <AppText
              variant="caption"
              style={
                styles.cardLabel
              }
            >
              SELECTED WORKER
            </AppText>

            <AppText
              variant="body"
              weight="bold"
              style={
                styles.workerName
              }
            >
              Selected worker
            </AppText>
          </View>
        </View>
      )}

      {/* ======================================================
          2 — SERVICE
      ====================================================== */}

      <SectionTitle
        number="2"
        title="Service"
      />

      {loadingService ? (
        <View
          style={
            styles.serviceLoading
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
              styles.serviceLoadingText
            }
          >
            Loading service...
          </AppText>
        </View>
      ) : (
        <View
          style={
            styles.categoryCardWrapper
          }
        >
          {/*
           * CategoryCard keeps the dynamic
           * Firebase service icon/color system.
           */}
          <CategoryCard
            icon={
              resolvedServiceIcon
            }
            iconColor={
              resolvedServiceColor
            }
            backgroundColor={
              resolvedServiceBackground
            }
            title={
              resolvedServiceName
            }
            onPress={
              handleServicePress
            }
          />

          <View
            pointerEvents="none"
            style={
              styles.serviceCheckOverlay
            }
          >
            <AppIcon
              name="check"
              size="sm"
              color={
                Colors.textInverse
              }
            />
          </View>
        </View>
      )}

      {/* ======================================================
          3 — STATUS
      ====================================================== */}

      <SectionTitle
        number="3"
        title="Request status"
      />

      <View
        style={
          styles.statusCard
        }
      >
        <View
          style={
            styles.statusIconBox
          }
        >
          <AppIcon
            name="clock"
            size="md"
            color={
              Colors.warning
            }
          />
        </View>

        <View
          style={
            styles.statusContent
          }
        >
          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.statusTitle
            }
          >
            PENDING
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.statusText
            }
          >
            Waiting for the selected worker to respond.
          </AppText>
        </View>

        <View
          style={
            styles.pendingBadge
          }
        >
          <View
            style={
              styles.pendingDot
            }
          />

          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.pendingText
            }
          >
            WAITING
          </AppText>
        </View>
      </View>

      {/* ======================================================
          INFORMATION
      ====================================================== */}

      <View
        style={
          styles.infoCard
        }
      >
        <View
          style={
            styles.infoIconBox
          }
        >
          <AppIcon
            name="info"
            size="sm"
            color={
              Colors.info
            }
          />
        </View>

        <AppText
          variant="caption"
          tone="secondary"
          style={
            styles.infoText
          }
        >
          You can track your request and view its latest status from My Orders.
        </AppText>
      </View>

      {/* ======================================================
          VIEW ORDER
      ====================================================== */}

      <Pressable
        onPress={
          handleViewOrder
        }
        accessibilityRole="button"
        accessibilityLabel="View my order"
        style={({
          pressed,
        }) => [
          styles.primaryButton,

          pressed
            ? styles.primaryButtonPressed
            : null,
        ]}
      >
        <View
          style={
            styles.primaryIconBox
          }
        >
          <AppIcon
            name="file"
            size="sm"
            color={
              Colors.textInverse
            }
          />
        </View>

        <AppText
          variant="body"
          weight="bold"
          style={
            styles.primaryButtonText
          }
        >
          VIEW MY ORDER
        </AppText>

        <AppIcon
          name="next"
          size="sm"
          color={
            Colors.textInverse
          }
        />
      </Pressable>

      {/* ======================================================
          HOME
      ====================================================== */}

      <Pressable
        onPress={
          handleBackHome
        }
        accessibilityRole="button"
        accessibilityLabel="Back to home"
        style={({
          pressed,
        }) => [
          styles.secondaryButton,

          pressed
            ? styles.secondaryButtonPressed
            : null,
        ]}
      >
        <AppIcon
          name="home"
          size="sm"
          color={
            Colors.textSecondary
          }
        />

        <AppText
          variant="caption"
          weight="bold"
          style={
            styles.secondaryButtonText
          }
        >
          BACK TO HOME
        </AppText>
      </Pressable>

      {/* ======================================================
          REQUEST ID
      ====================================================== */}

      {resolvedBookingId ? (
        <AppText
          variant="caption"
          center
          numberOfLines={1}
          style={
            styles.requestId
          }
        >
          Request ID: {resolvedBookingId}
        </AppText>
      ) : null}
    </AppScreen>
  );
}

/* ============================================================
   SECTION TITLE
============================================================ */

const SectionTitle =
  memo(
    function SectionTitle({
      number,
      title,
    }: {
      number: string;

      title: string;
    }) {
      return (
        <View
          style={
            styles.sectionTitle
          }
        >
          <View
            style={
              styles.sectionNumber
            }
          >
            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.sectionNumberText
              }
            >
              {number}
            </AppText>
          </View>

          <AppText
            variant="body"
            weight="bold"
            style={
              styles.sectionText
            }
          >
            {title}
          </AppText>
        </View>
      );
    },
  );

SectionTitle.displayName =
  "SectionTitle";

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CONTAINER
    ======================================================== */

    container: {
      flexGrow: 1,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.xxl,

      backgroundColor:
        Colors.background,
    },

    /* ========================================================
       SUCCESS
    ======================================================== */

    successIcon: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      alignSelf:
        "center",

      marginBottom:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.success,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.successSoft,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    description: {
      marginTop:
        FixxamTokens.spacing.xs,

      marginBottom:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       SECTION
    ======================================================== */

    sectionTitle: {
      marginTop:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    sectionNumber: {
      width: 28,

      height: 28,

      marginRight:
        FixxamTokens.spacing.sm,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.sm,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    sectionNumberText: {
      color:
        CustomerColors.primary,
    },

    sectionText: {
      flex: 1,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       WORKER
    ======================================================== */

    workerCard: {
      minHeight: 80,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

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

    cardPressed: {
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

    avatarContainer: {
      position:
        "relative",

      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,
    },

    avatar: {
      width: "100%",

      height: "100%",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.divider,
    },

    avatarPlaceholder: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.background,
    },

    imageLoadingOverlay: {
      ...StyleSheet.absoluteFillObject,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        "rgba(255,255,255,0.65)",
    },

    workerCheck: {
      position:
        "absolute",

      right: -3,

      bottom: -3,

      width: 20,

      height: 20,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 2,

      borderColor:
        Colors.surface,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.success,
    },

    workerContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    cardLabel: {
      letterSpacing: 1,

      color:
        Colors.textMuted,
    },

    workerName: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textPrimary,
    },

    cardHint: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    chevronBox: {
      width: 32,

      height: 32,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.background,
    },

    /* ========================================================
       SERVICE
    ======================================================== */

    categoryCardWrapper: {
      position:
        "relative",
    },

    serviceCheckOverlay: {
      position:
        "absolute",

      right:
        FixxamTokens.spacing.md,

      top: "50%",

      width: 30,

      height: 30,

      marginTop: -15,

      zIndex: 10,

      elevation: 10,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primary,
    },

    serviceLoading: {
      minHeight: 76,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    serviceLoadingText: {
      color:
        Colors.textSecondary,
    },

    /* ========================================================
       STATUS
    ======================================================== */

    statusCard: {
      minHeight: 82,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

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

    statusIconBox: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.warningSoft,
    },

    statusContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    statusTitle: {
      letterSpacing: 0.5,

      color:
        Colors.warning,
    },

    statusText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 16,

      color:
        Colors.textSecondary,
    },

    pendingBadge: {
      minHeight: 28,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        Colors.warningSoft,
    },

    pendingDot: {
      width: 6,

      height: 6,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.warning,
    },

    pendingText: {
      letterSpacing: 0.4,

      color:
        Colors.warning,
    },

    /* ========================================================
       INFO
    ======================================================== */

    infoCard: {
      minHeight: 58,

      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.infoSoft,
    },

    infoIconBox: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    infoText: {
      flex: 1,

      marginLeft:
        FixxamTokens.spacing.sm,

      lineHeight: 17,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       PRIMARY ACTION
    ======================================================== */

    primaryButton: {
      minHeight:
        FixxamTokens.size.buttonHeight,

      marginTop:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,

      ...FixxamTokens.shadow.card,
    },

    primaryButtonPressed: {
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

    primaryIconBox: {
      width: 28,

      height: 28,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.sm,

      backgroundColor:
        "rgba(255,255,255,0.14)",
    },

    primaryButtonText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       SECONDARY ACTION
    ======================================================== */

    secondaryButton: {
      minHeight:
        FixxamTokens.size.buttonHeight,

      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        Colors.surface,
    },

    secondaryButtonPressed: {
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

    secondaryButtonText: {
      color:
        Colors.textSecondary,
    },

    /* ========================================================
       REQUEST ID
    ======================================================== */

    requestId: {
      marginTop:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      color:
        Colors.textMuted,
    },
  });