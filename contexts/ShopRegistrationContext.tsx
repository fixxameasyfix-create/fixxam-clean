import React, {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import type {
  ShopCategoryId,
} from '../constants/shopCategories';

import type {
  WorkerShopBusinessHour,
  WorkerShopService,
} from '../types/workerShop';

/* ============================================================
   TYPES
============================================================ */

export type ShopDraft = {
  name: string;

  /*
   * Empty string means the worker has not
   * selected a shop category yet.
   */
  category: ShopCategoryId | '';

  description: string;
  phone: string;

  address: string;
  latitude: number | null;
  longitude: number | null;

  coverPhoto: string | null;
  logo: string | null;

  services: WorkerShopService[];

  businessHours: WorkerShopBusinessHour[];
};

type ShopRegistrationContextValue = {
  draft: ShopDraft;

  updateDraft: (
    values: Partial<ShopDraft>,
  ) => void;

  resetDraft: () => void;
};

/* ============================================================
   INITIAL STATE
============================================================ */

const INITIAL_DRAFT: ShopDraft = {
  name: '',
  category: '',
  description: '',
  phone: '',

  address: '',
  latitude: null,
  longitude: null,

  coverPhoto: null,
  logo: null,

  services: [],

  businessHours: [],
};

/* ============================================================
   CONTEXT
============================================================ */

const ShopRegistrationContext =
  createContext<ShopRegistrationContextValue | null>(
    null,
  );

/* ============================================================
   PROVIDER
============================================================ */

export function ShopRegistrationProvider({
  children,
}: PropsWithChildren) {
  const [draft, setDraft] =
    useState<ShopDraft>(
      INITIAL_DRAFT,
    );

  /* ----------------------------------------------------------
     UPDATE DRAFT
  ---------------------------------------------------------- */

  const updateDraft =
    useCallback(
      (
        values: Partial<ShopDraft>,
      ) => {
        setDraft(
          (current) => ({
            ...current,
            ...values,
          }),
        );
      },
      [],
    );

  /* ----------------------------------------------------------
     RESET DRAFT
  ---------------------------------------------------------- */

  const resetDraft =
    useCallback(() => {
      setDraft(
        INITIAL_DRAFT,
      );
    }, []);

  /* ----------------------------------------------------------
     MEMOIZED CONTEXT VALUE
  ---------------------------------------------------------- */

  const value =
    useMemo<ShopRegistrationContextValue>(
      () => ({
        draft,
        updateDraft,
        resetDraft,
      }),
      [
        draft,
        updateDraft,
        resetDraft,
      ],
    );

  return (
    <ShopRegistrationContext.Provider
      value={value}
    >
      {children}
    </ShopRegistrationContext.Provider>
  );
}

/* ============================================================
   HOOK
============================================================ */

export function useShopRegistration(): ShopRegistrationContextValue {
  const context =
    useContext(
      ShopRegistrationContext,
    );

  if (!context) {
    throw new Error(
      'useShopRegistration must be used inside ShopRegistrationProvider',
    );
  }

  return context;
}