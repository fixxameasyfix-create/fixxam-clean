import React, {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

export type OrderDeletionCounts = {
  pending: number;
  active: number;
  completed: number;
  cancelled: number;
};

export type OrderDeletionFilter =
  | "all"
  | "pending"
  | "active"
  | "completed"
  | "cancelled";

type DeletableStatus =
  | "completed"
  | "cancelled";

type OrderRowFilter =
  | "pending"
  | "active"
  | "completed"
  | "cancelled";

type OrderTone =
  | "pending"
  | "active"
  | "completed"
  | "cancelled";

type Props = {
  visible: boolean;
  counts: OrderDeletionCounts;
  selectedFilter: OrderDeletionFilter;
  onClose: () => void;
  onFilterSelect: (
    filter: OrderDeletionFilter,
  ) => void;
  onDeleted?: () => void;
};

type RowIcon =
  | "clock"
  | "service"
  | "success"
  | "error";

type RowConfig = {
  filter: OrderRowFilter;
  label: string;
  count: number;
  icon: RowIcon;
  tone: OrderTone;
  deletable: boolean;
};

/* ============================================================
   CONSTANTS
============================================================ */

const BATCH_LIMIT = 450;

/* ============================================================
   HELPERS
============================================================ */

function normalizeCount(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(value),
  );
}

function showError(
  title: string,
  message: string,
) {
  Toast.show({
    type: "error",
    text1: title,
    text2: message,
  });
}

function showSuccess(
  title: string,
  message: string,
) {
  Toast.show({
    type: "success",
    text1: title,
    text2: message,
  });
}

function getToneColors(
  tone: OrderTone,
) {
  switch (tone) {
    case "pending":
      return {
        color: Colors.warning,
        background:
          Colors.warningSoft,
      };

    case "active":
      return {
        color: Colors.info,
        background:
          Colors.infoSoft,
      };

    case "completed":
      return {
        color: Colors.success,
        background:
          Colors.successSoft,
      };

    case "cancelled":
      return {
        color: Colors.error,
        background:
          Colors.errorSoft,
      };
  }
}

/* ============================================================
   COMPONENT
============================================================ */

function OrderDeletionManager({
  visible,
  counts,
  selectedFilter,
  onClose,
  onFilterSelect,
  onDeleted,
}: Props) {
  const insets =
    useSafeAreaInsets();

  const [
    deletingStatus,
    setDeletingStatus,
  ] =
    useState<DeletableStatus | null>(
      null,
    );

  /* ==========================================================
     SAFE COUNTS
  ========================================================== */

  const safeCounts =
    useMemo(
      () => ({
        pending:
          normalizeCount(
            counts.pending,
          ),

        active:
          normalizeCount(
            counts.active,
          ),

        completed:
          normalizeCount(
            counts.completed,
          ),

        cancelled:
          normalizeCount(
            counts.cancelled,
          ),
      }),
      [
        counts.pending,
        counts.active,
        counts.completed,
        counts.cancelled,
      ],
    );

  const total =
    safeCounts.pending +
    safeCounts.active +
    safeCounts.completed +
    safeCounts.cancelled;

  /* ==========================================================
     ROWS
  ========================================================== */

  const rows =
    useMemo<RowConfig[]>(
      () => [
        {
          filter: "pending",
          label: "Pending",
          count:
            safeCounts.pending,
          icon: "clock",
          tone: "pending",
          deletable: false,
        },

        {
          filter: "active",
          label: "Active",
          count:
            safeCounts.active,
          icon: "service",
          tone: "active",
          deletable: false,
        },

        {
          filter: "completed",
          label: "Completed",
          count:
            safeCounts.completed,
          icon: "success",
          tone: "completed",
          deletable: true,
        },

        {
          filter: "cancelled",
          label: "Cancelled",
          count:
            safeCounts.cancelled,
          icon: "error",
          tone: "cancelled",
          deletable: true,
        },
      ],
      [
        safeCounts.pending,
        safeCounts.active,
        safeCounts.completed,
        safeCounts.cancelled,
      ],
    );

  /* ==========================================================
     CLOSE
  ========================================================== */

  const handleClose =
    useCallback(() => {
      if (
        deletingStatus !== null
      ) {
        return;
      }

      onClose();
    }, [
      deletingStatus,
      onClose,
    ]);

  /* ==========================================================
     FILTER
  ========================================================== */

  const handleFilter =
    useCallback(
      (
        filter: OrderDeletionFilter,
      ) => {
        if (
          deletingStatus !== null
        ) {
          return;
        }

        onFilterSelect(
          filter,
        );

        onClose();
      },
      [
        deletingStatus,
        onClose,
        onFilterSelect,
      ],
    );

  /* ==========================================================
     EXECUTE DELETE
  ========================================================== */

  const executeDelete =
    useCallback(
      async (
        status: DeletableStatus,
      ) => {
        if (
          deletingStatus !== null
        ) {
          return;
        }

        const userId =
          auth.currentUser?.uid?.trim();

        if (!userId) {
          showError(
            "Sign in required",
            "Please sign in again before deleting order history.",
          );

          return;
        }

        const statusLabel =
          status === "completed"
            ? "Completed"
            : "Cancelled";

        try {
          setDeletingStatus(
            status,
          );

          const bookingsRef =
            collection(
              db,
              "bookings",
            );

          const ordersQuery =
            query(
              bookingsRef,

              where(
                "customerId",
                "==",
                userId,
              ),

              where(
                "status",
                "==",
                status,
              ),
            );

          const snapshot =
            await getDocs(
              ordersQuery,
            );

          const targetOrders =
            snapshot.docs.filter(
              (order) =>
                order.data()
                  .deletedByCustomer !==
                true,
            );

          if (
            targetOrders.length === 0
          ) {
            showError(
              "Nothing to delete",
              `There are no ${statusLabel.toLowerCase()} orders available to remove.`,
            );

            return;
          }

          /* ==================================================
             FIRESTORE BATCHES

             Firestore max = 500 writes.
             We intentionally use 450.
          ================================================== */

          for (
            let start = 0;
            start <
            targetOrders.length;
            start += BATCH_LIMIT
          ) {
            const chunk =
              targetOrders.slice(
                start,
                start +
                  BATCH_LIMIT,
              );

            const batch =
              writeBatch(db);

            for (
              const order of chunk
            ) {
              const orderRef =
                doc(
                  db,
                  "bookings",
                  order.id,
                );

              batch.update(
                orderRef,
                {
                  deletedByCustomer:
                    true,

                  deletedAt:
                    serverTimestamp(),

                  updatedAt:
                    serverTimestamp(),
                },
              );
            }

            await batch.commit();
          }

          onClose();

          try {
            onDeleted?.();
          } catch (
            callbackError
          ) {
            console.error(
              "CUSTOMER_ORDER_DELETE_CALLBACK_ERROR",
              callbackError,
            );
          }

          showSuccess(
            "History removed",
            `${targetOrders.length} ${statusLabel.toLowerCase()} ${
              targetOrders.length === 1
                ? "order"
                : "orders"
            } removed from your history.`,
          );
        } catch (error) {
          console.error(
            "CUSTOMER_ORDER_SOFT_DELETE_ERROR",
            error,
          );

          const firebaseCode =
            (
              error as {
                code?: string;
              }
            )?.code;

          if (
            firebaseCode ===
            "permission-denied"
          ) {
            showError(
              "Permission denied",
              "You do not have permission to remove these orders.",
            );
          } else {
            showError(
              "Unable to delete",
              "We could not remove these orders from your history. Please try again.",
            );
          }
        } finally {
          setDeletingStatus(
            null,
          );
        }
      },
      [
        deletingStatus,
        onClose,
        onDeleted,
      ],
    );

  /* ==========================================================
     DELETE CONFIRMATION
  ========================================================== */

  const handleDelete =
    useCallback(
      (
        status: DeletableStatus,
      ) => {
        if (
          deletingStatus !== null
        ) {
          return;
        }

        const count =
          status === "completed"
            ? safeCounts.completed
            : safeCounts.cancelled;

        if (count <= 0) {
          showError(
            "Nothing to delete",
            "There are no orders available to remove.",
          );

          return;
        }

        const statusLabel =
          status === "completed"
            ? "Completed"
            : "Cancelled";

        /*
         * Keep Alert only here because this
         * is a destructive confirmation.
         */

        Alert.alert(
          `Delete ${statusLabel} orders?`,

          `You have ${count} ${statusLabel.toLowerCase()} ${
            count === 1
              ? "order"
              : "orders"
          }.\n\nThey will be removed from your order history. This action cannot be undone.`,

          [
            {
              text: "Keep",
              style: "cancel",
            },

            {
              text:
                `Delete ${count}`,
              style:
                "destructive",

              onPress: () => {
                void executeDelete(
                  status,
                );
              },
            },
          ],
        );
      },
      [
        deletingStatus,
        executeDelete,
        safeCounts.completed,
        safeCounts.cancelled,
      ],
    );

  /* ==========================================================
     RENDER ROW
  ========================================================== */

  const renderRow =
    useCallback(
      (
        row: RowConfig,
      ) => {
        const {
          filter,
          label,
          count,
          icon,
          tone,
          deletable,
        } = row;

        const busy =
          deletingStatus !== null;

        const isSelected =
          selectedFilter === filter;

        const isDeleting =
          deletingStatus === filter;

        const toneColors =
          getToneColors(tone);

        return (
          <View
            key={filter}
            style={styles.row}
          >
            {/* STATUS */}

            <View
              style={[
                styles.rowIcon,
                {
                  backgroundColor:
                    toneColors.background,
                },
              ]}
            >
              <AppIcon
                name={icon}
                size="sm"
                color={
                  toneColors.color
                }
              />
            </View>

            {/* FILTER */}

            <Pressable
              onPress={() =>
                handleFilter(
                  filter,
                )
              }
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel={`View ${label.toLowerCase()} orders`}
              accessibilityState={{
                selected:
                  isSelected,
                disabled:
                  busy,
              }}
              style={({
                pressed,
              }) => [
                styles.rowInfo,

                pressed &&
                !busy
                  ? styles.rowPressed
                  : null,
              ]}
            >
              <View
                style={
                  styles.rowTitleLine
                }
              >
                <AppText
                  variant="body"
                  weight="bold"
                  numberOfLines={1}
                  style={
                    styles.rowLabel
                  }
                >
                  {label}
                </AppText>

                {isSelected ? (
                  <View
                    style={
                      styles.selectedIndicator
                    }
                  >
                    <AppIcon
                      name="check"
                      size="xs"
                      color={
                        CustomerColors.primary
                      }
                    />
                  </View>
                ) : null}
              </View>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.rowCount
                }
              >
                {count}{" "}
                {count === 1
                  ? "order"
                  : "orders"}
              </AppText>
            </Pressable>

            {/* DELETE / LOCK */}

            {deletable ? (
              <Pressable
                onPress={() =>
                  handleDelete(
                    filter as DeletableStatus,
                  )
                }
                disabled={
                  busy ||
                  count === 0
                }
                accessibilityRole="button"
                accessibilityLabel={`Delete ${label.toLowerCase()} orders`}
                accessibilityState={{
                  disabled:
                    busy ||
                    count === 0,
                  busy:
                    isDeleting,
                }}
                style={({
                  pressed,
                }) => [
                  styles.deleteButton,

                  busy ||
                  count === 0
                    ? styles.disabledButton
                    : null,

                  pressed &&
                  !busy &&
                  count > 0
                    ? styles.deletePressed
                    : null,
                ]}
              >
                {isDeleting ? (
                  <ActivityIndicator
                    size="small"
                    color={
                      Colors.error
                    }
                  />
                ) : (
                  <>
                    <AppIcon
                      name="delete"
                      size="xs"
                      color={
                        count === 0
                          ? Colors.textMuted
                          : Colors.error
                      }
                    />

                    <AppText
                      variant="caption"
                      weight="bold"
                      style={[
                        styles.deleteText,

                        count === 0
                          ? styles.deleteTextDisabled
                          : null,
                      ]}
                    >
                      Delete
                    </AppText>
                  </>
                )}
              </Pressable>
            ) : (
              <View
                accessible
                accessibilityLabel={`${label} orders cannot be deleted`}
                style={
                  styles.lockedButton
                }
              >
                <AppIcon
                  name="lock"
                  size="xs"
                  color={
                    Colors.textMuted
                  }
                />
              </View>
            )}
          </View>
        );
      },
      [
        deletingStatus,
        handleDelete,
        handleFilter,
        selectedFilter,
      ],
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={
        handleClose
      }
    >
      <View
        style={
          styles.modalOverlay
        }
      >
        {/* BACKDROP */}

        <Pressable
          style={
            styles.backdrop
          }
          onPress={
            handleClose
          }
          disabled={
            deletingStatus !== null
          }
          accessibilityRole="button"
          accessibilityLabel="Close order management"
        />

        {/* SHEET */}

        <View
          accessibilityViewIsModal
          style={[
            styles.modalCard,
            {
              paddingBottom:
                Math.max(
                  insets.bottom,
                  FixxamTokens
                    .spacing.lg,
                ),
            },
          ]}
        >
          {/* HANDLE */}

          <View
            style={
              styles.sheetHandle
            }
          />

          {/* HEADER */}

          <View
            style={
              styles.modalHeader
            }
          >
            <View
              style={
                styles.headerInfo
              }
            >
              <View
                style={
                  styles.headerIcon
                }
              >
                <AppIcon
                  name="filter"
                  role="customer"
                  size="sm"
                  color={
                    CustomerColors.primary
                  }
                />
              </View>

              <View
                style={
                  styles.headerText
                }
              >
                <AppText
                  variant="bodyLarge"
                  weight="bold"
                  style={
                    styles.modalTitle
                  }
                >
                  Manage Orders
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.modalSubtitle
                  }
                >
                  {total}{" "}
                  {total === 1
                    ? "total order"
                    : "total orders"}
                </AppText>
              </View>
            </View>

            <Pressable
              onPress={
                handleClose
              }
              disabled={
                deletingStatus !== null
              }
              accessibilityRole="button"
              accessibilityLabel="Close order management"
              accessibilityState={{
                disabled:
                  deletingStatus !== null,
              }}
              style={({
                pressed,
              }) => [
                styles.closeButton,

                pressed &&
                deletingStatus === null
                  ? styles.closePressed
                  : null,
              ]}
            >
              <AppIcon
                name="close"
                size="sm"
                color={
                  Colors.textSecondary
                }
              />
            </Pressable>
          </View>

          {/* DESCRIPTION */}

          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.description
            }
          >
            Choose a category to view, or remove completed and cancelled order history.
          </AppText>

          {/* ROWS */}

          <View
            style={styles.rows}
          >
            {rows.map(
              renderRow,
            )}
          </View>

          {/* INFO */}

          <View
            style={styles.infoBox}
          >
            <View
              style={
                styles.infoIcon
              }
            >
              <AppIcon
                name="verified"
                size="sm"
                color={
                  Colors.info
                }
              />
            </View>

            <View
              style={
                styles.infoContent
              }
            >
              <AppText
                variant="body"
                weight="bold"
                style={
                  styles.infoTitle
                }
              >
                History protection
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.infoText
                }
              >
                Pending and active orders cannot be deleted. Only completed and cancelled history can be removed.
              </AppText>
            </View>
          </View>

          {/* DONE */}

          <Pressable
            onPress={
              handleClose
            }
            disabled={
              deletingStatus !== null
            }
            accessibilityRole="button"
            accessibilityLabel="Done managing orders"
            accessibilityState={{
              disabled:
                deletingStatus !== null,
            }}
            style={({
              pressed,
            }) => [
              styles.doneButton,

              deletingStatus !== null
                ? styles.doneDisabled
                : null,

              pressed &&
              deletingStatus === null
                ? styles.donePressed
                : null,
            ]}
          >
            {deletingStatus ? (
              <ActivityIndicator
                size="small"
                color={
                  Colors.textInverse
                }
              />
            ) : (
              <>
                <AppIcon
                  name="check"
                  size="sm"
                  color={
                    Colors.textInverse
                  }
                />

                <AppText
                  variant="body"
                  weight="bold"
                  style={
                    styles.doneText
                  }
                >
                  Done
                </AppText>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/* ============================================================
   EXPORT
============================================================ */

export default memo(
  OrderDeletionManager,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent:
        "flex-end",
    },

    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor:
        Colors.overlayMedium,
    },

    modalCard: {
      width: "100%",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      borderTopLeftRadius:
        FixxamTokens.radius.xl,

      borderTopRightRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    sheetHandle: {
      width: 42,
      height: 4,

      alignSelf: "center",

      marginBottom:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabled,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,
    },

    headerInfo: {
      flex: 1,
      minWidth: 0,

      flexDirection: "row",
      alignItems: "center",
    },

    headerIcon: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      alignItems: "center",
      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    headerText: {
      flex: 1,
      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    modalTitle: {
      color:
        Colors.textPrimary,
    },

    modalSubtitle: {
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

      alignItems: "center",
      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    closePressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    description: {
      marginTop:
        FixxamTokens.spacing.md,

      lineHeight: 20,
    },

    /* ========================================================
       ROWS
    ======================================================== */

    rows: {
      marginTop:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      overflow: "hidden",

      backgroundColor:
        Colors.surface,
    },

    row: {
      minHeight: 72,

      flexDirection: "row",
      alignItems: "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderBottomWidth: 1,

      borderBottomColor:
        Colors.divider,
    },

    rowIcon: {
      width: 42,
      height: 42,

      flexShrink: 0,

      alignItems: "center",
      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,
    },

    rowInfo: {
      flex: 1,
      minWidth: 0,

      alignSelf: "stretch",
      justifyContent:
        "center",

      marginLeft:
        FixxamTokens.spacing.sm,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    rowPressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    rowTitleLine: {
      flexDirection: "row",
      alignItems: "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    rowLabel: {
      color:
        Colors.textPrimary,
    },

    rowCount: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    selectedIndicator: {
      width: 22,
      height: 22,

      alignItems: "center",
      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    /* ========================================================
       DELETE
    ======================================================== */

    deleteButton: {
      minWidth: 78,

      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.error,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        Colors.errorSoft,
    },

    deleteText: {
      color:
        Colors.error,
    },

    deleteTextDisabled: {
      color:
        Colors.textMuted,
    },

    disabledButton: {
      borderColor:
        Colors.border,

      backgroundColor:
        Colors.disabledBackground,

      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    deletePressed: {
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

    lockedButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      alignItems: "center",
      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },

    /* ========================================================
       INFO
    ======================================================== */

    infoBox: {
      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      flexDirection: "row",
      alignItems:
        "flex-start",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.infoSoft,
    },

    infoIcon: {
      width: 36,
      height: 36,

      flexShrink: 0,

      alignItems: "center",
      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    infoContent: {
      flex: 1,
      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    infoTitle: {
      color:
        Colors.textPrimary,
    },

    infoText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 17,
    },

    /* ========================================================
       DONE
    ======================================================== */

    doneButton: {
      minHeight:
        FixxamTokens.size
          .buttonHeight,

      marginTop:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    doneText: {
      color:
        Colors.textInverse,
    },

    doneDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    donePressed: {
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