import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SubpageHeader from '../components/SubpageHeader';
import MobileMenuModal from '../components/MobileMenuModal';
import DealDetailModal from '../components/modals/DealDetailModal';
import FooterSection from '../components/home/FooterSection';
import { fetchPortfolioPageData } from '../services/api';
import { resolvePortfolioLogo } from '../utils/imageResolver';
import { Colors, Radii, Shadows } from '../constants/theme';

const SECTORS = [
  'All',
  'Mobility',
  'Fintech',
  'B2B E-commerce',
  'HealthTech',
  'SaaS / AI',
  'Media / OTT',
  'RetailTech',
];

function PortfolioCompanyCard({ deal, onPress }) {
  const [imageError, setImageError] = useState(false);
  const resolved = resolvePortfolioLogo(deal);
  const initials = (deal?.title || 'BA').substring(0, 2).toUpperCase();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={() => onPress(deal)}
      accessibilityRole="button"
      accessibilityLabel={`View ${deal?.title || 'Company'}`}
    >
      <View style={styles.cardTop}>
        <View style={styles.logoBadge}>
          {!imageError && resolved?.source ? (
            <Image
              source={resolved.source}
              style={styles.logoImage}
              resizeMode="contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <Text style={styles.logoFallbackText}>{initials}</Text>
          )}
        </View>

        <View style={styles.sectorBadge}>
          <Text style={styles.sectorText} numberOfLines={1}>
            {deal?.sector || 'Portfolio'}
          </Text>
        </View>
      </View>

      <Text style={styles.companyName}>{deal?.title}</Text>
      <Text style={styles.companyDesc} numberOfLines={3}>
        {deal?.description}
      </Text>

      <View style={styles.cardBottom}>
        <Text style={styles.viewLink}>View Company</Text>
        <View style={styles.arrowCircle}>
          <Ionicons name="arrow-forward" size={12} color={Colors.green} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function PortfolioScreen() {
  const [deals, setDeals] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchPortfolioPageData();
      if (data) setDeals(data);
    } catch (err) {
      console.log('Portfolio load error:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchPortfolioPageData().then((data) => {
      if (isMounted && data) setDeals(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const title = deal.title || '';
      const sector = deal.sector || '';
      const desc = deal.description || '';
      const matchesSearch =
        !searchQuery ||
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sector.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSector =
        selectedSector === 'All' ||
        sector.toLowerCase().includes(selectedSector.toLowerCase()) ||
        (selectedSector === 'SaaS / AI' &&
          (sector.toLowerCase().includes('saas') || sector.toLowerCase().includes('enterprise')));

      return matchesSearch && matchesSector;
    });
  }, [deals, searchQuery, selectedSector]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Clean Header without redundant cramped sub-bar */}
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
            <Text style={styles.kickerText}>BAN PORTFOLIO</Text>
          </View>

          <Text style={styles.title}>Backed by BAN.{"\n"}Built to endure.</Text>
          <Text style={styles.subtitle}>
            Meet the companies our network has backed—ambitious teams building practical solutions
            with the conviction and potential to scale.
          </Text>
        </View>

        {/* Filter Controls: Search and Sector Pills */}
        <View style={styles.filtersSection}>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color={Colors.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search companies, sectors, keywords..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery ? (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={18} color={Colors.muted} />
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sectorList}
          >
            {SECTORS.map((sector) => {
              const active = selectedSector === sector;
              return (
                <TouchableOpacity
                  key={sector}
                  style={[styles.sectorChip, active && styles.sectorChipActive]}
                  onPress={() => setSelectedSector(sector)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.sectorChipText, active && styles.sectorChipTextActive]}>
                    {sector}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Portfolio Grid */}
        <View style={styles.gridSection}>
          <View style={styles.gridHeader}>
            <Text style={styles.gridCount}>
              Showing {filteredDeals.length} {filteredDeals.length === 1 ? 'company' : 'companies'}
            </Text>
          </View>

          {filteredDeals.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="briefcase-outline" size={40} color={Colors.muted} />
              <Text style={styles.emptyTitle}>No matching portfolio companies</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search terms or filter selection.</Text>
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedSector('All');
                }}
              >
                <Text style={styles.clearBtnText}>Reset filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cardsGrid}>
              {filteredDeals.map((deal) => (
                <PortfolioCompanyCard
                  key={deal.id || deal.slug}
                  deal={deal}
                  onPress={setSelectedDeal}
                />
              ))}
            </View>
          )}
        </View>

        {/* Founder Pitch Callout */}
        <View style={styles.pitchCta}>
          <View style={styles.pitchCtaCopy}>
            <Text style={styles.pitchCtaEyebrow}>ARE YOU A FOUNDER?</Text>
            <Text style={styles.pitchCtaTitle}>Building the next enduring venture?</Text>
            <Text style={styles.pitchCtaDesc}>
              We connect ambitious founders with smart capital, strategic networks, and operational mentorship.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.pitchCtaBtn}
            activeOpacity={0.85}
            onPress={() => router.push('/startups')}
          >
            <Text style={styles.pitchCtaBtnText}>Send your pitch</Text>
            <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <FooterSection />
      </ScrollView>

      {/* Detail Modal */}
      <DealDetailModal
        deal={selectedDeal}
        visible={Boolean(selectedDeal)}
        onClose={() => setSelectedDeal(null)}
      />

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
    lineHeight: 38,
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14.5,
    color: Colors.muted,
    lineHeight: 22,
    marginBottom: 0,
  },
  filtersSection: {
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    gap: 12,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    height: 46,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.ink,
    paddingVertical: 0,
  },
  sectorList: {
    gap: 8,
    paddingVertical: 2,
    paddingRight: 22,
  },
  sectorChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: Radii.pill,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sectorChipActive: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  sectorChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.ink,
  },
  sectorChipTextActive: {
    color: '#FFFFFF',
  },
  gridSection: {
    paddingHorizontal: 22,
    paddingVertical: 24,
  },
  gridHeader: {
    marginBottom: 16,
  },
  gridCount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.muted,
  },
  cardsGrid: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Shadows.card,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  logoBadge: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoFallbackText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.green,
  },
  sectorBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    maxWidth: 160,
  },
  sectorText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.green,
  },
  companyName: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 6,
  },
  companyDesc: {
    fontSize: 13.5,
    color: Colors.muted,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  viewLink: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.green,
  },
  arrowCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.muted,
    textAlign: 'center',
    marginBottom: 16,
  },
  clearBtn: {
    backgroundColor: Colors.ink,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radii.md,
  },
  clearBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  pitchCta: {
    marginHorizontal: 22,
    marginTop: 14,
    marginBottom: 32,
    backgroundColor: Colors.ink,
    borderRadius: 22,
    padding: 24,
  },
  pitchCtaCopy: {
    marginBottom: 18,
  },
  pitchCtaEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.mint,
    letterSpacing: 1,
    marginBottom: 6,
  },
  pitchCtaTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 28,
    marginBottom: 8,
  },
  pitchCtaDesc: {
    fontSize: 13,
    color: '#D1D5DB',
    lineHeight: 19,
  },
  pitchCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.green,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radii.lg,
    gap: 8,
  },
  pitchCtaBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
