import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import SubpageHeader from '../components/SubpageHeader';
import MobileMenuModal from '../components/MobileMenuModal';
import { Colors, Radii, Shadows, Spacing } from '../constants/theme';
import { submitCheckout, checkCheckoutStatus } from '../services/api';

const MEMBERSHIP_TIERS = [
  {
    id: 1,
    name: 'Core',
    slug: 'core',
    price: 399,
    price_formatted: '$399 /yr',
    badge: 'Essential',
    icon: require('../../assets/images/plan_core.webp'),
    description: 'Essential access for angels ready to discover and participate.',
  },
  {
    id: 2,
    name: 'Advanced',
    slug: 'advanced',
    price: 599,
    price_formatted: '$599 /yr',
    badge: 'Most Popular',
    icon: require('../../assets/images/plan_advanced.webp'),
    description: 'Deeper visibility & data room tools for active, hands-on investors.',
  },
  {
    id: 3,
    name: 'Institutional',
    slug: 'institutional',
    price: 999,
    price_formatted: '$999 /yr',
    badge: 'Teams & Funds',
    icon: require('../../assets/images/plan_institutional.webp'),
    description: 'Expanded access for funds, family offices and investment teams.',
  },
];

const COUNTRY_CODES = [
  { code: '880', label: '🇧🇩 Bangladesh (+880)' },
  { code: '1', label: '🇺🇸 United States (+1)' },
  { code: '44', label: '🇬🇧 United Kingdom (+44)' },
  { code: '971', label: '🇦🇪 UAE (+971)' },
  { code: '966', label: '🇸🇦 Saudi Arabia (+966)' },
  { code: '65', label: '🇸🇬 Singapore (+65)' },
  { code: '61', label: '🇦🇺 Australia (+61)' },
  { code: '91', label: '🇮🇳 India (+91)' },
  { code: '1', label: '🇨🇦 Canada (+1)' },
];

const COUNTRIES = [
  'Bangladesh',
  'United States',
  'United Kingdom',
  'United Arab Emirates',
  'Singapore',
  'Saudi Arabia',
  'Australia',
  'Canada',
  'India',
  'Malaysia',
  'Germany',
  'Other',
];

export default function CheckoutScreen() {
  const params = useLocalSearchParams();
  const initialPlanSlug = (typeof params.plan === 'string' ? params.plan : 'core').toLowerCase();

  const [selectedSlug, setSelectedSlug] = useState(initialPlanSlug);
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [orderReference, setOrderReference] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [countryCode, setCountryCode] = useState('880');
  const [phone, setPhone] = useState('');
  const [primaryCountry, setPrimaryCountry] = useState('Bangladesh');
  const [companyName, setCompanyName] = useState('');
  const [designation, setDesignation] = useState('');
  const [gender, setGender] = useState('male');
  const [investmentExpertise, setInvestmentExpertise] = useState('intermediate');
  const [linkedin, setLinkedin] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [policyConsent, setPolicyConsent] = useState(true);

  // Field error messages
  const [errors, setErrors] = useState({});

  const activeTier = MEMBERSHIP_TIERS.find((t) => t.slug === selectedSlug) || MEMBERSHIP_TIERS[0];
  const bdtEstimate = Math.round(activeTier.price * 122);

  const validateForm = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!address.trim()) errs.address = 'Billing address is required';
    if (!phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (phone.trim().length < 6) {
      errs.phone = 'Please enter a valid phone number';
    }
    if (!companyName.trim()) errs.companyName = 'Company name is required';
    if (!designation.trim()) errs.designation = 'Designation is required';
    if (!password) {
      errs.password = 'Password is required (min 8 characters)';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }
    if (password !== passwordConfirmation) {
      errs.passwordConfirmation = 'Passwords do not match';
    }
    if (!policyConsent) {
      errs.policyConsent = 'You must agree to membership policies to proceed';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Incomplete Form', 'Please complete all required fields indicated in red.');
      return;
    }

    setLoading(true);

    const payload = {
      name: name.trim(),
      email: email.trim(),
      address: address.trim(),
      country_code: countryCode,
      phone: phone.trim(),
      primary_country: primaryCountry,
      company_name: companyName.trim(),
      designation: designation.trim(),
      gender,
      investment_expertise: investmentExpertise,
      linkedin: linkedin.trim() || null,
      password,
      password_confirmation: passwordConfirmation,
      plan: activeTier.slug,
      price: activeTier.price,
      policy_consent: true,
      policy_version: 'cc58c65c57eda069cc4c64da8509ece3cb76aee6dc4be530a8b450e7085a64ff',
    };

    try {
      const response = await submitCheckout(payload);

      if (response.ok && response.data) {
        const result = response.data;

        if (result.status === 'completed') {
          setCompletedOrder(true);
          Alert.alert('Membership Activated', 'Your membership has been activated successfully!');
          return;
        }

        if (result.payment_url) {
          setPaymentUrl(result.payment_url);
          setOrderReference(result.order_reference || result.transaction_id);

          // Open the payment gateway in-app browser
          await WebBrowser.openBrowserAsync(result.payment_url, {
            toolbarColor: '#005A36',
            controlsColor: '#FFFFFF',
            showTitle: true,
            presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
          });
        } else {
          Alert.alert('Notice', response.message || 'Payment initiated.');
        }
      } else {
        const errorMsg =
          response.message ||
          (response.errors && Object.values(response.errors).flat().join('\n')) ||
          'Failed to process checkout. Please try again.';
        Alert.alert('Checkout Notice', errorMsg);
      }
    } catch (err) {
      console.log('Checkout error:', err);
      Alert.alert('Error', 'An unexpected error occurred. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!orderReference) return;
    setVerifying(true);
    try {
      const statusRes = await checkCheckoutStatus(orderReference);
      if (statusRes && statusRes.data) {
        const orderData = statusRes.data;
        if (orderData.status === 'completed' || orderData.payment_status === 'paid') {
          setCompletedOrder(true);
          Alert.alert('Payment Verified!', 'Your BAN membership is active. Welcome to Bangladesh Angels!');
        } else {
          Alert.alert(
            'Payment Pending',
            'Your payment is currently being processed by the gateway. If you completed payment, it will confirm shortly.'
          );
        }
      } else {
        Alert.alert('Status Check', 'Payment status pending verification. Please try again in a moment.');
      }
    } catch (err) {
      console.log('Status verify error:', err);
    } finally {
      setVerifying(false);
    }
  };

  const handleReopenGateway = async () => {
    if (paymentUrl) {
      await WebBrowser.openBrowserAsync(paymentUrl, {
        toolbarColor: '#005A36',
        controlsColor: '#FFFFFF',
        showTitle: true,
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SubpageHeader
        title="MEMBERSHIP CHECKOUT"
        showBack={true}
        onBack={() => router.back()}
        onOpenMenu={() => setMenuVisible(true)}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Title */}
          <View style={styles.heroSection}>
            <Text style={styles.heroKicker}>UPGRADE TO BAN INVESTOR</Text>
            <Text style={styles.heroTitle}>{"Let's finish powering you up!"}</Text>
            <Text style={styles.heroSubtitle}>
              Complete your membership registration below to activate deal access.
            </Text>
          </View>

          {/* Active Order Notice if Payment Initiated */}
          {orderReference && !completedOrder && (
            <View style={styles.activeSessionBanner}>
              <View style={styles.bannerHeader}>
                <Ionicons name="card" size={20} color={Colors.green} />
                <Text style={styles.bannerTitle}>Payment Session Active</Text>
              </View>
              <Text style={styles.bannerText}>
                Reference: <Text style={styles.bannerBold}>{orderReference}</Text>
              </Text>
              <Text style={styles.bannerSubtitle}>
                Complete transaction via DGePay gateway (Card / bKash / Nagad / Net Banking).
              </Text>
              <View style={styles.bannerActions}>
                <TouchableOpacity
                  style={styles.verifyBtn}
                  onPress={handleVerifyPayment}
                  disabled={verifying}
                >
                  {verifying ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
                      <Text style={styles.verifyBtnText}>Verify Payment</Text>
                    </>
                  )}
                </TouchableOpacity>

                {paymentUrl && (
                  <TouchableOpacity style={styles.reopenBtn} onPress={handleReopenGateway}>
                    <Text style={styles.reopenBtnText}>Re-open Gateway</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Completed Order Success State */}
          {completedOrder && (
            <View style={styles.successCard}>
              <View style={styles.successIconWrap}>
                <Ionicons name="checkmark-circle" size={48} color={Colors.green} />
              </View>
              <Text style={styles.successTitle}>Membership Confirmed!</Text>
              <Text style={styles.successDesc}>
                Your {activeTier.name} membership has been activated successfully. You can now explore curated deals
                and join founder showcases.
              </Text>
              <TouchableOpacity style={styles.returnBtn} onPress={() => router.replace('/')}>
                <Text style={styles.returnBtnText}>Go to Home</Text>
              </TouchableOpacity>
            </View>
          )}

          {!completedOrder && (
            <>
              {/* Plan Selector Carousel/Tabs */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeading}>1. SELECT MEMBERSHIP TIER</Text>
                <View style={styles.planSelectorRow}>
                  {MEMBERSHIP_TIERS.map((tier) => {
                    const isSelected = tier.slug === selectedSlug;
                    return (
                      <TouchableOpacity
                        key={tier.slug}
                        style={[styles.planTab, isSelected && styles.planTabSelected]}
                        onPress={() => setSelectedSlug(tier.slug)}
                        activeOpacity={0.8}
                      >
                        {isSelected && (
                          <View style={styles.selectedCheck}>
                            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                          </View>
                        )}
                        <Image source={tier.icon} style={styles.planTabIcon} resizeMode="contain" />
                        <Text style={[styles.planTabName, isSelected && styles.planTabNameSelected]}>
                          {tier.name}
                        </Text>
                        <Text style={[styles.planTabPrice, isSelected && styles.planTabPriceSelected]}>
                          ${tier.price}/yr
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Selected Plan Details */}
                <View style={styles.selectedPlanBanner}>
                  <View style={styles.selectedPlanLeft}>
                    <Text style={styles.selectedPlanName}>{activeTier.name} Membership</Text>
                    <Text style={styles.selectedPlanDesc}>{activeTier.description}</Text>
                  </View>
                  <View style={styles.selectedPlanRight}>
                    <Text style={styles.selectedPlanPrice}>${activeTier.price}</Text>
                    <Text style={styles.selectedPlanPeriod}>/ year (USD)</Text>
                  </View>
                </View>
              </View>

              {/* Personal & Billing Details Form */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeading}>2. INVESTOR INFORMATION</Text>

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
                      placeholder="tanvir@example.com"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={(t) => {
                        setEmail(t);
                        if (errors.email) setErrors({ ...errors, email: null });
                      }}
                    />
                  </View>
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>

                {/* Billing Address */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Billing / Street Address <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <View style={[styles.inputWrapper, errors.address && styles.inputWrapperError]}>
                    <Ionicons name="location-outline" size={18} color={Colors.muted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Street, City, Postal Code"
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

                {/* Country Code & Phone */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Phone Number <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <View style={styles.phoneRow}>
                    <View style={styles.countryCodeWrap}>
                      <TextInput
                        style={styles.countryCodeInput}
                        value={`+${countryCode}`}
                        editable={false}
                      />
                    </View>
                    <View style={[styles.phoneInputWrap, errors.phone && styles.inputWrapperError]}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="1712345678"
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

                  {/* Quick country code selector chips */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                    {COUNTRY_CODES.map((c) => (
                      <TouchableOpacity
                        key={c.code + c.label}
                        style={[
                          styles.countryChip,
                          countryCode === c.code && styles.countryChipSelected,
                        ]}
                        onPress={() => setCountryCode(c.code)}
                      >
                        <Text
                          style={[
                            styles.countryChipText,
                            countryCode === c.code && styles.countryChipTextSelected,
                          ]}
                        >
                          {c.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Country of Residence */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Country of Residence <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                    {COUNTRIES.map((cty) => (
                      <TouchableOpacity
                        key={cty}
                        style={[
                          styles.countryChip,
                          primaryCountry === cty && styles.countryChipSelected,
                        ]}
                        onPress={() => setPrimaryCountry(cty)}
                      >
                        <Text
                          style={[
                            styles.countryChipText,
                            primaryCountry === cty && styles.countryChipTextSelected,
                          ]}
                        >
                          {cty}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Professional Details */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeading}>3. PROFESSIONAL PROFILE</Text>

                {/* Company Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Company Name <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <View style={[styles.inputWrapper, errors.companyName && styles.inputWrapperError]}>
                    <Ionicons name="business-outline" size={18} color={Colors.muted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Apex Ventures"
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
                  <Text style={styles.inputLabel}>
                    Designation / Title <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <View style={[styles.inputWrapper, errors.designation && styles.inputWrapperError]}>
                    <Ionicons name="briefcase-outline" size={18} color={Colors.muted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Managing Partner / Angel Investor"
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

                {/* Gender */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Gender</Text>
                  <View style={styles.segmentedRow}>
                    {['male', 'female', 'other'].map((g) => (
                      <TouchableOpacity
                        key={g}
                        style={[styles.segmentBtn, gender === g && styles.segmentBtnActive]}
                        onPress={() => setGender(g)}
                      >
                        <Text style={[styles.segmentText, gender === g && styles.segmentTextActive]}>
                          {g.charAt(0).toUpperCase() + g.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Investment Expertise */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Investment Expertise</Text>
                  <View style={styles.segmentedRow}>
                    {['beginner', 'intermediate', 'expert'].map((exp) => (
                      <TouchableOpacity
                        key={exp}
                        style={[styles.segmentBtn, investmentExpertise === exp && styles.segmentBtnActive]}
                        onPress={() => setInvestmentExpertise(exp)}
                      >
                        <Text style={[styles.segmentText, investmentExpertise === exp && styles.segmentTextActive]}>
                          {exp.charAt(0).toUpperCase() + exp.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* LinkedIn Profile */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>LinkedIn Profile (Optional)</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="logo-linkedin" size={18} color="#0A66C2" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="https://linkedin.com/in/username"
                      placeholderTextColor="#9CA3AF"
                      value={linkedin}
                      autoCapitalize="none"
                      onChangeText={setLinkedin}
                    />
                  </View>
                </View>
              </View>

              {/* Account Security (Password) */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeading}>4. ACCOUNT PASSWORD</Text>
                <Text style={styles.sectionSubtext}>
                  Create a password to access your BAN investor dashboard and deal dataroom.
                </Text>

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
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.passwordConfirmation && styles.inputWrapperError,
                    ]}
                  >
                    <Ionicons name="lock-closed-outline" size={18} color={Colors.muted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Re-enter password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPassword}
                      value={passwordConfirmation}
                      onChangeText={(t) => {
                        setPasswordConfirmation(t);
                        if (errors.passwordConfirmation)
                          setErrors({ ...errors, passwordConfirmation: null });
                      }}
                    />
                  </View>
                  {errors.passwordConfirmation && (
                    <Text style={styles.errorText}>{errors.passwordConfirmation}</Text>
                  )}
                </View>
              </View>

              {/* Order Summary & Payment Gateway Preview */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryHeader}>ORDER SUMMARY</Text>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subscription Plan</Text>
                  <Text style={styles.summaryValue}>{activeTier.name}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Billing Cadence</Text>
                  <Text style={styles.summaryValue}>1 Year (Annual)</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.summaryTotalRow}>
                  <Text style={styles.summaryTotalLabel}>Total Amount (USD)</Text>
                  <Text style={styles.summaryTotalValue}>${activeTier.price}.00</Text>
                </View>

                <View style={styles.bdtEstimateBox}>
                  <Ionicons name="information-circle" size={16} color={Colors.green} />
                  <Text style={styles.bdtEstimateText}>
                    Payable via DGePay: <Text style={styles.bdtEstimateBold}>৳ {bdtEstimate.toLocaleString()} BDT</Text>{' '}
                    (@ ৳122/$)
                  </Text>
                </View>

                {/* Policy Consent */}
                <TouchableOpacity
                  style={styles.consentRow}
                  activeOpacity={0.8}
                  onPress={() => setPolicyConsent(!policyConsent)}
                >
                  <View style={[styles.checkbox, policyConsent && styles.checkboxActive]}>
                    {policyConsent && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.consentText}>
                    I have read and agree to the BAN Membership Terms & Conditions, Privacy Policy, Delivery Policy,
                    and Refund Policy.
                  </Text>
                </TouchableOpacity>
                {errors.policyConsent && (
                  <Text style={styles.errorTextConsent}>{errors.policyConsent}</Text>
                )}

                {/* Complete Payment Button */}
                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.submitButtonText}>Connecting to Payment Gateway...</Text>
                    </View>
                  ) : (
                    <View style={styles.loadingRow}>
                      <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
                      <Text style={styles.submitButtonText}>
                        Proceed to Payment • ${activeTier.price}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.securityBadge}>
                  <Ionicons name="lock-closed" size={13} color={Colors.muted} />
                  <Text style={styles.securityText}>256-Bit SSL Encrypted & PCI-DSS Compliant Gateway</Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <MobileMenuModal visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  contentContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  heroKicker: {
    color: Colors.green,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  heroTitle: {
    color: Colors.ink,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSubtitle: {
    color: Colors.muted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 340,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadows.card,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.green,
    letterSpacing: 1.2,
    marginBottom: Spacing.md,
  },
  sectionSubtext: {
    fontSize: 13,
    color: Colors.muted,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  planSelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing.md,
  },
  planTab: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    borderColor: Colors.line,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    position: 'relative',
  },
  planTabSelected: {
    borderColor: Colors.green,
    backgroundColor: '#F0FDF4',
  },
  selectedCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planTabIcon: {
    width: 38,
    height: 38,
    marginBottom: 6,
  },
  planTabName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 2,
  },
  planTabNameSelected: {
    color: Colors.green,
  },
  planTabPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.muted,
  },
  planTabPriceSelected: {
    color: Colors.green,
  },
  selectedPlanBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5FAF7',
    padding: 14,
    borderRadius: Radii.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.green,
  },
  selectedPlanLeft: {
    flex: 1,
    paddingRight: 10,
  },
  selectedPlanName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 2,
  },
  selectedPlanDesc: {
    fontSize: 12,
    color: Colors.muted,
    lineHeight: 16,
  },
  selectedPlanRight: {
    alignItems: 'flex-end',
  },
  selectedPlanPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.green,
  },
  selectedPlanPeriod: {
    fontSize: 11,
    color: Colors.muted,
  },
  inputGroup: {
    marginBottom: 16,
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
    height: 48,
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
    fontSize: 14,
    color: Colors.ink,
    height: '100%',
  },
  errorText: {
    color: Colors.error,
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countryCodeWrap: {
    width: 80,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: Radii.md,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryCodeInput: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
  },
  phoneInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: Radii.md,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    height: 48,
  },
  chipsScroll: {
    marginTop: 8,
    flexDirection: 'row',
  },
  countryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: '#F9FAFB',
    marginRight: 6,
  },
  countryChipSelected: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  countryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.ink,
  },
  countryChipTextSelected: {
    color: '#FFFFFF',
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: Radii.md,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  segmentBtnActive: {
    borderColor: Colors.green,
    backgroundColor: '#F0FDF4',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.muted,
  },
  segmentTextActive: {
    color: Colors.green,
    fontWeight: '800',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadows.card,
  },
  summaryHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.green,
    letterSpacing: 1.2,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.muted,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.ink,
  },
  summaryTotalValue: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.green,
  },
  bdtEstimateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: Radii.sm,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  bdtEstimateText: {
    fontSize: 12,
    color: '#065F46',
  },
  bdtEstimateBold: {
    fontWeight: '800',
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  consentText: {
    flex: 1,
    fontSize: 12,
    color: Colors.muted,
    lineHeight: 17,
  },
  errorTextConsent: {
    color: Colors.error,
    fontSize: 11,
    marginBottom: 10,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: Colors.green,
    borderRadius: Radii.pill,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 12,
  },
  securityText: {
    fontSize: 11,
    color: Colors.muted,
  },
  activeSessionBanner: {
    backgroundColor: '#ECFDF5',
    borderRadius: Radii.xl,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.green,
    marginBottom: Spacing.lg,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.green,
  },
  bannerText: {
    fontSize: 13,
    color: Colors.ink,
    marginBottom: 4,
  },
  bannerBold: {
    fontWeight: '700',
  },
  bannerSubtitle: {
    fontSize: 12,
    color: Colors.muted,
    lineHeight: 16,
    marginBottom: 12,
  },
  bannerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  verifyBtn: {
    flex: 1,
    backgroundColor: Colors.green,
    borderRadius: Radii.md,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  reopenBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.green,
    borderRadius: Radii.md,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reopenBtnText: {
    color: Colors.green,
    fontSize: 13,
    fontWeight: '700',
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadows.card,
    marginVertical: Spacing.xl,
  },
  successIconWrap: {
    marginBottom: Spacing.md,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 8,
  },
  successDesc: {
    fontSize: 14,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  returnBtn: {
    backgroundColor: Colors.green,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: Radii.pill,
  },
  returnBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
