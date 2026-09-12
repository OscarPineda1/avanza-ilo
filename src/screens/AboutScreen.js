import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/global-styles';
import ScreenHeader from '../components/ScreenHeader';

export default function AboutScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScreenHeader title="Acerca de Avanza Ilo" onBack={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.logo}><Ionicons name="bus" size={34} color="#FFFFFF" /></View>
                <Text style={styles.name}>Avanza Ilo</Text><Text style={styles.version}>Versión 1.0.0 MVP</Text>
                <Text style={styles.paragraph}>Avanza Ilo es una prueba de concepto para consultar rutas, referencias del recorrido y estimaciones de espera en Ilo.</Text>
                <View style={styles.info}><Text style={styles.label}>PROYECTO ACADÉMICO</Text><Text style={styles.value}>Prueba de concepto sin respaldo institucional declarado.</Text></View>
                <View style={styles.info}><Text style={styles.label}>DESARROLLADO POR</Text><Text style={styles.value}>Oscar René Pineda Flores · Joshua Fabianni Martínez Blanco</Text><Text style={styles.value}>Escuela Profesional de Ingeniería</Text></View>
                <View style={styles.info}><Text style={styles.label}>PRIVACIDAD Y USO DE DATOS</Text><Text style={styles.value}>No necesitas crear una cuenta. La ubicación es opcional, se usa solo para sugerir referencias cercanas y no se guarda en favoritos, Firestore ni registros de la aplicación. El GPS corresponde al pasajero y no indica la ubicación de las unidades.</Text></View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: theme.colors.surface }, content: { padding: 24, alignItems: 'center' }, logo: { width: 74, height: 74, borderRadius: 37, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary, marginTop: 20 }, name: { color: theme.colors.textDark, fontWeight: '800', fontSize: 21, marginTop: 13 }, version: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 }, paragraph: { color: theme.colors.textMuted, fontSize: 14, lineHeight: 21, marginTop: 30, textAlign: 'center' }, info: { width: '100%', backgroundColor: theme.colors.background, borderRadius: 12, padding: 15, marginTop: 15 }, label: { color: theme.colors.textLight, fontSize: 10, fontWeight: '800', letterSpacing: .5 }, value: { color: theme.colors.textDark, fontSize: 13, lineHeight: 19, marginTop: 5 }, });
