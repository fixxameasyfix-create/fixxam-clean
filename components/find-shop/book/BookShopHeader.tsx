import { Ionicons } from '@expo/vector-icons';
import React, {
  memo,
  useCallback,
} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type BookShopHeaderProps = {
  disabled?: boolean;
  onBack: () => void;
};

function BookShopHeader({
  disabled = false,
  onBack,
}: BookShopHeaderProps) {
  const handleBack =
    useCallback(() => {
      if (disabled) {
        return;
      }

      onBack();
    }, [
      disabled,
      onBack,
    ]);

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        accessibilityHint="Returns to the previous screen"
        accessibilityState={{
          disabled,
        }}
        hitSlop={8}
        disabled={disabled}
        onPress={handleBack}
        style={({
          pressed,
        }) => [
          styles.backButton,

          disabled &&
            styles.disabled,

          pressed &&
            !disabled &&
            styles.pressed,
        ]}
      >
        <Ionicons
          name="arrow-back"
          size={27}
          color="#1677FF"
        />
      </Pressable>

      <View
        style={
          styles.headerContent
        }
      >
        <Text
          accessibilityRole="header"
          style={styles.title}
        >
          Book at This Shop
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          Send a request directly
          to the provider.
        </Text>
      </View>
    </View>
  );
}

export default memo(
  BookShopHeader,
);

const styles =
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 12,
    },

    backButton: {
      width: 54,
      height: 54,
      flexShrink: 0,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 20,
      backgroundColor:
        '#EFF6FF',
    },

    headerContent: {
      flex: 1,
      minWidth: 0,
    },

    title: {
      fontSize: 25,
      fontWeight: '800',
      color: '#0F172A',
    },

    subtitle: {
      marginTop: 2,
      fontSize: 15,
      lineHeight: 21,
      color: '#64748B',
    },

    disabled: {
      opacity: 0.5,
    },

    pressed: {
      opacity: 0.72,
    },
  });