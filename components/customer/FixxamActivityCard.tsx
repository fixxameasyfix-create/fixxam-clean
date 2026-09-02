import React, {
  memo,
  useMemo,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppCard,
  AppText,
} from "@/components/ui";

/* ============================================================
   TYPES
============================================================ */

export type FixxamActivityPoint = {
  label: string;
  value: number;
};

export type FixxamActivityData = {
  volume: number;
  transactions: number;
  successRate: number;
  growth: number;
  chartData: FixxamActivityPoint[];
};

type Props = {
  data: FixxamActivityData;
  period?: "7D" | "30D" | "90D";
  onPeriodChange?: (
    period: "7D" | "30D" | "90D",
  ) => void;
  onPress?: () => void;
};

/* ============================================================
   HELPERS
============================================================ */

function formatCurrency(
  value: number,
): string {
  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    return "₦0";
  }

  if (value >= 1_000_000) {
    return `₦${(
      value / 1_000_000
    ).toFixed(2)}M`;
  }

  if (value >= 1_000) {
    return `₦${(
      value / 1_000
    ).toFixed(1)}K`;
  }

  return `₦${Math.round(
    value,
  ).toLocaleString("en-NG")}`;
}

function formatNumber(
  value: number,
): string {
  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    return "0";
  }

  return Math.round(
    value,
  ).toLocaleString("en-NG");
}

function clampPercentage(
  value: number,
): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, value),
  );
}

/* ============================================================
   MINI LINE CHART
============================================================ */

const ActivityChart = memo(
  ({
    data,
  }: {
    data: FixxamActivityPoint[];
  }) => {
    const points = useMemo(() => {
      const safeData =
        data.filter(
          (item) =>
            Number.isFinite(
              item.value,
            ) &&
            item.value >= 0,
        );

      if (
        safeData.length === 0
      ) {
        return [];
      }

      const max = Math.max(
        ...safeData.map(
          (item) => item.value,
        ),
        1,
      );

      const min = Math.min(
        ...safeData.map(
          (item) => item.value,
        ),
      );

      const range =
        Math.max(
          max - min,
          1,
        );

      return safeData.map(
        (
          item,
          index,
        ) => {
          const x =
            safeData.length === 1
              ? 50
              : (index /
                  (safeData.length -
                    1)) *
                100;

          const normalized =
            (item.value -
              min) /
            range;

          const y =
            88 -
            normalized * 68;

          return {
            ...item,
            x,
            y,
          };
        },
      );
    }, [data]);

    if (points.length < 2) {
      return (
        <View
          style={
            styles.chartEmpty
          }
        >
          <AppText
            style={
              styles.chartEmptyText
            }
          >
            Not enough activity data
          </AppText>
        </View>
      );
    }

    return (
      <View
        style={
          styles.chartContainer
        }
      >
        {/* GRID */}

        <View
          style={[
            styles.gridLine,
            { top: "25%" },
          ]}
        />

        <View
          style={[
            styles.gridLine,
            { top: "50%" },
          ]}
        />

        <View
          style={[
            styles.gridLine,
            { top: "75%" },
          ]}
        />

        {/* GRAPH */}

        <View
          style={
            styles.chartArea
          }
        >
          {points.map(
            (
              point,
              index,
            ) => {
              if (
                index ===
                points.length -
                  1
              ) {
                return null;
              }

              const next =
                points[
                  index + 1
                ];

              const dx =
                next.x -
                point.x;

              const dy =
                next.y -
                point.y;

              const length =
                Math.sqrt(
                  dx * dx +
                    dy * dy,
                );

              const angle =
                Math.atan2(
                  dy,
                  dx,
                ) *
                (180 /
                  Math.PI);

              return (
                <View
                  key={`line-${index}`}
                  style={[
                    styles.chartLine,
                    {
                      width:
                        `${length}%`,
                      left:
                        `${point.x}%`,
                      top:
                        `${point.y}%`,
                      transform: [
                        {
                          rotate: `${angle}deg`,
                        },
                      ],
                    },
                  ]}
                />
              );
            },
          )}

          {points.map(
            (
              point,
              index,
            ) => (
              <View
                key={`point-${index}`}
                style={[
                  styles.chartPoint,
                  {
                    left:
                      `${point.x}%`,
                    top:
                      `${point.y}%`,
                  },
                ]}
              />
            ),
          )}
        </View>
      </View>
    );
  },
);

/* ============================================================
   MAIN COMPONENT
============================================================ */

function FixxamActivityCard({
  data,
  period = "30D",
  onPeriodChange,
  onPress,
}: Props) {
  const safeGrowth =
    Number.isFinite(
      data.growth,
    )
      ? data.growth
      : 0;

  const successRate =
    clampPercentage(
      data.successRate,
    );

  const isPositive =
    safeGrowth >= 0;

  const chartData =
    Array.isArray(
      data.chartData,
    )
      ? data.chartData
      : [];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={
        onPress ? "button" : undefined
      }
      accessibilityState={{
        disabled: !onPress,
      }}
      style={({ pressed }) => [
        pressed &&
          onPress &&
          styles.cardPressed,
      ]}
    >
      <AppCard
        style={styles.card}
      >
        {/* ======================================================
            HEADER
        ====================================================== */}

        <View
          style={
            styles.header
          }
        >
          <View
            style={
              styles.headerLeft
            }
          >
            <View
              style={
                styles.activityIcon
              }
            >
              <Ionicons
                name="pulse-outline"
                size={17}
                color="#2563EB"
              />
            </View>

            <View>
              <AppText
                weight="bold"
                style={
                  styles.title
                }
              >
                Fixxam Activity
              </AppText>

              <AppText
                style={
                  styles.subtitle
                }
              >
                Platform activity
              </AppText>
            </View>
          </View>

          {/* PERIOD */}

          {onPeriodChange ? (
            <View
              style={
                styles.periodContainer
              }
            >
              {(
                [
                  "7D",
                  "30D",
                  "90D",
                ] as const
              ).map(
                (item) => (
                  <Pressable
                    key={item}
                    onPress={() =>
                      onPeriodChange(
                        item,
                      )
                    }
                    style={[
                      styles.periodButton,
                      period ===
                        item &&
                        styles.periodButtonActive,
                    ]}
                  >
                    <AppText
                      weight="bold"
                      style={[
                        styles.periodText,
                        period ===
                          item &&
                          styles.periodTextActive,
                      ]}
                    >
                      {item}
                    </AppText>
                  </Pressable>
                ),
              )}
            </View>
          ) : (
            <View
              style={
                styles.singlePeriod
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.singlePeriodText
                }
              >
                {period}
              </AppText>
            </View>
          )}
        </View>

        {/* ======================================================
            TRANSACTION VOLUME
        ====================================================== */}

        <View
          style={
            styles.volumeSection
          }
        >
          <AppText
            style={
              styles.volumeLabel
            }
          >
            Transaction Volume
          </AppText>

          <AppText
            weight="bold"
            style={
              styles.volumeValue
            }
          >
            {formatCurrency(
              data.volume,
            )}
          </AppText>
        </View>

        {/* ======================================================
            CHART
        ====================================================== */}

        <ActivityChart
          data={chartData}
        />

        {/* ======================================================
            CHART LABELS
        ====================================================== */}

        {chartData.length >=
          2 && (
          <View
            style={
              styles.chartLabels
            }
          >
            <AppText
              style={
                styles.chartLabel
              }
            >
              {chartData[0]
                ?.label ?? ""}
            </AppText>

            <AppText
              style={
                styles.chartLabel
              }
            >
              {
                chartData[
                  chartData.length -
                    1
                ]?.label
              }
            </AppText>
          </View>
        )}

        {/* ======================================================
            STATS
        ====================================================== */}

        <View
          style={
            styles.statsContainer
          }
        >
          {/* TRANSACTIONS */}

          <View
            style={
              styles.stat
            }
          >
            <AppText
              weight="bold"
              style={
                styles.statValue
              }
            >
              {formatNumber(
                data.transactions,
              )}
            </AppText>

            <AppText
              style={
                styles.statLabel
              }
            >
              Transactions
            </AppText>
          </View>

          <View
            style={
              styles.statDivider
            }
          />

          {/* SUCCESS */}

          <View
            style={
              styles.stat
            }
          >
            <AppText
              weight="bold"
              style={
                styles.statValue
              }
            >
              {successRate.toFixed(
                1,
              )}
              %
            </AppText>

            <AppText
              style={
                styles.statLabel
              }
            >
              Success
            </AppText>
          </View>

          <View
            style={
              styles.statDivider
            }
          />

          {/* GROWTH */}

          <View
            style={
              styles.stat
            }
          >
            <View
              style={
                styles.growthRow
              }
            >
              <Ionicons
                name={
                  isPositive
                    ? "trending-up-outline"
                    : "trending-down-outline"
                }
                size={15}
                color={
                  isPositive
                    ? "#16A34A"
                    : "#DC2626"
                }
              />

              <AppText
                weight="bold"
                style={[
                  styles.growthValue,
                  {
                    color:
                      isPositive
                        ? "#16A34A"
                        : "#DC2626",
                  },
                ]}
              >
                {isPositive
                  ? "+"
                  : ""}
                {safeGrowth.toFixed(
                  1,
                )}
                %
              </AppText>
            </View>

            <AppText
              style={
                styles.statLabel
              }
            >
              vs previous
            </AppText>
          </View>
        </View>
      </AppCard>
    </Pressable>
  );
}

export default memo(
  FixxamActivityCard,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    card: {
      marginTop: 16,
      marginHorizontal: 20,
      padding: 18,
      borderRadius: 20,
      backgroundColor: "#FFFFFF",
    },

    cardPressed: {
      opacity: 0.92,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },

    activityIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 10,
    },

    title: {
      fontSize: 16,
      color: "#111827",
    },

    subtitle: {
      marginTop: 2,
      fontSize: 11,
      color: "#94A3B8",
    },

    /* ========================================================
       PERIOD
    ======================================================== */

    periodContainer: {
      flexDirection: "row",
      padding: 3,
      borderRadius: 10,
      backgroundColor:
        "#F1F5F9",
    },

    periodButton: {
      minWidth: 38,
      height: 28,
      borderRadius: 8,
      alignItems: "center",
      justifyContent:
        "center",
    },

    periodButtonActive: {
      backgroundColor:
        "#FFFFFF",
    },

    periodText: {
      fontSize: 10,
      color: "#94A3B8",
    },

    periodTextActive: {
      color: "#2563EB",
    },

    singlePeriod: {
      paddingHorizontal: 10,
      height: 28,
      borderRadius: 9,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent:
        "center",
    },

    singlePeriodText: {
      fontSize: 10,
      color: "#2563EB",
    },

    /* ========================================================
       VOLUME
    ======================================================== */

    volumeSection: {
      marginTop: 18,
    },

    volumeLabel: {
      fontSize: 12,
      color: "#64748B",
    },

    volumeValue: {
      marginTop: 3,
      fontSize: 28,
      lineHeight: 34,
      color: "#111827",
      letterSpacing: -0.5,
    },

    /* ========================================================
       CHART
    ======================================================== */

    chartContainer: {
      height: 108,
      marginTop: 12,
      position: "relative",
      overflow: "hidden",
    },

    chartArea: {
      ...StyleSheet.absoluteFillObject,
    },

    gridLine: {
      position: "absolute",
      left: 0,
      right: 0,
      height:
        StyleSheet.hairlineWidth,
      backgroundColor:
        "#E2E8F0",
    },

    chartLine: {
      position: "absolute",
      height: 2,
      backgroundColor:
        "#2563EB",
      transformOrigin:
        "left center",
      borderRadius: 2,
    },

    chartPoint: {
      position: "absolute",
      width: 7,
      height: 7,
      marginLeft: -3.5,
      marginTop: -3.5,
      borderRadius: 4,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 2,
      borderColor:
        "#2563EB",
    },

    chartEmpty: {
      height: 108,
      marginTop: 12,
      borderRadius: 14,
      backgroundColor:
        "#F8FAFC",
      alignItems: "center",
      justifyContent:
        "center",
    },

    chartEmptyText: {
      fontSize: 12,
      color: "#94A3B8",
    },

    chartLabels: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      marginTop: 2,
    },

    chartLabel: {
      fontSize: 10,
      color: "#94A3B8",
    },

    /* ========================================================
       STATS
    ======================================================== */

    statsContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 16,
      paddingTop: 15,
      borderTopWidth:
        StyleSheet.hairlineWidth,
      borderTopColor:
        "#E2E8F0",
    },

    stat: {
      flex: 1,
      alignItems: "center",
    },

    statDivider: {
      width:
        StyleSheet.hairlineWidth,
      height: 34,
      backgroundColor:
        "#E2E8F0",
    },

    statValue: {
      fontSize: 14,
      color: "#111827",
    },

    statLabel: {
      marginTop: 3,
      fontSize: 10,
      color: "#94A3B8",
    },

    growthRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
    },

    growthValue: {
      fontSize: 14,
    },
  });