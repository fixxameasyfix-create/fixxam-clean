import React, {
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  analyzeProblem,
  ChatMessage,
} from "@/services/fixxamAi";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  FollowUpCard,
} from "@/components/fix-yourself";

import {
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   LOADING STEPS
============================================================ */

const STEPS = [
  "Analyzing your problem...",
  "Finding the best matching service...",
  "Checking possible causes...",
  "Preparing Fixxam Smart Tips...",
  "Almost ready...",
];

/* ============================================================
   TYPES
============================================================ */

type UnderstandingFailedState = {
  message: string;
  reason: string;
} | null;

/* ============================================================
   SCREEN
============================================================ */

export default function FixYourselfLoadingScreen() {
  const params =
    useLocalSearchParams<{
      query?: string;
      messages?: string;
    }>();

  const query =
    typeof params.query === "string"
      ? params.query.trim()
      : "";

  /* ==========================================================
     STATE
  ========================================================== */

  const [stepIndex, setStepIndex] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [followUp, setFollowUp] =
    useState<
      Awaited<
        ReturnType<
          typeof analyzeProblem
        >
      >["followUp"] | null
    >(null);

  const [messages, setMessages] =
    useState<ChatMessage[]>(
      [],
    );

  const [answer, setAnswer] =
    useState("");

  const [
    followUpCount,
    setFollowUpCount,
  ] = useState(0);

  const [
    understandingFailed,
    setUnderstandingFailed,
  ] =
    useState<UnderstandingFailedState>(
      null,
    );

  /* ==========================================================
     HELPERS
  ========================================================== */

  function clearFailureState() {
    setUnderstandingFailed(
      null,
    );
  }

  function handleAnalyzeAgain() {
    /*
     * Return to the previous screen so the
     * customer can correct or improve the
     * problem description.
     */
    clearFailureState();

    setFollowUp(null);

    setAnswer("");

    router.back();
  }

  async function handleTryHelpMeFix() {
    /*
     * Start a guided troubleshooting request
     * using the existing conversation.
     *
     * We do not invent a diagnosis here.
     */
    try {
      setUnderstandingFailed(
        null,
      );

      setLoading(true);

      const helpMessages: ChatMessage[] =
        messages.length > 0
          ? messages
          : [
              {
                role: "user",
                content: query,
              },
            ];

      const response =
        await analyzeProblem(
          query,
          helpMessages,
          0,
          false,
        );

      console.log(
        "TRY HELP ME FIX RESPONSE:",
        JSON.stringify(
          response,
          null,
          2,
        ),
      );

      /* --------------------------------------------------------
         UNDERSTANDING FAILED AGAIN
      -------------------------------------------------------- */

      if (
        response.status ===
        "understanding_failed"
      ) {
        setUnderstandingFailed(
          response.understandingFailed ??
            {
              message:
                "Yi haƙuri, Fixxam bai gane matsalar ba. Ka sake bayyana abin da ba ya aiki da abin da ya faru.",
              reason:
                "The customer problem could not be understood.",
            },
        );

        setLoading(false);

        return;
      }

      /* --------------------------------------------------------
         FOLLOW-UP
      -------------------------------------------------------- */

      if (
        response.status ===
          "follow_up" &&
        response.followUp
      ) {
        setFollowUp(
          response.followUp,
        );

        setAnswer("");

        setLoading(false);

        return;
      }

      /* --------------------------------------------------------
         COMPLETED
      -------------------------------------------------------- */

      if (
        response.status ===
          "completed" &&
        response.diagnosis
      ) {
        router.replace({
          pathname:
            "/(customer)/fix-yourself/result",

          params: {
            query,

            result:
              JSON.stringify(
                response.diagnosis,
              ),
          },
        });

        return;
      }

      throw new Error(
        "Invalid AI response.",
      );
    } catch (error) {
      console.error(
        "TRY HELP ME FIX ERROR:",
        error,
      );

      Alert.alert(
        "Analysis Failed",
        "We couldn't start the guided troubleshooting right now. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* ==========================================================
     FOLLOW-UP CONTINUE
  ========================================================== */

  async function handleContinue() {
    const value =
      answer.trim();

    if (
      !value ||
      !followUp
    ) {
      return;
    }

    try {
      setLoading(true);

      clearFailureState();

      const currentFollowUp =
        followUp;

      setFollowUp(null);

      const updatedMessages:
        ChatMessage[] = [
          ...messages,

          {
            role: "assistant",
            content:
              currentFollowUp.question,
          },

          {
            role: "user",
            content: value,
          },
        ];

      setMessages(
        updatedMessages,
      );

      const nextFollowUpCount =
        followUpCount + 1;

      setFollowUpCount(
        nextFollowUpCount,
      );

      const forceDiagnosis =
        nextFollowUpCount >= 2;

      console.log(
        "FOLLOW UP COUNT:",
        nextFollowUpCount,
      );

      console.log(
        "FORCE DIAGNOSIS:",
        forceDiagnosis,
      );

      console.log(
        "MESSAGES:",
        JSON.stringify(
          updatedMessages,
          null,
          2,
        ),
      );

      const response =
        await analyzeProblem(
          query,
          updatedMessages,
          nextFollowUpCount,
          forceDiagnosis,
        );

      console.log(
        "FINAL RESPONSE:",
        JSON.stringify(
          response,
          null,
          2,
        ),
      );

      /* --------------------------------------------------------
         UNDERSTANDING FAILED
      -------------------------------------------------------- */

      if (
        response.status ===
        "understanding_failed"
      ) {
        setUnderstandingFailed(
          response.understandingFailed ??
            {
              message:
                "Yi haƙuri, Fixxam bai gane matsalar ba. Ka sake bayyana abin da ba ya aiki da abin da ya faru.",
              reason:
                "The customer problem could not be understood.",
            },
        );

        setLoading(false);

        return;
      }

      /* --------------------------------------------------------
         FOLLOW-UP
      -------------------------------------------------------- */

      if (
        response.status ===
          "follow_up" &&
        response.followUp
      ) {
        setFollowUp(
          response.followUp,
        );

        setAnswer("");

        setLoading(false);

        return;
      }

      /* --------------------------------------------------------
         COMPLETED
      -------------------------------------------------------- */

      if (
        response.status ===
          "completed" &&
        response.diagnosis
      ) {
        router.replace({
          pathname:
            "/(customer)/fix-yourself/result",

          params: {
            query,

            result:
              JSON.stringify(
                response.diagnosis,
              ),
          },
        });

        return;
      }

      throw new Error(
        "Invalid AI response.",
      );
    } catch (error) {
      console.error(
        "FOLLOW-UP ERROR:",
        error,
      );

      Alert.alert(
        "Analysis Failed",
        "We couldn't analyze your answer right now. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* ==========================================================
     LOADING STEPS ANIMATION
  ========================================================== */

  useEffect(() => {
    const timer =
      setInterval(() => {
        setStepIndex(
          (current) =>
            current <
            STEPS.length - 1
              ? current + 1
              : current,
        );
      }, 100);

    return () =>
      clearInterval(
        timer,
      );
  }, []);

  /* ==========================================================
     INITIAL ANALYSIS
  ========================================================== */

  useEffect(() => {
    let cancelled =
      false;

    async function analyze() {
      if (!query) {
        Alert.alert(
          "Problem Required",
          "Please describe your problem first.",
          [
            {
              text: "OK",
              onPress: () =>
                router.back(),
            },
          ],
        );

        setLoading(false);

        return;
      }

      try {
        const conversation:
          ChatMessage[] =
          params.messages
            ? JSON.parse(
                params.messages,
              )
            : [
                {
                  role: "user",
                  content: query,
                },
              ];

        setMessages(
          conversation,
        );

        const response =
          await analyzeProblem(
            query,
            conversation,
            0,
            false,
          );

        if (cancelled) {
          return;
        }

        console.log(
          "INITIAL AI RESPONSE:",
          JSON.stringify(
            response,
            null,
            2,
          ),
        );

        /* ------------------------------------------------------
           UNDERSTANDING FAILED
        ------------------------------------------------------ */

        if (
          response.status ===
          "understanding_failed"
        ) {
          setUnderstandingFailed(
            response.understandingFailed ??
              {
                message:
                  "Yi haƙuri, Fixxam bai gane matsalar ba. Ka sake bayyana abin da ba ya aiki da abin da ya faru.",
                reason:
                  "The customer problem could not be understood.",
              },
          );

          setLoading(false);

          return;
        }

        /* ------------------------------------------------------
           FOLLOW-UP
        ------------------------------------------------------ */

        if (
          response.status ===
            "follow_up" &&
          response.followUp
        ) {
          setLoading(false);

          setFollowUp(
            response.followUp,
          );

          setAnswer("");

          return;
        }

        /* ------------------------------------------------------
           COMPLETED
        ------------------------------------------------------ */

        if (
          response.status ===
            "completed" &&
          response.diagnosis
        ) {
          router.replace({
            pathname:
              "/(customer)/fix-yourself/result",

            params: {
              query,

              result:
                JSON.stringify(
                  response.diagnosis,
                ),
            },
          });

          return;
        }

        throw new Error(
          "Invalid AI response.",
        );
      } catch (error) {
        console.error(
          "INITIAL ANALYSIS ERROR:",
          error,
        );

        if (cancelled) {
          return;
        }

        Alert.alert(
          "Analysis Failed",
          "We couldn't analyze your problem right now. Please try again.",
          [
            {
              text: "Retry",
              onPress: () => {
                analyze();
              },
            },
            {
              text: "Cancel",
              style: "cancel",
              onPress: () =>
                router.back(),
            },
          ],
        );

        setLoading(false);
      }
    }

    analyze();

    return () => {
      cancelled = true;
    };
  }, [
    query,
    params.messages,
  ]);

  /* ==========================================================
     UNDERSTANDING FAILED UI
  ========================================================== */

  if (
    understandingFailed
  ) {
    return (
      <AppScreen>
        <View
          style={
            styles.failureContainer
          }
        >
          <View
            style={
              styles.failureIcon
            }
          >
            <AppText
              size="xl"
              weight="bold"
              center
            >
              ?
            </AppText>
          </View>

          <AppText
            size="xl"
            weight="bold"
            center
            style={
              styles.failureTitle
            }
          >
            Fixxam did't understand
          </AppText>

          <AppText
            center
            color={
              CustomerColors.textSecondary
            }
            style={
              styles.failureMessage
            }
          >
            {
              understandingFailed.message
            }
          </AppText>

          <View
            style={
              styles.actions
            }
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Analyze Again"
              onPress={
                handleAnalyzeAgain
              }
              style={({ pressed }) => [
                styles.primaryButton,
                pressed &&
                  styles.buttonPressed,
              ]}
            >
              <AppText
                weight="bold"
                center
                style={
                  styles.primaryButtonText
                }
              >
                Analyze Again
              </AppText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Try Help Me Fix"
              onPress={
                handleTryHelpMeFix
              }
              disabled={loading}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed &&
                  styles.buttonPressed,
                loading &&
                  styles.buttonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color={
                    CustomerColors.primary
                  }
                />
              ) : (
                <AppText
                  weight="bold"
                  center
                  style={
                    styles.secondaryButtonText
                  }
                >
                  Try Help Me Fix
                </AppText>
              )}
            </Pressable>
          </View>
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
     FOLLOW-UP UI
  ========================================================== */

  if (followUp) {
    return (
      <FollowUpCard
        question={
          followUp.question
        }
        answer={answer}
        loading={loading}
        onChangeAnswer={
          setAnswer
        }
        onContinue={
          handleContinue
        }
      />
    );
  }

  /* ==========================================================
     LOADING UI
  ========================================================== */

  return (
    <AppScreen>
      <View
        style={
          styles.container
        }
      >
        <ActivityIndicator
          size="large"
          color={
            CustomerColors.primary
          }
        />

        <AppText
          size="xl"
          weight="bold"
          center
          style={
            styles.title
          }
        >
          Fixxam Smart Repair
        </AppText>

        <AppText
          center
          color={
            CustomerColors.textSecondary
          }
          style={
            styles.message
          }
        >
          {STEPS[stepIndex]}
        </AppText>

        {query.length > 0 && (
          <View
            style={
              styles.queryBox
            }
          >
            <AppText
              size="sm"
              weight="semibold"
            >
              Your Problem
            </AppText>

            <AppText
              style={
                styles.query
              }
            >
              "{query}"
            </AppText>
          </View>
        )}
      </View>
    </AppScreen>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      justifyContent:
        "center",

      alignItems:
        "center",

      padding:
        FixxamTokens.spacing
          .xl,
    },

    title: {
      marginTop: 24,
    },

    message: {
      marginTop: 16,

      minHeight: 24,

      textAlign:
        "center",
    },

    queryBox: {
      width: "100%",

      marginTop: 40,

      padding: 20,

      borderRadius: 16,

      backgroundColor:
        "#FFFFFF",

      borderWidth: 1,

      borderColor:
        CustomerColors.border,
    },

    query: {
      marginTop: 8,

      color:
        CustomerColors.textSecondary,
    },

    /* ========================================================
       UNDERSTANDING FAILED
    ======================================================== */

    failureContainer: {
      flex: 1,

      justifyContent:
        "center",

      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing
          .xl,
    },

    failureIcon: {
      width: 64,

      height: 64,

      borderRadius: 32,

      justifyContent:
        "center",

      alignItems:
        "center",

      backgroundColor:
        "#FFF4F4",

      marginBottom: 20,
    },

    failureTitle: {
      marginBottom: 14,
    },

    failureMessage: {
      lineHeight: 24,

      textAlign:
        "center",

      maxWidth: 420,
    },

    actions: {
      width: "100%",

      marginTop: 32,

      gap: 12,
    },

    primaryButton: {
      minHeight: 52,

      borderRadius: 14,

      justifyContent:
        "center",

      alignItems:
        "center",

      paddingHorizontal: 20,

      backgroundColor:
        CustomerColors.primary,
    },

    primaryButtonText: {
      color: "#FFFFFF",
    },

    secondaryButton: {
      minHeight: 52,

      borderRadius: 14,

      justifyContent:
        "center",

      alignItems:
        "center",

      paddingHorizontal: 20,

      backgroundColor:
        "#FFFFFF",

      borderWidth: 1,

      borderColor:
        CustomerColors.primary,
    },

    secondaryButtonText: {
      color:
        CustomerColors.primary,
    },

    buttonPressed: {
      opacity: 0.75,
    },

    buttonDisabled: {
      opacity: 0.5,
    },
  });