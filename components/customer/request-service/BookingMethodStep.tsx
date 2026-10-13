import React, {
  memo,
} from "react";

import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppButton,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import {
  type BookingFulfillmentMode,
} from "@/types/bookingFulfillment";

import {
  type ServiceFulfillmentMode,
} from "@/types/serviceFulfillment";

/* ==============================================================
   TYPES
============================================================== */

type MaterialIconName =
  React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];

type Props = {
  visible: boolean;

  workerName: string;

  fulfillmentMode:
    ServiceFulfillmentMode;

  selectedFulfillmentMode:
    | BookingFulfillmentMode
    | null;

  onFulfillmentModeChange: (
    value: BookingFulfillmentMode,
  ) => void;

  onContinue: () => void;

  onGoBack: () => void;

  disabled?: boolean;
};

/* ==============================================================
   COMPONENT
============================================================== */

function BookingMethodStep({
  visible,
  workerName,
  fulfillmentMode,
  selectedFulfillmentMode,
  onFulfillmentModeChange,
  onContinue,
  onGoBack,
  disabled = false,
}: Props) {
  const cleanWorkerName =
    workerName.trim() ||
    "The provider";

  const isFlexible =
    fulfillmentMode === "flexible";

  const isRemote =
    fulfillmentMode === "remote";

  const isUnavailable =
    fulfillmentMode === "needs_review";

  const canContinue =
    !disabled &&
    !isUnavailable &&
    (
      !isFlexible ||
      selectedFulfillmentMode ===
        "worker_visits_customer" ||
      selectedFulfillmentMode ===
        "customer_visits_worker"
    );

  const handleRequestClose =
    () => {
      if (disabled) {
        return;
      }

      onGoBack();
    };

  const headerIcon: MaterialIconName =
    isFlexible
      ? "map-marker-path"
      : isUnavailable
        ? "alert-circle-outline"
        : isRemote
          ? "laptop"
          : fulfillmentMode ===
              "worker_visits_customer"
            ? "home-outline"
            : "store-outline";

  const headerTitle =
    isFlexible
      ? "Where would you like the service?"
      : isUnavailable
        ? "Booking unavailable"
        : isRemote
          ? "This service is remote"
          : "Where will the service happen?";

  const headerDescription =
    isFlexible
      ? "Choose how this service will be provided."
      : isUnavailable
        ? "This service is not ready for booking yet."
        : isRemote
          ? "No travel or physical service location is required."
          : "Choose how this service will be provided.";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={
        handleRequestClose
      }
    >
      <View
        style={
          styles.overlay
        }
      >
        {/* ====================================================
            BACKDROP
        ==================================================== */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close booking method"
          disabled={disabled}
          onPress={
            handleRequestClose
          }
          style={
            StyleSheet.absoluteFill
          }
        />

        {/* ====================================================
            BOTTOM SHEET
        ==================================================== */}

        <SafeAreaView
          edges={[
            "bottom",
          ]}
          style={
            styles.safeArea
          }
        >
          <View
            style={
              styles.sheet
            }
          >
            {/* ==================================================
                HANDLE
            ================================================== */}

            <View
              style={
                styles.handle
              }
            />

            {/* ==================================================
                HEADER
            ================================================== */}

            <View
              style={
                styles.header
              }
            >
              {/* HEADER ICON */}

              <View
                style={
                  styles.headerIcon
                }
              >
                <MaterialCommunityIcons
                  name={
                    headerIcon
                  }
                  size={25}
                  color={
                    CustomerColors.primary
                  }
                />
              </View>

              {/* HEADER CONTENT */}

              <View
                style={
                  styles.headerContent
                }
              >
                <AppText
                  variant="heading2"
                  weight="bold"
                  numberOfLines={2}
                  style={
                    styles.headerTitle
                  }
                >
                  {headerTitle}
                </AppText>

                <AppText
                  variant="bodyMedium"
                  tone="secondary"
                  numberOfLines={2}
                  style={
                    styles.headerDescription
                  }
                >
                  {headerDescription}
                </AppText>
              </View>

              {/* CLOSE */}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                disabled={
                  disabled
                }
                onPress={
                  handleRequestClose
                }
                hitSlop={8}
                style={({
                  pressed,
                }) => [
                  styles.closeButton,

                  pressed &&
                  !disabled
                    ? styles.closeButtonPressed
                    : null,

                  disabled
                    ? styles.closeButtonDisabled
                    : null,
                ]}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={21}
                  color={
                    Colors.textSecondary
                  }
                />
              </Pressable>
            </View>

            {/* ==================================================
                FIXED PROVIDER VISITS CUSTOMER
            ================================================== */}

            {fulfillmentMode ===
            "worker_visits_customer" ? (
              <MethodInformation
                icon="home-outline"
                title="The provider will come to you"
                description={`${cleanWorkerName} will come to the location you choose for the service.`}
              />
            ) : null}

            {/* ==================================================
                FIXED CUSTOMER VISITS PROVIDER
            ================================================== */}

            {fulfillmentMode ===
            "customer_visits_worker" ? (
              <MethodInformation
                icon="store-outline"
                title="You'll go to the provider"
                description={`You'll visit ${cleanWorkerName} at their service location.`}
              />
            ) : null}

            {/* ==================================================
                REMOTE
            ================================================== */}

            {isRemote ? (
              <MethodInformation
                icon="laptop"
                title="Service provided remotely"
                description={`${cleanWorkerName} will provide this service remotely. You won't need to travel or provide a physical service location.`}
              />
            ) : null}

            {/* ==================================================
                FLEXIBLE OPTIONS
            ================================================== */}

            {isFlexible ? (
              <View
                accessibilityRole="radiogroup"
                style={
                  styles.options
                }
              >
                <FulfillmentOption
                  icon="home-outline"
                  title="The provider will come to me"
                  description="The provider will come to my selected service location."
                  selected={
                    selectedFulfillmentMode ===
                    "worker_visits_customer"
                  }
                  disabled={
                    disabled
                  }
                  onPress={() =>
                    onFulfillmentModeChange(
                      "worker_visits_customer",
                    )
                  }
                />

                <FulfillmentOption
                  icon="store-outline"
                  title="I'll go to the provider"
                  description="I'll visit the provider at their service location."
                  selected={
                    selectedFulfillmentMode ===
                    "customer_visits_worker"
                  }
                  disabled={
                    disabled
                  }
                  onPress={() =>
                    onFulfillmentModeChange(
                      "customer_visits_worker",
                    )
                  }
                />
              </View>
            ) : null}

            {/* ==================================================
                UNAVAILABLE
            ================================================== */}

            {isUnavailable ? (
              <View
                style={
                  styles.unavailableCard
                }
              >
                <View
                  style={
                    styles.unavailableIcon
                  }
                >
                  <MaterialCommunityIcons
                    name="information-outline"
                    size={23}
                    color={
                      CustomerColors.primary
                    }
                  />
                </View>

                <View
                  style={
                    styles.unavailableContent
                  }
                >
                  <AppText
                    variant="bodyLarge"
                    weight="bold"
                  >
                    Booking temporarily unavailable
                  </AppText>

                  <AppText
                    variant="bodyMedium"
                    tone="secondary"
                    style={
                      styles.unavailableDescription
                    }
                  >
                    This service is still being
                    configured. Please choose
                    another service or try again
                    later.
                  </AppText>
                </View>
              </View>
            ) : null}

            {/* ==================================================
                ACTION
            ================================================== */}

            <View
              style={
                styles.actionContainer
              }
            >
              {isUnavailable ? (
                <AppButton
                  title="Go Back"
                  role="customer"
                  variant="outline"
                  leftIconName="back"
                  disabled={
                    disabled
                  }
                  onPress={
                    onGoBack
                  }
                  style={
                    styles.actionButton
                  }
                />
              ) : (
                <AppButton
                  title="Continue"
                  role="customer"
                  rightIconName="next"
                  disabled={
                    !canContinue
                  }
                  onPress={
                    onContinue
                  }
                  style={
                    styles.actionButton
                  }
                />
              )}
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

/* ==============================================================
   METHOD INFORMATION
============================================================== */

function MethodInformation({
  icon,
  title,
  description,
}: {
  icon: MaterialIconName;

  title: string;

  description: string;
}) {
  return (
    <View
      style={
        styles.methodInformation
      }
    >
      <View
        style={
          styles.largeMethodIcon
        }
      >
        <MaterialCommunityIcons
          name={
            icon
          }
          size={26}
          color={
            CustomerColors.primary
          }
        />
      </View>

      <View
        style={
          styles.methodInformationContent
        }
      >
        <AppText
          variant="bodyLarge"
          weight="bold"
          numberOfLines={2}
        >
          {title}
        </AppText>

        <AppText
          variant="bodyMedium"
          tone="secondary"
          style={
            styles.methodInformationDescription
          }
        >
          {description}
        </AppText>
      </View>

      <View
        style={
          styles.checkBadge
        }
      >
        <MaterialCommunityIcons
          name="check"
          size={17}
          color={
            CustomerColors.primary
          }
        />
      </View>
    </View>
  );
}

/* ==============================================================
   FULFILLMENT OPTION
============================================================== */

function FulfillmentOption({
  icon,
  title,
  description,
  selected,
  disabled,
  onPress,
}: {
  icon: MaterialIconName;

  title: string;

  description: string;

  selected: boolean;

  disabled: boolean;

  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={
        title
      }
      accessibilityHint={
        description
      }
      accessibilityState={{
        selected,
        disabled,
      }}
      disabled={
        disabled
      }
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        styles.option,

        selected
          ? styles.optionSelected
          : null,

        pressed &&
        !disabled
          ? styles.optionPressed
          : null,

        disabled
          ? styles.optionDisabled
          : null,
      ]}
    >
      {/* ICON */}

      <View
        style={[
          styles.optionIcon,

          selected
            ? styles.optionIconSelected
            : null,
        ]}
      >
        <MaterialCommunityIcons
          name={
            icon
          }
          size={25}
          color={
            CustomerColors.primary
          }
        />
      </View>

      {/* CONTENT */}

      <View
        style={
          styles.optionContent
        }
      >
        <AppText
          variant="bodyLarge"
          weight="bold"
          numberOfLines={2}
        >
          {title}
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={2}
          style={
            styles.optionDescription
          }
        >
          {description}
        </AppText>
      </View>

      {/* RADIO */}

      <View
        style={[
          styles.radio,

          selected
            ? styles.radioSelected
            : null,
        ]}
      >
        {selected ? (
          <View
            style={
              styles.radioDot
            }
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles =
  StyleSheet.create({
    /* ========================================================
       OVERLAY
    ======================================================== */

    overlay: {
      flex: 1,

      justifyContent: "flex-end",

      backgroundColor:
        "rgba(15, 23, 42, 0.46)",
    },

    safeArea: {
      width: "100%",
    },

    /* ========================================================
       BOTTOM SHEET
    ======================================================== */

    sheet: {
      width: "100%",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.sm,

      borderTopLeftRadius: 28,

      borderTopRightRadius: 28,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.modal,
    },

    /* ========================================================
       HANDLE
    ======================================================== */

    handle: {
      width: 38,

      height: 4,

      alignSelf: "center",

      marginBottom:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.border,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection: "row",

      alignItems: "flex-start",

      marginBottom:
        FixxamTokens.spacing.md,
    },

    headerIcon: {
      width: 48,

      height: 48,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      marginRight:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    headerContent: {
      flex: 1,

      minWidth: 0,

      paddingRight:
        FixxamTokens.spacing.xs,
    },

    headerTitle: {
      color:
        Colors.textPrimary,

      lineHeight: 29,
    },

    headerDescription: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 19,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       CLOSE BUTTON
    ======================================================== */

    closeButton: {
      width: 36,

      height: 36,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      marginLeft:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.background,
    },

    closeButtonPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },

    closeButtonDisabled: {
      opacity:
        FixxamTokens.motion.disabledOpacity,
    },

    /* ========================================================
       FIXED METHOD CARD
    ======================================================== */

    methodInformation: {
      width: "100%",

      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        CustomerColors.primary,

      borderRadius: 20,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    largeMethodIcon: {
      width: 46,

      height: 46,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      marginRight:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    methodInformationContent: {
      flex: 1,

      minWidth: 0,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    methodInformationDescription: {
      marginTop: 3,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       CHECK BADGE
    ======================================================== */

    checkBadge: {
      width: 28,

      height: 28,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       FLEXIBLE OPTIONS
    ======================================================== */

    options: {
      width: "100%",

      gap:
        FixxamTokens.spacing.sm,
    },

    option: {
      width: "100%",

      minHeight: 82,

      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius: 20,

      backgroundColor:
        Colors.surface,
    },

    optionSelected: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    optionPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },

    optionDisabled: {
      opacity:
        FixxamTokens.motion.disabledOpacity,
    },

    /* ========================================================
       OPTION ICON
    ======================================================== */

    optionIcon: {
      width: 46,

      height: 46,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      marginRight:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    optionIconSelected: {
      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       OPTION CONTENT
    ======================================================== */

    optionContent: {
      flex: 1,

      minWidth: 0,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    optionDescription: {
      marginTop: 2,

      lineHeight: 17,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       RADIO
    ======================================================== */

    radio: {
      width: 22,

      height: 22,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      borderWidth: 1.5,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    radioSelected: {
      borderColor:
        CustomerColors.primary,
    },

    radioDot: {
      width: 10,

      height: 10,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primary,
    },

    /* ========================================================
       UNAVAILABLE
    ======================================================== */

    unavailableCard: {
      width: "100%",

      flexDirection: "row",

      alignItems: "flex-start",

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius: 20,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    unavailableIcon: {
      width: 46,

      height: 46,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      marginRight:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    unavailableContent: {
      flex: 1,

      minWidth: 0,
    },

    unavailableDescription: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 19,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       ACTION AREA
    ======================================================== */

    actionContainer: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.md,

      paddingTop: 0,

      paddingBottom: 0,
    },

    actionButton: {
      width: "100%",

      minHeight: 56,

      marginTop: 0,

      borderRadius: 16,
    },
  });

export default memo(
  BookingMethodStep,
);