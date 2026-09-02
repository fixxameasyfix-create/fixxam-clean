import React, { memo } from "react";

import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";


import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppText,
} from "@/components/ui";

type Props = {
  workerName: string;
  workerPhoto?: string | null;
  workerCategory?: string | null;

  serviceName: string;
  serviceIcon?: string | null;

  description: string;
  photos: string[];

  address: string;
  hasCoordinates: boolean;

  urgent: boolean;
  date?: string | null;
  time?: string | null;

  onProfile: () => void;
  onMap: () => void;
};

function resolveIcon(
  value?: string | null,
): keyof typeof Ionicons.glyphMap {
  if (!value?.trim()) {
    return "construct-outline";
  }

  const icon =
    value.trim() as keyof typeof Ionicons.glyphMap;

  return icon in Ionicons.glyphMap
    ? icon
    : "construct-outline";
}

function SectionTitle({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <View style={styles.sectionTitle}>
      <View style={styles.sectionNumber}>
        <AppText
          weight="bold"
          style={styles.sectionNumberText}
        >
          {number}
        </AppText>
      </View>

      <AppText
        weight="bold"
        style={styles.sectionText}
      >
        {title}
      </AppText>
    </View>
  );
}

function CustomerOrderRequest({
  workerName,
  workerPhoto,
  workerCategory,
  serviceName,
  serviceIcon,
  description,
  photos,
  address,
  hasCoordinates,
  urgent,
  date,
  time,
  onProfile,
  onMap,
}: Props) {
  let sectionNumber = 1;

  return (
    <View>
      <SectionTitle
        number={`${sectionNumber++}`}
        title="Your worker"
      />

      <View style={styles.workerCard}>
        <View style={styles.avatar}>
          {workerPhoto ? (
            <Image
              source={{ uri: workerPhoto }}
              style={styles.avatarImage}
            />
          ) : (
            <Ionicons
              name="person"
              size={27}
              color="#94A3B8"
            />
          )}
        </View>

        <View style={styles.workerInfo}>
          <AppText
            weight="bold"
            numberOfLines={1}
            style={styles.workerName}
          >
            {workerName}
          </AppText>

          <AppText style={styles.workerCategory}>
            {workerCategory || "Service provider"}
          </AppText>
        </View>

        <Pressable
          onPress={onProfile}
          style={({ pressed }) => [
            styles.profileButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="person-outline"
            size={16}
            color="#2563EB"
          />
        </Pressable>
      </View>

      <SectionTitle
        number={`${sectionNumber++}`}
        title="Service"
      />

      <View style={styles.serviceCard}>
      
      <View style={styles.serviceIcon}>
  <MaterialCommunityIcons
    name={serviceIcon?.trim() as keyof typeof MaterialCommunityIcons.glyphMap}
    size={22}
    color="#2563EB"
  />
</View>

        <View style={styles.serviceInfo}>
          <AppText style={styles.smallLabel}>
            SERVICE
          </AppText>

          <AppText
            weight="bold"
            style={styles.serviceName}
          >
            {serviceName}
          </AppText>
        </View>
      </View>

      <SectionTitle
        number={`${sectionNumber++}`}
        title="Your request"
      />

      <View style={styles.requestCard}>
        <View style={styles.requestIcon}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={22}
            color="#2563EB"
          />
        </View>

        <AppText style={styles.description}>
          {description || "No description provided."}
        </AppText>
      </View>

      {photos.length > 0 && (
        <>
          <SectionTitle
            number={`${sectionNumber++}`}
            title="Photos"
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photos}
          >
            {photos.map((photo, index) => (
              <Image
                key={`${photo}-${index}`}
                source={{ uri: photo }}
                style={styles.photo}
              />
            ))}
          </ScrollView>
        </>
      )}

      <SectionTitle
        number={`${sectionNumber++}`}
        title="Service location"
      />

      <View style={styles.locationCard}>
        <View style={styles.locationIcon}>
          <Ionicons
            name="location-outline"
            size={23}
            color="#2563EB"
          />
        </View>

        <View style={styles.locationInfo}>
          <AppText
            weight="bold"
            style={styles.locationTitle}
          >
            {address}
          </AppText>

          <AppText style={styles.address}>
            {hasCoordinates
              ? "Location coordinates available"
              : "Address only"}
          </AppText>
        </View>

        <Pressable
          onPress={onMap}
          style={({ pressed }) => [
            styles.mapButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="map-outline"
            size={16}
            color="#2563EB"
          />
        </Pressable>
      </View>

      <SectionTitle
        number={`${sectionNumber}`}
        title="When"
      />

      <View style={styles.timingCard}>
        <View style={styles.timingIcon}>
          <Ionicons
            name="calendar-outline"
            size={22}
            color="#2563EB"
          />
        </View>

        <View style={styles.timingInfo}>
          <AppText
            weight="bold"
            style={styles.timingTitle}
          >
            {urgent
              ? "AS SOON AS POSSIBLE"
              : date || "Scheduled service"}
          </AppText>

          <AppText style={styles.timingSubtitle}>
            {urgent
              ? "The worker has been asked to respond as soon as possible."
              : time || "Scheduled time unavailable"}
          </AppText>
        </View>
      </View>
    </View>
  );
}

export default memo(CustomerOrderRequest);

const styles = StyleSheet.create({
  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 9,
  },

  sectionNumber: {
    width: 27,
    height: 27,
    borderRadius: 9,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  sectionNumberText: {
    fontSize: 12,
    color: "#2563EB",
  },

  sectionText: {
    fontSize: 15,
    color: "#0F172A",
  },

  workerCard: {
    minHeight: 78,
    padding: 11,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  workerInfo: {
    flex: 1,
    marginLeft: 11,
  },

  workerName: {
    fontSize: 14,
    color: "#0F172A",
  },

  workerCategory: {
    marginTop: 3,
    fontSize: 10,
    color: "#64748B",
  },

  profileButton: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  serviceCard: {
    minHeight: 70,
    padding: 11,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

 serviceIcon: {
  width: 40,
  height: 40,
  borderRadius: 12,
  backgroundColor: "#EFF6FF",
  alignItems: "center",
  justifyContent: "center",
},

  serviceInfo: {
    flex: 1,
    marginLeft: 11,
  },

  smallLabel: {
    fontSize: 8,
    letterSpacing: 1,
    color: "#94A3B8",
  },

  serviceName: {
    marginTop: 3,
    fontSize: 14,
    color: "#0F172A",
  },

  requestCard: {
    padding: 13,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  requestIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  description: {
    flex: 1,
    marginLeft: 10,
    fontSize: 11.5,
    lineHeight: 18,
    color: "#334155",
  },

  photos: {
    gap: 8,
  },

  photo: {
    width: 110,
    height: 110,
    borderRadius: 15,
    backgroundColor: "#E2E8F0",
  },

  locationCard: {
    minHeight: 76,
    padding: 11,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  locationIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  locationInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },

  locationTitle: {
    fontSize: 11,
    lineHeight: 16,
    color: "#0F172A",
  },

  address: {
    marginTop: 3,
    fontSize: 9.5,
    color: "#64748B",
  },

  mapButton: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  timingCard: {
    minHeight: 72,
    padding: 11,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  timingIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  timingInfo: {
    flex: 1,
    marginLeft: 10,
  },

  timingTitle: {
    fontSize: 11.5,
    color: "#0F172A",
  },

  timingSubtitle: {
    marginTop: 3,
    fontSize: 9.5,
    lineHeight: 15,
    color: "#64748B",
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
});