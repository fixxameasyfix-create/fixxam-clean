import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, {
  useCallback,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useShopRegistration } from '../../../../contexts/ShopRegistrationContext';

/* ============================================================
   TYPES
============================================================ */

type PhotoType =
  | 'cover'
  | 'logo';

/* ============================================================
   SCREEN
============================================================ */

export default function ShopPhotosScreen() {
  const {
    draft,
    updateDraft,
  } = useShopRegistration();

  const [
    coverPhoto,
    setCoverPhoto,
  ] =
    useState<string | null>(
      () =>
        draft.coverPhoto ??
        null,
    );

  const [
    logo,
    setLogo,
  ] =
    useState<string | null>(
      () =>
        draft.logo ??
        null,
    );

  const [
    pickingType,
    setPickingType,
  ] =
    useState<PhotoType | null>(
      null,
    );

  const [
    error,
    setError,
  ] = useState('');

  const isPickingImage =
    pickingType !== null;

  const canContinue =
    Boolean(
      coverPhoto &&
        logo,
    );

  /* ==========================================================
     UPDATE PHOTO

     Keep local screen state and registration draft synchronized.
  ========================================================== */

  const commitPhoto =
    useCallback(
      (
        type: PhotoType,
        uri: string | null,
      ) => {
        if (
          type === 'cover'
        ) {
          setCoverPhoto(
            uri,
          );

          updateDraft({
            coverPhoto:
              uri,
          });

          return;
        }

        setLogo(
          uri,
        );

        updateDraft({
          logo: uri,
        });
      },
      [
        updateDraft,
      ],
    );

  /* ==========================================================
     PICK IMAGE
  ========================================================== */

  const pickImage =
    useCallback(
      async (
        type: PhotoType,
      ) => {
        if (
          isPickingImage
        ) {
          return;
        }

        try {
          setError('');

          setPickingType(
            type,
          );

          const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

          if (
            !permission.granted
          ) {
            Alert.alert(
              'Photo Permission Required',
              'Allow Fixxam to access your photos so you can add shop images.',
            );

            return;
          }

          const result =
            await ImagePicker.launchImageLibraryAsync(
              {
                mediaTypes: [
                  'images',
                ],

                allowsEditing:
                  true,

                aspect:
                  type ===
                  'cover'
                    ? [16, 9]
                    : [1, 1],

                quality:
                  0.85,
              },
            );

          if (
            result.canceled
          ) {
            return;
          }

          const asset =
            result.assets?.[0];

          const uri =
            asset?.uri?.trim();

          if (!uri) {
            Alert.alert(
              'Unable to Use Photo',
              'The selected image could not be loaded. Please choose another image.',
            );

            return;
          }

          commitPhoto(
            type,
            uri,
          );

          setError('');
        } catch (pickError) {
          console.error(
            'Shop photo picker failed:',
            pickError,
          );

          Alert.alert(
            'Unable to Select Photo',
            'Something went wrong while selecting the image. Please try again.',
          );
        } finally {
          setPickingType(
            null,
          );
        }
      },
      [
        commitPhoto,
        isPickingImage,
      ],
    );

  /* ==========================================================
     REMOVE PHOTO
  ========================================================== */

  const removePhoto =
    useCallback(
      (
        type: PhotoType,
      ) => {
        if (
          isPickingImage
        ) {
          return;
        }

        const title =
          type === 'cover'
            ? 'Remove Cover Photo'
            : 'Remove Shop Logo';

        const message =
          type === 'cover'
            ? 'Are you sure you want to remove the cover photo?'
            : 'Are you sure you want to remove the shop logo?';

        Alert.alert(
          title,
          message,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Remove',
              style:
                'destructive',

              onPress: () => {
                commitPhoto(
                  type,
                  null,
                );

                setError('');
              },
            },
          ],
        );
      },
      [
        commitPhoto,
        isPickingImage,
      ],
    );

  /* ==========================================================
     NEXT
  ========================================================== */

  const handleNext =
    useCallback(() => {
      const normalizedCoverPhoto =
        coverPhoto?.trim();

      const normalizedLogo =
        logo?.trim();

      if (
        !normalizedCoverPhoto
      ) {
        setError(
          'Add a cover photo for your shop.',
        );

        return;
      }

      if (
        !normalizedLogo
      ) {
        setError(
          'Add your shop logo or profile photo.',
        );

        return;
      }

      /*
       * commitPhoto keeps the draft synchronized.
       * This final update guarantees the latest values before
       * navigation.
       */
      updateDraft({
        coverPhoto:
          normalizedCoverPhoto,

        logo:
          normalizedLogo,
      });

      setError('');

      router.push(
        '/my-shop/create/services',
      );
    }, [
      coverPhoto,
      logo,
      updateDraft,
    ]);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <SafeAreaView
      edges={[
        'top',
        'bottom',
      ]}
      style={
        styles.safeArea
      }
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={
          styles.header
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityState={{
            disabled:
              isPickingImage,
          }}
          disabled={
            isPickingImage
          }
          hitSlop={10}
          onPress={() =>
            router.back()
          }
          style={({
            pressed,
          }) => [
            styles.backButton,

            isPickingImage &&
              styles.disabledControl,

            pressed &&
              !isPickingImage &&
              styles.pressed,
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={25}
            color="#1677FF"
          />
        </Pressable>

        <Text
          style={
            styles.headerTitle
          }
        >
          Create My Shop
        </Text>

        <View
          style={
            styles.headerSpacer
          }
        />
      </View>

      <ProgressIndicator />

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <Text
          style={
            styles.title
          }
        >
          Shop Photos
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          Add a cover photo and
          logo so customers can
          easily recognize your
          shop.
        </Text>

        {/* ====================================================
            COVER PHOTO
        ==================================================== */}

        <View
          style={
            styles.section
          }
        >
          <View
            style={
              styles.sectionTitleRow
            }
          >
            <View
              style={
                styles.sectionTitleContent
              }
            >
              <Text
                style={
                  styles.label
                }
              >
                Cover Photo
              </Text>

              <Text
                style={
                  styles.helperText
                }
              >
                This will appear at
                the top of your shop
                profile.
              </Text>
            </View>

            {coverPhoto ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove cover photo"
                accessibilityState={{
                  disabled:
                    isPickingImage,
                }}
                disabled={
                  isPickingImage
                }
                onPress={() =>
                  removePhoto(
                    'cover',
                  )
                }
                hitSlop={8}
                style={({
                  pressed,
                }) => [
                  isPickingImage &&
                    styles.disabledControl,

                  pressed &&
                    !isPickingImage &&
                    styles.pressed,
                ]}
              >
                <Text
                  style={
                    styles.removeText
                  }
                >
                  Remove
                </Text>
              </Pressable>
            ) : null}
          </View>

          {coverPhoto ? (
            <View
              style={
                styles.coverPreviewContainer
              }
            >
              <Image
                source={{
                  uri:
                    coverPhoto,
                }}
                resizeMode="cover"
                style={
                  styles.coverPreview
                }
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Change cover photo"
                accessibilityState={{
                  disabled:
                    isPickingImage,
                  busy:
                    pickingType ===
                    'cover',
                }}
                disabled={
                  isPickingImage
                }
                onPress={() =>
                  pickImage(
                    'cover',
                  )
                }
                style={({
                  pressed,
                }) => [
                  styles.changePhotoButton,

                  isPickingImage &&
                    styles.disabledControl,

                  pressed &&
                    !isPickingImage &&
                    styles.pressed,
                ]}
              >
                {pickingType ===
                'cover' ? (
                  <ActivityIndicator
                    size="small"
                    color="#1677FF"
                  />
                ) : (
                  <Ionicons
                    name="camera-outline"
                    size={20}
                    color="#1677FF"
                  />
                )}

                <Text
                  style={
                    styles.changePhotoText
                  }
                >
                  {pickingType ===
                  'cover'
                    ? 'Opening Photos...'
                    : 'Change Cover Photo'}
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add cover photo"
              accessibilityState={{
                disabled:
                  isPickingImage,
                busy:
                  pickingType ===
                  'cover',
              }}
              disabled={
                isPickingImage
              }
              onPress={() =>
                pickImage(
                  'cover',
                )
              }
              style={({
                pressed,
              }) => [
                styles.coverPlaceholder,

                error &&
                  !coverPhoto &&
                  styles.photoPlaceholderError,

                isPickingImage &&
                  styles.disabledControl,

                pressed &&
                  !isPickingImage &&
                  styles.pressed,
              ]}
            >
              <View
                style={
                  styles.uploadIconContainer
                }
              >
                {pickingType ===
                'cover' ? (
                  <ActivityIndicator
                    size="large"
                    color="#1677FF"
                  />
                ) : (
                  <Ionicons
                    name="image-outline"
                    size={34}
                    color="#1677FF"
                  />
                )}
              </View>

              <Text
                style={
                  styles.uploadTitle
                }
              >
                {pickingType ===
                'cover'
                  ? 'Opening Photos...'
                  : 'Add Cover Photo'}
              </Text>

              <Text
                style={
                  styles.uploadDescription
                }
              >
                Choose a clear photo
                of your shop
              </Text>
            </Pressable>
          )}
        </View>

        {/* ====================================================
            LOGO
        ==================================================== */}

        <View
          style={
            styles.section
          }
        >
          <View
            style={
              styles.sectionTitleRow
            }
          >
            <View
              style={
                styles.sectionTitleContent
              }
            >
              <Text
                style={
                  styles.label
                }
              >
                Shop Logo / Profile
                Photo
              </Text>

              <Text
                style={
                  styles.helperText
                }
              >
                Use your logo or a
                clear profile image
                for your business.
              </Text>
            </View>

            {logo ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove shop logo"
                accessibilityState={{
                  disabled:
                    isPickingImage,
                }}
                disabled={
                  isPickingImage
                }
                onPress={() =>
                  removePhoto(
                    'logo',
                  )
                }
                hitSlop={8}
                style={({
                  pressed,
                }) => [
                  isPickingImage &&
                    styles.disabledControl,

                  pressed &&
                    !isPickingImage &&
                    styles.pressed,
                ]}
              >
                <Text
                  style={
                    styles.removeText
                  }
                >
                  Remove
                </Text>
              </Pressable>
            ) : null}
          </View>

          <View
            style={[
              styles.logoSection,

              error &&
                !logo &&
                styles.logoSectionError,
            ]}
          >
            {logo ? (
              <Image
                source={{
                  uri: logo,
                }}
                resizeMode="cover"
                style={
                  styles.logoPreview
                }
              />
            ) : (
              <View
                style={
                  styles.logoPlaceholder
                }
              >
                {pickingType ===
                'logo' ? (
                  <ActivityIndicator
                    size="large"
                    color="#1677FF"
                  />
                ) : (
                  <Ionicons
                    name="storefront-outline"
                    size={44}
                    color="#94A3B8"
                  />
                )}
              </View>
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                logo
                  ? 'Change shop logo'
                  : 'Add shop logo'
              }
              accessibilityState={{
                disabled:
                  isPickingImage,
                busy:
                  pickingType ===
                  'logo',
              }}
              disabled={
                isPickingImage
              }
              onPress={() =>
                pickImage(
                  'logo',
                )
              }
              style={({
                pressed,
              }) => [
                styles.logoButton,

                isPickingImage &&
                  styles.disabledControl,

                pressed &&
                  !isPickingImage &&
                  styles.pressed,
              ]}
            >
              {pickingType ===
              'logo' ? (
                <ActivityIndicator
                  size="small"
                  color="#1677FF"
                />
              ) : (
                <Ionicons
                  name="camera-outline"
                  size={20}
                  color="#1677FF"
                />
              )}

              <Text
                style={
                  styles.logoButtonText
                }
              >
                {pickingType ===
                'logo'
                  ? 'Opening Photos...'
                  : logo
                    ? 'Change Logo'
                    : 'Add Logo'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error ? (
          <View
            accessibilityRole="alert"
            style={
              styles.errorBox
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color="#DC2626"
            />

            <Text
              style={
                styles.errorText
              }
            >
              {error}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <View
        style={
          styles.footer
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue to services"
          accessibilityState={{
            disabled:
              !canContinue ||
              isPickingImage,
          }}
          disabled={
            !canContinue ||
            isPickingImage
          }
          onPress={
            handleNext
          }
          style={({
            pressed,
          }) => [
            styles.nextButton,

            (!canContinue ||
              isPickingImage) &&
              styles.nextButtonInactive,

            pressed &&
              canContinue &&
              !isPickingImage &&
              styles.pressed,
          ]}
        >
          <Text
            style={
              styles.nextButtonText
            }
          >
            Next
          </Text>

          <Ionicons
            name="arrow-forward"
            size={21}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

/* ============================================================
   PROGRESS
============================================================ */

function ProgressIndicator() {
  return (
    <View
      style={
        styles.progressContainer
      }
    >
      {[1, 2, 3, 4, 5, 6].map(
        (
          step,
          index,
        ) => {
          const completed =
            step < 3;

          const active =
            step === 3;

          return (
            <React.Fragment
              key={step}
            >
              <View
                style={[
                  styles.progressDot,

                  completed &&
                    styles.progressDotCompleted,

                  active &&
                    styles.progressDotActive,
                ]}
              >
                {completed ? (
                  <Ionicons
                    name="checkmark"
                    size={10}
                    color="#FFFFFF"
                  />
                ) : null}
              </View>

              {index < 5 ? (
                <View
                  style={[
                    styles.progressLine,

                    completed &&
                      styles.progressLineCompleted,
                  ]}
                />
              ) : null}
            </React.Fragment>
          );
        },
      )}
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        '#F8FAFC',
    },

    header: {
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
    },

    backButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 17,
      backgroundColor:
        '#EFF6FF',
    },

    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '800',
      color: '#0F172A',
    },

    headerSpacer: {
      width: 44,
    },

    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 34,
      paddingVertical: 12,
    },

    progressDot: {
      width: 11,
      height: 11,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 7,
      backgroundColor:
        '#DCE5EF',
    },

    progressDotActive: {
      width: 14,
      height: 14,
      backgroundColor:
        '#1677FF',
    },

    progressDotCompleted: {
      width: 14,
      height: 14,
      backgroundColor:
        '#1677FF',
    },

    progressLine: {
      flex: 1,
      height: 2,
      backgroundColor:
        '#DCE5EF',
    },

    progressLineCompleted: {
      backgroundColor:
        '#1677FF',
    },

    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 30,
    },

    title: {
      fontSize: 25,
      fontWeight: '800',
      color: '#0F172A',
    },

    subtitle: {
      marginTop: 5,
      fontSize: 15,
      lineHeight: 22,
      color: '#64748B',
    },

    section: {
      marginTop: 26,
    },

    sectionTitleRow: {
      flexDirection: 'row',
      alignItems:
        'flex-start',
      justifyContent:
        'space-between',
      gap: 12,
      marginBottom: 11,
    },

    sectionTitleContent: {
      flex: 1,
      minWidth: 0,
    },

    label: {
      fontSize: 16,
      fontWeight: '800',
      color: '#0F172A',
    },

    helperText: {
      maxWidth: 290,
      marginTop: 4,
      fontSize: 13,
      lineHeight: 19,
      color: '#64748B',
    },

    removeText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#DC2626',
    },

    coverPreviewContainer: {
      overflow: 'hidden',
      borderWidth: 1,
      borderColor:
        '#E2E8F0',
      borderRadius: 20,
      backgroundColor:
        '#FFFFFF',
    },

    coverPreview: {
      width: '100%',
      aspectRatio: 16 / 9,
      backgroundColor:
        '#E2E8F0',
    },

    changePhotoButton: {
      minHeight: 54,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 8,
      backgroundColor:
        '#EFF6FF',
    },

    changePhotoText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#1677FF',
    },

    coverPlaceholder: {
      minHeight: 220,
      alignItems: 'center',
      justifyContent:
        'center',
      paddingHorizontal: 24,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor:
        '#BFDBFE',
      borderRadius: 20,
      backgroundColor:
        '#F8FBFF',
    },

    photoPlaceholderError: {
      borderColor:
        '#EF4444',
    },

    uploadIconContainer: {
      width: 70,
      height: 70,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 24,
      backgroundColor:
        '#EFF6FF',
    },

    uploadTitle: {
      marginTop: 14,
      fontSize: 16,
      fontWeight: '800',
      color: '#1677FF',
    },

    uploadDescription: {
      marginTop: 5,
      textAlign: 'center',
      fontSize: 13,
      color: '#64748B',
    },

    logoSection: {
      alignItems: 'center',
      paddingVertical: 20,
      borderWidth: 1,
      borderColor:
        '#E2E8F0',
      borderRadius: 20,
      backgroundColor:
        '#FFFFFF',
    },

    logoSectionError: {
      borderColor:
        '#EF4444',
    },

    logoPreview: {
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor:
        '#E2E8F0',
    },

    logoPlaceholder: {
      width: 140,
      height: 140,
      alignItems: 'center',
      justifyContent:
        'center',
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor:
        '#CBD5E1',
      borderRadius: 70,
      backgroundColor:
        '#F8FAFC',
    },

    logoButton: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 7,
      marginTop: 16,
      paddingHorizontal: 22,
      borderRadius: 16,
      backgroundColor:
        '#EFF6FF',
    },

    logoButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#1677FF',
    },

    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      marginTop: 20,
      padding: 12,
      borderRadius: 14,
      backgroundColor:
        '#FEF2F2',
    },

    errorText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 19,
      color: '#DC2626',
    },

    footer: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 14,
      borderTopWidth: 1,
      borderTopColor:
        '#E2E8F0',
      backgroundColor:
        '#FFFFFF',
    },

    nextButton: {
      minHeight: 58,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 9,
      borderRadius: 18,
      backgroundColor:
        '#1677FF',
    },

    nextButtonInactive: {
      opacity: 0.5,
    },

    nextButtonText: {
      fontSize: 17,
      fontWeight: '800',
      color: '#FFFFFF',
    },

    disabledControl: {
      opacity: 0.55,
    },

    pressed: {
      opacity: 0.72,
    },
  });