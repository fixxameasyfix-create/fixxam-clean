import React, { useCallback, useState } from "react";

import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";

import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router } from "expo-router";
import { getAuth } from "firebase/auth";

import AiComposer from "./AiComposer";
import AiHeader from "./AiHeader";
import AiMenuDrawer from "./AiMenuDrawer";
import AiWelcome from "./AiWelcome";
import ClearChatModal from "./ClearChatModal";
import NewChatModal from "./NewChatModal";
import MessageList from "./message/MessageList";

import useAiChat from "@/hooks/ai/useAiChat";

import { askCustomerAiV2 } from "@/services/ai/customer-ai";

import { AppText } from "@/components/ui";

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
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.loginModal}>
          <View style={styles.loginIconContainer}>
            <Ionicons
              name="person-outline"
              size={42}
              color="#2563EB"
            />
          </View>

          <AppText
            weight="bold"
            style={styles.loginModalTitle}
          >
            Login required
          </AppText>

          <AppText style={styles.loginModalMessage}>
            Please login to use Fixxam Smarter.
          </AppText>

          <View style={styles.loginModalActions}>
            <Pressable
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="Cancel login"
              style={({ pressed }) => [
                styles.loginModalButton,
                pressed && styles.loginModalButtonPressed,
              ]}
            >
              <AppText
                weight="bold"
                style={styles.cancelButtonText}
              >
                CANCEL
              </AppText>
            </Pressable>

            <Pressable
              onPress={onLogin}
              accessibilityRole="button"
              accessibilityLabel="Login"
              style={({ pressed }) => [
                styles.loginModalButton,
                pressed && styles.loginModalButtonPressed,
              ]}
            >
              <AppText
                weight="bold"
                style={styles.loginButtonText}
              >
                LOGIN
              </AppText>
            </Pressable>
          </View>
        </View>
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

  const [message, setMessage] = useState("");

  const [selectedImage, setSelectedImage] =
    useState<string | null>(null);

  const [selectedImageBase64, setSelectedImageBase64] =
    useState<string | null>(null);

  const [selectedImageMimeType, setSelectedImageMimeType] =
    useState<string | null>(null);

  /* ============================================================
     MENU
  ============================================================ */

  const [menuVisible, setMenuVisible] = useState(false);

  /* ============================================================
     LOGIN MODAL
  ============================================================ */

  const [loginModalVisible, setLoginModalVisible] =
    useState(false);

  /* ============================================================
     NEW CHAT MODAL
  ============================================================ */

  const [newChatModalVisible, setNewChatModalVisible] =
    useState(false);

  /* ============================================================
     CLEAR CHAT MODAL
  ============================================================ */

  const [clearChatModalVisible, setClearChatModalVisible] =
    useState(false);

  const [clearingChat, setClearingChat] = useState(false);

  /* ============================================================
     AI CHAT
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
    conversationMessages
      .filter(
        (item) =>
          (item.role === "user" ||
            item.role === "assistant") &&
          typeof item.content === "string",
      )
      .map((item) => ({
        role: item.role as "user" | "assistant",
        content: item.content,
      }));

  /* ============================================================
     RESET COMPOSER
  ============================================================ */

  const resetComposer = useCallback(() => {
    setMessage("");
    setSelectedImage(null);
    setSelectedImageBase64(null);
    setSelectedImageMimeType(null);
  }, []);

  /* ============================================================
     LOGIN
  ============================================================ */

  const openLoginModal = useCallback(() => {
    setLoginModalVisible(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setLoginModalVisible(false);
  }, []);

  const handleLogin = useCallback(() => {
    setLoginModalVisible(false);

    router.push("/(auth)/login");
  }, []);

  /* ============================================================
     NEW CHAT
  ============================================================ */

  const handleNewChat = useCallback(() => {
    setMenuVisible(false);

    if (!hasCurrentChat) {
      resetComposer();
      return;
    }

    setNewChatModalVisible(true);
  }, [
    hasCurrentChat,
    resetComposer,
  ]);

  /* ============================================================
     CANCEL NEW CHAT
  ============================================================ */

  const handleCancelNewChat = useCallback(() => {
    setNewChatModalVisible(false);
  }, []);

  /* ============================================================
     CLEAR + NEW CHAT
  ============================================================ */

  const handleClearAndNew = useCallback(() => {
    setNewChatModalVisible(false);

    clearAndStartNew();

    resetComposer();
  }, [
    clearAndStartNew,
    resetComposer,
  ]);

  /* ============================================================
     SAVE + NEW CHAT
  ============================================================ */

  const handleSaveAndNew = useCallback(async () => {
    try {
      const saved = await saveAndStartNew();

      if (!saved) {
        Alert.alert(
          "History Full",
          "You already have 5 saved chats. Delete an old chat from History before saving this one.",
        );

        return;
      }

      setNewChatModalVisible(false);

      resetComposer();
    } catch (error) {
      console.error(
        "SAVE_AND_NEW_CHAT_ERROR:",
        error,
      );

      setNewChatModalVisible(false);

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
     OPEN CLEAR CHAT
  ============================================================ */

  const handleOpenClearChat = useCallback(() => {
    setMenuVisible(false);

    if (!hasCurrentChat) {
      return;
    }

    setClearChatModalVisible(true);
  }, [hasCurrentChat]);

  /* ============================================================
     CANCEL CLEAR CHAT
  ============================================================ */

  const handleCancelClearChat = useCallback(() => {
    if (clearingChat) {
      return;
    }

    setClearChatModalVisible(false);
  }, [clearingChat]);

  /* ============================================================
     DELETE CURRENT CHAT
  ============================================================ */

  const handleDeleteChat = useCallback(() => {
    if (clearingChat) {
      return;
    }

    setClearingChat(true);

    try {
      clearChat();

      resetComposer();

      setClearChatModalVisible(false);
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
      setClearingChat(false);
    }
  }, [
    clearChat,
    clearingChat,
    resetComposer,
  ]);

  /* ============================================================
     SEND MESSAGE
  ============================================================ */

  const handleSend = useCallback(async () => {
    const text = message.trim();

    if (
      (!text && !selectedImageBase64) ||
      isTyping
    ) {
      return;
    }

    /* ----------------------------------------------------------
       AUTH
    ---------------------------------------------------------- */

    const auth = getAuth();

    if (!auth.currentUser) {
      openLoginModal();
      return;
    }

    /* ----------------------------------------------------------
       IMAGE
    ---------------------------------------------------------- */

    const imageBase64 = selectedImageBase64;

    const imageMimeType =
      selectedImageMimeType ?? "image/jpeg";

    const imageUri = selectedImage;

    const userContent =
      text.length > 0
        ? text
        : "Analyze this image.";

    /* ----------------------------------------------------------
       ADD USER MESSAGE
    ---------------------------------------------------------- */

    sendMessage(
      text.length > 0 ? text : "📷 Image",
      imageUri ?? undefined,
    );

    resetComposer();

    setTyping(true);

    try {
      /* --------------------------------------------------------
         AI REQUEST
      -------------------------------------------------------- */

      const response = await askCustomerAiV2({
        messages: [
          ...aiConversationMessages,

          {
            role: "user",
            content: userContent,

            image: imageBase64
              ? {
                  mimeType: imageMimeType,
                  data: imageBase64,
                }
              : undefined,
          },
        ],
      });

      /* --------------------------------------------------------
         AI RESPONSE
      -------------------------------------------------------- */

      receiveMessage(response.message);
    } catch (error: unknown) {
      const firebaseError =
        error &&
        typeof error === "object"
          ? (error as {
              code?: string;
              message?: string;
            })
          : null;

      const errorCode =
        firebaseError?.code ?? "";

      const errorMessage =
        firebaseError?.message ?? "";

      const normalizedError =
        errorMessage.toLowerCase();

      const isAuthenticationError =
        errorCode ===
          "functions/unauthenticated" ||
        errorCode ===
          "functions/permission-denied" ||
        errorCode === "unauthenticated" ||
        errorCode === "permission-denied" ||
        normalizedError.includes(
          "authentication is required",
        ) ||
        normalizedError.includes(
          "unauthenticated",
        ) ||
        normalizedError.includes(
          "login required",
        );

      if (isAuthenticationError) {
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

  const loadImage = useCallback(
    async (
      asset: ImagePicker.ImagePickerAsset,
    ) => {
      try {
        const base64 =
          await FileSystem.readAsStringAsync(
            asset.uri,
            {
              encoding:
                FileSystem.EncodingType.Base64,
            },
          );

        setSelectedImage(asset.uri);

        setSelectedImageBase64(base64);

        setSelectedImageMimeType(
          asset.mimeType ?? "image/jpeg",
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

  const handleCamera = useCallback(
    async () => {
      try {
        const permission =
          await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            "Permission Required",
            "Please allow camera access.",
          );

          return;
        }

        const result =
          await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: false,
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
    [loadImage],
  );

  /* ============================================================
     GALLERY
  ============================================================ */

  const handleGallery = useCallback(
    async () => {
      try {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            "Permission Required",
            "Please allow photo library access.",
          );

          return;
        }

        const result =
          await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: false,
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
          "GALLERY_ERROR:",
          error,
        );

        Alert.alert(
          "Gallery Error",
          "Unable to open gallery.",
        );
      }
    },
    [loadImage],
  );

  /* ============================================================
     REMOVE IMAGE
  ============================================================ */

  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null);
    setSelectedImageBase64(null);
    setSelectedImageMimeType(null);
  }, []);

  /* ============================================================
     UI
  ============================================================ */

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
      >
        {/* ======================================================
            HEADER
        ====================================================== */}

        <AiHeader
          onMenuPress={() => {
            setMenuVisible(true);
          }}
        />

        {/* ======================================================
            CONTENT
        ====================================================== */}

        <View style={styles.content}>
          {messages.length === 0 ? (
            <AiWelcome />
          ) : (
            <MessageList
              messages={messages}
              isTyping={isTyping}
            />
          )}
        </View>

        {/* ======================================================
            COMPOSER
        ====================================================== */}

        <AiComposer
          value={message}
          onChangeText={setMessage}
          onSend={handleSend}
          onCameraPress={handleCamera}
          onGalleryPress={handleGallery}
          selectedImage={selectedImage}
          onRemoveImage={handleRemoveImage}
          isSending={isTyping}
        />

        {/* ======================================================
            MENU
        ====================================================== */}

        <AiMenuDrawer
          visible={menuVisible}
          onClose={() => {
            setMenuVisible(false);
          }}
          onNewChat={handleNewChat}
          onHistory={() => {
            setMenuVisible(false);

            router.push(
              "/(customer)/ai/ai-history",
            );
          }}
          onClear={handleOpenClearChat}
        />

        {/* ======================================================
            NEW CHAT MODAL
        ====================================================== */}

        <NewChatModal
          visible={newChatModalVisible}
          canSave={canSaveCurrentChat}
          onCancel={handleCancelNewChat}
          onClear={handleClearAndNew}
          onSave={handleSaveAndNew}
        />

        {/* ======================================================
            CLEAR CHAT MODAL
        ====================================================== */}

        <ClearChatModal
          visible={clearChatModalVisible}
          deleting={clearingChat}
          onCancel={handleCancelClearChat}
          onDelete={handleDeleteChat}
        />

        {/* ======================================================
            LOGIN MODAL
        ====================================================== */}

        <FixxamLoginModal
          visible={loginModalVisible}
          onCancel={closeLoginModal}
          onLogin={handleLogin}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  keyboard: {
    flex: 1,
  },

  content: {
    flex: 1,
  },

  /* ============================================================
     LOGIN MODAL
  ============================================================ */

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(15, 23, 42, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  loginModal: {
    width: "100%",
    maxWidth: 390,
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingTop: 27,
    paddingHorizontal: 27,
    paddingBottom: 20,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 12,
  },

  loginIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 21,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 21,
  },

  loginModalTitle: {
    fontSize: 23,
    lineHeight: 29,
    color: "#0F172A",
    letterSpacing: -0.3,
  },

  loginModalMessage: {
    marginTop: 9,
    fontSize: 16,
    lineHeight: 23,
    color: "#64748B",
  },

  loginModalActions: {
    marginTop: 28,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
  },

  loginModalButton: {
    minWidth: 82,
    minHeight: 44,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  loginModalButtonPressed: {
    backgroundColor: "#F1F5F9",
  },

  cancelButtonText: {
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.7,
    color: "#64748B",
  },

  loginButtonText: {
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.7,
    color: "#2563EB",
  },
});