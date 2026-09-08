import React, {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  router,
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

type Equipment = {
  id: string;

  label: string;

  description: string;

  icon: MaterialIconName;

  /*
   * Equipment-specific illustration colors
   * are intentionally preserved.
   *
   * Interactive controls still use the
   * Customer role color.
   */
  iconColor: string;

  iconBackground: string;
};

type EquipmentCardProps = {
  item: Equipment;

  onPress: (
    equipment: Equipment,
  ) => void;
};

/* ==============================================================
   EQUIPMENT CATALOG
============================================================== */

const EQUIPMENT: Equipment[] = [
  /* ============================================================
     HOME & COOLING
  ============================================================ */

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

  /* ============================================================
     KITCHEN
  ============================================================ */

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

  /* ============================================================
     LAUNDRY
  ============================================================ */

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

  /* ============================================================
     POWER
  ============================================================ */

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

  /* ============================================================
     ELECTRICAL
  ============================================================ */

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

  /* ============================================================
     WATER & PLUMBING
  ============================================================ */

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

  /* ============================================================
     WORKSHOP
  ============================================================ */

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

  /* ============================================================
     AUTOMOTIVE
  ============================================================ */

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

  /* ============================================================
     ELECTRONICS
  ============================================================ */

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

  /* ============================================================
     OTHER
  ============================================================ */

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

/* ==============================================================
   CONSTANTS
============================================================== */

const POPULAR_COUNT = 12;

const POPULAR_EQUIPMENT =
  EQUIPMENT.slice(
    0,
    POPULAR_COUNT,
  );

const OTHER_EQUIPMENT =
  EQUIPMENT.slice(
    POPULAR_COUNT,
  );

/* ==============================================================
   EQUIPMENT CARD
============================================================== */

const EquipmentCard =
  memo(function EquipmentCard({
    item,
    onPress,
  }: EquipmentCardProps) {
    const handlePress =
      useCallback(() => {
        onPress(
          item,
        );
      }, [
        item,
        onPress,
      ]);

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Choose ${item.label}`}
        onPress={
          handlePress
        }
        style={({
          pressed,
        }) => [
          styles.equipmentCard,

          pressed
            ? styles.cardPressed
            : null,
        ]}
      >
        {/* ====================================================
            EQUIPMENT ICON
        ==================================================== */}

        <View
          style={[
            styles.equipmentIcon,

            {
              backgroundColor:
                item.iconBackground,
            },
          ]}
        >
          {/* MaterialCommunityIcons intentionally preserved */}
          <MaterialCommunityIcons
            name={
              item.icon
            }
            size={
              FixxamTokens.size
                .iconLg
            }
            color={
              item.iconColor
            }
          />
        </View>

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <View
          style={
            styles.equipmentContent
          }
        >
          <AppText
            variant="bodyMedium"
            weight="bold"
            numberOfLines={1}
          >
            {item.label}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            style={
              styles.equipmentDescription
            }
          >
            {item.description}
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
   SCREEN
============================================================== */

export default function ChooseEquipmentScreen() {
  const [
    search,
    setSearch,
  ] =
    useState("");

  /* ============================================================
     SEARCH
  ============================================================ */

  const cleanSearch =
    search.trim();

  const hasSearch =
    cleanSearch.length >
    0;

  const filteredEquipment =
    useMemo(() => {
      if (!hasSearch) {
        return [];
      }

      const query =
        cleanSearch.toLocaleLowerCase();

      return EQUIPMENT.filter(
        (item) =>
          item.label
            .toLocaleLowerCase()
            .includes(
              query,
            ) ||
          item.description
            .toLocaleLowerCase()
            .includes(
              query,
            ),
      );
    }, [
      cleanSearch,
      hasSearch,
    ]);

  /* ============================================================
     LIST DATA
  ============================================================ */

  const listData =
    useMemo(
      () =>
        hasSearch
          ? filteredEquipment
          : OTHER_EQUIPMENT,
      [
        filteredEquipment,
        hasSearch,
      ],
    );

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
        "/(customer)/buy-spare-parts/spare-products",
      );
    }, []);

  /* ============================================================
     SELECT EQUIPMENT
  ============================================================ */

  const handleSelectEquipment =
    useCallback(
      (
        equipment:
          Equipment,
      ) => {
        if (
          equipment.id ===
          "other"
        ) {
          router.push(
            "/(customer)/buy-spare-parts/describe-part",
          );

          return;
        }

        router.push({
          pathname:
            "/(customer)/buy-spare-parts/select-brand",

          params: {
            equipment:
              equipment.id,

            equipmentLabel:
              equipment.label,
          },
        });
      },
      [],
    );

  /* ============================================================
     UNKNOWN
  ============================================================ */

  const handleUnknownEquipment =
    useCallback(() => {
      router.push(
        "/(customer)/buy-spare-parts/describe-part",
      );
    }, []);

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
     HEADER
  ============================================================ */

  const listHeader =
    useMemo(
      () => (
        <>
          {/* ==================================================
              HEADER
          ================================================== */}

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
                Choose Your Equipment
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.headerSubtitle
                }
              >
                What do you need a
                spare part for?
              </AppText>
            </View>
          </View>

          {/* ==================================================
              SEARCH
          ================================================== */}

          <View
            style={
              styles.searchBox
            }
          >
            <AppIcon
              name="search"
              role="customer"
              size="sm"
              state="muted"
            />

            <TextInput
              value={
                search
              }
              onChangeText={
                setSearch
              }
              placeholder="Search equipment..."
              placeholderTextColor={
                Colors.textMuted
              }
              selectionColor={
                CustomerColors.primary
              }
              style={
                styles.searchInput
              }
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              accessibilityLabel="Search equipment"
            />

            {hasSearch ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear search"
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

          {/* ==================================================
              HELP
          ================================================== */}

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
                name="lightbulb-on-outline"
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
                variant="bodyMedium"
                weight="bold"
              >
                Not sure what to choose?
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.helpText
                }
              >
                Choose the equipment
                you want to repair.
                We'll help you find
                the right part.
              </AppText>
            </View>
          </AppCard>

          {/* ==================================================
              POPULAR
          ================================================== */}

          {!hasSearch ? (
            <>
              <View
                style={
                  styles.sectionHeader
                }
              >
                <View
                  style={
                    styles.sectionContent
                  }
                >
                  <AppText
                    variant="heading3"
                    weight="bold"
                  >
                    Popular equipment
                  </AppText>

                  <AppText
                    variant="caption"
                    tone="secondary"
                    style={
                      styles.sectionSubtitle
                    }
                  >
                    Commonly searched
                    on Fixxam
                  </AppText>
                </View>

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
                      EQUIPMENT.length
                    }
                  </AppText>
                </View>
              </View>

              <View
                style={
                  styles.popularList
                }
              >
                {POPULAR_EQUIPMENT.map(
                  (
                    item,
                  ) => (
                    <EquipmentCard
                      key={
                        item.id
                      }
                      item={
                        item
                      }
                      onPress={
                        handleSelectEquipment
                      }
                    />
                  ),
                )}
              </View>

              <View
                style={
                  styles.allEquipmentHeader
                }
              >
                <AppText
                  variant="heading3"
                  weight="bold"
                >
                  All equipment
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Find more equipment
                  below
                </AppText>
              </View>
            </>
          ) : (
            <View
              style={
                styles.searchResultsHeader
              }
            >
              <AppText
                variant="heading3"
                weight="bold"
              >
                Search results
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.sectionSubtitle
                }
              >
                {
                  filteredEquipment.length
                }{" "}
                equipment found
              </AppText>
            </View>
          )}
        </>
      ),
      [
        filteredEquipment.length,
        handleBack,
        handleClearSearch,
        handleSelectEquipment,
        hasSearch,
        search,
      ],
    );

  /* ============================================================
     EMPTY
  ============================================================ */

  const emptyComponent =
    useMemo(
      () => {
        if (
          !hasSearch
        ) {
          return null;
        }

        return (
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
              style={
                styles.emptyTitle
              }
            >
              Equipment not found
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              center
              style={
                styles.emptyText
              }
            >
              You don't need to
              know the exact name.
              Try describing the
              part instead.
            </AppText>

            <AppButton
              title="Describe Your Part"
              role="customer"
              leftIconName="file"
              onPress={
                handleUnknownEquipment
              }
              style={
                styles.describeButton
              }
            />
          </View>
        );
      },
      [
        handleUnknownEquipment,
        hasSearch,
      ],
    );

  /* ============================================================
     FOOTER
  ============================================================ */

  const listFooter =
    useMemo(
      () => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="I don't know my equipment"
          onPress={
            handleUnknownEquipment
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
              I don't know my equipment
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.bottomHelpText
              }
            >
              That's okay. Describe
              the part or take a
              photo instead.
            </AppText>
          </View>

          <AppIcon
            name="next"
            role="customer"
            size="sm"
            state="muted"
          />
        </Pressable>
      ),
      [
        handleUnknownEquipment,
      ],
    );

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
          listData
        }
        keyExtractor={(
          item,
        ) =>
          item.id
        }
        renderItem={({
          item,
        }) => (
          <EquipmentCard
            item={
              item
            }
            onPress={
              handleSelectEquipment
            }
          />
        )}
        ItemSeparatorComponent={
          EquipmentSeparator
        }
        ListHeaderComponent={
          listHeader
        }
        ListEmptyComponent={
          emptyComponent
        }
        ListFooterComponent={
          listFooter
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews={
          Platform.OS ===
          "android"
        }
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
   SEPARATOR
============================================================== */

function EquipmentSeparator() {
  return (
    <View
      style={
        styles.separator
      }
    />
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       SCREEN
    ======================================================== */

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

      flexShrink: 0,

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
        FixxamTokens.spacing.sm,

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

    searchInput: {
      flex: 1,

      minWidth: 0,

      minHeight:
        FixxamTokens.size
          .inputHeight,

      marginLeft:
        FixxamTokens.spacing.sm,

      paddingVertical: 0,

      paddingHorizontal: 0,

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
       HELP
    ======================================================== */

    helpCard: {
      minHeight: 96,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.md,

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
        FixxamTokens.spacing.xxs,
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

    sectionContent: {
      flex: 1,

      minWidth: 0,
    },

    sectionSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    allEquipmentHeader: {
      marginTop:
        FixxamTokens.spacing.xxl,

      marginBottom:
        FixxamTokens.spacing.sm,
    },

    searchResultsHeader: {
      marginTop:
        FixxamTokens.spacing.xl,

      marginBottom:
        FixxamTokens.spacing.sm,
    },

    countBadge: {
      minWidth: 34,

      height: 34,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginLeft:
        FixxamTokens.spacing.sm,

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
       POPULAR
    ======================================================== */

    popularList: {
      width: "100%",
    },

    /* ========================================================
       EQUIPMENT
    ======================================================== */

    equipmentCard: {
      width: "100%",

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

    cardPressed: {
      borderColor:
        CustomerColors.primary,

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

    equipmentIcon: {
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
    },

    equipmentContent: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.md,
    },

    equipmentDescription: {
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

    emptyState: {
      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingVertical:
        FixxamTokens.spacing.xxxl,
    },

    emptyIcon: {
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

    describeButton: {
      marginTop:
        FixxamTokens.spacing.lg,
    },

    /* ========================================================
       BOTTOM HELP
    ======================================================== */

    bottomHelp: {
      width: "100%",

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