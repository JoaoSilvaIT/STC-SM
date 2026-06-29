import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ShiftProvider } from './src/context/ShiftContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';
import './src/i18n';

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

function BootSplash() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
      <ActivityIndicator color={colors.amber} />
    </View>
  );
}

function AppNavigator() {
  const { currentUser, bootstrapping } = useAuth();
  if (bootstrapping) return <BootSplash />;
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

function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <ThemedStatusBar />
          <AuthProvider>
            <ShiftProviderWrapper>
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
            </ShiftProviderWrapper>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
