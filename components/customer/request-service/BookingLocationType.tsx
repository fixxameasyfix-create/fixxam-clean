import React, {
  memo,
  useCallback,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

export type LocationType =
  | "current"
  | "manual";

type Props = {
  value: LocationType;

  onChange: (
    value: LocationType,
  ) => void;

  disabled?: boolean;
};

type LocationOptionProps = {
  type: LocationType;

  icon:
    | "locate"
    | "file";

  title: string;

  subtitle: string;

  selected: boolean;

  disabled: boolean;

  onSelect: (
    value: LocationType,
  ) => void;
};

/* ==============================================================
   OPTION
============================================================== */

function LocationOption({
  type,
  icon,
  title,
  subtitle,
  selected,
  disabled,
  onSelect,
}: LocationOptionProps) {
  const handlePress =
    useCallback(() => {
      if (
        disabled ||
        selected
      ) {
        return;
      }

      onSelect(
        type,
      );
    }, [
      disabled,
      onSelect,
      selected,
      type,
    ]);

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={`${title} location`}
      accessibilityState={{
        selected,
        disabled,
      }}
      disabled={
        disabled
      }
      onPress={
        handlePress
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
      {/* ======================================================
          ICON
      ====================================================== */}

      <View
        style={[
          styles.iconBox,

          selected
            ? styles.iconBoxSelected
            : null,
        ]}
      >
        <AppIcon
          name={icon}
          role="customer"
          size="sm"
          state={
            selected
              ? "active"
              : "muted"
          }
        />
      </View>

      {/* ======================================================
          TEXT
      ====================================================== */}

      <View
        style={
          styles.content
        }
      >
        <AppText
          variant="bodyMedium"
          weight="bold"
          numberOfLines={1}
          style={
            selected
              ? styles.titleSelected
              : undefined
          }
        >
          {title}
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={2}
          style={
            styles.subtitle
          }
        >
          {subtitle}
        </AppText>
      </View>

      {/* ======================================================
          RADIO
      ====================================================== */}

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
   COMPONENT
============================================================== */

function BookingLocationType({
  value,
  onChange,
  disabled = false,
}: Props) {
  return (
    <View
      style={
        styles.container
      }
      accessibilityRole="radiogroup"
      accessibilityLabel="Service location type"
    >
      <LocationOption
        type="current"
        icon="locate"
        title="Current"
        subtitle="Use my current location"
        selected={
          value === "current"
        }
        disabled={
          disabled
        }
        onSelect={
          onChange
        }
      />

      <LocationOption
        type="manual"
        icon="file"
        title="Manual"
        subtitle="Enter service location"
        selected={
          value === "manual"
        }
        disabled={
          disabled
        }
        onSelect={
          onChange
        }
      />
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      flexDirection:
        "row",

      gap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       OPTION
    ======================================================== */

    option: {
      flex: 1,

      minWidth: 0,

      minHeight:
        FixxamTokens.size
          .cardMinHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      padding:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

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

    optionDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    /* ========================================================
       ICON
    ======================================================== */

    iconBox: {
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

      borderRadius:
        FixxamTokens.radius
          .iconButton,

      backgroundColor:
        Colors.disabledBackground,
    },

    iconBoxSelected: {
      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      marginRight:
        FixxamTokens.spacing.xs,
    },

    titleSelected: {
      color:
        CustomerColors.primary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       RADIO
    ======================================================== */

    radio: {
      width:
        FixxamTokens.size.iconSm,

      height:
        FixxamTokens.size.iconSm,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 2,

      borderColor:
        Colors.disabled,

      borderRadius:
        FixxamTokens.radius.full,
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
  });

export default memo(
  BookingLocationType,
);