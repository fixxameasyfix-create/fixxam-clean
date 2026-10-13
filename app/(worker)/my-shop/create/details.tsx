import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
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
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  SHOP_CATEGORIES,
  getShopCategory,
  normalizeShopCategoryId,
  type ShopCategoryId,
} from '../../../../constants/shopCategories';

import {
  useShopRegistration,
} from '../../../../contexts/ShopRegistrationContext';

/* ============================================================
   LIMITS
============================================================ */

const SHOP_NAME_MIN_LENGTH = 2;
const SHOP_NAME_MAX_LENGTH = 100;

const DESCRIPTION_MIN_LENGTH = 1;
const DESCRIPTION_MAX_LENGTH = 500;

const PHONE_MIN_LENGTH = 7;
const PHONE_MAX_LENGTH = 30;

/* ============================================================
   TYPES
============================================================ */

type FormErrors = {
  name?: string;
  category?: string;
  description?: string;
  phone?: string;
};

/* ============================================================
   HELPERS
============================================================ */

function sanitizePhoneInput(
  value: string,
): string {
  let sanitized = value.replace(
    /[^0-9+\s()-]/g,
    '',
  );

  /*
   * "+" is only valid at the beginning.
   */
  const hasLeadingPlus =
    sanitized.trimStart().startsWith('+');

  sanitized = sanitized.replace(
    /\+/g,
    '',
  );

  if (hasLeadingPlus) {
    sanitized =
      `+${sanitized.trimStart()}`;
  }

  return sanitized.slice(
    0,
    PHONE_MAX_LENGTH,
  );
}

function normalizePhone(
  value: string,
): string {
  const trimmed =
    value.trim();

  const hasLeadingPlus =
    trimmed.startsWith('+');

  const digits =
    trimmed.replace(
      /\D/g,
      '',
    );

  return hasLeadingPlus
    ? `+${digits}`
    : digits;
}

function isValidPhone(
  value: string,
): boolean {
  const normalized =
    normalizePhone(value);

  const digits =
    normalized.replace(
      /\D/g,
      '',
    );

  return (
    digits.length >=
      PHONE_MIN_LENGTH &&
    digits.length <= 15 &&
    /^\+?\d+$/.test(
      normalized,
    )
  );
}

/* ============================================================
   SCREEN
============================================================ */

export default function ShopDetailsScreen() {
  const {
    draft,
    updateDraft,
  } = useShopRegistration();

  const [
    name,
    setName,
  ] = useState(() =>
    draft.name.slice(
      0,
      SHOP_NAME_MAX_LENGTH,
    ),
  );

  const [
    category,
    setCategory,
  ] = useState<
    ShopCategoryId | ''
  >(() =>
    normalizeShopCategoryId(
      draft.category,
    ),
  );

  const [
    description,
    setDescription,
  ] = useState(() =>
    draft.description.slice(
      0,
      DESCRIPTION_MAX_LENGTH,
    ),
  );

  const [
    phone,
    setPhone,
  ] = useState(() =>
    draft.phone.slice(
      0,
      PHONE_MAX_LENGTH,
    ),
  );

  const [
    categoryModalVisible,
    setCategoryModalVisible,
  ] = useState(false);

  const [
    errors,
    setErrors,
  ] = useState<FormErrors>({});

  /* ==========================================================
     DERIVED STATE
  ========================================================== */

  const selectedCategory =
    useMemo(
      () =>
        getShopCategory(
          category,
        ),
      [category],
    );

  const isFormComplete =
    useMemo(() => {
      const trimmedName =
        name.trim();

      const trimmedDescription =
        description.trim();

      return (
        trimmedName.length >=
          SHOP_NAME_MIN_LENGTH &&
        trimmedName.length <=
          SHOP_NAME_MAX_LENGTH &&
        Boolean(category) &&
        trimmedDescription.length >=
          DESCRIPTION_MIN_LENGTH &&
        trimmedDescription.length <=
          DESCRIPTION_MAX_LENGTH &&
        isValidPhone(phone)
      );
    }, [
      category,
      description,
      name,
      phone,
    ]);

  /* ==========================================================
     ERROR HELPERS
  ========================================================== */

  const clearError =
    useCallback(
      (
        field:
          keyof FormErrors,
      ) => {
        setErrors(
          current => {
            if (
              !current[field]
            ) {
              return current;
            }

            return {
              ...current,
              [field]:
                undefined,
            };
          },
        );
      },
      [],
    );

  /* ==========================================================
     FIELD CHANGES
  ========================================================== */

  const handleNameChange =
    useCallback(
      (value: string) => {
        const nextValue =
          value.slice(
            0,
            SHOP_NAME_MAX_LENGTH,
          );

        setName(nextValue);

        updateDraft({
          name: nextValue,
        });

        clearError(
          'name',
        );
      },
      [
        clearError,
        updateDraft,
      ],
    );

  const handleDescriptionChange =
    useCallback(
      (value: string) => {
        const nextValue =
          value.slice(
            0,
            DESCRIPTION_MAX_LENGTH,
          );

        setDescription(
          nextValue,
        );

        updateDraft({
          description:
            nextValue,
        });

        clearError(
          'description',
        );
      },
      [
        clearError,
        updateDraft,
      ],
    );

  const handlePhoneChange =
    useCallback(
      (value: string) => {
        const nextValue =
          sanitizePhoneInput(
            value,
          );

        setPhone(
          nextValue,
        );

        updateDraft({
          phone: nextValue,
        });

        clearError(
          'phone',
        );
      },
      [
        clearError,
        updateDraft,
      ],
    );

  const handleCategorySelect =
    useCallback(
      (
        value:
          ShopCategoryId,
      ) => {
        setCategory(
          value,
        );

        updateDraft({
          category: value,
        });

        clearError(
          'category',
        );

        setCategoryModalVisible(
          false,
        );
      },
      [
        clearError,
        updateDraft,
      ],
    );

  /* ==========================================================
     VALIDATION
  ========================================================== */

  const validate =
    useCallback(
      (): boolean => {
        const nextErrors:
          FormErrors = {};

        const trimmedName =
          name.trim();

        const trimmedDescription =
          description.trim();

        if (
          trimmedName.length <
          SHOP_NAME_MIN_LENGTH
        ) {
          nextErrors.name =
            'Shop name must contain at least 2 characters.';
        } else if (
          trimmedName.length >
          SHOP_NAME_MAX_LENGTH
        ) {
          nextErrors.name =
            'Shop name is too long.';
        }

        if (!category) {
          nextErrors.category =
            'Choose a shop category.';
        }

        if (
          trimmedDescription.length <
          DESCRIPTION_MIN_LENGTH
        ) {
          nextErrors.description =
            'Enter a shop description.';
        } else if (
          trimmedDescription.length >
          DESCRIPTION_MAX_LENGTH
        ) {
          nextErrors.description =
            'Shop description is too long.';
        }

        if (
          !isValidPhone(
            phone,
          )
        ) {
          nextErrors.phone =
            'Enter a valid phone number.';
        }

        setErrors(
          nextErrors,
        );

        return (
          Object.keys(
            nextErrors,
          ).length === 0
        );
      },
      [
        category,
        description,
        name,
        phone,
      ],
    );

  /* ==========================================================
     NEXT
  ========================================================== */

  const handleNext =
    useCallback(() => {
      if (!validate()) {
        return;
      }

      const normalizedPhone =
        normalizePhone(
          phone,
        );

      /*
       * Final canonical values before moving
       * to the location screen.
       */
      updateDraft({
        name:
          name.trim(),

        category,

        description:
          description.trim(),

        phone:
          normalizedPhone,
      });

      router.push(
        '/my-shop/create/location',
      );
    }, [
      category,
      description,
      name,
      phone,
      updateDraft,
      validate,
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
      <KeyboardAvoidingView
        style={
          styles.flex
        }
        behavior={
          Platform.OS ===
          'ios'
            ? 'padding'
            : undefined
        }
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <View
          style={
            styles.header
          }
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() =>
              router.back()
            }
            hitSlop={10}
            style={({
              pressed,
            }) => [
              styles.backButton,

              pressed &&
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

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.content
          }
        >
          <Text
            style={
              styles.title
            }
          >
            Shop Details
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Tell customers about your shop and
            the type of services you provide.
          </Text>

          <View
            style={
              styles.form
            }
          >
            {/* =================================================
                SHOP NAME
            ================================================= */}

            <FormLabel
              text="Shop Name"
            />

            <View
              style={[
                styles.inputContainer,

                errors.name &&
                  styles.inputError,
              ]}
            >
              <Ionicons
                name="storefront-outline"
                size={21}
                color="#1677FF"
              />

              <TextInput
                value={name}
                onChangeText={
                  handleNameChange
                }
                placeholder="e.g. Speed Auto Care"
                placeholderTextColor="#94A3B8"
                maxLength={
                  SHOP_NAME_MAX_LENGTH
                }
                autoCapitalize="words"
                autoCorrect={
                  false
                }
                returnKeyType="next"
                accessibilityLabel="Shop name"
                style={
                  styles.input
                }
              />
            </View>

            <View
              style={
                styles.fieldMetaRow
              }
            >
              <ErrorMessage
                message={
                  errors.name
                }
              />

              <Text
                style={
                  styles.smallCounter
                }
              >
                {name.length}/
                {SHOP_NAME_MAX_LENGTH}
              </Text>
            </View>

            {/* =================================================
                CATEGORY
            ================================================= */}

            <FormLabel
              text="Shop Category"
              topSpacing
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Choose shop category"
              accessibilityHint="Opens the shop category selector"
              onPress={() =>
                setCategoryModalVisible(
                  true,
                )
              }
              style={({
                pressed,
              }) => [
                styles.inputContainer,

                errors.category &&
                  styles.inputError,

                pressed &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name={
                  selectedCategory
                    ?.icon ??
                  'grid-outline'
                }
                size={21}
                color="#1677FF"
              />

              <Text
                numberOfLines={
                  1
                }
                style={[
                  styles.pickerText,

                  !category &&
                    styles.placeholder,
                ]}
              >
                {selectedCategory
                  ?.label ??
                  'Choose category'}
              </Text>

              <Ionicons
                name="chevron-down"
                size={20}
                color="#64748B"
              />
            </Pressable>

            <ErrorMessage
              message={
                errors.category
              }
            />

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <FormLabel
              text="Shop Description"
              topSpacing
            />

            <View
              style={[
                styles.textAreaContainer,

                errors.description &&
                  styles.inputError,
              ]}
            >
              <TextInput
                value={
                  description
                }
                onChangeText={
                  handleDescriptionChange
                }
                multiline
                maxLength={
                  DESCRIPTION_MAX_LENGTH
                }
                textAlignVertical="top"
                placeholder="Describe your services, experience and what customers can expect..."
                placeholderTextColor="#94A3B8"
                accessibilityLabel="Shop description"
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
                {DESCRIPTION_MAX_LENGTH}
              </Text>
            </View>

            <ErrorMessage
              message={
                errors.description
              }
            />

            {/* =================================================
                PHONE
            ================================================= */}

            <FormLabel
              text="Shop Phone Number"
              topSpacing
            />

            <View
              style={[
                styles.inputContainer,

                errors.phone &&
                  styles.inputError,
              ]}
            >
              <Ionicons
                name="call-outline"
                size={21}
                color="#1677FF"
              />

              <TextInput
                value={phone}
                onChangeText={
                  handlePhoneChange
                }
                placeholder="+234 803 123 4567"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                maxLength={
                  PHONE_MAX_LENGTH
                }
                autoCorrect={
                  false
                }
                accessibilityLabel="Shop phone number"
                style={
                  styles.input
                }
              />
            </View>

            <ErrorMessage
              message={
                errors.phone
              }
            />

            <View
              style={
                styles.infoBox
              }
            >
              <Ionicons
                name="information-circle-outline"
                size={19}
                color="#1677FF"
              />

              <Text
                style={
                  styles.infoText
                }
              >
                Use a phone number customers can
                reliably reach for shop-related
                communication.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <View
          style={
            styles.footer
          }
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Continue to shop location"
            accessibilityState={{
              disabled:
                !isFormComplete,
            }}
            onPress={
              handleNext
            }
            style={({
              pressed,
            }) => [
              styles.nextButton,

              !isFormComplete &&
                styles.nextButtonInactive,

              pressed &&
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

        {/* ====================================================
            CATEGORY MODAL
        ==================================================== */}

        <CategoryModal
          visible={
            categoryModalVisible
          }
          selectedCategory={
            category
          }
          onClose={() =>
            setCategoryModalVisible(
              false,
            )
          }
          onSelect={
            handleCategorySelect
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ============================================================
   PROGRESS INDICATOR
============================================================ */

function ProgressIndicator() {
  return (
    <View
      style={
        styles.progressContainer
      }
    >
      {[
        1,
        2,
        3,
        4,
        5,
        6,
      ].map(
        (
          step,
          index,
        ) => {
          const active =
            step === 1;

          return (
            <React.Fragment
              key={step}
            >
              <View
                style={[
                  styles.progressDot,

                  active &&
                    styles.progressDotActive,
                ]}
              />

              {index < 5 ? (
                <View
                  style={
                    styles.progressLine
                  }
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
   FORM LABEL
============================================================ */

function FormLabel({
  text,
  topSpacing = false,
}: {
  text: string;
  topSpacing?: boolean;
}) {
  return (
    <Text
      style={[
        styles.label,

        topSpacing &&
          styles.labelTopSpacing,
      ]}
    >
      {text}
    </Text>
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
   CATEGORY MODAL
============================================================ */

type CategoryModalProps = {
  visible: boolean;

  selectedCategory:
    ShopCategoryId | '';

  onClose: () => void;

  onSelect: (
    value: ShopCategoryId,
  ) => void;
};

function CategoryModal({
  visible,
  selectedCategory,
  onClose,
  onSelect,
}: CategoryModalProps) {
  const [
    searchQuery,
    setSearchQuery,
  ] = useState('');

  const filteredCategories =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      if (!query) {
        return SHOP_CATEGORIES;
      }

      return SHOP_CATEGORIES.filter(
        item =>
          item.label
            .toLowerCase()
            .includes(
              query,
            ) ||
          item.id
            .toLowerCase()
            .includes(
              query,
            ),
      );
    }, [
      searchQuery,
    ]);

  const handleClose =
    useCallback(() => {
      setSearchQuery('');
      onClose();
    }, [
      onClose,
    ]);

  const handleSelect =
    useCallback(
      (
        value:
          ShopCategoryId,
      ) => {
        setSearchQuery('');
        onSelect(value);
      },
      [
        onSelect,
      ],
    );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={
        handleClose
      }
    >
      <View
        style={
          styles.modalRoot
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close category selector"
          style={
            styles.modalBackdrop
          }
          onPress={
            handleClose
          }
        />

        <View
          style={
            styles.modalSheet
          }
        >
          <View
            style={
              styles.modalHandle
            }
          />

          <View
            style={
              styles.modalHeader
            }
          >
            <View
              style={
                styles.modalHeaderText
              }
            >
              <Text
                style={
                  styles.modalTitle
                }
              >
                Shop Category
              </Text>

              <Text
                style={
                  styles.modalSubtitle
                }
              >
                Search and choose the category that
                best describes your shop.
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close category selector"
              hitSlop={8}
              onPress={
                handleClose
              }
              style={({
                pressed,
              }) => [
                styles.modalClose,

                pressed &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name="close"
                size={22}
                color="#334155"
              />
            </Pressable>
          </View>

          {/* ==================================================
              SEARCH
          ================================================== */}

          <View
            style={
              styles.categorySearchContainer
            }
          >
            <Ionicons
              name="search-outline"
              size={20}
              color="#64748B"
            />

            <TextInput
              value={
                searchQuery
              }
              onChangeText={
                setSearchQuery
              }
              placeholder="Search categories..."
              placeholderTextColor="#94A3B8"
              autoCorrect={
                false
              }
              autoCapitalize="none"
              returnKeyType="search"
              accessibilityLabel="Search shop categories"
              style={
                styles.categorySearchInput
              }
            />

            {searchQuery ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear category search"
                hitSlop={8}
                onPress={() =>
                  setSearchQuery(
                    '',
                  )
                }
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color="#94A3B8"
                />
              </Pressable>
            ) : null}
          </View>

          <Text
            style={
              styles.categoryResultCount
            }
          >
            {filteredCategories.length}{' '}
            {filteredCategories.length ===
            1
              ? 'category'
              : 'categories'}
          </Text>

          {/* ==================================================
              CATEGORY LIST
          ================================================== */}

          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              styles.categoryList
            }
          >
            {filteredCategories.length >
            0 ? (
              filteredCategories.map(
                item => {
                  const selected =
                    selectedCategory ===
                    item.id;

                  return (
                    <Pressable
                      key={
                        item.id
                      }
                      accessibilityRole="button"
                      accessibilityLabel={
                        item.label
                      }
                      accessibilityState={{
                        selected,
                      }}
                      onPress={() =>
                        handleSelect(
                          item.id,
                        )
                      }
                      style={({
                        pressed,
                      }) => [
                        styles.categoryRow,

                        selected &&
                          styles.categoryRowSelected,

                        pressed &&
                          styles.pressed,
                      ]}
                    >
                      <View
                        style={[
                          styles.categoryIcon,

                          selected &&
                            styles.categoryIconSelected,
                        ]}
                      >
                        <Ionicons
                          name={
                            item.icon
                          }
                          size={21}
                          color={
                            selected
                              ? '#FFFFFF'
                              : '#1677FF'
                          }
                        />
                      </View>

                      <View
                        style={
                          styles.categoryTextArea
                        }
                      >
                        <Text
                          style={[
                            styles.categoryName,

                            selected &&
                              styles.categoryNameSelected,
                          ]}
                        >
                          {
                            item.label
                          }
                        </Text>
                      </View>

                      {selected ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={23}
                          color="#1677FF"
                        />
                      ) : (
                        <Ionicons
                          name="chevron-forward"
                          size={19}
                          color="#94A3B8"
                        />
                      )}
                    </Pressable>
                  );
                },
              )
            ) : (
              <View
                style={
                  styles.emptyCategoryState
                }
              >
                <View
                  style={
                    styles.emptyCategoryIcon
                  }
                >
                  <Ionicons
                    name="search-outline"
                    size={26}
                    color="#64748B"
                  />
                </View>

                <Text
                  style={
                    styles.emptyCategoryTitle
                  }
                >
                  No category found
                </Text>

                <Text
                  style={
                    styles.emptyCategoryText
                  }
                >
                  Try another search term.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
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
      borderRadius: 6,
      backgroundColor:
        '#DCE5EF',
    },

    progressDotActive: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor:
        '#1677FF',
    },

    progressLine: {
      flex: 1,
      height: 2,
      backgroundColor:
        '#DCE5EF',
    },

    content: {
      flexGrow: 1,
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

    form: {
      marginTop: 28,
    },

    label: {
      marginBottom: 8,
      fontSize: 15,
      fontWeight: '700',
      color: '#0F172A',
    },

    labelTopSpacing: {
      marginTop: 20,
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
      backgroundColor:
        '#FFFFFF',
    },

    inputError: {
      borderColor:
        '#EF4444',
    },

    input: {
      flex: 1,
      height: 56,
      paddingVertical: 0,
      fontSize: 15,
      color: '#0F172A',
    },

    pickerText: {
      flex: 1,
      minWidth: 0,
      fontSize: 15,
      color: '#0F172A',
    },

    placeholder: {
      color: '#94A3B8',
    },

    fieldMetaRow: {
      minHeight: 20,
      flexDirection: 'row',
      alignItems:
        'flex-start',
      justifyContent:
        'space-between',
      gap: 10,
      marginTop: 2,
    },

    smallCounter: {
      marginTop: 5,
      marginLeft: 'auto',
      fontSize: 11,
      color: '#94A3B8',
    },

    textAreaContainer: {
      minHeight: 150,
      borderWidth: 1,
      borderColor:
        '#D7E0EB',
      borderRadius: 16,
      backgroundColor:
        '#FFFFFF',
    },

    textArea: {
      minHeight: 120,
      paddingHorizontal: 15,
      paddingTop: 14,
      paddingBottom: 32,
      fontSize: 15,
      lineHeight: 22,
      color: '#0F172A',
    },

    counter: {
      position: 'absolute',
      right: 14,
      bottom: 10,
      fontSize: 12,
      color: '#64748B',
    },

    errorRow: {
      flex: 1,
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

    infoBox: {
      flexDirection: 'row',
      alignItems:
        'flex-start',
      gap: 8,
      marginTop: 18,
      padding: 12,
      borderRadius: 14,
      backgroundColor:
        '#EFF6FF',
    },

    infoText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 18,
      color: '#475569',
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
      opacity: 0.65,
    },

    nextButtonText: {
      fontSize: 17,
      fontWeight: '800',
      color: '#FFFFFF',
    },

    pressed: {
      opacity: 0.72,
    },

    /* ========================================================
       CATEGORY MODAL
    ======================================================== */

    modalRoot: {
      flex: 1,
      justifyContent:
        'flex-end',
    },

    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,

      backgroundColor:
        'rgba(15,23,42,0.45)',
    },

    modalSheet: {
      maxHeight: '84%',
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 28,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      backgroundColor:
        '#FFFFFF',
    },

    modalHandle: {
      width: 44,
      height: 5,
      alignSelf: 'center',
      borderRadius: 999,
      backgroundColor:
        '#CBD5E1',
    },

    modalHeader: {
      flexDirection: 'row',
      alignItems:
        'flex-start',
      justifyContent:
        'space-between',
      gap: 14,
      paddingVertical: 18,
    },

    modalHeaderText: {
      flex: 1,
      minWidth: 0,
    },

    modalTitle: {
      fontSize: 21,
      fontWeight: '800',
      color: '#0F172A',
    },

    modalSubtitle: {
      maxWidth: 300,
      marginTop: 4,
      fontSize: 13,
      lineHeight: 19,
      color: '#64748B',
    },

    modalClose: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 20,
      backgroundColor:
        '#F1F5F9',
    },

    /* ========================================================
       CATEGORY SEARCH
    ======================================================== */

    categorySearchContainer: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
      paddingHorizontal: 14,
      marginBottom: 8,
      borderWidth: 1,
      borderColor:
        '#D7E0EB',
      borderRadius: 15,
      backgroundColor:
        '#F8FAFC',
    },

    categorySearchInput: {
      flex: 1,
      height: 50,
      paddingVertical: 0,
      fontSize: 15,
      color: '#0F172A',
    },

    categoryResultCount: {
      marginBottom: 10,
      paddingHorizontal: 2,
      fontSize: 12,
      fontWeight: '600',
      color: '#64748B',
    },

    categoryList: {
      paddingBottom: 8,
    },

    categoryRow: {
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 9,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor:
        '#E2E8F0',
      borderRadius: 16,
      backgroundColor:
        '#FFFFFF',
    },

    categoryRowSelected: {
      borderColor:
        '#93C5FD',
      backgroundColor:
        '#EFF6FF',
    },

    categoryIcon: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 13,
      backgroundColor:
        '#EFF6FF',
    },

    categoryIconSelected: {
      backgroundColor:
        '#1677FF',
    },

    categoryTextArea: {
      flex: 1,
      minWidth: 0,
    },

    categoryName: {
      fontSize: 15,
      fontWeight: '700',
      color: '#0F172A',
    },

    categoryNameSelected: {
      color: '#1677FF',
    },

    /* ========================================================
       EMPTY SEARCH
    ======================================================== */

    emptyCategoryState: {
      minHeight: 220,
      alignItems: 'center',
      justifyContent:
        'center',
      paddingHorizontal: 24,
      paddingVertical: 30,
    },

    emptyCategoryIcon: {
      width: 56,
      height: 56,
      alignItems: 'center',
      justifyContent:
        'center',
      marginBottom: 12,
      borderRadius: 28,
      backgroundColor:
        '#F1F5F9',
    },

    emptyCategoryTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: '#0F172A',
    },

    emptyCategoryText: {
      marginTop: 5,
      fontSize: 13,
      color: '#64748B',
    },
  });