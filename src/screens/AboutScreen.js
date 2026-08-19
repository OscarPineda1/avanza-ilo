import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/global-styles';
import ScreenHeader from '../components/ScreenHeader';
import AppButton from '../components/AppButton';

export default function AboutScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScreenHeader title="Acerca de Avanza Ilo" onBack={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.logo}><Ionicons name="bus" size={34} color="#FFFFFF" /></View>
                <Text style={styles.name}>Avanza Ilo</Text><Text style={styles.version}>Versión 1.0.0 MVP</Text>
                <Text style={styles.paragraph}>Avanza Ilo es una plataforma diseñada para mejorar la movilidad urbana en Ilo, mostrando rutas, paraderos y tiempos estimados de arribo.</Text>
                <View style={styles.info}><Text style={styles.label}>CON EL RESPALDO DE</Text><Text style={styles.value}>Municipalidad Provincial de Ilo</Text></View>
                <View style={styles.info}><Text style={styles.label}>DESARROLLADO POR</Text><Text style={styles.value}>Jesús Martínez · Ricardo Pineda</Text><Text style={styles.value}>Escuela Profesional de Ingeniería</Text></View>
                <AppButton label="Términos y privacidad" variant="outline" onPress={() => Linking.openURL('https://www.privacypolicies.com/')} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: theme.colors.surface }, content: { padding: 24, alignItems: 'center' }, logo: { width: 74, height: 74, borderRadius: 37, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary, marginTop: 20 }, name: { color: theme.colors.textDark, fontWeight: '800', fontSize: 21, marginTop: 13 }, version: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 }, paragraph: { color: theme.colors.textMuted, fontSize: 14, lineHeight: 21, marginTop: 30, textAlign: 'center' }, info: { width: '100%', backgroundColor: theme.colors.background, borderRadius: 12, padding: 15, marginTop: 15 }, label: { color: theme.colors.textLight, fontSize: 10, fontWeight: '800', letterSpacing: .5 }, value: { color: theme.colors.textDark, fontSize: 13, lineHeight: 19, marginTop: 5 }, });
