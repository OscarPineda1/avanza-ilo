import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/global-styles';

export default function EtaLoadingScreen({ navigation, route }) {
    useEffect(() => { const timeout = setTimeout(() => navigation.replace('LiveRoute', route.params), 1400); return () => clearTimeout(timeout); }, [navigation, route.params]);
    return <SafeAreaView style={styles.safeArea}><View style={styles.container}><ActivityIndicator size="large" color={theme.colors.primary} /><Text style={styles.title}>Calculando el tiempo estimado...</Text><View style={styles.skeleton} /><View style={styles.skeleton} /><Text style={styles.message}>Estamos analizando la ruta y los paraderos disponibles.</Text></View></SafeAreaView>;
}
const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: theme.colors.surface }, container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 }, title: { color: theme.colors.textDark, fontSize: 17, fontWeight: '800', marginTop: 22 }, skeleton: { alignSelf: 'stretch', height: 13, borderRadius: 7, backgroundColor: '#E8ECEE', marginTop: 18 }, message: { color: theme.colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 24 } });
