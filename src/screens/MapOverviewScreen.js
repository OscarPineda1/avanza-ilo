import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { getAllRoutes } from '../services/routes';
import { theme } from '../styles/global-styles';
import RouteBadge from '../components/RouteBadge';

const iloRegion = { latitude: -17.6428, longitude: -71.3452, latitudeDelta: 0.035, longitudeDelta: 0.035 };
export default function MapOverviewScreen({ navigation }) {
    const routes = useMemo(() => getAllRoutes().filter((item) => item.available && item.coordinates?.length), []);
    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <MapView provider={PROVIDER_GOOGLE} initialRegion={iloRegion} style={styles.map} showsUserLocation>
                {routes.map((item) => <React.Fragment key={item.id}><Polyline coordinates={item.coordinates} strokeColor={item.color} strokeWidth={4} /><Marker coordinate={item.coordinates[0]} pinColor={item.color} title={`Ruta ${item.nombre}`} description={item.empresa} /></React.Fragment>)}
            </MapView>
            <View style={styles.top}><View style={styles.brand}><Ionicons name="menu-outline" size={20} color={theme.colors.primary} /><Text style={styles.brandText}>Avanza Ilo</Text></View><TouchableOpacity onPress={() => navigation.navigate('SearchResults')} style={styles.searchButton}><Ionicons name="search-outline" size={21} color={theme.colors.textDark} /></TouchableOpacity></View>
            <View style={styles.sheet}><View style={styles.handle} /><Text style={styles.sheetTitle}>Explora el mapa</Text><Text style={styles.sheetSub}>Selecciona una ruta para ver paraderos y tiempos estimados.</Text><View style={styles.routeRow}>{routes.slice(0, 3).map((item) => <TouchableOpacity key={item.id} onPress={() => navigation.navigate('RouteDetails', { routeName: item.nombre })} style={styles.routeChip}><RouteBadge route={item.nombre} color={item.color} size="small" /><Text style={styles.routeName}>Ruta {item.nombre}</Text></TouchableOpacity>)}</View><TouchableOpacity onPress={() => navigation.navigate('NearbyStops')} style={styles.nearby}><Ionicons name="location-outline" size={19} color={theme.colors.primary} /><Text style={styles.nearbyText}>Ver paraderos cercanos</Text><Ionicons name="chevron-forward" size={17} color={theme.colors.textLight} /></TouchableOpacity></View>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: theme.colors.background }, map: { ...StyleSheet.absoluteFillObject }, top: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 }, brand: { height: 43, paddingHorizontal: 13, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }, brandText: { color: theme.colors.primary, fontWeight: '800', fontSize: 14 }, searchButton: { height: 43, width: 43, borderRadius: 12, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border }, sheet: { marginTop: 'auto', borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: theme.colors.surface, padding: 20 }, handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: '#D9E0E3', marginBottom: 12 }, sheetTitle: { color: theme.colors.textDark, fontSize: 18, fontWeight: '800' }, sheetSub: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 }, routeRow: { flexDirection: 'row', gap: 8, marginTop: 15 }, routeChip: { flex: 1, minHeight: 65, gap: 6, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: theme.colors.background }, routeName: { fontSize: 10, fontWeight: '700', color: theme.colors.textDark }, nearby: { marginTop: 14, minHeight: 48, paddingHorizontal: 12, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 11, flexDirection: 'row', alignItems: 'center', gap: 9 }, nearbyText: { flex: 1, color: theme.colors.textDark, fontSize: 13, fontWeight: '700' } });
