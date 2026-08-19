import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function RouteBadge({ route, color, size = 'regular' }) {
    return (
        <View style={[styles.badge, styles[size], { backgroundColor: color }]}>
            <Text style={[styles.label, size === 'small' && styles.smallLabel]}>{route}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: { alignItems: 'center', justifyContent: 'center', borderRadius: 7 },
    regular: { width: 42, height: 42 },
    small: { width: 28, height: 28, borderRadius: 6 },
    label: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
    smallLabel: { fontSize: 11 },
});
