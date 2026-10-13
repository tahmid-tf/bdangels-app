import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Colors } from '../../../constants/theme';
import { parseUserPayload, saveAuthSession } from '../../../services/auth';

/**
 * Google OAuth deep link callback screen.
 * Handles incoming `bdangelsapp://auth/google/callback` deep links cleanly,
 * eliminating any unmatched route warnings, saving session, and routing to dashboard.
 */
export default function GoogleCallbackScreen() {
  const params = useLocalSearchParams();

  useEffect(() => {
    try {
      WebBrowser.maybeCompleteAuthSession();
    } catch {
      // ignore
    }

    const { token, user, error } = params;

    if (error) {
      console.log('Google callback error received:', error);
      router.replace('/login');
      return;
    }

    if (token && user) {
      const userObj = parseUserPayload(Array.isArray(user) ? user[0] : user);

      if (userObj) {
        saveAuthSession(userObj, token).then(() => {
          const isAdmin = Boolean(
            userObj.is_admin ||
              userObj.role === 'admin' ||
              userObj.role === 'superadmin'
          );
          router.replace(isAdmin ? '/admin' : '/investor');
        });
        return;
      }
    }

    // Fallback if navigated without credentials
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [params]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color={Colors.green} style={styles.spinner} />
      <Text style={styles.text}>Completing sign-in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 180,
    height: 48,
    marginBottom: 24,
  },
  spinner: {
    marginBottom: 16,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.ink,
    letterSpacing: -0.2,
  },
});
