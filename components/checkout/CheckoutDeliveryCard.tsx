import React, { memo } from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
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
  Typography,
} from "@/theme";

import { MAX_ADDRESS_LENGTH } from "@/hooks/useCheckout";

type Props = {
  address: string;
  focused: boolean;
  loading: boolean;
  locationLoading: boolean;
  latitude: number | null;
  longitude: number | null;
  onAddressChange: (value: string) => void;
  onFocusChange: (focused: boolean) => void;
  onUseCurrentLocation: () => void;
};

function CheckoutDeliveryCard({
  address,
  focused,
  loading,
  locationLoading,
  latitude,
  longitude,
  onAddressChange,
  onFocusChange,
  onUseCurrentLocation,
}: Props) {
  const locationSelected =
    latitude !== null && longitude !== null;

  return (
    <View style={styles.card}>
      <AppText
        variant="heading3"
        weight="bold"
        style={styles.sectionTitle}
      >
        Delivery Address
      </AppText>

      <View
        style={[
          styles.inputContainer,
          focused && styles.inputContainerFocused,
        ]}
      >
        <AppIcon
          name="location"
          role="customer"
          size="sm"
          color={
            focused
              ? CustomerColors.primary
              : Colors.textMuted
          }
        />

        <TextInput
          value={address}
          onChangeText={onAddressChange}
          onFocus={() => onFocusChange(true)}
          onBlur={() => onFocusChange(false)}
          placeholder="Enter delivery address"
          placeholderTextColor={Colors.textMuted}
          selectionColor={CustomerColors.primary}
          editable={!loading && !locationLoading}
          multiline
          maxLength={MAX_ADDRESS_LENGTH}
          textAlignVertical="top"
          accessibilityLabel="Delivery address"
          style={styles.input}
        />
      </View>

      <Pressable
        onPress={onUseCurrentLocation}
        disabled={loading || locationLoading}
        accessibilityRole="button"
        accessibilityLabel="Use current location"
        accessibilityState={{
          disabled: loading || locationLoading,
          busy: locationLoading,
        }}
        style={({ pressed }) => [
          styles.locationButton,
          (loading || locationLoading) && styles.disabled,
          pressed &&
            !loading &&
            !locationLoading &&
            styles.pressed,
        ]}
      >
        {locationLoading ? (
          <ActivityIndicator
            size="small"
            color={CustomerColors.primary}
          />
        ) : (
          <AppIcon
            name="location"
            role="customer"
            size="sm"
            color={CustomerColors.primary}
          />
        )}

        <AppText
          variant="body"
          weight="bold"
          style={styles.locationButtonText}
        >
          {locationLoading
            ? "Getting location..."
            : "Use Current Location"}
        </AppText>
      </Pressable>

      <AppText
        variant="caption"
        tone="secondary"
        center
        style={styles.trackingHint}
      >
        After placing this order, you can track it easily with Fixxam.
      </AppText>

      {locationSelected && (
        <View style={styles.locationSelected}>
          <AppIcon
            name="success"
            size="sm"
            color={Colors.success}
          />

          <AppText
            variant="caption"
            weight="bold"
            style={styles.locationSelectedText}
          >
            Current location selected
          </AppText>
        </View>
      )}
    </View>
  );
}

export default memo(CheckoutDeliveryCard);

const styles = StyleSheet.create({
  card: {
    marginBottom: FixxamTokens.spacing.lg,
    padding: FixxamTokens.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: FixxamTokens.radius.xl,
    backgroundColor: Colors.surface,
    ...FixxamTokens.shadow.card,
  },

  sectionTitle: {
    marginBottom: FixxamTokens.spacing.md,
    color: Colors.textPrimary,
  },

  inputContainer: {
    minHeight: 74,
    paddingHorizontal: FixxamTokens.spacing.md,
    paddingTop: FixxamTokens.spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: FixxamTokens.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: FixxamTokens.radius.input,
    backgroundColor: Colors.background,
  },

  inputContainerFocused: {
    borderColor: CustomerColors.primary,
    backgroundColor: Colors.surface,
  },

  input: {
    flex: 1,
    minHeight: 54,
    padding: 0,
    paddingBottom: FixxamTokens.spacing.md,
    fontSize: Typography.fontSize.md,
    lineHeight: 21,
    color: Colors.textPrimary,
  },

  locationButton: {
    minHeight: FixxamTokens.size.buttonHeight,
    marginTop: FixxamTokens.spacing.sm,
    paddingHorizontal: FixxamTokens.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: FixxamTokens.spacing.sm,
    borderWidth: 1,
    borderColor: CustomerColors.primary,
    borderRadius: FixxamTokens.radius.button,
    backgroundColor: CustomerColors.primarySoft,
  },

  locationButtonText: {
    color: CustomerColors.primary,
  },

  trackingHint: {
    marginTop: FixxamTokens.spacing.sm,
    lineHeight: 18,
    color: Colors.textSecondary,
  },

  locationSelected: {
    marginTop: FixxamTokens.spacing.md,
    padding: FixxamTokens.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: FixxamTokens.spacing.sm,
    borderRadius: FixxamTokens.radius.md,
    backgroundColor: Colors.successSoft,
  },

  locationSelectedText: {
    color: Colors.success,
  },

  pressed: {
    opacity: FixxamTokens.motion.pressedOpacity,
    transform: [
      {
        scale: FixxamTokens.motion.scalePressed,
      },
    ],
  },

  disabled: {
    opacity: FixxamTokens.motion.disabledOpacity,
  },
});