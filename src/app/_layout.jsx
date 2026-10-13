import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

WebBrowser.maybeCompleteAuthSession();
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen once layout is mounted
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FFFFFF' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="portfolio" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="team" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="startups" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="angel-academy" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="bwin" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="deckvue" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="resources" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="blogs/index" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="blogs/[slug]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="publications" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="faq" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="plans" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="checkout" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="about-us" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="login" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="register" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="auth/google/callback" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="investor" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="admin" options={{ headerShown: false, animation: 'slide_from_right' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
