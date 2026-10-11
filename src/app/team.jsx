import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SubpageHeader from '../components/SubpageHeader';
import MobileMenuModal from '../components/MobileMenuModal';
import FooterSection from '../components/home/FooterSection';
import { fetchTeamPageData, FALLBACK_HOME_DATA, FALLBACK_GOVERNING_BOARD } from '../services/api';
import { resolveTeamPhoto, getInitials } from '../utils/imageResolver';
import { Colors, Radii } from '../constants/theme';

const TABS = ['Team & Management', 'Governing Board', 'About BAN'];
const AVATAR_BG_COLORS = ['#dff4eb', '#f9a7a7', '#dcecef'];

function MemberCard({ member, index, isBoard, onOpenLinkedIn }) {
  const [imageError, setImageError] = useState(false);
  const resolved = resolveTeamPhoto(member);
  const initials = getInitials(member.name);
  const bg = AVATAR_BG_COLORS[index % AVATAR_BG_COLORS.length];

  return (
    <View style={styles.memberCard}>
      {/* Avatar Container with Clean Circular Mask */}
      <View style={styles.avatarWrap}>
        <View style={[styles.avatarCircle, { backgroundColor: bg }]}>
          {!imageError && resolved.source ? (
            <Image
              source={resolved.source}
              style={styles.avatarImg}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <Text style={styles.initialsText}>{initials}</Text>
          )}
        </View>

        {member.linkedin_url ? (
          <TouchableOpacity
            style={styles.linkedinBadge}
            onPress={() => onOpenLinkedIn(member.linkedin_url)}
            activeOpacity={0.8}
            accessibilityLabel={`${member.name} LinkedIn`}
          >
            <Ionicons name="logo-linkedin" size={11} color="#FFFFFF" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Member Details */}
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.memberRole}>{member.title}</Text>
        {member.subtitle ? (
          <Text style={styles.boardSubtitle}>{member.subtitle}</Text>
        ) : null}
        <Text style={styles.orgTag}>
          {isBoard ? 'BAN Governing Board' : 'Bangladesh Angels Network'}
        </Text>
      </View>
    </View>
  );
}

export default function TeamScreen() {
  const [activeTab, setActiveTab] = useState('Team & Management');
  const [teamData, setTeamData] = useState({
    management: FALLBACK_HOME_DATA.team_members,
    governingBoard: FALLBACK_GOVERNING_BOARD,
    aboutSection: null,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchTeamPageData();
      if (data) setTeamData(data);
    } catch (err) {
      console.log('Team data error:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchTeamPageData().then((data) => {
      if (isMounted && data) setTeamData(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const openLinkedIn = (url) => {
    if (url) Linking.openURL(url).catch((err) => console.log('LinkedIn error:', err));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Clean Top Header without redundant cramped sub-bar */}
      <SubpageHeader
        onOpenMenu={() => setMenuVisible(true)}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.green}
            colors={[Colors.green]}
          />
        }
      >
        {/* Spacious Hero Section */}
        <View style={styles.hero}>
          <View style={styles.kickerRow}>
            <View style={styles.kickerBar} />
            <Text style={styles.kickerText}>THE PEOPLE OF BAN</Text>
          </View>
          <Text style={styles.title}>Meet the people{"\n"}behind BAN.</Text>
          <Text style={styles.subtitle}>
            Operators, investors, and ecosystem leaders working together to help exceptional founders
            build enduring companies.
          </Text>

          {/* Spacious Horizontal Pill Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScroll}
          >
            {TABS.map((tab) => {
              const active = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tabChip, active && styles.tabChipActive]}
                  onPress={() => setActiveTab(tab)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabChipText, active && styles.tabChipTextActive]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Tab 1: Team & Management */}
        {activeTab === 'Team & Management' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEyebrow}>DAY-TO-DAY LEADERSHIP</Text>
              <Text style={styles.sectionTitle}>Team & Management</Text>
              <Text style={styles.sectionDesc}>
                The people shaping BAN’s programs, partnerships, founder support, and network operations.
              </Text>
            </View>

            <View style={styles.membersGrid}>
              {teamData.management.map((member, index) => (
                <MemberCard
                  key={member.id || member.name}
                  member={member}
                  index={index}
                  isBoard={false}
                  onOpenLinkedIn={openLinkedIn}
                />
              ))}
            </View>
          </View>
        )}

        {/* Tab 2: Governing Board */}
        {activeTab === 'Governing Board' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEyebrow}>GOVERNANCE & DIRECTION</Text>
              <Text style={styles.sectionTitle}>Governing Board</Text>
              <Text style={styles.sectionDesc}>
                Experienced leaders who help steward the network’s governance, standards, and long-term direction.
              </Text>
            </View>

            <View style={styles.membersGrid}>
              {teamData.governingBoard.map((member, index) => (
                <MemberCard
                  key={member.id || member.name}
                  member={member}
                  index={index + 1}
                  isBoard={true}
                  onOpenLinkedIn={openLinkedIn}
                />
              ))}
            </View>
          </View>
        )}

        {/* Tab 3: About BAN */}
        {activeTab === 'About BAN' && (
          <View style={styles.section}>
            <View style={styles.aboutCard}>
              <View style={styles.aboutBadge}>
                <Text style={styles.aboutBadgeText}>
                  {teamData.aboutSection?.image_badge || 'Capital. Community. Conviction.'}
                </Text>
              </View>

              <Text style={styles.aboutKicker}>
                {teamData.aboutSection?.kicker || 'ABOUT BANGLADESH ANGELS'}
              </Text>
              <Text style={styles.aboutHeading}>
                {teamData.aboutSection?.heading || 'What is Bangladesh Angels Network?'}
              </Text>

              <Text style={styles.aboutBody}>
                {teamData.aboutSection?.body ||
                  'BAN is the country\'s first and largest angel-investing platform, connecting visionary entrepreneurs with seasoned investors and fostering an ecosystem that drives innovation and economic growth. With more than $12 million invested across 50+ startups, we combine capital with mentorship, strategic guidance, and meaningful connections.'}
              </Text>

              <View style={styles.numbersGrid}>
                <View style={styles.numberBox}>
                  <Text style={styles.numberVal}>$12M+</Text>
                  <Text style={styles.numberLbl}>Capital Facilitated</Text>
                </View>
                <View style={styles.numberBox}>
                  <Text style={styles.numberVal}>500+</Text>
                  <Text style={styles.numberLbl}>Angel Investors</Text>
                </View>
                <View style={styles.numberBox}>
                  <Text style={styles.numberVal}>54+</Text>
                  <Text style={styles.numberLbl}>Portfolio Startups</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* CTA: Pitch & Join with Balanced Proportional Buttons */}
        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>Want to build with BAN?</Text>
          <Text style={styles.ctaDesc}>
            Whether you are a founder raising capital or an operator looking to angel invest, we would love to connect.
          </Text>

          <View style={styles.ctaButtons}>
            <TouchableOpacity
              style={styles.ctaPrimaryBtn}
              onPress={() => router.push('/startups')}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaPrimaryBtnText}>Pitch Your Startup</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ctaSecondaryBtn}
              onPress={() => router.push('/plans')}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaSecondaryBtnText}>Join as an Investor</Text>
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
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 22,
    backgroundColor: '#F8FAF9',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  kickerBar: {
    width: 16,
    height: 3,
    backgroundColor: Colors.green,
    borderRadius: 2,
  },
  kickerText: {
    color: Colors.green,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.ink,
    lineHeight: 38,
    letterSpacing: -0.8,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.muted,
    lineHeight: 23,
    marginBottom: 20,
  },
  tabsScroll: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
    paddingRight: 10,
  },
  tabChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabChipActive: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  tabChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  tabChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  section: {
    paddingHorizontal: 22,
    paddingVertical: 26,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.green,
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 14,
    color: Colors.muted,
    lineHeight: 21,
  },
  membersGrid: {
    gap: 16,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarWrap: {
    width: 76,
    height: 76,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  initialsText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.green,
    letterSpacing: 0.5,
  },
  linkedinBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0A66C2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 3,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  memberRole: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.green,
    marginBottom: 4,
  },
  boardSubtitle: {
    fontSize: 12,
    color: Colors.muted,
    marginBottom: 3,
  },
  orgTag: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.muted,
    letterSpacing: 0.6,
  },
  aboutCard: {
    backgroundColor: '#F8FAF9',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  aboutBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radii.pill,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  aboutBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.green,
  },
  aboutKicker: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.muted,
    letterSpacing: 1,
    marginBottom: 6,
  },
  aboutHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.ink,
    lineHeight: 28,
    marginBottom: 12,
  },
  aboutBody: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 20,
  },
  numbersGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  numberBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  numberVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.green,
    marginBottom: 2,
  },
  numberLbl: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.muted,
    textAlign: 'center',
  },
  ctaCard: {
    marginHorizontal: 22,
    marginTop: 12,
    marginBottom: 32,
    backgroundColor: Colors.ink,
    borderRadius: 24,
    padding: 24,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  ctaDesc: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 21,
    marginBottom: 20,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  ctaPrimaryBtn: {
    flex: 1,
    backgroundColor: Colors.green,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  ctaSecondaryBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaSecondaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
