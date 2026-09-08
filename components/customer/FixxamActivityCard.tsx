import React, {
  memo,
  useMemo,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  AppCard,
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

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

type ActivityPeriod =
  | "7D"
  | "30D"
  | "90D";

type Props = {
  data: FixxamActivityData;

  period?: ActivityPeriod;

  onPeriodChange?: (
    period: ActivityPeriod,
  ) => void;

  onPress?: () => void;
};

/* ============================================================
   CONSTANTS
============================================================ */

const PERIODS: ActivityPeriod[] = [
  "7D",
  "30D",
  "90D",
];

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
  if (
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      value,
    ),
  );
}

/* ============================================================
   MINI LINE CHART
============================================================ */

const ActivityChart =
  memo(
    function ActivityChart({
      data,
    }: {
      data: FixxamActivityPoint[];
    }) {
      const points =
        useMemo(() => {
          const safeData =
            data.filter(
              (item) =>
                Number.isFinite(
                  item.value,
                ) &&
                item.value >= 0,
            );

          if (
            safeData.length ===
            0
          ) {
            return [];
          }

          const max =
            Math.max(
              ...safeData.map(
                (item) =>
                  item.value,
              ),
              1,
            );

          const min =
            Math.min(
              ...safeData.map(
                (item) =>
                  item.value,
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
                safeData.length ===
                1
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
                normalized *
                  68;

              return {
                ...item,
                x,
                y,
              };
            },
          );
        }, [data]);

      if (
        points.length < 2
      ) {
        return (
          <View
            style={
              styles.chartEmpty
            }
          >
            <AppText
              variant="caption"
              tone="secondary"
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
          <View
            style={[
              styles.gridLine,
              styles.gridLineTop,
            ]}
          />

          <View
            style={[
              styles.gridLine,
              styles.gridLineMiddle,
            ]}
          />

          <View
            style={[
              styles.gridLine,
              styles.gridLineBottom,
            ]}
          />

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
                  points.length - 1
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
                    key={`line-${point.label}-${index}`}
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
                  key={`point-${point.label}-${index}`}
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

ActivityChart.displayName =
  "ActivityChart";

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

  const firstLabel =
    chartData[0]
      ?.label ?? "";

  const lastLabel =
    chartData[
      chartData.length -
        1
    ]?.label ?? "";

  return (
    <Pressable
      disabled={
        !onPress
      }
      accessibilityRole={
        onPress
          ? "button"
          : undefined
      }
      accessibilityLabel={
        onPress
          ? "Open Fixxam activity details"
          : undefined
      }
      accessibilityState={{
        disabled:
          !onPress,
      }}
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        pressed &&
        onPress
          ? styles.cardPressed
          : null,
      ]}
    >
      <AppCard
        role="customer"
        variant="outlined"
        style={
          styles.card
        }
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
              <AppIcon
                name="info"
                role="customer"
                size="sm"
                state="active"
              />
            </View>

            <View
              style={
                styles.headerText
              }
            >
              <AppText
                variant="bodyLarge"
                weight="bold"
                numberOfLines={1}
                style={
                  styles.title
                }
              >
                Fixxam Activity
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                numberOfLines={1}
                style={
                  styles.subtitle
                }
              >
                Platform activity
              </AppText>
            </View>
          </View>

          {/* ====================================================
              PERIOD
          ==================================================== */}

          {onPeriodChange ? (
            <View
              style={
                styles.periodContainer
              }
            >
              {PERIODS.map(
                (item) => {
                  const active =
                    period ===
                    item;

                  return (
                    <Pressable
                      key={
                        item
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`Show ${item} activity`}
                      accessibilityState={{
                        selected:
                          active,
                      }}
                      onPress={() =>
                        onPeriodChange(
                          item,
                        )
                      }
                      style={({
                        pressed,
                      }) => [
                        styles.periodButton,

                        active
                          ? styles.periodButtonActive
                          : null,

                        pressed
                          ? styles.periodPressed
                          : null,
                      ]}
                    >
                      <AppText
                        variant="caption"
                        weight="bold"
                        style={[
                          styles.periodText,

                          active
                            ? styles.periodTextActive
                            : null,
                        ]}
                      >
                        {item}
                      </AppText>
                    </Pressable>
                  );
                },
              )}
            </View>
          ) : (
            <View
              style={
                styles.singlePeriod
              }
            >
              <AppText
                variant="caption"
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
            variant="caption"
            tone="secondary"
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
            {formatCurrency(
              data.volume,
            )}
          </AppText>
        </View>

        {/* ======================================================
            CHART
        ====================================================== */}

        <ActivityChart
          data={
            chartData
          }
        />

        {/* ======================================================
            CHART LABELS
        ====================================================== */}

        {chartData.length >=
        2 ? (
          <View
            style={
              styles.chartLabels
            }
          >
            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.chartLabel
              }
            >
              {firstLabel}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.chartLabel
              }
            >
              {lastLabel}
            </AppText>
          </View>
        ) : null}

        {/* ======================================================
            STATS
        ====================================================== */}

        <View
          style={
            styles.statsContainer
          }
        >
          <View
            style={
              styles.stat
            }
          >
            <AppText
              variant="bodyLarge"
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
              variant="caption"
              tone="secondary"
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

          <View
            style={
              styles.stat
            }
          >
            <AppText
              variant="bodyLarge"
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
              variant="caption"
              tone="secondary"
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
              <AppIcon
                name={
                  isPositive
                    ? "arrow-up"
                    : "down"
                }
                role="customer"
                size="xs"
                state={
                  isPositive
                    ? "success"
                    : "error"
                }
              />

              <AppText
                variant="bodyLarge"
                weight="bold"
                style={[
                  styles.growthValue,
                  {
                    color:
                      isPositive
                        ? Colors.success
                        : Colors.error,
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
              variant="caption"
              tone="secondary"
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
      marginTop:
        FixxamTokens.spacing.md,

      marginHorizontal:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.lg,

      backgroundColor:
        Colors.surface,
    },

    cardPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,
    },

    headerLeft: {
      flex: 1,

      minWidth: 0,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    headerText: {
      flex: 1,

      minWidth: 0,
    },

    activityIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      marginRight:
        FixxamTokens.spacing.sm,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       PERIOD
    ======================================================== */

    periodContainer: {
      flexShrink: 0,

      flexDirection:
        "row",

      padding:
        FixxamTokens.spacing.xxs,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },

    periodButton: {
      minWidth:
        FixxamTokens.size.minimumTouchTarget,

      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.sm,
    },

    periodButtonActive: {
      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    periodPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,
    },

    periodText: {
      color:
        Colors.textMuted,
    },

    periodTextActive: {
      color:
        CustomerColors.primary,
    },

    singlePeriod: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    singlePeriodText: {
      color:
        CustomerColors.primary,
    },

    /* ========================================================
       VOLUME
    ======================================================== */

    volumeSection: {
      marginTop:
        FixxamTokens.spacing.lg,
    },

    volumeLabel: {
      color:
        Colors.textSecondary,
    },

    volumeValue: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textPrimary,

      letterSpacing:
        -0.5,
    },

    /* ========================================================
       CHART
    ======================================================== */

    chartContainer: {
      height: 108,

      marginTop:
        FixxamTokens.spacing.md,

      position:
        "relative",

      overflow:
        "hidden",
    },

    chartArea: {
      ...StyleSheet.absoluteFillObject,
    },

    gridLine: {
      position:
        "absolute",

      left: 0,

      right: 0,

      height:
        StyleSheet.hairlineWidth,

      backgroundColor:
        Colors.divider,
    },

    gridLineTop: {
      top: "25%",
    },

    gridLineMiddle: {
      top: "50%",
    },

    gridLineBottom: {
      top: "75%",
    },

    chartLine: {
      position:
        "absolute",

      height: 2,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primary,

      transformOrigin:
        "left center",
    },

    chartPoint: {
      position:
        "absolute",

      width: 7,

      height: 7,

      marginLeft:
        -3.5,

      marginTop:
        -3.5,

      borderWidth: 2,

      borderColor:
        CustomerColors.primary,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    chartEmpty: {
      height: 108,

      marginTop:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.background,
    },

    chartEmptyText: {
      color:
        Colors.textMuted,
    },

    chartLabels: {
      marginTop:
        FixxamTokens.spacing.xxs,

      flexDirection:
        "row",

      justifyContent:
        "space-between",
    },

    chartLabel: {
      maxWidth:
        "45%",

      color:
        Colors.textMuted,
    },

    /* ========================================================
       STATS
    ======================================================== */

    statsContainer: {
      marginTop:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderTopWidth:
        StyleSheet.hairlineWidth,

      borderTopColor:
        Colors.divider,
    },

    stat: {
      flex: 1,

      minWidth: 0,

      alignItems:
        "center",
    },

    statDivider: {
      width:
        StyleSheet.hairlineWidth,

      height: 34,

      backgroundColor:
        Colors.divider,
    },

    statValue: {
      color:
        Colors.textPrimary,
    },

    statLabel: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textMuted,
    },

    growthRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xxs,
    },

    growthValue: {
      color:
        Colors.success,
    },
  });