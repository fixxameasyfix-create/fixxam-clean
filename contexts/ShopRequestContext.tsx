import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { MOCK_SHOP_REQUESTS } from '../constants/mockShopRequests';

import type {
  WorkerShopRequest,
  WorkerShopRequestStatus,
} from '../types/workerShopRequest';

export type CreateShopRequestInput = Omit<
  WorkerShopRequest,
  'id' | 'status' | 'createdAtLabel'
>;

type ShopRequestContextValue = {
  requests: WorkerShopRequest[];
  pendingCount: number;

  createRequest: (
    input: CreateShopRequestInput,
  ) => WorkerShopRequest;

  updateRequestStatus: (
    requestId: string,
    status: WorkerShopRequestStatus,
  ) => void;
};

const ShopRequestContext =
  createContext<ShopRequestContextValue | null>(
    null,
  );

function createRequestId() {
  return `request-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function ShopRequestProvider({
  children,
}: PropsWithChildren) {
  const [requests, setRequests] = useState<
    WorkerShopRequest[]
  >(() => [...MOCK_SHOP_REQUESTS]);

  const createRequest = useCallback(
    (
      input: CreateShopRequestInput,
    ): WorkerShopRequest => {
      const request: WorkerShopRequest = {
        ...input,
        id: createRequestId(),
        status: 'pending',
        createdAtLabel: 'Just now',
      };

      setRequests((current) => [
        request,
        ...current,
      ]);

      return request;
    },
    [],
  );

  const updateRequestStatus = useCallback(
    (
      requestId: string,
      status: WorkerShopRequestStatus,
    ) => {
      setRequests((current) =>
        current.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status,
              }
            : request,
        ),
      );
    },
    [],
  );

  const pendingCount = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.status === 'pending',
      ).length,
    [requests],
  );

  const value =
    useMemo<ShopRequestContextValue>(
      () => ({
        requests,
        pendingCount,
        createRequest,
        updateRequestStatus,
      }),
      [
        requests,
        pendingCount,
        createRequest,
        updateRequestStatus,
      ],
    );

  return (
    <ShopRequestContext.Provider
      value={value}
    >
      {children}
    </ShopRequestContext.Provider>
  );
}

export function useShopRequests(): ShopRequestContextValue {
  const context = useContext(
    ShopRequestContext,
  );

  if (!context) {
    throw new Error(
      'useShopRequests must be used inside ShopRequestProvider',
    );
  }

  return context;
}