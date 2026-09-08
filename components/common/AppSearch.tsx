import React, { memo } from "react";

import AppSearchBar from "@/components/ui/AppSearchBar";

import type { FixxamRole } from "@/theme";

export interface AppSearchProps {
  value: string;

  onChangeText: (text: string) => void;

  placeholder?: string;

  role?: FixxamRole;

  loading?: boolean;

  showFilterButton?: boolean;

  filterActive?: boolean;

  onFilterPress?: () => void;
}

function AppSearch({
  value,
  onChangeText,
  placeholder = "Search...",
  role = "customer",
  loading = false,
  showFilterButton = false,
  filterActive = false,
  onFilterPress,
}: AppSearchProps) {
  return (
    <AppSearchBar
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      role={role}
      loading={loading}
      showClearButton
      showFilterButton={showFilterButton}
      filterActive={filterActive}
      onFilterPress={onFilterPress}
    />
  );
}

export default memo(AppSearch);