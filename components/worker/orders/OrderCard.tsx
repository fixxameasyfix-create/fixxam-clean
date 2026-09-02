import React from "react";

import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

import { getOrderStatus } from "@/constants/orderStatus";

export type JobStatus =
  | "pending_estimate"
  | "negotiating"
  | "accepted"
  | "on_the_way"
  | "arrived"
  | "in_progress"
  | "awaiting_cash"
  | "payment_pending_confirmation"
  | "completed"
  | "cancelled";


type Props = {
  image: string;

  title: string;

  subtitle: string;

  location: string;

  bookingDate: string;

  bookingTime: string;

  amount: number;

  status: JobStatus;

  onPress: () => void;
};

export default function OrderCard({
  image,
  title,
  subtitle,
  location,
  bookingDate,
  bookingTime,
  
  amount,
  status,
  onPress,
}: Props) {

  console.log("Order status:", status);
const badge = getOrderStatus(status);
  const imageSource = image;

  return (
  <TouchableOpacity
    activeOpacity={0.9}
    style={styles.card}
    onPress={onPress}
  >

    <View style={styles.header}>

  <View style={styles.left}>

    {imageSource ? (
      <Image
        source={{ uri: imageSource }}
        style={styles.avatar}
      />
    ) : (
      <View style={styles.avatarPlaceholder}>
        <Ionicons
          name="person"
          size={26}
          color="#2563EB"
        />
      </View>
    )}

    <View style={styles.content}>

      <AppText
        weight="bold"
        style={styles.customerName}
      >
        {subtitle}
      </AppText>

      <AppText style={styles.service}>
        {title}
      </AppText>

    </View>

  </View>

  <View style={styles.right}>
    <AppText
      weight="bold"
      style={styles.price}
    >
      ₦{amount.toLocaleString()}
    </AppText>
  </View>

</View>

    <View style={styles.divider} />

<View style={styles.footer}>

 <View
  style={[
    styles.badge,
    {backgroundColor: badge.backgroundColor,
borderColor: badge.textColor,},
  ]}
>
  <Ionicons
  name={badge.icon}
  size={14}
  color={badge.textColor}
/>

<AppText
  weight="bold"
  style={[
    styles.badgeText,
    {
      color: badge.textColor,
      marginLeft: 6,
    },
  ]}
>
  {badge.label}
</AppText>
</View>

  <View style={styles.meta}>
    <Ionicons
      name="location-outline"
      size={14}
      color="#64748B"
    />

    <AppText
      numberOfLines={1}
      style={styles.metaText}
    >
      {location}
    </AppText>
  </View>

  <View style={styles.meta}>
    <Ionicons
      name="calendar-outline"
      size={14}
      color="#64748B"
    />

    <AppText style={styles.metaText}>
      {bookingDate} • {bookingTime}
    </AppText>
  </View>

  <TouchableOpacity
    style={styles.arrowButton}
    activeOpacity={0.8}
    onPress={onPress}
  >
    <Ionicons
      name="chevron-forward"
      size={18}
      color="#2563EB"
    />
  </TouchableOpacity>

</View>
  </TouchableOpacity>
);
}

const styles = StyleSheet.create({
card: {
  backgroundColor: "#FFFFFF",
  borderRadius: 20,
  padding: 16,
  marginBottom: 16,

  borderWidth: 1,
  borderColor: "#EEF2F7",

  shadowColor: "#0F172A",
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.05,
  shadowRadius: 12,

  elevation: 3,
},


  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  left: {
    flexDirection: "row",
    flex: 1,
    marginRight: 12,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F1F5F9",
  },

avatarPlaceholder: {
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: "#EFF6FF",
  justifyContent: "center",
  alignItems: "center",
},

content: {
  flex: 1,
  marginLeft: 16,
  justifyContent: "center",
},

customerName: {
  fontSize: 17,
  color: "#0F172A",
},

service: {
  marginTop: 4,
  fontSize: 14,
  color: "#64748B",
},

right: {
  alignItems: "flex-end",
  justifyContent: "center",
},

price: {
  fontSize: 19,
  color: "#2563EB",
},

divider: {
  height: 1,
  backgroundColor: "#F1F5F9",
  marginVertical: 16,
},

footer: {
  position: "relative",
  paddingTop: 2,
},

badge: {
  alignSelf: "flex-start",
  paddingHorizontal: 14,
  paddingVertical: 7,
  borderRadius: 999,
  borderWidth: 1,
  justifyContent: "center",
  alignItems: "center",
},

badgeText: {
  fontSize: 12,
  letterSpacing: 0.4,
},

meta: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 10,
  paddingRight: 56,
},

metaText: {
  flex: 1,
  marginLeft: 8,
  fontSize: 13,
  color: "#64748B",
},

arrowButton: {
  position: "absolute",
  right: 0,
  bottom: 2,

  width: 42,
  height: 42,
  borderRadius: 21,

  backgroundColor: "#EFF6FF",
  borderWidth: 1,
  borderColor: "#DBEAFE",

  justifyContent: "center",
  alignItems: "center",
},

});