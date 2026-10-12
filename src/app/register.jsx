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
import { registerUser } from '../services/auth';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Full name is required';
    }
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }
    if (!passwordConfirmation) {
      errs.passwordConfirmation = 'Please confirm your password';
    } else if (password !== passwordConfirmation) {
      errs.passwordConfirmation = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    setGeneralError('');
    try {
      const res = await registerUser({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });

      if (res.ok) {
        Alert.alert(
          'Registration Successful',
          res.message || 'Your account has been created. An administrator will review your account soon.',
          [
            {
              text: 'Go to Home',
              onPress: () => router.replace('/'),
            },
            {
              text: 'View Plans',
              onPress: () => router.replace('/plans'),
            },
          ]
        );
      } else {
        const errorMsg =
          res.message ||
          (res.errors && Object.values(res.errors).flat().join('\n')) ||
          'Registration failed. Please check your details.';
        setGeneralError(errorMsg);
        Alert.alert('Registration Notice', errorMsg);
      }
    } catch (err) {
      console.log('Registration error:', err);
      const msg = 'Unable to connect to registration service. Please check your internet connection.';
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
                <Ionicons name="sparkles" size={13} color={Colors.green} />
                <Text style={styles.badgeText}>JOIN BANGLADESH ANGELS</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>Create Account</Text>
            <Text style={styles.heroSubtitle}>
              Join the premier angel investor network to unlock curated dealflow, founder showcases, and syndicate participation.
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

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Full Name <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, errors.name && styles.inputWrapperError]}>
                <Ionicons name="person-outline" size={18} color={Colors.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Tanvir Ahmed"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                  autoCorrect={false}
                  value={name}
                  onChangeText={(t) => {
                    setName(t);
                    if (errors.name) setErrors({ ...errors, name: null });
                  }}
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Email Address <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, errors.email && styles.inputWrapperError]}>
                <Ionicons name="mail-outline" size={18} color={Colors.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="investor@example.com"
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

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Phone Number <Text style={styles.optionalText}>(optional)</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={18} color={Colors.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="+880 1700 000000"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Password <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, errors.password && styles.inputWrapperError]}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="At least 8 characters"
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

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Confirm Password <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, errors.passwordConfirmation && styles.inputWrapperError]}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Repeat your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  value={passwordConfirmation}
                  onChangeText={(t) => {
                    setPasswordConfirmation(t);
                    if (errors.passwordConfirmation) setErrors({ ...errors, passwordConfirmation: null });
                  }}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.muted}
                  />
                </TouchableOpacity>
              </View>
              {errors.passwordConfirmation && <Text style={styles.errorText}>{errors.passwordConfirmation}</Text>}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Creating Account...</Text>
                </View>
              ) : (
                <View style={styles.loadingRow}>
                  <Text style={styles.submitButtonText}>Create Account</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            {/* Already have an account */}
            <View style={styles.switchAuthRow}>
              <Text style={styles.switchAuthText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/login')} activeOpacity={0.7}>
                <Text style={styles.switchAuthLink}> Sign In</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.securityNote}>
              <Ionicons name="shield-checkmark" size={13} color={Colors.forest} />
              <Text style={styles.securityText}>
                By registering, you agree to BAN terms of membership and investor conduct standards.
              </Text>
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  heroBox: {
    marginBottom: Spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.full,
    gap: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.green,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.muted,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.lineLight,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: Radii.md,
    padding: 12,
    marginBottom: Spacing.md,
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    color: Colors.error,
    fontSize: 13,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.ink,
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: Colors.error,
  },
  optionalText: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.muted,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: Radii.md,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#FAFAFA',
  },
  inputWrapperError: {
    borderColor: Colors.error,
    backgroundColor: '#FFFBFB',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: Colors.ink,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: Colors.forest,
    borderRadius: Radii.md,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  switchAuthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
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
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: Radii.sm,
    padding: 10,
    marginTop: Spacing.xs,
    gap: 8,
  },
  securityText: {
    flex: 1,
    fontSize: 11,
    color: Colors.muted,
    lineHeight: 16,
  },
});
