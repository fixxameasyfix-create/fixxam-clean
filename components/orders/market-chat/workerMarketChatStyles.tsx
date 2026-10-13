import {
  Platform,
  StyleSheet,
} from "react-native";

import {
  Colors,
  FixxamTokens,
  Typography,
  WorkerColors,
} from "@/theme";

/* ============================================================
   WORKER MARKET CHAT STYLES

   Mirrors the customer market chat UI.
   Customer primary accent -> Worker primary accent.
============================================================ */

export const styles =
  StyleSheet.create({
    /* ========================================================
       SCREEN
    ======================================================== */

    screen: {
      flex: 1,

      backgroundColor:
        Colors.background,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      minHeight:
        FixxamTokens.size.headerHeight,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingTop:
        Platform.OS ===
        "android"
          ? FixxamTokens.spacing.sm
          : FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,

      backgroundColor:
        Colors.surface,
    },

    headerButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    headerInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.xs,
    },

    headerTitle: {
      color:
        Colors.textPrimary,
    },

    onlineRow: {
      marginTop: 2,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    onlineText: {
      color:
        Colors.textSecondary,
    },

    menuButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    disabled: {
      opacity:
        FixxamTokens.motion.disabledOpacity,
    },

    /* ========================================================
       CHAT
    ======================================================== */

    chatContainer: {
      flex: 1,

      minHeight: 0,

      backgroundColor:
        Colors.background,
    },

    messagesContent: {
      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.lg,
    },

    emptyMessages: {
      flexGrow: 1,
    },

    /* ========================================================
       MESSAGE BUBBLES
    ======================================================== */

    messageRow: {
      width:
        "100%",

      marginBottom:
        FixxamTokens.spacing.xs,

      alignItems:
        "flex-start",
    },

    messageRowMine: {
      alignItems:
        "flex-end",
    },

    messageBubble: {
      maxWidth:
        "82%",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.lg,
    },

    customerBubble: {
      borderWidth: 1,

      borderColor:
        Colors.border,

      borderBottomLeftRadius:
        FixxamTokens.radius.xs,

      backgroundColor:
        Colors.surface,
    },

    myBubble: {
      borderBottomRightRadius:
        FixxamTokens.radius.xs,

      backgroundColor:
        WorkerColors.primary,
    },

    messageText: {
      lineHeight: 18,
    },

    customerMessageText: {
      color:
        Colors.textPrimary,
    },

    myMessageText: {
      color:
        Colors.textInverse,
    },

    messageTime: {
      marginTop: 3,
    },

    customerMessageTime: {
      color:
        Colors.textMuted,
    },

    myMessageTime: {
      color:
        Colors.textInverse,

      opacity: 0.75,
    },

    /* ========================================================
       EMPTY CHAT
    ======================================================== */

    emptyContainer: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.xxl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    emptyIcon: {
      width: 56,

      height: 56,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    emptyText: {
      maxWidth: 280,

      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 18,

      textAlign:
        "center",

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       INPUT
    ======================================================== */

    inputArea: {
      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        Platform.OS ===
        "ios"
          ? FixxamTokens.spacing.xl
          : FixxamTokens.spacing.sm,

      borderTopWidth:
        StyleSheet.hairlineWidth,

      borderTopColor:
        Colors.divider,

      backgroundColor:
        Colors.surface,
    },

    inputContainer: {
      minHeight:
        FixxamTokens.size.inputHeight,

      maxHeight: 120,

      paddingLeft:
        FixxamTokens.spacing.md,

      paddingRight:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "flex-end",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.background,
    },

    input: {
      flex: 1,

      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      maxHeight: 104,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.sm,

      paddingHorizontal: 0,

      fontSize:
        Typography.fontSize.md,

      lineHeight: 20,

      color:
        Colors.textPrimary,
    },

    sendButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      marginBottom:
        FixxamTokens.spacing.xs,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primary,
    },

    sendDisabled: {
      opacity:
        FixxamTokens.motion.disabledOpacity,
    },

    /* ========================================================
       ERROR BAR
    ======================================================== */

    errorBar: {
      marginHorizontal:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.errorSoft,
    },

    errorBarText: {
      flex: 1,

      color:
        Colors.error,
    },

    /* ========================================================
       LOADING / ERROR STATES
    ======================================================== */

    center: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.background,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.sm,

      color:
        Colors.textSecondary,
    },

    errorIcon: {
      width: 60,

      height: 60,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.errorSoft,
    },

    errorTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    errorText: {
      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 18,

      textAlign:
        "center",

      color:
        Colors.textSecondary,
    },

    backButton: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        WorkerColors.primary,
    },

    backButtonText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       CHAT OPTIONS MENU
    ======================================================== */

    menuOverlay: {
      flex: 1,

      paddingTop:
        Platform.OS ===
        "android"
          ? 62
          : 86,

      paddingRight:
        FixxamTokens.spacing.md,

      alignItems:
        "flex-end",

      justifyContent:
        "flex-start",

      backgroundColor:
        Colors.overlayMedium,
    },

    menuCard: {
      width: 270,

      overflow:
        "hidden",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    menuHeader: {
      minHeight: 50,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,
    },

    menuTitle: {
      color:
        Colors.textPrimary,
    },

    menuClose: {
      width: 36,

      height: 36,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    menuItem: {
      minHeight: 60,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,
    },

    deleteMenuItem: {
      borderBottomWidth: 0,
    },

    menuItemDisabled: {
      opacity:
        FixxamTokens.motion.disabledOpacity,
    },

    menuIcon: {
      width: 40,

      height: 40,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,
    },

    callIcon: {
      backgroundColor:
        Colors.successSoft,
    },

    galleryIcon: {
      backgroundColor:
        WorkerColors.primarySoft,
    },

    deleteIcon: {
      backgroundColor:
        Colors.errorSoft,
    },

    menuItemInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    menuItemTitle: {
      color:
        Colors.textPrimary,
    },

    deleteTitle: {
      color:
        Colors.error,
    },

    menuItemSubtitle: {
      marginTop: 2,

      lineHeight: 16,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       GALLERY
    ======================================================== */

    galleryCard: {
      maxHeight:
        "72%",
    },

    galleryTitle: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.sm,

      textAlign:
        "center",

      color:
        Colors.textPrimary,
    },

    galleryContent: {
      padding:
        FixxamTokens.spacing.sm,
    },

    galleryRow: {
      gap:
        FixxamTokens.spacing.sm,
    },

    galleryImageBox: {
      flex: 1,

      aspectRatio: 1,

      marginBottom:
        FixxamTokens.spacing.sm,

      overflow:
        "hidden",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.background,
    },

    galleryImage: {
      width:
        "100%",

      height:
        "100%",
    },

    galleryImageFallback: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.disabledBackground,
    },
  });