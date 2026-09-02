import React, { useCallback, useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import * as Location from "expo-location";

export default function GoodDealSectionScreen() {
  const router = useRouter();

  const { section } = useLocalSearchParams<{
    section?: string;
  }>();

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(
    null,
  );

  const isDiscountedServices =
    section === "discounted-services";

  const isLimitedOffers =
    section === "limited-offers";

  /*
   * Only these sections are currently supported
   * by this dynamic route.
   */
  const isValidSection =
    isDiscountedServices ||
    isLimitedOffers;

  /*
   * --------------------------------
   * FIND NEARBY WORKERS
   * --------------------------------
   */

  const handleClaim = useCallback(async () => {
    if (loading) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        setError(
          "Location permission is required to find workers near you.",
        );

        return;
      }

      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

      const {
        latitude,
        longitude,
      } = currentLocation.coords;

      router.push({
        pathname: "/nearby-workers",
        params: {
          source: "discounted-services",
          latitude: String(latitude),
          longitude: String(longitude),
          limit: "5",
        },
      });
    } catch (claimError) {
      console.error(
        "Nearby worker search failed:",
        claimError,
      );

      setError(
        "Unable to get your location. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [loading, router]);

  /*
   * --------------------------------
   * INVALID SECTION
   * --------------------------------
   */

  if (!isValidSection) {
    return (
      <View style={styles.center}>
        <Ionicons
          name="alert-circle-outline"
          size={44}
          color="#94A3B8"
        />

        <Text style={styles.errorTitle}>
          Deal not found
        </Text>

        <Text style={styles.errorText}>
          This deal section is not available.
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.backButtonLarge}
        >
          <Text style={styles.backButtonText}>
            GO BACK
          </Text>
        </Pressable>
      </View>
    );
  }

  /*
   * --------------------------------
   * LIMITED-TIME OFFERS
   * --------------------------------
   */

  if (isLimitedOffers) {
    return (
      <View style={styles.emptyContainer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
          onPress={() => router.back()}
          style={styles.emptyTopBackButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#0F172A"
          />
        </Pressable>

        <View style={styles.emptyContent}>
          <View style={styles.emptyIconBox}>
            <Ionicons
              name="time-outline"
              size={56}
              color="#7C3AED"
            />
          </View>

          <Text style={styles.emptyTitle}>
            No Limited-Time Offers
          </Text>

          <Text style={styles.emptyText}>
            There are no active limited-time
            offers available right now.
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.emptyBackButton,
              pressed &&
                styles.emptyBackButtonPressed,
            ]}
          >
            <Text style={styles.emptyBackButtonText}>
              GO BACK
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  /*
   * --------------------------------
   * DISCOUNTED SERVICES
   * --------------------------------
   */

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#0F172A"
          />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.title}>
            Get a Discount from a Nearby Worker
          </Text>

          <Text style={styles.subtitle}>
            Find nearby workers who may offer you
            a special discount.
          </Text>
        </View>
      </View>

      {/* MAIN OFFER CARD */}

      <View style={styles.offerCard}>
        {/* Icon */}

        <View style={styles.iconContainer}>
          <Ionicons
            name="pricetag-outline"
            size={36}
            color="#2563EB"
          />
        </View>

        {/* Title */}

        <Text style={styles.offerTitle}>
          You May Get a Special Discount
        </Text>

        {/* Description */}

        <Text style={styles.offerDescription}>
          Claim now to find workers near you who
          may offer you a better price for their
          services.
        </Text>

        {/* Location */}

        <View style={styles.locationBox}>
          <Ionicons
            name="location-outline"
            size={21}
            color="#2563EB"
          />

          <Text style={styles.locationText}>
            We'll use your location to find
            workers near you.
          </Text>
        </View>

        {/* Info */}

        <View style={styles.infoBox}>
          <Ionicons
            name="people-outline"
            size={21}
            color="#64748B"
          />

          <Text style={styles.infoText}>
            We'll show you the 5 closest workers
            so you can choose the one that's
            right for you.
          </Text>
        </View>

        {/* Error */}

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color="#DC2626"
            />

            <Text style={styles.errorMessage}>
              {error}
            </Text>
          </View>
        ) : null}

        {/* Claim */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Find nearby workers"
          disabled={loading}
          onPress={handleClaim}
          style={({ pressed }) => [
            styles.claimButton,
            pressed &&
              !loading &&
              styles.claimButtonPressed,
            loading &&
              styles.claimButtonDisabled,
          ]}
        >
          {loading ? (
            <>
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />

              <Text style={styles.claimText}>
                GETTING LOCATION...
              </Text>
            </>
          ) : (
            <>
              <Ionicons
                name="location-outline"
                size={21}
                color="#FFFFFF"
              />

              <Text style={styles.claimText}>
                FIND NEARBY WORKERS
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /*
   * --------------------------------
   * MAIN
   * --------------------------------
   */

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
    paddingTop: 54,
  },

  /*
   * --------------------------------
   * HEADER
   * --------------------------------
   */

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 28,
  },

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,

    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 3,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 16,
    lineHeight: 23,
    color: "#64748B",
  },

  /*
   * --------------------------------
   * OFFER CARD
   * --------------------------------
   */

  offerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,

    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 4,
  },

  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  offerTitle: {
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "800",
    color: "#0F172A",
  },

  offerDescription: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 24,
    color: "#64748B",
  },

  /*
   * --------------------------------
   * LOCATION
   * --------------------------------
   */

  locationBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
  },

  locationText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#2563EB",
  },

  /*
   * --------------------------------
   * INFO
   * --------------------------------
   */

  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
  },

  infoText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
  },

  /*
   * --------------------------------
   * ERROR
   * --------------------------------
   */

  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
  },

  errorMessage: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#B91C1C",
  },

  /*
   * --------------------------------
   * CLAIM BUTTON
   * --------------------------------
   */

  claimButton: {
    minHeight: 54,
    borderRadius: 16,
    marginTop: 22,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  claimButtonPressed: {
    opacity: 0.82,
  },

  claimButtonDisabled: {
    opacity: 0.65,
  },

  claimText: {
    marginLeft: 9,
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.4,
  },

  /*
   * --------------------------------
   * LIMITED OFFERS
   * --------------------------------
   */

  emptyContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  emptyTopBackButton: {
    position: "absolute",
    top: 54,
    left: 20,
    zIndex: 10,

    width: 48,
    height: 48,
    borderRadius: 24,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 3,
  },

  emptyContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyIconBox: {
    width: 96,
    height: 96,
    borderRadius: 30,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 20,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 9,
    fontSize: 15,
    lineHeight: 23,
    color: "#64748B",
    textAlign: "center",
    maxWidth: 330,
  },

  emptyBackButton: {
    minHeight: 50,
    marginTop: 24,
    paddingHorizontal: 26,
    borderRadius: 15,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyBackButtonPressed: {
    opacity: 0.8,
  },

  emptyBackButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },

  /*
   * --------------------------------
   * INVALID ROUTE
   * --------------------------------
   */

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F8FAFC",
  },

  errorTitle: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },

  errorText: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
    textAlign: "center",
  },

  backButtonLarge: {
    marginTop: 20,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#2563EB",
  },

  backButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});