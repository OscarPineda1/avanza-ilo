import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/global-styles';
import AppButton from '../components/AppButton';

const content = {
    server: { icon: 'cloud-offline-outline', title: 'No pudimos calcular tu ETA', message: 'Estamos verificando la conexión con nuestro servidor. Inténtalo nuevamente en unos segundos.', action: 'Reintentar' },
    offline: { icon: 'time-outline', title: 'Ruta 14: El Algarrobal', message: 'No hay información ETA disponible para esta ruta en este momento.', action: 'Actualizar ETA' },
};

export default function StatusScreen({ navigation, route }) {
    const state = content[route.params?.type] || content.server;
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}><Ionicons name="menu-outline" size={23} color={theme.colors.textDark} /><Text style={styles.brand}>Avanza Ilo</Text></View>
            <View style={styles.container}>
                <View style={styles.iconCircle}><Ionicons name={state.icon} size={44} color={theme.colors.primary} /></View>
                <Text style={styles.title}>{state.title}</Text>
                <Text style={styles.message}>{state.message}</Text>
                <AppButton label={state.action} onPress={() => navigation.goBack()} style={styles.button} />
                <AppButton label="Volver al inicio" variant="text" onPress={() => navigation.navigate('MainTabs')} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.surface },
    header: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    brand: { color: theme.colors.primary, fontWeight: '800', fontSize: 16 },
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
    iconCircle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primarySoft },
    title: { color: theme.colors.textDark, fontSize: 22, fontWeight: '800', textAlign: 'center', marginTop: 22 },
    message: { color: theme.colors.textMuted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 9 },
    button: { alignSelf: 'stretch', marginTop: 28, marginBottom: 6 },
});
