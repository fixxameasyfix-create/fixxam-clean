import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { AppText } from "@/components/ui";

import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { WorkerColors } from "@/theme/workerColors";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

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
  onApply: (serviceIds: string[]) => void;
};

/*
 * ============================================================
 * NORMALIZATION
 * ============================================================
 */

function normalizeSearch(
  value: unknown,
): string {
  if (typeof value !== "string") {
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
        .map(normalizeSearch)
        .filter(Boolean),
    ),
  );
}

/*
 * ============================================================
 * ICON
 * ============================================================
 */

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

/*
 * ============================================================
 * SEARCH
 * ============================================================
 */

function getSearchTokens(
  value: string,
): string[] {
  return Array.from(
    new Set(
      normalizeSearch(value)
        .split(" ")
        .map((token) => token.trim())
        .filter(
          (token) => token.length >= 2,
        ),
    ),
  );
}

function matchesService(
  service: ServiceOption,
  searchValue: string,
): boolean {
  const search =
    normalizeSearch(searchValue);

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
      .map(normalizeSearch)
      .filter(Boolean)
      .join(" ");

  /*
   * Exact / partial phrase search.
   */
  if (
    searchableText.includes(search)
  ) {
    return true;
  }

  /*
   * Token search.
   *
   * Example:
   * "ac gas"
   *
   * Can find:
   * "AC Gas Refill"
   */
  const tokens =
    getSearchTokens(search);

  if (!tokens.length) {
    return false;
  }

  return tokens.every(
    (token) =>
      searchableText.includes(token),
  );
}

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function ProductServicesPicker({
  visible,
  value,
  onClose,
  onApply,
}: Props) {
  const [services, setServices] =
    useState<ServiceOption[]>([]);

  const [selectedIds, setSelectedIds] =
    useState<string[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /*
   * ==========================================================
   * LOAD SERVICES
   * ==========================================================
   */

  const loadServices =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

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

        snapshot.docs.forEach(
          (doc) => {
            const data =
              doc.data();

            const name =
              typeof data.name ===
              "string"
                ? data.name.trim()
                : "";

            if (!name) {
              return;
            }

            result.push({
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
          },
        );

        setServices(result);
      } catch (loadError) {
        console.error(
          "ProductServicesPicker services:",
          loadError,
        );

        setServices([]);

        setError(
          "Unable to load services. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  /*
   * ==========================================================
   * OPEN / RESET
   * ==========================================================
   */

  useEffect(() => {
    if (!visible) {
      return;
    }

    const normalizedValue =
      Array.from(
        new Set(
          value
            .filter(
              (id): id is string =>
                typeof id ===
                "string",
            )
            .map((id) =>
              id.trim(),
            )
            .filter(Boolean),
        ),
      );

    setSelectedIds(
      normalizedValue,
    );

    setSearch("");

    void loadServices();
  }, [
    visible,
    value,
    loadServices,
  ]);

  /*
   * ==========================================================
   * FILTER SERVICES
   * ==========================================================
   */

  const filteredServices =
    useMemo(() => {
      const normalizedSearch =
        normalizeSearch(search);

      if (!normalizedSearch) {
        return services;
      }

      return services.filter(
        (service) =>
          matchesService(
            service,
            normalizedSearch,
          ),
      );
    }, [
      search,
      services,
    ]);

  /*
   * ==========================================================
   * TOGGLE SERVICE
   * ==========================================================
   */

  const toggleService =
    useCallback(
      (serviceId: string) => {
        setSelectedIds(
          (current) => {
            if (
              current.includes(
                serviceId,
              )
            ) {
              return current.filter(
                (id) =>
                  id !==
                  serviceId,
              );
            }

            return [
              ...current,
              serviceId,
            ];
          },
        );
      },
      [],
    );

  /*
   * ==========================================================
   * CLEAR SELECTION
   * ==========================================================
   */

  const handleClear =
    useCallback(() => {
      setSelectedIds([]);
    }, []);

  /*
   * ==========================================================
   * CLEAR SEARCH
   * ==========================================================
   */

  const handleClearSearch =
    useCallback(() => {
      setSearch("");
    }, []);

  /*
   * ==========================================================
   * APPLY
   * ==========================================================
   */

  const handleDone =
    useCallback(() => {
      const normalizedIds =
        Array.from(
          new Set(
            selectedIds
              .filter(
                (id): id is string =>
                  typeof id ===
                  "string",
              )
              .map((id) =>
                id.trim(),
              )
              .filter(Boolean),
          ),
        );

      onApply(
        normalizedIds,
      );

      onClose();
    }, [
      selectedIds,
      onApply,
      onClose,
    ]);

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={styles.overlay}
      >
        <View
          style={styles.sheet}
        >
          {/* =================================================
              HEADER
          ================================================== */}

          <View
            style={styles.header}
          >
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={
                styles.headerButton
              }
              accessibilityRole="button"
              accessibilityLabel="Close services picker"
            >
              <Ionicons
                name="close"
                size={23}
                color={
                  WorkerColors.textPrimary
                }
              />
            </Pressable>

            <View
              style={
                styles.headerCenter
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.title
                }
              >
                Select Services
              </AppText>

              <AppText
                style={
                  styles.subtitle
                }
              >
                Choose the services this
                material can be used for.
              </AppText>
            </View>

            <View
              style={
                styles.headerButton
              }
            />
          </View>

          {/* =================================================
              SEARCH
          ================================================== */}

          <View
            style={
              styles.searchContainer
            }
          >
            <Ionicons
              name="search-outline"
              size={21}
              color={
                WorkerColors.textSecondary
              }
            />

            <TextInput
              value={search}
              onChangeText={
                setSearch
              }
              placeholder="Search services..."
              placeholderTextColor={
                WorkerColors.textSecondary
              }
              style={
                styles.searchInput
              }
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              accessibilityLabel="Search services"
            />

            {search.length >
            0 ? (
              <Pressable
                onPress={
                  handleClearSearch
                }
                hitSlop={8}
                style={
                  styles.searchClearButton
                }
                accessibilityRole="button"
                accessibilityLabel="Clear service search"
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={
                    WorkerColors.textSecondary
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
                <Ionicons
                  name="construct-outline"
                  size={19}
                  color={
                    WorkerColors.secondary
                  }
                />
              </View>

              <View
                style={
                  styles.selectionText
                }
              >
                <AppText
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
                  style={
                    styles.selectionDescription
                  }
                >
                  This material will appear
                  under the selected services.
                </AppText>
              </View>
            </View>

            {selectedIds.length >
            0 ? (
              <Pressable
                onPress={
                  handleClear
                }
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Clear selected services"
              >
                <AppText
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
              style={styles.center}
            >
              <ActivityIndicator
                size="large"
                color={
                  WorkerColors.primary
                }
              />

              <AppText
                style={
                  styles.loadingText
                }
              >
                Loading services...
              </AppText>
            </View>
          ) : error ? (
            <View
              style={styles.error}
            >
              <View
                style={
                  styles.errorIcon
                }
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={38}
                  color={
                    WorkerColors.error
                  }
                />
              </View>

              <AppText
                weight="bold"
                style={
                  styles.errorTitle
                }
              >
                Something went wrong
              </AppText>

              <AppText
                center
                style={
                  styles.errorText
                }
              >
                {error}
              </AppText>

              <Pressable
                style={
                  styles.retryButton
                }
                onPress={() =>
                  void loadServices()
                }
                accessibilityRole="button"
                accessibilityLabel="Try loading services again"
              >
                <AppText
                  weight="bold"
                  style={
                    styles.retryText
                  }
                >
                  TRY AGAIN
                </AppText>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={
                filteredServices
              }
              keyExtractor={(
                item,
              ) => item.id}
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={
                styles.list
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
                    <Ionicons
                      name="search-outline"
                      size={46}
                      color={
                        WorkerColors.textSecondary
                      }
                    />
                  </View>

                  <AppText
                    weight="bold"
                    style={
                      styles.emptyTitle
                    }
                  >
                    No Matching Services
                  </AppText>

                  <AppText
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
                      style={
                        styles.emptyClearButton
                      }
                      accessibilityRole="button"
                      accessibilityLabel="Clear service search"
                    >
                      <AppText
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
              renderItem={({
                item,
              }) => {
                const selected =
                  selectedIds.includes(
                    item.id,
                  );

                const icon =
                  getServiceIcon(
                    item.icon,
                  );

                const iconColor =
                  item.color ||
                  WorkerColors.primary;

                const iconBackground =
                  item.backgroundColor ||
                  `${WorkerColors.primary}18`;

                return (
                  <Pressable
                    style={({
                      pressed,
                    }) => [
                      styles.row,
                      selected &&
                        styles.rowSelected,
                      pressed &&
                        styles.rowPressed,
                    ]}
                    onPress={() =>
                      toggleService(
                        item.id,
                      )
                    }
                    accessibilityRole="checkbox"
                    accessibilityState={{
                      checked:
                        selected,
                    }}
                    accessibilityLabel={`Select ${item.name}`}
                  >
                    {/* ICON */}

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
                            : icon
                        }
                        size={23}
                        color={
                          selected
                            ? WorkerColors.background
                            : iconColor
                        }
                      />
                    </View>

                    {/* SERVICE */}

                    <View
                      style={
                        styles.serviceContent
                      }
                    >
                      <AppText
                        weight={
                          selected
                            ? "bold"
                            : undefined
                        }
                        style={
                          styles.serviceName
                        }
                        numberOfLines={
                          2
                        }
                      >
                        {item.name}
                      </AppText>

                      <AppText
                        style={
                          styles.serviceDescription
                        }
                        numberOfLines={
                          1
                        }
                      >
                        Material can be used
                        for this service
                      </AppText>
                    </View>

                    {/* CHECKBOX */}

                    <View
                      style={[
                        styles.checkbox,
                        selected &&
                          styles.checkboxSelected,
                      ]}
                    >
                      {selected ? (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={
                            WorkerColors.background
                          }
                        />
                      ) : null}
                    </View>
                  </Pressable>
                );
              }}
            />
          )}

          {/* =================================================
              APPLY
          ================================================== */}

          {!loading &&
          !error ? (
            <Pressable
              style={[
                styles.doneButton,
                selectedIds.length ===
                  0 &&
                  styles.doneButtonDisabled,
              ]}
              onPress={
                handleDone
              }
              disabled={
                selectedIds.length ===
                0
              }
              accessibilityRole="button"
              accessibilityLabel="Apply selected services"
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={
                  WorkerColors.background
                }
              />

              <AppText
                weight="bold"
                style={
                  styles.doneText
                }
              >
                APPLY SERVICES
                {selectedIds.length >
                0
                  ? ` (${selectedIds.length})`
                  : ""}
              </AppText>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

/*
 * ============================================================
 * STYLES
 * ============================================================
 */

const styles =
  StyleSheet.create({
    /*
     * OVERLAY
     */

    overlay: {
      flex: 1,

      backgroundColor:
        "rgba(15, 23, 42, 0.45)",

      justifyContent:
        "flex-end",
    },

    /*
     * SHEET
     */

    sheet: {
      maxHeight: "92%",

      backgroundColor:
        WorkerColors.surface,

      borderTopLeftRadius: 26,

      borderTopRightRadius: 26,

      paddingTop: 18,

      paddingHorizontal: 16,

      paddingBottom: 20,
    },

    /*
     * HEADER
     */

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom: 12,
    },

    headerButton: {
      width: 40,

      height: 40,

      borderRadius: 20,

      backgroundColor:
        WorkerColors.background,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    headerCenter: {
      flex: 1,

      paddingHorizontal: 10,
    },

    title: {
      textAlign:
        "center",

      fontSize: 20,

      color:
        WorkerColors.textPrimary,
    },

    subtitle: {
      marginTop: 3,

      textAlign:
        "center",

      fontSize: 12,

      lineHeight: 18,

      color:
        WorkerColors.textSecondary,
    },

    /*
     * SEARCH
     */

    searchContainer: {
      height: 50,

      marginBottom: 10,

      paddingHorizontal: 14,

      borderRadius: 15,

      backgroundColor:
        WorkerColors.background,

      borderWidth: 1,

      borderColor:
        WorkerColors.border,

      flexDirection:
        "row",

      alignItems:
        "center",

      elevation: 1,
    },

    searchInput: {
      flex: 1,

      height: "100%",

      marginLeft: 9,

      paddingVertical: 0,

      fontSize: 14,

      color:
        WorkerColors.textPrimary,
    },

    searchClearButton: {
      width: 30,

      height: 30,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    /*
     * SELECTION BAR
     */

    selectionBar: {
      minHeight: 66,

      marginBottom: 10,

      padding: 10,

      borderRadius: 16,

      backgroundColor:
        `${WorkerColors.secondary}12`,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    selectionInfo: {
      flex: 1,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    selectionIcon: {
      width: 42,

      height: 42,

      borderRadius: 13,

      backgroundColor:
        `${WorkerColors.secondary}22`,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    selectionText: {
      flex: 1,

      marginLeft: 10,
    },

    selectionTitle: {
      fontSize: 13,

      color:
        WorkerColors.textPrimary,
    },

    selectionDescription: {
      marginTop: 2,

      fontSize: 11,

      lineHeight: 16,

      color:
        WorkerColors.textSecondary,
    },

    clearText: {
      marginLeft: 8,

      fontSize: 12,

      color:
        WorkerColors.primary,
    },

    /*
     * LIST
     */

    list: {
      paddingVertical: 6,

      paddingBottom: 12,
    },

    /*
     * SERVICE ROW
     */

    row: {
      minHeight: 70,

      marginBottom: 8,

      paddingHorizontal: 12,

      borderRadius: 16,

      backgroundColor:
        WorkerColors.background,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        WorkerColors.background,
    },

    rowSelected: {
      backgroundColor:
        `${WorkerColors.primary}12`,

      borderColor:
        `${WorkerColors.primary}45`,
    },

    rowPressed: {
      opacity: 0.72,
    },

    /*
     * ICON
     */

    iconBox: {
      width: 46,

      height: 46,

      borderRadius: 14,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    /*
     * SERVICE CONTENT
     */

    serviceContent: {
      flex: 1,

      marginLeft: 12,

      paddingRight: 8,
    },

    serviceName: {
      fontSize: 15,

      lineHeight: 20,

      color:
        WorkerColors.textPrimary,
    },

    serviceDescription: {
      marginTop: 3,

      fontSize: 11,

      lineHeight: 16,

      color:
        WorkerColors.textSecondary,
    },

    /*
     * CHECKBOX
     */

    checkbox: {
      width: 25,

      height: 25,

      borderRadius: 8,

      borderWidth: 1.5,

      borderColor:
        WorkerColors.border,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        WorkerColors.background,
    },

    checkboxSelected: {
      borderColor:
        WorkerColors.primary,

      backgroundColor:
        WorkerColors.primary,
    },

    /*
     * APPLY BUTTON
     */

    doneButton: {
      minHeight: 52,

      marginTop: 8,

      borderRadius: 15,

      backgroundColor:
        WorkerColors.primary,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 8,
    },

    doneButtonDisabled: {
      backgroundColor:
        WorkerColors.border,
    },

    doneText: {
      fontSize: 13,

      color:
        WorkerColors.background,

      letterSpacing: 0.3,
    },

    /*
     * LOADING
     */

    center: {
      minHeight: 320,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingText: {
      marginTop: 10,

      fontSize: 13,

      color:
        WorkerColors.textSecondary,
    },

    /*
     * ERROR
     */

    error: {
      minHeight: 320,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal: 30,
    },

    errorIcon: {
      width: 76,

      height: 76,

      borderRadius: 24,

      backgroundColor:
        `${WorkerColors.error}12`,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    errorTitle: {
      marginTop: 14,

      fontSize: 18,

      color:
        WorkerColors.textPrimary,
    },

    errorText: {
      marginTop: 7,

      fontSize: 13,

      lineHeight: 20,

      color:
        WorkerColors.textSecondary,
    },

    retryButton: {
      marginTop: 16,

      paddingHorizontal: 20,

      paddingVertical: 11,

      borderRadius: 12,

      backgroundColor:
        `${WorkerColors.primary}12`,
    },

    retryText: {
      fontSize: 12,

      color:
        WorkerColors.primary,
    },

    /*
     * EMPTY
     */

    empty: {
      paddingVertical: 70,

      alignItems:
        "center",

      paddingHorizontal: 25,
    },

    emptyIcon: {
      width: 82,

      height: 82,

      borderRadius: 26,

      backgroundColor:
        WorkerColors.surface,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    emptyTitle: {
      marginTop: 14,

      fontSize: 18,

      color:
        WorkerColors.textPrimary,
    },

    emptyText: {
      marginTop: 6,

      fontSize: 13,

      lineHeight: 20,

      color:
        WorkerColors.textSecondary,
    },

    emptyClearButton: {
      marginTop: 16,

      paddingHorizontal: 18,

      paddingVertical: 10,

      borderRadius: 11,

      backgroundColor:
        `${WorkerColors.primary}12`,
    },

    emptyClearText: {
      fontSize: 12,

      color:
        WorkerColors.primary,
    },
  });