import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import Toast from "react-native-toast-message";

import {
  analyzeProblem,
  type ChatMessage,
} from "@/services/fixxamAi";

import {
  AppButton,
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  FollowUpCard,
} from "@/components/fix-yourself";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   CONSTANTS
============================================================== */

const STEPS = [
  "Analyzing your problem...",
  "Finding the best matching service...",
  "Checking possible causes...",
  "Preparing Fixxam Smart Tips...",
  "Almost ready...",
] as const;

const STEP_INTERVAL_MS = 900;

/* ==============================================================
   TYPES
============================================================== */

type AnalyzeResponse =
  Awaited<
    ReturnType<
      typeof analyzeProblem
    >
  >;

type FollowUp =
  AnalyzeResponse["followUp"];

type UnderstandingFailedState = {
  message: string;
  reason: string;
} | null;

/* ==============================================================
   FALLBACKS
============================================================== */

const DEFAULT_UNDERSTANDING_FAILURE = {
  message:
    "Yi haƙuri, Fixxam bai gane matsalar ba. Ka sake bayyana abin da ba ya aiki da abin da ya faru.",

  reason:
    "The customer problem could not be understood.",
};

/* ==============================================================
   HELPERS
============================================================== */

function createInitialConversation(
  query: string,
): ChatMessage[] {
  return [
    {
      role: "user",
      content: query,
    },
  ];
}

function parseConversation(
  rawMessages: unknown,
  query: string,
): ChatMessage[] {
  const fallback =
    createInitialConversation(
      query,
    );

  if (
    typeof rawMessages !==
      "string" ||
    !rawMessages.trim()
  ) {
    return fallback;
  }

  try {
    const parsed =
      JSON.parse(
        rawMessages,
      );

    if (
      !Array.isArray(parsed)
    ) {
      return fallback;
    }

    const validMessages =
      parsed.reduce<
        ChatMessage[]
      >(
        (
          items,
          item,
        ) => {
          if (
            !item ||
            typeof item !==
              "object"
          ) {
            return items;
          }

          const role =
            Reflect.get(
              item,
              "role",
            );

          const content =
            Reflect.get(
              item,
              "content",
            );

          if (
            (
              role !==
                "user" &&
              role !==
                "assistant"
            ) ||
            typeof content !==
              "string" ||
            !content.trim()
          ) {
            return items;
          }

          items.push({
            role,
            content:
              content.trim(),
          });

          return items;
        },
        [],
      );

    return validMessages.length >
      0
      ? validMessages
      : fallback;
  } catch {
    return fallback;
  }
}

/* ==============================================================
   SCREEN
============================================================== */

export default function FixYourselfLoadingScreen() {
  const params =
    useLocalSearchParams<{
      query?: string;
      messages?: string;
    }>();

  const query =
    typeof params.query ===
      "string"
      ? params.query.trim()
      : "";

  const [
    stepIndex,
    setStepIndex,
  ] =
    useState(0);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    followUp,
    setFollowUp,
  ] =
    useState<
      FollowUp | null
    >(null);

  const [
    messages,
    setMessages,
  ] =
    useState<
      ChatMessage[]
    >([]);

  const [
    answer,
    setAnswer,
  ] =
    useState("");

  const [
    followUpCount,
    setFollowUpCount,
  ] =
    useState(0);

  const [
    understandingFailed,
    setUnderstandingFailed,
  ] =
    useState<UnderstandingFailedState>(
      null,
    );

  const [
    analysisError,
    setAnalysisError,
  ] =
    useState<
      string | null
    >(null);

  const requestIdRef =
    useRef(0);

  /* ============================================================
     RESPONSE HANDLER
  ============================================================ */

  const applyResponse =
    useCallback(
      (
        response:
          AnalyzeResponse,
      ): boolean => {
        setAnalysisError(
          null,
        );

        if (
          response.status ===
          "understanding_failed"
        ) {
          setUnderstandingFailed(
            response.understandingFailed ??
              DEFAULT_UNDERSTANDING_FAILURE,
          );

          setFollowUp(
            null,
          );

          return true;
        }

        if (
          response.status ===
            "follow_up" &&
          response.followUp
        ) {
          setUnderstandingFailed(
            null,
          );

          setFollowUp(
            response.followUp,
          );

          setAnswer("");

          return true;
        }

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

          return true;
        }

        return false;
      },
      [
        query,
      ],
    );

  /* ============================================================
     INITIAL ANALYSIS
  ============================================================ */

  const runInitialAnalysis =
    useCallback(
      async () => {
        if (!query) {
          Toast.show({
            type: "error",

            text1:
              "Problem required",

            text2:
              "Please describe your problem first.",
          });

          router.back();

          return;
        }

        const requestId =
          ++requestIdRef.current;

        const conversation =
          parseConversation(
            params.messages,
            query,
          );

        setMessages(
          conversation,
        );

        setFollowUpCount(
          0,
        );

        setFollowUp(
          null,
        );

        setUnderstandingFailed(
          null,
        );

        setAnalysisError(
          null,
        );

        setStepIndex(
          0,
        );

        setLoading(
          true,
        );

        try {
          const response =
            await analyzeProblem(
              query,
              conversation,
              0,
              false,
            );

          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          const handled =
            applyResponse(
              response,
            );

          if (!handled) {
            throw new Error(
              "Invalid AI response.",
            );
          }
        } catch (error) {
          console.error(
            "FIX_YOURSELF_INITIAL_ANALYSIS_ERROR:",
            error,
          );

          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          setAnalysisError(
            "We couldn't analyze your problem right now. Please try again.",
          );

          Toast.show({
            type: "error",

            text1:
              "Analysis failed",

            text2:
              "Please try again.",
          });
        } finally {
          if (
            requestId ===
            requestIdRef.current
          ) {
            setLoading(
              false,
            );
          }
        }
      },
      [
        applyResponse,
        params.messages,
        query,
      ],
    );

  /* ============================================================
     INITIAL RUN
  ============================================================ */

  useEffect(() => {
    void runInitialAnalysis();

    return () => {
      requestIdRef.current +=
        1;
    };
  }, [
    runInitialAnalysis,
  ]);

  /* ============================================================
     LOADING STEP ANIMATION
  ============================================================ */

  useEffect(() => {
    if (
      !loading ||
      followUp ||
      understandingFailed ||
      analysisError
    ) {
      return;
    }

    const timer =
      setInterval(() => {
        setStepIndex(
          (current) => {
            if (
              current >=
              STEPS.length - 1
            ) {
              return current;
            }

            return (
              current + 1
            );
          },
        );
      }, STEP_INTERVAL_MS);

    return () => {
      clearInterval(
        timer,
      );
    };
  }, [
    analysisError,
    followUp,
    loading,
    understandingFailed,
  ]);

  /* ============================================================
     ANALYZE AGAIN
  ============================================================ */

  const handleAnalyzeAgain =
    useCallback(() => {
      setUnderstandingFailed(
        null,
      );

      setAnalysisError(
        null,
      );

      setFollowUp(
        null,
      );

      setAnswer("");

      router.back();
    }, []);

  /* ============================================================
     TRY HELP ME FIX
  ============================================================ */

  const handleTryHelpMeFix =
    useCallback(
      async () => {
        if (
          loading ||
          !query
        ) {
          return;
        }

        const requestId =
          ++requestIdRef.current;

        setUnderstandingFailed(
          null,
        );

        setAnalysisError(
          null,
        );

        setFollowUp(
          null,
        );

        setStepIndex(
          0,
        );

        setLoading(
          true,
        );

        const helpMessages =
          messages.length >
          0
            ? messages
            : createInitialConversation(
                query,
              );

        try {
          const response =
            await analyzeProblem(
              query,
              helpMessages,
              0,
              false,
            );

          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          const handled =
            applyResponse(
              response,
            );

          if (!handled) {
            throw new Error(
              "Invalid AI response.",
            );
          }
        } catch (error) {
          console.error(
            "FIX_YOURSELF_GUIDED_HELP_ERROR:",
            error,
          );

          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          setAnalysisError(
            "We couldn't start guided troubleshooting right now. Please try again.",
          );

          Toast.show({
            type: "error",

            text1:
              "Unable to start",

            text2:
              "Please try again.",
          });
        } finally {
          if (
            requestId ===
            requestIdRef.current
          ) {
            setLoading(
              false,
            );
          }
        }
      },
      [
        applyResponse,
        loading,
        messages,
        query,
      ],
    );

  /* ============================================================
     FOLLOW-UP
  ============================================================ */

  const handleContinue =
    useCallback(
      async () => {
        const value =
          answer.trim();

        if (
          !value ||
          !followUp ||
          loading
        ) {
          return;
        }

        const requestId =
          ++requestIdRef.current;

        const currentFollowUp =
          followUp;

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

            content:
              value,
          },
        ];

        const nextFollowUpCount =
          followUpCount +
          1;

        const forceDiagnosis =
          nextFollowUpCount >=
          2;

        setMessages(
          updatedMessages,
        );

        setFollowUpCount(
          nextFollowUpCount,
        );

        setUnderstandingFailed(
          null,
        );

        setAnalysisError(
          null,
        );

        setFollowUp(
          null,
        );

        setLoading(
          true,
        );

        try {
          const response =
            await analyzeProblem(
              query,
              updatedMessages,
              nextFollowUpCount,
              forceDiagnosis,
            );

          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          const handled =
            applyResponse(
              response,
            );

          if (!handled) {
            throw new Error(
              "Invalid AI response.",
            );
          }
        } catch (error) {
          console.error(
            "FIX_YOURSELF_FOLLOW_UP_ERROR:",
            error,
          );

          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          /*
           * Keep the current question and
           * answer so the customer does not
           * lose their work after a network
           * or AI failure.
           */
          setFollowUp(
            currentFollowUp,
          );

          setAnalysisError(
            "We couldn't analyze your answer right now. Please try again.",
          );

          Toast.show({
            type: "error",

            text1:
              "Analysis failed",

            text2:
              "Your answer was kept. Please try again.",
          });
        } finally {
          if (
            requestId ===
            requestIdRef.current
          ) {
            setLoading(
              false,
            );
          }
        }
      },
      [
        answer,
        applyResponse,
        followUp,
        followUpCount,
        loading,
        messages,
        query,
      ],
    );

  /* ============================================================
     ANALYSIS ERROR UI
  ============================================================ */

  if (
    analysisError &&
    !followUp
  ) {
    return (
      <AppScreen
        role="customer"
      >
        <View
          style={
            styles.failureContainer
          }
        >
          <View
            style={
              styles.errorIconBox
            }
          >
            <AppIcon
              name="error"
              role="customer"
              size="xl"
              state="error"
            />
          </View>

          <AppText
            variant="heading2"
            weight="bold"
            center
            style={
              styles.failureTitle
            }
          >
            Analysis Failed
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.failureMessage
            }
          >
            {analysisError}
          </AppText>

          <View
            style={
              styles.actions
            }
          >
            <AppButton
              title="Try Again"
              role="customer"
              variant="primary"
              onPress={() =>
                void runInitialAnalysis()
              }
            />

            <AppButton
              title="Go Back"
              role="customer"
              variant="outline"
              onPress={() =>
                router.back()
              }
            />
          </View>
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     UNDERSTANDING FAILED UI
  ============================================================ */

  if (
    understandingFailed
  ) {
    return (
      <AppScreen
        role="customer"
      >
        <View
          style={
            styles.failureContainer
          }
        >
          <View
            style={
              styles.helpIconBox
            }
          >
            <AppIcon
              name="help"
              role="customer"
              size="xl"
              state="active"
            />
          </View>

          <AppText
            variant="heading2"
            weight="bold"
            center
            style={
              styles.failureTitle
            }
          >
            Fixxam didn't understand
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
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
            <AppButton
              title="Analyze Again"
              role="customer"
              variant="primary"
              onPress={
                handleAnalyzeAgain
              }
            />

            <AppButton
              title="Try Help Me Fix"
              role="customer"
              variant="outline"
              loading={
                loading
              }
              disabled={
                loading
              }
              onPress={() =>
                void handleTryHelpMeFix()
              }
            />
          </View>
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     FOLLOW-UP UI
  ============================================================ */

  if (followUp) {
    return (
      <FollowUpCard
        question={
          followUp.question
        }
        answer={
          answer
        }
        loading={
          loading
        }
        onChangeAnswer={
          setAnswer
        }
        onContinue={() =>
          void handleContinue()
        }
      />
    );
  }

  /* ============================================================
     LOADING UI
  ============================================================ */

  return (
    <AppScreen
      role="customer"
    >
      <View
        style={
          styles.container
        }
      >
        <View
          style={
            styles.loadingIconBox
          }
        >
          <ActivityIndicator
            size="large"
            color={
              CustomerColors.primary
            }
          />
        </View>

        <AppText
          variant="heading2"
          weight="bold"
          center
          style={
            styles.title
          }
        >
          Fixxam Smart Repair
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.message
          }
        >
          {STEPS[
            stepIndex
          ]}
        </AppText>

        {query.length >
        0 ? (
          <View
            style={
              styles.queryBox
            }
          >
            <View
              style={
                styles.queryHeader
              }
            >
              <AppIcon
                name="file"
                role="customer"
                size="xs"
                state="active"
              />

              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.queryLabel
                }
              >
                Your Problem
              </AppText>
            </View>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.query
              }
            >
              “{query}”
            </AppText>
          </View>
        ) : null}
      </View>
    </AppScreen>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       LOADING
    ======================================================== */

    container: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      padding:
        FixxamTokens.spacing.xl,
    },

    loadingIconBox: {
      width: 76,

      height: 76,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    title: {
      marginTop:
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    message: {
      minHeight: 24,

      marginTop:
        FixxamTokens.spacing.md,

      lineHeight: 21,
    },

    /* ========================================================
       QUERY
    ======================================================== */

    queryBox: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xxl,

      padding:
        FixxamTokens.spacing.lg,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    queryHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    queryLabel: {
      marginLeft:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    query: {
      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 21,
    },

    /* ========================================================
       FAILURE
    ======================================================== */

    failureContainer: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,
    },

    helpIconBox: {
      width: 72,

      height: 72,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    errorIconBox: {
      width: 72,

      height: 72,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.errorSoft,
    },

    failureTitle: {
      marginTop:
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    failureMessage: {
      maxWidth: 420,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 24,
    },

    actions: {
      width: "100%",

      gap:
        FixxamTokens.spacing.md,

      marginTop:
        FixxamTokens.spacing.xl,
    },
  });