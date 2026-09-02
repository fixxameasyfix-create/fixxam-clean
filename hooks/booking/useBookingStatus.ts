import { useMemo } from "react";


export type BookingStatus =
  | "pending_estimate"
  | "estimate_sent"
  | "accepted"
  | "enroute"
  | "in_progress"
  | "completed";


type Props = {

  status?: BookingStatus;

};


const steps = [

  {
    key: "request",
    title: "Request Sent",
    description: "Your booking request has been submitted.",
  },

  {
    key: "estimate",
    title: "Estimate",
    description: "Worker will review and send an estimate.",
  },

  {
    key: "accepted",
    title: "Accepted",
    description: "Worker accepted your booking.",
  },

  {
    key: "enroute",
    title: "On The Way",
    description: "Worker is coming to your location.",
  },

  {
    key: "completed",
    title: "Completed",
    description: "Service has been completed.",
  },

];


export default function useBookingStatus({

  status = "pending_estimate",

}: Props) {


  return useMemo(() => {


    let currentIndex = 0;


    switch (status) {


      case "pending_estimate":

        currentIndex = 0;

        break;


      case "estimate_sent":

        currentIndex = 1;

        break;


      case "accepted":

        currentIndex = 2;

        break;


      case "enroute":

        currentIndex = 3;

        break;


      case "in_progress":

        currentIndex = 3;

        break;


      case "completed":

        currentIndex = 4;

        break;


    }



    return {

      title:
        status === "pending_estimate"
          ? "Waiting for worker review"
          : status === "estimate_sent"
          ? "Estimate received"
          : status === "accepted"
          ? "Booking accepted"
          : status === "enroute"
          ? "is on the way"
          : status === "completed"
          ? "Service completed"
          : "Service in progress",


      description:
        status === "pending_estimate"
          ? "The worker will review your request and send an estimate."
          : status === "estimate_sent"
          ? "The worker has sent a price estimate."
          : "Your booking status has been updated.",


      steps,


      currentIndex,


    };


  }, [status]);


}