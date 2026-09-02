import { StyleSheet } from "react-native";

export default StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  handle: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#CBD5E1",
    marginBottom: 18,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 20,
  },

  action: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 8,
  },

  actionText: {
    flex: 1,
    marginLeft: 14,
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },

  deleteText: {
    color: "#DC2626",
  },

  cancel: {
    marginTop: 10,
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  cancelText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
  },
});