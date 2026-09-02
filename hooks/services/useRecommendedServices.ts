import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ServiceCardData,
} from "@/firebase/mappers/serviceMapper";

import {
  getRecommendedServices,
} from "@/firebase/queries/getRecommendedServices";

export default function useRecommendedServices() {
  const [
    services,
    setServices,
  ] = useState<ServiceCardData[]>(
    [],
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const loadServices =
    useCallback(
      async () => {
        try {
          setError(null);

          const result =
            await getRecommendedServices();

          setServices(result);
        } catch (loadError) {
          console.error(
            "Failed to load recommended services:",
            loadError,
          );

          setServices([]);

          setError(
            "Unable to load recommended services. Please try again.",
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [],
    );

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const onRefresh =
    useCallback(async () => {
      setRefreshing(true);

      await loadServices();
    }, [loadServices]);

  return {
    services,
    loading,
    refreshing,
    error,
    onRefresh,
    reload: loadServices,
  };
}