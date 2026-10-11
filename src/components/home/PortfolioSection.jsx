import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii, Shadows, Spacing } from '../../constants/theme';
import { resolvePortfolioLogo } from '../../utils/imageResolver';

export default function PortfolioSection({ portfolioDeals, onSelectDeal }) {
  const displayDeals = portfolioDeals && portfolioDeals.length > 0 ? portfolioDeals : [
    {
      id: 36,
      title: 'Pathao',
      slug: 'pathao',
      sector: 'Mobility / Fintech',
      description: 'Ride-hailing, eCommerce logistics, food delivery, fintech (BNPL & e-Wallet)',
    },
    {
      id: 37,
      title: 'Priyoshop',
      slug: 'priyoshop',
      sector: 'B2B E-commerce',
      description: 'B2B Marketplace connecting retailers, manufacturers, and distributors',
    },
    {
      id: 56,
      title: 'Jatri',
      slug: 'jatri',
      sector: 'TransportTech',
      description: 'Live bus tracking platform and transit ticketing automation',
    },
    {
      id: 43,
      title: 'Apon Well-being',
      slug: 'apon-well-being',
      sector: 'RetailTech',
      description: 'Pioneering retail q-commerce network for industrial workers in Bangladesh',
    },
    {
      id: 40,
      title: 'airwrk',
      slug: 'airwrk',
      sector: 'HRTech / Talent',
      description: 'Marketplace for tech talents getting access to remote jobs globally',
    },
    {
      id: 49,
      title: 'Bongo',
      slug: 'bongo',
      sector: 'MediaTech / OTT',
      description: 'OTT platform focusing on Bangla digital entertainment content',
    },
    {
      id: 59,
      title: 'Praava Health',
      slug: 'praava-health',
      sector: 'Healthtech',
      description: 'Integrated pharmacy, lab, and diagnostics for urban consumers',
    },
    {
      id: 46,
      title: 'MyAlice',
      slug: 'myalice',
      sector: 'SaaS / AI Chat',
      description: 'Chatbot aggregation across social media channels for e-commerce',
    },
  ];

  const renderLogo = (deal) => {
    const resolved = resolvePortfolioLogo(deal);

    if (resolved && resolved.source) {
      return (
        <Image
          source={resolved.source}
          style={styles.logoImage}
          resizeMode="contain"
        />
      );
    }

    // Fallback letter avatar
    const initials = (deal.title || 'BA').substring(0, 2).toUpperCase();
    return (
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {/* Section Header */}
        <View style={styles.header}>
          <View style={styles.headerTextCol}>
            <Text style={styles.kicker}>PORTFOLIO</Text>
            <Text style={styles.heading}>Backed by BAN. Built to endure.</Text>
            <Text style={styles.subtitle}>
              A selection of the companies our investor community has supported.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.seeAllButton}
            activeOpacity={0.8}
            onPress={() => onSelectDeal && onSelectDeal(null)}
          >
            <Text style={styles.seeAllText}>See the full portfolio</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.green} />
          </TouchableOpacity>
        </View>

        {/* Portfolio Cards Grid (Matching web format design .ban2-portfolio__grid) */}
        <View style={styles.grid}>
          {displayDeals.map((deal) => (
            <TouchableOpacity
              key={deal.id || deal.title}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => onSelectDeal && onSelectDeal(deal)}
            >
              <View style={styles.logoContainer}>
                {renderLogo(deal)}
              </View>

              <View style={styles.cardCopy}>
                <Text style={styles.cardTitle} numberOfLines={1}>{deal.title}</Text>
                <Text style={styles.cardSector} numberOfLines={2}>
                  {deal.sector || 'Portfolio company'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  inner: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: Spacing.xl,
  },
  headerTextCol: {
    marginBottom: 10,
  },
  kicker: {
    color: Colors.green,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  heading: {
    color: Colors.ink,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  subtitle: {
    color: Colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  seeAllText: {
    color: Colors.green,
    fontSize: 14,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    minHeight: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.line,
    justifyContent: 'space-between',
    ...Shadows.card,
  },
  logoContainer: {
    width: 80,
    height: 80,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoImage: {
    width: 76,
    height: 76,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: Radii.md,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.green,
    fontSize: 20,
    fontWeight: '800',
  },
  cardCopy: {
    marginTop: 'auto',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.2,
  },
  cardSector: {
    fontSize: 12,
    color: '#70847F',
    fontWeight: '500',
    marginTop: 4,
    lineHeight: 16,
  },
});
