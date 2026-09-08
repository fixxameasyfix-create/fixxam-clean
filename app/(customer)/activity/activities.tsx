import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

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
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import {
  useFixxamActivity,
} from "@/hooks/customer/useFixxamActivity";

import type {
  FixxamActivityPeriod,
  FixxamActivityPoint,
} from "@/utils/fixxam/calculateFixxamActivity";

/* ============================================================
   DARK ANALYTICS PALETTE
============================================================ */

const ACTIVITY_COLORS = {
  screen: "#020617",

  surface: "#071426",
  surfaceStrong: "#081426",
  surfaceMuted: "#0B1D31",

  headerButton: "#0F1D32",

  border: "#183152",
  borderSoft: "#172B49",

  blueSoft: "#102A63",
  blueSurface: "#0D2345",

  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",

  successSoft: "#064E3B",
  errorSoft: "#3F1D2A",

  emptyBar: "#1E293B",
} as const;

/* ============================================================
   CONSTANTS
============================================================ */

const PERIOD_OPTIONS: Array<{
  value: FixxamActivityPeriod;
  label: string;
}> = [
  {
    value: "7D",
    label: "Last 7 Days",
  },
  {
    value: "30D",
    label: "Last 30 Days",
  },
  {
    value: "90D",
    label: "Last 90 Days",
  },
];

const CHART_MAX_BAR_HEIGHT =
  180;

/* ============================================================
   HELPERS
============================================================ */

function formatNaira(
  value: number,
): string {
  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return "₦0";
  }

  return `₦${Math.round(
    value,
  ).toLocaleString("en-NG")}`;
}

function formatPercentage(
  value: number,
): string {
  if (!Number.isFinite(value)) {
    return "0%";
  }

  return `${Math.round(value)}%`;
}

function formatGrowth(
  value: number,
): string {
  if (!Number.isFinite(value)) {
    return "0%";
  }

  const rounded =
    Math.round(
      Math.abs(value),
    );

  if (value > 0) {
    return `+${rounded}%`;
  }

  if (value < 0) {
    return `-${rounded}%`;
  }

  return "0%";
}

function getPeriodLabel(
  period: FixxamActivityPeriod,
): string {
  switch (period) {
    case "7D":
      return "Last 7 Days";

    case "90D":
      return "Last 90 Days";

    case "30D":
    default:
      return "Last 30 Days";
  }
}

function getActivityStatus(
  transactions: number,
): string {
  return transactions > 0
    ? "Active"
    : "None";
}

function getGrowthColor(
  growth: number,
): string {
  if (growth > 0) {
    return Colors.success;
  }

  if (growth < 0) {
    return Colors.error;
  }

  return Colors.textMuted;
}

/* ============================================================
   CHART BAR
============================================================ */

type ActivityBarProps = {
  point: FixxamActivityPoint;

  maxValue: number;

  width: number;
};

function ActivityBar({
  point,
  maxValue,
  width,
}: ActivityBarProps) {
  const safeValue =
    Number.isFinite(
      point.value,
    )
      ? Math.max(
          0,
          point.value,
        )
      : 0;

  const percentage =
    maxValue > 0
      ? safeValue /
        maxValue
      : 0;

  const barHeight =
    safeValue > 0
      ? Math.max(
          8,
          percentage *
            CHART_MAX_BAR_HEIGHT,
        )
      : 3;

  return (
    <View
      style={[
        styles.chartBarColumn,
        {
          width,
        },
      ]}
      accessible
      accessibilityLabel={`${point.label}: ${formatNaira(
        safeValue,
      )}`}
    >
      <View
        style={
          styles.chartBarArea
        }
      >
        <View
          style={[
            styles.chartBar,

            {
              height:
                barHeight,
            },

            safeValue <= 0
              ? styles.chartBarEmpty
              : null,
          ]}
        />
      </View>

      <AppText
        variant="caption"
        numberOfLines={1}
        style={
          styles.chartBarLabel
        }
      >
        {point.label}
      </AppText>
    </View>
  );
}

/* ============================================================
   MAIN SCREEN
============================================================ */

export default function FixxamActivityScreen() {
  const {
    activity,
    period,
    setPeriod,
    loading,
    error,
    refresh,
  } =
    useFixxamActivity(
      "30D",
    );

  const [
    periodModalVisible,
    setPeriodModalVisible,
  ] =
    useState(false);

  /* ==========================================================
     DERIVED DATA
  ========================================================== */

  const transactionVolume =
    activity?.volume ?? 0;

  const transactionCount =
    activity?.transactions ??
    0;

  const successfulTransactions =
    activity?.successfulTransactions ??
    0;

  const failedTransactions =
    activity?.failedTransactions ??
    0;

  const successRate =
    activity?.successRate ??
    0;

  const growth =
    activity?.growth ?? 0;

  const chartData =
    activity?.chartData ?? [];

  const hasActivity =
    transactionCount > 0;

  const activityStatus =
    getActivityStatus(
      transactionCount,
    );

  const growthColor =
    getGrowthColor(
      growth,
    );

  /* ==========================================================
     CHART MAX
  ========================================================== */

  const chartMax =
    useMemo(() => {
      if (
        chartData.length ===
        0
      ) {
        return 0;
      }

      return Math.max(
        0,
        ...chartData.map(
          (point) =>
            Number.isFinite(
              point.value,
            )
              ? Math.max(
                  0,
                  point.value,
                )
              : 0,
        ),
      );
    }, [
      chartData,
    ]);

  /* ==========================================================
     CHART BAR WIDTH
  ========================================================== */

  const chartBarWidth =
    useMemo(() => {
      switch (period) {
        case "7D":
          return 34;

        case "30D":
          return 25;

        case "90D":
        default:
          return 13;
      }
    }, [
      period,
    ]);

  /* ==========================================================
     PERIOD SELECT
  ========================================================== */

  const handlePeriodSelect =
    useCallback(
      (
        nextPeriod:
          FixxamActivityPeriod,
      ) => {
        setPeriod(
          nextPeriod,
        );

        setPeriodModalVisible(
          false,
        );
      },
      [
        setPeriod,
      ],
    );

  /* ==========================================================
     REFRESH
  ========================================================== */

  const handleRefresh =
    useCallback(() => {
      if (loading) {
        return;
      }

      void refresh();
    }, [
      loading,
      refresh,
    ]);

  /* ==========================================================
     CHART CONTENT
  ========================================================== */

  const chartContent =
    useMemo(() => {
      if (
        loading &&
        !activity
      ) {
        return (
          <View
            style={
              styles.chartState
            }
          >
            <ActivityIndicator
              size="small"
              color={
                CustomerColors.primary
              }
            />

            <AppText
              variant="caption"
              style={
                styles.chartStateText
              }
            >
              Loading activity...
            </AppText>
          </View>
        );
      }

      if (error) {
        return (
          <View
            style={
              styles.chartState
            }
          >
            <View
              style={
                styles.chartStateIcon
              }
            >
              <AppIcon
                name="error"
                size="lg"
                color={
                  Colors.error
                }
              />
            </View>

            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.chartStateTitle
              }
            >
              Unable to load Activity
            </AppText>

            <AppText
              variant="caption"
              numberOfLines={2}
              style={
                styles.chartStateText
              }
            >
              {error}
            </AppText>

            <Pressable
              onPress={
                handleRefresh
              }
              disabled={
                loading
              }
              accessibilityRole="button"
              accessibilityLabel="Retry loading activity"
              style={({
                pressed,
              }) => [
                styles.retryButton,

                pressed &&
                !loading
                  ? styles.pressed
                  : null,

                loading
                  ? styles.disabled
                  : null,
              ]}
            >
              <AppIcon
                name="refresh"
                role="customer"
                size="xs"
                color={
                  Colors.textInverse
                }
              />

              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.retryText
                }
              >
                Retry
              </AppText>
            </Pressable>
          </View>
        );
      }

      if (!hasActivity) {
        return (
          <View
            style={
              styles.chartState
            }
          >
            <View
              style={
                styles.chartStateIcon
              }
            >
              <AppIcon
                name="info"
                size="lg"
                color={
                  Colors.textMuted
                }
              />
            </View>

            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.chartStateTitle
              }
            >
              No transaction activity
            </AppText>

            <AppText
              variant="caption"
              numberOfLines={2}
              style={
                styles.chartStateText
              }
            >
              You don't have any successful transactions in this period.
            </AppText>
          </View>
        );
      }

      return (
        <View
          style={
            styles.chartContent
          }
        >
          {/* GRID */}

          <View
            style={
              styles.chartGrid
            }
            pointerEvents="none"
          >
            <View
              style={
                styles.gridLine
              }
            />

            <View
              style={
                styles.gridLine
              }
            />

            <View
              style={
                styles.gridLine
              }
            />

            <View
              style={
                styles.gridLine
              }
            />
          </View>

          {/* BARS */}

          <View
            style={
              styles.chartBars
            }
          >
            {chartData.map(
              (
                point,
                index,
              ) => (
                <ActivityBar
                  key={`${point.label}-${index}`}
                  point={
                    point
                  }
                  maxValue={
                    chartMax
                  }
                  width={
                    chartBarWidth
                  }
                />
              ),
            )}
          </View>
        </View>
      );
    }, [
      activity,
      chartBarWidth,
      chartData,
      chartMax,
      error,
      handleRefresh,
      hasActivity,
      loading,
    ]);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen
      style={styles.screen}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.container
        }
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <View
          style={styles.header}
        >
          <Pressable
            onPress={() =>
              router.back()
            }
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
                ACTIVITY_COLORS.textPrimary
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
              numberOfLines={1}
              style={
                styles.headerTitle
              }
            >
              Fixxam Activity
            </AppText>

            <AppText
              variant="caption"
              numberOfLines={1}
              style={
                styles.headerSubtitle
              }
            >
              Service & market transaction analysis
            </AppText>
          </View>

          <Pressable
            onPress={
              handleRefresh
            }
            disabled={
              loading
            }
            accessibilityRole="button"
            accessibilityLabel="Refresh activity"
            accessibilityState={{
              busy:
                loading,
              disabled:
                loading,
            }}
            style={({
              pressed,
            }) => [
              styles.calendarButton,

              pressed &&
              !loading
                ? styles.pressed
                : null,

              loading
                ? styles.disabled
                : null,
            ]}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color={
                  ACTIVITY_COLORS.textPrimary
                }
              />
            ) : (
              <AppIcon
                name="refresh"
                role="customer"
                size="md"
                color={
                  ACTIVITY_COLORS.textPrimary
                }
              />
            )}
          </Pressable>
        </View>

        {/* ==================================================
            TRANSACTION VOLUME
        ================================================== */}

        <View
          style={
            styles.volumeCard
          }
        >
          <View
            style={
              styles.volumeIcon
            }
          >
            <AppIcon
              name="payment"
              role="customer"
              size="lg"
              color={
                CustomerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.volumeContent
            }
          >
            <AppText
              variant="caption"
              numberOfLines={1}
              style={
                styles.volumeLabel
              }
            >
              Transaction Volume
            </AppText>

            <AppText
              variant="heading1"
              weight="bold"
              numberOfLines={1}
              style={
                styles.volumeValue
              }
            >
              {formatNaira(
                transactionVolume,
              )}
            </AppText>
          </View>

          <View
            style={
              styles.volumeActions
            }
          >
            <Pressable
              onPress={() =>
                setPeriodModalVisible(
                  true,
                )
              }
              accessibilityRole="button"
              accessibilityLabel={`Select activity period, currently ${getPeriodLabel(
                period,
              )}`}
              style={({
                pressed,
              }) => [
                styles.periodButton,

                pressed
                  ? styles.pressed
                  : null,
              ]}
            >
              <AppText
                variant="caption"
                weight="bold"
                numberOfLines={1}
                style={
                  styles.periodText
                }
              >
                {getPeriodLabel(
                  period,
                )}
              </AppText>

              <AppIcon
                name="down"
                role="customer"
                size="xs"
                color={
                  CustomerColors.primary
                }
              />
            </Pressable>

            <View
              style={
                styles.flatButton
              }
            >
              {growth > 0 ? (
                <AppIcon
                  name="arrow-up"
                  size="xs"
                  color={
                    growthColor
                  }
                />
              ) : growth < 0 ? (
                <AppIcon
                  name="down"
                  size="xs"
                  color={
                    growthColor
                  }
                />
              ) : (
                <View
                  style={
                    styles.flatLine
                  }
                />
              )}

              <AppText
                variant="caption"
                weight="bold"
                style={[
                  styles.flatText,
                  {
                    color:
                      growthColor,
                  },
                ]}
              >
                {formatGrowth(
                  growth,
                )}
              </AppText>

              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      growthColor,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* ==================================================
            CHART
        ================================================== */}

        <View
          style={
            styles.chartCard
          }
        >
          <View
            style={
              styles.chartHeader
            }
          >
            <View
              style={
                styles.chartHeaderContent
              }
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
                style={
                  styles.chartTitle
                }
              >
                Transaction Activity
              </AppText>

              <AppText
                variant="caption"
                style={
                  styles.chartSubtitle
                }
              >
                Successful transaction volume
              </AppText>
            </View>

            {loading &&
            activity ? (
              <ActivityIndicator
                size="small"
                color={
                  CustomerColors.primary
                }
              />
            ) : null}
          </View>

          <View
            style={styles.chart}
          >
            {chartContent}
          </View>

          <View
            style={styles.dateRow}
          >
            {chartData.length >
            0 ? (
              <>
                <AppText
                  variant="caption"
                  style={
                    styles.dateText
                  }
                >
                  {chartData[0]
                    ?.label ?? ""}
                </AppText>

                <AppText
                  variant="caption"
                  style={
                    styles.dateText
                  }
                >
                  {chartData[
                    Math.floor(
                      chartData.length /
                        2,
                    )
                  ]?.label ??
                    ""}
                </AppText>

                <AppText
                  variant="caption"
                  style={
                    styles.dateText
                  }
                >
                  {chartData[
                    chartData.length -
                      1
                  ]?.label ?? ""}
                </AppText>
              </>
            ) : (
              <>
                <AppText
                  variant="caption"
                  style={
                    styles.dateText
                  }
                >
                  —
                </AppText>

                <AppText
                  variant="caption"
                  style={
                    styles.dateText
                  }
                >
                  —
                </AppText>

                <AppText
                  variant="caption"
                  style={
                    styles.dateText
                  }
                >
                  —
                </AppText>
              </>
            )}
          </View>
        </View>

        {/* ==================================================
            STATISTICS
        ================================================== */}

        <View
          style={styles.statsRow}
        >
          {/* TRANSACTIONS */}

          <View
            style={
              styles.statCard
            }
          >
            <View
              style={[
                styles.statIcon,
                styles.transactionIcon,
              ]}
            >
              <AppIcon
                name="payment"
                role="customer"
                size="lg"
                color={
                  CustomerColors.primary
                }
              />
            </View>

            <View
              style={
                styles.statContent
              }
            >
              <AppText
                variant="heading3"
                weight="bold"
                numberOfLines={1}
                style={
                  styles.statValue
                }
              >
                {loading &&
                !activity
                  ? "—"
                  : transactionCount}
              </AppText>

              <AppText
                variant="body"
                numberOfLines={1}
                style={
                  styles.statLabel
                }
              >
                Transactions
              </AppText>

              <AppText
                variant="caption"
                numberOfLines={2}
                style={
                  styles.statDescription
                }
              >
                Successful transactions
                {"\n"}
                in this period
              </AppText>
            </View>
          </View>

          {/* SUCCESS RATE */}

          <View
            style={
              styles.statCard
            }
          >
            <View
              style={[
                styles.statIcon,
                styles.activityIcon,
              ]}
            >
              <AppIcon
                name="success"
                size="lg"
                color={
                  Colors.success
                }
              />
            </View>

            <View
              style={
                styles.statContent
              }
            >
              <AppText
                variant="heading3"
                weight="bold"
                numberOfLines={1}
                style={
                  styles.statValue
                }
              >
                {loading &&
                !activity
                  ? "—"
                  : formatPercentage(
                      successRate,
                    )}
              </AppText>

              <AppText
                variant="body"
                numberOfLines={1}
                style={
                  styles.statLabel
                }
              >
                Success Rate
              </AppText>

              <AppText
                variant="caption"
                numberOfLines={2}
                style={
                  styles.statDescription
                }
              >
                {successfulTransactions} successful
                {"\n"}
                {failedTransactions} failed
              </AppText>
            </View>
          </View>
        </View>

        {/* ==================================================
            ACTIVITY SUMMARY
        ================================================== */}

        <View
          style={
            styles.recentCard
          }
        >
          <View
            style={
              styles.recentHeader
            }
          >
            <View
              style={
                styles.recentTitleContainer
              }
            >
              <View
                style={
                  styles.recentIcon
                }
              >
                <AppIcon
                  name="jobs"
                  role="customer"
                  size="sm"
                  color={
                    CustomerColors.primary
                  }
                />
              </View>

              <View
                style={
                  styles.recentTitleContent
                }
              >
                <AppText
                  variant="bodyMedium"
                  weight="bold"
                  numberOfLines={1}
                  style={
                    styles.recentTitle
                  }
                >
                  Activity Summary
                </AppText>

                <AppText
                  variant="caption"
                  numberOfLines={1}
                  style={
                    styles.recentSubtitle
                  }
                >
                  {getPeriodLabel(
                    period,
                  )}
                </AppText>
              </View>
            </View>

            <View
              style={
                styles.activityBadge
              }
            >
              <View
                style={[
                  styles.badgeDot,
                  {
                    backgroundColor:
                      hasActivity
                        ? Colors.success
                        : Colors.textMuted,
                  },
                ]}
              />

              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.activityBadgeText
                }
              >
                {activityStatus}
              </AppText>
            </View>
          </View>

          <View
            style={
              styles.recentDivider
            }
          />

          {loading &&
          !activity ? (
            <View
              style={
                styles.emptyTransactions
              }
            >
              <ActivityIndicator
                size="small"
                color={
                  CustomerColors.primary
                }
              />

              <AppText
                variant="caption"
                style={
                  styles.loadingText
                }
              >
                Loading activity...
              </AppText>
            </View>
          ) : error ? (
            <View
              style={
                styles.emptyTransactions
              }
            >
              <View
                style={
                  styles.emptyTransactionIcon
                }
              >
                <AppIcon
                  name="error"
                  size="lg"
                  color={
                    Colors.error
                  }
                />
              </View>

              <AppText
                variant="bodyMedium"
                weight="bold"
                style={
                  styles.noTransactionTitle
                }
              >
                Activity unavailable
              </AppText>

              <AppText
                variant="caption"
                numberOfLines={2}
                style={
                  styles.noTransactionText
                }
              >
                {error}
              </AppText>

              <Pressable
                onPress={
                  handleRefresh
                }
                disabled={
                  loading
                }
                accessibilityRole="button"
                accessibilityLabel="Try loading activity again"
                style={({
                  pressed,
                }) => [
                  styles.retryButton,
                  styles.retryButtonLarge,

                  pressed &&
                  !loading
                    ? styles.pressed
                    : null,
                ]}
              >
                <AppIcon
                  name="refresh"
                  role="customer"
                  size="xs"
                  color={
                    Colors.textInverse
                  }
                />

                <AppText
                  variant="caption"
                  weight="bold"
                  style={
                    styles.retryText
                  }
                >
                  Try Again
                </AppText>
              </Pressable>
            </View>
          ) : !hasActivity ? (
            <View
              style={
                styles.emptyTransactions
              }
            >
              <View
                style={
                  styles.emptyTransactionIcon
                }
              >
                <AppIcon
                  name="file"
                  size="lg"
                  color={
                    Colors.textMuted
                  }
                />
              </View>

              <AppText
                variant="bodyMedium"
                weight="bold"
                style={
                  styles.noTransactionTitle
                }
              >
                No transactions yet
              </AppText>

              <AppText
                variant="caption"
                numberOfLines={2}
                style={
                  styles.noTransactionText
                }
              >
                Successful service and market transactions will appear here.
              </AppText>
            </View>
          ) : (
            <View
              style={
                styles.summaryList
              }
            >
              {/* VOLUME */}

              <View
                style={
                  styles.summaryRow
                }
              >
                <View
                  style={
                    styles.summaryRowIcon
                  }
                >
                  <AppIcon
                    name="wallet"
                    role="customer"
                    size="sm"
                    color={
                      CustomerColors.primary
                    }
                  />
                </View>

                <View
                  style={
                    styles.summaryRowContent
                  }
                >
                  <AppText
                    variant="body"
                    weight="bold"
                    style={
                      styles.summaryTitle
                    }
                  >
                    Transaction Volume
                  </AppText>

                  <AppText
                    variant="caption"
                    style={
                      styles.summarySubtitle
                    }
                  >
                    Service + market products
                  </AppText>
                </View>

                <AppText
                  variant="body"
                  weight="bold"
                  numberOfLines={1}
                  style={
                    styles.summaryAmount
                  }
                >
                  {formatNaira(
                    transactionVolume,
                  )}
                </AppText>
              </View>

              <View
                style={
                  styles.summaryDivider
                }
              />

              {/* SUCCESS */}

              <View
                style={
                  styles.summaryRow
                }
              >
                <View
                  style={[
                    styles.summaryRowIcon,
                    styles.successSummaryIcon,
                  ]}
                >
                  <AppIcon
                    name="success"
                    size="sm"
                    color={
                      Colors.success
                    }
                  />
                </View>

                <View
                  style={
                    styles.summaryRowContent
                  }
                >
                  <AppText
                    variant="body"
                    weight="bold"
                    style={
                      styles.summaryTitle
                    }
                  >
                    Successful
                  </AppText>

                  <AppText
                    variant="caption"
                    style={
                      styles.summarySubtitle
                    }
                  >
                    Completed transaction outcomes
                  </AppText>
                </View>

                <AppText
                  variant="body"
                  weight="bold"
                  style={
                    styles.summaryAmount
                  }
                >
                  {successfulTransactions}
                </AppText>
              </View>

              <View
                style={
                  styles.summaryDivider
                }
              />

              {/* FAILED */}

              <View
                style={
                  styles.summaryRow
                }
              >
                <View
                  style={[
                    styles.summaryRowIcon,
                    styles.failedSummaryIcon,
                  ]}
                >
                  <AppIcon
                    name="error"
                    size="sm"
                    color={
                      Colors.error
                    }
                  />
                </View>

                <View
                  style={
                    styles.summaryRowContent
                  }
                >
                  <AppText
                    variant="body"
                    weight="bold"
                    style={
                      styles.summaryTitle
                    }
                  >
                    Failed
                  </AppText>

                  <AppText
                    variant="caption"
                    style={
                      styles.summarySubtitle
                    }
                  >
                    Cancelled or failed transactions
                  </AppText>
                </View>

                <AppText
                  variant="body"
                  weight="bold"
                  style={
                    styles.summaryAmount
                  }
                >
                  {failedTransactions}
                </AppText>
              </View>

              <View
                style={
                  styles.summaryDivider
                }
              />

              {/* GROWTH */}

              <View
                style={
                  styles.summaryRow
                }
              >
                <View
                  style={[
                    styles.summaryRowIcon,
                    styles.growthSummaryIcon,
                  ]}
                >
                  <AppIcon
                    name={
                      growth >= 0
                        ? "arrow-up"
                        : "down"
                    }
                    size="sm"
                    color={
                      growthColor
                    }
                  />
                </View>

                <View
                  style={
                    styles.summaryRowContent
                  }
                >
                  <AppText
                    variant="body"
                    weight="bold"
                    style={
                      styles.summaryTitle
                    }
                  >
                    Growth
                  </AppText>

                  <AppText
                    variant="caption"
                    style={
                      styles.summarySubtitle
                    }
                  >
                    Compared with previous period
                  </AppText>
                </View>

                <AppText
                  variant="body"
                  weight="bold"
                  style={[
                    styles.summaryAmount,
                    {
                      color:
                        growthColor,
                    },
                  ]}
                >
                  {formatGrowth(
                    growth,
                  )}
                </AppText>
              </View>
            </View>
          )}
        </View>

        {/* ==================================================
            INFORMATION
        ================================================== */}

        <View
          style={styles.infoCard}
        >
          <AppIcon
            name="info"
            role="customer"
            size="sm"
            color={
              CustomerColors.primary
            }
          />

          <AppText
            variant="caption"
            numberOfLines={3}
            style={
              styles.infoText
            }
          >
            Activity combines successful service transactions and market product transactions. Market delivery fees are excluded from transaction volume.
          </AppText>
        </View>
      </ScrollView>

      {/* ======================================================
          PERIOD MODAL
      ====================================================== */}

      <Modal
        visible={
          periodModalVisible
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() =>
          setPeriodModalVisible(
            false,
          )
        }
      >
        <Pressable
          style={
            styles.modalOverlay
          }
          onPress={() =>
            setPeriodModalVisible(
              false,
            )
          }
        >
          <Pressable
            style={
              styles.periodModal
            }
            onPress={(
              event,
            ) =>
              event.stopPropagation()
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <View
                style={
                  styles.modalHeaderText
                }
              >
                <AppText
                  variant="bodyLarge"
                  weight="bold"
                  style={
                    styles.modalTitle
                  }
                >
                  Activity Period
                </AppText>

                <AppText
                  variant="caption"
                  style={
                    styles.modalSubtitle
                  }
                >
                  Select the period to analyse
                </AppText>
              </View>

              <Pressable
                onPress={() =>
                  setPeriodModalVisible(
                    false,
                  )
                }
                accessibilityRole="button"
                accessibilityLabel="Close period selector"
                style={({
                  pressed,
                }) => [
                  styles.modalClose,

                  pressed
                    ? styles.pressed
                    : null,
                ]}
              >
                <AppIcon
                  name="close"
                  size="sm"
                  color={
                    ACTIVITY_COLORS.textSecondary
                  }
                />
              </Pressable>
            </View>

            <View
              style={
                styles.periodOptions
              }
            >
              {PERIOD_OPTIONS.map(
                (
                  option,
                ) => {
                  const selected =
                    option.value ===
                    period;

                  return (
                    <Pressable
                      key={
                        option.value
                      }
                      onPress={() =>
                        handlePeriodSelect(
                          option.value,
                        )
                      }
                      accessibilityRole="button"
                      accessibilityLabel={
                        option.label
                      }
                      accessibilityState={{
                        selected,
                      }}
                      style={({
                        pressed,
                      }) => [
                        styles.periodOption,

                        selected
                          ? styles.periodOptionSelected
                          : null,

                        pressed
                          ? styles.periodOptionPressed
                          : null,
                      ]}
                    >
                      <View
                        style={
                          styles.periodOptionIcon
                        }
                      >
                        <AppIcon
                          name="calendar"
                          role="customer"
                          size="sm"
                          color={
                            selected
                              ? CustomerColors.primary
                              : ACTIVITY_COLORS.textSecondary
                          }
                        />
                      </View>

                      <AppText
                        variant="body"
                        weight={
                          selected
                            ? "bold"
                            : undefined
                        }
                        style={[
                          styles.periodOptionText,

                          selected
                            ? styles.periodOptionTextSelected
                            : null,
                        ]}
                      >
                        {option.label}
                      </AppText>

                      {selected ? (
                        <AppIcon
                          name="check"
                          role="customer"
                          size="sm"
                          color={
                            CustomerColors.primary
                          }
                        />
                      ) : (
                        <AppIcon
                          name="next"
                          size="xs"
                          color={
                            ACTIVITY_COLORS.textMuted
                          }
                        />
                      )}
                    </Pressable>
                  );
                },
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </AppScreen>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       SCREEN
    ======================================================== */

    screen: {
      backgroundColor:
        ACTIVITY_COLORS.screen,
    },

    container: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      minHeight: 70,

      marginBottom:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",
    },

    backButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      alignItems: "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        ACTIVITY_COLORS.borderSoft,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        ACTIVITY_COLORS.headerButton,
    },

    headerText: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.sm,

      alignItems: "center",
    },

    headerTitle: {
      textAlign: "center",

      color:
        ACTIVITY_COLORS.textPrimary,
    },

    headerSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      textAlign: "center",

      color:
        ACTIVITY_COLORS.textMuted,
    },

    calendarButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      alignItems: "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        ACTIVITY_COLORS.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        ACTIVITY_COLORS.surfaceStrong,
    },

    /* ========================================================
       VOLUME
    ======================================================== */

    volumeCard: {
      minHeight: 126,

      padding:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        ACTIVITY_COLORS.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        ACTIVITY_COLORS.surface,
    },

    volumeIcon: {
      width: 54,

      height: 54,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        ACTIVITY_COLORS.blueSoft,
    },

    volumeContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    volumeLabel: {
      color:
        ACTIVITY_COLORS.textSecondary,
    },

    volumeValue: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        ACTIVITY_COLORS.textPrimary,
    },

    volumeActions: {
      marginLeft:
        FixxamTokens.spacing.sm,

      alignItems: "flex-end",

      gap:
        FixxamTokens.spacing.sm,
    },

    periodButton: {
      width: 137,

      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      borderWidth: 1,

      borderColor:
        CustomerColors.primary,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        ACTIVITY_COLORS.surfaceStrong,
    },

    periodText: {
      flex: 1,

      minWidth: 0,

      marginRight:
        FixxamTokens.spacing.xs,

      color:
        ACTIVITY_COLORS.textPrimary,
    },

    flatButton: {
      minHeight: 36,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

      gap:
        FixxamTokens.spacing.xs,

      borderWidth: 1,

      borderColor:
        ACTIVITY_COLORS.textMuted,

      borderRadius:
        FixxamTokens.radius.md,
    },

    flatLine: {
      width: 12,

      height: 2,

      backgroundColor:
        Colors.textMuted,
    },

    flatText: {
      color:
        Colors.textMuted,
    },

    statusDot: {
      width: 6,

      height: 6,

      borderRadius:
        FixxamTokens.radius.full,
    },

    /* ========================================================
       CHART
    ======================================================== */

    chartCard: {
      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.lg,

      borderWidth: 1,

      borderColor:
        ACTIVITY_COLORS.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        ACTIVITY_COLORS.surface,
    },

    chartHeader: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      flexDirection: "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",
    },

    chartHeaderContent: {
      flex: 1,

      minWidth: 0,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    chartTitle: {
      color:
        ACTIVITY_COLORS.textPrimary,
    },

    chartSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        ACTIVITY_COLORS.textMuted,
    },

    chart: {
      height: 245,

      overflow: "hidden",

      position: "relative",

      justifyContent:
        "flex-end",

      borderWidth: 1,

      borderColor:
        ACTIVITY_COLORS.borderSoft,

      borderRadius:
        FixxamTokens.radius.md,
    },

    chartContent: {
      flex: 1,

      position: "relative",

      justifyContent:
        "flex-end",
    },

    chartGrid: {
      position: "absolute",

      left: 0,

      right: 0,

      top: 20,

      bottom: 43,

      justifyContent:
        "space-between",
    },

    gridLine: {
      width: "100%",

      borderTopWidth: 1,

      borderTopColor:
        ACTIVITY_COLORS.borderSoft,

      borderStyle: "dashed",
    },

    chartBars: {
      minHeight: 205,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems:
        "flex-end",

      justifyContent:
        "space-around",

      zIndex: 2,
    },

    chartBarColumn: {
      height: 225,

      marginHorizontal: 1,

      alignItems: "center",

      justifyContent:
        "flex-end",
    },

    chartBarArea: {
      height: 193,

      width: "100%",

      alignItems: "center",

      justifyContent:
        "flex-end",
    },

    chartBar: {
      width: "72%",

      minWidth: 5,

      maxWidth: 25,

      borderTopLeftRadius:
        FixxamTokens.radius.xs,

      borderTopRightRadius:
        FixxamTokens.radius.xs,

      backgroundColor:
        CustomerColors.primary,
    },

    chartBarEmpty: {
      opacity: 0.7,

      backgroundColor:
        ACTIVITY_COLORS.emptyBar,
    },

    chartBarLabel: {
      height: 27,

      marginTop:
        FixxamTokens.spacing.xs,

      textAlign: "center",

      color:
        ACTIVITY_COLORS.textMuted,
    },

    chartState: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems: "center",

      justifyContent:
        "center",
    },

    chartStateIcon: {
      width: 58,

      height: 58,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        ACTIVITY_COLORS.headerButton,
    },

    chartStateTitle: {
      marginTop:
        FixxamTokens.spacing.sm,

      textAlign: "center",

      color:
        ACTIVITY_COLORS.textPrimary,
    },

    chartStateText: {
      maxWidth: 290,

      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 18,

      textAlign: "center",

      color:
        ACTIVITY_COLORS.textMuted,
    },

    dateRow: {
      marginTop:
        FixxamTokens.spacing.xs,

      flexDirection: "row",

      justifyContent:
        "space-between",
    },

    dateText: {
      color:
        ACTIVITY_COLORS.textMuted,
    },

    /* ========================================================
       STATS
    ======================================================== */

    statsRow: {
      marginTop:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      gap:
        FixxamTokens.spacing.sm,
    },

    statCard: {
      flex: 1,

      minWidth: 0,

      minHeight: 166,

      padding:
        FixxamTokens.spacing.md,

      alignItems:
        "flex-start",

      borderWidth: 1,

      borderColor:
        ACTIVITY_COLORS.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        ACTIVITY_COLORS.surface,
    },

    statIcon: {
      width: 47,

      height: 47,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,
    },

    transactionIcon: {
      backgroundColor:
        ACTIVITY_COLORS.blueSoft,
    },

    activityIcon: {
      backgroundColor:
        ACTIVITY_COLORS.successSoft,
    },

    statContent: {
      width: "100%",

      minWidth: 0,

      marginTop:
        FixxamTokens.spacing.sm,
    },

    statValue: {
      flexShrink: 1,

      color:
        ACTIVITY_COLORS.textPrimary,
    },

    statLabel: {
      marginTop:
        FixxamTokens.spacing.xxs,

      flexShrink: 1,

      color:
        ACTIVITY_COLORS.textSecondary,
    },

    statDescription: {
      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 16,

      flexShrink: 1,

      color:
        ACTIVITY_COLORS.textMuted,
    },

    /* ========================================================
       SUMMARY
    ======================================================== */

    recentCard: {
      overflow: "hidden",

      marginTop:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        ACTIVITY_COLORS.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        ACTIVITY_COLORS.surface,
    },

    recentHeader: {
      minHeight: 70,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },

    recentTitleContainer: {
      flex: 1,

      minWidth: 0,

      flexDirection: "row",

      alignItems: "center",
    },

    recentIcon: {
      width: 38,

      height: 38,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        ACTIVITY_COLORS.blueSurface,
    },

    recentTitleContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    recentTitle: {
      color:
        ACTIVITY_COLORS.textPrimary,
    },

    recentSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        ACTIVITY_COLORS.textMuted,
    },

    activityBadge: {
      minHeight: 30,

      marginLeft:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

      gap:
        FixxamTokens.spacing.xs,

      borderWidth: 1,

      borderColor:
        ACTIVITY_COLORS.border,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        ACTIVITY_COLORS.surfaceMuted,
    },

    badgeDot: {
      width: 6,

      height: 6,

      borderRadius:
        FixxamTokens.radius.full,
    },

    activityBadgeText: {
      color:
        ACTIVITY_COLORS.textPrimary,
    },

    recentDivider: {
      height: 1,

      backgroundColor:
        ACTIVITY_COLORS.borderSoft,
    },

    /* ========================================================
       SUMMARY LIST
    ======================================================== */

    summaryList: {
      paddingVertical:
        FixxamTokens.spacing.xxs,
    },

    summaryRow: {
      minHeight: 72,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",
    },

    summaryRowIcon: {
      width: 42,

      height: 42,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        ACTIVITY_COLORS.blueSoft,
    },

    successSummaryIcon: {
      backgroundColor:
        ACTIVITY_COLORS.successSoft,
    },

    failedSummaryIcon: {
      backgroundColor:
        ACTIVITY_COLORS.errorSoft,
    },

    growthSummaryIcon: {
      backgroundColor:
        ACTIVITY_COLORS.blueSurface,
    },

    summaryRowContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    summaryTitle: {
      color:
        ACTIVITY_COLORS.textPrimary,
    },

    summarySubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        ACTIVITY_COLORS.textMuted,
    },

    summaryAmount: {
      flexShrink: 0,

      color:
        ACTIVITY_COLORS.textPrimary,
    },

    summaryDivider: {
      height: 1,

      marginHorizontal:
        FixxamTokens.spacing.md,

      backgroundColor:
        ACTIVITY_COLORS.borderSoft,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyTransactions: {
      minHeight: 220,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingVertical:
        FixxamTokens.spacing.xl,

      alignItems: "center",

      justifyContent:
        "center",
    },

    emptyTransactionIcon: {
      width: 66,

      height: 66,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        ACTIVITY_COLORS.headerButton,
    },

    noTransactionTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      textAlign: "center",

      color:
        ACTIVITY_COLORS.textPrimary,
    },

    noTransactionText: {
      maxWidth: 290,

      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 19,

      textAlign: "center",

      color:
        ACTIVITY_COLORS.textMuted,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.sm,

      color:
        ACTIVITY_COLORS.textMuted,
    },

    /* ========================================================
       RETRY
    ======================================================== */

    retryButton: {
      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      marginTop:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    retryButtonLarge: {
      minWidth: 110,
    },

    retryText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       INFO
    ======================================================== */

    infoCard: {
      minHeight: 70,

      marginTop:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        ACTIVITY_COLORS.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        ACTIVITY_COLORS.surface,
    },

    infoText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      lineHeight: 17,

      color:
        ACTIVITY_COLORS.textSecondary,
    },

    /* ========================================================
       MODAL
    ======================================================== */

    modalOverlay: {
      flex: 1,

      padding:
        FixxamTokens.spacing.lg,

      justifyContent:
        "flex-end",

      backgroundColor:
        Colors.overlayStrong,
    },

    periodModal: {
      width: "100%",

      padding:
        FixxamTokens.spacing.lg,

      borderWidth: 1,

      borderColor:
        ACTIVITY_COLORS.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        ACTIVITY_COLORS.surface,
    },

    modalHeader: {
      minHeight: 55,

      flexDirection: "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",
    },

    modalHeaderText: {
      flex: 1,

      minWidth: 0,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    modalTitle: {
      color:
        ACTIVITY_COLORS.textPrimary,
    },

    modalSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        ACTIVITY_COLORS.textMuted,
    },

    modalClose: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      alignItems: "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        ACTIVITY_COLORS.borderSoft,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        ACTIVITY_COLORS.headerButton,
    },

    periodOptions: {
      marginTop:
        FixxamTokens.spacing.sm,

      gap:
        FixxamTokens.spacing.sm,
    },

    periodOption: {
      minHeight: 58,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        ACTIVITY_COLORS.borderSoft,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        ACTIVITY_COLORS.surfaceStrong,
    },

    periodOptionSelected: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        ACTIVITY_COLORS.blueSurface,
    },

    periodOptionPressed: {
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

    periodOptionIcon: {
      width: 38,

      height: 38,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        ACTIVITY_COLORS.blueSoft,
    },

    periodOptionText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      color:
        ACTIVITY_COLORS.textSecondary,
    },

    periodOptionTextSelected: {
      color:
        ACTIVITY_COLORS.textPrimary,
    },

    /* ========================================================
       STATES
    ======================================================== */

    pressed: {
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

    disabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },
  });