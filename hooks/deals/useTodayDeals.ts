import {
  useEffect,
  useState,
} from "react";

import { listenTodayDeals } from "@/firebase/queries/deals/listenTodayDeals";

export default function useTodayDeals() {
  const [deal, setDeal] =
    useState<any>(null);

  useEffect(() => {
    const unsubscribe =
      listenTodayDeals(setDeal);

    return unsubscribe;
  }, []);

  return deal;
}