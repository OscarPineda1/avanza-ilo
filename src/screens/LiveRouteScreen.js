import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { getRouteByName, getRouteCoordinates } from '../services/routes';
import { theme } from '../styles/global-styles';
import ScreenHeader from '../components/ScreenHeader';

const region = { latitude: -17.6433, longitude: -71.3444, latitudeDelta: .035, longitudeDelta: .035 };
export default function LiveRouteScreen({ navigation, route }) {
    const item = getRouteByName(route.params?.routeName || '1A'); const coordinates = getRouteCoordinates(item?.nombre || '1A') || [];
    return <SafeAreaView style={styles.safeArea} edges={['top']}><MapView provider={PROVIDER_GOOGLE} initialRegion={region} style={styles.map}>{coordinates.length ? <Polyline coordinates={coordinates} strokeColor={item.color} strokeWidth={5} /> : null}{coordinates[0] ? <Marker coordinate={coordinates[0]} pinColor={item.color} /> : null}</MapView><View style={styles.header}><ScreenHeader title={`Ruta ${item?.nombre || ''}`} subtitle="En vivo" onBack={() => navigation.goBack()} rightAction={<TouchableOpacity><Ionicons name="heart-outline" size={22} color="#E74C5E" /></TouchableOpacity>} /></View><View style={styles.card}><View style={styles.status}><View style={styles.dot} /><Text style={styles.statusText}>Servicio en ruta</Text></View><Text style={styles.arrival}>Llega en <Text style={styles.minutes}>8 min</Text></Text><Text style={styles.detail}>{item?.origen} · Próximo paradero: Plaza de Armas</Text><TouchableOpacity onPress={() => navigation.navigate('StopSelection', { routeName: item?.nombre })} style={styles.change}><Text style={styles.changeText}>Cambiar paradero</Text><Ionicons name="chevron-forward" size={17} color={theme.colors.primary} /></TouchableOpacity></View></SafeAreaView>;
}
const styles = StyleSheet.create({ safeArea: { flex: 1 }, map: { ...StyleSheet.absoluteFillObject }, header: { backgroundColor: theme.colors.surface }, card: { marginTop: 'auto', padding: 20, backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24 }, status: { flexDirection: 'row', alignItems: 'center', gap: 7 }, dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.success }, statusText: { color: theme.colors.success, fontSize: 12, fontWeight: '800' }, arrival: { marginTop: 8, color: theme.colors.textDark, fontSize: 22, fontWeight: '700' }, minutes: { color: theme.colors.primary, fontWeight: '800' }, detail: { color: theme.colors.textMuted, fontSize: 13, marginTop: 6 }, change: { marginTop: 16, minHeight: 45, borderRadius: 10, backgroundColor: theme.colors.primarySoft, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center' }, changeText: { flex: 1, color: theme.colors.primary, fontSize: 13, fontWeight: '800' } });
