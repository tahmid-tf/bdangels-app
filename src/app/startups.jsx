import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import SubpageHeader from '../components/SubpageHeader';
import MobileMenuModal from '../components/MobileMenuModal';
import FooterSection from '../components/home/FooterSection';
import { submitFounderPitch } from '../services/api';
import { Colors, Radii, Shadows } from '../constants/theme';

export default function StartupsScreen() {
  const [email, setEmail] = useState('');
  const [oneLine, setOneLine] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const handlePickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        setSelectedFile(res.assets[0]);
      }
    } catch (err) {
      console.log('Doc picker notice:', err);
    }
  };

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid founder email address.');
      return;
    }
    if (!oneLine || oneLine.trim().length < 5) {
      Alert.alert('Validation Error', 'Please enter a brief one-line elevator pitch.');
      return;
    }

    setSubmitting(true);
    try {
      await submitFounderPitch({
        email: email.trim(),
        oneLine: oneLine.trim(),
        file: selectedFile,
      });
      setSubmitted(true);
    } catch (err) {
      Alert.alert('Submission Notice', err.message || 'Unable to submit pitch right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SubpageHeader
        title="STARTUPS & SERVICES"
        onOpenMenu={() => setMenuVisible(true)}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.kickerRow}>
            <View style={styles.kickerBar} />
            <Text style={styles.kickerText}>FOR FOUNDERS</Text>
          </View>
          <Text style={styles.title}>Built for founders{"\n"}ready to move.</Text>
          <Text style={styles.subtitle}>
            Discover live investment opportunities, share your pitch, and access focused support designed
            to help promising companies become investment-ready.
          </Text>

          <View style={styles.heroNav}>
            <TouchableOpacity style={styles.heroNavBtn} onPress={() => router.push('/plans')}>
              <Text style={styles.heroNavText}>Active Deals</Text>
              <Ionicons name="lock-closed" size={13} color={Colors.ink} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroNavBtnActive} onPress={() => {}}>
              <Text style={styles.heroNavTextActive}>Send Your Pitch</Text>
              <Ionicons name="arrow-down" size={13} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 1. Active Deals Preview (Member Paywall) */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>MEMBER WORKSPACE</Text>
          <Text style={styles.sectionTitle}>Active Deals</Text>
          <Text style={styles.sectionDesc}>
            Live investment opportunities for approved network members on a paid plan.
          </Text>

          <View style={styles.paywallCard}>
            <View style={styles.paywallBadge}>
              <Ionicons name="lock-closed" size={18} color={Colors.green} />
            </View>
            <Text style={styles.paywallTitle}>Unlock Full Deal Pipeline</Text>
            <Text style={styles.paywallSubtitle}>
              Membership packages unlock dataroom access, syndicate participation, and live investor pitch sessions.
            </Text>
            <TouchableOpacity
              style={styles.paywallBtn}
              onPress={() => router.push('/plans')}
              activeOpacity={0.85}
            >
              <Text style={styles.paywallBtnText}>View Membership Packages</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Tailored Services for Startups */}
        <View style={styles.sectionAlt}>
          <Text style={styles.sectionEyebrow}>WHAT WE DO</Text>
          <Text style={styles.sectionTitle}>Founder Services & Advisory</Text>
          <Text style={styles.sectionDesc}>
            BAN builds the connective tissue around early-stage investment.
          </Text>

          <View style={styles.servicesGrid}>
            <View style={styles.serviceCard}>
              <View style={styles.serviceIcon}>
                <Ionicons name="document-text-outline" size={24} color={Colors.green} />
              </View>
              <Text style={styles.serviceTitle}>Founder Readiness</Text>
              <Text style={styles.serviceDesc}>
                Pitch deck polish, financial projection stress-testing, and metrics positioning before meeting syndicates.
              </Text>
            </View>

            <View style={styles.serviceCard}>
              <View style={styles.serviceIcon}>
                <Ionicons name="shield-checkmark-outline" size={24} color={Colors.green} />
              </View>
              <Text style={styles.serviceTitle}>Legal & Deal Structuring</Text>
              <Text style={styles.serviceDesc}>
                Standardized term sheets, convertible notes, RJSC regulatory filings, and cross-border SPVs.
              </Text>
            </View>

            <View style={styles.serviceCard}>
              <View style={styles.serviceIcon}>
                <Ionicons name="sparkles-outline" size={24} color={Colors.green} />
              </View>
              <Text style={styles.serviceTitle}>DeckVue (AI Due Diligence)</Text>
              <Text style={styles.serviceDesc}>
                AI-driven pitch deck analysis that extracts key signals and market intelligence in minutes.
              </Text>
              <TouchableOpacity
                style={styles.serviceLink}
                onPress={() => router.push('/deckvue')}
              >
                <Text style={styles.serviceLinkText}>Learn about DeckVue →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 3. Pitch Form Section */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>DIRECT APPLICATION</Text>
          <Text style={styles.sectionTitle}>Send Us Your Pitch</Text>
          <Text style={styles.sectionDesc}>
            Early-stage founders based in Bangladesh or building for frontier markets: share your company overview.
          </Text>

          <View style={styles.formCard}>
            {submitted ? (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={48} color={Colors.green} />
                <Text style={styles.successTitle}>Pitch Received!</Text>
                <Text style={styles.successText}>
                  Our investment team will review your submission and follow up with you at {email}.
                </Text>
                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={() => {
                    setSubmitted(false);
                    setEmail('');
                    setOneLine('');
                    setSelectedFile(null);
                  }}
                >
                  <Text style={styles.resetBtnText}>Submit Another Pitch</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Founder Contact Email *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="founder@yourcompany.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>One-Line Elevator Pitch *</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="e.g. B2B q-commerce platform connecting 50,000 neighborhood retailers..."
                    placeholderTextColor="#9CA3AF"
                    value={oneLine}
                    onChangeText={setOneLine}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Pitch Deck (Optional PDF / PPTX)</Text>
                  <TouchableOpacity
                    style={styles.uploadBtn}
                    onPress={handlePickDocument}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={selectedFile ? 'document-attach' : 'cloud-upload-outline'}
                      size={22}
                      color={Colors.green}
                    />
                    <Text style={styles.uploadBtnText} numberOfLines={1}>
                      {selectedFile ? selectedFile.name : 'Choose deck file (PDF/PPT)'}
                    </Text>
                  </TouchableOpacity>
                  {selectedFile ? (
                    <Text style={styles.fileSize}>
                      Size: {((selectedFile.size || 0) / 1024 / 1024).toFixed(2)} MB
                    </Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={submitting}
                  activeOpacity={0.85}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.submitBtnText}>Submit Pitch to BAN</Text>
                      <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <FooterSection />
      </ScrollView>

      <MobileMenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
    backgroundColor: '#F8FAF9',
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  kickerBar: {
    width: 14,
    height: 3,
    backgroundColor: Colors.green,
    borderRadius: 2,
  },
  kickerText: {
    color: Colors.green,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.ink,
    lineHeight: 38,
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.muted,
    lineHeight: 22,
    marginBottom: 20,
  },
  heroNav: {
    flexDirection: 'row',
    gap: 10,
  },
  heroNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radii.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.line,
  },
  heroNavText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.ink,
  },
  heroNavBtnActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radii.lg,
    backgroundColor: Colors.ink,
  },
  heroNavTextActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  sectionAlt: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.green,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 14,
    color: Colors.muted,
    lineHeight: 20,
    marginBottom: 20,
  },
  paywallCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: Radii.xxl,
    padding: 24,
    alignItems: 'center',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  paywallBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...Shadows.card,
  },
  paywallTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 6,
    textAlign: 'center',
  },
  paywallSubtitle: {
    fontSize: 13,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
    maxWidth: 320,
  },
  paywallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.ink,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radii.lg,
  },
  paywallBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  servicesGrid: {
    gap: 14,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadows.card,
  },
  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 6,
  },
  serviceDesc: {
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 19,
  },
  serviceLink: {
    marginTop: 10,
  },
  serviceLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.green,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadows.card,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radii.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.ink,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.green,
    borderRadius: Radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#F0FDF4',
  },
  uploadBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.green,
    flex: 1,
  },
  fileSize: {
    fontSize: 11,
    color: Colors.muted,
    marginTop: 4,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.green,
    paddingVertical: 14,
    borderRadius: Radii.md,
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.65,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.ink,
    marginTop: 12,
    marginBottom: 6,
  },
  successText: {
    fontSize: 13,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  resetBtn: {
    backgroundColor: Colors.ink,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radii.md,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
