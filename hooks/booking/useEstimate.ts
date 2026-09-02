import { useMemo } from "react";


type Props = {

  estimatePrice?: number | null;

  estimateMessage?: string;

};


export default function useEstimate({

  estimatePrice,

  estimateMessage,

}: Props) {


  return useMemo(() => {


    const hasEstimate =
      typeof estimatePrice === "number"
      && estimatePrice > 0;


    return {

      hasEstimate,

      price:
        estimatePrice ?? 0,

      message:
        estimateMessage ?? "",


      status:
        hasEstimate
          ? "received"
          : "waiting",


    };


  }, [

    estimatePrice,

    estimateMessage,

  ]);

}