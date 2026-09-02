import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  type ServiceCardData,
} from "@/firebase/mappers/serviceMapper";

import {
  getServicesBySubcategory,
} from "@/firebase/queries/getServicesBySubcategory";

/* ==============================================================
   HOOK
============================================================== */

export default function useServicesBySubcategory(
  subcategoryId?: string,
) {
  const [
    services,
    setServices,
  ] = useState<ServiceCardData[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  /* ============================================================
     LOAD SERVICES
  ============================================================ */

  const loadServices =
    useCallback(async () => {
      const cleanId =
        subcategoryId?.trim();

      if (!cleanId) {
        setServices([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        const result =
          await getServicesBySubcategory(
            cleanId,
          );

        setServices(result);
      } catch (error) {
        console.error(
          "GET_SERVICES_BY_SUBCATEGORY_ERROR:",
          error,
        );

        setServices([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, [subcategoryId]);

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    setLoading(true);

    void loadServices();
  }, [loadServices]);

  /* ============================================================
     REFRESH
  ============================================================ */

  const onRefresh =
    useCallback(async () => {
      setRefreshing(true);

      await loadServices();
    }, [loadServices]);

  /* ============================================================
     RETURN
  ============================================================ */

  return {
    services,
    loading,
    refreshing,
    onRefresh,
    reload: loadServices,
  };
}