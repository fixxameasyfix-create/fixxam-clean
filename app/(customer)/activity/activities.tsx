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

import Ionicons from "@expo/vector-icons/Ionicons";

import { router } from "expo-router";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  useFixxamActivity,
} from "@/hooks/customer/useFixxamActivity";

import type {
  FixxamActivityPeriod,
  FixxamActivityPoint,
} from "@/utils/fixxam/calculateFixxamActivity";

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
  if (
    !Number.isFinite(value)
  ) {
    return "0%";
  }

  return `${Math.round(
    value,
  )}%`;
}

function formatGrowth(
  value: number,
): string {
  if (
    !Number.isFinite(value)
  ) {
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
    return "#22C55E";
  }

  if (growth < 0) {
    return "#F87171";
  }

  return "#94A3B8";
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
  const percentage =
    maxValue > 0
      ? point.value / maxValue
      : 0;

  const barHeight =
    point.value > 0
      ? Math.max(
          8,
          percentage * 180,
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
    >
      <View
        style={styles.chartBarArea}
      >
        <View
          style={[
            styles.chartBar,
            {
              height:
                barHeight,
            },
            point.value <= 0 &&
              styles.chartBarEmpty,
          ]}
        />
      </View>

      <AppText
        style={styles.chartBarLabel}
        numberOfLines={1}
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
  } = useFixxamActivity(
    "30D",
  );

  const [
    periodModalVisible,
    setPeriodModalVisible,
  ] = useState(false);

  /* ==========================================================
     DERIVED DATA
  ========================================================== */

  const transactionVolume =
    activity?.volume ?? 0;

  const transactionCount =
    activity?.transactions ?? 0;

  const successfulTransactions =
    activity?.successfulTransactions ??
    0;

  const failedTransactions =
    activity?.failedTransactions ??
    0;

  const successRate =
    activity?.successRate ?? 0;

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
    getGrowthColor(growth);

  /* ==========================================================
     CHART MAX
  ========================================================== */

  const chartMax =
    useMemo(() => {
      if (
        chartData.length === 0
      ) {
        return 0;
      }

      return Math.max(
        ...chartData.map(
          (point) =>
            Number.isFinite(
              point.value,
            )
              ? point.value
              : 0,
        ),
      );
    }, [chartData]);

  /* ==========================================================
     CHART WIDTH
  ========================================================== */

  const chartBarWidth =
    useMemo(() => {
      if (
        period === "7D"
      ) {
        return 34;
      }

      if (
        period === "30D"
      ) {
        return 25;
      }

      return 13;
    }, [period]);

  /* ==========================================================
     PERIOD SELECT
  ========================================================== */

  const handlePeriodSelect =
    useCallback(
      (
        nextPeriod: FixxamActivityPeriod,
      ) => {
        setPeriod(
          nextPeriod,
        );

        setPeriodModalVisible(
          false,
        );
      },
      [setPeriod],
    );

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
              color="#60A5FA"
            />

            <AppText
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
              <Ionicons
                name="alert-circle-outline"
                size={28}
                color="#F87171"
              />
            </View>

            <AppText
              weight="bold"
              style={
                styles.chartStateTitle
              }
            >
              Unable to load Activity
            </AppText>

            <AppText
              style={
                styles.chartStateText
              }
              numberOfLines={2}
            >
              {error}
            </AppText>

            <Pressable
              onPress={refresh}
              style={({ pressed }) => [
                styles.retryButton,
                pressed &&
                  styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Retry loading activity"
            >
              <Ionicons
                name="refresh"
                size={16}
                color="#FFFFFF"
              />

              <AppText
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

      if (
        !hasActivity
      ) {
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
              <Ionicons
                name="pulse-outline"
                size={30}
                color="#334155"
              />
            </View>

            <AppText
              weight="bold"
              style={
                styles.chartStateTitle
              }
            >
              No transaction activity
            </AppText>

            <AppText
              style={
                styles.chartStateText
              }
              numberOfLines={2}
            >
              You don't have any successful
              transactions in this period.
            </AppText>
          </View>
        );
      }

      return (
        <View
          style={styles.chartContent}
        >
          {/* GRID */}

          <View
            style={styles.chartGrid}
            pointerEvents="none"
          >
            <View
              style={styles.gridLine}
            />

            <View
              style={styles.gridLine}
            />

            <View
              style={styles.gridLine}
            />

            <View
              style={styles.gridLine}
            />
          </View>

          {/* BARS */}

          <View
            style={styles.chartBars}
          >
            {chartData.map(
              (
                point,
                index,
              ) => (
                <ActivityBar
                  key={`${point.label}-${index}`}
                  point={point}
                  maxValue={chartMax}
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
      chartData,
      chartBarWidth,
      chartMax,
      error,
      hasActivity,
      loading,
      refresh,
    ]);

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
            style={({ pressed }) => [
              styles.backButton,
              pressed &&
                styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color="#E2E8F0"
            />
          </Pressable>

          <View
            style={
              styles.headerText
            }
          >
            <AppText
              weight="bold"
              style={
                styles.headerTitle
              }
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={
                0.85
              }
            >
              Fixxam Activity
            </AppText>

            <AppText
              style={
                styles.headerSubtitle
              }
              numberOfLines={1}
            >
              Service & market transaction analysis
            </AppText>
          </View>

          <Pressable
            onPress={refresh}
            style={({ pressed }) => [
              styles.calendarButton,
              pressed &&
                styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Refresh activity"
          >
            <Ionicons
              name="refresh-outline"
              size={22}
              color="#E2E8F0"
            />
          </Pressable>
        </View>

        {/* ==================================================
            TRANSACTION VOLUME
        ================================================== */}

        <View
          style={styles.volumeCard}
        >
          <View
            style={styles.volumeIcon}
          >
            <Ionicons
              name="pulse-outline"
              size={27}
              color="#60A5FA"
            />
          </View>

          <View
            style={
              styles.volumeContent
            }
          >
            <AppText
              style={
                styles.volumeLabel
              }
              numberOfLines={1}
            >
              Transaction Volume
            </AppText>

            <AppText
              weight="bold"
              style={
                styles.volumeValue
              }
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={
                0.65
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
              style={({ pressed }) => [
                styles.periodButton,
                pressed &&
                  styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Select activity period, currently ${getPeriodLabel(
                period,
              )}`}
            >
              <AppText
                weight="bold"
                style={
                  styles.periodText
                }
                numberOfLines={1}
              >
                {getPeriodLabel(
                  period,
                )}
              </AppText>

              <Ionicons
                name="chevron-down"
                size={16}
                color="#60A5FA"
              />
            </Pressable>

            <View
              style={styles.flatButton}
            >
              <View
                style={styles.flatLine}
              />

              <AppText
                weight="bold"
                style={
                  styles.flatText
                }
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
                      growth > 0
                        ? "#22C55E"
                        : growth < 0
                          ? "#F87171"
                          : "#64748B",
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
          style={styles.chartCard}
        >
          <View
            style={styles.chartHeader}
          >
            <View>
              <AppText
                weight="bold"
                style={
                  styles.chartTitle
                }
              >
                Transaction Activity
              </AppText>

              <AppText
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
                color="#60A5FA"
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
                  style={
                    styles.dateText
                  }
                >
                  {chartData[0]
                    ?.label ?? ""}
                </AppText>

                <AppText
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
                  style={
                    styles.dateText
                  }
                >
                  —
                </AppText>

                <AppText
                  style={
                    styles.dateText
                  }
                >
                  —
                </AppText>

                <AppText
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
            style={styles.statCard}
          >
            <View
              style={[
                styles.statIcon,
                styles.transactionIcon,
              ]}
            >
              <Ionicons
                name="swap-horizontal"
                size={26}
                color="#60A5FA"
              />
            </View>

            <View
              style={
                styles.statContent
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.statValue
                }
                numberOfLines={1}
              >
                {loading &&
                !activity
                  ? "—"
                  : transactionCount}
              </AppText>

              <AppText
                style={
                  styles.statLabel
                }
                numberOfLines={1}
              >
                Transactions
              </AppText>

              <AppText
                style={
                  styles.statDescription
                }
                numberOfLines={2}
              >
                Successful transactions
                {"\n"}
                in this period
              </AppText>
            </View>
          </View>

          {/* SUCCESS RATE */}

          <View
            style={styles.statCard}
          >
            <View
              style={[
                styles.statIcon,
                styles.activityIcon,
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={26}
                color="#22C55E"
              />
            </View>

            <View
              style={
                styles.statContent
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.statValue
                }
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={
                  0.7
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
                style={
                  styles.statLabel
                }
                numberOfLines={1}
              >
                Success Rate
              </AppText>

              <AppText
                style={
                  styles.statDescription
                }
                numberOfLines={2}
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
          style={styles.recentCard}
        >
          <View
            style={styles.recentHeader}
          >
            <View
              style={
                styles.recentTitleContainer
              }
            >
              <View
                style={styles.recentIcon}
              >
                <Ionicons
                  name="list-outline"
                  size={22}
                  color="#60A5FA"
                />
              </View>

              <View
                style={
                  styles.recentTitleContent
                }
              >
                <AppText
                  weight="bold"
                  style={
                    styles.recentTitle
                  }
                  numberOfLines={1}
                >
                  Activity Summary
                </AppText>

                <AppText
                  style={
                    styles.recentSubtitle
                  }
                  numberOfLines={1}
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
                        ? "#22C55E"
                        : "#64748B",
                  },
                ]}
              />

              <AppText
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
            style={styles.recentDivider}
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
                color="#60A5FA"
              />

              <AppText
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
                <Ionicons
                  name="alert-circle-outline"
                  size={30}
                  color="#F87171"
                />
              </View>

              <AppText
                weight="bold"
                style={
                  styles.noTransactionTitle
                }
              >
                Activity unavailable
              </AppText>

              <AppText
                style={
                  styles.noTransactionText
                }
                numberOfLines={2}
              >
                {error}
              </AppText>

              <Pressable
                onPress={refresh}
                style={({ pressed }) => [
                  styles.retryButton,
                  styles.retryButtonLarge,
                  pressed &&
                    styles.pressed,
                ]}
              >
                <Ionicons
                  name="refresh"
                  size={16}
                  color="#FFFFFF"
                />

                <AppText
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
                <Ionicons
                  name="document-text-outline"
                  size={30}
                  color="#CBD5E1"
                />
              </View>

              <AppText
                weight="bold"
                style={
                  styles.noTransactionTitle
                }
              >
                No transactions yet
              </AppText>

              <AppText
                style={
                  styles.noTransactionText
                }
                numberOfLines={2}
              >
                Successful service and market
                transactions will appear here.
              </AppText>
            </View>
          ) : (
            <View
              style={
                styles.summaryList
              }
            >
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
                  <Ionicons
                    name="wallet-outline"
                    size={20}
                    color="#60A5FA"
                  />
                </View>

                <View
                  style={
                    styles.summaryRowContent
                  }
                >
                  <AppText
                    weight="bold"
                    style={
                      styles.summaryTitle
                    }
                  >
                    Transaction Volume
                  </AppText>

                  <AppText
                    style={
                      styles.summarySubtitle
                    }
                  >
                    Service + market products
                  </AppText>
                </View>

                <AppText
                  weight="bold"
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
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#22C55E"
                  />
                </View>

                <View
                  style={
                    styles.summaryRowContent
                  }
                >
                  <AppText
                    weight="bold"
                    style={
                      styles.summaryTitle
                    }
                  >
                    Successful
                  </AppText>

                  <AppText
                    style={
                      styles.summarySubtitle
                    }
                  >
                    Completed transaction outcomes
                  </AppText>
                </View>

                <AppText
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
                  <Ionicons
                    name="close-circle-outline"
                    size={20}
                    color="#F87171"
                  />
                </View>

                <View
                  style={
                    styles.summaryRowContent
                  }
                >
                  <AppText
                    weight="bold"
                    style={
                      styles.summaryTitle
                    }
                  >
                    Failed
                  </AppText>

                  <AppText
                    style={
                      styles.summarySubtitle
                    }
                  >
                    Cancelled or failed transactions
                  </AppText>
                </View>

                <AppText
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
                  <Ionicons
                    name={
                      growth >= 0
                        ? "trending-up-outline"
                        : "trending-down-outline"
                    }
                    size={20}
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
                    weight="bold"
                    style={
                      styles.summaryTitle
                    }
                  >
                    Growth
                  </AppText>

                  <AppText
                    style={
                      styles.summarySubtitle
                    }
                  >
                    Compared with previous period
                  </AppText>
                </View>

                <AppText
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
          <Ionicons
            name="information-circle"
            size={20}
            color="#60A5FA"
          />

          <AppText
            style={styles.infoText}
            numberOfLines={3}
          >
            Activity combines successful service
            transactions and market product
            transactions. Market delivery fees are
            excluded from transaction volume.
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
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <View>
                <AppText
                  weight="bold"
                  style={
                    styles.modalTitle
                  }
                >
                  Activity Period
                </AppText>

                <AppText
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
                style={({ pressed }) => [
                  styles.modalClose,
                  pressed &&
                    styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Close period selector"
              >
                <Ionicons
                  name="close"
                  size={21}
                  color="#CBD5E1"
                />
              </Pressable>
            </View>

            <View
              style={
                styles.periodOptions
              }
            >
              {PERIOD_OPTIONS.map(
                (option) => {
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
                      style={({ pressed }) => [
                        styles.periodOption,
                        selected &&
                          styles.periodOptionSelected,
                        pressed &&
                          styles.periodOptionPressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{
                        selected,
                      }}
                    >
                      <View
                        style={
                          styles.periodOptionIcon
                        }
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={19}
                          color={
                            selected
                              ? "#60A5FA"
                              : "#94A3B8"
                          }
                        />
                      </View>

                      <AppText
                        weight={
                          selected
                            ? "bold"
                            : undefined
                        }
                        style={[
                          styles.periodOptionText,
                          selected &&
                            styles.periodOptionTextSelected,
                        ]}
                      >
                        {
                          option.label
                        }
                      </AppText>

                      {selected ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={21}
                          color="#60A5FA"
                        />
                      ) : (
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color="#475569"
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
    screen: {
      backgroundColor:
        "#020617",
    },

    container: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 30,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      minHeight: 70,

      flexDirection: "row",
      alignItems: "center",

      marginBottom: 12,
    },

    backButton: {
      width: 46,
      height: 46,

      borderRadius: 23,

      backgroundColor:
        "#0F1D32",

      alignItems: "center",
      justifyContent: "center",

      borderWidth: 1,
      borderColor:
        "#172B49",
    },

    headerText: {
      flex: 1,

      minWidth: 0,

      alignItems: "center",

      marginHorizontal: 8,
    },

    headerTitle: {
      fontSize: 22,
      lineHeight: 27,

      color: "#F8FAFC",

      textAlign: "center",
    },

    headerSubtitle: {
      marginTop: 2,

      fontSize: 11,
      lineHeight: 17,

      color: "#64748B",

      textAlign: "center",
    },

    calendarButton: {
      width: 46,
      height: 46,

      borderRadius: 14,

      backgroundColor:
        "#081426",

      borderWidth: 1,
      borderColor:
        "#1E3A66",

      alignItems: "center",
      justifyContent: "center",
    },

    /* ========================================================
       VOLUME
    ======================================================== */

    volumeCard: {
      minHeight: 126,

      padding: 14,

      borderRadius: 19,

      backgroundColor:
        "#071426",

      borderWidth: 1,
      borderColor:
        "#183152",

      flexDirection: "row",
      alignItems: "center",
    },

    volumeIcon: {
      width: 54,
      height: 54,

      borderRadius: 16,

      backgroundColor:
        "#102A63",

      alignItems: "center",
      justifyContent: "center",

      flexShrink: 0,
    },

    volumeContent: {
      flex: 1,

      minWidth: 0,

      marginLeft: 10,
    },

    volumeLabel: {
      fontSize: 12,
      lineHeight: 17,

      color: "#94A3B8",
    },

    volumeValue: {
      marginTop: 1,

      fontSize: 29,
      lineHeight: 36,

      color: "#F8FAFC",
    },

    volumeActions: {
      alignItems: "flex-end",

      gap: 8,

      marginLeft: 7,
    },

    periodButton: {
      width: 137,
      height: 42,

      paddingHorizontal: 11,

      borderRadius: 13,

      backgroundColor:
        "#081426",

      borderWidth: 1,
      borderColor:
        "#1D4ED8",

      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    periodText: {
      flex: 1,

      fontSize: 11.5,

      color: "#CBD5E1",

      marginRight: 5,
    },

    flatButton: {
      height: 36,

      paddingHorizontal: 11,

      borderRadius: 12,

      borderWidth: 1,
      borderColor:
        "#64748B",

      flexDirection: "row",
      alignItems: "center",

      gap: 6,
    },

    flatLine: {
      width: 12,
      height: 2,

      backgroundColor:
        "#94A3B8",
    },

    flatText: {
      fontSize: 11.5,

      color: "#94A3B8",
    },

    statusDot: {
      width: 6,
      height: 6,

      borderRadius: 3,
    },

    /* ========================================================
       CHART CARD
    ======================================================== */

    chartCard: {
      marginTop: 14,

      padding: 17,

      borderRadius: 19,

      backgroundColor:
        "#071426",

      borderWidth: 1,
      borderColor:
        "#183152",
    },

    chartHeader: {
      minHeight: 45,

      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent:
        "space-between",
    },

    chartTitle: {
      fontSize: 15,

      color: "#F8FAFC",
    },

    chartSubtitle: {
      marginTop: 3,

      fontSize: 10.5,

      color: "#64748B",
    },

    chart: {
      height: 245,

      position: "relative",

      borderWidth: 1,
      borderColor:
        "#172B49",

      overflow: "hidden",

      justifyContent: "flex-end",
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
        "#172B49",

      borderStyle: "dashed",
    },

    chartBars: {
      minHeight: 205,

      paddingHorizontal: 9,

      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent:
        "space-around",

      zIndex: 2,
    },

    chartBarColumn: {
      height: 225,

      alignItems: "center",
      justifyContent:
        "flex-end",

      marginHorizontal: 1,
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

      borderTopLeftRadius: 7,
      borderTopRightRadius: 7,

      backgroundColor:
        "#3B82F6",
    },

    chartBarEmpty: {
      backgroundColor:
        "#1E293B",

      opacity: 0.7,
    },

    chartBarLabel: {
      height: 27,

      marginTop: 5,

      fontSize: 8.5,

      color: "#64748B",

      textAlign: "center",
    },

    chartState: {
      flex: 1,

      alignItems: "center",
      justifyContent: "center",

      paddingHorizontal: 22,
    },

    chartStateIcon: {
      width: 58,
      height: 58,

      borderRadius: 29,

      backgroundColor:
        "#142541",

      alignItems: "center",
      justifyContent: "center",
    },

    chartStateTitle: {
      marginTop: 10,

      fontSize: 15,

      color: "#E2E8F0",

      textAlign: "center",
    },

    chartStateText: {
      marginTop: 6,

      fontSize: 11.5,
      lineHeight: 18,

      color: "#64748B",

      textAlign: "center",

      maxWidth: 290,
    },

    dateRow: {
      marginTop: 7,

      flexDirection: "row",

      justifyContent:
        "space-between",
    },

    dateText: {
      fontSize: 10.5,

      color: "#64748B",
    },

    /* ========================================================
       STATS
    ======================================================== */

    statsRow: {
      marginTop: 14,

      flexDirection: "row",

      gap: 10,
    },

    statCard: {
      flex: 1,

      minWidth: 0,

      minHeight: 166,

      padding: 13,

      borderRadius: 19,

      backgroundColor:
        "#071426",

      borderWidth: 1,
      borderColor:
        "#183152",

      alignItems:
        "flex-start",
    },

    statIcon: {
      width: 47,
      height: 47,

      borderRadius: 15,

      alignItems: "center",
      justifyContent: "center",

      flexShrink: 0,
    },

    transactionIcon: {
      backgroundColor:
        "#102A63",
    },

    activityIcon: {
      backgroundColor:
        "#064E3B",
    },

    statContent: {
      width: "100%",

      minWidth: 0,

      marginTop: 9,
    },

    statValue: {
      fontSize: 21,
      lineHeight: 26,

      color: "#F8FAFC",

      flexShrink: 1,
    },

    statLabel: {
      marginTop: 1,

      fontSize: 13,
      lineHeight: 18,

      color: "#94A3B8",

      flexShrink: 1,
    },

    statDescription: {
      marginTop: 11,

      fontSize: 10.5,
      lineHeight: 16,

      color: "#64748B",

      flexShrink: 1,
    },

    /* ========================================================
       SUMMARY
    ======================================================== */

    recentCard: {
      marginTop: 14,

      borderRadius: 19,

      backgroundColor:
        "#071426",

      borderWidth: 1,
      borderColor:
        "#183152",

      overflow: "hidden",
    },

    recentHeader: {
      minHeight: 70,

      paddingHorizontal: 13,

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

      borderRadius: 11,

      backgroundColor:
        "#0D2345",

      alignItems: "center",
      justifyContent: "center",

      flexShrink: 0,
    },

    recentTitleContent: {
      flex: 1,

      minWidth: 0,

      marginLeft: 9,
    },

    recentTitle: {
      fontSize: 15,

      color: "#F8FAFC",
    },

    recentSubtitle: {
      marginTop: 2,

      fontSize: 10.5,

      color: "#64748B",
    },

    activityBadge: {
      marginLeft: 8,

      paddingHorizontal: 9,
      height: 30,

      borderRadius: 15,

      backgroundColor:
        "#0B1D31",

      borderWidth: 1,
      borderColor:
        "#183152",

      flexDirection: "row",
      alignItems: "center",

      gap: 6,
    },

    badgeDot: {
      width: 6,
      height: 6,

      borderRadius: 3,
    },

    activityBadgeText: {
      fontSize: 10.5,

      color: "#CBD5E1",
    },

    recentDivider: {
      height: 1,

      backgroundColor:
        "#172B49",
    },

    /* ========================================================
       SUMMARY LIST
    ======================================================== */

    summaryList: {
      paddingVertical: 4,
    },

    summaryRow: {
      minHeight: 72,

      paddingHorizontal: 14,

      flexDirection: "row",
      alignItems: "center",
    },

    summaryRowIcon: {
      width: 42,
      height: 42,

      borderRadius: 12,

      backgroundColor:
        "#102A63",

      alignItems: "center",
      justifyContent: "center",

      flexShrink: 0,
    },

    successSummaryIcon: {
      backgroundColor:
        "#064E3B",
    },

    failedSummaryIcon: {
      backgroundColor:
        "#3F1D2A",
    },

    growthSummaryIcon: {
      backgroundColor:
        "#172554",
    },

    summaryRowContent: {
      flex: 1,

      minWidth: 0,

      marginLeft: 10,
      marginRight: 8,
    },

    summaryTitle: {
      fontSize: 12.5,

      color: "#E2E8F0",
    },

    summarySubtitle: {
      marginTop: 3,

      fontSize: 10,

      color: "#64748B",
    },

    summaryAmount: {
      fontSize: 13,

      color: "#F8FAFC",
    },

    summaryDivider: {
      height: 1,

      marginHorizontal: 14,

      backgroundColor:
        "#172B49",
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyTransactions: {
      minHeight: 220,

      paddingHorizontal: 18,
      paddingVertical: 28,

      alignItems: "center",
      justifyContent:
        "center",
    },

    emptyTransactionIcon: {
      width: 66,
      height: 66,

      borderRadius: 33,

      backgroundColor:
        "#142541",

      alignItems: "center",
      justifyContent: "center",
    },

    noTransactionTitle: {
      marginTop: 14,

      fontSize: 15,
      lineHeight: 20,

      color: "#F8FAFC",

      textAlign: "center",
    },

    noTransactionText: {
      marginTop: 6,

      fontSize: 12,
      lineHeight: 19,

      color: "#64748B",

      textAlign: "center",

      maxWidth: 290,
    },

    loadingText: {
      marginTop: 10,

      fontSize: 11.5,

      color: "#64748B",
    },

    /* ========================================================
       RETRY
    ======================================================== */

    retryButton: {
      marginTop: 14,

      minHeight: 38,

      paddingHorizontal: 14,

      borderRadius: 12,

      backgroundColor:
        "#2563EB",

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      gap: 6,
    },

    retryButtonLarge: {
      minWidth: 110,
    },

    retryText: {
      fontSize: 11.5,

      color: "#FFFFFF",
    },

    /* ========================================================
       INFO
    ======================================================== */

    infoCard: {
      marginTop: 14,

      minHeight: 70,

      paddingHorizontal: 14,
      paddingVertical: 12,

      borderRadius: 16,

      backgroundColor:
        "#071426",

      borderWidth: 1,
      borderColor:
        "#183152",

      flexDirection: "row",
      alignItems: "center",
    },

    infoText: {
      flex: 1,

      marginLeft: 9,

      fontSize: 11.5,
      lineHeight: 17,

      color: "#94A3B8",
    },

    /* ========================================================
       MODAL
    ======================================================== */

    modalOverlay: {
      flex: 1,

      backgroundColor:
        "rgba(2, 6, 23, 0.78)",

      justifyContent:
        "flex-end",

      padding: 16,
    },

    periodModal: {
      width: "100%",

      padding: 16,

      borderRadius: 22,

      backgroundColor:
        "#071426",

      borderWidth: 1,
      borderColor:
        "#183152",
    },

    modalHeader: {
      minHeight: 55,

      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent:
        "space-between",
    },

    modalTitle: {
      fontSize: 17,

      color: "#F8FAFC",
    },

    modalSubtitle: {
      marginTop: 3,

      fontSize: 11,

      color: "#64748B",
    },

    modalClose: {
      width: 38,
      height: 38,

      borderRadius: 12,

      backgroundColor:
        "#0F1D32",

      alignItems: "center",
      justifyContent: "center",

      borderWidth: 1,
      borderColor:
        "#172B49",
    },

    periodOptions: {
      marginTop: 8,

      gap: 8,
    },

    periodOption: {
      minHeight: 58,

      paddingHorizontal: 12,

      borderRadius: 14,

      backgroundColor:
        "#081426",

      borderWidth: 1,
      borderColor:
        "#172B49",

      flexDirection: "row",
      alignItems: "center",
    },

    periodOptionSelected: {
      backgroundColor:
        "#0D2345",

      borderColor:
        "#1D4ED8",
    },

    periodOptionPressed: {
      opacity: 0.75,
      transform: [
        {
          scale: 0.985,
        },
      ],
    },

    periodOptionIcon: {
      width: 38,
      height: 38,

      borderRadius: 11,

      backgroundColor:
        "#102A63",

      alignItems: "center",
      justifyContent: "center",
    },

    periodOptionText: {
      flex: 1,

      marginLeft: 10,

      fontSize: 12.5,

      color: "#CBD5E1",
    },

    periodOptionTextSelected: {
      color: "#F8FAFC",
    },

    /* ========================================================
       PRESS
    ======================================================== */

    pressed: {
      opacity: 0.75,

      transform: [
        {
          scale: 0.98,
        },
      ],
    },
  });