import React from "react";
import {
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";

import {
  AppButton,
  AppText,
} from "@/components/ui";

import TermsCheckbox from "@/components/auth/TermsCheckbox";

import {
  CustomerColors,
  FixxamTokens,
} from "@/theme";

type Props = {
  acceptedTerms: boolean;
  setAcceptedTerms: (value: boolean) => void;
  loading: boolean;
  onSubmit: () => void;
};

export default function CustomerSignupFooter({
  acceptedTerms,
  setAcceptedTerms,
  loading,
  onSubmit,
}: Props) {
  return (
    <>
      <View
        style={{
          marginBottom:
            FixxamTokens.spacing.lg,
        }}
      >
        <TermsCheckbox
          checked={acceptedTerms}
          onToggle={() =>
            setAcceptedTerms(
              !acceptedTerms
            )
          }
          variant="customer"
        />
      </View>

      <AppButton
        title="Create Customer Account"
        variant="customer"
        loading={loading}
        disabled={!acceptedTerms}
        onPress={onSubmit}
      />

      <View
        style={{
          marginTop:
            FixxamTokens.spacing.xl,
          alignItems: "center",
        }}
      >
        <AppText
          style={{
            color:
              CustomerColors.textSecondary,
          }}
        >
          Already have an account?
        </AppText>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            router.push("/(auth)/login")
          }
        >
          <AppText
            weight="bold"
            style={{
              marginTop:
                FixxamTokens.spacing.xs,
              color:
                CustomerColors.primary,
            }}
          >
            Login
          </AppText>
        </TouchableOpacity>
      </View>
    </>
  );
}