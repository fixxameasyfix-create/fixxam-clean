import React, {
  memo,
  useMemo,
} from "react";

import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  Image,
} from "expo-image";

import {
  AppCard,
  AppIcon,
  AppText,
} from "@/components/ui";

import PasswordField from "@/components/auth/PasswordField";
import TermsCheckbox from "@/components/auth/TermsCheckbox";

import {
  getServices,
  ServiceItem,
} from "@/constants/serviceLoader";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

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

  setPassword: (
    value: string,
  ) => void;

  setConfirmPassword: (
    value: string,
  ) => void;

  onToggleTerms: () => void;
};

type ReviewItemProps = {
  label: string;
  value?: string | null;
};

/* ============================================================
   CONSTANTS
============================================================ */

const MAX_GALLERY_IMAGES = 6;

/* ============================================================
   REVIEW ITEM
============================================================ */

const ReviewItem =
  memo(function ReviewItem({
    label,
    value,
  }: ReviewItemProps) {
    const displayValue =
      typeof value === "string" &&
      value.trim().length > 0
        ? value.trim()
        : "-";

    return (
      <View
        style={
          styles.item
        }
      >
        <AppText
          variant="caption"
          weight="medium"
          style={
            styles.label
          }
        >
          {label}
        </AppText>

        <AppText
          variant="body"
          style={
            styles.value
          }
        >
          {displayValue}
        </AppText>
      </View>
    );
  });

/* ============================================================
   COMPONENT
============================================================ */

function WorkerReview({
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
  const hasPhoto =
    typeof photo === "string" &&
    photo.trim().length > 0;

  const availableServices =
    useMemo<ServiceItem[]>(() => {
      if (!subcategory) {
        return [];
      }

      try {
        return getServices(
          subcategory,
        );
      } catch {
        return [];
      }
    }, [subcategory]);

  const selectedServiceItems =
    useMemo(
      () =>
        selectedServices
          .map(
            (serviceId) =>
              availableServices.find(
                (service) =>
                  service.id ===
                  serviceId,
              ),
          )
          .filter(
            (
              service,
            ): service is ServiceItem =>
              Boolean(service),
          ),
      [
        availableServices,
        selectedServices,
      ],
    );

  const safeGallery =
    useMemo(
      () =>
        workGallery
          .filter(
            (uri): uri is string =>
              typeof uri ===
                "string" &&
              uri.trim().length >
                0,
          )
          .slice(
            0,
            MAX_GALLERY_IMAGES,
          ),
      [workGallery],
    );

  const experienceLabel =
    useMemo(() => {
      const normalized =
        experience.trim();

      if (!normalized) {
        return "-";
      }

      const numericValue =
        Number(normalized);

      if (
        !Number.isFinite(
          numericValue,
        )
      ) {
        return "-";
      }

      return `${normalized} ${
        numericValue === 1
          ? "Year"
          : "Years"
      }`;
    }, [experience]);

  const aboutText =
    about.trim() || "-";

  return (
    <AppCard
      role="worker"
      variant="outlined"
      style={
        styles.card
      }
    >
      {/* ======================================================
          REVIEW MESSAGE
      ====================================================== */}

      <AppText
        variant="body"
        tone="secondary"
        center
        style={
          styles.reviewMessage
        }
      >
        Please review your details before completing your registration.
      </AppText>

      {/* ======================================================
          PROFILE PHOTO
      ====================================================== */}

      <View
        style={
          styles.photoContainer
        }
      >
        {hasPhoto ? (
          <Image
            source={{
              uri:
                photo!.trim(),
            }}
            contentFit="cover"
            transition={150}
            accessibilityLabel="Worker profile photo"
            style={
              styles.photo
            }
          />
        ) : (
          <View
            style={
              styles.photoPlaceholder
            }
          >
            <AppIcon
              name="profile"
              role="worker"
              size="lg"
              state="muted"
            />

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.photoPlaceholderText
              }
            >
              No Photo
            </AppText>
          </View>
        )}
      </View>

      {/* ======================================================
          PERSONAL INFORMATION
      ====================================================== */}

      {!isLoggedIn ? (
        <>
          <ReviewItem
            label="First Name"
            value={
              firstName
            }
          />

          <ReviewItem
            label="Surname"
            value={
              surname
            }
          />

          <ReviewItem
            label="Other Name"
            value={
              otherName
            }
          />

          <ReviewItem
            label="Email"
            value={
              email
            }
          />

          <ReviewItem
            label="Phone"
            value={
              phone
            }
          />
        </>
      ) : null}

      {/* ======================================================
          PROFESSIONAL INFORMATION
      ====================================================== */}

      <ReviewItem
        label="Category"
        value={
          category
        }
      />

      <ReviewItem
        label="Subcategory"
        value={
          subcategory
        }
      />

      {/* ======================================================
          SELECTED SERVICES
      ====================================================== */}

      <View
        style={
          styles.section
        }
      >
        <AppText
          variant="caption"
          weight="medium"
          style={
            styles.label
          }
        >
          Selected Services
        </AppText>

        {selectedServiceItems.length >
        0 ? (
          <View
            style={
              styles.servicesContainer
            }
          >
            {selectedServiceItems.map(
              (service) => (
                <View
                  key={
                    service.id
                  }
                  style={
                    styles.serviceChip
                  }
                >
                  <AppIcon
                    name="check"
                    role="worker"
                    size="xs"
                    state="active"
                  />

                  <AppText
                    variant="caption"
                    weight="medium"
                    numberOfLines={1}
                    style={
                      styles.serviceText
                    }
                  >
                    {
                      service.name
                    }
                  </AppText>
                </View>
              ),
            )}
          </View>
        ) : (
          <AppText
            variant="body"
            style={
              styles.value
            }
          >
            -
          </AppText>
        )}
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
          variant="caption"
          weight="medium"
          style={
            styles.label
          }
        >
          About You & Your Skills
        </AppText>

        <View
          style={
            styles.aboutBox
          }
        >
          <AppText
            variant="body"
            style={
              styles.aboutText
            }
          >
            {aboutText}
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
          <AppText
            variant="caption"
            weight="medium"
            style={
              styles.label
            }
          >
            Work Gallery
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.gallerySubtitle
            }
          >
            {safeGallery.length}/
            {MAX_GALLERY_IMAGES} photos
          </AppText>
        </View>

        {safeGallery.length >
        0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              styles.galleryScrollContent
            }
          >
            {safeGallery.map(
              (
                uri,
                index,
              ) => (
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
                    contentFit="cover"
                    transition={150}
                    accessibilityLabel={`Work gallery photo ${
                      index + 1
                    }`}
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
                      variant="caption"
                      weight="bold"
                      style={
                        styles.galleryNumberText
                      }
                    >
                      {
                        index + 1
                      }
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
            <AppIcon
              name="image"
              role="worker"
              size="md"
              state="muted"
            />

            <AppText
              variant="body"
              weight="medium"
              tone="secondary"
              style={
                styles.emptyGalleryText
              }
            >
              No work photos added
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
            >
              Work photos are optional.
            </AppText>
          </View>
        )}
      </View>

      {/* ======================================================
          EXPERIENCE
      ====================================================== */}

      <ReviewItem
        label="Experience"
        value={
          experienceLabel
        }
      />

      {/* ======================================================
          LOCATION
      ====================================================== */}

      <ReviewItem
        label="State"
        value={
          state
        }
      />

      <ReviewItem
        label="Local Government"
        value={
          lga
        }
      />

      {/* ======================================================
          SECURITY
      ====================================================== */}

      {!isLoggedIn ? (
        <View
          style={
            styles.security
          }
        >
          <AppText
            variant="heading3"
            weight="bold"
            style={
              styles.securityTitle
            }
          >
            Security
          </AppText>

          <PasswordField
            placeholder="Create Password"
            value={
              password
            }
            onChangeText={
              setPassword
            }
            variant="worker"
          />

          <View
            style={
              styles.space
            }
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
      ) : null}
    </AppCard>
  );
}

export default memo(
  WorkerReview,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    card: {
      marginHorizontal:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.surface,
    },

    reviewMessage: {
      marginBottom:
        FixxamTokens.spacing.md,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       PROFILE PHOTO
    ======================================================== */

    photoContainer: {
      alignItems:
        "center",

      marginBottom:
        FixxamTokens.spacing.lg,
    },

    photo: {
      width: 88,

      height: 88,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    photoPlaceholder: {
      width: 88,

      height: 88,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,

      justifyContent:
        "center",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xxs,
    },

    photoPlaceholderText: {
      color:
        Colors.textSecondary,
    },

    /* ========================================================
       ITEMS
    ======================================================== */

    item: {
      marginBottom:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.sm,

      borderBottomWidth: 1,

      borderBottomColor:
        Colors.divider,
    },

    label: {
      marginBottom:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },

    value: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       SERVICES
    ======================================================== */

    section: {
      marginBottom:
        FixxamTokens.spacing.md,
    },

    servicesContainer: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        FixxamTokens.spacing.xs,

      marginTop:
        FixxamTokens.spacing.xxs,
    },

    serviceChip: {
      maxWidth:
        "100%",

      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      backgroundColor:
        WorkerColors.primarySoft,

      borderWidth: 1,

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.full,

      paddingHorizontal:
        FixxamTokens.spacing.sm,
    },

    serviceText: {
      flexShrink: 1,

      color:
        WorkerColors.primary,
    },

    /* ========================================================
       ABOUT
    ======================================================== */

    aboutSection: {
      marginBottom:
        FixxamTokens.spacing.md,
    },

    aboutBox: {
      minHeight: 55,

      backgroundColor:
        Colors.background,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.sm,
    },

    aboutText: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       WORK GALLERY
    ======================================================== */

    gallerySection: {
      marginBottom:
        FixxamTokens.spacing.md,
    },

    galleryHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.sm,
    },

    gallerySubtitle: {
      color:
        Colors.textMuted,
    },

    galleryScrollContent: {
      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      paddingRight:
        FixxamTokens.spacing.xs,
    },

    galleryItem: {
      width: 105,

      height: 115,

      borderRadius:
        FixxamTokens.radius.md,

      overflow:
        "hidden",

      backgroundColor:
        Colors.disabledBackground,

      position:
        "relative",
    },

    galleryImage: {
      width:
        "100%",

      height:
        "100%",
    },

    galleryNumber: {
      position:
        "absolute",

      top:
        FixxamTokens.spacing.xs,

      left:
        FixxamTokens.spacing.xs,

      width: 22,

      height: 22,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        "rgba(15, 23, 42, 0.72)",

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    galleryNumberText: {
      color:
        Colors.textInverse,
    },

    emptyGallery: {
      borderWidth: 1,

      borderStyle:
        "dashed",

      borderColor:
        Colors.disabled,

      borderRadius:
        FixxamTokens.radius.md,

      paddingVertical:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      backgroundColor:
        Colors.background,
    },

    emptyGalleryText: {
      color:
        Colors.textSecondary,
    },

    /* ========================================================
       SECURITY
    ======================================================== */

    security: {
      marginTop:
        FixxamTokens.spacing.lg,
    },

    securityTitle: {
      marginBottom:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    space: {
      height:
        FixxamTokens.spacing.md,
    },

    termsSpace: {
      height:
        FixxamTokens.spacing.lg,
    },
  });