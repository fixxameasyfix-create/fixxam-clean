import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Animated,
  Easing,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";
import { CustomerColors } from "@/theme/customerColors";

const PROCESSING_DURATION = 5400;

type FindPartParams = {
  photoUri?: string;
  description?: string;
  source?: string;

  equipmentId?: string;
  equipmentName?: string;

  brandId?: string;
  brandName?: string;
};

export default function FindPartScreen() {
  /*
   * ============================================================
   * PARAMS
   * ============================================================
   */

  const params =
    useLocalSearchParams<FindPartParams>();

  const photoUri = useMemo(
    () =>
      String(
        params.photoUri ?? "",
      ).trim(),
    [params.photoUri],
  );

  const description = useMemo(
    () =>
      String(
        params.description ?? "",
      ).trim(),
    [params.description],
  );

  const source = useMemo(
    () =>
      String(
        params.source ?? "",
      ).trim(),
    [params.source],
  );

  const equipmentId = useMemo(
    () =>
      String(
        params.equipmentId ?? "",
      ).trim(),
    [params.equipmentId],
  );

  const equipmentName = useMemo(
    () =>
      String(
        params.equipmentName ?? "",
      ).trim(),
    [params.equipmentName],
  );

  const brandId = useMemo(
    () =>
      String(
        params.brandId ?? "",
      ).trim(),
    [params.brandId],
  );

  const brandName = useMemo(
    () =>
      String(
        params.brandName ?? "",
      ).trim(),
    [params.brandName],
  );

  /*
   * ============================================================
   * SEARCH TYPE
   * ============================================================
   */

  const isPhotoSearch =
    source === "photo" ||
    Boolean(photoUri);

  const isDescriptionSearch =
    source === "description" ||
    Boolean(description);

  const isEquipmentSearch =
    source === "equipment" ||
    Boolean(equipmentId) ||
    Boolean(brandId);

  const hasSearchInput =
    isPhotoSearch ||
    isDescriptionSearch ||
    isEquipmentSearch;

  /*
   * ============================================================
   * STATE
   * ============================================================
   */

  const [isProcessing, setIsProcessing] =
    useState(true);

  /*
   * ============================================================
   * ANIMATIONS
   * ============================================================
   */

  const rotation = useRef(
    new Animated.Value(0),
  ).current;

  const fadeAnim = useRef(
    new Animated.Value(0),
  ).current;

  const scaleAnim = useRef(
    new Animated.Value(0.96),
  ).current;

  /*
   * ============================================================
   * REFS
   * ============================================================
   */

  const timeoutRef = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  const animationRef = useRef<
    Animated.CompositeAnimation | null
  >(null);

  /*
   * ============================================================
   * CLEANUP
   * ============================================================
   */

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(
        timeoutRef.current,
      );

      timeoutRef.current = null;
    }

    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }
  }, []);

  /*
   * ============================================================
   * OPEN PRODUCTS
   * ============================================================
   */

  const openProducts = useCallback(() => {
    if (!hasSearchInput) {
      router.back();
      return;
    }

    router.replace({
      pathname:
        "/(customer)/buy-spare-parts/spare-products",

      params: {
        ...(photoUri
          ? {
              photoUri,
            }
          : {}),

        ...(description
          ? {
              description,
            }
          : {}),

        ...(source
          ? {
              source,
            }
          : {}),

        ...(equipmentId
          ? {
              equipmentId,
            }
          : {}),

        ...(equipmentName
          ? {
              equipmentName,
            }
          : {}),

        ...(brandId
          ? {
              brandId,
            }
          : {}),

        ...(brandName
          ? {
              brandName,
            }
          : {}),
      },
    });
  }, [
    brandId,
    brandName,
    description,
    equipmentId,
    equipmentName,
    hasSearchInput,
    photoUri,
    source,
  ]);

  /*
   * ============================================================
   * PROCESSING
   * ============================================================
   */

  useEffect(() => {
    if (!hasSearchInput) {
      router.back();
      return;
    }

    let cancelled = false;

    setIsProcessing(true);

    fadeAnim.setValue(0);
    scaleAnim.setValue(0.96);
    rotation.setValue(0);

    /*
     * Entrance
     */

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(
          Easing.cubic,
        ),
        useNativeDriver: true,
      }),

      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 16,
        stiffness: 140,
        mass: 0.7,
        useNativeDriver: true,
      }),
    ]).start();

    /*
     * Loader
     */

    animationRef.current =
      Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );

    animationRef.current.start();

    /*
     * Processing
     */

    timeoutRef.current = setTimeout(() => {
      if (cancelled) {
        return;
      }

      setIsProcessing(false);

      timeoutRef.current =
        setTimeout(() => {
          if (!cancelled) {
            openProducts();
          }
        }, 500);
    }, PROCESSING_DURATION);

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [
    cleanup,
    fadeAnim,
    hasSearchInput,
    openProducts,
    rotation,
    scaleAnim,
  ]);

  /*
   * ============================================================
   * BACK
   * ============================================================
   */

  const handleBack = useCallback(() => {
    cleanup();
    router.back();
  }, [cleanup]);

  /*
   * ============================================================
   * LOADER
   * ============================================================
   */

  const loaderRotation =
    rotation.interpolate({
      inputRange: [0, 1],
      outputRange: [
        "0deg",
        "360deg",
      ],
    });

  /*
   * ============================================================
   * TEXT
   * ============================================================
   */

  const title = isEquipmentSearch
    ? "Finding your spare part"
    : "Fixxam is finding\nyour spare part";

  const subtitle = isEquipmentSearch
    ? brandName
      ? `Finding compatible ${brandName} parts for your ${
          equipmentName ||
          "equipment"
        }...`
      : `Finding compatible parts for your ${
          equipmentName ||
          "equipment"
        }...`
    : isDescriptionSearch
      ? "Understanding your description and finding\ncompatible parts..."
      : "Analyzing your photo and finding\ncompatible parts...";

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <View style={styles.container}>
        {/* ======================================================
            BACK BUTTON
            ====================================================== */}

        <Pressable
          onPress={handleBack}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Return to the previous screen"
          style={({ pressed }) => [
            styles.backButton,
            pressed &&
              styles.backButtonPressed,
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color="#0F172A"
          />
        </Pressable>

        {/* ======================================================
            CONTENT
            ====================================================== */}

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,

              transform: [
                {
                  scale: scaleAnim,
                },
              ],
            },
          ]}
        >
          {/* ====================================================
              SEARCH ICON
              ==================================================== */}

          <View style={styles.searchCircle}>
            <View
              style={styles.searchIconInner}
            >
              <Ionicons
                name="search"
                size={34}
                color={
                  CustomerColors.primary
                }
              />
            </View>
          </View>

          {/* ====================================================
              TITLE
              ==================================================== */}

          <AppText
            weight="bold"
            center
            style={styles.title}
          >
            {title}
          </AppText>

          {/* ====================================================
              SUBTITLE
              ==================================================== */}

          <AppText
            center
            style={styles.subtitle}
          >
            {subtitle}
          </AppText>

          {/* ====================================================
              LOADER
              ==================================================== */}

          {isProcessing ? (
            <Animated.View
              style={[
                styles.loader,
                {
                  transform: [
                    {
                      rotate:
                        loaderRotation,
                    },
                  ],
                },
              ]}
            >
              <View
                style={styles.loaderDot}
              />
            </Animated.View>
          ) : (
            <View
              style={
                styles.completedIcon
              }
            >
              <Ionicons
                name="checkmark"
                size={18}
                color="#16A36A"
              />
            </View>
          )}

          {/* ====================================================
              INFO CARD
              ==================================================== */}

          <View
            style={styles.infoCard}
          >
            <View
              style={styles.infoIcon}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={21}
                color="#22A66F"
              />
            </View>

            <AppText
              weight="bold"
              style={styles.infoText}
            >
              Fixxam will prepare
              compatible spare parts
              for you. Nothing will be
              ordered until you choose
              a product.
            </AppText>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

/*
 * ============================================================
 * STYLES
 * ============================================================
 */

const styles = StyleSheet.create({
  /*
   * SCREEN
   */

  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  container: {
    flex: 1,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
  },

  /*
   * BACK BUTTON
   */

  backButton: {
    position: "absolute",

    top: 14,
    left: 16,

    zIndex: 10,

    width: 42,
    height: 42,

    borderRadius: 13,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E8EDF3",

    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#0F172A",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.04,
    shadowRadius: 5,

    elevation: 2,
  },

  backButtonPressed: {
    opacity: 0.72,

    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  /*
   * CONTENT
   */

  content: {
    flex: 1,

    width: "100%",

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 24,

    paddingTop: 16,
    paddingBottom: 48,
  },

  /*
   * SEARCH ICON
   */

  searchCircle: {
    width: 92,
    height: 92,

    borderRadius: 46,

    backgroundColor: "#EFF6FF",

    borderWidth: 1,
    borderColor: "#DBEAFE",

    alignItems: "center",
    justifyContent: "center",
  },

  searchIconInner: {
    width: 66,
    height: 66,

    borderRadius: 33,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#2563EB",

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.07,
    shadowRadius: 8,

    elevation: 2,
  },

  /*
   * TITLE
   */

  title: {
    marginTop: 24,

    maxWidth: 330,

    color: "#0F172A",

    fontSize: 25,
    lineHeight: 32,

    letterSpacing: -0.3,
  },

  /*
   * SUBTITLE
   */

  subtitle: {
    maxWidth: 330,

    marginTop: 9,

    color: "#64748B",

    fontSize: 14,
    lineHeight: 21,

    fontWeight: "500",
  },

  /*
   * LOADER
   */

  loader: {
    width: 30,
    height: 30,

    marginTop: 22,

    alignItems: "center",
    justifyContent: "flex-start",
  },

  loaderDot: {
    width: 8,
    height: 8,

    marginTop: 1,

    borderRadius: 4,

    backgroundColor: "#F97316",
  },

  /*
   * COMPLETED
   */

  completedIcon: {
    width: 32,
    height: 32,

    marginTop: 20,

    borderRadius: 16,

    backgroundColor: "#ECFDF5",

    alignItems: "center",
    justifyContent: "center",
  },

  /*
   * INFO CARD
   */

  infoCard: {
    width: "100%",

    marginTop: 32,

    paddingHorizontal: 14,
    paddingVertical: 14,

    borderRadius: 17,

    backgroundColor: "#F0FDF4",

    borderWidth: 1,
    borderColor: "#DCFCE7",

    flexDirection: "row",

    alignItems: "center",
  },

  infoIcon: {
    width: 36,
    height: 36,

    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",
  },

  infoText: {
    flex: 1,

    marginLeft: 8,

    color: "#166534",

    fontSize: 12,
    lineHeight: 18,
  },
});