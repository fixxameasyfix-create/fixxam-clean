import { StyleSheet } from "react-native";

export default StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 16,
    color: "#0F172A",
    marginBottom: 2,
  },

  description: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },

  messageBox: {
    marginTop: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
  },

  label: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 6,
  },

  message: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 20,
  },

  amount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FF6B00",
  },

  actions: {
    marginTop: 14,
    gap: 10,
  },

  primaryButton: {
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF6B00",
  },

  secondaryButton: {
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  buttonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },

  divider: {
    display: "none",
  },

  section: {
    marginTop: 8,
  },
});