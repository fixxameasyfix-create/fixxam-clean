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
  ScrollView,
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

type HistoryCollection =
  | "bookings"
  | "orders"
  | "shopRequests";

type HistoryTarget = {
  collectionName: HistoryCollection;
  id: string;
  persistedStatus: string;
};

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

/* ============================================================
   CONSTANTS
============================================================ */

const HISTORY_COLLECTIONS:
  readonly HistoryCollection[] = [
    "bookings",
    "orders",
    "shopRequests",
  ];

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

function showInfo(
  title: string,
  message: string,
) {
  Toast.show({
    type: "info",
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
   STATUS MAPPING
============================================================ */

function getDeletionStatuses(
  status: DeletableStatus,
): readonly string[] {
  if (status === "completed") {
    return [
      "completed",
      "delivered",
    ];
  }

  return [
    "cancelled",
    "canceled",
    "expired",
    "declined",
  ];
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
    useState<
      DeletableStatus | null
    >(null);

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
        counts.active,
        counts.cancelled,
        counts.completed,
        counts.pending,
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
        safeCounts.active,
        safeCounts.cancelled,
        safeCounts.completed,
        safeCounts.pending,
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
          OrderDeletionFilter,
      ) => {
        if (
          deletingStatus !== null
        ) {
          return;
        }

        onFilterSelect(filter);
        onClose();
      },
      [
        deletingStatus,
        onClose,
        onFilterSelect,
      ],
    );

  /* ==========================================================
     GET HISTORY TARGETS
  ========================================================== */

  const getHistoryTargets =
    useCallback(
      async (
        customerId: string,
        status:
          DeletableStatus,
      ): Promise<
        HistoryTarget[]
      > => {
        const normalizedCustomerId =
          customerId.trim();

        if (
          !normalizedCustomerId
        ) {
          return [];
        }

        const statuses =
          getDeletionStatuses(
            status,
          );

        const groups =
          await Promise.all(
            HISTORY_COLLECTIONS.map(
              async (
                collectionName,
              ): Promise<
                HistoryTarget[]
              > => {
                const historyQuery =
                  query(
                    collection(
                      db,
                      collectionName,
                    ),

                    where(
                      "customerId",
                      "==",
                      normalizedCustomerId,
                    ),

                    where(
                      "status",
                      "in",
                      [...statuses],
                    ),
                  );

                const snapshot =
                  await getDocs(
                    historyQuery,
                  );

                const targets =
                  snapshot.docs
                    .filter(
                      document => {
                        const data =
                          document.data();

                        return (
                          data.deletedByCustomer !==
                          true
                        );
                      },
                    )
                    .map(
                      document => {
                        const data =
                          document.data();

                        return {
                          collectionName,

                          id:
                            document.id,

                          persistedStatus:
                            typeof data.status ===
                            "string"
                              ? data.status
                              : "",
                        };
                      },
                    );

                if (__DEV__) {
                  console.log(
                    "CUSTOMER_ORDER_HISTORY_TARGETS",
                    {
                      collectionName,

                      count:
                        targets.length,

                      documentIds:
                        targets.map(
                          target =>
                            target.id,
                        ),

                      persistedStatuses:
                        targets.map(
                          target =>
                            target.persistedStatus,
                        ),

                      status,
                    },
                  );
                }

                return targets;
              },
            ),
          );

        const uniqueTargets =
          new Map<
            string,
            HistoryTarget
          >();

        for (
          const group
          of groups
        ) {
          for (
            const target
            of group
          ) {
            uniqueTargets.set(
              `${target.collectionName}:${target.id}`,
              target,
            );
          }
        }

        return [
          ...uniqueTargets.values(),
        ];
      },
      [],
    );

  /* ==========================================================
     WRITE ONE HISTORY TARGET
  ========================================================== */

  const softDeleteSingleTarget =
    useCallback(
      async (
        target:
          HistoryTarget,
      ): Promise<void> => {
        const historyRef =
          doc(
            db,
            target.collectionName,
            target.id,
          );

        const batch =
          writeBatch(db);

        batch.update(
          historyRef,
          {
            deletedByCustomer:
              true,

            deletedByCustomerAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),
          },
        );

        try {
          await batch.commit();

          if (__DEV__) {
            console.log(
              "CUSTOMER_ORDER_DOCUMENT_SOFT_DELETE_SUCCESS",
              {
                collectionName:
                  target.collectionName,

                documentId:
                  target.id,

                persistedStatus:
                  target.persistedStatus,
              },
            );
          }
        } catch (error) {
          const firebaseCode =
            (
              error as {
                code?: string;
              }
            )?.code;

          if (__DEV__) {
            console.error(
              "CUSTOMER_ORDER_DOCUMENT_SOFT_DELETE_ERROR",
              {
                code:
                  firebaseCode ??
                  "unknown",

                collectionName:
                  target.collectionName,

                documentId:
                  target.id,

                persistedStatus:
                  target.persistedStatus,

                message:
                  error instanceof
                  Error
                    ? error.message
                    : String(
                        error,
                      ),
              },
            );
          }

          throw {
            originalError:
              error,

            code:
              firebaseCode,

            collectionName:
              target.collectionName,

            documentId:
              target.id,

            persistedStatus:
              target.persistedStatus,
          };
        }
      },
      [],
    );

  /* ==========================================================
     CUSTOMER SOFT DELETE
  ========================================================== */

  const softDeleteOrders =
    useCallback(
      async (
        targets:
          HistoryTarget[],

        customerId:
          string,

        status:
          DeletableStatus,
      ): Promise<number> => {
        if (
          targets.length === 0
        ) {
          return 0;
        }

        if (__DEV__) {
          const collectionCounts =
            targets.reduce<
              Record<
                HistoryCollection,
                number
              >
            >(
              (
                result,
                target,
              ) => {
                result[
                  target.collectionName
                ] += 1;

                return result;
              },
              {
                bookings: 0,
                orders: 0,
                shopRequests: 0,
              },
            );

          console.log(
            "CUSTOMER_ORDER_SOFT_DELETE_START",
            {
              customerId,
              status,

              total:
                targets.length,

              ...collectionCounts,
            },
          );
        }

        let removedCount = 0;

        for (
          const collectionName
          of HISTORY_COLLECTIONS
        ) {
          const collectionTargets =
            targets.filter(
              target =>
                target.collectionName ===
                collectionName,
            );

          if (
            collectionTargets.length ===
            0
          ) {
            continue;
          }

          if (__DEV__) {
            console.log(
              "CUSTOMER_ORDER_COLLECTION_SOFT_DELETE_START",
              {
                collectionName,

                count:
                  collectionTargets.length,
              },
            );
          }

          for (
            const target
            of collectionTargets
          ) {
            try {
              await softDeleteSingleTarget(
                target,
              );

              removedCount += 1;
            } catch (failure) {
              const details =
                failure as {
                  originalError?:
                    unknown;

                  code?:
                    string;

                  collectionName?:
                    HistoryCollection;

                  documentId?:
                    string;

                  persistedStatus?:
                    string;
                };

              if (__DEV__) {
                console.error(
                  "CUSTOMER_ORDER_PERMISSION_DIAGNOSTIC",
                  {
                    customerId,

                    requestedCategory:
                      status,

                    collection:
                      details.collectionName ??
                      target.collectionName,

                    documentId:
                      details.documentId ??
                      target.id,

                    persistedStatus:
                      details.persistedStatus ??
                      target.persistedStatus,

                    removedBeforeFailure:
                      removedCount,
                  },
                );
              }

              throw failure;
            }
          }

          if (__DEV__) {
            console.log(
              "CUSTOMER_ORDER_COLLECTION_SOFT_DELETE_SUCCESS",
              {
                collectionName,

                count:
                  collectionTargets.length,
              },
            );
          }
        }

        return removedCount;
      },
      [
        softDeleteSingleTarget,
      ],
    );

  /* ==========================================================
     EXECUTE DELETE
  ========================================================== */

  const executeDelete =
    useCallback(
      async (
        status:
          DeletableStatus,
      ) => {
        if (
          deletingStatus !== null
        ) {
          return;
        }

        const customerId =
          auth.currentUser
            ?.uid
            ?.trim();

        if (!customerId) {
          showError(
            "Sign in required",
            "Please sign in again before removing your order history.",
          );

          return;
        }

        try {
          setDeletingStatus(
            status,
          );

          const targets =
            await getHistoryTargets(
              customerId,
              status,
            );

          if (
            targets.length === 0
          ) {
            showInfo(
              "Nothing to remove",

              status ===
                "completed"
                ? "There are no completed orders available to remove."
                : "There are no cancelled, declined, or expired orders available to remove.",
            );

            return;
          }

          const removedCount =
            await softDeleteOrders(
              targets,
              customerId,
              status,
            );

          onClose();

          try {
            onDeleted?.();
          } catch (
            callbackError
          ) {
            if (__DEV__) {
              console.error(
                "CUSTOMER_ORDER_DELETE_CALLBACK_ERROR",
                callbackError,
              );
            }
          }

          const label =
            status ===
            "completed"
              ? "completed"
              : "cancelled";

          showSuccess(
            "History removed",

            `${removedCount} ${label} ${
              removedCount === 1
                ? "order"
                : "orders"
            } removed from your history.`,
          );
        } catch (error) {
          if (__DEV__) {
            console.error(
              "CUSTOMER_ORDER_SOFT_DELETE_ERROR",
              error,
            );
          }

          const failure =
            error as {
              originalError?: {
                code?: string;
              };

              code?: string;

              collectionName?:
                HistoryCollection;

              documentId?:
                string;

              persistedStatus?:
                string;
            };

          const firebaseCode =
            failure.code ??
            failure
              .originalError
              ?.code;

          if (
            firebaseCode ===
            "permission-denied"
          ) {
            if (__DEV__) {
              console.error(
                "CUSTOMER_ORDER_PERMISSION_DENIED",
                {
                  collection:
                    failure.collectionName,

                  documentId:
                    failure.documentId,

                  persistedStatus:
                    failure.persistedStatus,
                },
              );
            }

            showError(
              "Permission denied",
              "One order could not be removed because its Firestore record does not satisfy the history rules.",
            );

            return;
          }

          if (
            firebaseCode ===
            "failed-precondition"
          ) {
            showError(
              "Unable to remove history",
              "Firestore requires an index for this history query. Create the requested index and try again.",
            );

            return;
          }

          if (
            firebaseCode ===
            "unavailable"
          ) {
            showError(
              "Connection unavailable",
              "Please check your internet connection and try again.",
            );

            return;
          }

          showError(
            "Unable to remove history",
            "We could not remove these orders from your history. Please try again.",
          );
        } finally {
          setDeletingStatus(
            null,
          );
        }
      },
      [
        deletingStatus,
        getHistoryTargets,
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
        status:
          DeletableStatus,
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
          showInfo(
            "Nothing to remove",
            "There are no orders available to remove.",
          );

          return;
        }

        const statusLabel =
          status ===
          "completed"
            ? "Completed"
            : "Cancelled";

        const orderLabel =
          count === 1
            ? "order"
            : "orders";

        Alert.alert(
          `Remove ${statusLabel.toLowerCase()} ${orderLabel}?`,

          `You have ${count} ${statusLabel.toLowerCase()} ${orderLabel}.\n\nService, market, and shop history in this category will be hidden from your order history. Worker and platform records will remain intact.`,

          [
            {
              text: "Keep",
              style: "cancel",
            },

            {
              text:
                `Remove ${count}`,

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
        row:
          RowConfig,
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
                role="customer"
                size="sm"
                color={
                  toneColors.color
                }
              />
            </View>

            <Pressable
              disabled={busy}
              onPress={() =>
                handleFilter(
                  filter,
                )
              }
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
                      role="customer"
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

            {deletable ? (
              <Pressable
                disabled={
                  busy ||
                  count === 0
                }
                onPress={() =>
                  handleDelete(
                    filter as
                      DeletableStatus,
                  )
                }
                accessibilityRole="button"
                accessibilityLabel={`Remove ${label.toLowerCase()} orders`}
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
                      Remove
                    </AppText>
                  </>
                )}
              </Pressable>
            ) : (
              <View
                accessible
                accessibilityLabel={`${label} orders cannot be removed`}
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
      hardwareAccelerated
      onRequestClose={
        handleClose
      }
    >
      <View
        style={
          styles.modalOverlay
        }
      >
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

        <View
          accessibilityViewIsModal
          style={
            styles.modalCard
          }
        >
          <View
            style={
              styles.sheetHandle
            }
          />

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
                deletingStatus ===
                  null
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

          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              styles.scrollContent
            }
          >
            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.description
              }
            >
              Choose a category to view, or remove completed and cancelled order history.
            </AppText>

            <View
              style={
                styles.rows
              }
            >
              {rows.map(
                renderRow,
              )}
            </View>

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
                  role="customer"
                  size="sm"
                  color={
                    CustomerColors.primary
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
                  Order history protection
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.infoText
                  }
                >
                  Pending and active orders are protected. Completed, cancelled, declined, and expired orders can only be hidden from your order history.
                </AppText>
              </View>
            </View>
          </ScrollView>

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

                deletingStatus !==
                null
                  ? styles.doneDisabled
                  : null,

                pressed &&
                deletingStatus ===
                  null
                  ? styles.donePressed
                  : null,
              ]}
            >
              {deletingStatus !==
              null ? (
                <ActivityIndicator
                  size="small"
                  color={
                    Colors.textInverse
                  }
                />
              ) : (
                <AppIcon
                  name="check"
                  role="customer"
                  size="sm"
                  color={
                    Colors.textInverse
                  }
                />
              )}

              <AppText
                variant="body"
                weight="bold"
                style={
                  styles.doneText
                }
              >
                {deletingStatus !==
                null
                  ? "UPDATING..."
                  : "DONE"}
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

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
      maxHeight: "92%",

      paddingTop:
        FixxamTokens.spacing.sm,

      overflow: "hidden",

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

    modalHeader: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

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
        CustomerColors
          .primarySoft,
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
        Colors
          .disabledBackground,
    },

    closePressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    scrollContent: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.md,
    },

    description: {
      marginTop:
        FixxamTokens.spacing.md,

      lineHeight: 20,
    },

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
        CustomerColors
          .primarySoft,
    },

    deleteButton: {
      minWidth: 86,

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
        Colors
          .disabledBackground,

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
        Colors
          .disabledBackground,
    },

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
        CustomerColors
          .primarySoft,
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
        CustomerColors.primary,
    },

    infoText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 17,
    },

    footer: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      borderTopWidth:
        StyleSheet.hairlineWidth,

      borderTopColor:
        Colors.divider,

      backgroundColor:
        Colors.surface,
    },

    doneButton: {
      minHeight:
        FixxamTokens.size
          .buttonHeight,

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