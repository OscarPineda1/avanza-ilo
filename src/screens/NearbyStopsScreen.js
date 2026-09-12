import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { theme } from '../styles/global-styles';
import { useCatalog } from '../context/CatalogContext';
import { haversineDistance } from '../services/haversine';
import ScreenHeader from '../components/ScreenHeader';

export default function NearbyStopsScreen({ navigation, route }) {
    const { routes } = useCatalog();
    const [passengerLocation, setPassengerLocation] = useState(null);
    const [locationMessage, setLocationMessage] = useState(null);
    const allStops = useMemo(() => routes.filter((item) => item.pilot && item.available).flatMap((item) => item.sequences.flatMap((sequence) => sequence.stops.map((stop) => ({ ...stop, routeId: item.id, color: item.color })))), [routes]);

    useEffect(() => {
        if (!route.params?.useLocation) return;
        let active = true;
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }).then((result) => {
            if (!active) return;
            if (!Number.isFinite(result.coords.accuracy) || result.coords.accuracy > 100) {
                setLocationMessage('La precisión actual no permite sugerir una referencia. Elige una manualmente.');
                return;
            }
            setPassengerLocation({ latitude: result.coords.latitude, longitude: result.coords.longitude });
            setLocationMessage('Referencias ordenadas por cercanía. Confirma la ruta y el punto antes de consultar.');
        }).catch(() => {
            if (active) setLocationMessage('No fue posible obtener tu ubicación. Elige una referencia manualmente.');
        });
        return () => { active = false; };
    }, [route.params?.useLocation]);

    const stops = useMemo(() => {
        const candidates = passengerLocation
            ? [...allStops].sort((left, right) => haversineDistance(passengerLocation, left.coordinate) - haversineDistance(passengerLocation, right.coordinate))
            : allStops;
        return candidates.slice(0, 18);
    }, [allStops, passengerLocation]);

    return <SafeAreaView style={styles.safeArea}><ScreenHeader title="Puntos de referencia" subtitle="Elige la ruta y el lugar donde esperarás" onBack={() => navigation.goBack()} /><ScrollView contentContainerStyle={styles.content}>{locationMessage ? <Text style={styles.notice}>{locationMessage}</Text> : null}{stops.map((stop) => <TouchableOpacity key={stop.id} onPress={() => navigation.navigate('StopSelection', { routeId: stop.routeId, sequenceId: stop.sequenceId, suggestedWaitPointId: stop.id })} style={styles.item}><View style={[styles.icon, { backgroundColor: `${stop.color}18` }]}><Ionicons name="bus-outline" size={21} color={stop.color} /></View><View style={styles.copy}><Text style={styles.title}>{stop.name}</Text><Text style={styles.meta}>Ruta {stop.routeName} · Referencia {stop.order + 1}</Text></View><Ionicons name="chevron-forward" size={18} color={theme.colors.textLight} /></TouchableOpacity>)}</ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: theme.colors.background }, content: { padding: 20, gap: 10, paddingBottom: 32 }, notice: { color: theme.colors.textMuted, fontSize: 14, lineHeight: 20, padding: 12, backgroundColor: theme.colors.surface, borderRadius: 10 }, item: { padding: 14, gap: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border }, icon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, copy: { flex: 1 }, title: { color: theme.colors.textDark, fontSize: 16, fontWeight: '800' }, meta: { color: theme.colors.textMuted, fontSize: 14, marginTop: 4 } });
