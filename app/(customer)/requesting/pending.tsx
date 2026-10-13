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
  ScrollView,
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

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppButton,
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

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

import {
  isBookingFulfillmentMode,
  type BookingFulfillmentMode,
} from "@/types/bookingFulfillment";

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

  fulfillmentMode?:
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

type MaterialIconName =
  React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];

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
    Array.isArray(
      value,
    )
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
    typeof value !==
    "string"
  ) {
    return "";
  }

  const url =
    value.trim();

  if (
    !url ||
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
     BOOKING
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

  const resolvedFulfillmentMode =
    useMemo<
      BookingFulfillmentMode | null
    >(() => {
      const value =
        getParamValue(
          params.fulfillmentMode,
        );

      return isBookingFulfillmentMode(
        value,
      )
        ? value
        : null;
    }, [
      params.fulfillmentMode,
    ]);

  const isRemoteBooking =
    resolvedFulfillmentMode ===
    "remote";

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

        if (
          cancelled
        ) {
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
          styles.overlay
        }
      >
        <View
          style={
            styles.modalCard
          }
        >
          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            bounces={false}
            overScrollMode="never"
            contentContainerStyle={
              styles.modalContent
            }
          >
            {/* ==============================================
                HEADER
            ============================================== */}

            <View
              style={
                styles.header
              }
            >
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

              <View
                style={
                  styles.headerContent
                }
              >
                <AppText
                  variant="heading2"
                  weight="bold"
                >
                  Request Sent
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.headerSubtitle
                  }
                >
                  Your service request was sent successfully.
                </AppText>
              </View>
            </View>

            {/* ==============================================
                WORKER
            ============================================== */}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View selected worker"
              accessibilityHint={
                resolvedWorkerId
                  ? "Opens the worker profile"
                  : undefined
              }
              accessibilityState={{
                disabled:
                  !resolvedWorkerId,
              }}
              disabled={
                !resolvedWorkerId
              }
              onPress={
                handleWorkerProfile
              }
              style={({
                pressed,
              }) => [
                styles.workerRow,

                pressed &&
                resolvedWorkerId
                  ? styles.rowPressed
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
                      size="sm"
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
              </View>

              <View
                style={
                  styles.rowContent
                }
              >
                <AppText
                  variant="caption"
                  tone="muted"
                >
                  Worker
                </AppText>

                <AppText
                  variant="bodyMedium"
                  weight="bold"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={
                    styles.rowValue
                  }
                >
                  {resolvedWorkerName}
                </AppText>

                {resolvedWorkerId ? (
                  <AppText
                    variant="caption"
                    tone="secondary"
                    style={
                      styles.rowHint
                    }
                  >
                    Tap to view profile
                  </AppText>
                ) : null}
              </View>

              {resolvedWorkerId ? (
                <AppIcon
                  name="next"
                  size="sm"
                  color={
                    Colors.textMuted
                  }
                />
              ) : null}
            </Pressable>

            <Divider />

            {/* ==============================================
                SERVICE
            ============================================== */}

            <View
              style={
                styles.infoRow
              }
            >
              <View
                style={[
                  styles.rowIcon,

                  {
                    backgroundColor:
                      resolvedServiceBackground,
                  },
                ]}
              >
                {loadingService ? (
                  <ActivityIndicator
                    size="small"
                    color={
                      CustomerColors.primary
                    }
                  />
                ) : (
                  <MaterialCommunityIcons
                    name={
                      resolvedServiceIcon as
                        MaterialIconName
                    }
                    size={24}
                    color={
                      resolvedServiceColor
                    }
                  />
                )}
              </View>

              <View
                style={
                  styles.rowContent
                }
              >
                <AppText
                  variant="caption"
                  tone="muted"
                >
                  Service
                </AppText>

                <AppText
                  variant="bodyMedium"
                  weight="bold"
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={
                    styles.rowValue
                  }
                >
                  {loadingService
                    ? "Loading service..."
                    : resolvedServiceName}
                </AppText>

                {isRemoteBooking ? (
                  <View
                    style={
                      styles.remoteLabel
                    }
                  >
                    <MaterialCommunityIcons
                      name="laptop"
                      size={14}
                      color={
                        CustomerColors.primary
                      }
                    />

                    <AppText
                      variant="caption"
                      weight="bold"
                      style={
                        styles.remoteLabelText
                      }
                    >
                      Remote service
                    </AppText>
                  </View>
                ) : null}
              </View>

              {!loadingService ? (
                <View
                  style={
                    styles.checkBadge
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
              ) : null}
            </View>

            <Divider />

            {/* ==============================================
                STATUS
            ============================================== */}

            <View
              style={
                styles.infoRow
              }
            >
              <View
                style={[
                  styles.rowIcon,
                  styles.statusIcon,
                ]}
              >
                <AppIcon
                  name="clock"
                  size="sm"
                  color={
                    Colors.warning
                  }
                />
              </View>

              <View
                style={
                  styles.rowContent
                }
              >
                <AppText
                  variant="caption"
                  tone="muted"
                >
                  Request status
                </AppText>

                <AppText
                  variant="bodyMedium"
                  weight="bold"
                  style={
                    styles.rowValue
                  }
                >
                  Pending
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  numberOfLines={2}
                  style={
                    styles.rowHint
                  }
                >
                  Waiting for {resolvedWorkerName} to respond.
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

            {/* ==============================================
                INFO
            ============================================== */}

            <View
              style={
                styles.infoCard
              }
            >
              <View
                style={
                  styles.infoIcon
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
                {isRemoteBooking
                  ? "This is a remote service. No physical service location is required. You can track the request and its latest status from My Orders."
                  : "You can track this request and see its latest status from My Orders."}
              </AppText>
            </View>

            {/* ==============================================
                ACTIONS
            ============================================== */}

            <View
              style={
                styles.actions
              }
            >
              <AppButton
                title="Back to Home"
                role="customer"
                variant="outline"
                leftIconName="home"
                onPress={
                  handleBackHome
                }
                style={
                  styles.actionButton
                }
              />

              <AppButton
                title="View Order"
                role="customer"
                rightIconName="next"
                onPress={
                  handleViewOrder
                }
                style={
                  styles.actionButton
                }
              />
            </View>

            {/* ==============================================
                REQUEST ID
            ============================================== */}

            {resolvedBookingId ? (
              <AppText
                variant="caption"
                tone="muted"
                center
                numberOfLines={1}
                ellipsizeMode="middle"
                style={
                  styles.requestId
                }
              >
                Request ID: {resolvedBookingId}
              </AppText>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </AppScreen>
  );
}

/* ============================================================
   DIVIDER
============================================================ */

const Divider =
  memo(
    function Divider() {
      return (
        <View
          style={
            styles.divider
          }
        />
      );
    },
  );

Divider.displayName =
  "Divider";

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       MODAL-LOOK SCREEN
    ======================================================== */

    overlay: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingVertical:
        FixxamTokens.spacing.xxl,

      backgroundColor:
        Colors.overlayMedium,
    },

    modalCard: {
      width:
        "100%",

      maxWidth:
        430,

      maxHeight:
        "92%",

      overflow:
        "hidden",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.modal,
    },

    modalContent: {
      padding:
        FixxamTokens.spacing.lg,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        FixxamTokens.spacing.lg,
    },

    successIcon: {
      width:
        52,

      height:
        52,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.successSoft,
    },

    headerContent: {
      flex: 1,

      minWidth: 0,
    },

    headerSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight:
        18,
    },

    /* ========================================================
       ROWS
    ======================================================== */

    workerRow: {
      minHeight:
        70,

      flexDirection:
        "row",

      alignItems:
        "center",

      padding:
        FixxamTokens.spacing.sm,

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.background,
    },

    infoRow: {
      minHeight:
        66,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xxs,
    },

    rowPressed: {
      borderColor:
        CustomerColors.primaryLight,

      backgroundColor:
        CustomerColors.primarySoft,

      opacity:
        FixxamTokens.motion.pressedOpacity,
    },

    rowIcon: {
      width:
        46,

      height:
        46,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    rowContent: {
      flex: 1,

      minWidth: 0,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    rowValue: {
      marginTop:
        2,

      color:
        Colors.textPrimary,
    },

    rowHint: {
      marginTop:
        2,

      lineHeight:
        16,
    },

    /* ========================================================
       WORKER PHOTO
    ======================================================== */

    avatarContainer: {
      position:
        "relative",

      width:
        52,

      height:
        52,

      flexShrink: 0,

      marginRight:
        FixxamTokens.spacing.md,
    },

    avatar: {
      width:
        "100%",

      height:
        "100%",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    avatarPlaceholder: {
      width:
        "100%",

      height:
        "100%",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    imageLoadingOverlay: {
      ...StyleSheet.absoluteFillObject,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.overlayLight,
    },

    /* ========================================================
       DIVIDER
    ======================================================== */

    divider: {
      width:
        "100%",

      height:
        1,

      marginVertical:
        FixxamTokens.spacing.sm,

      backgroundColor:
        Colors.border,
    },

    /* ========================================================
       CHECK
    ======================================================== */

    checkBadge: {
      width:
        28,

      height:
        28,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.success,
    },

    /* ========================================================
       REMOTE
    ======================================================== */

    remoteLabel: {
      alignSelf:
        "flex-start",

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xxs,

      marginTop:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xxs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    remoteLabelText: {
      color:
        CustomerColors.primary,
    },

    /* ========================================================
       STATUS
    ======================================================== */

    statusIcon: {
      backgroundColor:
        Colors.warningSoft,
    },

    pendingBadge: {
      flexShrink: 0,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.warningSoft,
    },

    pendingDot: {
      width:
        6,

      height:
        6,

      marginRight:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.warning,
    },

    pendingText: {
      color:
        Colors.warning,
    },

    /* ========================================================
       INFO
    ======================================================== */

    infoCard: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.infoSoft,
    },

    infoIcon: {
      width:
        34,

      height:
        34,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    infoText: {
      flex: 1,

      minWidth: 0,

      lineHeight:
        18,
    },

    /* ========================================================
       ACTIONS
    ======================================================== */

    actions: {
      flexDirection:
        "row",

      gap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.lg,
    },

    actionButton: {
      flex: 1,
    },

    /* ========================================================
       REQUEST ID
    ======================================================== */

    requestId: {
      marginTop:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.md,
    },
  });