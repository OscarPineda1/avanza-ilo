import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/global-styles';
import { getOfficialDirectionGuide } from '../services/official-stops';

export default function MapInfoCard({
    datosRuta,
    isFavorite,
    onToggleFavorite,
    onChooseStop,
    hasCoordinates,
    eta,
    waitPointName,
}) {
    const etaVisible = hasCoordinates && eta && !eta.loading && eta.etaMinutes !== null;
    const isArrival = eta?.status === 'available';
    const estimateLabel = eta?.loading
        ? 'Calculando tu espera'
        : eta?.status === 'out_of_service'
        ? 'Fuera del horario de atención'
        : eta?.status === 'offline'
        ? 'Tiempo no disponible'
        : ['no_route', 'insufficient_data', 'version_mismatch', 'backend', 'network', 'timeout', 'app_check'].includes(eta?.status)
        ? 'Tiempo no disponible'
        : isArrival
        ? 'Tu combi llega en'
        : 'Espera aproximada';
    const outward = getOfficialDirectionGuide(datosRuta.nombre, 'ida');
    const returnTrip = getOfficialDirectionGuide(datosRuta.nombre, 'vuelta');
    const routeSummary = returnTrip.destination && outward.destination
        ? `${returnTrip.destination} ↔ ${outward.destination}`
        : `${datosRuta.origen} ↔ ${datosRuta.destino}`;
    const selectedStopName = waitPointName || eta?.assumptions?.waitPoint;
    const estimatedArrival = eta?.estimatedArrivalAt
        ? new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(eta.estimatedArrivalAt))
        : null;
    const unavailableMessage = eta?.status === 'offline'
        ? 'Conéctate a internet para calcular el tiempo de llegada.'
        : eta?.status === 'out_of_service'
        ? 'Esta ruta no está atendiendo en este momento.'
        : 'Aún no podemos calcular el tiempo de llegada.';

    return (
        <View style={styles.cardContainer}>
            <View style={styles.handle} />
            <View style={styles.cardHeader}>
                <View style={[styles.routeBadge, { backgroundColor: datosRuta.color }]}>
                    <Text style={styles.routeBadgeLabel}>RUTA</Text>
                    <Text style={styles.routeBadgeNumber}>{datosRuta.nombre}</Text>
                </View>
                <View style={styles.routeCopy}>
                    <Text style={styles.routeName}>Tu recorrido</Text>
                    <Text style={styles.routeSummary} numberOfLines={1}>{routeSummary}</Text>
                </View>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'} onPress={onToggleFavorite} activeOpacity={0.7} style={styles.favoriteButton}>
                    <Ionicons
                        name={isFavorite ? "star" : "star-outline"}
                        size={24}
                        color={isFavorite ? theme.colors.ruta14 : theme.colors.textMuted}
                    />
                </TouchableOpacity>
            </View>

            <View style={[styles.etaContainer, { backgroundColor: `${datosRuta.color}0D`, borderColor: `${datosRuta.color}30` }, eta?.status === 'out_of_service' && styles.etaUnavailableContainer]}>
                <View style={styles.etaBadge}>
                    <View style={[styles.etaIcon, { backgroundColor: datosRuta.color }]}><Ionicons name="time" size={17} color={theme.colors.surface} /></View>
                    <Text style={[styles.etaLabel, { color: datosRuta.color }]}>{estimateLabel}</Text>
                </View>
                <View style={styles.etaTimeRow}>
                    {eta?.loading ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : etaVisible ? (
                        <><Text style={styles.etaMinutes}>{eta.etaMinutes}</Text><Text style={styles.etaUnit}> min</Text></>
                    ) : (
                        <Text style={styles.etaUnavailable}>{unavailableMessage}</Text>
                    )}
                </View>
                {isArrival && estimatedArrival ? <Text style={styles.arrivalText}>Llegaría cerca de las {estimatedArrival}</Text> : null}
            </View>

            <View style={styles.tripInfoRow}>
                <View style={styles.stopInfo}>
                    <View style={[styles.infoIcon, { backgroundColor: `${datosRuta.color}14` }]}><Ionicons name="location" size={19} color={datosRuta.color} /></View>
                    <View style={styles.stopCopy}>
                        <Text style={styles.infoLabel}>Estás esperando en</Text>
                        <Text style={styles.stopName} numberOfLines={1}>{selectedStopName || 'Elige un paradero'}</Text>
                    </View>
                </View>
                <View style={styles.farePill}>
                    <Text style={styles.infoLabel}>Pasaje</Text>
                    <Text style={styles.fareValue}>{datosRuta.tarifa || 'S/ 1.50'}</Text>
                </View>
            </View>

            <TouchableOpacity accessibilityRole="button" accessibilityLabel={selectedStopName ? 'Cambiar paradero' : 'Elegir paradero'} onPress={onChooseStop} activeOpacity={0.82} style={[styles.chooseStopButton, { backgroundColor: datosRuta.color }]}>
                <Ionicons name="location-outline" size={19} color={theme.colors.surface} />
                <Text style={styles.chooseStopText}>{selectedStopName ? 'Cambiar paradero' : 'Elegir paradero'}</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.surface} />
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 30, borderTopRightRadius: 30,
        paddingHorizontal: 20, paddingTop: 10, paddingBottom: 22,
        ...theme.shadows.heavy,
    },
    handle: { alignSelf: 'center', width: 42, height: 4, borderRadius: 2, backgroundColor: theme.colors.border, marginBottom: 12 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    routeBadge: { width: 54, height: 54, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
    routeBadgeLabel: { color: '#FFFFFFCC', fontSize: 9, lineHeight: 11, fontWeight: '800', letterSpacing: 1 },
    routeBadgeNumber: { color: theme.colors.surface, fontSize: 21, lineHeight: 24, fontWeight: '900' },
    routeCopy: { flex: 1 },
    routeName: { fontSize: 17, fontWeight: '800', color: theme.colors.textDark },
    routeSummary: { fontSize: 13, color: theme.colors.textMuted, fontWeight: '600', marginTop: 3 },
    favoriteButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: theme.colors.background },
    etaContainer: {
        borderRadius: 20, paddingHorizontal: 16, paddingVertical: 13,
        alignItems: 'center', marginTop: 14, borderWidth: 1,
    },
    etaUnavailableContainer: { backgroundColor: theme.colors.warningBg, borderColor: theme.colors.warningBorder },
    etaBadge: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    etaIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    etaLabel: { fontSize: 14, fontWeight: '800' },
    etaTimeRow: { flexDirection: 'row', alignItems: 'baseline', minHeight: 46, justifyContent: 'center' },
    etaMinutes: { fontSize: 42, fontWeight: '900', color: theme.colors.textDark, fontVariant: ['tabular-nums'] },
    etaUnit: { fontSize: 16, fontWeight: '700', color: theme.colors.textDark },
    etaUnavailable: { fontSize: 14, lineHeight: 19, fontWeight: '700', color: theme.colors.textDark, textAlign: 'center', paddingVertical: 6 },
    arrivalText: { fontSize: 13, color: theme.colors.primary, fontWeight: '800', marginTop: 3 },
    tripInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
    stopInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9, minWidth: 0 },
    infoIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    stopCopy: { flex: 1, minWidth: 0 },
    infoLabel: { color: theme.colors.textMuted, fontSize: 11, fontWeight: '700' },
    stopName: { color: theme.colors.textDark, fontSize: 14, fontWeight: '800', marginTop: 2 },
    farePill: { minWidth: 72, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, backgroundColor: theme.colors.background, alignItems: 'center' },
    fareValue: { color: theme.colors.textDark, fontSize: 16, fontWeight: '800' },
    chooseStopButton: { minHeight: 50, borderRadius: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    chooseStopText: { flex: 1, color: theme.colors.surface, fontSize: 15, fontWeight: '800', textAlign: 'center' },
});
