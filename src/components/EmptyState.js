import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/global-styles';
import AppButton from './AppButton';

export default function EmptyState({ icon = 'search-outline', title, message, actionLabel, onAction }) {
    return (
        <View style={styles.container}>
            <View style={styles.iconCircle}><Ionicons name={icon} size={36} color={theme.colors.primary} /></View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            {actionLabel ? <AppButton label={actionLabel} onPress={onAction} style={styles.button} /> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34, paddingVertical: 36 },
    iconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primarySoft, marginBottom: 18 },
    title: { color: theme.colors.textDark, fontSize: 18, fontWeight: '800', textAlign: 'center' },
    message: { color: theme.colors.textMuted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8 },
    button: { alignSelf: 'stretch', marginTop: 22 },
});
