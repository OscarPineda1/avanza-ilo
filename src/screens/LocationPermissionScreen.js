import React, { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { theme } from '../styles/global-styles';
import AppButton from '../components/AppButton';
import { useLocationConsent } from '../context/LocationConsentContext';

export default function LocationPermissionScreen({ navigation }) {
    const [requesting, setRequesting] = useState(false);
    const [message, setMessage] = useState(null);
    const [openSettings, setOpenSettings] = useState(false);
    const { setLocationEnabled } = useLocationConsent();

    const enable = async () => {
        setRequesting(true);
        setMessage(null);
        try {
            const permission = await Location.requestForegroundPermissionsAsync();
            if (permission.status === 'granted') {
                setLocationEnabled(true);
                navigation.goBack();
                return;
            }
            setLocationEnabled(false);
            setOpenSettings(permission.canAskAgain === false);
            setMessage(permission.canAskAgain === false
                ? 'El permiso está bloqueado. Puedes habilitarlo desde la configuración del teléfono.'
                : 'No se concedió el permiso. Puedes intentarlo nuevamente o elegir un paradero manualmente.');
        } catch {
            setLocationEnabled(false);
            setMessage('No pudimos solicitar el permiso. Inténtalo nuevamente.');
        } finally {
            setRequesting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.mapIcon}><Ionicons name="location" size={44} color={theme.colors.primary} /></View>
                <Text style={styles.title}>Activemos tu ubicación</Text>
                <Text style={styles.message}>La ubicación es opcional. Nos permite mostrar tu posición en el mapa y ayudarte a elegir dónde esperar.</Text>
                <View style={styles.steps}>
                    <Text style={styles.step}>1. Toca «Permitir ubicación»</Text>
                    <Text style={styles.step}>2. Acepta el permiso del teléfono</Text>
                </View>
                {message ? <Text style={styles.feedback}>{message}</Text> : null}
                {openSettings ? (
                    <AppButton label="Abrir configuración" onPress={() => Linking.openSettings()} style={styles.button} />
                ) : (
                    <AppButton label="Permitir ubicación" onPress={enable} loading={requesting} style={styles.button} />
                )}
                <AppButton label="Elegir dónde esperar" variant="text" onPress={() => navigation.navigate('NearbyStops')} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.surface },
    container: { flex: 1, padding: 26, alignItems: 'center', justifyContent: 'center' },
    mapIcon: { width: 112, height: 112, borderRadius: 56, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 23, fontWeight: '800', color: theme.colors.textDark, marginTop: 24 },
    message: { fontSize: 16, lineHeight: 23, color: theme.colors.textMuted, textAlign: 'center', marginTop: 10 },
    steps: { width: '100%', marginVertical: 24, padding: 16, backgroundColor: theme.colors.background, borderRadius: 12, gap: 10 },
    step: { color: theme.colors.textDark, fontSize: 16 },
    feedback: { width: '100%', color: theme.colors.danger, fontSize: 15, lineHeight: 21, marginBottom: 14, textAlign: 'center' },
    button: { alignSelf: 'stretch', marginBottom: 5 },
});
