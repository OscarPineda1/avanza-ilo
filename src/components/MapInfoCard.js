import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/global-styles';
import { getRemoteFrequency } from '../services/eta';

const { width } = Dimensions.get('window');

export default function MapInfoCard({
    datosRuta,
    isFavorite,
    onToggleFavorite,
    hasCoordinates,
    isOffline,
    eta,
    originName,
    destinationName,
}) {
    const [etaResult, setEtaResult] = useState(eta);
    const [remoteFrequency, setRemoteFrequency] = useState(null);

    useEffect(() => {
        setEtaResult(eta);
    }, [eta]);

    useEffect(() => {
        if (!datosRuta?.nombre || isOffline) return;

        let cancelled = false;
        getRemoteFrequency(datosRuta.nombre)
            .then((minutes) => {
                if (!cancelled && minutes) {
                    setRemoteFrequency(`${minutes} min`);
                }
            })
            .catch(() => {});

        return () => { cancelled = true; };
    }, [datosRuta?.nombre, isOffline]);

    const etaVisible = !isOffline && hasCoordinates && etaResult;
    const etaFallback = !etaVisible;

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

            <View style={styles.etaContainer}>
                <View style={styles.etaBadge}>
                    <Ionicons name="time" size={20} color={theme.colors.primary} />
                    <Text style={styles.etaLabel}>ETA inferido</Text>
                </View>
                <View style={styles.etaTimeRow}>
                    {etaVisible ? (
                        <>
                            {etaResult.loading ? (
                                <ActivityIndicator size="small" color={theme.colors.primary} />
                            ) : (
                                <>
                                    <Text style={styles.etaMinutes}>{etaResult.minutes}</Text>
                                    <Text style={styles.etaUnit}> min restantes</Text>
                                </>
                            )}
                        </>
                    ) : (
                        <Text style={styles.etaUnavailable} numberOfLines={1}>
                            {isOffline ? 'ETA no disponible sin conexión' : 'ETA inferido no disponible'}
                        </Text>
                    )}
                </View>
                {!etaFallback && etaResult && etaResult.minutes && (
                    <Text style={styles.toleranceText}>
                        Desde {originName || 'origen'} hasta {destinationName || 'destino'} · Margen ±5 min
                    </Text>
                )}
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
                    <Text style={styles.detailValue}>{remoteFrequency || datosRuta.frecuencia || 'Por definir'}</Text>
                </View>
            </View>

            {isOffline && (
                <View style={[styles.instructionBanner, { backgroundColor: theme.colors.danger + '15' }]}>
                    <Ionicons name="wifi" size={18} color={theme.colors.danger} style={{ marginRight: 6 }} />
                    <Text style={[styles.instructionText, { color: theme.colors.danger }]}>
                        Modo offline: información estática en caché.
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        position: 'absolute', bottom: 0, width: width,
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingHorizontal: 20, paddingTop: 20, paddingBottom: 25,
        ...theme.shadows.heavy,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    empresaText: { fontSize: 18, fontWeight: '700', color: theme.colors.textDark },
    subtext: { fontSize: 13, color: theme.colors.textMuted },
    etaContainer: {
        backgroundColor: '#F0F6FF', borderRadius: 16, padding: 12,
        alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: '#D0E3FF',
    },
    etaBadge: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
    etaLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.primary, marginLeft: 6, textTransform: 'uppercase' },
    etaTimeRow: { flexDirection: 'row', alignItems: 'baseline', minHeight: 46, justifyContent: 'center' },
    etaMinutes: { fontSize: 40, fontWeight: '800', color: theme.colors.textDark },
    etaUnit: { fontSize: 16, fontWeight: '700', color: theme.colors.textDark },
    etaUnavailable: { fontSize: 18, fontWeight: '700', color: theme.colors.textDark, textAlign: 'center' },
    toleranceText: { fontSize: 14, color: theme.colors.textMuted, fontStyle: 'italic', textAlign: 'center' },
    detailsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
    detailBox: {
        flex: 1, backgroundColor: theme.colors.background, borderRadius: 12,
        padding: 8, alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: theme.colors.border,
    },
    detailTitle: { fontSize: 13, color: theme.colors.textMuted, fontWeight: '600', marginTop: 4 },
    detailValue: { fontSize: 14, fontWeight: '700', color: theme.colors.textDark, marginTop: 2 },
    instructionBanner: {
        flexDirection: 'row', backgroundColor: theme.colors.warningBg, borderRadius: 10,
        padding: 10, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.warningBorder,
    },
    instructionText: { flex: 1, fontSize: 14, color: theme.colors.warningText, fontWeight: '600', lineHeight: 19 },
});
