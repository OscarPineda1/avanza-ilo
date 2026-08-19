import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAllRoutes } from '../services/routes';
import { theme } from '../styles/global-styles';
import ScreenHeader from '../components/ScreenHeader';
import RouteListItem from '../components/RouteListItem';
import EmptyState from '../components/EmptyState';

export default function SearchResultsScreen({ navigation, route }) {
    const [query, setQuery] = useState(route.params?.query || '');
    const results = useMemo(() => getAllRoutes().filter((item) => `${item.nombre} ${item.origen} ${item.destino}`.toLowerCase().includes(query.toLowerCase())), [query]);
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScreenHeader title="Buscar rutas" onBack={() => navigation.goBack()} />
            <View style={styles.search}><Ionicons name="search-outline" size={20} color={theme.colors.textMuted} /><TextInput autoFocus value={query} onChangeText={setQuery} placeholder="Ruta, origen o destino" style={styles.input} />{query ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="Limpiar búsqueda" onPress={() => setQuery('')}><Ionicons name="close-circle" size={20} color={theme.colors.textLight} /></TouchableOpacity> : null}</View>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                {!query.trim() ? <View style={styles.help}><Ionicons name="bulb-outline" size={19} color={theme.colors.primary} /><Text style={styles.helpText}>Busca por número de ruta, origen o destino.</Text></View> : null}
                {results.length ? <><Text style={styles.count}>{results.length} {results.length === 1 ? 'resultado' : 'resultados'}</Text>{results.map((item) => <RouteListItem key={item.id} route={item} onPress={() => navigation.navigate(item.coordinates?.length ? 'RouteDetails' : 'Status', item.coordinates?.length ? { routeName: item.nombre } : { type: 'offline', routeName: item.nombre })} />)}</> : <EmptyState title="No encontramos resultados" message={`No hay resultados para “${query}”. Prueba buscando por el nombre de la ruta, origen o destino.`} actionLabel="Ver todas las rutas" onAction={() => navigation.navigate('MainTabs', { screen: 'ExploreRoutes' })} />}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: theme.colors.background }, search: { height: 52, margin: 20, marginTop: 4, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 14, backgroundColor: theme.colors.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, gap: 8 }, input: { flex: 1, fontSize: 16, color: theme.colors.textDark }, content: { paddingHorizontal: 20, gap: 10, paddingBottom: 36 }, help: { flexDirection: 'row', gap: 9, alignItems: 'center', padding: 14, borderRadius: 12, backgroundColor: theme.colors.primarySoft }, helpText: { flex: 1, color: theme.colors.textDark, fontSize: 15, lineHeight: 20 }, count: { color: theme.colors.textMuted, fontSize: 14, fontWeight: '700', marginTop: 4 } });
