import React from "react";

import {
  AppScreen,
} from "@/components/ui";

import CategoriesHeader from "@/components/categories/CategoriesHeader";
import CategoryGrid from "@/components/categories/CategoryGrid";

/* ==============================================================
   SCREEN
============================================================== */

export default function CategoriesScreen() {
  return (
    <AppScreen
      role="customer"
      padded
    >
      <CategoriesHeader />

      <CategoryGrid />
    </AppScreen>
  );
}