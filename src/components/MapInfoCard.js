import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/global-styles';
import RouteDirectionBadge from './RouteDirectionBadge';

export default function MapInfoCard({
    datosRuta,
    isFavorite,
    onToggleFavorite,
    hasCoordinates,
    isOffline,
    eta,
    waitPointName,
    dataVersion,
    publishedAt,
    catalogSource,
}) {
    const etaVisible = hasCoordinates && eta && !eta.loading && eta.etaMinutes !== null;
    const isArrival = eta?.status === 'available';
    const estimateLabel = eta?.loading
        ? 'Calculando'
        : eta?.status === 'out_of_service'
        ? 'Servicio no disponible'
        : eta?.status === 'offline'
        ? 'ETA sin conexión'
        : ['no_route', 'insufficient_data', 'version_mismatch', 'backend', 'network', 'timeout', 'app_check'].includes(eta?.status)
        ? 'Estimación no disponible'
        : isArrival
        ? 'Llegada estimada'
        : 'Espera promedio estimada';
    const isCircuit = datosRuta.sequences?.some((sequence) => sequence.id === datosRuta.defaultSequenceId && sequence.kind === 'circuit');
    const estimatedArrival = eta?.estimatedArrivalAt
        ? new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(eta.estimatedArrivalAt))
        : null;

    return (
        <View style={styles.cardContainer}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.empresaText}>{datosRuta.empresa}</Text>
                    <Text style={styles.subtext}>Servicio Urbano de Ilo</Text>
                </View>
                <TouchableOpacity onPress={onToggleFavorite} activeOpacity={0.7}>
                    <Ionicons
                        name={isFavorite ? "star" : "star-outline"}
                        size={26}
                        color={isFavorite ? "#FFD700" : theme.colors.textLight}
                    />
                </TouchableOpacity>
            </View>

            <RouteDirectionBadge origin={datosRuta.origen} destination={datosRuta.destino} color={datosRuta.color} isCircuit={isCircuit} />

            <View style={[styles.etaContainer, eta?.status === 'out_of_service' && styles.etaUnavailableContainer]}>
                <View style={styles.etaBadge}>
                    <Ionicons name="time" size={20} color={theme.colors.primary} />
                    <Text style={styles.etaLabel}>{estimateLabel}</Text>
                </View>
                <View style={styles.etaTimeRow}>
                    {eta?.loading ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : etaVisible ? (
                        <><Text style={styles.etaMinutes}>{eta.etaMinutes}</Text><Text style={styles.etaUnit}> min</Text></>
                    ) : (
                        <Text style={styles.etaUnavailable}>
                            {eta?.assumptions?.note || 'Estimación no disponible'}
                        </Text>
                    )}
                </View>
                {waitPointName || eta?.assumptions?.waitPoint ? <Text style={styles.waitPointText}>Esperas en: {waitPointName || eta.assumptions.waitPoint}</Text> : null}
                {isArrival && estimatedArrival ? <Text style={styles.arrivalText}>Hora estimada: {estimatedArrival}</Text> : null}
                {etaVisible ? <Text style={styles.toleranceText}>{eta.assumptions.note}</Text> : null}
            </View>

            <View style={styles.detailsGrid}>
                <View style={styles.detailBox}>
                    <Ionicons name="cash-outline" size={18} color={theme.colors.textMuted} />
                    <Text style={styles.detailTitle}>Tarifa</Text>
                    <Text style={styles.detailValue}>{datosRuta.tarifa || 'Por definir'}</Text>
                </View>

                <View style={styles.detailBox}>
                    <Ionicons name="calendar-outline" size={18} color={theme.colors.textMuted} />
                    <Text style={styles.detailTitle}>Horario</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>{datosRuta.horario || 'Por definir'}</Text>
                </View>

                <View style={styles.detailBox}>
                    <Ionicons name="git-network-outline" size={18} color={theme.colors.textMuted} />
                    <Text style={styles.detailTitle}>Frecuencia</Text>
                    <Text style={styles.detailValue}>{datosRuta.frecuencia || 'Por definir'}</Text>
                </View>
            </View>

            {dataVersion ? <Text style={styles.dataVersion}>Datos {dataVersion}{publishedAt ? ` · ${publishedAt.slice(0, 10)}` : ''}{catalogSource === 'cache' ? ' · copia guardada' : ''}</Text> : null}
            {datosRuta.service?.source ? (
                <Text style={styles.dataSource} numberOfLines={2}>
                    Fuente operativa: {datosRuta.service.source}{datosRuta.service.sourceDate ? ` · ${datosRuta.service.sourceDate}` : ''}
                </Text>
            ) : null}

            {isOffline && (
                <View style={[styles.instructionBanner, { backgroundColor: theme.colors.danger + '15' }]}>
                    <Ionicons name="wifi" size={18} color={theme.colors.danger} style={{ marginRight: 6 }} />
                    <Text style={[styles.instructionText, { color: theme.colors.danger }]}>
                        Modo offline: información estática guardada; ETA desactivado.
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingHorizontal: 20, paddingTop: 20, paddingBottom: 25,
        ...theme.shadows.heavy,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    empresaText: { fontSize: 18, fontWeight: '700', color: theme.colors.textDark },
    subtext: { fontSize: 13, color: theme.colors.textMuted },
    etaContainer: {
        backgroundColor: theme.colors.background, borderRadius: 16, padding: 12,
        alignItems: 'center', marginTop: 8, marginBottom: 14, borderWidth: 1, borderColor: theme.colors.border,
    },
    etaUnavailableContainer: { backgroundColor: theme.colors.warningBg, borderColor: theme.colors.warningBorder },
    etaBadge: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
    etaLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.textMuted, marginLeft: 6, textTransform: 'uppercase' },
    etaTimeRow: { flexDirection: 'row', alignItems: 'baseline', minHeight: 46, justifyContent: 'center' },
    etaMinutes: { fontSize: 40, fontWeight: '800', color: theme.colors.textDark },
    etaUnit: { fontSize: 16, fontWeight: '700', color: theme.colors.textDark },
    etaUnavailable: { fontSize: 18, fontWeight: '700', color: theme.colors.textDark, textAlign: 'center' },
    waitPointText: { fontSize: 14, color: theme.colors.textDark, fontWeight: '700', textAlign: 'center' },
    arrivalText: { fontSize: 13, color: theme.colors.primary, fontWeight: '800', marginTop: 2 },
    toleranceText: { fontSize: 12, color: theme.colors.textMuted, textAlign: 'center', marginTop: 3 },
    detailsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
    detailBox: {
        flex: 1, backgroundColor: theme.colors.background, borderRadius: 12,
        padding: 8, alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: theme.colors.border,
    },
    detailTitle: { fontSize: 13, color: theme.colors.textMuted, fontWeight: '600', marginTop: 4 },
    detailValue: { fontSize: 14, fontWeight: '700', color: theme.colors.textDark, marginTop: 2 },
    dataVersion: { color: theme.colors.textMuted, fontSize: 11, textAlign: 'center', marginBottom: 10 },
    dataSource: { color: theme.colors.textMuted, fontSize: 10, lineHeight: 14, textAlign: 'center', marginTop: -6, marginBottom: 10 },
    instructionBanner: {
        flexDirection: 'row', backgroundColor: theme.colors.warningBg, borderRadius: 10,
        padding: 10, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.warningBorder,
    },
    instructionText: { flex: 1, fontSize: 14, color: theme.colors.warningText, fontWeight: '600', lineHeight: 19 },
});
