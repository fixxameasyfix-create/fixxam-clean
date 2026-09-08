import React, {
  memo,
  useCallback,
  useState,
} from "react";

import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  router,
} from "expo-router";

import Toast from "react-native-toast-message";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import type {
  AppIconName,
} from "@/components/ui/AppIcon";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   SUPPORT CONSTANTS
============================================================ */

const WHATSAPP_SUPPORT_NUMBERS = [
  "+2347011712680",
  "+2349138712173",
] as const;

const SUPPORT_EMAIL =
  "support@fixxam.com";

const WHATSAPP_BRAND_COLOR =
  "#25D366";

/* ============================================================
   TYPES
============================================================ */

type SupportModalType =
  | "contact"
  | "faq"
  | null;

type SupportIconName =
  | AppIconName
  | "whatsapp-brand";

/* ============================================================
   HELPERS
============================================================ */

function normalizePhoneNumber(
  value: string,
): string {
  return value.replace(
    /[^0-9]/g,
    "",
  );
}

function formatPhoneNumber(
  value: string,
): string {
  const clean =
    normalizePhoneNumber(
      value,
    );

  if (
    clean.startsWith("234") &&
    clean.length === 13
  ) {
    return `+234 ${clean.slice(
      3,
      6,
    )} ${clean.slice(
      6,
      9,
    )} ${clean.slice(9)}`;
  }

  return value;
}

/* ============================================================
   CUSTOMER HELP & SUPPORT
============================================================ */

export default function CustomerHelpSupportScreen() {
  const [
    modalType,
    setModalType,
  ] =
    useState<SupportModalType>(
      null,
    );

  /* ==========================================================
     MODAL
  ========================================================== */

  const closeModal =
    useCallback(() => {
      setModalType(null);
    }, []);

  const handleFAQ =
    useCallback(() => {
      setModalType("faq");
    }, []);

  const handleContactSupport =
    useCallback(() => {
      setModalType(
        "contact",
      );
    }, []);

  /* ==========================================================
     WHATSAPP
  ========================================================== */

  const handleWhatsApp =
    useCallback(
      async (
        phoneNumber: string,
      ) => {
        const cleanNumber =
          normalizePhoneNumber(
            phoneNumber,
          );

        if (
          cleanNumber.length <
            10 ||
          cleanNumber.length >
            15
        ) {
          Toast.show({
            type: "error",
            text1:
              "Invalid support number",
            text2:
              "Please try another support option.",
          });

          return;
        }

        const whatsappUrl =
          `whatsapp://send?phone=${cleanNumber}`;

        const webUrl =
          `https://wa.me/${cleanNumber}`;

        try {
          const supported =
            await Linking.canOpenURL(
              whatsappUrl,
            );

          closeModal();

          if (supported) {
            await Linking.openURL(
              whatsappUrl,
            );

            return;
          }

          await Linking.openURL(
            webUrl,
          );
        } catch (error) {
          console.error(
            "WHATSAPP_SUPPORT_ERROR:",
            error,
          );

          Toast.show({
            type: "error",
            text1:
              "Unable to open WhatsApp",
            text2:
              "Please try again later.",
          });
        }
      },
      [
        closeModal,
      ],
    );

  /* ==========================================================
     EMAIL
  ========================================================== */

  const handleEmailSupport =
    useCallback(async () => {
      const url =
        `mailto:${SUPPORT_EMAIL}`;

      try {
        const supported =
          await Linking.canOpenURL(
            url,
          );

        if (!supported) {
          Toast.show({
            type: "error",
            text1:
              "Email unavailable",
            text2:
              "No email application is available on this device.",
          });

          return;
        }

        closeModal();

        await Linking.openURL(
          url,
        );
      } catch (error) {
        console.error(
          "EMAIL_SUPPORT_ERROR:",
          error,
        );

        Toast.show({
          type: "error",
          text1:
            "Unable to open email",
          text2:
            "Please try again later.",
        });
      }
    }, [
      closeModal,
    ]);

  /* ==========================================================
     CALL
  ========================================================== */

  const handleCallSupport =
    useCallback(() => {
      closeModal();

      /*
       * No dedicated support-call number
       * exists in the current source.
       * Do not invent one.
       */
      Toast.show({
        type: "info",
        text1:
          "Call support unavailable",
        text2:
          "Please use WhatsApp or email support.",
      });
    }, [
      closeModal,
    ]);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen
      role="customer"
      style={styles.screen}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <View
          style={styles.header}
        >
          <Pressable
            onPress={() =>
              router.back()
            }
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({
              pressed,
            }) => [
              styles.backButton,

              pressed
                ? styles.pressed
                : null,
            ]}
          >
            <AppIcon
              name="back"
              role="customer"
              size="md"
              color={
                Colors.textPrimary
              }
            />
          </Pressable>

          <View
            style={
              styles.headerText
            }
          >
            <AppText
              variant="heading2"
              weight="bold"
              style={styles.title}
            >
              Help & Support
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.subtitle
              }
            >
              We're here to help you
            </AppText>
          </View>
        </View>

        {/* ====================================================
            SUPPORT BANNER
        ==================================================== */}

        <View
          style={
            styles.supportBanner
          }
        >
          <View
            style={
              styles.supportIcon
            }
          >
            <AppIcon
              name="headset"
              role="customer"
              size="md"
              color={
                CustomerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.supportBannerContent
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.supportTitle
              }
            >
              Need help?
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.supportDescription
              }
            >
              Our support team is ready to assist you.
            </AppText>
          </View>
        </View>

        {/* ====================================================
            HELP
        ==================================================== */}

        <SectionTitle
          title="HELP"
        />

        <View
          style={styles.card}
        >
          <SupportRow
            icon="help"
            title="Frequently Asked Questions"
            subtitle="Find answers to common questions"
            onPress={
              handleFAQ
            }
          />

          <Divider />

          <SupportRow
            icon="messages"
            title="Contact Support"
            subtitle="Talk to the Fixxam support team"
            onPress={
              handleContactSupport
            }
          />
        </View>

        {/* ====================================================
            CONTACT
        ==================================================== */}

        <SectionTitle
          title="CONTACT US"
        />

        <View
          style={styles.card}
        >
          <SupportRow
            icon="whatsapp-brand"
            title="WhatsApp Support"
            subtitle="Chat with Fixxam support"
            onPress={
              handleContactSupport
            }
          />

          <Divider />

          <SupportRow
            icon="mail"
            title="Email Support"
            subtitle={
              SUPPORT_EMAIL
            }
            onPress={
              handleEmailSupport
            }
          />

          <Divider />

          <SupportRow
            icon="phone"
            title="Call Support"
            subtitle="Call Fixxam support"
            onPress={
              handleCallSupport
            }
          />
        </View>

        {/* ====================================================
            SAFETY
        ==================================================== */}

        <View
          style={
            styles.safetyCard
          }
        >
          <View
            style={
              styles.safetyIcon
            }
          >
            <AppIcon
              name="shield"
              size="sm"
              color={
                Colors.success
              }
            />
          </View>

          <View
            style={
              styles.safetyContent
            }
          >
            <AppText
              variant="body"
              weight="bold"
              style={
                styles.safetyTitle
              }
            >
              Your safety matters
            </AppText>

            <AppText
              variant="caption"
              style={
                styles.safetyText
              }
            >
              If you experience an urgent safety issue during a service, contact the appropriate emergency service immediately.
            </AppText>
          </View>
        </View>
      </ScrollView>

      {/* ======================================================
          CONTACT SUPPORT MODAL
      ====================================================== */}

      <ContactSupportModal
        visible={
          modalType ===
          "contact"
        }
        onClose={
          closeModal
        }
        onWhatsApp={
          handleWhatsApp
        }
        onEmail={
          handleEmailSupport
        }
        onCall={
          handleCallSupport
        }
      />

      {/* ======================================================
          FAQ MODAL
      ====================================================== */}

      <FAQModal
        visible={
          modalType === "faq"
        }
        onClose={
          closeModal
        }
      />
    </AppScreen>
  );
}

/* ============================================================
   SECTION TITLE
============================================================ */

function SectionTitle({
  title,
}: {
  title: string;
}) {
  return (
    <AppText
      variant="caption"
      weight="bold"
      style={
        styles.sectionTitle
      }
    >
      {title}
    </AppText>
  );
}

/* ============================================================
   SUPPORT ICON
============================================================ */

function SupportIcon({
  name,
  size = 20,
}: {
  name: SupportIconName;
  size?: number;
}) {
  if (
    name ===
    "whatsapp-brand"
  ) {
    return (
      <MaterialCommunityIcons
        name="whatsapp"
        size={size}
        color={
          WHATSAPP_BRAND_COLOR
        }
      />
    );
  }

  return (
    <AppIcon
      name={name}
      role="customer"
      size="sm"
      color={
        CustomerColors.primary
      }
    />
  );
}

/* ============================================================
   SUPPORT ROW
============================================================ */

function SupportRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: SupportIconName;

  title: string;

  subtitle: string;

  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        title
      }
      accessibilityHint={
        subtitle
      }
      style={({
        pressed,
      }) => [
        styles.row,

        pressed
          ? styles.pressedRow
          : null,
      ]}
    >
      <View
        style={
          styles.iconBox
        }
      >
        <SupportIcon
          name={icon}
        />
      </View>

      <View
        style={
          styles.rowContent
        }
      >
        <AppText
          variant="body"
          weight="bold"
          numberOfLines={1}
          style={
            styles.rowTitle
          }
        >
          {title}
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={2}
          style={
            styles.rowSubtitle
          }
        >
          {subtitle}
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
  );
}

/* ============================================================
   CONTACT SUPPORT MODAL
============================================================ */

function ContactSupportModal({
  visible,
  onClose,
  onWhatsApp,
  onEmail,
  onCall,
}: {
  visible: boolean;

  onClose: () => void;

  onWhatsApp: (
    phoneNumber: string,
  ) => void;

  onEmail: () => void;

  onCall: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={
        onClose
      }
    >
      <Pressable
        style={
          styles.modalOverlay
        }
        onPress={
          onClose
        }
      >
        <Pressable
          style={
            styles.modalCard
          }
          onPress={(
            event,
          ) =>
            event.stopPropagation()
          }
        >
          {/* ICON */}

          <View
            style={
              styles.modalIcon
            }
          >
            <AppIcon
              name="headset"
              role="customer"
              size="lg"
              color={
                CustomerColors.primary
              }
            />
          </View>

          {/* TITLE */}

          <AppText
            variant="heading3"
            weight="bold"
            center
            style={
              styles.modalTitle
            }
          >
            Contact Fixxam Support?
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.modalDescription
            }
          >
            Choose how you would like to contact our support team.
          </AppText>

          {/* WHATSAPP NUMBERS */}

          {WHATSAPP_SUPPORT_NUMBERS.map(
            (
              phoneNumber,
              index,
            ) => (
              <ModalAction
                key={
                  phoneNumber
                }
                icon="whatsapp-brand"
                title={`WhatsApp Support ${
                  index + 1
                }`}
                subtitle={
                  formatPhoneNumber(
                    phoneNumber,
                  )
                }
                onPress={() =>
                  onWhatsApp(
                    phoneNumber,
                  )
                }
              />
            ),
          )}

          {/* EMAIL */}

          <ModalAction
            icon="mail"
            title="Email Support"
            subtitle={
              SUPPORT_EMAIL
            }
            onPress={
              onEmail
            }
          />

          {/* CALL */}

          <ModalAction
            icon="phone"
            title="Call Support"
            subtitle="Currently unavailable"
            onPress={
              onCall
            }
          />

          {/* CANCEL */}

          <Pressable
            onPress={
              onClose
            }
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            style={({
              pressed,
            }) => [
              styles.cancelButton,

              pressed
                ? styles.cancelPressed
                : null,
            ]}
          >
            <AppText
              variant="body"
              weight="bold"
              style={
                styles.cancelText
              }
            >
              Cancel
            </AppText>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ============================================================
   MODAL ACTION
============================================================ */

const ModalAction =
  memo(
    function ModalAction({
      icon,
      title,
      subtitle,
      onPress,
    }: {
      icon: SupportIconName;

      title: string;

      subtitle: string;

      onPress: () => void;
    }) {
      return (
        <Pressable
          onPress={
            onPress
          }
          accessibilityRole="button"
          accessibilityLabel={`${title}, ${subtitle}`}
          style={({
            pressed,
          }) => [
            styles.modalAction,

            pressed
              ? styles.modalActionPressed
              : null,
          ]}
        >
          <View
            style={
              styles.modalActionIcon
            }
          >
            <SupportIcon
              name={icon}
            />
          </View>

          <View
            style={
              styles.modalActionContent
            }
          >
            <AppText
              variant="body"
              weight="bold"
              numberOfLines={1}
              style={
                styles.modalActionTitle
              }
            >
              {title}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.modalActionSubtitle
              }
            >
              {subtitle}
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
      );
    },
  );

/* ============================================================
   FAQ MODAL
============================================================ */

function FAQModal({
  visible,
  onClose,
}: {
  visible: boolean;

  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={
        onClose
      }
    >
      <Pressable
        style={
          styles.modalOverlay
        }
        onPress={
          onClose
        }
      >
        <Pressable
          style={
            styles.faqModalCard
          }
          onPress={(
            event,
          ) =>
            event.stopPropagation()
          }
        >
          <View
            style={
              styles.faqIcon
            }
          >
            <AppIcon
              name="help"
              role="customer"
              size="lg"
              color={
                CustomerColors.primary
              }
            />
          </View>

          <AppText
            variant="heading3"
            weight="bold"
            center
            style={
              styles.modalTitle
            }
          >
            Frequently Asked Questions
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.faqText
            }
          >
            It will be open by Fixxamgroup as soon as possible.
          </AppText>

          <Pressable
            onPress={
              onClose
            }
            accessibilityRole="button"
            accessibilityLabel="Close FAQ"
            style={({
              pressed,
            }) => [
              styles.primaryButton,

              pressed
                ? styles.pressed
                : null,
            ]}
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.primaryButtonText
              }
            >
              Okay
            </AppText>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ============================================================
   DIVIDER
============================================================ */

function Divider() {
  return (
    <View
      style={
        styles.divider
      }
    />
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       SCREEN
    ======================================================== */

    screen: {
      backgroundColor:
        Colors.background,
    },

    content: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      marginBottom:
        FixxamTokens.spacing.lg,

      flexDirection: "row",

      alignItems: "center",
    },

    backButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      alignItems: "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    headerText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
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

    /* ========================================================
       SUPPORT BANNER
    ======================================================== */

    supportBanner: {
      marginBottom:
        FixxamTokens.spacing.xl,

      padding:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        CustomerColors.primary,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    supportIcon: {
      width:
        FixxamTokens.size
          .iconBox,

      height:
        FixxamTokens.size
          .iconBox,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    supportBannerContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    supportTitle: {
      color:
        Colors.textPrimary,
    },

    supportDescription: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 16,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       SECTION
    ======================================================== */

    sectionTitle: {
      marginLeft:
        FixxamTokens.spacing.xs,

      marginBottom:
        FixxamTokens.spacing.sm,

      letterSpacing: 0.7,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      overflow: "hidden",

      marginBottom:
        FixxamTokens.spacing.xl,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       ROW
    ======================================================== */

    row: {
      minHeight: 72,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",
    },

    pressedRow: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      backgroundColor:
        Colors.disabledBackground,
    },

    iconBox: {
      width:
        FixxamTokens.size
          .iconBox,

      height:
        FixxamTokens.size
          .iconBox,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    rowContent: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.md,
    },

    rowTitle: {
      color:
        Colors.textPrimary,
    },

    rowSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 15,

      color:
        Colors.textSecondary,
    },

    divider: {
      height: 1,

      marginLeft: 66,

      backgroundColor:
        Colors.divider,
    },

    /* ========================================================
       SAFETY
    ======================================================== */

    safetyCard: {
      padding:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        Colors.success,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.successSoft,
    },

    safetyIcon: {
      width:
        FixxamTokens.size
          .iconBox,

      height:
        FixxamTokens.size
          .iconBox,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    safetyContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    safetyTitle: {
      color:
        Colors.success,
    },

    safetyText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 15,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       MODAL
    ======================================================== */

    modalOverlay: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems: "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.overlayMedium,
    },

    modalCard: {
      width: "100%",

      maxWidth: 430,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.xl,

      paddingBottom:
        FixxamTokens.spacing.lg,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    faqModalCard: {
      width: "100%",

      maxWidth: 430,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingTop:
        FixxamTokens.spacing.xl,

      paddingBottom:
        FixxamTokens.spacing.lg,

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    modalIcon: {
      width: 68,

      height: 68,

      marginBottom:
        FixxamTokens.spacing.md,

      alignSelf: "center",

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    faqIcon: {
      width: 68,

      height: 68,

      marginBottom:
        FixxamTokens.spacing.md,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    modalTitle: {
      color:
        Colors.textPrimary,
    },

    modalDescription: {
      marginTop:
        FixxamTokens.spacing.xs,

      marginBottom:
        FixxamTokens.spacing.lg,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       MODAL ACTION
    ======================================================== */

    modalAction: {
      minHeight: 66,

      marginBottom:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
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

    modalActionPressed: {
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

    modalActionIcon: {
      width:
        FixxamTokens.size
          .iconBox,

      height:
        FixxamTokens.size
          .iconBox,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    modalActionContent: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.sm,
    },

    modalActionTitle: {
      color:
        Colors.textPrimary,
    },

    modalActionSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       CANCEL
    ======================================================== */

    cancelButton: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.xs,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.button,
    },

    cancelPressed: {
      backgroundColor:
        Colors.disabledBackground,
    },

    cancelText: {
      color:
        Colors.textSecondary,
    },

    /* ========================================================
       FAQ
    ======================================================== */

    faqText: {
      marginTop:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.xl,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    primaryButton: {
      width: "100%",

      minHeight:
        FixxamTokens.size
          .buttonHeight,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    primaryButtonText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       PRESS
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