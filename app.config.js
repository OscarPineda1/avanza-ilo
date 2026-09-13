module.exports = {
  expo: {
    name: "avanza-ilo",
    slug: "avanza-ilo",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    plugins: [
      "@react-native-firebase/app",
      "@react-native-firebase/app-check",
    ],
    extra: {
      mapsConfigured: {
        android: Boolean(process.env.GOOGLE_MAPS_ANDROID_API_KEY),
        ios: Boolean(process.env.GOOGLE_MAPS_IOS_API_KEY),
      },
    },
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      bundleIdentifier: "com.avanzailo.app",
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Avanza Ilo usa tu ubicación solo para mostrar tu posición y sugerir referencias del recorrido; no ubica las unidades.",
      },
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_IOS_API_KEY,
      },
    },
    android: {
      package: "com.avanzailo.app",
      googleServicesFile: "./google-services.json",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      permissions: ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"],
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY,
        },
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
  },
};
