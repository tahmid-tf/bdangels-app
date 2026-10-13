import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { loginWithGoogle } from '../services/auth';
import { Radii } from '../constants/theme';

/**
 * Reusable Google Authentication Button
 * Matches the official web application's Google Auth button design and behavior.
 *
 * @param {'login' | 'signup'} [props.intent='login']
 * @param {string} [props.label]
 * @param {object} [props.style]
 * @param {function} [props.onSuccess]
 * @param {function} [props.onError]
 * @param {boolean} [props.disabled=false]
 */
export default function GoogleAuthButton({
  intent = 'login',
  label,
  style,
  onSuccess,
  onError,
  disabled = false,
}) {
  const [loading, setLoading] = useState(false);

  const defaultLabel =
    intent === 'signup' ? 'Sign up with Google' : 'Continue with Google';
  const buttonText = label || defaultLabel;

  const handlePress = async () => {
    if (loading || disabled) return;

    setLoading(true);
    try {
      const res = await loginWithGoogle({ intent });

      if (res.ok) {
        if (onSuccess) {
          onSuccess(res);
        } else {
          if (res.isNewUser) {
            Alert.alert(
              'Welcome to BAN',
              'Your angel investor account has been created via Google. An administrator will review your account.',
              [
                {
                  text: 'Go to Dashboard',
                  onPress: () => router.replace(res.isAdmin ? '/admin' : '/investor'),
                },
              ]
            );
          } else {
            router.replace(res.isAdmin ? '/admin' : '/investor');
          }
        }
      } else if (!res.cancelled) {
        const errorMsg =
          res.message || 'Google sign-in could not be completed. Please try again.';
        if (onError) {
          onError(errorMsg);
        } else {
          Alert.alert('Google Sign-In Notice', errorMsg);
        }
      }
    } catch (err) {
      console.log('Google Auth button error:', err);
      const errorMsg =
        'Unable to complete Google authentication. Please check your internet connection.';
      if (onError) {
        onError(errorMsg);
      } else {
        Alert.alert('Google Sign-In Error', errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        (disabled || loading) && styles.buttonDisabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <View style={styles.contentRow}>
          <ActivityIndicator size="small" color="#4285F4" />
          <Text style={styles.text}>Connecting to Google...</Text>
        </View>
      ) : (
        <View style={styles.contentRow}>
          <Image
            source={require('../../assets/images/google-icon.png')}
            style={styles.googleIcon}
            resizeMode="contain"
          />
          <Text style={styles.text}>{buttonText}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: Radii.md,
    paddingVertical: 13,
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    letterSpacing: -0.2,
  },
});
