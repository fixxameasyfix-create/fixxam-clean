import { Ionicons } from '@expo/vector-icons';
import React, {
  memo,
  useCallback,
} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

/* ============================================================
   TYPES
============================================================ */

type BookingDetailsFieldsProps = {
  description: string;
  maxDescriptionLength: number;

  photoUris: string[];
  maxPhotos: number;

  isPickingPhotos: boolean;
  isSubmitting: boolean;

  canSendRequest: boolean;
  hasValidDate: boolean;
  hasValidTime: boolean;

  onDescriptionChange: (
    value: string,
  ) => void;

  onAddPhoto: () => void;

  onRemovePhoto: (
    uri: string,
  ) => void;

  onSendRequest: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

function BookingDetailsFields({
  description,
  maxDescriptionLength,
  photoUris,
  maxPhotos,
  isPickingPhotos,
  isSubmitting,
  canSendRequest,
  hasValidDate,
  hasValidTime,
  onDescriptionChange,
  onAddPhoto,
  onRemovePhoto,
  onSendRequest,
}: BookingDetailsFieldsProps) {
  const handleDescriptionChange =
    useCallback(
      (value: string) => {
        onDescriptionChange(
          value.slice(
            0,
            maxDescriptionLength,
          ),
        );
      },
      [
        maxDescriptionLength,
        onDescriptionChange,
      ],
    );

  const canAddMorePhotos =
    photoUris.length < maxPhotos;

  const photoControlsDisabled =
    isSubmitting ||
    isPickingPhotos;

  return (
    <>
      {/* ======================================================
          DESCRIPTION
      ====================================================== */}

      <View
        style={styles.formSection}
      >
        <View
          style={styles.labelRow}
        >
          <Text style={styles.label}>
            Describe what you need
          </Text>

          <View
            style={
              styles.optionalBadge
            }
          >
            <Text
              style={
                styles.optionalText
              }
            >
              Optional
            </Text>
          </View>
        </View>

        <View
          style={
            styles.textAreaContainer
          }
        >
          <TextInput
            accessibilityLabel="Describe what you need"
            accessibilityHint="Add optional details about the service you need"
            editable={
              !isSubmitting
            }
            multiline
            value={description}
            onChangeText={
              handleDescriptionChange
            }
            maxLength={
              maxDescriptionLength
            }
            textAlignVertical="top"
            placeholder="Tell the provider more about what you need..."
            placeholderTextColor="#94A3B8"
            style={
              styles.textArea
            }
          />

          <Text
            style={
              styles.counter
            }
          >
            {description.length}/
            {maxDescriptionLength}
          </Text>
        </View>
      </View>

      {/* ======================================================
          PHOTOS — COMPACT
      ====================================================== */}

      <View
        style={
          styles.photoSection
        }
      >
        <View
          style={
            styles.photoHeader
          }
        >
          <View
            style={
              styles.photoTitleRow
            }
          >
            <Ionicons
              name="image-outline"
              size={20}
              color="#1677FF"
            />

            <Text
              style={
                styles.photoTitle
              }
            >
              Photos
            </Text>

            <Text
              style={
                styles.photoOptional
              }
            >
              Optional
            </Text>
          </View>

          <Text
            style={
              styles.photoLimit
            }
          >
            {photoUris.length}/
            {maxPhotos}
          </Text>
        </View>

        <Text
          style={
            styles.photoHelpText
          }
        >
          Add photos to help the
          provider understand the
          job.
        </Text>

        <View
          style={
            styles.photoControls
          }
        >
          {/* ==================================================
              TINY ADD PHOTO BUTTON
          ================================================== */}

          {canAddMorePhotos ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add request photos"
              accessibilityHint={`Add up to ${maxPhotos} photos to your request`}
              accessibilityState={{
                busy:
                  isPickingPhotos,
                disabled:
                  photoControlsDisabled,
              }}
              disabled={
                photoControlsDisabled
              }
              onPress={
                onAddPhoto
              }
              style={({
                pressed,
              }) => [
                styles.addPhotoButton,

                photoControlsDisabled &&
                  styles.controlDisabled,

                pressed &&
                  !photoControlsDisabled &&
                  styles.pressed,
              ]}
            >
              <View
                style={
                  styles.addPhotoIcon
                }
              >
                {isPickingPhotos ? (
                  <ActivityIndicator
                    size="small"
                    color="#1677FF"
                  />
                ) : (
                  <Ionicons
                    name="camera-outline"
                    size={19}
                    color="#1677FF"
                  />
                )}
              </View>

              <Text
                style={
                  styles.addPhotoText
                }
              >
                {isPickingPhotos
                  ? 'Opening...'
                  : 'Add Photos'}
              </Text>

              {!isPickingPhotos ? (
                <Ionicons
                  name="add"
                  size={17}
                  color="#1677FF"
                />
              ) : null}
            </Pressable>
          ) : (
            <View
              style={
                styles.photoLimitReached
              }
            >
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#16A34A"
              />

              <Text
                style={
                  styles.photoLimitReachedText
                }
              >
                Photo limit reached
              </Text>
            </View>
          )}
        </View>

        {/* ====================================================
            SMALL PHOTO THUMBNAILS
        ==================================================== */}

        {photoUris.length > 0 ? (
          <ScrollView
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={
              false
            }
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              styles.photoList
            }
          >
            {photoUris.map(
              (uri) => (
                <View
                  key={uri}
                  style={
                    styles.photoPreviewContainer
                  }
                >
                  <Image
                    source={{
                      uri,
                    }}
                    resizeMode="cover"
                    style={
                      styles.photoPreview
                    }
                  />

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Remove photo"
                    accessibilityHint="Removes this photo from your request"
                    accessibilityState={{
                      disabled:
                        photoControlsDisabled,
                    }}
                    disabled={
                      photoControlsDisabled
                    }
                    hitSlop={5}
                    onPress={() =>
                      onRemovePhoto(
                        uri,
                      )
                    }
                    style={({
                      pressed,
                    }) => [
                      styles.removePhotoButton,

                      photoControlsDisabled &&
                        styles.controlDisabled,

                      pressed &&
                        !photoControlsDisabled &&
                        styles.pressed,
                    ]}
                  >
                    <Ionicons
                      name="close"
                      size={14}
                      color="#FFFFFF"
                    />
                  </Pressable>
                </View>
              ),
            )}
          </ScrollView>
        ) : null}

        <Text
          style={
            styles.photoSizeHint
          }
        >
          Maximum 5 MB per photo
        </Text>
      </View>

      {/* ======================================================
          SEND REQUEST
      ====================================================== */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Send service request"
        accessibilityHint="Sends this booking request to the service provider"
        accessibilityState={{
          disabled:
            !canSendRequest,
          busy:
            isSubmitting,
        }}
        disabled={
          !canSendRequest
        }
        onPress={
          onSendRequest
        }
        style={({
          pressed,
        }) => [
          styles.sendButton,

          !canSendRequest &&
            styles.sendButtonDisabled,

          pressed &&
            canSendRequest &&
            styles.pressed,
        ]}
      >
        {isSubmitting ? (
          <ActivityIndicator
            size="small"
            color="#FFFFFF"
          />
        ) : (
          <Ionicons
            name="paper-plane"
            size={22}
            color="#FFFFFF"
          />
        )}

        <Text
          style={
            styles.sendButtonText
          }
        >
          {isSubmitting
            ? 'Sending Request...'
            : 'Send Request'}
        </Text>
      </Pressable>

      {!hasValidDate ||
      !hasValidTime ? (
        <Text
          style={
            styles.requirementText
          }
        >
          Select an available date
          and time to send your
          request.
        </Text>
      ) : null}

      <Text
        style={
          styles.footerText
        }
      >
        The provider can accept or
        decline your request.
      </Text>
    </>
  );
}

export default memo(
  BookingDetailsFields,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    formSection: {
      marginTop: 20,
    },

    labelRow: {
      flexDirection:
        'row',

      alignItems:
        'center',

      gap: 8,
    },

    label: {
      fontSize: 17,

      fontWeight:
        '800',

      color:
        '#0F172A',
    },

    optionalBadge: {
      paddingHorizontal: 8,

      paddingVertical: 3,

      borderRadius: 999,

      backgroundColor:
        '#F1F5F9',
    },

    optionalText: {
      fontSize: 11,

      fontWeight:
        '600',

      color:
        '#64748B',
    },

    /* ========================================================
       DESCRIPTION
    ======================================================== */

    textAreaContainer: {
      minHeight: 132,

      marginTop: 9,

      borderWidth: 1,

      borderColor:
        '#D7E0EB',

      borderRadius: 16,

      backgroundColor:
        '#FFFFFF',
    },

    textArea: {
      minHeight: 100,

      paddingHorizontal: 16,

      paddingTop: 14,

      paddingBottom: 28,

      fontSize: 15,

      lineHeight: 22,

      color:
        '#0F172A',
    },

    counter: {
      position:
        'absolute',

      right: 14,

      bottom: 9,

      fontSize: 12,

      color:
        '#94A3B8',
    },

    /* ========================================================
       PHOTOS
    ======================================================== */

    photoSection: {
      marginTop: 20,
    },

    photoHeader: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      gap: 12,
    },

    photoTitleRow: {
      flex: 1,

      flexDirection:
        'row',

      alignItems:
        'center',

      gap: 6,
    },

    photoTitle: {
      fontSize: 16,

      fontWeight:
        '800',

      color:
        '#0F172A',
    },

    photoOptional: {
      fontSize: 11,

      fontWeight:
        '600',

      color:
        '#94A3B8',
    },

    photoLimit: {
      fontSize: 12,

      fontWeight:
        '700',

      color:
        '#64748B',
    },

    photoHelpText: {
      marginTop: 4,

      fontSize: 12,

      lineHeight: 17,

      color:
        '#64748B',
    },

    photoControls: {
      flexDirection:
        'row',

      alignItems:
        'center',

      marginTop: 10,
    },

    /* ========================================================
       TINY ADD PHOTO BUTTON
    ======================================================== */

    addPhotoButton: {
      minHeight: 42,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap: 6,

      paddingHorizontal: 12,

      borderWidth: 1,

      borderColor:
        '#BFDBFE',

      borderRadius: 13,

      backgroundColor:
        '#EFF6FF',
    },

    addPhotoIcon: {
      width: 22,

      height: 22,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    addPhotoText: {
      fontSize: 13,

      fontWeight:
        '700',

      color:
        '#1677FF',
    },

    photoLimitReached: {
      minHeight: 40,

      flexDirection:
        'row',

      alignItems:
        'center',

      gap: 6,

      paddingHorizontal: 11,

      borderRadius: 12,

      backgroundColor:
        '#F0FDF4',
    },

    photoLimitReachedText: {
      fontSize: 12,

      fontWeight:
        '700',

      color:
        '#16A34A',
    },

    /* ========================================================
       PHOTO PREVIEWS
    ======================================================== */

    photoList: {
      gap: 9,

      paddingTop: 11,

      paddingRight: 4,
    },

    photoPreviewContainer: {
      width: 76,

      height: 76,

      position:
        'relative',
    },

    photoPreview: {
      width: '100%',

      height: '100%',

      borderRadius: 13,

      backgroundColor:
        '#E2E8F0',
    },

    removePhotoButton: {
      position:
        'absolute',

      top: 4,

      right: 4,

      width: 23,

      height: 23,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius: 12,

      backgroundColor:
        'rgba(15,23,42,0.82)',
    },

    photoSizeHint: {
      marginTop: 7,

      fontSize: 11,

      color:
        '#94A3B8',
    },

    /* ========================================================
       SEND REQUEST
    ======================================================== */

    sendButton: {
      minHeight: 58,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap: 9,

      marginTop: 26,

      borderRadius: 29,

      backgroundColor:
        '#1677FF',

      shadowColor:
        '#1677FF',

      shadowOffset: {
        width: 0,
        height: 4,
      },

      shadowOpacity: 0.15,

      shadowRadius: 8,

      elevation: 3,
    },

    sendButtonDisabled: {
      opacity: 0.45,

      shadowOpacity: 0,

      elevation: 0,
    },

    sendButtonText: {
      fontSize: 17,

      fontWeight:
        '800',

      color:
        '#FFFFFF',
    },

    requirementText: {
      marginTop: 9,

      textAlign:
        'center',

      fontSize: 12,

      lineHeight: 18,

      color:
        '#64748B',
    },

    footerText: {
      marginTop: 9,

      textAlign:
        'center',

      fontSize: 12,

      lineHeight: 18,

      color:
        '#94A3B8',
    },

    controlDisabled: {
      opacity: 0.5,
    },

    pressed: {
      opacity: 0.72,
    },
  });