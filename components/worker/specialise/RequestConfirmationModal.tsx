import React, {
  memo,
  useMemo,
} from "react";

import {
  Modal,
  ScrollView,
  StyleSheet,
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

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  visible: boolean;

  workerName: string;

  service: string;

  location: string;

  phone: string;

  loading?: boolean;

  onCancel: () => void;

  onConfirm: () => void;
};

/* ==============================================================
   HELPERS
============================================================== */

function normalizeText(
  value: string,
  fallback: string,
): string {
  const normalized =
    value.trim();

  return normalized ||
    fallback;
}

/* ==============================================================
   COMPONENT
============================================================== */

function RequestConfirmationModal({
  visible,
  workerName,
  service,
  location,
  phone,
  loading = false,
  onCancel,
  onConfirm,
}: Props) {
  /*
   * Do not copy these props into local state.
   *
   * The modal must always display the latest
   * values received from the parent screen.
   */

  const displayWorkerName =
    useMemo(
      () =>
        normalizeText(
          workerName,
          "Worker",
        ),
      [workerName],
    );

  const displayService =
    useMemo(
      () =>
        normalizeText(
          service,
          "Not specified",
        ),
      [service],
    );

  const displayLocation =
    useMemo(
      () =>
        normalizeText(
          location,
          "Not specified",
        ),
      [location],
    );

  const displayPhone =
    useMemo(
      () =>
        normalizeText(
          phone,
          "Not specified",
        ),
      [phone],
    );

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <Modal
      visible={
        visible
      }
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (!loading) {
          onCancel();
        }
      }}
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
          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            bounces={false}
            contentContainerStyle={
              styles.content
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
                  styles.headerIcon
                }
              >
                <AppIcon
                  name="notifications"
                  role="worker"
                  size="md"
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
                  variant="heading2"
                  weight="bold"
                  numberOfLines={1}
                  style={
                    styles.title
                  }
                >
                  New Service Request
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.subtitle
                  }
                >
                  Review your request before sending.
                </AppText>
              </View>
            </View>

            {/* ==================================================
                WORKER
            ================================================== */}

            <View
              style={
                styles.workerCard
              }
            >
              <View
                style={
                  styles.workerIcon
                }
              >
                <AppIcon
                  name="profile"
                  role="worker"
                  size="sm"
                  color={
                    WorkerColors.primary
                  }
                />
              </View>

              <View
                style={
                  styles.workerInfo
                }
              >
                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.smallLabel
                  }
                >
                  Worker
                </AppText>

                <AppText
                  variant="bodyMedium"
                  weight="bold"
                  numberOfLines={1}
                  style={
                    styles.workerName
                  }
                >
                  {displayWorkerName}
                </AppText>
              </View>
            </View>

            {/* ==================================================
                DETAILS
            ================================================== */}

            <View
              style={
                styles.details
              }
            >
              <DetailRow
                icon="service"
                label="Service"
                value={
                  displayService
                }
              />

              <DetailRow
                icon="location"
                label="Location"
                value={
                  displayLocation
                }
                numberOfLines={3}
              />

              <DetailRow
                icon="phone"
                label="Phone"
                value={
                  displayPhone
                }
              />
            </View>

            {/* ==================================================
                INFORMATION
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
                <AppIcon
                  name="info"
                  role="worker"
                  size="sm"
                  color={
                    WorkerColors.primary
                  }
                />
              </View>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.infoText
                }
              >
                Your request will be sent to up to 5 customers in {displayLocation}.
              </AppText>
            </View>

            {/* ==================================================
                ACTIONS
            ================================================== */}

            <View
              style={
                styles.actions
              }
            >
              <View
                style={
                  styles.cancelAction
                }
              >
                <AppButton
                  title="Cancel"
                  role="worker"
                  variant="outline"
                  disabled={
                    loading
                  }
                  onPress={
                    onCancel
                  }
                  style={
                    styles.actionButton
                  }
                />
              </View>

              <View
                style={
                  styles.confirmAction
                }
              >
                <AppButton
                  title={
                    loading
                      ? "Sending..."
                      : "Send Request"
                  }
                  role="worker"
                  variant="primary"
                  leftIconName="next"
                  loading={
                    loading
                  }
                  disabled={
                    loading
                  }
                  onPress={
                    onConfirm
                  }
                  style={
                    styles.actionButton
                  }
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ==============================================================
   DETAIL ROW
============================================================== */

function DetailRow({
  icon,
  label,
  value,
  numberOfLines = 1,
}: {
  icon:
    | "service"
    | "location"
    | "phone";

  label: string;

  value: string;

  numberOfLines?: number;
}) {
  return (
    <View
      style={
        styles.detailRow
      }
    >
      <View
        style={
          styles.detailIcon
        }
      >
        <AppIcon
          name={
            icon
          }
          size="sm"
          color={
            Colors.textSecondary
          }
        />
      </View>

      <View
        style={
          styles.detailContent
        }
      >
        <AppText
          variant="caption"
          tone="secondary"
          style={
            styles.smallLabel
          }
        >
          {label}
        </AppText>

        <AppText
          variant="bodyMedium"
          weight="bold"
          numberOfLines={
            numberOfLines
          }
          style={
            styles.value
          }
        >
          {value}
        </AppText>
      </View>
    </View>
  );
}

/* ==============================================================
   MEMO
============================================================== */

RequestConfirmationModal.displayName =
  "RequestConfirmationModal";

export default memo(
  RequestConfirmationModal,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    overlay: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      backgroundColor:
        Colors.overlayMedium,
    },

    modal: {
      width: "100%",

      maxWidth: 430,

      maxHeight: "90%",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    content: {
      padding:
        FixxamTokens.spacing.lg,
    },

    /* ==========================================================
       HEADER
    ========================================================== */

    header: {
      marginBottom:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.md,
    },

    headerIcon: {
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
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    headerText: {
      flex: 1,

      minWidth: 0,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       WORKER
    ========================================================== */

    workerCard: {
      marginBottom:
        FixxamTokens.spacing.md,

      padding:
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

    workerIcon: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      marginRight:
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

    workerInfo: {
      flex: 1,

      minWidth: 0,
    },

    workerName: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textPrimary,
    },

    smallLabel: {
      color:
        Colors.textMuted,
    },

    /* ==========================================================
       DETAILS
    ========================================================== */

    details: {
      marginBottom:
        FixxamTokens.spacing.md,

      gap:
        FixxamTokens.spacing.xs,
    },

    detailRow: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      paddingVertical:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    detailIcon: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      marginRight:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },

    detailContent: {
      flex: 1,

      minWidth: 0,
    },

    value: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textPrimary,
    },

    /* ==========================================================
       INFO
    ========================================================== */

    infoBox: {
      marginBottom:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

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

    infoIcon: {
      width: 30,

      height: 30,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.sm,

      backgroundColor:
        Colors.surface,
    },

    infoText: {
      flex: 1,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       ACTIONS
    ========================================================== */

    actions: {
      flexDirection:
        "row",

      gap:
        FixxamTokens.spacing.sm,
    },

    cancelAction: {
      flex: 0.9,
    },

    confirmAction: {
      flex: 1.1,
    },

    actionButton: {
      width: "100%",
    },
  });