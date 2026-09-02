import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  searchServices,
  searchWorkers,
} from "@/firebase/queries/search";

import {
  workerMapper,
} from "@/firebase/mappers/workerMapper";

import {
  type ServiceCardData,
  serviceMapper,
} from "@/firebase/mappers/serviceMapper";

import type {
  WorkerCardData,
} from "@/components/customer/worker/workercard";

import {
  SearchFilterType,
} from "@/components/search/SearchFilter";

import useCurrentLocation from "@/hooks/location/useCurrentLocation";

import {
  calculateDistance,
} from "@/utils/location/calculateDistance";

import {
  matchCustomerService,
} from "@/firebase/ai/customerSearch";

type SearchSection =
  | {
      title: string;
      type: "services";
      data: ServiceCardData[];
    }
  | {
      title: string;
      type: "workers";
      data: WorkerCardData[];
    };

type AiSearchResult = {
  serviceId?: string | null;
  confidence?: number;
  language?: string;
};

function normalize(
  value: unknown,
): string {
  if (typeof value === "string") {
    return value
      .normalize("NFKC")
      .trim()
      .toLowerCase()
      .replace(
        /[^\p{L}\p{N}\s]/gu,
        " ",
      )
      .replace(/\s+/g, " ");
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value)
      .trim()
      .toLowerCase();
  }

  if (Array.isArray(value)) {
    return value
      .map(normalize)
      .filter(Boolean)
      .join(" ");
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    return Object.values(
      value as Record<
        string,
        unknown
      >,
    )
      .map(normalize)
      .filter(Boolean)
      .join(" ");
  }

  return "";
}

function getTokens(
  value: string,
): string[] {
  return Array.from(
    new Set(
      normalize(value)
        .split(" ")
        .map(
          (token) => token.trim(),
        )
        .filter(
          (token) =>
            token.length >= 2,
        ),
    ),
  );
}

function scoreService(
  query: string,
  service: ServiceCardData,
): number {
  const normalizedQuery =
    normalize(query);

  if (!normalizedQuery) {
    return 0;
  }

  const queryTokens =
    getTokens(normalizedQuery);

  if (queryTokens.length === 0) {
    return 0;
  }

  const name =
    normalize(service.name);

  const description =
    normalize(service.description);

  const aliases =
    normalize(service.aliases);

  const keywords =
    normalize(service.keywords);

  const tags =
    normalize(service.tags);

  const searchableText =
    normalize(
      service.searchText,
    );

  let score = 0;

  /*
   * Exact service name.
   */
  if (
    name === normalizedQuery
  ) {
    score += 300;
  }

  /*
   * Exact alias.
   *
   * Example:
   * "aski" -> Haircut
   */
  if (
    service.aliases.some(
      (alias) =>
        normalize(alias) ===
        normalizedQuery,
    )
  ) {
    score += 280;
  }

  /*
   * Exact phrase.
   */
  if (
    searchableText.includes(
      normalizedQuery,
    )
  ) {
    score += 120;
  }

  /*
   * Token matching.
   */
  for (const token of queryTokens) {
    if (name.includes(token)) {
      score += 80;
    }

    if (aliases.includes(token)) {
      score += 70;
    }

    if (keywords.includes(token)) {
      score += 50;
    }

    if (tags.includes(token)) {
      score += 35;
    }

    if (
      description.includes(token)
    ) {
      score += 20;
    }
  }

  /*
   * Small bonus when all query
   * words exist somewhere.
   */
  const allTokensMatch =
    queryTokens.every(
      (token) =>
        searchableText.includes(
          token,
        ),
    );

  if (allTokensMatch) {
    score += 100;
  }

  return score;
}

function searchServicesLocally(
  query: string,
  services: ServiceCardData[],
): ServiceCardData[] {
  const normalizedQuery =
    normalize(query);

  if (!normalizedQuery) {
    return services;
  }

  return services
    .map((service) => ({
      service,
      score: scoreService(
        normalizedQuery,
        service,
      ),
    }))
    .filter(
      ({ score }) => score > 0,
    )
    .sort(
      (a, b) =>
        b.score - a.score,
    )
    .map(
      ({ service }) => service,
    );
}

function searchWorkersLocally(
  query: string,
  workers: WorkerCardData[],
): WorkerCardData[] {
  const normalizedQuery =
    normalize(query);

  if (!normalizedQuery) {
    return workers;
  }

  const tokens =
    getTokens(normalizedQuery);

  return workers.filter(
    (worker) => {
      const searchableText =
        normalize([
          worker.firstName,
          worker.surname,
          worker.category,
          worker.subcategory,
          worker.services,
        ]);

      if (
        searchableText.includes(
          normalizedQuery,
        )
      ) {
        return true;
      }

      return tokens.every(
        (token) =>
          searchableText.includes(
            token,
          ),
      );
    },
  );
}

function isQuotaError(
  error: unknown,
): boolean {
  const message =
    error instanceof Error
      ? error.message
      : String(error);

  const normalized =
    message.toLowerCase();

  return (
    normalized.includes("429") ||
    normalized.includes(
      "resource_exhausted",
    ) ||
    normalized.includes(
      "quota exceeded",
    ) ||
    normalized.includes(
      "rate limit",
    ) ||
    normalized.includes(
      "free_tier",
    )
  );
}

export default function useSearch() {
  const [loading, setLoading] =
    useState(true);

  const [aiLoading, setAiLoading] =
    useState(false);

  const [query, setQuery] =
    useState("");

  const [filter, setFilter] =
    useState<SearchFilterType>(
      "all",
    );

  const [workers, setWorkers] =
    useState<WorkerCardData[]>(
      [],
    );

  const [services, setServices] =
    useState<ServiceCardData[]>(
      [],
    );

  const [aiServiceId, setAiServiceId] =
    useState<string | null>(null);

  const {
    location,
  } = useCurrentLocation();

  const aiRequestId =
    useRef(0);

  const aiCache =
    useRef<
      Map<
        string,
        string | null
      >
    >(new Map());

  /*
   * ------------------------------------
   * LOAD FIRESTORE DATA
   * ------------------------------------
   */

  const loadData =
    useCallback(
      async () => {
        try {
          setLoading(true);

          const [
            workersSnapshot,
            servicesSnapshot,
          ] = await Promise.all([
            searchWorkers(),
            searchServices(),
          ]);

          const mappedWorkers =
            workersSnapshot.docs.map(
              (doc) => {
                const worker =
                  workerMapper(doc);

                const latitude =
                  worker.workerProfile
                    ?.latitude;

                const longitude =
                  worker.workerProfile
                    ?.longitude;

                if (
                  location &&
                  latitude != null &&
                  longitude != null
                ) {
                  worker.distance =
                    calculateDistance(
                      location.latitude,
                      location.longitude,
                      latitude,
                      longitude,
                    );
                }

                return worker;
              },
            );

          const mappedServices =
            servicesSnapshot.docs.map(
              serviceMapper,
            );

          setWorkers(
            mappedWorkers,
          );

          setServices(
            mappedServices,
          );

          /*
           * Clear AI cache whenever
           * Firestore catalog changes.
           */
          aiCache.current.clear();
        } catch (error) {
          console.error(
            "Search data loading failed:",
            error,
          );
        } finally {
          setLoading(false);
        }
      },
      [location],
    );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  /*
   * ------------------------------------
   * KEYWORD
   * ------------------------------------
   */

  const keyword =
    useMemo(
      () => normalize(query),
      [query],
    );

  /*
   * ------------------------------------
   * LOCAL SERVICE SEARCH
   * ------------------------------------
   */

  const localFilteredServices =
    useMemo(
      () =>
        searchServicesLocally(
          keyword,
          services,
        ),
      [keyword, services],
    );

  /*
   * ------------------------------------
   * LOCAL WORKER SEARCH
   * ------------------------------------
   */

  const filteredWorkers =
    useMemo(
      () =>
        searchWorkersLocally(
          keyword,
          workers,
        ),
      [keyword, workers],
    );

  /*
   * ------------------------------------
   * AI FALLBACK
   *
   * IMPORTANT:
   *
   * AI WILL NOT RUN when local
   * search already found services.
   *
   * This prevents Gemini quota
   * exhaustion while typing.
   * ------------------------------------
   */

  useEffect(() => {
    const requestId =
      ++aiRequestId.current;

    setAiServiceId(null);

    if (
      filter === "workers"
    ) {
      setAiLoading(false);
      return;
    }

    if (!keyword) {
      setAiLoading(false);
      return;
    }

    /*
     * Don't send tiny queries
     * to Gemini.
     */
    if (keyword.length < 3) {
      setAiLoading(false);
      return;
    }

    if (services.length === 0) {
      setAiLoading(false);
      return;
    }

    /*
     * LOCAL SEARCH WON.
     *
     * Example:
     *
     * "gyaran ac"
     *
     * already finds AC services.
     *
     * Gemini is unnecessary.
     */
    if (
      localFilteredServices.length >
      0
    ) {
      setAiLoading(false);
      return;
    }

    /*
     * Check cache.
     */
    if (
      aiCache.current.has(
        keyword,
      )
    ) {
      const cached =
        aiCache.current.get(
          keyword,
        ) ?? null;

      setAiServiceId(cached);
      setAiLoading(false);

      return;
    }

    const timer =
      setTimeout(
        async () => {
          if (
            requestId !==
            aiRequestId.current
          ) {
            return;
          }

          try {
            setAiLoading(true);

            /*
             * Compact catalog.
             */
           
const catalog =
  services.map(
    (service) => ({
      id: service.id,

      name: service.name,

      description:
        service.description,

      category:
        service.categoryId,

      subcategory:
        service.subcategoryId,

      aliases:
        service.aliases,

      keywords:
        service.keywords,

      tags:
        service.tags,
    }),
  );

            const result =
              (await matchCustomerService(
                keyword,
                catalog,
              )) as AiSearchResult;

            if (
              requestId !==
              aiRequestId.current
            ) {
              return;
            }

            const matchedId =
              result?.serviceId ??
              null;

            aiCache.current.set(
              keyword,
              matchedId,
            );

            setAiServiceId(
              matchedId,
            );
          } catch (error) {
            /*
             * Gemini quota error:
             * DO NOT RETRY.
             */
            if (
              isQuotaError(error)
            ) {
              console.warn(
                "Gemini quota reached. Local search fallback is active.",
              );

              aiCache.current.set(
                keyword,
                null,
              );
            } else {
              console.error(
                "AI service search failed:",
                error,
              );
            }

            if (
              requestId ===
              aiRequestId.current
            ) {
              setAiServiceId(null);
            }
          } finally {
            if (
              requestId ===
              aiRequestId.current
            ) {
              setAiLoading(false);
            }
          }
        },
        900,
      );

    return () => {
      clearTimeout(timer);
    };
  }, [
    filter,
    keyword,
    services,
    localFilteredServices.length,
  ]);

  /*
   * ------------------------------------
   * FINAL SERVICES
   * ------------------------------------
   */

  const filteredServices =
    useMemo(() => {
      if (!keyword) {
        return services;
      }

      /*
       * Local search has priority.
       */
      if (
        localFilteredServices.length >
        0
      ) {
        return localFilteredServices;
      }

      /*
       * AI fallback.
       */
      if (!aiServiceId) {
        return [];
      }

      const matchedService =
        services.find(
          (service) =>
            service.id ===
            aiServiceId,
        );

      return matchedService
        ? [matchedService]
        : [];
    }, [
      keyword,
      services,
      localFilteredServices,
      aiServiceId,
    ]);

  /*
   * ------------------------------------
   * SECTIONS
   * ------------------------------------
   */

  const sections =
    useMemo<SearchSection[]>(
      () => {
        const result: SearchSection[] =
          [];

        if (
          filter !== "workers" &&
          filteredServices.length > 0
        ) {
          result.push({
            title: "Services",
            type: "services",
            data:
              filteredServices,
          });
        }

        if (
          filter !== "services" &&
          filteredWorkers.length > 0
        ) {
          result.push({
            title: "Workers",
            type: "workers",
            data:
              filteredWorkers,
          });
        }

        return result;
      },
      [
        filter,
        filteredServices,
        filteredWorkers,
      ],
    );

  /*
   * ------------------------------------
   * RETURN
   * ------------------------------------
   */

  return {
    loading,
    aiLoading,

    query,
    setQuery,

    filter,
    setFilter,

    filteredWorkers,
    filteredServices,

    sections,

    reload: loadData,
  };
}