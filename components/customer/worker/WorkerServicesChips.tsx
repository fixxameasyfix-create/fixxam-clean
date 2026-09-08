import React, {
  memo,
  useMemo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Service = {
  id?: string;

  name: string;
};

type Props = {
  services?: Service[];

  maxItems?: number;
};

type NormalizedService = {
  key: string;

  name: string;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value.trim();
}

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerServices({
  services = [],
  maxItems = 4,
}: Props) {
  /* ============================================================
     NORMALIZE
  ============================================================ */

  const normalizedServices =
    useMemo<
      NormalizedService[]
    >(() => {
      return services.reduce<
        NormalizedService[]
      >(
        (
          items,
          service,
          index,
        ) => {
          const name =
            cleanString(
              service.name,
            );

          if (
            !name
          ) {
            return items;
          }

          const id =
            cleanString(
              service.id,
            );

          items.push({
            key:
              id ||
              `${name}-${index}`,

            name,
          });

          return items;
        },
        [],
      );
    }, [
      services,
    ]);

  const safeMaxItems =
    Number.isFinite(
      maxItems,
    )
      ? Math.max(
          0,
          Math.floor(
            maxItems,
          ),
        )
      : 4;

  const visibleServices =
    normalizedServices.slice(
      0,
      safeMaxItems,
    );

  const remaining =
    Math.max(
      0,
      normalizedServices.length -
        visibleServices.length,
    );

  /* ============================================================
     EMPTY
  ============================================================ */

  if (
    normalizedServices.length ===
    0
  ) {
    return null;
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View
      style={
        styles.container
      }
    >
      {visibleServices.map(
        (
          service,
        ) => (
          <View
            key={
              service.key
            }
            style={
              styles.chip
            }
          >
            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.text
              }
            >
              {service.name}
            </AppText>
          </View>
        ),
      )}

      {remaining > 0 ? (
        <View
          accessibilityLabel={`${remaining} more services`}
          style={
            styles.moreChip
          }
        >
          <AppText
            variant="caption"
            weight="bold"
            numberOfLines={1}
            style={
              styles.moreText
            }
          >
            +{remaining}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       SERVICE CHIP
    ======================================================== */

    chip: {
      maxWidth: "100%",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        Colors.disabledBackground,
    },

    text: {
      color:
        Colors.textSecondary,
    },

    /* ========================================================
       MORE
    ======================================================== */

    moreChip: {
      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      borderWidth: 1,

      borderColor:
        CustomerColors.primary,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    moreText: {
      color:
        CustomerColors.primary,
    },
  });

export default memo(
  WorkerServices,
);