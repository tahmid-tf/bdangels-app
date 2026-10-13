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
import { Radii, Shadows } from '../constants/theme';

export default function BwinScreen() {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleJoin = () => {
    Linking.openURL('mailto:hello@bdangels.co?subject=BWIN%20Membership%20Inquiry').catch((err) =>
      console.log('BWIN email error:', err)
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#531534" />

      <SubpageHeader
        title="BWIN • WOMEN INVESTORS"
        onOpenMenu={() => setMenuVisible(true)}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Plum BWIN Hero Section */}
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>A BAN INITIATIVE</Text>
          </View>
          <Text style={styles.title}>Where women shape the future of investment.</Text>
          <Text style={styles.subtitle}>
            Bangladesh Women Investors Network (BWIN) is the country{"'"}s first women-led angel investing
            community, built to cultivate a confident ecosystem of female investors while backing
            high-impact founders.
          </Text>

          <View style={styles.proofRow}>
            <View style={styles.proofItem}>
              <Text style={styles.proofTitle}>Learn</Text>
              <Text style={styles.proofSubtitle}>Build investor confidence</Text>
            </View>
            <View style={styles.proofItem}>
              <Text style={styles.proofTitle}>Connect</Text>
              <Text style={styles.proofSubtitle}>Join trusted peers</Text>
            </View>
            <View style={styles.proofItem}>
              <Text style={styles.proofTitle}>Invest</Text>
              <Text style={styles.proofSubtitle}>Access curated deals</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.joinBtn} onPress={handleJoin} activeOpacity={0.85}>
            <Text style={styles.joinBtnText}>Join the BWIN Community</Text>
            <Ionicons name="arrow-forward" size={15} color="#531534" />
          </TouchableOpacity>
        </View>

        {/* Mission Statement */}
        <View style={styles.missionSection}>
          <Text style={styles.sectionKicker}>OUR MISSION</Text>
          <Text style={styles.sectionHeading}>
            A stronger investment ecosystem starts with who has a seat at the table.
          </Text>
          <Text style={styles.sectionBody}>
            Women represent a growing demographic of executives, business owners, and wealth creators in
            Bangladesh. BWIN creates an inclusive, educational, and collaborative launchpad for women to
            participate actively in early-stage equity financing.
          </Text>
        </View>

        {/* 3 Pillars of BWIN */}
        <View style={styles.pillarsSection}>
          <Text style={styles.sectionKicker}>THE BWIN MODEL</Text>
          <Text style={styles.sectionHeading}>How BWIN Drives Impact</Text>

          <View style={styles.cardsWrap}>
            <View style={styles.pillarCard}>
              <View style={[styles.iconWrap, { backgroundColor: '#FCE7F3' }]}>
                <Ionicons name="sparkles" size={22} color="#BE185D" />
              </View>
              <Text style={styles.cardTitle}>Knowledge & Masterclasses</Text>
              <Text style={styles.cardDesc}>
                Focused sessions on cap tables, term sheets, portfolio allocation, and understanding startup
                metrics without intimidation.
              </Text>
            </View>

            <View style={styles.pillarCard}>
              <View style={[styles.iconWrap, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="people" size={22} color="#6D28D9" />
              </View>
              <Text style={styles.cardTitle}>Collaborative Syndication</Text>
              <Text style={styles.cardDesc}>
                Co-invest alongside seasoned angels with flexible check sizes, lowering initial barriers and
                fostering shared diligence.
              </Text>
            </View>

            <View style={styles.pillarCard}>
              <View style={[styles.iconWrap, { backgroundColor: '#CCFBF1' }]}>
                <Ionicons name="heart" size={22} color="#0F766E" />
              </View>
              <Text style={styles.cardTitle}>Mentoring Female Founders</Text>
              <Text style={styles.cardDesc}>
                Targeted network access, founder spotlights, and strategic guidance for ambitious female-led
                startups seeking institutional capital.
              </Text>
            </View>
          </View>
        </View>

        {/* Contact & Inquire CTA */}
        <View style={styles.ctaBox}>
          <Text style={styles.ctaHeading}>Interested in joining BWIN?</Text>
          <Text style={styles.ctaText}>
            Whether you are looking to make your first angel investment or want to collaborate as a partner,
            our community welcomes you.
          </Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={handleJoin} activeOpacity={0.85}>
            <Text style={styles.ctaBtnText}>Contact BWIN Team</Text>
            <Ionicons name="mail" size={15} color="#FFFFFF" />
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
    paddingBottom: 32,
    backgroundColor: '#531534',
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radii.pill,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FBCFE8',
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
    color: '#FCE7F3',
    lineHeight: 22,
    marginBottom: 24,
  },
  proofRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  proofItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    padding: 12,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  proofTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  proofSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FBCFE8',
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Radii.md,
    gap: 8,
  },
  joinBtnText: {
    color: '#531534',
    fontSize: 13,
    fontWeight: '800',
  },
  missionSection: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(9, 47, 41, 0.08)',
  },
  sectionKicker: {
    fontSize: 11,
    fontWeight: '800',
    color: '#BE185D',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  sectionHeading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 32,
    marginBottom: 12,
  },
  sectionBody: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  pillarsSection: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    backgroundColor: '#FDF2F8',
  },
  cardsWrap: {
    gap: 14,
    marginTop: 16,
  },
  pillarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(190, 24, 93, 0.12)',
    ...Shadows.card,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 19,
  },
  ctaBox: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 28,
    backgroundColor: '#531534',
    borderRadius: Radii.xxl,
    padding: 24,
  },
  ctaHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  ctaText: {
    fontSize: 13,
    color: '#FCE7F3',
    lineHeight: 19,
    marginBottom: 18,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#BE185D',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radii.md,
    gap: 8,
  },
  ctaBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
