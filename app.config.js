export default ({ config }) => {
  const googleMapsApiKey =
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();

  const existingPlugins = config.plugins ?? [];

  const hasSecureStorePlugin =
    existingPlugins.some((plugin) => {
      if (plugin === "expo-secure-store") {
        return true;
      }

      if (
        Array.isArray(plugin) &&
        plugin[0] === "expo-secure-store"
      ) {
        return true;
      }

      return false;
    });

  const plugins = hasSecureStorePlugin
    ? existingPlugins
    : [
        ...existingPlugins,
        "expo-secure-store",
      ];

  return {
    ...config,

    name: config.name ?? "Fixxam",
    slug: config.slug ?? "fixxam",

    plugins,

    android: {
      ...config.android,

      config: {
        ...config.android?.config,

        googleMaps: {
          apiKey: googleMapsApiKey ?? "",
        },
      },
    },
  };
};