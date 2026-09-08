import {
  StyleSheet,
} from "react-native";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

export default StyleSheet.create({
  /* ==========================================================
     OVERLAY
  ========================================================== */

  overlay: {
    flex: 1,

    padding:
      FixxamTokens.spacing.xl,

    alignItems:
      "center",

    justifyContent:
      "center",

    backgroundColor:
      Colors.overlayMedium,
  },

  /* ==========================================================
     DIALOG
  ========================================================== */

  container: {
    width: "100%",

    maxWidth: 430,

    padding:
      FixxamTokens.spacing.xl,

    borderWidth: 1,

    borderColor:
      Colors.border,

    borderRadius:
      FixxamTokens.radius.xl,

    backgroundColor:
      Colors.surface,

    ...FixxamTokens.shadow.card,
  },

  /* ==========================================================
     ICON
  ========================================================== */

  icon: {
    alignSelf:
      "center",

    marginBottom:
      FixxamTokens.spacing.lg,
  },

  /* ==========================================================
     TEXT
  ========================================================== */

  title: {
    marginBottom:
      FixxamTokens.spacing.sm,

    textAlign:
      "center",

    color:
      Colors.textPrimary,
  },

  message: {
    marginBottom:
      FixxamTokens.spacing.xl,

    textAlign:
      "center",

    lineHeight: 22,

    color:
      Colors.textSecondary,
  },

  /* ==========================================================
     ACTIONS
  ========================================================== */

  row: {
    flexDirection:
      "row",

    gap:
      FixxamTokens.spacing.md,
  },

  cancelButton: {
    flex: 1,

    minHeight:
      FixxamTokens.size.buttonHeight,

    alignItems:
      "center",

    justifyContent:
      "center",

    borderWidth: 1,

    borderColor:
      Colors.border,

    borderRadius:
      FixxamTokens.radius.button,

    backgroundColor:
      Colors.disabledBackground,
  },

  deleteButton: {
    flex: 1,

    minHeight:
      FixxamTokens.size.buttonHeight,

    alignItems:
      "center",

    justifyContent:
      "center",

    borderRadius:
      FixxamTokens.radius.button,

    backgroundColor:
      Colors.error,
  },

  cancelText: {
    color:
      Colors.textSecondary,
  },

  deleteText: {
    color:
      Colors.textInverse,
  },
});