import React from "react";

import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

type Props = {
  name?: string;
  photo?: string;
  unreadNotifications?: number;
  location?: string;
};

export default function WorkerHomeHeader({

  name = "Worker",

  photo,

  unreadNotifications = 0,

  location,

}: Props) {

const hour = new Date().getHours();

const greeting =
  hour >= 5 && hour < 12
    ? "Good Morning 👋"
    : hour >= 12 && hour < 17
      ? "Good Afternoon ☀️"
      : hour >= 17 && hour < 20
        ? "Good Evening 🌇"
        : "Good Night 🌙";

const subtitle =
  hour >= 5 && hour < 12
    ? "Ready to take new jobs today?"
    : hour >= 12 && hour < 17
      ? "Hope your day is going well."
      : hour >= 17 && hour < 20
        ? "Let's finish today's bookings strong."
        : "Time to review today's work.";

const dateTime = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "numeric",
  minute: "2-digit",
}).format(new Date());


  return (

    <View style={styles.container}>

      <View style={styles.left}>

        {
          photo ? (

            <Image

              source={{
                uri: photo,
              }}

              style={styles.avatar}

            />

          ) : (

            <View style={styles.placeholder}>

              <Ionicons
                name="person"
                size={28}
                color="#FF6B00"
              />

            </View>

          )
        }

        <View style={styles.info}>

          <AppText style={styles.greeting}>
  {greeting}
</AppText>

<AppText weight="bold" style={styles.name}>
  {name}
</AppText>

<AppText style={styles.subtitle}>
  {subtitle}
</AppText>

<View style={styles.metaRow}>
  <Ionicons name="calendar-outline" size={14} color="#64748B" />
  <AppText style={styles.metaText}>{dateTime}</AppText>
</View>

<View style={styles.metaRow}>
  <Ionicons name="location-outline" size={14} color="#64748B" />
  <AppText style={styles.metaText}>
    {location ?? "Location unavailable"}
  </AppText>
</View>

        </View>

      </View>

      <Pressable style={styles.notification}>

        <Ionicons
          name="notifications-outline"
          size={24}
          color="#FF6B00"
        />

        {
          unreadNotifications > 0 && (

            <View style={styles.badge}>

              <AppText style={styles.badgeText}>
                {
                  unreadNotifications > 9
                    ? "9+"
                    : unreadNotifications
                }
              </AppText>

            </View>

          )
        }

      </Pressable>

    </View>

  );

}

const styles = StyleSheet.create({

  container: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 20,

  },

  left: {

    flexDirection: "row",

    alignItems: "center",

    flex: 1,

  },

  avatar: {

    width: 56,

    height: 56,

    borderRadius: 28,

  },

  placeholder: {

    width: 56,

    height: 56,

    borderRadius: 28,

    backgroundColor: "#FFF7ED",

    justifyContent: "center",

    alignItems: "center",

  },

  info: {

    marginLeft: 14,

    flex: 1,

  },

  greeting: {

    color: "#64748B",

    fontSize: 14,

  },

  name: {

    fontSize: 22,

    color: "#0F172A",

    marginTop: 2,

  },

  notification: {

    width: 50,

    height: 50,

    borderRadius: 25,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",

    alignItems: "center",

    elevation: 3,

  },

  badge: {

    position: "absolute",

    top: 6,

    right: 6,

    minWidth: 18,

    height: 18,

    borderRadius: 9,

    backgroundColor: "#EF4444",

    justifyContent: "center",

    alignItems: "center",

    paddingHorizontal: 4,

  },

  badgeText: {

    color: "#FFFFFF",

    fontSize: 10,

    fontWeight: "700",

  },

 subtitle: {
  fontSize: 13,
  color: "#64748B",
  marginTop: 2,
},

metaRow: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 6,
},

metaText: {
  marginLeft: 6,
  fontSize: 12,
  color: "#64748B",
},

});