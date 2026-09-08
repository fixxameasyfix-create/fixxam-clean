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

    backgroundColor:
      "transparent",
  },

  /* ==========================================================
     MENU
  ========================================================== */

  menu: {
    position:
      "absolute",

    width: 210,

    paddingVertical:
      FixxamTokens.spacing.xs,

    borderWidth: 1,

    borderColor:
      Colors.border,

    borderRadius:
      FixxamTokens.radius.lg,

    backgroundColor:
      Colors.surface,

    ...FixxamTokens.shadow.card,
  },

  /* ==========================================================
     ITEM
  ========================================================== */

  item: {
    minHeight:
      FixxamTokens.size.minimumTouchTarget,

    paddingHorizontal:
      FixxamTokens.spacing.md,

    paddingVertical:
      FixxamTokens.spacing.sm,

    flexDirection:
      "row",

    alignItems:
      "center",
  },

  itemText: {
    flex: 1,

    marginLeft:
      FixxamTokens.spacing.md,

    color:
      Colors.textPrimary,
  },

  /* ==========================================================
     DIVIDER
  ========================================================== */

  divider: {
    height:
      StyleSheet.hairlineWidth,

    marginVertical:
      FixxamTokens.spacing.xxs,

    backgroundColor:
      Colors.divider,
  },

  /* ==========================================================
     DELETE
  ========================================================== */

  deleteText: {
    color:
      Colors.error,
  },
});