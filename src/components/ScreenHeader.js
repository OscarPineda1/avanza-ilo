import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/global-styles';

export default function ScreenHeader({ title, subtitle, onBack, rightAction, compact = false }) {
    return (
        <View style={[styles.container, compact && styles.compact]}>
            {onBack ? (
                <TouchableOpacity accessibilityLabel="Volver" onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={21} color={theme.colors.textDark} />
                </TouchableOpacity>
            ) : null}
            <View style={styles.copy}>
                <Text style={styles.title}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {rightAction || null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 10 },
    compact: { minHeight: 48, paddingHorizontal: 0 },
    backButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
    copy: { flex: 1 },
    title: { fontSize: 18, fontWeight: '800', color: theme.colors.textDark },
    subtitle: { marginTop: 2, fontSize: 12, color: theme.colors.textMuted },
});
