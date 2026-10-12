import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii, Shadows, Spacing } from '../constants/theme';
import { loginUser } from '../services/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    setGeneralError('');
    try {
      const res = await loginUser(email, password);

      if (res.ok) {
        if (res.isAdmin) {
          router.replace('/admin');
        } else {
          router.replace('/investor');
        }
      } else {
        const errorMsg =
          res.message ||
          (res.errors && Object.values(res.errors).flat().join('\n')) ||
          'Invalid email or password.';
        setGeneralError(errorMsg);
        Alert.alert('Login Notice', errorMsg);
      }
    } catch (err) {
      console.log('Login error:', err);
      const msg = 'Unable to connect to authentication service. Please check your internet connection.';
      setGeneralError(msg);
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Bar with Back and Logo */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.ink} />
        </TouchableOpacity>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.headerPlaceholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flexOne}
      >
        <ScrollView
          style={styles.flexOne}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Welcome */}
          <View style={styles.heroBox}>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Ionicons name="shield-checkmark" size={13} color={Colors.green} />
                <Text style={styles.badgeText}>PORTAL ACCESS</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>Sign in to BAN</Text>
            <Text style={styles.heroSubtitle}>
              Access the administrator management workspace or investor deal room.
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {Boolean(generalError) && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={Colors.error} />
                <Text style={styles.errorBannerText}>{generalError}</Text>
              </View>
            )}

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Email Address <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, errors.email && styles.inputWrapperError]}>
                <Ionicons name="mail-outline" size={18} color={Colors.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="admin@bdangels.co"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Password <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, errors.password && styles.inputWrapperError]}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (errors.password) setErrors({ ...errors, password: null });
                  }}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.muted}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Authenticating...</Text>
                </View>
              ) : (
                <View style={styles.loadingRow}>
                  <Text style={styles.submitButtonText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            {/* Register Option */}
            <View style={styles.switchAuthRow}>
              <Text style={styles.switchAuthText}>{"Don't have an account?"}</Text>
              <TouchableOpacity onPress={() => router.push('/register')} activeOpacity={0.7}>
                <Text style={styles.switchAuthLink}> Create Account</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.securityNote}>
              <Ionicons name="lock-closed" size={12} color={Colors.muted} />
              <Text style={styles.securityText}>Authorized BAN administrative & member credentials only.</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flexOne: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lineLight,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    height: 32,
    width: 140,
  },
  headerPlaceholder: {
    width: 38,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  heroBox: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  badgeRow: {
    marginBottom: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.mint,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  badgeText: {
    color: Colors.green,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.ink,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xxl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadows.card,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: Radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#B91C1C',
    fontWeight: '600',
    lineHeight: 17,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: Colors.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: Radii.md,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    height: 50,
  },
  inputWrapperError: {
    borderColor: Colors.error,
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.ink,
    height: '100%',
  },
  errorText: {
    color: Colors.error,
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: Colors.green,
    borderRadius: Radii.pill,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    ...Shadows.card,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
  },
  securityText: {
    fontSize: 11,
    color: Colors.muted,
    textAlign: 'center',
  },
  switchAuthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  switchAuthText: {
    fontSize: 14,
    color: Colors.muted,
  },
  switchAuthLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.forest,
  },
});
