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

import { router } from "expo-router";

import FontAwesome from "@expo/vector-icons/FontAwesome";

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
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   CONSTANTS
============================================================ */

const SUPPORT_EMAIL =
  "fixxameasyfix@gmail.com";

const SUPPORT_PHONE_NUMBER =
  "+2349121350789";

const SUPPORT_PHONE_DISPLAY =
  "+234 912 1350 789";

const SUPPORT_WHATSAPP_1 = {
  label: "WhatsApp Support 1",
  display: "+234 701 171 2680",
  number: "2347011712680",
} as const;

const SUPPORT_WHATSAPP_2 = {
  label: "WhatsApp Support 2",
  display: "+234 913 871 2173",
  number: "2349138712173",
} as const;

const WHATSAPP_MESSAGE =
  "Hello Fixxam Support, I need help with my worker account.";

/* ============================================================
   TYPES
============================================================ */

type SupportRowProps = {
  icon: AppIconName;
  title: string;
  description: string;
  onPress: () => void;

  iconColor?: string;
  iconBackgroundColor?: string;

  isWhatsApp?: boolean;
};

type ContactOptionProps = {
  icon: AppIconName;
  title: string;
  description: string;
  onPress: () => void;

  iconColor?: string;
  iconBackgroundColor?: string;

  isWhatsApp?: boolean;
};

/* ============================================================
   HELPERS
============================================================ */

async function openExternalUrl(
  url: string,
  errorMessage: string,
): Promise<void> {
  try {
    await Linking.openURL(url);
  } catch (error) {
    console.error(
      "WORKER_SUPPORT_LINK_ERROR:",
      error,
    );

    Toast.show({
      type: "error",
      text1: "Unable to open",
      text2: errorMessage,
    });
  }
}

/* ============================================================
   SCREEN
============================================================ */

export default function WorkerHelpSupportScreen() {
  /* ==========================================================
     MODALS
  ========================================================== */

  const [
    faqVisible,
    setFaqVisible,
  ] = useState(false);

  const [
    contactVisible,
    setContactVisible,
  ] = useState(false);

  /* ==========================================================
     BACK
  ========================================================== */

  const handleBack =
    useCallback(() => {
      router.back();
    }, []);

  /* ==========================================================
     FAQ
  ========================================================== */

  const handleFaq =
    useCallback(() => {
      setFaqVisible(true);
    }, []);

  const handleCloseFaq =
    useCallback(() => {
      setFaqVisible(false);
    }, []);

  /* ==========================================================
     CONTACT SUPPORT
  ========================================================== */

  const handleContactSupport =
    useCallback(() => {
      setContactVisible(true);
    }, []);

  const handleCloseContact =
    useCallback(() => {
      setContactVisible(false);
    }, []);

  /* ==========================================================
     WHATSAPP
  ========================================================== */

  const openWhatsApp =
    useCallback(
      async (
        number: string,
      ): Promise<void> => {
        const message =
          encodeURIComponent(
            WHATSAPP_MESSAGE,
          );

        const whatsappUrl =
          `https://wa.me/${number}?text=${message}`;

        await openExternalUrl(
          whatsappUrl,
          "Unable to open WhatsApp.",
        );
      },
      [],
    );

  const handleWhatsApp =
    useCallback(() => {
      setContactVisible(true);
    }, []);

  const handleWhatsAppOne =
    useCallback(() => {
      setContactVisible(false);

      void openWhatsApp(
        SUPPORT_WHATSAPP_1.number,
      );
    }, [openWhatsApp]);

  const handleWhatsAppTwo =
    useCallback(() => {
      setContactVisible(false);

      void openWhatsApp(
        SUPPORT_WHATSAPP_2.number,
      );
    }, [openWhatsApp]);

  /* ==========================================================
     EMAIL
  ========================================================== */

  const handleEmail =
    useCallback(() => {
      const subject =
        encodeURIComponent(
          "Fixxam Worker Support",
        );

      const body =
        encodeURIComponent(
          [
            "Hello Fixxam Support,",
            "",
            "I need help with my worker account.",
            "",
          ].join("\n"),
        );

      const emailUrl =
        `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

      void openExternalUrl(
        emailUrl,
        "Unable to open your email app.",
      );
    }, []);

  const handleModalEmail =
    useCallback(() => {
      setContactVisible(false);

      handleEmail();
    }, [handleEmail]);

  /* ==========================================================
     CALL
  ========================================================== */

  const handleCall =
    useCallback(() => {
      void openExternalUrl(
        `tel:${SUPPORT_PHONE_NUMBER}`,
        "Unable to open your phone app.",
      );
    }, []);

  const handleModalCall =
    useCallback(() => {
      setContactVisible(false);

      handleCall();
    }, [handleCall]);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen role="worker">
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.content
        }
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Returns to your worker profile"
            hitSlop={8}
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,

              pressed
                ? styles.buttonPressed
                : null,
            ]}
          >
            <AppIcon
              name="back"
              size="md"
              color={
                Colors.textPrimary
              }
            />
          </Pressable>

          <View
            style={
              styles.headerContent
            }
          >
            <AppText
              variant="heading1"
              weight="bold"
              style={styles.title}
            >
              Help & Support
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={styles.subtitle}
            >
              We're here to help you
            </AppText>
          </View>
        </View>

        {/* ==================================================
            SUPPORT INTRO
        ================================================== */}

        <View
          style={
            styles.supportBanner
          }
        >
          <View
            style={
              styles.supportBannerIcon
            }
          >
            <AppIcon
              name="headset"
              role="worker"
              size="md"
              color={
                WorkerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.supportBannerContent
            }
          >
            <AppText
              variant="bodyLarge"
              weight="bold"
              style={
                styles.supportBannerTitle
              }
            >
              Need help?
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.supportBannerDescription
              }
            >
              Our support team is ready to assist you.
            </AppText>
          </View>
        </View>

        {/* ==================================================
            HELP
        ================================================== */}

        <SectionTitle>
          HELP
        </SectionTitle>

        <View style={styles.card}>
          <SupportRow
            icon="help"
            title="Frequently Asked Questions"
            description="Find answers to common questions"
            onPress={handleFaq}
          />

          <View
            style={styles.divider}
          />

          <SupportRow
            icon="headset"
            title="Contact Support"
            description="Talk to the Fixxam support team"
            onPress={
              handleContactSupport
            }
          />
        </View>

        {/* ==================================================
            CONTACT US
        ================================================== */}

        <SectionTitle>
          CONTACT US
        </SectionTitle>

        <View style={styles.card}>
          <SupportRow
            icon="messages"
            isWhatsApp
            title="WhatsApp Support"
            description="Chat with Fixxam support"
            onPress={handleWhatsApp}
            iconBackgroundColor={
              Colors.successSoft
            }
          />

          <View
            style={styles.divider}
          />

          <SupportRow
            icon="mail"
            title="Email Support"
            description={
              SUPPORT_EMAIL
            }
            onPress={handleEmail}
          />

          <View
            style={styles.divider}
          />

          <SupportRow
            icon="phone"
            title="Call Support"
            description={
              SUPPORT_PHONE_DISPLAY
            }
            onPress={handleCall}
          />
        </View>

        {/* ==================================================
            SAFETY
        ================================================== */}

        <View
          style={styles.safetyCard}
        >
          <View
            style={styles.safetyIcon}
          >
            <AppIcon
              name="security"
              size="md"
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
              variant="bodyLarge"
              weight="bold"
              style={
                styles.safetyTitle
              }
            >
              Your safety matters
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.safetyDescription
              }
            >
              If you experience an urgent safety issue during a job, contact the appropriate emergency service immediately.
            </AppText>
          </View>
        </View>
      </ScrollView>

      {/* ======================================================
          FAQ MODAL
      ====================================================== */}

      <Modal
        visible={faqVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={
          handleCloseFaq
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <Pressable
            style={
              StyleSheet.absoluteFill
            }
            onPress={
              handleCloseFaq
            }
            accessibilityRole="button"
            accessibilityLabel="Close FAQ"
          />

          <View
            style={styles.faqModal}
          >
            <View
              style={
                styles.modalIcon
              }
            >
              <AppIcon
                name="help"
                role="worker"
                size="lg"
                color={
                  WorkerColors.primary
                }
              />
            </View>

            <AppText
              variant="heading2"
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
                styles.modalDescription
              }
            >
              It will be open by Fixxamgroup as soon as possible.
            </AppText>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Okay"
              onPress={
                handleCloseFaq
              }
              style={({
                pressed,
              }) => [
                styles.primaryModalButton,

                pressed
                  ? styles.buttonPressed
                  : null,
              ]}
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
                style={
                  styles.primaryModalButtonText
                }
              >
                Okay
              </AppText>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ======================================================
          CONTACT SUPPORT MODAL
      ====================================================== */}

      <Modal
        visible={contactVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={
          handleCloseContact
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <Pressable
            style={
              StyleSheet.absoluteFill
            }
            onPress={
              handleCloseContact
            }
            accessibilityRole="button"
            accessibilityLabel="Close contact support"
          />

          <View
            style={
              styles.contactModal
            }
          >
            <View
              style={
                styles.modalIcon
              }
            >
              <AppIcon
                name="headset"
                role="worker"
                size="lg"
                color={
                  WorkerColors.primary
                }
              />
            </View>

            <AppText
              variant="heading2"
              weight="bold"
              center
              style={
                styles.modalTitle
              }
            >
              Contact Fixxam Support
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

            <View
              style={
                styles.contactOptions
              }
            >
              {/* WHATSAPP SUPPORT 1 */}

              <ContactOption
                icon="messages"
                isWhatsApp
                title={
                  SUPPORT_WHATSAPP_1.label
                }
                description={
                  SUPPORT_WHATSAPP_1.display
                }
                iconBackgroundColor={
                  Colors.successSoft
                }
                onPress={
                  handleWhatsAppOne
                }
              />

              <View
                style={
                  styles.modalDivider
                }
              />

              {/* WHATSAPP SUPPORT 2 */}

              <ContactOption
                icon="messages"
                isWhatsApp
                title={
                  SUPPORT_WHATSAPP_2.label
                }
                description={
                  SUPPORT_WHATSAPP_2.display
                }
                iconBackgroundColor={
                  Colors.successSoft
                }
                onPress={
                  handleWhatsAppTwo
                }
              />

              <View
                style={
                  styles.modalDivider
                }
              />

              {/* EMAIL */}

              <ContactOption
                icon="mail"
                title="Email Support"
                description={
                  SUPPORT_EMAIL
                }
                onPress={
                  handleModalEmail
                }
              />

              <View
                style={
                  styles.modalDivider
                }
              />

              {/* CALL */}

              <ContactOption
                icon="phone"
                title="Call Support"
                description={
                  SUPPORT_PHONE_DISPLAY
                }
                onPress={
                  handleModalCall
                }
              />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              onPress={
                handleCloseContact
              }
              style={({
                pressed,
              }) => [
                styles.cancelButton,

                pressed
                  ? styles.buttonPressed
                  : null,
              ]}
            >
              <AppText
                variant="bodyLarge"
                weight="medium"
                tone="secondary"
              >
                Cancel
              </AppText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

/* ============================================================
   SECTION TITLE
============================================================ */

type SectionTitleProps = {
  children: React.ReactNode;
};

const SectionTitle =
  memo(
    function SectionTitle({
      children,
    }: SectionTitleProps) {
      return (
        <AppText
          variant="caption"
          weight="medium"
          style={
            styles.sectionTitle
          }
        >
          {children}
        </AppText>
      );
    },
  );

/* ============================================================
   SUPPORT ROW
============================================================ */

const SupportRow =
  memo(
    function SupportRow({
      icon,
      title,
      description,
      onPress,
      iconColor,
      iconBackgroundColor,
      isWhatsApp = false,
    }: SupportRowProps) {
      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            title
          }
          accessibilityHint={
            description
          }
          onPress={onPress}
          style={({ pressed }) => [
            styles.supportRow,

            pressed
              ? styles.rowPressed
              : null,
          ]}
        >
          <View
            style={[
              styles.rowIcon,

              iconBackgroundColor
                ? {
                    backgroundColor:
                      iconBackgroundColor,
                  }
                : null,
            ]}
          >
            {isWhatsApp ? (
              <FontAwesome
                name="whatsapp"
                size={24}
                color={
                  Colors.success
                }
              />
            ) : (
              <AppIcon
                name={icon}
                role="worker"
                size="sm"
                color={
                  iconColor ??
                  WorkerColors.primary
                }
              />
            )}
          </View>

          <View
            style={
              styles.rowContent
            }
          >
            <AppText
              variant="bodyLarge"
              weight="medium"
              style={
                styles.rowTitle
              }
            >
              {title}
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.rowDescription
              }
            >
              {description}
            </AppText>
          </View>

          <View
            style={styles.chevron}
          >
            <AppIcon
              name="next"
              size="sm"
              color={
                Colors.textSecondary
              }
            />
          </View>
        </Pressable>
      );
    },
  );

/* ============================================================
   CONTACT OPTION
============================================================ */

const ContactOption =
  memo(
    function ContactOption({
      icon,
      title,
      description,
      onPress,
      iconColor,
      iconBackgroundColor,
      isWhatsApp = false,
    }: ContactOptionProps) {
      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            title
          }
          accessibilityHint={
            description
          }
          onPress={onPress}
          style={({ pressed }) => [
            styles.contactOption,

            pressed
              ? styles.rowPressed
              : null,
          ]}
        >
          <View
            style={[
              styles.contactOptionIcon,

              iconBackgroundColor
                ? {
                    backgroundColor:
                      iconBackgroundColor,
                  }
                : null,
            ]}
          >
            {isWhatsApp ? (
              <FontAwesome
                name="whatsapp"
                size={25}
                color={
                  Colors.success
                }
              />
            ) : (
              <AppIcon
                name={icon}
                role="worker"
                size="md"
                color={
                  iconColor ??
                  WorkerColors.primary
                }
              />
            )}
          </View>

          <View
            style={
              styles.contactOptionContent
            }
          >
            <AppText
              variant="bodyLarge"
              weight="medium"
              numberOfLines={1}
              style={
                styles.contactOptionTitle
              }
            >
              {title}
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.contactOptionDescription
              }
            >
              {description}
            </AppText>
          </View>

          <View
            style={
              styles.contactOptionChevron
            }
          >
            <AppIcon
              name="next"
              size="sm"
              color={
                Colors.textSecondary
              }
            />
          </View>
        </Pressable>
      );
    },
  );

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    content: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    header: {
      flexDirection: "row",

      alignItems: "center",

      marginBottom:
        FixxamTokens.spacing.lg,
    },

    backButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      marginRight:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    buttonPressed: {
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

    headerContent: {
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
    },

    supportBanner: {
      flexDirection: "row",

      alignItems: "center",

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    supportBannerIcon: {
      width: 52,

      height: 52,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      marginRight:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    supportBannerContent: {
      flex: 1,

      minWidth: 0,
    },

    supportBannerTitle: {
      color:
        Colors.textPrimary,
    },

    supportBannerDescription: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 20,
    },

    sectionTitle: {
      marginTop:
        FixxamTokens.spacing.xl,

      marginLeft:
        FixxamTokens.spacing.xs,

      marginBottom:
        FixxamTokens.spacing.sm,

      letterSpacing: 0.8,

      color:
        Colors.textSecondary,
    },

    card: {
      overflow: "hidden",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    supportRow: {
      minHeight: 92,

      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,
    },

    rowPressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    rowIcon: {
      width: 52,

      height: 52,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      marginRight:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    rowContent: {
      flex: 1,

      minWidth: 0,

      paddingRight:
        FixxamTokens.spacing.sm,
    },

    rowTitle: {
      color:
        Colors.textPrimary,
    },

    rowDescription: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 20,
    },

    chevron: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",
    },

    divider: {
      height:
        StyleSheet.hairlineWidth,

      marginLeft:
        52 +
        FixxamTokens.spacing.md *
          2,

      backgroundColor:
        Colors.border,
    },

    safetyCard: {
      flexDirection: "row",

      alignItems: "flex-start",

      marginTop:
        FixxamTokens.spacing.xl,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.success,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.successSoft,
    },

    safetyIcon: {
      width: 52,

      height: 52,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      marginRight:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    safetyContent: {
      flex: 1,

      minWidth: 0,
    },

    safetyTitle: {
      color:
        Colors.success,
    },

    safetyDescription: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 20,
    },

    modalOverlay: {
      flex: 1,

      justifyContent: "center",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      backgroundColor:
        "rgba(15, 23, 42, 0.45)",
    },

    faqModal: {
      width: "100%",

      maxWidth: 520,

      alignSelf: "center",

      padding:
        FixxamTokens.spacing.xl,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    contactModal: {
      width: "100%",

      maxWidth: 520,

      alignSelf: "center",

      padding:
        FixxamTokens.spacing.lg,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    modalIcon: {
      width: 64,

      height: 64,

      alignSelf: "center",

      alignItems: "center",

      justifyContent: "center",

      marginBottom:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    modalTitle: {
      color:
        Colors.textPrimary,
    },

    modalDescription: {
      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 22,
    },

    primaryModalButton: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.xl,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        WorkerColors.primary,
    },

    primaryModalButtonText: {
      color:
        Colors.textInverse,
    },

    contactOptions: {
      overflow: "hidden",

      marginTop:
        FixxamTokens.spacing.lg,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    contactOption: {
      minHeight: 76,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",
    },

    contactOptionIcon: {
      width: 44,

      height: 44,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      marginRight:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    contactOptionContent: {
      flex: 1,

      minWidth: 0,

      paddingRight:
        FixxamTokens.spacing.sm,
    },

    contactOptionTitle: {
      color:
        Colors.textPrimary,
    },

    contactOptionDescription: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    contactOptionChevron: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",
    },

    modalDivider: {
      height:
        StyleSheet.hairlineWidth,

      marginLeft:
        44 +
        FixxamTokens.spacing.md +
        FixxamTokens.spacing.sm,

      backgroundColor:
        Colors.border,
    },

    cancelButton: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.md,

      alignItems: "center",

      justifyContent: "center",
    },
  });