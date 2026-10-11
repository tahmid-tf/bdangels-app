import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SubpageHeader from '../components/SubpageHeader';
import MobileMenuModal from '../components/MobileMenuModal';
import FooterSection from '../components/home/FooterSection';
import { Colors, Radii, Shadows } from '../constants/theme';

const FEATURES = [
  {
    icon: 'flash-outline',
    title: 'Instant Signal Extraction',
    desc: 'Extract TAM, unit economics, revenue run rates, and burn multiple directly from raw PDF decks in seconds.',
  },
  {
    icon: 'stats-chart-outline',
    title: 'Frontier Market Benchmarking',
    desc: 'Benchmark traction and valuations against 50+ comparable rounds closed in Bangladesh and South Asia.',
  },
  {
    icon: 'alert-circle-outline',
    title: 'Red-Flag & Anomaly Detection',
    desc: 'Identify cap table dilution hazards, hidden debt instruments, and inconsistent financial assumptions.',
  },
  {
    icon: 'document-text-outline',
    title: 'Committee-Ready Memos',
    desc: 'Generate concise, formatted 2-page investment screening memos ready for angel syndicate review.',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Upload Pitch Deck',
    desc: 'Drop confidential PDF or PPTX presentations securely into DeckVue.',
  },
  {
    step: '02',
    title: 'Automated AI Parsing',
    desc: 'Proprietary models cross-examine claims against regional market datasets.',
  },
  {
    step: '03',
    title: 'Executive Due Diligence Report',
    desc: 'Receive comprehensive scoring, risk vectors, and investment takeaways.',
  },
];

export default function DeckVueScreen() {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleDemo = () => {
    Linking.openURL('mailto:hello@bdangels.co?subject=DeckVue%20Demo%20Request').catch((err) =>
      console.log('DeckVue email error:', err)
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SubpageHeader
        title="DECKVUE • AI DUE DILIGENCE"
        onOpenMenu={() => setMenuVisible(true)}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Ionicons name="sparkles" size={12} color={Colors.green} />
            <Text style={styles.badgeText}>AI-POWERED PLATFORM</Text>
          </View>
          <Text style={styles.title}>
            Analyze pitch decks in minutes, not days.
          </Text>
          <Text style={styles.subtitle}>
            DeckVue combines frontier-market venture intelligence with cutting-edge AI to automate
            first-look diligence, benchmark traction, and verify claims for founders and investors.
          </Text>

          <TouchableOpacity style={styles.demoBtn} onPress={handleDemo} activeOpacity={0.85}>
            <Text style={styles.demoBtnText}>Request DeckVue Demo</Text>
            <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Core Capabilities */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionEyebrow}>POWERFUL CAPABILITIES</Text>
          <Text style={styles.sectionTitle}>Built for Venture Rigor</Text>

          <View style={styles.featureGrid}>
            {FEATURES.map((item, idx) => (
              <View key={idx} style={styles.featureCard}>
                <View style={styles.iconCircle}>
                  <Ionicons name={item.icon} size={22} color={Colors.green} />
                </View>
                <Text style={styles.featureTitle}>{item.title}</Text>
                <Text style={styles.featureDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Workflow Steps */}
        <View style={styles.workflowSection}>
          <Text style={styles.sectionEyebrow}>SIMPLE WORKFLOW</Text>
          <Text style={styles.sectionTitle}>From Deck to Decision</Text>

          <View style={styles.stepsList}>
            {STEPS.map((s) => (
              <View key={s.step} style={styles.stepItem}>
                <View style={styles.stepNumWrap}>
                  <Text style={styles.stepNum}>{s.step}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{s.title}</Text>
                  <Text style={styles.stepDesc}>{s.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* CTA Card */}
        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>Accelerate your deal screening</Text>
          <Text style={styles.ctaDesc}>
            Join angel syndicates, family offices, and accelerators using DeckVue to streamline investment analysis.
          </Text>
          <TouchableOpacity style={styles.ctaButton} onPress={handleDemo} activeOpacity={0.85}>
            <Text style={styles.ctaButtonText}>Get Early Access</Text>
            <Ionicons name="mail" size={15} color={Colors.ink} />
          </TouchableOpacity>
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
    paddingBottom: 30,
    backgroundColor: '#F8FAF9',
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.pill,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.green,
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.ink,
    lineHeight: 36,
    letterSpacing: -0.7,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.muted,
    lineHeight: 22,
    marginBottom: 22,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.ink,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Radii.md,
    gap: 8,
  },
  demoBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingVertical: 28,
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
    marginBottom: 20,
  },
  featureGrid: {
    gap: 14,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadows.card,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 19,
  },
  workflowSection: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  stepsList: {
    gap: 16,
    marginTop: 8,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  stepNumWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.green,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 3,
  },
  stepDesc: {
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 18,
  },
  ctaCard: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 28,
    backgroundColor: Colors.ink,
    borderRadius: Radii.xxl,
    padding: 24,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  ctaDesc: {
    fontSize: 13,
    color: '#D1D5DB',
    lineHeight: 19,
    marginBottom: 18,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.mint,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radii.md,
    gap: 8,
  },
  ctaButtonText: {
    color: Colors.ink,
    fontSize: 13,
    fontWeight: '800',
  },
});
