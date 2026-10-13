import {
  Ionicons,
} from '@expo/vector-icons';

import React from 'react';

import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type SignInRequiredModalProps = {
  visible: boolean;
  onClose: () => void;
  onSignIn: () => void;

  title?: string;
  message?: string;
};

export default function SignInRequiredModal({
  visible,
  onClose,
  onSignIn,
  title = 'Sign in required',
  message = 'Please sign in before sending your service request.',
}: SignInRequiredModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        style={
          styles.overlay
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close sign in dialog"
          style={
            StyleSheet.absoluteFill
          }
          onPress={onClose}
        />

        <View
          accessibilityViewIsModal
          style={
            styles.modal
          }
        >
          <View
            style={
              styles.iconContainer
            }
          >
            <Ionicons
              name="person-outline"
              size={42}
              color="#2F80ED"
            />
          </View>

          <Text
            style={
              styles.title
            }
          >
            {title}
          </Text>

          <Text
            style={
              styles.message
            }
          >
            {message}
          </Text>

          <View
            style={
              styles.actions
            }
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel sign in"
              onPress={onClose}
              style={({
                pressed,
              }) => [
                styles.cancelButton,

                pressed &&
                  styles.pressed,
              ]}
            >
              <Text
                style={
                  styles.cancelText
                }
              >
                Cancel
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign in"
              onPress={onSignIn}
              style={({
                pressed,
              }) => [
                styles.signInButton,

                pressed &&
                  styles.pressed,
              ]}
            >
              <Text
                style={
                  styles.signInText
                }
              >
                Sign In
              </Text>

              <Ionicons
                name="chevron-forward"
                size={24}
                color="#FFFFFF"
              />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles =
  StyleSheet.create({
    overlay: {
      flex: 1,

      justifyContent:
        'center',

      paddingHorizontal: 36,

      backgroundColor:
        'rgba(15, 23, 42, 0.54)',
    },

    modal: {
      width: '100%',

      alignSelf:
        'center',

      paddingHorizontal: 36,

      paddingTop: 36,

      paddingBottom: 34,

      borderRadius: 34,

      backgroundColor:
        '#FFFFFF',

      shadowColor:
        '#000000',

      shadowOffset: {
        width: 0,
        height: 10,
      },

      shadowOpacity: 0.18,

      shadowRadius: 24,

      elevation: 16,
    },

    iconContainer: {
      width: 100,
      height: 100,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius: 30,

      backgroundColor:
        '#EFF6FF',
    },

    title: {
      marginTop: 34,

      fontSize: 28,

      lineHeight: 34,

      fontWeight: '800',

      color: '#0F172A',
    },

    message: {
      marginTop: 18,

      fontSize: 17,

      lineHeight: 26,

      fontWeight: '400',

      color: '#64748B',
    },

    actions: {
      flexDirection: 'row',

      gap: 14,

      marginTop: 38,
    },

    cancelButton: {
      flex: 1,

      minHeight: 62,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth: 1.5,

      borderColor:
        '#2F80ED',

      borderRadius: 18,

      backgroundColor:
        '#FFFFFF',
    },

    cancelText: {
      fontSize: 17,

      fontWeight: '700',

      color: '#2F80ED',
    },

    signInButton: {
      flex: 1,

      minHeight: 62,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap: 10,

      borderRadius: 18,

      backgroundColor:
        '#3B82F6',

      shadowColor:
        '#2563EB',

      shadowOffset: {
        width: 0,
        height: 5,
      },

      shadowOpacity: 0.2,

      shadowRadius: 10,

      elevation: 5,
    },

    signInText: {
      fontSize: 17,

      fontWeight: '700',

      color: '#FFFFFF',
    },

    pressed: {
      opacity: 0.76,

      transform: [
        {
          scale: 0.985,
        },
      ],
    },
  });