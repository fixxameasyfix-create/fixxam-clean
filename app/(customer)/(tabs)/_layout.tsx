import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function CustomerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#94A3B8",

        tabBarHideOnKeyboard: true,

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          marginBottom: 6,
        },

        tabBarStyle: {
          height: 74,
          paddingTop: 8,
          paddingBottom: 10,

          backgroundColor: "#FFFFFF",

          borderTopWidth: 0,

          elevation: 20,

          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 18,

          shadowOffset: {
            width: 0,
            height: -4,
          },
        },
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",

          tabBarIcon: ({
            focused,
            color,
            size,
          }) => (
            <Ionicons
              name={
                focused
                  ? "grid"
                  : "grid-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* BOOK */}
      <Tabs.Screen
        name="book"
        options={{
          title: "Book",

          tabBarIcon: ({
            focused,
            color,
            size,
          }) => (
            <Ionicons
              name={
                focused
                  ? "compass"
                  : "compass-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* ORDERS */}
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",

          tabBarIcon: ({
            focused,
            color,
            size,
          }) => (
            <Ionicons
              name={
                focused
                  ? "document-text"
                  : "document-text-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* MARKET */}
      <Tabs.Screen
        name="market"
        options={{
          title: "Market",

          tabBarIcon: ({
            focused,
            color,
            size,
          }) => (
            <Ionicons
              name={
                focused
                  ? "bag-handle"
                  : "bag-handle-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",

          tabBarIcon: ({
            focused,
            color,
            size,
          }) => (
            <Ionicons
              name={
                focused
                  ? "person-circle"
                  : "person-circle-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* HIDDEN ROUTE
          order-details ba tab bane ba */}
      <Tabs.Screen
        name="order-details"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}