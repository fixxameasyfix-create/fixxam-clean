import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  StyleSheet,
  View,
} from "react-native";

import { AppText } from "@/components/ui";
import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

type Props = {
  serviceName: string;
  serviceImageUrl?: string | null;
  servicePrice: string;
  requestedDate: string;
  requestedTime: string;
};

const validImage = (url?: string | null) =>
  typeof url === "string" &&
  /^https:\/\//i.test(url.trim())
    ? url.trim()
    : null;

export default function ServiceScheduleCard({
  serviceName,
  serviceImageUrl,
  servicePrice,
  requestedDate,
  requestedTime,
}: Props) {
  const image = validImage(serviceImageUrl);

  return (
    <View style={styles.card}>
      {/* SERVICE */}
      <View style={styles.serviceRow}>
        <View style={styles.imageBox}>
          {image ? (
            <Image
              source={{ uri: image }}
              style={styles.image}
            />
          ) : (
            <Ionicons
              name="construct-outline"
              size={25}
              color={CustomerColors.primary}
            />
          )}
        </View>

        <View style={styles.serviceInfo}>
          <AppText
            variant="caption"
            tone="secondary"
          >
            Service
          </AppText>

          <AppText
            numberOfLines={2}
            style={styles.serviceName}
          >
            {serviceName || "Service"}
          </AppText>
        </View>

        <View style={styles.priceBox}>
          <AppText
            variant="caption"
            tone="secondary"
          >
            Starting price
          </AppText>

          <AppText
            weight="bold"
            style={styles.price}
          >
            {servicePrice}
          </AppText>
        </View>
      </View>

      <View style={styles.divider} />

      {/* DATE + TIME */}
      <View style={styles.scheduleRow}>
        <ScheduleItem
          icon="calendar-outline"
          label="Preferred date"
          value={requestedDate}
        />

        <View style={styles.verticalDivider} />

        <ScheduleItem
          icon="time-outline"
          label="Preferred time"
          value={requestedTime}
        />
      </View>
    </View>
  );
}

function ScheduleItem({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<
    typeof Ionicons
  >["name"];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.scheduleItem}>
      <Ionicons
        name={icon}
        size={21}
        color={CustomerColors.primary}
      />

      <View style={styles.scheduleText}>
        <AppText
          variant="caption"
          tone="secondary"
        >
          {label}
        </AppText>

        <AppText
          numberOfLines={2}
          style={styles.value}
        >
          {value || "Unavailable"}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: FixxamTokens.radius.card,
    backgroundColor: Colors.surface,
    overflow: "hidden",
  },

  serviceRow: {
    minHeight: 80,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },

  imageBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  serviceInfo: {
    flex: 1,
    marginLeft: 10,
    minWidth: 0,
  },

  serviceName: {
    marginTop: 2,
    fontSize: 16,
  },

  priceBox: {
    alignItems: "flex-end",
    marginLeft: 8,
  },

  price: {
    marginTop: 2,
    fontSize: 16,
    color: CustomerColors.primary,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 12,
    backgroundColor: Colors.border,
  },

  scheduleRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },

  scheduleItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  scheduleText: {
    flex: 1,
    marginLeft: 8,
    minWidth: 0,
  },

  value: {
    marginTop: 2,
    fontSize: 15,
  },

  verticalDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    marginHorizontal: 10,
    backgroundColor: Colors.border,
  },
});