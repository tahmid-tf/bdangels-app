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
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SubpageHeader from '../components/SubpageHeader';
import MobileMenuModal from '../components/MobileMenuModal';
import FooterSection from '../components/home/FooterSection';
import { fetchPlansPageData } from '../services/api';
import { Colors, Radii, Shadows } from '../constants/theme';

export default function PlansScreen() {
  const [tiers, setTiers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchPlansPageData();
      if (data && Array.isArray(data)) {
        setTiers(data);
      }
    } catch (err) {
      console.log('Plans load error:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchPlansPageData().then((data) => {
      if (isMounted && data && Array.isArray(data)) {
        setTiers(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleSelectTier = (tier) => {
    Alert.alert(
      `${tier.name} Membership`,
      `Would you like to subscribe to the ${tier.name} plan at ${tier.price_formatted || '$' + tier.price_yearly + '/yr'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed to Checkout',
          onPress: () => {
            Linking.openURL(
              `mailto:hello@bdangels.co?subject=Membership%20Application%20for%20${encodeURIComponent(
                tier.name
              )}%20Tier`
            ).catch((err) => console.log('Mail link error:', err));
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SubpageHeader
        title="MEMBERSHIP PLANS"
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
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.kickerRow}>
            <View style={styles.kickerBar} />
            <Text style={styles.kickerText}>ANNUAL INVESTOR MEMBERSHIPS</Text>
          </View>
          <Text style={styles.title}>Choose your{"\n"}membership.</Text>
          <Text style={styles.subtitle}>
            All memberships are billed annually in USD. Compare access levels and choose the tier that fits
            how you invest with Bangladesh Angels Network.
          </Text>
        </View>

        {/* Pricing Tiers Cards */}
        <View style={styles.tiersSection}>
          <View style={styles.tiersGrid}>
            {tiers.map((tier) => {
              const isHighlight = tier.is_highlighted;
              return (
                <View
                  key={tier.id || tier.slug}
                  style={[styles.tierCard, isHighlight && styles.tierCardHighlight]}
                >
                  {isHighlight && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>MOST POPULAR</Text>
                    </View>
                  )}

                  <Text style={styles.tierName}>{tier.name}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceVal}>{tier.price_formatted || `$${tier.price_yearly}`}</Text>
                    <Text style={styles.pricePeriod}>/ year</Text>
                  </View>
                  <Text style={styles.tierBilling}>Billed annually • USD settlement</Text>

                  {/* Included features */}
                  <View style={styles.featuresList}>
                    {tier.features_included &&
                      tier.features_included.map((feat, fIdx) => (
                        <View key={fIdx} style={styles.featureItem}>
                          <Ionicons name="checkmark-circle" size={17} color={Colors.green} />
                          <Text style={styles.featureText}>{feat}</Text>
                        </View>
                      ))}

                    {tier.features_excluded &&
                      tier.features_excluded.map((feat, fIdx) => (
                        <View key={fIdx} style={styles.featureItemExcluded}>
                          <Ionicons name="close-circle-outline" size={17} color="#9CA3AF" />
                          <Text style={styles.featureTextExcluded}>{feat}</Text>
                        </View>
                      ))}
                  </View>

                  <TouchableOpacity
                    style={[styles.selectBtn, isHighlight && styles.selectBtnHighlight]}
                    onPress={() => handleSelectTier(tier)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.selectBtnText, isHighlight && styles.selectBtnTextHighlight]}>
                      Select {tier.name}
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={14}
                      color={isHighlight ? '#FFFFFF' : Colors.ink}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        {/* Membership Assistance */}
        <View style={styles.assistCard}>
          <Text style={styles.assistTitle}>Not sure which membership fits?</Text>
          <Text style={styles.assistDesc}>
            Tell us how you invest and our membership committee will point you toward the most appropriate
            access tier.
          </Text>
          <TouchableOpacity
            style={styles.assistBtn}
            onPress={() => Linking.openURL('mailto:hello@bdangels.co?subject=Membership%20Inquiry')}
            activeOpacity={0.85}
          >
            <Text style={styles.assistBtnText}>Talk to membership team</Text>
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
  tiersSection: {
    paddingHorizontal: 20,
    paddingVertical: 26,
  },
  tiersGrid: {
    gap: 20,
  },
  tierCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xxl,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadows.card,
    position: 'relative',
  },
  tierCardHighlight: {
    borderColor: Colors.green,
    borderWidth: 2,
    backgroundColor: '#FAFCFB',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: Colors.green,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  tierName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 2,
  },
  priceVal: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.ink,
  },
  pricePeriod: {
    fontSize: 14,
    color: Colors.muted,
    fontWeight: '600',
  },
  tierBilling: {
    fontSize: 12,
    color: Colors.muted,
    marginBottom: 18,
  },
  featuresList: {
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
    marginBottom: 22,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    color: Colors.ink,
    lineHeight: 18,
  },
  featureItemExcluded: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    opacity: 0.55,
  },
  featureTextExcluded: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    textDecorationLine: 'line-through',
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    paddingVertical: 13,
    borderRadius: Radii.md,
  },
  selectBtnHighlight: {
    backgroundColor: Colors.ink,
  },
  selectBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.ink,
  },
  selectBtnTextHighlight: {
    color: '#FFFFFF',
  },
  assistCard: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 28,
    backgroundColor: Colors.ink,
    borderRadius: Radii.xxl,
    padding: 22,
  },
  assistTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  assistDesc: {
    fontSize: 13,
    color: '#D1D5DB',
    lineHeight: 19,
    marginBottom: 16,
  },
  assistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.green,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radii.md,
    gap: 8,
  },
  assistBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
