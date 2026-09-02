import React, {
  useCallback,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router } from "expo-router";

import { AppText } from "@/components/ui";

import CategoryCard from "@/components/categories/CategoryCard";

import useRecommendedServices from "@/hooks/services/useRecommendedServices";

export default function RecommendedDealsScreen() {
  const {
    services,
    loading,
    refreshing,
    error,
    onRefresh,
  } =
    useRecommendedServices();

  const handleServicePress =
    useCallback(
      (serviceId: string) => {
        router.push({
          pathname:
            "/(customer)/details/workers/[id]",
          params: {
            id: serviceId,
          },
        });
      },
      [],
    );

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

          <AppText
            style={
              styles.loadingText
            }
          >
            Loading recommended services...
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
          onPress={() =>
            router.back()
          }
          style={
            styles.backButton
          }
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#0F172A"
          />
        </Pressable>

        <View
          style={styles.headerText}
        >
          <AppText
            weight="bold"
            style={styles.title}
          >
            Recommended Deals
          </AppText>

          <AppText
            style={styles.subtitle}
          >
            Discover services selected
            for today.
          </AppText>
        </View>
      </View>

      <View
        style={styles.dailyBanner}
      >
        <View
          style={
            styles.dailyIcon
          }
        >
          <Ionicons
            name="sparkles-outline"
            size={22}
            color="#7C3AED"
          />
        </View>

        <View
          style={styles.dailyContent}
        >
          <AppText
            weight="bold"
            style={
              styles.dailyTitle
            }
          >
            Today's Recommended Services
          </AppText>

          <AppText
            style={
              styles.dailyText
            }
          >
            We selected up to 10 services
            from Fixxam for today.
          </AppText>
        </View>
      </View>

      {error ? (
        <View
          style={styles.errorCard}
        >
          <Ionicons
            name="alert-circle-outline"
            size={22}
            color="#DC2626"
          />

          <AppText
            style={
              styles.errorText
            }
          >
            {error}
          </AppText>
        </View>
      ) : null}

      <FlatList
        data={services}
        keyExtractor={(item) =>
          item.id
        }
        renderItem={({ item }) => (
          <CategoryCard
            icon={item.icon}
            iconColor={item.color}
            backgroundColor={
              item.backgroundColor
            }
            title={item.name}
            onPress={() =>
              handleServicePress(
                item.id,
              )
            }
          />
        )}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={[
          styles.content,
          services.length === 0 &&
            styles.emptyContent,
        ]}
        ListEmptyComponent={
          <View
            style={styles.empty}
          >
            <View
              style={
                styles.emptyIcon
              }
            >
              <Ionicons
                name="sparkles-outline"
                size={38}
                color="#7C3AED"
              />
            </View>

            <AppText
              weight="bold"
              style={
                styles.emptyTitle
              }
            >
              No Recommended Services
            </AppText>

            <AppText
              center
              style={
                styles.emptyText
              }
            >
              There are no services available
              to recommend right now.
            </AppText>

            <Pressable
              onPress={onRefresh}
              style={
                styles.retryButton
              }
              accessibilityRole="button"
            >
              <AppText
                weight="bold"
                style={
                  styles.retryText
                }
              >
                TRY AGAIN
              </AppText>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#F8FAFC",
    },

    center: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal: 24,
    },

    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: "#64748B",
    },

    header: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 18,
    },

    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor:
        "#FFFFFF",
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 12,

      shadowColor: "#000000",
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: {
        width: 0,
        height: 2,
      },

      elevation: 2,
    },

    headerText: {
      flex: 1,
    },

    title: {
      fontSize: 24,
      lineHeight: 30,
      color: "#0F172A",
    },

    subtitle: {
      marginTop: 4,
      fontSize: 14,
      lineHeight: 21,
      color: "#64748B",
    },

    dailyBanner: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginHorizontal: 16,
      marginBottom: 14,
      padding: 14,
      borderRadius: 18,
      backgroundColor:
        "#F5F3FF",
    },

    dailyIcon: {
      width: 46,
      height: 46,
      borderRadius: 15,
      backgroundColor:
        "#FFFFFF",
      alignItems: "center",
      justifyContent:
        "center",
    },

    dailyContent: {
      flex: 1,
      marginLeft: 12,
    },

    dailyTitle: {
      fontSize: 15,
      color: "#4C1D95",
    },

    dailyText: {
      marginTop: 3,
      fontSize: 13,
      lineHeight: 18,
      color: "#6D28D9",
    },

    errorCard: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      marginHorizontal: 16,
      marginBottom: 14,
      padding: 14,
      borderRadius: 14,
      backgroundColor:
        "#FEF2F2",
    },

    errorText: {
      flex: 1,
      marginLeft: 8,
      fontSize: 14,
      lineHeight: 20,
      color: "#B91C1C",
    },

    content: {
      paddingHorizontal: 16,
      paddingBottom: 28,
      gap: 12,
    },

    emptyContent: {
      flexGrow: 1,
    },

    empty: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal: 30,
    },

    emptyIcon: {
      width: 76,
      height: 76,
      borderRadius: 22,
      backgroundColor:
        "#F5F3FF",
      alignItems: "center",
      justifyContent:
        "center",
      marginBottom: 18,
    },

    emptyTitle: {
      fontSize: 20,
      color: "#0F172A",
    },

    emptyText: {
      marginTop: 8,
      maxWidth: 300,
      fontSize: 14,
      lineHeight: 21,
      color: "#64748B",
    },

    retryButton: {
      marginTop: 20,
      paddingHorizontal: 22,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor:
        "#2563EB",
    },

    retryText: {
      fontSize: 13,
      color: "#FFFFFF",
    },
  });