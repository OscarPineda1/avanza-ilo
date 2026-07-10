import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { globalStyles, theme } from '../styles/global-styles';
import SettingOption from '../components/SettingOption';

export default function ProfileScreen({ navigation }) {
    // Estado para el Modo Offline (Requisito de Resiliencia)
    const [isOfflineMode, setIsOfflineMode] = useState(false);
    const [notifications, setNotifications] = useState(true);

    return (
        <SafeAreaView style={globalStyles.safeArea}>

            {/* HEADER */}
            <View style={styles.header}>
                <Text style={globalStyles.headerTitle}>Mi Perfil</Text>
            </View>

            <ScrollView
                style={globalStyles.container}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 110 }}
            >
                {/* TARJETA DE USUARIO */}
                <View style={styles.userCard}>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="person" size={40} color={theme.colors.primary} />
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>Pasajero Frecuente</Text>
                        <Text style={styles.userEmail}>usuario@avanzailo.com</Text>
                    </View>
                </View>

                {/* SECCIÓN: PREFERENCIAS DE VIAJE */}
                <Text style={globalStyles.sectionTitle}>Preferencias</Text>
                <View style={styles.menuCard}>
                    <SettingOption
                        icon="star" iconBg="#FFFBE6" iconColor="#FFD700"
                        title="Mis Rutas Favoritas"
                    />
                    <SettingOption
                        icon="notifications" iconBg="#F0F0F0" iconColor="#555"
                        title="Alertas de Paradero"
                        hasSwitch={true} switchValue={notifications} onSwitchChange={setNotifications}
                    />
                    <SettingOption
                        icon="cloud-offline" iconBg="#FFF0F0" iconColor={theme.colors.danger}
                        title="Modo Offline (Caché)" subtitle="Ahorra datos usando rutas guardadas"
                        hasSwitch={true} switchValue={isOfflineMode} onSwitchChange={setIsOfflineMode}
                    />
                </View>

                {/* SECCIÓN: INFORMACIÓN */}
                <Text style={globalStyles.sectionTitle}>Acerca de la App</Text>
                <View style={styles.menuCard}>
                    <SettingOption
                        icon="information-circle" iconBg="#F0F6FF" iconColor={theme.colors.primary}
                        title="Acerca de Avanza Ilo"
                    />
                    <SettingOption
                        icon="document-text" iconBg="#F0F6FF" iconColor={theme.colors.primary}
                        title="Términos y Condiciones"
                    />
                </View>

                {/* VERSIÓN (Detalle para la tesis) */}
                <Text style={styles.versionText}>Avanza Ilo MVP v1.0.0</Text>
                <Text style={styles.versionText}>Proyecto de Tesis - Ingeniería de Computación</Text>

            </ScrollView>
        </SafeAreaView>
    );
}

// local styles específicos para ProfileScreen (el resto se maneja con estilos globales para mantener la consistencia)
const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
        backgroundColor: theme.colors.background // Usando el color global
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: 20,
        borderRadius: 20,
        marginBottom: 24,
        ...theme.shadows.base, // Sombra global
    },
    avatarContainer: {
        width: 70, height: 70, borderRadius: 35,
        backgroundColor: '#F0F6FF',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 16,
    },
    userInfo: { flex: 1 },
    userName: { fontSize: 20, fontWeight: '700', color: theme.colors.textDark, marginBottom: 4 },
    userEmail: { fontSize: 14, color: theme.colors.textMuted },

    menuCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
        marginBottom: 24,
        overflow: 'hidden',
        ...theme.shadows.base,
    },
    versionText: {
        textAlign: 'center',
        color: theme.colors.textLight,
        fontSize: 12,
        marginTop: 4
    },
});