import React from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

import ProductDeleteDialog from "../products/ProductDeleteDialog";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import useProductDetails from "@/hooks/worker/useProductDetails";

import ProductGallery from "./details/ProductGallery";
import ProductInfoCard from "./details/ProductInfoCard";
import ProductActionBar from "./details/ProductActionBar";

export default function ProductDetailsScreen() {

  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

 const {
  loading,
  deleting,
  product,

  onDelete,

  showDeleteDialog,
  setShowDeleteDialog,
  confirmDelete,
} = useProductDetails(id);

  if (loading) {

    return (

      <AppScreen>

        <View style={styles.loading}>

          <ActivityIndicator
            size="large"
            color="#FF6B00"
          />

        </View>

      </AppScreen>

    );

  }

  if (!product) {

    return (

      <AppScreen>

        <View style={styles.loading}>

          <Ionicons
            name="cube-outline"
            size={60}
            color="#CBD5E1"
          />

          <AppText
            style={styles.empty}
          >
            Product not found.
          </AppText>

        </View>

      </AppScreen>

    );

  }

  return (

    <AppScreen>

      <ScrollView

        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={
          styles.container
        }

      >

        <ProductGallery

          images={
            product.images ??
            []
          }

        />

        <ProductInfoCard

          product={product}

        />

        <ProductActionBar

          loading={
            deleting
          }

          onEdit={() =>

            router.push({

              pathname:
                "/(worker)/products/edit/[id]",

              params: {
                id,
              },

            })

          }

          onDelete={
            onDelete
          }

        />

      </ScrollView>

<ProductDeleteDialog
  visible={showDeleteDialog}
  loading={deleting}
  onCancel={() => {
    setShowDeleteDialog(false);
  }}
  onConfirm={confirmDelete}
/>

    </AppScreen>

  );

}

const styles = StyleSheet.create({

  container: {

    padding: 16,

    paddingBottom: 40,

    backgroundColor:
      "#F8FAFC",

  },

  loading: {

    flex: 1,

    justifyContent:
      "center",

    alignItems:
      "center",

  },

  empty: {

    marginTop: 14,

    color: "#64748B",

  },

});