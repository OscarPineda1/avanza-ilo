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
                        <Text style={globalStyles.headerTitle}>Tu espacio</Text>
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
                        <Text style={styles.userName}>Viaja sin cuenta</Text>
                        <Text style={styles.userEmail}>Tus favoritos se guardan en este dispositivo</Text>
                    </View>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('Favorites')} style={styles.sectionHeader}><Text style={globalStyles.sectionTitle}>Mis Rutas Favoritas</Text><Text style={styles.link}>Ver todas</Text></TouchableOpacity>
                {favorites.length > 0 ? (
                    <View style={styles.menuCard}>
                        {favorites.map((route) => (
                            <TouchableOpacity
                                key={route.id}
                                style={styles.favoriteItem}
                                onPress={() => navigation.navigate('RouteDetails', { routeName: route.nombre })}
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
                    <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'ExploreRoutes' })} style={styles.emptyContainer}>
                        <Ionicons name="heart-outline" size={23} color={theme.colors.primary} />
                        <Text style={styles.emptyText}>Aún no tienes rutas favoritas. Explora las rutas.</Text>
                    </TouchableOpacity>
                )}

                <Text style={globalStyles.sectionTitle}>Herramientas</Text>
                <View style={styles.menuCard}>
                    <SettingOption
                        icon="location" iconBg={theme.colors.primarySoft} iconColor={theme.colors.primary}
                        title="Elegir mi paradero" subtitle="Calcula el ETA sin usar GPS"
                        onPress={() => navigation.navigate('StopSelection')}
                    />
                    <SettingOption icon="map" iconBg="#EAF8F1" iconColor={theme.colors.success} title="Ver mapa de rutas" subtitle="Colores, sentido y paraderos" onPress={() => navigation.navigate('MainTabs', { screen: 'Map' })} />
                </View>

                <Text style={globalStyles.sectionTitle}>Información</Text>
                <View style={styles.menuCard}>
                    <SettingOption
                        icon="information-circle" iconBg="#F0F6FF" iconColor={theme.colors.primary}
                        title="Acerca de Avanza Ilo" onPress={() => navigation.navigate('About')}
                    />
                    <SettingOption
                        icon="document-text" iconBg="#F0F6FF" iconColor={theme.colors.primary}
                        title="Privacidad y uso de datos" subtitle="Ubicación solo durante el uso" onPress={() => navigation.navigate('About')}
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
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    link: { color: theme.colors.primary, fontSize: 12, fontWeight: '700', marginTop: 14 },
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
    userEmail: { fontSize: 14, color: theme.colors.textMuted, lineHeight: 20 },
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
    emptyContainer: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 16, marginBottom: 24, borderRadius: 14, backgroundColor: theme.colors.primarySoft },
    emptyText: { flex: 1, color: theme.colors.primary, fontSize: 15, lineHeight: 20, fontWeight: '700' },
    versionText: {
        textAlign: 'center',
        color: theme.colors.textLight,
        fontSize: 12,
        marginTop: 4
    },
});
