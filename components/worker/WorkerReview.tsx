import React from "react";

import {
  Image,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  AppCard,
  AppText,
} from "@/components/ui";

import PasswordField from "@/components/auth/PasswordField";
import TermsCheckbox from "@/components/auth/TermsCheckbox";

type Props = {
  photo: string | null;

  firstName: string;
  surname: string;
  otherName: string;

  email: string;
  phone: string;

  category: string;
  subcategory: string;

  selectedServices: string[];

  experience: string;

  state: string;
  lga: string;

  about: string;

  workGallery: string[];

  isLoggedIn: boolean;

  password: string;
  confirmPassword: string;

  acceptedTerms: boolean;

  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;

  onToggleTerms: () => void;
};

export default function WorkerReview({
  photo,

  firstName,
  surname,
  otherName,

  email,
  phone,

  category,
  subcategory,

  selectedServices,

  experience,

  state,
  lga,

  about,

  workGallery,

  isLoggedIn,

  password,
  confirmPassword,

  acceptedTerms,

  setPassword,
  setConfirmPassword,

  onToggleTerms,
}: Props) {
  /* ============================================================
     ITEM
  ============================================================ */

  const Item = ({
    label,
    value,
  }: {
    label: string;
    value: string;
  }) => (
    <View style={styles.item}>
      <AppText
        weight="bold"
        style={styles.label}
      >
        {label}
      </AppText>

      <AppText style={styles.value}>
        {value || "-"}
      </AppText>
    </View>
  );

  /* ============================================================
     UI
  ============================================================ */

  return (
    <AppCard style={styles.card}>
      {/* ======================================================
          REVIEW MESSAGE
      ====================================================== */}

      <AppText
        style={styles.reviewMessage}
      >
        Please review your details before
        completing your registration.
      </AppText>

      {/* ======================================================
          PROFILE PHOTO
      ====================================================== */}

      <View
        style={styles.photoContainer}
      >
        {photo ? (
          <Image
            source={{
              uri: photo,
            }}
            style={styles.photo}
          />
        ) : (
          <View
            style={
              styles.photoPlaceholder
            }
          >
            <AppText>
              No Photo
            </AppText>
          </View>
        )}
      </View>

      {/* ======================================================
          PERSONAL INFORMATION
      ====================================================== */}

      {!isLoggedIn && (
        <>
          <Item
            label="First Name"
            value={firstName}
          />

          <Item
            label="Surname"
            value={surname}
          />

          <Item
            label="Other Name"
            value={otherName}
          />

          <Item
            label="Email"
            value={email}
          />

          <Item
            label="Phone"
            value={phone}
          />
        </>
      )}

      {/* ======================================================
          PROFESSIONAL INFORMATION
      ====================================================== */}

      <Item
        label="Category"
        value={category}
      />

      <Item
        label="Subcategory"
        value={subcategory}
      />

      {/* ======================================================
          SELECTED SERVICES
      ====================================================== */}

      <View style={styles.section}>
        <AppText
          weight="bold"
          style={styles.label}
        >
          Selected Services
        </AppText>

        <View
          style={
            styles.servicesContainer
          }
        >
          {selectedServices.length >
          0 ? (
            selectedServices.map(
              (service) => (
                <View
                  key={service}
                  style={
                    styles.serviceChip
                  }
                >
                  <AppText
                    style={
                      styles.serviceText
                    }
                  >
                    {service}
                  </AppText>
                </View>
              ),
            )
          ) : (
            <AppText
              style={styles.value}
            >
              -
            </AppText>
          )}
        </View>
      </View>

      {/* ======================================================
          ABOUT
      ====================================================== */}

      <View
        style={
          styles.aboutSection
        }
      >
        <AppText
          weight="bold"
          style={styles.label}
        >
          About You & Your Skills
        </AppText>

        <View
          style={styles.aboutBox}
        >
          <AppText
            style={styles.aboutText}
          >
            {about || "-"}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          WORK GALLERY
      ====================================================== */}

      <View
        style={
          styles.gallerySection
        }
      >
        <View
          style={
            styles.galleryHeader
          }
        >
          <View
            style={
              styles.galleryTitleContainer
            }
          >
            <AppText
              weight="bold"
              style={styles.label}
            >
              Work Gallery
            </AppText>

            <AppText
              style={
                styles.gallerySubtitle
              }
            >
              {workGallery.length}/6
              {" "}
              photos
            </AppText>
          </View>
        </View>

        {workGallery.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.galleryScrollContent
            }
          >
            {workGallery.map(
              (uri, index) => (
                <View
                  key={`${uri}-${index}`}
                  style={
                    styles.galleryItem
                  }
                >
                  <Image
                    source={{
                      uri,
                    }}
                    style={
                      styles.galleryImage
                    }
                  />

                  <View
                    style={
                      styles.galleryNumber
                    }
                  >
                    <AppText
                      style={
                        styles.galleryNumberText
                      }
                    >
                      {index + 1}
                    </AppText>
                  </View>
                </View>
              ),
            )}
          </ScrollView>
        ) : (
          <View
            style={
              styles.emptyGallery
            }
          >
            <AppText
              style={
                styles.emptyGalleryText
              }
            >
              No work photos added
            </AppText>

            <AppText
              style={
                styles.emptyGalleryHint
              }
            >
              Work photos are optional.
            </AppText>
          </View>
        )}
      </View>

      {/* ======================================================
          EXPERIENCE
      ====================================================== */}

      <Item
        label="Experience"
        value={
          experience
            ? `${experience} Years`
            : "-"
        }
      />

      {/* ======================================================
          LOCATION
      ====================================================== */}

      <Item
        label="State"
        value={state}
      />

      <Item
        label="Local Government"
        value={lga}
      />

      {/* ======================================================
          SECURITY
      ====================================================== */}

      {!isLoggedIn && (
        <View
          style={styles.security}
        >
          <AppText
            weight="bold"
            style={
              styles.securityTitle
            }
          >
            Security
          </AppText>

          <PasswordField
            placeholder="Create Password"
            value={password}
            onChangeText={
              setPassword
            }
            variant="worker"
          />

          <View
            style={styles.space}
          />

          <PasswordField
            placeholder="Confirm Password"
            value={
              confirmPassword
            }
            onChangeText={
              setConfirmPassword
            }
            variant="worker"
          />

          <View
            style={
              styles.termsSpace
            }
          />

          <TermsCheckbox
            checked={
              acceptedTerms
            }
            onToggle={
              onToggleTerms
            }
            variant="worker"
          />
        </View>
      )}
    </AppCard>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      marginHorizontal: 12,
      marginBottom: 10,

      borderRadius: 16,

      paddingHorizontal: 12,
      paddingVertical: 12,

      backgroundColor:
        "#FFFFFF",

      shadowColor: "#000",

      shadowOpacity: 0.04,

      shadowRadius: 8,

      shadowOffset: {
        width: 0,
        height: 2,
      },

      elevation: 2,
    },

    reviewMessage: {
      textAlign: "center",

      color: "#64748B",

      fontSize: 12,

      lineHeight: 18,

      marginBottom: 12,
    },

    /* ========================================================
       PROFILE PHOTO
    ======================================================== */

    photoContainer: {
      alignItems: "center",

      marginBottom: 14,
    },

    photo: {
      width: 88,
      height: 88,

      borderRadius: 44,
    },

    photoPlaceholder: {
      width: 88,
      height: 88,

      borderRadius: 44,

      backgroundColor:
        "#F3F4F6",

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    /* ========================================================
       ITEMS
    ======================================================== */

    item: {
      marginBottom: 10,

      paddingBottom: 8,

      borderBottomWidth: 1,

      borderBottomColor:
        "#F1F5F9",
    },

    label: {
      fontSize: 11,

      fontWeight: "700",

      color: "#64748B",

      marginBottom: 4,
    },

    value: {
      fontSize: 14,

      color: "#111827",

      lineHeight: 20,
    },

    /* ========================================================
       SERVICES
    ======================================================== */

    section: {
      marginBottom: 10,
    },

    servicesContainer: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap: 6,

      marginTop: 4,
    },

    serviceChip: {
      backgroundColor:
        "#FFF7ED",

      borderWidth: 1,

      borderColor:
        "#FF6B00",

      borderRadius: 999,

      paddingHorizontal: 10,

      paddingVertical: 4,
    },

    serviceText: {
      color: "#FF6B00",

      fontWeight: "700",

      fontSize: 11,
    },

    /* ========================================================
       ABOUT
    ======================================================== */

    aboutSection: {
      marginBottom: 10,
    },

    aboutBox: {
      backgroundColor:
        "#F8FAFC",

      borderWidth: 1,

      borderColor:
        "#E5E7EB",

      borderRadius: 12,

      paddingHorizontal: 10,

      paddingVertical: 9,

      minHeight: 55,
    },

    aboutText: {
      fontSize: 13,

      lineHeight: 19,

      color: "#111827",
    },

    /* ========================================================
       WORK GALLERY
    ======================================================== */

    gallerySection: {
      marginBottom: 12,

      paddingTop: 2,
    },

    galleryHeader: {
      marginBottom: 8,
    },

    galleryTitleContainer: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    gallerySubtitle: {
      fontSize: 11,

      color: "#94A3B8",
    },

    galleryScrollContent: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 10,

      paddingRight: 4,
    },

    galleryItem: {
      width: 105,

      height: 115,

      borderRadius: 12,

      overflow: "hidden",

      backgroundColor:
        "#F1F5F9",

      position: "relative",
    },

    galleryImage: {
      width: "100%",

      height: "100%",
    },

    galleryNumber: {
      position: "absolute",

      top: 6,

      left: 6,

      width: 22,

      height: 22,

      borderRadius: 11,

      backgroundColor:
        "rgba(0,0,0,0.65)",

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    galleryNumberText: {
      color: "#FFFFFF",

      fontSize: 10,

      fontWeight: "700",
    },

    emptyGallery: {
      borderWidth: 1,

      borderStyle:
        "dashed",

      borderColor:
        "#CBD5E1",

      borderRadius: 12,

      paddingVertical: 18,

      alignItems:
        "center",

      backgroundColor:
        "#F8FAFC",
    },

    emptyGalleryText: {
      fontSize: 12,

      fontWeight: "600",

      color: "#64748B",
    },

    emptyGalleryHint: {
      fontSize: 10,

      color: "#94A3B8",

      marginTop: 3,
    },

    /* ========================================================
       SECURITY
    ======================================================== */

    security: {
      marginTop: 20,
    },

    securityTitle: {
      marginBottom: 12,

      fontSize: 15,

      color: "#111827",
    },

    space: {
      height: 12,
    },

    termsSpace: {
      height: 18,
    },
  });