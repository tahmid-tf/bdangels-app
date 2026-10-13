import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii, Shadows, Spacing } from '../constants/theme';
import { submitInvestorSignup } from '../services/auth';

const TIERS = [
  { slug: 'free', name: 'Free', price: 0, description: 'Start with free tier to explore community deals.' },
  { slug: 'core', name: 'Core', price: 250, description: 'Curated syndicates, community sessions & quarterly reports.' },
  { slug: 'advanced', name: 'Advanced', price: 500, description: 'Direct deal allocations, deep-dive dataroom & founder intros.' },
  { slug: 'institutional', name: 'Institutional', price: 1000, description: 'Dedicated account manager, bespoke syndicate terms & co-investment rights.' },
];

const GENDERS = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'other', label: 'Other' },
];

const EXPERTISE_LEVELS = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'expert', label: 'Expert' },
];

export default function RegisterScreen() {
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [designation, setDesignation] = useState('');
  const [primaryCountry, setPrimaryCountry] = useState('Bangladesh');
  const [countryCode, setCountryCode] = useState('+880');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('male');
  const [investmentExpertise, setInvestmentExpertise] = useState('beginner');
  const [linkedin, setLinkedin] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const validate = () => {
    const errs = {};
    if (!firstName.trim()) errs.firstName = 'First name is required';
    if (!lastName.trim()) errs.lastName = 'Last name is required';
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!address.trim()) errs.address = 'Preferred address is required';
    if (!companyName.trim()) errs.companyName = 'Company name is required';
    if (!designation.trim()) errs.designation = 'Designation is required';
    if (!phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (phone.trim().length < 6) {
      errs.phone = 'Please enter a valid phone number';
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
    if (!agreedToTerms) {
      errs.terms = 'You must agree to the terms and conditions';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    setGeneralError('');
    try {
      const activeTier = TIERS.find((t) => t.slug === selectedPlan) || TIERS[0];
      const res = await submitInvestorSignup({
        first_name: firstName,
        last_name: lastName,
        email,
        address,
        phone,
        country_code: countryCode,
        primary_country: primaryCountry,
        gender,
        password,
        password_confirmation: passwordConfirmation,
        selected_plan: selectedPlan,
        selected_plan_price: activeTier.price,
        organization: companyName,
        designation,
        investment_expertise: investmentExpertise,
        linkedin: linkedin.trim(),
      });

      if (res.ok) {
        Alert.alert(
          'Application Submitted',
          'Your angel investor application has been successfully submitted! An administrator will review your account.',
          [
            {
              text: 'Go to Dashboard',
              onPress: () => router.replace('/investor'),
            },
            {
              text: 'View Deals',
              onPress: () => router.replace('/startups'),
            },
          ]
        );
      } else {
        const errorMsg =
          res.message ||
          (res.errors && Object.values(res.errors).flat().join('\n')) ||
          'Application submission failed. Please check the fields and try again.';
        setGeneralError(errorMsg);
        Alert.alert('Application Notice', errorMsg);
      }
    } catch (err) {
      console.log('Registration error:', err);
      const msg = 'Unable to connect to registration server. Please check your internet connection.';
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
          {/* Hero Welcome Banner (matching web /investor/signup) */}
          <View style={styles.heroBanner}>
            <View style={styles.heroBadgeRow}>
              <View style={styles.heroBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
                <Text style={styles.heroBadgeText}>ANGEL INVESTOR NETWORK</Text>
              </View>
            </View>
            <Text style={styles.heroBannerTitle}>Become an Angel Investor</Text>
            <Text style={styles.heroBannerSubtitle}>
              Join a global network of over 450 executives and operators who have built and expanded companies all over the world.
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Investor Application</Text>
              <Text style={styles.formSubtitle}>
                Please complete the form below. Fields marked with * are required.
              </Text>
            </View>

            {Boolean(generalError) && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={Colors.error} />
                <Text style={styles.errorBannerText}>{generalError}</Text>
              </View>
            )}

            {/* 1. Choose your tier */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeaderTitle}>Choose Your Tier</Text>
              <Text style={styles.sectionHeaderSubtitle}>
                Free is selected by default. You can upgrade now or anytime later.
              </Text>

              <View style={styles.tiersGrid}>
                {TIERS.map((tier) => {
                  const isSelected = selectedPlan === tier.slug;
                  return (
                    <TouchableOpacity
                      key={tier.slug}
                      style={[styles.tierCard, isSelected && styles.tierCardSelected]}
                      onPress={() => setSelectedPlan(tier.slug)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.tierTopRow}>
                        <Text style={[styles.tierName, isSelected && styles.tierNameSelected]}>
                          {tier.name}
                        </Text>
                        <Ionicons
                          name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                          size={18}
                          color={isSelected ? Colors.forest : '#9CA3AF'}
                        />
                      </View>
                      <Text style={[styles.tierPrice, isSelected && styles.tierPriceSelected]}>
                        ${tier.price} <Text style={styles.tierPriceSub}>/yr</Text>
                      </Text>
                      <Text style={styles.tierDesc} numberOfLines={2}>
                        {tier.description}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 2. Personal Information */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeaderTitle}>Personal Information</Text>

              {/* First Name & Last Name */}
              <View style={styles.rowTwoCols}>
                <View style={styles.colHalf}>
                  <Text style={styles.inputLabel}>First Name *</Text>
                  <View style={[styles.inputWrapper, errors.firstName && styles.inputWrapperError]}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Tanvir"
                      placeholderTextColor="#9CA3AF"
                      value={firstName}
                      onChangeText={(t) => {
                        setFirstName(t);
                        if (errors.firstName) setErrors({ ...errors, firstName: null });
                      }}
                    />
                  </View>
                  {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
                </View>

                <View style={styles.colHalf}>
                  <Text style={styles.inputLabel}>Last Name *</Text>
                  <View style={[styles.inputWrapper, errors.lastName && styles.inputWrapperError]}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Ahmed"
                      placeholderTextColor="#9CA3AF"
                      value={lastName}
                      onChangeText={(t) => {
                        setLastName(t);
                        if (errors.lastName) setErrors({ ...errors, lastName: null });
                      }}
                    />
                  </View>
                  {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
                </View>
              </View>

              {/* Email Address */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address *</Text>
                <View style={[styles.inputWrapper, errors.email && styles.inputWrapperError]}>
                  <Ionicons name="mail-outline" size={18} color={Colors.muted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="investor@company.com"
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

              {/* Preferred Address */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Preferred Address *</Text>
                <View style={[styles.inputWrapper, errors.address && styles.inputWrapperError]}>
                  <Ionicons name="location-outline" size={18} color={Colors.muted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Gulshan 2, Dhaka"
                    placeholderTextColor="#9CA3AF"
                    value={address}
                    onChangeText={(t) => {
                      setAddress(t);
                      if (errors.address) setErrors({ ...errors, address: null });
                    }}
                  />
                </View>
                {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
              </View>

              {/* Phone Number with Country Code */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone / WhatsApp Number *</Text>
                <View style={styles.phoneInputRow}>
                  <View style={styles.countryCodeBox}>
                    <TextInput
                      style={styles.countryCodeInput}
                      value={countryCode}
                      onChangeText={setCountryCode}
                      placeholder="+880"
                      keyboardType="phone-pad"
                    />
                  </View>
                  <View style={[styles.inputWrapper, styles.phoneMainInput, errors.phone && styles.inputWrapperError]}>
                    <Ionicons name="call-outline" size={18} color={Colors.muted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="1700 000000"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="phone-pad"
                      value={phone}
                      onChangeText={(t) => {
                        setPhone(t);
                        if (errors.phone) setErrors({ ...errors, phone: null });
                      }}
                    />
                  </View>
                </View>
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              </View>

              {/* Gender Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Gender *</Text>
                <View style={styles.pillsRow}>
                  {GENDERS.map((g) => (
                    <TouchableOpacity
                      key={g.id}
                      style={[styles.pillBtn, gender === g.id && styles.pillBtnActive]}
                      onPress={() => setGender(g.id)}
                    >
                      <Text style={[styles.pillBtnText, gender === g.id && styles.pillBtnTextActive]}>
                        {g.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* 3. Professional Background */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeaderTitle}>Professional Background</Text>

              {/* Company Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Company Name *</Text>
                <View style={[styles.inputWrapper, errors.companyName && styles.inputWrapperError]}>
                  <Ionicons name="business-outline" size={18} color={Colors.muted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Pathao / Grameenphone / ABC Capital"
                    placeholderTextColor="#9CA3AF"
                    value={companyName}
                    onChangeText={(t) => {
                      setCompanyName(t);
                      if (errors.companyName) setErrors({ ...errors, companyName: null });
                    }}
                  />
                </View>
                {errors.companyName && <Text style={styles.errorText}>{errors.companyName}</Text>}
              </View>

              {/* Designation */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Designation in Company *</Text>
                <View style={[styles.inputWrapper, errors.designation && styles.inputWrapperError]}>
                  <Ionicons name="briefcase-outline" size={18} color={Colors.muted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Managing Director / VP / Partner"
                    placeholderTextColor="#9CA3AF"
                    value={designation}
                    onChangeText={(t) => {
                      setDesignation(t);
                      if (errors.designation) setErrors({ ...errors, designation: null });
                    }}
                  />
                </View>
                {errors.designation && <Text style={styles.errorText}>{errors.designation}</Text>}
              </View>

              {/* Primary Country */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Primary Country *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="globe-outline" size={18} color={Colors.muted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Bangladesh"
                    placeholderTextColor="#9CA3AF"
                    value={primaryCountry}
                    onChangeText={setPrimaryCountry}
                  />
                </View>
              </View>

              {/* Investment Expertise Level */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Level of Investment Expertise *</Text>
                <View style={styles.pillsRow}>
                  {EXPERTISE_LEVELS.map((lvl) => (
                    <TouchableOpacity
                      key={lvl.id}
                      style={[styles.pillBtn, investmentExpertise === lvl.id && styles.pillBtnActive]}
                      onPress={() => setInvestmentExpertise(lvl.id)}
                    >
                      <Text style={[styles.pillBtnText, investmentExpertise === lvl.id && styles.pillBtnTextActive]}>
                        {lvl.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* LinkedIn URL */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  LinkedIn Profile <Text style={styles.optionalText}>(optional)</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="logo-linkedin" size={18} color={Colors.muted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="https://linkedin.com/in/yourprofile"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                    value={linkedin}
                    onChangeText={setLinkedin}
                  />
                </View>
              </View>
            </View>

            {/* 4. Account Security */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeaderTitle}>Account Security</Text>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password *</Text>
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
                <Text style={styles.inputLabel}>Confirm Password *</Text>
                <View style={[styles.inputWrapper, errors.passwordConfirmation && styles.inputWrapperError]}>
                  <Ionicons name="lock-closed-outline" size={18} color={Colors.muted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Re-enter your password"
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
            </View>

            {/* Terms and conditions agreement checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => {
                setAgreedToTerms(!agreedToTerms);
                if (errors.terms) setErrors({ ...errors, terms: null });
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name={agreedToTerms ? 'checkbox' : 'square-outline'}
                size={22}
                color={agreedToTerms ? Colors.forest : Colors.muted}
              />
              <Text style={styles.termsText}>
                I agree to the BAN terms and conditions, MoU, and investor conduct standards.
              </Text>
            </TouchableOpacity>
            {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

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
                  <Text style={styles.submitButtonText}>Submitting Application...</Text>
                </View>
              ) : (
                <View style={styles.loadingRow}>
                  <Text style={styles.submitButtonText}>Submit Application</Text>
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
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  heroBanner: {
    backgroundColor: '#0a5554',
    borderRadius: Radii.xl,
    padding: 20,
    marginBottom: Spacing.md,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.full,
    gap: 6,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  heroBannerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  heroBannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.lineLight,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  formHeader: {
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.forest,
  },
  formSubtitle: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 2,
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
  sectionBlock: {
    marginBottom: Spacing.lg,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 2,
  },
  sectionHeaderSubtitle: {
    fontSize: 12,
    color: Colors.muted,
    marginBottom: 10,
  },
  tiersGrid: {
    gap: 8,
  },
  tierCard: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: Radii.md,
    padding: 12,
    backgroundColor: '#FAFAFA',
  },
  tierCardSelected: {
    borderColor: Colors.forest,
    backgroundColor: '#EAF6F3',
  },
  tierTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  tierName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.muted,
    textTransform: 'uppercase',
  },
  tierNameSelected: {
    color: Colors.forest,
  },
  tierPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 2,
  },
  tierPriceSelected: {
    color: Colors.forest,
  },
  tierPriceSub: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.muted,
  },
  tierDesc: {
    fontSize: 11,
    color: Colors.muted,
    lineHeight: 15,
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing.sm,
  },
  colHalf: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: Spacing.sm,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 4,
  },
  optionalText: {
    fontSize: 11,
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
    height: 46,
    backgroundColor: '#FAFAFA',
  },
  inputWrapperError: {
    borderColor: Colors.error,
    backgroundColor: '#FFFBFB',
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: Colors.ink,
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countryCodeBox: {
    width: 75,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: Radii.md,
    height: 46,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countryCodeInput: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.forest,
    textAlign: 'center',
    width: '100%',
  },
  phoneMainInput: {
    flex: 1,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  pillBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: Radii.md,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBtnActive: {
    borderColor: Colors.forest,
    backgroundColor: '#EAF6F3',
  },
  pillBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.muted,
  },
  pillBtnTextActive: {
    color: Colors.forest,
    fontWeight: '700',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 8,
    marginTop: 4,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: Colors.ink,
    lineHeight: 18,
  },
  errorText: {
    color: Colors.error,
    fontSize: 11,
    marginTop: 3,
  },
  submitButton: {
    backgroundColor: Colors.forest,
    borderRadius: Radii.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
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
  },
  switchAuthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  switchAuthText: {
    fontSize: 13,
    color: Colors.muted,
  },
  switchAuthLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.forest,
  },
});
