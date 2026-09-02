import React, {
  useMemo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppCard,
  AppText,
} from "@/components/ui";

import {
  calculateFixxamActivityBasic,
  type FixxamActivityBooking,
} from "@/utils/fixxam/calculateFixxamActivity";

/* ============================================================
   TYPES
============================================================ */

type FixxamActivityProps = {
  bookings: FixxamActivityBooking[];
};

type DailyActivity = {
  date: Date;
  volume: number;
};

type TrendType =
  | "up"
  | "down"
  | "flat";

/* ============================================================
   CONSTANTS
============================================================ */

const ACTIVITY_DAYS = 30;

const GREEN = "#22C55E";
const RED = "#EF4444";
const BLUE = "#2563EB";

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

        return date instanceof Date &&
          !Number.isNaN(
            date.getTime(),
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
      const milliseconds =
        data.seconds * 1000 +
        (typeof data.nanoseconds ===
        "number" &&
        Number.isFinite(
          data.nanoseconds,
        )
          ? data.nanoseconds /
            1_000_000
          : 0);

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
   FINAL PRICE
============================================================ */

function getFinalAmount(
  booking: FixxamActivityBooking,
): number {
  if (
    typeof booking.agreedPrice ===
      "number" &&
    Number.isFinite(
      booking.agreedPrice,
    ) &&
    booking.agreedPrice > 0
  ) {
    return booking.agreedPrice;
  }

  if (
    typeof booking.amount ===
      "number" &&
    Number.isFinite(
      booking.amount,
    ) &&
    booking.amount > 0
  ) {
    return booking.amount;
  }

  if (
    typeof booking.offerAmount ===
      "number" &&
    Number.isFinite(
      booking.offerAmount,
    ) &&
    booking.offerAmount > 0
  ) {
    return booking.offerAmount;
  }

  return 0;
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
    ).padStart(2, "0"),
    String(
      date.getDate(),
    ).padStart(2, "0"),
  ].join("-");
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
   BUILD DAILY ACTIVITY
============================================================ */

function buildDailyActivity(
  bookings: FixxamActivityBooking[],
): DailyActivity[] {
  const now =
    new Date();

  const today =
    startOfDay(now);

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

  for (const booking of bookings) {
    if (
      booking.status
        ?.trim()
        .toLowerCase() !==
      "accepted"
    ) {
      continue;
    }

    const acceptedAt =
      getDateValue(
        booking.offerAcceptedAt,
      );

    const createdAt =
      getDateValue(
        booking.createdAt,
      );

    const date =
      acceptedAt ??
      createdAt;

    if (!date) {
      continue;
    }

    const normalizedDate =
      startOfDay(date);

    const key =
      getDayKey(
        normalizedDate,
      );

    if (!dailyMap.has(key)) {
      continue;
    }

    const amount =
      getFinalAmount(
        booking,
      );

    if (
      amount <= 0
    ) {
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
  activity: DailyActivity[],
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

  if (
    previous <= 0
  ) {
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

  if (
    percentage > 0
  ) {
    return {
      type: "up",
      percentage,
    };
  }

  if (
    percentage < 0
  ) {
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
      amount / 1_000_000
    ).toFixed(
      amount >=
        10_000_000
        ? 0
        : 1,
    )}M`;
  }

  if (
    amount >=
    1_000
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
   TREND COLORS
============================================================ */

function getTrendColor(
  trend: TrendType,
): string {
  switch (trend) {
    case "up":
      return GREEN;

    case "down":
      return RED;

    default:
      return "#94A3B8";
  }
}

/* ============================================================
   TREND LABEL
============================================================ */

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

/* ============================================================
   CHART
============================================================ */

function ActivityChart({
  activity,
}: {
  activity: DailyActivity[];
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

  if (!hasActivity) {
    return (
      <View
        style={
          styles.chartContainer
        }
      >
        <View
          style={
            styles.grid
          }
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

        <View
          style={
            styles.emptyChart
          }
        >
          <Ionicons
            name="pulse-outline"
            size={17}
            color="#334155"
          />

          <AppText
            style={
              styles.emptyChartText
            }
          >
            No transaction activity
          </AppText>
        </View>
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
        pointerEvents="none"
        style={
          styles.grid
        }
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
                ? GREEN
                : isDown
                  ? RED
                  : "#64748B";

            const height =
              item.volume >
              0
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
    </View>
  );
}

/* ============================================================
   COMPONENT
============================================================ */

export default function FixxamActivity({
  bookings,
}: FixxamActivityProps) {
  const activity =
    useMemo(
      () =>
        calculateFixxamActivityBasic(
          bookings,
        ),
      [bookings],
    );

  const dailyActivity =
    useMemo(
      () =>
        buildDailyActivity(
          bookings,
        ),
      [bookings],
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

  const trendIcon =
    trend.type === "up"
      ? "trending-up-outline"
      : trend.type === "down"
        ? "trending-down-outline"
        : "remove-outline";

  const formattedVolume =
    formatMoney(
      activity.volume,
    );

  const firstDate =
    dailyActivity[0]
      ?.date;

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

  const middleDate =
    dailyActivity[
      Math.floor(
        dailyActivity.length /
          2,
      )
    ]?.date;

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

  return (
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
              styles.iconBox
            }
          >
            <Ionicons
              name="pulse-outline"
              size={19}
              color="#60A5FA"
            />
          </View>

          <View
            style={
              styles.headerText
            }
          >
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
              Service transaction analysis
            </AppText>
          </View>
        </View>

        <View
          style={
            styles.period
          }
        >
          <AppText
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
        <View>
          <AppText
            style={
              styles.valueLabel
            }
          >
            Transaction Volume
          </AppText>

          <AppText
            weight="bold"
            style={
              styles.value
            }
          >
            {formattedVolume}
          </AppText>
        </View>

        <View
          style={[
            styles.trendBadge,
            {
              borderColor:
                trendColor,
              backgroundColor:
                trend.type ===
                "up"
                  ? "#052E16"
                  : trend.type ===
                      "down"
                    ? "#450A0A"
                    : "#111827",
            },
          ]}
        >
          <Ionicons
            name={
              trendIcon as keyof typeof Ionicons.glyphMap
            }
            size={11}
            color={
              trendColor
            }
          />

          <AppText
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
          style={
            styles.chartLabel
          }
        >
          {firstLabel}
        </AppText>

        <AppText
          style={
            styles.chartLabel
          }
        >
          {middleLabel}
        </AppText>

        <AppText
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
        <View
          style={
            styles.stat
          }
        >
          <View
            style={
              styles.statIcon
            }
          >
            <Ionicons
              name="swap-horizontal-outline"
              size={14}
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
            >
              {activity.transactions.toLocaleString(
                "en-NG",
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
        </View>

        <View
          style={
            styles.stat
          }
        >
          <View
            style={[
              styles.statIcon,
              {
                backgroundColor:
                  trend.type ===
                  "up"
                    ? "#052E16"
                    : trend.type ===
                        "down"
                      ? "#450A0A"
                      : "#052E16",
              },
            ]}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={14}
              color={
                trend.type ===
                "down"
                  ? RED
                  : GREEN
              }
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
            >
              {activity.transactions >
              0
                ? trendLabel
                : "None"}
            </AppText>

            <AppText
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
        style={
          styles.footer
        }
      >
        <View
          style={[
            styles.footerDot,
            {
              backgroundColor:
                activity.transactions >
                0
                  ? GREEN
                  : "#94A3B8",
            },
          ]}
        />

        <AppText
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
    card: {
      marginTop: 14,
      padding: 11,
      borderRadius: 17,
      backgroundColor:
        "#050505",
      borderWidth: 1,
      borderColor:
        "#1E293B",
      overflow: "hidden",
    },

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
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor:
        "#172554",
      alignItems: "center",
      justifyContent:
        "center",
    },

    headerText: {
      flex: 1,
      minWidth: 0,
      marginLeft: 8,
    },

    title: {
      fontSize: 13,
      color: "#F8FAFC",
    },

    subtitle: {
      marginTop: 1,
      fontSize: 8.5,
      color: "#64748B",
    },

    period: {
      marginLeft: 8,
      minWidth: 42,
      height: 25,
      paddingHorizontal: 7,
      borderRadius: 8,
      backgroundColor:
        "#0F172A",
      borderWidth: 1,
      borderColor:
        "#1E3A8A",
      alignItems: "center",
      justifyContent:
        "center",
    },

    periodText: {
      fontSize: 8,
      color: "#60A5FA",
    },

    valueRow: {
      marginTop: 13,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent:
        "space-between",
    },

    valueLabel: {
      fontSize: 8.5,
      color: "#64748B",
    },

    value: {
      marginTop: 1,
      fontSize: 23,
      lineHeight: 27,
      color: "#F8FAFC",
    },

    trendBadge: {
      minHeight: 26,
      marginLeft: 8,
      paddingHorizontal: 7,
      borderRadius: 8,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 3,
    },

    trendText: {
      fontSize: 7,
      letterSpacing: 0.3,
    },

    chartContainer: {
      height: 105,
      marginTop: 11,
      position: "relative",
      overflow: "hidden",
      borderRadius: 11,
      backgroundColor:
        "#070B11",
      borderWidth: 1,
      borderColor:
        "#111827",
    },

    grid: {
      ...StyleSheet.absoluteFillObject,
      paddingVertical: 9,
      justifyContent:
        "space-between",
    },

    gridLine: {
      width: "100%",
      borderTopWidth: 1,
      borderTopColor:
        "#172033",
      opacity: 0.8,
    },

    barsContainer: {
      position: "absolute",
      left: 5,
      right: 5,
      bottom: 7,
      height: 82,
      flexDirection: "row",
      alignItems: "flex-end",
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
      borderRadius: 2,
    },

    emptyChart: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
    },

    emptyChartText: {
      marginTop: 4,
      fontSize: 8,
      color: "#475569",
    },

    chartLabels: {
      marginTop: 3,
      flexDirection: "row",
      justifyContent:
        "space-between",
    },

    chartLabel: {
      fontSize: 7,
      color: "#475569",
    },

    statsRow: {
      marginTop: 9,
      paddingTop: 9,
      borderTopWidth: 1,
      borderTopColor:
        "#172033",
      flexDirection: "row",
      gap: 7,
    },

    stat: {
      flex: 1,
      minHeight: 43,
      paddingHorizontal: 7,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor:
        "#0B1018",
      borderWidth: 1,
      borderColor:
        "#172033",
      flexDirection: "row",
      alignItems: "center",
    },

    statIcon: {
      width: 27,
      height: 27,
      borderRadius: 8,
      backgroundColor:
        "#172554",
      alignItems: "center",
      justifyContent:
        "center",
    },

    statContent: {
      flex: 1,
      minWidth: 0,
      marginLeft: 6,
    },

    statValue: {
      fontSize: 11.5,
      color: "#F8FAFC",
    },

    statLabel: {
      marginTop: 0,
      fontSize: 7.5,
      color: "#64748B",
    },

    footer: {
      marginTop: 8,
      paddingTop: 7,
      borderTopWidth: 1,
      borderTopColor:
        "#172033",
      flexDirection: "row",
      alignItems: "center",
    },

    footerDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 5,
    },

    footerText: {
      flex: 1,
      fontSize: 7.5,
      lineHeight: 11,
      color: "#475569",
    },
  });