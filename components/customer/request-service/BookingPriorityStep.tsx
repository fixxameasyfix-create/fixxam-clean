import React, {
  memo,
} from "react";

import {
  Modal,
  Pressable,
  ScrollView,
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
  type BookingPriority,
} from "@/types/bookingPriority";

/* ==============================================================
   TYPES
============================================================== */

type MaterialIconName =
  React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];

type Props = {
  visible: boolean;

  value:
    | BookingPriority
    | null;

  scheduleSelected: boolean;

  onChange: (
    value: BookingPriority,
  ) => void;

  onScheduleSelect: () => void;

  onContinue: () => void;

  onGoBack: () => void;

  disabled?: boolean;
};

type PriorityOptionData = {
  value: BookingPriority;

  icon: MaterialIconName;

  title: string;

  description: string;
};

/* ==============================================================
   OPTIONS
============================================================== */

const PRIORITY_OPTIONS:
  readonly PriorityOptionData[] =
  [
    {
      value:
        "immediate",

      icon:
        "lightning-bolt-outline",

      title:
        "Immediately",

      description:
        "I need the service as soon as possible.",
    },

    {
      value:
        "normal",

      icon:
        "clock-outline",

      title:
        "Normally",

      description:
        "Standard service priority.",
    },

    {
      value:
        "urgent",

      icon:
        "alert-circle-outline",

      title:
        "Urgently",

      description:
        "I need this service handled urgently.",
    },
  ];

/* ==============================================================
   COMPONENT
============================================================== */

function BookingPriorityStep({
  visible,
  value,
  scheduleSelected,
  onChange,
  onScheduleSelect,
  onContinue,
  onGoBack,
  disabled = false,
}: Props) {
  const canContinue =
    !disabled &&
    (
      value !== null ||
      scheduleSelected
    );

  const handleRequestClose =
    () => {
      if (disabled) {
        return;
      }

      onGoBack();
    };

  return (
    <Modal
      visible={
        visible
      }
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
          accessibilityLabel="Close booking priority"
          disabled={
            disabled
          }
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
                name="timer-outline"
                size={26}
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
                How do you want this service?
              </AppText>

              <AppText
                variant="bodyMedium"
                tone="secondary"
                numberOfLines={3}
                style={
                  styles.headerDescription
                }
              >
                Choose how quickly you need the
                service or schedule it for later.
              </AppText>
            </View>

            {/* CLOSE */}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              accessibilityHint="Close booking priority"
              disabled={
                disabled
              }
              onPress={
                handleRequestClose
              }
              hitSlop={8}
              style={({ pressed }) => [
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
              OPTIONS AREA
          ================================================== */}

          <View
            style={
              styles.optionsWrapper
            }
          >
            <ScrollView
              style={
                styles.optionsScroll
              }
              contentContainerStyle={
                styles.optionsContent
              }
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              <View
                accessibilityRole="radiogroup"
                style={
                  styles.options
                }
              >
                {PRIORITY_OPTIONS.map(
                  option => (
                    <PriorityOption
                      key={
                        option.value
                      }
                      icon={
                        option.icon
                      }
                      title={
                        option.title
                      }
                      description={
                        option.description
                      }
                      selected={
                        !scheduleSelected &&
                        value ===
                          option.value
                      }
                      disabled={
                        disabled
                      }
                      onPress={() =>
                        onChange(
                          option.value,
                        )
                      }
                    />
                  ),
                )}

                {/* ============================================
                    SCHEDULE
                ============================================ */}

                <PriorityOption
                  icon="calendar-clock-outline"
                  title="Schedule for later"
                  description="Choose a preferred date and time."
                  selected={
                    scheduleSelected
                  }
                  disabled={
                    disabled
                  }
                  onPress={
                    onScheduleSelect
                  }
                />
              </View>
            </ScrollView>
          </View>

          {/* ==================================================
              BOTTOM ACTION
          ================================================== */}

          <View
            style={
              styles.actionContainer
            }
          >
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
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

/* ==============================================================
   PRIORITY OPTION
============================================================== */

function PriorityOption({
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
      style={({ pressed }) => [
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
      {/* ========================================================
          ICON
      ======================================================== */}

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
          size={24}
          color={
            CustomerColors.primary
          }
        />
      </View>

      {/* ========================================================
          CONTENT
      ======================================================== */}

      <View
        style={
          styles.optionContent
        }
      >
        <AppText
          variant="bodyLarge"
          weight="bold"
          numberOfLines={1}
          style={
            styles.optionTitle
          }
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

      {/* ========================================================
          RADIO
      ======================================================== */}

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

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       OVERLAY
    ======================================================== */

    overlay: {
      flex: 1,

      justifyContent:
        "flex-end",

      backgroundColor:
        "rgba(15, 23, 42, 0.50)",
    },

    /* ========================================================
       SHEET
    ======================================================== */

    sheet: {
      width:
        "100%",

      maxHeight:
        "88%",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.md,

      borderTopLeftRadius:
        30,

      borderTopRightRadius:
        30,

      overflow:
        "hidden",

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.modal,
    },

    /* ========================================================
       HANDLE
    ======================================================== */

    handle: {
      width:
        42,

      height:
        4,

      alignSelf:
        "center",

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
      width:
        "100%",

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      marginBottom:
        FixxamTokens.spacing.md,
    },

    headerIcon: {
      width:
        50,

      height:
        50,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    headerContent: {
      flex:
        1,

      minWidth:
        0,

      paddingRight:
        FixxamTokens.spacing.xs,
    },

    headerTitle: {
      color:
        Colors.textPrimary,

      lineHeight:
        28,
    },

    headerDescription: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight:
        19,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       CLOSE BUTTON
    ======================================================== */

    closeButton: {
      width:
        38,

      height:
        38,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

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
       OPTIONS WRAPPER
    ======================================================== */

    optionsWrapper: {
      flexShrink:
        1,

      minHeight:
        0,
    },

    optionsScroll: {
      flexShrink:
        1,

      minHeight:
        0,
    },

    optionsContent: {
      paddingTop:
        FixxamTokens.spacing.xs,

      paddingBottom:
        FixxamTokens.spacing.xs,
    },

    options: {
      gap:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       OPTION
    ======================================================== */

    option: {
      width:
        "100%",

      minHeight:
        76,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        18,

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
      width:
        46,

      height:
        46,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.full,

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
      flex:
        1,

      minWidth:
        0,

      marginRight:
        FixxamTokens.spacing.md,
    },

    optionTitle: {
      color:
        Colors.textPrimary,
    },

    optionDescription: {
      marginTop:
        3,

      lineHeight:
        18,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       RADIO
    ======================================================== */

    radio: {
      width:
        24,

      height:
        24,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        1.5,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    radioSelected: {
      borderWidth:
        2,

      borderColor:
        CustomerColors.primary,
    },

    radioDot: {
      width:
        12,

      height:
        12,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primary,
    },

    /* ========================================================
       ACTION CONTAINER
    ======================================================== */

    actionContainer: {
      width:
        "100%",

      marginTop:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.md,

      borderTopWidth:
        StyleSheet.hairlineWidth,

      borderTopColor:
        Colors.border,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       ACTION BUTTON
    ======================================================== */

    actionButton: {
      width:
        "100%",

      minHeight:
        56,

      borderRadius:
        16,
    },
  });

export default memo(
  BookingPriorityStep,
);