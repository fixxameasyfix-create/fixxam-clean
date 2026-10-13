import React from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  Image,
} from "expo-image";

import {
  router,
} from "expo-router";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import useWorkerSavedRecords from "@/hooks/worker/useWorkerSavedRecords";

import type {
  WorkerSavedRecord,
} from "@/services/savedWorkers/workerSavedService";

/* ============================================================
   TIME
============================================================ */

function formatSavedTime(
  record: WorkerSavedRecord,
): string {
  const createdAt =
    record.createdAt;

  if (!createdAt) {
    return "Now";
  }

  const difference =
    Math.max(
      0,
      Date.now() -
        createdAt.toMillis(),
    );

  const minute =
    60 * 1000;

  const hour =
    60 * minute;

  const day =
    24 * hour;

  if (
    difference <
    minute
  ) {
    return "Now";
  }

  if (
    difference <
    hour
  ) {
    const minutes =
      Math.floor(
        difference /
          minute,
      );

    return `${minutes}m ago`;
  }

  if (
    difference <
    day
  ) {
    const hours =
      Math.floor(
        difference /
          hour,
      );

    return `${hours}h ago`;
  }

  const days =
    Math.floor(
      difference /
        day,
    );

  if (days < 7) {
    return `${days}d ago`;
  }

  return createdAt
    .toDate()
    .toLocaleDateString();
}

/* ============================================================
   SCREEN
============================================================ */

export default function WorkerSavedScreen() {
  const {
    records,
    loading,
    error,
  } =
    useWorkerSavedRecords();

  return (
    <AppScreen
      role="worker"
      padded={false}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        {/* HEADER */}

        <View
          style={
            styles.header
          }
        >
          <Pressable
            onPress={() => {
              router.back();
            }}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({
              pressed,
            }) => [
              styles.backButton,

              pressed
                ? styles.pressed
                : null,
            ]}
          >
            <AppIcon
              name="back"
              size="md"
              color={
                Colors.textPrimary
              }
            />
          </Pressable>

          <View
            style={
              styles.headerText
            }
          >
            <AppText
              variant="heading2"
              weight="bold"
            >
              Saved
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.subtitle
              }
            >
              Customers who saved your profile
            </AppText>
          </View>
        </View>

        {/* LOADING */}

        {loading ? (
          <View
            style={
              styles.stateContainer
            }
          >
            <ActivityIndicator
              size="small"
              color={
                WorkerColors.primary
              }
            />

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.stateText
              }
            >
              Loading saved records...
            </AppText>
          </View>
        ) : error ? (
          <View
            style={
              styles.stateContainer
            }
          >
            <View
              style={
                styles.stateIcon
              }
            >
              <AppIcon
                name="info"
                role="worker"
                size="md"
                color={
                  Colors.error
                }
              />
            </View>

            <AppText
              variant="body"
              weight="bold"
              center
            >
              Unable to load records
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              center
              style={
                styles.stateText
              }
            >
              {error}
            </AppText>
          </View>
        ) : records.length ===
          0 ? (
          <View
            style={
              styles.stateContainer
            }
          >
            <View
              style={
                styles.stateIcon
              }
            >
              <AppIcon
                name="heart"
                role="worker"
                size="lg"
                color={
                  WorkerColors.primary
                }
              />
            </View>

            <AppText
              variant="bodyLarge"
              weight="bold"
              center
            >
              No saves yet
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              center
              style={
                styles.emptyText
              }
            >
              Customers who save your profile will appear here.
            </AppText>
          </View>
        ) : (
          <>
            <View
              style={
                styles.summary
              }
            >
              <View
                style={
                  styles.summaryIcon
                }
              >
                <AppIcon
                  name="heart"
                  role="worker"
                  size="sm"
                  color={
                    WorkerColors.primary
                  }
                />
              </View>

              <View
                style={
                  styles.summaryContent
                }
              >
                <AppText
                  variant="bodyMedium"
                  weight="bold"
                >
                  {records.length}
                  {records.length ===
                  1
                    ? " customer"
                    : " customers"}
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                >
                  saved your profile
                </AppText>
              </View>
            </View>

            <View
              style={
                styles.list
              }
            >
              {records.map(
                (
                  record,
                  index,
                ) => {
                  const hasPhoto =
                    record
                      .customerPhotoUrl
                      .startsWith(
                        "http://",
                      ) ||
                    record
                      .customerPhotoUrl
                      .startsWith(
                        "https://",
                      );

                  const isLast =
                    index ===
                    records.length -
                      1;

                  return (
                    <View
                      key={
                        record.id
                      }
                      style={[
                        styles.record,

                        !isLast
                          ? styles.recordBorder
                          : null,
                      ]}
                    >
                      {hasPhoto ? (
                        <Image
                          source={{
                            uri:
                              record.customerPhotoUrl,
                          }}
                          contentFit="cover"
                          style={
                            styles.avatar
                          }
                        />
                      ) : (
                        <View
                          style={
                            styles.avatarFallback
                          }
                        >
                          <AppIcon
                            name="profile"
                            role="worker"
                            size="md"
                            color={
                              WorkerColors.primary
                            }
                          />
                        </View>
                      )}

                      <View
                        style={
                          styles.recordContent
                        }
                      >
                        <AppText
                          variant="body"
                          weight="bold"
                          numberOfLines={
                            1
                          }
                        >
                          {
                            record.customerName
                          }
                        </AppText>

                        <AppText
                          variant="caption"
                          tone="secondary"
                          style={
                            styles.recordMessage
                          }
                        >
                          Saved you
                        </AppText>
                      </View>

                      <AppText
                        variant="caption"
                        tone="secondary"
                        numberOfLines={
                          1
                        }
                        style={
                          styles.time
                        }
                      >
                        {formatSavedTime(
                          record,
                        )}
                      </AppText>
                    </View>
                  );
                },
              )}
            </View>
          </>
        )}
      </ScrollView>
    </AppScreen>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    content: {
      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.xs,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        FixxamTokens.spacing.lg,
    },

    backButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    headerText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    summary: {
      minHeight: 72,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      marginBottom:
        FixxamTokens.spacing.sm,
    },

    summaryIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    summaryContent: {
      flex: 1,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    list: {
      overflow:
        "hidden",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    record: {
      minHeight: 72,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    recordBorder: {
      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,
    },

    avatar: {
      width: 46,

      height: 46,

      flexShrink: 0,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    avatarFallback: {
      width: 46,

      height: 46,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    recordContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    recordMessage: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    time: {
      flexShrink: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    stateContainer: {
      minHeight: 300,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    stateIcon: {
      width: 64,

      height: 64,

      marginBottom:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    stateText: {
      marginTop:
        FixxamTokens.spacing.sm,
    },

    emptyText: {
      maxWidth: 280,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 18,
    },

    pressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },
  });