import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/global-styles';

export default function SettingOption({ icon, iconBg, iconColor, title, subtitle, hasSwitch, switchValue, onSwitchChange, onPress }) {
    return (
        <>
            <TouchableOpacity style={styles.menuItem} activeOpacity={hasSwitch ? 1 : 0.7} onPress={hasSwitch ? null : onPress}>
                <View style={[styles.menuIconBox, { backgroundColor: iconBg }]}>
                    <Ionicons name={icon} size={20} color={iconColor} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.menuText}>{title}</Text>
                    {subtitle && <Text style={styles.menuSubText}>{subtitle}</Text>}
                </View>
                {hasSwitch ? (
                    <Switch value={switchValue} onValueChange={onSwitchChange} trackColor={{ false: '#D0D0D0', true: iconColor }} />
                ) : (
                    <Ionicons name="chevron-forward" size={20} color="#CCC" />
                )}
            </TouchableOpacity>
            <View style={styles.divider} />
        </>
    );
}

const styles = StyleSheet.create({
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    menuIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    menuText: { fontSize: 16, fontWeight: '600', color: theme.colors.textDark },
    menuSubText: { fontSize: 12, color: '#777', marginTop: 2 },
    divider: { height: 1, backgroundColor: theme.colors.border, marginLeft: 66 },
});