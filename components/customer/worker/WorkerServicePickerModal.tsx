import React, {
  memo,
  useCallback,
  useMemo,
} from "react";

import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

/*
 * IMPORTANT:
 * Keep this service icon renderer.
 * It preserves the exact service icon,
 * color and background coming from Firebase.
 */
import ServiceIcon from "@/components/common/AppIcon";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

export type WorkerService = {
  id: string;

  name?: string;

  price?: number;

  icon?: string;

  color?: string;

  backgroundColor?: string;
};

type Props = {
  visible: boolean;

  services: WorkerService[];

  selectedServices: string[];

  onToggle: (
    serviceId: string,
  ) => void;

  onClose: () => void;

  onContinue: () => void;
};

type ServiceRowProps = {
  service: WorkerService;

  selected: boolean;

  disabled: boolean;

  onToggle: (
    serviceId: string,
  ) => void;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_SELECTED_SERVICES =
  4;

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value.trim();
}

function normalizePrice(
  value: unknown,
): number {
  if (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
  ) {
    return Math.max(
      0,
      value,
    );
  }

  if (
    typeof value ===
    "string"
  ) {
    const parsed =
      Number(
        value.replace(
          /,/g,
          "",
        ),
      );

    if (
      Number.isFinite(
        parsed,
      )
    ) {
      return Math.max(
        0,
        parsed,
      );
    }
  }

  return 0;
}

function formatPrice(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-NG",
    {
      maximumFractionDigits:
        0,
    },
  ).format(value);
}

/* ==============================================================
   SERVICE ROW
============================================================== */

const ServiceRow =
  memo(function ServiceRow({
    service,
    selected,
    disabled,
    onToggle,
  }: ServiceRowProps) {
    const serviceId =
      cleanString(
        service.id,
      );

    const serviceName =
      cleanString(
        service.name,
      ) ||
      "Unnamed Service";

    const price =
      normalizePrice(
        service.price,
      );

    const handlePress =
      useCallback(() => {
        if (
          !serviceId ||
          disabled
        ) {
          return;
        }

        onToggle(
          serviceId,
        );
      }, [
        disabled,
        onToggle,
        serviceId,
      ]);

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${serviceName} service`}
        accessibilityState={{
          selected,
          disabled,
        }}
        disabled={
          disabled
        }
        onPress={
          handlePress
        }
        style={({
          pressed,
        }) => [
          styles.serviceCard,

          selected
            ? styles.selectedCard
            : null,

          disabled
            ? styles.serviceCardDisabled
            : null,

          pressed &&
          !disabled
            ? styles.pressed
            : null,
        ]}
      >
        {/* ====================================================
            SERVICE
        ==================================================== */}

        <View
          style={
            styles.serviceLeft
          }
        >
          <ServiceIcon
            icon={
              service.icon
            }
            color={
              service.color
            }
            backgroundColor={
              service.backgroundColor
            }
            containerSize={40}
            size={18}
          />

          <View
            style={
              styles.serviceInfo
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              numberOfLines={1}
              style={
                selected
                  ? styles.selectedName
                  : undefined
              }
            >
              {serviceName}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.servicePrice
              }
            >
              ₦
              {formatPrice(
                price,
              )}
            </AppText>
          </View>
        </View>

        {/* ====================================================
            SELECTION
        ==================================================== */}

        <View
          style={[
            styles.selectionIndicator,

            selected
              ? styles.selectionIndicatorSelected
              : null,
          ]}
        >
          {selected ? (
            <AppIcon
              name="check"
              role="customer"
              size="xs"
              color={
                Colors.textInverse
              }
            />
          ) : null}
        </View>
      </Pressable>
    );
  });

/* ==============================================================
   SEPARATOR
============================================================== */

function ServiceSeparator() {
  return (
    <View
      style={
        styles.separator
      }
    />
  );
}

/* ==============================================================
   COMPONENT
============================================================== */

export default function WorkerServicePickerModal({
  visible,
  services,
  selectedServices,
  onToggle,
  onClose,
  onContinue,
}: Props) {
  const insets =
    useSafeAreaInsets();

  /* ============================================================
     NORMALIZE SELECTION
  ============================================================ */

  const availableServiceIds =
    useMemo(
      () =>
        new Set(
          services
            .map(
              (
                service,
              ) =>
                cleanString(
                  service.id,
                ),
            )
            .filter(
              Boolean,
            ),
        ),
      [
        services,
      ],
    );

  const validSelectedServices =
    useMemo(
      () =>
        Array.from(
          new Set(
            selectedServices
              .map(
                cleanString,
              )
              .filter(
                (
                  serviceId,
                ) =>
                  Boolean(
                    serviceId,
                  ) &&
                  availableServiceIds.has(
                    serviceId,
                  ),
              ),
          ),
        ),
      [
        availableServiceIds,
        selectedServices,
      ],
    );

  const selectedCount =
    validSelectedServices.length;

  const canContinue =
    selectedCount > 0;

  const selectionLimitReached =
    selectedCount >=
    MAX_SELECTED_SERVICES;

  /* ============================================================
     TOTAL
  ============================================================ */

  const selectedTotal =
    useMemo(() => {
      const selectedSet =
        new Set(
          validSelectedServices,
        );

      return services.reduce(
        (
          total,
          service,
        ) => {
          if (
            !selectedSet.has(
              cleanString(
                service.id,
              ),
            )
          ) {
            return total;
          }

          return (
            total +
            normalizePrice(
              service.price,
            )
          );
        },
        0,
      );
    }, [
      services,
      validSelectedServices,
    ]);

  /* ============================================================
     TOGGLE
  ============================================================ */

  const handleToggle =
    useCallback(
      (
        serviceId: string,
      ) => {
        const cleanId =
          cleanString(
            serviceId,
          );

        if (
          !cleanId
        ) {
          return;
        }

        const alreadySelected =
          validSelectedServices.includes(
            cleanId,
          );

        if (
          !alreadySelected &&
          selectionLimitReached
        ) {
          return;
        }

        onToggle(
          cleanId,
        );
      },
      [
        onToggle,
        selectionLimitReached,
        validSelectedServices,
      ],
    );

  /* ============================================================
     RENDER ITEM
  ============================================================ */

  const renderService =
    useCallback(
      ({
        item,
      }: {
        item:
          WorkerService;
      }) => {
        const serviceId =
          cleanString(
            item.id,
          );

        const selected =
          validSelectedServices.includes(
            serviceId,
          );

        const disabled =
          !selected &&
          selectionLimitReached;

        return (
          <ServiceRow
            service={
              item
            }
            selected={
              selected
            }
            disabled={
              disabled
            }
            onToggle={
              handleToggle
            }
          />
        );
      },
      [
        handleToggle,
        selectionLimitReached,
        validSelectedServices,
      ],
    );

  /* ============================================================
     UI
  ============================================================ */

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
          style={
            styles.sheet
          }
        >
          {/* ==================================================
              HEADER
          ================================================== */}

          <View
            style={
              styles.header
            }
          >
            <View
              style={
                styles.headerText
              }
            >
              <AppText
                variant="heading3"
                weight="bold"
                numberOfLines={1}
              >
                Choose Services
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.subtitle
                }
              >
                Select up to{" "}
                {MAX_SELECTED_SERVICES}{" "}
                services
              </AppText>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close service selection"
              hitSlop={8}
              onPress={
                onClose
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
                role="customer"
                size="sm"
                state="muted"
              />
            </Pressable>
          </View>

          {/* ==================================================
              SERVICES
          ================================================== */}

          <FlatList
            data={
              services
            }
            keyExtractor={(
              item,
            ) =>
              item.id
            }
            renderItem={
              renderService
            }
            ItemSeparatorComponent={
              ServiceSeparator
            }
            showsVerticalScrollIndicator={
              false
            }
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              services.length ===
              0
                ? styles.emptyListContent
                : styles.servicesContent
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
                    name="service"
                    role="customer"
                    size="lg"
                    state="muted"
                  />
                </View>

                <AppText
                  variant="bodyMedium"
                  weight="bold"
                  center
                  style={
                    styles.emptyTitle
                  }
                >
                  No services available
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  center
                  style={
                    styles.emptyText
                  }
                >
                  This worker has not
                  added any services yet.
                </AppText>
              </View>
            }
          />

          {/* ==================================================
              FOOTER
          ================================================== */}

          <View
            style={[
              styles.footer,

              {
                paddingBottom:
                  Math.max(
                    insets.bottom,
                    FixxamTokens
                      .spacing.md,
                  ),
              },
            ]}
          >
            <View
              style={
                styles.summary
              }
            >
              <View>
                <AppText
                  variant="caption"
                  tone="secondary"
                >
                  Selected
                </AppText>

                <AppText
                  variant="bodyMedium"
                  weight="bold"
                  style={
                    styles.summaryCount
                  }
                >
                  {selectedCount} /{" "}
                  {MAX_SELECTED_SERVICES}
                </AppText>
              </View>

              {selectedCount >
              0 ? (
                <View
                  style={
                    styles.totalBox
                  }
                >
                  <AppText
                    variant="caption"
                    tone="secondary"
                  >
                    Selected total
                  </AppText>

                  <AppText
                    variant="bodyMedium"
                    weight="bold"
                    style={
                      styles.total
                    }
                  >
                    ₦
                    {formatPrice(
                      selectedTotal,
                    )}
                  </AppText>
                </View>
              ) : null}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue with selected services"
              accessibilityState={{
                disabled:
                  !canContinue,
              }}
              disabled={
                !canContinue
              }
              onPress={
                onContinue
              }
              style={({
                pressed,
              }) => [
                styles.continueButton,

                !canContinue
                  ? styles.disabledButton
                  : null,

                pressed &&
                canContinue
                  ? styles.pressed
                  : null,
              ]}
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
                style={
                  styles.continueText
                }
              >
                Continue
              </AppText>

              <AppIcon
                name="next"
                role="customer"
                size="xs"
                color={
                  Colors.textInverse
                }
              />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       OVERLAY / SHEET
    ======================================================== */

    overlay: {
      flex: 1,

      justifyContent:
        "flex-end",

      backgroundColor:
        Colors.overlayMedium,
    },

    sheet: {
      height: "68%",

      overflow:
        "hidden",

      borderTopLeftRadius:
        FixxamTokens.radius.xl,

      borderTopRightRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.background,

      ...FixxamTokens.shadow.modal,
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

      justifyContent:
        "space-between",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingVertical:
        FixxamTokens.spacing.md,

      borderBottomWidth: 1,

      borderBottomColor:
        Colors.divider,

      backgroundColor:
        Colors.surface,
    },

    headerText: {
      flex: 1,

      minWidth: 0,

      paddingRight:
        FixxamTokens.spacing.md,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    closeButton: {
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
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    /* ========================================================
       LIST
    ======================================================== */

    servicesContent: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingVertical:
        FixxamTokens.spacing.md,
    },

    separator: {
      height:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       SERVICE CARD
    ======================================================== */

    serviceCard: {
      minHeight:
        FixxamTokens.size
          .cardMinHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    selectedCard: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    serviceCardDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    serviceLeft: {
      flex: 1,

      minWidth: 0,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingRight:
        FixxamTokens.spacing.sm,
    },

    serviceInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    selectedName: {
      color:
        CustomerColors.primaryDark,
    },

    servicePrice: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       SELECTION
    ======================================================== */

    selectionIndicator: {
      width: 24,

      height: 24,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 2,

      borderColor:
        Colors.disabled,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    selectionIndicatorSelected: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primary,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyListContent: {
      flexGrow: 1,

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingVertical:
        FixxamTokens.spacing.xxl,
    },

    empty: {
      alignItems:
        "center",

      justifyContent:
        "center",

      padding:
        FixxamTokens.spacing.xl,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    emptyIcon: {
      width:
        FixxamTokens.size
          .avatarLg,

      height:
        FixxamTokens.size
          .avatarLg,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.md,
    },

    emptyText: {
      maxWidth: 280,

      marginTop:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       FOOTER
    ======================================================== */

    footer: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.md,

      borderTopWidth: 1,

      borderTopColor:
        Colors.divider,

      backgroundColor:
        Colors.surface,
    },

    summary: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        FixxamTokens.spacing.md,
    },

    summaryCount: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    totalBox: {
      alignItems:
        "flex-end",
    },

    total: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        CustomerColors.primary,
    },

    /* ========================================================
       CONTINUE
    ======================================================== */

    continueButton: {
      minHeight:
        FixxamTokens.size
          .buttonHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    continueText: {
      color:
        Colors.textInverse,
    },

    disabledButton: {
      backgroundColor:
        Colors.disabled,
    },

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