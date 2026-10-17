import React, { useState, useMemo } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { globalStyles, theme } from '../styles/global-styles';
import { useCatalog } from '../context/CatalogContext';
import RouteCard from '../components/RouteCard';
import LiveMapCard from '../components/LiveMapCard';
import EmptyState from '../components/EmptyState';
import { searchRoutes } from '../services/route-search';

export default function HomeScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const { routes, status, refresh } = useCatalog();
    const pilotRoutes = useMemo(() => routes.filter((item) => item.pilot && item.available), [routes]);

    const rutasFiltradas = useMemo(
        () => searchRoutes(pilotRoutes, searchQuery),
        [pilotRoutes, searchQuery]
    );
    const hasQuery = searchQuery.trim().length > 0;
    const isInitialLoading = status === 'loading' && pilotRoutes.length === 0;

    const irAlMapaVivo = () => {
        navigation.navigate('Map');
    };

    const irAlMapa = (selectedRoute) => {
        navigation.navigate('RouteDetails', { routeId: selectedRoute.id, sequenceId: selectedRoute.defaultSequenceId });
    };

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <ScrollView
                style={globalStyles.container}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <View style={styles.brandRow}>
                        <Text style={globalStyles.headerTitle}>Avanza Ilo</Text>
                        <TouchableOpacity style={styles.locationButton} accessibilityRole="button" accessibilityLabel="Usar mi ubicación" onPress={() => navigation.navigate('LocationPermission')}><Ionicons name="location-outline" size={19} color={theme.colors.primary} /><Text style={styles.locationText}>Mi ubicación</Text></TouchableOpacity>
                    </View>
                    <Text style={globalStyles.subtitle}>Encuentra cómo llegar y dónde esperar.</Text>
                </View>

                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={24} color={theme.colors.primary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Busca una ruta: 1A, D o 14"
                        placeholderTextColor={theme.colors.textLight}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="search"
                        onSubmitEditing={() => {
                            if (rutasFiltradas.length === 1) irAlMapa(rutasFiltradas[0]);
                            else if (rutasFiltradas.length > 1) navigation.navigate('SearchResults', { query: searchQuery });
                        }}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIcon}>
                            <Ionicons name="close-circle" size={20} color={theme.colors.border} />
                        </TouchableOpacity>
                    )}
                </View>

                <Text style={globalStyles.sectionTitle}>{hasQuery ? 'Resultados' : 'Rutas disponibles'}</Text>

                {isInitialLoading ? (
                    <View style={styles.loadingState}><ActivityIndicator color={theme.colors.primary} /><Text style={styles.loadingText}>Cargando rutas…</Text></View>
                ) : rutasFiltradas.length > 0 ? (
                    rutasFiltradas.map((item) => (
                        <RouteCard
                            key={item.id}
                            item={item}
                            onPress={() => irAlMapa(item)}
                        />
                    ))
                ) : hasQuery ? <View style={styles.noResults}><Ionicons name="search-outline" size={23} color={theme.colors.textMuted} /><Text style={styles.noResultsTitle}>No encontramos esa ruta</Text><Text style={styles.noResultsText}>Prueba buscando 1A, D o 14.</Text></View> : <EmptyState icon="bus-outline" title="No pudimos cargar las rutas" message="Comprueba tu conexión e inténtalo nuevamente." actionLabel="Reintentar" onAction={refresh} />}

                <LiveMapCard onPress={irAlMapaVivo} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: 24,
        marginTop: 10,
    },
    brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    locationButton: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 12, borderRadius: 14, backgroundColor: theme.colors.primarySoft, borderWidth: 1, borderColor: '#CBEAF5' },
    locationText: { color: theme.colors.primary, fontSize: 13, fontWeight: '800' },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 60,
        ...theme.shadows.base,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 18,
        color: theme.colors.textDark,
        fontWeight: '500',
    },
    clearIcon: {
        padding: 4,
    },
    loadingState: { minHeight: 160, alignItems: 'center', justifyContent: 'center', gap: 10 },
    loadingText: { color: theme.colors.textMuted, fontSize: 14 },
    noResults: { alignItems: 'center', gap: 5, paddingVertical: 28 },
    noResultsTitle: { color: theme.colors.textDark, fontSize: 16, fontWeight: '800' },
    noResultsText: { color: theme.colors.textMuted, fontSize: 14 },
});
