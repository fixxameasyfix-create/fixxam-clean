import {
  StyleSheet,
} from "react-native";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

export default StyleSheet.create({
  /* ==========================================================
     CONTENT
  ========================================================== */

  content: {
    flex: 1,

    paddingHorizontal:
      FixxamTokens.spacing.lg,

    paddingTop:
      FixxamTokens.spacing.sm,
  },

  /* ==========================================================
     HANDLE
  ========================================================== */

  handle: {
    width: 42,

    height: 4,

    alignSelf:
      "center",

    marginBottom:
      FixxamTokens.spacing.lg,

    borderRadius:
      FixxamTokens.radius.full,

    backgroundColor:
      Colors.disabled,
  },

  /* ==========================================================
     TITLE
  ========================================================== */

  title: {
    marginBottom:
      FixxamTokens.spacing.lg,

    color:
      Colors.textPrimary,
  },

  /* ==========================================================
     ACTION
  ========================================================== */

  action: {
    minHeight:
      FixxamTokens.size.buttonHeight,

    marginBottom:
      FixxamTokens.spacing.sm,

    paddingHorizontal:
      FixxamTokens.spacing.md,

    flexDirection:
      "row",

    alignItems:
      "center",

    borderRadius:
      FixxamTokens.radius.md,
  },

  actionText: {
    flex: 1,

    marginLeft:
      FixxamTokens.spacing.md,

    color:
      Colors.textPrimary,
  },

  /* ==========================================================
     DELETE
  ========================================================== */

  deleteText: {
    color:
      Colors.error,
  },

  /* ==========================================================
     CANCEL
  ========================================================== */

  cancel: {
    minHeight:
      FixxamTokens.size.buttonHeight,

    marginTop:
      FixxamTokens.spacing.sm,

    alignItems:
      "center",

    justifyContent:
      "center",

    borderWidth: 1,

    borderColor:
      Colors.border,

    borderRadius:
      FixxamTokens.radius.md,

    backgroundColor:
      Colors.background,
  },

  cancelText: {
    color:
      Colors.textSecondary,
  },
});