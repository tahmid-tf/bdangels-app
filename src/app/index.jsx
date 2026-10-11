import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Header from '../components/Header';
import MobileMenuModal from '../components/MobileMenuModal';
import HeroSection from '../components/home/HeroSection';
import CoreFunctionsSection from '../components/home/CoreFunctionsSection';
import ProgramsSection from '../components/home/ProgramsSection';
import MembershipPlansSection from '../components/home/MembershipPlansSection';
import FounderPitchSection from '../components/home/FounderPitchSection';
import PortfolioSection from '../components/home/PortfolioSection';
import TeamSection from '../components/home/TeamSection';
import EventsSection from '../components/home/EventsSection';
import PartnersSection from '../components/home/PartnersSection';
import FaqSection from '../components/home/FaqSection';
import FooterSection from '../components/home/FooterSection';

import DealDetailModal from '../components/modals/DealDetailModal';
import EventDetailModal from '../components/modals/EventDetailModal';
import ProgramDetailModal from '../components/modals/ProgramDetailModal';

import { fetchHomePageData, FALLBACK_HOME_DATA } from '../services/api';
import { Colors } from '../constants/theme';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  // Home Data State
  const [homeData, setHomeData] = useState({
    stats: FALLBACK_HOME_DATA.landing_stats,
    programs: FALLBACK_HOME_DATA.landing_programs,
    membershipTiers: FALLBACK_HOME_DATA.membership_tiers,
    portfolioDeals: FALLBACK_HOME_DATA.portfolio_deals,
    teamMembers: FALLBACK_HOME_DATA.team_members,
    events: FALLBACK_HOME_DATA.landing_events,
    faqs: FALLBACK_HOME_DATA.faqs,
  });

  // Modals state
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);

  const scrollViewRef = useRef(null);

  // Section Y coordinate tracking for smooth jump-to
  const sectionLayouts = useRef({});

  const loadData = useCallback(async () => {
    try {
      const data = await fetchHomePageData();
      if (data) {
        setHomeData((prev) => ({
          ...prev,
          ...data,
        }));
      }
    } catch (err) {
      console.log('Home data load notice:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchHomePageData()
      .then((data) => {
        if (isMounted && data) {
          setHomeData((prev) => ({
            ...prev,
            ...data,
          }));
        }
      })
      .catch((err) => console.log('Home data load notice:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleScrollToSection = (sectionKey) => {
    const y = sectionLayouts.current[sectionKey];
    if (typeof y === 'number' && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: Math.max(0, y - 20), animated: true });
    }
  };

  const handleScrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const handleLayoutSection = (key, event) => {
    const layout = event.nativeEvent.layout;
    sectionLayouts.current[key] = layout.y;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header Bar */}
      <Header
        onOpenMenu={() => setMenuVisible(true)}
        onScrollToSection={handleScrollToSection}
      />

      {/* Main Scrollable Canvas */}
      <ScrollView
        ref={scrollViewRef}
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
        {/* 1. Hero Section */}
        <View onLayout={(e) => handleLayoutSection('hero', e)}>
          <HeroSection
            stats={homeData.stats}
            onScrollToSection={handleScrollToSection}
          />
        </View>

        {/* 2. Core BAN Functions */}
        <View onLayout={(e) => handleLayoutSection('functions', e)}>
          <CoreFunctionsSection />
        </View>

        {/* 3. Our Programs */}
        <View onLayout={(e) => handleLayoutSection('programs', e)}>
          <ProgramsSection
            programs={homeData.programs}
            onSelectProgram={(prog) => setSelectedProgram(prog)}
          />
        </View>

        {/* 4. Membership Plans */}
        <View onLayout={(e) => handleLayoutSection('plans', e)}>
          <MembershipPlansSection
            tiers={homeData.membershipTiers}
            onSelectTier={(tier) => handleScrollToSection('pitch')}
          />
        </View>

        {/* 5. For Founders / Pitch Form */}
        <View onLayout={(e) => handleLayoutSection('pitch', e)}>
          <FounderPitchSection />
        </View>

        {/* 6. Portfolio Showcase */}
        <View onLayout={(e) => handleLayoutSection('portfolio', e)}>
          <PortfolioSection
            portfolioDeals={homeData.portfolioDeals}
            onSelectDeal={(deal) => setSelectedDeal(deal)}
          />
        </View>

        {/* 7. Our Team */}
        <View onLayout={(e) => handleLayoutSection('team', e)}>
          <TeamSection
            teamMembers={homeData.teamMembers}
            onSelectMember={(member) => {}}
          />
        </View>

        {/* 8. BAN Events */}
        <View onLayout={(e) => handleLayoutSection('events', e)}>
          <EventsSection
            events={homeData.events}
            onSelectEvent={(evt) => setSelectedEvent(evt)}
          />
        </View>

        {/* 9. Our Partners */}
        <View onLayout={(e) => handleLayoutSection('partners', e)}>
          <PartnersSection />
        </View>

        {/* 10. FAQ */}
        <View onLayout={(e) => handleLayoutSection('faq', e)}>
          <FaqSection faqs={homeData.faqs} />
        </View>

        {/* 11. Footer */}
        <FooterSection
          onScrollToTop={handleScrollToTop}
          onNavigateSection={handleScrollToSection}
        />
      </ScrollView>

      {/* Navigation Drawer Modal */}
      <MobileMenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onNavigate={handleScrollToSection}
      />

      {/* Deal Details Modal */}
      <DealDetailModal
        visible={!!selectedDeal}
        deal={selectedDeal}
        onClose={() => setSelectedDeal(null)}
      />

      {/* Event Details Modal */}
      <EventDetailModal
        visible={!!selectedEvent}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      {/* Program Details Modal */}
      <ProgramDetailModal
        visible={!!selectedProgram}
        program={selectedProgram}
        onClose={() => setSelectedProgram(null)}
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
    flexGrow: 1,
  },
});
