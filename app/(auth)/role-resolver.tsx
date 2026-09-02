import { View } from "react-native";

import useRoleResolver from "@/hooks/auth/useRoleResolver";

export default function RoleResolver() {
  useRoleResolver();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
      }}
    />
  );
}