import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { WorkerShopService } from '../../../types/workerShop';

/* ============================================================
   LIMITS

   Keep these aligned with shopService.ts validation.
============================================================ */

const MIN_SERVICE_NAME_LENGTH = 1;
const MAX_SERVICE_NAME_LENGTH = 100;

const MIN_SERVICE_DESCRIPTION_LENGTH = 1;
const MAX_SERVICE_DESCRIPTION_LENGTH = 1000;

const MAX_SERVICE_PRICE = 100_000_000;

/* ============================================================
   TYPES
============================================================ */

type Props = {
  visible: boolean;
  service?: WorkerShopService | null;
  onClose: () => void;
  onSave: (
    service: WorkerShopService,
  ) => void;
};

type FormErrors = {
  name?: string;
  description?: string;
  price?: string;
  image?: string;
};

/* ============================================================
   HELPERS
============================================================ */

function createTemporaryId(): string {
  const randomPart =
    Math.random()
      .toString(36)
      .slice(2, 10);

  return `service-${Date.now()}-${randomPart}`;
}

function sanitizePriceInput(
  value: string,
): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 9);
}

function parsePrice(
  value: string,
): number {
  const digits =
    value.replace(/\D/g, '');

  if (!digits) {
    return 0;
  }

  const parsed =
    Number(digits);

  if (
    !Number.isFinite(parsed)
  ) {
    return 0;
  }

  return parsed;
}

function formatPriceInput(
  value: string,
): string {
  const parsed =
    parsePrice(value);

  if (parsed <= 0) {
    return value;
  }

  return parsed.toLocaleString(
    'en-NG',
  );
}

/* ============================================================
   COMPONENT
============================================================ */

export function ServiceEditorModal({
  visible,
  service,
  onClose,
  onSave,
}: Props) {
  const [
    name,
    setName,
  ] = useState('');

  const [
    description,
    setDescription,
  ] = useState('');

  const [
    price,
    setPrice,
  ] = useState('');

  const [
    imageUri,
    setImageUri,
  ] =
    useState<string | null>(
      null,
    );

  const [
    errors,
    setErrors,
  ] =
    useState<FormErrors>(
      {},
    );

  const [
    isPickingImage,
    setIsPickingImage,
  ] = useState(false);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  /* ==========================================================
     RESET / HYDRATE FORM
  ========================================================== */

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (service) {
      setName(
        service.name,
      );

      setDescription(
        service.description,
      );

      setPrice(
        String(
          service.startingPrice,
        ),
      );

      setImageUri(
        service.imageUri,
      );
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setImageUri(null);
    }

    setErrors({});
    setIsPickingImage(false);
    setIsSaving(false);
  }, [
    service,
    visible,
  ]);

  /* ==========================================================
     DERIVED VALUES
  ========================================================== */

  const parsedPrice =
    useMemo(
      () =>
        parsePrice(price),
      [price],
    );

  const formattedPrice =
    useMemo(
      () =>
        formatPriceInput(
          price,
        ),
      [price],
    );

  /* ==========================================================
     IMAGE PICKER
  ========================================================== */

  const handlePickImage =
    useCallback(async () => {
      if (
        isPickingImage ||
        isSaving
      ) {
        return;
      }

      try {
        setIsPickingImage(
          true,
        );

        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (
          !permission.granted
        ) {
          Alert.alert(
            'Photo Permission Required',
            'Allow Fixxam to access your photos so you can add a service image.',
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
              aspect: [
                4,
                3,
              ],
              quality: 0.85,
            },
          );

        if (
          result.canceled
        ) {
          return;
        }

        const asset =
          result.assets?.[0];

        const nextUri =
          asset?.uri?.trim();

        if (!nextUri) {
          Alert.alert(
            'Unable to Select Photo',
            'The selected photo could not be loaded. Please choose another photo.',
          );

          return;
        }

        setImageUri(
          nextUri,
        );

        setErrors(
          (current) => ({
            ...current,
            image:
              undefined,
          }),
        );
      } catch (error) {
        console.error(
          'Service image picker failed:',
          error,
        );

        Alert.alert(
          'Unable to Select Photo',
          'Please try again.',
        );
      } finally {
        setIsPickingImage(
          false,
        );
      }
    }, [
      isPickingImage,
      isSaving,
    ]);

  /* ==========================================================
     VALIDATION
  ========================================================== */

  const validate =
    useCallback((): boolean => {
      const nextErrors: FormErrors =
        {};

      const normalizedName =
        name.trim();

      const normalizedDescription =
        description.trim();

      const normalizedImageUri =
        imageUri?.trim() ??
        '';

      if (
        normalizedName.length <
        MIN_SERVICE_NAME_LENGTH
      ) {
        nextErrors.name =
          'Enter a service name.';
      } else if (
        normalizedName.length >
        MAX_SERVICE_NAME_LENGTH
      ) {
        nextErrors.name =
          `Service name cannot exceed ${MAX_SERVICE_NAME_LENGTH} characters.`;
      }

      if (
        normalizedDescription.length <
        MIN_SERVICE_DESCRIPTION_LENGTH
      ) {
        nextErrors.description =
          'Enter a service description.';
      } else if (
        normalizedDescription.length >
        MAX_SERVICE_DESCRIPTION_LENGTH
      ) {
        nextErrors.description =
          `Description cannot exceed ${MAX_SERVICE_DESCRIPTION_LENGTH} characters.`;
      }

      if (
        parsedPrice <= 0
      ) {
        nextErrors.price =
          'Enter a valid starting price.';
      } else if (
        parsedPrice >
        MAX_SERVICE_PRICE
      ) {
        nextErrors.price =
          'Starting price cannot exceed ₦100,000,000.';
      }

      if (
        !normalizedImageUri
      ) {
        nextErrors.image =
          'Add a service photo.';
      }

      setErrors(
        nextErrors,
      );

      return (
        Object.keys(
          nextErrors,
        ).length === 0
      );
    }, [
      description,
      imageUri,
      name,
      parsedPrice,
    ]);

  /* ==========================================================
     SAVE
  ========================================================== */

  const handleSave =
    useCallback(() => {
      if (
        isSaving ||
        isPickingImage
      ) {
        return;
      }

      if (
        !validate()
      ) {
        return;
      }

      const normalizedImageUri =
        imageUri?.trim();

      if (
        !normalizedImageUri
      ) {
        return;
      }

      setIsSaving(
        true,
      );

      try {
        const nextService: WorkerShopService =
          {
            id:
              service?.id ??
              createTemporaryId(),

            name:
              name.trim(),

            description:
              description.trim(),

            startingPrice:
              parsedPrice,

            imageUri:
              normalizedImageUri,

            isActive:
              service?.isActive ??
              true,
          };

        onSave(
          nextService,
        );
      } catch (error) {
        console.error(
          'Service editor save failed:',
          error,
        );

        Alert.alert(
          'Unable to Save Service',
          'Please check the service details and try again.',
        );

        setIsSaving(
          false,
        );
      }
    }, [
      description,
      imageUri,
      isPickingImage,
      isSaving,
      name,
      onSave,
      parsedPrice,
      service,
      validate,
    ]);

  /* ==========================================================
     CLOSE
  ========================================================== */

  const handleClose =
    useCallback(() => {
      if (
        isSaving ||
        isPickingImage
      ) {
        return;
      }

      onClose();
    }, [
      isPickingImage,
      isSaving,
      onClose,
    ]);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <Modal
      visible={
        visible
      }
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={
        handleClose
      }
    >
      <View
        style={
          styles.root
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close service editor"
          disabled={
            isSaving ||
            isPickingImage
          }
          style={
            styles.backdrop
          }
          onPress={
            handleClose
          }
        />

        <KeyboardAvoidingView
          behavior={
            Platform.OS ===
            'ios'
              ? 'padding'
              : undefined
          }
          style={
            styles.keyboard
          }
        >
          <View
            style={
              styles.sheet
            }
          >
            <View
              style={
                styles.handle
              }
            />

            {/* ==================================================
                HEADER
            ================================================== */}

            <View
              style={
                styles.header
              }
            >
              <View
                style={
                  styles.headerText
                }
              >
                <Text
                  style={
                    styles.title
                  }
                >
                  {service
                    ? 'Edit Service'
                    : 'Add Service'}
                </Text>

                <Text
                  style={
                    styles.subtitle
                  }
                >
                  Add the service
                  customers can book
                  from your shop.
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close service editor"
                hitSlop={8}
                disabled={
                  isSaving ||
                  isPickingImage
                }
                onPress={
                  handleClose
                }
                style={({
                  pressed,
                }) => [
                  styles.closeButton,

                  (isSaving ||
                    isPickingImage) &&
                    styles.disabledControl,

                  pressed &&
                    !isSaving &&
                    !isPickingImage &&
                    styles.pressed,
                ]}
              >
                <Ionicons
                  name="close"
                  size={23}
                  color="#334155"
                />
              </Pressable>
            </View>

            {/* ==================================================
                FORM
            ================================================== */}

            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.content
              }
            >
              {/* ================================================
                  PHOTO
              ================================================ */}

              <Text
                style={
                  styles.label
                }
              >
                Service Photo
              </Text>

              {imageUri ? (
                <View
                  style={
                    styles.imageBox
                  }
                >
                  <Image
                    source={{
                      uri:
                        imageUri,
                    }}
                    style={
                      styles.image
                    }
                    resizeMode="cover"
                  />

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Change service photo"
                    disabled={
                      isPickingImage ||
                      isSaving
                    }
                    onPress={
                      handlePickImage
                    }
                    style={({
                      pressed,
                    }) => [
                      styles.changePhoto,

                      (isPickingImage ||
                        isSaving) &&
                        styles.disabledControl,

                      pressed &&
                        !isPickingImage &&
                        !isSaving &&
                        styles.pressed,
                    ]}
                  >
                    {isPickingImage ? (
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

                    <Text
                      style={
                        styles.changePhotoText
                      }
                    >
                      {isPickingImage
                        ? 'Opening Photos...'
                        : 'Change Photo'}
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Add service photo"
                  disabled={
                    isPickingImage ||
                    isSaving
                  }
                  onPress={
                    handlePickImage
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.imagePlaceholder,

                    errors.image &&
                      styles.imagePlaceholderError,

                    (isPickingImage ||
                      isSaving) &&
                      styles.disabledControl,

                    pressed &&
                      !isPickingImage &&
                      !isSaving &&
                      styles.pressed,
                  ]}
                >
                  {isPickingImage ? (
                    <ActivityIndicator
                      size="large"
                      color="#1677FF"
                    />
                  ) : (
                    <Ionicons
                      name="image-outline"
                      size={35}
                      color="#1677FF"
                    />
                  )}

                  <Text
                    style={
                      styles.addPhotoText
                    }
                  >
                    {isPickingImage
                      ? 'Opening Photos...'
                      : 'Add Service Photo'}
                  </Text>
                </Pressable>
              )}

              <ErrorMessage
                message={
                  errors.image
                }
              />

              {/* ================================================
                  NAME
              ================================================ */}

              <View
                style={
                  styles.labelRow
                }
              >
                <Text
                  style={
                    styles.formLabel
                  }
                >
                  Service Name
                </Text>

                <Text
                  style={
                    styles.fieldCounter
                  }
                >
                  {name.length}/
                  {MAX_SERVICE_NAME_LENGTH}
                </Text>
              </View>

              <View
                style={[
                  styles.inputContainer,

                  errors.name &&
                    styles.inputError,
                ]}
              >
                <Ionicons
                  name="construct-outline"
                  size={21}
                  color="#1677FF"
                />

                <TextInput
                  value={
                    name
                  }
                  editable={
                    !isSaving
                  }
                  onChangeText={(
                    value,
                  ) => {
                    setName(
                      value,
                    );

                    setErrors(
                      (
                        current,
                      ) => ({
                        ...current,
                        name:
                          undefined,
                      }),
                    );
                  }}
                  placeholder="e.g. Oil Change"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="words"
                  autoCorrect
                  returnKeyType="next"
                  maxLength={
                    MAX_SERVICE_NAME_LENGTH
                  }
                  style={
                    styles.input
                  }
                />
              </View>

              <ErrorMessage
                message={
                  errors.name
                }
              />

              {/* ================================================
                  DESCRIPTION
              ================================================ */}

              <View
                style={
                  styles.labelRow
                }
              >
                <Text
                  style={
                    styles.formLabel
                  }
                >
                  Description
                </Text>

                <Text
                  style={
                    styles.fieldCounter
                  }
                >
                  {
                    description.length
                  }
                  /
                  {
                    MAX_SERVICE_DESCRIPTION_LENGTH
                  }
                </Text>
              </View>

              <View
                style={[
                  styles.textAreaContainer,

                  errors.description &&
                    styles.inputError,
                ]}
              >
                <TextInput
                  multiline
                  value={
                    description
                  }
                  editable={
                    !isSaving
                  }
                  onChangeText={(
                    value,
                  ) => {
                    setDescription(
                      value,
                    );

                    setErrors(
                      (
                        current,
                      ) => ({
                        ...current,
                        description:
                          undefined,
                      }),
                    );
                  }}
                  placeholder="Describe what is included in this service..."
                  placeholderTextColor="#94A3B8"
                  maxLength={
                    MAX_SERVICE_DESCRIPTION_LENGTH
                  }
                  textAlignVertical="top"
                  style={
                    styles.textArea
                  }
                />
              </View>

              <ErrorMessage
                message={
                  errors.description
                }
              />

              {/* ================================================
                  PRICE
              ================================================ */}

              <Text
                style={
                  styles.formLabelStandalone
                }
              >
                Starting Price
              </Text>

              <View
                style={[
                  styles.inputContainer,

                  errors.price &&
                    styles.inputError,
                ]}
              >
                <Text
                  style={
                    styles.currency
                  }
                >
                  ₦
                </Text>

                <TextInput
                  value={
                    price
                  }
                  editable={
                    !isSaving
                  }
                  onChangeText={(
                    value,
                  ) => {
                    const nextValue =
                      sanitizePriceInput(
                        value,
                      );

                    setPrice(
                      nextValue,
                    );

                    setErrors(
                      (
                        current,
                      ) => ({
                        ...current,
                        price:
                          undefined,
                      }),
                    );
                  }}
                  placeholder="8000"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  inputMode="numeric"
                  maxLength={9}
                  style={
                    styles.input
                  }
                />
              </View>

              {parsedPrice > 0 ? (
                <Text
                  style={
                    styles.pricePreview
                  }
                >
                  ₦
                  {
                    formattedPrice
                  }
                </Text>
              ) : null}

              <ErrorMessage
                message={
                  errors.price
                }
              />

              {/* ================================================
                  SAVE
              ================================================ */}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  service
                    ? 'Save service changes'
                    : 'Add service'
                }
                accessibilityState={{
                  disabled:
                    isSaving ||
                    isPickingImage,
                  busy:
                    isSaving,
                }}
                disabled={
                  isSaving ||
                  isPickingImage
                }
                onPress={
                  handleSave
                }
                style={({
                  pressed,
                }) => [
                  styles.saveButton,

                  (isSaving ||
                    isPickingImage) &&
                    styles.saveButtonDisabled,

                  pressed &&
                    !isSaving &&
                    !isPickingImage &&
                    styles.pressed,
                ]}
              >
                {isSaving ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Ionicons
                    name="checkmark"
                    size={22}
                    color="#FFFFFF"
                  />
                )}

                <Text
                  style={
                    styles.saveButtonText
                  }
                >
                  {isSaving
                    ? 'Saving...'
                    : service
                      ? 'Save Changes'
                      : 'Add Service'}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

/* ============================================================
   ERROR MESSAGE
============================================================ */

function ErrorMessage({
  message,
}: {
  message?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <View
      accessibilityRole="alert"
      style={
        styles.errorRow
      }
    >
      <Ionicons
        name="alert-circle-outline"
        size={15}
        color="#DC2626"
      />

      <Text
        style={
          styles.errorText
        }
      >
        {message}
      </Text>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    root: {
      flex: 1,
      justifyContent:
        'flex-end',
    },

    backdrop: {
      ...StyleSheet.absoluteFillObject,

      backgroundColor:
        'rgba(15, 23, 42, 0.45)',
    },

    keyboard: {
      justifyContent:
        'flex-end',
    },

    sheet: {
      maxHeight: '90%',
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      backgroundColor:
        '#FFFFFF',
    },

    handle: {
      width: 44,
      height: 5,
      alignSelf: 'center',
      marginTop: 10,
      borderRadius: 999,
      backgroundColor:
        '#CBD5E1',
    },

    header: {
      flexDirection: 'row',
      alignItems:
        'flex-start',
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 12,
    },

    headerText: {
      flex: 1,
      paddingRight: 12,
    },

    title: {
      fontSize: 22,
      fontWeight: '800',
      color: '#0F172A',
    },

    subtitle: {
      marginTop: 4,
      fontSize: 14,
      lineHeight: 20,
      color: '#64748B',
    },

    closeButton: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 21,
      backgroundColor:
        '#F1F5F9',
    },

    content: {
      paddingHorizontal: 20,
      paddingBottom: 36,
    },

    label: {
      marginTop: 10,
      marginBottom: 9,
      fontSize: 15,
      fontWeight: '700',
      color: '#0F172A',
    },

    labelRow: {
      flexDirection: 'row',
      alignItems:
        'flex-end',
      justifyContent:
        'space-between',
      gap: 12,
      marginTop: 20,
      marginBottom: 8,
    },

    formLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: '700',
      color: '#0F172A',
    },

    formLabelStandalone: {
      marginTop: 20,
      marginBottom: 8,
      fontSize: 15,
      fontWeight: '700',
      color: '#0F172A',
    },

    fieldCounter: {
      fontSize: 12,
      color: '#64748B',
    },

    imageBox: {
      overflow: 'hidden',
      borderRadius: 18,
      backgroundColor:
        '#F8FAFC',
    },

    image: {
      width: '100%',
      height: 190,
      backgroundColor:
        '#E2E8F0',
    },

    changePhoto: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 7,
      backgroundColor:
        '#EFF6FF',
    },

    changePhotoText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#1677FF',
    },

    imagePlaceholder: {
      height: 170,
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 10,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor:
        '#BFDBFE',
      borderRadius: 18,
      backgroundColor:
        '#F8FBFF',
    },

    imagePlaceholderError: {
      borderColor:
        '#EF4444',
    },

    addPhotoText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#1677FF',
    },

    inputContainer: {
      minHeight: 58,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 15,
      borderWidth: 1,
      borderColor:
        '#D7E0EB',
      borderRadius: 16,
    },

    inputError: {
      borderColor:
        '#EF4444',
    },

    input: {
      flex: 1,
      height: 56,
      fontSize: 15,
      color: '#0F172A',
    },

    currency: {
      fontSize: 20,
      fontWeight: '800',
      color: '#1677FF',
    },

    textAreaContainer: {
      minHeight: 150,
      borderWidth: 1,
      borderColor:
        '#D7E0EB',
      borderRadius: 16,
    },

    textArea: {
      minHeight: 148,
      paddingHorizontal: 15,
      paddingTop: 14,
      paddingBottom: 14,
      fontSize: 15,
      lineHeight: 21,
      color: '#0F172A',
    },

    pricePreview: {
      marginTop: 7,
      fontSize: 13,
      fontWeight: '700',
      color: '#64748B',
    },

    errorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 6,
    },

    errorText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 17,
      color: '#DC2626',
    },

    saveButton: {
      minHeight: 58,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 8,
      marginTop: 28,
      borderRadius: 18,
      backgroundColor:
        '#1677FF',
    },

    saveButtonDisabled: {
      opacity: 0.6,
    },

    saveButtonText: {
      fontSize: 16,
      fontWeight: '800',
      color: '#FFFFFF',
    },

    disabledControl: {
      opacity: 0.55,
    },

    pressed: {
      opacity: 0.75,
    },
  });