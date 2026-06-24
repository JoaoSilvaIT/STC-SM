import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ShiftProvider } from './src/context/ShiftContext';
import { isDarkTheme } from './src/theme';

import LoginScreen          from './src/screens/LoginScreen';
import HomeScreen           from './src/screens/HomeScreen';
import ShiftDashboardScreen from './src/screens/ShiftDashboardScreen';
import ActivityScreen       from './src/screens/ActivityScreen';
import EndShiftScreen       from './src/screens/EndShiftScreen';

export type RootStackParamList = {
  Login:          undefined;
  Home:           undefined;
  ShiftDashboard: undefined;
  Activity:       undefined;
  EndShift:       undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { currentUser, loading } = useAuth();

  // Wait for the persisted-session check before deciding the entry screen.
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack.Navigator initialRouteName={currentUser ? 'Home' : 'Login'} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login"          component={LoginScreen} />
      <Stack.Screen name="Home"           component={HomeScreen} />
      <Stack.Screen name="ShiftDashboard" component={ShiftDashboardScreen} />
      <Stack.Screen name="Activity"       component={ActivityScreen} />
      <Stack.Screen name="EndShift"       component={EndShiftScreen} />
    </Stack.Navigator>
  );
}

function ShiftProviderWrapper({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  return (
    <ShiftProvider userId={currentUser?.id ?? 0}>
      {children}
    </ShiftProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style={isDarkTheme ? 'light' : 'dark'} />
      <AuthProvider>
        <ShiftProviderWrapper>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </ShiftProviderWrapper>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
