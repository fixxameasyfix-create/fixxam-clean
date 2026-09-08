import React from "react";

import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import {
  Image,
} from "expo-image";

import {
  AppButton,
  AppIcon,
  AppText,
} from "@/components/ui";

import type {
  AppIconName,
} from "@/components/ui/AppIcon";

import type {
  UseWorkerProfileReturn,
} from "@/hooks/useWorkerProfile";

import {
  MAX_GALLERY_PHOTOS,
} from "@/types/workerProfile";

import {
  isHttpsUrl,
  sanitizeDecimalInput,
} from "@/utils/workerProfile";

import {
  Colors,
  FixxamTokens,
  Typography,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type WorkerProfileFormProps =
  Pick<
    UseWorkerProfileReturn,
    | "profile"
    | "saving"
    | "uploadingPhoto"
    | "uploadingGallery"
    | "updateField"
    | "pickProfilePhoto"
    | "addGalleryPhoto"
    | "removeGalleryPhoto"
    | "saveProfile"
  >;

type SectionTitleProps = {
  icon: AppIconName;
  title: string;
};

type FieldLabelProps = {
  label: string;
  required?: boolean;
};

/* ============================================================
   COMPONENT
============================================================ */

export function WorkerProfileForm({
  profile,
  saving,
  uploadingPhoto,
  uploadingGallery,
  updateField,
  pickProfilePhoto,
  addGalleryPhoto,
  removeGalleryPhoto,
  saveProfile,
}: WorkerProfileFormProps) {
  const {
    width: screenWidth,
  } =
    useWindowDimensions();

  /* ==========================================================
     GALLERY SIZE
  ========================================================== */

  const galleryWidth =
    Math.min(
      560,
      Math.max(
        240,
        screenWidth -
          FixxamTokens.spacing.lg *
            2,
      ),
    );

  const galleryHeight =
    Math.floor(
      galleryWidth *
        (9 / 16),
    );

  const actionsDisabled =
    saving ||
    uploadingPhoto ||
    uploadingGallery;

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <KeyboardAvoidingView
      style={
        styles.flex
      }
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={
          Platform.OS === "ios"
            ? "interactive"
            : "on-drag"
        }
        contentContainerStyle={
          styles.container
        }
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <View
          style={
            styles.header
          }
        >
          <AppText
            variant="heading1"
            weight="bold"
            style={
              styles.title
            }
          >
            Build Your Profile
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.subtitle
            }
          >
            Complete your professional profile so customers can know you better.
          </AppText>
        </View>

        {/* ==================================================
            PROFILE PHOTO
        ================================================== */}

        <SectionTitle
          icon="camera"
          title="Profile Photo"
        />

        <View
          style={
            styles.photoSection
          }
        >
          <View
            style={
              styles.photoWrapper
            }
          >
            {profile.photoUrl &&
            isHttpsUrl(
              profile.photoUrl,
            ) ? (
              <Image
                source={{
                  uri:
                    profile.photoUrl,
                }}
                style={
                  styles.profilePhoto
                }
                contentFit="cover"
                transition={150}
                recyclingKey={
                  profile.photoUrl
                }
                accessibilityLabel="Worker profile photo"
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
                  size="xl"
                  color={
                    WorkerColors.primary
                  }
                />
              </View>
            )}

            {uploadingPhoto ? (
              <View
                style={
                  styles.photoLoading
                }
              >
                <ActivityIndicator
                  color={
                    Colors.textInverse
                  }
                />
              </View>
            ) : null}
          </View>

          <Pressable
            onPress={
              pickProfilePhoto
            }
            disabled={
              actionsDisabled
            }
            accessibilityRole="button"
            accessibilityLabel={
              profile.photoUrl
                ? "Change profile photo"
                : "Add profile photo"
            }
            style={({
              pressed,
            }) => [
              styles.photoButton,

              pressed &&
              !actionsDisabled
                ? styles.pressed
                : null,

              actionsDisabled
                ? styles.disabled
                : null,
            ]}
          >
            <AppIcon
              name="camera"
              role="worker"
              size="sm"
              color={
                WorkerColors.primary
              }
            />

            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.photoButtonText
              }
            >
              {profile.photoUrl
                ? "Change Photo"
                : "Add Photo"}
            </AppText>
          </Pressable>
        </View>

        {/* ==================================================
            NAME
        ================================================== */}

        <FieldLabel
          label="Name"
          required
        />

        <TextInput
          value={
            profile.fullName
          }
          onChangeText={
            value =>
              updateField(
                "fullName",
                value,
              )
          }
          placeholder="Enter your full name"
          placeholderTextColor={
            Colors.textMuted
          }
          selectionColor={
            WorkerColors.primary
          }
          cursorColor={
            WorkerColors.primary
          }
          maxLength={100}
          autoCapitalize="words"
          autoComplete="name"
          returnKeyType="next"
          accessibilityLabel="Full name"
          style={
            styles.input
          }
        />

        {/* ==================================================
            PHONE
        ================================================== */}

        <FieldLabel
          label="Phone Number"
          required
        />

        <View
          style={
            styles.inputIconWrapper
          }
        >
          <AppIcon
            name="phone"
            size="sm"
            color={
              Colors.textMuted
            }
          />

          <TextInput
            value={
              profile.phoneNumber
            }
            onChangeText={
              value =>
                updateField(
                  "phoneNumber",
                  value.replace(
                    /[^\d+()\-\s]/g,
                    "",
                  ),
                )
            }
            placeholder="e.g. 08012345678"
            placeholderTextColor={
              Colors.textMuted
            }
            selectionColor={
              WorkerColors.primary
            }
            cursorColor={
              WorkerColors.primary
            }
            keyboardType="phone-pad"
            maxLength={20}
            autoComplete="tel"
            textContentType="telephoneNumber"
            returnKeyType="next"
            accessibilityLabel="Phone number"
            style={
              styles.iconInput
            }
          />
        </View>

        <AppText
          variant="caption"
          tone="secondary"
          style={
            styles.phoneHelper
          }
        >
          Customers can use this number to contact you about a job.
        </AppText>

        {/* ==================================================
            EXPERIENCE
        ================================================== */}

        <FieldLabel
          label="Experience"
          required
        />

        <View
          style={
            styles.inputWithSuffix
          }
        >
          <TextInput
            value={
              profile.experience
            }
            onChangeText={
              value =>
                updateField(
                  "experience",
                  value.replace(
                    /[^0-9]/g,
                    "",
                  ),
                )
            }
            placeholder="e.g. 5"
            placeholderTextColor={
              Colors.textMuted
            }
            selectionColor={
              WorkerColors.primary
            }
            cursorColor={
              WorkerColors.primary
            }
            keyboardType="number-pad"
            maxLength={2}
            accessibilityLabel="Years of experience"
            style={
              styles.suffixInput
            }
          />

          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.suffix
            }
          >
            Years
          </AppText>
        </View>

        {/* ==================================================
            HOURLY RATE
        ================================================== */}

        <FieldLabel
          label="Hourly Rate"
          required
        />

        <View
          style={
            styles.inputWithPrefix
          }
        >
          <AppText
            variant="bodyLarge"
            weight="bold"
            style={
              styles.prefix
            }
          >
            ₦
          </AppText>

          <TextInput
            value={
              profile.hourlyRate
            }
            onChangeText={
              value =>
                updateField(
                  "hourlyRate",
                  sanitizeDecimalInput(
                    value,
                  ),
                )
            }
            placeholder="e.g. 5000"
            placeholderTextColor={
              Colors.textMuted
            }
            selectionColor={
              WorkerColors.primary
            }
            cursorColor={
              WorkerColors.primary
            }
            keyboardType="decimal-pad"
            maxLength={12}
            accessibilityLabel="Hourly rate"
            style={
              styles.prefixInput
            }
          />

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.rateSuffix
            }
          >
            / hour
          </AppText>
        </View>

        {/* ==================================================
            LOCATION
        ================================================== */}

        <FieldLabel
          label="Location"
          required
        />

        <View
          style={
            styles.inputIconWrapper
          }
        >
          <AppIcon
            name="location"
            size="sm"
            color={
              Colors.textMuted
            }
          />

          <TextInput
            value={
              profile.location
            }
            onChangeText={
              value =>
                updateField(
                  "location",
                  value,
                )
            }
            placeholder="Enter your service location"
            placeholderTextColor={
              Colors.textMuted
            }
            selectionColor={
              WorkerColors.primary
            }
            cursorColor={
              WorkerColors.primary
            }
            maxLength={200}
            autoCapitalize="words"
            accessibilityLabel="Service location"
            style={
              styles.iconInput
            }
          />
        </View>

        {/* ==================================================
            WORK GALLERY
        ================================================== */}

        <SectionTitle
          icon="image"
          title="Work Gallery"
        />

        <AppText
          variant="body"
          tone="secondary"
          style={
            styles.helper
          }
        >
          Add photos of work you have completed. Customers will see these photos on your profile.
        </AppText>

        <View
          style={
            styles.gallerySection
          }
        >
          {profile.workGallery.length >
          0 ? (
            <FlatList
              data={
                profile.workGallery
              }
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              decelerationRate="fast"
              snapToInterval={
                galleryWidth +
                FixxamTokens.spacing.md
              }
              snapToAlignment="start"
              keyExtractor={
                photo =>
                  photo
              }
              contentContainerStyle={
                styles.galleryList
              }
              ItemSeparatorComponent={
                GallerySeparator
              }
              renderItem={({
                item: photo,
                index,
              }) => (
                <View
                  style={[
                    styles.galleryItem,

                    {
                      width:
                        galleryWidth,

                      height:
                        galleryHeight,
                    },
                  ]}
                >
                  <Image
                    source={{
                      uri:
                        photo,
                    }}
                    style={
                      styles.galleryImage
                    }
                    contentFit="cover"
                    transition={150}
                    recyclingKey={
                      photo
                    }
                    accessibilityLabel={`Work gallery photo ${index + 1}`}
                  />

                  <View
                    pointerEvents="none"
                    style={
                      styles.galleryOverlay
                    }
                  />

                  <Pressable
                    onPress={() =>
                      removeGalleryPhoto(
                        index,
                      )
                    }
                    disabled={
                      uploadingGallery ||
                      saving
                    }
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove gallery photo ${index + 1}`}
                    style={({
                      pressed,
                    }) => [
                      styles.removePhoto,

                      pressed
                        ? styles.pressed
                        : null,
                    ]}
                  >
                    <AppIcon
                      name="close"
                      size="sm"
                      color={
                        Colors.textInverse
                      }
                    />
                  </Pressable>

                  <View
                    style={
                      styles.photoNumber
                    }
                  >
                    <AppText
                      variant="caption"
                      weight="bold"
                      style={
                        styles.photoNumberText
                      }
                    >
                      {index + 1}/
                      {
                        profile
                          .workGallery
                          .length
                      }
                    </AppText>
                  </View>
                </View>
              )}
              ListFooterComponent={
                profile.workGallery.length <
                MAX_GALLERY_PHOTOS ? (
                  <View
                    style={
                      styles.footerAddWrapper
                    }
                  >
                    <Pressable
                      onPress={
                        addGalleryPhoto
                      }
                      disabled={
                        uploadingGallery ||
                        saving
                      }
                      accessibilityRole="button"
                      accessibilityLabel="Add another work photo"
                      style={({
                        pressed,
                      }) => [
                        styles.addGallery,

                        {
                          width:
                            galleryWidth,

                          height:
                            galleryHeight,
                        },

                        pressed
                          ? styles.pressed
                          : null,
                      ]}
                    >
                      {uploadingGallery ? (
                        <ActivityIndicator
                          color={
                            WorkerColors.primary
                          }
                        />
                      ) : (
                        <>
                          <View
                            style={
                              styles.addGalleryIcon
                            }
                          >
                            <AppIcon
                              name="add"
                              role="worker"
                              size="md"
                              color={
                                WorkerColors.primary
                              }
                            />
                          </View>

                          <AppText
                            variant="bodyMedium"
                            weight="bold"
                            style={
                              styles.addGalleryText
                            }
                          >
                            Add Photo
                          </AppText>

                          <AppText
                            variant="caption"
                            tone="secondary"
                            style={
                              styles.galleryRatio
                            }
                          >
                            Add another
                          </AppText>
                        </>
                      )}
                    </Pressable>
                  </View>
                ) : null
              }
            />
          ) : (
            <Pressable
              onPress={
                addGalleryPhoto
              }
              disabled={
                uploadingGallery ||
                saving
              }
              accessibilityRole="button"
              accessibilityLabel="Add work photos"
              style={({
                pressed,
              }) => [
                styles.emptyGallery,

                {
                  width:
                    galleryWidth,

                  height:
                    galleryHeight,
                },

                pressed
                  ? styles.pressed
                  : null,
              ]}
            >
              {uploadingGallery ? (
                <ActivityIndicator
                  color={
                    WorkerColors.primary
                  }
                />
              ) : (
                <>
                  <View
                    style={
                      styles.addGalleryIcon
                    }
                  >
                    <AppIcon
                      name="image"
                      role="worker"
                      size="md"
                      color={
                        WorkerColors.primary
                      }
                    />
                  </View>

                  <AppText
                    variant="bodyMedium"
                    weight="bold"
                    style={
                      styles.addGalleryText
                    }
                  >
                    Add Work Photos
                  </AppText>

                  <AppText
                    variant="caption"
                    tone="secondary"
                    style={
                      styles.galleryRatio
                    }
                  >
                    Up to{" "}
                    {MAX_GALLERY_PHOTOS}{" "}
                    photos · Landscape
                  </AppText>
                </>
              )}
            </Pressable>
          )}
        </View>

        <AppText
          variant="caption"
          tone="secondary"
          center
          style={
            styles.swipeHint
          }
        >
          {profile.workGallery.length >
          1
            ? "Swipe left or right to view photos"
            : `You can add up to ${MAX_GALLERY_PHOTOS} work photos`}
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          style={
            styles.galleryCount
          }
        >
          {profile.workGallery.length}/
          {MAX_GALLERY_PHOTOS} photos
        </AppText>

        {/* ==================================================
            ABOUT ME
        ================================================== */}

        <SectionTitle
          icon="profile"
          title="About Me"
        />

        <TextInput
          value={
            profile.aboutMe
          }
          onChangeText={
            value =>
              updateField(
                "aboutMe",
                value,
              )
          }
          placeholder="Tell customers about your skills, experience and the type of work you do..."
          placeholderTextColor={
            Colors.textMuted
          }
          selectionColor={
            WorkerColors.primary
          }
          cursorColor={
            WorkerColors.primary
          }
          multiline
          textAlignVertical="top"
          maxLength={1000}
          accessibilityLabel="About me"
          style={
            styles.textArea
          }
        />

        <AppText
          variant="caption"
          tone="secondary"
          style={
            styles.characterCount
          }
        >
          {profile.aboutMe.length}/1000
        </AppText>

        {/* ==================================================
            SAVE
        ================================================== */}

        <View
          style={
            styles.saveAction
          }
        >
          <AppButton
            title="Save & Publish"
            role="worker"
            variant="primary"
            leftIconName="check"
            loading={
              saving
            }
            disabled={
              actionsDisabled
            }
            onPress={
              saveProfile
            }
          />
        </View>

        <AppText
          variant="caption"
          tone="secondary"
          center
          style={
            styles.bottomNote
          }
        >
          Your professional profile information is stored securely. Profile photos are uploaded before they are published.
        </AppText>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ============================================================
   GALLERY SEPARATOR
============================================================ */

function GallerySeparator() {
  return (
    <View
      style={
        styles.galleryGap
      }
    />
  );
}

/* ============================================================
   FIELD LABEL
============================================================ */

function FieldLabel({
  label,
  required = false,
}: FieldLabelProps) {
  return (
    <View
      style={
        styles.labelRow
      }
    >
      <AppText
        variant="bodyMedium"
        weight="bold"
        style={
          styles.label
        }
      >
        {label}
      </AppText>

      {required ? (
        <AppText
          variant="bodyMedium"
          weight="bold"
          style={
            styles.required
          }
        >
          *
        </AppText>
      ) : null}
    </View>
  );
}

/* ============================================================
   SECTION TITLE
============================================================ */

function SectionTitle({
  icon,
  title,
}: SectionTitleProps) {
  return (
    <View
      style={
        styles.sectionTitle
      }
    >
      <View
        style={
          styles.sectionIcon
        }
      >
        <AppIcon
          name={
            icon
          }
          role="worker"
          size="sm"
          color={
            WorkerColors.primary
          }
        />
      </View>

      <AppText
        variant="heading3"
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

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    flex: {
      flex: 1,
    },

    container: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      marginBottom:
        FixxamTokens.spacing.xl,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 21,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       SECTION
    ======================================================== */

    sectionTitle: {
      marginTop:
        FixxamTokens.spacing.xs,

      marginBottom:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    sectionIcon: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      marginRight:
        FixxamTokens.spacing.sm,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    sectionText: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       PROFILE PHOTO
    ======================================================== */

    photoSection: {
      alignItems:
        "center",

      marginBottom:
        FixxamTokens.spacing.xl,
    },

    photoWrapper: {
      width: 116,

      height: 116,

      marginBottom:
        FixxamTokens.spacing.md,

      overflow:
        "hidden",

      borderWidth: 2,

      borderColor:
        WorkerColors.primarySoft,

      borderRadius: 58,

      backgroundColor:
        Colors.disabledBackground,

      ...FixxamTokens.shadow.card,
    },

    profilePhoto: {
      width: "100%",

      height: "100%",

      backgroundColor:
        Colors.disabledBackground,
    },

    photoPlaceholder: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        WorkerColors.primarySoft,
    },

    photoLoading: {
      ...StyleSheet.absoluteFillObject,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.overlayMedium,
    },

    photoButton: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    photoButtonText: {
      color:
        WorkerColors.primary,
    },

    /* ========================================================
       LABEL
    ======================================================== */

    labelRow: {
      marginBottom:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    label: {
      color:
        Colors.textPrimary,
    },

    required: {
      marginLeft:
        FixxamTokens.spacing.xxs,

      color:
        Colors.error,
    },

    /* ========================================================
       INPUTS
    ======================================================== */

    input: {
      minHeight:
        FixxamTokens.size.inputHeight,

      marginBottom:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.input,

      backgroundColor:
        Colors.surface,

      color:
        Colors.textPrimary,

      fontSize:
        Typography.fontSize.md,

      includeFontPadding:
        false,
    },

    inputWithSuffix: {
      minHeight:
        FixxamTokens.size.inputHeight,

      marginBottom:
        FixxamTokens.spacing.lg,

      paddingRight:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.input,

      backgroundColor:
        Colors.surface,
    },

    suffixInput: {
      flex: 1,

      minHeight:
        FixxamTokens.size.inputHeight,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,

      fontSize:
        Typography.fontSize.md,
    },

    suffix: {
      color:
        Colors.textSecondary,
    },

    inputWithPrefix: {
      minHeight:
        FixxamTokens.size.inputHeight,

      marginBottom:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.input,

      backgroundColor:
        Colors.surface,
    },

    prefix: {
      paddingLeft:
        FixxamTokens.spacing.md,

      color:
        WorkerColors.primary,
    },

    prefixInput: {
      flex: 1,

      minHeight:
        FixxamTokens.size.inputHeight,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,

      fontSize:
        Typography.fontSize.md,
    },

    rateSuffix: {
      paddingRight:
        FixxamTokens.spacing.md,

      color:
        Colors.textSecondary,
    },

    inputIconWrapper: {
      minHeight:
        FixxamTokens.size.inputHeight,

      marginBottom:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.input,

      backgroundColor:
        Colors.surface,
    },

    iconInput: {
      flex: 1,

      minHeight:
        FixxamTokens.size.inputHeight,

      marginLeft:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,

      fontSize:
        Typography.fontSize.md,
    },

    phoneHelper: {
      marginTop:
        -FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.lg,

      lineHeight: 17,

      color:
        Colors.textMuted,
    },

    /* ========================================================
       GALLERY
    ======================================================== */

    helper: {
      marginBottom:
        FixxamTokens.spacing.md,

      lineHeight: 19,

      color:
        Colors.textSecondary,
    },

    gallerySection: {
      width: "100%",

      overflow:
        "hidden",
    },

    galleryList: {
      paddingRight:
        FixxamTokens.spacing.lg,
    },

    galleryGap: {
      width:
        FixxamTokens.spacing.md,
    },

    galleryItem: {
      position:
        "relative",

      overflow:
        "hidden",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.disabledBackground,
    },

    galleryImage: {
      width: "100%",

      height: "100%",

      backgroundColor:
        Colors.disabledBackground,
    },

    galleryOverlay: {
      ...StyleSheet.absoluteFillObject,

      backgroundColor:
        Colors.overlayLight,
    },

    removePhoto: {
      position:
        "absolute",

      top:
        FixxamTokens.spacing.sm,

      right:
        FixxamTokens.spacing.sm,

      zIndex: 10,

      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.error,
    },

    photoNumber: {
      position:
        "absolute",

      bottom:
        FixxamTokens.spacing.sm,

      left:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.overlayStrong,
    },

    photoNumberText: {
      color:
        Colors.textInverse,
    },

    footerAddWrapper: {
      marginLeft:
        FixxamTokens.spacing.md,
    },

    addGallery: {
      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderStyle:
        "dashed",

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    emptyGallery: {
      alignSelf:
        "center",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderStyle:
        "dashed",

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    addGalleryIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      marginBottom:
        FixxamTokens.spacing.sm,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    addGalleryText: {
      color:
        WorkerColors.primary,
    },

    galleryRatio: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textMuted,
    },

    swipeHint: {
      marginTop:
        FixxamTokens.spacing.sm,

      color:
        Colors.textMuted,
    },

    galleryCount: {
      marginTop:
        FixxamTokens.spacing.xs,

      marginBottom:
        FixxamTokens.spacing.xl,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       ABOUT
    ======================================================== */

    textArea: {
      minHeight: 145,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.input,

      backgroundColor:
        Colors.surface,

      color:
        Colors.textPrimary,

      fontSize:
        Typography.fontSize.md,

      lineHeight: 21,
    },

    characterCount: {
      marginTop:
        FixxamTokens.spacing.xs,

      marginBottom:
        FixxamTokens.spacing.xl,

      textAlign:
        "right",

      color:
        Colors.textMuted,
    },

    /* ========================================================
       SAVE
    ======================================================== */

    saveAction: {
      width: "100%",
    },

    bottomNote: {
      marginTop:
        FixxamTokens.spacing.md,

      lineHeight: 17,

      color:
        Colors.textMuted,
    },

    /* ========================================================
       INTERACTION
    ======================================================== */

    disabled: {
      opacity: 0.6,
    },

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },
  });