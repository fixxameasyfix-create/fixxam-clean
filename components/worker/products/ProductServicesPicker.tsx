import React, {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  type ListRenderItemInfo,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import {
  AppButton,
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  Typography,
  WorkerColors,
} from "@/theme";

import {
  db,
} from "@/firebase/config";

/* ============================================================
   TYPES
============================================================ */

type ServiceOption = {
  id: string;

  name: string;

  icon?: string;

  color?: string;

  backgroundColor?: string;

  aliases: string[];

  keywords: string[];

  tags: string[];
};

type Props = {
  visible: boolean;

  value: string[];

  onClose: () => void;

  onApply: (
    serviceIds: string[],
  ) => void;
};

type ServiceRowProps = {
  item: ServiceOption;

  selected: boolean;

  onToggle: (
    serviceId: string,
  ) => void;
};

/* ============================================================
   NORMALIZATION
============================================================ */

function normalizeSearch(
  value: unknown,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(
      /[^\p{L}\p{N}\s]/gu,
      " ",
    )
    .replace(
      /\s+/g,
      " ",
    );
}

function normalizeStringArray(
  value: unknown,
): string[] {
  if (
    !Array.isArray(value)
  ) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter(
          (
            item,
          ): item is string =>
            typeof item ===
            "string",
        )
        .map(
          normalizeSearch,
        )
        .filter(Boolean),
    ),
  );
}

function normalizeSelectedIds(
  value: unknown,
): string[] {
  if (
    !Array.isArray(value)
  ) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter(
          (
            item,
          ): item is string =>
            typeof item ===
            "string",
        )
        .map(
          item =>
            item.trim(),
        )
        .filter(Boolean),
    ),
  );
}

/* ============================================================
   SERVICE ICON
============================================================ */

function getServiceIcon(
  icon?: string,
): keyof typeof MaterialCommunityIcons.glyphMap {
  const normalizedIcon =
    typeof icon ===
      "string"
      ? icon.trim()
      : "";

  if (
    normalizedIcon &&
    normalizedIcon in
      MaterialCommunityIcons.glyphMap
  ) {
    return normalizedIcon as keyof typeof MaterialCommunityIcons.glyphMap;
  }

  return "tools";
}

/* ============================================================
   SEARCH
============================================================ */

function getSearchTokens(
  value: string,
): string[] {
  return Array.from(
    new Set(
      normalizeSearch(
        value,
      )
        .split(" ")
        .map(
          token =>
            token.trim(),
        )
        .filter(
          token =>
            token.length >=
            2,
        ),
    ),
  );
}

function matchesService(
  service: ServiceOption,
  searchValue: string,
): boolean {
  const search =
    normalizeSearch(
      searchValue,
    );

  if (!search) {
    return true;
  }

  const searchableText =
    [
      service.name,
      ...service.aliases,
      ...service.keywords,
      ...service.tags,
    ]
      .map(
        normalizeSearch,
      )
      .filter(Boolean)
      .join(" ");

  /*
   * Exact / partial phrase.
   */
  if (
    searchableText.includes(
      search,
    )
  ) {
    return true;
  }

  /*
   * Token matching.
   *
   * Example:
   * "ac gas"
   * finds:
   * "AC Gas Refill"
   */
  const tokens =
    getSearchTokens(
      search,
    );

  if (
    tokens.length === 0
  ) {
    return false;
  }

  return tokens.every(
    token =>
      searchableText.includes(
        token,
      ),
  );
}

/* ============================================================
   SERVICE ROW
============================================================ */

const ServiceRow =
  memo(
    function ServiceRow({
      item,
      selected,
      onToggle,
    }: ServiceRowProps) {
      const serviceIcon =
        getServiceIcon(
          item.icon,
        );

      const iconColor =
        item.color ||
        WorkerColors.primary;

      const iconBackground =
        item.backgroundColor ||
        WorkerColors.primarySoft;

      const handlePress =
        useCallback(() => {
          onToggle(
            item.id,
          );
        }, [
          item.id,
          onToggle,
        ]);

      return (
        <Pressable
          onPress={
            handlePress
          }
          accessibilityRole="checkbox"
          accessibilityLabel={`Select ${item.name}`}
          accessibilityState={{
            checked:
              selected,
          }}
          style={({
            pressed,
          }) => [
            styles.row,

            selected
              ? styles.rowSelected
              : null,

            pressed
              ? styles.rowPressed
              : null,
          ]}
        >
          {/* ==================================================
              MATERIAL COMMUNITY ICON PRESERVED
          ================================================== */}

          <View
            style={[
              styles.iconBox,

              {
                backgroundColor:
                  selected
                    ? WorkerColors.primary
                    : iconBackground,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={
                selected
                  ? "check"
                  : serviceIcon
              }
              size={23}
              color={
                selected
                  ? Colors.textInverse
                  : iconColor
              }
            />
          </View>

          {/* ==================================================
              SERVICE
          ================================================== */}

          <View
            style={
              styles.serviceContent
            }
          >
            <AppText
              variant="bodyMedium"
              weight={
                selected
                  ? "bold"
                  : "regular"
              }
              numberOfLines={2}
              style={[
                styles.serviceName,

                selected
                  ? styles.serviceNameSelected
                  : null,
              ]}
            >
              {item.name}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.serviceDescription
              }
            >
              Material can be used for this service
            </AppText>
          </View>

          {/* ==================================================
              CHECKBOX
          ================================================== */}

          <View
            style={[
              styles.checkbox,

              selected
                ? styles.checkboxSelected
                : null,
            ]}
          >
            {selected ? (
              <AppIcon
                name="check"
                role="worker"
                size="xs"
                color={
                  Colors.textInverse
                }
              />
            ) : null}
          </View>
        </Pressable>
      );
    },
  );

ServiceRow.displayName =
  "ProductServicesPickerRow";

/* ============================================================
   COMPONENT
============================================================ */

export default function ProductServicesPicker({
  visible,
  value,
  onClose,
  onApply,
}: Props) {
  const insets =
    useSafeAreaInsets();

  const [
    services,
    setServices,
  ] =
    useState<ServiceOption[]>(
      [],
    );

  const [
    selectedIds,
    setSelectedIds,
  ] =
    useState<string[]>(
      [],
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const deferredSearch =
    useDeferredValue(
      search,
    );

  const [
    searchFocused,
    setSearchFocused,
  ] =
    useState(false);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  /* ==========================================================
     SELECTION LOOKUP
  ========================================================== */

  const selectedSet =
    useMemo(
      () =>
        new Set(
          selectedIds,
        ),
      [
        selectedIds,
      ],
    );

  /* ==========================================================
     LOAD SERVICES
  ========================================================== */

  const loadServices =
    useCallback(async () => {
      try {
        setLoading(
          true,
        );

        setError(
          null,
        );

        const servicesQuery =
          query(
            collection(
              db,
              "services",
            ),
            orderBy(
              "name",
              "asc",
            ),
          );

        const snapshot =
          await getDocs(
            servicesQuery,
          );

        const result: ServiceOption[] =
          [];

        for (
          const serviceDoc of
          snapshot.docs
        ) {
          const data =
            serviceDoc.data();

          const name =
            typeof data.name ===
              "string"
              ? data.name.trim()
              : "";

          if (!name) {
            continue;
          }

          const icon =
            typeof data.icon ===
              "string" &&
            data.icon.trim()
              ? data.icon.trim()
              : undefined;

          const color =
            typeof data.color ===
              "string" &&
            data.color.trim()
              ? data.color.trim()
              : undefined;

          const backgroundColor =
            typeof data.backgroundColor ===
              "string" &&
            data.backgroundColor.trim()
              ? data.backgroundColor.trim()
              : undefined;

          result.push({
            id:
              serviceDoc.id,

            name,

            icon,

            color,

            backgroundColor,

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
        }

        setServices(
          result,
        );
      } catch (loadError) {
        console.error(
          "FIXXAM_PRODUCT_SERVICES_PICKER_LOAD_ERROR:",
          loadError,
        );

        setServices(
          [],
        );

        setError(
          "Unable to load services. Please try again.",
        );
      } finally {
        setLoading(
          false,
        );
      }
    }, []);

  /* ==========================================================
     OPEN / RESET
  ========================================================== */

  useEffect(() => {
    if (!visible) {
      return;
    }

    setSelectedIds(
      normalizeSelectedIds(
        value,
      ),
    );

    setSearch(
      "",
    );

    setSearchFocused(
      false,
    );

    void loadServices();
  }, [
    visible,
    value,
    loadServices,
  ]);

  /* ==========================================================
     FILTER
  ========================================================== */

  const filteredServices =
    useMemo(() => {
      const normalizedSearch =
        normalizeSearch(
          deferredSearch,
        );

      if (
        !normalizedSearch
      ) {
        return services;
      }

      return services.filter(
        service =>
          matchesService(
            service,
            normalizedSearch,
          ),
      );
    }, [
      deferredSearch,
      services,
    ]);

  /* ==========================================================
     TOGGLE
  ========================================================== */

  const toggleService =
    useCallback(
      (
        serviceId: string,
      ) => {
        const normalizedId =
          serviceId.trim();

        if (
          !normalizedId
        ) {
          return;
        }

        setSelectedIds(
          current => {
            if (
              current.includes(
                normalizedId,
              )
            ) {
              return current.filter(
                id =>
                  id !==
                  normalizedId,
              );
            }

            return [
              ...current,
              normalizedId,
            ];
          },
        );
      },
      [],
    );

  /* ==========================================================
     CLEAR SELECTION
  ========================================================== */

  const handleClear =
    useCallback(() => {
      setSelectedIds(
        [],
      );
    }, []);

  /* ==========================================================
     CLEAR SEARCH
  ========================================================== */

  const handleClearSearch =
    useCallback(() => {
      setSearch(
        "",
      );
    }, []);

  /* ==========================================================
     APPLY
  ========================================================== */

  const handleDone =
    useCallback(() => {
      const normalizedIds =
        normalizeSelectedIds(
          selectedIds,
        );

      onApply(
        normalizedIds,
      );

      onClose();
    }, [
      onApply,
      onClose,
      selectedIds,
    ]);

  /* ==========================================================
     RENDER ITEM
  ========================================================== */

  const renderItem =
    useCallback(
      ({
        item,
      }: ListRenderItemInfo<ServiceOption>) => (
        <ServiceRow
          item={
            item
          }
          selected={
            selectedSet.has(
              item.id,
            )
          }
          onToggle={
            toggleService
          }
        />
      ),
      [
        selectedSet,
        toggleService,
      ],
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <Modal
      visible={
        visible
      }
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={
        onClose
      }
    >
      <View
        style={
          styles.overlay
        }
      >
        <View
          style={[
            styles.sheet,

            {
              paddingBottom:
                Math.max(
                  insets.bottom,
                  FixxamTokens.spacing.lg,
                ),
            },
          ]}
        >
          {/* =================================================
              HANDLE
          ================================================== */}

          <View
            style={
              styles.handle
            }
          />

          {/* =================================================
              HEADER
          ================================================== */}

          <View
            style={
              styles.header
            }
          >
            <Pressable
              onPress={
                onClose
              }
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Close services picker"
              style={({
                pressed,
              }) => [
                styles.headerButton,

                pressed
                  ? styles.pressed
                  : null,
              ]}
            >
              <AppIcon
                name="close"
                size="sm"
                color={
                  Colors.textPrimary
                }
              />
            </Pressable>

            <View
              style={
                styles.headerCenter
              }
            >
              <AppText
                variant="heading2"
                weight="bold"
                center
                numberOfLines={1}
                style={
                  styles.title
                }
              >
                Select Services
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                center
                numberOfLines={2}
                style={
                  styles.subtitle
                }
              >
                Choose the services this material can be used for.
              </AppText>
            </View>

            <View
              style={
                styles.headerButtonPlaceholder
              }
            />
          </View>

          {/* =================================================
              SEARCH
          ================================================== */}

          <View
            style={[
              styles.searchContainer,

              searchFocused
                ? styles.searchContainerFocused
                : null,
            ]}
          >
            <AppIcon
              name="search"
              role="worker"
              size="sm"
              color={
                searchFocused
                  ? WorkerColors.primary
                  : Colors.textMuted
              }
            />

            <TextInput
              value={
                search
              }
              onChangeText={
                setSearch
              }
              onFocus={() => {
                setSearchFocused(
                  true,
                );
              }}
              onBlur={() => {
                setSearchFocused(
                  false,
                );
              }}
              placeholder="Search services..."
              placeholderTextColor={
                Colors.textMuted
              }
              selectionColor={
                WorkerColors.primary
              }
              cursorColor={
                WorkerColors.primary
              }
              autoCorrect={
                false
              }
              autoCapitalize="none"
              returnKeyType="search"
              underlineColorAndroid="transparent"
              accessibilityLabel="Search services"
              style={
                styles.searchInput
              }
            />

            {search.length > 0 ? (
              <Pressable
                onPress={
                  handleClearSearch
                }
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel="Clear service search"
                style={({
                  pressed,
                }) => [
                  styles.searchClearButton,

                  pressed
                    ? styles.pressed
                    : null,
                ]}
              >
                <AppIcon
                  name="close"
                  size="xs"
                  color={
                    Colors.textSecondary
                  }
                />
              </Pressable>
            ) : null}
          </View>

          {/* =================================================
              SELECTION SUMMARY
          ================================================== */}

          <View
            style={
              styles.selectionBar
            }
          >
            <View
              style={
                styles.selectionInfo
              }
            >
              <View
                style={
                  styles.selectionIcon
                }
              >
                <AppIcon
                  name="professional"
                  role="worker"
                  size="sm"
                  color={
                    WorkerColors.primary
                  }
                />
              </View>

              <View
                style={
                  styles.selectionText
                }
              >
                <AppText
                  variant="bodyMedium"
                  weight="bold"
                  style={
                    styles.selectionTitle
                  }
                >
                  {selectedIds.length}{" "}
                  {selectedIds.length ===
                  1
                    ? "service"
                    : "services"}{" "}
                  selected
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  numberOfLines={2}
                  style={
                    styles.selectionDescription
                  }
                >
                  This material will appear under the selected services.
                </AppText>
              </View>
            </View>

            {selectedIds.length >
            0 ? (
              <Pressable
                onPress={
                  handleClear
                }
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel="Clear selected services"
                style={({
                  pressed,
                }) => [
                  styles.clearButton,

                  pressed
                    ? styles.pressed
                    : null,
                ]}
              >
                <AppText
                  variant="caption"
                  weight="bold"
                  style={
                    styles.clearText
                  }
                >
                  Clear
                </AppText>
              </Pressable>
            ) : null}
          </View>

          {/* =================================================
              CONTENT
          ================================================== */}

          {loading ? (
            <View
              style={
                styles.center
              }
              accessibilityRole="progressbar"
              accessibilityLabel="Loading services"
            >
              <View
                style={
                  styles.loadingIcon
                }
              >
                <ActivityIndicator
                  size="large"
                  color={
                    WorkerColors.primary
                  }
                />
              </View>

              <AppText
                variant="body"
                tone="secondary"
                center
                style={
                  styles.loadingText
                }
              >
                Loading services...
              </AppText>
            </View>
          ) : error ? (
            <View
              style={
                styles.error
              }
            >
              <View
                style={
                  styles.errorIcon
                }
              >
                <AppIcon
                  name="error"
                  size="lg"
                  color={
                    Colors.error
                  }
                />
              </View>

              <AppText
                variant="heading3"
                weight="bold"
                center
                style={
                  styles.errorTitle
                }
              >
                Something went wrong
              </AppText>

              <AppText
                variant="body"
                tone="secondary"
                center
                style={
                  styles.errorText
                }
              >
                {error}
              </AppText>

              <View
                style={
                  styles.retryAction
                }
              >
                <AppButton
                  title="Try Again"
                  role="worker"
                  variant="outline"
                  leftIconName="refresh"
                  onPress={() => {
                    void loadServices();
                  }}
                  style={
                    styles.fullWidthButton
                  }
                />
              </View>
            </View>
          ) : (
            <FlatList
              data={
                filteredServices
              }
              renderItem={
                renderItem
              }
              keyExtractor={
                item =>
                  item.id
              }
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[
                styles.list,

                filteredServices.length ===
                0
                  ? styles.emptyList
                  : null,
              ]}
              initialNumToRender={
                10
              }
              maxToRenderPerBatch={
                12
              }
              windowSize={
                7
              }
              ListEmptyComponent={
                <View
                  style={
                    styles.empty
                  }
                >
                  <View
                    style={
                      styles.emptyIcon
                    }
                  >
                    <AppIcon
                      name="search"
                      role="worker"
                      size="lg"
                      color={
                        WorkerColors.primary
                      }
                    />
                  </View>

                  <AppText
                    variant="heading3"
                    weight="bold"
                    center
                    style={
                      styles.emptyTitle
                    }
                  >
                    {search.trim()
                      ? "No Matching Services"
                      : "No Services Available"}
                  </AppText>

                  <AppText
                    variant="body"
                    tone="secondary"
                    center
                    style={
                      styles.emptyText
                    }
                  >
                    {search.trim()
                      ? `No service matches "${search.trim()}".`
                      : "There are no services available right now."}
                  </AppText>

                  {search.trim() ? (
                    <Pressable
                      onPress={
                        handleClearSearch
                      }
                      accessibilityRole="button"
                      accessibilityLabel="Clear service search"
                      style={({
                        pressed,
                      }) => [
                        styles.emptyClearButton,

                        pressed
                          ? styles.pressed
                          : null,
                      ]}
                    >
                      <AppText
                        variant="caption"
                        weight="bold"
                        style={
                          styles.emptyClearText
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

          {/* =================================================
              APPLY
          ================================================== */}

          {!loading &&
          !error ? (
            <View
              style={
                styles.applyContainer
              }
            >
              <AppButton
                title={
                  selectedIds.length >
                  0
                    ? `APPLY SERVICES (${selectedIds.length})`
                    : "APPLY SERVICES"
                }
                role="worker"
                variant="primary"
                leftIconName="check"
                disabled={
                  selectedIds.length ===
                  0
                }
                onPress={
                  handleDone
                }
                style={
                  styles.fullWidthButton
                }
              />
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       OVERLAY
    ======================================================== */

    overlay: {
      flex: 1,

      justifyContent:
        "flex-end",

      backgroundColor:
        Colors.overlayMedium,
    },

    /* ========================================================
       SHEET
    ======================================================== */

    sheet: {
      width: "100%",

      maxHeight:
        "92%",

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      borderTopLeftRadius:
        FixxamTokens.radius.xl,

      borderTopRightRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,
    },

    handle: {
      width: 42,

      height: 4,

      marginBottom:
        FixxamTokens.spacing.md,

      alignSelf:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabled,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      marginBottom:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    headerButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.background,
    },

    headerButtonPlaceholder: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,
    },

    headerCenter: {
      flex: 1,

      minWidth: 0,

      paddingHorizontal:
        FixxamTokens.spacing.sm,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       SEARCH
    ======================================================== */

    searchContainer: {
      minHeight:
        FixxamTokens.size.inputHeight,

      marginBottom:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.search,

      backgroundColor:
        Colors.background,
    },

    searchContainerFocused: {
      borderColor:
        WorkerColors.primary,

      backgroundColor:
        Colors.surface,
    },

    searchInput: {
      flex: 1,

      minHeight:
        FixxamTokens.size.inputHeight,

      marginLeft:
        FixxamTokens.spacing.sm,

      paddingVertical: 0,

      fontSize:
        Typography.fontSize.md,

      color:
        Colors.textPrimary,
    },

    searchClearButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      marginRight:
        -FixxamTokens.spacing.sm,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    /* ========================================================
       SELECTION
    ======================================================== */

    selectionBar: {
      minHeight: 72,

      marginBottom:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        WorkerColors.primarySoft,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    selectionInfo: {
      flex: 1,

      minWidth: 0,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    selectionIcon: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    selectionText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    selectionTitle: {
      color:
        Colors.textPrimary,
    },

    selectionDescription: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 16,

      color:
        Colors.textSecondary,
    },

    clearButton: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    clearText: {
      color:
        WorkerColors.primary,
    },

    /* ========================================================
       LIST
    ======================================================== */

    list: {
      paddingVertical:
        FixxamTokens.spacing.xs,

      paddingBottom:
        FixxamTokens.spacing.md,
    },

    row: {
      minHeight: 70,

      marginBottom:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.background,
    },

    rowSelected: {
      borderColor:
        WorkerColors.primary,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    rowPressed: {
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

    /* ========================================================
       SERVICE ICON
    ======================================================== */

    iconBox: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,
    },

    serviceContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,

      paddingRight:
        FixxamTokens.spacing.sm,
    },

    serviceName: {
      color:
        Colors.textPrimary,
    },

    serviceNameSelected: {
      color:
        WorkerColors.primary,
    },

    serviceDescription: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 16,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       CHECKBOX
    ======================================================== */

    checkbox: {
      width: 26,

      height: 26,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.sm,

      backgroundColor:
        Colors.surface,
    },

    checkboxSelected: {
      borderColor:
        WorkerColors.primary,

      backgroundColor:
        WorkerColors.primary,
    },

    /* ========================================================
       APPLY
    ======================================================== */

    applyContainer: {
      paddingTop:
        FixxamTokens.spacing.sm,
    },

    fullWidthButton: {
      width: "100%",
    },

    /* ========================================================
       LOADING
    ======================================================== */

    center: {
      minHeight: 320,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingIcon: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       ERROR
    ======================================================== */

    error: {
      minHeight: 320,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    errorIcon: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.errorSoft,
    },

    errorTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    errorText: {
      maxWidth: 300,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    retryAction: {
      width: "100%",

      maxWidth: 220,

      marginTop:
        FixxamTokens.spacing.lg,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyList: {
      flexGrow: 1,
    },

    empty: {
      minHeight: 300,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingVertical:
        FixxamTokens.spacing.xxl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    emptyIcon: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    emptyText: {
      maxWidth: 300,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    emptyClearButton: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    emptyClearText: {
      color:
        WorkerColors.primary,
    },

    /* ========================================================
       INTERACTION
    ======================================================== */

    pressed: {
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
  });