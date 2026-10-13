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
import { Colors, Radii, Shadows } from '../constants/theme';

const MODULES = [
  {
    number: '01',
    title: 'Angel Investing Fundamentals & Portfolio Construction',
    desc: 'Understanding risk-return profiles in emerging markets, power-law dynamics, check sizing, and building a 15–20 startup portfolio.',
  },
  {
    number: '02',
    title: 'Deal Sourcing, Founder Screening & Market Sizing',
    desc: 'How BAN sources 200+ startups annually, screening early indicators, TAM/SAM/SOM validation, and founder-market fit.',
  },
  {
    number: '03',
    title: 'Financial Diligence & Dataroom Analysis',
    desc: 'Stress-testing unit economics (CAC, LTV, burn multiple, churn), forensic review of cap tables, and commercial due diligence.',
  },
  {
    number: '04',
    title: 'Term Sheets, Valuation & Regulatory Structuring',
    desc: 'SAFEs, convertible notes, priced equity rounds, pre-money vs post-money dilution, RJSC compliances, and cross-border SPVs.',
  },
  {
    number: '05',
    title: 'Post-Investment Governance, Follow-ons & Exits',
    desc: 'Investor rights, information rights, navigating secondary sales, trade sales, M&A, and participating in follow-on rounds.',
  },
];

export default function AngelAcademyScreen() {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleApply = () => {
    Linking.openURL('mailto:hello@bdangels.co?subject=BAN%20Angel%20Academy%20Cohort%20Application').catch((err) =>
      console.log('Apply email error:', err)
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SubpageHeader
        title="BAN ANGEL ACADEMY"
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
            <Text style={styles.badgeText}>3-MONTH COHORT PROGRAM</Text>
          </View>
          <Text style={styles.title}>
            Master angel investing with Bangladesh{"'"}s top syndicate.
          </Text>
          <Text style={styles.subtitle}>
            A practical, hands-on academy designed for executives, family offices, and professionals looking to
            back high-growth startups with confidence, rigor, and strategic conviction.
          </Text>

          <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.85}>
            <Text style={styles.applyBtnText}>Apply for Next Cohort</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Program Pillars */}
        <View style={styles.pillarsSection}>
          <Text style={styles.sectionEyebrow}>WHAT MAKES IT DIFFERENT</Text>
          <Text style={styles.sectionTitle}>The Academy Experience</Text>

          <View style={styles.pillarCards}>
            <View style={styles.pillarCard}>
              <View style={styles.pillarIcon}>
                <Ionicons name="people-outline" size={22} color={Colors.green} />
              </View>
              <Text style={styles.pillarTitle}>1:1 BAN Analyst Coaching</Text>
              <Text style={styles.pillarDesc}>
                Paired with a senior deals analyst to dissect real pitch decks, financial models, and datarooms.
              </Text>
            </View>

            <View style={styles.pillarCard}>
              <View style={styles.pillarIcon}>
                <Ionicons name="briefcase-outline" size={22} color={Colors.green} />
              </View>
              <Text style={styles.pillarTitle}>Live Investment Committees</Text>
              <Text style={styles.pillarDesc}>
                Attend real BAN screening sessions and observe how experienced angels evaluate founders.
              </Text>
            </View>

            <View style={styles.pillarCard}>
              <View style={styles.pillarIcon}>
                <Ionicons name="shield-checkmark-outline" size={22} color={Colors.green} />
              </View>
              <Text style={styles.pillarTitle}>BAN Membership Included</Text>
              <Text style={styles.pillarDesc}>
                Graduates receive 1-year complimentary full access to active dealflow and co-investment syndicates.
              </Text>
            </View>
          </View>
        </View>

        {/* Curriculum Modules */}
        <View style={styles.modulesSection}>
          <Text style={styles.sectionEyebrow}>COMPREHENSIVE CURRICULUM</Text>
          <Text style={styles.sectionTitle}>5 Core Modules</Text>
          <Text style={styles.sectionDesc}>
            Structured across 12 weeks of live sessions, guest lectures, and practical case studies.
          </Text>

          <View style={styles.moduleList}>
            {MODULES.map((mod) => (
              <View key={mod.number} style={styles.moduleCard}>
                <View style={styles.moduleHeader}>
                  <Text style={styles.moduleNum}>{mod.number}</Text>
                  <Text style={styles.moduleTitle}>{mod.title}</Text>
                </View>
                <Text style={styles.moduleDesc}>{mod.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Callout */}
        <View style={styles.calloutCard}>
          <Text style={styles.calloutEyebrow}>LIMITED SEATS PER COHORT</Text>
          <Text style={styles.calloutTitle}>Ready to start your angel journey?</Text>
          <Text style={styles.calloutText}>
            Cohorts are capped at 25 participants to ensure personalized feedback and interactive discussions.
          </Text>
          <TouchableOpacity style={styles.calloutBtn} onPress={handleApply} activeOpacity={0.85}>
            <Text style={styles.calloutBtnText}>Submit Application Inquiry</Text>
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
    paddingBottom: 28,
    backgroundColor: '#092F29',
  },
  badge: {
    backgroundColor: 'rgba(201, 243, 220, 0.16)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radii.pill,
    alignSelf: 'flex-start',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(201, 243, 220, 0.3)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.mint,
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 36,
    letterSpacing: -0.6,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 22,
    marginBottom: 22,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.green,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Radii.md,
    gap: 8,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  pillarsSection: {
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
    marginBottom: 16,
  },
  sectionDesc: {
    fontSize: 14,
    color: Colors.muted,
    lineHeight: 20,
    marginBottom: 20,
  },
  pillarCards: {
    gap: 12,
  },
  pillarCard: {
    backgroundColor: '#F8FAF9',
    borderRadius: Radii.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  pillarIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  pillarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 4,
  },
  pillarDesc: {
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 19,
  },
  modulesSection: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    backgroundColor: '#FAFAF9',
  },
  moduleList: {
    gap: 14,
  },
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadows.card,
  },
  moduleHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  moduleNum: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.green,
  },
  moduleTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.ink,
    lineHeight: 21,
  },
  moduleDesc: {
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 19,
    paddingLeft: 28,
  },
  calloutCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    backgroundColor: Colors.ink,
    borderRadius: Radii.xxl,
    padding: 24,
  },
  calloutEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.mint,
    letterSpacing: 1,
    marginBottom: 6,
  },
  calloutTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  calloutText: {
    fontSize: 13,
    color: '#D1D5DB',
    lineHeight: 19,
    marginBottom: 18,
  },
  calloutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.mint,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radii.md,
    gap: 8,
  },
  calloutBtnText: {
    color: Colors.ink,
    fontSize: 13,
    fontWeight: '800',
  },
});
