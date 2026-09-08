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

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

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
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

export type WorkerOrderDeletionCounts = {
  pending: number;
  active: number;
  completed: number;
  cancelled: number;
};

export type WorkerOrderDeletionFilter =
  | "all"
  | "pending"
  | "active"
  | "completed"
  | "cancelled";

type DeletableStatus =
  | "completed"
  | "cancelled";

type RowFilter =
  | "pending"
  | "active"
  | "completed"
  | "cancelled";

type RowTone =
  | "pending"
  | "active"
  | "completed"
  | "cancelled";

type RowIcon =
  | "clock"
  | "service"
  | "success"
  | "error";

type RowConfig = {
  filter: RowFilter;
  label: string;
  count: number;
  icon: RowIcon;
  tone: RowTone;
  deletable: boolean;
};

type Props = {
  visible: boolean;

  counts: WorkerOrderDeletionCounts;

  selectedFilter: WorkerOrderDeletionFilter;

  onClose: () => void;

  onFilterSelect: (
    filter: WorkerOrderDeletionFilter,
  ) => void;

  onDeleted?: () => void;
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
  tone: RowTone,
) {
  switch (tone) {
    case "pending":
      return {
        color:
          Colors.warning,

        background:
          Colors.warningSoft,
      };

    case "active":
      return {
        color:
          WorkerColors.primary,

        background:
          WorkerColors.primarySoft,
      };

    case "completed":
      return {
        color:
          Colors.success,

        background:
          Colors.successSoft,
      };

    case "cancelled":
      return {
        color:
          Colors.error,

        background:
          Colors.errorSoft,
      };
  }
}

/* ============================================================
   COMPONENT
============================================================ */

function WorkerOrderDeletionManager({
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
          label: "New Requests",
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
        filter:
          WorkerOrderDeletionFilter,
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
     BATCH SOFT DELETE
  ========================================================== */

  const softDeleteOrders =
    useCallback(
      async (
        orderIds: string[],
      ) => {
        for (
          let start = 0;
          start <
          orderIds.length;
          start += BATCH_LIMIT
        ) {
          const chunk =
            orderIds.slice(
              start,
              start +
                BATCH_LIMIT,
            );

          const batch =
            writeBatch(db);

          for (
            const orderId of chunk
          ) {
            const orderRef =
              doc(
                db,
                "bookings",
                orderId,
              );

            batch.update(
              orderRef,
              {
                deletedByWorker:
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
      },
      [],
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

        const workerId =
          auth.currentUser?.uid?.trim();

        if (!workerId) {
          showError(
            "Sign in required",
            "Please sign in again before deleting your job history.",
          );

          return;
        }

        try {
          setDeletingStatus(
            status,
          );

          const bookingsRef =
            collection(
              db,
              "bookings",
            );

          let targetOrderIds:
            string[] = [];

          /* ==================================================
             COMPLETED
          ================================================== */

          if (
            status ===
            "completed"
          ) {
            const completedQuery =
              query(
                bookingsRef,

                where(
                  "workerId",
                  "==",
                  workerId,
                ),

                where(
                  "status",
                  "==",
                  "completed",
                ),
              );

            const snapshot =
              await getDocs(
                completedQuery,
              );

            targetOrderIds =
              snapshot.docs
                .filter(
                  (order) =>
                    order.data()
                      .deletedByWorker !==
                    true,
                )
                .map(
                  (order) =>
                    order.id,
                );
          }

          /* ==================================================
             CANCELLED + EXPIRED
          ================================================== */

          if (
            status ===
            "cancelled"
          ) {
            const cancelledQuery =
              query(
                bookingsRef,

                where(
                  "workerId",
                  "==",
                  workerId,
                ),

                where(
                  "status",
                  "==",
                  "cancelled",
                ),
              );

            const expiredQuery =
              query(
                bookingsRef,

                where(
                  "workerId",
                  "==",
                  workerId,
                ),

                where(
                  "status",
                  "==",
                  "expired",
                ),
              );

            const [
              cancelledSnapshot,
              expiredSnapshot,
            ] =
              await Promise.all([
                getDocs(
                  cancelledQuery,
                ),

                getDocs(
                  expiredQuery,
                ),
              ]);

            const combinedDocs = [
              ...cancelledSnapshot.docs,
              ...expiredSnapshot.docs,
            ];

            targetOrderIds =
              combinedDocs
                .filter(
                  (order) =>
                    order.data()
                      .deletedByWorker !==
                    true,
                )
                .map(
                  (order) =>
                    order.id,
                );
          }

          /* ==================================================
             NOTHING TO DELETE
          ================================================== */

          if (
            targetOrderIds.length ===
            0
          ) {
            showError(
              "Nothing to delete",
              status ===
                "completed"
                ? "There are no completed jobs available to remove."
                : "There are no cancelled or expired jobs available to remove.",
            );

            return;
          }

          /* ==================================================
             SOFT DELETE
          ================================================== */

          await softDeleteOrders(
            targetOrderIds,
          );

          onClose();

          try {
            onDeleted?.();
          } catch (
            callbackError
          ) {
            console.error(
              "WORKER_ORDER_DELETE_CALLBACK_ERROR",
              callbackError,
            );
          }

          const label =
            status ===
            "completed"
              ? "completed"
              : "cancelled";

          showSuccess(
            "History removed",
            `${targetOrderIds.length} ${label} ${
              targetOrderIds.length ===
              1
                ? "job"
                : "jobs"
            } removed from your history.`,
          );
        } catch (error) {
          console.error(
            "WORKER_ORDER_SOFT_DELETE_ERROR",
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
              "You do not have permission to remove these jobs.",
            );
          } else {
            showError(
              "Unable to delete",
              "We could not remove these jobs from your history. Please check your connection and try again.",
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
        softDeleteOrders,
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
          status ===
          "completed"
            ? safeCounts.completed
            : safeCounts.cancelled;

        if (count <= 0) {
          showError(
            "Nothing to delete",
            "There are no jobs available to remove.",
          );

          return;
        }

        const statusLabel =
          status ===
          "completed"
            ? "Completed"
            : "Cancelled";

        const jobLabel =
          count === 1
            ? "job"
            : "jobs";

        /*
         * Native Alert stays here because
         * deletion requires explicit
         * destructive confirmation.
         */

        Alert.alert(
          `Delete ${statusLabel.toLowerCase()} ${jobLabel}?`,

          `You have ${count} ${statusLabel.toLowerCase()} ${jobLabel}.\n\nThey will be removed from your job history. The customer's order will not be deleted.\n\nThis action cannot be undone.`,

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
        safeCounts.cancelled,
        safeCounts.completed,
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
          selectedFilter ===
          filter;

        const isDeleting =
          deletingStatus ===
          filter;

        const toneColors =
          getToneColors(
            tone,
          );

        return (
          <View
            key={filter}
            style={styles.row}
          >
            {/* STATUS ICON */}

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
                role="worker"
                size="sm"
                color={
                  toneColors.color
                }
              />
            </View>

            {/* CATEGORY */}

            <Pressable
              disabled={busy}
              onPress={() =>
                handleFilter(
                  filter,
                )
              }
              accessibilityRole="button"
              accessibilityLabel={`View ${label.toLowerCase()} jobs`}
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
                      role="worker"
                      size="xs"
                      color={
                        WorkerColors.primary
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
                  ? "job"
                  : "jobs"}
              </AppText>
            </Pressable>

            {/* DELETE / LOCK */}

            {deletable ? (
              <Pressable
                disabled={
                  busy ||
                  count === 0
                }
                onPress={() =>
                  handleDelete(
                    filter as DeletableStatus,
                  )
                }
                accessibilityRole="button"
                accessibilityLabel={`Delete ${label.toLowerCase()} jobs`}
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
                accessibilityLabel={`${label} jobs cannot be deleted`}
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
          accessibilityLabel="Close job management"
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
                  name="jobs"
                  role="worker"
                  size="sm"
                  color={
                    WorkerColors.primary
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
                  Manage Jobs
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
                    ? "total job"
                    : "total jobs"}
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
              accessibilityLabel="Close job management"
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
            Choose a category to view, or remove completed and cancelled job history.
          </AppText>

          {/* ROWS */}

          <View
            style={
              styles.rows
            }
          >
            {rows.map(
              renderRow,
            )}
          </View>

          {/* SECURITY INFO */}

          <View
            style={
              styles.infoBox
            }
          >
            <View
              style={
                styles.infoIcon
              }
            >
              <AppIcon
                name="verified"
                role="worker"
                size="sm"
                color={
                  WorkerColors.primary
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
                Job history protection
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.infoText
                }
              >
                New requests and active jobs are protected. Completed, cancelled, and expired history can be removed from your view.
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
            accessibilityLabel="Done managing jobs"
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
            <AppIcon
              name="check"
              role="worker"
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
              DONE
            </AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default memo(
  WorkerOrderDeletionManager,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       MODAL
    ======================================================== */

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

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
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

      flexShrink: 0,

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

      gap:
        FixxamTokens.spacing.sm,
    },

    row: {
      minHeight: 68,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.background,
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
        WorkerColors.primarySoft,
    },

    /* ========================================================
       DELETE
    ======================================================== */

    deleteButton: {
      minWidth: 76,

      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderWidth: 1,

      borderColor:
        Colors.error,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        Colors.errorSoft,
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

    disabledButton: {
      borderColor:
        Colors.border,

      backgroundColor:
        Colors.disabledBackground,

      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    deleteText: {
      color:
        Colors.error,
    },

    deleteTextDisabled: {
      color:
        Colors.textMuted,
    },

    lockedButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

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
        WorkerColors.primarySoft,
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
        WorkerColors.primary,
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
        WorkerColors.primary,
    },

    doneText: {
      color:
        Colors.textInverse,
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

    doneDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },
  });