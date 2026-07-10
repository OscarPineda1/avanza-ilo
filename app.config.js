module.exports = {
  expo: {
    name: "avanza-ilo",
    slug: "avanza-ilo",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Avanza Ilo necesita acceder a tu ubicación para mostrar tu posición en el mapa y calcular tiempos de arribo.",
      },
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_IOS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      permissions: ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"],
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY",
        },
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
  },
};
