export type EmergencyService = {
  id: string;
  title: string;
  description: string;
  phone: string;
  image: number;
};

export const EMERGENCY_SERVICES: EmergencyService[] = [
  {
    id: "ambulance",
    title: "Ambulance",
    description:
      "Need urgent medical assistance? Get help immediately.",
    phone: "",
    image: require("@/assets/images/emergency/ambulance.png"),
  },

  {
    id: "caterpillar",
    title: "Caterpillar",
    description:
      "Need heavy equipment assistance? Get help quickly.",
    phone: "",
    image: require("@/assets/images/emergency/caterpillar.png"),
  },

  {
    id: "fire-service",
    title: "Fire Service",
    description:
      "Fire emergency? Get immediate assistance.",
    phone: "",
    image: require("@/assets/images/emergency/fire-service.png"),
  },

  {
    id: "towing",
    title: "Towing",
    description:
      "Vehicle breakdown? Get towing assistance now.",
    phone: "",
    image: require("@/assets/images/emergency/towing.png"),
  },

  {
    id: "emergency",
    title: "Emergency",
    description:
      "Need urgent assistance? Get help immediately.",
    phone: "",
    image: require("@/assets/images/emergency/emergency.png"),
  },

  {
    id: "electrical",
    title: "Electrical",
    description:
      "Electrical emergency? Get professional help.",
    phone: "",
    image: require("@/assets/images/emergency/electrical.png"),
  },

  {
    id: "security",
    title: "Security",
    description:
      "Need urgent security assistance? Get help now.",
    phone: "",
    image: require("@/assets/images/emergency/security.png"),
  },

  {
    id: "tracking",
    title: "Tracking",
    description:
      "Need tracking assistance? Get support immediately.",
    phone: "",
    image: require("@/assets/images/emergency/tracking.png"),
  },
];