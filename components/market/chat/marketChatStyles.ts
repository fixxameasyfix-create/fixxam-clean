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
        Platform.OS === "android"
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

    /*
     * No fake online presence.
     * The subtitle now represents the order only.
     */
    onlineDot: {
      display:
        "none",
    },

    onlineText: {
      color:
        Colors.textSecondary,
    },

    /*
     * Cart icon is redundant in a chat header.
     * Keep the style key for compatibility with
     * the existing screen while hiding it visually.
     */
    headerIcon: {
      display:
        "none",
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
    },

    orderLoading: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",
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
       ORDER SUMMARY
    ======================================================== */

    orderSummary: {
      marginHorizontal:
        FixxamTokens.spacing.md,

      marginTop:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,
    },

    orderSummaryHeader: {
      minHeight: 42,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,
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
      marginTop: 2,

      color:
        Colors.textMuted,
    },

    orderCount: {
      minWidth: 38,

      minHeight: 30,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.chip,

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
      minHeight: 54,

      paddingVertical:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderTopWidth:
        StyleSheet.hairlineWidth,

      borderTopColor:
        Colors.divider,
    },

    orderItemImage: {
      width: 44,

      height: 44,

      flexShrink: 0,

      overflow:
        "hidden",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.background,
    },

    orderItemPlaceholder: {
      width: 44,

      height: 44,

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
      marginTop: 2,

      color:
        Colors.textSecondary,
    },

    orderItemTotal: {
      flexShrink: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    orderTotalRow: {
      minHeight: 38,

      marginTop:
        FixxamTokens.spacing.xs,

      paddingTop:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      borderTopWidth:
        StyleSheet.hairlineWidth,

      borderTopColor:
        Colors.divider,
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
      minHeight: 50,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderTopWidth:
        StyleSheet.hairlineWidth,

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

    sellerBubble: {
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
        CustomerColors.primary,
    },

    messageText: {
      lineHeight: 18,
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
      marginTop: 3,
    },

    sellerMessageTime: {
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
        CustomerColors.primarySoft,
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
        Platform.OS === "ios"
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
        CustomerColors.primary,
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
        Platform.OS === "android"
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

    deleteIcon: {
      backgroundColor:
        Colors.errorSoft,
    },


menuOrderSection: {
  paddingVertical:
    FixxamTokens.spacing.xs,

  borderBottomWidth:
    StyleSheet.hairlineWidth,

  borderBottomColor:
    Colors.divider,

  backgroundColor:
    Colors.background,
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

galleryIcon: {
  backgroundColor:
    CustomerColors.primarySoft,
},

galleryCard: {
  maxHeight:
    "72%",
},

galleryTitle: {
  flex:
    1,

  minWidth:
    0,

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
  flex:
    1,

  aspectRatio:
    1,

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
  flex:
    1,

  alignItems:
    "center",

  justifyContent:
    "center",

  backgroundColor:
    Colors.disabledBackground,
},


  });