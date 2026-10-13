import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  subscribeToSavedWorkers,
  unsaveWorker,
} from "@/services/customer-saved/savedWorkers";

type SavedWorker = {
  id: string;
  workerId: string;
  customerId: string;
  workerName?: string;
  workerPhotoUrl?: string;
  customerName?: string;
  customerPhotoUrl?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

function formatSavedTime(value: unknown): string {
  if (!value) return "";

  let timestamp = 0;

  if (
    typeof value === "object" &&
    value !== null &&
    "toMillis" in value &&
    typeof (value as { toMillis?: unknown }).toMillis === "function"
  ) {
    timestamp = (
      value as {
        toMillis: () => number;
      }
    ).toMillis();
  }

  if (value instanceof Date) {
    timestamp = value.getTime();
  }

  if (!timestamp) return "";

  const difference = Math.max(0, Date.now() - timestamp);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (difference < minute) {
    return "Now";
  }

  if (difference < hour) {
    return `${Math.floor(difference / minute)}m ago`;
  }

  if (difference < day) {
    return `${Math.floor(difference / hour)}h ago`;
  }

  const days = Math.floor(difference / day);

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Date(timestamp).toLocaleDateString();
}

export default function SavedWorkersScreen() {
  const router = useRouter();

  const [workers, setWorkers] = useState<SavedWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const subscribe = useCallback(() => {
    setError(null);

    return subscribeToSavedWorkers(
      (savedWorkers) => {
        setWorkers(savedWorkers);
        setLoading(false);
        setRefreshing(false);
      },
      () => {
        setError("Unable to load your saved workers.");
        setLoading(false);
        setRefreshing(false);
      }
    );
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe();

    return () => {
      unsubscribe?.();
    };
  }, [subscribe]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setError(null);

    subscribe();
  }, [subscribe]);

  const handleRemove = useCallback(
    async (worker: SavedWorker) => {
      if (removingId) return;

      try {
        setRemovingId(worker.id);

        await unsaveWorker(worker.workerId);

        setWorkers((current) =>
          current.filter((item) => item.id !== worker.id)
        );
      } catch {
        setError(
          "Unable to remove this worker. Please try again."
        );
      } finally {
        setRemovingId(null);
      }
    },
    [removingId]
  );

  const renderWorker = ({
    item,
  }: {
    item: SavedWorker;
  }) => {
    const isRemoving = removingId === item.id;

    const hasPhoto =
      typeof item.workerPhotoUrl === "string" &&
      (item.workerPhotoUrl.startsWith("http://") ||
        item.workerPhotoUrl.startsWith("https://"));

    return (
      <View style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.workerContent}
          onPress={() =>
            router.push({
              pathname:
                "/(customer)/details/worker-profile/[id]",
              params: {
                id: item.workerId,
              },
            })
          }
        >
          {hasPhoto ? (
            <Image
              source={{
                uri: item.workerPhotoUrl,
              }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Ionicons
                name="person"
                size={27}
                color="#60A5FA"
              />
            </View>
          )}

          <View style={styles.info}>
            <Text
              style={styles.name}
              numberOfLines={1}
            >
              {item.workerName || "Saved Worker"}
            </Text>

            <Text
              style={styles.subtitle}
              numberOfLines={1}
            >
              Tap to view worker profile
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.rightContent}>
          {item.createdAt ? (
            <Text style={styles.time} numberOfLines={1}>
              {formatSavedTime(item.createdAt)}
            </Text>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.7}
            disabled={isRemoving}
            style={styles.removeButton}
            onPress={() => handleRemove(item)}
          >
            {isRemoving ? (
              <ActivityIndicator
                size="small"
                color="#60A5FA"
              />
            ) : (
              <Ionicons
                name="bookmark"
                size={21}
                color="#60A5FA"
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#60A5FA"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Saved</Text>

          <Text style={styles.description}>
            Workers you saved for later.
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {workers.length}
          </Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={22}
              color="#DC2626"
            />
          </View>

          <Text style={styles.errorText}>
            {error}
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleRefresh}
          >
            <Text style={styles.retryText}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={workers}
        keyExtractor={(item) => item.id}
        renderItem={renderWorker}
        contentContainerStyle={[
          styles.listContent,
          workers.length === 0 && styles.emptyList,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#60A5FA"
          />
        }
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          workers.length > 0 ? (
            <View style={styles.summary}>
              <View style={styles.summaryIcon}>
                <Ionicons
                  name="bookmark"
                  size={27}
                  color="#60A5FA"
                />
              </View>

              <View style={styles.summaryContent}>
                <Text style={styles.summaryTitle}>
                  {workers.length}{" "}
                  {workers.length === 1
                    ? "worker"
                    : "workers"}
                </Text>

                <Text style={styles.summarySubtitle}>
                  saved for later
                </Text>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="bookmark-outline"
                size={35}
                color="#60A5FA"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No saved workers yet
            </Text>

            <Text style={styles.emptyDescription}>
              Save workers you trust so you can easily
              find them again later.
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.browseButton}
              onPress={() => router.back()}
            >
              <Text style={styles.browseButtonText}>
                Browse Workers
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#172033",
  },

  description: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748B",
  },

  countBadge: {
    minWidth: 44,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF5FF",
  },

  countText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#3B82F6",
  },

  summary: {
    minHeight: 82,
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCEEFF",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },

  summaryIcon: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#EAF5FF",
  },

  summaryContent: {
    flex: 1,
    marginLeft: 14,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#172033",
  },

  summarySubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748B",
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  emptyList: {
    flexGrow: 1,
  },

  card: {
    marginBottom: 12,
    minHeight: 78,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCEEFF",
  },

  workerContent: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 54,
    height: 54,
    flexShrink: 0,
    borderRadius: 27,
    backgroundColor: "#EAF5FF",
  },

  avatarFallback: {
    width: 54,
    height: 54,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 27,
    backgroundColor: "#EAF5FF",
  },

  info: {
    flex: 1,
    minWidth: 0,
    marginLeft: 13,
  },

  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#172033",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 13,
    color: "#60A5FA",
    fontWeight: "500",
  },

  rightContent: {
    flexShrink: 0,
    marginLeft: 8,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  time: {
    marginBottom: 5,
    fontSize: 12,
    color: "#94A3B8",
  },

  removeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF5FF",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 80,
  },

  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF5FF",
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#172033",
    textAlign: "center",
  },

  emptyDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
    textAlign: "center",
  },

  browseButton: {
    marginTop: 20,
    paddingHorizontal: 22,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#172033",
  },

  browseButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  errorContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  errorIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
  },

  errorText: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    fontSize: 13,
    color: "#991B1B",
  },

  retryText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#DC2626",
  },
});