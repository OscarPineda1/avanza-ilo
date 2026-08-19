import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/global-styles';

export default function AppButton({ label, onPress, variant = 'primary', disabled = false, loading = false, leftIcon, rightIcon, style }) {
    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ disabled: disabled || loading, busy: loading }}
            activeOpacity={0.82}
            disabled={disabled || loading}
            onPress={onPress}
            style={[styles.base, styles[variant], disabled && styles.disabled, style]}
        >
            {loading ? <ActivityIndicator color={variant === 'primary' ? theme.colors.surface : theme.colors.primary} /> : <View style={styles.content}>{leftIcon ? <Ionicons name={leftIcon} size={19} style={styles.icon} color={variant === 'primary' ? theme.colors.surface : theme.colors.primary} /> : null}<Text style={[styles.label, variant === 'outline' && styles.outlineLabel, variant === 'text' && styles.textLabel]}>{label}</Text>{rightIcon ? <Ionicons name={rightIcon} size={19} style={styles.icon} color={variant === 'primary' ? theme.colors.surface : theme.colors.primary} /> : null}</View>}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: { minHeight: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
    primary: { backgroundColor: theme.colors.primary },
    outline: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.primary },
    text: { backgroundColor: 'transparent' },
    disabled: { opacity: 0.45 },
    content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    icon: { marginHorizontal: 4 },
    label: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
    outlineLabel: { color: theme.colors.primary },
    textLabel: { color: theme.colors.primary },
});
