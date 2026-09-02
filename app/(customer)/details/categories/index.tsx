import React from "react";
import { AppScreen } from "@/components/ui";

import CategoriesHeader from "@/components/categories/CategoriesHeader";
import CategoryGrid from "@/components/categories/CategoryGrid";

export default function CategoriesScreen() {
  return (
    <AppScreen
      contentContainerStyle={{
        padding: 16,
      }}
    >
      <CategoriesHeader />

      <CategoryGrid />
    </AppScreen>
  );
}