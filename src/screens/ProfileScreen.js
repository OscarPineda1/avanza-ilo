import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { globalStyles, theme } from '../styles/global-styles';
import { getFavoriteRouteNames } from '../services/favorites';
import { getRouteByName } from '../services/routes';
import SettingOption from '../components/SettingOption';

export default function ProfileScreen({ navigation }) {
    const [isOfflineMode, setIsOfflineMode] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [favorites, setFavorites] = useState([]);

    const loadFavorites = useCallback(async () => {
        const names = await getFavoriteRouteNames();
        const routes = names
            .map((name) => getRouteByName(name))
            .filter(Boolean);
        setFavorites(routes);
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [loadFavorites])
    );

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <View style={styles.header}>
                <Text style={globalStyles.headerTitle}>Mi Perfil</Text>
            </View>

            <ScrollView
                style={globalStyles.container}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 110 }}
            >
                <View style={styles.userCard}>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="person" size={40} color={theme.colors.primary} />
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>Pasajero Frecuente</Text>
                        <Text style={styles.userEmail}>usuario@avanzailo.com</Text>
                    </View>
                </View>

                <Text style={globalStyles.sectionTitle}>Mis Rutas Favoritas</Text>
                {favorites.length > 0 ? (
                    <View style={styles.menuCard}>
                        {favorites.map((route) => (
                            <TouchableOpacity
                                key={route.id}
                                style={styles.favoriteItem}
                                onPress={() => navigation.navigate('MapScreen', { routeName: route.nombre })}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.favoriteBadge, { backgroundColor: route.color }]}>
                                    <Text style={styles.favoriteBadgeText}>Ruta {route.nombre}</Text>
                                </View>
                                <Text style={styles.favoriteText}>{route.empresa}</Text>
                                <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No tienes rutas favoritas aún.</Text>
                    </View>
                )}

                <Text style={globalStyles.sectionTitle}>Preferencias</Text>
                <View style={styles.menuCard}>
                    <SettingOption
                        icon="cloud-offline" iconBg="#FFF0F0" iconColor={theme.colors.danger}
                        title="Modo Offline (Caché)" subtitle="Ahorra datos usando rutas guardadas"
                        hasSwitch={true} switchValue={isOfflineMode} onSwitchChange={setIsOfflineMode}
                    />
                    <SettingOption
                        icon="notifications" iconBg="#F0F0F0" iconColor="#555"
                        title="Alertas de Paradero"
                        hasSwitch={true} switchValue={notifications} onSwitchChange={setNotifications}
                    />
                </View>

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

                <Text style={styles.versionText}>Avanza Ilo MVP v1.0.0</Text>
                <Text style={styles.versionText}>Proyecto de Tesis - Ingeniería de Computación</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
        backgroundColor: theme.colors.background
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: 20,
        borderRadius: 20,
        marginBottom: 24,
        ...theme.shadows.base,
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
    favoriteItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    favoriteBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 12,
    },
    favoriteBadgeText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
    favoriteText: { flex: 1, fontSize: 16, color: theme.colors.textDark, fontWeight: '500' },
    emptyContainer: { alignItems: 'center', paddingVertical: 20, marginBottom: 24 },
    emptyText: { color: theme.colors.textLight, fontSize: 16 },
    versionText: {
        textAlign: 'center',
        color: theme.colors.textLight,
        fontSize: 12,
        marginTop: 4
    },
});
