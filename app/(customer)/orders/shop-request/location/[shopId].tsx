import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, View, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppLoader from "@/components/common/AppLoader";
import { AppText } from "@/components/ui";
import { getShopById } from "@/services/shopService";
import type { FirebaseShop } from "@/types/firebaseShop";
import { Colors, CustomerColors, FixxamTokens } from "@/theme";
import type { Region } from "react-native-maps";

// --- WEB SAFE MAP ---
let MapView: any = null;
let Marker: any = null;
if (Platform.OS!== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
  } catch {}
}

type ScreenState = "loading" | "ready" | "not-found" | "error";
const MAP_LATITUDE_DELTA = 0.01;
const MAP_LONGITUDE_DELTA = 0.01;

function normalizeParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0]?.trim()?? "";
  return value?.trim()?? "";
}
function hasValidCoordinates(shop: FirebaseShop | null): shop is FirebaseShop {
  if (!shop) return false;
  return Number.isFinite(shop.latitude) && shop.latitude >= -90 && shop.latitude <= 90 && Number.isFinite(shop.longitude) && shop.longitude >= -180 && shop.longitude <= 180;
}
function createShopRegion(shop: FirebaseShop): Region {
  return { latitude: shop.latitude, longitude: shop.longitude, latitudeDelta: MAP_LATITUDE_DELTA, longitudeDelta: MAP_LONGITUDE_DELTA };
}

export default function ShopLocationScreen() {
  const params = useLocalSearchParams<{ shopId?: string | string[] }>();
  const shopId = normalizeParam(params.shopId);
  const mapRef = useRef<any>(null);
  const [shop, setShop] = useState<FirebaseShop | null>(null);
  const [screenState, setScreenState] = useState<ScreenState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!shopId) { setShop(null); setErrorMessage("Shop information is missing."); setScreenState("error"); return; }
    let cancelled = false;
    setShop(null); setErrorMessage(""); setScreenState("loading");
    void getShopById(shopId).then((nextShop) => {
      if (cancelled) return;
      if (!nextShop) { setShop(null); setScreenState("not-found"); return; }
      if (!hasValidCoordinates(nextShop)) { setShop(null); setErrorMessage("This shop does not have a valid map location."); setScreenState("error"); return; }
      setShop(nextShop); setScreenState("ready");
    }).catch((error) => {
      if (cancelled) return;
      console.error("Shop location load failed:", error);
      setShop(null); setErrorMessage("Unable to load the shop location. Please try again."); setScreenState("error");
    });
    return () => { cancelled = true; };
  }, [retryKey, shopId]);

  const region = useMemo(() => { if (!hasValidCoordinates(shop)) return null; return createShopRegion(shop); }, [shop]);
  const address = useMemo(() => shop?.address.trim() || "Address unavailable", [shop?.address]);

  const handleBack = useCallback(() => { if (router.canGoBack()) { router.back(); return; } router.replace("/(customer)/(tabs)/orders"); }, []);
  const handleRetry = useCallback(() => { setRetryKey((c) => c + 1); }, []);
  const handleRecenter = useCallback(() => { if (!region) return; mapRef.current?.animateToRegion(region, 350); }, [region]);
  const handleGetDirections = useCallback(async () => {
    if (!hasValidCoordinates(shop)) { Alert.alert("Location unavailable", "Directions are not available for this shop."); return; }
    const destination = `${shop.latitude},${shop.longitude}`;
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`;
    try {
      const supported = await Linking.canOpenURL(directionsUrl);
      if (!supported) throw new Error("Maps URL is not supported.");
      await Linking.openURL(directionsUrl);
    } catch (error) { Alert.alert("Unable to open directions", "We could not open Maps on this device. Please try again."); }
  }, [shop]);

  if (screenState === "loading") { return (<SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}><LocationHeader onBack={handleBack} /><View style={styles.centerState}><AppLoader role="customer" size="sm" message="Loading location..." /></View></SafeAreaView>); }
  if (screenState === "not-found") { return (<SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}><LocationHeader onBack={handleBack} /><StateMessage icon="location-outline" title="Location unavailable" message="This shop is no longer available." actionLabel="Go Back" onAction={handleBack} /></SafeAreaView>); }
  if (screenState === "error") { return (<SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}><LocationHeader onBack={handleBack} /><StateMessage icon="alert-circle-outline" title="Unable to load location" message={errorMessage || "The shop location could not be loaded."} actionLabel="Try Again" onAction={handleRetry} /></SafeAreaView>); }
  if (!shop ||!region) return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <LocationHeader onBack={handleBack} />
      <View style={styles.content}>
        <View style={styles.mapContainer}>
          {Platform.OS === 'web'? (
            <View style={[styles.map, { backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="map-outline" size={48} color={CustomerColors.primary} />
              <AppText weight="bold" style={{ marginTop: 10 }}>Map available on mobile only</AppText>
              <AppText variant="caption" tone="secondary" style={{ marginTop: 4, textAlign: 'center', paddingHorizontal: 20 }}>{address}</AppText>
            </View>
          ) : (
            <MapView ref={mapRef} style={styles.map} initialRegion={region} showsCompass showsBuildings showsPointsOfInterest toolbarEnabled={false} loadingEnabled>
              <Marker coordinate={{ latitude: shop.latitude, longitude: shop.longitude }} title={shop.name} description={shop.address || undefined} />
            </MapView>
          )}
          {Platform.OS!== 'web' && (
            <Pressable onPress={handleRecenter} style={({ pressed }) => [styles.recenterButton, pressed? styles.pressed : null]}>
              <Ionicons name="locate-outline" size={22} color={CustomerColors.primary} />
            </Pressable>
          )}
        </View>
        <View style={styles.detailsCard}>
          <View style={styles.shopHeader}><View style={styles.shopIcon}><Ionicons name="storefront-outline" size={23} color={CustomerColors.primary} /></View><View style={styles.flexContent}><AppText weight="bold" numberOfLines={2} style={styles.shopName}>{shop.name || "Service Shop"}</AppText><AppText variant="caption" tone="secondary" style={styles.shopLabel}>Shop location</AppText></View></View>
          <View style={styles.divider} />
          <View style={styles.addressRow}><View style={styles.addressIcon}><Ionicons name="location-outline" size={21} color={CustomerColors.primary} /></View><View style={styles.flexContent}><AppText variant="caption" tone="secondary">Address</AppText><AppText weight="semibold" style={styles.addressText}>{address}</AppText></View></View>
          <Pressable onPress={handleGetDirections} style={({ pressed }) => [styles.directionsButton, pressed? styles.pressed : null]}><Ionicons name="navigate" size={20} color={Colors.textInverse} /><AppText weight="bold" style={styles.directionsButtonText}>Get Directions</AppText></Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function LocationHeader({ onBack }: { onBack: () => void }) {
  return (<View style={styles.header}><Pressable onPress={onBack} hitSlop={10} style={({ pressed }) => [styles.headerButton, pressed? styles.pressed : null]}><Ionicons name="arrow-back" size={24} color={Colors.textPrimary} /></Pressable><AppText weight="bold" style={styles.headerTitle}>Shop Location</AppText><View style={styles.headerPlaceholder} /></View>);
}
function StateMessage({ icon, title, message, actionLabel, onAction }: { icon: keyof typeof Ionicons.glyphMap; title: string; message: string; actionLabel: string; onAction: () => void; }) {
  return (<View style={styles.centerState}><View style={styles.stateIcon}><Ionicons name={icon} size={32} color={CustomerColors.primary} /></View><AppText weight="bold" style={styles.stateTitle}>{title}</AppText><AppText variant="caption" tone="secondary" style={styles.stateMessage}>{message}</AppText><Pressable onPress={onAction} style={({ pressed }) => [styles.stateButton, pressed? styles.pressed : null]}><AppText weight="bold" style={styles.stateButtonText}>{actionLabel}</AppText></Pressable></View>);
}
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: FixxamTokens.spacing.md, gap: FixxamTokens.spacing.md },
  flexContent: { flex: 1, minWidth: 0 },
  pressed: { opacity: FixxamTokens.motion.pressedOpacity },
  header: { minHeight: 58, flexDirection: "row", alignItems: "center", paddingHorizontal: FixxamTokens.spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  headerButton: { width: FixxamTokens.size.minimumTouchTarget, height: FixxamTokens.size.minimumTouchTarget, alignItems: "center", justifyContent: "center", borderRadius: FixxamTokens.radius.chip },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18 },
  headerPlaceholder: { width: FixxamTokens.size.minimumTouchTarget },
  mapContainer: { flex: 1, minHeight: 320, overflow: "hidden", borderWidth: 1, borderColor: Colors.border, borderRadius: FixxamTokens.radius.lg, backgroundColor: Colors.surface },
  map: {...StyleSheet.absoluteFillObject },
  recenterButton: { position: "absolute", right: FixxamTokens.spacing.sm, bottom: FixxamTokens.spacing.sm, width: FixxamTokens.size.minimumTouchTarget, height: FixxamTokens.size.minimumTouchTarget, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.border, borderRadius: FixxamTokens.radius.chip, backgroundColor: Colors.surface, elevation: 3, shadowColor: "#000000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4 },
  detailsCard: { padding: FixxamTokens.spacing.md, borderWidth: 1, borderColor: Colors.border, borderRadius: FixxamTokens.radius.lg, backgroundColor: Colors.surface },
  shopHeader: { flexDirection: "row", alignItems: "center", gap: FixxamTokens.spacing.sm },
  shopIcon: { width: 46, height: 46, alignItems: "center", justifyContent: "center", borderRadius: FixxamTokens.radius.md, backgroundColor: "#EFF6FF" },
  shopName: { fontSize: 16 },
  shopLabel: { marginTop: 2 },
  divider: { height: 1, marginVertical: FixxamTokens.spacing.sm, backgroundColor: Colors.border },
  addressRow: { flexDirection: "row", alignItems: "flex-start", gap: FixxamTokens.spacing.sm },
  addressIcon: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: FixxamTokens.radius.md, backgroundColor: Colors.background },
  addressText: { marginTop: 3, lineHeight: 21, color: Colors.textPrimary },
  directionsButton: { minHeight: FixxamTokens.size.minimumTouchTarget, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: FixxamTokens.spacing.xs, marginTop: FixxamTokens.spacing.md, paddingHorizontal: FixxamTokens.spacing.md, borderRadius: FixxamTokens.radius.md, backgroundColor: CustomerColors.primary },
  directionsButtonText: { color: Colors.textInverse },
  centerState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: FixxamTokens.spacing.xl },
  stateIcon: { width: 64, height: 64, alignItems: "center", justifyContent: "center", marginBottom: FixxamTokens.spacing.md, borderRadius: 32, backgroundColor: "#EFF6FF" },
  stateTitle: { textAlign: "center", fontSize: 18 },
  stateMessage: { maxWidth: 320, marginTop: FixxamTokens.spacing.xs, textAlign: "center", lineHeight: 20 },
  stateButton: { minHeight: FixxamTokens.size.minimumTouchTarget, alignItems: "center", justifyContent: "center", marginTop: FixxamTokens.spacing.lg, paddingHorizontal: FixxamTokens.spacing.lg, borderRadius: FixxamTokens.radius.md, backgroundColor: CustomerColors.primary },
  stateButtonText: { color: Colors.textInverse },
});