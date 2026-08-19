import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { theme } from '../styles/global-styles';

export default function AppButton({ label, onPress, variant = 'primary', disabled = false, style }) {
    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            activeOpacity={0.82}
            disabled={disabled}
            onPress={onPress}
            style={[styles.base, styles[variant], disabled && styles.disabled, style]}
        >
            <Text style={[styles.label, variant === 'outline' && styles.outlineLabel, variant === 'text' && styles.textLabel]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: { minHeight: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
    primary: { backgroundColor: theme.colors.primary },
    outline: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.primary },
    text: { backgroundColor: 'transparent' },
    disabled: { opacity: 0.45 },
    label: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
    outlineLabel: { color: theme.colors.primary },
    textLabel: { color: theme.colors.primary },
});
