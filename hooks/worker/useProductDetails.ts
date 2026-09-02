import { useEffect, useState } from "react";

import { router } from "expo-router";

import { auth } from "@/firebase/config";

import getProduct from "@/services/products/getProduct";
import deleteProduct from "@/services/products/deleteProduct";

export default function useProductDetails(
  productId: string,
) {
  const [loading, setLoading] =
    useState(true);

  const [deleting, setDeleting] =
    useState(false);

  const [
    showDeleteDialog,
    setShowDeleteDialog,
  ] = useState(false);

  const [product, setProduct] =
    useState<any>(null);

  const loadProduct =
    async () => {
      try {
        setLoading(true);

        const data =
          await getProduct(
            productId,
          );

        setProduct(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (!productId) {
      return;
    }

    loadProduct();
  }, [productId]);

  const reload =
    async () => {
      await loadProduct();
    };

  const onDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete =
    async () => {
      try {
        const worker =
          auth.currentUser;

        if (!worker) {
          return;
        }

        setDeleting(true);

        await deleteProduct(
          productId,
        );

        setShowDeleteDialog(false);

        router.back();
      } catch (error) {
        console.log(error);
      } finally {
        setDeleting(false);
      }
    };

  return {
    loading,
    deleting,
    product,

    reload,

    onDelete,

    showDeleteDialog,
    setShowDeleteDialog,

    confirmDelete,
  };
}