import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import RoleGuard from "@/components/auth/RoleGuard";
import AuthGuard from "@/components/auth/AuthGuard";

export default function WorkerLayout() {
  return (
    <AuthGuard>
      <RoleGuard role="worker">
        <Tabs
          screenOptions={{
            headerShown: false,

            tabBarActiveTintColor: "#FF6B00",
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

              shadowColor: "#000000",
              shadowOpacity: 0.08,
              shadowRadius: 18,

              shadowOffset: {
                width: 0,
                height: -4,
              },
            },
          }}
        >
          {/* ====================================================
              HOME
          ==================================================== */}

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

          {/* ====================================================
              JOBS
              
              Hidden from bottom tabs.
              The route still exists and can be opened
              programmatically from Home / other screens.
          ==================================================== */}

          <Tabs.Screen
            name="jobs"
            options={{
              href: null,
            }}
          />

          {/* ====================================================
              ORDERS
          ==================================================== */}

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

          {/* ====================================================
              MY PRODUCTS
          ==================================================== */}

          <Tabs.Screen
            name="my-products"
            options={{
              title: "My Products",

              tabBarIcon: ({
                focused,
                color,
                size,
              }) => (
                <Ionicons
                  name={
                    focused
                      ? "storefront"
                      : "storefront-outline"
                  }
                  size={size}
                  color={color}
                />
              ),
            }}
          />

          {/* ====================================================
              PROFILE
          ==================================================== */}

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
        </Tabs>
      </RoleGuard>
    </AuthGuard>
  );
}