import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";

import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  getAuth,
} from "firebase/auth";

import AiComposer from "./AiComposer";
import AiHeader from "./AiHeader";
import AiMenuDrawer from "./AiMenuDrawer";
import AiWelcome from "./AiWelcome";
import ClearChatModal from "./ClearChatModal";
import NewChatModal from "./NewChatModal";

import MessageList from "./message/MessageList";

import useAiChat from "@/hooks/ai/useAiChat";

import {
  askCustomerAiV2,
} from "@/services/ai/customer-ai";

import {
  AppButton,
  AppCard,
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   LOGIN MODAL
============================================================== */

function FixxamLoginModal({
  visible,
  onCancel,
  onLogin,
}: {
  visible: boolean;
  onCancel: () => void;
  onLogin: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={
        onCancel
      }
    >
      <View
        style={
          styles.modalOverlay
        }
      >
        <AppCard
          role="customer"
          variant="elevated"
          style={
            styles.loginModal
          }
        >
          <View
            style={
              styles.loginIconContainer
            }
          >
            <AppIcon
              name="profile"
              role="customer"
              size="xl"
              state="active"
            />
          </View>

          <AppText
            variant="heading2"
            weight="semibold"
          >
            Login required
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.loginModalMessage
            }
          >
            Please login to use
            Fixxam Smarter.
          </AppText>

          <View
            style={
              styles.loginModalActions
            }
          >
            <AppButton
              title="Cancel"
              role="customer"
              variant="ghost"
              onPress={
                onCancel
              }
              style={
                styles.modalAction
              }
            />

            <AppButton
              title="Login"
              role="customer"
              onPress={
                onLogin
              }
              style={
                styles.modalAction
              }
            />
          </View>
        </AppCard>
      </View>
    </Modal>
  );
}

/* ==============================================================
   SCREEN
============================================================== */

export default function AiFixScreen() {
  /* ============================================================
     COMPOSER
  ============================================================ */

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    selectedImage,
    setSelectedImage,
  ] =
    useState<
      string | null
    >(null);

  const [
    selectedImageBase64,
    setSelectedImageBase64,
  ] =
    useState<
      string | null
    >(null);

  const [
    selectedImageMimeType,
    setSelectedImageMimeType,
  ] =
    useState<
      string | null
    >(null);

  /* ============================================================
     MENU
  ============================================================ */

  const [
    menuVisible,
    setMenuVisible,
  ] =
    useState(false);

  /* ============================================================
     LOGIN
  ============================================================ */

  const [
    loginModalVisible,
    setLoginModalVisible,
  ] =
    useState(false);

  /* ============================================================
     NEW CHAT
  ============================================================ */

  const [
    newChatModalVisible,
    setNewChatModalVisible,
  ] =
    useState(false);

  /* ============================================================
     CLEAR CHAT
  ============================================================ */

  const [
    clearChatModalVisible,
    setClearChatModalVisible,
  ] =
    useState(false);

  const [
    clearingChat,
    setClearingChat,
  ] =
    useState(false);

  /* ============================================================
     CHAT
  ============================================================ */

  const {
    messages,
    conversationMessages,
    isTyping,

    sendMessage,
    receiveMessage,
    setTyping,

    clearChat,

    hasCurrentChat,
    canSaveCurrentChat,

    clearAndStartNew,
    saveAndStartNew,
  } = useAiChat();

  /* ============================================================
     AI CONVERSATION
  ============================================================ */

  const aiConversationMessages =
    useMemo(
      () =>
        conversationMessages
          .filter(
            (
              item,
            ) =>
              (item.role ===
                "user" ||
                item.role ===
                  "assistant") &&
              typeof item.content ===
                "string",
          )
          .map(
            (item) => ({
              role:
                item.role as
                  | "user"
                  | "assistant",

              content:
                item.content,
            }),
          ),
      [
        conversationMessages,
      ],
    );

  /* ============================================================
     RESET COMPOSER
  ============================================================ */

  const resetComposer =
    useCallback(() => {
      setMessage("");

      setSelectedImage(
        null,
      );

      setSelectedImageBase64(
        null,
      );

      setSelectedImageMimeType(
        null,
      );
    }, []);

  /* ============================================================
     QUICK ACTION
  ============================================================ */

  const handleQuickActionPress =
    useCallback(
      (
        action: string,
      ) => {
        setMessage(
          `I need help with ${action.toLowerCase()}.`,
        );
      },
      [],
    );

  /* ============================================================
     LOGIN
  ============================================================ */

  const openLoginModal =
    useCallback(() => {
      setLoginModalVisible(
        true,
      );
    }, []);

  const closeLoginModal =
    useCallback(() => {
      setLoginModalVisible(
        false,
      );
    }, []);

  const handleLogin =
    useCallback(() => {
      setLoginModalVisible(
        false,
      );

      router.push(
        "/(auth)/login",
      );
    }, []);

  /* ============================================================
     MENU
  ============================================================ */

  const handleOpenMenu =
    useCallback(() => {
      setMenuVisible(
        true,
      );
    }, []);

  const handleCloseMenu =
    useCallback(() => {
      setMenuVisible(
        false,
      );
    }, []);

  const handleOpenHistory =
    useCallback(() => {
      setMenuVisible(
        false,
      );

      router.push(
        "/(customer)/ai/ai-history",
      );
    }, []);

  /* ============================================================
     NEW CHAT
  ============================================================ */

  const handleNewChat =
    useCallback(() => {
      setMenuVisible(
        false,
      );

      if (
        !hasCurrentChat
      ) {
        resetComposer();

        return;
      }

      setNewChatModalVisible(
        true,
      );
    }, [
      hasCurrentChat,
      resetComposer,
    ]);

  const handleCancelNewChat =
    useCallback(() => {
      setNewChatModalVisible(
        false,
      );
    }, []);

  /* ============================================================
     CLEAR + NEW
  ============================================================ */

  const handleClearAndNew =
    useCallback(() => {
      setNewChatModalVisible(
        false,
      );

      clearAndStartNew();

      resetComposer();
    }, [
      clearAndStartNew,
      resetComposer,
    ]);

  /* ============================================================
     SAVE + NEW
  ============================================================ */

  const handleSaveAndNew =
    useCallback(async () => {
      try {
        const saved =
          await saveAndStartNew();

        if (!saved) {
          Alert.alert(
            "History Full",
            "You already have 5 saved chats. Delete an old chat from History before saving this one.",
          );

          return;
        }

        setNewChatModalVisible(
          false,
        );

        resetComposer();
      } catch (error) {
        console.error(
          "SAVE_AND_NEW_CHAT_ERROR:",
          error,
        );

        setNewChatModalVisible(
          false,
        );

        resetComposer();

        Alert.alert(
          "Save Failed",
          "The chat could not be saved to History. A new chat has been started.",
        );
      }
    }, [
      resetComposer,
      saveAndStartNew,
    ]);

  /* ============================================================
     CLEAR CURRENT CHAT
  ============================================================ */

  const handleOpenClearChat =
    useCallback(() => {
      setMenuVisible(
        false,
      );

      if (
        !hasCurrentChat
      ) {
        return;
      }

      setClearChatModalVisible(
        true,
      );
    }, [
      hasCurrentChat,
    ]);

  const handleCancelClearChat =
    useCallback(() => {
      if (clearingChat) {
        return;
      }

      setClearChatModalVisible(
        false,
      );
    }, [
      clearingChat,
    ]);

  const handleDeleteChat =
    useCallback(() => {
      if (clearingChat) {
        return;
      }

      setClearingChat(
        true,
      );

      try {
        clearChat();

        resetComposer();

        setClearChatModalVisible(
          false,
        );
      } catch (error) {
        console.error(
          "CLEAR_CHAT_ERROR:",
          error,
        );

        Alert.alert(
          "Unable to clear chat",
          "We could not clear your chat. Please try again.",
        );
      } finally {
        setClearingChat(
          false,
        );
      }
    }, [
      clearChat,
      clearingChat,
      resetComposer,
    ]);

  /* ============================================================
     SEND MESSAGE
  ============================================================ */

  const handleSend =
    useCallback(async () => {
      const text =
        message.trim();

      if (
        (!text &&
          !selectedImageBase64) ||
        isTyping
      ) {
        return;
      }

      /* --------------------------------------------------------
         AUTH
      -------------------------------------------------------- */

      const auth =
        getAuth();

      if (
        !auth.currentUser
      ) {
        openLoginModal();

        return;
      }

      /* --------------------------------------------------------
         IMAGE
      -------------------------------------------------------- */

      const imageBase64 =
        selectedImageBase64;

      const imageMimeType =
        selectedImageMimeType ??
        "image/jpeg";

      const imageUri =
        selectedImage;

      const userContent =
        text.length > 0
          ? text
          : "Analyze this image.";

      /* --------------------------------------------------------
         LOCAL USER MESSAGE
      -------------------------------------------------------- */

      sendMessage(
        text.length > 0
          ? text
          : "📷 Image",

        imageUri ??
          undefined,
      );

      resetComposer();

      setTyping(true);

      try {
        /* ------------------------------------------------------
           REQUEST
        ------------------------------------------------------ */

        const response =
          await askCustomerAiV2({
            messages: [
              ...aiConversationMessages,

              {
                role: "user",

                content:
                  userContent,

                image:
                  imageBase64
                    ? {
                        mimeType:
                          imageMimeType,

                        data:
                          imageBase64,
                      }
                    : undefined,
              },
            ],
          });

        /* ------------------------------------------------------
           RESPONSE
        ------------------------------------------------------ */

        receiveMessage(
          response.message,
        );
      } catch (
        error: unknown
      ) {
        const firebaseError =
          error &&
          typeof error ===
            "object"
            ? (error as {
                code?: string;
                message?: string;
              })
            : null;

        const errorCode =
          firebaseError?.code ??
          "";

        const errorMessage =
          firebaseError?.message ??
          "";

        const normalizedError =
          errorMessage.toLowerCase();

        const isAuthenticationError =
          errorCode ===
            "functions/unauthenticated" ||
          errorCode ===
            "functions/permission-denied" ||
          errorCode ===
            "unauthenticated" ||
          errorCode ===
            "permission-denied" ||
          normalizedError.includes(
            "authentication is required",
          ) ||
          normalizedError.includes(
            "unauthenticated",
          ) ||
          normalizedError.includes(
            "login required",
          );

        if (
          isAuthenticationError
        ) {
          openLoginModal();

          return;
        }

        console.error(
          "Customer AI request failed:",
          error,
        );

        Alert.alert(
          "AI Assistant",
          "We couldn't process your request right now. Please try again.",
        );
      } finally {
        setTyping(false);
      }
    }, [
      aiConversationMessages,
      isTyping,
      message,
      openLoginModal,
      receiveMessage,
      resetComposer,
      selectedImage,
      selectedImageBase64,
      selectedImageMimeType,
      sendMessage,
      setTyping,
    ]);

  /* ============================================================
     LOAD IMAGE
  ============================================================ */

  const loadImage =
    useCallback(
      async (
        asset:
          ImagePicker.ImagePickerAsset,
      ) => {
        try {
          if (
            !asset.uri
          ) {
            throw new Error(
              "Image URI is missing.",
            );
          }

          const base64 =
            await FileSystem.readAsStringAsync(
              asset.uri,
              {
                encoding:
                  FileSystem
                    .EncodingType
                    .Base64,
              },
            );

          if (!base64) {
            throw new Error(
              "Unable to read selected image.",
            );
          }

          setSelectedImage(
            asset.uri,
          );

          setSelectedImageBase64(
            base64,
          );

          setSelectedImageMimeType(
            asset.mimeType ??
              "image/jpeg",
          );
        } catch (error) {
          console.error(
            "IMAGE_LOAD_ERROR:",
            error,
          );

          Alert.alert(
            "Image Error",
            "Unable to prepare the selected image.",
          );
        }
      },
      [],
    );

  /* ============================================================
     CAMERA
  ============================================================ */

  const handleCamera =
    useCallback(
      async () => {
        try {
          const permission =
            await ImagePicker
              .requestCameraPermissionsAsync();

          if (
            !permission.granted
          ) {
            Alert.alert(
              "Permission Required",
              "Please allow camera access to attach a repair photo.",
            );

            return;
          }

          const result =
            await ImagePicker
              .launchCameraAsync({
                mediaTypes: [
                  "images",
                ],

                allowsEditing:
                  false,

                quality: 0.8,
              });

          if (
            !result.canceled &&
            result.assets?.[0]
          ) {
            await loadImage(
              result.assets[0],
            );
          }
        } catch (error) {
          console.error(
            "CAMERA_ERROR:",
            error,
          );

          Alert.alert(
            "Camera Error",
            "Unable to open camera.",
          );
        }
      },
      [
        loadImage,
      ],
    );

  /* ============================================================
     GALLERY
  ============================================================ */

  const handleGallery =
    useCallback(
      async () => {
        try {
          const permission =
            await ImagePicker
              .requestMediaLibraryPermissionsAsync();

          if (
            !permission.granted
          ) {
            Alert.alert(
              "Permission Required",
              "Please allow photo library access to attach a repair photo.",
            );

            return;
          }

          const result =
            await ImagePicker
              .launchImageLibraryAsync(
                {
                  mediaTypes: [
                    "images",
                  ],

                  allowsEditing:
                    false,

                  quality: 0.8,
                },
              );

          if (
            !result.canceled &&
            result.assets?.[0]
          ) {
            await loadImage(
              result.assets[0],
            );
          }
        } catch (error) {
          console.error(
            "GALLERY_ERROR:",
            error,
          );

          Alert.alert(
            "Gallery Error",
            "Unable to open gallery.",
          );
        }
      },
      [
        loadImage,
      ],
    );

  /* ============================================================
     REMOVE IMAGE
  ============================================================ */

  const handleRemoveImage =
    useCallback(() => {
      setSelectedImage(
        null,
      );

      setSelectedImageBase64(
        null,
      );

      setSelectedImageMimeType(
        null,
      );
    }, []);

  /* ============================================================
     UI
  ============================================================ */

  return (
    <AppScreen
      role="customer"
      padded={false}
      edges={[
        "bottom",
      ]}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <AiHeader
        onMenuPress={
          handleOpenMenu
        }
      />

      {/* ======================================================
          KEYBOARD AREA
      ====================================================== */}

      <KeyboardAvoidingView
        style={
          styles.keyboard
        }
        behavior={
          Platform.OS ===
          "ios"
            ? "padding"
            : "height"
        }
        keyboardVerticalOffset={
          0
        }
      >
        {/* ====================================================
            CONTENT
        ==================================================== */}

        <View
          style={
            styles.content
          }
        >
          {messages.length ===
          0 ? (
            <AiWelcome
              onQuickActionPress={
                handleQuickActionPress
              }
            />
          ) : (
            <MessageList
              messages={
                messages
              }
              isTyping={
                isTyping
              }
            />
          )}
        </View>

        {/* ====================================================
            COMPOSER
        ==================================================== */}

        <AiComposer
          value={message}
          onChangeText={
            setMessage
          }
          onSend={
            handleSend
          }
          onCameraPress={
            handleCamera
          }
          onGalleryPress={
            handleGallery
          }
          selectedImage={
            selectedImage
          }
          onRemoveImage={
            handleRemoveImage
          }
          disabled={false}
          isSending={
            isTyping
          }
        />
      </KeyboardAvoidingView>

      {/* ======================================================
          MENU
      ====================================================== */}

      <AiMenuDrawer
        visible={
          menuVisible
        }
        onClose={
          handleCloseMenu
        }
        onNewChat={
          handleNewChat
        }
        onHistory={
          handleOpenHistory
        }
        onClear={
          handleOpenClearChat
        }
      />

      {/* ======================================================
          NEW CHAT
      ====================================================== */}

      <NewChatModal
        visible={
          newChatModalVisible
        }
        canSave={
          canSaveCurrentChat
        }
        onCancel={
          handleCancelNewChat
        }
        onClear={
          handleClearAndNew
        }
        onSave={
          handleSaveAndNew
        }
      />

      {/* ======================================================
          CLEAR CHAT
      ====================================================== */}

      <ClearChatModal
        visible={
          clearChatModalVisible
        }
        deleting={
          clearingChat
        }
        onCancel={
          handleCancelClearChat
        }
        onDelete={
          handleDeleteChat
        }
      />

      {/* ======================================================
          LOGIN
      ====================================================== */}

      <FixxamLoginModal
        visible={
          loginModalVisible
        }
        onCancel={
          closeLoginModal
        }
        onLogin={
          handleLogin
        }
      />
    </AppScreen>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    keyboard: {
      flex: 1,

      minHeight: 0,

      backgroundColor:
        Colors.background,
    },

    content: {
      flex: 1,

      minHeight: 0,
    },

    /* ========================================================
       LOGIN MODAL
    ======================================================== */

    modalOverlay: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing
          .xxl,

      backgroundColor:
        Colors.overlayStrong,
    },

    loginModal: {
      width: "100%",

      maxWidth: 390,

      padding:
        FixxamTokens.spacing
          .xxl,
    },

    loginIconContainer: {
      width:
        FixxamTokens.size
          .fabLarge,

      height:
        FixxamTokens.size
          .fabLarge,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom:
        FixxamTokens.spacing
          .lg,

      borderRadius:
        FixxamTokens.radius
          .lg,

      backgroundColor:
        CustomerColors
          .primarySoft,
    },

    loginModalMessage: {
      marginTop:
        FixxamTokens.spacing
          .sm,
    },

    loginModalActions: {
      flexDirection:
        "row",

      justifyContent:
        "flex-end",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing
          .sm,

      marginTop:
        FixxamTokens.spacing
          .xl,
    },

    modalAction: {
      minWidth: 100,
    },
  });