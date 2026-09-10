import React, { useState, useMemo } from 'react';
import {
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
import { getPilotRoutes } from '../services/routes';
import RouteCard from '../components/RouteCard';
import LiveMapCard from '../components/LiveMapCard';
import { searchRoutes } from '../services/route-search';

const pilotRoutes = getPilotRoutes();

export default function HomeScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');

    const rutasFiltradas = useMemo(
        () => searchRoutes(pilotRoutes, searchQuery),
        [searchQuery]
    );

    const irAlMapaVivo = () => {
        navigation.navigate('Map');
    };

    const irAlMapa = (selectedRoute) => {
        navigation.navigate('RouteDetails', { routeName: selectedRoute.nombre, sequenceId: selectedRoute.defaultSequenceId });
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
                        <View><Text style={globalStyles.headerTitle}>Avanza Ilo</Text><View style={styles.statusRow}><View style={styles.statusDot} /><Text style={styles.statusText}>Rutas y referencias disponibles</Text></View></View>
                        <TouchableOpacity style={styles.locationButton} accessibilityRole="button" accessibilityLabel="Usar mi ubicación" onPress={() => navigation.navigate('LocationPermission')}><Ionicons name="location-outline" size={22} color={theme.colors.primary} /></TouchableOpacity>
                    </View>
                    <Text style={globalStyles.subtitle}>Encuentra tu ruta y conoce por dónde pasa.</Text>
                </View>

                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={24} color={theme.colors.primary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar ruta (ej. 1A, D, 14)..."
                        placeholderTextColor={theme.colors.textLight}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="search"
                        onSubmitEditing={() => rutasFiltradas.length === 1
                            ? irAlMapa(rutasFiltradas[0])
                            : navigation.navigate('SearchResults', { query: searchQuery })}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIcon}>
                            <Ionicons name="close-circle" size={20} color={theme.colors.border} />
                        </TouchableOpacity>
                    )}
                </View>

                {searchQuery.trim().length > 0 && rutasFiltradas.length === 0 && (
                    <TouchableOpacity style={styles.noResults} onPress={() => navigation.navigate('SearchResults', { query: searchQuery })}>
                        <Text style={styles.noResultsText}>Ver resultados para “{searchQuery}”</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.sectionHeading}><Text style={globalStyles.sectionTitle}>Rutas disponibles</Text><Text style={styles.routeCount}>{pilotRoutes.length} rutas</Text></View>

                {rutasFiltradas.length > 0 ? (
                    rutasFiltradas.map((item) => (
                        <RouteCard
                            key={item.id}
                            item={item}
                            onPress={() => irAlMapa(item)}
                        />
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No se encontraron rutas.</Text>
                    </View>
                )}

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
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
    statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: theme.colors.success },
    statusText: { color: theme.colors.textMuted, fontSize: 13, fontWeight: '600' },
    locationButton: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primarySoft, borderWidth: 1, borderColor: '#CBEAF5' },
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
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    emptyText: {
        color: theme.colors.textLight,
        fontSize: 16,
    },
    noResults: { marginTop: 10, padding: 12, borderRadius: 10, backgroundColor: theme.colors.primarySoft },
    noResultsText: { color: theme.colors.primary, textAlign: 'center', fontWeight: '700' },
    sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    routeCount: { marginTop: 24, color: theme.colors.textMuted, fontSize: 14, fontWeight: '700' },
});
