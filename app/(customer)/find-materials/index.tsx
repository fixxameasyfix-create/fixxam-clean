import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { router } from "expo-router";

import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "@/firebase/config";
import { AppText } from "@/components/ui";
import { CustomerColors } from "@/theme/customerColors";
import {
  FixxamColors,
  FixxamTokens,
} from "@/theme/fixxamtokens";

type Service = {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  backgroundColor?: string;
  aliases?: string[];
  keywords?: string[];
  tags?: string[];
};

function normalizeSearchText(
  value: unknown,
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ");
}

function normalizeStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter(
          (item): item is string =>
            typeof item === "string",
        )
        .map(normalizeSearchText)
        .filter(Boolean),
    ),
  );
}

function getServiceIcon(
  icon?: string,
): keyof typeof MaterialCommunityIcons.glyphMap {
  if (
    icon &&
    icon in MaterialCommunityIcons.glyphMap
  ) {
    return icon as keyof typeof MaterialCommunityIcons.glyphMap;
  }

  return "tools";
}

function getSearchTokens(
  value: string,
): string[] {
  return Array.from(
    new Set(
      normalizeSearchText(value)
        .split(" ")
        .filter(
          (token) => token.length >= 2,
        ),
    ),
  );
}

function matchesService(
  service: Service,
  searchQuery: string,
): boolean {
  const normalizedQuery =
    normalizeSearchText(searchQuery);

  if (!normalizedQuery) {
    return true;
  }

  const searchableText = [
    service.name,
    service.aliases?.join(" "),
    service.keywords?.join(" "),
    service.tags?.join(" "),
  ]
    .map(normalizeSearchText)
    .filter(Boolean)
    .join(" ");

  if (
    searchableText.includes(
      normalizedQuery,
    )
  ) {
    return true;
  }

  const tokens =
    getSearchTokens(normalizedQuery);

  if (!tokens.length) {
    return false;
  }

  return tokens.every((token) =>
    searchableText.includes(token),
  );
}

export default function FindMaterialsServicesScreen() {
  const [services, setServices] =
    useState<Service[]>([]);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadServices =
    useCallback(async () => {
      try {
        setError(null);

        const servicesQuery = query(
          collection(db, "services"),
          orderBy("name", "asc"),
        );

        const snapshot =
          await getDocs(
            servicesQuery,
          );

        const result =
          snapshot.docs.reduce<
            Service[]
          >(
            (items, doc) => {
              const data =
                doc.data();

              const name =
                typeof data.name ===
                "string"
                  ? data.name.trim()
                  : "";

              if (!name) {
                return items;
              }

              items.push({
                id: doc.id,
                name,

                icon:
                  typeof data.icon ===
                    "string" &&
                  data.icon.trim()
                    ? data.icon.trim()
                    : undefined,

                color:
                  typeof data.color ===
                    "string" &&
                  data.color.trim()
                    ? data.color.trim()
                    : undefined,

                backgroundColor:
                  typeof data.backgroundColor ===
                    "string" &&
                  data.backgroundColor.trim()
                    ? data.backgroundColor.trim()
                    : undefined,

                aliases:
                  normalizeStringArray(
                    data.aliases,
                  ),

                keywords:
                  normalizeStringArray(
                    data.keywords,
                  ),

                tags:
                  normalizeStringArray(
                    data.tags,
                  ),
              });

              return items;
            },
            [],
          );

        setServices(result);
      } catch (loadError) {
        console.error(
          "FindMaterials services:",
          loadError,
        );

        setServices([]);

        setError(
          "Unable to load services. Please try again.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, []);

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  const handleRefresh =
    useCallback(() => {
      setRefreshing(true);
      void loadServices();
    }, [loadServices]);

  const filteredServices =
    useMemo(() => {
      if (!searchQuery.trim()) {
        return services;
      }

      return services.filter(
        (service) =>
          matchesService(
            service,
            searchQuery,
          ),
      );
    }, [
      services,
      searchQuery,
    ]);

  const handleClearSearch =
    useCallback(() => {
      setSearchQuery("");
    }, []);

  const handleServicePress =
    useCallback(
      (service: Service) => {
        router.push({
          pathname:
            "/(customer)/find-materials/[serviceId]",
          params: {
            serviceId: service.id,
            serviceName: service.name,
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
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={FixxamColors.customer}
          />

          <AppText
            style={styles.loadingText}
          >
            Loading services...
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
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={
              CustomerColors.textPrimary
            }
          />
        </Pressable>

        <View style={styles.headerText}>
          <AppText
            weight="bold"
            style={styles.title}
          >
            Choose a Service
          </AppText>

          <AppText
            style={styles.subtitle}
          >
            Select the service you need
            materials for.
          </AppText>
        </View>

        <View
          style={styles.headerPlaceholder}
        />
      </View>

      <View
        style={styles.searchContainer}
      >
        <Ionicons
          name="search-outline"
          size={21}
          color="#94A3B8"
        />

        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search services..."
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          accessibilityLabel="Search services"
        />

        {searchQuery.length > 0 ? (
          <Pressable
            onPress={handleClearSearch}
            style={styles.clearButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Ionicons
              name="close-circle"
              size={21}
              color="#94A3B8"
            />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View
          style={styles.errorContainer}
        >
          <View style={styles.errorIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={42}
              color={CustomerColors.error}
            />
          </View>

          <AppText
            weight="bold"
            style={styles.errorTitle}
          >
            Something went wrong
          </AppText>

          <AppText
            center
            style={styles.errorText}
          >
            {error}
          </AppText>

          <Pressable
            style={styles.retryButton}
            onPress={() =>
              void loadServices()
            }
            accessibilityRole="button"
            accessibilityLabel="Try again"
          >
            <AppText
              weight="bold"
              style={styles.retryText}
            >
              TRY AGAIN
            </AppText>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) =>
            item.id
          }
          refreshing={refreshing}
          onRefresh={handleRefresh}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.list
          }
          ListHeaderComponent={
            <View
              style={styles.listHeader}
            >
              <View
                style={styles.listHeaderIcon}
              >
                <Ionicons
                  name="construct-outline"
                  size={24}
                  color={
                    FixxamColors.customer
                  }
                />
              </View>

              <View
                style={styles.listHeaderText}
              >
                <AppText
                  weight="bold"
                  style={
                    styles.listHeaderTitle
                  }
                >
                  {searchQuery.trim()
                    ? `${filteredServices.length} ${
                        filteredServices.length ===
                        1
                          ? "Service"
                          : "Services"
                      } Found`
                    : "Available Services"}
                </AppText>

                <AppText
                  style={
                    styles.listHeaderDescription
                  }
                >
                  {searchQuery.trim()
                    ? `Results for "${searchQuery.trim()}"`
                    : "Choose a service to see matching materials."}
                </AppText>
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const icon =
              getServiceIcon(item.icon);

            const iconColor =
              item.color ||
              FixxamColors.customer;

            const iconBackground =
              item.backgroundColor ||
              CustomerColors.diagnosisBackground;

            return (
              <Pressable
                onPress={() =>
                  handleServicePress(
                    item,
                  )
                }
                style={({ pressed }) => [
                  styles.serviceCard,
                  pressed &&
                    styles.serviceCardPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Find materials for ${item.name}`}
              >
                <View
                  style={[
                    styles.serviceIcon,
                    {
                      backgroundColor:
                        iconBackground,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={icon}
                    size={25}
                    color={iconColor}
                  />
                </View>

                <View
                  style={styles.serviceContent}
                >
                  <AppText
                    weight="bold"
                    style={
                      styles.serviceName
                    }
                    numberOfLines={2}
                  >
                    {item.name}
                  </AppText>

                  <AppText
                    style={
                      styles.serviceDescription
                    }
                    numberOfLines={1}
                  >
                    View materials available
                    for this service
                  </AppText>
                </View>

                <View
                  style={styles.arrowButton}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={19}
                    color={
                      FixxamColors.customer
                    }
                  />
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View
                style={styles.emptyIcon}
              >
                <Ionicons
                  name={
                    searchQuery.trim()
                      ? "search-outline"
                      : "construct-outline"
                  }
                  size={46}
                  color="#94A3B8"
                />
              </View>

              <AppText
                weight="bold"
                style={styles.emptyTitle}
              >
                {searchQuery.trim()
                  ? "No Matching Services"
                  : "No Services Found"}
              </AppText>

              <AppText
                center
                style={styles.emptyText}
              >
                {searchQuery.trim()
                  ? `We couldn't find a service matching "${searchQuery.trim()}".`
                  : "There are no services available right now."}
              </AppText>

              {searchQuery.trim() ? (
                <Pressable
                  style={
                    styles.clearSearchButton
                  }
                  onPress={
                    handleClearSearch
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                >
                  <AppText
                    weight="bold"
                    style={
                      styles.clearSearchText
                    }
                  >
                    CLEAR SEARCH
                  </AppText>
                </Pressable>
              ) : null}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      CustomerColors.surface,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal:
      FixxamTokens.spacing.lg,
    paddingTop:
      FixxamTokens.spacing.sm,
    paddingBottom:
      FixxamTokens.spacing.md,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      CustomerColors.card,
    alignItems: "center",
    justifyContent: "center",
    ...FixxamTokens.shadow.card,
  },

  headerText: {
    flex: 1,
    marginHorizontal:
      FixxamTokens.spacing.md,
  },

  title: {
    fontSize: 21,
    color:
      CustomerColors.textPrimary,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 19,
    color:
      CustomerColors.textSecondary,
  },

  headerPlaceholder: {
    width: 42,
  },

  searchContainer: {
    height: 50,
    marginHorizontal:
      FixxamTokens.spacing.lg,
    marginBottom:
      FixxamTokens.spacing.md,
    paddingHorizontal:
      FixxamTokens.spacing.md,
    borderRadius:
      FixxamTokens.radius.md,
    backgroundColor:
      CustomerColors.card,
    borderWidth: 1,
    borderColor:
      CustomerColors.border,
    flexDirection: "row",
    alignItems: "center",
    ...FixxamTokens.shadow.card,
  },

  searchInput: {
    flex: 1,
    height: "100%",
    marginLeft: 9,
    paddingVertical: 0,
    fontSize: 14,
    color:
      CustomerColors.textPrimary,
  },

  clearButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  list: {
    paddingHorizontal:
      FixxamTokens.spacing.lg,
    paddingBottom: 40,
    flexGrow: 1,
  },

  listHeader: {
    marginBottom:
      FixxamTokens.spacing.md,
    padding:
      FixxamTokens.spacing.md,
    borderRadius:
      FixxamTokens.radius.lg,
    backgroundColor:
      CustomerColors.diagnosisBackground,
    flexDirection: "row",
    alignItems: "center",
  },

  listHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius:
      FixxamTokens.radius.sm,
    backgroundColor:
      CustomerColors.diagnosisBorder,
    alignItems: "center",
    justifyContent: "center",
  },

  listHeaderText: {
    flex: 1,
    marginLeft:
      FixxamTokens.spacing.sm,
  },

  listHeaderTitle: {
    fontSize: 15,
    color:
      CustomerColors.textPrimary,
  },

  listHeaderDescription: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 18,
    color:
      CustomerColors.textSecondary,
  },

  serviceCard: {
    minHeight: 68,
    marginBottom:
      FixxamTokens.spacing.sm,
    paddingHorizontal:
      FixxamTokens.spacing.md,
    paddingVertical: 9,
    borderRadius:
      FixxamTokens.radius.md,
    backgroundColor:
      CustomerColors.card,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEF2F7",
    ...FixxamTokens.shadow.card,
  },

  serviceCardPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },

  serviceIcon: {
    width: 46,
    height: 46,
    borderRadius:
      FixxamTokens.radius.sm,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  serviceContent: {
    flex: 1,
    marginLeft:
      FixxamTokens.spacing.md,
    paddingRight: 6,
  },

  serviceName: {
    fontSize: 15,
    lineHeight: 19,
    color:
      CustomerColors.textPrimary,
  },

  serviceDescription: {
    marginTop: 2,
    fontSize: 11.5,
    lineHeight: 17,
    color:
      CustomerColors.textSecondary,
  },

  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor:
      CustomerColors.diagnosisBackground,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingTop: 70,
  },

  emptyIcon: {
    width: 82,
    height: 82,
    borderRadius: 26,
    backgroundColor:
      CustomerColors.iconBackground,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 18,
    fontSize: 19,
    color:
      CustomerColors.textPrimary,
  },

  emptyText: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 20,
    color:
      CustomerColors.textSecondary,
  },

  clearSearchButton: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius:
      FixxamTokens.radius.sm,
    backgroundColor:
      FixxamColors.customer,
  },

  clearSearchText: {
    fontSize: 12,
    color: CustomerColors.white,
  },

  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  errorIcon: {
    width: 82,
    height: 82,
    borderRadius: 26,
    backgroundColor:
      CustomerColors.emergencyBackground,
    alignItems: "center",
    justifyContent: "center",
  },

  errorTitle: {
    marginTop: 16,
    fontSize: 19,
    color:
      CustomerColors.textPrimary,
  },

  errorText: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 20,
    color:
      CustomerColors.textSecondary,
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius:
      FixxamTokens.radius.sm,
    backgroundColor:
      FixxamColors.customer,
  },

  retryText: {
    fontSize: 12,
    color: CustomerColors.white,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color:
      CustomerColors.textSecondary,
  },
});