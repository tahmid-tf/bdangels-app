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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SubpageHeader from '../components/SubpageHeader';
import MobileMenuModal from '../components/MobileMenuModal';
import FooterSection from '../components/home/FooterSection';
import { Colors, Radii, Shadows } from '../constants/theme';

export default function AboutUsScreen() {
  const [menuVisible, setMenuVisible] = useState(false);

  const openUrl = (url) => {
    Linking.openURL(url).catch((err) => console.log('Link error:', err));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SubpageHeader
        title="ABOUT BAN"
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
            <Text style={styles.kickerText}>OUR STORY & MISSION</Text>
          </View>
          <Text style={styles.title}>Connecting capital,{"\n"}conviction & founders.</Text>
          <Text style={styles.subtitle}>
            Bangladesh Angels Network is the nation{"'"}s premier angel syndicate platform—bridging
            high-conviction angel investors with ambitious entrepreneurs across Bangladesh and beyond.
          </Text>
        </View>

        {/* Impact Numbers */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>$12M+</Text>
              <Text style={styles.statLabel}>Capital Facilitated</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>500+</Text>
              <Text style={styles.statLabel}>Angel Investors</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>54+</Text>
              <Text style={styles.statLabel}>Startups Backed</Text>
            </View>
          </View>
        </View>

        {/* Narrative / Story */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>ORIGIN</Text>
          <Text style={styles.sectionTitle}>The Bangladesh Angels Story</Text>

          <Text style={styles.bodyPara}>
            Founded in 2019, Bangladesh Angels Network was formed by seasoned operators and ecosystem builders
            who recognized a critical missing link in the country{"'"}s startup trajectory: a structured,
            transparent, and credible angel investing ecosystem.
          </Text>
          <Text style={styles.bodyPara}>
            While talent and ambition were abundant, early-stage founders struggled to find initial seed capital
            without giving up predatory equity or navigating slow traditional financing channels. BAN was built
            to bridge that chasm.
          </Text>
          <Text style={styles.bodyPara}>
            Today, our community encompasses founders, corporate leaders, family offices, and diaspora
            executives across Dhaka, Singapore, London, Dubai, and Silicon Valley—all committed to catalyzing
            the next generation of enduring Bangladeshi enterprises.
          </Text>
        </View>

        {/* Core Pillars */}
        <View style={styles.sectionAlt}>
          <Text style={styles.sectionEyebrow}>FOUNDATIONAL VALUES</Text>
          <Text style={styles.sectionTitle}>How We Operate</Text>

          <View style={styles.pillarsGrid}>
            <View style={styles.pillarCard}>
              <View style={styles.iconCircle}>
                <Ionicons name="rocket-outline" size={22} color={Colors.green} />
              </View>
              <Text style={styles.pillarTitle}>Founders First</Text>
              <Text style={styles.pillarDesc}>
                We prioritize founder-friendly terms, fast turnaround times, and supportive mentorship that
                respects entrepreneurial independence.
              </Text>
            </View>

            <View style={styles.pillarCard}>
              <View style={styles.iconCircle}>
                <Ionicons name="shield-checkmark-outline" size={22} color={Colors.green} />
              </View>
              <Text style={styles.pillarTitle}>Institutional Rigor</Text>
              <Text style={styles.pillarDesc}>
                Every deal undergoes rigorous data room verification, unit economics stress-testing, and
                governance hygiene before syndicate presentation.
              </Text>
            </View>

            <View style={styles.pillarCard}>
              <View style={styles.iconCircle}>
                <Ionicons name="globe-outline" size={22} color={Colors.green} />
              </View>
              <Text style={styles.pillarTitle}>Global Reach</Text>
              <Text style={styles.pillarDesc}>
                We connect local companies to international co-investors, regional venture capital firms, and
                global diaspora expertise.
              </Text>
            </View>
          </View>
        </View>

        {/* Office & Contact Card */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Get in Touch</Text>
          <Text style={styles.contactDesc}>
            Bangladesh Angels Network Limited{"\n"}
            Dhaka, Bangladesh · Trade Licence Verified
          </Text>
          <View style={styles.contactActions}>
            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() => openUrl('mailto:hello@bdangels.co')}
            >
              <Ionicons name="mail" size={15} color="#FFFFFF" />
              <Text style={styles.contactBtnText}>hello@bdangels.co</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.teamBtn}
              onPress={() => router.push('/team')}
            >
              <Text style={styles.teamBtnText}>Meet our team →</Text>
            </TouchableOpacity>
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
    fontSize: 30,
    fontWeight: '800',
    color: Colors.ink,
    lineHeight: 36,
    letterSpacing: -0.7,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.muted,
    lineHeight: 22,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    padding: 14,
    borderRadius: Radii.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  statNum: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.green,
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.ink,
    textAlign: 'center',
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
    backgroundColor: '#FAFAF9',
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
    marginBottom: 14,
  },
  bodyPara: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 23,
    marginBottom: 14,
  },
  pillarsGrid: {
    gap: 14,
    marginTop: 6,
  },
  pillarCard: {
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
  pillarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 6,
  },
  pillarDesc: {
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 19,
  },
  contactCard: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 30,
    backgroundColor: Colors.ink,
    borderRadius: Radii.xxl,
    padding: 24,
  },
  contactTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  contactDesc: {
    fontSize: 13,
    color: '#D1D5DB',
    lineHeight: 20,
    marginBottom: 18,
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.green,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radii.md,
    gap: 6,
  },
  contactBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  teamBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  teamBtnText: {
    color: Colors.mint,
    fontSize: 13,
    fontWeight: '700',
  },
});
