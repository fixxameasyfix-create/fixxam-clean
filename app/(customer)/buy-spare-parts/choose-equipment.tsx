import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { router } from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { AppText } from "@/components/ui";
import { CustomerColors } from "@/theme/customerColors";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type Equipment = {
  id: string;
  label: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  iconBackground: string;
};

/*
 * ============================================================
 * EQUIPMENT CATALOG
 * ============================================================
 */

const EQUIPMENT: Equipment[] = [
  // HOME & COOLING
  {
    id: "ac",
    label: "Air Conditioner",
    description: "AC & cooling",
    icon: "air-conditioner",
    iconColor: "#1769E0",
    iconBackground: "#E8F1FF",
  },
  {
    id: "fridge",
    label: "Fridge",
    description: "Refrigerator",
    icon: "fridge-outline",
    iconColor: "#087EA4",
    iconBackground: "#E5F7FC",
  },
  {
    id: "freezer",
    label: "Freezer",
    description: "Deep freezer",
    icon: "fridge-outline",
    iconColor: "#536DFE",
    iconBackground: "#ECEEFF",
  },
  {
    id: "cold-room",
    label: "Cold Room",
    description: "Commercial cooling",
    icon: "snowflake",
    iconColor: "#1683C7",
    iconBackground: "#E7F5FF",
  },
  {
    id: "ice-maker",
    label: "Ice Maker",
    description: "Ice machine",
    icon: "snowflake-variant",
    iconColor: "#0C8DBA",
    iconBackground: "#E5F8FC",
  },
  {
    id: "fan",
    label: "Fan",
    description: "Ceiling & standing",
    icon: "fan",
    iconColor: "#0E7490",
    iconBackground: "#E4F7FB",
  },
  {
    id: "extractor-fan",
    label: "Extractor Fan",
    description: "Ventilation",
    icon: "fan-chevron-up",
    iconColor: "#0891B2",
    iconBackground: "#E6F8FC",
  },

  // KITCHEN
  {
    id: "microwave",
    label: "Microwave",
    description: "Kitchen appliance",
    icon: "microwave",
    iconColor: "#D65A3A",
    iconBackground: "#FFF0EA",
  },
  {
    id: "oven",
    label: "Oven",
    description: "Cooking appliance",
    icon: "stove",
    iconColor: "#D85B3A",
    iconBackground: "#FFF0EA",
  },
  {
    id: "electric-cooker",
    label: "Electric Cooker",
    description: "Cooking",
    icon: "stove",
    iconColor: "#C94F36",
    iconBackground: "#FFF0EA",
  },
  {
    id: "gas-cooker",
    label: "Gas Cooker",
    description: "Cooking",
    icon: "stove",
    iconColor: "#B45309",
    iconBackground: "#FFF4DF",
  },
  {
    id: "air-fryer",
    label: "Air Fryer",
    description: "Kitchen appliance",
    icon: "french-fries",
    iconColor: "#C2410C",
    iconBackground: "#FFF0E7",
  },
  {
    id: "blender",
    label: "Blender",
    description: "Kitchen appliance",
    icon: "blender-outline",
    iconColor: "#7C3AED",
    iconBackground: "#F1E9FF",
  },
  {
    id: "food-processor",
    label: "Food Processor",
    description: "Kitchen appliance",
    icon: "food-variant",
    iconColor: "#8B5CF6",
    iconBackground: "#F2ECFF",
  },
  {
    id: "electric-kettle",
    label: "Electric Kettle",
    description: "Kitchen appliance",
    icon: "kettle-outline",
    iconColor: "#BE4B8A",
    iconBackground: "#FCEBF5",
  },
  {
    id: "toaster",
    label: "Toaster",
    description: "Kitchen appliance",
    icon: "toaster",
    iconColor: "#C2410C",
    iconBackground: "#FFF0E7",
  },
  {
    id: "coffee-machine",
    label: "Coffee Machine",
    description: "Kitchen appliance",
    icon: "coffee-maker-outline",
    iconColor: "#795548",
    iconBackground: "#F4ECE8",
  },
  {
    id: "water-dispenser",
    label: "Water Dispenser",
    description: "Water & cooling",
    icon: "water-outline",
    iconColor: "#0284C7",
    iconBackground: "#E5F5FF",
  },

  // LAUNDRY
  {
    id: "washing-machine",
    label: "Washing Machine",
    description: "Laundry",
    icon: "washing-machine",
    iconColor: "#7B4DCE",
    iconBackground: "#F2EAFF",
  },
  {
    id: "dryer",
    label: "Clothes Dryer",
    description: "Laundry",
    icon: "tumble-dryer",
    iconColor: "#9333EA",
    iconBackground: "#F3E8FF",
  },
  {
    id: "iron",
    label: "Electric Iron",
    description: "Home appliance",
    icon: "iron-outline",
    iconColor: "#C24B8A",
    iconBackground: "#FCEBF5",
  },

  // POWER
  {
    id: "generator",
    label: "Generator",
    description: "Power & backup",
    icon: "engine-outline",
    iconColor: "#E58A00",
    iconBackground: "#FFF2D9",
  },
  {
    id: "inverter",
    label: "Inverter",
    description: "Power backup",
    icon: "sine-wave",
    iconColor: "#D97706",
    iconBackground: "#FFF3DE",
  },
  {
    id: "solar-inverter",
    label: "Solar Inverter",
    description: "Solar power",
    icon: "solar-power",
    iconColor: "#CA8A04",
    iconBackground: "#FFF8D9",
  },
  {
    id: "solar-panel",
    label: "Solar Panel",
    description: "Solar power",
    icon: "solar-panel",
    iconColor: "#2563EB",
    iconBackground: "#E9F0FF",
  },
  {
    id: "battery",
    label: "Battery",
    description: "Power storage",
    icon: "car-battery",
    iconColor: "#16A34A",
    iconBackground: "#E9F9EE",
  },
  {
    id: "ups",
    label: "UPS",
    description: "Backup power",
    icon: "battery-charging",
    iconColor: "#15803D",
    iconBackground: "#E8F8EC",
  },
  {
    id: "stabilizer",
    label: "Stabilizer",
    description: "Voltage control",
    icon: "gauge",
    iconColor: "#2563EB",
    iconBackground: "#EAF1FF",
  },
  {
    id: "transformer",
    label: "Transformer",
    description: "Power equipment",
    icon: "transmission-tower",
    iconColor: "#7C3AED",
    iconBackground: "#F1E9FF",
  },

  // ELECTRICAL
  {
    id: "electrical",
    label: "Electrical",
    description: "Electrical parts",
    icon: "flash-outline",
    iconColor: "#D99A00",
    iconBackground: "#FFF7D9",
  },
  {
    id: "distribution-board",
    label: "Distribution Board",
    description: "Electrical system",
    icon: "view-dashboard-outline",
    iconColor: "#475569",
    iconBackground: "#EEF2F6",
  },
  {
    id: "circuit-breaker",
    label: "Circuit Breaker",
    description: "Electrical protection",
    icon: "toggle-switch-outline",
    iconColor: "#DC2626",
    iconBackground: "#FEECEC",
  },
  {
    id: "socket",
    label: "Socket",
    description: "Electrical fitting",
    icon: "power-socket-uk",
    iconColor: "#475569",
    iconBackground: "#EEF2F6",
  },
  {
    id: "light-switch",
    label: "Light Switch",
    description: "Electrical fitting",
    icon: "light-switch",
    iconColor: "#64748B",
    iconBackground: "#EEF2F6",
  },
  {
    id: "lighting",
    label: "Lighting",
    description: "Bulbs & fixtures",
    icon: "lightbulb-outline",
    iconColor: "#E09B00",
    iconBackground: "#FFF7DD",
  },
  {
    id: "flood-light",
    label: "Flood Light",
    description: "Outdoor lighting",
    icon: "light-flood-down",
    iconColor: "#E09B00",
    iconBackground: "#FFF7DD",
  },
  {
    id: "cable",
    label: "Cable",
    description: "Electrical cable",
    icon: "cable-data",
    iconColor: "#475569",
    iconBackground: "#EEF2F6",
  },
  {
    id: "extension-box",
    label: "Extension Box",
    description: "Power extension",
    icon: "power-socket",
    iconColor: "#2563EB",
    iconBackground: "#EAF1FF",
  },

  // WATER & PLUMBING
  {
    id: "water-pump",
    label: "Water Pump",
    description: "Water systems",
    icon: "water-pump",
    iconColor: "#078C8C",
    iconBackground: "#E3F8F6",
  },
  {
    id: "borehole-pump",
    label: "Borehole Pump",
    description: "Borehole system",
    icon: "water-pump",
    iconColor: "#0F766E",
    iconBackground: "#E4F7F4",
  },
  {
    id: "submersible-pump",
    label: "Submersible Pump",
    description: "Water pump",
    icon: "water-pump",
    iconColor: "#0284C7",
    iconBackground: "#E5F5FF",
  },
  {
    id: "pressure-pump",
    label: "Pressure Pump",
    description: "Water pressure",
    icon: "gauge",
    iconColor: "#0891B2",
    iconBackground: "#E5F8FC",
  },
  {
    id: "water-heater",
    label: "Water Heater",
    description: "Heating",
    icon: "water-boiler",
    iconColor: "#E4572E",
    iconBackground: "#FFF0EA",
  },
  {
    id: "water-filter",
    label: "Water Filter",
    description: "Water treatment",
    icon: "water-outline",
    iconColor: "#0284C7",
    iconBackground: "#E5F5FF",
  },
  {
    id: "faucet",
    label: "Faucet",
    description: "Plumbing",
    icon: "faucet",
    iconColor: "#64748B",
    iconBackground: "#EEF2F6",
  },
  {
    id: "shower",
    label: "Shower",
    description: "Bathroom fitting",
    icon: "shower-head",
    iconColor: "#0284C7",
    iconBackground: "#E5F5FF",
  },
  {
    id: "toilet",
    label: "Toilet",
    description: "Bathroom fitting",
    icon: "toilet",
    iconColor: "#64748B",
    iconBackground: "#EEF2F6",
  },

  // WORKSHOP
  {
    id: "drilling-machine",
    label: "Drilling Machine",
    description: "Power tool",
    icon: "tools",
    iconColor: "#D97706",
    iconBackground: "#FFF3DE",
  },
  {
    id: "grinding-machine",
    label: "Grinding Machine",
    description: "Power tool",
    icon: "angle-acute",
    iconColor: "#DC2626",
    iconBackground: "#FEECEC",
  },
  {
    id: "welding-machine",
    label: "Welding Machine",
    description: "Workshop equipment",
    icon: "soldering-iron",
    iconColor: "#2563EB",
    iconBackground: "#EAF1FF",
  },
  {
    id: "air-compressor",
    label: "Air Compressor",
    description: "Workshop equipment",
    icon: "gauge",
    iconColor: "#0F766E",
    iconBackground: "#E4F7F4",
  },
  {
    id: "pressure-washer",
    label: "Pressure Washer",
    description: "Cleaning equipment",
    icon: "car-wash",
    iconColor: "#0284C7",
    iconBackground: "#E5F5FF",
  },
  {
    id: "power-tools",
    label: "Power Tools",
    description: "Workshop tools",
    icon: "tools",
    iconColor: "#7C3AED",
    iconBackground: "#F1E9FF",
  },

  // AUTOMOTIVE
  {
    id: "car",
    label: "Car",
    description: "Automotive parts",
    icon: "car-outline",
    iconColor: "#2563EB",
    iconBackground: "#EAF1FF",
  },
  {
    id: "motorcycle",
    label: "Motorcycle",
    description: "Motorbike parts",
    icon: "motorbike",
    iconColor: "#DC2626",
    iconBackground: "#FEECEC",
  },
  {
    id: "tricycle",
    label: "Tricycle",
    description: "Keke parts",
    icon: "rickshaw",
    iconColor: "#D97706",
    iconBackground: "#FFF3DE",
  },
  {
    id: "car-battery",
    label: "Car Battery",
    description: "Vehicle battery",
    icon: "car-battery",
    iconColor: "#16A34A",
    iconBackground: "#E9F9EE",
  },
  {
    id: "alternator",
    label: "Alternator",
    description: "Vehicle electrical",
    icon: "engine-outline",
    iconColor: "#475569",
    iconBackground: "#EEF2F6",
  },
  {
    id: "starter-motor",
    label: "Starter Motor",
    description: "Vehicle starting",
    icon: "engine-outline",
    iconColor: "#64748B",
    iconBackground: "#EEF2F6",
  },
  {
    id: "radiator",
    label: "Radiator",
    description: "Engine cooling",
    icon: "radiator",
    iconColor: "#0E7490",
    iconBackground: "#E4F7FB",
  },

  // ELECTRONICS
  {
    id: "tv",
    label: "Television",
    description: "TV & display",
    icon: "television",
    iconColor: "#7C3AED",
    iconBackground: "#F1E9FF",
  },
  {
    id: "decoder",
    label: "Decoder",
    description: "Satellite receiver",
    icon: "set-top-box",
    iconColor: "#475569",
    iconBackground: "#EEF2F6",
  },
  {
    id: "router",
    label: "Router",
    description: "Internet equipment",
    icon: "router-wireless",
    iconColor: "#2563EB",
    iconBackground: "#EAF1FF",
  },
  {
    id: "printer",
    label: "Printer",
    description: "Office equipment",
    icon: "printer-outline",
    iconColor: "#64748B",
    iconBackground: "#EEF2F6",
  },
  {
    id: "monitor",
    label: "Monitor",
    description: "Computer display",
    icon: "monitor",
    iconColor: "#7C3AED",
    iconBackground: "#F1E9FF",
  },
  {
    id: "speaker",
    label: "Speaker",
    description: "Audio equipment",
    icon: "speaker",
    iconColor: "#DB2777",
    iconBackground: "#FCEBF5",
  },
  {
    id: "cctv",
    label: "CCTV",
    description: "Security camera",
    icon: "cctv",
    iconColor: "#475569",
    iconBackground: "#EEF2F6",
  },
  {
    id: "pos",
    label: "POS Machine",
    description: "Payment equipment",
    icon: "point-of-sale",
    iconColor: "#059669",
    iconBackground: "#E7F9F2",
  },

  // OTHER
  {
    id: "automatic-gate",
    label: "Automatic Gate",
    description: "Gate system",
    icon: "gate",
    iconColor: "#2563EB",
    iconBackground: "#EAF1FF",
  },
  {
    id: "electric-fence",
    label: "Electric Fence",
    description: "Security system",
    icon: "fence",
    iconColor: "#D97706",
    iconBackground: "#FFF3DE",
  },
  {
    id: "security-alarm",
    label: "Security Alarm",
    description: "Security system",
    icon: "alarm-light-outline",
    iconColor: "#DC2626",
    iconBackground: "#FEECEC",
  },
  {
    id: "other",
    label: "Other Equipment",
    description: "Can't find yours?",
    icon: "help-circle-outline",
    iconColor: "#64748B",
    iconBackground: "#EEF2F6",
  },
];

/*
 * ============================================================
 * SCREEN
 * ============================================================
 */

export default function ChooseEquipmentScreen() {
  const [search, setSearch] = useState("");

  /*
   * ----------------------------------------------------------
   * POPULAR EQUIPMENT
   * ----------------------------------------------------------
   */

  const popularEquipment = useMemo(
    () => EQUIPMENT.slice(0, 12),
    [],
  );

  /*
   * ----------------------------------------------------------
   * SEARCH
   * ----------------------------------------------------------
   */

  const filteredEquipment = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return EQUIPMENT;
    }

    return EQUIPMENT.filter((item) => {
      return (
        item.label.toLowerCase().includes(value) ||
        item.description.toLowerCase().includes(value)
      );
    });
  }, [search]);

  /*
   * ----------------------------------------------------------
   * SELECT EQUIPMENT
   * ----------------------------------------------------------
   */

  const handleSelectEquipment = useCallback(
    (equipment: Equipment) => {
      if (equipment.id === "other") {
        router.push(
          "/(customer)/buy-spare-parts/describe-part",
        );

        return;
      }

      router.push({
        pathname:
          "/(customer)/buy-spare-parts/select-brand",
        params: {
          equipment: equipment.id,
          equipmentLabel: equipment.label,
        },
      });
    },
    [],
  );

  /*
   * ----------------------------------------------------------
   * UNKNOWN EQUIPMENT
   * ----------------------------------------------------------
   */

  const handleUnknownEquipment = useCallback(() => {
    router.push(
      "/(customer)/buy-spare-parts/describe-part",
    );
  }, []);

  /*
   * ----------------------------------------------------------
   * EQUIPMENT CARD
   * ----------------------------------------------------------
   */

  const renderEquipmentCard = useCallback(
    (item: Equipment) => (
      <Pressable
        key={item.id}
        onPress={() => handleSelectEquipment(item)}
        accessibilityRole="button"
        accessibilityLabel={`Choose ${item.label}`}
        style={({ pressed }) => [
          styles.equipmentCard,
          pressed && styles.cardPressed,
        ]}
      >
        <View
          style={[
            styles.equipmentIcon,
            {
              backgroundColor: item.iconBackground,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={item.icon}
            size={28}
            color={item.iconColor}
          />
        </View>

        <View style={styles.equipmentContent}>
          <AppText
            weight="bold"
            style={styles.equipmentTitle}
            numberOfLines={1}
          >
            {item.label}
          </AppText>

          <AppText
            style={styles.equipmentDescription}
            numberOfLines={1}
          >
            {item.description}
          </AppText>
        </View>

        <Ionicons
          name="chevron-forward"
          size={21}
          color={CustomerColors.textSecondary}
        />
      </Pressable>
    ),
    [handleSelectEquipment],
  );

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          {/* ==================================================
              HEADER
          ================================================== */}

          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed,
              ]}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color={CustomerColors.textPrimary}
              />
            </Pressable>

            <View style={styles.headerContent}>
              <AppText
                weight="bold"
                style={styles.headerTitle}
              >
                Choose Your Equipment
              </AppText>

              <AppText style={styles.headerSubtitle}>
                What do you need a spare part for?
              </AppText>
            </View>
          </View>

          {/* ==================================================
              SEARCH
          ================================================== */}

          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={21}
              color={CustomerColors.textSecondary}
            />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search equipment..."
              placeholderTextColor={
                CustomerColors.textSecondary
              }
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              accessibilityLabel="Search equipment"
            />

            {search.length > 0 ? (
              <Pressable
                onPress={() => setSearch("")}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <Ionicons
                  name="close-circle"
                  size={19}
                  color={CustomerColors.textSecondary}
                />
              </Pressable>
            ) : null}
          </View>

          {/* ==================================================
              HELP
          ================================================== */}

          <View style={styles.helpCard}>
            <View style={styles.helpIcon}>
              <MaterialCommunityIcons
                name="lightbulb-on-outline"
                size={27}
                color="#1459C7"
              />
            </View>

            <View style={styles.helpContent}>
              <AppText
                weight="bold"
                style={styles.helpTitle}
              >
                Not sure what to choose?
              </AppText>

              <AppText style={styles.helpText}>
                Choose the equipment you want to repair.
                We'll help you find the right part.
              </AppText>
            </View>
          </View>

          {/* ==================================================
              POPULAR EQUIPMENT
          ================================================== */}

          {!search.trim() ? (
            <>
              <View style={styles.sectionHeader}>
                <View>
                  <AppText
                    weight="bold"
                    style={styles.sectionTitle}
                  >
                    Popular equipment
                  </AppText>

                  <AppText style={styles.sectionSubtitle}>
                    Commonly searched on Fixxam
                  </AppText>
                </View>

                <View style={styles.countBadge}>
                  <AppText
                    weight="bold"
                    style={styles.countText}
                  >
                    {EQUIPMENT.length}
                  </AppText>
                </View>
              </View>

              <View style={styles.list}>
                {popularEquipment.map(
                  renderEquipmentCard,
                )}
              </View>

              <View style={styles.allEquipmentHeader}>
                <AppText
                  weight="bold"
                  style={styles.sectionTitle}
                >
                  All equipment
                </AppText>

                <AppText style={styles.sectionSubtitle}>
                  Find more equipment below
                </AppText>
              </View>
            </>
          ) : (
            <View style={styles.searchResultsHeader}>
              <AppText
                weight="bold"
                style={styles.sectionTitle}
              >
                Search results
              </AppText>

              <AppText style={styles.sectionSubtitle}>
                {filteredEquipment.length} equipment found
              </AppText>
            </View>
          )}

          {/* ==================================================
              ALL / SEARCH RESULTS
          ================================================== */}

          <View style={styles.list}>
            {(search.trim()
              ? filteredEquipment
              : EQUIPMENT.slice(12)
            ).map(renderEquipmentCard)}
          </View>

          {/* ==================================================
              EMPTY SEARCH
          ================================================== */}

          {filteredEquipment.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="search-outline"
                  size={27}
                  color={CustomerColors.textSecondary}
                />
              </View>

              <AppText
                weight="bold"
                style={styles.emptyTitle}
              >
                Equipment not found
              </AppText>

              <AppText
                center
                style={styles.emptyText}
              >
                You don't need to know the exact name.
                Try describing the part instead.
              </AppText>

              <Pressable
                onPress={handleUnknownEquipment}
                style={styles.describeButton}
                accessibilityRole="button"
                accessibilityLabel="Describe your spare part"
              >
                <Ionicons
                  name="create-outline"
                  size={18}
                  color={CustomerColors.background}
                />

                <AppText
                  weight="bold"
                  style={styles.describeButtonText}
                >
                  Describe Your Part
                </AppText>
              </Pressable>
            </View>
          ) : null}

          {/* ==================================================
              UNKNOWN EQUIPMENT
          ================================================== */}

          <Pressable
            onPress={handleUnknownEquipment}
            style={({ pressed }) => [
              styles.bottomHelp,
              pressed && styles.bottomHelpPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="I don't know my equipment"
          >
            <View style={styles.bottomHelpIcon}>
              <Ionicons
                name="help-outline"
                size={20}
                color="#E87920"
              />
            </View>

            <View style={styles.bottomHelpContent}>
              <AppText
                weight="bold"
                style={styles.bottomHelpTitle}
              >
                I don't know my equipment
              </AppText>

              <AppText style={styles.bottomHelpText}>
                That's okay. Describe the part or take
                a photo instead.
              </AppText>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={CustomerColors.textSecondary}
            />
          </Pressable>
        </ScrollView>
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
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F8FC",
  },

  container: {
    flex: 1,
    backgroundColor: "#F6F8FC",
  },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 34,
  },

  header: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: CustomerColors.background,
    borderWidth: 1,
    borderColor: CustomerColors.border,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },

  backButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },

  headerContent: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    fontSize: 23,
    lineHeight: 29,
    color: CustomerColors.textPrimary,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 12.5,
    lineHeight: 18,
    color: CustomerColors.textSecondary,
  },

  searchBox: {
    height: 52,
    marginTop: 7,
    paddingHorizontal: 14,
    borderRadius: 17,
    backgroundColor: CustomerColors.background,
    borderWidth: 1,
    borderColor: CustomerColors.border,
    flexDirection: "row",
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    height: "100%",
    marginLeft: 9,
    paddingVertical: 0,
    fontSize: 14,
    color: CustomerColors.textPrimary,
  },

  helpCard: {
    minHeight: 96,
    marginTop: 14,
    padding: 14,
    borderRadius: 21,
    backgroundColor: "#EEF5FF",
    borderWidth: 1,
    borderColor: "#D8E7FA",
    flexDirection: "row",
    alignItems: "center",
  },

  helpIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  helpContent: {
    flex: 1,
    marginLeft: 13,
  },

  helpTitle: {
    fontSize: 14.5,
    lineHeight: 19,
    color: CustomerColors.textPrimary,
  },

  helpText: {
    marginTop: 3,
    fontSize: 11.5,
    lineHeight: 17,
    color: CustomerColors.textSecondary,
  },

  sectionHeader: {
    marginTop: 22,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  allEquipmentHeader: {
    marginTop: 24,
    marginBottom: 10,
  },

  searchResultsHeader: {
    marginTop: 22,
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 18,
    lineHeight: 23,
    color: CustomerColors.textPrimary,
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 11.5,
    color: CustomerColors.textSecondary,
  },

  countBadge: {
    minWidth: 34,
    height: 34,
    paddingHorizontal: 8,
    borderRadius: 17,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    fontSize: 12,
    color: "#1459C7",
  },

  list: {
    gap: 10,
  },

  equipmentCard: {
    minHeight: 82,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 20,
    backgroundColor: CustomerColors.background,
    borderWidth: 1,
    borderColor: CustomerColors.border,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.045,
    shadowRadius: 8,
    elevation: 1,
  },

  cardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },

  equipmentIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.04)",
  },

  equipmentContent: {
    flex: 1,
    marginLeft: 13,
    paddingRight: 8,
  },

  equipmentTitle: {
    fontSize: 15,
    lineHeight: 20,
    color: CustomerColors.textPrimary,
  },

  equipmentDescription: {
    marginTop: 3,
    fontSize: 11.5,
    lineHeight: 17,
    color: CustomerColors.textSecondary,
  },

  emptyState: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: "#EEF2F7",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    color: CustomerColors.textPrimary,
  },

  emptyText: {
    maxWidth: 290,
    marginTop: 4,
    fontSize: 11.5,
    lineHeight: 18,
    color: CustomerColors.textSecondary,
  },

  describeButton: {
    minHeight: 44,
    marginTop: 14,
    paddingHorizontal: 15,
    borderRadius: 14,
    backgroundColor: CustomerColors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  describeButtonText: {
    fontSize: 11.5,
    color: CustomerColors.background,
  },

  bottomHelp: {
    minHeight: 75,
    marginTop: 15,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 19,
    backgroundColor: "#FFF8EF",
    borderWidth: 1,
    borderColor: "#F7E5CC",
    flexDirection: "row",
    alignItems: "center",
  },

  bottomHelpPressed: {
    opacity: 0.8,
  },

  bottomHelpIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  bottomHelpContent: {
    flex: 1,
    marginLeft: 11,
    paddingRight: 6,
  },

  bottomHelpTitle: {
    fontSize: 12.5,
    lineHeight: 17,
    color: CustomerColors.textPrimary,
  },

  bottomHelpText: {
    marginTop: 2,
    fontSize: 10.5,
    lineHeight: 16,
    color: CustomerColors.textSecondary,
  },
});