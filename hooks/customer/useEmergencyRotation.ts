import {
  useEffect,
  useState,
} from "react";

import {
  EMERGENCY_SERVICES,
  type EmergencyService,
} from "@/constants/emergencyServices";

import {
  getEmergencyLoginIndex,
} from "@/utils/emergencyRotation";

export default function useEmergencyRotation() {
  const [
    service,
    setService,
  ] = useState<EmergencyService | null>(null);

  const [
    visible,
    setVisible,
  ] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadEmergency = async () => {
      try {
        if (
          EMERGENCY_SERVICES.length === 0
        ) {
          return;
        }

        const index =
          await getEmergencyLoginIndex();

        const selected =
          EMERGENCY_SERVICES[index];

        if (
          !mounted ||
          !selected
        ) {
          return;
        }

        setService(selected);
        setVisible(true);
      } catch (error) {
        console.warn(
          "[EmergencyRotation] Failed to load emergency:",
          error,
        );

        if (!mounted) {
          return;
        }

        const fallback =
          EMERGENCY_SERVICES[0];

        if (!fallback) {
          return;
        }

        setService(fallback);
        setVisible(true);
      }
    };

    void loadEmergency();

    return () => {
      mounted = false;
    };
  }, []);

  const close = () => {
    setVisible(false);
  };

  return {
    service,
    visible,
    close,
  };
}