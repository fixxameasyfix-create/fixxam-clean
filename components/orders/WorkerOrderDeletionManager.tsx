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

import Ionicons from "@expo/vector-icons/Ionicons";

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
  AppText,
} from "@/components/ui";

import {
  auth,
  db,
} from "@/firebase/config";

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

/*
 * Firestore supports a maximum of 500 writes
 * in one batch.
 *
 * 450 gives us a safe margin.
 */
const BATCH_LIMIT = 450;

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
  const [
    deletingStatus,
    setDeletingStatus,
  ] =
    useState<DeletableStatus | null>(
      null,
    );

  /* ==========================================================
     TOTAL
  ========================================================== */

  const total = useMemo(
    () =>
      counts.pending +
      counts.active +
      counts.completed +
      counts.cancelled,
    [counts],
  );

  /* ==========================================================
     CLOSE
  ========================================================== */

  const handleClose =
    useCallback(() => {
      if (deletingStatus) {
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
        filter: WorkerOrderDeletionFilter,
      ) => {
        if (deletingStatus) {
          return;
        }

        onFilterSelect(
          filter,
        );

        onClose();
      },
      [
        deletingStatus,
        onFilterSelect,
        onClose,
      ],
    );

  /* ==========================================================
     DELETE
  ========================================================== */

  const handleDelete =
    useCallback(
      (
        status: DeletableStatus,
      ) => {
        if (deletingStatus) {
          return;
        }

        /*
         * Always read the currently
         * authenticated worker.
         *
         * Do not trust a userId passed
         * from the screen.
         */
        const workerId =
          auth.currentUser?.uid;

        if (!workerId) {
          Alert.alert(
            "Sign in required",
            "Please sign in again before deleting your job history.",
          );

          return;
        }

        const count =
          status ===
          "completed"
            ? counts.completed
            : counts.cancelled;

        if (count <= 0) {
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

        Alert.alert(
          `Delete ${statusLabel.toLowerCase()} ${jobLabel}?`,

          `You have ${count} ${statusLabel.toLowerCase()} ${jobLabel}.\n\nThey will be removed from your job history. The customer's order will not be deleted.\n\nThis action cannot be undone.`,

          [
            {
              text: "Keep",
              style: "cancel",
            },

            {
              text: `Delete ${count}`,

              style: "destructive",

              onPress:
                async () => {
                  try {
                    setDeletingStatus(
                      status,
                    );

                    const bookingsRef =
                      collection(
                        db,
                        "bookings",
                      );

                    /*
                     * =================================================
                     * COMPLETED
                     * =================================================
                     *
                     * Only:
                     *
                     * workerId == current worker
                     * status == completed
                     */

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

                      const targetOrders =
                        snapshot.docs.filter(
                          (
                            order,
                          ) => {
                            const data =
                              order.data();

                            return (
                              data.deletedByWorker !==
                              true
                            );
                          },
                        );

                      if (
                        targetOrders.length ===
                        0
                      ) {
                        setDeletingStatus(
                          null,
                        );

                        Alert.alert(
                          "Nothing to delete",
                          "There are no completed jobs available to remove.",
                        );

                        return;
                      }

                      /*
                       * Batch delete marker.
                       */
                      for (
                        let start = 0;
                        start <
                        targetOrders.length;
                        start +=
                          BATCH_LIMIT
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

                      setDeletingStatus(
                        null,
                      );

                      onClose();

                      onDeleted?.();

                      return;
                    }

                    /*
                     * =================================================
                     * CANCELLED + EXPIRED
                     * =================================================
                     *
                     * UI combines both into one
                     * "Cancelled" history.
                     *
                     * Firestore cannot query:
                     *
                     * status == cancelled OR expired
                     *
                     * with the simple where() query
                     * we are using here.
                     *
                     * Therefore we load both statuses
                     * independently.
                     */

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

                    /*
                     * Combine cancelled + expired.
                     */
                    const allTargetDocs = [
                      ...cancelledSnapshot.docs,
                      ...expiredSnapshot.docs,
                    ];

                    /*
                     * Never touch a job that
                     * has already been hidden
                     * from this worker.
                     */
                    const targetOrders =
                      allTargetDocs.filter(
                        (
                          order,
                        ) => {
                          const data =
                            order.data();

                          return (
                            data.deletedByWorker !==
                            true
                          );
                        },
                      );

                    if (
                      targetOrders.length ===
                      0
                    ) {
                      setDeletingStatus(
                        null,
                      );

                      Alert.alert(
                        "Nothing to delete",
                        "There are no cancelled jobs available to remove.",
                      );

                      return;
                    }

                    /*
                     * =================================================
                     * BATCH UPDATE
                     * =================================================
                     */

                    for (
                      let start = 0;
                      start <
                      targetOrders.length;
                      start +=
                        BATCH_LIMIT
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

                    setDeletingStatus(
                      null,
                    );

                    onClose();

                    onDeleted?.();
                  } catch (
                    error
                  ) {
                    console.error(
                      "WORKER_ORDER_SOFT_DELETE_ERROR",
                      error,
                    );

                    setDeletingStatus(
                      null,
                    );

                    Alert.alert(
                      "Unable to delete",
                      "We could not remove these jobs from your history. Please check your connection and try again.",
                    );
                  }
                },
            },
          ],
        );
      },
      [
        counts,
        deletingStatus,
        onClose,
        onDeleted,
      ],
    );

  /* ==========================================================
     ROW
  ========================================================== */

  const renderRow =
    useCallback(
      ({
        filter,
        label,
        count,
        icon,
        tone,
        deletable,
      }: {
        filter:
          | "pending"
          | "active"
          | "completed"
          | "cancelled";

        label: string;

        count: number;

        icon: keyof typeof Ionicons.glyphMap;

        tone:
          | "pending"
          | "active"
          | "completed"
          | "cancelled";

        deletable: boolean;
      }) => {
        const isSelected =
          selectedFilter ===
          filter;

        const isDeleting =
          deletingStatus ===
          filter;

        return (
          <View
            style={
              styles.row
            }
          >
            {/* ICON */}

            <View
              style={[
                styles.rowIcon,

                tone ===
                  "pending" &&
                  styles.rowIconPending,

                tone ===
                  "active" &&
                  styles.rowIconActive,

                tone ===
                  "completed" &&
                  styles.rowIconCompleted,

                tone ===
                  "cancelled" &&
                  styles.rowIconCancelled,
              ]}
            >
              <Ionicons
                name={icon}
                size={20}
                color={
                  tone ===
                  "pending"
                    ? "#D97706"
                    : tone ===
                        "active"
                      ? "#2563EB"
                      : tone ===
                          "completed"
                        ? "#16A34A"
                        : "#DC2626"
                }
              />
            </View>

            {/* CATEGORY */}

            <Pressable
              disabled={
                deletingStatus !==
                null
              }
              onPress={() =>
                handleFilter(
                  filter,
                )
              }
              accessibilityRole="button"
              accessibilityState={{
                selected:
                  isSelected,
              }}
              style={
                styles.rowInfo
              }
            >
              <View
                style={
                  styles.rowTitleLine
                }
              >
                <AppText
                  weight="bold"
                  style={
                    styles.rowLabel
                  }
                >
                  {label}
                </AppText>

                {isSelected && (
                  <View
                    style={
                      styles.selectedIndicator
                    }
                  >
                    <Ionicons
                      name="checkmark"
                      size={11}
                      color="#2563EB"
                    />
                  </View>
                )}
              </View>

              <AppText
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
                  deletingStatus !==
                    null ||
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
                    deletingStatus !==
                      null ||
                    count === 0,
                  busy:
                    isDeleting,
                }}
                style={({ pressed }) => [
                  styles.deleteButton,

                  count === 0 &&
                    styles.disabledButton,

                  deletingStatus !==
                    null &&
                    styles.disabledButton,

                  pressed &&
                    styles.deletePressed,
                ]}
              >
                {isDeleting ? (
                  <ActivityIndicator
                    size="small"
                    color="#DC2626"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="trash-outline"
                      size={15}
                      color={
                        count ===
                        0
                          ? "#94A3B8"
                          : "#DC2626"
                      }
                    />

                    <AppText
                      weight="bold"
                      style={[
                        styles.deleteText,

                        count ===
                          0 &&
                          styles.deleteTextDisabled,
                      ]}
                    >
                      Delete
                    </AppText>
                  </>
                )}
              </Pressable>
            ) : (
              <View
                style={
                  styles.lockedButton
                }
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={14}
                  color="#94A3B8"
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
      onRequestClose={
        handleClose
      }
    >
      <View
        style={
          styles.modalOverlay
        }
      >
        {/* ====================================================
            BACKDROP
        ==================================================== */}

        <Pressable
          style={
            styles.backdrop
          }
          onPress={
            handleClose
          }
          disabled={
            deletingStatus !==
            null
          }
        />

        {/* ====================================================
            SHEET
        ==================================================== */}

        <View
          style={
            styles.modalCard
          }
        >
          {/* HANDLE */}

          <View
            style={
              styles.sheetHandle
            }
          />

          {/* ==================================================
              HEADER
          ================================================== */}

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
                <Ionicons
                  name="briefcase-outline"
                  size={20}
                  color="#2563EB"
                />
              </View>

              <View
                style={
                  styles.headerText
                }
              >
                <AppText
                  weight="bold"
                  style={
                    styles.modalTitle
                  }
                >
                  Manage Jobs
                </AppText>

                <AppText
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
                deletingStatus !==
                null
              }
              accessibilityRole="button"
              accessibilityLabel="Close job management"
              style={({ pressed }) => [
                styles.closeButton,

                pressed &&
                  styles.closePressed,
              ]}
            >
              <Ionicons
                name="close"
                size={20}
                color="#475569"
              />
            </Pressable>
          </View>

          {/* ==================================================
              DESCRIPTION
          ================================================== */}

          <AppText
            style={
              styles.description
            }
          >
            Choose a category to view, or
            remove completed and cancelled
            job history.
          </AppText>

          {/* ==================================================
              ROWS
          ================================================== */}

          <View
            style={
              styles.rows
            }
          >
            {/* PENDING */}

            {renderRow({
              filter: "pending",
              label: "New Requests",
              count:
                counts.pending,
              icon:
                "time-outline",
              tone: "pending",
              deletable: false,
            })}

            {/* ACTIVE */}

            {renderRow({
              filter: "active",
              label: "Active",
              count:
                counts.active,
              icon:
                "flash-outline",
              tone: "active",
              deletable: false,
            })}

            {/* COMPLETED */}

            {renderRow({
              filter: "completed",
              label: "Completed",
              count:
                counts.completed,
              icon:
                "checkmark-circle-outline",
              tone: "completed",
              deletable: true,
            })}

            {/* CANCELLED + EXPIRED */}

            {renderRow({
              filter: "cancelled",
              label: "Cancelled",
              count:
                counts.cancelled,
              icon:
                "close-circle-outline",
              tone: "cancelled",
              deletable: true,
            })}
          </View>

          {/* ==================================================
              SECURITY INFO
          ================================================== */}

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
              <Ionicons
                name="shield-checkmark-outline"
                size={17}
                color="#2563EB"
              />
            </View>

            <View
              style={
                styles.infoContent
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.infoTitle
                }
              >
                Job history protection
              </AppText>

              <AppText
                style={
                  styles.infoText
                }
              >
                New requests and active jobs are
                protected. Completed, cancelled,
                and expired history can be removed
                from your view.
              </AppText>
            </View>
          </View>

          {/* ==================================================
              DONE
          ================================================== */}

          <Pressable
            onPress={
              handleClose
            }
            disabled={
              deletingStatus !==
              null
            }
            accessibilityRole="button"
            accessibilityLabel="Done"
            style={({ pressed }) => [
              styles.doneButton,

              pressed &&
                styles.donePressed,

              deletingStatus !==
                null &&
                styles.doneDisabled,
            ]}
          >
            <AppText
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
        "rgba(15,23,42,0.48)",
    },

    modalCard: {
      paddingHorizontal: 18,
      paddingTop: 10,
      paddingBottom: 28,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      backgroundColor:
        "#FFFFFF",
    },

    sheetHandle: {
      alignSelf: "center",
      width: 42,
      height: 4,
      borderRadius: 2,
      backgroundColor:
        "#CBD5E1",
      marginBottom: 16,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    headerInfo: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },

    headerIcon: {
      width: 43,
      height: 43,
      borderRadius: 14,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    headerText: {
      flex: 1,
      marginLeft: 11,
    },

    modalTitle: {
      fontSize: 19,
      color: "#0F172A",
    },

    modalSubtitle: {
      marginTop: 2,
      fontSize: 10,
      color: "#94A3B8",
    },

    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor:
        "#F8FAFC",
      alignItems: "center",
      justifyContent: "center",
    },

    closePressed: {
      opacity: 0.65,
    },

    description: {
      marginTop: 13,
      fontSize: 10.5,
      lineHeight: 16,
      color: "#64748B",
    },

    /* ========================================================
       ROWS
    ======================================================== */

    rows: {
      marginTop: 16,
      gap: 9,
    },

    row: {
      minHeight: 66,
      paddingHorizontal: 10,
      borderRadius: 16,
      backgroundColor:
        "#F8FAFC",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      flexDirection: "row",
      alignItems: "center",
    },

    rowIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
    },

    rowIconPending: {
      backgroundColor:
        "#FFF7E8",
    },

    rowIconActive: {
      backgroundColor:
        "#EFF6FF",
    },

    rowIconCompleted: {
      backgroundColor:
        "#ECFDF5",
    },

    rowIconCancelled: {
      backgroundColor:
        "#FEF2F2",
    },

    rowInfo: {
      flex: 1,
      marginLeft: 11,
      minWidth: 0,
    },

    rowTitleLine: {
      flexDirection: "row",
      alignItems: "center",
    },

    rowLabel: {
      fontSize: 12,
      color: "#0F172A",
    },

    selectedIndicator: {
      width: 18,
      height: 18,
      marginLeft: 6,
      borderRadius: 9,
      backgroundColor:
        "#DBEAFE",
      alignItems: "center",
      justifyContent: "center",
    },

    rowCount: {
      marginTop: 2,
      fontSize: 9.5,
      color: "#94A3B8",
    },

    /* ========================================================
       DELETE
    ======================================================== */

    deleteButton: {
      minWidth: 76,
      height: 35,
      paddingHorizontal: 10,
      borderRadius: 10,
      backgroundColor:
        "#FEF2F2",
      borderWidth: 1,
      borderColor:
        "#FECACA",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 5,
    },

    deletePressed: {
      opacity: 0.7,
    },

    disabledButton: {
      opacity: 0.45,
    },

    deleteText: {
      fontSize: 9,
      color: "#DC2626",
    },

    deleteTextDisabled: {
      color: "#94A3B8",
    },

    lockedButton: {
      width: 35,
      height: 35,
      borderRadius: 10,
      backgroundColor:
        "#F1F5F9",
      alignItems: "center",
      justifyContent: "center",
    },

    /* ========================================================
       INFO
    ======================================================== */

    infoBox: {
      marginTop: 14,
      padding: 11,
      borderRadius: 14,
      backgroundColor:
        "#EFF6FF",
      flexDirection: "row",
      alignItems: "flex-start",
    },

    infoIcon: {
      width: 30,
      height: 30,
      borderRadius: 10,
      backgroundColor:
        "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
    },

    infoContent: {
      flex: 1,
      marginLeft: 8,
    },

    infoTitle: {
      fontSize: 9.5,
      color: "#1D4ED8",
    },

    infoText: {
      marginTop: 2,
      fontSize: 9,
      lineHeight: 14,
      color: "#475569",
    },

    /* ========================================================
       DONE
    ======================================================== */

    doneButton: {
      marginTop: 14,
      height: 46,
      borderRadius: 13,
      backgroundColor:
        "#F1F5F9",
      alignItems: "center",
      justifyContent: "center",
    },

    donePressed: {
      opacity: 0.75,
    },

    doneDisabled: {
      opacity: 0.5,
    },

    doneText: {
      fontSize: 10,
      color: "#334155",
    },
  });