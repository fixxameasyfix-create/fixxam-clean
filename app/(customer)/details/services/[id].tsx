import React, { useCallback } from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import { AppText } from "@/components/ui";

import CategoryCard from "@/components/categories/CategoryCard";

import useServicesBySubcategory from "@/hooks/services/useServicesBySubcategory";

import type {
  ServiceCardData,
} from "@/firebase/mappers/serviceMapper";

/* ==============================================================
   SCREEN
============================================================== */

export default function ServicesScreen() {
  const {
    id,
    categoryId,
    reward,
  } =
    useLocalSearchParams<{
      id?: string;
      categoryId?: string;
      reward?: string;
    }>();

  const {
    services,
    loading,
    refreshing,
    onRefresh,
  } =
    useServicesBySubcategory(id);

  /* ============================================================
     OPEN WORKERS
  ============================================================ */

  const handleServicePress =
    useCallback(
      (service: ServiceCardData) => {
        const serviceId =
          service.id.trim();

        const serviceName =
          service.name.trim();

        if (!serviceId) {
          return;
        }

        if (!serviceName) {
          return;
        }

        /*
         * Keep the EXACT icon that came from
         * the selected service.
         */
        const serviceIcon =
          service.icon.trim();

        router.push({
          pathname:
            "/(customer)/details/workers/[id]",

          params: {
            /*
             * Route ID
             */
            id: serviceId,

            /*
             * Service ID
             */
            serviceId,

            /*
             * Service name
             */
            service: serviceName,

            /*
             * EXACT SERVICE ICON
             */
            ...(serviceIcon
              ? {
                  serviceIcon,
                }
              : {}),

            /*
             * Category
             */
            ...(categoryId
              ? {
                  categoryId,
                }
              : {}),

            /*
             * Reward
             */
            ...(reward
              ? {
                  reward,
                }
              : {}),
          },
        });
      },
      [categoryId, reward],
    );

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={styles.center}
        >
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />
        </View>
      </SafeAreaView>
    );
  }

  /* ============================================================
     SCREEN
  ============================================================ */

  return (
    <SafeAreaView
      style={styles.container}
    >
      {/* HEADER */}

      <View
        style={styles.header}
      >
        <Pressable
          style={styles.backButton}
          onPress={() =>
            router.back()
          }
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#0F172A"
          />
        </Pressable>

        <AppText
          weight="bold"
          style={styles.title}
        >
          Services
        </AppText>

        <View
          style={styles.placeholder}
        />
      </View>

      {/* SERVICES */}

      <FlatList
        data={services}
        keyExtractor={(item) =>
          item.id
        }
        renderItem={({
          item,
        }) => (
          <CategoryCard
            /*
             * EXACT SERVICE ICON
             */
            icon={item.icon}
            iconColor={
              item.color
            }
            backgroundColor={
              item.backgroundColor
            }
            title={item.name}
            onPress={() =>
              handleServicePress(
                item,
              )
            }
          />
        )}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
        ListEmptyComponent={
          <View
            style={styles.empty}
          >
            <Ionicons
              name="construct-outline"
              size={52}
              color="#CBD5E1"
            />

            <AppText
              weight="bold"
              style={
                styles.emptyTitle
              }
            >
              No Services Found
            </AppText>

            <AppText
              center
              style={
                styles.emptyText
              }
            >
              There are no services
              available in this
              category yet.
            </AppText>
          </View>
        }
      />
    </SafeAreaView>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#F8FAFC",
    },

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      paddingHorizontal: 16,

      paddingTop: 8,

      paddingBottom: 16,
    },

    backButton: {
      width: 40,
      height: 44,

      borderRadius: 22,

      backgroundColor:
        "#FFFFFF",

      justifyContent:
        "center",

      alignItems:
        "center",

      shadowColor:
        "#000000",

      shadowOpacity:
        0.08,

      shadowRadius: 6,

      shadowOffset: {
        width: 0,
        height: 2,
      },

      elevation: 2,
    },

    title: {
      fontSize: 22,
      color: "#0F172A",
    },

    placeholder: {
      width: 44,
    },

    content: {
      paddingHorizontal: 16,
      paddingBottom: 24,
      flexGrow: 1,
    },

    center: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    empty: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
      paddingTop: 80,
      paddingHorizontal: 30,
    },

    emptyTitle: {
      marginTop: 14,
      fontSize: 19,
      color: "#0F172A",
    },

    emptyText: {
      marginTop: 7,
      fontSize: 14,
      lineHeight: 21,
      color: "#64748B",
    },
  });