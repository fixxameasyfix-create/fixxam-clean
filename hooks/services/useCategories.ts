import { useEffect, useState } from "react";

import {
  listenCategories,
  ServiceCategory,
} from "@/firebase/queries/services/listenCategories";

export default function useCategories() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenCategories((data) => {
      setCategories(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return {
    categories,
    loading,
  };
}