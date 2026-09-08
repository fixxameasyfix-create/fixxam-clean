import {
  Platform,
  StyleSheet,
} from "react-native";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
  Typography,
} from "@/theme";

/* ============================================================
   MARKET CHAT STYLES
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

      borderBottomWidth: 1,

      borderBottomColor:
        Colors.border,

      backgroundColor:
        Colors.surface,
    },

    headerButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },

    headerInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    headerTitle: {
      color:
        Colors.textPrimary,
    },

    onlineRow: {
      marginTop:
        FixxamTokens.spacing.xxs,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    onlineDot: {
      width: 6,

      height: 6,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.success,
    },

    onlineText: {
      color:
        Colors.textSecondary,
    },

    headerIcon: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      marginRight:
        FixxamTokens.spacing.xs,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    menuButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.background,
    },

    disabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    /* ========================================================
       CHAT
    ======================================================== */

    chatContainer: {
      flex: 1,

      minHeight: 0,
    },

    orderLoading: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    messagesContent: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.xl,
    },

    emptyMessages: {
      flexGrow: 1,
    },

    /* ========================================================
       ORDER SUMMARY
    ======================================================== */

    orderSummary: {
      marginHorizontal:
        FixxamTokens.spacing.md,

      marginTop:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.xs,

      padding:
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

    orderSummaryHeader: {
      marginBottom:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    orderHeaderInfo: {
      flex: 1,

      minWidth: 0,
    },

    orderSummaryTitle: {
      color:
        Colors.textPrimary,
    },

    orderSummarySubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textMuted,
    },

    orderCount: {
      minWidth: 44,

      minHeight: 36,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    orderCountText: {
      color:
        CustomerColors.primary,
    },

    orderCountLabel: {
      color:
        Colors.textSecondary,
    },

    orderItem: {
      minHeight: 60,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderTopWidth: 1,

      borderTopColor:
        Colors.divider,
    },

    orderItemImage: {
      width:
        FixxamTokens.size.avatarSm,

      height:
        FixxamTokens.size.avatarSm,

      flexShrink: 0,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.background,
    },

    orderItemPlaceholder: {
      width:
        FixxamTokens.size.avatarSm,

      height:
        FixxamTokens.size.avatarSm,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    orderItemInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    orderItemName: {
      color:
        Colors.textPrimary,
    },

    orderItemQuantity: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    orderItemTotal: {
      marginLeft:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    orderTotalRow: {
      marginTop:
        FixxamTokens.spacing.sm,

      paddingTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      borderTopWidth: 1,

      borderTopColor:
        Colors.border,
    },

    orderTotalLabel: {
      color:
        Colors.textSecondary,
    },

    orderTotalValue: {
      color:
        CustomerColors.primary,
    },

    noItems: {
      minHeight: 56,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderTopWidth: 1,

      borderTopColor:
        Colors.divider,
    },

    noItemsText: {
      color:
        Colors.textSecondary,
    },

    /* ========================================================
       MESSAGES
    ======================================================== */

    messageRow: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.sm,

      alignItems:
        "flex-start",
    },

    messageRowMine: {
      alignItems:
        "flex-end",
    },

    messageBubble: {
      maxWidth: "78%",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.lg,
    },

    sellerBubble: {
      borderWidth: 1,

      borderColor:
        Colors.border,

      borderBottomLeftRadius:
        FixxamTokens.radius.xs,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    myBubble: {
      borderBottomRightRadius:
        FixxamTokens.radius.xs,

      backgroundColor:
        CustomerColors.primary,
    },

    messageText: {
      lineHeight: 17,
    },

    sellerMessageText: {
      color:
        Colors.textPrimary,
    },

    myMessageText: {
      color:
        Colors.textInverse,
    },

    messageTime: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    sellerMessageTime: {
      color:
        Colors.textMuted,
    },

    myMessageTime: {
      color:
        Colors.textInverse,

      opacity: 0.8,
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
      width: 64,

      height: 64,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    emptyText: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 16,

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

      borderTopWidth: 1,

      borderTopColor:
        Colors.border,

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
        FixxamTokens.radius.input,

      backgroundColor:
        Colors.background,
    },

    input: {
      flex: 1,

      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      maxHeight: 105,

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
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      marginBottom:
        FixxamTokens.spacing.xs,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    sendDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
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

      borderWidth: 1,

      borderColor:
        Colors.error,

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
       CENTER STATES
    ======================================================== */

    center: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.sm,

      color:
        Colors.textSecondary,
    },

    errorIcon: {
      width: 64,

      height: 64,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

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

      lineHeight: 17,

      textAlign:
        "center",

      color:
        Colors.textSecondary,
    },

    backButton: {
      minHeight:
        FixxamTokens.size.buttonHeight,

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
        CustomerColors.primary,
    },

    backButtonText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       MENU
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
      width: 285,

      overflow:
        "hidden",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    menuHeader: {
      minHeight: 56,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      borderBottomWidth: 1,

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
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },

    menuItem: {
      minHeight: 70,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderBottomWidth: 1,

      borderBottomColor:
        Colors.divider,
    },

    deleteMenuItem: {
      borderBottomWidth: 0,
    },

    menuItemDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    menuIcon: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

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
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 14,

      color:
        Colors.textSecondary,
    },
  });