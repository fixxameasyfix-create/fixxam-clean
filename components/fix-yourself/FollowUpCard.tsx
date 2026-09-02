import React from "react";

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  AppButton,
  AppScreen,
} from "@/components/ui";

import FollowUpHeader from "./FollowUpHeader";
import FollowUpInput from "./FollowUpInput";
import FollowUpQuestion from "./FollowUpQuestion";

type Props = {
  question: string;
  answer: string;
  loading: boolean;
  onChangeAnswer: (
    value: string,
  ) => void;
  onContinue: () => void;
};

export default function FollowUpCard({
  question,
  answer,
  loading,
  onChangeAnswer,
  onContinue,
}: Props) {
  return (
    <AppScreen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
          }
        >
          <FollowUpHeader />

          <FollowUpQuestion
            question={question}
          />

          <FollowUpInput
            value={answer}
            onChangeText={
              onChangeAnswer
            }
          />

          <View
            style={
              styles.buttonContainer
            }
          >
            <AppButton
              title="Continue"
              loading={loading}
              disabled={
                loading ||
                !answer.trim()
              }
              onPress={
                onContinue
              }
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles =
  StyleSheet.create({
    flex: {
      flex: 1,
    },

    content: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 32,
    },

    buttonContainer: {
      marginTop: 20,
      marginBottom: 24,
    },
  });