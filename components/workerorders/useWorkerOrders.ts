import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  subscribeToWorkerShopRequests,
} from "@/services/shopRequestService";

import type {
  FirebaseShopRequest,
} from "@/types/firebaseShopRequest";

import type {
  WorkerFilterType,
  WorkerMarketOrder,
  WorkerOrderCounts,
  WorkerServiceOrder,
} from "@/types/workerOrders";

import {
  addStatusCount,
  getTimestampMillis,
  isDeletedByWorker,
  matchesFilter,
  normalizeWorkerMarketOrder,
  normalizeWorkerServiceOrder,
} from "./workerOrdersConfig";

/* ==============================================================
RETURN TYPE
============================================================== */

export type UseWorkerOrdersReturn = {
  user: User | null;
  authReady: boolean;

  serviceOrders: WorkerServiceOrder[];
  marketOrders: WorkerMarketOrder[];
  shopRequests: FirebaseShopRequest[];

  serviceLoading: boolean;
  marketLoading: boolean;
  shopRequestsLoading: boolean;

  serviceError: string | null;
  marketError: string | null;
  shopRequestsError: string | null;

  filteredServiceOrders: WorkerServiceOrder[];
  filteredMarketOrders: WorkerMarketOrder[];
  filteredShopRequests: FirebaseShopRequest[];

  deletionCounts: WorkerOrderCounts;

  setSelectedFilter: (
    filter: WorkerFilterType,
  ) => void;

  selectedFilter: WorkerFilterType;
};

/* ==============================================================
HOOK
============================================================== */

export function useWorkerOrders(): UseWorkerOrdersReturn {
  /* ============================================================
  AUTH
  ============================================================ */

  const [user, setUser] =
    useState<User | null>(
      auth.currentUser,
    );

  const [authReady, setAuthReady] =
    useState(false);

  /* ============================================================
  FILTER
  ============================================================ */

  const [
    selectedFilter,
    setSelectedFilter,
  ] =
    useState<WorkerFilterType>(
      "all",
    );

  /* ============================================================
  DATA
  ============================================================ */

  const [
    serviceOrders,
    setServiceOrders,
  ] =
    useState<WorkerServiceOrder[]>(
      [],
    );

  const [
    marketOrders,
    setMarketOrders,
  ] =
    useState<WorkerMarketOrder[]>(
      [],
    );

  const [
    shopRequests,
    setShopRequests,
  ] =
    useState<FirebaseShopRequest[]>(
      [],
    );

  /* ============================================================
  LOADING
  ============================================================ */

  const [
    serviceLoading,
    setServiceLoading,
  ] =
    useState(false);

  const [
    marketLoading,
    setMarketLoading,
  ] =
    useState(false);

  const [
    shopRequestsLoading,
    setShopRequestsLoading,
  ] =
    useState(false);

  /* ============================================================
  ERRORS
  ============================================================ */

  const [
    serviceError,
    setServiceError,
  ] =
    useState<string | null>(null);

  const [
    marketError,
    setMarketError,
  ] =
    useState<string | null>(null);

  const [
    shopRequestsError,
    setShopRequestsError,
  ] =
    useState<string | null>(null);

  /* ============================================================
  AUTH + FIREBASE
  ============================================================ */

  useEffect(() => {
    let unsubscribeBookings:
      | (() => void)
      | undefined;

    let unsubscribeMarket:
      | (() => void)
      | undefined;

    let unsubscribeShopRequests:
      | (() => void)
      | undefined;

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        currentUser => {
          unsubscribeBookings?.();
          unsubscribeMarket?.();
          unsubscribeShopRequests?.();

          unsubscribeBookings =
            undefined;

          unsubscribeMarket =
            undefined;

          unsubscribeShopRequests =
            undefined;

          setAuthReady(true);

          setServiceOrders([]);
          setMarketOrders([]);
          setShopRequests([]);

          setServiceError(null);
          setMarketError(null);
          setShopRequestsError(null);

          if (!currentUser) {
            setUser(null);

            setServiceLoading(false);
            setMarketLoading(false);
            setShopRequestsLoading(false);

            setSelectedFilter("all");

            return;
          }

          setUser(currentUser);

          setServiceLoading(true);
          setMarketLoading(true);
          setShopRequestsLoading(true);

          /* ==================================================
          SERVICE
          ================================================== */

          const bookingsQuery =
            query(
              collection(
                db,
                "bookings",
              ),
              where(
                "workerId",
                "==",
                currentUser.uid,
              ),
            );

          unsubscribeBookings =
            onSnapshot(
              bookingsQuery,
              snapshot => {
                const nextOrders =
                  snapshot.docs
                    .map(document =>
                      normalizeWorkerServiceOrder(
                        document.id,
                        document.data(),
                      ),
                    )
                    .filter(
                      order =>
                        !isDeletedByWorker(
                          order,
                        ),
                    )
                    .sort(
                      (a, b) =>
                        getTimestampMillis(
                          b.createdAt,
                        ) -
                        getTimestampMillis(
                          a.createdAt,
                        ),
                    );

                setServiceOrders(
                  nextOrders,
                );

                setServiceLoading(
                  false,
                );

                setServiceError(
                  null,
                );
              },
              listenerError => {
                if (__DEV__) {
                  console.error(
                    "WORKER_SERVICE_ORDERS_ERROR:",
                    listenerError,
                  );
                }

                setServiceOrders([]);

                setServiceLoading(
                  false,
                );

                setServiceError(
                  "Some service jobs could not be loaded.",
                );
              },
            );

          /* ==================================================
          MARKET
          ================================================== */

          const marketQuery =
            query(
              collection(
                db,
                "orders",
              ),
              where(
                "workerId",
                "==",
                currentUser.uid,
              ),
            );

          unsubscribeMarket =
            onSnapshot(
              marketQuery,
              snapshot => {
                const nextOrders =
                  snapshot.docs
                    .map(document =>
                      normalizeWorkerMarketOrder(
                        document.id,
                        document.data(),
                      ),
                    )
                    .filter(
                      order =>
                        !isDeletedByWorker(
                          order,
                        ),
                    )
                    .sort(
                      (a, b) =>
                        getTimestampMillis(
                          b.createdAt,
                        ) -
                        getTimestampMillis(
                          a.createdAt,
                        ),
                    );

                setMarketOrders(
                  nextOrders,
                );

                setMarketLoading(
                  false,
                );

                setMarketError(
                  null,
                );
              },
              listenerError => {
                if (__DEV__) {
                  console.error(
                    "WORKER_MARKET_ORDERS_ERROR:",
                    listenerError,
                  );
                }

                setMarketOrders([]);

                setMarketLoading(
                  false,
                );

                setMarketError(
                  "Some market orders could not be loaded.",
                );
              },
            );

          /* ==================================================
          SHOP
          ================================================== */

          unsubscribeShopRequests =
            subscribeToWorkerShopRequests(
              currentUser.uid,
              requests => {
                const visibleRequests =
                  requests.filter(
                    request =>
                      !isDeletedByWorker(
                        request,
                      ),
                  );

                setShopRequests(
                  visibleRequests,
                );

                setShopRequestsLoading(
                  false,
                );

                setShopRequestsError(
                  null,
                );
              },
              listenerError => {
                if (__DEV__) {
                  console.error(
                    "WORKER_SHOP_REQUESTS_ERROR:",
                    listenerError,
                  );
                }

                setShopRequests([]);

                setShopRequestsLoading(
                  false,
                );

                setShopRequestsError(
                  "Some shop requests could not be loaded.",
                );
              },
            );
        },
      );

    return () => {
      unsubscribeBookings?.();
      unsubscribeMarket?.();
      unsubscribeShopRequests?.();
      unsubscribeAuth();
    };
  }, []);

  /* ============================================================
  FILTERED SERVICE
  ============================================================ */

  const filteredServiceOrders =
    useMemo(
      () =>
        serviceOrders
          .filter(order =>
            matchesFilter(
              order.status,
              selectedFilter,
            ),
          )
          .sort(
            (a, b) =>
              getTimestampMillis(
                b.createdAt,
              ) -
              getTimestampMillis(
                a.createdAt,
              ),
          ),
      [
        serviceOrders,
        selectedFilter,
      ],
    );

  /* ============================================================
  FILTERED MARKET
  ============================================================ */

  const filteredMarketOrders =
    useMemo(
      () =>
        marketOrders
          .filter(order =>
            matchesFilter(
              order.status,
              selectedFilter,
            ),
          )
          .sort(
            (a, b) =>
              getTimestampMillis(
                b.createdAt,
              ) -
              getTimestampMillis(
                a.createdAt,
              ),
          ),
      [
        marketOrders,
        selectedFilter,
      ],
    );

  /* ============================================================
  FILTERED SHOP
  ============================================================ */

  const filteredShopRequests =
    useMemo(
      () =>
        shopRequests
          .filter(request =>
            matchesFilter(
              request.status,
              selectedFilter,
            ),
          )
          .sort(
            (a, b) =>
              getTimestampMillis(
                b.createdAt,
              ) -
              getTimestampMillis(
                a.createdAt,
              ),
          ),
      [
        shopRequests,
        selectedFilter,
      ],
    );

  /* ============================================================
  DELETION COUNTS
  ============================================================ */

  const deletionCounts =
    useMemo<WorkerOrderCounts>(
      () => {
        const result: WorkerOrderCounts =
          {
            all: 0,
            pending: 0,
            active: 0,
            completed: 0,
            cancelled: 0,
          };

        for (const order of serviceOrders) {
          addStatusCount(
            result,
            order.status,
          );
        }

        for (const order of marketOrders) {
          addStatusCount(
            result,
            order.status,
          );
        }

        for (const request of shopRequests) {
          addStatusCount(
            result,
            request.status,
          );
        }

        result.all =
          serviceOrders.length +
          marketOrders.length +
          shopRequests.length;

        return result;
      },
      [
        serviceOrders,
        marketOrders,
        shopRequests,
      ],
    );

  /* ============================================================
  RETURN
  ============================================================ */

  return {
    user,
    authReady,

    serviceOrders,
    marketOrders,
    shopRequests,

    serviceLoading,
    marketLoading,
    shopRequestsLoading,

    serviceError,
    marketError,
    shopRequestsError,

    filteredServiceOrders,
    filteredMarketOrders,
    filteredShopRequests,

    deletionCounts,

    selectedFilter,
    setSelectedFilter,
  };
}