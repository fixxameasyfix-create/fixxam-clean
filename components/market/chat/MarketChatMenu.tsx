import React, {
  memo,
} from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  View,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
} from "@/theme";

import {
  styles,
} from "./marketChatStyles";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  visible: boolean;

  busy: boolean;

  hasPhone: boolean;

  deleting: boolean;

  onClose: () => void;

  onCall: () => void;

  onDelete: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

function MarketChatMenuComponent({
  visible,
  busy,
  hasPhone,
  deleting,
  onClose,
  onCall,
  onDelete,
}: Props) {
  const callDisabled =
    busy ||
    !hasPhone;

  return (
    <Modal
      visible={
        visible
      }
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={
        onClose
      }
    >
      {/* ======================================================
          OVERLAY
      ====================================================== */}

      <Pressable
        style={
          styles.menuOverlay
        }
        onPress={
          onClose
        }
        accessibilityRole="button"
        accessibilityLabel="Close chat options"
      >
        {/* ====================================================
            MENU CARD
        ==================================================== */}

        <Pressable
          style={
            styles.menuCard
          }
          onPress={(
            event,
          ) => {
            event.stopPropagation();
          }}
          accessible={false}
        >
          {/* ==================================================
              HEADER
          ================================================== */}

          <View
            style={
              styles.menuHeader
            }
          >
            <AppText
              variant="body"
              weight="bold"
              style={
                styles.menuTitle
              }
            >
              Chat Options
            </AppText>

            <Pressable
              onPress={
                onClose
              }
              accessibilityRole="button"
              accessibilityLabel="Close chat options"
              hitSlop={8}
              style={
                styles.menuClose
              }
            >
              <AppIcon
                name="close"
                size="sm"
                color={
                  Colors.textPrimary
                }
              />
            </Pressable>
          </View>

          {/* ==================================================
              CALL STORE
          ================================================== */}

          <Pressable
            onPress={
              onCall
            }
            disabled={
              callDisabled
            }
            accessibilityRole="button"
            accessibilityLabel={
              hasPhone
                ? "Call store"
                : "Store phone unavailable"
            }
            accessibilityState={{
              disabled:
                callDisabled,
            }}
            style={[
              styles.menuItem,

              callDisabled
                ? styles.menuItemDisabled
                : null,
            ]}
          >
            <View
              style={[
                styles.menuIcon,
                styles.callIcon,
              ]}
            >
              <AppIcon
                name="phone"
                size="sm"
                color={
                  Colors.success
                }
              />
            </View>

            <View
              style={
                styles.menuItemInfo
              }
            >
              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.menuItemTitle
                }
              >
                Call Store
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.menuItemSubtitle
                }
              >
                {hasPhone
                  ? "Call the store directly"
                  : "Store phone unavailable"}
              </AppText>
            </View>

            <AppIcon
              name="next"
              size="xs"
              color={
                Colors.textMuted
              }
            />
          </Pressable>

          {/* ==================================================
              DELETE OWN MESSAGES
          ================================================== */}

          <Pressable
            onPress={
              onDelete
            }
            disabled={
              busy
            }
            accessibilityRole="button"
            accessibilityLabel={
              deleting
                ? "Deleting your messages"
                : "Delete my messages"
            }
            accessibilityState={{
              disabled:
                busy,
              busy:
                deleting,
            }}
            style={[
              styles.menuItem,
              styles.deleteMenuItem,

              busy
                ? styles.menuItemDisabled
                : null,
            ]}
          >
            <View
              style={[
                styles.menuIcon,
                styles.deleteIcon,
              ]}
            >
              {deleting ? (
                <ActivityIndicator
                  size="small"
                  color={
                    Colors.error
                  }
                />
              ) : (
                <AppIcon
                  name="delete"
                  size="sm"
                  color={
                    Colors.error
                  }
                />
              )}
            </View>

            <View
              style={
                styles.menuItemInfo
              }
            >
              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.deleteTitle
                }
              >
                {deleting
                  ? "Deleting Messages..."
                  : "Delete My Messages"}
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.menuItemSubtitle
                }
              >
                Delete only the messages you sent
              </AppText>
            </View>

            <AppIcon
              name="next"
              size="xs"
              color={
                Colors.textMuted
              }
            />
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ============================================================
   MEMO
============================================================ */

const MarketChatMenu =
  memo(
    MarketChatMenuComponent,
  );

MarketChatMenu.displayName =
  "MarketChatMenu";

export default MarketChatMenu;