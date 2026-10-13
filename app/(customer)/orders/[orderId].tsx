
import React, {
useCallback,
useEffect,
useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
deleteField,
doc,
serverTimestamp,
updateDoc,
} from "firebase/firestore";

import {
router,
useFocusEffect,
useLocalSearchParams,
} from "expo-router";

import Toast from "react-native-toast-message";

import {
AppIcon,
AppScreen,
AppText,
} from "@/components/ui";

import {
auth,
db,
} from "@/firebase/config";

import CustomerOrderActions from "@/components/orders/CustomerOrderActions";
import CustomerOrderHeader from "@/components/orders/CustomerOrderHeader";
import CustomerOrderOfferSection from "@/components/orders/CustomerOrderOfferSection";
import CustomerOrderRequest from "@/components/orders/CustomerOrderRequest";
import OrderExpiryTimer from "@/components/orders/OrderExpiryTimer";

import AgreedPriceCard from "@/components/orders/customer-order/agreedPriceCard";
import ServiceConfirmationCard from "@/components/orders/customer-order/ServiceConfirmationCard";

import {
useCustomerOrder,
} from "@/components/orders/customer-order/useCustomerOrder";

import {
useCustomerLiveLocation,
} from "@/hooks/orders/useCustomerLiveLocation";

import {
hasValidCoordinates,
} from "@/components/orders/customer-order/customerOrder.utils";

import {
Colors,
CustomerColors,
FixxamTokens,
} from "@/theme";

/* ==============================================================
HELPERS
============================================================== */

function showErrorToast(
title: string,
message: string,
) {
Toast.show({
type: "error",
text1: title,
text2: message,
});
}

function showInfoToast(
title: string,
message: string,
) {
Toast.show({
type: "info",
text1: title,
text2: message,
});
}

function showSuccessToast(
title: string,
message?: string,
) {
Toast.show({
type: "success",
text1: title,
...(message
? {
text2: message,
}
: {}),
});
}

function resolveOrderId(
value:
| string
| string[]
| undefined,
): string {
if (
typeof value ===
"string"
) {
return value.trim();
}

if (
Array.isArray(value)
) {
return (
value[0]?.trim() ??
""
);
}

return "";
}

/* ==============================================================
SCREEN
============================================================== */

export default function CustomerOrderScreen() {
const {
orderId: orderIdParam,
} =
useLocalSearchParams<{
orderId?:
| string
| string[];
}>();

const orderId =
resolveOrderId(
orderIdParam,
);

const customerId =
auth.currentUser?.uid?.trim() ??
"";

const {
booking,
loading,
error,
workerLiveLocation,
offerExpiresAt,
orderExpired,
reviewPrompt,
dismissReviewPrompt,
handleOrderExpired,
handleAcceptOffer,
handleDeclineOffer,
handleCancel,
handleConfirmServiceStarted,
handleConfirmServiceCompleted,
} =
useCustomerOrder(
orderId,
);

/* ============================================================
ORDER STATE
============================================================ */

const trackingActive =
booking?.status ===
"accepted" ||
booking?.status ===
"in-progress";

const workerTravels =
booking?.fulfillmentMode ===
"worker_visits_customer";

const isRemoteBooking =
booking?.fulfillmentMode ===
"remote";

const isOrderCancelled =
  booking?.status === "cancelled";

const customerSharingEligible =
Boolean(
booking &&
customerId &&
booking.customerId ===
customerId &&
workerTravels &&
trackingActive,
);

const hasCoordinates =
Boolean(
booking &&
!isRemoteBooking &&
hasValidCoordinates(
booking.latitude,
booking.longitude,
),
);

/* ============================================================
CUSTOMER LIVE LOCATION
============================================================ */

const [
customerSharingIntent,
setCustomerSharingIntent,
] =
useState<boolean | null>(
null,
);

const [
customerSharingBusy,
setCustomerSharingBusy,
] =
useState(false);

const persistedCustomerSharing =
booking?.customerLiveSharingEnabled ===
true;

const customerSharingEnabled =
customerSharingIntent ??
persistedCustomerSharing;

const shouldShareCustomerLocation =
customerSharingEligible &&
customerSharingEnabled;

const {
state:
customerLiveSharingState,
error:
customerLiveSharingError,
isTracking:
customerLiveLocationTracking,
} =
useCustomerLiveLocation({
orderId:
booking?.id?.trim() ||
orderId,

customerId,  

  bookingCustomerId:  
    booking?.customerId,  

  enabled:  
    shouldShareCustomerLocation,  
});

/* ============================================================
SYNC SHARING STATE
============================================================ */

useEffect(() => {
setCustomerSharingIntent(
null,
);

setCustomerSharingBusy(  
  false,  
);

}, [
orderId,
]);

useEffect(() => {
if (
customerSharingIntent ===
true &&
persistedCustomerSharing
) {
setCustomerSharingIntent(
null,
);
}
}, [
customerSharingIntent,
persistedCustomerSharing,
]);

useEffect(() => {
if (
customerSharingIntent ===
false &&
!persistedCustomerSharing
) {
setCustomerSharingIntent(
null,
);
}
}, [
customerSharingIntent,
persistedCustomerSharing,
]);

/* ============================================================
AUTOMATICALLY STOP SHARING
============================================================ */

useEffect(() => {
if (
!booking ||
!customerId ||
booking.customerId !==
customerId ||
customerSharingEligible ||
booking.customerLiveSharingEnabled !==
true
) {
return;
}

const bookingId =  
  booking.id.trim();  

if (!bookingId) {  
  return;  
}  

setCustomerSharingIntent(  
  false,  
);  

void updateDoc(  
  doc(  
    db,  
    "bookings",  
    bookingId,  
  ),  
  {  
    customerLiveSharingEnabled:  
      false,  

    customerLiveLocation:  
      deleteField(),  

    updatedAt:  
      serverTimestamp(),  
  },  
).catch(error => {  
  if (__DEV__) {  
    console.warn(  
      "CUSTOMER_LIVE_LOCATION_AUTO_STOP_ERROR",  
      error,  
    );  
  }  

  setCustomerSharingIntent(  
    null,  
  );  
});

}, [
booking,
customerId,
customerSharingEligible,
]);

/* ============================================================
START CUSTOMER LOCATION SHARING
============================================================ */

const handleStartCustomerSharing =
useCallback(() => {
if (!booking) {
showErrorToast(
"Order unavailable",
"This order could not be loaded for location sharing.",
);

return;  
  }  

  if (!customerId) {  
    showErrorToast(  
      "Sign in required",  
      "Please sign in again before sharing your location.",  
    );  

    return;  
  }  

  if (  
    booking.customerId !==  
    customerId  
  ) {  
    showErrorToast(  
      "Location sharing unavailable",  
      "You do not have access to share location for this order.",  
    );  

    return;  
  }  

  if (  
    booking.fulfillmentMode ===  
    "remote"  
  ) {  
    showInfoToast(  
      "Location sharing not required",  
      "Remote services do not require live location sharing.",  
    );  

    return;  
  }  

  if (  
    booking.fulfillmentMode !==  
    "worker_visits_customer"  
  ) {  
    showInfoToast(  
      "Location sharing not required",  
      "You are travelling to the worker's fixed service location.",  
    );  

    return;  
  }  

  if (!trackingActive) {  
    showInfoToast(  
      "Location sharing unavailable",  
      "Live location sharing becomes available after the offer is accepted.",  
    );  

    return;  
  }  

  setCustomerSharingIntent(  
    true,  
  );  
}, [  
  booking,  
  customerId,  
  trackingActive,  
]);

/* ============================================================
STOP CUSTOMER LOCATION SHARING
============================================================ */

const stopCustomerSharing =
useCallback(
async (
bookingId: string,
) => {
setCustomerSharingIntent(
false,
);

setCustomerSharingBusy(  
      true,  
    );  

    try {  
      await updateDoc(  
        doc(  
          db,  
          "bookings",  
          bookingId,  
        ),  
        {  
          customerLiveSharingEnabled:  
            false,  

          customerLiveLocation:  
            deleteField(),  

          updatedAt:  
            serverTimestamp(),  
        },  
      );  

      showSuccessToast(  
        "Location sharing stopped",  
        "Your live location is no longer being shared with the worker.",  
      );  
    } catch (error) {  
      if (__DEV__) {  
        console.warn(  
          "CUSTOMER_STOP_LIVE_LOCATION_ERROR",  
          error,  
        );  
      }  

      setCustomerSharingIntent(  
        null,  
      );  

      showErrorToast(  
        "Unable to stop sharing",  
        "We could not update your location sharing. Check your connection and try again.",  
      );  
    } finally {  
      setCustomerSharingBusy(  
        false,  
      );  
    }  
  },  
  [],  
);

const handleStopCustomerSharing =
useCallback(() => {
if (
!booking ||
customerSharingBusy
) {
return;
}

if (!customerId) {  
    showErrorToast(  
      "Sign in required",  
      "Please sign in again before changing location sharing.",  
    );  

    return;  
  }  

  if (  
    booking.customerId !==  
    customerId  
  ) {  
    showErrorToast(  
      "Location sharing unavailable",  
      "You do not have access to change location sharing for this order.",  
    );  

    return;  
  }  

  const bookingId =  
    booking.id.trim();  

  if (!bookingId) {  
    showErrorToast(  
      "Order unavailable",  
      "This order could not be identified.",  
    );  

    return;  
  }  

  Alert.alert(  
    "Stop sharing location?",  
    "The worker will no longer be able to track your live location.",  
    [  
      {  
        text: "Keep sharing",  
        style: "cancel",  
      },  
      {  
        text: "Stop sharing",  
        style: "destructive",  
        onPress: () => {  
          void stopCustomerSharing(  
            bookingId,  
          );  
        },  
      },  
    ],  
  );  
}, [  
  booking,  
  customerId,  
  customerSharingBusy,  
  stopCustomerSharing,  
]);

/* ============================================================
NAVIGATION
============================================================ */

const handleBack =
useCallback(() => {
if (
router.canGoBack()
) {
router.back();
return;
}

router.replace({  
    pathname:  
      "/(customer)/orders",  

    params: {  
      category:  
        "service",  
    },  
  } as never);  
}, []);

useFocusEffect(
useCallback(() => {
const subscription =
BackHandler.addEventListener(
"hardwareBackPress",
() => {
handleBack();
return true;
},
);

return () => {  
    subscription.remove();  
  };  
}, [  
  handleBack,  
]),

);

/* ============================================================
WORKER PROFILE
============================================================ */

const handleWorkerProfile =
useCallback(() => {
const workerId =
booking?.workerId?.trim() ??
"";

if (!workerId) {  
    showErrorToast(  
      "Worker unavailable",  
      "Worker profile is not available.",  
    );  

    return;  
  }  

  router.push({  
    pathname:  
      "/(customer)/details/worker-profile/[id]",  

    params: {  
      id: workerId,  
    },  
  } as never);  
}, [  
  booking?.workerId,  
]);


/* ============================================================
REQUEST AGAIN
============================================================ */

const handleRequestAgain = useCallback(() => {
  if (!booking || !customerId) {
    showErrorToast(
      "Request unavailable",
      "Please sign in and try again.",
    );
    return;
  }

  const workerId = booking.workerId?.trim();
  const workerName = booking.workerName?.trim();
  const serviceId = booking.serviceId?.trim();
  const serviceName = booking.serviceName?.trim();

  if (!workerId || !serviceId || !serviceName) {
    showErrorToast(
      "Request unavailable",
      "The original worker or service information is missing.",
    );
    return;
  }

  router.push({
    pathname: "/(customer)/booking",
    params: {
      workerId,
      workerName: workerName || "Worker",
      workerPhoto: booking.workerPhoto || "",
      workerCategory: booking.workerCategory || "",
      serviceId,
      serviceName,
     serviceIcon: booking.serviceIcon || "",
      categoryId: booking.categoryId || "",
      fulfillmentMode: booking.fulfillmentMode,
    },
  } as never);
}, [booking, customerId]);

/* ============================================================
REVIEW
============================================================ */

const handleRateWorker =
useCallback(() => {
if (!reviewPrompt) {
return;
}

const workerId =  
    reviewPrompt.workerId.trim();  

  const bookingId =  
    reviewPrompt.bookingId.trim();  

  if (  
    !workerId ||  
    !bookingId  
  ) {  
    dismissReviewPrompt();  

    showErrorToast(  
      "Review unavailable",  
      "We could not open this worker review.",  
    );  

    return;  
  }  

  dismissReviewPrompt();  

  router.push({  
    pathname:  
      "/(customer)/details/worker-profile/[id]",  

    params: {  
      id: workerId,  
      bookingId,  
      reviewMode:  
        "service",  
    },  
  } as never);  
}, [  
  dismissReviewPrompt,  
  reviewPrompt,  
]);

useEffect(() => {
if (!reviewPrompt) {
return;
}

const workerName =  
  reviewPrompt.workerName?.trim() ||  
  "this worker";  

Alert.alert(  
  "How was your experience?",  
  `How do you feel about ${workerName}'s service?`,  
  [  
    {  
      text: "Not now",  
      style: "cancel",  
      onPress:  
        dismissReviewPrompt,  
    },  
    {  
      text: "Rate worker",  
      onPress:  
        handleRateWorker,  
    },  
  ],  
  {  
    cancelable: true,  
    onDismiss:  
      dismissReviewPrompt,  
  },  
);

}, [
dismissReviewPrompt,
handleRateWorker,
reviewPrompt,
]);

/* ============================================================
VOICE CALL
============================================================ */

const handleFixxamVoiceCall =
useCallback(() => {
if (!auth.currentUser) {
showErrorToast(
"Sign in required",
"Please sign in again before starting a call.",
);

return;  
  }  

  const workerId =  
    booking?.workerId?.trim() ??  
    "";  

  if (!workerId) {  
    showErrorToast(  
      "Worker unavailable",  
      "This worker could not be identified for the call.",  
    );  

    return;  
  }  

  const workerName =  
    booking?.workerName?.trim() ||  
    "Worker";  

  router.push({  
    pathname:  
      "/(customer)/call/[workerId]",  

    params: {  
      workerId,  
      name: workerName,  
    },  
  } as never);  
}, [  
  booking?.workerId,  
  booking?.workerName,  
]);

/* ============================================================
SERVICE LOCATION
============================================================ */

const handleMap =
useCallback(() => {
if (!booking) {
return;
}

if (isRemoteBooking) {  
    showInfoToast(  
      "Remote service",  
      "This service does not require a physical location.",  
    );  

    return;  
  }  

  if (  
    !hasValidCoordinates(  
      booking.latitude,  
      booking.longitude,  
    )  
  ) {  
    showErrorToast(  
      "Location unavailable",  
      booking.fulfillmentMode ===  
        "customer_visits_worker"  
        ? "The worker's service location is unavailable."  
        : "Your service location is unavailable.",  
    );  

    return;  
  }  

  router.push({  
    pathname:  
      "/(customer)/map",  

    params: {  
      mode: "view",  

      fulfillmentMode:  
        booking.fulfillmentMode,  

      latitude: String(  
        booking.latitude,  
      ),  

      longitude: String(  
        booking.longitude,  
      ),  

      address:  
        booking.address,  

      orderId:  
        booking.id.trim(),  

      workerId:  
        booking.workerId.trim(),  

      workerName:  
        booking.workerName.trim() ||  
        "Worker",  
    },  
  } as never);  
}, [  
  booking,  
  isRemoteBooking,  
]);

/* ============================================================
LIVE TRACKING
============================================================ */

const handleLiveMap =
useCallback(() => {
if (!booking) {
showErrorToast(
"Order unavailable",
"This order could not be loaded for live tracking.",
);

return;  
  }  

  if (isRemoteBooking) {  
    showInfoToast(  
      "Live tracking unavailable",  
      "Remote services do not require live location tracking.",  
    );  

    return;  
  }  

  if (!workerTravels) {  
    showInfoToast(  
      "Live tracking not required",  
      "You are travelling to the worker. Open the map and use Get Directions instead.",  
    );  

    return;  
  }  

  if (!trackingActive) {  
    showInfoToast(  
      "Live tracking unavailable",  
      "Live tracking becomes available after the offer is accepted.",  
    );  

    return;  
  }  

  if (  
    !hasValidCoordinates(  
      booking.latitude,  
      booking.longitude,  
    )  
  ) {  
    showErrorToast(  
      "Service location unavailable",  
      "Your service location does not have valid map coordinates.",  
    );  

    return;  
  }  

  const currentOrderId =  
    booking.id.trim();  

  const workerId =  
    booking.workerId.trim();  

  if (!currentOrderId) {  
    showErrorToast(  
      "Order unavailable",  
      "This order could not be identified for live tracking.",  
    );  

    return;  
  }  

  if (!workerId) {  
    showErrorToast(  
      "Worker unavailable",  
      "This worker could not be identified for live tracking.",  
    );  

    return;  
  }  

  if (!workerLiveLocation) {  
    showInfoToast(  
      "Waiting for worker location",  
      "The worker has not started sharing a live location yet.",  
    );  

    return;  
  }  

  if (  
    workerLiveLocation.userId &&  
    workerLiveLocation.userId !==  
      workerId  
  ) {  
    showErrorToast(  
      "Live location unavailable",  
      "The worker's live location could not be verified.",  
    );  

    return;  
  }  

  router.push({  
    pathname:  
      "/(customer)/map",  

    params: {  
      mode: "live",  

      fulfillmentMode:  
        booking.fulfillmentMode,  

      latitude: String(  
        booking.latitude,  
      ),  

      longitude: String(  
        booking.longitude,  
      ),  

      address:  
        booking.address,  

      orderId:  
        currentOrderId,  

      workerId,  

      workerName:  
        booking.workerName.trim() ||  
        "Worker",  
    },  
  } as never);  
}, [  
  booking,  
  isRemoteBooking,  
  workerLiveLocation,  
  workerTravels,  
  trackingActive,  
]);

/* ============================================================
HELP
============================================================ */

const handleServiceHelp =
useCallback(() => {
showInfoToast(
"Need help?",
"If there is a problem with the service, contact Fixxam support before confirming.",
);
}, []);

/* ============================================================
AUTHENTICATION
============================================================ */

if (!auth.currentUser) {
return (
<AppScreen
role="customer"
contentContainerStyle={
styles.screen
}
>
<StateMessage  
icon="lock"  
title="Sign in required"  
message="Please sign in to view this order."  
/>
</AppScreen>
);
}

/* ============================================================
LOADING
============================================================ */

if (loading) {
return (
<AppScreen
role="customer"
contentContainerStyle={
styles.screen
}
>
<View
style={
styles.center
}
>
<View
style={
styles.loadingIcon
}
>
<ActivityIndicator
size="small"
color={
CustomerColors.primary
}
/>
</View>

<AppText  
        variant="caption"  
        tone="secondary"  
        style={  
          styles.loadingText  
        }  
      >  
        Loading order...  
      </AppText>  
    </View>  
  </AppScreen>  
);

}

/* ============================================================
ERROR
============================================================ */

if (
error ||
!booking
) {
return (
<AppScreen
role="customer"
contentContainerStyle={
styles.screen
}
>
<StateMessage
icon="error"
iconColor={
Colors.error
}
title="Order unavailable"
message={
error ||
"We could not find this order."
}
/>
</AppScreen>
);
}

/* ============================================================
DERIVED UI STATE
============================================================ */

const agreedPrice =
booking.status !==
"pending" &&
typeof booking.agreedPrice ===
"number" &&
Number.isFinite(
booking.agreedPrice,
) &&
booking.agreedPrice > 0
? booking.agreedPrice
: null;

const verifiedWorkerLiveLocation =
Boolean(
workerLiveLocation &&
(
!workerLiveLocation.userId ||
workerLiveLocation.userId ===
booking.workerId
),
);

const liveTrackingAvailable =
workerTravels &&
trackingActive &&
verifiedWorkerLiveLocation;


const showWaitingForWorkerToStart =
  booking.status === "in-progress" &&
  Boolean(booking.customerStartedConfirmedAt);

const showStartedConfirmation =
  booking.status === "awaiting_start_confirmation" ||
  (
    booking.status === "accepted" &&
    booking.startConfirmationRequestedAt != null
  );

const showServiceCompleted =
  booking.status === "completed";


  const showCompletedConfirmation =
  booking.status ===
    "awaiting_completion_confirmation" &&
  booking.workerMarkedCompletedAt != null;


/*

Initial worker offer is active only while

the booking remains pending and the offer

itself is marked as sent.
*/
const negotiationActive =
booking.status ===
"pending" &&
booking.offerStatus ===
"sent";


/*

Counter negotiation is independent of

the original 24-hour expiry.
*/
const hasActiveCounter =
booking.status ===
"pending" &&
booking.counterOfferStatus ===
"sent";


/*

Backend-authoritative expired state.

The backend changes:

status = cancelled

cancellationReason = offer_expired

cancelledBy = system
*/
const offerExpired =
booking.status ===
"cancelled" &&
booking.cancellationReason ===
"offer_expired";


/*

The countdown is ONLY for the initial

worker offer.

It disappears immediately when a counter

offer becomes active.
*/
const showExpiryTimer =
Boolean(
offerExpiresAt !==
null &&
!orderExpired &&
!offerExpired &&
negotiationActive &&
!hasActiveCounter,
);


/*

Customer can manually cancel a pending

booking only when there is no active offer

or negotiation.
*/
const canCancelOrder =
booking.status ===
"pending" &&
!negotiationActive;


const canCallWorker =
booking.workerId.trim()
.length > 0;

/* ============================================================
RENDER
============================================================ */

return (
<AppScreen
role="customer"
contentContainerStyle={
styles.screen
}
>
<ScrollView
showsVerticalScrollIndicator={
false
}
keyboardShouldPersistTaps="handled"
keyboardDismissMode="on-drag"
contentContainerStyle={
styles.scrollContent
}
>
<CustomerOrderHeader
orderId={
booking.id
}
status={
booking.status
}
onBack={
handleBack
}
/>

<View  
      style={  
        styles.content  
      }  
    >  
      <CustomerOrderRequest  
        workerName={  
          booking.workerName  
        }  
        workerPhoto={  
          booking.workerPhoto  
        }  
        workerCategory={  
          booking.workerCategory  
        }  
        serviceName={  
          booking.serviceName  
        }  
        serviceIcon={  
          booking.serviceIcon  
        }  
        fulfillmentMode={  
          booking.fulfillmentMode  
        }  
        description={  
          booking.description  
        }  
        photos={  
          booking.photos  
        }  
        address={  
          booking.address  
        }  
        hasCoordinates={  
          hasCoordinates  
        }  
        trackingActive={  
          trackingActive  
        }  
        liveTrackingAvailable={  
          liveTrackingAvailable  
        }  
        customerLiveSharingEnabled={  
          customerSharingEnabled  
        }  
        customerLiveSharingState={  
          customerLiveSharingState  
        }  
        customerLiveLocationTracking={  
          customerLiveLocationTracking  
        }  
        customerLiveSharingError={  
          customerSharingEligible  
            ? customerLiveSharingError  
            : null  
        }  
        customerLiveSharingBusy={  
          customerSharingBusy  
        }  
        onStartCustomerLiveSharing={  
          handleStartCustomerSharing  
        }  
        onStopCustomerLiveSharing={  
          handleStopCustomerSharing  
        }  
        bookingPriority={  
          booking.bookingPriority  
        }  
        timing={  
          booking.timing  
        }  
        bookingDate={  
          booking.bookingDate  
        }  
        bookingTime={  
          booking.bookingTime  
        }  
        urgent={  
          booking.urgent  
        }  
        date={  
          booking.date  
        }  
        time={  
          booking.time  
        }  
        onProfile={  
          handleWorkerProfile  
        }  
        onMap={  
          handleMap  
        }  
        onLiveTrack={  
          handleLiveMap  
        }  
      />  

      {agreedPrice !==  
        null && (  
        <AgreedPriceCard  
          amount={  
            agreedPrice  
          }  
        />  
      )}  


     {isOrderCancelled && !offerExpired && (
  <InactiveOrderCard
    onRequestAgain={handleRequestAgain}
  />
)}

      {/*  
       * Do not show active offer actions after  
       * the backend has cancelled the booking  
       * because the 24-hour window expired.  
       */}  
    {!isOrderCancelled && !offerExpired && (
  <CustomerOrderOfferSection
    bookingId={booking.id}
    offerStatus={booking.offerStatus}
    offerAmount={booking.offerAmount}
    offerMessage={booking.offerMessage}
    counterOfferAmount={booking.counterOfferAmount}
    counterOfferMessage={booking.counterOfferMessage}
    counterOfferBy={booking.counterOfferBy}
    counterOfferStatus={booking.counterOfferStatus}
    offerRound={booking.offerRound}
    workerName={booking.workerName}
    onAcceptOffer={handleAcceptOffer}
    onDeclineOffer={handleDeclineOffer}
  />
)}

      {showExpiryTimer && (  
        <OrderExpiryTimer  
          expiresAt={  
            offerExpiresAt  
          }  
          onExpired={  
            handleOrderExpired  
          }  
        />  
      )}  

      {offerExpired && (  
        <OfferExpiredCard />  
      )}  

     {/* Customer confirms that the worker has started */}
{showStartedConfirmation && (
  <ServiceConfirmationCard
    type="started"
    workerName={booking.workerName}
    confirmed={Boolean(
      booking.customerStartedConfirmedAt,
    )}
    onConfirm={handleConfirmServiceStarted}
    onHelp={handleServiceHelp}
  />
)}

{/* Customer has confirmed; service is in progress */}
{showWaitingForWorkerToStart && (
  <View style={styles.serviceWaitingCard}>
    <AppIcon
      name="clock"
      size="lg"
      color={CustomerColors.primary}
    />

    <AppText variant="body" weight="bold">
      Service in progress
    </AppText>

    <AppText
      variant="caption"
      tone="secondary"
      style={styles.serviceWaitingMessage}
    >
      You confirmed that the service has started.
      Please wait for the worker to finish the job.
    </AppText>
  </View>
)}

{/* Worker marked the job finished; customer must confirm */}
{showCompletedConfirmation && (
  <ServiceConfirmationCard
    type="completed"
    workerName={booking.workerName}
    confirmed={Boolean(
      booking.customerCompletedConfirmedAt,
    )}
    onConfirm={handleConfirmServiceCompleted}
    onHelp={handleServiceHelp}
  />
)}

{/* Final state after customer confirms completion */}
{showServiceCompleted && (
  <View style={styles.serviceWaitingCard}>
    <AppIcon
      name="check-circle"
      size="lg"
      color={CustomerColors.primary}
    />

    <AppText variant="body" weight="bold">
      Service Completed
    </AppText>

    <AppText
      variant="caption"
      tone="secondary"
      style={styles.serviceWaitingMessage}
    >
      You have confirmed that {booking.workerName}
      {" "}has completed the service.
    </AppText>
  </View>
)}

     {!isOrderCancelled && (

<CustomerOrderActions  
onCall={handleFixxamVoiceCall}  
onCancel={handleCancel}  
callDisabled={!canCallWorker}  
cancelDisabled={!canCancelOrder}  
/>
)}
</View>
</ScrollView>
</AppScreen>
);
}

/* ==============================================================
OFFER EXPIRED CARD
============================================================== */

function OfferExpiredCard() {
return (
<View
style={
styles.expiredCard
}
>
<View
style={
styles.expiredIcon
}
>
<AppIcon
name="error"
size="md"
color={
Colors.error
}
/>
</View>

<View  
    style={  
      styles.expiredContent  
    }  
  >  
    <AppText  
      variant="body"  
      weight="bold"  
      style={  
        styles.expiredTitle  
      }  
    >  
      Offer expired  
    </AppText>  

    <AppText  
      variant="caption"  
      tone="secondary"  
      style={  
        styles.expiredMessage  
      }  
    >  
      The 24-hour response window  
      ended before the offer was  
      accepted. This order has  
      been cancelled.  
    </AppText>  
  </View>  
</View>

);
}

function InactiveOrderCard({
  onRequestAgain,
}: {
  onRequestAgain: () => void;
}) {
  return (
    <View style={styles.inactiveCard}>
      <View style={styles.inactiveIcon}>
        <AppIcon
          name="error"
          size="lg"
          color={Colors.error}
        />
      </View>

      <AppText
        variant="heading3"
        weight="bold"
        center
        style={styles.inactiveTitle}
      >
        This order is no longer active
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        center
        style={styles.inactiveMessage}
      >
        This order has been cancelled. You can request this service again.
      </AppText>

      <Pressable
        accessibilityRole="button"
        onPress={onRequestAgain}
        style={styles.requestAgainButton}
      >
        <AppText
          variant="body"
          weight="bold"
          style={styles.requestAgainText}
        >
          Request Again
        </AppText>
      </Pressable>
    </View>
  );
}

/* ==============================================================
STATE MESSAGE
============================================================== */

function StateMessage({
icon,
iconColor = Colors.textMuted,
title,
message,
}: {
icon:
| "lock"
| "error";
iconColor?: string;
title: string;
message: string;
}) {
return (
<View
style={
styles.stateContainer
}
>
<View
style={
styles.stateIcon
}
>
<AppIcon  
name={icon}  
size="lg"  
color={iconColor}  
/>
</View>

<AppText  
    variant="heading3"  
    weight="bold"  
    center  
    style={  
      styles.stateTitle  
    }  
  >  
    {title}  
  </AppText>  

  <AppText  
    variant="body"  
    tone="secondary"  
    center  
    style={  
      styles.stateMessage  
    }  
  >  
    {message}  
  </AppText>  
</View>

);
}

/* ==============================================================
STYLES
============================================================== */

const styles =
StyleSheet.create({
screen: {
flex: 1,
width: "100%",
padding: 0,
backgroundColor:
Colors.background,
},

scrollContent: {  
  width: "100%",  
  paddingBottom:  
    FixxamTokens.spacing.lg,  
},  

content: {  
  width: "100%",  
  paddingHorizontal:  
    FixxamTokens.spacing.md,  
  paddingTop:  
    FixxamTokens.spacing.sm,  
  paddingBottom:  
    FixxamTokens.spacing.md,  

  gap:  
    FixxamTokens.spacing.sm,  
},  

center: {  
  flex: 1,  
  alignItems:  
    "center",  
  justifyContent:  
    "center",  
  paddingHorizontal:  
    FixxamTokens.spacing.xl,  
},  

loadingIcon: {  
  width: 44,  
  height: 44,  
  alignItems:  
    "center",  
  justifyContent:  
    "center",  
  borderRadius:  
    FixxamTokens.radius.full,  
  backgroundColor:  
    CustomerColors.primarySoft,  
},  

loadingText: {  
  marginTop:  
    FixxamTokens.spacing.sm,  
  color:  
    Colors.textSecondary,  
},  

/* ==========================================================  
   EXPIRED OFFER  
========================================================== */  

expiredCard: {  
  width: "100%",  
  flexDirection:  
    "row",  
  alignItems:  
    "flex-start",  
  padding:  
    FixxamTokens.spacing.md,  
  borderRadius:  
    FixxamTokens.radius.lg,  
  backgroundColor:  
    Colors.disabledBackground,  
  borderWidth: 1,  
  borderColor:  
    Colors.error,  
},  

expiredIcon: {  
  width: 40,  
  height: 40,  
  alignItems:  
    "center",  
  justifyContent:  
    "center",  
  borderRadius:  
    FixxamTokens.radius.full,  
  backgroundColor:  
    Colors.background,  
},  

expiredContent: {  
  flex: 1,  
  marginLeft:  
    FixxamTokens.spacing.sm,  
},  

expiredTitle: {  
  color:  
    Colors.error,  
},  

expiredMessage: {  
  marginTop:  
    FixxamTokens.spacing.xs,  
  lineHeight: 18,  
  color:  
    Colors.textSecondary,  
},  

/* ==========================================================  
   STATE  
========================================================== */  

stateContainer: {  
  flex: 1,  
  alignItems:  
    "center",  
  justifyContent:  
    "center",  
  paddingHorizontal:  
    FixxamTokens.spacing.xl,  
  paddingVertical:  
    FixxamTokens.spacing.xl,  
},  

stateIcon: {  
  width: 56,  
  height: 56,  
  alignItems:  
    "center",  
  justifyContent:  
    "center",  
  borderRadius:  
    FixxamTokens.radius.xl,  
  backgroundColor:  
    Colors.disabledBackground,  
},  

stateTitle: {  
  marginTop:  
    FixxamTokens.spacing.md,  
  color:  
    Colors.textPrimary,  
},  

stateMessage: {  
  maxWidth: 310,  
  marginTop:  
    FixxamTokens.spacing.xs,  
  lineHeight: 19,  
  color:  
    Colors.textSecondary,  
},

inactiveCard: {
  width: "100%",
  alignItems: "center",
  padding: FixxamTokens.spacing.lg,
  borderRadius: FixxamTokens.radius.lg,
  backgroundColor: Colors.background,
  borderWidth: 1,
  borderColor: Colors.border,
  gap: FixxamTokens.spacing.sm,
},

inactiveIcon: {
  width: 52,
  height: 52,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: FixxamTokens.radius.full,
  backgroundColor: Colors.disabledBackground,
},

inactiveTitle: {
  color: Colors.textPrimary,
},

inactiveMessage: {
  lineHeight: 20,
  color: Colors.textSecondary,
},

requestAgainButton: {
  width: "100%",
  minHeight: 48,
  alignItems: "center",
  justifyContent: "center",
  marginTop: FixxamTokens.spacing.xs,
  paddingHorizontal: FixxamTokens.spacing.md,
  borderRadius: FixxamTokens.radius.md,
  backgroundColor: CustomerColors.primary,
},

requestAgainText: {
  color: "#FFFFFF",
},

serviceWaitingCard: {
  width: "100%",
  alignItems: "center",
  padding: FixxamTokens.spacing.md,
  gap: FixxamTokens.spacing.sm,
  borderRadius: FixxamTokens.radius.lg,
  backgroundColor: CustomerColors.primarySoft,
  borderWidth: 1,
  borderColor: CustomerColors.primary,
},

serviceWaitingMessage: {
  textAlign: "center",
  lineHeight: 19,
  color: Colors.textSecondary,
},

});