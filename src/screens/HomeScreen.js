import React, { useState, useMemo } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { globalStyles, theme } from '../styles/global-styles';
import { getPilotRoutes } from '../services/routes';
import RouteCard from '../components/RouteCard';
import LiveMapCard from '../components/LiveMapCard';

const pilotRoutes = getPilotRoutes();

export default function HomeScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');

    const suggestions = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return [];
        return pilotRoutes.filter(
            (ruta) =>
                ruta.nombre.toLowerCase().includes(query) ||
                ruta.descripcion.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const rutasFiltradas = searchQuery.trim().length > 0 ? suggestions : pilotRoutes;

    const irAlMapaVivo = () => {
        navigation.navigate('Map');
    };

    const irAlMapa = (rutaName) => {
        navigation.navigate('RouteDetails', { routeName: rutaName });
    };

    const renderSuggestion = ({ item }) => (
        <TouchableOpacity
            style={styles.suggestionItem}
            onPress={() => irAlMapa(item.nombre)}
            activeOpacity={0.7}
        >
            <View style={[styles.suggestionBadge, { backgroundColor: item.color }]}>
                <Text style={styles.suggestionBadgeText}>Ruta {item.nombre}</Text>
            </View>
            <Text style={styles.suggestionText}>{item.descripcion}</Text>
        </TouchableOpacity>
    );

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
                        <View><Text style={globalStyles.headerTitle}>Avanza Ilo</Text><View style={styles.statusRow}><View style={styles.statusDot} /><Text style={styles.statusText}>Rutas y paraderos disponibles</Text></View></View>
                        <TouchableOpacity style={styles.locationButton} accessibilityRole="button" accessibilityLabel="Usar mi ubicación" onPress={() => navigation.navigate('LocationPermission')}><Ionicons name="location-outline" size={22} color={theme.colors.primary} /></TouchableOpacity>
                    </View>
                    <Text style={globalStyles.subtitle}>Encuentra tu ruta y conoce por dónde pasa.</Text>
                </View>

                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={24} color={theme.colors.primary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar ruta (ej. 1A, D, 12)..."
                        placeholderTextColor={theme.colors.textLight}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIcon}>
                            <Ionicons name="close-circle" size={20} color={theme.colors.border} />
                        </TouchableOpacity>
                    )}
                </View>

                {suggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                        <FlatList
                            data={suggestions}
                            keyExtractor={(item) => item.id}
                            renderItem={renderSuggestion}
                            scrollEnabled={false}
                        />
                    </View>
                )}

                {searchQuery.trim().length > 0 && suggestions.length === 0 && (
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
                            onPress={() => irAlMapa(item.nombre)}
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
    suggestionsContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        marginBottom: 24,
        ...theme.shadows.base,
        overflow: 'hidden',
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    suggestionBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 10,
    },
    suggestionBadgeText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 13,
    },
    suggestionText: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.textDark,
        fontWeight: '500',
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
