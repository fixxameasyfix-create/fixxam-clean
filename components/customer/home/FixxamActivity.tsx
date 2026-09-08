import React, {
  useMemo,
} from "react";

import {
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
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type FixxamActivityBooking = {
  id?: string;

  status?: string;

  agreedPrice?: number | null;

  amount?: number | null;

  offerAmount?: number | null;

  offerAcceptedAt?: unknown;

  createdAt?: unknown;
};

type FixxamActivityProps = {
  bookings?:
    FixxamActivityBooking[];
};

type DailyActivity = {
  date: Date;

  volume: number;
};

type ActivitySummary = {
  volume: number;

  transactions: number;
};

type TrendType =
  | "up"
  | "down"
  | "flat";

/* ============================================================
   CONSTANTS
============================================================ */

const ACTIVITY_DAYS = 30;

/*
 * Intentional dark analytics palette.
 *
 * Kept local because this component
 * has a dedicated financial/chart
 * presentation rather than normal
 * application surfaces.
 */
const ACTIVITY_COLORS = {
  card: "#050505",

  chart: "#070B11",

  surface: "#0B1018",

  surfaceStrong: "#0F172A",

  border: "#1E293B",

  grid: "#172033",

  blueSoft: "#172554",

  blueBorder: "#1E3A8A",

  blueText: "#60A5FA",

  textPrimary: "#F8FAFC",

  textSecondary: "#64748B",

  textMuted: "#475569",

  upBackground: "#052E16",

  downBackground: "#450A0A",
} as const;

/* ============================================================
   DATE
============================================================ */

function getDateValue(
  value: unknown,
): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(
      value.getTime(),
    )
      ? null
      : value;
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    const data =
      value as {
        toDate?: unknown;

        seconds?: unknown;

        nanoseconds?: unknown;
      };

    if (
      typeof data.toDate ===
      "function"
    ) {
      try {
        const date =
          data.toDate();

        return (
          date instanceof Date &&
          !Number.isNaN(
            date.getTime(),
          )
        )
          ? date
          : null;
      } catch {
        return null;
      }
    }

    if (
      typeof data.seconds ===
        "number" &&
      Number.isFinite(
        data.seconds,
      )
    ) {
      const nanoseconds =
        typeof data.nanoseconds ===
          "number" &&
        Number.isFinite(
          data.nanoseconds,
        )
          ? data.nanoseconds
          : 0;

      const milliseconds =
        data.seconds * 1000 +
        nanoseconds /
          1_000_000;

      const date =
        new Date(
          milliseconds,
        );

      return Number.isNaN(
        date.getTime(),
      )
        ? null
        : date;
    }
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    const date =
      new Date(value);

    return Number.isNaN(
      date.getTime(),
    )
      ? null
      : date;
  }

  return null;
}

/* ============================================================
   START OF DAY
============================================================ */

function startOfDay(
  date: Date,
): Date {
  const result =
    new Date(date);

  result.setHours(
    0,
    0,
    0,
    0,
  );

  return result;
}

/* ============================================================
   DAY KEY
============================================================ */

function getDayKey(
  date: Date,
): string {
  return [
    date.getFullYear(),

    String(
      date.getMonth() + 1,
    ).padStart(
      2,
      "0",
    ),

    String(
      date.getDate(),
    ).padStart(
      2,
      "0",
    ),
  ].join("-");
}

/* ============================================================
   FINAL PRICE
============================================================ */

function getFinalAmount(
  booking:
    FixxamActivityBooking,
): number {
  const values = [
    booking.agreedPrice,
    booking.amount,
    booking.offerAmount,
  ];

  for (
    const value of values
  ) {
    if (
      typeof value === "number" &&
      Number.isFinite(value) &&
      value > 0
    ) {
      return value;
    }
  }

  return 0;
}

/* ============================================================
   ACCEPTED DATE
============================================================ */

function getAcceptedDate(
  booking:
    FixxamActivityBooking,
): Date | null {
  return (
    getDateValue(
      booking.offerAcceptedAt,
    ) ??
    getDateValue(
      booking.createdAt,
    )
  );
}

/* ============================================================
   SUMMARY
============================================================ */

function calculateActivitySummary(
  bookings:
    FixxamActivityBooking[],
): ActivitySummary {
  const today =
    startOfDay(
      new Date(),
    );

  const startDate =
    new Date(today);

  startDate.setDate(
    startDate.getDate() -
      (ACTIVITY_DAYS - 1),
  );

  let volume = 0;

  let transactions = 0;

  for (
    const booking of bookings
  ) {
    if (
      booking.status
        ?.trim()
        .toLowerCase() !==
      "accepted"
    ) {
      continue;
    }

    const acceptedDate =
      getAcceptedDate(
        booking,
      );

    if (!acceptedDate) {
      continue;
    }

    const normalizedDate =
      startOfDay(
        acceptedDate,
      );

    if (
      normalizedDate <
        startDate ||
      normalizedDate >
        today
    ) {
      continue;
    }

    const amount =
      getFinalAmount(
        booking,
      );

    if (amount <= 0) {
      continue;
    }

    transactions += 1;

    volume += amount;
  }

  return {
    volume,
    transactions,
  };
}

/* ============================================================
   DAILY ACTIVITY
============================================================ */

function buildDailyActivity(
  bookings:
    FixxamActivityBooking[],
): DailyActivity[] {
  const today =
    startOfDay(
      new Date(),
    );

  const dailyMap =
    new Map<
      string,
      number
    >();

  for (
    let index = 0;
    index < ACTIVITY_DAYS;
    index += 1
  ) {
    const date =
      new Date(today);

    date.setDate(
      today.getDate() -
        (ACTIVITY_DAYS -
          1 -
          index),
    );

    dailyMap.set(
      getDayKey(date),
      0,
    );
  }

  for (
    const booking of bookings
  ) {
    if (
      booking.status
        ?.trim()
        .toLowerCase() !==
      "accepted"
    ) {
      continue;
    }

    const date =
      getAcceptedDate(
        booking,
      );

    if (!date) {
      continue;
    }

    const key =
      getDayKey(
        startOfDay(
          date,
        ),
      );

    if (
      !dailyMap.has(key)
    ) {
      continue;
    }

    const amount =
      getFinalAmount(
        booking,
      );

    if (amount <= 0) {
      continue;
    }

    dailyMap.set(
      key,
      (dailyMap.get(key) ??
        0) + amount,
    );
  }

  return Array.from(
    dailyMap.entries(),
  ).map(
    ([key, volume]) => ({
      date: new Date(
        `${key}T00:00:00`,
      ),

      volume,
    }),
  );
}

/* ============================================================
   TREND
============================================================ */

function calculateTrend(
  activity:
    DailyActivity[],
): {
  type: TrendType;

  percentage: number;
} {
  const activeDays =
    activity.filter(
      (item) =>
        item.volume > 0,
    );

  if (
    activeDays.length < 2
  ) {
    return {
      type: "flat",
      percentage: 0,
    };
  }

  const previous =
    activeDays[
      activeDays.length - 2
    ].volume;

  const current =
    activeDays[
      activeDays.length - 1
    ].volume;

  if (previous <= 0) {
    return {
      type:
        current > 0
          ? "up"
          : "flat",

      percentage:
        current > 0
          ? 100
          : 0,
    };
  }

  const percentage =
    Math.round(
      ((current -
        previous) /
        previous) *
        100,
    );

  if (percentage > 0) {
    return {
      type: "up",
      percentage,
    };
  }

  if (percentage < 0) {
    return {
      type: "down",

      percentage:
        Math.abs(
          percentage,
        ),
    };
  }

  return {
    type: "flat",
    percentage: 0,
  };
}

/* ============================================================
   FORMAT MONEY
============================================================ */

function formatMoney(
  amount: number,
): string {
  if (
    !Number.isFinite(
      amount,
    ) ||
    amount <= 0
  ) {
    return "₦0";
  }

  if (
    amount >=
    1_000_000
  ) {
    return `₦${(
      amount /
      1_000_000
    ).toFixed(
      amount >=
        10_000_000
        ? 0
        : 1,
    )}M`;
  }

  if (
    amount >= 1_000
  ) {
    return `₦${(
      amount / 1_000
    ).toFixed(
      amount >=
        100_000
        ? 0
        : 1,
    )}K`;
  }

  return `₦${Math.round(
    amount,
  ).toLocaleString(
    "en-NG",
  )}`;
}

/* ============================================================
   TREND HELPERS
============================================================ */

function getTrendColor(
  trend: TrendType,
): string {
  switch (trend) {
    case "up":
      return Colors.success;

    case "down":
      return Colors.error;

    default:
      return Colors.textMuted;
  }
}

function getTrendLabel(
  trend: TrendType,
): string {
  switch (trend) {
    case "up":
      return "UP";

    case "down":
      return "DOWN";

    default:
      return "FLAT";
  }
}

function getTrendBackground(
  trend: TrendType,
): string {
  switch (trend) {
    case "up":
      return ACTIVITY_COLORS
        .upBackground;

    case "down":
      return ACTIVITY_COLORS
        .downBackground;

    default:
      return ACTIVITY_COLORS
        .surfaceStrong;
  }
}

/* ============================================================
   CHART
============================================================ */

function ActivityChart({
  activity,
}: {
  activity:
    DailyActivity[];
}) {
  const maxVolume =
    Math.max(
      ...activity.map(
        (item) =>
          item.volume,
      ),
      0,
    );

  const hasActivity =
    maxVolume > 0;

  return (
    <View
      accessible
      accessibilityLabel={
        hasActivity
          ? "30 day transaction activity chart"
          : "No transaction activity in the last 30 days"
      }
      style={
        styles.chartContainer
      }
    >
      {/* GRID */}

      <View
        pointerEvents="none"
        style={styles.grid}
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

      {!hasActivity ? (
        <View
          style={
            styles.emptyChart
          }
        >
          <AppIcon
            name="info"
            size="xs"
            color={
              ACTIVITY_COLORS
                .textMuted
            }
          />

          <AppText
            variant="caption"
            style={
              styles.emptyChartText
            }
          >
            No transaction activity
          </AppText>
        </View>
      ) : (
        <View
          style={
            styles.barsContainer
          }
        >
          {activity.map(
            (
              item,
              index,
            ) => {
              const previous =
                index > 0
                  ? activity[
                      index - 1
                    ].volume
                  : item.volume;

              const isUp =
                item.volume >
                previous;

              const isDown =
                item.volume <
                previous;

              const barColor =
                isUp
                  ? Colors.success
                  : isDown
                    ? Colors.error
                    : ACTIVITY_COLORS
                        .textSecondary;

              const height =
                item.volume > 0
                  ? Math.max(
                      8,

                      (item.volume /
                        maxVolume) *
                        72,
                    )
                  : 2;

              return (
                <View
                  key={getDayKey(
                    item.date,
                  )}
                  style={
                    styles.barColumn
                  }
                >
                  <View
                    style={[
                      styles.bar,

                      {
                        height,

                        backgroundColor:
                          barColor,
                      },
                    ]}
                  />
                </View>
              );
            },
          )}
        </View>
      )}
    </View>
  );
}

/* ============================================================
   COMPONENT
============================================================ */

export default function FixxamActivity({
  bookings = [],
}: FixxamActivityProps) {
  const safeBookings =
    Array.isArray(
      bookings,
    )
      ? bookings
      : [];

  const activity =
    useMemo(
      () =>
        calculateActivitySummary(
          safeBookings,
        ),
      [safeBookings],
    );

  const dailyActivity =
    useMemo(
      () =>
        buildDailyActivity(
          safeBookings,
        ),
      [safeBookings],
    );

  const trend =
    useMemo(
      () =>
        calculateTrend(
          dailyActivity,
        ),
      [dailyActivity],
    );

  const trendColor =
    getTrendColor(
      trend.type,
    );

  const trendLabel =
    getTrendLabel(
      trend.type,
    );

  const trendBackground =
    getTrendBackground(
      trend.type,
    );

  /* ==========================================================
     CHART LABELS
  ========================================================== */

  const firstDate =
    dailyActivity[0]
      ?.date;

  const middleDate =
    dailyActivity[
      Math.floor(
        dailyActivity.length /
          2,
      )
    ]?.date;

  const lastDate =
    dailyActivity[
      dailyActivity.length -
        1
    ]?.date;

  const firstLabel =
    firstDate
      ? firstDate.toLocaleDateString(
          "en-NG",
          {
            day: "numeric",
            month: "short",
          },
        )
      : "";

  const middleLabel =
    middleDate
      ? middleDate.toLocaleDateString(
          "en-NG",
          {
            day: "numeric",
            month: "short",
          },
        )
      : "";

  const lastLabel =
    lastDate
      ? lastDate.toLocaleDateString(
          "en-NG",
          {
            day: "numeric",
            month: "short",
          },
        )
      : "";

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppCard
      style={styles.card}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={styles.header}
      >
        <View
          style={
            styles.headerLeft
          }
        >
          <View
            style={
              styles.iconBox
            }
          >
            <AppIcon
              name="jobs"
              size="sm"
              color={
                ACTIVITY_COLORS
                  .blueText
              }
            />
          </View>

          <View
            style={
              styles.headerText
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={styles.title}
            >
              Fixxam Activity
            </AppText>

            <AppText
              variant="caption"
              style={
                styles.subtitle
              }
            >
              Service transaction analysis
            </AppText>
          </View>
        </View>

        <View
          style={styles.period}
        >
          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.periodText
            }
          >
            30D
          </AppText>
        </View>
      </View>

      {/* ======================================================
          VOLUME
      ====================================================== */}

      <View
        style={
          styles.valueRow
        }
      >
        <View
          style={
            styles.valueContent
          }
        >
          <AppText
            variant="caption"
            style={
              styles.valueLabel
            }
          >
            Transaction Volume
          </AppText>

          <AppText
            variant="heading2"
            weight="bold"
            numberOfLines={1}
            adjustsFontSizeToFit
            style={styles.value}
          >
            {formatMoney(
              activity.volume,
            )}
          </AppText>
        </View>

        <View
          style={[
            styles.trendBadge,

            {
              borderColor:
                trendColor,

              backgroundColor:
                trendBackground,
            },
          ]}
        >
          {trend.type ===
          "up" ? (
            <AppIcon
              name="arrow-up"
              size="xs"
              color={
                trendColor
              }
            />
          ) : trend.type ===
            "down" ? (
            <AppIcon
              name="down"
              size="xs"
              color={
                trendColor
              }
            />
          ) : null}

          <AppText
            variant="caption"
            weight="bold"
            style={[
              styles.trendText,

              {
                color:
                  trendColor,
              },
            ]}
          >
            {trend.type ===
            "flat"
              ? trendLabel
              : `${trendLabel} ${trend.percentage}%`}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          CHART
      ====================================================== */}

      <ActivityChart
        activity={
          dailyActivity
        }
      />

      <View
        style={
          styles.chartLabels
        }
      >
        <AppText
          variant="caption"
          style={
            styles.chartLabel
          }
        >
          {firstLabel}
        </AppText>

        <AppText
          variant="caption"
          style={
            styles.chartLabel
          }
        >
          {middleLabel}
        </AppText>

        <AppText
          variant="caption"
          style={
            styles.chartLabel
          }
        >
          {lastLabel}
        </AppText>
      </View>

      {/* ======================================================
          STATS
      ====================================================== */}

      <View
        style={
          styles.statsRow
        }
      >
        {/* TRANSACTIONS */}

        <View
          style={styles.stat}
        >
          <View
            style={
              styles.statIcon
            }
          >
            <AppIcon
              name="payment"
              size="xs"
              color={
                ACTIVITY_COLORS
                  .blueText
              }
            />
          </View>

          <View
            style={
              styles.statContent
            }
          >
            <AppText
              variant="body"
              weight="bold"
              style={
                styles.statValue
              }
            >
              {activity.transactions.toLocaleString(
                "en-NG",
              )}
            </AppText>

            <AppText
              variant="caption"
              style={
                styles.statLabel
              }
            >
              Transactions
            </AppText>
          </View>
        </View>

        {/* ACTIVITY */}

        <View
          style={styles.stat}
        >
          <View
            style={[
              styles.statIcon,

              {
                backgroundColor:
                  activity.transactions ===
                  0
                    ? ACTIVITY_COLORS
                        .surfaceStrong
                    : trend.type ===
                        "down"
                      ? ACTIVITY_COLORS
                          .downBackground
                      : ACTIVITY_COLORS
                          .upBackground,
              },
            ]}
          >
            <AppIcon
              name={
                activity.transactions ===
                0
                  ? "info"
                  : trend.type ===
                      "down"
                    ? "error"
                    : "success"
              }
              size="xs"
              color={
                activity.transactions ===
                0
                  ? Colors.textMuted
                  : trend.type ===
                      "down"
                    ? Colors.error
                    : Colors.success
              }
            />
          </View>

          <View
            style={
              styles.statContent
            }
          >
            <AppText
              variant="body"
              weight="bold"
              style={
                styles.statValue
              }
            >
              {activity.transactions >
              0
                ? trendLabel
                : "None"}
            </AppText>

            <AppText
              variant="caption"
              style={
                styles.statLabel
              }
            >
              Activity
            </AppText>
          </View>
        </View>
      </View>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <View
        style={styles.footer}
      >
        <View
          style={[
            styles.footerDot,

            {
              backgroundColor:
                activity.transactions >
                0
                  ? Colors.success
                  : Colors.textMuted,
            },
          ]}
        />

        <AppText
          variant="caption"
          style={
            styles.footerText
          }
        >
          Real accepted transactions from the last 30 days.
        </AppText>
      </View>
    </AppCard>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CARD
    ======================================================== */

    card: {
      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.sm,

      overflow: "hidden",

      borderWidth: 1,

      borderColor:
        ACTIVITY_COLORS.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        ACTIVITY_COLORS.card,
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
      flex: 1,

      minWidth: 0,

      flexDirection: "row",

      alignItems: "center",
    },

    iconBox: {
      width: 36,

      height: 36,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        ACTIVITY_COLORS.blueSoft,
    },

    headerText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    title: {
      color:
        ACTIVITY_COLORS
          .textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        ACTIVITY_COLORS
          .textSecondary,
    },

    period: {
      minWidth: 42,

      minHeight: 28,

      marginLeft:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      alignItems: "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        ACTIVITY_COLORS
          .blueBorder,

      borderRadius:
        FixxamTokens.radius.sm,

      backgroundColor:
        ACTIVITY_COLORS
          .surfaceStrong,
    },

    periodText: {
      color:
        ACTIVITY_COLORS
          .blueText,
    },

    /* ========================================================
       VALUE
    ======================================================== */

    valueRow: {
      marginTop:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems:
        "flex-end",

      justifyContent:
        "space-between",
    },

    valueContent: {
      flex: 1,

      minWidth: 0,
    },

    valueLabel: {
      color:
        ACTIVITY_COLORS
          .textSecondary,
    },

    value: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        ACTIVITY_COLORS
          .textPrimary,
    },

    /* ========================================================
       TREND
    ======================================================== */

    trendBadge: {
      minHeight: 28,

      marginLeft:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexShrink: 0,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xxs,

      borderWidth: 1,

      borderRadius:
        FixxamTokens.radius.sm,
    },

    trendText: {
      letterSpacing: 0.3,
    },

    /* ========================================================
       CHART
    ======================================================== */

    chartContainer: {
      height: 105,

      marginTop:
        FixxamTokens.spacing.sm,

      position: "relative",

      overflow: "hidden",

      borderWidth: 1,

      borderColor:
        ACTIVITY_COLORS
          .surfaceStrong,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        ACTIVITY_COLORS.chart,
    },

    grid: {
      ...StyleSheet.absoluteFillObject,

      paddingVertical:
        FixxamTokens.spacing.sm,

      justifyContent:
        "space-between",
    },

    gridLine: {
      width: "100%",

      borderTopWidth: 1,

      borderTopColor:
        ACTIVITY_COLORS.grid,

      opacity: 0.8,
    },

    barsContainer: {
      position: "absolute",

      left:
        FixxamTokens.spacing.xs,

      right:
        FixxamTokens.spacing.xs,

      bottom:
        FixxamTokens.spacing.xs,

      height: 82,

      flexDirection: "row",

      alignItems:
        "flex-end",

      justifyContent:
        "space-between",
    },

    barColumn: {
      flex: 1,

      height: 82,

      marginHorizontal: 1,

      alignItems: "center",

      justifyContent:
        "flex-end",
    },

    bar: {
      width: "75%",

      minWidth: 2,

      borderRadius:
        FixxamTokens.radius.xs,
    },

    emptyChart: {
      flex: 1,

      alignItems: "center",

      justifyContent:
        "center",
    },

    emptyChartText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        ACTIVITY_COLORS
          .textMuted,
    },

    chartLabels: {
      marginTop:
        FixxamTokens.spacing.xxs,

      flexDirection: "row",

      justifyContent:
        "space-between",
    },

    chartLabel: {
      color:
        ACTIVITY_COLORS
          .textMuted,
    },

    /* ========================================================
       STATS
    ======================================================== */

    statsRow: {
      marginTop:
        FixxamTokens.spacing.sm,

      paddingTop:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      gap:
        FixxamTokens.spacing.sm,

      borderTopWidth: 1,

      borderTopColor:
        ACTIVITY_COLORS.grid,
    },

    stat: {
      flex: 1,

      minHeight: 46,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        ACTIVITY_COLORS.grid,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        ACTIVITY_COLORS.surface,
    },

    statIcon: {
      width: 30,

      height: 30,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.sm,

      backgroundColor:
        ACTIVITY_COLORS.blueSoft,
    },

    statContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.xs,
    },

    statValue: {
      color:
        ACTIVITY_COLORS
          .textPrimary,
    },

    statLabel: {
      color:
        ACTIVITY_COLORS
          .textSecondary,
    },

    /* ========================================================
       FOOTER
    ======================================================== */

    footer: {
      marginTop:
        FixxamTokens.spacing.sm,

      paddingTop:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

      borderTopWidth: 1,

      borderTopColor:
        ACTIVITY_COLORS.grid,
    },

    footerDot: {
      width: 6,

      height: 6,

      flexShrink: 0,

      marginRight:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,
    },

    footerText: {
      flex: 1,

      minWidth: 0,

      lineHeight: 12,

      color:
        ACTIVITY_COLORS
          .textMuted,
    },
  });