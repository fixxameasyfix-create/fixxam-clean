import React, {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppButton,
  AppCard,
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
  Typography,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type MaterialIconName =
  React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];

type Brand = {
  id: string;

  name: string;

  description: string;

  icon: MaterialIconName;
};

type BrandCardProps = {
  brand: Brand;

  onPress: (
    brand: Brand,
  ) => void;
};

/* ==============================================================
   BRAND HELPERS
============================================================== */

function createBrand(
  name: string,
  description: string,
  icon: MaterialIconName = "tag-outline",
): Brand {
  return {
    id: name
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-",
      )
      .replace(
        /^-|-$/g,
        "",
      ),

    name,

    description,

    icon,
  };
}

function createBrands(
  names: readonly string[],
  description: string,
  icon: MaterialIconName = "tag-outline",
): Brand[] {
  return names.map(
    (name) =>
      createBrand(
        name,
        description,
        icon,
      ),
  );
}

/* ==============================================================
   COOLING
============================================================== */

const AC_BRANDS =
  createBrands(
    [
      "LG",
      "Samsung",
      "Panasonic",
      "Haier",
      "Midea",
      "Hisense",
      "Gree",
      "Daikin",
      "Carrier",
    ],
    "Air conditioning",
  );

const FRIDGE_BRANDS =
  createBrands(
    [
      "LG",
      "Samsung",
      "Haier",
      "Hisense",
      "Midea",
      "Panasonic",
      "Whirlpool",
      "Bosch",
      "Sharp",
    ],
    "Refrigerators",
  );

const FREEZER_BRANDS =
  createBrands(
    [
      "Haier",
      "Hisense",
      "Midea",
      "LG",
      "Samsung",
      "Whirlpool",
      "Scanfrost",
      "Bruhm",
    ],
    "Freezers",
  );

const COLD_ROOM_BRANDS =
  createBrands(
    [
      "Carrier",
      "Daikin",
      "Gree",
      "Bitzer",
      "Copeland",
      "Danfoss",
    ],
    "Commercial cooling",
  );

const ICE_MAKER_BRANDS =
  createBrands(
    [
      "Scotsman",
      "Hoshizaki",
      "Manitowoc",
      "Brema",
      "Midea",
    ],
    "Ice machines",
  );

const FAN_BRANDS =
  createBrands(
    [
      "Binatone",
      "Panasonic",
      "Ox",
      "Century",
      "Qasa",
    ],
    "Fans & ventilation",
    "fan",
  );

const EXTRACTOR_FAN_BRANDS =
  createBrands(
    [
      "Panasonic",
      "LG",
      "Samsung",
      "Midea",
      "Haier",
    ],
    "Ventilation",
    "fan",
  );

/* ==============================================================
   KITCHEN
============================================================== */

const MICROWAVE_BRANDS =
  createBrands(
    [
      "LG",
      "Samsung",
      "Panasonic",
      "Sharp",
      "Hisense",
      "Midea",
    ],
    "Microwave ovens",
    "microwave",
  );

const OVEN_BRANDS =
  createBrands(
    [
      "Bosch",
      "LG",
      "Samsung",
      "Whirlpool",
      "Midea",
    ],
    "Ovens & cooking",
    "stove",
  );

const COOKER_BRANDS =
  createBrands(
    [
      "Binatone",
      "Scanfrost",
      "Bruhm",
      "Hisense",
      "Midea",
    ],
    "Cookers",
    "stove",
  );

const AIR_FRYER_BRANDS =
  createBrands(
    [
      "Philips",
      "Ninja",
      "Tefal",
      "Midea",
      "Binatone",
    ],
    "Air fryers",
    "french-fries",
  );

const BLENDER_BRANDS =
  createBrands(
    [
      "Binatone",
      "Philips",
      "Nasco",
      "Scanfrost",
      "Midea",
    ],
    "Blenders",
    "blender-outline",
  );

const KITCHEN_SMALL_APPLIANCE_BRANDS =
  createBrands(
    [
      "Binatone",
      "Philips",
      "Nasco",
      "Scanfrost",
      "Midea",
    ],
    "Kitchen appliances",
  );

/* ==============================================================
   LAUNDRY
============================================================== */

const WASHING_MACHINE_BRANDS =
  createBrands(
    [
      "LG",
      "Samsung",
      "Hisense",
      "Haier",
      "Midea",
      "Whirlpool",
      "Bosch",
    ],
    "Washing machines",
    "washing-machine",
  );

const DRYER_BRANDS =
  createBrands(
    [
      "LG",
      "Samsung",
      "Bosch",
      "Whirlpool",
      "Midea",
    ],
    "Clothes dryers",
    "tumble-dryer",
  );

const IRON_BRANDS =
  createBrands(
    [
      "Philips",
      "Binatone",
      "Russell Hobbs",
      "Tefal",
    ],
    "Electric irons",
    "iron-outline",
  );

/* ==============================================================
   POWER
============================================================== */

const GENERATOR_BRANDS =
  createBrands(
    [
      "Firman",
      "Sumec",
      "Tiger",
      "Elemax",
      "Honda",
      "Mikano",
    ],
    "Generators",
    "engine-outline",
  );

const INVERTER_BRANDS =
  createBrands(
    [
      "Mercury",
      "Luminous",
      "Must",
      "Felicity Solar",
      "Mecer",
    ],
    "Inverters",
    "sine-wave",
  );

const SOLAR_INVERTER_BRANDS =
  createBrands(
    [
      "Felicity Solar",
      "Must",
      "Deye",
      "Growatt",
      "SMA",
    ],
    "Solar inverters",
    "solar-power",
  );

const SOLAR_PANEL_BRANDS =
  createBrands(
    [
      "Jinko Solar",
      "LONGi",
      "Canadian Solar",
      "JA Solar",
      "Trina Solar",
    ],
    "Solar panels",
    "solar-panel",
  );

const BATTERY_BRANDS =
  createBrands(
    [
      "Mercury",
      "Felicity Solar",
      "Luminous",
      "Tubular",
    ],
    "Batteries",
    "car-battery",
  );

const UPS_BRANDS =
  createBrands(
    [
      "APC",
      "Mercury",
      "Mecer",
      "Luminous",
    ],
    "UPS systems",
    "battery-charging",
  );

/* ==============================================================
   ELECTRICAL
============================================================== */

const ELECTRICAL_BRANDS =
  createBrands(
    [
      "Schneider Electric",
      "ABB",
      "Legrand",
      "Hager",
    ],
    "Electrical equipment",
    "flash-outline",
  );

const SOCKET_BRANDS =
  createBrands(
    [
      "MK Electric",
      "Schneider Electric",
      "Legrand",
      "Hager",
    ],
    "Electrical fittings",
    "power-socket",
  );

const LIGHTING_BRANDS =
  createBrands(
    [
      "Philips",
      "Osram",
      "GE",
      "Panasonic",
    ],
    "Lighting",
    "lightbulb-outline",
  );

const FLOOD_LIGHT_BRANDS =
  createBrands(
    [
      "Philips",
      "Osram",
      "GE",
    ],
    "Outdoor lighting",
    "light-flood-down",
  );

const CABLE_BRANDS =
  createBrands(
    [
      "Prysmian",
      "Nexans",
      "Polycab",
    ],
    "Electrical cables",
    "cable-data",
  );

const EXTENSION_BOX_BRANDS =
  createBrands(
    [
      "Belkin",
      "Binatone",
      "Philips",
    ],
    "Power extension",
    "power-socket",
  );

/* ==============================================================
   WATER & PLUMBING
============================================================== */

const PUMP_BRANDS =
  createBrands(
    [
      "Pedrollo",
      "Grundfos",
      "Leo",
      "Honda",
      "Dayliff",
    ],
    "Water pumps",
    "water-pump",
  );

const WATER_HEATER_BRANDS =
  createBrands(
    [
      "Ariston",
      "Haier",
      "LG",
      "Samsung",
    ],
    "Water heaters",
    "water-boiler",
  );

const WATER_FILTER_BRANDS =
  createBrands(
    [
      "LG",
      "3M",
      "Aquafresh",
      "Pureit",
    ],
    "Water filtration",
    "filter-outline",
  );

const FAUCET_BRANDS =
  createBrands(
    [
      "Grohe",
      "Hansgrohe",
      "Twyford",
    ],
    "Faucets & fittings",
    "faucet",
  );

const SHOWER_BRANDS =
  createBrands(
    [
      "Grohe",
      "Hansgrohe",
      "Twyford",
    ],
    "Bathroom fittings",
    "shower-head",
  );

const TOILET_BRANDS =
  createBrands(
    [
      "Twyford",
      "Roca",
      "Grohe",
    ],
    "Toilet systems",
    "toilet",
  );

/* ==============================================================
   WORKSHOP
============================================================== */

const WORKSHOP_BRANDS =
  createBrands(
    [
      "Bosch",
      "Makita",
      "DeWalt",
      "Stanley",
      "Ingco",
    ],
    "Power tools",
    "tools",
  );

const WELDING_BRANDS =
  createBrands(
    [
      "Rilon",
      "Jasic",
      "MMA",
      "Ingco",
    ],
    "Welding machines",
    "soldering-iron",
  );

const COMPRESSOR_BRANDS =
  createBrands(
    [
      "Ingersoll Rand",
      "Atlas Copco",
      "Ingco",
      "Total",
    ],
    "Air compressors",
    "engine-outline",
  );

/* ==============================================================
   AUTOMOTIVE
============================================================== */

const CAR_BRANDS =
  createBrands(
    [
      "Toyota",
      "Honda",
      "Mercedes-Benz",
      "Hyundai",
      "Kia",
      "Nissan",
      "Ford",
    ],
    "Car parts",
    "car-outline",
  );

const MOTORCYCLE_BRANDS =
  createBrands(
    [
      "Honda",
      "Yamaha",
      "Suzuki",
      "Bajaj",
      "TVS",
    ],
    "Motorcycle parts",
    "motorbike",
  );

const TRICYCLE_BRANDS =
  createBrands(
    [
      "Bajaj",
      "TVS",
      "Daylong",
      "Piaggio",
    ],
    "Tricycle parts",
    "rickshaw",
  );

const VEHICLE_ELECTRICAL_BRANDS =
  createBrands(
    [
      "Bosch",
      "Denso",
      "Valeo",
      "Delphi",
    ],
    "Automotive electrical",
    "engine-outline",
  );

const CAR_BATTERY_BRANDS =
  createBrands(
    [
      "Bosch",
      "Exide",
      "Luminous",
      "Amaron",
    ],
    "Car batteries",
    "car-battery",
  );

const RADIATOR_BRANDS =
  createBrands(
    [
      "Denso",
      "Valeo",
      "Mahle",
    ],
    "Radiators & cooling",
    "radiator",
  );

/* ==============================================================
   ELECTRONICS
============================================================== */

const TV_BRANDS =
  createBrands(
    [
      "LG",
      "Samsung",
      "Sony",
      "Hisense",
      "TCL",
      "Panasonic",
    ],
    "Televisions",
    "television",
  );

const DECODER_BRANDS =
  createBrands(
    [
      "DSTV",
      "GOtv",
      "StarTimes",
      "Strong",
    ],
    "Satellite receivers",
    "set-top-box",
  );

const ROUTER_BRANDS =
  createBrands(
    [
      "TP-Link",
      "Huawei",
      "ZTE",
      "D-Link",
      "Tenda",
    ],
    "Network equipment",
    "router-wireless",
  );

const PRINTER_BRANDS =
  createBrands(
    [
      "HP",
      "Canon",
      "Epson",
      "Brother",
    ],
    "Printers",
    "printer-outline",
  );

const MONITOR_BRANDS =
  createBrands(
    [
      "Samsung",
      "LG",
      "Dell",
      "HP",
      "AOC",
    ],
    "Computer monitors",
    "monitor",
  );

const SPEAKER_BRANDS =
  createBrands(
    [
      "Sony",
      "JBL",
      "LG",
      "Samsung",
      "Panasonic",
    ],
    "Audio equipment",
    "speaker",
  );

const CCTV_BRANDS =
  createBrands(
    [
      "Hikvision",
      "Dahua",
      "TP-Link",
    ],
    "Security cameras",
    "cctv",
  );

const POS_BRANDS =
  createBrands(
    [
      "Verifone",
      "PAX",
      "Ingenico",
    ],
    "POS machines",
    "point-of-sale",
  );

/* ==============================================================
   SECURITY
============================================================== */

const AUTOMATIC_GATE_BRANDS =
  createBrands(
    [
      "FAAC",
      "BFT",
      "Nice",
    ],
    "Automatic gate systems",
    "gate",
  );

const ELECTRIC_FENCE_BRANDS =
  createBrands(
    [
      "Nemtek",
      "JVA",
      "Centurion",
    ],
    "Electric fence systems",
    "fence",
  );

const SECURITY_ALARM_BRANDS =
  createBrands(
    [
      "Hikvision",
      "Dahua",
      "Paradox",
    ],
    "Security alarms",
    "alarm-light-outline",
  );

/* ==============================================================
   EQUIPMENT → BRANDS
============================================================== */

const BRAND_GROUPS: Record<
  string,
  Brand[]
> = {
  /* Cooling */

  ac:
    AC_BRANDS,

  fridge:
    FRIDGE_BRANDS,

  freezer:
    FREEZER_BRANDS,

  "cold-room":
    COLD_ROOM_BRANDS,

  "ice-maker":
    ICE_MAKER_BRANDS,

  fan:
    FAN_BRANDS,

  "extractor-fan":
    EXTRACTOR_FAN_BRANDS,

  /* Kitchen */

  microwave:
    MICROWAVE_BRANDS,

  oven:
    OVEN_BRANDS,

  "electric-cooker":
    COOKER_BRANDS,

  "gas-cooker":
    COOKER_BRANDS,

  "air-fryer":
    AIR_FRYER_BRANDS,

  blender:
    BLENDER_BRANDS,

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

  dryer:
    DRYER_BRANDS,

  iron:
    IRON_BRANDS,

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
    FAUCET_BRANDS,

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

  radiator:
    RADIATOR_BRANDS,

  /* Electronics */

  tv:
    TV_BRANDS,

  decoder:
    DECODER_BRANDS,

  router:
    ROUTER_BRANDS,

  printer:
    PRINTER_BRANDS,

  monitor:
    MONITOR_BRANDS,

  speaker:
    SPEAKER_BRANDS,

  cctv:
    CCTV_BRANDS,

  pos:
    POS_BRANDS,

  /* Security */

  "automatic-gate":
    AUTOMATIC_GATE_BRANDS,

  "electric-fence":
    ELECTRIC_FENCE_BRANDS,

  "security-alarm":
    SECURITY_ALARM_BRANDS,
};

/* ==============================================================
   BRAND CARD
============================================================== */

const BrandCard =
  memo(function BrandCard({
    brand,
    onPress,
  }: BrandCardProps) {
    const handlePress =
      useCallback(() => {
        onPress(
          brand,
        );
      }, [
        brand,
        onPress,
      ]);

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Choose ${brand.name}`}
        accessibilityHint={`Select ${brand.name} as the equipment brand`}
        onPress={
          handlePress
        }
        style={({
          pressed,
        }) => [
          styles.brandCard,

          pressed
            ? styles.brandCardPressed
            : null,
        ]}
      >
        {/* ====================================================
            BRAND ICON
        ==================================================== */}

        <View
          style={
            styles.brandIcon
          }
        >
          {/* MaterialCommunityIcons intentionally preserved */}
          <MaterialCommunityIcons
            name={
              brand.icon
            }
            size={
              FixxamTokens.size
                .iconLg
            }
            color={
              CustomerColors.primary
            }
          />
        </View>

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <View
          style={
            styles.brandContent
          }
        >
          <AppText
            variant="bodyMedium"
            weight="bold"
            numberOfLines={1}
          >
            {brand.name}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            style={
              styles.brandDescription
            }
          >
            {brand.description}
          </AppText>
        </View>

        <AppIcon
          name="next"
          role="customer"
          size="sm"
          state="muted"
        />
      </Pressable>
    );
  });

/* ==============================================================
   SEPARATOR
============================================================== */

function BrandSeparator() {
  return (
    <View
      style={
        styles.separator
      }
    />
  );
}

/* ==============================================================
   SCREEN
============================================================== */

export default function SelectBrandScreen() {
  const params =
    useLocalSearchParams<{
      equipment?: string;

      equipmentLabel?: string;
    }>();

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    searchFocused,
    setSearchFocused,
  ] =
    useState(false);

  /* ============================================================
     PARAMS
  ============================================================ */

  const equipmentId =
    useMemo(
      () =>
        String(
          params.equipment ??
            "",
        ).trim(),
      [
        params.equipment,
      ],
    );

  const equipmentLabel =
    useMemo(
      () =>
        String(
          params.equipmentLabel ??
            "",
        ).trim() ||
        "Your Equipment",
      [
        params.equipmentLabel,
      ],
    );

  /* ============================================================
     BRANDS
  ============================================================ */

  const brands =
    useMemo(
      () =>
        BRAND_GROUPS[
          equipmentId
        ] ?? [],
      [
        equipmentId,
      ],
    );

  /* ============================================================
     SEARCH
  ============================================================ */

  const cleanSearch =
    search.trim();

  const hasSearch =
    cleanSearch.length >
    0;

  const filteredBrands =
    useMemo(() => {
      if (
        !hasSearch
      ) {
        return brands;
      }

      const query =
        cleanSearch.toLowerCase();

      return brands.filter(
        (brand) =>
          brand.name
            .toLowerCase()
            .includes(
              query,
            ) ||
          brand.description
            .toLowerCase()
            .includes(
              query,
            ),
      );
    }, [
      brands,
      cleanSearch,
      hasSearch,
    ]);

  const hasBrandCatalog =
    brands.length > 0;

  const hasSearchResults =
    filteredBrands.length >
    0;

  /* ============================================================
     BACK
  ============================================================ */

  const handleBack =
    useCallback(() => {
      if (
        router.canGoBack()
      ) {
        router.back();

        return;
      }

      router.replace(
        "/(customer)/buy-spare-parts/choose-equipment",
      );
    }, []);

  /* ============================================================
     CONTINUE
  ============================================================ */

  const handleContinue =
    useCallback(
      (
        brandId: string,
        brandName: string,
      ) => {
        if (
          !equipmentId
        ) {
          router.replace(
            "/(customer)/buy-spare-parts/choose-equipment",
          );

          return;
        }

        router.push({
          pathname:
            "/(customer)/buy-spare-parts/find-part",

          params: {
            source:
              "equipment",

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

  /* ============================================================
     SELECT BRAND
  ============================================================ */

  const handleSelectBrand =
    useCallback(
      (
        brand: Brand,
      ) => {
        handleContinue(
          brand.id,
          brand.name,
        );
      },
      [
        handleContinue,
      ],
    );

  /* ============================================================
     OTHER BRAND
  ============================================================ */

  const handleOtherBrand =
    useCallback(() => {
      handleContinue(
        "other",
        "Other Brand",
      );
    }, [
      handleContinue,
    ]);

  /* ============================================================
     CLEAR SEARCH
  ============================================================ */

  const handleClearSearch =
    useCallback(() => {
      setSearch(
        "",
      );
    }, []);

  /* ============================================================
     RENDER BRAND
  ============================================================ */

  const renderBrand =
    useCallback(
      ({
        item,
      }: {
        item: Brand;
      }) => (
        <BrandCard
          brand={
            item
          }
          onPress={
            handleSelectBrand
          }
        />
      ),
      [
        handleSelectBrand,
      ],
    );

  /* ============================================================
     LIST HEADER
  ============================================================ */

  const listHeader = (
    <>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={
          styles.header
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          onPress={
            handleBack
          }
          style={({
            pressed,
          }) => [
            styles.backButton,

            pressed
              ? styles.backButtonPressed
              : null,
          ]}
        >
          <AppIcon
            name="back"
            role="customer"
            size="sm"
            state="default"
          />
        </Pressable>

        <View
          style={
            styles.headerContent
          }
        >
          <AppText
            variant="heading1"
            weight="bold"
            numberOfLines={1}
          >
            Select Brand
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            style={
              styles.headerSubtitle
            }
          >
            {equipmentLabel}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          INTRO
      ====================================================== */}

      <AppCard
        role="customer"
        variant="accent"
        style={
          styles.helpCard
        }
      >
        <View
          style={
            styles.helpIcon
          }
        >
          {/* MaterialCommunityIcons intentionally preserved */}
          <MaterialCommunityIcons
            name="tag-outline"
            size={
              FixxamTokens.size
                .iconLg
            }
            color={
              CustomerColors.primary
            }
          />
        </View>

        <View
          style={
            styles.helpContent
          }
        >
          <AppText
            variant="bodyLarge"
            weight="bold"
          >
            What brand is your{" "}
            {equipmentLabel}?
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.helpText
            }
          >
            Choose the brand to help
            Fixxam find compatible
            spare parts.
          </AppText>
        </View>
      </AppCard>

      {/* ======================================================
          SEARCH
      ====================================================== */}

      {hasBrandCatalog ? (
        <View
          style={[
            styles.searchBox,

            searchFocused
              ? styles.searchBoxFocused
              : null,
          ]}
        >
          <AppIcon
            name="search"
            role="customer"
            size="sm"
            state={
              searchFocused
                ? "active"
                : "muted"
            }
          />

          <TextInput
            value={
              search
            }
            onChangeText={
              setSearch
            }
            onFocus={() =>
              setSearchFocused(
                true,
              )
            }
            onBlur={() =>
              setSearchFocused(
                false,
              )
            }
            placeholder="Search brand..."
            placeholderTextColor={
              Colors.textMuted
            }
            selectionColor={
              CustomerColors.primary
            }
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Search brand"
            style={
              styles.searchInput
            }
          />

          {hasSearch ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear brand search"
              hitSlop={8}
              onPress={
                handleClearSearch
              }
              style={({
                pressed,
              }) => [
                styles.searchAction,

                pressed
                  ? styles.searchActionPressed
                  : null,
              ]}
            >
              <AppIcon
                name="close"
                role="customer"
                size="xs"
                state="muted"
              />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {/* ======================================================
          SECTION
      ====================================================== */}

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
            variant="heading3"
            weight="bold"
          >
            {!hasBrandCatalog
              ? "Brand selection"
              : hasSearch
                ? "Search results"
                : "Available brands"}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.sectionSubtitle
            }
          >
            {!hasBrandCatalog
              ? "You can continue without selecting a brand."
              : `${filteredBrands.length} ${
                  filteredBrands.length ===
                  1
                    ? "brand"
                    : "brands"
                } available`}
          </AppText>
        </View>

        {hasBrandCatalog ? (
          <View
            style={
              styles.countBadge
            }
          >
            <AppText
              variant="caption"
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
    </>
  );

  /* ============================================================
     EMPTY STATE
  ============================================================ */

  const listEmpty =
    !hasBrandCatalog ? (
      <AppCard
        role="customer"
        variant="accent"
        style={
          styles.noBrandCard
        }
      >
        <View
          style={
            styles.noBrandIcon
          }
        >
          {/* MaterialCommunityIcons intentionally preserved */}
          <MaterialCommunityIcons
            name="tag-off-outline"
            size={
              FixxamTokens.size
                .iconLg
            }
            color={
              CustomerColors.primary
            }
          />
        </View>

        <AppText
          variant="bodyLarge"
          weight="bold"
          center
          style={
            styles.emptyTitle
          }
        >
          Brand is not required
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.emptyText
          }
        >
          Continue with your{" "}
          {equipmentLabel}. Fixxam can
          still help find compatible
          parts.
        </AppText>

        <AppButton
          title="Continue Without Brand"
          role="customer"
          onPress={
            handleOtherBrand
          }
          style={
            styles.continueButton
          }
        />
      </AppCard>
    ) : !hasSearchResults ? (
      <View
        style={
          styles.emptyState
        }
      >
        <View
          style={
            styles.emptySearchIcon
          }
        >
          <AppIcon
            name="search"
            role="customer"
            size="lg"
            state="muted"
          />
        </View>

        <AppText
          variant="bodyLarge"
          weight="bold"
          center
          style={
            styles.emptyTitle
          }
        >
          Brand not found
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.emptyText
          }
        >
          We can still help you find
          the right part without
          selecting a brand.
        </AppText>

        <AppButton
          title="Continue Without Brand"
          role="customer"
          onPress={
            handleOtherBrand
          }
          style={
            styles.continueButton
          }
        />
      </View>
    ) : null;

  /* ============================================================
     FOOTER
  ============================================================ */

  const listFooter =
    hasBrandCatalog &&
    hasSearchResults ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="I don't know the brand"
        onPress={
          handleOtherBrand
        }
        style={({
          pressed,
        }) => [
          styles.bottomHelp,

          pressed
            ? styles.bottomHelpPressed
            : null,
        ]}
      >
        <View
          style={
            styles.bottomHelpIcon
          }
        >
          <AppIcon
            name="help"
            role="customer"
            size="sm"
            state="active"
          />
        </View>

        <View
          style={
            styles.bottomHelpContent
          }
        >
          <AppText
            variant="bodyMedium"
            weight="bold"
          >
            I don't know the brand
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.bottomHelpText
            }
          >
            That's okay. Continue and
            we'll help you find a
            compatible part.
          </AppText>
        </View>

        <AppIcon
          name="next"
          role="customer"
          size="sm"
          state="muted"
        />
      </Pressable>
    ) : null;

  /* ============================================================
     UI
  ============================================================ */

  return (
    <AppScreen
      role="customer"
      padded={false}
    >
      <FlatList
        data={
          filteredBrands
        }
        keyExtractor={(
          item,
        ) =>
          item.id
        }
        renderItem={
          renderBrand
        }
        ItemSeparatorComponent={
          BrandSeparator
        }
        ListHeaderComponent={
          listHeader
        }
        ListEmptyComponent={
          listEmpty
        }
        ListFooterComponent={
          listFooter
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={8}
        contentContainerStyle={
          styles.content
        }
        style={
          styles.screen
        }
      />
    </AppScreen>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,

      backgroundColor:
        Colors.background,
    },

    content: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      minHeight:
        FixxamTokens.size
          .headerHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingVertical:
        FixxamTokens.spacing.sm,
    },

    backButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius
          .iconButton,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    backButtonPressed: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primarySoft,

      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },

    headerContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    headerSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       HELP
    ======================================================== */

    helpCard: {
      minHeight: 100,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,
    },

    helpIcon: {
      width:
        FixxamTokens.size.fab,

      height:
        FixxamTokens.size.fab,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    helpContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    helpText: {
      marginTop:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       SEARCH
    ======================================================== */

    searchBox: {
      minHeight:
        FixxamTokens.size
          .inputHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.md,

      paddingLeft:
        FixxamTokens.spacing.md,

      paddingRight:
        FixxamTokens.spacing.xs,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.search,

      backgroundColor:
        Colors.surface,
    },

    searchBoxFocused: {
      borderColor:
        CustomerColors.primary,
    },

    searchInput: {
      flex: 1,

      minWidth: 0,

      minHeight:
        FixxamTokens.size
          .inputHeight,

      marginLeft:
        FixxamTokens.spacing.sm,

      paddingHorizontal: 0,

      paddingVertical: 0,

      fontSize:
        Typography.fontSize.md,

      color:
        Colors.textPrimary,
    },

    searchAction: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius
          .iconButton,
    },

    searchActionPressed: {
      backgroundColor:
        CustomerColors.primarySoft,

      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    /* ========================================================
       SECTION
    ======================================================== */

    sectionHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginTop:
        FixxamTokens.spacing.xl,

      marginBottom:
        FixxamTokens.spacing.sm,
    },

    sectionHeaderText: {
      flex: 1,

      minWidth: 0,

      paddingRight:
        FixxamTokens.spacing.md,
    },

    sectionSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    countBadge: {
      minWidth: 34,

      height: 34,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    countText: {
      color:
        CustomerColors.primary,
    },

    /* ========================================================
       BRAND CARD
    ======================================================== */

    brandCard: {
      minHeight:
        FixxamTokens.size
          .roleCardHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    brandCardPressed: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primarySoft,

      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },

    brandIcon: {
      width:
        FixxamTokens.size.fab,

      height:
        FixxamTokens.size.fab,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    brandContent: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.md,
    },

    brandDescription: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    separator: {
      height:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    noBrandCard: {
      alignItems:
        "center",

      padding:
        FixxamTokens.spacing.xl,
    },

    noBrandIcon: {
      width:
        FixxamTokens.size.fabLarge,

      height:
        FixxamTokens.size.fabLarge,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    emptyState: {
      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingVertical:
        FixxamTokens.spacing.xxxl,
    },

    emptySearchIcon: {
      width:
        FixxamTokens.size.fabLarge,

      height:
        FixxamTokens.size.fabLarge,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.disabledBackground,
    },

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.md,
    },

    emptyText: {
      maxWidth: 300,

      marginTop:
        FixxamTokens.spacing.xs,
    },

    continueButton: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.lg,
    },

    /* ========================================================
       OTHER BRAND
    ======================================================== */

    bottomHelp: {
      minHeight:
        FixxamTokens.size
          .cardMinHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.xl,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    bottomHelpPressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },

    bottomHelpIcon: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius
          .iconButton,

      backgroundColor:
        Colors.surface,
    },

    bottomHelpContent: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.sm,
    },

    bottomHelpText: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },
  });