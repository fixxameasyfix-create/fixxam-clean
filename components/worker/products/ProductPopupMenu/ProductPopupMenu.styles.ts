import { StyleSheet } from "react-native";

export default StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },

  menu: {
    position: "absolute",

    width: 210,

    backgroundColor: "#FFFFFF",

    borderRadius: 16,

    paddingVertical: 6,

    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 12,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  itemText: {
    marginLeft: 14,
    fontSize: 15,
    color: "#111827",
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginVertical: 4,
  },

  deleteText: {
    color: "#DC2626",
  },
});