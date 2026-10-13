import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SubpageHeader from '../components/SubpageHeader';
import MobileMenuModal from '../components/MobileMenuModal';
import FooterSection from '../components/home/FooterSection';
import { Radii } from '../constants/theme';

const PIPELINE_TAGS = [
  { name: 'Extraction', bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  { name: 'Enrichment', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  { name: 'Verification', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  { name: 'Analysis', bg: '#faf5ff', color: '#7c3aed', border: '#ddd6fe' },
];

const STEPS = [
  {
    number: '1',
    title: 'Extract',
    desc: 'Upload a PDF and extract 12 structured sections — company, market, team, metrics, and more.',
  },
  {
    number: '2',
    title: 'Enrich',
    desc: 'Automatically pull company intel from Crunchbase — funding history, investors, and news.',
  },
  {
    number: '3',
    title: 'Verify',
    desc: 'AI fact-checks key claims on market size, competition, and team against web sources with confidence scores.',
  },
  {
    number: '4',
    title: 'Analyze',
    desc: 'Generate per-section strategic analysis with scoring, red flags, and investment recommendations.',
  },
];

const FEATURES = [
  {
    icon: 'flash-outline',
    title: 'Structured extraction',
    desc: 'Extract 12 data sections from any pitch deck — company overview, market size, team, metrics, and more.',
  },
  {
    icon: 'bar-chart-outline',
    title: 'Key metric extraction',
    desc: 'Pull traction, market size, competition, and team signals into structured fields.',
  },
  {
    icon: 'checkmark-circle-outline',
    title: 'Claim verification',
    desc: 'AI fact-checks claims on market size, competition, team, and problem against web sources.',
  },
  {
    icon: 'pulse-outline',
    title: 'Strategic analysis',
    desc: 'Per-section scoring with insights, red flags, and investment recommendations across 6 areas.',
  },
  {
    icon: 'share-social-outline',
    title: 'Sharing & collaboration',
    desc: 'Share decks with your team via email or secure time-limited links.',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Private by design',
    desc: "Tenant-scoped storage with seat-based access. We don't use your data for model training.",
  },
];

const USE_CASES = [
  {
    label: 'SOLO OPERATOR ANGELS',
    title: 'Get structured analysis on any deck in minutes.',
    desc: 'Upload a deck and get extraction, verification, and analysis automatically.',
  },
  {
    label: 'SYNDICATE MANAGERS',
    title: 'Share verified deal analysis with your network.',
    desc: 'Generate shareable summaries with AI-verified claims and red flags.',
  },
  {
    label: 'EMERGING FUNDS',
    title: 'Streamline due diligence across your team.',
    desc: 'Multi-seat workspace with role-based access and shared deal analysis.',
  },
];

const FAQS = [
  {
    q: 'How do you handle privacy and training?',
    a: 'DeckVue uses tenant-scoped storage with seat-based access. Your data is never used for model training, ensuring complete confidentiality of your deal flow.',
  },
  {
    q: 'How accurate is extraction and verification?',
    a: 'Our AI extracts 12 structured sections with high precision. Verification provides confidence scores by cross-referencing claims against multiple web sources and databases like Crunchbase.',
  },
  {
    q: 'How do I get started?',
    a: 'Simply upload a pitch deck PDF and DeckVue automatically processes it through extraction, enrichment, verification, and analysis — delivering a complete report in minutes.',
  },
];

export default function DeckVueScreen() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const handleLaunch = () => {
    Linking.openURL('https://deckvue.ai/').catch((err) =>
      console.log('DeckVue link error:', err)
    );
  };

  const toggleFaq = (index) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Clean Header without redundant sub-bar */}
      <SubpageHeader
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
            <View style={styles.kickerDot} />
            <Text style={styles.kickerText}>DECKVUE · AI DUE DILIGENCE</Text>
          </View>

          <Text style={styles.title}>Turn decks into decisions</Text>
          <Text style={styles.subtitle}>
            DeckVue is an AI-powered platform for pitch deck analysis — extract key data, enrich with market intel, verify claims, and generate strategic insights in minutes.
          </Text>

          {/* Primary CTA Button */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleLaunch}
            activeOpacity={0.88}
          >
            <Text style={styles.ctaButtonText}>Click here to try DeckVue</Text>
            <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Pipeline Tags */}
          <View style={styles.pipelineTags}>
            {PIPELINE_TAGS.map((tag) => (
              <View
                key={tag.name}
                style={[
                  styles.pipelineTag,
                  { backgroundColor: tag.bg, borderColor: tag.border },
                ]}
              >
                <Text style={[styles.pipelineTagText, { color: tag.color }]}>
                  {tag.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section Divider */}
        <View style={styles.divider} />

        {/* How It Works */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>How DeckVue works</Text>
            <Text style={styles.sectionSubtitle}>
              A focused pipeline tuned for investor workflows.
            </Text>
          </View>

          <View style={styles.stepsList}>
            {STEPS.map((step) => (
              <View key={step.number} style={styles.stepCard}>
                <View style={styles.stepHeaderRow}>
                  <View style={styles.stepNumberBadge}>
                    <Text style={styles.stepNumberText}>{step.number}</Text>
                  </View>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                </View>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section Divider */}
        <View style={styles.divider} />

        {/* Features ("Designed for speed and clarity") */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Designed for speed and clarity</Text>
            <Text style={styles.sectionSubtitle}>
              From raw PDF to verified analysis — faster.
            </Text>
          </View>

          <View style={styles.featuresGrid}>
            {FEATURES.map((feat, idx) => (
              <View key={idx} style={styles.featureCard}>
                <View style={styles.featureIconWrap}>
                  <Ionicons name={feat.icon} size={22} color="#15803d" />
                </View>
                <Text style={styles.featureTitle}>{feat.title}</Text>
                <Text style={styles.featureDesc}>{feat.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section Divider */}
        <View style={styles.divider} />

        {/* Use Cases ("Built for today's early-stage investors") */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {"Built for today's early-stage investors"}
            </Text>
            <Text style={styles.sectionSubtitle}>
              Pick your path and get leverage where it counts.
            </Text>
          </View>

          <View style={styles.useCasesList}>
            {USE_CASES.map((uc, idx) => (
              <View key={idx} style={styles.useCaseCard}>
                <View style={styles.useCaseLabelPill}>
                  <Text style={styles.useCaseLabelText}>{uc.label}</Text>
                </View>
                <Text style={styles.useCaseTitle}>{uc.title}</Text>
                <Text style={styles.useCaseDesc}>{uc.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section Divider */}
        <View style={styles.divider} />

        {/* FAQ Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Questions</Text>
            <Text style={styles.sectionSubtitle}>
              A few common things investors ask us.
            </Text>
          </View>

          <View style={styles.faqList}>
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <View key={idx} style={[styles.faqCard, isOpen && styles.faqCardOpen]}>
                  <TouchableOpacity
                    style={styles.faqHeader}
                    onPress={() => toggleFaq(idx)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.faqQuestion, isOpen && styles.faqQuestionOpen]}>
                      {faq.q}
                    </Text>
                    <Ionicons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={isOpen ? '#15803d' : '#9CA3AF'}
                    />
                  </TouchableOpacity>
                  {isOpen && (
                    <View style={styles.faqBody}>
                      <Text style={styles.faqAnswer}>{faq.a}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Partner Strip */}
        <View style={styles.partnerStrip}>
          <Text style={styles.partnerText}>
            DeckVue by Aevumis — Featured partner product of Bangladesh Angels Network
          </Text>
        </View>

        {/* Final CTA Callout */}
        <View style={styles.calloutCard}>
          <Text style={styles.calloutEyebrow}>READY TO ACCELERATE?</Text>
          <Text style={styles.calloutTitle}>Turn decks into decisions today</Text>
          <Text style={styles.calloutDesc}>
            Experience automated extraction, verified claims, and instant deal memos on deckvue.ai.
          </Text>
          <TouchableOpacity
            style={styles.calloutBtn}
            onPress={handleLaunch}
            activeOpacity={0.85}
          >
            <Text style={styles.calloutBtnText}>Launch DeckVue</Text>
            <Ionicons name="open-outline" size={16} color="#FFFFFF" />
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
    paddingHorizontal: 22,
    paddingTop: 36,
    paddingBottom: 32,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 16,
  },
  kickerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#15803d',
  },
  kickerText: {
    color: '#15803d',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.9,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 24,
    maxWidth: 520,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#15803d',
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#15803d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  pipelineTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 26,
  },
  pipelineTag: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    borderWidth: 1,
  },
  pipelineTagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 22,
  },
  section: {
    paddingHorizontal: 22,
    paddingVertical: 32,
  },
  sectionHeader: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  stepsList: {
    gap: 14,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  stepNumberBadge: {
    width: 32,
    height: 32,
    backgroundColor: '#15803d',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  stepDesc: {
    fontSize: 13.5,
    color: '#4B5563',
    lineHeight: 20,
  },
  featuresGrid: {
    gap: 14,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  featureDesc: {
    fontSize: 13.5,
    color: '#4B5563',
    lineHeight: 20,
  },
  useCasesList: {
    gap: 14,
  },
  useCaseCard: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 22,
  },
  useCaseLabelPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    marginBottom: 12,
  },
  useCaseLabelText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.6,
  },
  useCaseTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 23,
    marginBottom: 8,
  },
  useCaseDesc: {
    fontSize: 13.5,
    color: '#4B5563',
    lineHeight: 20,
  },
  faqList: {
    gap: 10,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    overflow: 'hidden',
  },
  faqCardOpen: {
    borderColor: '#BBF7D0',
    backgroundColor: '#FCFDFD',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 20,
  },
  faqQuestionOpen: {
    color: '#15803d',
  },
  faqBody: {
    paddingHorizontal: 18,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  faqAnswer: {
    fontSize: 13.5,
    color: '#4B5563',
    lineHeight: 21,
  },
  partnerStrip: {
    paddingHorizontal: 22,
    paddingVertical: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  partnerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
  calloutCard: {
    marginHorizontal: 22,
    marginTop: 8,
    marginBottom: 28,
    backgroundColor: '#0F3D34',
    borderRadius: 22,
    padding: 24,
  },
  calloutEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6EE7B7',
    letterSpacing: 1,
    marginBottom: 6,
  },
  calloutTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 28,
    marginBottom: 8,
  },
  calloutDesc: {
    fontSize: 13.5,
    color: '#D1FAE5',
    lineHeight: 20,
    marginBottom: 18,
  },
  calloutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#15803d',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  calloutBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
