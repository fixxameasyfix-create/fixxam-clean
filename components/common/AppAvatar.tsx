import React, {
  memo,
  useEffect,
  useState,
} from "react";

import { Image } from "expo-image";

import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import UiAppIcon from "@/components/ui/AppIcon";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
  WorkerColors,
  type FixxamRole,
} from "@/theme";

type AvatarSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl";

export interface AppAvatarProps {
  uri?: string | null;

  /*
   * Semantic size is preferred.
   * Numbers remain supported for legacy screens.
   */
  size?: AvatarSize | number;

  role?: FixxamRole;

  verified?: boolean;

  online?: boolean;

  accessibilityLabel?: string;

  style?: StyleProp<ViewStyle>;
}

const AVATAR_SIZES: Record<
  AvatarSize,
  number
> = {
  xs: FixxamTokens.size.avatarXs,
  sm: FixxamTokens.size.avatarSm,
  md: FixxamTokens.size.avatarMd,
  lg: FixxamTokens.size.avatarLg,
  xl: FixxamTokens.size.avatarXl,
};

function AppAvatar({
  uri,
  size = "lg",
  role = "customer",
  verified = false,
  online = false,
  accessibilityLabel = "Profile photo",
  style,
}: AppAvatarProps) {
  const [imageFailed, setImageFailed] =
    useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [uri]);

  const colors =
    role === "worker"
      ? WorkerColors
      : CustomerColors;

  const resolvedSize =
    typeof size === "number"
      ? size
      : AVATAR_SIZES[size];

  const showImage =
    Boolean(uri) && !imageFailed;

  const placeholderIconSize =
    Math.max(
      FixxamTokens.size.iconMd,
      resolvedSize * 0.46,
    );

  const verifiedSize =
    Math.max(
      18,
      Math.min(24, resolvedSize * 0.32),
    );

  const onlineSize =
    Math.max(
      10,
      Math.min(16, resolvedSize * 0.22),
    );

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={
        accessibilityLabel
      }
      style={[
        styles.container,
        {
          width: resolvedSize,
          height: resolvedSize,
          borderRadius:
            FixxamTokens.radius.full,
        },
        style,
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri: uri! }}
          style={[
            styles.image,
            {
              width: resolvedSize,
              height: resolvedSize,
              borderRadius:
                FixxamTokens.radius.full,
            },
          ]}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={150}
          onError={() =>
            setImageFailed(true)
          }
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: resolvedSize,
              height: resolvedSize,
              borderRadius:
                FixxamTokens.radius.full,

              backgroundColor:
                colors.iconBackground,
            },
          ]}
        >
          <UiAppIcon
            name="profile"
            role={role}
            size={placeholderIconSize}
            state="muted"
          />
        </View>
      )}

      {verified ? (
        <View
          style={[
            styles.verified,
            {
              width: verifiedSize,
              height: verifiedSize,

              borderRadius:
                FixxamTokens.radius.full,

              backgroundColor:
                Colors.surface,

              borderColor:
                Colors.surface,
            },
          ]}
        >
          <UiAppIcon
            name="verified"
            role={role}
            size={verifiedSize * 0.72}
            color={colors.primary}
            strokeWidth="medium"
          />
        </View>
      ) : null}

      {online ? (
        <View
          accessibilityLabel="Online"
          style={[
            styles.online,
            {
              width: onlineSize,
              height: onlineSize,

              borderRadius:
                FixxamTokens.radius.full,

              backgroundColor:
                Colors.success,

              borderColor:
                Colors.surface,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },

  image: {
    backgroundColor:
      Colors.disabledBackground,
  },

  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  verified: {
    position: "absolute",

    right: -2,
    bottom: -2,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 2,
  },

  online: {
    position: "absolute",

    top: 1,
    right: 1,

    borderWidth: 2,
  },
});

export default memo(AppAvatar);