import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/global-styles';
import AppButton from '../components/AppButton';

const steps = [
    { icon: 'bus-outline', title: 'Olvídate de la espera', text: 'Sabrás si tu transporte está por llegar y podrás elegir la ruta que más te conviene.' },
    { icon: 'map-outline', title: 'Conoce tu ETA sin GPS en las unidades', text: 'Calculamos el tiempo estimado de arribo usando datos de rutas y paraderos.' },
    { icon: 'heart-outline', title: 'Encuentra tus rutas favoritas', text: 'Guarda las rutas que utilizas con frecuencia para consultarlas más rápido.' },
];

export default function OnboardingScreen({ navigation }) {
    const [step, setStep] = useState(0);
    const current = steps[step];
    const finish = () => navigation.replace('MainTabs');
    const next = () => step === steps.length - 1 ? finish() : setStep((value) => value + 1);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text onPress={finish} style={styles.skip}>Omitir</Text>
                <View style={styles.hero}>
                    <View style={styles.illustration}><Ionicons name={current.icon} size={82} color={theme.colors.primary} /></View>
                </View>
                <View style={styles.content}>
                    <Text style={styles.title}>{current.title}</Text>
                    <Text style={styles.message}>{current.text}</Text>
                    <View style={styles.dots}>{steps.map((_, index) => <View key={index} style={[styles.dot, index === step && styles.activeDot]} />)}</View>
                    <AppButton label={step === steps.length - 1 ? 'Comenzar' : 'Siguiente'} onPress={next} />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.surface },
    container: { flex: 1, paddingHorizontal: 24 },
    skip: { alignSelf: 'flex-end', color: theme.colors.textMuted, fontSize: 14, fontWeight: '700', paddingVertical: 14 },
    hero: { flex: 1, minHeight: 260, justifyContent: 'center', alignItems: 'center' },
    illustration: { width: 190, height: 190, backgroundColor: theme.colors.primarySoft, borderRadius: 95, justifyContent: 'center', alignItems: 'center' },
    content: { paddingBottom: 26 },
    title: { color: theme.colors.textDark, fontSize: 26, fontWeight: '800', textAlign: 'center' },
    message: { color: theme.colors.textMuted, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 12, minHeight: 66 },
    dots: { height: 42, flexDirection: 'row', gap: 6, justifyContent: 'center', alignItems: 'center' },
    dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#D8DEE2' },
    activeDot: { width: 22, backgroundColor: theme.colors.primary },
});
