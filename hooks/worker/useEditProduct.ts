import {
  useEffect,
  useState,
} from "react";

import {
  Alert,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  auth,
} from "@/firebase/config";

import useWorkerProduct from "./useWorkerProduct";

import useProductImages from "./useProductImages";

import updateProduct from "@/services/products/updateProduct";

import updateProductImages from "@/services/storage/uploadProductImages";

import createProductDeal from "@/services/deals/createProductDeal";

export default function useEditProduct(
  productId: string,
) {
  const {
    product,
    loading,
  } = useWorkerProduct(productId);

  /*
   * ---------------------------------------
   * PRODUCT FIELDS
   * ---------------------------------------
   */

  const [
    productName,
    setProductName,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState("");

  const [
    price,
    setPrice,
  ] = useState("");

  const [
    stock,
    setStock,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    featured,
    setFeatured,
  ] = useState(false);

  const [
    delivery,
    setDelivery,
  ] = useState(true);

  const [
    condition,
    setCondition,
  ] = useState<
    "new" | "used"
  >("new");

  /*
   * ---------------------------------------
   * PRODUCT SAVE
   * ---------------------------------------
   */

  const [
    saving,
    setSaving,
  ] = useState(false);

  /*
   * ---------------------------------------
   * DISCOUNT
   * ---------------------------------------
   */

  const [
    discount,
    setDiscount,
  ] = useState("");

  const [
    discountDays,
    setDiscountDays,
  ] = useState("");

  const [
    discountSaving,
    setDiscountSaving,
  ] = useState(false);

  /*
   * ---------------------------------------
   * IMAGES
   * ---------------------------------------
   */

  const {
    images,
    setImages,
    pickImages,
    removeImage,
  } = useProductImages();

  /*
   * ---------------------------------------
   * LOAD PRODUCT
   * ---------------------------------------
   */

  useEffect(() => {
    if (!product) {
      return;
    }

    setProductName(
      product.name ?? "",
    );

    setCategory(
      product.category ?? "",
    );

    setPrice(
      String(
        product.price ?? "",
      ),
    );

    setStock(
      String(
        product.stock ?? 0,
      ),
    );

    setDescription(
      product.description ?? "",
    );

    setFeatured(
      product.featured ?? false,
    );

    setDelivery(
      product.delivery ?? true,
    );

    setCondition(
      product.condition ?? "new",
    );

    setImages(
      product.images ?? [],
    );
  }, [
    product,
    setImages,
  ]);

  /*
   * ---------------------------------------
   * UPDATE PRODUCT
   * ---------------------------------------
   */

  const onSave = async () => {
    const worker =
      auth.currentUser;

    if (!worker) {
      Alert.alert(
        "Error",
        "Worker account not found.",
      );

      return;
    }

    if (!productName.trim()) {
      Alert.alert(
        "Validation",
        "Product name is required.",
      );

      return;
    }

    if (!category.trim()) {
      Alert.alert(
        "Validation",
        "Category is required.",
      );

      return;
    }

    const numericPrice =
      Number(price);

    if (
      !Number.isFinite(
        numericPrice,
      ) ||
      numericPrice <= 0
    ) {
      Alert.alert(
        "Validation",
        "Enter a valid product price.",
      );

      return;
    }

    const numericStock =
      Number(stock || 0);

    if (
      !Number.isFinite(
        numericStock,
      ) ||
      numericStock < 0
    ) {
      Alert.alert(
        "Validation",
        "Enter a valid stock quantity.",
      );

      return;
    }

    try {
      setSaving(true);

      const uploaded =
        await updateProductImages(
          images,
          worker.uid,
        );

      await updateProduct(
        productId,
        {
          name:
            productName.trim(),

          category:
            category.trim(),

          description:
            description.trim(),

          price:
            numericPrice,

          stock:
            numericStock,

          thumbnail:
            uploaded.thumbnail,

          images:
            uploaded.images,

          featured,

          delivery,

          condition,
        },
      );

      Alert.alert(
        "Success",
        "Product updated successfully.",
      );

      router.back();
    } catch (error) {
      console.error(
        "Product update failed:",
        error,
      );

      Alert.alert(
        "Error",
        "Unable to update product.",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ---------------------------------------
   * ACTIVATE PRODUCT DISCOUNT
   * ---------------------------------------
   */

  const activateDiscount =
    async () => {
      const worker =
        auth.currentUser;

      if (!worker) {
        Alert.alert(
          "Error",
          "Worker account not found.",
        );

        return;
      }

      if (!product) {
        Alert.alert(
          "Error",
          "Product information is not available.",
        );

        return;
      }

      const originalPrice =
        Number(price);

      const percentage =
        Number(discount);

      const days =
        Number(discountDays);

      if (
        !Number.isFinite(
          originalPrice,
        ) ||
        originalPrice <= 0
      ) {
        Alert.alert(
          "Validation",
          "Product price must be valid.",
        );

        return;
      }

      if (
        !Number.isFinite(
          percentage,
        ) ||
        percentage <= 0 ||
        percentage >= 100
      ) {
        Alert.alert(
          "Validation",
          "Discount must be between 1% and 99%.",
        );

        return;
      }

      if (
        !Number.isInteger(days) ||
        days < 1 ||
        days > 365
      ) {
        Alert.alert(
          "Validation",
          "Discount duration must be between 1 and 365 days.",
        );

        return;
      }

      const discountedPrice =
        Number(
          (
            originalPrice -
            originalPrice *
              (percentage / 100)
          ).toFixed(2),
        );

      if (
        discountedPrice <= 0 ||
        discountedPrice >=
          originalPrice
      ) {
        Alert.alert(
          "Validation",
          "Discounted price is invalid.",
        );

        return;
      }

      const startsAt =
        new Date();

      const expiresAt =
        new Date(
          startsAt.getTime() +
            days *
              24 *
              60 *
              60 *
              1000,
        );

      try {
        setDiscountSaving(
          true,
        );

        await createProductDeal(
          {
            productId,

            workerId:
              worker.uid,

            originalPrice,

            discountPercentage:
              percentage,

            discountedPrice,

            startsAt,

            expiresAt,
          },
        );

        setDiscount("");
        setDiscountDays("");

        Alert.alert(
          "Discount Activated",
          `Your product now has a ${percentage}% discount for ${days} day${
            days === 1
              ? ""
              : "s"
          }.`,
        );
      } catch (error) {
        console.error(
          "Product discount activation failed:",
          error,
        );

        Alert.alert(
          "Error",
          "Unable to activate product discount.",
        );
      } finally {
        setDiscountSaving(
          false,
        );
      }
    };

  return {
    /*
     * Product state
     */
    loading,
    saving,
    product,

    productName,
    setProductName,

    category,
    setCategory,

    price,
    setPrice,

    stock,
    setStock,

    description,
    setDescription,

    featured,
    setFeatured,

    delivery,
    setDelivery,

    condition,
    setCondition,

    /*
     * Images
     */
    images,
    setImages,
    pickImages,
    removeImage,

    /*
     * Product save
     */
    onSave,

    /*
     * Discount
     */
    discount,
    setDiscount,

    discountDays,
    setDiscountDays,

    discountSaving,
    activateDiscount,
  };
}