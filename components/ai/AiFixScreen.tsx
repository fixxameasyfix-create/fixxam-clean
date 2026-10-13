import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";

import {
  ActivityIndicator,
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

    currentChatLoaded,

    sendMessage,
    receiveMessage,
    setTyping,

    clearChat,

    hasCurrentChat,
    canSaveCurrentChat,

    clearAndStartNew,
    saveAndStartNew,
  } =
    useAiChat();

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
              (
                item.role ===
                  "user" ||
                item.role ===
                  "assistant"
              ) &&
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
        if (
          !currentChatLoaded
        ) {
          return;
        }

        setMessage(
          `I need help with ${action.toLowerCase()}.`,
        );
      },
      [
        currentChatLoaded,
      ],
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

      /*
       * Do not modify the current
       * conversation before restoration
       * has completed.
       */

      if (
        !currentChatLoaded
      ) {
        return;
      }

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
      currentChatLoaded,
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
      if (
        !currentChatLoaded
      ) {
        return;
      }

      setNewChatModalVisible(
        false,
      );

      clearAndStartNew();

      resetComposer();
    }, [
      clearAndStartNew,
      currentChatLoaded,
      resetComposer,
    ]);

  /* ============================================================
     SAVE + NEW
  ============================================================ */

  const handleSaveAndNew =
    useCallback(async () => {
      if (
        !currentChatLoaded
      ) {
        return;
      }

      try {
        const saved =
          await saveAndStartNew();

        if (!saved) {
          Alert.alert(
            "Unable to save chat",
            "This conversation could not be saved right now. Please try again.",
          );

          return;
        }

        setNewChatModalVisible(
          false,
        );

        resetComposer();
      } catch (
        error: unknown
      ) {
        if (__DEV__) {
          console.warn(
            "SAVE_AND_NEW_CHAT_ERROR:",
            error,
          );
        }

        Alert.alert(
          "Save Failed",
          "The chat could not be saved. Your current conversation has not been intentionally changed.",
        );
      }
    }, [
      currentChatLoaded,
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
        !currentChatLoaded ||
        !hasCurrentChat
      ) {
        return;
      }

      setClearChatModalVisible(
        true,
      );
    }, [
      currentChatLoaded,
      hasCurrentChat,
    ]);

  const handleCancelClearChat =
    useCallback(() => {
      if (
        clearingChat
      ) {
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
      if (
        clearingChat ||
        !currentChatLoaded
      ) {
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
      } catch (
        error: unknown
      ) {
        if (__DEV__) {
          console.warn(
            "CLEAR_CHAT_ERROR:",
            error,
          );
        }

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
      currentChatLoaded,
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
        !currentChatLoaded ||
        (
          !text &&
          !selectedImageBase64
        ) ||
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

         useAiChat automatically persists
         this current conversation.
      -------------------------------------------------------- */

      sendMessage(
        text.length > 0
          ? text
          : "📷 Image",

        imageUri ??
          undefined,
      );

      resetComposer();

      setTyping(
        true,
      );

      try {
        /* ------------------------------------------------------
           REQUEST
        ------------------------------------------------------ */

        const response =
          await askCustomerAiV2({
            messages: [
              ...aiConversationMessages,

              {
                role:
                  "user",

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
            ? (
                error as {
                  code?: string;

                  message?: string;
                }
              )
            : null;

        const errorCode =
          firebaseError
            ?.code ??
          "";

        const errorMessage =
          firebaseError
            ?.message ??
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

        if (__DEV__) {
          console.warn(
            "Customer AI request failed",
            {
              code:
                firebaseError
                  ?.code,

              message:
                firebaseError
                  ?.message,
            },
          );
        }

        Alert.alert(
          "AI Assistant",
          "We couldn't process your request right now. Please try again.",
        );
      } finally {
        setTyping(
          false,
        );
      }
    }, [
      aiConversationMessages,
      currentChatLoaded,
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

          if (
            !base64
          ) {
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
        } catch (
          error: unknown
        ) {
          if (__DEV__) {
            console.warn(
              "IMAGE_LOAD_ERROR:",
              error,
            );
          }

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
        if (
          !currentChatLoaded
        ) {
          return;
        }

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

                quality:
                  0.8,
              });

          if (
            !result.canceled &&
            result.assets?.[0]
          ) {
            await loadImage(
              result.assets[0],
            );
          }
        } catch (
          error: unknown
        ) {
          if (__DEV__) {
            console.warn(
              "CAMERA_ERROR:",
              error,
            );
          }

          Alert.alert(
            "Camera Error",
            "Unable to open camera.",
          );
        }
      },
      [
        currentChatLoaded,
        loadImage,
      ],
    );

  /* ============================================================
     GALLERY
  ============================================================ */

  const handleGallery =
    useCallback(
      async () => {
        if (
          !currentChatLoaded
        ) {
          return;
        }

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

                  quality:
                    0.8,
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
        } catch (
          error: unknown
        ) {
          if (__DEV__) {
            console.warn(
              "GALLERY_ERROR:",
              error,
            );
          }

          Alert.alert(
            "Gallery Error",
            "Unable to open gallery.",
          );
        }
      },
      [
        currentChatLoaded,
        loadImage,
      ],
    );

  /* ============================================================
     REMOVE IMAGE
  ============================================================ */

  const handleRemoveImage =
    useCallback(() => {
      if (
        !currentChatLoaded
      ) {
        return;
      }

      setSelectedImage(
        null,
      );

      setSelectedImageBase64(
        null,
      );

      setSelectedImageMimeType(
        null,
      );
    }, [
      currentChatLoaded,
    ]);

  /* ============================================================
     UI
  ============================================================ */

 return (
  <AppScreen
    role="customer"
    padded={false}
    scrollEnabled={false}
    keyboardAvoiding={false}
    edges={["bottom"]}
    style={styles.screen}
  >
    <AiHeader onMenuPress={handleOpenMenu} />

    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <View style={styles.content}>
        {!currentChatLoaded ? (
          <View style={styles.restoreState}>
            <ActivityIndicator
              size="small"
              color={CustomerColors.primary}
            />
            <AppText
              variant="caption"
              tone="secondary"
              center
              style={styles.restoreText}
            >
              Restoring your conversation...
            </AppText>
          </View>
        ) : messages.length === 0 ? (
          <AiWelcome
            onQuickActionPress={handleQuickActionPress}
          />
        ) : (
          <MessageList
            messages={messages}
            isTyping={isTyping}
          />
        )}
      </View>

      <AiComposer
        value={message}
        onChangeText={setMessage}
        onSend={handleSend}
        onCameraPress={handleCamera}
        onGalleryPress={handleGallery}
        selectedImage={selectedImage}
        onRemoveImage={handleRemoveImage}
        disabled={!currentChatLoaded}
        isSending={isTyping}
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
    /* ========================================================
       MAIN
    ======================================================== */

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
       RESTORE STATE
    ======================================================== */

    restoreState: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing
          .xl,
    },

    restoreText: {
      marginTop:
        FixxamTokens.spacing
          .sm,
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
      minWidth:
        100,
    },

    screen: {
  flex: 1,
},

  });