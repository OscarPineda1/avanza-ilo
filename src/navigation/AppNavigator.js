import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import ExploreRoutesScreen from '../screens/ExploreRoutesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BottomNavbar from '../components/BottomNavbar';

const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

// Este bloque maneja las 3 pestañas principales (Inicio, Explorar, Perfil)
function MainTabs() {
    return (
        <Tab.Navigator
            tabBar={(props) => <BottomNavbar {...props} />}
            tabBarPosition="bottom"
            screenOptions={{ swipeEnabled: true }} // Funcion deslizamiento con el dedo
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="ExploreRoutes" component={ExploreRoutesScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <NavigationContainer>
            {/* El Stack principal permite entrar y salir de pantallas como MapScreen */}
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen name="MapScreen" component={MapScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}