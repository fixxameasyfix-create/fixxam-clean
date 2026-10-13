import { Ionicons } from "@expo/vector-icons";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  BackHandler,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import { AppText } from "@/components/ui";

import AppLoader from "@/components/common/AppLoader";

import { useAuth } from "@/hooks/useAuth";

import {
  cancelShopRequest,
  subscribeToCustomerShopRequest,
} from "@/services/shopRequestService";

import {
  getShopById,
} from "@/services/shopService";

import type {
  FirebaseShopRequest,
  FirebaseShopRequestStatus,
} from "@/types/firebaseShopRequest";

import type {
  FirebaseShop,
} from "@/types/firebaseShop";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   COMPONENTS
============================================================== */

import DetailsHeader from "@/components/customer/shop-request-details/DetailsHeader";

import RequestStatusBanner, {
  type RequestStatusConfig,
} from "@/components/customer/shop-request-details/RequestStatusBanner";

import ShopCard from "@/components/customer/shop-request-details/ShopCard";

import LocationCard from "@/components/customer/shop-request-details/LocationCard";

import ServiceScheduleCard from "@/components/customer/shop-request-details/ServiceScheduleCard";

import DescriptionCard from "@/components/customer/shop-request-details/DescriptionCard";

import PhotosCard from "@/components/customer/shop-request-details/PhotosCard";

import RequestInfoCard from "@/components/customer/shop-request-details/RequestInfoCard";

/* ==============================================================
   TYPES
============================================================== */

type ScreenState =
  | "loading"
  | "ready"
  | "not-found"
  | "error"
  | "signed-out";

/* ==============================================================
   HELPERS
============================================================== */

function normalizeParam(
  value:
    | string
    | string[]
    | undefined,
): string {
  const resolved =
    Array.isArray(value)
      ? value[0]
      : value;

  return (
    resolved?.trim() ??
    ""
  );
}

/* ==============================================================
   PRICE
============================================================== */

function formatPrice(
  value: number,
): string {
  const safeValue =
    Number.isFinite(value) &&
    value >= 0
      ? value
      : 0;

  return `₦${safeValue.toLocaleString(
    "en-NG",
  )}`;
}

/* ==============================================================
   TIMESTAMP
============================================================== */

function formatTimestamp(
  value: FirebaseShopRequest["createdAt"],
): string {
  if (!value) {
    return "Unavailable";
  }

  try {
    const date =
      value.toDate();

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return "Unavailable";
    }

    return date.toLocaleString(
      "en-NG",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      },
    );
  } catch {
    return "Unavailable";
  }
}

/* ==============================================================
   STATUS
============================================================== */

function getStatusConfig(
  status: FirebaseShopRequestStatus,
): RequestStatusConfig {
  switch (status) {
    case "accepted":
      return {
        label: "Accepted",
        icon:
          "checkmark-circle-outline",
        backgroundColor:
          "#DBEAFE",
        color:
          CustomerColors.primary,
        message:
          "The shop accepted your request.",
      };

    case "declined":
      return {
        label: "Declined",
        icon:
          "close-circle-outline",
        backgroundColor:
          "#FEE2E2",
        color: "#DC2626",
        message:
          "The shop declined this request.",
      };

    case "completed":
      return {
        label: "Completed",
        icon:
          "checkmark-done-circle-outline",
        backgroundColor:
          "#DCFCE7",
        color: "#16A34A",
        message:
          "This request has been completed.",
      };

    case "cancelled":
      return {
        label: "Cancelled",
        icon: "ban-outline",
        backgroundColor:
          "#F3F4F6",
        color: "#6B7280",
        message:
          "You cancelled this request.",
      };

    case "pending":
    default:
      return {
        label: "Pending",
        icon: "time-outline",
        backgroundColor:
          "#FEF3C7",
        color: "#D97706",
        message:
          "Waiting for the shop to respond.",
      };
  }
}

/* ==============================================================
   ERROR
============================================================== */

function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error &&
    error.message ===
      "You cannot view this request."
  ) {
    return error.message;
  }

  return "Unable to load this shop request. Please try again.";
}

/* ==============================================================
   COORDINATES
============================================================== */

function hasValidCoordinates(
  shop: FirebaseShop | null,
): shop is FirebaseShop {
  if (!shop) {
    return false;
  }

  return (
    Number.isFinite(
      shop.latitude,
    ) &&
    shop.latitude >= -90 &&
    shop.latitude <= 90 &&
    Number.isFinite(
      shop.longitude,
    ) &&
    shop.longitude >= -180 &&
    shop.longitude <= 180
  );
}

/* ==============================================================
   IMAGE URL
============================================================== */

function getValidImageUrl(
  value:
    | string
    | null
    | undefined,
): string | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const url =
    value.trim();

  if (
    !url ||
    !/^https:\/\//i.test(
      url,
    )
  ) {
    return null;
  }

  return url;
}

/* ==============================================================
   SCREEN
============================================================== */

export default function ShopRequestDetailsScreen() {
  /* ============================================================
     ROUTE
  ============================================================ */

  const params =
    useLocalSearchParams<{
      requestId?:
        | string
        | string[];
    }>();

  const requestId =
    normalizeParam(
      params.requestId,
    );

  /* ============================================================
     AUTH
  ============================================================ */

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const userId =
    user?.uid ?? null;

  /* ============================================================
     STATE
  ============================================================ */

  const [
    request,
    setRequest,
  ] =
    useState<
      FirebaseShopRequest | null
    >(null);

  const [
    shop,
    setShop,
  ] =
    useState<
      FirebaseShop | null
    >(null);

  const [
    shopLoading,
    setShopLoading,
  ] =
    useState(false);

  const [
    screenState,
    setScreenState,
  ] =
    useState<ScreenState>(
      "loading",
    );

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");

  const [
    retryKey,
    setRetryKey,
  ] =
    useState(0);

  const [
    selectedPhoto,
    setSelectedPhoto,
  ] =
    useState<string | null>(
      null,
    );

  const [
    isCancelling,
    setIsCancelling,
  ] =
    useState(false);

  /* ============================================================
     REALTIME REQUEST
  ============================================================ */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!userId) {
      setRequest(null);
      setShop(null);
      setErrorMessage("");
      setIsCancelling(false);

      setScreenState(
        "signed-out",
      );

      return;
    }

    if (!requestId) {
      setRequest(null);
      setShop(null);

      setErrorMessage(
        "Request information is missing.",
      );

      setScreenState(
        "error",
      );

      return;
    }

    setRequest(null);
    setShop(null);
    setErrorMessage("");

    setScreenState(
      "loading",
    );

    let unsubscribe:
      | (() => void)
      | undefined;

    try {
      unsubscribe =
        subscribeToCustomerShopRequest(
          requestId,
          (
            nextRequest,
          ) => {
            if (!nextRequest) {
              setRequest(null);
              setShop(null);

              setScreenState(
                "not-found",
              );

              return;
            }

            if (
              nextRequest.customerId !==
              userId
            ) {
              setRequest(null);
              setShop(null);

              setErrorMessage(
                "You cannot view this request.",
              );

              setScreenState(
                "error",
              );

              return;
            }

            setRequest(
              nextRequest,
            );

            setErrorMessage("");

            setScreenState(
              "ready",
            );
          },
          (
            error,
          ) => {
            console.error(
              "Customer shop request details subscription failed:",
              error,
            );

            setRequest(null);
            setShop(null);

            setErrorMessage(
              getErrorMessage(
                error,
              ),
            );

            setScreenState(
              "error",
            );
          },
        );
    } catch (error) {
      console.error(
        "Customer shop request details setup failed:",
        error,
      );

      setRequest(null);
      setShop(null);

      setErrorMessage(
        getErrorMessage(
          error,
        ),
      );

      setScreenState(
        "error",
      );
    }

    return () => {
      unsubscribe?.();
    };
  }, [
    authLoading,
    requestId,
    retryKey,
    userId,
  ]);

  /* ============================================================
     LOAD SHOP
  ============================================================ */

  useEffect(() => {
    const shopId =
      request?.shopId?.trim() ??
      "";

    if (!shopId) {
      setShop(null);
      setShopLoading(false);

      return;
    }

    let cancelled =
      false;

    setShopLoading(true);

    getShopById(
      shopId,
    )
      .then(
        (
          nextShop,
        ) => {
          if (cancelled) {
            return;
          }

          setShop(
            nextShop,
          );
        },
      )
      .catch(
        (
          error,
        ) => {
          if (cancelled) {
            return;
          }

          console.error(
            "Request shop load failed:",
            error,
          );

          setShop(null);
        },
      )
      .finally(
        () => {
          if (cancelled) {
            return;
          }

          setShopLoading(false);
        },
      );

    return () => {
      cancelled = true;
    };
  }, [
    request?.shopId,
    retryKey,
  ]);

  /* ============================================================
     STATUS
  ============================================================ */

  const status =
    useMemo(
      () =>
        request
          ? getStatusConfig(
              request.status,
            )
          : null,
      [request],
    );

  /* ============================================================
     REQUEST PHOTOS
  ============================================================ */

  const photos =
    useMemo(() => {
      if (!request) {
        return [];
      }

      return Array.from(
        new Set(
          request.photoUrls
            .map(
              (
                url,
              ) =>
                url.trim(),
            )
            .filter(
              (
                url,
              ) =>
                /^https:\/\//i.test(
                  url,
                ),
            ),
        ),
      );
    }, [request]);

  /* ============================================================
     SHOP PHOTO
  ============================================================ */

  const shopPhotoUrl =
    useMemo(() => {
      const requestPhoto =
        getValidImageUrl(
          request?.shopPhotoUrl,
        );

      if (requestPhoto) {
        return requestPhoto;
      }

      return getValidImageUrl(
        shop?.coverPhotoUrl,
      );
    }, [
      request?.shopPhotoUrl,
      shop?.coverPhotoUrl,
    ]);

  /* ============================================================
     SHOP LOGO
  ============================================================ */

  const shopLogoUrl =
    useMemo(() => {
      const requestLogo =
        getValidImageUrl(
          request?.shopLogoUrl,
        );

      if (requestLogo) {
        return requestLogo;
      }

      return getValidImageUrl(
        shop?.logoUrl,
      );
    }, [
      request?.shopLogoUrl,
      shop?.logoUrl,
    ]);

  /* ============================================================
     FINAL SHOP IMAGE
  ============================================================ */

  const shopImageUrl =
    shopPhotoUrl ??
    shopLogoUrl;

  /* ============================================================
     SERVICE IMAGE
     
     IMPORTANT:
     
     This is ONLY serviceImageUrl.
     
     We do NOT use:
     - customerPhotoUrl
     - shopPhotoUrl
     - shopLogoUrl
     - photoUrls
  ============================================================ */

  const serviceImageUrl =
    useMemo(() => {
      return getValidImageUrl(
        request?.serviceImageUrl,
      );
    }, [
      request?.serviceImageUrl,
    ]);

  /* ============================================================
     LOCATION
  ============================================================ */

  const hasShopLocation =
    useMemo(
      () =>
        hasValidCoordinates(
          shop,
        ),
      [shop],
    );

  /* ============================================================
     ACTIONS
  ============================================================ */

  const canCallShop =
    request?.status ===
      "pending" ||
    request?.status ===
      "accepted";

  const canCancelRequest =
    request?.status ===
    "pending";

  const showActions =
    canCallShop ||
    canCancelRequest;

  /* ============================================================
     BACK
  ============================================================ */

  const handleBack =
    useCallback(() => {
      if (
        router.canGoBack()
      ) {
        router.back();

        return;
      }

      router.replace(
        "/(customer)/(tabs)/orders",
      );
    }, []);

  /* ============================================================
     HARDWARE BACK
  ============================================================ */

  useEffect(() => {
    const onHardwareBackPress =
      () => {
        if (selectedPhoto) {
          setSelectedPhoto(
            null,
          );

          return true;
        }

        handleBack();

        return true;
      };

    const subscription =
      BackHandler.addEventListener(
        "hardwareBackPress",
        onHardwareBackPress,
      );

    return () => {
      subscription.remove();
    };
  }, [
    handleBack,
    selectedPhoto,
  ]);

  /* ============================================================
     RETRY
  ============================================================ */

  const handleRetry =
    useCallback(() => {
      setErrorMessage("");

      setScreenState(
        "loading",
      );

      setRetryKey(
        current =>
          current + 1,
      );
    }, []);

  /* ============================================================
     LOGIN
  ============================================================ */

  const handleLogin =
    useCallback(() => {
      router.push(
        "/(auth)/login",
      );
    }, []);

  /* ============================================================
     VIEW SHOP
  ============================================================ */

  const handleViewShop =
    useCallback(() => {
      const shopId =
        request?.shopId?.trim() ??
        "";

      if (!shopId) {
        return;
      }

      router.push({
        pathname:
          "/find-shop/[shopId]",
        params: {
          shopId,
        },
      });
    }, [
      request?.shopId,
    ]);

  /* ============================================================
     VIEW LOCATION
  ============================================================ */

  const handleViewLocation =
    useCallback(() => {
      const shopId =
        request?.shopId?.trim() ??
        "";

      if (!shopId) {
        return;
      }

      router.push({
        pathname:
          "/(customer)/orders/shop-request/location/[shopId]",
        params: {
          shopId,
        },
      });
    }, [
      request?.shopId,
    ]);

  /* ============================================================
     CALL SHOP
  ============================================================ */

  const handleCallShop =
    useCallback(() => {
      if (
        !request ||
        isCancelling
      ) {
        return;
      }

      if (
        request.status !==
          "pending" &&
        request.status !==
          "accepted"
      ) {
        return;
      }

      const workerId =
        request.workerId
          ?.trim() ?? "";

      if (!workerId) {
        Alert.alert(
          "Call unavailable",
          "Shop provider information is unavailable.",
        );

        return;
      }

      router.push({
        pathname:
          "/(customer)/call/[workerId]",
        params: {
          workerId,

          name:
            request.shopName ||
            "Service Shop",

          service:
            request.serviceName ||
            "Shop service",
        },
      } as never);
    }, [
      isCancelling,
      request,
    ]);

  /* ============================================================
     CANCEL REQUEST
  ============================================================ */

  const handleCancelRequest =
    useCallback(() => {
      if (
        !request ||
        isCancelling ||
        request.status !==
          "pending"
      ) {
        return;
      }

      const currentRequestId =
        request.id.trim();

      if (!currentRequestId) {
        Alert.alert(
          "Unable to cancel request",
          "Request information is unavailable.",
        );

        return;
      }

      Alert.alert(
        "Cancel request?",
        "The shop will no longer be able to accept this request.",
        [
          {
            text:
              "Keep Request",
            style:
              "cancel",
          },
          {
            text:
              "Cancel Request",
            style:
              "destructive",
            onPress:
              async () => {
                if (
                  isCancelling
                ) {
                  return;
                }

                setIsCancelling(
                  true,
                );

                try {
                  await cancelShopRequest(
                    currentRequestId,
                  );
                } catch (error) {
                  console.error(
                    "Cancel shop request failed:",
                    error,
                  );

                  const message =
                    error instanceof
                      Error &&
                    error.message
                      ? error.message
                      : "Unable to cancel this request. Please try again.";

                  Alert.alert(
                    "Unable to cancel request",
                    message,
                  );
                } finally {
                  setIsCancelling(
                    false,
                  );
                }
              },
          },
        ],
      );
    }, [
      isCancelling,
      request,
    ]);

  /* ============================================================
     OPEN PHOTO
  ============================================================ */

  const handleOpenPhoto =
    useCallback(
      (
        url: string,
      ) => {
        setSelectedPhoto(
          url,
        );
      },
      [],
    );

  /* ============================================================
     CLOSE PHOTO
  ============================================================ */

  const handleClosePhoto =
    useCallback(() => {
      setSelectedPhoto(
        null,
      );
    }, []);

  /* ============================================================
     LOADING
  ============================================================ */

  if (
    authLoading ||
    screenState ===
      "loading"
  ) {
    return (
      <SafeAreaView
        style={
          styles.safeArea
        }
        edges={[
          "top",
          "bottom",
        ]}
      >
        <DetailsHeader
          onBack={
            handleBack
          }
        />

        <View
          style={
            styles.centerState
          }
        >
          <AppLoader
            role="customer"
            size="sm"
            message="Loading request..."
          />
        </View>
      </SafeAreaView>
    );
  }

  /* ============================================================
     SIGNED OUT
  ============================================================ */

  if (
    screenState ===
    "signed-out"
  ) {
    return (
      <SafeAreaView
        style={
          styles.safeArea
        }
        edges={[
          "top",
          "bottom",
        ]}
      >
        <DetailsHeader
          onBack={
            handleBack
          }
        />

        <StateMessage
          icon="lock-closed-outline"
          title="Sign in required"
          message="Sign in to view your request."
          actionLabel="Sign In"
          onAction={
            handleLogin
          }
        />
      </SafeAreaView>
    );
  }

  /* ============================================================
     NOT FOUND
  ============================================================ */

  if (
    screenState ===
    "not-found"
  ) {
    return (
      <SafeAreaView
        style={
          styles.safeArea
        }
        edges={[
          "top",
          "bottom",
        ]}
      >
        <DetailsHeader
          onBack={
            handleBack
          }
        />

        <StateMessage
          icon="document-text-outline"
          title="Request not found"
          message="This shop request is no longer available."
          actionLabel="Go Back"
          onAction={
            handleBack
          }
        />
      </SafeAreaView>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (
    screenState ===
    "error"
  ) {
    return (
      <SafeAreaView
        style={
          styles.safeArea
        }
        edges={[
          "top",
          "bottom",
        ]}
      >
        <DetailsHeader
          onBack={
            handleBack
          }
        />

        <StateMessage
          icon="alert-circle-outline"
          title="Unable to load request"
          message={
            errorMessage ||
            "Unable to load this request."
          }
          actionLabel="Try Again"
          onAction={
            handleRetry
          }
        />
      </SafeAreaView>
    );
  }

  /* ============================================================
     FALLBACK
  ============================================================ */

  if (
    !request ||
    !status
  ) {
    return (
      <SafeAreaView
        style={
          styles.safeArea
        }
        edges={[
          "top",
          "bottom",
        ]}
      >
        <DetailsHeader
          onBack={
            handleBack
          }
        />

        <StateMessage
          icon="alert-circle-outline"
          title="Request unavailable"
          message="This request could not be displayed."
          actionLabel="Go Back"
          onAction={
            handleBack
          }
        />
      </SafeAreaView>
    );
  }

  /* ============================================================
     READY
  ============================================================ */

  return (
    <>
      <SafeAreaView
        style={
          styles.safeArea
        }
        edges={[
          "top",
          "bottom",
        ]}
      >
        <DetailsHeader
          onBack={
            handleBack
          }
        />

        <ScrollView
          style={
            styles.scrollView
          }
          contentContainerStyle={
            styles.content
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          {/* ==================================================
             STATUS
          ================================================== */}

          <RequestStatusBanner
            status={
              status
            }
          />

          {/* ==================================================
             SHOP
          ================================================== */}

          <ShopCard
            shopName={
              request.shopName
            }
            shopImageUrl={
              shopImageUrl
            }
            onPress={
              handleViewShop
            }
            disabled={
              !request.shopId
            }
          />

              {/* ==================================================
   LOCATION
================================================== */}

<LocationCard
  loading={
    shopLoading
  }
  hasLocation={
    hasShopLocation
  }
  latitude={
    shop?.latitude
  }
  longitude={
    shop?.longitude
  }
  status={
    request.status
  }
  onPress={
    handleViewLocation
  }
/>

          {/* ==================================================
             SERVICE + SCHEDULE
          ================================================== */}

          <ServiceScheduleCard
            serviceName={
              request.serviceName
            }
            serviceImageUrl={
              serviceImageUrl
            }
            servicePrice={formatPrice(
              request.servicePrice,
            )}
            requestedDate={
              request.requestedDateLabel
            }
            requestedTime={
              request.requestedTime
            }
          />

          {/* ==================================================
             DESCRIPTION
          ================================================== */}

          <DescriptionCard
            description={
              request.description
            }
          />

          {/* ==================================================
             CUSTOMER REQUEST PHOTOS
          ================================================== */}

          <PhotosCard
            photos={
              photos
            }
            onOpenPhoto={
              handleOpenPhoto
            }
          />

          {/* ==================================================
             REQUEST INFO
          ================================================== */}

          <RequestInfoCard
            createdAt={formatTimestamp(
              request.createdAt,
            )}
            requestId={
              request.id
            }
          />
        </ScrollView>

        {/* ====================================================
           ACTIONS
        ==================================================== */}

        {showActions ? (
          <View
            style={
              styles.actionBar
            }
          >
            {canCallShop ? (
              <Pressable
                onPress={
                  handleCallShop
                }
                disabled={
                  isCancelling
                }
                accessibilityRole="button"
                accessibilityLabel="Call shop"
                accessibilityHint="Starts a Fixxam voice call with the shop."
                style={({
                  pressed,
                }) => [
                  styles.actionButton,
                  styles.callButton,
                  pressed &&
                  !isCancelling
                    ? styles.pressed
                    : null,
                  isCancelling
                    ? styles.disabledButton
                    : null,
                ]}
              >
                <Ionicons
                  name="call-outline"
                  size={18}
                  color={
                    CustomerColors.primary
                  }
                />

                <AppText
                  variant="caption"
                  weight="bold"
                  style={
                    styles.callButtonText
                  }
                >
                  Call Shop
                </AppText>
              </Pressable>
            ) : null}

            {canCancelRequest ? (
              <Pressable
                onPress={
                  handleCancelRequest
                }
                disabled={
                  isCancelling
                }
                accessibilityRole="button"
                accessibilityLabel="Cancel request"
                accessibilityHint="Cancels this pending shop request."
                style={({
                  pressed,
                }) => [
                  styles.actionButton,
                  styles.cancelButton,
                  pressed &&
                  !isCancelling
                    ? styles.pressed
                    : null,
                  isCancelling
                    ? styles.disabledButton
                    : null,
                ]}
              >
                {isCancelling ? (
                  <AppLoader
                    role="customer"
                    size="sm"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="close-circle-outline"
                      size={18}
                      color="#DC2626"
                    />

                    <AppText
                      variant="caption"
                      weight="bold"
                      style={
                        styles.cancelButtonText
                      }
                    >
                      Cancel Request
                    </AppText>
                  </>
                )}
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </SafeAreaView>

      {/* ========================================================
         PHOTO VIEWER
      ======================================================== */}

      <Modal
        visible={
          Boolean(
            selectedPhoto,
          )
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={
          handleClosePhoto
        }
      >
        <View
          style={
            styles.photoModal
          }
        >
          <SafeAreaView
            style={
              styles.photoModalSafeArea
            }
            edges={[
              "top",
              "bottom",
            ]}
          >
            <View
              style={
                styles.photoModalHeader
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.photoModalTitle
                }
              >
                Request Photo
              </AppText>

              <Pressable
                onPress={
                  handleClosePhoto
                }
                accessibilityRole="button"
                accessibilityLabel="Close photo"
                hitSlop={10}
                style={({
                  pressed,
                }) => [
                  styles.closeButton,
                  pressed
                    ? styles.pressed
                    : null,
                ]}
              >
                <Ionicons
                  name="close"
                  size={23}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>

            <View
              style={
                styles.photoModalContent
              }
            >
              {selectedPhoto ? (
                <Image
                  source={{
                    uri:
                      selectedPhoto,
                  }}
                  resizeMode="contain"
                  style={
                    styles.fullPhoto
                  }
                />
              ) : null}
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

/* ==============================================================
   STATE MESSAGE
============================================================== */

function StateMessage({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon:
    keyof typeof Ionicons.glyphMap;

  title: string;

  message: string;

  actionLabel: string;

  onAction: () => void;
}) {
  return (
    <View
      style={
        styles.centerState
      }
    >
      <View
        style={
          styles.stateIcon
        }
      >
        <Ionicons
          name={icon}
          size={27}
          color={
            CustomerColors.primary
          }
        />
      </View>

      <AppText
        weight="bold"
        style={
          styles.stateTitle
        }
      >
        {title}
      </AppText>

      <AppText
        variant="caption"
        tone="secondary"
        style={
          styles.stateMessage
        }
      >
        {message}
      </AppText>

      <Pressable
        onPress={
          onAction
        }
        accessibilityRole="button"
        accessibilityLabel={
          actionLabel
        }
        style={({
          pressed,
        }) => [
          styles.stateButton,
          pressed
            ? styles.pressed
            : null,
        ]}
      >
        <AppText
          weight="bold"
          style={
            styles.stateButtonText
          }
        >
          {actionLabel}
        </AppText>
      </Pressable>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        Colors.background,
    },

    scrollView: {
      flex: 1,
    },

    content: {
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom:
        FixxamTokens.spacing.xl,
      gap: 7,
    },

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    actionBar: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 8,
      paddingHorizontal: 12,
      paddingTop: 9,
      paddingBottom: 8,
      borderTopWidth:
        StyleSheet.hairlineWidth,
      borderTopColor:
        Colors.border,
      backgroundColor:
        Colors.surface,
    },

    actionButton: {
      flex: 1,
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 6,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderRadius: 11,
    },

    callButton: {
      borderColor:
        CustomerColors.primary,
      backgroundColor:
        "#EFF6FF",
    },

    callButtonText: {
      color:
        CustomerColors.primary,
    },

    cancelButton: {
      borderColor:
        "#FCA5A5",
      backgroundColor:
        "#FEF2F2",
    },

    cancelButtonText: {
      color:
        "#DC2626",
    },

    disabledButton: {
      opacity: 0.55,
    },

    centerState: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal:
        FixxamTokens.spacing.lg,
    },

    stateIcon: {
      width: 50,
      height: 50,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginBottom: 9,
      borderRadius: 25,
      backgroundColor:
        "#EFF6FF",
    },

    stateTitle: {
      textAlign:
        "center",
      fontSize: 17,
    },

    stateMessage: {
      maxWidth: 300,
      marginTop: 5,
      textAlign:
        "center",
      lineHeight: 18,
    },

    stateButton: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginTop: 13,
      paddingHorizontal: 18,
      borderRadius: 11,
      backgroundColor:
        CustomerColors.primary,
    },

    stateButtonText: {
      color:
        Colors.textInverse,
    },

    photoModal: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.96)",
    },

    photoModalSafeArea: {
      flex: 1,
    },

    photoModalHeader: {
      minHeight: 52,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      paddingHorizontal: 12,
    },

    photoModalTitle: {
      color:
        "#FFFFFF",
    },

    closeButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,
      height:
        FixxamTokens.size
          .minimumTouchTarget,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius:
        FixxamTokens.radius.chip,
      backgroundColor:
        "rgba(255,255,255,0.12)",
    },

    photoModalContent: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    fullPhoto: {
      width: "100%",
      height: "100%",
    },
  });