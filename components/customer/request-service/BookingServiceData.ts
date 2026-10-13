import {
  useMemo,
} from "react";

import {
  CustomerColors,
} from "@/theme";

import {
  isServiceFulfillmentMode,
  type ServiceFulfillmentMode,
} from "@/types/serviceFulfillment";

/* ==============================================================
   TYPES
============================================================== */

export type BookingRouteParam =
  | string
  | string[]
  | undefined;

export type BookingServiceDataInput = {
  serviceId?: BookingRouteParam;
  serviceName?: BookingRouteParam;
  serviceIcon?: BookingRouteParam;
  serviceColor?: BookingRouteParam;
  serviceBackgroundColor?: BookingRouteParam;
  categoryId?: BookingRouteParam;
  fulfillmentMode?: BookingRouteParam;
};

export type BookingServiceData = {
  id: string;
  name: string;
  icon: string;
  color: string;
  backgroundColor: string;
  categoryId: string;
  fulfillmentMode: ServiceFulfillmentMode;
};

/* ==============================================================
   PARAM HELPER
============================================================== */

export function getBookingParamValue(
  value: BookingRouteParam,
): string {
  if (
    Array.isArray(
      value,
    )
  ) {
    return (
      value[0]?.trim() ??
      ""
    );
  }

  return (
    value?.trim() ??
    ""
  );
}

/* ==============================================================
   HOOK
============================================================== */

export function useBookingServiceData({
  serviceId,
  serviceName,
  serviceIcon,
  serviceColor,
  serviceBackgroundColor,
  categoryId,
  fulfillmentMode,
}: BookingServiceDataInput): BookingServiceData {
  const id =
    useMemo(
      () =>
        getBookingParamValue(
          serviceId,
        ),
      [
        serviceId,
      ],
    );

  const name =
    useMemo(
      () =>
        getBookingParamValue(
          serviceName,
        ),
      [
        serviceName,
      ],
    );

  const icon =
    useMemo(
      () =>
        getBookingParamValue(
          serviceIcon,
        ) ||
        "tools",
      [
        serviceIcon,
      ],
    );

  const color =
    useMemo(
      () =>
        getBookingParamValue(
          serviceColor,
        ) ||
        CustomerColors.primary,
      [
        serviceColor,
      ],
    );

  const backgroundColor =
    useMemo(
      () =>
        getBookingParamValue(
          serviceBackgroundColor,
        ) ||
        CustomerColors.primarySoft,
      [
        serviceBackgroundColor,
      ],
    );

  const resolvedCategoryId =
    useMemo(
      () =>
        getBookingParamValue(
          categoryId,
        ),
      [
        categoryId,
      ],
    );

  const resolvedFulfillmentMode =
    useMemo<ServiceFulfillmentMode>(
      () => {
        const value =
          getBookingParamValue(
            fulfillmentMode,
          );

        return isServiceFulfillmentMode(
          value,
        )
          ? value
          : "needs_review";
      },
      [
        fulfillmentMode,
      ],
    );

  return useMemo(
    () => ({
      id,
      name,
      icon,
      color,
      backgroundColor,
      categoryId:
        resolvedCategoryId,
      fulfillmentMode:
        resolvedFulfillmentMode,
    }),
    [
      backgroundColor,
      color,
      icon,
      id,
      name,
      resolvedCategoryId,
      resolvedFulfillmentMode,
    ],
  );
}