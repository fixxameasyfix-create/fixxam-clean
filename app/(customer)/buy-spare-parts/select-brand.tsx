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

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { AppText } from "@/components/ui";
import { CustomerColors } from "@/theme/customerColors";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type Brand = {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  iconBackground: string;
};

/*
 * ============================================================
 * BRAND FACTORY
 * ============================================================
 */

const createBrand = (
  name: string,
  description: string,
  iconColor = "#2563EB",
  iconBackground = "#EAF1FF",
  icon: keyof typeof MaterialCommunityIcons.glyphMap =
    "tag-outline",
): Brand => ({
  id: name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, ""),
  name,
  description,
  icon,
  iconColor,
  iconBackground,
});

/*
 * ============================================================
 * COOLING
 * ============================================================
 */

const AC_BRANDS: Brand[] = [
  createBrand(
    "LG",
    "Air conditioning",
    "#C026D3",
    "#FCEBFF",
  ),
  createBrand(
    "Samsung",
    "Air conditioning",
    "#2563EB",
    "#EAF1FF",
  ),
  createBrand(
    "Panasonic",
    "Air conditioning",
    "#0F766E",
    "#E6F8F5",
  ),
  createBrand(
    "Haier",
    "Air conditioning",
    "#0284C7",
    "#E5F5FF",
  ),
  createBrand(
    "Midea",
    "Air conditioning",
    "#0891B2",
    "#E5F8FC",
  ),
  createBrand(
    "Hisense",
    "Air conditioning",
    "#475569",
    "#EEF2F6",
  ),
  createBrand(
    "Gree",
    "Air conditioning",
    "#0284C7",
    "#E5F5FF",
  ),
  createBrand(
    "Daikin",
    "Air conditioning",
    "#2563EB",
    "#EAF1FF",
  ),
  createBrand(
    "Carrier",
    "Air conditioning",
    "#0F766E",
    "#E6F8F5",
  ),
];

const FRIDGE_BRANDS: Brand[] = [
  createBrand(
    "LG",
    "Refrigerators",
    "#C026D3",
    "#FCEBFF",
  ),
  createBrand(
    "Samsung",
    "Refrigerators",
    "#2563EB",
    "#EAF1FF",
  ),
  createBrand(
    "Haier",
    "Refrigerators",
    "#0284C7",
    "#E5F5FF",
  ),
  createBrand(
    "Hisense",
    "Refrigerators",
    "#475569",
    "#EEF2F6",
  ),
  createBrand(
    "Midea",
    "Refrigerators",
    "#0891B2",
    "#E5F8FC",
  ),
  createBrand(
    "Panasonic",
    "Refrigerators",
    "#0F766E",
    "#E6F8F5",
  ),
  createBrand(
    "Whirlpool",
    "Refrigerators",
    "#2563EB",
    "#EAF1FF",
  ),
  createBrand(
    "Bosch",
    "Refrigerators",
    "#DC2626",
    "#FEECEC",
  ),
  createBrand(
    "Sharp",
    "Refrigerators",
    "#7C3AED",
    "#F1E9FF",
  ),
];

const FREEZER_BRANDS: Brand[] = [
  createBrand(
    "Haier",
    "Freezers",
    "#0284C7",
    "#E5F5FF",
  ),
  createBrand(
    "Hisense",
    "Freezers",
    "#475569",
    "#EEF2F6",
  ),
  createBrand(
    "Midea",
    "Freezers",
    "#0891B2",
    "#E5F8FC",
  ),
  createBrand(
    "LG",
    "Freezers",
    "#C026D3",
    "#FCEBFF",
  ),
  createBrand(
    "Samsung",
    "Freezers",
    "#2563EB",
    "#EAF1FF",
  ),
  createBrand(
    "Whirlpool",
    "Freezers",
    "#2563EB",
    "#EAF1FF",
  ),
  createBrand(
    "Scanfrost",
    "Freezers",
    "#0F766E",
    "#E6F8F5",
  ),
  createBrand(
    "Bruhm",
    "Freezers",
    "#7C3AED",
    "#F1E9FF",
  ),
];

const COLD_ROOM_BRANDS: Brand[] = [
  createBrand(
    "Carrier",
    "Commercial cooling",
    "#2563EB",
    "#EAF1FF",
  ),
  createBrand(
    "Daikin",
    "Commercial cooling",
    "#0284C7",
    "#E5F5FF",
  ),
  createBrand(
    "Gree",
    "Commercial cooling",
    "#0F766E",
    "#E6F8F5",
  ),
  createBrand(
    "Bitzer",
    "Refrigeration systems",
    "#475569",
    "#EEF2F6",
  ),
  createBrand(
    "Copeland",
    "Refrigeration systems",
    "#7C3AED",
    "#F1E9FF",
  ),
  createBrand(
    "Danfoss",
    "Refrigeration systems",
    "#DC2626",
    "#FEECEC",
  ),
];

const ICE_MAKER_BRANDS: Brand[] = [
  createBrand(
    "Scotsman",
    "Ice machines",
    "#0284C7",
    "#E5F5FF",
  ),
  createBrand(
    "Hoshizaki",
    "Ice machines",
    "#2563EB",
    "#EAF1FF",
  ),
  createBrand(
    "Manitowoc",
    "Ice machines",
    "#0F766E",
    "#E6F8F5",
  ),
  createBrand(
    "Brema",
    "Ice machines",
    "#0891B2",
    "#E5F8FC",
  ),
  createBrand(
    "Midea",
    "Ice machines",
    "#7C3AED",
    "#F1E9FF",
  ),
];

const FAN_BRANDS: Brand[] = [
  createBrand(
    "Binatone",
    "Fans & ventilation",
    "#0891B2",
    "#E5F8FC",
  ),
  createBrand(
    "Panasonic",
    "Fans & ventilation",
    "#0F766E",
    "#E6F8F5",
  ),
  createBrand(
    "Ox",
    "Fans & ventilation",
    "#2563EB",
    "#EAF1FF",
  ),
  createBrand(
    "Century",
    "Fans & ventilation",
    "#DC2626",
    "#FEECEC",
  ),
  createBrand(
    "Qasa",
    "Fans & ventilation",
    "#7C3AED",
    "#F1E9FF",
  ),
];

const EXTRACTOR_FAN_BRANDS: Brand[] = [
  createBrand(
    "Panasonic",
    "Ventilation",
    "#0F766E",
    "#E6F8F5",
  ),
  createBrand(
    "LG",
    "Ventilation",
    "#C026D3",
    "#FCEBFF",
  ),
  createBrand(
    "Samsung",
    "Ventilation",
    "#2563EB",
    "#EAF1FF",
  ),
  createBrand(
    "Midea",
    "Ventilation",
    "#0891B2",
    "#E5F8FC",
  ),
  createBrand(
    "Haier",
    "Ventilation",
    "#0284C7",
    "#E5F5FF",
  ),
];

/*
 * ============================================================
 * KITCHEN
 * ============================================================
 */

const MICROWAVE_BRANDS: Brand[] = [
  createBrand(
    "LG",
    "Microwave ovens",
    "#C026D3",
    "#FCEBFF",
  ),
  createBrand(
    "Samsung",
    "Microwave ovens",
    "#2563EB",
    "#EAF1FF",
  ),
  createBrand(
    "Panasonic",
    "Microwave ovens",
    "#0F766E",
    "#E6F8F5",
  ),
  createBrand(
    "Sharp",
    "Microwave ovens",
    "#7C3AED",
    "#F1E9FF",
  ),
  createBrand(
    "Hisense",
    "Microwave ovens",
    "#475569",
    "#EEF2F6",
  ),
  createBrand(
    "Midea",
    "Microwave ovens",
    "#0891B2",
    "#E5F8FC",
  ),
];

const OVEN_BRANDS: Brand[] = [
  createBrand(
    "Bosch",
    "Ovens & cooking",
    "#DC2626",
    "#FEECEC",
  ),
  createBrand(
    "LG",
    "Ovens & cooking",
    "#C026D3",
    "#FCEBFF",
  ),
  createBrand(
    "Samsung",
    "Ovens & cooking",
    "#2563EB",
    "#EAF1FF",
  ),
  createBrand(
    "Whirlpool",
    "Ovens & cooking",
    "#2563EB",
    "#EAF1FF",
  ),
  createBrand(
    "Midea",
    "Ovens & cooking",
    "#0891B2",
    "#E5F8FC",
  ),
];

const COOKER_BRANDS: Brand[] = [
  createBrand(
    "Binatone",
    "Cookers",
    "#0891B2",
    "#E5F8FC",
  ),
  createBrand(
    "Scanfrost",
    "Cookers",
    "#0F766E",
    "#E6F8F5",
  ),
  createBrand(
    "Bruhm",
    "Cookers",
    "#7C3AED",
    "#F1E9FF",
  ),
  createBrand(
    "Hisense",
    "Cookers",
    "#475569",
    "#EEF2F6",
  ),
  createBrand(
    "Midea",
    "Cookers",
    "#0891B2",
    "#E5F8FC",
  ),
];

const AIR_FRYER_BRANDS: Brand[] = [
  createBrand(
    "Philips",
    "Air fryers",
    "#2563EB",
    "#EAF1FF",
  ),
  createBrand(
    "Ninja",
    "Air fryers",
    "#475569",
    "#EEF2F6",
  ),
  createBrand(
    "Tefal",
    "Air fryers",
    "#DC2626",
    "#FEECEC",
  ),
  createBrand(
    "Midea",
    "Air fryers",
    "#0891B2",
    "#E5F8FC",
  ),
  createBrand(
    "Binatone",
    "Air fryers",
    "#7C3AED",
    "#F1E9FF",
  ),
];

const BLENDER_BRANDS: Brand[] = [
  createBrand(
    "Binatone",
    "Blenders",
    "#0891B2",
    "#E5F8FC",
  ),
  createBrand(
    "Philips",
    "Blenders",
    "#2563EB",
    "#EAF1FF",
  ),
  createBrand(
    "Nasco",
    "Blenders",
    "#DC2626",
    "#FEECEC",
  ),
  createBrand(
    "Scanfrost",
    "Blenders",
    "#0F766E",
    "#E6F8F5",
  ),
  createBrand(
    "Midea",
    "Blenders",
    "#7C3AED",
    "#F1E9FF",
  ),
];

const KITCHEN_SMALL_APPLIANCE_BRANDS: Brand[] = [
  createBrand(
    "Binatone",
    "Kitchen appliances",
    "#0891B2",
    "#E5F8FC",
  ),
  createBrand(
    "Philips",
    "Kitchen appliances",
    "#2563EB",
    "#EAF1FF",
  ),
  createBrand(
    "Nasco",
    "Kitchen appliances",
    "#DC2626",
    "#FEECEC",
  ),
  createBrand(
    "Scanfrost",
    "Kitchen appliances",
    "#0F766E",
    "#E6F8F5",
  ),
  createBrand(
    "Midea",
    "Kitchen appliances",
    "#7C3AED",
    "#F1E9FF",
  ),
];

/*
 * ============================================================
 * LAUNDRY
 * ============================================================
 */

const WASHING_MACHINE_BRANDS: Brand[] = [
  createBrand(
    "LG",
    "Washing machines",
    "#C026D3",
    "#FCEBFF",
  ),
  createBrand(
    "Samsung",
    "Washing machines",
    "#2563EB",
    "#EAF1FF",
  ),
  createBrand(
    "Hisense",
    "Washing machines",
    "#475569",
    "#EEF2F6",
  ),
  createBrand(
    "Haier",
    "Washing machines",
    "#0284C7",
    "#E5F5FF",
  ),
  createBrand(
    "Midea",
    "Washing machines",
    "#0891B2",
    "#E5F8FC",
  ),
  createBrand(
    "Whirlpool",
    "Washing machines",
    "#2563EB",
    "#EAF1FF",
  ),
  createBrand(
    "Bosch",
    "Washing machines",
    "#DC2626",
    "#FEECEC",
  ),
];

const DRYER_BRANDS: Brand[] = [
  createBrand(
    "LG",
    "Clothes dryers",
    "#C026D3",
    "#FCEBFF",
  ),
  createBrand(
    "Samsung",
    "Clothes dryers",
    "#2563EB",
    "#EAF1FF",
  ),
  createBrand(
    "Bosch",
    "Clothes dryers",
    "#DC2626",
    "#FEECEC",
  ),
  createBrand(
    "Whirlpool",
    "Clothes dryers",
    "#2563EB",
    "#EAF1FF",
  ),
  createBrand(
    "Midea",
    "Clothes dryers",
    "#0891B2",
    "#E5F8FC",
  ),
];

const IRON_BRANDS: Brand[] = [
  createBrand(
    "Philips",
    "Electric irons",
    "#2563EB",
    "#EAF1FF",
  ),
  createBrand(
    "Binatone",
    "Electric irons",
    "#0891B2",
    "#E5F8FC",
  ),
  createBrand(
    "Russell Hobbs",
    "Electric irons",
    "#475569",
    "#EEF2F6",
  ),
  createBrand(
    "Tefal",
    "Electric irons",
    "#DC2626",
    "#FEECEC",
  ),
];

/*
 * ============================================================
 * POWER
 * ============================================================
 */

const GENERATOR_BRANDS: Brand[] = [
  createBrand(
    "Firman",
    "Generators",
    "#DC2626",
    "#FEECEC",
    "engine-outline",
  ),
  createBrand(
    "Sumec",
    "Generators",
    "#2563EB",
    "#EAF1FF",
    "engine-outline",
  ),
  createBrand(
    "Tiger",
    "Generators",
    "#D97706",
    "#FFF3DE",
    "engine-outline",
  ),
  createBrand(
    "Elemax",
    "Generators",
    "#0F766E",
    "#E6F8F5",
    "engine-outline",
  ),
  createBrand(
    "Honda",
    "Generators",
    "#DC2626",
    "#FEECEC",
    "engine-outline",
  ),
  createBrand(
    "Mikano",
    "Generators",
    "#475569",
    "#EEF2F6",
    "engine-outline",
  ),
];

const INVERTER_BRANDS: Brand[] = [
  createBrand(
    "Mercury",
    "Inverters",
    "#2563EB",
    "#EAF1FF",
    "sine-wave",
  ),
  createBrand(
    "Luminous",
    "Inverters",
    "#D97706",
    "#FFF3DE",
    "sine-wave",
  ),
  createBrand(
    "Must",
    "Inverters",
    "#0F766E",
    "#E6F8F5",
    "sine-wave",
  ),
  createBrand(
    "Felicity Solar",
    "Inverters",
    "#CA8A04",
    "#FFF8D9",
    "sine-wave",
  ),
  createBrand(
    "Mecer",
    "Inverters",
    "#7C3AED",
    "#F1E9FF",
    "sine-wave",
  ),
];

const SOLAR_INVERTER_BRANDS: Brand[] = [
  createBrand(
    "Felicity Solar",
    "Solar inverters",
    "#CA8A04",
    "#FFF8D9",
    "solar-power",
  ),
  createBrand(
    "Must",
    "Solar inverters",
    "#0F766E",
    "#E6F8F5",
    "solar-power",
  ),
  createBrand(
    "Deye",
    "Solar inverters",
    "#2563EB",
    "#EAF1FF",
    "solar-power",
  ),
  createBrand(
    "Growatt",
    "Solar inverters",
    "#16A34A",
    "#E9F9EE",
    "solar-power",
  ),
  createBrand(
    "SMA",
    "Solar inverters",
    "#DC2626",
    "#FEECEC",
    "solar-power",
  ),
];

const SOLAR_PANEL_BRANDS: Brand[] = [
  createBrand(
    "Jinko Solar",
    "Solar panels",
    "#2563EB",
    "#EAF1FF",
    "solar-panel",
  ),
  createBrand(
    "LONGi",
    "Solar panels",
    "#0F766E",
    "#E6F8F5",
    "solar-panel",
  ),
  createBrand(
    "Canadian Solar",
    "Solar panels",
    "#DC2626",
    "#FEECEC",
    "solar-panel",
  ),
  createBrand(
    "JA Solar",
    "Solar panels",
    "#7C3AED",
    "#F1E9FF",
    "solar-panel",
  ),
  createBrand(
    "Trina Solar",
    "Solar panels",
    "#0891B2",
    "#E5F8FC",
    "solar-panel",
  ),
];

const BATTERY_BRANDS: Brand[] = [
  createBrand(
    "Mercury",
    "Batteries",
    "#2563EB",
    "#EAF1FF",
    "car-battery",
  ),
  createBrand(
    "Felicity Solar",
    "Batteries",
    "#CA8A04",
    "#FFF8D9",
    "car-battery",
  ),
  createBrand(
    "Luminous",
    "Batteries",
    "#D97706",
    "#FFF3DE",
    "car-battery",
  ),
  createBrand(
    "Tubular",
    "Power batteries",
    "#16A34A",
    "#E9F9EE",
    "car-battery",
  ),
];

const UPS_BRANDS: Brand[] = [
  createBrand(
    "APC",
    "UPS systems",
    "#16A34A",
    "#E9F9EE",
    "battery-charging",
  ),
  createBrand(
    "Mercury",
    "UPS systems",
    "#2563EB",
    "#EAF1FF",
    "battery-charging",
  ),
  createBrand(
    "Mecer",
    "UPS systems",
    "#7C3AED",
    "#F1E9FF",
    "battery-charging",
  ),
  createBrand(
    "Luminous",
    "UPS systems",
    "#D97706",
    "#FFF3DE",
    "battery-charging",
  ),
];

/*
 * ============================================================
 * AUTOMOTIVE
 * ============================================================
 */

const CAR_BRANDS: Brand[] = [
  createBrand(
    "Toyota",
    "Car parts",
    "#DC2626",
    "#FEECEC",
    "car-outline",
  ),
  createBrand(
    "Honda",
    "Car parts",
    "#DC2626",
    "#FEECEC",
    "car-outline",
  ),
  createBrand(
    "Mercedes-Benz",
    "Car parts",
    "#475569",
    "#EEF2F6",
    "car-outline",
  ),
  createBrand(
    "Hyundai",
    "Car parts",
    "#2563EB",
    "#EAF1FF",
    "car-outline",
  ),
  createBrand(
    "Kia",
    "Car parts",
    "#7C3AED",
    "#F1E9FF",
    "car-outline",
  ),
  createBrand(
    "Nissan",
    "Car parts",
    "#0891B2",
    "#E5F8FC",
    "car-outline",
  ),
  createBrand(
    "Ford",
    "Car parts",
    "#2563EB",
    "#EAF1FF",
    "car-outline",
  ),
];

const MOTORCYCLE_BRANDS: Brand[] = [
  createBrand(
    "Honda",
    "Motorcycle parts",
    "#DC2626",
    "#FEECEC",
    "motorbike",
  ),
  createBrand(
    "Yamaha",
    "Motorcycle parts",
    "#2563EB",
    "#EAF1FF",
    "motorbike",
  ),
  createBrand(
    "Suzuki",
    "Motorcycle parts",
    "#DC2626",
    "#FEECEC",
    "motorbike",
  ),
  createBrand(
    "Bajaj",
    "Motorcycle parts",
    "#0F766E",
    "#E6F8F5",
    "motorbike",
  ),
  createBrand(
    "TVS",
    "Motorcycle parts",
    "#7C3AED",
    "#F1E9FF",
    "motorbike",
  ),
];

const TRICYCLE_BRANDS: Brand[] = [
  createBrand(
    "Bajaj",
    "Tricycle parts",
    "#0F766E",
    "#E6F8F5",
    "rickshaw",
  ),
  createBrand(
    "TVS",
    "Tricycle parts",
    "#7C3AED",
    "#F1E9FF",
    "rickshaw",
  ),
  createBrand(
    "Daylong",
    "Tricycle parts",
    "#2563EB",
    "#EAF1FF",
    "rickshaw",
  ),
  createBrand(
    "Piaggio",
    "Tricycle parts",
    "#DC2626",
    "#FEECEC",
    "rickshaw",
  ),
];

const VEHICLE_ELECTRICAL_BRANDS: Brand[] = [
  createBrand(
    "Bosch",
    "Automotive electrical",
    "#DC2626",
    "#FEECEC",
    "engine-outline",
  ),
  createBrand(
    "Denso",
    "Automotive electrical",
    "#2563EB",
    "#EAF1FF",
    "engine-outline",
  ),
  createBrand(
    "Valeo",
    "Automotive electrical",
    "#0F766E",
    "#E6F8F5",
    "engine-outline",
  ),
  createBrand(
    "Delphi",
    "Automotive electrical",
    "#7C3AED",
    "#F1E9FF",
    "engine-outline",
  ),
];

const CAR_BATTERY_BRANDS: Brand[] = [
  createBrand(
    "Bosch",
    "Car batteries",
    "#DC2626",
    "#FEECEC",
    "car-battery",
  ),
  createBrand(
    "Exide",
    "Car batteries",
    "#2563EB",
    "#EAF1FF",
    "car-battery",
  ),
  createBrand(
    "Luminous",
    "Car batteries",
    "#D97706",
    "#FFF3DE",
    "car-battery",
  ),
  createBrand(
    "Amaron",
    "Car batteries",
    "#16A34A",
    "#E9F9EE",
    "car-battery",
  ),
];

/*
 * ============================================================
 * ELECTRONICS
 * ============================================================
 */

const TV_BRANDS: Brand[] = [
  createBrand(
    "LG",
    "Televisions",
    "#C026D3",
    "#FCEBFF",
    "television",
  ),
  createBrand(
    "Samsung",
    "Televisions",
    "#2563EB",
    "#EAF1FF",
    "television",
  ),
  createBrand(
    "Sony",
    "Televisions",
    "#475569",
    "#EEF2F6",
    "television",
  ),
  createBrand(
    "Hisense",
    "Televisions",
    "#64748B",
    "#EEF2F6",
    "television",
  ),
  createBrand(
    "TCL",
    "Televisions",
    "#DC2626",
    "#FEECEC",
    "television",
  ),
  createBrand(
    "Panasonic",
    "Televisions",
    "#0F766E",
    "#E6F8F5",
    "television",
  ),
];

const DECODER_BRANDS: Brand[] = [
  createBrand(
    "DSTV",
    "Satellite receivers",
    "#2563EB",
    "#EAF1FF",
    "set-top-box",
  ),
  createBrand(
    "GOtv",
    "Digital receivers",
    "#16A34A",
    "#E9F9EE",
    "set-top-box",
  ),
  createBrand(
    "StarTimes",
    "Digital receivers",
    "#DC2626",
    "#FEECEC",
    "set-top-box",
  ),
  createBrand(
    "Strong",
    "Satellite receivers",
    "#475569",
    "#EEF2F6",
    "set-top-box",
  ),
];

const ROUTER_BRANDS: Brand[] = [
  createBrand(
    "TP-Link",
    "Network equipment",
    "#16A34A",
    "#E9F9EE",
    "router-wireless",
  ),
  createBrand(
    "Huawei",
    "Network equipment",
    "#DC2626",
    "#FEECEC",
    "router-wireless",
  ),
  createBrand(
    "ZTE",
    "Network equipment",
    "#2563EB",
    "#EAF1FF",
    "router-wireless",
  ),
  createBrand(
    "D-Link",
    "Network equipment",
    "#0891B2",
    "#E5F8FC",
    "router-wireless",
  ),
  createBrand(
    "Tenda",
    "Network equipment",
    "#7C3AED",
    "#F1E9FF",
    "router-wireless",
  ),
];

const PRINTER_BRANDS: Brand[] = [
  createBrand(
    "HP",
    "Printers",
    "#2563EB",
    "#EAF1FF",
    "printer-outline",
  ),
  createBrand(
    "Canon",
    "Printers",
    "#DC2626",
    "#FEECEC",
    "printer-outline",
  ),
  createBrand(
    "Epson",
    "Printers",
    "#0891B2",
    "#E5F8FC",
    "printer-outline",
  ),
  createBrand(
    "Brother",
    "Printers",
    "#475569",
    "#EEF2F6",
    "printer-outline",
  ),
];

const SPEAKER_BRANDS: Brand[] = [
  createBrand(
    "Sony",
    "Audio equipment",
    "#475569",
    "#EEF2F6",
    "speaker",
  ),
  createBrand(
    "JBL",
    "Audio equipment",
    "#D97706",
    "#FFF3DE",
    "speaker",
  ),
  createBrand(
    "LG",
    "Audio equipment",
    "#C026D3",
    "#FCEBFF",
    "speaker",
  ),
  createBrand(
    "Samsung",
    "Audio equipment",
    "#2563EB",
    "#EAF1FF",
    "speaker",
  ),
  createBrand(
    "Panasonic",
    "Audio equipment",
    "#0F766E",
    "#E6F8F5",
    "speaker",
  ),
];

const CCTV_BRANDS: Brand[] = [
  createBrand(
    "Hikvision",
    "Security cameras",
    "#DC2626",
    "#FEECEC",
    "cctv",
  ),
  createBrand(
    "Dahua",
    "Security cameras",
    "#2563EB",
    "#EAF1FF",
    "cctv",
  ),
  createBrand(
    "TP-Link",
    "Security cameras",
    "#16A34A",
    "#E9F9EE",
    "cctv",
  ),
];

/*
 * ============================================================
 * WATER & PLUMBING
 * ============================================================
 */

const PUMP_BRANDS: Brand[] = [
  createBrand(
    "Pedrollo",
    "Water pumps",
    "#0F766E",
    "#E6F8F5",
    "water-pump",
  ),
  createBrand(
    "Grundfos",
    "Water pumps",
    "#2563EB",
    "#EAF1FF",
    "water-pump",
  ),
  createBrand(
    "Leo",
    "Water pumps",
    "#DC2626",
    "#FEECEC",
    "water-pump",
  ),
  createBrand(
    "Honda",
    "Water pumps",
    "#DC2626",
    "#FEECEC",
    "water-pump",
  ),
  createBrand(
    "Dayliff",
    "Water pumps",
    "#0891B2",
    "#E5F8FC",
    "water-pump",
  ),
];

const WATER_HEATER_BRANDS: Brand[] = [
  createBrand(
    "Ariston",
    "Water heaters",
    "#2563EB",
    "#EAF1FF",
    "water-boiler",
  ),
  createBrand(
    "Haier",
    "Water heaters",
    "#0284C7",
    "#E5F5FF",
    "water-boiler",
  ),
  createBrand(
    "LG",
    "Water heaters",
    "#C026D3",
    "#FCEBFF",
    "water-boiler",
  ),
  createBrand(
    "Samsung",
    "Water heaters",
    "#2563EB",
    "#EAF1FF",
    "water-boiler",
  ),
];

const WATER_FILTER_BRANDS: Brand[] = [
  createBrand(
    "LG",
    "Water filtration",
    "#C026D3",
    "#FCEBFF",
    "filter-outline",
  ),
  createBrand(
    "3M",
    "Water filtration",
    "#DC2626",
    "#FEECEC",
    "filter-outline",
  ),
  createBrand(
    "Aquafresh",
    "Water filtration",
    "#0284C7",
    "#E5F5FF",
    "filter-outline",
  ),
  createBrand(
    "Pureit",
    "Water filtration",
    "#0F766E",
    "#E6F8F5",
    "filter-outline",
  ),
];

/*
 * ============================================================
 * WORKSHOP
 * ============================================================
 */

const WORKSHOP_BRANDS: Brand[] = [
  createBrand(
    "Bosch",
    "Power tools",
    "#DC2626",
    "#FEECEC",
    "tools",
  ),
  createBrand(
    "Makita",
    "Power tools",
    "#16A34A",
    "#E9F9EE",
    "tools",
  ),
  createBrand(
    "DeWalt",
    "Power tools",
    "#D97706",
    "#FFF3DE",
    "tools",
  ),
  createBrand(
    "Stanley",
    "Power tools",
    "#2563EB",
    "#EAF1FF",
    "tools",
  ),
  createBrand(
    "Ingco",
    "Power tools",
    "#EAB308",
    "#FFF8D9",
    "tools",
  ),
];

const WELDING_BRANDS: Brand[] = [
  createBrand(
    "Rilon",
    "Welding machines",
    "#2563EB",
    "#EAF1FF",
    "soldering-iron",
  ),
  createBrand(
    "Jasic",
    "Welding machines",
    "#DC2626",
    "#FEECEC",
    "soldering-iron",
  ),
  createBrand(
    "MMA",
    "Welding machines",
    "#475569",
    "#EEF2F6",
    "soldering-iron",
  ),
  createBrand(
    "Ingco",
    "Welding machines",
    "#D97706",
    "#FFF3DE",
    "soldering-iron",
  ),
];

const COMPRESSOR_BRANDS: Brand[] = [
  createBrand(
    "Ingersoll Rand",
    "Air compressors",
    "#2563EB",
    "#EAF1FF",
    "engine-outline",
  ),
  createBrand(
    "Atlas Copco",
    "Air compressors",
    "#0F766E",
    "#E6F8F5",
    "engine-outline",
  ),
  createBrand(
    "Ingco",
    "Air compressors",
    "#D97706",
    "#FFF3DE",
    "engine-outline",
  ),
  createBrand(
    "Total",
    "Air compressors",
    "#DC2626",
    "#FEECEC",
    "engine-outline",
  ),
];

/*
 * ============================================================
 * SPECIAL GROUPS
 * ============================================================
 */

const ELECTRICAL_BRANDS: Brand[] = [
  createBrand(
    "Schneider Electric",
    "Electrical equipment",
    "#16A34A",
    "#E9F9EE",
  ),
  createBrand(
    "ABB",
    "Electrical equipment",
    "#DC2626",
    "#FEECEC",
  ),
  createBrand(
    "Legrand",
    "Electrical equipment",
    "#2563EB",
    "#EAF1FF",
  ),
  createBrand(
    "Hager",
    "Electrical equipment",
    "#7C3AED",
    "#F1E9FF",
  ),
];

const SOCKET_BRANDS: Brand[] = [
  createBrand(
    "MK Electric",
    "Electrical fittings",
    "#2563EB",
    "#EAF1FF",
  ),
  createBrand(
    "Schneider Electric",
    "Electrical fittings",
    "#16A34A",
    "#E9F9EE",
  ),
  createBrand(
    "Legrand",
    "Electrical fittings",
    "#DC2626",
    "#FEECEC",
  ),
  createBrand(
    "Hager",
    "Electrical fittings",
    "#7C3AED",
    "#F1E9FF",
  ),
];

const LIGHTING_BRANDS: Brand[] = [
  createBrand(
    "Philips",
    "Lighting",
    "#2563EB",
    "#EAF1FF",
    "lightbulb-outline",
  ),
  createBrand(
    "Osram",
    "Lighting",
    "#DC2626",
    "#FEECEC",
    "lightbulb-outline",
  ),
  createBrand(
    "GE",
    "Lighting",
    "#475569",
    "#EEF2F6",
    "lightbulb-outline",
  ),
  createBrand(
    "Panasonic",
    "Lighting",
    "#0F766E",
    "#E6F8F5",
    "lightbulb-outline",
  ),
];

const FLOOD_LIGHT_BRANDS: Brand[] = [
  createBrand(
    "Philips",
    "Outdoor lighting",
    "#2563EB",
    "#EAF1FF",
    "light-flood-down",
  ),
  createBrand(
    "Osram",
    "Outdoor lighting",
    "#DC2626",
    "#FEECEC",
    "light-flood-down",
  ),
  createBrand(
    "GE",
    "Outdoor lighting",
    "#475569",
    "#EEF2F6",
    "light-flood-down",
  ),
];

const CABLE_BRANDS: Brand[] = [
  createBrand(
    "Prysmian",
    "Electrical cables",
    "#2563EB",
    "#EAF1FF",
    "cable-data",
  ),
  createBrand(
    "Nexans",
    "Electrical cables",
    "#DC2626",
    "#FEECEC",
    "cable-data",
  ),
  createBrand(
    "Polycab",
    "Electrical cables",
    "#0F766E",
    "#E6F8F5",
    "cable-data",
  ),
];

const EXTENSION_BOX_BRANDS: Brand[] = [
  createBrand(
    "Belkin",
    "Power extension",
    "#2563EB",
    "#EAF1FF",
    "power-socket",
  ),
  createBrand(
    "Binatone",
    "Power extension",
    "#0891B2",
    "#E5F8FC",
    "power-socket",
  ),
  createBrand(
    "Philips",
    "Power extension",
    "#7C3AED",
    "#F1E9FF",
    "power-socket",
  ),
];

const BATHROOM_FAUCET_BRANDS: Brand[] = [
  createBrand(
    "Grohe",
    "Faucets & fittings",
    "#475569",
    "#EEF2F6",
    "faucet",
  ),
  createBrand(
    "Hansgrohe",
    "Faucets & fittings",
    "#2563EB",
    "#EAF1FF",
    "faucet",
  ),
  createBrand(
    "Twyford",
    "Faucets & fittings",
    "#0F766E",
    "#E6F8F5",
    "faucet",
  ),
];

const SHOWER_BRANDS: Brand[] = [
  createBrand(
    "Grohe",
    "Bathroom fittings",
    "#475569",
    "#EEF2F6",
    "shower-head",
  ),
  createBrand(
    "Hansgrohe",
    "Bathroom fittings",
    "#2563EB",
    "#EAF1FF",
    "shower-head",
  ),
  createBrand(
    "Twyford",
    "Bathroom fittings",
    "#0F766E",
    "#E6F8F5",
    "shower-head",
  ),
];

const TOILET_BRANDS: Brand[] = [
  createBrand(
    "Twyford",
    "Toilet systems",
    "#0F766E",
    "#E6F8F5",
    "toilet",
  ),
  createBrand(
    "Roca",
    "Toilet systems",
    "#2563EB",
    "#EAF1FF",
    "toilet",
  ),
  createBrand(
    "Grohe",
    "Bathroom systems",
    "#475569",
    "#EEF2F6",
    "toilet",
  ),
];

/*
 * ============================================================
 * EQUIPMENT -> BRANDS
 * ============================================================
 */

const BRAND_GROUPS: Record<
  string,
  Brand[]
> = {
  /* Cooling */
  ac: AC_BRANDS,
  fridge: FRIDGE_BRANDS,
  freezer: FREEZER_BRANDS,
  "cold-room": COLD_ROOM_BRANDS,
  "ice-maker": ICE_MAKER_BRANDS,
  fan: FAN_BRANDS,
  "extractor-fan":
    EXTRACTOR_FAN_BRANDS,

  /* Kitchen */
  microwave: MICROWAVE_BRANDS,
  oven: OVEN_BRANDS,
  "electric-cooker":
    COOKER_BRANDS,
  "gas-cooker":
    COOKER_BRANDS,
  "air-fryer":
    AIR_FRYER_BRANDS,
  blender: BLENDER_BRANDS,
  "food-processor":
    KITCHEN_SMALL_APPLIANCE_BRANDS,
  "electric-kettle":
    KITCHEN_SMALL_APPLIANCE_BRANDS,
  toaster:
    KITCHEN_SMALL_APPLIANCE_BRANDS,
  "coffee-machine":
    KITCHEN_SMALL_APPLIANCE_BRANDS,
  "water-dispenser":
    KITCHEN_SMALL_APPLIANCE_BRANDS,

  /* Laundry */
  "washing-machine":
    WASHING_MACHINE_BRANDS,
  dryer: DRYER_BRANDS,
  iron: IRON_BRANDS,

  /* Power */
  generator:
    GENERATOR_BRANDS,
  inverter:
    INVERTER_BRANDS,
  "solar-inverter":
    SOLAR_INVERTER_BRANDS,
  "solar-panel":
    SOLAR_PANEL_BRANDS,
  battery:
    BATTERY_BRANDS,
  ups:
    UPS_BRANDS,

  /* Electrical */
  electrical:
    ELECTRICAL_BRANDS,

  "distribution-board":
    ELECTRICAL_BRANDS,

  "circuit-breaker":
    ELECTRICAL_BRANDS,

  socket:
    SOCKET_BRANDS,

  "light-switch":
    SOCKET_BRANDS,

  lighting:
    LIGHTING_BRANDS,

  "flood-light":
    FLOOD_LIGHT_BRANDS,

  cable:
    CABLE_BRANDS,

  "extension-box":
    EXTENSION_BOX_BRANDS,

  /* Water */
  "water-pump":
    PUMP_BRANDS,

  "borehole-pump":
    PUMP_BRANDS,

  "submersible-pump":
    PUMP_BRANDS,

  "pressure-pump":
    PUMP_BRANDS,

  "water-heater":
    WATER_HEATER_BRANDS,

  "water-filter":
    WATER_FILTER_BRANDS,

  faucet:
    BATHROOM_FAUCET_BRANDS,

  shower:
    SHOWER_BRANDS,

  toilet:
    TOILET_BRANDS,

  /* Workshop */
  "drilling-machine":
    WORKSHOP_BRANDS,

  "grinding-machine":
    WORKSHOP_BRANDS,

  "welding-machine":
    WELDING_BRANDS,

  "air-compressor":
    COMPRESSOR_BRANDS,

  "pressure-washer":
    WORKSHOP_BRANDS,

  "power-tools":
    WORKSHOP_BRANDS,

  /* Automotive */
  car:
    CAR_BRANDS,

  motorcycle:
    MOTORCYCLE_BRANDS,

  tricycle:
    TRICYCLE_BRANDS,

  "car-battery":
    CAR_BATTERY_BRANDS,

  alternator:
    VEHICLE_ELECTRICAL_BRANDS,

  "starter-motor":
    VEHICLE_ELECTRICAL_BRANDS,

  radiator: [
    createBrand(
      "Denso",
      "Radiators & cooling",
      "#2563EB",
      "#EAF1FF",
      "radiator",
    ),
    createBrand(
      "Valeo",
      "Radiators & cooling",
      "#0F766E",
      "#E6F8F5",
      "radiator",
    ),
    createBrand(
      "Mahle",
      "Engine cooling",
      "#DC2626",
      "#FEECEC",
      "radiator",
    ),
  ],

  /* Electronics */
  tv:
    TV_BRANDS,

  decoder:
    DECODER_BRANDS,

  router:
    ROUTER_BRANDS,

  printer:
    PRINTER_BRANDS,

  monitor: [
    createBrand(
      "Samsung",
      "Computer monitors",
      "#2563EB",
      "#EAF1FF",
      "monitor",
    ),
    createBrand(
      "LG",
      "Computer monitors",
      "#C026D3",
      "#FCEBFF",
      "monitor",
    ),
    createBrand(
      "Dell",
      "Computer monitors",
      "#475569",
      "#EEF2F6",
      "monitor",
    ),
    createBrand(
      "HP",
      "Computer monitors",
      "#2563EB",
      "#EAF1FF",
      "monitor",
    ),
    createBrand(
      "AOC",
      "Computer monitors",
      "#DC2626",
      "#FEECEC",
      "monitor",
    ),
  ],

  speaker:
    SPEAKER_BRANDS,

  cctv:
    CCTV_BRANDS,

  pos: [
    createBrand(
      "Verifone",
      "POS machines",
      "#2563EB",
      "#EAF1FF",
      "point-of-sale",
    ),
    createBrand(
      "PAX",
      "POS machines",
      "#0F766E",
      "#E6F8F5",
      "point-of-sale",
    ),
    createBrand(
      "Ingenico",
      "POS machines",
      "#475569",
      "#EEF2F6",
      "point-of-sale",
    ),
  ],

  /* Security */
  "automatic-gate": [
    createBrand(
      "FAAC",
      "Automatic gate systems",
      "#2563EB",
      "#EAF1FF",
      "gate",
    ),
    createBrand(
      "BFT",
      "Automatic gate systems",
      "#DC2626",
      "#FEECEC",
      "gate",
    ),
    createBrand(
      "Nice",
      "Automatic gate systems",
      "#0F766E",
      "#E6F8F5",
      "gate",
    ),
  ],

  "electric-fence": [
    createBrand(
      "Nemtek",
      "Electric fence systems",
      "#D97706",
      "#FFF3DE",
      "fence",
    ),
    createBrand(
      "JVA",
      "Electric fence systems",
      "#2563EB",
      "#EAF1FF",
      "fence",
    ),
    createBrand(
      "Centurion",
      "Security systems",
      "#DC2626",
      "#FEECEC",
      "fence",
    ),
  ],

  "security-alarm": [
    createBrand(
      "Hikvision",
      "Security alarms",
      "#DC2626",
      "#FEECEC",
      "alarm-light-outline",
    ),
    createBrand(
      "Dahua",
      "Security alarms",
      "#2563EB",
      "#EAF1FF",
      "alarm-light-outline",
    ),
    createBrand(
      "Paradox",
      "Security alarms",
      "#7C3AED",
      "#F1E9FF",
      "alarm-light-outline",
    ),
  ],
};

/*
 * ============================================================
 * SCREEN
 * ============================================================
 */

export default function SelectBrandScreen() {
  const params =
    useLocalSearchParams<{
      equipment?: string;
      equipmentLabel?: string;
    }>();

  const [search, setSearch] =
    useState("");

  /*
   * Normalize equipment params once.
   */

  const equipmentId = useMemo(
    () =>
      String(
        params.equipment ?? "",
      ).trim(),
    [params.equipment],
  );

  const equipmentLabel = useMemo(
    () =>
      String(
        params.equipmentLabel ?? "",
      ).trim() ||
      "Your Equipment",
    [params.equipmentLabel],
  );

  /*
   * ==========================================================
   * BRANDS
   * ==========================================================
   */

  const brands = useMemo(() => {
    return BRAND_GROUPS[
      equipmentId
    ] ?? [];
  }, [equipmentId]);

  /*
   * ==========================================================
   * SEARCH
   * ==========================================================
   */

  const filteredBrands =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return brands;
      }

      return brands.filter(
        (brand) =>
          brand.name
            .toLowerCase()
            .includes(value) ||
          brand.description
            .toLowerCase()
            .includes(value),
      );
    }, [brands, search]);

  /*
   * ==========================================================
   * NAVIGATION
   * ==========================================================
   */

  const handleBack =
    useCallback(() => {
      router.back();
    }, []);

  const handleContinue =
    useCallback(
      (
        brandId: string,
        brandName: string,
      ) => {
        if (!equipmentId) {
          router.back();
          return;
        }

        router.push({
          pathname:
            "/(customer)/buy-spare-parts/find-part",

          params: {
            source: "equipment",

            equipmentId,
            equipmentName:
              equipmentLabel,

            brandId,
            brandName,
          },
        });
      },
      [
        equipmentId,
        equipmentLabel,
      ],
    );

  const handleSelectBrand =
    useCallback(
      (brand: Brand) => {
        handleContinue(
          brand.id,
          brand.name,
        );
      },
      [handleContinue],
    );

  const handleOtherBrand =
    useCallback(() => {
      handleContinue(
        "other",
        "Other Brand",
      );
    }, [handleContinue]);

  const handleClearSearch =
    useCallback(() => {
      setSearch("");
    }, []);

  /*
   * ==========================================================
   * BRAND CARD
   * ==========================================================
   */

  const renderBrandCard =
    useCallback(
      (brand: Brand) => {
        return (
          <Pressable
            key={brand.id}
            onPress={() =>
              handleSelectBrand(
                brand,
              )
            }
            accessibilityRole="button"
            accessibilityLabel={`Choose ${brand.name}`}
            accessibilityHint={`Select ${brand.name} as the equipment brand`}
            style={({
              pressed,
            }) => [
              styles.brandCard,
              pressed &&
                styles.brandCardPressed,
            ]}
          >
            <View
              style={[
                styles.brandIcon,
                {
                  backgroundColor:
                    brand.iconBackground,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={
                  brand.icon
                }
                size={27}
                color={
                  brand.iconColor
                }
              />
            </View>

            <View
              style={
                styles.brandContent
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.brandTitle
                }
                numberOfLines={1}
              >
                {brand.name}
              </AppText>

              <AppText
                style={
                  styles.brandDescription
                }
                numberOfLines={1}
              >
                {
                  brand.description
                }
              </AppText>
            </View>

            <Ionicons
              name="chevron-forward"
              size={21}
              color={
                CustomerColors.textSecondary
              }
            />
          </Pressable>
        );
      },
      [handleSelectBrand],
    );

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <View
        style={styles.container}
      >
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.content
          }
        >
          {/* HEADER */}

          <View
            style={styles.header}
          >
            <Pressable
              onPress={
                handleBack
              }
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={({
                pressed,
              }) => [
                styles.backButton,
                pressed &&
                  styles.backButtonPressed,
              ]}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color={
                  CustomerColors.textPrimary
                }
              />
            </Pressable>

            <View
              style={
                styles.headerContent
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.headerTitle
                }
                numberOfLines={1}
              >
                Select Brand
              </AppText>

              <AppText
                style={
                  styles.headerSubtitle
                }
                numberOfLines={1}
              >
                {equipmentLabel}
              </AppText>
            </View>
          </View>

          {/* INTRO */}

          <View
            style={styles.helpCard}
          >
            <View
              style={styles.helpIcon}
            >
              <MaterialCommunityIcons
                name="tag-outline"
                size={28}
                color="#1459C7"
              />
            </View>

            <View
              style={
                styles.helpContent
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.helpTitle
                }
                numberOfLines={2}
              >
                What brand is your{" "}
                {equipmentLabel}?
              </AppText>

              <AppText
                style={
                  styles.helpText
                }
              >
                Choose the brand to
                help us find compatible
                spare parts.
              </AppText>
            </View>
          </View>

          {/* SEARCH */}

          {brands.length > 0 ? (
            <View
              style={
                styles.searchBox
              }
            >
              <Ionicons
                name="search-outline"
                size={21}
                color={
                  CustomerColors.textSecondary
                }
              />

              <TextInput
                value={search}
                onChangeText={
                  setSearch
                }
                placeholder="Search brand..."
                placeholderTextColor={
                  CustomerColors.textSecondary
                }
                style={
                  styles.searchInput
                }
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="search"
                accessibilityLabel="Search brand"
              />

              {search.length >
              0 ? (
                <Pressable
                  onPress={
                    handleClearSearch
                  }
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Clear brand search"
                >
                  <Ionicons
                    name="close-circle"
                    size={19}
                    color={
                      CustomerColors.textSecondary
                    }
                  />
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {/* SECTION HEADER */}

          <View
            style={
              styles.sectionHeader
            }
          >
            <View
              style={
                styles.sectionHeaderText
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.sectionTitle
                }
              >
                {brands.length >
                0
                  ? search.trim()
                    ? "Search results"
                    : "Available brands"
                  : "Brand selection"}
              </AppText>

              <AppText
                style={
                  styles.sectionSubtitle
                }
              >
                {brands.length >
                0
                  ? `${filteredBrands.length} ${
                      filteredBrands.length ===
                      1
                        ? "brand"
                        : "brands"
                    } available`
                  : "You can continue without selecting a brand"}
              </AppText>
            </View>

            {brands.length >
            0 ? (
              <View
                style={
                  styles.countBadge
                }
              >
                <AppText
                  weight="bold"
                  style={
                    styles.countText
                  }
                >
                  {
                    filteredBrands.length
                  }
                </AppText>
              </View>
            ) : null}
          </View>

          {/* BRANDS */}

          {filteredBrands.length >
          0 ? (
            <View
              style={styles.list}
            >
              {filteredBrands.map(
                renderBrandCard,
              )}
            </View>
          ) : null}

          {/* NO BRAND CATALOG */}

          {brands.length ===
          0 ? (
            <View
              style={
                styles.noBrandCard
              }
            >
              <View
                style={
                  styles.noBrandIcon
                }
              >
                <MaterialCommunityIcons
                  name="tag-off-outline"
                  size={29}
                  color="#2563EB"
                />
              </View>

              <AppText
                weight="bold"
                style={
                  styles.noBrandTitle
                }
              >
                Brand is not required
              </AppText>

              <AppText
                center
                style={
                  styles.noBrandText
                }
              >
                You can continue with
                your{" "}
                {equipmentLabel} and
                describe the part
                you need.
              </AppText>

              <Pressable
                onPress={
                  handleOtherBrand
                }
                accessibilityRole="button"
                accessibilityLabel="Continue without brand"
                style={({
                  pressed,
                }) => [
                  styles.continueButton,
                  pressed &&
                    styles.continueButtonPressed,
                ]}
              >
                <AppText
                  weight="bold"
                  style={
                    styles.continueButtonText
                  }
                >
                  Continue Without
                  Brand
                </AppText>

                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={
                    CustomerColors.background
                  }
                />
              </Pressable>
            </View>
          ) : null}

          {/* SEARCH EMPTY */}

          {brands.length >
            0 &&
          filteredBrands.length ===
            0 ? (
            <View
              style={
                styles.emptyState
              }
            >
              <View
                style={
                  styles.emptyIcon
                }
              >
                <Ionicons
                  name="search-outline"
                  size={27}
                  color={
                    CustomerColors.textSecondary
                  }
                />
              </View>

              <AppText
                weight="bold"
                style={
                  styles.emptyTitle
                }
              >
                Brand not found
              </AppText>

              <AppText
                center
                style={
                  styles.emptyText
                }
              >
                We can still help
                you find the right
                part without
                selecting a brand.
              </AppText>

              <Pressable
                onPress={
                  handleOtherBrand
                }
                accessibilityRole="button"
                accessibilityLabel="Continue without selecting a brand"
                style={({
                  pressed,
                }) => [
                  styles.continueButton,
                  pressed &&
                    styles.continueButtonPressed,
                ]}
              >
                <AppText
                  weight="bold"
                  style={
                    styles.continueButtonText
                  }
                >
                  Continue Without
                  Brand
                </AppText>

                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={
                    CustomerColors.background
                  }
                />
              </Pressable>
            </View>
          ) : null}

          {/* DON'T KNOW BRAND */}

          {brands.length >
          0 ? (
            <Pressable
              onPress={
                handleOtherBrand
              }
              accessibilityRole="button"
              accessibilityLabel="I don't know the brand"
              style={({
                pressed,
              }) => [
                styles.bottomHelp,
                pressed &&
                  styles.bottomHelpPressed,
              ]}
            >
              <View
                style={
                  styles.bottomHelpIcon
                }
              >
                <Ionicons
                  name="help-outline"
                  size={20}
                  color="#E87920"
                />
              </View>

              <View
                style={
                  styles.bottomHelpContent
                }
              >
                <AppText
                  weight="bold"
                  style={
                    styles.bottomHelpTitle
                  }
                >
                  I don't know the
                  brand
                </AppText>

                <AppText
                  style={
                    styles.bottomHelpText
                  }
                >
                  That's okay.
                  Continue and we'll
                  help you find a
                  compatible part.
                </AppText>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={
                  CustomerColors.textSecondary
                }
              />
            </Pressable>
          ) : null}
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
    backgroundColor:
      CustomerColors.background,
    borderWidth: 1,
    borderColor:
      CustomerColors.border,
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
    transform: [
      {
        scale: 0.97,
      },
    ],
  },

  headerContent: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    fontSize: 23,
    lineHeight: 29,
    color:
      CustomerColors.textPrimary,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 12.5,
    lineHeight: 18,
    color:
      CustomerColors.textSecondary,
  },

  helpCard: {
    minHeight: 100,
    marginTop: 7,
    padding: 14,
    borderRadius: 21,
    backgroundColor: "#EEF5FF",
    borderWidth: 1,
    borderColor: "#D8E7FA",
    flexDirection: "row",
    alignItems: "center",
  },

  helpIcon: {
    width: 54,
    height: 54,
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
    fontSize: 15,
    lineHeight: 20,
    color:
      CustomerColors.textPrimary,
  },

  helpText: {
    marginTop: 4,
    fontSize: 11.5,
    lineHeight: 17,
    color:
      CustomerColors.textSecondary,
  },

  searchBox: {
    height: 52,
    marginTop: 14,
    paddingHorizontal: 14,
    borderRadius: 17,
    backgroundColor:
      CustomerColors.background,
    borderWidth: 1,
    borderColor:
      CustomerColors.border,
    flexDirection: "row",
    alignItems: "center",
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

  sectionHeader: {
    marginTop: 22,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  sectionHeaderText: {
    flex: 1,
    paddingRight: 12,
  },

  sectionTitle: {
    fontSize: 18,
    lineHeight: 23,
    color:
      CustomerColors.textPrimary,
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 11.5,
    lineHeight: 17,
    color:
      CustomerColors.textSecondary,
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

  brandCard: {
    minHeight: 82,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 20,
    backgroundColor:
      CustomerColors.background,
    borderWidth: 1,
    borderColor:
      CustomerColors.border,
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

  brandCardPressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  brandIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor:
      "rgba(15, 23, 42, 0.04)",
  },

  brandContent: {
    flex: 1,
    marginLeft: 13,
    paddingRight: 8,
  },

  brandTitle: {
    fontSize: 15,
    lineHeight: 20,
    color:
      CustomerColors.textPrimary,
  },

  brandDescription: {
    marginTop: 3,
    fontSize: 11.5,
    lineHeight: 17,
    color:
      CustomerColors.textSecondary,
  },

  noBrandCard: {
    marginTop: 4,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 21,
    backgroundColor: "#EEF5FF",
    borderWidth: 1,
    borderColor: "#D8E7FA",
    alignItems: "center",
  },

  noBrandIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  noBrandTitle: {
    marginTop: 11,
    fontSize: 16,
    color:
      CustomerColors.textPrimary,
  },

  noBrandText: {
    maxWidth: 300,
    marginTop: 5,
    fontSize: 11.5,
    lineHeight: 18,
    color:
      CustomerColors.textSecondary,
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
    color:
      CustomerColors.textPrimary,
  },

  emptyText: {
    maxWidth: 290,
    marginTop: 4,
    fontSize: 11.5,
    lineHeight: 18,
    color:
      CustomerColors.textSecondary,
  },

  continueButton: {
    minHeight: 44,
    marginTop: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor:
      CustomerColors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  continueButtonPressed: {
    opacity: 0.8,
  },

  continueButtonText: {
    fontSize: 11.5,
    color:
      CustomerColors.background,
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
    color:
      CustomerColors.textPrimary,
  },

  bottomHelpText: {
    marginTop: 2,
    fontSize: 10.5,
    lineHeight: 16,
    color:
      CustomerColors.textSecondary,
  },
});