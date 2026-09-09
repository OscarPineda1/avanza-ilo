import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../styles/global-styles';

export default function RouteDirectionBadge({
    origin,
    destination,
    color = theme.colors.primary,
    compact = false,
    isCircuit = false,
}) {
    const originLabel = origin || 'Origen por definir';
    const destinationLabel = destination || 'Destino por definir';

    return (
        <View
            accessibilityLabel={isCircuit
                ? `Circuito: ${originLabel}, ${destinationLabel} y regreso a ${originLabel}`
                : `Recorrido: ${originLabel} hacia ${destinationLabel}`}
            style={[styles.container, compact && styles.compactContainer]}
        >
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={[styles.value, compact && styles.compactValue]} numberOfLines={1}>
                {isCircuit
                    ? <>Inicio y fin: {originLabel} <Text style={styles.via}>· vía</Text> {destinationLabel}</>
                    : <>{originLabel} <Text style={[styles.arrow, { color }]}>→</Text> {destinationLabel}</>}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        minHeight: 24,
    },
    compactContainer: { minHeight: 20, gap: 6 },
    dot: { width: 7, height: 7, borderRadius: 4 },
    value: {
        flex: 1,
        color: theme.colors.textDark,
        fontSize: 13,
        lineHeight: 17,
        fontWeight: '600',
    },
    compactValue: { fontSize: 12, lineHeight: 15, color: theme.colors.textMuted },
    arrow: { fontWeight: '900' },
    via: { color: theme.colors.textMuted, fontWeight: '500' },
});
