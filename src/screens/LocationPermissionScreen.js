import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { theme } from '../styles/global-styles';
import AppButton from '../components/AppButton';

export default function LocationPermissionScreen({ navigation }) {
    const [denied, setDenied] = useState(false);
    const enable = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            navigation.navigate('MainTabs', { screen: 'Map' });
            return;
        }
        setDenied(true);
    };
    return <SafeAreaView style={styles.safeArea}><View style={styles.container}><View style={styles.mapIcon}><Ionicons name="location" size={44} color={theme.colors.primary} /></View><Text style={styles.title}>Activemos tu ubicación</Text><Text style={styles.message}>Con tu ubicación podemos mostrarte los paraderos más cercanos. Puedes continuar sin conceder este permiso.</Text><View style={styles.steps}><Text style={styles.step}>1. Toca «Permitir ubicación»</Text><Text style={styles.step}>2. Elige «Mientras uso la app»</Text></View>{denied && <Text style={styles.denied}>No se concedió el permiso. Elige un paradero manualmente para calcular el ETA.</Text>}<AppButton label="Permitir ubicación" onPress={enable} style={styles.button} /><AppButton label="Elegir mi paradero manualmente" variant="text" onPress={() => navigation.navigate('StopSelection')} /></View></SafeAreaView>;
}
const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: theme.colors.surface }, container: { flex: 1, padding: 26, alignItems: 'center', justifyContent: 'center' }, mapIcon: { width: 112, height: 112, borderRadius: 56, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, title: { fontSize: 23, fontWeight: '800', color: theme.colors.textDark, marginTop: 24 }, message: { fontSize: 16, lineHeight: 23, color: theme.colors.textMuted, textAlign: 'center', marginTop: 10 }, steps: { width: '100%', marginVertical: 24, padding: 16, backgroundColor: theme.colors.background, borderRadius: 12, gap: 10 }, step: { color: theme.colors.textDark, fontSize: 16 }, denied: { width: '100%', color: theme.colors.danger, fontSize: 16, lineHeight: 22, marginBottom: 14, textAlign: 'center' }, button: { alignSelf: 'stretch', marginBottom: 5 } });
