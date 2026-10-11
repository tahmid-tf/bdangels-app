import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii, Shadows, Spacing } from '../../constants/theme';

export default function MembershipPlansSection({ tiers, onSelectTier }) {
  const displayTiers = tiers && tiers.length > 0 ? tiers : [
    {
      id: 1,
      name: 'Core',
      slug: 'core',
      price_yearly: 399,
      price_formatted: '$399.00',
      is_highlighted: false,
      features_included: [
        'Complete deal access',
        'Data room access (with approval)',
        'Active deal participation',
        'Investment capabilities',
      ],
      features_excluded: [
        'Portfolio monitoring',
        'Full access to dataroom',
        'Full access of deal flows & showcases',
      ],
    },
    {
      id: 2,
      name: 'Advanced',
      slug: 'advanced',
      price_yearly: 599,
      price_formatted: '$599.00',
      is_highlighted: true,
      features_included: [
        'Complete Deal Access',
        'Full Access to Data Room',
        'Active Deal Participation',
        'Investment Capabilities',
        'Portfolio Monitoring',
        'Full access of Deal Flows & Showcases',
      ],
      features_excluded: [],
    },
    {
      id: 3,
      name: 'Institutional',
      slug: 'institutional',
      price_yearly: 999,
      price_formatted: '$999.00',
      is_highlighted: false,
      features_included: [
        'Complete Deal Access',
        'Full Access to Data Room',
        'Active Deal Participation',
        'Investment Capabilities',
        'Portfolio Monitoring',
        'Full access of Deal Flows & Showcases',
        '3-4 Additional Account access',
      ],
      features_excluded: [],
    },
  ];

  const getTierIcon = (slug) => {
    switch (slug?.toLowerCase()) {
      case 'core':
        return require('../../../assets/images/plan_core.webp');
      case 'advanced':
        return require('../../../assets/images/plan_advanced.webp');
      case 'institutional':
        return require('../../../assets/images/plan_institutional.webp');
      default:
        return require('../../../assets/images/icon.webp');
    }
  };

  const handleJoinTier = (tier) => {
    if (onSelectTier) {
      onSelectTier(tier);
    } else {
      Alert.alert(
        `${tier.name} Membership`,
        `You selected the ${tier.name} plan ($${tier.price_yearly}/yr). Membership checkout and onboarding is available for verified investor accounts.`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.kicker}>MEMBERSHIP PLANS</Text>
          <Text style={styles.heading}>Flexible plans for your investment needs</Text>
          <Text style={styles.subtitle}>Choose your plan and make investment work like magic</Text>
        </View>

        <View style={styles.grid}>
          {displayTiers.map((tier) => {
            const isPopular = tier.is_highlighted;

            return (
              <View
                key={tier.id || tier.name}
                style={[
                  styles.card,
                  isPopular && styles.cardHighlighted,
                ]}
              >
                {isPopular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>POPULAR</Text>
                  </View>
                )}

                <Text style={styles.tierName}>{tier.name.toUpperCase()}</Text>

                <View style={styles.priceRow}>
                  <Text style={styles.priceText}>
                    ${Math.round(tier.price_yearly || 0)}
                  </Text>
                  <Text style={styles.periodText}>/yr</Text>
                </View>

                {/* Plan Icon */}
                <View style={styles.iconContainer}>
                  <Image
                    source={getTierIcon(tier.slug)}
                    style={styles.tierIcon}
                    resizeMode="contain"
                  />
                </View>

                {/* Included features */}
                <View style={styles.featuresList}>
                  {tier.features_included?.map((feat, idx) => (
                    <View key={`inc-${idx}`} style={styles.featureItem}>
                      <View style={styles.checkCircle}>
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                      <Text style={styles.featureText}>{feat}</Text>
                    </View>
                  ))}

                  {/* Excluded features */}
                  {tier.features_excluded?.map((feat, idx) => (
                    <View key={`exc-${idx}`} style={[styles.featureItem, styles.featureItemExcluded]}>
                      <View style={styles.crossCircle}>
                        <Ionicons name="remove" size={12} color={Colors.muted} />
                      </View>
                      <Text style={styles.featureTextExcluded}>{feat}</Text>
                    </View>
                  ))}
                </View>

                {/* Join Button */}
                <TouchableOpacity
                  style={[
                    styles.joinButton,
                    isPopular ? styles.joinButtonHighlighted : styles.joinButtonStandard,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => handleJoinTier(tier)}
                >
                  <Text
                    style={[
                      styles.joinButtonText,
                      isPopular ? styles.joinButtonTextHighlighted : styles.joinButtonTextStandard,
                    ]}
                  >
                    Get Started with {tier.name}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.paper,
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
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  kicker: {
    color: Colors.green,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
    textAlign: 'center',
  },
  heading: {
    color: Colors.ink,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    letterSpacing: -0.8,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.muted,
    fontSize: 15,
    textAlign: 'center',
  },
  grid: {
    gap: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: Radii.xxl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.line,
    position: 'relative',
    ...Shadows.card,
  },
  cardHighlighted: {
    borderColor: Colors.green,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
  },
  popularBadge: {
    position: 'absolute',
    top: 18,
    right: 18,
    backgroundColor: Colors.mint,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: Radii.pill,
  },
  popularBadgeText: {
    color: Colors.green,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  tierName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.green,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  priceText: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -1,
  },
  periodText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.muted,
    marginLeft: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    height: 80,
  },
  tierIcon: {
    width: 76,
    height: 76,
  },
  featuresList: {
    borderTopWidth: 1,
    borderTopColor: Colors.lineLight,
    paddingTop: Spacing.md,
    marginBottom: Spacing.lg,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    color: Colors.ink,
    lineHeight: 19,
    fontWeight: '500',
  },
  featureItemExcluded: {
    opacity: 0.5,
  },
  crossCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featureTextExcluded: {
    flex: 1,
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 19,
  },
  joinButton: {
    minHeight: 48,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  joinButtonStandard: {
    backgroundColor: Colors.ink,
  },
  joinButtonHighlighted: {
    backgroundColor: Colors.green,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  joinButtonTextStandard: {
    color: '#FFFFFF',
  },
  joinButtonTextHighlighted: {
    color: '#FFFFFF',
  },
});
