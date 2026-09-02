import { StyleSheet } from "react-native";

export default StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  container: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
  },

  icon: {
    alignSelf: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 20,
    textAlign: "center",
    color: "#0F172A",
    marginBottom: 8,
  },

  message: {
    textAlign: "center",
    color: "#64748B",
    lineHeight: 22,
    marginBottom: 24,
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },

  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },

  deleteButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
  },

  cancelText: {
    color: "#334155",
    fontWeight: "700",
    fontSize: 15,
  },

  deleteText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});