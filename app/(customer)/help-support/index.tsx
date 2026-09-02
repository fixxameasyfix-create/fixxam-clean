import React, {
  useCallback,
  useState,
} from "react";

import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router } from "expo-router";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

/* ============================================================
   SUPPORT CONSTANTS
============================================================ */

const WHATSAPP_SUPPORT_NUMBERS = [
  "+2347011712680",
  "+2349138712173",
];

const SUPPORT_EMAIL =
  "support@fixxam.com";

/* ============================================================
   MODAL TYPES
============================================================ */

type SupportModalType =
  | "contact"
  | "faq"
  | null;

/* ============================================================
   CUSTOMER HELP & SUPPORT
============================================================ */

export default function CustomerHelpSupportScreen() {
  const [
    modalType,
    setModalType,
  ] = useState<SupportModalType>(
    null,
  );

  /* ==========================================================
     CLOSE MODAL
  ========================================================== */

  const closeModal =
    useCallback(() => {
      setModalType(null);
    }, []);

  /* ==========================================================
     OPEN WHATSAPP
  ========================================================== */

  const handleWhatsApp =
    useCallback(
      async (phoneNumber: string) => {
        const cleanNumber =
          phoneNumber.replace(
            /[^0-9]/g,
            "",
          );

        const whatsappUrl =
          `whatsapp://send?phone=${cleanNumber}`;

        const webUrl =
          `https://wa.me/${cleanNumber}`;

        try {
          const supported =
            await Linking.canOpenURL(
              whatsappUrl,
            );

          if (supported) {
            await Linking.openURL(
              whatsappUrl,
            );

            return;
          }

          const webSupported =
            await Linking.canOpenURL(
              webUrl,
            );

          if (webSupported) {
            await Linking.openURL(
              webUrl,
            );

            return;
          }

          Alert.alert(
            "WhatsApp unavailable",
            "WhatsApp is not available on this device.",
          );
        } catch (error) {
          console.error(
            "WHATSAPP_SUPPORT_ERROR:",
            error,
          );

          Alert.alert(
            "Unable to open WhatsApp",
            "Please try again later.",
          );
        }
      },
      [],
    );

  /* ==========================================================
     EMAIL SUPPORT
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
          Alert.alert(
            "Email unavailable",
            "No email application is available on this device.",
          );

          return;
        }

        await Linking.openURL(url);
      } catch (error) {
        console.error(
          "EMAIL_SUPPORT_ERROR:",
          error,
        );

        Alert.alert(
          "Unable to open email",
          "Please try again later.",
        );
      }
    }, []);

  /* ==========================================================
     CALL SUPPORT
  ========================================================== */

  const handleCallSupport =
    useCallback(() => {
      Alert.alert(
        "Call Support",
        "Calling is not available on this device",
      );
    }, []);

  /* ==========================================================
     FAQ
  ========================================================== */

  const handleFAQ =
    useCallback(() => {
      setModalType("faq");
    }, []);

  /* ==========================================================
     CONTACT SUPPORT
  ========================================================== */

  const handleContactSupport =
    useCallback(() => {
      setModalType("contact");
    }, []);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen
      contentContainerStyle={
        styles.screen
      }
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
          style={
            styles.header
          }
        >
          <Pressable
            onPress={() =>
              router.back()
            }
            style={
              styles.backButton
            }
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#0F172A"
            />
          </Pressable>

          <View
            style={
              styles.headerText
            }
          >
            <AppText
              weight="bold"
              style={
                styles.title
              }
            >
              Help & Support
            </AppText>

            <AppText
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
            <Ionicons
              name="headset-outline"
              size={27}
              color="#2563EB"
            />
          </View>

          <View
            style={
              styles.supportBannerContent
            }
          >
            <AppText
              weight="bold"
              style={
                styles.supportTitle
              }
            >
              Need help?
            </AppText>

            <AppText
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
          style={
            styles.card
          }
        >
          <SupportRow
            icon="help-circle-outline"
            title="Frequently Asked Questions"
            subtitle="Find answers to common questions"
            onPress={
              handleFAQ
            }
          />

          <Divider />

          <SupportRow
            icon="chatbubble-ellipses-outline"
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
          style={
            styles.card
          }
        >
          <SupportRow
            icon="logo-whatsapp"
            title="WhatsApp Support"
            subtitle="Chat with Fixxam support"
            onPress={
              handleContactSupport
          }
          />

          <Divider />

          <SupportRow
            icon="mail-outline"
            title="Email Support"
            subtitle={SUPPORT_EMAIL}
            onPress={
              handleEmailSupport
            }
          />

          <Divider />

          <SupportRow
            icon="call-outline"
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
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color="#16A34A"
            />
          </View>

          <View
            style={
              styles.safetyContent
            }
          >
            <AppText
              weight="bold"
              style={
                styles.safetyTitle
              }
            >
              Your safety matters
            </AppText>

            <AppText
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
          modalType === "contact"
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
   SUPPORT ROW
============================================================ */

function SupportRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed &&
          styles.pressedRow,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View
        style={
          styles.iconBox
        }
      >
        <Ionicons
          name={icon}
          size={20}
          color="#2563EB"
        />
      </View>

      <View
        style={
          styles.rowContent
        }
      >
        <AppText
          weight="bold"
          style={
            styles.rowTitle
          }
        >
          {title}
        </AppText>

        <AppText
          style={
            styles.rowSubtitle
          }
        >
          {subtitle}
        </AppText>
      </View>

      <Ionicons
        name="chevron-forward"
        size={19}
        color="#94A3B8"
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
      onRequestClose={
        onClose
      }
    >
      <View
        style={
          styles.modalOverlay
        }
      >
        <View
          style={
            styles.modalCard
          }
        >
          {/* ICON */}

          <View
            style={
              styles.modalIcon
            }
          >
            <Ionicons
              name="headset-outline"
              size={31}
              color="#2563EB"
            />
          </View>

          {/* TITLE */}

          <AppText
            weight="bold"
            style={
              styles.modalTitle
            }
          >
            Contact Fixxam Support?
          </AppText>

          <AppText
            style={
              styles.modalDescription
            }
          >
            Choose how you would like to contact our support team.
          </AppText>

          {/* WHATSAPP 1 */}

          <ModalAction
            icon="logo-whatsapp"
            title="WhatsApp Support"
            subtitle="+234 913 871 2173"
            onPress={() =>
              onWhatsApp(
                WHATSAPP_SUPPORT_NUMBERS[0],
              )
            }
          />

          {/* WHATSAPP 2 */}

          <ModalAction
            icon="logo-whatsapp"
            title="WhatsApp Support"
            subtitle="+234 912 135 0789"
            onPress={() =>
              onWhatsApp(
                WHATSAPP_SUPPORT_NUMBERS[1],
              )
            }
          />

          {/* EMAIL */}

          <ModalAction
            icon="mail-outline"
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
            icon="call-outline"
            title="Call Support"
            subtitle="Calling is not available on this device"
            onPress={
              onCall
            }
          />

          {/* CANCEL */}

          <Pressable
            onPress={
              onClose
            }
            style={({ pressed }) => [
              styles.cancelButton,
              pressed &&
                styles.cancelPressed,
            ]}
          >
            <AppText
              weight="bold"
              style={
                styles.cancelText
              }
            >
              Cancel
            </AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/* ============================================================
   MODAL ACTION
============================================================ */

function ModalAction({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.modalAction,
        pressed &&
          styles.modalActionPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View
        style={
          styles.modalActionIcon
        }
      >
        <Ionicons
          name={icon}
          size={21}
          color="#2563EB"
        />
      </View>

      <View
        style={
          styles.modalActionContent
        }
      >
        <AppText
          weight="bold"
          style={
            styles.modalActionTitle
          }
        >
          {title}
        </AppText>

        <AppText
          style={
            styles.modalActionSubtitle
          }
        >
          {subtitle}
        </AppText>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#94A3B8"
      />
    </Pressable>
  );
}

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
      onRequestClose={
        onClose
      }
    >
      <View
        style={
          styles.modalOverlay
        }
      >
        <View
          style={
            styles.faqModalCard
          }
        >
          {/* ICON */}

          <View
            style={
              styles.faqIcon
            }
          >
            <Ionicons
              name="help-circle-outline"
              size={31}
              color="#2563EB"
            />
          </View>

          <AppText
            weight="bold"
            style={
              styles.modalTitle
            }
          >
            Frequently Asked Questions
          </AppText>

          <AppText
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
            style={({ pressed }) => [
              styles.primaryButton,
              pressed &&
                styles.primaryPressed,
            ]}
          >
            <AppText
              weight="bold"
              style={
                styles.primaryButtonText
              }
            >
              Okay
            </AppText>
          </Pressable>
        </View>
      </View>
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
    screen: {
      paddingHorizontal: 0,
      paddingTop: 0,
      paddingBottom: 0,
    },

    content: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 110,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      alignItems: "center",
      justifyContent: "center",
    },

    headerText: {
      flex: 1,
      marginLeft: 12,
    },

    title: {
      fontSize: 20,
      color: "#0F172A",
    },

    subtitle: {
      marginTop: 3,
      fontSize: 11.5,
      color: "#64748B",
    },

    /* ========================================================
       SUPPORT BANNER
    ======================================================== */

    supportBanner: {
      padding: 14,
      borderRadius: 17,
      backgroundColor: "#EFF6FF",
      borderWidth: 1,
      borderColor: "#BFDBFE",
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 22,
    },

    supportIcon: {
      width: 48,
      height: 48,
      borderRadius: 15,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
    },

    supportBannerContent: {
      flex: 1,
      marginLeft: 11,
    },

    supportTitle: {
      fontSize: 14,
      color: "#1E40AF",
    },

    supportDescription: {
      marginTop: 3,
      fontSize: 10.5,
      lineHeight: 15,
      color: "#475569",
    },

    /* ========================================================
       SECTION
    ======================================================== */

    sectionTitle: {
      marginLeft: 4,
      marginBottom: 8,
      fontSize: 11,
      letterSpacing: 0.7,
      color: "#64748B",
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      marginBottom: 20,
      borderRadius: 17,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      overflow: "hidden",
    },

    /* ========================================================
       ROW
    ======================================================== */

    row: {
      minHeight: 72,
      paddingHorizontal: 14,
      paddingVertical: 11,
      flexDirection: "row",
      alignItems: "center",
    },

    pressedRow: {
      opacity: 0.7,
    },

    iconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    rowContent: {
      flex: 1,
      marginHorizontal: 12,
    },

    rowTitle: {
      fontSize: 14,
      color: "#0F172A",
    },

    rowSubtitle: {
      marginTop: 3,
      fontSize: 10.5,
      lineHeight: 15,
      color: "#64748B",
    },

    divider: {
      height: 1,
      marginLeft: 66,
      backgroundColor: "#F1F5F9",
    },

    /* ========================================================
       SAFETY
    ======================================================== */

    safetyCard: {
      padding: 13,
      borderRadius: 16,
      backgroundColor: "#F0FDF4",
      borderWidth: 1,
      borderColor: "#BBF7D0",
      flexDirection: "row",
      alignItems: "center",
    },

    safetyIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
    },

    safetyContent: {
      flex: 1,
      marginLeft: 10,
    },

    safetyTitle: {
      fontSize: 12.5,
      color: "#166534",
    },

    safetyText: {
      marginTop: 3,
      fontSize: 10,
      lineHeight: 15,
      color: "#4D7C5A",
    },

    /* ========================================================
       MODAL
    ======================================================== */

    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(15, 23, 42, 0.45)",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 22,
    },

    modalCard: {
      width: "100%",
      maxWidth: 430,
      borderRadius: 26,
      backgroundColor: "#FFFFFF",
      paddingHorizontal: 18,
      paddingTop: 24,
      paddingBottom: 16,
    },

    faqModalCard: {
      width: "100%",
      maxWidth: 430,
      borderRadius: 26,
      backgroundColor: "#FFFFFF",
      paddingHorizontal: 22,
      paddingTop: 26,
      paddingBottom: 20,
      alignItems: "center",
    },

    modalIcon: {
      width: 68,
      height: 68,
      borderRadius: 22,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginBottom: 14,
    },

    faqIcon: {
      width: 68,
      height: 68,
      borderRadius: 22,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },

    modalTitle: {
      fontSize: 20,
      lineHeight: 26,
      textAlign: "center",
      color: "#0F172A",
    },

    modalDescription: {
      marginTop: 6,
      marginBottom: 17,
      fontSize: 12,
      lineHeight: 18,
      textAlign: "center",
      color: "#64748B",
    },

    modalAction: {
      minHeight: 66,
      borderRadius: 15,
      backgroundColor: "#F8FAFC",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 11,
      marginBottom: 8,
    },

    modalActionPressed: {
      opacity: 0.72,
      transform: [
        {
          scale: 0.99,
        },
      ],
    },

    modalActionIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
    },

    modalActionContent: {
      flex: 1,
      marginHorizontal: 10,
    },

    modalActionTitle: {
      fontSize: 12.5,
      color: "#0F172A",
    },

    modalActionSubtitle: {
      marginTop: 3,
      fontSize: 10,
      lineHeight: 14,
      color: "#64748B",
    },

    cancelButton: {
      minHeight: 48,
      marginTop: 6,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },

    cancelPressed: {
      backgroundColor: "#F8FAFC",
    },

    cancelText: {
      fontSize: 13,
      color: "#64748B",
    },

    /* ========================================================
       FAQ
    ======================================================== */

    faqText: {
      marginTop: 12,
      marginBottom: 22,
      fontSize: 13,
      lineHeight: 20,
      textAlign: "center",
      color: "#64748B",
    },

    primaryButton: {
      width: "100%",
      minHeight: 48,
      borderRadius: 14,
      backgroundColor: "#2563EB",
      alignItems: "center",
      justifyContent: "center",
    },

    primaryPressed: {
      opacity: 0.8,
    },

    primaryButtonText: {
      fontSize: 13,
      color: "#FFFFFF",
    },
  });