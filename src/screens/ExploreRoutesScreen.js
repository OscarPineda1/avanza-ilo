import React, { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { globalStyles, theme } from '../styles/global-styles';
import { useCatalog } from '../context/CatalogContext';
import RouteDetailCard from '../components/RouteDetailCard';
import EmptyState from '../components/EmptyState';

const ROUTE_ORDER = ['1A', 'D', '14'];

export default function ExploreRoutesScreen({ navigation }) {
    const { routes, status, refresh } = useCatalog();
    const officialRoutes = useMemo(() => routes
        .filter((item) => item.pilot && item.available && ROUTE_ORDER.includes(item.nombre))
        .sort((left, right) => ROUTE_ORDER.indexOf(left.nombre) - ROUTE_ORDER.indexOf(right.nombre)), [routes]);
    const isInitialLoading = status === 'loading' && officialRoutes.length === 0;

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={globalStyles.title}>Rutas oficiales</Text>
                    <Text style={globalStyles.subtitle}>Consulta el recorrido y los paraderos de cada ruta.</Text>
                </View>

                {isInitialLoading ? (
                    <View style={styles.loadingState}>
                        <ActivityIndicator color={theme.colors.primary} />
                        <Text style={styles.loadingText}>Cargando rutas…</Text>
                    </View>
                ) : officialRoutes.length ? officialRoutes.map((item) => (
                    <RouteDetailCard
                        key={item.id}
                        item={item}
                        onPress={() => navigation.navigate('RouteDetails', { routeId: item.id, sequenceId: item.defaultSequenceId })}
                    />
                )) : (
                    <EmptyState
                        icon="bus-outline"
                        title="No pudimos cargar las rutas"
                        message="Comprueba tu conexión e inténtalo nuevamente."
                        actionLabel="Reintentar"
                        onAction={refresh}
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    scrollContent: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 110 },
    header: { marginBottom: 18 },
    loadingState: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 10 },
    loadingText: { color: theme.colors.textMuted, fontSize: 14, fontWeight: '600' },
});
