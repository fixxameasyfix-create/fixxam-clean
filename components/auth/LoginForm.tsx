import React, {
  useState,
} from "react";

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";

import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

type Props = {
  identifier: string;
  setIdentifier: (
    value: string,
  ) => void;

  password: string;
  setPassword: (
    value: string,
  ) => void;

  loading: boolean;

  onLogin: () => void;
};

export default function LoginForm({
  identifier,
  setIdentifier,
  password,
  setPassword,
  loading,
  onLogin,
}: Props) {
  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        {/* EMAIL / PHONE */}

        <View>
          <Text style={styles.label}>
            Email Address or Phone Number
          </Text>

          <View style={styles.blueInput}>
            <MaterialCommunityIcons
              name="email-outline"
              size={23}
              color="#1769D1"
            />

            <TextInput
              value={identifier}
              onChangeText={
                setIdentifier
              }
              placeholder="Enter email or phone number"
              placeholderTextColor="#9AA3B2"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="next"
              style={styles.inputText}
              cursorColor="#1769D1"
              selectionColor="#1769D1"
              editable={!loading}
            />
          </View>
        </View>

        {/* PASSWORD */}

        <View style={styles.passwordSection}>
          <Text style={styles.label}>
            Password
          </Text>

          <View style={styles.orangeInput}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={23}
              color="#F47A16"
            />

            <TextInput
              value={password}
              onChangeText={
                setPassword
              }
              placeholder="Enter your password"
              placeholderTextColor="#9AA3B2"
              secureTextEntry={
                !showPassword
              }
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={
                onLogin
              }
              style={styles.inputText}
              cursorColor="#F47A16"
              selectionColor="#F47A16"
              editable={!loading}
            />

            <TouchableOpacity
              onPress={() =>
                setShowPassword(
                  (current) =>
                    !current,
                )
              }
              disabled={loading}
              style={
                styles.eyeButton
              }
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              <Ionicons
                name={
                  showPassword
                    ? "eye-off-outline"
                    : "eye-outline"
                }
                size={25}
                color="#F47A16"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() =>
              router.push(
                "/(auth)/forgot-password",
              )
            }
            disabled={loading}
            style={styles.forgotButton}
            activeOpacity={0.7}
          >
            <Text
              style={styles.forgotText}
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SIGN IN */}

      <TouchableOpacity
        style={[
          styles.signInButton,
          loading &&
            styles.signInButtonDisabled,
        ]}
        onPress={onLogin}
        disabled={loading}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Sign in"
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color="#FFFFFF"
          />
        ) : (
          <Text
            style={styles.signInText}
          >
            Sign In
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    paddingHorizontal: 16,
  },

  card: {
    width: "100%",

    backgroundColor: "#FFFFFF",

    borderRadius: 22,

    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 20,

    borderWidth: 1,
    borderColor: "#E7ECF3",

    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 5,
  },

  label: {
    color: "#173A70",

    fontSize: 15,
    lineHeight: 20,

    fontWeight: "800",

    marginBottom: 8,
  },

  blueInput: {
    minHeight: 58,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 15,

    borderWidth: 1.6,
    borderColor: "#286BC2",

    borderRadius: 17,

    backgroundColor: "#FFFFFF",
  },

  orangeInput: {
    minHeight: 58,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 15,

    borderWidth: 1.6,
    borderColor: "#F28A32",

    borderRadius: 17,

    backgroundColor: "#FFFFFF",
  },

  inputText: {
    flex: 1,

    minHeight: 56,

    marginLeft: 11,

    paddingVertical: 0,

    color: "#172033",

    fontSize: 16,

    fontWeight: "500",
  },

  passwordSection: {
    marginTop: 20,
  },

  eyeButton: {
    width: 42,
    height: 42,

    alignItems: "center",
    justifyContent: "center",

    marginLeft: 4,
  },

  forgotButton: {
    alignSelf: "flex-end",

    minHeight: 40,

    justifyContent: "center",

    marginTop: 3,
  },

  forgotText: {
    color: "#E97818",

    fontSize: 14,

    fontWeight: "800",
  },

  signInButton: {
    width: "100%",

    minHeight: 58,

    marginTop: 18,

    borderRadius: 17,

    backgroundColor: "#FF7614",

    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#FF7614",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 5,
  },

  signInButtonDisabled: {
    opacity: 0.65,
  },

  signInText: {
    color: "#FFFFFF",

    fontSize: 18,

    fontWeight: "800",

    letterSpacing: 0.2,
  },
});