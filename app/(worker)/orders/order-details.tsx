import React, {
  memo,
  useCallback,
} from "react";

import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

/* ==============================================================
   TYPES
============================================================== */

type DemoWorkerOrder = {
  id: string;

  customerName: string;

  customerLocation: string;

  customerAddress: string;

  serviceName: string;

  description: string;

  timing: "asap" | "schedule";

  date?: string;

  time?: string;

  photos: number;

  offerAmount: number;

  offerMessage: string;
};

/* ==============================================================
   DEMO DATA
============================================================== */

const DEMO_ORDER: DemoWorkerOrder = {
  id: "FX-82A91",

  customerName:
    "Abdullahi Musa",

  customerLocation:
    "Kaduna, Nigeria",

  customerAddress:
    "Tudun Wada, Kaduna South",

  serviceName:
    "Building Consultation",

  description:
    "I need help with the consultation and planning of my 2 bedroom building project.",

  timing:
    "asap",

  photos: 3,

  offerAmount:
    25000,

  offerMessage:
    "I can help you with the consultation and planning. This offer includes site visit and detailed building guidance.",
};

/* ==============================================================
   SCREEN
============================================================== */

export default function WorkerOrderDetailsScreen() {
  const {
    orderId,
    customerName,
    serviceName,
  } =
    useLocalSearchParams<{
      orderId?: string;

      customerName?: string;

      serviceName?: string;
    }>();

  const order: DemoWorkerOrder = {
    ...DEMO_ORDER,

    id:
      orderId?.trim() ||
      DEMO_ORDER.id,

    customerName:
      customerName?.trim() ||
      DEMO_ORDER.customerName,

    serviceName:
      serviceName?.trim() ||
      DEMO_ORDER.serviceName,
  };

  /* ============================================================
     BACK
  ============================================================ */

  const handleBack =
    useCallback(() => {
      router.back();
    }, []);

  /* ============================================================
     CUSTOMER PROFILE
  ============================================================ */

  const handleCustomerProfile =
    useCallback(() => {
      Alert.alert(
        "Demo",
        "Customer profile will be connected later.",
      );
    }, []);

  /* ============================================================
     MAP
  ============================================================ */

  const handleMap =
    useCallback(() => {
      Alert.alert(
        "Demo",
        "Map navigation will be connected later.",
      );
    }, []);

  /* ============================================================
     WITHDRAW OFFER
  ============================================================ */

  const handleWithdraw =
    useCallback(() => {
      Alert.alert(
        "Withdraw Offer",
        "This is a demo. Withdraw logic will be connected later.",
      );
    }, []);

  return (
    <AppScreen
      contentContainerStyle={
        styles.screen
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <View
          style={styles.header}
        >
          <Pressable
            onPress={
              handleBack
            }
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [
              styles.backButton,

              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="chevron-back"
              size={21}
              color="#0F172A"
            />
          </Pressable>

          <AppText
            weight="bold"
            style={
              styles.headerTitle
            }
          >
            Order Details
          </AppText>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Order options"
            style={
              styles.moreButton
            }
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={21}
              color="#0F172A"
            />
          </Pressable>
        </View>

        {/* ====================================================
            ORDER META
        ==================================================== */}

        <View
          style={
            styles.orderMeta
          }
        >
          <AppText
            style={
              styles.orderLabel
            }
          >
            ORDER ID
          </AppText>

          <View
            style={
              styles.orderIdRow
            }
          >
            <AppText
              weight="bold"
              style={
                styles.orderId
              }
            >
              #{order.id}
            </AppText>

            <Ionicons
              name="copy-outline"
              size={16}
              color="#64748B"
            />
          </View>

          <AppText
            style={
              styles.requestedDate
            }
          >
            Requested on May 24, 2025
            {" • "}
            10:30 AM
          </AppText>
        </View>

        {/* ====================================================
            OFFER STATUS
        ==================================================== */}

        <OfferSentStatusCard />

        {/* ====================================================
            1. CUSTOMER
        ==================================================== */}

        <SectionTitle
          number="1"
          title="Customer"
        />

        <CustomerCard
          name={
            order.customerName
          }
          onProfile={
            handleCustomerProfile
          }
        />

        {/* ====================================================
            2. SERVICE
        ==================================================== */}

        <SectionTitle
          number="2"
          title="Service"
        />

        <ServiceCard
          serviceName={
            order.serviceName
          }
        />

        {/* ====================================================
            3. REQUEST
        ==================================================== */}

        <SectionTitle
          number="3"
          title="Customer Request"
        />

        <RequestCard
          description={
            order.description
          }
        />

        {/* ====================================================
            4. PHOTOS
        ==================================================== */}

        {order.photos > 0 && (
          <>
            <SectionTitle
              number="4"
              title="Photos"
            />

            <PhotosCard
              count={
                order.photos
              }
            />
          </>
        )}

        {/* ====================================================
            5. LOCATION
        ==================================================== */}

        <SectionTitle
          number="5"
          title="Service Location"
        />

        <LocationCard
          location={
            order.customerLocation
          }
          address={
            order.customerAddress
          }
          onMap={
            handleMap
          }
        />

        {/* ====================================================
            6. WHEN
        ==================================================== */}

        <SectionTitle
          number="6"
          title="When"
        />

        <WhenCard
          timing={
            order.timing
          }
          date={
            order.date
          }
          time={
            order.time
          }
        />

        {/* ====================================================
            7. YOUR OFFER
        ==================================================== */}

        <SectionTitle
          number="7"
          title="Your Offer"
        />

        <YourOfferCard
          amount={
            order.offerAmount
          }
          message={
            order.offerMessage
          }
        />

        {/* ====================================================
            WAITING
        ==================================================== */}

        <WaitingCustomerCard />

        {/* ====================================================
            ACTIONS
        ==================================================== */}

        <View
          style={
            styles.actions
          }
        >
          <Pressable
            onPress={
              handleWithdraw
            }
            accessibilityRole="button"
            accessibilityLabel="Withdraw offer"
            style={({ pressed }) => [
              styles.withdrawButton,

              pressed &&
                styles.buttonPressed,
            ]}
          >
            <View
              style={
                styles.withdrawIcon
              }
            >
              <Ionicons
                name="close-circle-outline"
                size={20}
                color="#DC2626"
              />
            </View>

            <AppText
              weight="bold"
              style={
                styles.withdrawText
              }
            >
              WITHDRAW OFFER
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

/* ==============================================================
   OFFER SENT STATUS
============================================================== */

const OfferSentStatusCard = memo(
  function OfferSentStatusCard() {
    return (
      <View
        style={[
          styles.statusCard,
          styles.offerSentCard,
        ]}
      >
        <View
          style={
            styles.statusIcon
          }
        >
          <Ionicons
            name="paper-plane-outline"
            size={25}
            color="#2563EB"
          />
        </View>

        <View
          style={
            styles.statusContent
          }
        >
          <AppText
            weight="bold"
            style={
              styles.offerSentTitle
            }
          >
            OFFER SENT
          </AppText>

          <AppText
            style={
              styles.statusText
            }
          >
            Your offer has been sent.
            Waiting for the customer
            to respond.
          </AppText>
        </View>

        <Ionicons
          name="time-outline"
          size={38}
          color="#2563EB"
        />
      </View>
    );
  },
);

/* ==============================================================
   CUSTOMER
============================================================== */

const CustomerCard = memo(
  function CustomerCard({
    name,
    onProfile,
  }: {
    name: string;

    onProfile: () => void;
  }) {
    return (
      <View
        style={
          styles.customerCard
        }
      >
        <View
          style={
            styles.customerAvatar
          }
        >
          <Ionicons
            name="person"
            size={27}
            color="#94A3B8"
          />
        </View>

        <View
          style={
            styles.customerDetails
          }
        >
          <AppText
            weight="bold"
            style={
              styles.customerName
            }
          >
            {name}
          </AppText>

          <AppText
            style={
              styles.customerLabel
            }
          >
            Customer
          </AppText>

          <View
            style={
              styles.customerRow
            }
          >
            <View
              style={
                styles.customerDot
              }
            />

            <AppText
              style={
                styles.customerAvailable
              }
            >
              Request received
            </AppText>
          </View>
        </View>

        <Pressable
          onPress={
            onProfile
          }
          accessibilityRole="button"
          accessibilityLabel="View customer profile"
          style={
            styles.profileButton
          }
        >
          <AppText
            weight="bold"
            style={
              styles.profileText
            }
          >
            VIEW
          </AppText>

          <Ionicons
            name="arrow-forward"
            size={14}
            color="#2563EB"
          />
        </Pressable>
      </View>
    );
  },
);

/* ==============================================================
   SERVICE
============================================================== */

const ServiceCard = memo(
  function ServiceCard({
    serviceName,
  }: {
    serviceName: string;
  }) {
    return (
      <View
        style={
          styles.simpleCard
        }
      >
        <View
          style={
            styles.smallIcon
          }
        >
          <Ionicons
            name="construct-outline"
            size={24}
            color="#2563EB"
          />
        </View>

        <AppText
          weight="bold"
          numberOfLines={1}
          style={
            styles.simpleCardText
          }
        >
          {serviceName}
        </AppText>
      </View>
    );
  },
);

/* ==============================================================
   REQUEST
============================================================== */

const RequestCard = memo(
  function RequestCard({
    description,
  }: {
    description: string;
  }) {
    return (
      <View
        style={
          styles.simpleCard
        }
      >
        <View
          style={
            styles.smallIcon
          }
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={23}
            color="#2563EB"
          />
        </View>

        <AppText
          style={
            styles.requestDescription
          }
        >
          {description}
        </AppText>
      </View>
    );
  },
);

/* ==============================================================
   PHOTOS
============================================================== */

const PhotosCard = memo(
  function PhotosCard({
    count,
  }: {
    count: number;
  }) {
    return (
      <View
        style={
          styles.photosCard
        }
      >
        {Array.from({
          length: count,
        }).map(
          (_, index) => (
            <View
              key={index}
              style={
                styles.photoPlaceholder
              }
            >
              <Ionicons
                name="image-outline"
                size={30}
                color="#94A3B8"
              />
            </View>
          ),
        )}
      </View>
    );
  },
);

/* ==============================================================
   LOCATION
============================================================== */

const LocationCard = memo(
  function LocationCard({
    location,
    address,
    onMap,
  }: {
    location: string;

    address: string;

    onMap: () => void;
  }) {
    return (
      <View
        style={
          styles.locationCard
        }
      >
        <View
          style={
            styles.smallIcon
          }
        >
          <Ionicons
            name="location-outline"
            size={23}
            color="#2563EB"
          />
        </View>

        <View
          style={
            styles.locationContent
          }
        >
          <AppText
            weight="bold"
            style={
              styles.locationTitle
            }
          >
            {location}
          </AppText>

          <AppText
            style={
              styles.addressText
            }
          >
            {address}
          </AppText>
        </View>

        <Pressable
          onPress={
            onMap
          }
          accessibilityRole="button"
          accessibilityLabel="View service location on map"
          style={
            styles.mapButton
          }
        >
          <AppText
            weight="bold"
            style={
              styles.mapText
            }
          >
            VIEW MAP
          </AppText>

          <Ionicons
            name="arrow-forward"
            size={14}
            color="#2563EB"
          />
        </Pressable>
      </View>
    );
  },
);

/* ==============================================================
   WHEN
============================================================== */

const WhenCard = memo(
  function WhenCard({
    timing,
    date,
    time,
  }: {
    timing: "asap" | "schedule";

    date?: string;

    time?: string;
  }) {
    return (
      <View
        style={
          styles.simpleCard
        }
      >
        <View
          style={
            styles.smallIcon
          }
        >
          <Ionicons
            name="calendar-outline"
            size={23}
            color="#2563EB"
          />
        </View>

        <View
          style={
            styles.whenContent
          }
        >
          <AppText
            weight="bold"
            style={
              styles.whenTitle
            }
          >
            {timing ===
            "asap"
              ? "ASAP"
              : date}
          </AppText>

          <AppText
            style={
              styles.whenSubtitle
            }
          >
            {timing ===
            "asap"
              ? "As soon as possible"
              : time}
          </AppText>
        </View>
      </View>
    );
  },
);

/* ==============================================================
   YOUR OFFER
============================================================== */

const YourOfferCard = memo(
  function YourOfferCard({
    amount,
    message,
  }: {
    amount: number;

    message: string;
  }) {
    return (
      <View
        style={
          styles.offerCard
        }
      >
        <View
          style={
            styles.offerTop
          }
        >
          <View
            style={
              styles.offerMoneyIcon
            }
          >
            <AppText
              weight="bold"
              style={
                styles.naira
              }
            >
              ₦
            </AppText>
          </View>

          <View
            style={
              styles.offerDetails
            }
          >
            <AppText
              style={
                styles.offerLabel
              }
            >
              YOUR OFFER
            </AppText>

            <AppText
              weight="bold"
              style={
                styles.offerAmount
              }
            >
              ₦
              {amount.toLocaleString(
                "en-NG",
              )}
            </AppText>

            <AppText
              style={
                styles.offerMessageLabel
              }
            >
              MESSAGE
            </AppText>

            <AppText
              style={
                styles.offerMessage
              }
            >
              {message}
            </AppText>

            <AppText
              style={
                styles.offerDate
              }
            >
              Offer sent on May 24,
              2025 • 02:45 PM
            </AppText>
          </View>
        </View>

        <View
          style={
            styles.sentBadge
          }
        >
          <Ionicons
            name="checkmark-circle"
            size={15}
            color="#15803D"
          />

          <AppText
            weight="bold"
            style={
              styles.sentBadgeText
            }
          >
            SENT TO CUSTOMER
          </AppText>
        </View>
      </View>
    );
  },
);

/* ==============================================================
   WAITING
============================================================== */

const WaitingCustomerCard = memo(
  function WaitingCustomerCard() {
    return (
      <View
        style={
          styles.waitingCard
        }
      >
        <View
          style={
            styles.waitingIcon
          }
        >
          <Ionicons
            name="time-outline"
            size={23}
            color="#D97706"
          />
        </View>

        <View
          style={
            styles.waitingContent
          }
        >
          <AppText
            weight="bold"
            style={
              styles.waitingTitle
            }
          >
            WAITING FOR CUSTOMER
          </AppText>

          <AppText
            style={
              styles.waitingText
            }
          >
            The customer will review
            your offer and decide
            whether to accept it.
          </AppText>
        </View>
      </View>
    );
  },
);

/* ==============================================================
   SECTION TITLE
============================================================== */

function SectionTitle({
  number,
  title,
}: {
  number: string;

  title: string;
}) {
  return (
    <View
      style={
        styles.sectionTitle
      }
    >
      <View
        style={
          styles.sectionNumber
        }
      >
        <AppText
          weight="bold"
          style={
            styles.sectionNumberText
          }
        >
          {number}
        </AppText>
      </View>

      <AppText
        weight="bold"
        style={
          styles.sectionText
        }
      >
        {title}
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
      backgroundColor:
        "#F8FAFC",
    },

    content: {
      paddingHorizontal: 16,
      paddingBottom: 40,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      height: 58,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      alignItems: "center",
      justifyContent: "center",
    },

    headerTitle: {
      fontSize: 18,
      color: "#0F172A",
    },

    moreButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      alignItems: "center",
      justifyContent: "center",
    },

    /* ========================================================
       ORDER META
    ======================================================== */

    orderMeta: {
      paddingTop: 9,
      paddingBottom: 14,
    },

    orderLabel: {
      fontSize: 9,
      letterSpacing: 0.8,
      color: "#64748B",
    },

    orderIdRow: {
      marginTop: 2,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    orderId: {
      fontSize: 20,
      color: "#0F172A",
    },

    requestedDate: {
      marginTop: 3,
      fontSize: 9.5,
      color: "#64748B",
    },

    /* ========================================================
       STATUS
    ======================================================== */

    statusCard: {
      width: "100%",
      minHeight: 106,
      padding: 14,
      borderRadius: 18,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
    },

    offerSentCard: {
      backgroundColor:
        "#EFF6FF",
      borderColor:
        "#BFDBFE",
    },

    statusIcon: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#DBEAFE",
      alignItems: "center",
      justifyContent: "center",
    },

    statusContent: {
      flex: 1,
      marginHorizontal: 12,
    },

    offerSentTitle: {
      fontSize: 12,
      color: "#1D4ED8",
    },

    statusText: {
      marginTop: 4,
      fontSize: 11,
      lineHeight: 17,
      color: "#64748B",
    },

    /* ========================================================
       SECTION
    ======================================================== */

    sectionTitle: {
      marginTop: 18,
      marginBottom: 8,
      flexDirection: "row",
      alignItems: "center",
    },

    sectionNumber: {
      width: 25,
      height: 25,
      borderRadius: 8,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },

    sectionNumberText: {
      fontSize: 11,
      color: "#2563EB",
    },

    sectionText: {
      fontSize: 14,
      color: "#0F172A",
    },

    /* ========================================================
       CUSTOMER
    ======================================================== */

    customerCard: {
      padding: 12,
      borderRadius: 17,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      flexDirection: "row",
      alignItems: "center",
    },

    customerAvatar: {
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor:
        "#E2E8F0",
      alignItems: "center",
      justifyContent: "center",
    },

    customerDetails: {
      flex: 1,
      minWidth: 0,
      marginLeft: 11,
      marginRight: 8,
    },

    customerName: {
      fontSize: 14,
      color: "#0F172A",
    },

    customerLabel: {
      marginTop: 2,
      fontSize: 10,
      color: "#64748B",
    },

    customerRow: {
      marginTop: 4,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    customerDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor:
        "#22C55E",
    },

    customerAvailable: {
      fontSize: 9.5,
      color: "#16A34A",
    },

    profileButton: {
      minWidth: 54,
      height: 34,
      paddingHorizontal: 8,
      borderRadius: 10,
      backgroundColor:
        "#F8FAFF",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },

    profileText: {
      fontSize: 8.5,
      color: "#2563EB",
    },

    /* ========================================================
       SIMPLE CARDS
    ======================================================== */

    simpleCard: {
      minHeight: 64,
      padding: 11,
      borderRadius: 16,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      flexDirection: "row",
      alignItems: "center",
    },

    smallIcon: {
      width: 43,
      height: 43,
      borderRadius: 13,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    simpleCardText: {
      flex: 1,
      marginLeft: 11,
      fontSize: 12.5,
      color: "#0F172A",
    },

    requestDescription: {
      flex: 1,
      marginLeft: 11,
      fontSize: 11,
      lineHeight: 17,
      color: "#334155",
    },

    /* ========================================================
       PHOTOS
    ======================================================== */

    photosCard: {
      padding: 8,
      borderRadius: 16,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      flexDirection: "row",
      gap: 7,
    },

    photoPlaceholder: {
      flex: 1,
      aspectRatio: 1.15,
      borderRadius: 12,
      backgroundColor:
        "#E2E8F0",
      alignItems: "center",
      justifyContent: "center",
    },

    /* ========================================================
       LOCATION
    ======================================================== */

    locationCard: {
      minHeight: 72,
      padding: 10,
      borderRadius: 16,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      flexDirection: "row",
      alignItems: "center",
    },

    locationContent: {
      flex: 1,
      marginLeft: 10,
      minWidth: 0,
    },

    locationTitle: {
      fontSize: 11.5,
      color: "#0F172A",
    },

    addressText: {
      marginTop: 3,
      fontSize: 9.5,
      color: "#64748B",
    },

    mapButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingLeft: 6,
    },

    mapText: {
      fontSize: 8.5,
      color: "#2563EB",
    },

    /* ========================================================
       WHEN
    ======================================================== */

    whenContent: {
      marginLeft: 11,
    },

    whenTitle: {
      fontSize: 12,
      color: "#0F172A",
    },

    whenSubtitle: {
      marginTop: 2,
      fontSize: 9.5,
      color: "#64748B",
    },

    /* ========================================================
       OFFER
    ======================================================== */

    offerCard: {
      padding: 12,
      borderRadius: 17,
      backgroundColor:
        "#FAF8FF",
      borderWidth: 1,
      borderColor:
        "#DDD6FE",
    },

    offerTop: {
      flexDirection: "row",
    },

    offerMoneyIcon: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor:
        "#EDE9FE",
      alignItems: "center",
      justifyContent: "center",
    },

    naira: {
      fontSize: 20,
      color: "#7C3AED",
    },

    offerDetails: {
      flex: 1,
      marginLeft: 11,
    },

    offerLabel: {
      fontSize: 8,
      letterSpacing: 0.5,
      color: "#64748B",
    },

    offerAmount: {
      marginTop: 1,
      fontSize: 22,
      color: "#0F172A",
    },

    offerMessageLabel: {
      marginTop: 8,
      fontSize: 8,
      letterSpacing: 0.5,
      color: "#64748B",
    },

    offerMessage: {
      marginTop: 3,
      fontSize: 10,
      lineHeight: 15,
      color: "#334155",
    },

    offerDate: {
      marginTop: 6,
      fontSize: 8.5,
      color: "#94A3B8",
    },

    sentBadge: {
      height: 36,
      marginTop: 12,
      borderRadius: 10,
      backgroundColor:
        "#F0FDF4",
      borderWidth: 1,
      borderColor:
        "#BBF7D0",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },

    sentBadgeText: {
      fontSize: 9,
      color: "#15803D",
    },

    /* ========================================================
       WAITING
    ======================================================== */

    waitingCard: {
      marginTop: 18,
      padding: 13,
      borderRadius: 17,
      backgroundColor:
        "#FFF9ED",
      borderWidth: 1,
      borderColor:
        "#F8DFA8",
      flexDirection: "row",
      alignItems: "center",
    },

    waitingIcon: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#FDE68A",
      alignItems: "center",
      justifyContent: "center",
    },

    waitingContent: {
      flex: 1,
      marginLeft: 11,
    },

    waitingTitle: {
      fontSize: 11,
      color: "#B45309",
    },

    waitingText: {
      marginTop: 3,
      fontSize: 10,
      lineHeight: 15,
      color: "#64748B",
    },

    /* ========================================================
       ACTIONS
    ======================================================== */

    actions: {
      marginTop: 20,
      width: "100%",
    },

    withdrawButton: {
      width: "100%",
      minHeight: 58,
      borderRadius: 16,
      backgroundColor: "#FFF7F7",
      borderWidth: 1,
      borderColor: "#FECACA",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    withdrawIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: "#FEE2E2",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 9,
    },

    withdrawText: {
      fontSize: 10,
      letterSpacing: 0.2,
      color: "#DC2626",
    },

    /* ========================================================
       PRESS
    ======================================================== */

    pressed: {
      opacity: 0.7,
      transform: [
        {
          scale: 0.97,
        },
      ],
    },

    buttonPressed: {
      opacity: 0.82,
      transform: [
        {
          scale: 0.985,
        },
      ],
    },
  });