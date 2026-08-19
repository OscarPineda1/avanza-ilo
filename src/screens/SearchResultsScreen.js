import React, { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAllRoutes } from '../services/routes';
import { theme } from '../styles/global-styles';
import ScreenHeader from '../components/ScreenHeader';
import RouteListItem from '../components/RouteListItem';
import EmptyState from '../components/EmptyState';

export default function SearchResultsScreen({ navigation, route }) {
    const [query, setQuery] = useState(route.params?.query || 'metro');
    const results = useMemo(() => getAllRoutes().filter((item) => `${item.nombre} ${item.origen} ${item.destino}`.toLowerCase().includes(query.toLowerCase())), [query]);
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScreenHeader title="Buscar rutas" onBack={() => navigation.goBack()} />
            <View style={styles.search}><Ionicons name="search-outline" size={20} color={theme.colors.textMuted} /><TextInput autoFocus value={query} onChangeText={setQuery} placeholder="Busca una ruta o destino" style={styles.input} /></View>
            <View style={styles.content}>
                {results.length ? results.map((item) => <RouteListItem key={item.id} route={item} onPress={() => navigation.navigate('RouteDetails', { routeName: item.nombre })} />) : <EmptyState title="No encontramos resultados" message={`No hay resultados para “${query}”. Prueba buscando por el nombre de la ruta, origen o destino.`} actionLabel="Ver todas las rutas" onAction={() => navigation.navigate('MainTabs', { screen: 'ExploreRoutes' })} />}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: theme.colors.background }, search: { height: 48, margin: 20, marginTop: 4, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, backgroundColor: theme.colors.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, gap: 8 }, input: { flex: 1, fontSize: 14, color: theme.colors.textDark }, content: { paddingHorizontal: 20, gap: 10 } });
