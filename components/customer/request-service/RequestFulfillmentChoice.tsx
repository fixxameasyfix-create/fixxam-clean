import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import {
  AppText,
} from "@/components/ui";

import {
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import type {
  BookingFulfillmentMode,
} from "@/types/bookingFulfillment";

/* ==============================================================
   TYPES
============================================================== */

type RequestFulfillmentChoiceProps = {
  value:
    | BookingFulfillmentMode
    | null;

  onChange: (
    value: BookingFulfillmentMode,
  ) => void;

  disabled?: boolean;
};

type ChoiceOption = {
  value: BookingFulfillmentMode;

  icon:
    React.ComponentProps<
      typeof MaterialCommunityIcons
    >["name"];

  title: string;

  description: string;
};

/* ==============================================================
   OPTIONS
============================================================== */

const OPTIONS: readonly ChoiceOption[] = [
  {
    value:
      "worker_visits_customer",

    icon:
      "map-marker-account-outline",

    title:
      "Provider comes to me",

    description:
      "The provider will come to your service location.",
  },

  {
    value:
      "customer_visits_worker",

    icon:
      "store-marker-outline",

    title:
      "I'll go to the provider",

    description:
      "You'll visit the provider at their location.",
  },
];

/* ==============================================================
   COMPONENT
============================================================== */

export default function RequestFulfillmentChoice({
  value,
  onChange,
  disabled = false,
}: RequestFulfillmentChoiceProps) {
  return (
    <View
      style={
        styles.container
      }
    >
      <AppText
        style={
          styles.title
        }
      >
        How would you like to receive this service?
      </AppText>

      <AppText
        style={
          styles.subtitle
        }
      >
        Choose the option that works best for you.
      </AppText>

      <View
        style={
          styles.options
        }
      >
        {OPTIONS.map(
          option => {
            const selected =
              value ===
              option.value;

            return (
              <Pressable
                key={
                  option.value
                }
                disabled={
                  disabled
                }
                accessibilityRole="radio"
                accessibilityState={{
                  checked:
                    selected,

                  disabled,
                }}
                accessibilityLabel={
                  option.title
                }
                onPress={() =>
                  onChange(
                    option.value,
                  )
                }
                style={({
                  pressed,
                }) => [
                  styles.option,

                  selected &&
                    styles.optionSelected,

                  pressed &&
                    !disabled &&
                    styles.optionPressed,

                  disabled &&
                    styles.optionDisabled,
                ]}
              >
                <View
                  style={[
                    styles.iconContainer,

                    selected &&
                      styles.iconContainerSelected,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={
                      option.icon
                    }
                    size={
                      24
                    }
                    color={
                      selected
                        ? CustomerColors.primary
                        : CustomerColors.textSecondary
                    }
                  />
                </View>

                <View
                  style={
                    styles.optionContent
                  }
                >
                  <AppText
                    style={[
                      styles.optionTitle,

                      selected &&
                        styles.optionTitleSelected,
                    ]}
                  >
                    {
                      option.title
                    }
                  </AppText>

                  <AppText
                    style={
                      styles.optionDescription
                    }
                  >
                    {
                      option.description
                    }
                  </AppText>
                </View>

                <View
                  style={[
                    styles.radio,

                    selected &&
                      styles.radioSelected,
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
          },
        )}
      </View>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      gap:
        FixxamTokens
          .spacing
          .sm,
    },

    title: {
      fontSize:
        16,

      fontWeight:
        "700",

      color:
        CustomerColors.textPrimary,
    },

    subtitle: {
      fontSize:
        13,

      lineHeight:
        19,

      color:
        CustomerColors.textSecondary,
    },

    options: {
      gap:
        FixxamTokens
          .spacing
          .sm,

      marginTop:
        FixxamTokens
          .spacing
          .xs,
    },

    option: {
      minHeight:
        82,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens
          .spacing
          .md,

      padding:
        FixxamTokens
          .spacing
          .md,

      borderWidth:
        1,

      borderColor:
        CustomerColors.border,

      borderRadius:
        FixxamTokens
          .radius
          .lg,

      backgroundColor:
        CustomerColors.surface,
    },

    optionSelected: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    optionPressed: {
      opacity:
        0.82,
    },

    optionDisabled: {
      opacity:
        0.55,
    },

    iconContainer: {
      width:
        44,

      height:
        44,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        22,

      backgroundColor:
        CustomerColors.background,
    },

    iconContainerSelected: {
      backgroundColor:
        CustomerColors.surface,
    },

    optionContent: {
      flex:
        1,

      gap:
        3,
    },

    optionTitle: {
      fontSize:
        15,

      fontWeight:
        "700",

      color:
        CustomerColors.textPrimary,
    },

    optionTitleSelected: {
      color:
        CustomerColors.primary,
    },

    optionDescription: {
      fontSize:
        12,

      lineHeight:
        18,

      color:
        CustomerColors.textSecondary,
    },

    radio: {
      width:
        22,

      height:
        22,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        2,

      borderColor:
        CustomerColors.border,

      borderRadius:
        11,
    },

    radioSelected: {
      borderColor:
        CustomerColors.primary,
    },

    radioDot: {
      width:
        10,

      height:
        10,

      borderRadius:
        5,

      backgroundColor:
        CustomerColors.primary,
    },
  });