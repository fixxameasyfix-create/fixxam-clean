import React, {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  AppButton,
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import {
  getServices,
  ServiceItem,
} from "@/constants/serviceLoader";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  subcategory: string;

  selectedServices: string[];

  setSelectedServices: React.Dispatch<
    React.SetStateAction<string[]>
  >;
};

/* ============================================================
   CONSTANTS
============================================================ */

const MAX_SERVICES = 4;

/* ============================================================
   COMPONENT
============================================================ */

function ServiceSelector({
  subcategory,
  selectedServices,
  setSelectedServices,
}: Props) {
  const [visible, setVisible] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const availableServices =
    useMemo<ServiceItem[]>(() => {
      if (!subcategory) {
        return [];
      }

      try {
        return getServices(
          subcategory,
        );
      } catch {
        return [];
      }
    }, [subcategory]);

  const normalizedSearch =
    search
      .trim()
      .toLowerCase();

  const filteredServices =
    useMemo(() => {
      if (!normalizedSearch) {
        return availableServices;
      }

      return availableServices.filter(
        (item) =>
          item.name
            .toLowerCase()
            .includes(
              normalizedSearch,
            ),
      );
    }, [
      availableServices,
      normalizedSearch,
    ]);

  const selectedItems =
    useMemo(
      () =>
        selectedServices
          .map(
            (serviceId) =>
              availableServices.find(
                (service) =>
                  service.id ===
                  serviceId,
              ),
          )
          .filter(
            (
              service,
            ): service is ServiceItem =>
              Boolean(service),
          ),
      [
        availableServices,
        selectedServices,
      ],
    );

  const openModal =
    useCallback(() => {
      setVisible(true);
    }, []);

  const closeModal =
    useCallback(() => {
      setVisible(false);
      setSearch("");
    }, []);

  const toggleService =
    useCallback(
      (
        serviceId: string,
      ) => {
        setSelectedServices(
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

            if (
              current.length >=
              MAX_SERVICES
            ) {
              return current;
            }

            return [
              ...current,
              serviceId,
            ];
          },
        );
      },
      [setSelectedServices],
    );

  return (
    <>
      <AppText
        variant="caption"
        weight="medium"
        style={
          styles.label
        }
      >
        Services (Max 4)
      </AppText>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Select services"
        accessibilityState={{
          expanded: visible,
        }}
        onPress={
          openModal
        }
        style={({
          pressed,
        }) => [
          styles.selector,

          pressed
            ? styles.pressed
            : null,
        ]}
      >
        <AppText
          variant="body"
          tone={
            selectedServices.length >
            0
              ? "primary"
              : "secondary"
          }
          numberOfLines={1}
          style={
            styles.selectorText
          }
        >
          {selectedServices.length >
          0
            ? `${selectedServices.length} Services Selected`
            : "Select Services"}
        </AppText>

        <AppIcon
          name="down"
          role="worker"
          size="sm"
          state="active"
        />
      </Pressable>

      <AppText
        variant="caption"
        tone="secondary"
        style={
          styles.counter
        }
      >
        Selected:{" "}
        {selectedServices.length}/
        {MAX_SERVICES}
      </AppText>

      {selectedItems.length >
      0 ? (
        <View
          style={
            styles.selectedContainer
          }
        >
          {selectedItems.map(
            (service) => (
              <Pressable
                key={
                  service.id
                }
                accessibilityRole="button"
                accessibilityLabel={`Remove ${service.name}`}
                onPress={() =>
                  toggleService(
                    service.id,
                  )
                }
                style={({
                  pressed,
                }) => [
                  styles.selectedChip,

                  pressed
                    ? styles.pressed
                    : null,
                ]}
              >
                <AppText
                  variant="caption"
                  weight="medium"
                  numberOfLines={1}
                  style={
                    styles.selectedText
                  }
                >
                  {
                    service.name
                  }
                </AppText>

                <AppIcon
                  name="close"
                  role="worker"
                  size="xs"
                  state="active"
                />
              </Pressable>
            ),
          )}
        </View>
      ) : null}

      <Modal
        visible={visible}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={
          closeModal
        }
      >
        <View
          style={
            styles.overlay
          }
        >
          <View
            style={
              styles.modal
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <AppText
                variant="heading3"
                weight="bold"
                style={
                  styles.modalTitle
                }
              >
                Select Services
              </AppText>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close service selector"
                onPress={
                  closeModal
                }
                style={({
                  pressed,
                }) => [
                  styles.closeButton,

                  pressed
                    ? styles.pressed
                    : null,
                ]}
              >
                <AppIcon
                  name="close"
                  role="worker"
                  size="sm"
                  state="muted"
                />
              </Pressable>
            </View>

            <View
              style={
                styles.searchContainer
              }
            >
              <AppIcon
                name="search"
                role="worker"
                size="sm"
                state="muted"
              />

              <TextInput
                placeholder="Search services..."
                placeholderTextColor={
                  Colors.textMuted
                }
                value={
                  search
                }
                onChangeText={
                  setSearch
                }
                selectionColor={
                  WorkerColors.primary
                }
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                maxLength={80}
                style={
                  styles.searchInput
                }
              />

              {search.length >
              0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear service search"
                  onPress={() =>
                    setSearch("")
                  }
                  hitSlop={
                    FixxamTokens.spacing.sm
                  }
                >
                  <AppIcon
                    name="close"
                    role="worker"
                    size="xs"
                    state="muted"
                  />
                </Pressable>
              ) : null}
            </View>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.modalCounter
              }
            >
              Selected:{" "}
              {
                selectedServices.length
              }
              /{MAX_SERVICES}
            </AppText>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={
                styles.scrollContent
              }
            >
              {filteredServices.map(
                (item) => {
                  const selected =
                    selectedServices.includes(
                      item.id,
                    );

                  const disabled =
                    !selected &&
                    selectedServices.length >=
                      MAX_SERVICES;

                  return (
                    <Pressable
                      key={
                        item.id
                      }
                      accessibilityRole="checkbox"
                      accessibilityState={{
                        checked:
                          selected,
                        disabled,
                      }}
                      disabled={
                        disabled
                      }
                      onPress={() =>
                        toggleService(
                          item.id,
                        )
                      }
                      style={({
                        pressed,
                      }) => [
                        styles.serviceItem,

                        selected
                          ? styles.serviceItemSelected
                          : null,

                        disabled
                          ? styles.serviceItemDisabled
                          : null,

                        pressed
                          ? styles.pressed
                          : null,
                      ]}
                    >
                      <AppText
                        variant="body"
                        weight={
                          selected
                            ? "medium"
                            : "regular"
                        }
                        numberOfLines={2}
                        style={[
                          styles.serviceText,

                          selected
                            ? styles.serviceTextSelected
                            : null,
                        ]}
                      >
                        {
                          item.name
                        }
                      </AppText>

                      {selected ? (
                        <AppIcon
                          name="check"
                          role="worker"
                          size="sm"
                          color={
                            Colors.textInverse
                          }
                        />
                      ) : null}
                    </Pressable>
                  );
                },
              )}

              {filteredServices.length ===
              0 ? (
                <View
                  style={
                    styles.emptyState
                  }
                >
                  <AppText
                    variant="body"
                    tone="secondary"
                    center
                  >
                    No services found.
                  </AppText>
                </View>
              ) : null}
            </ScrollView>

            <AppButton
              title="Done"
              role="worker"
              variant="primary"
              size="md"
              onPress={
                closeModal
              }
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

export default memo(
  ServiceSelector,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    label: {
      marginBottom:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    selector: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      borderWidth: 1,

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.input,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      backgroundColor:
        Colors.surface,

      marginBottom:
        FixxamTokens.spacing.xs,
    },

    selectorText: {
      flex: 1,

      minWidth: 0,
    },

    counter: {
      marginBottom:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },

    selectedContainer: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        FixxamTokens.spacing.xs,

      marginBottom:
        FixxamTokens.spacing.sm,
    },

    selectedChip: {
      maxWidth:
        "100%",

      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      backgroundColor:
        WorkerColors.primarySoft,

      borderWidth: 1,

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.full,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    selectedText: {
      flexShrink: 1,

      color:
        WorkerColors.primary,
    },

    overlay: {
      flex: 1,

      backgroundColor:
        "rgba(15, 23, 42, 0.45)",

      justifyContent:
        "flex-end",
    },

    modal: {
      maxHeight:
        "80%",

      backgroundColor:
        Colors.surface,

      padding:
        FixxamTokens.spacing.md,

      borderTopLeftRadius:
        FixxamTokens.radius.xl,

      borderTopRightRadius:
        FixxamTokens.radius.xl,
    },

    modalHeader: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.md,
    },

    modalTitle: {
      flex: 1,

      color:
        Colors.textPrimary,
    },

    closeButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,
    },

    searchContainer: {
      minHeight:
        FixxamTokens.size.inputHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.search,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.background,

      marginBottom:
        FixxamTokens.spacing.md,
    },

    searchInput: {
      flex: 1,

      minWidth: 0,

      paddingVertical: 0,

      color:
        Colors.textPrimary,

      fontSize: 14,
    },

    modalCounter: {
      marginBottom:
        FixxamTokens.spacing.sm,

      color:
        Colors.textSecondary,
    },

    scrollContent: {
      paddingBottom:
        FixxamTokens.spacing.md,
    },

    serviceItem: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.sm,

      backgroundColor:
        Colors.surface,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,
    },

    serviceItemSelected: {
      backgroundColor:
        WorkerColors.primary,

      borderColor:
        WorkerColors.primary,
    },

    serviceItemDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    serviceText: {
      flex: 1,

      color:
        Colors.textPrimary,
    },

    serviceTextSelected: {
      color:
        Colors.textInverse,
    },

    emptyState: {
      paddingVertical:
        FixxamTokens.spacing.xxl,
    },

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },
  });